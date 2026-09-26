/* Runner — executes each check's detect(), pushes results into the
   store and the DOM, keeps the summary in sync. */

import { FEATURES } from './checks/index.js';
import { results, run } from './state.js';
import type { CheckResult } from './types.js';
import { msg, resolve, t } from './i18n/index.js';
import { cardEls, skeletonBody, statusLabel } from './ui/cards.js';
import { mustQuery } from './ui/dom.js';
import { updateSummary } from './ui/summary.js';

function renderResult(id: string, res: CheckResult): void {
  const els = cardEls[id];
  if (!els) return;
  const { badge, detail, body } = els;
  badge.className = 'badge ' + res.status + ' result-in';
  mustQuery(badge, '.badge-text').textContent = statusLabel(res.status);
  detail.textContent = res.detail ? resolve(res.detail) : '';
  // clear old meta rows
  body.querySelectorAll('.meta-row').forEach((r) => r.remove());
  if (Array.isArray(res.meta)) {
    for (const m of res.meta) {
      const row = document.createElement('div');
      row.className = 'meta-row';
      const l = document.createElement('span');
      l.className = 'meta-label';
      l.textContent = resolve(m.label);
      const v = document.createElement('span');
      v.className = 'meta-value';
      v.textContent = resolve(m.value);
      if (m.ok === true) v.style.color = 'var(--ok)';
      else if (m.ok === false) v.style.color = 'var(--bad)';
      row.append(l, v);
      body.append(row);
    }
  }
}

function resetCards(): void {
  for (const f of FEATURES) {
    const els = cardEls[f.id];
    if (!els) continue;
    els.card.classList.remove('is-pending');
    els.badge.className = 'badge checking';
    mustQuery(els.badge, '.badge-text').textContent = statusLabel('checking');
    els.detail.textContent = t('status.checking');
    skeletonBody(els.body);
    delete results[f.id];
  }
  updateSummary();
}

async function runFeature(f: (typeof FEATURES)[number]): Promise<void> {
  let res: CheckResult;
  try {
    res = await f.detect();
  } catch (err) {
    res = {
      status: 'unsupported',
      detail: msg('run.error', {
        msg: err instanceof Error ? err.message : String(err),
      }),
    };
  }
  if (!res || !res.status) {
    res = { status: 'unsupported', detail: msg('run.noResult') };
  }
  results[f.id] = { feature: f, ...res };
  renderResult(f.id, res);
  updateSummary();
}

/** Runs every registered check, visually staggered. */
export function runAll(): void {
  run.started = true;
  resetCards();
  FEATURES.forEach((f, i) => {
    // small stagger so the cascade reads as live checks, not noise
    setTimeout(() => {
      void runFeature(f);
    }, i * 160);
  });
}

/** Re-renders stored results in the current locale — no probes re-run. */
export function rerenderResults(): void {
  for (const id of Object.keys(results)) {
    const r = results[id];
    if (r) renderResult(id, r);
  }
}
