import {
  addDoc,
  collection,
  deleteDoc,
  documentId,
  doc,
  getDoc,
  getDocs,
  getCountFromServer,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  startAfter,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import type { CmfItem } from "./types";


function normalizeColorCodes(color: any): string[] {
  const t = (color ?? "").toString().trim();
  if (!t) return [];
  // KH/GY/GN/PK 형태 지원
  if (t.includes("/")) return t.split("/").map((x) => x.trim()).filter(Boolean);
  return [t];
}

/** ✅ 필터 옵션(메타) 1회 읽기: cmfMeta/filters */
export async function getFilterMeta(): Promise<{ weights: string[]; comps: string[] } | null> {
  const snap = await getDoc(doc(db, "cmfMeta", "filters"));
  if (!snap.exists()) return null;
  const data: any = snap.data();
  return {
    weights: Array.isArray(data.weights) ? data.weights : [],
    comps: Array.isArray(data.comps) ? data.comps : [],
  };
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

/**
 * ✅ 사이드바 필터(2단 체크박스) 옵션
 * - 우선: cmfMeta/filters 문서에 저장된 배열들을 사용
 * - 없으면: cmfItems 에서 최대 2000개를 읽어 distinct 를 계산
 */
export async function getSidebarFilterOptions(): Promise<{
  무게: string[];
  업체명: string[];
  No: string[];
  comp: string[];
  width: string[];
  mount: string[];
  cost: string[];
  color: string[];
}> {
  // 1) meta 우선
  const metaSnap = await getDoc(doc(db, "cmfMeta", "filters"));
  if (metaSnap.exists()) {
    const m: any = metaSnap.data() ?? {};
    const maybe = {
      무게: Array.isArray(m.weights) ? m.weights : m.무게,
      업체명: Array.isArray(m.vendors) ? m.vendors : m.업체명,
      No: Array.isArray(m.nos) ? m.nos : m.No,
      comp: Array.isArray(m.comps) ? m.comps : m.comp,
      width: Array.isArray(m.widths) ? m.widths : m.width,
      mount: Array.isArray(m.mounts) ? m.mounts : m.mount,
      cost: Array.isArray(m.costs) ? m.costs : m.cost,
      color: Array.isArray(m.colors) ? m.colors : m.color,
    } as any;

    const hasExtended =
      Array.isArray(m.vendors) ||
      Array.isArray(m.nos) ||
      Array.isArray(m.widths) ||
      Array.isArray(m.mounts) ||
      Array.isArray(m.costs) ||
      Array.isArray(m.colors);

    if (hasExtended) {
      return {
        무게: uniqSorted(maybe.무게 ?? []),
        업체명: uniqSorted(maybe.업체명 ?? []),
        No: uniqSorted(maybe.No ?? []),
        comp: uniqSorted(maybe.comp ?? []),
        width: uniqSorted(maybe.width ?? []),
        mount: uniqSorted(maybe.mount ?? []),
        cost: uniqSorted(maybe.cost ?? []),
        color: uniqSorted(maybe.color ?? []),
      };
    }
  }

  // 2) fallback: items 스캔
  const q = query(collection(db, "cmfItems"), orderBy(documentId()), limit(2000));
  const snap = await getDocs(q);
  const docs = snap.docs.map((d) => d.data() as any);
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

function stripUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  const out: any = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v;
  }
  return out;
}

/** 검색 (무게 -> comp -> color) */
export async function searchItems(filters: { 무게?: string; comp?: string; color?: string }): Promise<CmfItem[]> {
  const conds: any[] = [];
  if (filters.무게) conds.push(where("무게", "==", filters.무게));
  if (filters.comp) conds.push(where("comp", "==", filters.comp));
  if (filters.color) conds.push(where("colorCodes", "array-contains", filters.color));

  // ⚠️ 기존에는 limit(200) 때문에 검색 결과가 최대 200개만 노출되어
  // 대시보드/DB 총 개수와 불일치가 발생했습니다.
  // 현재 DB 규모(수백 건)에서는 전체 조회가 가능하므로 limit를 제거합니다.
  // (향후 수만 건 이상으로 커지면 페이지네이션/무한스크롤로 전환 권장)
  const q = query(collection(db, "cmfItems"), ...conds, orderBy(documentId()));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
}

/**
 * ✅ 비교 선택용: 컬러 기준 페이지네이션 리스트
 * - 20개씩
 * - next 페이지를 위해 afterId(마지막 문서 id)를 넘김
 */
export async function listItemsByColorPage(args: {
  color?: string;
  pageSize?: number;
  afterId?: string | null;
}): Promise<{ items: CmfItem[]; nextAfterId: string | null }> {
  const pageSize = args.pageSize ?? 20;

  const conds: any[] = [];
  if (args.color) conds.push(where("colorCodes", "array-contains", args.color));

  // 문서 ID 기반 정렬/페이지네이션 (가장 안정적)
  const base = query(collection(db, "cmfItems"), ...conds, orderBy(documentId()), limit(pageSize));
  const q = args.afterId ? query(collection(db, "cmfItems"), ...conds, orderBy(documentId()), startAfter(args.afterId), limit(pageSize)) : base;

  const snap = await getDocs(q);
  const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
  const nextAfterId = snap.docs.length === pageSize ? snap.docs[snap.docs.length - 1].id : null;
  return { items, nextAfterId };
}

/** ✅ 색상 비교: 특정 color(=colorCodes array-contains) 전체 개수 */
export async function getColorCount(color?: string): Promise<number> {
  if (!color) return await getTotalCount();
  const agg = await getCountFromServer(query(collection(db, "cmfItems"), where("colorCodes", "array-contains", color)));
  return agg.data().count;
}

export async function getItem(id: string): Promise<CmfItem | null> {
  const snap = await getDoc(doc(db, "cmfItems", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as any) };
}

export async function addItem(data: Partial<CmfItem>) {
  const ref = await addDoc(
    collection(db, "cmfItems"),
    stripUndefined({
      ...data,
      colorCodes: normalizeColorCodes((data as any).color),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  );
  await addLog("CREATE", ref.id, data);
  return ref.id;
}

export async function updateItem(id: string, data: Partial<CmfItem>) {
  await updateDoc(
    doc(db, "cmfItems", id),
    stripUndefined({
      ...data,
      ...(data as any).color !== undefined ? { colorCodes: normalizeColorCodes((data as any).color) } : {},
      updatedAt: serverTimestamp(),
    })
  );
  await addLog("UPDATE", id, data);
}

export async function softDelete(id: string) {
  const item = await getItem(id);
  if (!item) return;

  await addDoc(
    collection(db, "cmfTrash"),
    stripUndefined({
      ...item,
      originalId: id,
      deletedAt: serverTimestamp(),
    })
  );

  await deleteDoc(doc(db, "cmfItems", id));
  await addLog("DELETE", id, { movedToTrash: true });
}

export async function listTrash(): Promise<any[]> {
  const snap = await getDocs(collection(db, "cmfTrash"));
  // NOTE:
  //  - softDelete 시 trash 문서에 원본 item을 그대로 저장하는데,
  //    item 객체에 `id`(원본 doc id)가 포함되어 있습니다.
  //  - 기존 구현({ id: d.id, ...data })은 data.id가 id를 덮어써서
  //    UI에서 trashDocId 대신 원본 id를 전달하게 되었고, 복구/완전삭제가 동작하지 않았습니다.
  return snap.docs.map((d) => {
    const data: any = d.data() ?? {};
    const { id: _embeddedId, ...rest } = data;
    return { id: d.id, ...rest };
  });
}

export async function restoreFromTrash(trashDocId: string) {
  const snap = await getDoc(doc(db, "cmfTrash", trashDocId));
  if (!snap.exists()) return;

  const data: any = snap.data();
  const originalId = (data.originalId ?? "").toString().trim();
  const embeddedId = (data.id ?? "").toString().trim();

  // trash 메타 필드 제거
  const { id: _id, originalId: _orig, deletedAt: _delAt, ...rest } = data ?? {};

  const payload = stripUndefined({
    ...rest,
    colorCodes: normalizeColorCodes((rest as any)?.color),
    restoredAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const targetId = originalId || embeddedId;

  if (targetId) {
    // 원본 문서 ID로 복원(기존 링크/참조 유지)
    await setDoc(doc(db, "cmfItems", targetId), payload as any);
    await deleteDoc(doc(db, "cmfTrash", trashDocId));
    await addLog("RESTORE", targetId, { fromTrash: trashDocId, originalId: targetId });
    return;
  }

  // 혹시 원본 id가 없으면 새 문서로 복원
  const newRef = await addDoc(collection(db, "cmfItems"), payload as any);
  await deleteDoc(doc(db, "cmfTrash", trashDocId));
  await addLog("RESTORE", newRef.id, { fromTrash: trashDocId, originalId: null });
}

export async function deleteTrashPermanently(trashDocId: string) {
  await deleteDoc(doc(db, "cmfTrash", trashDocId));
}

export async function getTotalCount() {
  // 기존 구현은 deleted==false 필터가 걸려 있었는데,
  // 현재 앱 로직은 삭제 시 cmfTrash 로 이동 후 cmfItems 에서 문서를 삭제합니다.
  // 따라서 대부분의 문서에 deleted 필드가 존재하지 않아 카운트가 0으로 보이는 문제가 있었습니다.
  const snap = await getCountFromServer(collection(db, "cmfItems"));
  return snap.data().count;
}

export async function getLastUpdatedDate(): Promise<Date | null> {
  const q = query(collection(db, "cmfItems"), orderBy("updatedAt", "desc"), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const data: any = snap.docs[0].data();
  return data.updatedAt?.toDate?.() ?? null;
}

export async function addLog(action: string, targetId: string, payload: any) {
  await addDoc(collection(db, "cmfLogs"), {
    action,
    targetId,
    payload: payload ?? null,
    createdAt: serverTimestamp(),
  });
}

export async function listLogs() {
  const q = query(collection(db, "cmfLogs"), orderBy("createdAt", "desc"), limit(50));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
}

/** ✅ 대시보드: 수정(UPDATE) 기록 건수 */
export async function getUpdateLogCount(): Promise<number> {
  const agg = await getCountFromServer(query(collection(db, "cmfLogs"), where("action", "==", "UPDATE")));
  return agg.data().count;
}

/**
 * ✅ 비교 선택/활용 로그(Top5) 저장
 * - 대시보드 Top5 표기에 필요한 정보만 저장
 */
export async function logPopularItems(items: CmfItem[]) {
  const col = collection(db, "cmfPopular");
  await Promise.all(
    items.map((it) =>
      addDoc(col, {
        itemId: it.id,
        업체명: it.업체명 ?? "",
        무게: it.무게 ?? "",
        width: it.width ?? "",
        createdAt: serverTimestamp(),
      })
    )
  );
}

/** ✅ 대시보드: 자주 사용(선택)되는 항목 Top5 */
export async function getTopSearches(): Promise<
  { itemId: string; 업체명: string; 무게: string; width: string; count: number }[]
> {
  const q = query(collection(db, "cmfPopular"), orderBy("createdAt", "desc"), limit(100));
  const snap = await getDocs(q);

  // itemId 기준 집계 + label(업체명/무게/width) 보관
  const counts: Record<
    string,
    {
      count: number;
      업체명: string;
      무게: string;
      width: string;
    }
  > = {};

  snap.docs.forEach((d) => {
    const data: any = d.data();
    const itemId = data.itemId;
    if (!itemId) return;
    const 업체명 = (data.업체명 ?? "").toString().trim() || "-";
    const 무게 = (data.무게 ?? "").toString().trim() || "-";
    const width = (data.width ?? "").toString().trim() || "-";

    if (!counts[itemId]) counts[itemId] = { count: 0, 업체명, 무게, width };
    counts[itemId].count += 1;
  });

  return Object.entries(counts)
    .map(([itemId, v]) => ({ itemId, ...v }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

/** ✅ 대시보드: 최근 추가된 DB 5개 */
export async function getRecentAddedItems(): Promise<CmfItem[]> {
  const q = query(collection(db, "cmfItems"), orderBy("createdAt", "desc"), limit(5));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
}



export type SeriesPoint = { label: string; value: number };

function dateKeyLocal(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** 대시보드 그래프: 수정기록(UPDATE) 일별 집계 (최근 14일) */
export async function getUpdateLogSeries(): Promise<SeriesPoint[]> {
  // NOTE: where(action==...) + orderBy(createdAt) 조합은 Firestore에서
  // 복합 인덱스를 요구할 수 있습니다. (환경에 따라 그래프만 비는 이슈)
  // 인덱스 없이 동작하도록 최근 로그를 가져온 뒤, 클라이언트에서 action==UPDATE만 필터링합니다.
  const snap = await getDocs(query(collection(db, "cmfLogs"), orderBy("createdAt", "desc"), limit(200)));
  const map: Record<string, number> = {};
  for (const d of snap.docs) {
    const data: any = d.data();
    if ((data.action ?? "") !== "UPDATE") continue;
    const ts = data.createdAt?.toDate ? data.createdAt.toDate() : null;
    if (!ts) continue;
    const key = dateKeyLocal(ts); // YYYY-MM-DD (local)
    map[key] = (map[key] ?? 0) + 1;
  }

  // 최근 14일 채우기
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

/** 대시보드 그래프: DB 개수 (최근 14일 - 현재 값 기준 표시) */
export async function getDbCountSeries(): Promise<SeriesPoint[]> {
  const total = await getTotalCount();
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

/**
 * ✅ 전체 항목 조회 — CSV 내보내기 / 전체텍스트 검색에 사용
 * 기본 limit 10,000. 그 이상이 필요하면 페이지네이션을 고려해야 함.
 */
export async function listAllItems(max: number = 10000): Promise<CmfItem[]> {
  const q = query(collection(db, "cmfItems"), orderBy(documentId()), limit(max));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
}

/**
 * ✅ 전체 활동 로그 조회 — Logs 페이지에 사용
 */
export async function listRecentLogs(max: number = 200): Promise<any[]> {
  const q = query(collection(db, "cmfLogs"), orderBy("createdAt", "desc"), limit(max));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
}

/**
 * ✅ CSV 직렬화 — 자주 쓰이는 컬럼 우선, 누락 필드는 빈문자.
 * Excel/한글환경 호환성을 위해 BOM 포함.
 */
const CSV_COLUMNS: (keyof CmfItem | string)[] = [
  "id",
  "무게",
  "업체명",
  "No",
  "comp",
  "width",
  "mount",
  "cost",
  "color",
  "colorCodes",
  "조직",
  "전화번호",
  "장소",
  "아카이빙",
  "useStatus",
  "useIn",
  "gender",
  "releaseYear",
  "collectionName",
  "sampleLocation",
  "createdAt",
  "updatedAt",
];

function csvCell(v: any): string {
  if (v === null || v === undefined) return "";
  if (Array.isArray(v)) return v.join("/");
  if (typeof v === "object" && v.toDate) {
    try {
      return new Date(v.toDate()).toISOString();
    } catch {
      return "";
    }
  }
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function itemsToCsv(items: CmfItem[]): string {
  const header = CSV_COLUMNS.join(",");
  const rows = items.map((it) =>
    CSV_COLUMNS.map((col) => csvCell((it as any)[col])).join(",")
  );
  return "﻿" + [header, ...rows].join("\r\n");
}
