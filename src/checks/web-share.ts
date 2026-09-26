import type { CheckResult, Feature } from '../types.js';

export const webShare: Feature = {
  id: 'web-share',
  name: 'Web Share',
  tag: 'OS share sheet',
  group: 'pwa',
  docs: 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API',
  icon: `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="6" cy="12" r="2.6"/>
    <circle cx="17.5" cy="5.5" r="2.6"/>
    <circle cx="17.5" cy="18.5" r="2.6"/>
    <path d="M8.3 10.8l7-4M8.3 13.2l7 4"/>
  </svg>`,
  description:
    'Hands text, links, and files to the operating system share sheet — the native sharing path for installed apps.',
  async detect(): Promise<CheckResult> {
    const share = typeof navigator.share === 'function';
    const canShare = typeof navigator.canShare === 'function';
    return {
      status: share ? 'supported' : 'unsupported',
      detail: share
        ? 'navigator.share is available — the OS share sheet can be invoked.'
        : 'navigator.share is not exposed (may require HTTPS on this platform).',
      meta: [
        {
          label: 'canShare (files)',
          value: canShare ? 'Available' : 'Unavailable',
          ok: canShare,
        },
      ],
    };
  },
};
