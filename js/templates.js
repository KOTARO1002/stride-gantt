// テンプレート（base: 開始日 'YYYY-MM-DD'）
import { addDays, today, startOfWeek } from './dates.js';

export const uid = () => Math.random().toString(36).slice(2, 10);

export function blankState() {
  return {
    version: 1,
    meta: {
      title: '新しいスケジュール',
      subtitle: '',
      createdAt: today(),
      author: '',
      stamps: ['承認', '査閲', '担当者', '作成者'],
      showStamps: true,
      showLogo: true,
      notes: '',
    },
    settings: {
      scale: 'day',
      zoom: 1,
      theme: 'pastel',
      rangeMode: 'auto',
      rangeStart: '',
      rangeEnd: '',
      showWeekends: true,
      showHolidays: true,
      showToday: true,
      showDeps: true,
      showProgress: true,
      showLegend: true,
      labelMode: 'auto',
      density: 'normal',
      nameWidth: 210,
      columns: { dates: true, days: true, assignee: true, progress: false },
      workweek: 'satsun',
      daysMode: 'calendar',
      autoShift: true,
      paper: 'A4',
      orientation: 'landscape',
      fitOnePage: true,
      colorLabels: {},
    },
    closures: [],
    tasks: [],
  };
}

// 行定義のショートハンド: [type, name, note, offsetStart, length, color, extra]
function build(meta, base, rows, closures = [], colorLabels = {}) {
  const s = blankState();
  Object.assign(s.meta, meta);
  s.settings.colorLabels = colorLabels;
  s.settings.scale = 'week';
  const ids = [];
  for (const r of rows) {
    const [type, name, note, off, len, color, extra = {}] = r;
    const t = {
      id: uid(),
      type,
      name,
      note: note || '',
      bars: [],
      color: color || 'c1',
      progress: extra.progress || 0,
      assignee: extra.assignee || '',
      deps: [],
      collapsed: false,
    };
    if (type !== 'section') {
      const segs = extra.segs || [[off, len]];
      t.bars = segs.map(([o, l]) => ({ start: addDays(base, o), end: addDays(base, o + Math.max(1, l) - 1) }));
    }
    if (extra.dep != null) t._dep = extra.dep;
    ids.push(t.id);
    s.tasks.push(t);
  }
  for (const t of s.tasks) {
    if (t._dep != null) {
      const list = Array.isArray(t._dep) ? t._dep : [t._dep];
      t.deps = list.map((i) => ids[i]).filter(Boolean);
      delete t._dep;
    }
  }
  s.closures = closures.map(([name, off, len]) => ({ id: uid(), name, start: addDays(base, off), end: addDays(base, off + len - 1) }));
  return s;
}

/** 年末年始の休業（base基準のオフセットを返す） */
function newYearOffset(base) {
  const y = +base.slice(0, 4);
  const cand = `${y}-12-29`;
  const d = (Date.parse(cand) - Date.parse(base)) / 86400000;
  return d >= 0 ? d : (Date.parse(`${y + 1}-12-29`) - Date.parse(base)) / 86400000;
}

export const TEMPLATES = [
  {
    id: 'reform',
    name: 'リノベーション',
    desc: '現地調査〜プラン打合せ〜契約〜工事〜竣工',
    icon: 'hammer',
    make(base = startOfWeek(today())) {
      const ny = newYearOffset(base);
      const work0 = 63;
      const workLen = 90;
      // 年末年始をまたぐ場合は工事期間を2分割
      const segs = ny > work0 && ny < work0 + workLen ? [[work0, ny - work0], [ny + 6, work0 + workLen - (ny + 6)]] : [[work0, workLen]];
      return build(
        { title: '○○様 リノベーション工事スケジュール', subtitle: '○○様邸 リノベーション工事', author: '' },
        base,
        [
          ['section', 'プラン・仕様決定', '', 0, 0, 'c1'],
          ['milestone', '現地調査', '', 0, 1, 'c5', { assignee: '設計' }],
          ['task', 'プラン大枠打ち合わせ', '間取り', 0, 28, 'c3', { assignee: '設計', dep: 1 }],
          ['task', '仕様大枠決定', '住設・内装大枠', 14, 21, 'c3', { assignee: '設計' }],
          ['milestone', '工事請負契約', '', 35, 1, 'c5', { dep: 2 }],
          ['task', 'プラン詳細打合せ', '高さ方向・電気', 32, 24, 'c3', { assignee: '設計' }],
          ['task', '仕様詳細決定', '各種品番まで', 36, 20, 'c3', { assignee: '設計' }],
          ['section', '工事', '', 0, 0, 'c4'],
          ['task', '着工準備', '近隣挨拶・発注', 56, 7, 'c4', { assignee: '工務', dep: 6 }],
          ['task', '工事期間', '', 0, 0, 'c4', { assignee: '工務', segs, dep: 8 }],
          ['milestone', '竣工・お引渡し', '', work0 + workLen + 1, 1, 'c5', { dep: 9 }],
        ],
        [['年末年始休業', ny, 6]],
        { c3: '打合せ・決定', c4: '工事', c5: '契約・引渡し' }
      );
    },
  },
  {
    id: 'chuko-reno',
    name: '中古を買ってリノベーション',
    desc: '売買契約〜ローン〜決済と、プラン打合せ〜工事〜竣工を1枚に',
    icon: 'key',
    make(base = startOfWeek(today())) {
      // 年末年始休暇：12/30〜1/6（8日間）
      const ny = newYearOffset(base) + 1;
      const w0 = 72; // 工事開始（着工準備の翌日）
      const wEnd = 167; // 工事終了
      const inWork = ny > w0 && ny + 8 <= wEnd;
      const segs = inWork ? [[w0, ny - w0], [ny + 8, wEnd - (ny + 8) + 1]] : [[w0, wEnd - w0 + 1]];
      const rows = [
        ['section', '不動産', '', 0, 0, 'c1'],
        ['milestone', '売買契約', '', 0, 1, 'c1'],
        ['milestone', '本審査申込', '', 9, 1, 'c7', { dep: 1 }],
        ['milestone', '融資特約期日', '', 31, 1, 'c5', { dep: 2 }],
        ['milestone', '金消契約期日', '金銭消費貸借契約', 39, 1, 'c7', { dep: 3 }],
        ['milestone', '不動産決済', '', 51, 1, 'c1', { dep: 4 }],
        ['section', 'リノベーション', '', 0, 0, 'c5'],
        ['task', 'プラン打ち合わせ', '間取り', 0, 45, 'c3', { assignee: '設計' }],
        ['task', '仕様の決定', '設備機器、内装大枠', 16, 33, 'c3', { assignee: '設計' }],
        // 金消契約に必要なため、融資枠上限のリノベ費用でいったん契約する
        ['milestone', '工事請負契約期日', '融資枠上限額で契約（金消用）', 28, 1, 'c5'],
        ['task', 'プラン詳細打合せ', '電気、高さ方向', 37, 33, 'c3', { assignee: '設計' }],
        // 着工直前の大幅な変更を防ぐため、上限からの減額内容をここで確定する
        ['milestone', '工事金額確定期日', '減額内容を確定', 49, 1, 'c5'],
        ['task', '仕様詳細打合せ', '各種内装仕様詳細', 50, 28, 'c3', { assignee: '設計' }],
        ['task', '着工準備', '', 51, 21, 'c4', { assignee: '工務', dep: 11 }],
        ['task', '工事期間', '', 0, 0, 'c4', { assignee: '工務', segs, dep: 13 }],
      ];
      if (inWork) rows.push(['task', '年末年始休暇', '', ny, 8, 'c6']);
      rows.push(['milestone', '竣工', '', wEnd + 1, 1, 'c5', { dep: 14 }]);
      return build(
        { title: '○○様 中古購入＋リノベーション スケジュール', subtitle: '物件：○○市○○町　／　○○様邸 リノベーション工事', author: '' },
        base,
        rows,
        inWork ? [['年末年始休暇', ny, 8]] : [],
        { c1: '不動産', c7: 'ローン', c5: '契約・期日', c3: '打合せ・決定', c4: '工事', c6: '休暇' }
      );
    },
  },
  {
    id: 'baibai',
    name: '不動産売買',
    desc: '媒介契約〜販売活動〜売買契約〜決済・引渡し',
    icon: 'house',
    make(base = startOfWeek(today())) {
      return build(
        { title: '○○様 不動産売買スケジュール', subtitle: '物件：○○市○○町' },
        base,
        [
          ['milestone', '媒介契約締結', '', 0, 1, 'c5'],
          ['task', '販売活動', 'REINS登録・広告', 1, 45, 'c1', { dep: 0, progress: 40 }],
          ['task', '内覧対応', '', 7, 35, 'c2'],
          ['milestone', '購入申込受付', '', 46, 1, 'c5', { dep: 1 }],
          ['task', '住宅ローン事前審査', '', 47, 7, 'c7', { dep: 3 }],
          ['task', '契約条件調整・書類準備', '重説・契約書', 47, 12, 'c3'],
          ['milestone', '重要事項説明・売買契約', '', 60, 1, 'c5', { dep: [4, 5] }],
          ['task', '住宅ローン本審査', '', 61, 14, 'c7', { dep: 6 }],
          ['milestone', '金銭消費貸借契約', '', 78, 1, 'c5', { dep: 7 }],
          ['task', '引越し・残置物撤去', '', 70, 18, 'c4'],
          ['milestone', '決済・お引渡し', '', 90, 1, 'c5', { dep: 8 }],
        ],
        [],
        { c1: '販売', c5: '契約・決済', c7: 'ローン' }
      );
    },
  },
  {
    id: 'blank',
    name: '白紙から',
    desc: '空のチャートを作成',
    icon: 'file',
    make(base = today()) {
      const s = blankState();
      s.tasks.push({ id: uid(), type: 'task', name: '新しいタスク', note: '', bars: [{ start: base, end: addDays(base, 4) }], color: 'c1', progress: 0, assignee: '', deps: [], collapsed: false });
      return s;
    },
  },
];
