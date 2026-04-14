import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Silence mermaid initialization in tests — it imports browser-only globals
vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
    render: vi.fn().mockResolvedValue({ svg: '<svg data-testid="mermaid-svg" />' }),
  },
}));

// Stub navigator.clipboard for copy-button tests
Object.defineProperty(navigator, 'clipboard', {
  value: { writeText: vi.fn().mockResolvedValue(undefined) },
  writable: true,
});
