/* Report — serializes the current results into a JSON snapshot
   for the "Copy report" action. */

import { FEATURES } from './checks/index.js';
import { env } from './environment.js';
import { results } from './state.js';
import type { UiStatus } from './ui/cards.js';

export interface Report {
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

export function buildReport(): Report {
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
    summary: {
      total: FEATURES.length,
      supported: 0,
      partial: 0,
      unsupported: 0,
    },
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
