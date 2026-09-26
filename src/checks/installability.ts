import { msg } from '../i18n/index.js';
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
      {
        label: msg('check.install.meta.manifest'),
        value: msg('check.install.meta.manifestFail'),
        ok: false,
      },
    ];
  }
  let man: ManifestShape;
  try {
    man = (await res.json()) as ManifestShape;
  } catch {
        return [
      {
        label: msg('check.install.meta.manifest'),
        value: msg('check.install.meta.manifestInvalid'),
        ok: false,
      },
    ];
  }
  const icons = man.icons?.length ?? 0;
  const has192 = (man.icons ?? []).some((i) =>
    /\b(192|512)\b/.test(i.sizes ?? ''),
  );
  const named = Boolean(man.name || man.short_name);
  const rows: MetaItem[] = [
    {
      label: msg('check.install.meta.manifest'),
      value: msg('check.install.meta.manifestOk'),
      ok: true,
    },
    {
      label: msg('check.install.meta.appName'),
      value: man.name ?? man.short_name ?? msg('meta.missing'),
      ok: named,
    },
    {
      label: msg('check.install.meta.icons'),
      value: icons
        ? has192
          ? msg('check.install.meta.iconsCountLarge', { n: icons })
          : msg('check.install.meta.iconsCount', { n: icons })
        : msg('meta.none'),
      ok: has192 ? true : icons ? null : false,
    },
  ];
  if (man.display) {
    rows.push({
      label: msg('check.install.meta.display'),
      value: man.display,
    });
  }
  return rows;
}

export const installability: Feature = {
  id: 'installability',
  name: msg('check.install.name'),
  tag: msg('check.install.tag'),
  group: 'pwa',
  docs: 'https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Installing',
  icon: `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <rect x="7" y="2.8" width="10" height="18.4" rx="2.5"/>
    <path d="M12 8v5M9.8 10.8L12 13l2.2-2.2"/>
  </svg>`,
  description: msg('check.install.desc'),
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
        label: msg('check.install.meta.promptApi'),
        value: hasPromptApi ? 'beforeinstallprompt' : msg('meta.none'),
        ok: hasPromptApi,
      },
      {
        label: msg('check.install.meta.installed'),
        value: installed ? msg('meta.yes') : msg('meta.no'),
        ok: null,
      },
    ];

    const link = document.querySelector<HTMLLinkElement>(
      'link[rel="manifest"]',
    );
    if (link) {
      meta.push(...(await manifestProbe(link)));
    } else {
      meta.push({
        label: msg('check.install.meta.manifest'),
        value: msg('check.install.meta.manifestNone'),
        ok: null,
      });
    }

    if (hasPromptApi) {
      return {
        status: 'supported',
        detail: link
          ? msg('check.install.okPrompt')
          : msg('check.install.okNoManifest'),
        meta,
      };
    }
    if (appleManual) {
      return {
        status: 'partial',
        detail: msg('check.install.apple'),
        meta,
      };
    }
    return {
      status: 'unsupported',
      detail: msg('check.install.no'),
      meta,
    };
  },
};
