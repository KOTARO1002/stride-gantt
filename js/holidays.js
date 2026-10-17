// 日本の祝日（内閣府の祝日法ルールを計算で再現。振替休日・国民の休日を含む）
import { ymd, addDays, dow } from './dates.js';

const cache = new Map();

function nthMonday(y, m, n) {
  const first = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
  const firstMon = 1 + ((8 - first) % 7);
  return ymd(y, m, firstMon + (n - 1) * 7);
}
function vernal(y) {
  return Math.floor(20.8431 + 0.242194 * (y - 1980) - Math.floor((y - 1980) / 4));
}
function autumnal(y) {
  return Math.floor(23.2488 + 0.242194 * (y - 1980) - Math.floor((y - 1980) / 4));
}

function build(y) {
  const h = new Map();
  const add = (d, name) => h.set(d, name);
  add(ymd(y, 1, 1), '元日');
  add(nthMonday(y, 1, 2), '成人の日');
  add(ymd(y, 2, 11), '建国記念の日');
  if (y >= 2020) add(ymd(y, 2, 23), '天皇誕生日');
  add(ymd(y, 3, vernal(y)), '春分の日');
  add(ymd(y, 4, 29), '昭和の日');
  add(ymd(y, 5, 3), '憲法記念日');
  add(ymd(y, 5, 4), 'みどりの日');
  add(ymd(y, 5, 5), 'こどもの日');
  if (y === 2020) add(ymd(y, 7, 23), '海の日');
  else if (y === 2021) add(ymd(y, 7, 22), '海の日');
  else add(nthMonday(y, 7, 3), '海の日');
  if (y === 2020) add(ymd(y, 8, 10), '山の日');
  else if (y === 2021) add(ymd(y, 8, 8), '山の日');
  else add(ymd(y, 8, 11), '山の日');
  add(nthMonday(y, 9, 3), '敬老の日');
  add(ymd(y, 9, autumnal(y)), '秋分の日');
  if (y === 2020) add(ymd(y, 7, 24), 'スポーツの日');
  else if (y === 2021) add(ymd(y, 7, 23), 'スポーツの日');
  else add(nthMonday(y, 10, 2), 'スポーツの日');
  add(ymd(y, 11, 3), '文化の日');
  add(ymd(y, 11, 23), '勤労感謝の日');

  // 国民の休日（祝日に挟まれた平日）
  const sorted = [...h.keys()].sort();
  for (const d of sorted) {
    const next2 = addDays(d, 2);
    const mid = addDays(d, 1);
    if (h.has(next2) && !h.has(mid) && dow(mid) !== 0) add(mid, '国民の休日');
  }
  // 振替休日（日曜の祝日 → 次の祝日でない日）
  for (const d of [...h.keys()].sort()) {
    if (dow(d) === 0 && h.get(d) !== '振替休日') {
      let s = addDays(d, 1);
      while (h.has(s)) s = addDays(s, 1);
      add(s, '振替休日');
    }
  }
  return h;
}

export function holidayName(s) {
  const y = +s.slice(0, 4);
  if (!cache.has(y)) cache.set(y, build(y));
  return cache.get(y).get(s) || null;
}
