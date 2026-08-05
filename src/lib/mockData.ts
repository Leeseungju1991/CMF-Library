import type { CmfItem } from "./types";

/**
 * 데모 모드(Firebase 미연동) 인메모리 더미 데이터.
 * firestore.ts 의 모든 export 와 동일한 시그니처를 미러링한다 — 백엔드 없이
 * test/test 로그인 후 검색/필터/비교/추가/삭제까지 클릭 테스트가 가능하도록.
 * 세션 중 추가/수정/삭제는 반영되지만 새로고침하면 초기 데이터로 리셋된다.
 */

let idSeq = 1000;
function nextId(): string {
  idSeq += 1;
  return `demo-${idSeq}`;
}

function uniqSorted(arr: (string | undefined)[]): string[] {
  const set = new Set<string>();
  for (const v of arr) {
    const s = (v ?? "").toString().trim();
    if (!s) continue;
    set.add(s);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, "ko"));
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function stripUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  const out: any = {};
  for (const [k, v] of Object.entries(obj)) if (v !== undefined) out[k] = v;
  return out;
}

function normalizeColorCodes(color: any): string[] {
  const t = (color ?? "").toString().trim();
  if (!t) return [];
  if (t.includes("/")) return t.split("/").map((x) => x.trim()).filter(Boolean);
  return [t];
}

let items: CmfItem[] = [
  { id: "demo-1", 무게: "180g", 업체명: "㈜동양섬유", No: "TY-0231", comp: "Cotton 100%", width: "150cm", mount: "롤", cost: "3,200원/y", color: "WH", colorCodes: ["WH"], 조직: "평직", 전화번호: "031-000-1111", 장소: "A동 3열", 아카이빙: "완료", useStatus: "사용중", useIn: "ICONIA", gender: "", releaseYear: "2025", collectionName: "스프링 컬렉션", sampleLocation: "본사 샘플실", createdAt: daysAgo(30), updatedAt: daysAgo(2) },
  { id: "demo-2", 무게: "220g", 업체명: "삼일방직", No: "SI-1042", comp: "Polyester 100%", width: "160cm", mount: "롤", cost: "2,800원/y", color: "BK", colorCodes: ["BK"], 조직: "트윌", 전화번호: "02-555-2222", 장소: "A동 4열", 아카이빙: "완료", useStatus: "사용중", useIn: "THE GEM", gender: "여아", releaseYear: "2025", collectionName: "가을 컬렉션", sampleLocation: "본사 샘플실", createdAt: daysAgo(28), updatedAt: daysAgo(5) },
  { id: "demo-3", 무게: "150g", 업체명: "㈜백양", No: "BY-0788", comp: "Cotton/Poly 65/35", width: "145cm", mount: "원단지", cost: "3,500원/y", color: "PK", colorCodes: ["PK"], 조직: "펀칭", 전화번호: "032-777-3333", 장소: "B동 1열", 아카이빙: "진행중", useStatus: "사용중", useIn: "NEOR", gender: "여아", releaseYear: "2026", collectionName: "봄 신상", sampleLocation: "디자인실", createdAt: daysAgo(20), updatedAt: daysAgo(1) },
  { id: "demo-4", 무게: "300g", 업체명: "한일텍스", No: "HI-2091", comp: "Wool 80% / Nylon 20%", width: "150cm", mount: "롤", cost: "8,900원/y", color: "GY", colorCodes: ["GY"], 조직: "헤링본", 전화번호: "031-444-8888", 장소: "A동 1열", 아카이빙: "완료", useStatus: "사용중", useIn: "IDEALIAN", gender: "", releaseYear: "2025", collectionName: "윈터 컬렉션", sampleLocation: "본사 샘플실", createdAt: daysAgo(60), updatedAt: daysAgo(10) },
  { id: "demo-5", 무게: "95g", 업체명: "㈜대성니트", No: "DS-0512", comp: "Rayon 100%", width: "170cm", mount: "롤", cost: "4,100원/y", color: "KH", colorCodes: ["KH"], 조직: "니트", 전화번호: "051-222-9999", 장소: "B동 2열", 아카이빙: "완료", useStatus: "미사용", useIn: "NEORm", gender: "남아", releaseYear: "2024", collectionName: "베이직", sampleLocation: "창고", createdAt: daysAgo(90), updatedAt: daysAgo(45) },
  { id: "demo-6", 무게: "410g", 업체명: "㈜동양섬유", No: "TY-0987", comp: "Denim Cotton 100%", width: "148cm", mount: "롤", cost: "5,600원/y", color: "BL", colorCodes: ["BL"], 조직: "데님", 전화번호: "031-000-1111", 장소: "A동 3열", 아카이빙: "완료", useStatus: "사용중", useIn: "ICONIA", gender: "남아", releaseYear: "2026", collectionName: "스프링 컬렉션", sampleLocation: "본사 샘플실", createdAt: daysAgo(15), updatedAt: daysAgo(0) },
  { id: "demo-7", 무게: "130g", 업체명: "삼일방직", No: "SI-1199", comp: "Cotton 95% / Spandex 5%", width: "155cm", mount: "원단지", cost: "3,900원/y", color: "WH/PK", colorCodes: ["WH", "PK"], 조직: "저지", 전화번호: "02-555-2222", 장소: "A동 4열", 아카이빙: "진행중", useStatus: "사용중", useIn: "THE GEM", gender: "여아", releaseYear: "2026", collectionName: "가을 컬렉션", sampleLocation: "디자인실", createdAt: daysAgo(8), updatedAt: daysAgo(0) },
  { id: "demo-8", 무게: "260g", 업체명: "㈜백양", No: "BY-1350", comp: "Polyester 90% / Spandex 10%", width: "150cm", mount: "롤", cost: "4,700원/y", color: "GN", colorCodes: ["GN"], 조직: "트윌", 전화번호: "032-777-3333", 장소: "B동 1열", 아카이빙: "완료", useStatus: "사용중", useIn: "NEOR", gender: "", releaseYear: "2025", collectionName: "봄 신상", sampleLocation: "본사 샘플실", createdAt: daysAgo(50), updatedAt: daysAgo(20) },
];

let trash: Array<CmfItem & { originalId?: string; deletedAt?: Date }> = [];

let logs: Array<{ id: string; action: string; targetId: string; payload: unknown; createdAt: Date }> = [
  { id: nextId(), action: "CREATE", targetId: "demo-1", payload: { 업체명: "㈜동양섬유" }, createdAt: daysAgo(30) },
  { id: nextId(), action: "UPDATE", targetId: "demo-1", payload: { color: "WH" }, createdAt: daysAgo(2) },
  { id: nextId(), action: "UPDATE", targetId: "demo-3", payload: { useStatus: "사용중" }, createdAt: daysAgo(1) },
  { id: nextId(), action: "CREATE", targetId: "demo-7", payload: { 업체명: "삼일방직" }, createdAt: daysAgo(8) },
];

let popular: Array<{ itemId: string; 업체명: string; 무게: string; width: string; createdAt: Date }> = [
  { itemId: "demo-1", 업체명: "㈜동양섬유", 무게: "180g", width: "150cm", createdAt: daysAgo(3) },
  { itemId: "demo-1", 업체명: "㈜동양섬유", 무게: "180g", width: "150cm", createdAt: daysAgo(2) },
  { itemId: "demo-3", 업체명: "㈜백양", 무게: "150g", width: "145cm", createdAt: daysAgo(1) },
];

export async function getFilterMeta(): Promise<{ weights: string[]; comps: string[] } | null> {
  return { weights: uniqSorted(items.map((i) => i.무게)), comps: uniqSorted(items.map((i) => i.comp)) };
}

export async function getSidebarFilterOptions() {
  return {
    무게: uniqSorted(items.map((i) => i.무게)),
    업체명: uniqSorted(items.map((i) => i.업체명)),
    No: uniqSorted(items.map((i) => i.No)),
    comp: uniqSorted(items.map((i) => i.comp)),
    width: uniqSorted(items.map((i) => i.width)),
    mount: uniqSorted(items.map((i) => i.mount)),
    cost: uniqSorted(items.map((i) => i.cost)),
    color: uniqSorted(items.flatMap((i) => i.colorCodes ?? [])),
  };
}

export async function searchItems(filters: { 무게?: string; comp?: string; color?: string }): Promise<CmfItem[]> {
  return items.filter((i) => {
    if (filters.무게 && i.무게 !== filters.무게) return false;
    if (filters.comp && i.comp !== filters.comp) return false;
    if (filters.color && !(i.colorCodes ?? []).includes(filters.color)) return false;
    return true;
  });
}

export async function listItemsByColorPage(args: {
  color?: string;
  pageSize?: number;
  afterId?: string | null;
}): Promise<{ items: CmfItem[]; nextAfterId: string | null }> {
  const pageSize = args.pageSize ?? 20;
  const filtered = args.color ? items.filter((i) => (i.colorCodes ?? []).includes(args.color!)) : items;
  const startIdx = args.afterId ? filtered.findIndex((i) => i.id === args.afterId) + 1 : 0;
  const page = filtered.slice(startIdx, startIdx + pageSize);
  const nextAfterId = page.length === pageSize ? page[page.length - 1].id : null;
  return { items: page, nextAfterId };
}

export async function getColorCount(color?: string): Promise<number> {
  if (!color) return items.length;
  return items.filter((i) => (i.colorCodes ?? []).includes(color)).length;
}

export async function getItem(id: string): Promise<CmfItem | null> {
  return items.find((i) => i.id === id) ?? null;
}

export async function addItem(data: Partial<CmfItem>) {
  const id = nextId();
  const item = {
    ...stripUndefined(data as any),
    id,
    colorCodes: normalizeColorCodes((data as any).color),
    createdAt: new Date(),
    updatedAt: new Date(),
  } as CmfItem;
  items = [item, ...items];
  logs = [{ id: nextId(), action: "CREATE", targetId: id, payload: data, createdAt: new Date() }, ...logs];
  return id;
}

export async function updateItem(id: string, data: Partial<CmfItem>) {
  items = items.map((i) =>
    i.id === id
      ? {
          ...i,
          ...stripUndefined(data as any),
          ...((data as any).color !== undefined ? { colorCodes: normalizeColorCodes((data as any).color) } : {}),
          updatedAt: new Date(),
        }
      : i
  );
  logs = [{ id: nextId(), action: "UPDATE", targetId: id, payload: data, createdAt: new Date() }, ...logs];
}

export async function softDelete(id: string) {
  const item = items.find((i) => i.id === id);
  if (!item) return;
  trash = [{ ...item, originalId: id, deletedAt: new Date() }, ...trash];
  items = items.filter((i) => i.id !== id);
  logs = [{ id: nextId(), action: "DELETE", targetId: id, payload: { movedToTrash: true }, createdAt: new Date() }, ...logs];
}

export async function listTrash() {
  return trash.map((t) => ({ ...t }));
}

export async function restoreFromTrash(trashDocId: string) {
  const t = trash.find((x) => x.id === trashDocId);
  if (!t) return;
  const { originalId, deletedAt, id: _tid, ...rest } = t as any;
  const targetId = originalId || nextId();
  items = [{ ...(rest as CmfItem), id: targetId, updatedAt: new Date() }, ...items];
  trash = trash.filter((x) => x.id !== trashDocId);
  logs = [{ id: nextId(), action: "RESTORE", targetId, payload: { fromTrash: trashDocId }, createdAt: new Date() }, ...logs];
}

export async function deleteTrashPermanently(trashDocId: string) {
  trash = trash.filter((x) => x.id !== trashDocId);
}

export async function getTotalCount() {
  return items.length;
}

export async function getLastUpdatedDate(): Promise<Date | null> {
  if (items.length === 0) return null;
  return items.reduce(
    (max, i) => ((i.updatedAt as Date) > max ? (i.updatedAt as Date) : max),
    items[0].updatedAt as Date
  );
}

export async function addLog(action: string, targetId: string, payload: any) {
  logs = [{ id: nextId(), action, targetId, payload: payload ?? null, createdAt: new Date() }, ...logs];
}

export async function listLogs() {
  return logs.slice(0, 50);
}

export async function getUpdateLogCount(): Promise<number> {
  return logs.filter((l) => l.action === "UPDATE").length;
}

export async function logPopularItems(selected: CmfItem[]) {
  const createdAt = new Date();
  popular = [
    ...selected.map((it) => ({ itemId: it.id, 업체명: it.업체명 ?? "", 무게: it.무게 ?? "", width: it.width ?? "", createdAt })),
    ...popular,
  ];
}

export async function getTopSearches() {
  const counts: Record<string, { count: number; 업체명: string; 무게: string; width: string }> = {};
  for (const p of popular) {
    if (!counts[p.itemId]) counts[p.itemId] = { count: 0, 업체명: p.업체명, 무게: p.무게, width: p.width };
    counts[p.itemId].count += 1;
  }
  return Object.entries(counts)
    .map(([itemId, v]) => ({ itemId, ...v }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

export async function getRecentAddedItems(): Promise<CmfItem[]> {
  return [...items]
    .sort((a, b) => (b.createdAt as Date).getTime() - (a.createdAt as Date).getTime())
    .slice(0, 5);
}

function dateKeyLocal(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function getUpdateLogSeries() {
  const map: Record<string, number> = {};
  for (const l of logs) {
    if (l.action !== "UPDATE") continue;
    const key = dateKeyLocal(l.createdAt);
    map[key] = (map[key] ?? 0) + 1;
  }
  const out: { label: string; value: number }[] = [];
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

export async function getDbCountSeries() {
  const total = items.length;
  const out: { label: string; value: number }[] = [];
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

export async function listAllItems(max: number = 10000): Promise<CmfItem[]> {
  return items.slice(0, max);
}

export async function listRecentLogs(max: number = 200) {
  return logs.slice(0, max);
}
