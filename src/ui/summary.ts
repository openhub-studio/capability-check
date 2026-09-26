/* Summary block: score figure, segmented progress bar, status
   legend, verdict line, per-group counts — and reveals the nav
   actions once all checks have resolved. */

import { FEATURES } from '../checks/index.js';
import { GROUPS } from '../groups.js';
import { results } from '../state.js';
import { groupEls } from './cards.js';
import { el } from './dom.js';
import { applyFilter, refreshFilterCounts } from './filters.js';

function setText(id: string, text: string): void {
  el(id).textContent = text;
}

function updateGroupCounts(): void {
  for (const g of GROUPS) {
    const handles = groupEls[g.key];
    if (!handles) continue;
    const members = FEATURES.filter((f) => f.group === g.key);
    const ok = members.filter(
      (f) => results[f.id]?.status === 'supported',
    ).length;
    const done = members.every((f) => results[f.id]);
    handles.count.hidden = !done;
    handles.count.textContent = ok + '/' + members.length + ' supported';
  }
}

export function updateSummary(): void {
  const total = FEATURES.length;
  const done = Object.keys(results).length;
  const okCount = FEATURES.filter(
    (f) => results[f.id]?.status === 'supported',
  ).length;
  const partial = FEATURES.filter(
    (f) => results[f.id]?.status === 'partial',
  ).length;
  const bad = FEATURES.filter(
    (f) => results[f.id]?.status === 'unsupported',
  ).length;

  const numEl = el('score-num');
  const fillOk = el('fill-ok');
  const fillPartial = el('fill-partial');
  const fillBad = el('fill-bad');
  const note = el('summary-note');

  setText('score-total', String(total));
  numEl.textContent = String(okCount);

  if (total) {
    fillOk.style.width = (okCount / total) * 100 + '%';
    fillPartial.style.width = (partial / total) * 100 + '%';
    fillBad.style.width = (bad / total) * 100 + '%';
  }

  setText('legend-ok', String(okCount));
  setText('legend-partial', String(partial));
  setText('legend-bad', String(bad));
  updateGroupCounts();
  refreshFilterCounts();
  applyFilter();

  numEl.classList.remove('is-good', 'is-warn', 'is-bad');

  if (done !== total) {
    note.textContent = 'Checking…';
    return;
  }

  if (okCount === total && partial === 0) {
    numEl.classList.add('is-good');
    note.textContent =
      'Everything on this list works here — no fallbacks needed.';
  } else if (okCount === 0 && partial === 0) {
    numEl.classList.add('is-bad');
    note.textContent =
      'None of these features are available in this browser.';
  } else {
    numEl.classList.add('is-warn');
    const missing = total - okCount;
    note.textContent =
      missing + ' of ' + total + ' features ' +
      (missing === 1
        ? 'is unavailable or limited — apps may need a fallback.'
        : 'are unavailable or limited — apps may need fallbacks.');
  }
  el<HTMLButtonElement>('rerun').hidden = false;
  el<HTMLButtonElement>('copy-report').hidden = false;
}
