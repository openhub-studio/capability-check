import type { CheckResult, Feature, MetaItem } from '../types.js';

export const installability: Feature = {
  id: 'installability',
  name: 'App Install',
  tag: 'Manifest + prompt',
  group: 'pwa',
  docs: 'https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Installing',
  icon: `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <rect x="7" y="2.8" width="10" height="18.4" rx="2.5"/>
    <path d="M12 8v5M9.8 10.8L12 13l2.2-2.2"/>
  </svg>`,
  description:
    'Whether the browser exposes an install surface — the beforeinstallprompt event or a manual Add-to-Home-Screen flow.',
  async detect(): Promise<CheckResult> {
    const hasPromptApi =
      'BeforeInstallPromptEvent' in window ||
      'onbeforeinstallprompt' in window;
    const appleManual = 'standalone' in navigator; // iOS Safari flow
    const installed = window.matchMedia(
      '(display-mode: standalone)',
    ).matches;

    const meta: MetaItem[] = [
      {
        label: 'Prompt API',
        value: hasPromptApi ? 'beforeinstallprompt' : 'None',
        ok: hasPromptApi,
      },
      { label: 'Running installed', value: installed ? 'Yes' : 'No', ok: null },
    ];

    if (hasPromptApi) {
      return {
        status: 'supported',
        detail: 'This browser can fire an install prompt for eligible apps.',
        meta,
      };
    }
    if (appleManual) {
      return {
        status: 'partial',
        detail:
          'No install-prompt API — this platform installs via the manual “Add to Home Screen” flow.',
        meta,
      };
    }
    return {
      status: 'unsupported',
      detail: 'No install surface detected for web apps.',
      meta,
    };
  },
};
