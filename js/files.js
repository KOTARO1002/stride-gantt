// ローカルファイル保存：File System Access API（Chrome / Edge）。非対応ブラウザはダウンロード保存にフォールバック
// ファイル・フォルダのハンドルは IndexedDB に保存し、次回以降も同じファイルに上書きできるようにする

export const supported = typeof window !== 'undefined' && 'showSaveFilePicker' in window && 'showOpenFilePicker' in window;
export const folderSupported = typeof window !== 'undefined' && 'showDirectoryPicker' in window;

const TYPES = [{ description: 'Stride スケジュール', accept: { 'application/json': ['.json'] } }];
export const EXT = '.stride.json';

/* ---------- IndexedDB（ハンドル保管） ---------- */
let dbp;
function db() {
  if (!dbp) {
    dbp = new Promise((res, rej) => {
      const r = indexedDB.open('stride-files', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('h');
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
  }
  return dbp;
}
async function tx(mode, fn) {
  const d = await db();
  return new Promise((res, rej) => {
    const t = d.transaction('h', mode);
    const req = fn(t.objectStore('h'));
    t.oncomplete = () => res(req?.result);
    t.onerror = () => rej(t.error);
  });
}
export const getHandle = (key) => tx('readonly', (s) => s.get(key)).catch(() => null);
export const setHandle = (key, h) => tx('readwrite', (s) => s.put(h, key)).catch(() => {});
export const delHandle = (key) => tx('readwrite', (s) => s.delete(key)).catch(() => {});

/* ---------- 権限 ---------- */
export async function permitted(h, ask = false) {
  if (!h?.queryPermission) return false;
  const o = { mode: 'readwrite' };
  if ((await h.queryPermission(o)) === 'granted') return true;
  if (!ask) return false;
  try {
    return (await h.requestPermission(o)) === 'granted';
  } catch {
    return false;
  }
}

/* ---------- 読み書き ---------- */
export async function write(h, text) {
  const w = await h.createWritable();
  await w.write(text);
  await w.close();
}
export async function read(h) {
  const f = await h.getFile();
  return { text: await f.text(), name: f.name, modified: f.lastModified };
}

const aborted = (e) => e?.name === 'AbortError';

/** 保存先を選ぶ（キャンセル時は null） */
export async function pickSave(suggestedName, startIn) {
  try {
    return await window.showSaveFilePicker({ suggestedName, types: TYPES, excludeAcceptAllOption: false, ...(startIn ? { startIn } : {}) });
  } catch (e) {
    if (aborted(e)) return null;
    throw e;
  }
}
/** 開くファイルを選ぶ（キャンセル時は null） */
export async function pickOpen(startIn) {
  try {
    const [h] = await window.showOpenFilePicker({ types: TYPES, multiple: false, ...(startIn ? { startIn } : {}) });
    return h || null;
  } catch (e) {
    if (aborted(e)) return null;
    throw e;
  }
}
/** フォルダを選ぶ（キャンセル時は null） */
export async function pickFolder() {
  try {
    return await window.showDirectoryPicker({ id: 'stride', mode: 'readwrite' });
  } catch (e) {
    if (aborted(e)) return null;
    throw e;
  }
}

/** フォルダ内の .json を一覧（更新日の新しい順） */
export async function listFolder(dir) {
  const out = [];
  for await (const [name, h] of dir.entries()) {
    if (h.kind !== 'file' || !/\.json$/i.test(name)) continue;
    try {
      const f = await h.getFile();
      out.push({ name, handle: h, modified: f.lastModified, size: f.size });
    } catch {}
  }
  return out.sort((a, b) => b.modified - a.modified);
}

/** フォルダ内で使われていないファイル名を返す */
export async function freeName(dir, base) {
  const names = new Set();
  for await (const [name] of dir.entries()) names.add(name);
  let n = base + EXT;
  for (let i = 2; names.has(n); i++) n = `${base} (${i})${EXT}`;
  return n;
}
