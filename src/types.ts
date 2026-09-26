/* ============================================================
   types.ts — shared contracts between the registry and the engine
   ============================================================ */

/** Outcome of a feature check. */
export type CheckStatus = 'supported' | 'partial' | 'unsupported';

/** One labelled fact shown on a card, e.g. { label: 'Vendor', value: 'apple' }. */
export interface MetaItem {
  label: string;
  value: string;
  /** Optional semantic tint: true → green, false → red, null/omitted → neutral. */
  ok?: boolean | null;
}

/** What detect() must return. */
export interface CheckResult {
  status: CheckStatus;
  /** One short sentence of human-readable evidence. */
  detail: string;
  meta?: MetaItem[];
}

/** A single capability check. Push one of these into FEATURES to extend. */
export interface Feature {
  /** Unique key, used in the report and element ids. */
  id: string;
  /** Display name on the card. */
  name: string;
  /** Small line under the name. */
  tag?: string;
  /** Must match a key in GROUPS (unknown keys render under "Other"). */
  group: string;
  /** "Learn more" link target. */
  docs?: string;
  /** Inline SVG markup — 24×24 viewBox, stroke-based. */
  icon: string;
  /** One sentence shown on the card. */
  description: string;
  /** The actual probe. Throwing is allowed — the engine reports it as unsupported. */
  detect(): Promise<CheckResult>;
}

/** A rendered section. Groups render in array order. */
export interface FeatureGroup {
  key: string;
  title: string;
  sub?: string;
}
