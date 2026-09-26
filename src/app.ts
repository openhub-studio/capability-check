/* ============================================================
   app.ts — rendering engine + runner
   Reads the registry (src/features.ts), builds the UI, runs
   every detect(), keeps score, exports a report.
   Knows nothing about individual features.
   ============================================================ */

import { FEATURES, GROUPS } from './features.js';
import type {
  CheckResult,
  CheckStatus,
  Feature,
} from './types.js';

/* ---------------- helpers ---------------- */

function el<T extends HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`#${id} not found`);
  return node as T;
}

function mustQuery<T extends Element>(root: ParentNode, sel: string): T {
  const node = root.querySelector<T>(sel);
  if (!node) throw new Error(`${sel} not found`);
  return node;
}

/* ---------------- types ---------------- */

type UiStatus = CheckStatus | 'checking';

interface RunResult extends CheckResult {
  feature: Feature;
}

interface CardEls {
  badge: HTMLElement;
  detail: HTMLElement;
  body: HTMLElement;
}

const STATUS_LABEL: Record<UiStatus, string> = {
  checking: 'Checking',
  supported: 'Supported',
  partial: 'Partial',
  unsupported: 'Not supported',
};

const results: Record<string, RunResult> = {};
const cardEls: Record<string, CardEls> = {};

/* ---------------- UA summary ---------------- */

interface Env {
  name: string;
  version: string;
  os: string;
  ua: string;
}

function environment(): Env {
  const ua = navigator.userAgent;
  let name = 'Browser';
  let version = '';
  const table: Array<[RegExp, string]> = [
    [/Edg(?:e|A|iOS)?\/([\d.]+)/, 'Edge'],
    [/OPR\/([\d.]+)/, 'Opera'],
    [/Chrome\/([\d.]+)/, 'Chrome'],
    [/Firefox\/([\d.]+)/, 'Firefox'],
    [/Version\/([\d.]+).{0,20}Safari/, 'Safari'],
  ];
  for (const [re, label] of table) {
    const m = ua.match(re);
    if (m && m[1]) {
      name = label;
      version = m[1].split('.')[0] ?? '';
      break;
    }
  }
  let os = '';
  if (/Windows NT/.test(ua)) os = 'Windows';
  else if (/Android/.test(ua)) os = 'Android';
  else if (/iPhone|iPad|iPod/.test(ua)) os = 'iOS';
  else if (/Mac OS X/.test(ua)) os = 'macOS';
  else if (/CrOS/.test(ua)) os = 'ChromeOS';
  else if (/Linux/.test(ua)) os = 'Linux';
  return { name, version, os, ua };
}

const env = environment();
el('hero-env').textContent =
  env.name +
  (env.version ? ' ' + env.version : '') +
  (env.os ? ' · ' + env.os : '') +
  (window.isSecureContext ? '' : ' · insecure context');

/* ---------------- build cards ---------------- */

const groupsRoot = el('groups');

function featureCard(f: Feature): HTMLElement {
  const card = document.createElement('article');
  card.className = 'card';
  card.id = 'card-' + f.id;

  const head = document.createElement('div');
  head.className = 'card-head';

  const titleWrap = document.createElement('div');
  titleWrap.className = 'card-title';
  titleWrap.innerHTML =
    '<div class="icon-tile">' +
    f.icon +
    '</div>' +
    '<h3 class="card-name"></h3>' +
    '<span class="card-tag"></span>';
  mustQuery(titleWrap, '.card-name').textContent = f.name;
  const tag = mustQuery<HTMLElement>(titleWrap, '.card-tag');
  if (f.tag) tag.textContent = f.tag;
  else tag.remove();

  const badge = document.createElement('span');
  badge.className = 'badge checking';
  badge.innerHTML =
    '<span class="badge-dot"></span><span class="badge-text"></span>';
  mustQuery(badge, '.badge-text').textContent = STATUS_LABEL.checking;

  head.append(titleWrap, badge);

  const desc = document.createElement('p');
  desc.className = 'card-desc';
  desc.textContent = f.description;

  const body = document.createElement('div');
  body.className = 'card-body';
  const detail = document.createElement('p');
  detail.className = 'card-detail';
  detail.textContent = 'Checking…';
  body.append(detail);

  const foot = document.createElement('div');
  foot.className = 'card-foot';
  if (f.docs) {
    const a = document.createElement('a');
    a.className = 'card-link';
    a.href = f.docs;
    a.target = '_blank';
    a.rel = 'noopener';
    a.innerHTML = 'Learn more <span class="arrow">→</span>';
    foot.append(a);
  }

  card.append(head, desc, body, foot);
  cardEls[f.id] = { badge, detail, body };
  return card;
}

function build(): void {
  for (const g of GROUPS) {
    const members = FEATURES.filter((f) => f.group === g.key);
    if (!members.length) continue;
    const section = document.createElement('section');
    section.className = 'group';
    const h = document.createElement('h2');
    h.className = 'group-title';
    h.textContent = g.title;
    const grid = document.createElement('div');
    grid.className = 'card-grid';
    members.forEach((f) => grid.append(featureCard(f)));
    if (g.sub) {
      const sub = document.createElement('p');
      sub.className = 'group-sub';
      sub.textContent = g.sub;
      section.append(h, sub, grid);
    } else {
      section.append(h, grid);
    }
    groupsRoot.append(section);
  }
  // orphan features (unknown group) still render, under "Other"
  const known = new Set(GROUPS.map((g) => g.key));
  const orphans = FEATURES.filter((f) => !known.has(f.group));
  if (orphans.length) {
    const section = document.createElement('section');
    section.className = 'group';
    const h = document.createElement('h2');
    h.className = 'group-title';
    h.textContent = 'Other';
    const grid = document.createElement('div');
    grid.className = 'card-grid';
    orphans.forEach((f) => grid.append(featureCard(f)));
    section.append(h, grid);
    groupsRoot.append(section);
  }
}

/* ---------------- run checks ---------------- */

function renderResult(id: string, res: CheckResult): void {
  const els = cardEls[id];
  if (!els) return;
  const { badge, detail, body } = els;
  badge.className = 'badge ' + res.status + ' result-in';
  mustQuery(badge, '.badge-text').textContent =
    STATUS_LABEL[res.status] ?? res.status;
  detail.textContent = res.detail || '';
  // clear old meta rows
  body.querySelectorAll('.meta-row').forEach((r) => r.remove());
  if (Array.isArray(res.meta)) {
    for (const m of res.meta) {
      const row = document.createElement('div');
      row.className = 'meta-row';
      const l = document.createElement('span');
      l.className = 'meta-label';
      l.textContent = m.label;
      const v = document.createElement('span');
      v.className = 'meta-value';
      v.textContent = m.value;
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
    els.badge.className = 'badge checking';
    mustQuery(els.badge, '.badge-text').textContent = STATUS_LABEL.checking;
    els.detail.textContent = 'Checking…';
    els.body.querySelectorAll('.meta-row').forEach((r) => r.remove());
    delete results[f.id];
  }
  updateSummary();
}

function updateSummary(): void {
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
  if (done === total) {
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
  } else {
    note.textContent = 'Checking…';
  }
}

function runAll(): void {
  resetCards();
  FEATURES.forEach((f, i) => {
    // small stagger so the cascade reads as live checks, not noise
    setTimeout(() => {
      void (async () => {
        let res: CheckResult;
        try {
          res = await f.detect();
        } catch (err) {
          res = {
            status: 'unsupported',
            detail:
              'The check itself failed: ' +
              (err instanceof Error ? err.message : String(err)),
          };
        }
        if (!res || !res.status) {
          res = { status: 'unsupported', detail: 'Check returned no result.' };
        }
        results[f.id] = { feature: f, ...res };
        renderResult(f.id, res);
        updateSummary();
      })();
    }, i * 160);
  });
}

/* ---------------- report ---------------- */

interface Report {
  tool: string;
  timestamp: string;
  environment: {
    browser: string;
    version: string | null;
    os: string | null;
    secureContext: boolean;
    userAgent: string;
  };
  summary: {
    total: number;
    supported: number;
    partial: number;
    unsupported: number;
  };
  features: Record<
    string,
    {
      name: string;
      status: UiStatus;
      detail: string | null;
      meta?: Record<string, string>;
    }
  >;
}

function buildReport(): Report {
  const out: Report = {
    tool: 'capability-check',
    timestamp: new Date().toISOString(),
    environment: {
      browser: env.name,
      version: env.version || null,
      os: env.os || null,
      secureContext: window.isSecureContext,
      userAgent: env.ua,
    },
    summary: { total: FEATURES.length, supported: 0, partial: 0, unsupported: 0 },
    features: {},
  };
  for (const f of FEATURES) {
    const r = results[f.id];
    const status: UiStatus = r ? r.status : 'checking';
    if (status !== 'checking' && status in out.summary) {
      out.summary[status] += 1;
    }
    const entry: Report['features'][string] = {
      name: f.name,
      status,
      detail: r ? r.detail : null,
    };
    if (r && Array.isArray(r.meta) && r.meta.length) {
      const metaMap: Record<string, string> = {};
      for (const m of r.meta) metaMap[m.label] = m.value;
      entry.meta = metaMap;
    }
    out.features[f.id] = entry;
  }
  return out;
}

/* ---------------- toast + buttons ---------------- */

let toastTimer: number | undefined;

function toast(msg: string): void {
  const t = el('toast');
  t.textContent = msg;
  t.classList.add('show');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => t.classList.remove('show'), 2200);
}

el<HTMLButtonElement>('copy-report').addEventListener('click', () => {
  void (async () => {
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
  })();
});

el<HTMLButtonElement>('rerun').addEventListener('click', runAll);

/* ---------------- boot ---------------- */

build();
document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((node, i) => {
  node.style.setProperty('--d', i * 120 + 'ms');
});
groupsRoot.setAttribute('data-reveal', '');
groupsRoot.style.setProperty('--d', '240ms');
runAll();
