// 入出力：ファイル保存・読込、PDF/PNG、Excel/CSV、共有URL、テキスト一括入力
import { addDays, ymd, today, isValid, fromIdx } from './dates.js';
import { uid } from './templates.js';

const LIBS = {
  html2canvas: 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  jspdf: 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  xlsx: 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
};
const loaded = {};
export function loadLib(name) {
  if (!loaded[name]) {
    loaded[name] = new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = LIBS[name];
      s.onload = res;
      s.onerror = () => {
        delete loaded[name];
        rej(new Error('ライブラリの読み込みに失敗しました（オフライン？）'));
      };
      document.head.appendChild(s);
    });
  }
  return loaded[name];
}

export function download(filename, data, type = 'application/octet-stream') {
  const blob = data instanceof Blob ? data : new Blob([data], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

export function safeName(s) {
  return (s || 'schedule').replace(/[\\/:*?"<>|]/g, '_').trim() || 'schedule';
}

export function pickFile(accept) {
  return new Promise((res) => {
    const i = document.createElement('input');
    i.type = 'file';
    i.accept = accept;
    i.onchange = () => res(i.files[0] || null);
    i.click();
  });
}

/* ---------- 画像 / PDF ---------- */
export async function captureSheet(el) {
  await loadLib('html2canvas');
  await document.fonts.ready;
  return window.html2canvas(el, { scale: 2, backgroundColor: '#ffffff', useCORS: true, logging: false });
}

export async function canvasToPdf(canvas, { paper = 'A4', orientation = 'landscape', fitOnePage = true }) {
  await loadLib('jspdf');
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ orientation, unit: 'mm', format: paper.toLowerCase() });
  const pw = pdf.internal.pageSize.getWidth();
  const ph = pdf.internal.pageSize.getHeight();
  const m = 8;
  const aw = pw - m * 2;
  const ah = ph - m * 2;
  const ratio = canvas.width / canvas.height;
  if (fitOnePage || aw / ratio <= ah) {
    let w = aw;
    let h = w / ratio;
    if (h > ah) {
      h = ah;
      w = h * ratio;
    }
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', (pw - w) / 2, m, w, h, undefined, 'FAST');
  } else {
    // 幅に合わせて複数ページに分割
    const pxPerMm = canvas.width / aw;
    const sliceH = Math.floor(ah * pxPerMm);
    for (let y = 0, page = 0; y < canvas.height; y += sliceH, page++) {
      const c = document.createElement('canvas');
      c.width = canvas.width;
      c.height = Math.min(sliceH, canvas.height - y);
      c.getContext('2d').drawImage(canvas, 0, y, c.width, c.height, 0, 0, c.width, c.height);
      if (page) pdf.addPage();
      pdf.addImage(c.toDataURL('image/png'), 'PNG', m, m, aw, c.height / pxPerMm, undefined, 'FAST');
    }
  }
  return pdf.output('blob');
}

/* ---------- 共有URL（deflate圧縮 + base64url） ---------- */
function b64url(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function unb64url(str) {
  const s = atob(str.replace(/-/g, '+').replace(/_/g, '/'));
  const b = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) b[i] = s.charCodeAt(i);
  return b;
}
async function pipe(bytes, stream) {
  const res = new Response(new Blob([bytes]).stream().pipeThrough(stream));
  return new Uint8Array(await res.arrayBuffer());
}
export async function encodeShare(state) {
  const json = new TextEncoder().encode(JSON.stringify(state));
  return b64url(await pipe(json, new CompressionStream('deflate-raw')));
}
export async function decodeShare(str) {
  const bytes = await pipe(unb64url(str), new DecompressionStream('deflate-raw'));
  return JSON.parse(new TextDecoder().decode(bytes));
}

/* ---------- 表形式（CSV / Excel） ---------- */
const TYPE_JA = { task: 'タスク', milestone: 'マイルストーン', section: '見出し' };
const HEAD = ['No', '種類', 'タスク名', '補足', '開始日', '終了日', '日数', '担当', '進捗(%)', '色', '先行タスクNo', '追加期間'];

export function toRows(state, daysOf) {
  const no = new Map(state.tasks.map((t, i) => [t.id, i + 1]));
  const rows = [HEAD];
  state.tasks.forEach((t, i) => {
    const b = t.bars[0];
    rows.push([
      i + 1,
      TYPE_JA[t.type],
      t.name,
      t.note,
      b ? b.start.replaceAll('-', '/') : '',
      b ? b.end.replaceAll('-', '/') : '',
      t.type === 'section' ? '' : daysOf(t),
      t.assignee,
      t.type === 'section' ? '' : t.progress,
      t.color,
      t.deps.map((d) => no.get(d)).filter(Boolean).join(','),
      t.bars.slice(1).map((x) => `${x.start.replaceAll('-', '/')}~${x.end.replaceAll('-', '/')}`).join(';'),
    ]);
  });
  return rows;
}

export function toCsv(rows) {
  const esc = (v) => {
    const s = String(v ?? '');
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return '﻿' + rows.map((r) => r.map(esc).join(',')).join('\r\n');
}

export function parseCsv(text) {
  text = text.replace(/^﻿/, '');
  const rows = [];
  let row = [];
  let cell = '';
  let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (c === '"') q = false;
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ',') {
      row.push(cell);
      cell = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else cell += c;
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => String(c).trim()));
}

/** Excelシリアル値・各種文字列 → 'YYYY-MM-DD' */
export function normDate(v, refYear) {
  if (v == null || v === '') return null;
  if (v instanceof Date && !isNaN(v)) return ymd(v.getFullYear(), v.getMonth() + 1, v.getDate());
  if (typeof v === 'number' && v > 20000 && v < 80000) return fromIdx(Math.round(v) - 25569);
  const s = String(v).trim().replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0));
  let m = s.match(/^(\d{4})[\/\-.年](\d{1,2})[\/\-.月](\d{1,2})/);
  if (m) return ymd(+m[1], +m[2], +m[3]);
  m = s.match(/^(\d{1,2})[\/\-.月](\d{1,2})/);
  if (m) return ymd(refYear || +today().slice(0, 4), +m[1], +m[2]);
  return null;
}

export function fromRows(rows) {
  if (!rows.length) throw new Error('データがありません');
  const head = rows[0].map((h) => String(h ?? '').trim());
  const find = (re) => head.findIndex((h) => re.test(h));
  const col = {
    no: find(/^(no|#|番号)$/i),
    type: find(/種類|種別|type/i),
    name: find(/タスク|作業|項目|工程|名称|name|task/i),
    note: find(/補足|備考|メモ|note/i),
    start: find(/開始|着手|start/i),
    end: find(/終了|完了|end|finish/i),
    days: find(/日数|期間|days|duration/i),
    assignee: find(/担当|assignee|owner/i),
    progress: find(/進捗|progress/i),
    color: find(/^色$|color/i),
    deps: find(/先行|依存|dep/i),
    extra: find(/追加期間/),
  };
  if (col.name < 0) throw new Error('「タスク名」列が見つかりません');
  const TYPE_REV = { タスク: 'task', マイルストーン: 'milestone', 見出し: 'section', task: 'task', milestone: 'milestone', section: 'section' };
  const tasks = [];
  const noMap = new Map();
  let cursor = today();
  for (const r of rows.slice(1)) {
    const name = String(r[col.name] ?? '').trim();
    if (!name) continue;
    const type = TYPE_REV[String(r[col.type] ?? '').trim()] || 'task';
    let start = normDate(r[col.start]) || cursor;
    let end = normDate(r[col.end]);
    const days = parseInt(r[col.days]);
    if (!end) end = addDays(start, Math.max(1, days || 1) - 1);
    if (end < start) [start, end] = [end, start];
    if (type === 'milestone') end = start;
    const bars = type === 'section' ? [] : [{ start, end }];
    if (col.extra >= 0 && r[col.extra]) {
      for (const seg of String(r[col.extra]).split(';')) {
        const [a, b] = seg.split('~').map((x) => normDate(x));
        if (a && b) bars.push({ start: a, end: b });
      }
    }
    const t = {
      id: uid(),
      type,
      name,
      note: col.note >= 0 ? String(r[col.note] ?? '') : '',
      bars,
      color: col.color >= 0 && /^c[1-8]$/.test(r[col.color]) ? r[col.color] : 'c1',
      progress: Math.max(0, Math.min(100, parseInt(r[col.progress]) || 0)),
      assignee: col.assignee >= 0 ? String(r[col.assignee] ?? '') : '',
      deps: [],
      collapsed: false,
      _deps: col.deps >= 0 ? String(r[col.deps] ?? '') : '',
    };
    noMap.set(String(col.no >= 0 ? r[col.no] : tasks.length + 1).trim(), t.id);
    tasks.push(t);
    if (type !== 'section') cursor = addDays(end, 1);
  }
  for (const t of tasks) {
    t.deps = t._deps
      .split(/[,、\s]+/)
      .map((n) => noMap.get(n.trim()))
      .filter((x) => x && x !== t.id);
    delete t._deps;
  }
  return tasks;
}

/* ---------- テキスト一括入力 ----------
 * 例）
 *   ■ 設計                 → 見出し
 *   現地調査 10/9           → 1日
 *   プラン打合せ 10/9-11/5  → 期間
 *   仕様決定 2週間          → 前のタスクの翌日から
 *   ◆ 契約 11/6            → マイルストーン
 *   工事 1/5〜3/31 @工務 (内装工事)
 */
export function parseText(text, baseYear) {
  const tasks = [];
  let cursor = today();
  let year = baseYear || +today().slice(0, 4);
  let lastMonth = 0;
  const DATE = String.raw`(?:(\d{4})[\/\-.年])?(\d{1,2})[\/\-.月](\d{1,2})日?`;
  const reRange = new RegExp(`${DATE}\\s*(?:-|~|〜|～|–|から)\\s*${DATE}`);
  const reOne = new RegExp(DATE);
  const toDate = (y, m, d) => {
    m = +m;
    if (y) year = +y;
    else if (lastMonth && m < lastMonth - 6) year++;
    lastMonth = m;
    return ymd(year, m, +d);
  };
  for (let raw of text.split(/\r?\n/)) {
    let line = raw.replace(/[０-９／]/g, (c) => (c === '／' ? '/' : String.fromCharCode(c.charCodeAt(0) - 0xfee0))).trim();
    if (!line) continue;
    let type = 'task';
    if (/^(#+|■|【)/.test(line)) {
      type = 'section';
      line = line.replace(/^(#+|■|【)\s*/, '').replace(/】$/, '');
    } else if (/^(◆|★|☆|◇|!)/.test(line)) {
      type = 'milestone';
      line = line.replace(/^(◆|★|☆|◇|!)\s*/, '');
    } else line = line.replace(/^[-・*●○]\s*/, '');

    let assignee = '';
    line = line.replace(/[@＠]\s*(\S+)/, (_, a) => ((assignee = a), ''));
    let note = '';
    line = line.replace(/[（(]([^）)]*)[）)]/, (_, n) => ((note = n), ''));

    let start = null;
    let end = null;
    let m = line.match(reRange);
    if (m) {
      start = toDate(m[1], m[2], m[3]);
      end = toDate(m[4], m[5], m[6]);
      line = line.replace(m[0], '');
    } else if ((m = line.match(reOne))) {
      start = toDate(m[1], m[2], m[3]);
      line = line.replace(m[0], '');
    }
    let dur = 1;
    const dm = line.match(/(\d+)\s*(日間|日|週間|週|ヶ月|か月|カ月|ヵ月)/);
    if (dm) {
      const n = +dm[1];
      dur = /週/.test(dm[2]) ? n * 7 : /月/.test(dm[2]) ? n * 30 : n;
      line = line.replace(dm[0], '');
    }
    const name = line.replace(/[,，、\t]+/g, ' ').trim() || '(無題)';
    if (type === 'section') {
      tasks.push({ id: uid(), type, name, note, bars: [], color: 'c1', progress: 0, assignee, deps: [], collapsed: false });
      continue;
    }
    if (!start) start = cursor;
    if (!end) end = addDays(start, dur - 1);
    if (end < start) end = start;
    if (type === 'milestone') end = start;
    const prev = [...tasks].reverse().find((t) => t.type !== 'section');
    tasks.push({
      id: uid(),
      type,
      name,
      note,
      bars: [{ start, end }],
      color: type === 'milestone' ? 'c5' : 'c1',
      progress: 0,
      assignee,
      deps: [],
      collapsed: false,
      _auto: !m && prev ? prev.id : null,
    });
    cursor = addDays(end, 1);
  }
  // 日付なし行は直前タスクの後続として依存線をつける
  for (const t of tasks) {
    if (t._auto) t.deps = [t._auto];
    delete t._auto;
  }
  return tasks;
}

export function validState(s) {
  return s && Array.isArray(s.tasks) && s.meta && s.settings && s.tasks.every((t) => t.id && Array.isArray(t.bars) && t.bars.every((b) => isValid(b.start) && isValid(b.end)));
}
