import { useEffect, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import LineChart from "../components/LineChart";
import {
  getLastUpdatedDate,
  getTopSearches,
  getTotalCount,
  getUpdateLogCount,
  getUpdateLogSeries,
  getDbCountSeries,
  getRecentAddedItems,
} from "../lib/firestore";

type Top = { itemId: string; 업체명: string; 무게: string; width: any; count: number };
type Point = { label: string; value: number };

type CachePayload<T> = { t: number; v: T };

function getCached<T>(key: string, maxAgeMs: number): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const p = JSON.parse(raw) as CachePayload<T>;
    if (!p?.t) return null;
    if (Date.now() - p.t > maxAgeMs) return null;
    return p.v;
  } catch {
    return null;
  }
}

/** ✅ 만료(시간) 상관없이 마지막 캐시값을 가져오기(쿼터 초과 fallback 용) */
function getCachedAny<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const p = JSON.parse(raw) as CachePayload<T>;
    return p?.v ?? null;
  } catch {
    return null;
  }
}

function setCached<T>(key: string, v: T) {
  try {
    localStorage.setItem(key, JSON.stringify({ t: Date.now(), v }));
  } catch {}
}

function formatLastUpdatedKorean(d: Date) {
  const yy = String(d.getFullYear()).slice(-2);
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const hh24 = d.getHours();
  const ampm = hh24 >= 12 ? "오후" : "오전";
  let hh = hh24 % 12;
  if (hh === 0) hh = 12;
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${yy}. ${m}. ${day} ${ampm} ${hh}:${mm}`;
}

function normalizeWidth(width: any) {
  if (width === null || width === undefined) return "-";
  if (typeof width === "number") return String(width);
  if (typeof width === "string") return width.trim() || "-";
  if (typeof width === "object") {
    if ("value" in width && width.value != null) return String(width.value);
  }
  return "-";
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [total, setTotal] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("-");
  const [updateCount, setUpdateCount] = useState<number | null>(null);

  const [top, setTop] = useState<Top[]>([]);
  const [recent, setRecent] = useState<any[]>([]);
  const [updateSeries, setUpdateSeries] = useState<Point[]>([]);
  const [dbSeries, setDbSeries] = useState<Point[]>([]);

  // ✅ React 18 StrictMode에서 useEffect 2회 실행 방지
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    (async () => {
      const ttlCommon = 10 * 60 * 1000; // 일반 데이터 캐시(10분)
      const ttlAgg = 30 * 60 * 1000; // aggregation(count) 캐시(30분)

      // ✅ 캐시(신선한 값) 먼저 UI에 반영
      const cachedTop = getCached<Top[]>("dash_top_v2", ttlCommon);
      const cachedRecent = getCached<any[]>("dash_recent", ttlCommon);
      const cachedUpdateSeries = getCached<Point[]>("dash_update_series_v3", ttlCommon);
      const cachedDbSeries = getCached<Point[]>("dash_db_series_v3", ttlCommon);

      const cachedTotal = getCached<number>("dash_total_v1", ttlAgg);
      const cachedUpdateCount = getCached<number>("dash_update_count_v1", ttlAgg);
      const cachedLastUpdated = getCached<string>("dash_last_updated_v1", ttlCommon);

      if (cachedTop) setTop(cachedTop);
      if (cachedRecent) setRecent(cachedRecent);
      if (cachedUpdateSeries) setUpdateSeries(cachedUpdateSeries);
      if (cachedDbSeries) setDbSeries(cachedDbSeries);

      if (cachedTotal !== null) setTotal(cachedTotal);
      if (cachedUpdateCount !== null) setUpdateCount(cachedUpdateCount);
      if (cachedLastUpdated) setLastUpdated(cachedLastUpdated);

      // ✅ 쿼터 초과(429 / resource-exhausted) 방어: 만료 캐시라도 fallback
      async function safeAggNumber(key: string, fn: () => Promise<number>) {
        try {
          const v = await fn();
          setCached(key, v);
          return v;
        } catch (e: any) {
          const code = e?.code || e?.name || "";
          if (code === "resource-exhausted" || String(code).includes("resource-exhausted")) {
            const stale = getCachedAny<number>(key);
            return stale ?? null;
          }
          console.error(`[dashboard] ${key} failed:`, e);
          const stale = getCachedAny<number>(key);
          return stale ?? null;
        }
      }

      // ✅ total / updateCount는 aggregation이라 캐시 없을 때만 호출
      if (cachedTotal === null) {
        const v = await safeAggNumber("dash_total_v1", getTotalCount);
        if (v !== null) setTotal(v);
      }

      if (cachedUpdateCount === null) {
        const v = await safeAggNumber("dash_update_count_v1", getUpdateLogCount);
        if (v !== null) setUpdateCount(v);
      }

      // ✅ lastUpdated는 날짜 문자열로 저장/표시 (suffix="분" 금지)
      if (!cachedLastUpdated) {
        try {
          const lu = await getLastUpdatedDate();
          const s = lu ? formatLastUpdatedKorean(lu) : "-";
          setLastUpdated(s);
          setCached("dash_last_updated_v1", s);
        } catch (e) {
          console.error("[dashboard] lastUpdated failed:", e);
          setLastUpdated((prev) => prev || "-");
        }
      }

      // ✅ Top5
      if (!cachedTop) {
        try {
          const t = await getTopSearches();
          setTop(t);
          setCached("dash_top_v2", t);
        } catch (e) {
          console.error("[dashboard] top searches failed:", e);
        }
      }

      // ✅ Recent
      if (!cachedRecent) {
        try {
          const r = await getRecentAddedItems();
          setRecent(r);
          setCached("dash_recent", r);
        } catch (e) {
          console.error("[dashboard] recent items failed:", e);
        }
      }

      // ✅ Series (차트)
      if (!cachedUpdateSeries || !cachedDbSeries) {
        try {
          const [u, d] = await Promise.all([getUpdateLogSeries(), getDbCountSeries()]);
          setUpdateSeries(u);
          setDbSeries(d);
          setCached("dash_update_series_v3", u);
          setCached("dash_db_series_v3", d);
        } catch (e) {
          console.error("[dashboard] series failed:", e);
        }
      }
    })();
  }, []);

  function InfoLine(props: {
    itemId: string;
    company: string;
    weight: string;
    width: any;
    right?: ReactNode;
  }) {
    const { itemId, company, weight, width, right } = props;

    const w = normalizeWidth(width);
    const isMissing = [company, weight, w].some((v) => !v || v === "-" || v === "~");

    return (
      <button
        type="button"
        onClick={() => navigate(`/detail/${itemId}`)}
        className="w-full text-left glass rounded-2xl border border-white/60 px-4 py-3 hover:bg-white/80 transition"
      >
        <div className="w-full flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0 scroll-x-touch no-scrollbar">
            <div
              className={`min-w-[720px] grid ${right ? "grid-cols-4" : "grid-cols-3"} gap-x-10 text-sm text-slate-700 whitespace-nowrap`}
            >
              <div className="min-w-0">
                <span className="font-semibold text-slate-600">회사명 :</span>{" "}
                <span className="font-semibold text-slate-800">{company || "-"}</span>
              </div>
              <div className="min-w-0">
                <span className="font-semibold text-slate-600">무게 :</span>{" "}
                <span className="font-semibold text-slate-800">{weight || "-"}</span>
              </div>
              <div className="min-w-0">
                <span className="font-semibold text-slate-600">width :</span>{" "}
                <span className="font-semibold text-slate-800">{w || "-"}</span>
              </div>
              {right ? <div className="text-right">{right}</div> : null}
            </div>
          </div>

          {isMissing ? (
            <span className="text-[11px] px-2 py-1 rounded-full bg-white/70 border border-white/60 text-slate-500">
              데이터 없음
            </span>
          ) : null}
        </div>
      </button>
    );
  }

  return (
    <div className="space-y-6">
      {/* ✅ 카드 4개: 총개수 / 마지막업데이트 / 검색수 / 수정기록 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="총 DB 개수" value={total === null ? "쿼터초과" : total} suffix="건" />
        <Card title="마지막 수정/업데이트" value={lastUpdated} />
        <Card title="가장 많이 사용되는 항목 검색 수" value={top?.[0]?.count ?? 0} suffix="회" />
        <Card title="수정기록 건수" value={updateCount === null ? "쿼터초과" : updateCount} suffix="건" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="font-semibold text-slate-800">자주 검색되는 항목 Top 5</div>
            <button
              type="button"
              className="text-xs underline text-slate-500 hover:text-slate-700"
              onClick={() => navigate("/search")}
            >
              검색으로 이동
            </button>
          </div>

          <div className="space-y-2">
            {top?.length ? (
              top.slice(0, 5).map((x) => (
                <InfoLine
                  key={x.itemId}
                  itemId={x.itemId}
                  company={x.업체명}
                  weight={x.무게}
                  width={x.width}
                  right={<span className="font-semibold text-slate-800">{x.count}회</span>}
                />
              ))
            ) : (
              <div className="text-sm text-slate-500">집계된 검색 기록이 없습니다.</div>
            )}
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="font-semibold text-slate-800 mb-4">최근 추가된 DB</div>

          <div className="space-y-2">
            {recent?.length ? (
              recent.slice(0, 5).map((x: any, i: number) => (
                <InfoLine
                  key={x?.id ?? x?.itemId ?? i}
                  itemId={x?.id ?? x?.itemId ?? ""}
                  company={x?.업체명 ?? "-"}
                  weight={x?.무게 ?? "-"}
                  width={x?.width ?? "-"}
                />
              ))
            ) : (
              <div className="text-sm text-slate-500">최근 추가된 항목이 없습니다.</div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-6">
          <div className="font-semibold text-slate-800 mb-3">수정기록 건수 (최근 14일)</div>
          {updateSeries?.length ? (
            <LineChart points={updateSeries} />
          ) : (
            <div className="text-sm text-slate-500">데이터 없음</div>
          )}
        </div>

        <div className="glass-card p-6">
          <div className="font-semibold text-slate-800 mb-3">DB 개수 (최근 14일)</div>
          {dbSeries?.length ? (
            <LineChart points={dbSeries} />
          ) : (
            <div className="text-sm text-slate-500">데이터 없음</div>
          )}
        </div>
      </div>
    </div>
  );
}

function Card({
  title,
  value,
  suffix,
}: {
  title: string;
  value: any;
  suffix?: string;
}) {
  // ✅ 문자열(예: '쿼터초과', '-')일 때 suffix 붙지 않게
  const showSuffix = !!suffix && typeof value === "number";

  return (
    <div className="glass-card p-6">
      <div className="text-xs text-slate-500 mb-2">{title}</div>
      <div className="text-2xl font-semibold text-slate-800 leading-tight break-words">
        {value}
        {showSuffix ? <span className="ml-1">{suffix}</span> : null}
      </div>
    </div>
  );
}