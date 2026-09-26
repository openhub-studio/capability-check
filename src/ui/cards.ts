/* Card + group construction. Owns the DOM handles for each card
   (cardEls), per-group handles (groupEls), the status-badge label
   map, skeleton rows, and the scroll-in reveal. */

import { FEATURES } from '../checks/index.js';
import { GROUPS } from '../groups.js';
import { msg, resolve, t, type I18nKey } from '../i18n/index.js';
import { results } from '../state.js';
import type { CheckStatus, Feature, FeatureGroup } from '../types.js';
import { el, mustQuery } from './dom.js';

export type UiStatus = CheckStatus | 'checking' | 'pending';

export const STATUS_KEY: Record<UiStatus, I18nKey> = {
  pending: 'status.pending',
  checking: 'status.checking',
  supported: 'status.supported',
  partial: 'status.partial',
  unsupported: 'status.unsupported',
};

export function statusLabel(status: UiStatus): string {
  return t(STATUS_KEY[status]);
}

export interface CardEls {
  card: HTMLElement;
  badge: HTMLElement;
  detail: HTMLElement;
  body: HTMLElement;
}

export interface GroupEls {
  section: HTMLElement;
  count: HTMLElement;
}

export const cardEls: Record<string, CardEls> = {};
export const groupEls: Record<string, GroupEls> = {};

/* ---------- skeleton rows (shown while a check runs) ---------- */

export function skeletonBody(body: HTMLElement): void {
  body.querySelectorAll('.meta-row, .card-detail.skel').forEach((r) =>
    r.remove(),
  );
  for (let i = 0; i < 2; i++) {
    const row = document.createElement('div');
    row.className = 'meta-row skel';
    const l = document.createElement('span');
    l.className = 'skel-l';
    const v = document.createElement('span');
    v.className = 'skel-v';
    row.append(l, v);
    body.append(row);
  }
}

/* ---------- scroll-in reveal ---------- */

let observer: IntersectionObserver | null = null;

function reveal(card: HTMLElement, index: number): void {
  if (!('IntersectionObserver' in window)) return;
  card.classList.add('pre-reveal');
  card.style.setProperty('--d', (index % 3) * 70 + 'ms');
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          e.target.classList.add('in-view');
          observer?.unobserve(e.target);
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -4% 0px' },
    );
  }
  observer.observe(card);
}

/* ---------- card ---------- */

function featureCard(f: Feature, index: number): HTMLElement {
  const card = document.createElement('article');
  card.className = 'card is-pending';
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
  mustQuery(titleWrap, '.card-name').textContent = resolve(f.name);
  const tag = mustQuery<HTMLElement>(titleWrap, '.card-tag');
  if (f.tag) tag.textContent = resolve(f.tag);
  else tag.remove();

  const badge = document.createElement('span');
  badge.className = 'badge pending';
  badge.innerHTML =
    '<span class="badge-dot"></span><span class="badge-text"></span>';
  mustQuery(badge, '.badge-text').textContent = statusLabel('pending');

  head.append(titleWrap, badge);

  const desc = document.createElement('p');
  desc.className = 'card-desc';
  desc.textContent = resolve(f.description);

  const body = document.createElement('div');
  body.className = 'card-body';
  const detail = document.createElement('p');
  detail.className = 'card-detail';
  body.append(detail);

  const foot = document.createElement('div');
  foot.className = 'card-foot';
  if (f.docs) {
    const a = document.createElement('a');
    a.className = 'card-link';
    a.href = f.docs;
    a.target = '_blank';
    a.rel = 'noopener';
    a.innerHTML = t('card.learnMore') + ' <span class="arrow">→</span>';
    foot.append(a);
  }

  card.append(head, desc, body, foot);
  cardEls[f.id] = { card, badge, detail, body };
  reveal(card, index);
  return card;
}

/* ---------- group section ---------- */

function groupSection(
  key: string,
  title: FeatureGroup['title'],
  sub: FeatureGroup['sub'],
  members: Feature[],
): HTMLElement {
  const section = document.createElement('section');
  section.className = 'group';

  const head = document.createElement('div');
  head.className = 'group-head';
  const h = document.createElement('h2');
  h.className = 'group-title';
  h.textContent = resolve(title);
  const count = document.createElement('span');
  count.className = 'group-count';
  count.hidden = true;
  head.append(h, count);

  const grid = document.createElement('div');
  grid.className = 'card-grid';
  members.forEach((f, i) => grid.append(featureCard(f, i)));

  if (sub) {
    const p = document.createElement('p');
    p.className = 'group-sub';
    p.textContent = resolve(sub);
    section.append(head, p, grid);
  } else {
    section.append(head, grid);
  }
  groupEls[key] = { section, count };
  return section;
}

/** Renders every registered group + an "Other" bucket for orphans. */
export function build(): void {
  const groupsRoot = el('groups');
  for (const g of GROUPS) {
    const members = FEATURES.filter((f) => f.group === g.key);
    if (!members.length) continue;
    groupsRoot.append(groupSection(g.key, g.title, g.sub, members));
  }
  const known = new Set(GROUPS.map((g) => g.key));
  const orphans = FEATURES.filter((f) => !known.has(f.group));
  if (orphans.length) {
    groupsRoot.append(
      groupSection('__other__', msg('group.other.title'), undefined, orphans),
    );
  }
}

/* ---------- locale re-render (no re-run required) ---------- */

/**
 * Re-resolves every card's name/tag/description and pending/checking
 * badge, plus group titles/subs — stored results keep their own state
 * and are re-rendered by runner.rerenderResults().
 */
export function renderCardChrome(): void {
  for (const f of FEATURES) {
    const els = cardEls[f.id];
    if (!els) continue;
    mustQuery(els.card, '.card-name').textContent = resolve(f.name);
    const tag = els.card.querySelector('.card-tag');
    if (tag) tag.textContent = f.tag ? resolve(f.tag) : '';
    mustQuery(els.card, '.card-desc').textContent = resolve(f.description);
    const link = els.card.querySelector<HTMLElement>('.card-link');
    if (link) {
      link.innerHTML = t('card.learnMore') + ' <span class="arrow">→</span>';
    }
    if (!results[f.id]) {
      const pending = els.card.classList.contains('is-pending');
      els.badge.className = 'badge ' + (pending ? 'pending' : 'checking');
      mustQuery(els.badge, '.badge-text').textContent = statusLabel(
        pending ? 'pending' : 'checking',
      );
    }
  }
  for (const g of GROUPS) {
    const handles = groupEls[g.key];
    if (!handles) continue;
    mustQuery(handles.section, '.group-title').textContent = resolve(g.title);
    const sub = handles.section.querySelector('.group-sub');
    if (sub && g.sub) sub.textContent = resolve(g.sub);
  }
  const other = groupEls.__other__;
  if (other) {
    mustQuery(other.section, '.group-title').textContent =
      t('group.other.title');
  }
}
