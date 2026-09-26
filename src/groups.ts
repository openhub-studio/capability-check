/* Section definitions — groups render in this order.
   A check's `group` field references a key here; unknown keys
   fall back to an auto-created "Other" section. */

import type { FeatureGroup } from './types.js';

export const GROUPS: FeatureGroup[] = [
  {
    key: 'compute',
    title: 'Compute',
    sub: 'Near-native performance, compiled and vectorised.',
  },
  {
    key: 'graphics',
    title: 'Graphics',
    sub: 'Modern GPU access for rendering and compute.',
  },
  {
    key: 'storage',
    title: 'Storage',
    sub: 'Persistent data — caches, structured records, and files.',
  },
  {
    key: 'pwa',
    title: 'Progressive Web App',
    sub: 'What it takes to be installable and work offline.',
  },
  {
    key: 'engagement',
    title: 'Engagement',
    sub: 'OS-level touchpoints that keep users connected.',
  },
];
