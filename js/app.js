import * as D from './dates.js';
import { holidayName } from './holidays.js';
import { TEMPLATES, blankState, uid } from './templates.js';
import * as IO from './io.js';
import * as F from './files.js';

/* =========================================================
 * 定数・テーマ
 * ======================================================= */
const THEMES = {
  pastel: { name: 'パステル', colors: { c1: '#8EC5FF', c2: '#7FD8B0', c3: '#FFDF7A', c4: '#FFB27A', c5: '#FF7E86', c6: '#F6A6D6', c7: '#B7A4FF', c8: '#B8C2CC' } },
  vivid: { name: 'ビビッド', colors: { c1: '#3B82F6', c2: '#10B981', c3: '#F5B30B', c4: '#F97316', c5: '#EF4444', c6: '#EC4899', c7: '#8B5CF6', c8: '#64748B' } },
  natural: { name: 'ナチュラル', colors: { c1: '#8FB3C7', c2: '#A3B48A', c3: '#E6C470', c4: '#E39B6B', c5: '#CF6A57', c6: '#D7A3A8', c7: '#A99BC4', c8: '#A8A29E' } },
  ocean: { name: 'オーシャン', colors: { c1: '#38BDF8', c2: '#2DD4BF', c3: '#A5E9F7', c4: '#0EA5E9', c5: '#F43F5E', c6: '#818CF8', c7: '#6366F1', c8: '#94A3B8' } },
  mono: { name: 'モノトーン', colors: { c1: '#4B5563', c2: '#6B7280', c3: '#9CA3AF', c4: '#374151', c5: '#111827', c6: '#CBD5E1', c7: '#1F2937', c8: '#E2E8F0' } },
};
const COLOR_KEYS = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8'];
const COLOR_NAMES = { c1: 'ブルー', c2: 'グリーン', c3: 'イエロー', c4: 'オレンジ', c5: 'レッド', c6: 'ピンク', c7: 'パープル', c8: 'グレー' };
const SURF = {
  light: { bg: '#ffffff', grid: '#eef0f4', gridStrong: '#d5dae3', sat: '#f2f6ff', sun: '#fff1f1', head: '#f8fafc', text: '#0f172a', muted: '#64748b', satText: '#2563eb', sunText: '#e11d48', today: '#f43f5e', dep: '#94a3b8', depBad: '#ef4444', sel: '#4f46e5', closure: '#94a3b8', sectionBg: '#f6f7fa', section: '#334155' },
  dark: { bg: '#15171d', grid: '#22262e', gridStrong: '#333944', sat: '#171d2b', sun: '#251a1e', head: '#1a1d24', text: '#e6e8ee', muted: '#8b93a3', satText: '#82a6ff', sunText: '#ff7d8f', today: '#fb7185', dep: '#5f6879', depBad: '#f87171', sel: '#a5b4fc', closure: '#6b7280', sectionBg: '#1b1e25', section: '#cbd5e1' },
};
const FONT = "Inter, 'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic UI', Meiryo, sans-serif";
const HEAD_H = 56;
const BASE_PPD = { day: 30, week: 11, month: 3.4 };
const PAPER = { A4: [297, 210], A3: [420, 297], B4: [364, 257] };

const ICON = {
  undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
  redo: '<path d="m15 14 5-5-5-5"/><path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  today: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><circle cx="12" cy="16" r="1.5"/>',
  template: '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
  text: '<path d="M17 6.1H3M21 12.1H3M15.1 18H3"/>',
  share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',
  print: '<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
  settings: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
  palette: '<circle cx="13.5" cy="6.5" r="1.2"/><circle cx="17.5" cy="10.5" r="1.2"/><circle cx="8.5" cy="7.5" r="1.2"/><circle cx="6.5" cy="12.5" r="1.2"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.65-.75 1.65-1.69 0-.44-.18-.84-.44-1.13-.29-.29-.44-.65-.44-1.12a1.64 1.64 0 0 1 1.67-1.67h2c3.05 0 5.55-2.5 5.55-5.55C21.97 6.01 17.46 2 12 2z"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  grip: '<circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/>',
  chev: '<path d="m6 9 6 6 6-6"/>',
  more: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  trash: '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  zoomIn: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3M11 8v6M8 11h6"/>',
  zoomOut: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3M8 11h6"/>',
  fit: '<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>',
  folder: '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
  diamond: '<path d="M12 2.5 21.5 12 12 21.5 2.5 12z"/>',
  heading: '<path d="M6 12h12M6 20V4M18 20V4"/>',
  file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21"/>',
  table: '<path d="M12 3v18"/><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  keyboard: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M7 16h10"/>',
  sparkle: '<path d="M9.94 14.06 4 12l5.94-2.06L12 4l2.06 5.94L20 12l-5.94 2.06L12 20z"/>',
  up: '<path d="m18 15-6-6-6 6"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  bar: '<rect x="3" y="5" width="10" height="4" rx="1.5"/><rect x="8" y="11" width="12" height="4" rx="1.5"/><rect x="5" y="17" width="7" height="3" rx="1.5"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  hammer: '<path d="m15 12-8.4 8.4a2.1 2.1 0 1 1-3-3L12 9"/><path d="M17.6 15 22 10.6"/><path d="m20.9 11.7-1.25-1.25a2.4 2.4 0 0 1-.7-1.7V7.9l-2.3-2.3a5.6 5.6 0 0 0-3.9-1.6H9l.9.8A6.2 6.2 0 0 1 12 9.5v1.4l2 2h2.5a2.4 2.4 0 0 1 1.7.7l1.25 1.25"/>',
  key: '<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/>',
  house: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9"/><path d="M10 21v-6h4v6"/>',
  save: '<path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"/><path d="M7 3v4a1 1 0 0 0 1 1h7"/>',
  folderOpen: '<path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"/>',
};
const icon = (k, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[k] || ''}</svg>`;

/* =========================================================
 * ユーティリティ
 * ======================================================= */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const nextFrame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
const isMac = /Mac|iPhone|iPad/.test(navigator.platform);
const MOD = isMac ? '⌘' : 'Ctrl';

function lum(hex) {
  const n = parseInt(hex.slice(1), 16);
  return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
}
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const t = amt < 0 ? 0 : 255;
  const p = Math.abs(amt);
  const ch = (v) => Math.round((t - v) * p + v);
  const r = ch((n >> 16) & 255);
  const g = ch((n >> 8) & 255);
  const b = ch(n & 255);
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
const measureCtx = document.createElement('canvas').getContext('2d');
function textW(s, size = 12, weight = 600) {
  measureCtx.font = `${weight} ${size}px ${FONT}`;
  return measureCtx.measureText(s).width;
}

const LS = {
  get(k, d) {
    try {
      const v = localStorage.getItem(k);
      return v ? JSON.parse(v) : d;
    } catch {
      return d;
    }
  },
  set(k, v) {
    try {
      localStorage.setItem(k, JSON.stringify(v));
      return true;
    } catch {
      return false;
    }
  },
  del(k) {
    try {
      localStorage.removeItem(k);
    } catch {}
  },
};

/* =========================================================
 * 状態
 * ======================================================= */
let index = LS.get('stride:index', { projects: [], current: null });
let S = null;
const ui = { selected: null, drawer: false, mode: LS.get('stride:mode', 'system'), frozenRange: null };
let exportMode = false;
let geo = null;
const undoStack = [];
const redoStack = [];
let pendingSnap = null;

const snapshot = () => JSON.stringify(S);
function pushUndo(snap = snapshot()) {
  undoStack.push(snap);
  if (undoStack.length > 200) undoStack.shift();
  redoStack.length = 0;
  updateUndoBtns();
}
function mutate(fn) {
  pushUndo();
  fn();
  scheduleSave();
  renderAll();
}
function undo() {
  if (!undoStack.length) return toast('これ以上元に戻せません');
  redoStack.push(snapshot());
  S = JSON.parse(undoStack.pop());
  scheduleSave();
  renderAll();
  updateUndoBtns();
}
function redo() {
  if (!redoStack.length) return;
  undoStack.push(snapshot());
  S = JSON.parse(redoStack.pop());
  scheduleSave();
  renderAll();
  updateUndoBtns();
}
function beginEdit() {
  if (!pendingSnap) pendingSnap = snapshot();
}
function endEdit() {
  if (pendingSnap && pendingSnap !== snapshot()) pushUndo(pendingSnap);
  pendingSnap = null;
  scheduleSave();
}

let saveTimer;
function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveNow, 250);
}
function saveNow() {
  if (!S || !index.current) return;
  const ok = LS.set('stride:p:' + index.current, S);
  const p = index.projects.find((x) => x.id === index.current);
  if (p) {
    p.name = S.meta.title || '無題';
    p.updated = Date.now();
  }
  LS.set('stride:index', index);
  renderProjName();
  scheduleFileSave();
  renderFileState();
  const st = $('#saveState');
  if (st) {
    st.textContent = ok ? '保存済み' : '保存できません';
    st.classList.toggle('err', !ok);
  }
}

function migrate(s) {
  const b = blankState();
  s.meta = { ...b.meta, ...(s.meta || {}) };
  s.settings = { ...b.settings, ...(s.settings || {}), columns: { ...b.settings.columns, ...(s.settings?.columns || {}) } };
  s.closures = Array.isArray(s.closures) ? s.closures : [];
  s.tasks = (s.tasks || []).map((t) => ({ id: uid(), type: 'task', name: '', note: '', bars: [], color: 'c1', progress: 0, assignee: '', deps: [], collapsed: false, ...t }));
  if (!THEMES[s.settings.theme]) s.settings.theme = 'pastel';
  return s;
}
function loadState(id, state) {
  S = migrate(state);
  index.current = id;
  LS.set('stride:index', index);
  undoStack.length = 0;
  redoStack.length = 0;
  ui.selected = null;
  ui.drawer = false;
  ui.frozenRange = null;
  renderAll();
  updateUndoBtns();
  requestAnimationFrame(scrollToStart);
  linkFile(id);
}
function openProject(id) {
  const s = LS.get('stride:p:' + id, null);
  if (!s) return false;
  saveNow();
  loadState(id, s);
  return true;
}
function createProject(state, { silent } = {}) {
  if (S) saveNow();
  const id = uid();
  index.projects.unshift({ id, name: state.meta.title || '無題', updated: Date.now() });
  LS.set('stride:p:' + id, state);
  loadState(id, state);
  scheduleSave();
  if (!silent) toast(`「${state.meta.title}」を作成しました`);
}
function deleteProject(id) {
  index.projects = index.projects.filter((p) => p.id !== id);
  LS.del('stride:p:' + id);
  F.delHandle('f:' + id);
  if (index.current === id) {
    index.current = null;
    if (index.projects.length) openProject(index.projects[0].id);
    else createProject(TEMPLATES.find((t) => t.id === 'blank').make(), { silent: true });
  }
  LS.set('stride:index', index);
  renderProjName();
}

/* =========================================================
 * ローカルファイルへの保存・読み込み
 * ======================================================= */
// file.handle: 現在のスケジュールに紐づくファイル（Chrome / Edge のみ）
const file = { handle: null, writing: false };
const curProj = () => index.projects.find((p) => p.id === index.current);
const stateText = () => JSON.stringify(S, null, 2);
function hash(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 0x01000193);
  return (h >>> 0).toString(36);
}
const fileDirty = () => {
  const p = curProj();
  return !p?.fileHash || p.fileHash !== hash(stateText());
};
async function linkFile(id) {
  file.handle = F.supported ? await F.getHandle('f:' + id) : null;
  if (index.current !== id) return;
  renderFileState();
}
function markFileSaved(name) {
  const p = curProj();
  if (!p) return;
  p.fileName = name;
  p.fileHash = hash(stateText());
  p.fileSaved = Date.now();
  LS.set('stride:index', index);
  renderFileState();
}
function renderFileState() {
  const b = $('#fileBtn');
  if (!b || !S) return;
  const p = curProj();
  const dirty = fileDirty();
  b.classList.toggle('dirty', !!p?.fileName && dirty);
  b.classList.toggle('linked', !!p?.fileName && !dirty);
  b.title = p?.fileName
    ? `${p.fileName}\n${dirty ? 'ファイルに保存されていない変更があります（クリックで保存）' : 'ファイルに保存済み'}`
    : `ファイルに保存 (${MOD}+S)`;
}

/** 現在のスケジュールをファイルに保存する。as=true で常に保存先を選ぶ */
async function saveToFile({ as = false } = {}) {
  saveNow();
  const base = IO.safeName(S.meta.title);
  if (!F.supported) {
    IO.download(base + F.EXT, stateText(), 'application/json');
    markFileSaved(base + F.EXT);
    return toast('ダウンロードフォルダに保存しました。「ファイルを開く」で再度読み込めます');
  }
  try {
    let h = !as && file.handle && (await F.permitted(file.handle, true)) ? file.handle : null;
    if (!h) {
      const dir = await F.getHandle('dir');
      if (dir && !as && (await F.permitted(dir, true))) {
        h = await dir.getFileHandle(await F.freeName(dir, base), { create: true });
      } else {
        h = await F.pickSave(base + F.EXT, dir || 'documents');
        if (!h) return;
      }
    }
    await F.write(h, stateText());
    file.handle = h;
    await F.setHandle('f:' + index.current, h);
    markFileSaved(h.name);
    toast(`「${h.name}」に保存しました`);
  } catch (e) {
    toast('ファイルに保存できませんでした：' + (e.message || e.name));
  }
}

// ファイルに紐づいている場合は、変更のたびに自動で上書き保存（権限があるときだけ）
let fileTimer;
function scheduleFileSave() {
  if (!file.handle || !LS.get('stride:autofile', true)) return;
  clearTimeout(fileTimer);
  const id = index.current;
  fileTimer = setTimeout(async () => {
    if (id !== index.current || !file.handle || file.writing || !fileDirty()) return;
    if (!(await F.permitted(file.handle))) return renderFileState();
    file.writing = true;
    try {
      await F.write(file.handle, stateText());
      markFileSaved(file.handle.name);
    } catch {
      renderFileState();
    } finally {
      file.writing = false;
    }
  }, 1200);
}

/** ファイルハンドルからスケジュールを開く */
async function openHandle(h) {
  const { text, name } = await F.read(h);
  let st;
  try {
    st = JSON.parse(text);
  } catch {
    throw new Error('JSONとして読み込めません');
  }
  if (!IO.validState(st)) throw new Error('Strideのデータではないようです');
  // すでに同じファイルを開いたことがあれば、そのスケジュールを最新の内容で開き直す
  for (const p of index.projects) {
    if (p.fileName !== name) continue;
    const old = await F.getHandle('f:' + p.id);
    if (old && (await old.isSameEntry(h).catch(() => false))) {
      saveNow();
      LS.set('stride:p:' + p.id, st);
      loadState(p.id, st);
      markFileSaved(name);
      return toast(`「${name}」を開きました`);
    }
  }
  createProject(migrate(st), { silent: true });
  await F.setHandle('f:' + index.current, h);
  file.handle = h;
  markFileSaved(name);
  toast(`「${name}」を開きました`);
}
async function openFromFile() {
  if (!F.supported) return importFile();
  try {
    const h = await F.pickOpen((await F.getHandle('dir')) || 'documents');
    if (h) await openHandle(h);
  } catch (e) {
    toast('開けませんでした：' + (e.message || e.name));
  }
}

/** 保存フォルダ：フォルダ内のスケジュールを一覧して開く */
async function openFolder() {
  if (!F.folderSupported) {
    return openModal({
      title: `${icon('folderOpen')}保存フォルダ`,
      body: `<p class="lead">このブラウザはフォルダへの直接保存に対応していません。<b>Chrome</b> または <b>Edge</b> で開くと、パソコンのフォルダに保存して一覧から開けるようになります。</p><p class="lead">このブラウザでは「ファイルに保存」でダウンロードフォルダに保存し、「ファイルを開く」で読み込めます。</p>`,
      foot: `<span class="spacer"></span><button class="btn primary" data-close2>閉じる</button>`,
      onMount: (m) => ($('[data-close2]', m).onclick = closeModal),
    });
  }
  const dir = await F.getHandle('dir');
  const ok = dir && (await F.permitted(dir));
  const files = ok ? await F.listFolder(dir).catch(() => []) : [];
  const fmt = (t) => new Date(t).toLocaleString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  const cur = curProj()?.fileName;
  const list = !dir
    ? `<div class="fl-empty">${icon('folder')}<p>まだ保存フォルダが選ばれていません。<br>「フォルダを選ぶ」で、パソコンの好きなフォルダ（例：ドキュメント\\工程表）を指定してください。</p></div>`
    : !ok
      ? `<div class="fl-empty">${icon('folder')}<p>フォルダ「${esc(dir.name)}」へのアクセス許可が必要です。</p><button class="btn primary" data-act="perm">アクセスを許可</button></div>`
      : files.length
        ? `<div class="fl-list">${files
            .map(
              (f, i) => `<button class="fl-item ${f.name === cur ? 'on' : ''}" data-i="${i}">${icon('file')}<span class="fl-name">${esc(f.name.replace(/(\.stride)?\.json$/i, ''))}</span><small>${fmt(f.modified)}</small>${f.name === cur ? '<em>表示中</em>' : ''}</button>`
            )
            .join('')}</div>`
        : `<div class="fl-empty">${icon('file')}<p>このフォルダにはまだスケジュールがありません。<br>下の「このフォルダに保存」で保存できます。</p></div>`;
  openModal({
    title: `${icon('folderOpen')}保存フォルダ`,
    body: `<div class="fl-dir">${icon('folder')}<span>${dir ? esc(dir.name) : '未設定'}</span><button class="btn ghost" data-act="pick">${dir ? 'フォルダを変更' : 'フォルダを選ぶ'}</button></div>${list}<p class="hint">ファイルはパソコンのフォルダに <code>.stride.json</code> として保存されます。共有フォルダ（OneDrive・Box・Google ドライブなど）を選べば、他のパソコンからも開けます。</p>`,
    foot: `<label class="chk"><input type="checkbox" id="autoFile" ${LS.get('stride:autofile', true) ? 'checked' : ''}> 保存したファイルに自動で上書き保存</label><span class="spacer"></span><button class="btn primary" data-act="save" ${dir ? '' : 'disabled'}>${icon('save')}このフォルダに保存</button>`,
    wide: true,
    onMount(m) {
      m.addEventListener('click', async (e) => {
        const b = e.target.closest('[data-act],[data-i]');
        if (!b) return;
        try {
          if (b.dataset.i != null) {
            closeModal();
            return await openHandle(files[+b.dataset.i].handle);
          }
          const act = b.dataset.act;
          if (act === 'pick') {
            const d = await F.pickFolder();
            if (!d) return;
            await F.setHandle('dir', d);
            return openFolder();
          }
          if (act === 'perm') {
            if (await F.permitted(dir, true)) openFolder();
            return;
          }
          if (act === 'save') {
            if (!(await F.permitted(dir, true))) return;
            // 表示中のファイルがこのフォルダにあればそこへ上書き、なければ新規作成
            let h = file.handle && (await dir.resolve(file.handle).catch(() => null))?.length === 1 ? file.handle : null;
            if (!h) h = await dir.getFileHandle(await F.freeName(dir, IO.safeName(S.meta.title)), { create: true });
            await F.write(h, stateText());
            file.handle = h;
            await F.setHandle('f:' + index.current, h);
            markFileSaved(h.name);
            toast(`「${h.name}」に保存しました`);
            return openFolder();
          }
        } catch (err) {
          toast('エラー：' + (err.message || err.name));
        }
      });
      $('#autoFile', m).onchange = (e) => {
        LS.set('stride:autofile', e.target.checked);
        if (e.target.checked) scheduleFileSave();
      };
    },
  });
}

/* =========================================================
 * 計算
 * ======================================================= */
const byId = (id) => S.tasks.find((t) => t.id === id);
const selTask = () => (ui.selected ? byId(ui.selected) : null);
const palette = () => (THEMES[S.settings.theme] || THEMES.pastel).colors;
const colorOf = (t) => palette()[t.color] || palette().c1;
const isDark = () => !exportMode && (ui.mode === 'dark' || (ui.mode === 'system' && matchMedia('(prefers-color-scheme: dark)').matches));
const surf = () => (isDark() ? SURF.dark : SURF.light);
const rowH = () => ({ compact: 30, normal: 40, roomy: 52 })[S.settings.density] || 40;
let exportPpd = null;
const ppd = () => exportPpd || BASE_PPD[S.settings.scale] * S.settings.zoom;

function visibleTasks() {
  const out = [];
  let hide = false;
  for (const t of S.tasks) {
    if (t.type === 'section') {
      out.push(t);
      hide = t.collapsed;
    } else if (!hide) out.push(t);
  }
  return out;
}
function sectionOf(t) {
  const i = S.tasks.indexOf(t);
  for (let j = i - 1; j >= 0; j--) if (S.tasks[j].type === 'section') return S.tasks[j];
  return null;
}
function children(sec) {
  const i = S.tasks.indexOf(sec);
  const out = [];
  for (let j = i + 1; j < S.tasks.length && S.tasks[j].type !== 'section'; j++) out.push(S.tasks[j]);
  return out;
}
function span(t) {
  const bars = t.type === 'section' ? children(t).flatMap((k) => k.bars) : t.bars;
  if (!bars.length) return null;
  let start = bars[0].start;
  let end = bars[0].end;
  for (const b of bars) {
    if (b.start < start) start = b.start;
    if (b.end > end) end = b.end;
  }
  return { start, end };
}
function projectSpan() {
  let start = null;
  let end = null;
  for (const t of S.tasks)
    for (const b of t.bars) {
      if (!start || b.start < start) start = b.start;
      if (!end || b.end > end) end = b.end;
    }
  return start ? { start, end } : null;
}
function inClosure(d) {
  return S.closures.find((c) => d >= c.start && d <= c.end) || null;
}
function isOff(d) {
  const w = D.dow(d);
  const ww = S.settings.workweek;
  if (ww === 'satsun' && (w === 0 || w === 6)) return true;
  if (ww === 'sun' && w === 0) return true;
  if (ww !== 'none' && holidayName(d)) return true;
  return !!inClosure(d);
}
function workdays(a, b) {
  let n = 0;
  for (let i = D.idx(a), e = D.idx(b); i <= e; i++) if (!isOff(D.fromIdx(i))) n++;
  return n;
}
function addWorkdays(start, n) {
  let d = start;
  let c = isOff(d) ? 0 : 1;
  let guard = 0;
  while (c < n && guard++ < 3660) {
    d = D.addDays(d, 1);
    if (!isOff(d)) c++;
  }
  return d;
}
function daysOf(t) {
  if (t.type === 'milestone') return 1;
  const work = S.settings.daysMode === 'work';
  if (t.type === 'section') {
    const sp = span(t);
    return sp ? (work ? workdays(sp.start, sp.end) : D.diff(sp.start, sp.end) + 1) : 0;
  }
  return t.bars.reduce((n, b) => n + (work ? workdays(b.start, b.end) : D.diff(b.start, b.end) + 1), 0);
}
function range() {
  if (ui.frozenRange) return ui.frozenRange;
  const s = S.settings;
  if (s.rangeMode === 'manual' && D.isValid(s.rangeStart) && D.isValid(s.rangeEnd) && s.rangeStart <= s.rangeEnd) return [s.rangeStart, s.rangeEnd];
  let sp = projectSpan();
  for (const c of S.closures) {
    if (!sp) sp = { start: c.start, end: c.end };
    sp = { start: D.minDate(sp.start, c.start), end: D.maxDate(sp.end, c.end) };
  }
  if (!sp) sp = { start: D.today(), end: D.addDays(D.today(), 30) };
  if (s.scale === 'month') return [D.startOfMonth(sp.start), D.addDays(D.addMonths(sp.end, 1), -1)];
  if (s.scale === 'week') return [D.startOfWeek(D.addDays(sp.start, -3)), D.addDays(D.startOfWeek(D.addDays(sp.end, 14)), 6)];
  return [D.addDays(sp.start, -3), D.addDays(sp.end, 10)];
}
/** sの開始として必要な最小日（pの後続） */
function needStart(p, s) {
  const sp = span(p);
  if (!sp) return null;
  return p.type === 'milestone' || s.type === 'milestone' ? sp.end : D.addDays(sp.end, 1);
}
function shiftTask(t, d) {
  if (!d) return;
  for (const b of t.bars) {
    b.start = D.addDays(b.start, d);
    b.end = D.addDays(b.end, d);
  }
}
function cascade(id, seen = new Set()) {
  if (seen.has(id)) return;
  seen.add(id);
  const p = byId(id);
  if (!p) return;
  for (const s of S.tasks) {
    if (s.type === 'section' || !s.deps.includes(id)) continue;
    const ss = span(s);
    const need = needStart(p, s);
    if (ss && need && ss.start < need) {
      shiftTask(s, D.diff(ss.start, need));
      cascade(s.id, seen);
    }
  }
}
function dependsOn(a, b, seen = new Set()) {
  if (a === b) return true;
  if (seen.has(a)) return false;
  seen.add(a);
  const t = byId(a);
  return !!t && t.deps.some((d) => dependsOn(d, b, seen));
}
function assignees() {
  return [...new Set(S.tasks.map((t) => t.assignee).filter(Boolean))];
}

/* =========================================================
 * 描画：シート全体
 * ======================================================= */
const el = {};
function renderAll() {
  if (!S) return;
  applyMode();
  renderHead();
  renderLeft();
  renderChart();
  renderLegend();
  renderDrawer();
  renderToolbar();
}

function setText(node, v) {
  if (node && document.activeElement !== node && node.textContent !== v) node.textContent = v;
}
function renderHead() {
  const m = S.meta;
  setText(el.title, m.title);
  setText(el.subtitle, m.subtitle);
  setText(el.author, m.author);
  setText(el.notes, m.notes);
  el.createdAt.textContent = D.slash(m.createdAt || D.today());
  const sp = projectSpan();
  el.span.textContent = sp ? `${D.slash(sp.start)} 〜 ${D.slash(sp.end)}（${D.diff(sp.start, sp.end) + 1}日間）` : '—';
  el.stamps.hidden = !m.showStamps;
  $('#logo').hidden = !m.showLogo;
  el.stamps.innerHTML = m.stamps.map((s) => `<div class="stamp"><div class="stamp-l">${esc(s)}</div><div class="stamp-b"></div></div>`).join('');
  document.title = `${m.title || '無題'} — Stride`;
}
function renderProjName() {
  if (el.projName && S) el.projName.textContent = S.meta.title || '無題';
}
function renderToolbar() {
  $$('#scaleSeg button').forEach((b) => b.classList.toggle('on', b.dataset.scale === S.settings.scale));
  el.zoomVal.textContent = Math.round(S.settings.zoom * 100) + '%';
  const modeIcon = { system: 'monitor', light: 'sun', dark: 'moon' }[ui.mode];
  $('#modeBtn').innerHTML = icon(modeIcon);
  renderProjName();
}
function updateUndoBtns() {
  $('#undoBtn').disabled = !undoStack.length;
  $('#redoBtn').disabled = !redoStack.length;
}
function applyMode() {
  const r = document.documentElement;
  if (ui.mode === 'system') delete r.dataset.theme;
  else r.dataset.theme = ui.mode;
  const pal = palette();
  r.style.setProperty('--c-accent-task', pal.c1);
}

/* ---------- 左ペイン（タスク表） ---------- */
function cols() {
  const c = S.settings.columns;
  const narrow = !exportMode && window.innerWidth < 720;
  const list = [
    ...(exportMode ? [] : [{ k: 'handle', w: 22, label: '' }]),
    { k: 'name', w: narrow ? 150 : S.settings.nameWidth, label: 'タスク' },
  ];
  if (narrow) return list;
  if (c.dates) list.push({ k: 'start', w: 76, label: '開始' }, { k: 'end', w: 76, label: '終了' });
  if (c.days) list.push({ k: 'days', w: 50, label: S.settings.daysMode === 'work' ? '稼働日' : '日数' });
  if (c.assignee) list.push({ k: 'assignee', w: 78, label: '担当' });
  if (c.progress) list.push({ k: 'progress', w: 64, label: '進捗' });
  return list;
}
function renderLeft() {
  const cs = cols();
  const tpl = cs.map((c) => c.w + 'px').join(' ');
  const lw = cs.reduce((a, c) => a + c.w, 0);
  el.inner.style.setProperty('--lw', lw + 'px');
  el.inner.style.setProperty('--rh', rowH() + 'px');
  el.inner.style.setProperty('--hh', HEAD_H + 'px');
  el.inner.dataset.density = S.settings.density;
  el.corner.innerHTML = `<div class="lrow lhead" style="grid-template-columns:${tpl}">${cs.map((c) => `<div class="c c-${c.k}">${c.label}</div>`).join('')}</div>`;
  const rows = visibleTasks();
  el.left.innerHTML = rows.length ? rows.map((t) => rowHtml(t, cs, tpl)).join('') : `<div class="empty-left no-export">タスクがありません。<br>「＋ タスク」で追加しましょう</div>`;
}
function rowHtml(t, cs, tpl) {
  const sp = span(t);
  const color = colorOf(t);
  const cell = (c) => {
    switch (c.k) {
      case 'handle':
        return `<div class="c c-handle no-export" draggable="true" title="ドラッグで並べ替え">${icon('grip')}</div>`;
      case 'name': {
        const lead =
          t.type === 'section'
            ? `<button class="caret ${t.collapsed ? 'closed' : ''}" data-act="toggle" title="折りたたみ">${icon('chev')}</button>`
            : t.type === 'milestone'
              ? `<span class="ms-dot" style="background:${color}"></span>`
              : `<span class="color-dot" style="background:${color}"></span>`;
        return `<div class="c c-name">${lead}<div class="nm"><div class="n" contenteditable="plaintext-only" spellcheck="false" data-f="name">${esc(t.name)}</div><div class="note" contenteditable="plaintext-only" spellcheck="false" data-f="note" data-ph="補足を追加">${esc(t.note)}</div></div><button class="row-edit no-export" data-act="edit" title="詳細を編集">${icon('more')}</button></div>`;
      }
      case 'start':
        if (!sp) return `<div class="c c-start"></div>`;
        return t.type === 'section' ? `<div class="c c-start"><span class="dt muted">${D.short(sp.start)}</span></div>` : `<div class="c c-start"><button class="dt" data-act="date" data-f="start">${D.short(sp.start)}</button></div>`;
      case 'end':
        if (!sp || t.type === 'milestone') return `<div class="c c-end"></div>`;
        return t.type === 'section' ? `<div class="c c-end"><span class="dt muted">${D.short(sp.end)}</span></div>` : `<div class="c c-end"><button class="dt" data-act="date" data-f="end">${D.short(sp.end)}</button></div>`;
      case 'days':
        if (t.type === 'milestone') return `<div class="c c-days"><span class="muted">—</span></div>`;
        if (t.type === 'section' || t.bars.length !== 1) return `<div class="c c-days"><span class="muted">${sp ? daysOf(t) : ''}</span></div>`;
        return `<div class="c c-days"><input class="days" data-f="days" inputmode="numeric" value="${daysOf(t)}" aria-label="日数"></div>`;
      case 'assignee':
        if (t.type === 'section') return `<div class="c c-assignee"></div>`;
        return `<div class="c c-assignee"><div class="as" contenteditable="plaintext-only" spellcheck="false" data-f="assignee" data-ph="—">${esc(t.assignee)}</div></div>`;
      case 'progress': {
        let p = t.progress;
        if (t.type === 'section') {
          const kids = children(t).filter((k) => k.type === 'task');
          const tot = kids.reduce((a, k) => a + daysOf(k), 0);
          p = tot ? Math.round(kids.reduce((a, k) => a + daysOf(k) * k.progress, 0) / tot) : 0;
        }
        if (t.type === 'milestone') return `<div class="c c-progress"><span class="muted">${p >= 100 ? '完了' : '—'}</span></div>`;
        return `<div class="c c-progress" data-act="edit"><span class="pg"><i style="width:${p}%;background:${t.type === 'section' ? 'var(--accent)' : color}"></i></span><span class="pgn">${p}%</span></div>`;
      }
    }
    return '';
  };
  return `<div class="lrow ${t.type}${t.type !== 'section' && sectionOf(t) ? ' child' : ''}${ui.selected === t.id ? ' sel' : ''}" data-id="${t.id}" style="grid-template-columns:${tpl}">${cs.map(cell).join('')}</div>`;
}

/* ---------- タイムライン（SVG） ---------- */
function dayKind(d) {
  const s = S.settings;
  if (s.showHolidays && holidayName(d)) return 'hol';
  const w = D.dow(d);
  if (s.showWeekends && w === 0) return 'sun';
  if (s.showWeekends && w === 6) return 'sat';
  return null;
}
function renderChart() {
  const C = surf();
  const rows = visibleTasks();
  const RH = rowH();
  const px = ppd();
  const [rs, re] = range();
  const r0 = D.idx(rs);
  const n = D.idx(re) - r0 + 1;
  const W = Math.ceil(n * px);
  const H = Math.max(rows.length, 1) * RH;
  geo = { r0, n, px, RH, rows, rowIndex: new Map(rows.map((t, i) => [t.id, i])), W, H, rs, re };
  el.inner.style.setProperty('--cw', W + 'px');
  el.head.innerHTML = headerSvg(C);
  el.chart.innerHTML = bodySvg(C);
}
const X = (dateStr) => (D.idx(dateStr) - geo.r0) * geo.px;

function headerSvg(C) {
  const { px, n, W, r0 } = geo;
  const s = S.settings;
  let o = `<svg width="${W}" height="${HEAD_H}" xmlns="http://www.w3.org/2000/svg" font-family="${FONT}" style="display:block">`;
  o += `<rect width="${W}" height="${HEAD_H}" fill="${C.head}"/>`;
  const days = Array.from({ length: n }, (_, i) => D.fromIdx(r0 + i));
  if (s.scale !== 'month' && px >= 4) {
    days.forEach((d, i) => {
      const k = dayKind(d);
      if (k) o += `<rect x="${i * px}" y="22" width="${px}" height="${HEAD_H - 22}" fill="${k === 'sat' ? C.sat : C.sun}"/>`;
    });
  }
  // 上段：月 or 年
  const groups = [];
  days.forEach((d, i) => {
    const key = s.scale === 'month' ? d.slice(0, 4) : d.slice(0, 7);
    if (!groups.length || groups.at(-1).key !== key) groups.push({ key, i, len: 0 });
    groups.at(-1).len++;
  });
  for (const g of groups) {
    const x = g.i * px;
    const w = g.len * px;
    const y = +g.key.slice(0, 4);
    const label = s.scale === 'month' ? `${y}年` : w > 80 ? `${y}年 ${+g.key.slice(5, 7)}月` : `${+g.key.slice(5, 7)}月`;
    if (g.i > 0) o += `<line x1="${x}" y1="0" x2="${x}" y2="${HEAD_H}" stroke="${C.gridStrong}"/>`;
    if (w >= textW(label, 12) + 10) o += `<text x="${x + 8}" y="15" font-size="12" font-weight="700" fill="${C.text}">${label}</text>`;
  }
  o += `<line x1="0" y1="22.5" x2="${W}" y2="22.5" stroke="${C.grid}"/>`;
  // 下段
  if (s.scale === 'day') {
    const every = px >= 16 ? 1 : 0;
    days.forEach((d, i) => {
      const x = i * px;
      const dd = +d.slice(8);
      const k = dayKind(d);
      const col = k === 'sat' ? C.satText : k ? C.sunText : C.text;
      if (every) {
        if (px >= 10 && i > 0 && dd !== 1) o += `<line x1="${x}" y1="22" x2="${x}" y2="${HEAD_H}" stroke="${C.grid}"/>`;
        const hol = holidayName(d);
        o += `<text x="${x + px / 2}" y="${px >= 20 ? 38 : 42}" font-size="11" font-weight="600" text-anchor="middle" fill="${col}">${dd}${hol ? `<title>${hol}</title>` : ''}</text>`;
        if (px >= 20) o += `<text x="${x + px / 2}" y="51" font-size="9" text-anchor="middle" fill="${k ? col : C.muted}">${D.DOW_JA[D.dow(d)]}</text>`;
      } else if (dd === 1 || dd === 11 || dd === 21) {
        if (dd !== 1) o += `<line x1="${x}" y1="22" x2="${x}" y2="${HEAD_H}" stroke="${C.grid}"/>`;
        o += `<text x="${x + 3}" y="42" font-size="10" fill="${C.muted}">${dd}</text>`;
      }
    });
  } else if (s.scale === 'week') {
    days.forEach((d, i) => {
      if (D.dow(d) !== 1) return;
      const x = i * px;
      o += `<line x1="${x}" y1="22" x2="${x}" y2="${HEAD_H}" stroke="${C.grid}"/>`;
      const label = px * 7 >= 38 ? D.short(d, false) : String(+d.slice(8));
      o += `<text x="${x + 4}" y="42" font-size="10.5" font-weight="500" fill="${C.text}">${label}</text>`;
    });
  } else {
    let i = 0;
    while (i < n) {
      const d = days[i];
      const next = D.addMonths(d, 1);
      const len = Math.min(n - i, D.diff(d, next));
      const x = i * px;
      const w = len * px;
      if (i > 0 && d.slice(5, 7) !== '01') o += `<line x1="${x}" y1="22" x2="${x}" y2="${HEAD_H}" stroke="${C.grid}"/>`;
      const label = `${+d.slice(5, 7)}月`;
      if (w >= textW(label, 11) + 6) o += `<text x="${x + w / 2}" y="42" font-size="11" font-weight="600" text-anchor="middle" fill="${C.text}">${label}</text>`;
      i += len;
    }
  }
  // 今日
  const td = D.today();
  if (s.showToday && td >= geo.rs && td <= geo.re) {
    const x = X(td) + px / 2;
    o += `<path d="M${x - 5},${HEAD_H - 6} L${x + 5},${HEAD_H - 6} L${x},${HEAD_H} Z" fill="${C.today}"/>`;
  }
  o += `<line x1="0" y1="${HEAD_H - 0.5}" x2="${W}" y2="${HEAD_H - 0.5}" stroke="${C.gridStrong}"/>`;
  return o + '</svg>';
}

function bodySvg(C) {
  const { px, n, W, H, RH, rows, r0 } = geo;
  const s = S.settings;
  const pal = palette();
  let o = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg" font-family="${FONT}" style="display:block">`;
  o += `<defs>
    <pattern id="hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="7" fill="${C.bg}"/><rect width="2.2" height="7" fill="${C.closure}" fill-opacity="0.32"/></pattern>
    <marker id="arr" viewBox="0 0 8 8" refX="7.5" refY="4" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="${C.dep}"/></marker>
    <marker id="arrBad" viewBox="0 0 8 8" refX="7.5" refY="4" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="${C.depBad}"/></marker>
  </defs>`;
  o += `<rect width="${W}" height="${H}" fill="${C.bg}" data-bg="1"/>`;
  rows.forEach((t, i) => {
    if (t.type === 'section') o += `<rect x="0" y="${i * RH}" width="${W}" height="${RH}" fill="${C.sectionBg}"/>`;
  });
  // 土日祝
  if (s.scale !== 'month' && px >= 3) {
    for (let i = 0; i < n; i++) {
      const k = dayKind(D.fromIdx(r0 + i));
      if (k) o += `<rect x="${i * px}" y="0" width="${px}" height="${H}" fill="${k === 'sat' ? C.sat : C.sun}" fill-opacity="${C === SURF.dark ? 1 : 0.85}"/>`;
    }
  }
  // 縦線
  for (let i = 0; i < n; i++) {
    const d = D.fromIdx(r0 + i);
    const x = i * px;
    if (i > 0 && d.slice(8) === '01') o += `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="${C.gridStrong}"/>`;
    else if (s.scale === 'day' && px >= 10) o += `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="${C.grid}"/>`;
    else if (s.scale === 'day' && px < 10 && (d.slice(8) === '11' || d.slice(8) === '21')) o += `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="${C.grid}"/>`;
    else if (s.scale === 'week' && D.dow(d) === 1) o += `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="${C.grid}"/>`;
  }
  // 休業期間
  for (const c of S.closures) {
    if (c.end < geo.rs || c.start > geo.re) continue;
    const a = D.maxDate(c.start, geo.rs);
    const b = D.minDate(c.end, geo.re);
    const x = X(a);
    const w = (D.diff(a, b) + 1) * px;
    o += `<rect x="${x}" y="0" width="${w}" height="${H}" fill="url(#hatch)"/>`;
    o += `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="${C.closure}" stroke-opacity=".5" stroke-dasharray="3 3"/><line x1="${x + w}" y1="0" x2="${x + w}" y2="${H}" stroke="${C.closure}" stroke-opacity=".5" stroke-dasharray="3 3"/>`;
    if (c.name && w >= 12) o += `<text x="${x + w / 2}" y="8" font-size="10.5" font-weight="600" fill="${C.muted}" writing-mode="tb" letter-spacing="2" style="writing-mode:vertical-rl">${esc(c.name)}</text>`;
  }
  // 横線
  for (let i = 1; i <= rows.length; i++) o += `<line x1="0" y1="${i * RH - 0.5}" x2="${W}" y2="${i * RH - 0.5}" stroke="${C.grid}"/>`;
  // 選択行
  if (ui.selected && geo.rowIndex.has(ui.selected) && !exportMode) o += `<rect x="0" y="${geo.rowIndex.get(ui.selected) * RH}" width="${W}" height="${RH}" fill="${C.sel}" fill-opacity="0.07"/>`;
  // 今日
  const td = D.today();
  if (s.showToday && td >= geo.rs && td <= geo.re) {
    const x = X(td) + px / 2;
    o += `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="${C.today}" stroke-width="1.5" stroke-dasharray="${exportMode ? '4 3' : '0'}"/>`;
  }
  // 依存線
  if (s.showDeps) o += depsSvg(C);
  // バー
  const fs = S.settings.density === 'compact' ? 11 : 12;
  rows.forEach((t, i) => {
    const top = i * RH;
    const cy = top + RH / 2;
    const sel = ui.selected === t.id && !exportMode;
    if (t.type === 'section') {
      const sp = span(t);
      if (!sp) return;
      const x = X(sp.start);
      const w = (D.diff(sp.start, sp.end) + 1) * px;
      o += `<g class="bar-g sec" data-tid="${t.id}"><rect data-role="group" x="${x}" y="${cy - 4}" width="${w}" height="8" rx="2" fill="${C.section}"/>`;
      o += `<path d="M${x},${cy + 4} l0,5 l6,-5 z M${x + w},${cy + 4} l0,5 l-6,-5 z" fill="${C.section}" pointer-events="none"/></g>`;
      return;
    }
    const color = pal[t.color] || pal.c1;
    if (t.type === 'milestone') {
      const b = t.bars[0];
      if (!b) return;
      const cx = X(b.start) + px / 2;
      const r = Math.min(RH * 0.3, 11);
      o += `<g class="bar-g ms" data-tid="${t.id}"><path data-role="move" d="M${cx},${cy - r} L${cx + r},${cy} L${cx},${cy + r} L${cx - r},${cy} Z" fill="${color}" stroke="${sel ? C.sel : shade(color, -0.25)}" stroke-width="${sel ? 2.5 : 1}"/>`;
      if (!exportMode) o += `<circle class="link-dot" data-role="link" cx="${cx + r + 9}" cy="${cy}" r="5" fill="${C.bg}" stroke="${C.sel}" stroke-width="1.5" opacity="0"/>`;
      if (s.labelMode !== 'none') o += `<text x="${cx + r + 6}" y="${cy + 4}" font-size="${fs}" font-weight="600" fill="${C.text}" pointer-events="none">${esc(t.name)} <tspan fill="${C.muted}" font-weight="400" font-size="${fs - 1}">${D.short(b.start)}</tspan></text>`;
      o += '</g>';
      return;
    }
    if (!t.bars.length) return;
    const bh = Math.round(RH * 0.58);
    const y = top + (RH - bh) / 2;
    const rx = Math.min(6, bh / 2);
    const txtCol = lum(color) > 0.62 ? '#1f2937' : '#ffffff';
    let label = t.name + (s.showProgress && t.progress > 0 ? `  ${t.progress}%` : '');
    const lw = textW(label, fs) + 14;
    const first = t.bars[0];
    const firstW = (D.diff(first.start, first.end) + 1) * px;
    const inside = s.labelMode === 'inside' || (s.labelMode === 'auto' && lw <= firstW);
    o += `<g class="bar-g" data-tid="${t.id}">`;
    t.bars.forEach((b, bi) => {
      const x = X(b.start);
      const w = Math.max(2, (D.diff(b.start, b.end) + 1) * px);
      o += `<rect data-role="move" data-bi="${bi}" x="${x + 0.5}" y="${y}" width="${w - 1}" height="${bh}" rx="${rx}" fill="${color}" stroke="${sel ? C.sel : shade(color, -0.18)}" stroke-width="${sel ? 2 : 0.8}"/>`;
      if (s.showProgress && t.progress > 0 && w > 10) o += `<rect x="${x + 4}" y="${y + bh - 5}" width="${Math.max(0, (w - 8) * (t.progress / 100))}" height="2.5" rx="1.25" fill="${shade(color, -0.45)}" fill-opacity=".75" pointer-events="none"/>`;
      if (!exportMode) {
        const hw = Math.min(8, w / 3);
        o += `<rect class="hdl" data-role="l" data-bi="${bi}" x="${x}" y="${y}" width="${hw}" height="${bh}" fill="transparent"/>`;
        o += `<rect class="hdl" data-role="r" data-bi="${bi}" x="${x + w - hw}" y="${y}" width="${hw}" height="${bh}" fill="transparent"/>`;
      }
    });
    if (s.labelMode !== 'none') {
      if (inside) {
        o += `<text x="${X(first.start) + 8}" y="${cy + fs * 0.36}" font-size="${fs}" font-weight="600" fill="${txtCol}" pointer-events="none">${esc(clip(label, firstW - 14, fs))}</text>`;
      } else {
        const last = t.bars.at(-1);
        const lx = X(last.start) + (D.diff(last.start, last.end) + 1) * px + 8;
        o += `<text x="${lx}" y="${cy + fs * 0.36}" font-size="${fs}" font-weight="600" fill="${C.text}" pointer-events="none">${esc(label)}</text>`;
      }
    }
    if (!exportMode) {
      const last = t.bars.at(-1);
      const ex = X(last.start) + (D.diff(last.start, last.end) + 1) * px;
      o += `<circle class="link-dot" data-role="link" cx="${ex + 8}" cy="${cy}" r="5" fill="${C.bg}" stroke="${C.sel}" stroke-width="1.5" opacity="0"/>`;
    }
    o += '</g>';
  });
  return o + '</svg>';
}
function clip(s, w, fs) {
  if (textW(s, fs) <= w) return s;
  let t = s;
  while (t.length > 1 && textW(t + '…', fs) > w) t = t.slice(0, -1);
  return t.length > 1 ? t + '…' : '';
}
function barEnds(t) {
  const { px, RH } = geo;
  const sp = span(t);
  if (!sp) return null;
  const cy = geo.rowIndex.get(t.id) * RH + RH / 2;
  if (t.type === 'milestone') {
    const cx = X(sp.start) + px / 2;
    const r = Math.min(RH * 0.3, 11);
    return { x1: cx - r, x2: cx + r, cy };
  }
  return { x1: X(sp.start), x2: X(sp.end) + px, cy };
}
function depsSvg(C) {
  let o = '';
  for (const t of geo.rows) {
    if (t.type === 'section' || !t.deps.length) continue;
    const b = barEnds(t);
    if (!b) continue;
    for (const pid of t.deps) {
      const p = byId(pid);
      if (!p || !geo.rowIndex.has(pid)) continue;
      const a = barEnds(p);
      if (!a) continue;
      const need = needStart(p, t);
      const bad = need && span(t).start < need;
      const x1 = a.x2;
      const y1 = a.cy;
      const x2 = b.x1;
      const y2 = b.cy;
      let d;
      if (x2 - x1 >= 16) {
        const mx = x1 + 8;
        d = `M${x1},${y1} H${mx} V${y2} H${x2 - 1}`;
      } else {
        const ym = y2 > y1 ? y2 - geo.RH / 2 : y2 + geo.RH / 2;
        d = `M${x1},${y1} H${x1 + 8} V${ym} H${x2 - 12} V${y2} H${x2 - 1}`;
      }
      o += `<path d="${d}" fill="none" stroke="${bad ? C.depBad : C.dep}" stroke-width="1.4" stroke-linejoin="round" marker-end="url(#${bad ? 'arrBad' : 'arr'})"${bad ? ' stroke-dasharray="4 3"' : ''}/>`;
    }
  }
  return o;
}

/* ---------- 凡例 ---------- */
function renderLegend() {
  const s = S.settings;
  const pal = palette();
  const used = new Set(S.tasks.filter((t) => t.type === 'task').map((t) => t.color));
  const items = [];
  for (const k of COLOR_KEYS) if (s.colorLabels[k] && (used.has(k) || S.tasks.some((t) => t.color === k))) items.push(`<span class="lg"><i style="background:${pal[k]}"></i>${esc(s.colorLabels[k])}</span>`);
  if (S.tasks.some((t) => t.type === 'milestone')) items.push(`<span class="lg"><i class="dia" style="background:${pal.c5}"></i>マイルストーン</span>`);
  if (S.closures.length) items.push(`<span class="lg"><i class="hatch"></i>休業期間</span>`);
  if (s.showToday) items.push(`<span class="lg"><i class="todayl"></i>今日（${D.short(D.today())}）</span>`);
  if (s.showDeps && S.tasks.some((t) => t.deps.length)) items.push(`<span class="lg"><i class="depl"></i>先行関係</span>`);
  el.legend.hidden = !s.showLegend;
  el.legend.innerHTML = items.join('') + `<button class="lg-edit no-export" data-act="legend">${icon('palette')}色の名前を設定</button>`;
}

/* =========================================================
 * 右ドロワー（タスク詳細）
 * ======================================================= */
function renderDrawer() {
  const t = selTask();
  const dr = el.drawer;
  if (!ui.drawer || !t) {
    dr.classList.remove('open');
    dr.innerHTML = '';
    return;
  }
  dr.classList.add('open');
  dr.dataset.tid = t.id;
  const pal = palette();
  const others = S.tasks.filter((x) => x.id !== t.id && x.type !== 'section');
  const seg = (v, label, ic) => `<button class="${t.type === v ? 'on' : ''}" data-act="type" data-v="${v}">${icon(ic)}${label}</button>`;
  let h = `<div class="dr-head"><div class="seg sm">${seg('task', 'タスク', 'bar')}${seg('milestone', 'マイルストーン', 'diamond')}${seg('section', '見出し', 'heading')}</div><button class="ibtn" data-act="close" title="閉じる (Esc)">${icon('x')}</button></div>`;
  h += `<div class="dr-body">`;
  h += `<label class="fld"><span>名前</span><input data-k="name" value="${esc(t.name)}" placeholder="タスク名"></label>`;
  h += `<label class="fld"><span>補足</span><input data-k="note" value="${esc(t.note)}" placeholder="例：間取り、住設・内装大枠"></label>`;
  if (t.type === 'section') {
    const kids = children(t);
    const sp = span(t);
    h += `<div class="dr-info">${kids.length}件のタスク${sp ? `／${D.slash(sp.start)} 〜 ${D.slash(sp.end)}` : ''}<br><small>見出しバーをドラッグすると配下のタスクをまとめて移動できます。</small></div>`;
  } else {
    h += `<div class="fld"><span>${t.type === 'milestone' ? '日付' : '期間'}</span>`;
    t.bars.forEach((b, i) => {
      if (t.type === 'milestone') {
        h += `<div class="period"><input type="date" data-k="bstart" data-i="${i}" value="${b.start}"><span class="muted">${D.DOW_JA[D.dow(b.start)]}曜日${holidayName(b.start) ? '・' + holidayName(b.start) : ''}</span></div>`;
      } else {
        h += `<div class="period"><input type="date" data-k="bstart" data-i="${i}" value="${b.start}"><span class="tilde">〜</span><input type="date" data-k="bend" data-i="${i}" value="${b.end}">${t.bars.length > 1 ? `<button class="ibtn sm" data-act="delbar" data-i="${i}" title="この期間を削除">${icon('x')}</button>` : ''}</div>`;
      }
    });
    if (t.type === 'task') h += `<button class="linkbtn" data-act="addbar">${icon('plus')}期間を追加（休みをはさんで分割）</button>`;
    h += `<div class="hint">${S.settings.daysMode === 'work' ? '稼働日' : '日数'}：${daysOf(t)}日${t.type === 'task' ? `（稼働日 ${t.bars.reduce((a, b) => a + workdays(b.start, b.end), 0)}日）` : ''}</div></div>`;
    h += `<div class="fld"><span>色</span><div class="swatches">${COLOR_KEYS.map((k) => `<button class="sw ${t.color === k ? 'on' : ''}" data-act="color" data-v="${k}" style="--sw:${pal[k]}" title="${esc(S.settings.colorLabels[k] || COLOR_NAMES[k])}"></button>`).join('')}</div>${S.settings.colorLabels[t.color] ? `<div class="hint">凡例：${esc(S.settings.colorLabels[t.color])}</div>` : ''}</div>`;
    if (t.type === 'task') h += `<label class="fld"><span>進捗 <b id="pgVal">${t.progress}%</b></span><input type="range" min="0" max="100" step="5" data-k="progress" value="${t.progress}"></label>`;
    h += `<label class="fld"><span>担当</span><input data-k="assignee" value="${esc(t.assignee)}" list="asList" placeholder="例：設計、工務、山田"><datalist id="asList">${assignees().map((a) => `<option value="${esc(a)}">`).join('')}</datalist></label>`;
    const deps = t.deps.map(byId).filter(Boolean);
    const cand = others.filter((x) => !t.deps.includes(x.id) && !dependsOn(x.id, t.id));
    h += `<div class="fld"><span>先行タスク</span><div class="chips">${deps.map((d) => `<span class="chip">${esc(d.name)}<button data-act="deldep" data-v="${d.id}" title="解除">${icon('x')}</button></span>`).join('') || '<span class="muted sm">なし</span>'}</div>`;
    if (cand.length) h += `<select data-k="adddep"><option value="">＋ 先行タスクを追加…</option>${cand.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select>`;
    h += `<div class="hint">バー右端の ○ を別のバーへドラッグしても設定できます。</div></div>`;
  }
  h += `</div><div class="dr-foot"><button class="btn ghost" data-act="up" title="上へ (Alt+↑)">${icon('up')}</button><button class="btn ghost" data-act="down" title="下へ (Alt+↓)">${icon('down')}</button><button class="btn ghost" data-act="dup">${icon('copy')}複製</button><span class="spacer"></span><button class="btn danger" data-act="del">${icon('trash')}削除</button></div>`;
  dr.innerHTML = h;
}

/* =========================================================
 * 操作
 * ======================================================= */
function select(id, { open } = {}) {
  ui.selected = id;
  if (open !== undefined) ui.drawer = open;
  if (!id) ui.drawer = false;
  $$('.lrow.sel', el.left).forEach((r) => r.classList.remove('sel'));
  if (id) $(`.lrow[data-id="${id}"]`, el.left)?.classList.add('sel');
  renderChart();
  renderDrawer();
}
function addTask(type = 'task') {
  let newId;
  mutate(() => {
    const sel = selTask();
    let at = S.tasks.length;
    let start = D.today();
    let color = type === 'milestone' ? 'c5' : 'c1';
    let assignee = '';
    if (sel) {
      at = S.tasks.indexOf(sel) + 1;
      if (sel.type === 'section' && sel.collapsed) {
        at = S.tasks.indexOf(sel) + 1 + children(sel).length;
      }
      const sp = span(sel);
      if (sp) start = sel.type === 'section' ? (sel.collapsed ? D.addDays(sp.end, 1) : sp.start) : D.addDays(sp.end, 1);
      if (sel.type === 'task' && type === 'task') color = sel.color;
      assignee = sel.assignee || '';
    } else {
      const sp = projectSpan();
      if (sp) start = D.addDays(sp.end, 1);
    }
    const len = type === 'task' ? 5 : 1;
    const t = {
      id: uid(),
      type,
      name: { task: '新しいタスク', milestone: 'マイルストーン', section: '新しい見出し' }[type],
      note: '',
      bars: type === 'section' ? [] : [{ start, end: D.addDays(start, len - 1) }],
      color,
      progress: 0,
      assignee: type === 'section' ? '' : assignee,
      deps: [],
      collapsed: false,
    };
    S.tasks.splice(at, 0, t);
    ui.selected = newId = t.id;
  });
  requestAnimationFrame(() => {
    const n = $(`.lrow[data-id="${newId}"] .n`, el.left);
    if (!n) return;
    n.scrollIntoView({ block: 'nearest' });
    n.focus();
    const r = document.createRange();
    r.selectNodeContents(n);
    getSelection().removeAllRanges();
    getSelection().addRange(r);
  });
}
function deleteTask(id = ui.selected) {
  const t = byId(id);
  if (!t) return;
  mutate(() => {
    const i = S.tasks.indexOf(t);
    S.tasks.splice(i, 1);
    for (const x of S.tasks) x.deps = x.deps.filter((d) => d !== id);
    const vis = visibleTasks();
    ui.selected = vis[Math.min(i, vis.length - 1)]?.id || null;
    if (!ui.selected) ui.drawer = false;
  });
  toast(`「${t.name}」を削除しました`, { label: '元に戻す', fn: undo });
}
function duplicateTask(id = ui.selected) {
  const t = byId(id);
  if (!t) return;
  mutate(() => {
    const c = JSON.parse(JSON.stringify(t));
    c.id = uid();
    c.name = t.name + '（コピー）';
    S.tasks.splice(S.tasks.indexOf(t) + 1, 0, c);
    ui.selected = c.id;
  });
}
function moveTask(id, dir) {
  const t = byId(id);
  if (!t) return;
  const i = S.tasks.indexOf(t);
  const j = i + dir;
  if (j < 0 || j >= S.tasks.length) return;
  mutate(() => {
    [S.tasks[i], S.tasks[j]] = [S.tasks[j], S.tasks[i]];
  });
}
function shiftSelected(d) {
  const t = selTask();
  if (!t) return;
  mutate(() => {
    const list = t.type === 'section' ? children(t) : [t];
    for (const x of list) shiftTask(x, d);
    if (S.settings.autoShift) for (const x of list) cascade(x.id);
  });
}
function setScale(sc) {
  if (S.settings.scale === sc) return;
  const center = centerDate();
  S.settings.scale = sc;
  S.settings.zoom = 1;
  scheduleSave();
  renderAll();
  scrollToDate(center);
}
function setZoom(z, anchorDate) {
  const center = anchorDate || centerDate();
  S.settings.zoom = clamp(Math.round(z * 100) / 100, 0.25, 4);
  scheduleSave();
  renderChart();
  renderToolbar();
  scrollToDate(center);
}
function fitWidth() {
  const avail = el.board.clientWidth - parseFloat(el.inner.style.getPropertyValue('--lw')) - 4;
  setZoom(avail / (geo.n * BASE_PPD[S.settings.scale]));
  el.board.scrollLeft = 0;
}
function centerDate() {
  if (!geo) return D.today();
  const lw = parseFloat(el.inner.style.getPropertyValue('--lw')) || 0;
  const x = el.board.scrollLeft + (el.board.clientWidth - lw) / 2;
  return D.fromIdx(geo.r0 + Math.floor(x / geo.px));
}
function scrollToDate(d, frac = 0.5) {
  const lw = parseFloat(el.inner.style.getPropertyValue('--lw')) || 0;
  el.board.scrollLeft = Math.max(0, X(d) - (el.board.clientWidth - lw) * frac);
}
function scrollToStart() {
  el.board.scrollLeft = 0;
  el.board.scrollTop = 0;
}
function goToday() {
  const td = D.today();
  if (td < geo.rs || td > geo.re) return toast('今日は表示期間の外です');
  scrollToDate(td, 0.3);
}
function setMode(m) {
  ui.mode = m;
  LS.set('stride:mode', m);
  renderAll();
}
function cycleMode() {
  setMode({ system: 'light', light: 'dark', dark: 'system' }[ui.mode]);
  toast({ system: 'システム設定に合わせます', light: 'ライトモード', dark: 'ダークモード' }[ui.mode]);
}

/* ---------- 日付ピッカー ---------- */
function pickDate(anchor, value, onPick) {
  $('.ghost-date')?.remove();
  const r = anchor.getBoundingClientRect();
  const i = document.createElement('input');
  i.type = 'date';
  i.value = value;
  i.className = 'ghost-date';
  i.style.left = r.left + 'px';
  i.style.top = r.bottom + 'px';
  document.body.appendChild(i);
  const done = () => setTimeout(() => i.remove(), 100);
  i.addEventListener('change', () => {
    if (D.isValid(i.value)) onPick(i.value);
    done();
  });
  i.addEventListener('blur', done);
  try {
    i.showPicker();
  } catch {
    i.style.opacity = 1;
    i.focus();
  }
}
function setStart(t, v) {
  const sp = span(t);
  if (!sp) return;
  shiftTask(t, D.diff(sp.start, v));
  if (t.type === 'milestone') t.bars[0].end = t.bars[0].start;
  if (S.settings.autoShift) cascade(t.id);
}
function setEnd(t, v) {
  const b = t.bars.at(-1);
  if (!b) return;
  b.end = D.maxDate(v, b.start);
  if (S.settings.autoShift) cascade(t.id);
}

/* =========================================================
 * 左ペインのイベント
 * ======================================================= */
function bindLeft() {
  const L = el.left;
  L.addEventListener('focusin', (e) => {
    if (e.target.closest('[data-f]')) {
      beginEdit();
      const row = e.target.closest('.lrow');
      if (row && ui.selected !== row.dataset.id) select(row.dataset.id);
    }
  });
  L.addEventListener('input', (e) => {
    const f = e.target.dataset.f;
    const row = e.target.closest('.lrow');
    if (!f || !row) return;
    const t = byId(row.dataset.id);
    if (['name', 'note', 'assignee'].includes(f)) {
      t[f] = e.target.textContent.replace(/\n/g, ' ');
      renderChart();
      const di = $(`[data-k="${f}"]`, el.drawer);
      if (di) di.value = t[f];
    }
  });
  L.addEventListener('change', (e) => {
    if (e.target.dataset.f !== 'days') return;
    const t = byId(e.target.closest('.lrow').dataset.id);
    const n = parseInt(e.target.value.replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0)));
    if (n > 0 && t.bars.length === 1) {
      const b = t.bars[0];
      b.end = S.settings.daysMode === 'work' ? addWorkdays(b.start, n) : D.addDays(b.start, n - 1);
      if (S.settings.autoShift) cascade(t.id);
    }
    endEdit();
    renderAll();
  });
  L.addEventListener('focusout', (e) => {
    if (!e.target.closest('[data-f]')) return;
    if (e.target.dataset.f === 'days') return;
    endEdit();
    renderLegend();
    renderHead();
  });
  L.addEventListener('keydown', (e) => {
    const f = e.target.dataset?.f;
    if (!f) return;
    if (e.key === 'Enter' && !e.isComposing) {
      e.preventDefault();
      e.target.blur();
      if (f === 'name' && (e.metaKey || e.ctrlKey)) addTask();
    } else if (e.key === 'Escape') e.target.blur();
    else if (e.key === 'Tab' && f === 'name' && !e.shiftKey) {
      // Tabで補足へ
      const note = e.target.closest('.lrow').querySelector('.note');
      if (note) {
        e.preventDefault();
        note.focus();
      }
    }
  });
  L.addEventListener('click', (e) => {
    const row = e.target.closest('.lrow');
    if (!row) return;
    const t = byId(row.dataset.id);
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act === 'toggle') {
      mutate(() => (t.collapsed = !t.collapsed));
    } else if (act === 'edit') {
      select(t.id, { open: true });
    } else if (act === 'date') {
      const btn = e.target.closest('[data-act]');
      const f = btn.dataset.f;
      const sp = span(t);
      select(t.id);
      pickDate(btn, f === 'start' ? sp.start : sp.end, (v) => mutate(() => (f === 'start' ? setStart(t, v) : setEnd(t, v))));
    } else if (!e.target.closest('[data-f]')) {
      select(t.id);
    }
  });
  L.addEventListener('dblclick', (e) => {
    const row = e.target.closest('.lrow');
    if (row && !e.target.closest('[data-f]')) select(row.dataset.id, { open: true });
  });
  // 並べ替え（ドラッグ＆ドロップ）
  let dragId = null;
  L.addEventListener('dragstart', (e) => {
    const row = e.target.closest('.lrow');
    if (!row || !e.target.closest('.c-handle')) return e.preventDefault();
    dragId = row.dataset.id;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', dragId);
    e.dataTransfer.setDragImage(row, 20, rowH() / 2);
    row.classList.add('dragging');
  });
  const clearDrop = () => $$('.drop-before,.drop-after', L).forEach((r) => r.classList.remove('drop-before', 'drop-after'));
  L.addEventListener('dragover', (e) => {
    if (!dragId) return;
    e.preventDefault();
    const row = e.target.closest('.lrow');
    clearDrop();
    if (!row || row.dataset.id === dragId) return;
    const r = row.getBoundingClientRect();
    row.classList.add(e.clientY < r.top + r.height / 2 ? 'drop-before' : 'drop-after');
  });
  L.addEventListener('drop', (e) => {
    e.preventDefault();
    const row = $('.drop-before,.drop-after', L);
    const id = dragId;
    dragId = null;
    if (!row || !id) return clearDrop();
    const before = row.classList.contains('drop-before');
    const targetId = row.dataset.id;
    clearDrop();
    mutate(() => {
      const t = byId(id);
      const block = t.type === 'section' && t.collapsed ? [t, ...children(t)] : [t];
      S.tasks = S.tasks.filter((x) => !block.includes(x));
      const target = byId(targetId);
      let at = S.tasks.indexOf(target);
      if (!before) at += target.type === 'section' && target.collapsed ? 1 + children(target).length : 1;
      S.tasks.splice(at, 0, ...block);
    });
  });
  L.addEventListener('dragend', () => {
    dragId = null;
    clearDrop();
    $$('.dragging', L).forEach((r) => r.classList.remove('dragging'));
  });
}

/* =========================================================
 * チャート上のドラッグ操作
 * ======================================================= */
let drag = null;
function dayAt(clientX) {
  const svg = el.chart.firstElementChild;
  const r = svg.getBoundingClientRect();
  return geo.r0 + Math.floor((clientX - r.left) / geo.px);
}
function rowAt(clientY) {
  const r = el.chart.firstElementChild.getBoundingClientRect();
  return geo.rows[Math.floor((clientY - r.top) / geo.RH)] || null;
}
function bindChart() {
  const C = el.chart;
  C.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    const g = e.target.closest('[data-tid]');
    const role = e.target.dataset?.role;
    if (!g || !role) {
      const t = rowAt(e.clientY);
      if (t) select(t.id);
      return;
    }
    const t = byId(g.dataset.tid);
    if (ui.selected !== t.id) {
      ui.selected = t.id;
      $$('.lrow.sel', el.left).forEach((r) => r.classList.remove('sel'));
      $(`.lrow[data-id="${t.id}"]`, el.left)?.classList.add('sel');
    }
    e.preventDefault();
    C.setPointerCapture(e.pointerId);
    drag = { role, tid: t.id, bi: +(e.target.dataset.bi || 0), x0: e.clientX, y0: e.clientY, snap: snapshot(), orig: JSON.stringify(S.tasks), moved: false, last: 0 };
    ui.frozenRange = range();
    if (role === 'link') {
      drag.line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      drag.line.setAttribute('class', 'link-line');
      C.firstElementChild.appendChild(drag.line);
    }
    hideTip();
  });
  C.addEventListener('pointermove', (e) => {
    if (!drag) return showTipFor(e);
    if (drag.role === 'link') {
      const svg = C.firstElementChild;
      const r = svg.getBoundingClientRect();
      const a = barEnds(byId(drag.tid));
      drag.line.setAttribute('d', `M${a.x2},${a.cy} L${e.clientX - r.left},${e.clientY - r.top}`);
      drag.moved = true;
      return;
    }
    const dx = Math.round((e.clientX - drag.x0) / geo.px);
    if (dx === drag.last && drag.moved) return;
    if (!drag.moved && Math.abs(e.clientX - drag.x0) < 3) return;
    drag.moved = true;
    drag.last = dx;
    S.tasks = JSON.parse(drag.orig);
    const t = byId(drag.tid);
    if (drag.role === 'group') {
      for (const k of children(t)) shiftTask(k, dx);
      if (S.settings.autoShift) for (const k of children(t)) cascade(k.id);
    } else {
      const b = t.bars[drag.bi];
      if (drag.role === 'move' || t.type === 'milestone') {
        b.start = D.addDays(b.start, dx);
        b.end = D.addDays(b.end, dx);
      } else if (drag.role === 'l') b.start = D.minDate(D.addDays(b.start, dx), b.end);
      else if (drag.role === 'r') b.end = D.maxDate(D.addDays(b.end, dx), b.start);
      t.bars.sort((p, q) => (p.start < q.start ? -1 : 1));
      if (S.settings.autoShift) cascade(t.id);
    }
    renderChart();
    const sp = span(t);
    if (sp) showTip(e.clientX, e.clientY, `<b>${esc(t.name)}</b><br>${D.short(sp.start)} 〜 ${D.short(sp.end)}　${dx > 0 ? '+' : ''}${dx}日`);
  });
  const end = (e) => {
    if (!drag) return;
    const d = drag;
    drag = null;
    ui.frozenRange = null;
    hideTip();
    if (d.role === 'link') {
      d.line.remove();
      const g = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-tid]');
      if (g && g.dataset.tid !== d.tid) {
        const target = byId(g.dataset.tid);
        if (target.type === 'section') return toast('見出しには依存関係を設定できません');
        if (target.deps.includes(d.tid)) return toast('すでに設定されています');
        if (dependsOn(d.tid, target.id)) return toast('循環する依存関係は設定できません');
        mutate(() => {
          target.deps.push(d.tid);
          if (S.settings.autoShift) cascade(d.tid);
        });
        toast(`「${byId(d.tid).name}」→「${target.name}」をつなぎました`);
      } else renderChart();
      return;
    }
    if (d.moved) {
      if (d.snap !== snapshot()) pushUndo(d.snap);
      scheduleSave();
      renderAll();
    } else {
      select(d.tid, { open: true });
    }
  };
  C.addEventListener('pointerup', end);
  C.addEventListener('pointercancel', end);
  C.addEventListener('pointerleave', () => !drag && hideTip());
  C.addEventListener('dblclick', (e) => {
    if (e.target.closest('[data-tid]')) return;
    const t = rowAt(e.clientY);
    if (!t || t.type !== 'task') return;
    const d = D.fromIdx(dayAt(e.clientX));
    mutate(() => {
      t.bars.push({ start: d, end: D.addDays(d, 2) });
      t.bars.sort((p, q) => (p.start < q.start ? -1 : 1));
      ui.selected = t.id;
    });
    toast('期間を追加しました（分割バー）');
  });
  // Ctrl/⌘ + ホイールでズーム
  el.board.addEventListener(
    'wheel',
    (e) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      const anchor = e.target.closest('#chart,#tlHead') ? D.fromIdx(dayAt(e.clientX)) : undefined;
      setZoom(S.settings.zoom * (e.deltaY < 0 ? 1.12 : 1 / 1.12), anchor);
    },
    { passive: false }
  );
}

/* ---------- ツールチップ ---------- */
function showTip(x, y, html) {
  const tp = el.tip;
  tp.innerHTML = html;
  tp.hidden = false;
  const w = tp.offsetWidth;
  tp.style.left = Math.min(x + 14, innerWidth - w - 8) + 'px';
  tp.style.top = y + 18 + 'px';
}
function hideTip() {
  el.tip.hidden = true;
}
function showTipFor(e) {
  const g = e.target.closest('[data-tid]');
  if (!g) {
    const k = e.target.closest('#chart') && geo ? D.fromIdx(dayAt(e.clientX)) : null;
    const c = k && inClosure(k);
    if (c) return showTip(e.clientX, e.clientY, `<b>${esc(c.name)}</b><br>${D.short(c.start)} 〜 ${D.short(c.end)}`);
    return hideTip();
  }
  const t = byId(g.dataset.tid);
  const sp = span(t);
  if (!sp) return hideTip();
  let h = `<b>${esc(t.name)}</b>${t.note ? `<span class="tip-note">${esc(t.note)}</span>` : ''}<br>`;
  if (t.type === 'milestone') h += `${D.short(sp.start)}${holidayName(sp.start) ? `（${holidayName(sp.start)}）` : ''}`;
  else {
    h += `${D.short(sp.start)} 〜 ${D.short(sp.end)}　${daysOf(t)}日`;
    if (t.type === 'task') h += `<span class="tip-sub">稼働日 ${t.bars.reduce((a, b) => a + workdays(b.start, b.end), 0)}日${t.progress ? `・進捗 ${t.progress}%` : ''}${t.assignee ? `・${esc(t.assignee)}` : ''}</span>`;
  }
  showTip(e.clientX, e.clientY, h);
}

/* =========================================================
 * ドロワーのイベント
 * ======================================================= */
function bindDrawer() {
  const dr = el.drawer;
  dr.addEventListener('focusin', (e) => e.target.dataset.k && beginEdit());
  dr.addEventListener('input', (e) => {
    const k = e.target.dataset.k;
    const t = selTask();
    if (!k || !t) return;
    const v = e.target.value;
    if (k === 'name' || k === 'note' || k === 'assignee') t[k] = v;
    else if (k === 'progress') {
      t.progress = +v;
      $('#pgVal').textContent = v + '%';
    } else if (k === 'bstart' || k === 'bend') {
      if (!D.isValid(v)) return;
      const b = t.bars[+e.target.dataset.i];
      if (k === 'bstart') {
        const len = D.diff(b.start, b.end);
        b.start = v;
        b.end = t.type === 'milestone' ? v : D.addDays(v, len);
      } else b.end = D.maxDate(v, b.start);
      if (S.settings.autoShift) cascade(t.id);
    } else return;
    renderLeft();
    renderChart();
  });
  dr.addEventListener('change', (e) => {
    const k = e.target.dataset.k;
    const t = selTask();
    if (k === 'adddep' && e.target.value) {
      mutate(() => {
        t.deps.push(e.target.value);
        if (S.settings.autoShift) cascade(e.target.value);
      });
      return;
    }
    endEdit();
    if (k === 'bstart' || k === 'bend') renderAll();
    else {
      renderLegend();
      renderHead();
    }
  });
  dr.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]');
    const t = selTask();
    if (!b || !t) return;
    const act = b.dataset.act;
    const v = b.dataset.v;
    if (act === 'close') return select(ui.selected, { open: false });
    if (act === 'type')
      return mutate(() => {
        if (t.type === v) return;
        const sp = span(t);
        t.type = v;
        if (v === 'section') {
          t.bars = [];
          t.deps = [];
          for (const x of S.tasks) x.deps = x.deps.filter((d) => d !== t.id);
        } else {
          const st = sp?.start || D.today();
          if (v === 'milestone') {
            t.bars = [{ start: st, end: st }];
            if (t.color === 'c1') t.color = 'c5';
          } else t.bars = t.bars.length && sp ? [{ start: sp.start, end: sp.end }] : [{ start: st, end: D.addDays(st, 4) }];
        }
      });
    if (act === 'color') return mutate(() => (t.color = v));
    if (act === 'addbar')
      return mutate(() => {
        const last = t.bars.at(-1);
        const s0 = D.addDays(last.end, 3);
        t.bars.push({ start: s0, end: D.addDays(s0, D.diff(last.start, last.end)) });
      });
    if (act === 'delbar') return mutate(() => t.bars.splice(+b.dataset.i, 1));
    if (act === 'deldep') return mutate(() => (t.deps = t.deps.filter((d) => d !== v)));
    if (act === 'up') return moveTask(t.id, -1);
    if (act === 'down') return moveTask(t.id, 1);
    if (act === 'dup') return duplicateTask(t.id);
    if (act === 'del') return deleteTask(t.id);
  });
  dr.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.tagName === 'INPUT' && !e.isComposing) e.target.blur();
  });
}

/* =========================================================
 * モーダル・メニュー・トースト
 * ======================================================= */
function openModal({ title, body, wide, foot = '', onMount, cls = '' }) {
  closeModal();
  const root = $('#modalRoot');
  root.innerHTML = `<div class="backdrop"></div><div class="modal ${wide ? 'wide' : ''} ${cls}" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="m-head"><h2>${title}</h2><button class="ibtn" data-close title="閉じる (Esc)">${icon('x')}</button></div><div class="m-body">${body}</div>${foot ? `<div class="m-foot">${foot}</div>` : ''}</div>`;
  root.classList.add('open');
  const m = $('.modal', root);
  $('.backdrop', root).onclick = closeModal;
  $('[data-close]', m).onclick = closeModal;
  onMount?.(m);
  setTimeout(() => ($('[autofocus]', m) || m.querySelector('input,textarea,button:not([data-close])'))?.focus(), 30);
  return m;
}
function closeModal() {
  const root = $('#modalRoot');
  if (!root.classList.contains('open')) return false;
  root.classList.remove('open');
  root.innerHTML = '';
  return true;
}
function openMenu(anchor, items, { align = 'left' } = {}) {
  closeMenu();
  const root = $('#menuRoot');
  root.innerHTML = `<div class="menu" role="menu">${items
    .map((it, i) => (it.sep ? `<div class="m-sep">${it.label ? `<span>${it.label}</span>` : ''}</div>` : `<button role="menuitem" data-i="${i}" class="${it.danger ? 'danger' : ''} ${it.on ? 'on' : ''}">${it.icon ? icon(it.icon) : it.swatch || ''}<span class="m-l">${it.label}</span>${it.kbd ? `<kbd>${it.kbd}</kbd>` : ''}${it.sub ? `<small>${it.sub}</small>` : ''}</button>`))
    .join('')}</div>`;
  const m = $('.menu', root);
  const r = anchor.getBoundingClientRect();
  root.classList.add('open');
  const w = m.offsetWidth;
  m.style.top = r.bottom + 6 + 'px';
  m.style.left = clamp(align === 'right' ? r.right - w : r.left, 8, innerWidth - w - 8) + 'px';
  m.addEventListener('click', (e) => {
    const b = e.target.closest('[data-i]');
    if (!b) return;
    closeMenu();
    items[+b.dataset.i].fn?.();
  });
  setTimeout(() => document.addEventListener('pointerdown', outside, true), 0);
  function outside(e) {
    if (!m.contains(e.target)) {
      closeMenu();
      document.removeEventListener('pointerdown', outside, true);
    }
  }
}
function closeMenu() {
  const root = $('#menuRoot');
  if (!root.classList.contains('open')) return false;
  root.classList.remove('open');
  root.innerHTML = '';
  return true;
}
let toastTimer;
function toast(msg, action) {
  const t = el.toast;
  t.innerHTML = `<span>${esc(msg)}</span>${action ? `<button>${action.label}</button>` : ''}`;
  t.classList.add('show');
  if (action) $('button', t).onclick = () => {
    action.fn();
    t.classList.remove('show');
  };
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), action ? 6000 : 2600);
}

/* =========================================================
 * 各種モーダル
 * ======================================================= */
function openTemplates() {
  const base = D.startOfWeek(D.addDays(D.today(), 7));
  openModal({
    title: '新しいスケジュール',
    wide: true,
    body: `<p class="lead">テンプレートを選ぶと、日付を自動で割り付けたチャートが作成されます。あとから自由に編集できます。</p>
      <label class="fld inline"><span>開始日</span><input type="date" id="tplBase" value="${base}"></label>
      <div class="tpl-grid">${TEMPLATES.map((t) => `<button class="tpl" data-id="${t.id}"><span class="tpl-emoji">${icon(t.icon)}</span><b>${t.name}</b><small>${t.desc}</small></button>`).join('')}</div>`,
    onMount(m) {
      m.addEventListener('click', (e) => {
        const b = e.target.closest('.tpl');
        if (!b) return;
        const v = $('#tplBase', m).value;
        const st = TEMPLATES.find((t) => t.id === b.dataset.id).make(D.isValid(v) ? v : base);
        closeModal();
        createProject(st);
      });
    },
  });
}

function openBulk() {
  const ph = `■ 設計\n現地調査 10/9\nプラン打合せ 10/9-11/5 (間取り) @設計\n仕様決定 2週間\n◆ 工事請負契約 11/12\n■ 工事\n着工準備 11/13〜11/30\n工事 2026/12/1-2027/3/15 @工務\n◆ 竣工 3/20`;
  openModal({
    title: `${icon('sparkle')} テキストから一括作成`,
    wide: true,
    body: `<p class="lead">1行に1タスク。日付・期間・担当・補足を書くと自動で読み取ります。Excelやメモからの貼り付けもOK。</p>
      <div class="bulk">
        <textarea id="bulkText" spellcheck="false" placeholder="${esc(ph)}" autofocus></textarea>
        <div class="bulk-help">
          <h4>書き方</h4>
          <ul>
            <li><code>■</code> <code>#</code> で始まる行 → 見出し</li>
            <li><code>◆</code> <code>★</code> で始まる行 → マイルストーン</li>
            <li><code>10/9-11/5</code> <code>2026/12/1〜2027/3/15</code> → 期間</li>
            <li><code>10/9</code> だけ → 1日</li>
            <li><code>2週間</code> <code>5日</code> → 前のタスクの翌日から</li>
            <li><code>@担当</code> <code>(補足)</code></li>
          </ul>
          <div id="bulkPrev" class="bulk-prev"></div>
        </div>
      </div>`,
    foot: `<button class="btn ghost" id="bulkSample">例を入れる</button><span class="spacer"></span><button class="btn" id="bulkReplace">置き換えて作成</button><button class="btn primary" id="bulkAdd">${icon('plus')}末尾に追加</button>`,
    onMount(m) {
      const ta = $('#bulkText', m);
      const prev = () => {
        const tasks = IO.parseText(ta.value);
        $('#bulkPrev', m).innerHTML = tasks.length ? `<b>${tasks.length}件</b>を読み取りました<ol>${tasks.slice(0, 8).map((t) => `<li>${t.type === 'section' ? '■ ' : t.type === 'milestone' ? '◆ ' : ''}${esc(t.name)}${t.bars[0] ? ` <small>${D.short(t.bars[0].start, false)}${t.bars[0].end !== t.bars[0].start ? '–' + D.short(t.bars[0].end, false) : ''}</small>` : ''}</li>`).join('')}${tasks.length > 8 ? '<li>…</li>' : ''}</ol>` : '';
      };
      ta.addEventListener('input', prev);
      $('#bulkSample', m).onclick = () => {
        ta.value = ph;
        prev();
      };
      const apply = (replace) => {
        const tasks = IO.parseText(ta.value);
        if (!tasks.length) return toast('タスクを1行以上入力してください');
        mutate(() => {
          if (replace) S.tasks = tasks;
          else S.tasks.push(...tasks);
          ui.selected = null;
        });
        closeModal();
        toast(`${tasks.length}件のタスクを追加しました`, { label: '元に戻す', fn: undo });
        requestAnimationFrame(scrollToStart);
      };
      $('#bulkAdd', m).onclick = () => apply(false);
      $('#bulkReplace', m).onclick = () => apply(true);
    },
  });
}

async function openShare() {
  let url;
  try {
    url = `${location.origin}${location.pathname}#s=${await IO.encodeShare(S)}`;
  } catch {
    return toast('このブラウザでは共有リンクを作成できません');
  }
  openModal({
    title: `${icon('link')} 共有リンク`,
    body: `<p class="lead">このリンクを開くと、相手のブラウザにこのチャートのコピーが読み込まれます。<b>データはリンク自体に含まれ、サーバーには保存されません。</b></p>
      <div class="share-row"><input id="shareUrl" readonly value="${esc(url)}"><button class="btn primary" id="copyUrl">${icon('copy')}コピー</button></div>
      <p class="hint">${url.length.toLocaleString()}文字。チャートを編集した場合は、リンクを作り直してください。</p>
      ${navigator.share ? `<button class="btn" id="nativeShare">${icon('share')}ほかのアプリで共有</button>` : ''}`,
    onMount(m) {
      $('#shareUrl', m).onclick = (e) => e.target.select();
      $('#copyUrl', m).onclick = async () => {
        try {
          await navigator.clipboard.writeText(url);
          toast('リンクをコピーしました');
        } catch {
          $('#shareUrl', m).select();
          toast('選択されたリンクをコピーしてください');
        }
      };
      const ns = $('#nativeShare', m);
      if (ns) ns.onclick = () => navigator.share({ title: S.meta.title, url }).catch(() => {});
    },
  });
}

function openSettings() {
  const s = S.settings;
  const m = S.meta;
  const seg = (key, opts) => `<div class="seg sm" data-seg="${key}">${opts.map(([v, l]) => `<button data-v="${v}" class="${String(s[key]) === String(v) ? 'on' : ''}">${l}</button>`).join('')}</div>`;
  const chk = (key, label, obj = 's') => `<label class="chk"><input type="checkbox" data-${obj}="${key}" ${(obj === 's' ? s[key] : obj === 'col' ? s.columns[key] : m[key]) ? 'checked' : ''}><span>${label}</span></label>`;
  const pal = palette();
  openModal({
    title: `${icon('settings')} 設定`,
    wide: true,
    cls: 'settings',
    body: `<div class="set-grid">
      <section><h3>表示</h3>
        <div class="row2"><span>目盛り</span>${seg('scale', [['day', '日'], ['week', '週'], ['month', '月']])}</div>
        <div class="row2"><span>行の高さ</span>${seg('density', [['compact', '狭い'], ['normal', '標準'], ['roomy', '広い']])}</div>
        <div class="row2"><span>バーの文字</span>${seg('labelMode', [['auto', '自動'], ['inside', '中'], ['right', '右'], ['none', 'なし']])}</div>
        <div class="row2"><span>タスク名の幅</span><input type="range" min="140" max="380" step="10" data-s="nameWidth" value="${s.nameWidth}"></div>
        <div class="chks">${chk('showWeekends', '土日に色をつける')}${chk('showHolidays', '祝日を表示')}${chk('showToday', '今日の線')}${chk('showDeps', '依存線（矢印）')}${chk('showProgress', '進捗を表示')}${chk('showLegend', '凡例を表示')}</div>
      </section>
      <section><h3>表の列</h3>
        <div class="chks">${chk('dates', '開始日・終了日', 'col')}${chk('days', '日数', 'col')}${chk('assignee', '担当', 'col')}${chk('progress', '進捗', 'col')}</div>
        <h3>日付範囲</h3>
        <div class="row2"><span>表示期間</span>${seg('rangeMode', [['auto', '自動'], ['manual', '指定']])}</div>
        <div class="row2 ${s.rangeMode === 'manual' ? '' : 'dim'}" id="rangeRow"><input type="date" data-s="rangeStart" value="${s.rangeStart || range()[0]}"><span>〜</span><input type="date" data-s="rangeEnd" value="${s.rangeEnd || range()[1]}"></div>
      </section>
      <section><h3>稼働日</h3>
        <div class="row2"><span>定休日</span>${seg('workweek', [['satsun', '土日祝'], ['sun', '日祝'], ['none', 'なし']])}</div>
        <div class="row2"><span>日数の数え方</span>${seg('daysMode', [['calendar', '暦日'], ['work', '稼働日']])}</div>
        <div class="chks">${chk('autoShift', '先行タスクを動かしたら後続も自動でずらす')}</div>
        <h3>休業期間 <small>（年末年始・お盆など。チャートに斜線で表示）</small></h3>
        <div id="closureList"></div>
        <button class="linkbtn" id="addClosure">${icon('plus')}休業期間を追加</button>
      </section>
      <section><h3>凡例（色の名前）</h3>
        <div class="legend-edit">${COLOR_KEYS.map((k) => `<label><i style="background:${pal[k]}"></i><input data-cl="${k}" value="${esc(s.colorLabels[k] || '')}" placeholder="${COLOR_NAMES[k]}"></label>`).join('')}</div>
      </section>
      <section><h3>印刷・PDF</h3>
        <div class="row2"><span>用紙</span>${seg('paper', [['A4', 'A4'], ['A3', 'A3'], ['B4', 'B4']])}</div>
        <div class="row2"><span>向き</span>${seg('orientation', [['landscape', '横'], ['portrait', '縦']])}</div>
        <div class="chks">${chk('fitOnePage', '1ページに収める')}</div>
        <h3>押印欄</h3>
        <div class="chks">${chk('showStamps', '押印欄を表示', 'm')}${chk('showLogo', '会社ロゴを表示', 'm')}</div>
        <label class="fld"><span>項目（読点区切り）</span><input id="stampsInput" value="${esc(m.stamps.join('、'))}"></label>
      </section>
    </div>`,
    onMount(md) {
      const renderClosures = () => {
        $('#closureList', md).innerHTML = S.closures.length
          ? S.closures.map((c) => `<div class="closure" data-id="${c.id}"><input data-c="name" value="${esc(c.name)}" placeholder="名前"><input type="date" data-c="start" value="${c.start}"><span>〜</span><input type="date" data-c="end" value="${c.end}"><button class="ibtn sm" data-delc title="削除">${icon('x')}</button></div>`).join('')
          : '<p class="hint">登録なし</p>';
      };
      renderClosures();
      md.addEventListener('click', (e) => {
        const b = e.target.closest('[data-seg] button');
        if (b) {
          const key = b.parentElement.dataset.seg;
          const v = b.dataset.v;
          $$('button', b.parentElement).forEach((x) => x.classList.toggle('on', x === b));
          if (key === 'scale') return setScale(v);
          mutate(() => {
            s[key] = v;
            if (key === 'rangeMode' && v === 'manual') {
              s.rangeStart = $('[data-s="rangeStart"]', md).value;
              s.rangeEnd = $('[data-s="rangeEnd"]', md).value;
            }
          });
          if (key === 'rangeMode') $('#rangeRow', md).classList.toggle('dim', v !== 'manual');
          return;
        }
        if (e.target.closest('#addClosure')) {
          const y = (projectSpan()?.start || D.today()).slice(0, 4);
          mutate(() => S.closures.push({ id: uid(), name: '年末年始休業', start: `${y}-12-29`, end: `${+y + 1}-01-04` }));
          return renderClosures();
        }
        const dc = e.target.closest('[data-delc]');
        if (dc) {
          const id = dc.closest('.closure').dataset.id;
          mutate(() => (S.closures = S.closures.filter((c) => c.id !== id)));
          renderClosures();
        }
      });
      md.addEventListener('focusin', beginEdit);
      md.addEventListener('input', (e) => {
        const t = e.target;
        if (t.dataset.s === 'nameWidth') {
          s.nameWidth = +t.value;
          renderLeft();
        } else if (t.dataset.cl) {
          s.colorLabels[t.dataset.cl] = t.value.trim();
          renderLegend();
        }
      });
      md.addEventListener('change', (e) => {
        const t = e.target;
        if (t.dataset.s && t.type === 'checkbox') s[t.dataset.s] = t.checked;
        else if (t.dataset.col) s.columns[t.dataset.col] = t.checked;
        else if (t.dataset.m) m[t.dataset.m] = t.checked;
        else if (t.dataset.s === 'rangeStart' || t.dataset.s === 'rangeEnd') {
          if (D.isValid(t.value)) s[t.dataset.s] = t.value;
        } else if (t.id === 'stampsInput') m.stamps = t.value.split(/[、,，]/).map((x) => x.trim()).filter(Boolean);
        else if (t.dataset.c) {
          const c = S.closures.find((x) => x.id === t.closest('.closure').dataset.id);
          if (t.dataset.c === 'name') c.name = t.value;
          else if (D.isValid(t.value)) c[t.dataset.c] = t.value;
          if (c.end < c.start) c.end = c.start;
        }
        endEdit();
        renderAll();
      });
    },
  });
}

function openShortcuts() {
  const rows = [
    [`${MOD} + K`, 'コマンドパレット'],
    ['N', 'タスクを追加（選択中の下）'],
    ['M', 'マイルストーンを追加'],
    ['H', '見出しを追加'],
    ['Enter', '選択中のタスクを編集'],
    ['Delete', '選択中のタスクを削除'],
    [`${MOD} + D`, '複製'],
    ['← / →', '1日ずらす（Shift で1週間）'],
    ['↑ / ↓', '選択を移動'],
    ['Alt + ↑ / ↓', '行を並べ替え'],
    [`${MOD} + Z / ${MOD} + Shift + Z`, '元に戻す / やり直し'],
    ['1 / 2 / 3', '日 / 週 / 月 表示'],
    ['T', '今日へ移動'],
    [`${MOD} + ホイール`, 'ズーム'],
    [`${MOD} + S`, 'ファイルに保存（Shift で名前を付けて保存）'],
    [`${MOD} + O`, 'ファイルを開く'],
    [`${MOD} + P`, '印刷'],
    ['?', 'このヘルプ'],
  ];
  openModal({
    title: `${icon('keyboard')} ショートカット・操作のコツ`,
    body: `<table class="kbd-table">${rows.map(([k, v]) => `<tr><td><kbd>${k}</kbd></td><td>${v}</td></tr>`).join('')}</table>
      <ul class="tips"><li>バーをドラッグで移動、両端で期間変更</li><li>バー右端の ○ を別のバーへドラッグ → 先行関係（矢印）</li><li>チャートの空き部分をダブルクリック → 期間を追加（分割バー）</li><li>見出しのバーをドラッグ → 配下をまとめて移動</li><li>左の ⋮⋮ をドラッグで並べ替え</li></ul>`,
  });
}

function openPalette() {
  const cmds = [
    ['タスクを追加', 'plus', () => addTask('task'), 'N'],
    ['マイルストーンを追加', 'diamond', () => addTask('milestone'), 'M'],
    ['見出しを追加', 'heading', () => addTask('section'), 'H'],
    ['テキストから一括作成', 'sparkle', openBulk],
    ['新しいスケジュール（テンプレート）', 'template', openTemplates],
    ['日表示', 'bar', () => setScale('day'), '1'],
    ['週表示', 'bar', () => setScale('week'), '2'],
    ['月表示', 'bar', () => setScale('month'), '3'],
    ['幅に合わせて全体を表示', 'fit', fitWidth],
    ['今日へ移動', 'today', goToday, 'T'],
    ['PDFをダウンロード', 'file', exportPdf],
    ['PNG画像をダウンロード', 'image', exportPng],
    ['Excelに書き出し', 'table', exportXlsx],
    ['CSVに書き出し', 'table', exportCsv],
    ['ファイルに保存', 'save', () => saveToFile(), `${MOD}+S`],
    ['名前を付けて保存', 'save', () => saveToFile({ as: true }), `${MOD}+Shift+S`],
    ['ファイルを開く', 'folderOpen', openFromFile, `${MOD}+O`],
    ['保存フォルダから開く', 'folder', openFolder],
    ['JSONでバックアップ', 'download', exportJson],
    ['ファイルを読み込む（JSON / Excel / CSV）', 'upload', importFile],
    ['印刷', 'print', doPrint, `${MOD}+P`],
    ['共有リンクを作成', 'link', openShare],
    ['設定', 'settings', openSettings],
    ['ダークモード切り替え', 'moon', cycleMode],
    ...Object.entries(THEMES).map(([k, v]) => [`テーマ：${v.name}`, 'palette', () => mutate(() => (S.settings.theme = k))]),
    ['元に戻す', 'undo', undo, `${MOD}+Z`],
    ['やり直し', 'redo', redo, `${MOD}+⇧+Z`],
    ['ショートカット一覧', 'keyboard', openShortcuts, '?'],
  ];
  const m = openModal({
    title: `${icon('search')} コマンド`,
    cls: 'palette',
    body: `<input id="palQ" placeholder="やりたいことを入力…（例：PDF、週、テーマ）" autofocus autocomplete="off"><div id="palList" class="pal-list"></div>`,
  });
  let sel = 0;
  let list = cmds;
  const q = $('#palQ', m);
  const draw = () => {
    $('#palList', m).innerHTML = list.map((c, i) => `<button class="${i === sel ? 'on' : ''}" data-i="${i}">${icon(c[1])}<span>${c[0]}</span>${c[3] ? `<kbd>${c[3]}</kbd>` : ''}</button>`).join('') || '<p class="hint">見つかりません</p>';
    $('#palList .on', m)?.scrollIntoView({ block: 'nearest' });
  };
  const run = (c) => {
    closeModal();
    c?.[2]();
  };
  q.addEventListener('input', () => {
    const v = q.value.trim().toLowerCase();
    list = cmds.filter((c) => c[0].toLowerCase().includes(v));
    sel = 0;
    draw();
  });
  q.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') sel = Math.min(sel + 1, list.length - 1);
    else if (e.key === 'ArrowUp') sel = Math.max(sel - 1, 0);
    else if (e.key === 'Enter' && !e.isComposing) return run(list[sel]);
    else return;
    e.preventDefault();
    draw();
  });
  $('#palList', m).addEventListener('click', (e) => {
    const b = e.target.closest('[data-i]');
    if (b) run(list[+b.dataset.i]);
  });
  draw();
}

/* =========================================================
 * 書き出し・印刷
 * ======================================================= */
/** 用紙の印字可能サイズ（px, 96dpi） */
function paperPx() {
  const s = S.settings;
  let [pw, ph] = PAPER[s.paper] || PAPER.A4;
  if (s.orientation === 'landscape') [pw, ph] = [Math.max(pw, ph), Math.min(pw, ph)];
  else [pw, ph] = [Math.min(pw, ph), Math.max(pw, ph)];
  const mm = 96 / 25.4;
  return { aw: (pw - 16) * mm, ah: (ph - 16) * mm - 4 };
}
/** 書き出し用レイアウト：全期間が用紙幅に収まるよう日幅を決める */
function enterExportLayout() {
  hideTip();
  closeMenu();
  document.body.classList.add('exporting');
  exportMode = true;
  const { aw } = paperPx();
  const target = Math.round(aw / 0.8);
  const [rs, re] = range();
  const n = D.diff(rs, re) + 1;
  const lw = cols().reduce((a, c) => a + c.w, 0);
  // 右端のラベル用に余白を確保
  const pad = 150;
  exportPpd = Math.max(1, (target - 40 - 2 - lw - pad) / n);
  ui.frozenRange = [rs, D.addDays(re, Math.ceil(pad / exportPpd))];
  exportPpd = (target - 40 - 2 - lw) / (D.diff(rs, ui.frozenRange[1]) + 1);
  el.sheet.style.width = target + 'px';
  renderAll();
}
function leaveExportLayout() {
  document.body.classList.remove('exporting', 'printing');
  exportMode = false;
  exportPpd = null;
  ui.frozenRange = null;
  el.sheet.style.width = '';
  el.sheet.style.zoom = '';
  renderAll();
}
async function withExport(fn) {
  enterExportLayout();
  await nextFrame();
  try {
    return await fn(el.sheet);
  } finally {
    leaveExportLayout();
  }
}
async function exportPng() {
  toast('画像を作成しています…');
  try {
    const canvas = await withExport(IO.captureSheet);
    canvas.toBlob((b) => IO.download(IO.safeName(S.meta.title) + '.png', b), 'image/png');
    toast('PNG画像を保存しました');
  } catch (e) {
    toast(e.message || '画像の作成に失敗しました');
  }
}
async function exportPdf() {
  toast('PDFを作成しています…');
  try {
    const canvas = await withExport(IO.captureSheet);
    const blob = await IO.canvasToPdf(canvas, S.settings);
    IO.download(IO.safeName(S.meta.title) + '.pdf', blob);
    toast('PDFを保存しました（文字をくっきり残したい場合は「印刷」→「PDFに保存」も使えます）');
  } catch (e) {
    toast(e.message || 'PDFの作成に失敗しました');
  }
}
function exportJson() {
  IO.download(IO.safeName(S.meta.title) + '.stride.json', JSON.stringify(S, null, 2), 'application/json');
  toast('JSONで保存しました');
}
function exportCsv() {
  IO.download(IO.safeName(S.meta.title) + '.csv', IO.toCsv(IO.toRows(S, daysOf)), 'text/csv');
  toast('CSVで保存しました');
}
async function exportXlsx() {
  try {
    await IO.loadLib('xlsx');
    const X = window.XLSX;
    const wb = X.utils.book_new();
    const ws = X.utils.aoa_to_sheet(IO.toRows(S, daysOf));
    ws['!cols'] = [4, 12, 28, 20, 12, 12, 6, 10, 8, 5, 12, 28].map((w) => ({ wch: w }));
    X.utils.book_append_sheet(wb, ws, 'タスク一覧');
    // 簡易ガント（セルに■）
    const [rs, re] = range();
    const n = Math.min(D.diff(rs, re) + 1, 400);
    const head = ['タスク', ...Array.from({ length: n }, (_, i) => D.short(D.addDays(rs, i), false))];
    const dows = ['', ...Array.from({ length: n }, (_, i) => D.DOW_JA[D.dow(D.addDays(rs, i))])];
    const body = visibleTasks().map((t) => [
      (t.type === 'section' ? '■ ' : t.type === 'milestone' ? '◆ ' : '　') + t.name,
      ...Array.from({ length: n }, (_, i) => {
        const d = D.addDays(rs, i);
        const hit = (t.type === 'section' ? children(t).flatMap((k) => k.bars) : t.bars).some((b) => d >= b.start && d <= b.end);
        return hit ? (t.type === 'milestone' ? '◆' : t.type === 'section' ? '━' : '■') : inClosure(d) ? '／' : '';
      }),
    ]);
    const ws2 = X.utils.aoa_to_sheet([head, dows, ...body]);
    ws2['!cols'] = [{ wch: 26 }, ...Array.from({ length: n }, () => ({ wch: 4 }))];
    X.utils.book_append_sheet(wb, ws2, 'チャート');
    X.writeFile(wb, IO.safeName(S.meta.title) + '.xlsx');
    toast('Excelに書き出しました');
  } catch (e) {
    toast(e.message || 'Excelの書き出しに失敗しました');
  }
}
async function importFile() {
  const f = await IO.pickFile('.json,.xlsx,.xls,.csv,application/json,text/csv');
  if (!f) return;
  try {
    const name = f.name.replace(/\.(stride\.)?(json|xlsx|xls|csv)$/i, '');
    if (/\.json$/i.test(f.name)) {
      const st = JSON.parse(await f.text());
      if (!IO.validState(st)) throw new Error('Strideのデータではないようです');
      createProject(migrate(st));
      return;
    }
    let rows;
    if (/\.csv$/i.test(f.name)) {
      const buf = await f.arrayBuffer();
      let text = new TextDecoder('utf-8').decode(buf);
      if (text.includes('�')) text = new TextDecoder('shift_jis').decode(buf);
      rows = IO.parseCsv(text);
    } else {
      await IO.loadLib('xlsx');
      const wb = window.XLSX.read(await f.arrayBuffer(), { cellDates: true });
      rows = window.XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, raw: true, defval: '' });
    }
    const tasks = IO.fromRows(rows);
    const st = blankState();
    st.meta.title = name;
    st.tasks = tasks;
    createProject(st);
    toast(`${tasks.length}件のタスクを読み込みました`);
  } catch (e) {
    toast('読み込めませんでした：' + e.message);
  }
}

function pageCss() {
  const s = S.settings;
  return `@page { size: ${s.paper} ${s.orientation}; margin: 8mm; }`;
}
function preparePrint() {
  if (document.body.classList.contains('printing')) return;
  document.body.classList.add('printing');
  $('#pageStyle').textContent = pageCss();
  enterExportLayout();
  const s = S.settings;
  const { aw, ah } = paperPx();
  el.sheet.style.zoom = 1;
  const w = el.sheet.scrollWidth;
  const h = el.sheet.scrollHeight;
  const z = s.fitOnePage ? Math.min(aw / w, ah / h) : aw / w;
  el.sheet.style.zoom = Math.min(z, 1.6).toFixed(4);
}
function finishPrint() {
  if (!document.body.classList.contains('printing')) return;
  leaveExportLayout();
}
function doPrint() {
  preparePrint();
  setTimeout(() => {
    window.print();
    setTimeout(finishPrint, 300);
  }, 60);
}

/* =========================================================
 * ツールバー・メニュー
 * ======================================================= */
function openProjects(anchor) {
  const items = [{ sep: true, label: '保存済みのスケジュール' }];
  for (const p of [...index.projects].sort((a, b) => b.updated - a.updated).slice(0, 30)) {
    items.push({ label: esc(p.name), icon: p.id === index.current ? 'check' : 'file', on: p.id === index.current, sub: new Date(p.updated).toLocaleDateString('ja-JP'), fn: () => p.id !== index.current && openProject(p.id) });
  }
  items.push(
    { sep: true, label: 'パソコンのファイル' },
    { label: 'ファイルに保存', icon: 'save', kbd: `${MOD}+S`, fn: () => saveToFile() },
    { label: '名前を付けて保存', icon: 'save', kbd: `${MOD}+⇧+S`, fn: () => saveToFile({ as: true }) },
    { label: 'ファイルを開く', icon: 'folderOpen', kbd: `${MOD}+O`, fn: openFromFile },
    { label: '保存フォルダから開く', icon: 'folder', fn: openFolder },
    { sep: true },
    { label: '新規作成（テンプレート）', icon: 'plus', fn: openTemplates },
    { label: 'このスケジュールを複製', icon: 'copy', fn: () => createProject(JSON.parse(JSON.stringify({ ...S, meta: { ...S.meta, title: S.meta.title + '（コピー）' } }))) },
    { label: 'ファイルを読み込む', icon: 'upload', fn: importFile },
    {
      label: 'このスケジュールを削除',
      icon: 'trash',
      danger: true,
      fn: () => {
        if (confirm(`「${S.meta.title}」を削除します。元に戻せません。よろしいですか？`)) deleteProject(index.current);
      },
    }
  );
  openMenu(anchor, items);
}
function openExport(anchor) {
  openMenu(
    anchor,
    [
      { label: 'PDFをダウンロード', icon: 'file', fn: exportPdf },
      { label: 'PNG画像', icon: 'image', fn: exportPng },
      { label: 'Excel（.xlsx）', icon: 'table', fn: exportXlsx },
      { label: 'CSV', icon: 'table', fn: exportCsv },
      { label: 'JSON（バックアップ）', icon: 'download', fn: exportJson },
      { sep: true },
      { label: '印刷 / PDFに保存', icon: 'print', kbd: `${MOD}+P`, fn: doPrint },
      { sep: true },
      { label: 'ファイルを読み込む', icon: 'upload', sub: 'JSON・Excel・CSV', fn: importFile },
    ],
    { align: 'right' }
  );
}
function openThemes(anchor) {
  openMenu(
    anchor,
    [
      { sep: true, label: 'カラーテーマ' },
      ...Object.entries(THEMES).map(([k, v]) => ({
        label: v.name,
        on: S.settings.theme === k,
        swatch: `<span class="sw-row">${COLOR_KEYS.slice(0, 5).map((c) => `<i style="background:${v.colors[c]}"></i>`).join('')}</span>`,
        fn: () => mutate(() => (S.settings.theme = k)),
      })),
      { sep: true, label: '画面' },
      { label: 'システムに合わせる', icon: 'monitor', on: ui.mode === 'system', fn: () => setMode('system') },
      { label: 'ライト', icon: 'sun', on: ui.mode === 'light', fn: () => setMode('light') },
      { label: 'ダーク', icon: 'moon', on: ui.mode === 'dark', fn: () => setMode('dark') },
    ],
    { align: 'right' }
  );
}
function openAddMenu(anchor) {
  openMenu(anchor, [
    { label: 'タスク', icon: 'bar', kbd: 'N', fn: () => addTask('task') },
    { label: 'マイルストーン', icon: 'diamond', kbd: 'M', fn: () => addTask('milestone') },
    { label: '見出し（グループ）', icon: 'heading', kbd: 'H', fn: () => addTask('section') },
    { sep: true },
    { label: 'テキストから一括作成', icon: 'sparkle', fn: openBulk },
  ]);
}

function bindToolbar() {
  const on = (id, fn) => $(id).addEventListener('click', fn);
  on('#projBtn', (e) => openProjects(e.currentTarget));
  on('#fileBtn', () => saveToFile());
  on('#openBtn', (e) =>
    openMenu(e.currentTarget, [
      { label: 'ファイルを開く', icon: 'folderOpen', kbd: `${MOD}+O`, fn: openFromFile },
      { label: '保存フォルダから開く', icon: 'folder', sub: 'フォルダ内の一覧', fn: openFolder },
      { sep: true },
      { label: '名前を付けて保存', icon: 'save', kbd: `${MOD}+⇧+S`, fn: () => saveToFile({ as: true }) },
    ])
  );
  on('#undoBtn', undo);
  on('#redoBtn', redo);
  $$('#scaleSeg button').forEach((b) => b.addEventListener('click', () => setScale(b.dataset.scale)));
  on('#zoomIn', () => setZoom(S.settings.zoom * 1.25));
  on('#zoomOut', () => setZoom(S.settings.zoom / 1.25));
  on('#zoomVal', () => setZoom(1));
  on('#fitBtn', fitWidth);
  on('#todayBtn', goToday);
  on('#addBtn', (e) => openAddMenu(e.currentTarget));
  on('#addRowBtn', () => addTask('task'));
  on('#bulkBtn', openBulk);
  on('#tplBtn', openTemplates);
  on('#shareBtn', openShare);
  on('#exportBtn', (e) => openExport(e.currentTarget));
  on('#printBtn', doPrint);
  on('#themeBtn', (e) => openThemes(e.currentTarget));
  on('#modeBtn', cycleMode);
  on('#settingsBtn', openSettings);
  on('#cmdBtn', openPalette);
  on('#helpBtn', openShortcuts);
  el.legend.addEventListener('click', (e) => e.target.closest('[data-act="legend"]') && openSettings());

  // シートヘッダーの直接編集
  const metaEdit = (node, key) => {
    node.addEventListener('focus', beginEdit);
    node.addEventListener('input', () => {
      S.meta[key] = node.innerText.replace(/\n+$/, '');
      if (key === 'title') renderProjName();
    });
    node.addEventListener('blur', () => {
      endEdit();
      saveNow();
    });
    node.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && key !== 'notes' && !e.isComposing) {
        e.preventDefault();
        node.blur();
      }
    });
  };
  metaEdit(el.title, 'title');
  metaEdit(el.subtitle, 'subtitle');
  metaEdit(el.author, 'author');
  metaEdit(el.notes, 'notes');
  el.createdAt.addEventListener('click', () => pickDate(el.createdAt, S.meta.createdAt, (v) => mutate(() => (S.meta.createdAt = v))));
}

function isTyping(e) {
  const t = e.target;
  return t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName);
}
function bindKeys() {
  document.addEventListener('keydown', (e) => {
    const mod = e.metaKey || e.ctrlKey;
    if (mod && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      return openPalette();
    }
    if (mod && e.key.toLowerCase() === 'p') {
      e.preventDefault();
      return doPrint();
    }
    if (mod && e.key.toLowerCase() === 's') {
      e.preventDefault();
      if (document.activeElement?.isContentEditable) document.activeElement.blur();
      return saveToFile({ as: e.shiftKey });
    }
    if (mod && e.key.toLowerCase() === 'o') {
      e.preventDefault();
      return openFromFile();
    }
    if (e.key === 'Escape') {
      if (closeMenu() || closeModal()) return;
      if (ui.drawer) return select(ui.selected, { open: false });
      if (ui.selected) return select(null);
    }
    if (isTyping(e) || $('#modalRoot').classList.contains('open')) return;
    if (mod && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      return e.shiftKey ? redo() : undo();
    }
    if (mod && e.key.toLowerCase() === 'y') {
      e.preventDefault();
      return redo();
    }
    if (mod && e.key.toLowerCase() === 'd') {
      e.preventDefault();
      return duplicateTask();
    }
    if (mod || e.altKey && !/Arrow/.test(e.key)) return;
    const vis = visibleTasks();
    const i = vis.findIndex((t) => t.id === ui.selected);
    switch (e.key) {
      case 'n':
      case 'N':
        e.preventDefault();
        return addTask('task');
      case 'm':
      case 'M':
        e.preventDefault();
        return addTask('milestone');
      case 'h':
      case 'H':
        e.preventDefault();
        return addTask('section');
      case '1':
        return setScale('day');
      case '2':
        return setScale('week');
      case '3':
        return setScale('month');
      case 't':
      case 'T':
        return goToday();
      case '?':
        return openShortcuts();
      case 'Delete':
      case 'Backspace':
        if (ui.selected) {
          e.preventDefault();
          deleteTask();
        }
        return;
      case 'Enter':
        if (ui.selected) {
          e.preventDefault();
          select(ui.selected, { open: true });
        }
        return;
      case 'ArrowUp':
      case 'ArrowDown': {
        e.preventDefault();
        const dir = e.key === 'ArrowUp' ? -1 : 1;
        if (e.altKey && ui.selected) return moveTask(ui.selected, dir);
        const nx = vis[clamp(i + dir, 0, vis.length - 1)] || vis[0];
        if (nx) {
          select(nx.id);
          $(`.lrow[data-id="${nx.id}"]`, el.left)?.scrollIntoView({ block: 'nearest' });
        }
        return;
      }
      case 'ArrowLeft':
      case 'ArrowRight':
        if (ui.selected) {
          e.preventDefault();
          shiftSelected((e.key === 'ArrowLeft' ? -1 : 1) * (e.shiftKey ? 7 : 1));
        }
        return;
    }
  });
  window.addEventListener('beforeprint', preparePrint);
  window.addEventListener('afterprint', finishPrint);
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => ui.mode === 'system' && renderAll());
  let rt;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => !exportMode && renderAll(), 120);
  });
  // 別タブでの更新を反映
  window.addEventListener('storage', (e) => {
    if (e.key === 'stride:p:' + index.current && e.newValue && !pendingSnap && !drag) {
      S = migrate(JSON.parse(e.newValue));
      renderAll();
    }
  });
}

/* =========================================================
 * 起動
 * ======================================================= */
async function boot() {
  Object.assign(el, {
    sheet: $('#sheet'),
    board: $('#board'),
    inner: $('#boardInner'),
    corner: $('#corner'),
    head: $('#tlHead'),
    left: $('#left'),
    chart: $('#chart'),
    legend: $('#legend'),
    drawer: $('#drawer'),
    tip: $('#tip'),
    toast: $('#toast'),
    title: $('#title'),
    subtitle: $('#subtitle'),
    author: $('#author'),
    notes: $('#notes'),
    createdAt: $('#createdAt'),
    span: $('#span'),
    stamps: $('#stamps'),
    projName: $('#projName'),
    zoomVal: $('#zoomVal'),
  });
  $$('[data-icon]').forEach((n) => n.insertAdjacentHTML('afterbegin', icon(n.dataset.icon)));
  $('#cmdKbd').textContent = `${MOD} K`;
  bindToolbar();
  bindLeft();
  bindChart();
  bindDrawer();
  bindKeys();

  // 共有リンクから開いた場合
  const m = location.hash.match(/^#s=([\w-]+)/);
  if (m) {
    history.replaceState(null, '', location.pathname + location.search);
    try {
      const st = await IO.decodeShare(m[1]);
      if (!IO.validState(st)) throw new Error();
      createProject(migrate(st), { silent: true });
      toast('共有されたスケジュールを読み込みました');
      return;
    } catch {
      toast('共有リンクを読み込めませんでした');
    }
  }
  index.projects = index.projects.filter((p) => p && p.id);
  if (!(index.current && openProject(index.current))) {
    if (!(index.projects[0] && openProject(index.projects[0].id))) {
      createProject(TEMPLATES[0].make(D.startOfWeek(D.today())), { silent: true });
      setTimeout(() => toast('ようこそ！サンプルを表示しています。「新規作成」でテンプレートから始められます'), 400);
    }
  }
}

if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
boot();

// テスト・デバッグ用
window.__stride = { get state() { return S; }, saveToFile, openFolder, openFromFile, renderAll, addTask, setScale, preparePrint, finishPrint, select, openSettings, openBulk, openPalette };
