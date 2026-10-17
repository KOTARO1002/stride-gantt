// 日付ユーティリティ（すべて 'YYYY-MM-DD' 文字列 / UTC基準で扱う）
export const DAY = 86400000;
export const DOW_JA = ['日', '月', '火', '水', '木', '金', '土'];

export function parse(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}
export function fmt(d) {
  return d.toISOString().slice(0, 10);
}
export function ymd(y, m, d) {
  return fmt(new Date(Date.UTC(y, m - 1, d)));
}
export function idx(s) {
  return Math.round(parse(s).getTime() / DAY);
}
export function fromIdx(i) {
  return fmt(new Date(i * DAY));
}
export function addDays(s, n) {
  return fromIdx(idx(s) + n);
}
/** b - a（日数） */
export function diff(a, b) {
  return idx(b) - idx(a);
}
export function today() {
  const n = new Date();
  return ymd(n.getFullYear(), n.getMonth() + 1, n.getDate());
}
export function dow(s) {
  return parse(s).getUTCDay();
}
export function isValid(s) {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(parse(s).getTime());
}
export function minDate(a, b) {
  return a <= b ? a : b;
}
export function maxDate(a, b) {
  return a >= b ? a : b;
}
/** 表示用 "10/9(金)" */
export function short(s, withDow = true) {
  const d = parse(s);
  const t = `${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
  return withDow ? `${t}(${DOW_JA[d.getUTCDay()]})` : t;
}
/** 表示用 "2026/10/09" */
export function slash(s) {
  return s.replaceAll('-', '/');
}
export function startOfMonth(s) {
  return s.slice(0, 8) + '01';
}
export function addMonths(s, n) {
  const d = parse(s);
  return fmt(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1)));
}
/** 月曜始まりの週頭 */
export function startOfWeek(s) {
  const w = dow(s);
  return addDays(s, -((w + 6) % 7));
}
