import type { CheckResult, Feature, MetaItem } from '../types.js';
import { tryProbe } from './common.js';

interface ManifestShape {
  name?: string;
  short_name?: string;
  display?: string;
  start_url?: string;
  icons?: { sizes?: string }[];
}

/**
 * Fetch and parse the linked web app manifest — install prompts only fire
 * when the manifest carries the required fields (name, icons, display…).
 */
async function manifestProbe(
  link: HTMLLinkElement,
): Promise<MetaItem[]> {
  const res = await tryProbe(fetch(link.href), 4000);
  if (!res || !res.ok) {
    return [
      { label: 'Manifest', value: 'Linked but failed to load', ok: false },
    ];
  }
  let man: ManifestShape;
  try {
    man = (await res.json()) as ManifestShape;
  } catch {
    return [{ label: 'Manifest', value: 'Linked but invalid JSON', ok: false }];
  }
  const icons = man.icons?.length ?? 0;
  const has192 = (man.icons ?? []).some((i) =>
    /\b(192|512)\b/.test(i.sizes ?? ''),
  );
  const named = Boolean(man.name || man.short_name);
  const rows: MetaItem[] = [
    { label: 'Manifest', value: 'Parsed', ok: true },
    { label: 'App name', value: man.name ?? man.short_name ?? 'Missing', ok: named },
    {
      label: 'Icons',
      value: icons ? icons + ' declared' + (has192 ? ' (≥192px)' : '') : 'None',
      ok: has192 ? true : icons ? null : false,
    },
  ];
  if (man.display) {
    rows.push({ label: 'Display mode', value: man.display });
  }
  return rows;
}

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
    const appleStandalone = (
      navigator as { standalone?: boolean }
    ).standalone;
    const appleManual = appleStandalone !== undefined; // iOS Safari flow
    const installed = window.matchMedia(
      '(display-mode: standalone)',
    ).matches || appleStandalone === true;

    const meta: MetaItem[] = [
      {
        label: 'Prompt API',
        value: hasPromptApi ? 'beforeinstallprompt' : 'None',
        ok: hasPromptApi,
      },
      { label: 'Running installed', value: installed ? 'Yes' : 'No', ok: null },
    ];

    const link = document.querySelector<HTMLLinkElement>(
      'link[rel="manifest"]',
    );
    if (link) {
      meta.push(...(await manifestProbe(link)));
    } else {
      meta.push({
        label: 'Manifest',
        value: 'None linked on this page',
        ok: null,
      });
    }

    if (hasPromptApi) {
      return {
        status: 'supported',
        detail: link
          ? 'This browser can fire an install prompt for eligible apps.'
          : 'Prompt API exists — note this page links no manifest, so no prompt would fire here.',
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
