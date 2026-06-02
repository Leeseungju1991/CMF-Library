import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import fixedSwatch from "../assets/fixed-swatch.png";
import { getItem } from "../lib/firestore";
import type { CmfItem } from "../lib/types";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function CompareViewPage() {
  const q = useQuery();
  // ✅ 2~5개 비교 지원
  const ids = (q.get("ids") || "").split(",").filter(Boolean).slice(0, 5);

  const [items, setItems] = useState<CmfItem[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const loaded: CmfItem[] = [];
        for (const id of ids) {
          const it = await getItem(id);
          if (it) loaded.push(it);
        }
        setItems(loaded);
      } finally {
        setLoading(false);
      }
    })();
  }, [ids.join(",")]);

  if (ids.length < 2 || ids.length > 5) {
    return (
      <div className="glass-card p-6">
        <div className="font-semibold mb-2">색상비교</div>
        <div className="text-sm text-muted">검색 결과에서 2~5개 선택 후 비교하기를 눌러주세요.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-2xl font-semibold">색상 비교 ({items.length})</div>
        <button className="btn-outline" onClick={() => navigate(-1)}>
          뒤로
        </button>
      </div>

      <div className="glass-card p-5 sm:p-6">
        {loading ? (
          <div className="py-10 text-center text-muted">불러오는 중...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {items.map((it) => (
              <CompareItemCard
                key={it.id}
                it={it}
                onDetail={() => navigate(`/detail/${it.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CompareItemCard(props: { it: CmfItem; onDetail: () => void }) {
  const { it, onDetail } = props;

  const title = it.No || it.id;
  const vendor = it.업체명 || "-";
  const weightTag = it.무게 ? `[${it.무게}]` : "";

  const rows: { label: string; value: any }[] = [
    { label: "color", value: it.color ?? "" },
    { label: "cost", value: it.cost ?? "" },
    { label: "width", value: it.width ?? "" },
    { label: "mount", value: it.mount ?? "" },
    { label: "comp", value: it.comp ?? "" },
    { label: "무게", value: it.무게 ?? "" },
  ];

  return (
    <div className="glass-card overflow-hidden">
      {/* ✅ 스와치 크게 (항목 위) */}
      <button className="w-full" onClick={onDetail} type="button" title="상세보기">
        <div className="aspect-[4/5] w-full bg-white/40">
          <img src={fixedSwatch} alt="swatch" className="h-full w-full object-cover" />
        </div>
      </button>

      {/* ✅ 이미지 아래 카드 텍스트 */}
      <div className="p-4 space-y-3">
        <div>
          <div className="text-[11px] text-muted mb-1">{weightTag}</div>
          <div className="font-semibold text-slate-800 leading-snug truncate">{title}</div>
          <div className="text-sm text-slate-600 leading-snug mt-1 truncate">{vendor}</div>
        </div>

        <div className="rounded-2xl border border-white/60 bg-white/35 overflow-hidden">
          {rows.map((r) => (
            <div key={r.label} className="flex gap-3 px-3 py-2 border-b border-white/60 last:border-b-0">
              <div className="w-16 text-xs font-semibold text-slate-700">{r.label}</div>
              <div className="text-xs text-slate-600 break-words">{String(r.value ?? "")}</div>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onDetail}
            className={[
              "h-9 min-w-[80px] px-5",
              "rounded-full",
              "text-sm font-semibold text-white",
              "bg-gradient-to-r from-purple-300 to-pink-300",
              "shadow-sm",
              "hover:brightness-105 active:scale-[0.99]",
              "transition",
            ].join(" ")}
          >
            상세
          </button>
        </div>
      </div>
    </div>
  );
}