/* Toast — brief floating confirmation, auto-dismisses. */

import { el } from './dom.js';

let timer: number | undefined;

export function toast(msg: string): void {
  const t = el('toast');
  t.textContent = msg;
  t.classList.add('show');
  window.clearTimeout(timer);
  timer = window.setTimeout(() => t.classList.remove('show'), 2200);
}
