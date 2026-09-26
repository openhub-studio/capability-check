/* ============================================================
   app.js — rendering engine + runner
   Reads window.CapabilityRegistry (see scripts/features.js),
   builds the UI, runs every detect(), keeps score, exports a
   report. Knows nothing about individual features.
   ============================================================ */

(function () {
  'use strict';

  const { groups, features } = window.CapabilityRegistry;

  const STATUS_LABEL = {
    checking: 'Checking',
    supported: 'Supported',
    partial: 'Partial',
    unsupported: 'Not supported',
  };

  const results = {}; // id -> { feature, status, detail, meta }
  const cardEls = {}; // id -> { badge, detail, body }

  /* ---------------- UA summary ---------------- */

  function environment() {
    const ua = navigator.userAgent;
    let name = 'Browser';
    let version = '';
    const table = [
      [/Edg(?:e|A|iOS)?\/([\d.]+)/, 'Edge'],
      [/OPR\/([\d.]+)/, 'Opera'],
      [/Chrome\/([\d.]+)/, 'Chrome'],
      [/Firefox\/([\d.]+)/, 'Firefox'],
      [/Version\/([\d.]+).{0,20}Safari/, 'Safari'],
    ];
    for (const [re, label] of table) {
      const m = ua.match(re);
      if (m) {
        name = label;
        version = m[1].split('.')[0];
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
  document.getElementById('hero-env').textContent =
    env.name + (env.version ? ' ' + env.version : '') +
    (env.os ? ' · ' + env.os : '') +
    (window.isSecureContext ? '' : ' · insecure context');

  /* ---------------- build cards ---------------- */

  const groupsRoot = document.getElementById('groups');

  function featureCard(f) {
    const card = document.createElement('article');
    card.className = 'card';
    card.id = 'card-' + f.id;

    const head = document.createElement('div');
    head.className = 'card-head';

    const titleWrap = document.createElement('div');
    titleWrap.className = 'card-title';
    titleWrap.innerHTML =
      '<div class="icon-tile">' + f.icon + '</div>' +
      '<h3 class="card-name"></h3>' +
      '<span class="card-tag"></span>';
    titleWrap.querySelector('.card-name').textContent = f.name;
    titleWrap.querySelector('.card-tag').textContent = f.tag || '';
    const tag = titleWrap.querySelector('.card-tag');
    if (!f.tag) tag.remove();

    const badge = document.createElement('span');
    badge.className = 'badge checking';
    badge.innerHTML = '<span class="badge-dot"></span><span class="badge-text"></span>';
    badge.querySelector('.badge-text').textContent = STATUS_LABEL.checking;

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

  function build() {
    for (const g of groups) {
      const members = features.filter((f) => f.group === g.key);
      if (!members.length) continue;
      const section = document.createElement('section');
      section.className = 'group';
      const h = document.createElement('h2');
      h.className = 'group-title';
      h.textContent = g.title;
      const sub = document.createElement('p');
      sub.className = 'group-sub';
      sub.textContent = g.sub || '';
      const grid = document.createElement('div');
      grid.className = 'card-grid';
      members.forEach((f) => grid.append(featureCard(f)));
      if (g.sub) section.append(h, sub, grid);
      else section.append(h, grid);
      groupsRoot.append(section);
    }
    // orphan features (unknown group) still render, under "Other"
    const known = new Set(groups.map((g) => g.key));
    const orphans = features.filter((f) => !known.has(f.group));
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

  function renderResult(id, res) {
    const el = cardEls[id];
    const { badge, detail, body } = el;
    badge.className = 'badge ' + res.status + ' result-in';
    badge.querySelector('.badge-text').textContent =
      STATUS_LABEL[res.status] || res.status;
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

  function resetCards() {
    for (const f of features) {
      const el = cardEls[f.id];
      el.badge.className = 'badge checking';
      el.badge.querySelector('.badge-text').textContent = STATUS_LABEL.checking;
      el.detail.textContent = 'Checking…';
      el.body.querySelectorAll('.meta-row').forEach((r) => r.remove());
      delete results[f.id];
    }
    updateSummary();
  }

  function updateSummary() {
    const total = features.length;
    const done = Object.keys(results).length;
    const okCount = features.filter(
      (f) => results[f.id] && results[f.id].status === 'supported'
    ).length;
    const partial = features.filter(
      (f) => results[f.id] && results[f.id].status === 'partial'
    ).length;

    const numEl = document.getElementById('score-num');
    const fill = document.getElementById('summary-fill');
    const note = document.getElementById('summary-note');

    document.getElementById('score-total').textContent = total;
    numEl.textContent = okCount;

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
      document.getElementById('rerun').hidden = false;
      document.getElementById('copy-report').hidden = false;
    } else {
      note.textContent = 'Checking…';
    }
  }

  async function runAll() {
    resetCards();
    features.forEach((f, i) => {
      // small stagger so the cascade reads as live checks, not noise
      setTimeout(async () => {
        let res;
        try {
          res = await f.detect();
        } catch (err) {
          res = {
            status: 'unsupported',
            detail: 'The check itself failed: ' + (err && err.message ? err.message : err),
          };
        }
        if (!res || !res.status) {
          res = { status: 'unsupported', detail: 'Check returned no result.' };
        }
        results[f.id] = { feature: f, ...res };
        renderResult(f.id, res);
        updateSummary();
      }, i * 160);
    });
  }

  /* ---------------- report ---------------- */

  function buildReport() {
    const out = {
      tool: 'capability-check',
      timestamp: new Date().toISOString(),
      environment: {
        browser: env.name,
        version: env.version || null,
        os: env.os || null,
        secureContext: !!window.isSecureContext,
        userAgent: env.ua,
      },
      summary: {
        total: features.length,
        supported: 0,
        partial: 0,
        unsupported: 0,
      },
      features: {},
    };
    for (const f of features) {
      const r = results[f.id];
      const status = r ? r.status : 'checking';
      out.summary[status] = (out.summary[status] || 0) + 1;
      const entry = { name: f.name, status, detail: r ? r.detail : null };
      if (r && Array.isArray(r.meta) && r.meta.length) {
        entry.meta = {};
        for (const m of r.meta) entry.meta[m.label] = m.value;
      }
      out.features[f.id] = entry;
    }
    delete out.summary.checking;
    return out;
  }

  function toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._h);
    t._h = setTimeout(() => t.classList.remove('show'), 2200);
  }

  document.getElementById('copy-report').addEventListener('click', async () => {
    const text = JSON.stringify(buildReport(), null, 2);
    try {
      await navigator.clipboard.writeText(text);
      toast('Report copied to clipboard');
    } catch (_) {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.append(ta);
      ta.select();
      try {
        document.execCommand('copy');
        toast('Report copied to clipboard');
      } catch (e) {
        toast('Copy failed — check browser permissions');
      }
      ta.remove();
    }
  });

  document.getElementById('rerun').addEventListener('click', runAll);

  /* ---------------- boot ---------------- */

  build();
  // stagger the three reveal blocks (hero, summary, groups are already
  // CSS-animated; give the group container its own delay)
  document.querySelectorAll('[data-reveal]').forEach((el, i) => {
    el.style.setProperty('--d', i * 120 + 'ms');
  });
  groupsRoot.setAttribute('data-reveal', '');
  groupsRoot.style.setProperty('--d', '240ms');
  runAll();
})();
