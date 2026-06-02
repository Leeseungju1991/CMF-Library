import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import fixedSwatch from "../assets/fixed-swatch.png";
import Snackbar from "../components/Snackbar";
import { getFilterMeta, searchItems, softDelete } from "../lib/firestore";
import { useSidebarFilters, type FilterKey } from "../lib/filterContext";
import type { CmfItem } from "../lib/types";

type Open = "무게" | "comp" | "color" | null;

const FIXED_COLORS = [
  "BE","BK","BL","BN","BRG","BV","CAM","CH","DB","Denim","DY","GD","GN","GY","IV","KH","LB","LG","LM","MT","NV","Neon","OLV","OR","ORG","PCH","PK","PU","PUR","RD","SB","SLV","VI","VT","WH","W-G","YE","YG","YL","YW","WN","BG"
];

// (사이드바 체크박스 옵션은 DB에서 미리 로드됨: filterContext)
function applySidebarFilters<T extends Record<string, any>>(
  rows: T[],
  fieldKeys: FilterKey[],
  valueSelections: Record<FilterKey, string[]>
) {
  const activeKeys = fieldKeys.filter((k) => (valueSelections[k] ?? []).length > 0);
  if (activeKeys.length === 0) return rows;

  return rows.filter((r) =>
    activeKeys.every((k) => {
      const sel = valueSelections[k] ?? [];
      const v = (r as any)[k];
      const s = (v ?? "").toString().trim();
      return sel.includes(s);
    })
  );
}

const TEXT_SEARCH_FIELDS: (keyof CmfItem | string)[] = [
  "업체명",
  "No",
  "comp",
  "color",
  "조직",
  "장소",
  "아카이빙",
  "collectionName",
  "sampleLocation",
];

function applyTextQuery<T extends Record<string, any>>(rows: T[], q: string): T[] {
  const needle = q.trim().toLowerCase();
  if (!needle) return rows;
  return rows.filter((r) =>
    TEXT_SEARCH_FIELDS.some((k) => {
      const v = (r as any)[k];
      if (v == null) return false;
      if (Array.isArray(v)) return v.some((x) => String(x).toLowerCase().includes(needle));
      return String(v).toLowerCase().includes(needle);
    })
  );
}

export default function SearchPage() {
  const [meta, setMeta] = useState<{ weights: string[]; comps: string[] } | null>(null);
  const [loadingMeta, setLoadingMeta] = useState(false);

  const [무게, set무게] = useState("");
  const [comp, setComp] = useState("");
  const [color, setColor] = useState("");
  const [textQuery, setTextQuery] = useState("");

  const [open, setOpen] = useState<Open>(null);

  const [rawItems, setRawItems] = useState<CmfItem[]>([]);
  const [items, setItems] = useState<CmfItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);

  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState("");

  // ✅ 그리드로 바꾸면서 1페이지 카드 수 증가
  const PAGE_SIZE = 12;
  const navigate = useNavigate();

  const { fieldKeys, valueSelections, applyVersion } = useSidebarFilters();
  const didMountRef = useRef(false);

  useEffect(() => {
    (async () => {
      setLoadingMeta(true);
      try {
        const m = await getFilterMeta();
        setMeta(m);
      } finally {
        setLoadingMeta(false);
      }
    })();
  }, []);

  // ✅ 사이드바에서 "적용"을 누르면(=applyVersion 변경) 현재 검색 결과를 재필터링
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }

    // 1) 이미 검색 결과가 있으면: 그 결과를 재필터링
    if (rawItems.length > 0) {
      const filtered = applyTextQuery(applySidebarFilters(rawItems, fieldKeys, valueSelections), textQuery);
      setItems(filtered);
      setPage(0);
      return;
    }

    // 2) 아직 검색을 안 했는데 필터를 적용했다면:
    (async () => {
      setLoading(true);
      try {
        const res = await searchItems({
          무게: 무게 || undefined,
          comp: comp || undefined,
          color: color || undefined,
        });
        setRawItems(res);
        const filtered = applyTextQuery(applySidebarFilters(res, fieldKeys, valueSelections), textQuery);
        setItems(filtered);
        setPage(0);
      } finally {
        setLoading(false);
      }
    })();
  }, [applyVersion, rawItems, fieldKeys, valueSelections, 무게, comp, color, textQuery]);

  // ✅ 텍스트 검색어가 바뀌면 현재 결과 안에서 즉시 재필터링
  useEffect(() => {
    if (rawItems.length === 0) return;
    const filtered = applyTextQuery(applySidebarFilters(rawItems, fieldKeys, valueSelections), textQuery);
    setItems(filtered);
    setPage(0);
  }, [textQuery]);

  const 무게Options = useMemo(() => meta?.weights ?? [], [meta]);
  const compOptions = useMemo(() => meta?.comps ?? [], [meta]);
  const colorOptions = FIXED_COLORS;

  // 상위 필터 변경 시 하위 필터 초기화
  useEffect(() => {
    setComp("");
    setColor("");
  }, [무게]);
  useEffect(() => {
    setColor("");
  }, [comp]);

  async function doSearch() {
    setLoading(true);
    try {
      const res = await searchItems({
        무게: 무게 || undefined,
        comp: comp || undefined,
        color: color || undefined,
      });

      setRawItems(res);

      const filtered = applyTextQuery(applySidebarFilters(res, fieldKeys, valueSelections), textQuery);
      setItems(filtered);
      setPage(0);
      setOpen(null);

      if (res.length === 0) {
        setSnackMsg("검색 결과가 없습니다.");
        setSnackOpen(true);
      }
    } finally {
      setLoading(false);
    }
  }

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageItems = useMemo(() => {
    const start = page * PAGE_SIZE;
    return items.slice(start, start + PAGE_SIZE);
  }, [items, page]);

  async function onDelete(id: string) {
    if (!confirm("삭제 후 휴지통으로 이동합니다. 계속할까요?")) return;

    await softDelete(id);

    const nextRaw = rawItems.filter((x) => x.id !== id);
    setRawItems(nextRaw);

    const nextItems = items.filter((x) => x.id !== id);
    setItems(nextItems);

    setPage((p) => {
      const nextTotalPages = Math.max(1, Math.ceil(nextItems.length / PAGE_SIZE));
      return Math.min(p, nextTotalPages - 1);
    });

    setSnackMsg("휴지통으로 이동했습니다.");
    setSnackOpen(true);
  }

  return (
    <div className="space-y-6">
      {/* 필터 */}
      <div className="glass-card p-5 sm:p-6 relative z-40">
        <div className="mb-3">
          <div className="text-xs text-muted mb-1">전체 검색</div>
          <input
            className="select"
            type="search"
            placeholder="업체명 · No · comp · color · 조직 · 장소 등 자유롭게 입력"
            value={textQuery}
            onChange={(e) => setTextQuery(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Dropdown
            label="무게"
            value={무게}
            placeholder={loadingMeta ? "불러오는 중..." : "선택"}
            open={open === "무게"}
            onToggle={() => setOpen(open === "무게" ? null : "무게")}
            options={무게Options}
            onPick={(v) => {
              set무게(v);
              setOpen(null);
            }}
            onClear={() => set무게("")}
          />

          <Dropdown
            label="comp"
            value={comp}
            placeholder={loadingMeta ? "불러오는 중..." : "선택"}
            open={open === "comp"}
            onToggle={() => setOpen(open === "comp" ? null : "comp")}
            options={compOptions}
            onPick={(v) => {
              setComp(v);
              setOpen(null);
            }}
            onClear={() => setComp("")}
          />

          <Dropdown
            label="color"
            value={color}
            placeholder="선택"
            open={open === "color"}
            onToggle={() => setOpen(open === "color" ? null : "color")}
            options={colorOptions}
            onPick={(v) => {
              setColor(v);
              setOpen(null);
            }}
            onClear={() => setColor("")}
          />

          <div className="flex items-end">
            <button className="w-full btn-primary py-2" disabled={loading} onClick={doSearch}>
              검색
            </button>
          </div>
        </div>
      </div>

      {/* 결과 */}
      <div className="glass-card p-5 sm:p-6 overflow-hidden">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div className="font-semibold">목록 ({total})</div>
          <div className="flex items-center gap-2">
            <button
              className="btn-outline text-sm disabled:opacity-50"
              disabled={page <= 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              이전
            </button>
            <button
              className="btn-outline text-sm disabled:opacity-50"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            >
              다음
            </button>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="py-10 text-center text-muted">필터를 선택하고 검색 버튼을 눌러주세요.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {pageItems.map((it) => (
              <SearchCard
                key={it.id}
                it={it}
                onDetail={() => navigate(`/detail/${it.id}`)}
                onDelete={() => onDelete(it.id)}
              />
            ))}
          </div>
        )}
      </div>

      <Snackbar open={snackOpen} message={snackMsg} onClose={() => setSnackOpen(false)} />
    </div>
  );
}

/**
 * ✅ Compare 카드 스타일과 동일하게 만든 Search 카드 (체크박스만 제거)
 */
function SearchCard(props: { it: CmfItem; onDetail: () => void; onDelete: () => void }) {
  const { it, onDetail, onDelete } = props;

  // 다양한 필드명을 안전하게 처리 (프로젝트마다 필드명이 다를 수 있음)
  const noText = (it as any).No ?? (it as any).no ?? it.id;
  const company = it.업체명 ?? (it as any).company ?? "-";

  // 화면 "내용" 라인(코드/컬러 조합)
  const codesRaw =
    (it as any).codesLine ??
    (it as any).codes ??
    (it as any).colorCodes ??
    (it as any).colors ??
    (it as any).color ??
    "";

  const codes =
    Array.isArray(codesRaw) ? codesRaw.filter(Boolean).join("/") : (codesRaw ?? "").toString();

  // 우측 끝에 [N2] 같은 표기가 있으면 같이 보여주고 싶을 때
  const codeCount = (it as any).codeCount ?? (it as any).count ?? "";

  return (
    <div className="glass-card overflow-hidden">
      {/* ✅ 이미지 영역 */}
      <button type="button" className="w-full" onClick={onDetail} title="상세보기">
        <div className="relative">
          <div className="aspect-[4/5] w-full bg-white/40">
            <img src={fixedSwatch} alt="item" className="h-full w-full object-cover" />
          </div>
        </div>
      </button>

      {/* ✅ 텍스트 정보 */}
      <div className="p-4">
        <div className="text-[11px] text-muted mb-1">{noText ? `[${noText}]` : ""}</div>
        <div className="font-semibold text-slate-900 leading-snug truncate">{company}</div>

        {/* "내용" 라인 */}
        <div className="text-sm text-slate-600 leading-snug mt-2 line-clamp-2">
          {codes ? (
            <>
              {codes}{" "}
              {codeCount ? <span className="text-slate-500">[{codeCount}]</span> : null}
            </>
          ) : (
            <span className="text-slate-500">-</span>
          )}
        </div>

        {/* 무게/comp/color 같은 추가 정보가 있으면 한줄 더 */}
        <div className="text-[12px] text-slate-500 mt-2">
          {(it as any).무게 ? `${(it as any).무게}` : ""}
          {(it as any).comp ? ` · ${(it as any).comp}` : ""}
          {(it as any).color ? ` · ${(it as any).color}` : ""}
        </div>

        {/* ✅ 버튼 영역 (Compare와 동일한 느낌) */}
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            className="
              w-1/2
              px-4 py-2
              rounded-full
              text-white
              font-medium
              bg-gradient-to-r
              from-purple-500
              to-pink-500
              hover:from-purple-600
              hover:to-pink-600
              transition
              duration-200
            "
            onClick={onDetail}
          >
            상세
          </button>

          <button
            type="button"
            className="
              w-1/2
              px-4 py-2
              rounded-full
              border
              bg-white
              hover:bg-slate-50
              transition
              duration-200
            "
            onClick={onDelete}
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}

function Dropdown(props: {
  label: string;
  value: string;
  placeholder: string;
  open: boolean;
  onToggle: () => void;
  options: string[];
  onPick: (v: string) => void;
  onClear: () => void;
}) {
  const { label, value, placeholder, open, onToggle, options, onPick, onClear } = props;

  return (
    <div className="relative">
      <div className="text-xs text-muted mb-1">{label}</div>
      <button
        className="w-full select text-left flex items-center justify-between hover:bg-white/90 transition"
        onClick={onToggle}
        type="button"
      >
        <span className={value ? "text-slate-700" : "text-slate-400"}>{value || placeholder}</span>
        <div className="flex items-center gap-2">
          {value && (
            <button
              className="text-xs px-2 py-1 rounded-lg bg-white/60 hover:bg-white/90"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              type="button"
            >
              ✕
            </button>
          )}
          <span className="text-xs text-slate-400">▼</span>
        </div>
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full glass-card p-1 max-h-56 overflow-auto">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-xs text-muted">옵션이 없습니다.</div>
          ) : (
            options.map((o) => (
              <div
                key={o}
                className="px-3 py-2 rounded-xl hover:bg-white/70 cursor-pointer"
                onClick={() => onPick(o)}
              >
                {o}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}