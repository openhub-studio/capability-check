import { msg } from '../i18n/index.js';
import type { CheckResult, Feature, MetaItem } from '../types.js';

export const secureContext: Feature = {
  id: 'secure-context',
  name: msg('check.secure.name'),
  tag: msg('check.secure.tag'),
  group: 'pwa',
  docs: 'https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts',
  icon: `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <rect x="4.5" y="10.5" width="15" height="9.5" rx="2.5"/>
    <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>
    <circle cx="12" cy="15" r="1.4"/>
  </svg>`,
  description: msg('check.secure.desc'),
  async detect(): Promise<CheckResult> {
    const ok = window.isSecureContext;
    const host = window.location.hostname || '(file)';
    const proto = window.location.protocol.replace(':', '').toUpperCase();
    const localhost = /^(localhost|127\.|::1$|\[::1\])/.test(host);
    const isolated = window.crossOriginIsolated === true;

    const meta: MetaItem[] = [
      { label: msg('check.secure.meta.protocol'), value: proto },
      { label: msg('check.secure.meta.host'), value: host },
      {
        label: msg('check.secure.meta.trust'),
        value: ok
          ? msg('meta.yes')
          : localhost
            ? msg('check.secure.meta.trustLocal')
            : msg('meta.no'),
        ok: ok ? true : localhost ? null : false,
      },
      {
        label: msg('check.secure.meta.coep'),
        value: isolated
          ? msg('check.secure.meta.coepOn')
          : msg('check.secure.meta.coepOff'),
        ok: isolated ? true : null,
      },
    ];

    return {
      status: ok ? 'supported' : 'unsupported',
      detail: ok
        ? msg('check.secure.ok')
        : msg('check.secure.no'),
      meta,
    };
  },
};
