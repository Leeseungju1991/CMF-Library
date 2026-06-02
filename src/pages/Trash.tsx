import { useEffect, useMemo, useState } from "react";
import fixedSwatch from "../assets/fixed-swatch.png";
import Snackbar from "../components/Snackbar";
import { deleteTrashPermanently, listTrash, restoreFromTrash } from "../lib/firestore";
import type { CmfItem } from "../lib/types";
import { loadPageCache, savePageCache } from "../lib/pageCache";

export default function TrashPage() {
  const [items, setItems] = useState<CmfItem[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ 요구사항 5: 복구 완료 시 스낵바 표출
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState("");

  // ✅ FilterPage처럼 페이지네이션(그리드 카드 UI)
  const PAGE_SIZE = 12;
  const [page, setPage] = useState(0);

  // ✅ 요구사항 6: 뒤로가기 시 UI/데이터 유지 (세션 캐시)
  useEffect(() => {
    const cached = loadPageCache<any>("page:trash");
    if (cached) {
      setItems(Array.isArray(cached.items) ? cached.items : []);
      setPage(typeof cached.page === "number" ? cached.page : 0);
    }
  }, []);

  useEffect(() => {
    savePageCache("page:trash", { items, page });
  }, [items, page]);

  async function refresh() {
    setLoading(true);
    try {
      const res = await listTrash();
      setItems(res);
      setPage(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const pageItems = useMemo(() => {
    const start = page * PAGE_SIZE;
    return items.slice(start, start + PAGE_SIZE);
  }, [items, page]);

  async function onRestore(id: string) {
    // ✅ 요구사항 11: 복구는 팝업 없이 바로 복구 + 스낵바
    await restoreFromTrash(id);
    // 목록/페이지 즉시 반영
    setItems((prev) => {
      const next = prev.filter((x) => x.id !== id);
      const nextTotalPages = Math.max(1, Math.ceil(next.length / PAGE_SIZE));
      setPage((p) => Math.min(p, nextTotalPages - 1));
      return next;
    });

    setSnackMsg("복구되었습니다.");
    setSnackOpen(true);
  }

  async function onDeleteForever(id: string) {
    // ✅ 요구사항 1: 완전삭제 시 팝업 확인 후 스낵바 표출
    if (!confirm("완전 삭제할까요? 복구할 수 없습니다.")) return;
    await deleteTrashPermanently(id);
    // 목록/페이지 즉시 반영
    setItems((prev) => {
      const next = prev.filter((x) => x.id !== id);
      const nextTotalPages = Math.max(1, Math.ceil(next.length / PAGE_SIZE));
      setPage((p) => Math.min(p, nextTotalPages - 1));
      return next;
    });

    setSnackMsg("완전삭제하였습니다.");
    setSnackOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="glass-card p-5 sm:p-6 overflow-hidden">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div className="font-semibold">휴지통 ({total})</div>

          <div className="flex items-center gap-2">
            <button className="btn-outline text-sm" onClick={refresh} disabled={loading}>
              새로고침
            </button>
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

        {loading ? <div className="text-sm text-muted py-6">불러오는 중...</div> : null}

        {!loading && items.length === 0 ? (
          <div className="text-sm text-muted py-10 text-center">휴지통이 비어 있습니다.</div>
        ) : null}

        {!loading && items.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {pageItems.map((it) => (
              <TrashCard
                key={it.id}
                it={it}
                onRestore={() => onRestore(it.id)}
                onDeleteForever={() => onDeleteForever(it.id)}
              />
            ))}
          </div>
        ) : null}
      </div>

      <Snackbar open={snackOpen} message={snackMsg} onClose={() => setSnackOpen(false)} />
    </div>
  );
}

function TrashCard(props: { it: CmfItem; onRestore: () => void; onDeleteForever: () => void }) {
  const { it, onRestore, onDeleteForever } = props;

  return (
    <div className="glass-card overflow-hidden">
      {/* ✅ FilterPage 카드 UI처럼: 큰 스와치 */}
      <div className="w-full" title="휴지통 항목">
        <div className="aspect-[4/5] w-full bg-white/40">
          <img src={fixedSwatch} alt="swatch" className="h-full w-full object-cover" />
        </div>
      </div>

      {/* ✅ Filter처럼 필드 표현: 스와치/무게/업체명/No + comp/width/mount/cost/color */}
      <div className="p-4">
        <div className="text-[11px] text-muted mb-1">{it.무게 ? `[${it.무게}]` : ""}</div>

        <div className="flex items-start justify-between gap-2">
          <div className="font-semibold text-slate-800 leading-snug truncate">{it.업체명 || "-"}</div>
          <div className="text-xs text-slate-500 shrink-0">{it.No || "-"}</div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
          <Field label="comp" value={(it as any).comp} />
          <Field label="width" value={(it as any).width} />
          <Field label="mount" value={(it as any).mount} />
          <Field label="cost" value={(it as any).cost} />
          <Field label="color" value={(it as any).color} />
        </div>

        <div className="mt-4 flex items-center gap-3 justify-between">
          <button type="button" onClick={onRestore} className="action-pill action-pill-primary w-1/2">
            복구
          </button>
          <button type="button" onClick={onDeleteForever} className="action-pill action-pill-outline w-1/2">
            완전삭제
          </button>
        </div>
      </div>
    </div>
  );
}

function Field(props: { label: string; value?: any }) {
  const v = (props.value ?? "").toString().trim();
  return (
    <div className="min-w-0">
      <span className="font-semibold text-slate-500">{props.label}</span>{" "}
      <span className="text-slate-700">{v || "-"}</span>
    </div>
  );
}