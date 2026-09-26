/* Summary block: score figure, progress bar, verdict line, and
   reveals the nav actions once all checks have resolved. */

import { FEATURES } from '../checks/index.js';
import { results } from '../state.js';
import { el } from './dom.js';

export function updateSummary(): void {
  const total = FEATURES.length;
  const done = Object.keys(results).length;
  const okCount = FEATURES.filter(
    (f) => results[f.id]?.status === 'supported',
  ).length;
  const partial = FEATURES.filter(
    (f) => results[f.id]?.status === 'partial',
  ).length;

  const numEl = el('score-num');
  const fill = el('summary-fill');
  const note = el('summary-note');

  el('score-total').textContent = String(total);
  numEl.textContent = String(okCount);

  const pct = total ? (okCount / total) * 100 : 0;
  fill.style.width = pct + '%';

  numEl.classList.remove('is-good', 'is-warn', 'is-bad');
  fill.style.background = 'var(--ok)';

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
    fill.style.background = 'var(--bad)';
    note.textContent =
      'None of these features are available in this browser.';
  } else {
    numEl.classList.add('is-warn');
    fill.style.background = 'var(--warn)';
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
