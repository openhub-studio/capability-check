import type { CheckResult, Feature, MetaItem } from '../types.js';

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
    const host = window.location.hostname || '(file)';
    const proto = window.location.protocol.replace(':', '').toUpperCase();
    const localhost = /^(localhost|127\.|::1$|\[::1\])/.test(host);
    const isolated = window.crossOriginIsolated === true;

    const meta: MetaItem[] = [
      { label: 'Protocol', value: proto },
      { label: 'Host', value: host },
      {
        label: 'Potentially trustworthy',
        value: ok ? 'Yes' : localhost ? 'Localhost should qualify' : 'No',
        ok: ok ? true : localhost ? null : false,
      },
      {
        label: 'Cross-origin isolated',
        value: isolated ? 'Enabled (COOP/COEP set)' : 'Off',
        ok: isolated ? true : null,
      },
    ];

    return {
      status: ok ? 'supported' : 'unsupported',
      detail: ok
        ? 'This page is running in a secure context — powerful APIs are unlocked.'
        : 'Not a secure context — service workers, WebGPU, and install prompts are blocked.',
      meta,
    };
  },
};
