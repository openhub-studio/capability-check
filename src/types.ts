/* ============================================================
   types.ts — shared contracts between the registry and the engine
   ============================================================ */

import type { Text } from './i18n/index.js';

/** Outcome of a feature check. */
export type CheckStatus = 'supported' | 'partial' | 'unsupported';

/**
 * One labelled fact shown on a card, e.g.
 * { label: msg('meta.quota'), value: '1.0 GB' }.
 * Labels/values are Text — a literal string for technical values
 * (hosts, formats) or a msg() reference for translatable text.
 */
export interface MetaItem {
  label: Text;
  value: Text;
  /** Optional semantic tint: true → green, false → red, null/omitted → neutral. */
  ok?: boolean | null;
}

/** What detect() must return. */
export interface CheckResult {
  status: CheckStatus;
  /** One short sentence of human-readable evidence. */
  detail: Text;
  meta?: MetaItem[];
}

/** A single capability check. Push one of these into FEATURES to extend. */
export interface Feature {
  /** Unique key, used in the report and element ids. */
  id: string;
  /** Display name on the card. */
  name: Text;
  /** Small line under the name. */
  tag?: Text;
  /** Must match a key in GROUPS (unknown keys render under "Other"). */
  group: string;
  /** "Learn more" link target. */
  docs?: string;
  /** Inline SVG markup — 24×24 viewBox, stroke-based. */
  icon: string;
  /** One sentence shown on the card. */
  description: Text;
  /** The actual probe. Throwing is allowed — the engine reports it as unsupported. */
  detect(): Promise<CheckResult>;
}

/** A rendered section. Groups render in array order. */
export interface FeatureGroup {
  key: string;
  title: Text;
  sub?: Text;
}
