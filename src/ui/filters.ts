/* Filter segmented control — All / Supported / Needs fallback.
   State lives in the URL hash (#supported, #missing) so a filtered
   view is shareable. Called from summary.ts after each result lands
   so counts and visibility track live results. */

import { FEATURES } from '../checks/index.js';
import { results, run } from '../state.js';
import type { CheckStatus } from '../types.js';

export type FilterKey = 'all' | 'supported' | 'missing';

const VALID: ReadonlySet<string> = new Set(['all', 'supported', 'missing']);

let current: FilterKey = 'all';

/** Enable/disable the segmented control (disabled until the run starts). */
export function setFiltersEnabled(enabled: boolean): void {
  document
    .querySelectorAll<HTMLButtonElement>('.seg-btn')
    .forEach((btn) => {
      btn.disabled = !enabled;
    });
}

function statusOf(id: string): CheckStatus | 'checking' {
  return results[id]?.status ?? 'checking';
}

function matches(id: string): boolean {
  // Before the run starts every card is pending — filtering by outcome
  // would wrongly hide the whole page.
  if (!run.started) return true;
  const s = statusOf(id);
  if (current === 'supported') return s === 'supported';
  if (current === 'missing') return s === 'partial' || s === 'unsupported';
  return true;
}

/** Applies the current filter to cards and groups. */
export function applyFilter(): void {
  for (const f of FEATURES) {
    const card = document.getElementById('card-' + f.id);
    if (card) card.style.display = matches(f.id) ? '' : 'none';
  }
  // hide a group when every card in it is filtered out
  document.querySelectorAll<HTMLElement>('.group').forEach((g) => {
    const anyVisible = Array.from(
      g.querySelectorAll<HTMLElement>('.card'),
    ).some((c) => c.style.display !== 'none');
    g.style.display = anyVisible ? '' : 'none';
  });
}

/** Refreshes the count badges on the three segments. */
export function refreshFilterCounts(): void {
  const counts: Record<FilterKey, number> = {
    all: FEATURES.length,
    supported: 0,
    missing: 0,
  };
  for (const f of FEATURES) {
    const s = results[f.id]?.status;
    if (s === 'supported') counts.supported++;
    else if (s === 'partial' || s === 'unsupported') counts.missing++;
  }
  document
    .querySelectorAll<HTMLButtonElement>('.seg-btn')
    .forEach((btn) => {
      const key = btn.dataset.filter;
      if (!key || !VALID.has(key)) return;
      const k = key as FilterKey;
      let c = btn.querySelector<HTMLElement>('.seg-count');
      if (!c) {
        c = document.createElement('span');
        c.className = 'seg-count';
        btn.append(c);
      }
      c.textContent = String(counts[k]);
    });
}

function setFilter(key: FilterKey, push = true): void {
  current = key;
  document
    .querySelectorAll<HTMLButtonElement>('.seg-btn')
    .forEach((btn) => {
      btn.setAttribute(
        'aria-pressed',
        btn.dataset.filter === key ? 'true' : 'false',
      );
    });
  if (push) {
    history.replaceState(
      null,
      '',
      window.location.pathname + (key === 'all' ? '' : '#' + key),
    );
  }
  applyFilter();
}

/** Reads the initial hash and wires button clicks. Call once at boot. */
export function initFilters(): void {
  setFiltersEnabled(false);
  const fromHash = window.location.hash.replace('#', '');
  if (VALID.has(fromHash)) current = fromHash as FilterKey;
  document
    .querySelectorAll<HTMLButtonElement>('.seg-btn')
    .forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.filter;
        if (key && VALID.has(key)) setFilter(key as FilterKey);
      });
    });
  setFilter(current, false);
}
