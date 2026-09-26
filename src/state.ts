/* Runtime store: latest result per feature id.
   Written by runner.ts, read by ui/summary.ts and report.ts. */

import type { CheckResult, Feature } from './types.js';

export interface RunResult extends CheckResult {
  feature: Feature;
}

export const results: Record<string, RunResult> = {};

/* Becomes true once the user confirms the run — checks never execute
   before that. Read by summary.ts (CTA state) and filters.ts (pending
   cards match every filter). */
export const run = { started: false };
