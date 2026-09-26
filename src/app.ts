/* ============================================================
   app.ts — boot. Wires the environment line, builds the cards,
   connects the nav buttons, kicks off the checks.
   All logic lives in the modules it imports.
   ============================================================ */

import { env } from './environment.js';
import { buildReport } from './report.js';
import { runAll } from './runner.js';
import { build } from './ui/cards.js';
import { el } from './ui/dom.js';
import { toast } from './ui/toast.js';

/* ---------------- hero env line ---------------- */

el('hero-env').textContent =
  env.name +
  (env.version ? ' ' + env.version : '') +
  (env.os ? ' · ' + env.os : '') +
  (window.isSecureContext ? '' : ' · insecure context');

/* ---------------- buttons ---------------- */

async function copyReport(): Promise<void> {
  const text = JSON.stringify(buildReport(), null, 2);
  try {
    await navigator.clipboard.writeText(text);
    toast('Report copied to clipboard');
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.append(ta);
    ta.select();
    try {
      document.execCommand('copy');
      toast('Report copied to clipboard');
    } catch {
      toast('Copy failed — check browser permissions');
    }
    ta.remove();
  }
}

el<HTMLButtonElement>('copy-report').addEventListener('click', () => {
  void copyReport();
});
el<HTMLButtonElement>('rerun').addEventListener('click', runAll);

/* ---------------- boot ---------------- */

build();
// staggered rise-in for hero / summary / groups
document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((node, i) => {
  node.style.setProperty('--d', i * 120 + 'ms');
});
const groupsRoot = el('groups');
groupsRoot.setAttribute('data-reveal', '');
groupsRoot.style.setProperty('--d', '240ms');

runAll();
