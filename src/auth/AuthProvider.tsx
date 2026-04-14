import { createContext, useCallback, useEffect, useRef, useState } from 'react';
import { GoogleOAuthProvider, googleLogout } from '@react-oauth/google';
import { api, setAuthToken } from '../api/client';
import type { User } from '../types';

const CLIENT_ID = (import.meta.env.VITE_OAUTH_CLIENT_ID as string | undefined) ?? '';

declare global {
  interface Window {
    google?: { accounts: { id: { prompt: () => void } } };
  }
}
const TOKEN_STORAGE_KEY = 'briefcase_id_token';

interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  picture?: string;
  exp: number;
}

function parseJwt(token: string): JwtPayload {
  const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(atob(base64)) as JwtPayload;
}

function isExpired(payload: JwtPayload): boolean {
  return payload.exp * 1000 < Date.now();
}

export interface AuthContextType {
  user: User | null;
  idToken: string | null;
  loading: boolean;
  /** Call this with the credential string from GoogleLogin's onSuccess. */
  onGoogleSuccess: (credential: string) => void;
  signOut: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  // Prevents calling /api/me twice on mount
  const meCalledRef = useRef(false);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Restore session from storage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem(TOKEN_STORAGE_KEY);
    if (stored) {
      try {
        const payload = parseJwt(stored);
        if (!isExpired(payload)) {
          applyToken(stored, payload);
        } else {
          sessionStorage.removeItem(TOKEN_STORAGE_KEY);
        }
      } catch {
        sessionStorage.removeItem(TOKEN_STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep API client in sync with token
  useEffect(() => {
    setAuthToken(idToken);
  }, [idToken]);

  function scheduleRefresh(payload: JwtPayload) {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    // Prompt silent re-auth 5 minutes before expiry
    const msUntilRefresh = payload.exp * 1000 - Date.now() - 5 * 60 * 1000;
    if (msUntilRefresh <= 0) return;
    refreshTimerRef.current = setTimeout(() => {
      // Trigger Google One Tap prompt silently — if auto_select succeeds,
      // onGoogleSuccess fires and refreshes the token without user interaction.
      window.google?.accounts.id.prompt();
    }, msUntilRefresh);
  }

  function applyToken(token: string, payload: JwtPayload) {
    setIdToken(token);
    setUser({
      email: payload.email,
      display_name: payload.name,
      photo_url: payload.picture,
    });
    sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
    scheduleRefresh(payload);
  }

  const onGoogleSuccess = useCallback((credential: string) => {
    try {
      const payload = parseJwt(credential);
      applyToken(credential, payload);

      // Register / upsert user doc on the server (first sign-in creates Firestore doc)
      if (!meCalledRef.current) {
        meCalledRef.current = true;
        // token hasn't propagated to the api client yet, so set it inline
        setAuthToken(credential);
        api.get('/api/me').catch(() => {
          // non-fatal — user doc will be created on next request
        });
      }
    } catch {
      console.error('Failed to parse Google credential');
    }
  }, []);

  const signOut = useCallback(() => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    googleLogout();
    setIdToken(null);
    setUser(null);
    meCalledRef.current = false;
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  }, []);

  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <AuthContext.Provider value={{ user, idToken, loading, onGoogleSuccess, signOut }}>
        {children}
      </AuthContext.Provider>
    </GoogleOAuthProvider>
  );
}
