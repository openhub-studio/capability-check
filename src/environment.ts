/* Parses the user agent into a short "Chrome 153 · Linux" descriptor.
   Pure string matching — deliberately minimal, not a full UA parser. */

export interface Env {
  name: string;
  version: string;
  os: string;
  ua: string;
}

function parseUA(): Env {
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
  else if (/iPad/.test(ua)) os = 'iPadOS';
  else if (/iPhone|iPod/.test(ua)) os = 'iOS';
  else if (/Mac OS X/.test(ua)) {
    // iPadOS 13+ ships a desktop-class "Macintosh" UA — multi-touch is
    // the reliable tell (Macs report maxTouchPoints 0/undefined).
    os = navigator.maxTouchPoints > 1 ? 'iPadOS' : 'macOS';
  }
  else if (/CrOS/.test(ua)) os = 'ChromeOS';
  else if (/Linux/.test(ua)) os = 'Linux';
  return { name, version, os, ua };
}

/** Parsed once at module load; UA doesn't change during the session. */
export const env: Env = parseUA();
