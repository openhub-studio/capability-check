/* Card + group construction. Owns the DOM handles for each card
   (cardEls) and the status-badge label map. */

import { FEATURES } from '../checks/index.js';
import { GROUPS } from '../groups.js';
import type { CheckStatus, Feature } from '../types.js';
import { el, mustQuery } from './dom.js';

export type UiStatus = CheckStatus | 'checking';

export const STATUS_LABEL: Record<UiStatus, string> = {
  checking: 'Checking',
  supported: 'Supported',
  partial: 'Partial',
  unsupported: 'Not supported',
};

export interface CardEls {
  badge: HTMLElement;
  detail: HTMLElement;
  body: HTMLElement;
}

export const cardEls: Record<string, CardEls> = {};

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

function groupSection(title: string, sub: string | undefined, members: Feature[]): HTMLElement {
  const section = document.createElement('section');
  section.className = 'group';
  const h = document.createElement('h2');
  h.className = 'group-title';
  h.textContent = title;
  const grid = document.createElement('div');
  grid.className = 'card-grid';
  members.forEach((f) => grid.append(featureCard(f)));
  if (sub) {
    const p = document.createElement('p');
    p.className = 'group-sub';
    p.textContent = sub;
    section.append(h, p, grid);
  } else {
    section.append(h, grid);
  }
  return section;
}

/** Renders every registered group + an "Other" bucket for orphans. */
export function build(): void {
  const groupsRoot = el('groups');
  for (const g of GROUPS) {
    const members = FEATURES.filter((f) => f.group === g.key);
    if (!members.length) continue;
    groupsRoot.append(groupSection(g.title, g.sub, members));
  }
  const known = new Set(GROUPS.map((g) => g.key));
  const orphans = FEATURES.filter((f) => !known.has(f.group));
  if (orphans.length) {
    groupsRoot.append(groupSection('Other', undefined, orphans));
  }
}
