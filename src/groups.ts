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
];
