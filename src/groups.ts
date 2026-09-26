/* Section definitions — groups render in this order.
   A check's `group` field references a key here; unknown keys
   fall back to an auto-created "Other" section. */

import { msg } from './i18n/index.js';
import type { FeatureGroup } from './types.js';

export const GROUPS: FeatureGroup[] = [
  {
    key: 'compute',
    title: msg('group.compute.title'),
    sub: msg('group.compute.sub'),
  },
  {
    key: 'graphics',
    title: msg('group.graphics.title'),
    sub: msg('group.graphics.sub'),
  },
  {
    key: 'storage',
    title: msg('group.storage.title'),
    sub: msg('group.storage.sub'),
  },
  {
    key: 'pwa',
    title: msg('group.pwa.title'),
    sub: msg('group.pwa.sub'),
  },
  {
    key: 'engagement',
    title: msg('group.engagement.title'),
    sub: msg('group.engagement.sub'),
  },
];
