/* Card + group construction. Owns the DOM handles for each card
   (cardEls), per-group handles (groupEls), the status-badge label
   map, skeleton rows, and the scroll-in reveal. */

import { FEATURES } from '../checks/index.js';
import { GROUPS } from '../groups.js';
import type { CheckStatus, Feature } from '../types.js';
import { el, mustQuery } from './dom.js';

export type UiStatus = CheckStatus | 'checking' | 'pending';

export const STATUS_LABEL: Record<UiStatus, string> = {
  pending: 'Pending',
  checking: 'Checking',
  supported: 'Supported',
  partial: 'Partial',
  unsupported: 'Not supported',
};

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
  mustQuery(titleWrap, '.card-name').textContent = f.name;
  const tag = mustQuery<HTMLElement>(titleWrap, '.card-tag');
  if (f.tag) tag.textContent = f.tag;
  else tag.remove();

  const badge = document.createElement('span');
  badge.className = 'badge pending';
  badge.innerHTML =
    '<span class="badge-dot"></span><span class="badge-text"></span>';
  mustQuery(badge, '.badge-text').textContent = STATUS_LABEL.pending;

  head.append(titleWrap, badge);

  const desc = document.createElement('p');
  desc.className = 'card-desc';
  desc.textContent = f.description;

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
    a.innerHTML = 'Learn more <span class="arrow">→</span>';
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
  title: string,
  sub: string | undefined,
  members: Feature[],
): HTMLElement {
  const section = document.createElement('section');
  section.className = 'group';

  const head = document.createElement('div');
  head.className = 'group-head';
  const h = document.createElement('h2');
  h.className = 'group-title';
  h.textContent = title;
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
    p.textContent = sub;
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
    groupsRoot.append(groupSection('__other__', 'Other', undefined, orphans));
  }
}
