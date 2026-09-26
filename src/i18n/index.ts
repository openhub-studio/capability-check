/* ============================================================
   i18n — locale detection, lookup, and DOM application.

   Strings never live in markup or logic: every user-facing text is a
   key into en.ts / zh.ts (key parity enforced at compile time).

   - `t(key, args)`        → localized string, {name} interpolation
   - `msg(key, args)`      → a lazy Text reference stored in results,
                             so re-rendering after a locale switch does
                             NOT require re-running probes
   - `resolve(text)`       → string now (plain strings pass through —
                             technical values like "aes128gcm" or hosts
                             stay untranslated on purpose)
   - `applyStaticTexts()`  → re-renders every [data-i18n] element,
                             document.title, meta description
   ============================================================ */

import { en, type I18nKey } from './en.js';

export type { I18nKey } from './en.js';
import { zh } from './zh.js';

export type Locale = 'en' | 'zh';
export type I18nArgs = Record<string, string | number>;

/** A deferred, locale-independent string reference. */
export interface Msg {
  k: I18nKey;
  a?: I18nArgs;
}

/** Anything renderable: either a literal (technical value) or a Msg. */
export type Text = string | Msg;

const STORAGE_KEY = 'cc-lang';
const DICTS: Record<Locale, Record<I18nKey, string>> = { en, zh };

function detectLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'zh') return stored;
  } catch {
    /* storage unavailable — fall through */
  }
  const langs = navigator.languages ?? [navigator.language];
  for (const l of langs) {
    if (typeof l === 'string' && l.toLowerCase().startsWith('zh')) {
      return 'zh';
    }
  }
  return 'en';
}

export let locale: Locale = detectLocale();

export function setLocale(next: Locale): void {
  locale = next;
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* persistence is best-effort */
  }
}

export function t(k: I18nKey, a?: I18nArgs): string {
  const table = DICTS[locale];
  let s: string = table[k] ?? en[k] ?? k;
  if (a) {
    s = s.replace(/\{(\w+)\}/g, (_, name: string) =>
      a[name] !== undefined ? String(a[name]) : '{' + name + '}',
    );
  }
  return s;
}

export function msg(k: I18nKey, a?: I18nArgs): Msg {
  return a === undefined ? { k } : { k, a };
}

export function resolve(text: Text): string {
  return typeof text === 'string' ? text : t(text.k, text.a);
}

/**
 * Re-renders every element carrying `data-i18n` (innerHTML — dictionaries
 * are trusted and may contain <b>/<br>), plus `data-i18n-attr` pairs in
 * the form `attr:key;attr:key`. Interpolated args come from the optional
 * `data-i18n-args` JSON attribute.
 */
export function applyStaticTexts(root: ParentNode = document): void {
  document.title = t('meta.title');
  const desc = document.querySelector('meta[name="description"]');
  if (desc) desc.setAttribute('content', t('meta.description'));

  root.querySelectorAll<HTMLElement>('[data-i18n]').forEach((elm) => {
    const key = elm.dataset.i18n as I18nKey | undefined;
    if (!key) return;
    let args: I18nArgs | undefined;
    if (elm.dataset.i18nArgs) {
      try {
        args = JSON.parse(elm.dataset.i18nArgs) as I18nArgs;
      } catch {
        args = undefined;
      }
    }
    elm.innerHTML = t(key, args);
  });

  root.querySelectorAll<HTMLElement>('[data-i18n-attr]').forEach((elm) => {
    for (const part of (elm.dataset.i18nAttr ?? '').split(';')) {
      const sep = part.indexOf(':');
      if (sep === -1) continue;
      const attr = part.slice(0, sep).trim();
      const key = part.slice(sep + 1).trim() as I18nKey;
      if (attr && key) elm.setAttribute(attr, t(key));
    }
  });
}
