import type { CheckResult, Feature } from '../types.js';

export const secureContext: Feature = {
  id: 'secure-context',
  name: 'Secure Context',
  tag: 'HTTPS',
  group: 'pwa',
  docs: 'https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts',
  icon: `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <rect x="4.5" y="10.5" width="15" height="9.5" rx="2.5"/>
    <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>
    <circle cx="12" cy="15" r="1.4"/>
  </svg>`,
  description:
    'Service workers, install prompts, and most PWA APIs require the page to be served over HTTPS or localhost.',
  async detect(): Promise<CheckResult> {
    const ok = window.isSecureContext;
    return {
      status: ok ? 'supported' : 'unsupported',
      detail: ok
        ? 'This page is running in a secure context.'
        : 'Not a secure context — service workers and install prompts are blocked.',
      meta: [{ label: 'Host', value: window.location.hostname || '(file)' }],
    };
  },
};
