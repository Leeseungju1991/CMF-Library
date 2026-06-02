import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import fixedSwatch from "../assets/fixed-swatch.png";
import Snackbar from "../components/Snackbar";
import { getColorCount, listItemsByColorPage, logPopularItems, softDelete } from "../lib/firestore";
import type { CmfItem } from "../lib/types";

const FIXED_COLORS = [
  "BE",
  "BK",
  "BL",
  "BN",
  "BRG",
  "BV",
  "CAM",
  "CH",
  "DB",
  "Denim",
  "DY",
  "GD",
  "GN",
  "GY",
  "IV",
  "KH",
  "LB",
  "LG",
  "LM",
  "MT",
  "NV",
  "Neon",
  "OLV",
  "OR",
  "ORG",
  "PCH",
  "PK",
  "PU",
  "PUR",
  "RD",
  "SB",
  "SLV",
  "VI",
  "VT",
  "WH",
  "W-G",
  "YE",
  "YG",
  "YL",
  "YW",
  "WN",
  "BG",
];

export default function CompareSelectPage() {
  const navigate = useNavigate();

  const [color, setColor] = useState("");
  const [items, setItems] = useState<CmfItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState<number | null>(null);

  // 페이지네이션: afterId 스택
  const [afterStack, setAfterStack] = useState<(string | null)[]>([null]);
  const [nextAfterId, setNextAfterId] = useState<string | null>(null);

  // ✅ 선택된 id들
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const selectedIds = useMemo(() => Object.keys(selected).filter((k) => selected[k]), [selected]);

  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState("");

  useEffect(() => {
    // 색상 바뀌면 초기화
    setAfterStack([null]);
    setNextAfterId(null);
    setItems([]);
    setSelected({});
    setTotalCount(null);
  }, [color]);

  async function loadPage(afterId: string | null) {
    setLoading(true);
    try {
      const res = await listItemsByColorPage({
        color: color || undefined,
        pageSize: 20,
        afterId,
      });

      setItems(res.items);
      setNextAfterId(res.nextAfterId);
      setSelected({});
    } finally {
      setLoading(false);
    }
  }

  async function doSearch() {
    await loadPage(null);
    try {
      const n = await getColorCount(color || undefined);
      setTotalCount(n);
    } catch {
      setTotalCount(null);
    }
  }

  async function goNext() {
    if (!nextAfterId) return;
    setAfterStack((prev) => [...prev, nextAfterId]);
    await loadPage(nextAfterId);
  }

  async function goPrev() {
    if (afterStack.length <= 1) return;
    const prevStack = afterStack.slice(0, -1);
    const prevAfterId = prevStack[prevStack.length - 1];
    setAfterStack(prevStack);
    await loadPage(prevAfterId);
  }

  // ✅ 선택 토글(최대 5개)
  function toggleSelect(id: string, nextChecked: boolean) {
    setSelected((prev) => {
      const next = { ...prev, [id]: nextChecked };
      const ids = Object.keys(next).filter((k) => next[k]);
      if (ids.length > 5) return prev;
      return next;
    });
  }

  async function onDelete(id: string) {
    if (!confirm("삭제 후 휴지통으로 이동합니다. 계속할까요?")) return;
    try {
      await softDelete(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
      setSelected((prev) => {
        if (!prev[id]) return prev;
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setTotalCount((n) => (typeof n === "number" ? Math.max(0, n - 1) : n));
      setSnackMsg("휴지통으로 이동했습니다.");
      setSnackOpen(true);
    } catch (e: any) {
      setSnackMsg(e?.message || "삭제 중 오류가 발생했습니다.");
      setSnackOpen(true);
    }
  }


  return (
    <div className="space-y-4">
      <div className="bg-white shadow-card rounded-xl p-5">
        <div className="flex flex-col md:flex-row gap-3 items-end">
          {/* color select */}
          <div className="w-full md:w-[260px]">
            <div className="text-xs text-muted mb-1">color</div>
            <select
              className="w-full border rounded-lg px-3 py-2 bg-white h-11"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            >
              <option value="">선택</option>
              {FIXED_COLORS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* search button */}
          <div className="w-full md:w-[160px]">
            <button
              className="w-full bg-accent text-white rounded-lg font-semibold disabled:opacity-50 h-11"
              disabled={loading}
              onClick={doSearch}
            >
              검색
            </button>
          </div>

          {/* prev next + 선택/비교하기(같은 라인) */}
          <div className="flex items-center gap-2 w-full md:flex-1">
            <button
              className="px-4 rounded-lg border disabled:opacity-50 h-11"
              disabled={loading || afterStack.length <= 1}
              onClick={goPrev}
            >
              이전
            </button>

            <button
              className="px-4 rounded-lg border disabled:opacity-50 h-11"
              disabled={loading || !nextAfterId}
              onClick={goNext}
            >
              다음
            </button>

            {/* ✅ 오른쪽으로 밀어서 "선택"과 "비교하기"를 같은 줄에 정렬 */}
            <div className="flex items-center gap-3 ml-auto">
              <div className="text-xs text-muted">선택: {selectedIds.length} / 5</div>

              <button
                className="px-3 py-2 rounded-lg border text-sm disabled:opacity-50 h-11"
                disabled={selectedIds.length < 2 || selectedIds.length > 5}
                onClick={async () => {
                  const selectedItems = items.filter((x) => selectedIds.includes(x.id));
                  await logPopularItems(selectedItems);
                  navigate(`/compare/view?ids=${selectedIds.join(",")}`);
                }}
              >
                비교하기 (2~5개)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ 카드 리스트 */}
      <div className="bg-white shadow-card rounded-xl p-5">
        <div className="font-semibold mb-3">
          목록 ({items.length}
          {typeof totalCount === "number" && totalCount > items.length ? ` / 전체 ${totalCount}` : ""}
          )
        </div>

        {items.length === 0 ? (
          <div className="py-10 text-center text-muted">색상을 선택하고 검색을 눌러주세요.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {items.map((it) => {
              const checked = !!selected[it.id];

              return (
                <div key={it.id} className="bg-white shadow-card rounded-2xl overflow-hidden border">
                  {/* 이미지 영역 */}
                  <div className="p-4">
                    <div className="rounded-2xl overflow-hidden bg-white/40 relative">
                      <div className="aspect-[4/5] w-full">
                        <img src={fixedSwatch} alt="swatch" className="h-full w-full object-cover" />
                      </div>

                      {/* ✅ 비교선택: 사진 안(오버레이) */}
                      <label
                        className="
                          absolute
                          top-2
                          left-2
                          flex
                          items-center
                          gap-2
                          px-3
                          py-1.5
                          rounded-full
                          bg-white/80
                          backdrop-blur
                          border
                          border-white/70
                          shadow-sm
                          cursor-pointer
                          select-none
                        "
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => toggleSelect(it.id, e.target.checked)}
                        />
                        <span className="text-xs text-slate-700">비교</span>
                      </label>
                    </div>

                    {/* 텍스트 정보 */}
                    <div className="mt-3">
                      <div className="text-[11px] text-muted mb-1">[{(it as any).No ?? it.id}]</div>
                      <div className="font-semibold">{it.업체명 ?? ""}</div>
                      <div className="text-sm text-muted mt-1">
                        {it.color ?? ""} {it.무게 ? `· ${it.무게}` : ""}
                      </div>
                    </div>
                  </div>

                  {/* 버튼 영역 */}
                  <div className="px-4 pb-4">
                    <div className="flex gap-2">
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
                        onClick={() => navigate(`/detail/${it.id}`)}
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
                        onClick={() => onDelete(it.id)}
                        title="휴지통으로 이동"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Snackbar open={snackOpen} message={snackMsg} onClose={() => setSnackOpen(false)} />
    </div>
  );
}