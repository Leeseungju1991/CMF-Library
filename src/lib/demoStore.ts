/**
 * ✅ 데모 모드 목(mock) 데이터 스토어
 * - Firebase(Firestore/Storage) 없이 브라우저 메모리 + localStorage 만으로 동작.
 * - `src/lib/firestore.ts` / `src/lib/storage.ts` 가 DEMO_MODE 일 때 이 모듈로 위임한다.
 * - 새로고침해도 세션 동안의 변경사항은 localStorage 에 남아있고,
 *   완전 초기화하려면 브라우저 저장소를 지우면 된다(데모 목적상 자연스러운 동작).
 */
import type { CmfItem, OutfitPhoto } from "./types";

const NS = "cmfDemo:v1:";
const LS_KEYS = {
  items: NS + "items",
  trash: NS + "trash",
  logs: NS + "logs",
  popular: NS + "popular",
};

// ---------------------------------------------------------------------------
// 저장소 helpers
// ---------------------------------------------------------------------------

function hasLocalStorage() {
  try {
    return typeof localStorage !== "undefined";
  } catch {
    return false;
  }
}

function loadLS<T>(key: string): T | null {
  if (!hasLocalStorage()) return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function saveLS(key: string, val: any) {
  if (!hasLocalStorage()) return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    // 용량 초과 등은 데모 동작에 치명적이지 않으므로 무시
  }
}

export function genId(prefix = "cmf"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Firestore Timestamp 와 유사한 최소 인터페이스(.toDate()) 제공 */
function fakeTimestamp(at: Date | number | string = new Date()) {
  const d = at instanceof Date ? at : new Date(at);
  return {
    __fakeTimestamp: true,
    seconds: Math.floor(d.getTime() / 1000),
    toDate: () => d,
    toMillis: () => d.getTime(),
  };
}

function tsToDate(ts: any): Date | null {
  if (!ts) return null;
  if (typeof ts.toDate === "function") return ts.toDate();
  const d = new Date(ts);
  return isNaN(d.getTime()) ? null : d;
}

function normalizeColorCodes(color: any): string[] {
  const t = (color ?? "").toString().trim();
  if (!t) return [];
  if (t.includes("/")) return t.split("/").map((x) => x.trim()).filter(Boolean);
  return [t];
}

function uniqSorted(arr: any[]): string[] {
  const set = new Set<string>();
  for (const v of arr ?? []) {
    const s = (v ?? "").toString().trim();
    if (!s || s === "/") continue;
    set.add(s);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, "ko"));
}

function stripUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  const out: any = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v;
  }
  return out;
}

// ---------------------------------------------------------------------------
// 시드 데이터
// ---------------------------------------------------------------------------

const VENDORS = [
  "대한섬유", "예성텍스", "한빛머티리얼", "서울CMF", "그린패브릭",
  "우주소재", "다올코퍼레이션", "청담원단", "은성텍스타일", "빛나라소재",
];
const WEIGHTS = ["초경량", "경량", "표준", "중량"];
const COMPS = [
  "Cotton 100%", "Polyester", "PU Leather", "Nylon",
  "Wool Blend", "TPU", "ABS", "Silicone", "Cotton/Poly", "PVC",
];
const WIDTHS = ["110cm", "140cm", "150cm", "160cm", "-"];
const MOUNTS = ["원단", "가죽", "부자재", "플라스틱", "금속"];
const COSTS = ["$", "$$", "$$$"];
const COLORS = ["BE", "BK", "BL", "BN", "GN", "GY", "IV", "KH", "PK", "WH", "YE", "NV", "RD", "OR"];
const ORGS = ["디자인팀", "MD팀", "생산팀", "품질팀"];
const PLACES = ["본사 자재실", "물류센터 A동", "협력사 창고", "샘플룸"];
const ARCHIVE = ["보관중", "샘플대기", "단종"];
const USE_IN = ["THE GEM", "IDEALIAN", "NEORm", "ICONIA"] as const;
const GENDERS = ["남아", "여아"] as const;

function buildSeedItem(i: number, createdAt: ReturnType<typeof fakeTimestamp>): CmfItem {
  const vendor = VENDORS[i % VENDORS.length];
  const comp = COMPS[i % COMPS.length];
  const color = COLORS[i % COLORS.length];
  const useStatus = i % 3 === 0 ? "사용중" : "미사용";

  return stripUndefined({
    id: genId("seed"),
    무게: WEIGHTS[i % WEIGHTS.length],
    업체명: vendor,
    No: `N${String(i + 1).padStart(3, "0")}`,
    comp,
    width: WIDTHS[i % WIDTHS.length],
    mount: MOUNTS[i % MOUNTS.length],
    cost: COSTS[i % COSTS.length],
    color,
    colorCodes: normalizeColorCodes(color),
    조직: ORGS[i % ORGS.length],
    전화번호: "02-000-0000",
    장소: PLACES[i % PLACES.length],
    아카이빙: ARCHIVE[i % ARCHIVE.length],
    useStatus: useStatus as any,
    useIn: (useStatus === "사용중" ? USE_IN[i % USE_IN.length] : "") as any,
    gender: (i % 2 === 0 ? GENDERS[0] : GENDERS[1]) as any,
    releaseYear: String(2022 + (i % 4)),
    collectionName: `${vendor} ${2022 + (i % 4)} 컬렉션`,
    sampleLocation: PLACES[(i + 1) % PLACES.length],
    outfitPhotos: [] as OutfitPhoto[],
    createdAt,
    updatedAt: createdAt,
  }) as CmfItem;
}

type Loaded = {
  items: CmfItem[];
  trash: any[];
  logs: any[];
  popular: any[];
};

function buildSeed(): Loaded {
  const now = Date.now();
  const DAY = 86400000;

  const TOTAL = 30; // 활성 24 + 휴지통 6
  const all: CmfItem[] = [];
  for (let i = 0; i < TOTAL; i++) {
    const createdAt = fakeTimestamp(now - (TOTAL - i) * DAY - i * 3600000);
    all.push(buildSeedItem(i, createdAt));
  }

  const trashIdx = new Set([2, 7, 13, 18, 24, 28]); // 6개는 휴지통으로
  const items: CmfItem[] = [];
  const trash: any[] = [];
  const logs: any[] = [];

  all.forEach((item, i) => {
    logs.push({
      id: genId("log"),
      action: "CREATE",
      targetId: item.id,
      payload: { 업체명: item.업체명, No: item.No },
      createdAt: item.createdAt,
    });

    if (trashIdx.has(i)) {
      const deletedAt = fakeTimestamp(now - (TOTAL - i) * DAY * 0.4);
      trash.push({
        id: genId("trash"),
        ...item,
        originalId: item.id,
        deletedAt,
      });
      logs.push({
        id: genId("log"),
        action: "DELETE",
        targetId: item.id,
        payload: { movedToTrash: true },
        createdAt: deletedAt,
      });
    } else {
      items.push(item);
    }
  });

  // 몇 건은 이후 수정된 것처럼(UPDATE 로그) 최근 14일 그래프에 데이터가 보이도록 추가
  const updateSamples = items.slice(0, 10);
  updateSamples.forEach((item, i) => {
    const updatedAt = fakeTimestamp(now - (i % 12) * DAY);
    item.updatedAt = updatedAt;
    logs.push({
      id: genId("log"),
      action: "UPDATE",
      targetId: item.id,
      payload: { note: "데모 시드 수정 이력" },
      createdAt: updatedAt,
    });
  });

  // RESTORE 예시 1건 (로그 다양성용, 실제 아이템 이동은 하지 않음)
  if (items[0]) {
    logs.push({
      id: genId("log"),
      action: "RESTORE",
      targetId: items[0].id,
      payload: { fromTrash: "demo-seed", originalId: items[0].id },
      createdAt: fakeTimestamp(now - 2 * DAY),
    });
  }

  logs.sort((a, b) => (tsToDate(b.createdAt)?.getTime() ?? 0) - (tsToDate(a.createdAt)?.getTime() ?? 0));

  return { items, trash, logs, popular: [] };
}

// ---------------------------------------------------------------------------
// 인메모리 상태 (지연 로드)
// ---------------------------------------------------------------------------

let state: Loaded | null = null;

function ensureLoaded(): Loaded {
  if (state) return state;

  const items = loadLS<CmfItem[]>(LS_KEYS.items);
  const trash = loadLS<any[]>(LS_KEYS.trash);
  const logs = loadLS<any[]>(LS_KEYS.logs);
  const popular = loadLS<any[]>(LS_KEYS.popular);

  if (items && trash && logs) {
    state = { items, trash, logs, popular: popular ?? [] };
    return state;
  }

  state = buildSeed();
  persist();
  return state;
}

function persist() {
  if (!state) return;
  saveLS(LS_KEYS.items, state.items);
  saveLS(LS_KEYS.trash, state.trash);
  saveLS(LS_KEYS.logs, state.logs);
  saveLS(LS_KEYS.popular, state.popular);
}

// ---------------------------------------------------------------------------
// firestore.ts 와 1:1 대응되는 데모 구현
// ---------------------------------------------------------------------------

export async function demoGetFilterMeta(): Promise<{ weights: string[]; comps: string[] }> {
  const s = ensureLoaded();
  return {
    weights: uniqSorted(s.items.map((x) => x.무게)),
    comps: uniqSorted(s.items.map((x: any) => x.comp)),
  };
}

export async function demoGetSidebarFilterOptions() {
  const s = ensureLoaded();
  const docs = s.items as any[];
  return {
    무게: uniqSorted(docs.map((x) => x.무게)),
    업체명: uniqSorted(docs.map((x) => x.업체명)),
    No: uniqSorted(docs.map((x) => x.No)),
    comp: uniqSorted(docs.map((x) => x.comp)),
    width: uniqSorted(docs.map((x) => x.width)),
    mount: uniqSorted(docs.map((x) => x.mount)),
    cost: uniqSorted(docs.map((x) => x.cost)),
    color: uniqSorted(docs.map((x) => x.color)),
  };
}

export async function demoSearchItems(filters: { 무게?: string; comp?: string; color?: string }): Promise<CmfItem[]> {
  const s = ensureLoaded();
  return s.items
    .filter((it: any) => (filters.무게 ? it.무게 === filters.무게 : true))
    .filter((it: any) => (filters.comp ? it.comp === filters.comp : true))
    .filter((it: any) => (filters.color ? (it.colorCodes ?? []).includes(filters.color) : true))
    .map((it) => ({ ...it }))
    .sort((a, b) => (a.id > b.id ? 1 : -1));
}

export async function demoListItemsByColorPage(args: {
  color?: string;
  pageSize?: number;
  afterId?: string | null;
}): Promise<{ items: CmfItem[]; nextAfterId: string | null }> {
  const s = ensureLoaded();
  const pageSize = args.pageSize ?? 20;

  const filtered = s.items
    .filter((it: any) => (args.color ? (it.colorCodes ?? []).includes(args.color) : true))
    .slice()
    .sort((a, b) => (a.id > b.id ? 1 : -1));

  let startIdx = 0;
  if (args.afterId) {
    const idx = filtered.findIndex((x) => x.id === args.afterId);
    startIdx = idx >= 0 ? idx + 1 : 0;
  }

  const page = filtered.slice(startIdx, startIdx + pageSize).map((it) => ({ ...it }));
  const nextAfterId = startIdx + pageSize < filtered.length ? page[page.length - 1]?.id ?? null : null;

  return { items: page, nextAfterId };
}

export async function demoGetColorCount(color?: string): Promise<number> {
  const s = ensureLoaded();
  if (!color) return s.items.length;
  return s.items.filter((it: any) => (it.colorCodes ?? []).includes(color)).length;
}

export async function demoGetItem(id: string): Promise<CmfItem | null> {
  const s = ensureLoaded();
  const found = s.items.find((x) => x.id === id);
  return found ? { ...found } : null;
}

export async function demoAddItem(data: Partial<CmfItem>): Promise<string> {
  const s = ensureLoaded();
  const id = genId("item");
  const now = fakeTimestamp();
  const item = stripUndefined({
    ...data,
    id,
    colorCodes: normalizeColorCodes((data as any).color),
    createdAt: now,
    updatedAt: now,
  }) as CmfItem;

  s.items.unshift(item);
  persist();
  await demoAddLog("CREATE", id, data);
  return id;
}

export async function demoUpdateItem(id: string, data: Partial<CmfItem>): Promise<void> {
  const s = ensureLoaded();
  const idx = s.items.findIndex((x) => x.id === id);
  if (idx === -1) return;

  const prev = s.items[idx] as any;
  const patch = stripUndefined({
    ...data,
    ...((data as any).color !== undefined ? { colorCodes: normalizeColorCodes((data as any).color) } : {}),
    updatedAt: fakeTimestamp(),
  });

  s.items[idx] = { ...prev, ...patch };
  persist();
  await demoAddLog("UPDATE", id, data);
}

export async function demoSoftDelete(id: string): Promise<void> {
  const s = ensureLoaded();
  const idx = s.items.findIndex((x) => x.id === id);
  if (idx === -1) return;

  const [item] = s.items.splice(idx, 1);
  const trashId = genId("trash");
  s.trash.unshift(
    stripUndefined({
      ...item,
      id: trashId,
      originalId: id,
      deletedAt: fakeTimestamp(),
    })
  );
  persist();
  await demoAddLog("DELETE", id, { movedToTrash: true });
}

export async function demoListTrash(): Promise<any[]> {
  const s = ensureLoaded();
  return s.trash.map((d) => ({ ...d }));
}

export async function demoRestoreFromTrash(trashDocId: string): Promise<void> {
  const s = ensureLoaded();
  const idx = s.trash.findIndex((x) => x.id === trashDocId);
  if (idx === -1) return;

  const [entry] = s.trash.splice(idx, 1);
  const { id: _id, originalId, deletedAt: _deletedAt, ...rest } = entry;
  const targetId = (originalId || "").toString().trim() || genId("item");

  const restored = stripUndefined({
    ...rest,
    id: targetId,
    colorCodes: normalizeColorCodes((rest as any)?.color),
    restoredAt: fakeTimestamp(),
    updatedAt: fakeTimestamp(),
  }) as CmfItem;

  s.items.unshift(restored);
  persist();
  await demoAddLog("RESTORE", targetId, { fromTrash: trashDocId, originalId: targetId });
}

export async function demoDeleteTrashPermanently(trashDocId: string): Promise<void> {
  const s = ensureLoaded();
  s.trash = s.trash.filter((x) => x.id !== trashDocId);
  persist();
}

export async function demoGetTotalCount(): Promise<number> {
  return ensureLoaded().items.length;
}

export async function demoGetLastUpdatedDate(): Promise<Date | null> {
  const s = ensureLoaded();
  let latest: Date | null = null;
  for (const it of s.items as any[]) {
    const d = tsToDate(it.updatedAt);
    if (d && (!latest || d > latest)) latest = d;
  }
  return latest;
}

export async function demoAddLog(action: string, targetId: string, payload: any): Promise<void> {
  const s = ensureLoaded();
  s.logs.unshift({
    id: genId("log"),
    action,
    targetId,
    payload: payload ?? null,
    createdAt: fakeTimestamp(),
  });
  // 로그가 과도하게 쌓이지 않도록 상한
  if (s.logs.length > 500) s.logs.length = 500;
  persist();
}

export async function demoListLogs(): Promise<any[]> {
  const s = ensureLoaded();
  return s.logs.slice(0, 50).map((x) => ({ ...x }));
}

export async function demoGetUpdateLogCount(): Promise<number> {
  const s = ensureLoaded();
  return s.logs.filter((x) => x.action === "UPDATE").length;
}

export async function demoLogPopularItems(items: CmfItem[]): Promise<void> {
  const s = ensureLoaded();
  for (const it of items) {
    s.popular.unshift({
      itemId: it.id,
      업체명: (it as any).업체명 ?? "",
      무게: (it as any).무게 ?? "",
      width: (it as any).width ?? "",
      createdAt: fakeTimestamp(),
    });
  }
  if (s.popular.length > 300) s.popular.length = 300;
  persist();
}

export async function demoGetTopSearches(): Promise<
  { itemId: string; 업체명: string; 무게: string; width: string; count: number }[]
> {
  const s = ensureLoaded();
  const recent = s.popular.slice(0, 100);

  const counts: Record<string, { count: number; 업체명: string; 무게: string; width: string }> = {};
  for (const data of recent) {
    const itemId = data.itemId;
    if (!itemId) continue;
    const 업체명 = (data.업체명 ?? "").toString().trim() || "-";
    const 무게 = (data.무게 ?? "").toString().trim() || "-";
    const width = (data.width ?? "").toString().trim() || "-";
    if (!counts[itemId]) counts[itemId] = { count: 0, 업체명, 무게, width };
    counts[itemId].count += 1;
  }

  let result = Object.entries(counts)
    .map(([itemId, v]) => ({ itemId, ...v }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // ✅ 아직 비교 기능을 써보지 않은 상태에서도 대시보드가 비어 보이지 않도록
  //    데모 초기 상태에는 상위 몇 개 아이템으로 그럴듯한 기본값을 보여준다.
  if (result.length === 0) {
    result = s.items.slice(0, 5).map((it: any, i) => ({
      itemId: it.id,
      업체명: it.업체명 ?? "-",
      무게: it.무게 ?? "-",
      width: it.width ?? "-",
      count: 5 - i,
    }));
  }

  return result;
}

export async function demoGetRecentAddedItems(): Promise<CmfItem[]> {
  const s = ensureLoaded();
  return s.items
    .slice()
    .sort((a: any, b: any) => (tsToDate(b.createdAt)?.getTime() ?? 0) - (tsToDate(a.createdAt)?.getTime() ?? 0))
    .slice(0, 5)
    .map((it) => ({ ...it }));
}

export type SeriesPoint = { label: string; value: number };

function dateKeyLocal(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function demoGetUpdateLogSeries(): Promise<SeriesPoint[]> {
  const s = ensureLoaded();
  const map: Record<string, number> = {};
  for (const log of s.logs) {
    if (log.action !== "UPDATE") continue;
    const d = tsToDate(log.createdAt);
    if (!d) continue;
    const key = dateKeyLocal(d);
    map[key] = (map[key] ?? 0) + 1;
  }

  const out: SeriesPoint[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 13; i >= 0; i--) {
    const dt = new Date(today);
    dt.setDate(today.getDate() - i);
    const key = dateKeyLocal(dt);
    out.push({ label: key.slice(5), value: map[key] ?? 0 });
  }
  return out;
}

export async function demoGetDbCountSeries(): Promise<SeriesPoint[]> {
  const total = await demoGetTotalCount();
  const out: SeriesPoint[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 13; i >= 0; i--) {
    const dt = new Date(today);
    dt.setDate(today.getDate() - i);
    const key = dateKeyLocal(dt);
    out.push({ label: key.slice(5), value: total });
  }
  return out;
}

export async function demoListAllItems(max: number = 10000): Promise<CmfItem[]> {
  const s = ensureLoaded();
  return s.items.slice(0, max).map((it) => ({ ...it }));
}

export async function demoListRecentLogs(max: number = 200): Promise<any[]> {
  const s = ensureLoaded();
  return s.logs.slice(0, max).map((x) => ({ ...x }));
}

// ---------------------------------------------------------------------------
// storage.ts 데모 구현 (실제 업로드 없이 File → dataURL 로 변환해서 저장)
// ---------------------------------------------------------------------------

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("파일을 읽지 못했습니다."));
    reader.readAsDataURL(file);
  });
}

export async function demoUploadOutfitPhoto(opts: { itemId: string; file: File }): Promise<OutfitPhoto> {
  const { itemId, file } = opts;
  const MAX_BYTES = 10 * 1024 * 1024;

  if (file.size > MAX_BYTES) {
    throw new Error(`이미지 용량 초과 (최대 ${Math.round(MAX_BYTES / 1024 / 1024)}MB)`);
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("이미지 파일만 업로드할 수 있습니다.");
  }

  const url = await readFileAsDataUrl(file);
  const path = `demo/${itemId}/outfit/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

  return { url, name: file.name, path, createdAt: Date.now() };
}

export async function demoDeleteOutfitPhoto(_path: string): Promise<void> {
  // 데모 모드에서는 실제 파일 저장소가 없으므로 별도 삭제 작업이 필요 없다.
  return;
}
