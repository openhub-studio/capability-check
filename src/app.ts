/* ============================================================
   app.ts — boot. Wires the environment line, builds the cards,
   connects the nav buttons, kicks off the checks.
   All logic lives in the modules it imports.
   ============================================================ */

import { FEATURES } from './checks/index.js';
import { env } from './environment.js';
import { buildReport } from './report.js';
import { runAll } from './runner.js';
import { build } from './ui/cards.js';
import { el } from './ui/dom.js';
import { initFilters } from './ui/filters.js';
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

/* ---------------- PWA update flow ---------------- */

/**
 * Only reload on controllerchange when the user explicitly confirmed an
 * update — a first-time install's clients.claim() also fires the event,
 * and that activation needs no reload.
 */
let expectReload = false;

/** Show the "new version" pill; updates apply only after user confirms. */
function promptUpdate(sw: ServiceWorker): void {
  const banner = el('update-banner');
  if (!banner.hidden) return;
  banner.hidden = false;
  el('update-reload').addEventListener(
    'click',
    () => {
      expectReload = true;
      sw.postMessage({ type: 'SKIP_WAITING' });
      // Fallback in case controllerchange never fires.
      setTimeout(() => location.reload(), 3000);
    },
    { once: true },
  );
  el('update-later').addEventListener(
    'click',
    () => {
      banner.hidden = true;
    },
    { once: true },
  );
}

if ('serviceWorker' in navigator && window.isSecureContext) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (expectReload) location.reload();
        });
        // An update may already be waiting when this page loaded.
        if (reg.waiting && navigator.serviceWorker.controller) {
          promptUpdate(reg.waiting);
        }
        reg.addEventListener('updatefound', () => {
          const sw = reg.installing;
          sw?.addEventListener('statechange', () => {
            // 'installed' + an existing controller = this is an update,
            // not the first install.
            if (sw.state === 'installed' && navigator.serviceWorker.controller) {
              promptUpdate(reg.waiting ?? sw);
            }
          });
        });
        // Re-check for updates whenever the tab regains focus.
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            reg.update().catch(() => {
              /* transient */
            });
          }
        });
      })
      .catch(() => {
        /* offline shell unavailable — page still works */
      });
  });
}

/* ---------------- start gate ---------------- */

function begin(): void {
  build();
  initFilters();
  runAll();
}

el('gate-count').textContent = String(FEATURES.length);
const gate = el('start-gate');
const startBtn = el<HTMLButtonElement>('start-btn');
startBtn.addEventListener(
  'click',
  () => {
    gate.classList.add('hidden');
    setTimeout(() => gate.remove(), 450);
    begin();
  },
  { once: true },
);
startBtn.focus();

/* ---------------- mount ---------------- */

// staggered rise-in for hero / summary / groups
document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((node, i) => {
  node.style.setProperty('--d', i * 120 + 'ms');
});
const groupsRoot = el('groups');
groupsRoot.setAttribute('data-reveal', '');
groupsRoot.style.setProperty('--d', '240ms');
