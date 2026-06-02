import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import fixedSwatch from "../assets/fixed-swatch.png";
import Snackbar from "../components/Snackbar";
import { getItem, updateItem, softDelete } from "../lib/firestore";
import { uploadOutfitPhoto } from "../lib/storage";
import type { CmfItem, OutfitPhoto } from "../lib/types";
import { createPortal } from "react-dom";
type SectionKey = "detailInfo" | "outfitPhotos";

type DetailInfo = {
  사용여부: "" | "사용중" | "미사용";
  사용중프로젝트: "" | "THE GEM" | "IDEALIAN" | "NEORm" | "ICONIA";
  캐릭터: "" | "남아" | "여아";
};

type FormState = {
  무게: string;
  업체명: string;
  No: string;
  comp: string;
  width: string;
  mount: string;
  cost: string;
  color: string;
  전화번호: string;
  장소: string;
  조직: string;
  아카이빙: string;

  상세정보: DetailInfo;
  제작된의상사진: OutfitPhoto[]; // 저장된(서버) 사진 목록
};

function toStr(v: any) {
  return v == null ? "" : String(v);
}

const EMPTY_DETAIL: DetailInfo = { 사용여부: "", 사용중프로젝트: "", 캐릭터: "" };

export default function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [item, setItem] = useState<CmfItem | null>(null);
  const [form, setForm] = useState<FormState | null>(null);

  // ✅ 누른 순서대로 섹션 스택
  const [sections, setSections] = useState<SectionKey[]>([]);

  // ✅ 의상사진: 선택(로컬) → 저장 시 업로드+DB반영
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [pendingPreviews, setPendingPreviews] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement | null>(null);

  // ✅ fixedSwatch 포함 이미지 확대 모달
  const [zoomUrl, setZoomUrl] = useState<string | null>(null);

  // 저장 로딩
  const [savingBase, setSavingBase] = useState(false);
  const [savingDetail, setSavingDetail] = useState(false);
  const [savingPhotos, setSavingPhotos] = useState(false);

  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState("");

  // pending preview URL 정리
  useEffect(() => {
    return () => {
      pendingPreviews.forEach((u) => URL.revokeObjectURL(u));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isDirtyBase = useMemo(() => {
    if (!item || !form) return false;

    const pairs: Array<[any, any]> = [
      [item.무게, form.무게],
      [item.업체명, form.업체명],
      [(item as any).No, form.No],
      [(item as any).comp, form.comp],
      [(item as any).width, form.width],
      [(item as any).mount, form.mount],
      [(item as any).cost, form.cost],
      [(item as any).color, form.color],
      [(item as any).전화번호, form.전화번호],
      [(item as any).장소, form.장소],
      [(item as any).조직, form.조직],
      [(item as any).아카이빙, form.아카이빙],
    ];

    return pairs.some(([a, b]) => toStr(a) !== toStr(b));
  }, [item, form]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const it = await getItem(id);
        if (!it) {
          setSnackMsg("데이터를 찾을 수 없습니다.");
          setSnackOpen(true);
          navigate(-1);
          return;
        }
        setItem(it);

        const savedDetail = ((it as any).detailInfo ?? {}) as Partial<DetailInfo>;
        const initDetail: DetailInfo = {
          사용여부: (savedDetail.사용여부 as any) ?? "",
          사용중프로젝트: (savedDetail.사용중프로젝트 as any) ?? "",
          캐릭터: (savedDetail.캐릭터 as any) ?? "",
        };

        const init: FormState = {
          무게: toStr(it.무게),
          업체명: toStr(it.업체명),
          No: toStr((it as any).No),
          comp: toStr((it as any).comp),
          width: toStr((it as any).width),
          mount: toStr((it as any).mount),
          cost: toStr((it as any).cost),
          color: toStr((it as any).color),
          전화번호: toStr((it as any).전화번호),
          장소: toStr((it as any).장소),
          조직: toStr((it as any).조직),
          아카이빙: toStr((it as any).아카이빙),

          상세정보: initDetail,
          제작된의상사진: (((it as any).outfitPhotos ?? []) as OutfitPhoto[]).slice(),
        };

        setForm(init);

        // ✅ 저장된 값이 있으면 섹션 자동 펼치기
        const hasDetailInfo =
          !!initDetail.사용여부 || !!initDetail.사용중프로젝트 || !!initDetail.캐릭터;

        const hasOutfitPhotos = (init.제작된의상사진?.length ?? 0) > 0;

        const initSections: SectionKey[] = [];
        if (hasDetailInfo) initSections.push("detailInfo");
        if (hasOutfitPhotos) initSections.push("outfitPhotos");
        setSections(initSections);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  // ✅ 섹션 추가(이미 열려있으면 맨 아래로 이동)
  function addSection(key: SectionKey) {
    setSections((prev) => {
      const next = prev.filter((x) => x !== key);
      return [...next, key];
    });
  }

  function removeSection(key: SectionKey) {
    setSections((prev) => prev.filter((x) => x !== key));

    if (key === "detailInfo") {
      setForm((prev) => (prev ? { ...prev, 상세정보: { ...EMPTY_DETAIL } } : prev));
    }

    if (key === "outfitPhotos") {
      pendingPreviews.forEach((u) => URL.revokeObjectURL(u));
      setPendingFiles([]);
      setPendingPreviews([]);
    }
  }

  async function onSaveBase() {
    if (!id || !form) return;
    setSavingBase(true);
    try {
      await updateItem(id, {
        무게: form.무게,
        업체명: form.업체명,
        No: form.No,
        comp: form.comp,
        width: form.width,
        mount: form.mount,
        cost: form.cost,
        color: form.color,
        전화번호: form.전화번호,
        장소: form.장소,
        조직: form.조직,
        아카이빙: form.아카이빙,
      } as any);

      const refreshed = await getItem(id);
      if (refreshed) setItem(refreshed);

      setSnackMsg("저장되었습니다.");
      setSnackOpen(true);
    } catch (e: any) {
      setSnackMsg(e?.message || "저장 중 오류가 발생했습니다.");
      setSnackOpen(true);
    } finally {
      setSavingBase(false);
    }
  }

  async function onSaveDetailInfo() {
    if (!id || !form) return;
    setSavingDetail(true);
    try {
      await updateItem(id, { detailInfo: form.상세정보 } as any);

      const refreshed = await getItem(id);
      if (refreshed) {
        setItem(refreshed);
        const savedDetail = ((refreshed as any).detailInfo ?? {}) as Partial<DetailInfo>;
        setForm((prev) =>
          prev
            ? {
                ...prev,
                상세정보: {
                  사용여부: (savedDetail.사용여부 as any) ?? "",
                  사용중프로젝트: (savedDetail.사용중프로젝트 as any) ?? "",
                  캐릭터: (savedDetail.캐릭터 as any) ?? "",
                },
              }
            : prev
        );

        const hasDetailInfo =
          !!(savedDetail as any).사용여부 ||
          !!(savedDetail as any).사용중프로젝트 ||
          !!(savedDetail as any).캐릭터;

        if (hasDetailInfo) addSection("detailInfo");
      }

      setSnackMsg("상세정보가 저장되었습니다.");
      setSnackOpen(true);
    } catch (e: any) {
      setSnackMsg(e?.message || "상세정보 저장 실패");
      setSnackOpen(true);
    } finally {
      setSavingDetail(false);
    }
  }

  function onPickFiles(files: FileList) {
    const list = Array.from(files);
    if (list.length === 0) return;

    const previews = list.map((f) => URL.createObjectURL(f));
    setPendingFiles((prev) => [...prev, ...list]);
    setPendingPreviews((prev) => [...prev, ...previews]);

    addSection("outfitPhotos");
  }

  function removePending(idx: number) {
    setPendingFiles((prev) => {
      const next = prev.slice();
      next.splice(idx, 1);
      return next;
    });
    setPendingPreviews((prev) => {
      const next = prev.slice();
      const removed = next[idx];
      if (removed) URL.revokeObjectURL(removed);
      next.splice(idx, 1);
      return next;
    });
  }

  function removeSavedPhoto(idx: number) {
    if (!form) return;
    const next = (form.제작된의상사진 ?? []).slice();
    next.splice(idx, 1);
    setField("제작된의상사진", next);
  }

  async function onSaveOutfitPhotos() {
    if (!id || !form) return;

    if (pendingFiles.length === 0) {
      setSnackMsg("저장할 새 사진이 없습니다.");
      setSnackOpen(true);
      return;
    }

    setSavingPhotos(true);
    try {
      const uploaded = await Promise.all(
        pendingFiles.map((file) => uploadOutfitPhoto({ itemId: id, file }))
      );

      const merged: OutfitPhoto[] = [...(form.제작된의상사진 ?? []), ...uploaded];
      await updateItem(id, { outfitPhotos: merged } as any);

      const refreshed = await getItem(id);
      const savedPhotos = (((refreshed as any)?.outfitPhotos ?? []) as OutfitPhoto[]).slice();

      if (savedPhotos.length === 0) throw new Error("의상사진이 DB에 저장되지 않았습니다.");

      setItem(refreshed ?? null);
      setForm((prev) => (prev ? { ...prev, 제작된의상사진: savedPhotos } : prev));
      addSection("outfitPhotos");

      pendingPreviews.forEach((u) => URL.revokeObjectURL(u));
      setPendingFiles([]);
      setPendingPreviews([]);

      setSnackMsg(`의상사진이 저장되었습니다. (총 ${savedPhotos.length}장)`);
      setSnackOpen(true);
    } catch (e: any) {
      setSnackMsg(e?.message || "의상사진 저장 실패");
      setSnackOpen(true);
    } finally {
      setSavingPhotos(false);
    }
  }

  async function onDeleteItem() {
    if (!id) return;
    if (!confirm("삭제하면 휴지통으로 이동합니다. (복구 가능)\n계속할까요?")) return;

    try {
      await softDelete(id);
      setSnackMsg("휴지통으로 이동했습니다.");
      setSnackOpen(true);
      navigate(-1);
    } catch (e: any) {
      setSnackMsg(e?.message || "삭제 중 오류가 발생했습니다.");
      setSnackOpen(true);
    }
  }

  if (loading || !form) return <div className="glass-card p-6">불러오는 중...</div>;

  return (
    <div className="space-y-6">
      {/* 상단 */}
      <div className="glass-card p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          {/* 좌측 */}
          <div className="w-full">
            <div className="rounded-2xl overflow-hidden bg-white/40">
              <div className="aspect-[4/5] w-full">
                {/* ✅ 여기 클릭하면 fixedSwatch 확대 */}
                <img
                  src={fixedSwatch}
                  alt="swatch"
                  className="h-full w-full object-cover cursor-zoom-in"
                  onClick={() => setZoomUrl(fixedSwatch)}
                />
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                className="action-pill action-pill-outline w-1/2"
                onClick={() => addSection("detailInfo")}
              >
                + 상세정보 추가
              </button>

              <button
                type="button"
                className="action-pill action-pill-outline w-1/2"
                onClick={() => addSection("outfitPhotos")}
              >
                + 의상 사진 추가
              </button>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) onPickFiles(e.target.files);
                e.currentTarget.value = "";
              }}
            />
          </div>

          {/* 우측 */}
          <div>
            <div className="text-lg font-semibold mb-4">기본 정보</div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="무게" value={form.무게} onChange={(v) => setField("무게", v)} />
              <Field label="업체명" value={form.업체명} onChange={(v) => setField("업체명", v)} />
              <Field label="No." value={form.No} onChange={(v) => setField("No", v)} />

              <Field label="comp" value={form.comp} onChange={(v) => setField("comp", v)} />
              <Field label="width" value={form.width} onChange={(v) => setField("width", v)} />
              <Field label="mount" value={form.mount} onChange={(v) => setField("mount", v)} />

              <Field label="cost" value={form.cost} onChange={(v) => setField("cost", v)} />
              <Field label="color" value={form.color} onChange={(v) => setField("color", v)} />
              <Field label="조직" value={form.조직} onChange={(v) => setField("조직", v)} />

              <Field label="전화번호" value={form.전화번호} onChange={(v) => setField("전화번호", v)} />
              <Field label="장소" value={form.장소} onChange={(v) => setField("장소", v)} />
              <Field label="아카이빙" value={form.아카이빙} onChange={(v) => setField("아카이빙", v)} />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onSaveBase}
                disabled={savingBase || !isDirtyBase}
                className="
                  px-4 py-2 rounded-2xl text-white font-medium
                  bg-gradient-to-r from-purple-400 to-violet-500
                  hover:from-purple-500 hover:to-violet-600
                  transition duration-200 disabled:opacity-50
                "
              >
                저장
              </button>

              <button
                type="button"
                className="action-pill action-pill-outline"
                onClick={() => {
                  if (isDirtyBase && !confirm("변경사항이 저장되지 않았습니다. 나갈까요?")) return;
                  navigate(-1);
                }}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 섹션들(원본 그대로) */}
      {sections.map((key) => {
        if (key === "detailInfo") {
          return (
            <div key="detailInfo" className="glass-card p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="font-semibold">상세정보</div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onSaveDetailInfo}
                    disabled={savingDetail}
                    className="
                      px-4 py-2 rounded-2xl text-white font-medium
                      bg-gradient-to-r from-purple-400 to-violet-500
                      hover:from-purple-500 hover:to-violet-600
                      transition duration-200 disabled:opacity-50
                    "
                  >
                    저장
                  </button>

                  <button type="button" className="btn-outline text-sm" onClick={() => removeSection("detailInfo")}>
                    삭제
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="block">
                  <div className="text-xs text-muted mb-1">사용 여부</div>
                  <select
                    className="select"
                    value={form.상세정보.사용여부}
                    onChange={(e) =>
                      setForm((prev) =>
                        prev ? { ...prev, 상세정보: { ...prev.상세정보, 사용여부: e.target.value as any } } : prev
                      )
                    }
                  >
                    <option value="">선택</option>
                    <option value="사용중">사용중</option>
                    <option value="미사용">미사용</option>
                  </select>
                </label>

                <label className="block">
                  <div className="text-xs text-muted mb-1">사용중 프로젝트</div>
                  <select
                    className="select"
                    value={form.상세정보.사용중프로젝트}
                    onChange={(e) =>
                      setForm((prev) =>
                        prev
                          ? { ...prev, 상세정보: { ...prev.상세정보, 사용중프로젝트: e.target.value as any } }
                          : prev
                      )
                    }
                  >
                    <option value="">선택</option>
                    <option value="THE GEM">THE GEM</option>
                    <option value="IDEALIAN">IDEALIAN</option>
                    <option value="NEORm">NEORm</option>
                    <option value="ICONIA">ICONIA</option>
                  </select>
                </label>

                <label className="block">
                  <div className="text-xs text-muted mb-1">남자/여자 캐릭터</div>
                  <select
                    className="select"
                    value={form.상세정보.캐릭터}
                    onChange={(e) =>
                      setForm((prev) =>
                        prev ? { ...prev, 상세정보: { ...prev.상세정보, 캐릭터: e.target.value as any } } : prev
                      )
                    }
                  >
                    <option value="">선택</option>
                    <option value="남아">남아</option>
                    <option value="여아">여아</option>
                  </select>
                </label>
              </div>
            </div>
          );
        }

        return (
          <div key="outfitPhotos" className="glass-card p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="font-semibold">제작된 의상 사진</div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="
                    px-4 py-2 rounded-2xl text-white font-medium
                    bg-gradient-to-r from-purple-600 to-violet-700
                    hover:from-purple-700 hover:to-violet-800
                    shadow-md transition duration-200
                  "
                >
                  사진 추가
                </button>

                <button
                  type="button"
                  onClick={onSaveOutfitPhotos}
                  disabled={savingPhotos || pendingFiles.length === 0}
                  className="
                    px-4 py-2 rounded-2xl text-white font-medium
                    bg-gradient-to-r from-purple-500 to-violet-600
                    hover:from-purple-600 hover:to-violet-700
                    transition duration-200 disabled:opacity-50
                  "
                >
                  저장
                </button>

                <button type="button" className="btn-outline text-sm" onClick={() => removeSection("outfitPhotos")}>
                  닫기
                </button>
              </div>
            </div>

            {(form.제작된의상사진?.length ?? 0) > 0 && (
              <>
                <div className="text-xs text-muted mb-2">저장된 사진 ({form.제작된의상사진.length})</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-5">
                  {form.제작된의상사진.map((p, idx) => (
                    <div key={(p as any).url ?? idx} className="glass-card overflow-hidden">
                      <button
                        type="button"
                        className="block w-full"
                        onClick={() => setZoomUrl((p as any).url)}
                        title="크게 보기"
                      >
                        <div className="aspect-square bg-white/40">
                          <img
                            src={(p as any).url}
                            alt={(p as any).name || `outfit-${idx + 1}`}
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </button>
                      <div className="p-2 flex items-center justify-between gap-2">
                        <div className="text-xs text-slate-600 truncate">{(p as any).name || "photo"}</div>
                        <button
                          type="button"
                          className="text-xs px-2 py-1 rounded-xl bg-white/70 border border-white/70"
                          onClick={() => removeSavedPhoto(idx)}
                        >
                          제거
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {pendingFiles.length === 0 ? (
              (form.제작된의상사진?.length ?? 0) === 0 ? (
                <div className="text-sm text-muted">추가된 사진이 없습니다.</div>
              ) : null
            ) : (
              <>
                <div className="text-xs text-muted mb-2">저장 대기 ({pendingFiles.length})</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {pendingPreviews.map((url, idx) => (
                    <div key={url} className="glass-card overflow-hidden">
                      <div className="aspect-square bg-white/40">
                        <img
                          src={url}
                          alt={`pending-${idx + 1}`}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="p-2 flex items-center justify-between gap-2">
                        <div className="text-xs text-slate-600 truncate">{pendingFiles[idx]?.name || "photo"}</div>
                        <button
                          type="button"
                          className="text-xs px-2 py-1 rounded-xl bg-white/70 border border-white/70"
                          onClick={() => removePending(idx)}
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-xs text-muted">* 사진은 <b>저장</b>을 눌러야 반영됩니다.</div>
              </>
            )}
          </div>
        );
      })}

      {/* 아이템 삭제 */}
      <div className="glass-card p-5 sm:p-6 border border-red-200/60 bg-red-50/40">
        <div className="font-semibold text-red-600 mb-2">삭제</div>
        <div className="text-sm text-red-600/80 mb-4">삭제하면 휴지통으로 이동합니다. (복구 가능)</div>
        <button type="button" className="action-pill action-pill-danger" onClick={onDeleteItem}>
          삭제하기
        </button>
      </div>

      <Snackbar open={snackOpen} message={snackMsg} onClose={() => setSnackOpen(false)} />

      {/* ✅ fixedSwatch 확대 모달 */}
      {zoomUrl && <ImageZoomModal url={zoomUrl} onClose={() => setZoomUrl(null)} />}
    </div>
  );
}

function Field(props: { label: string; value: string; onChange: (v: string) => void }) {
  const { label, value, onChange } = props;
  return (
    <label className="block">
      <div className="text-xs text-muted mb-1">{label}</div>
      <input className="select" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function ImageZoomModal(props: { url: string; onClose: () => void }) {
  const { url, onClose } = props;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    // ✅ 모달 열리면 body 스크롤 잠금(선택)
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] bg-black/70 flex items-center justify-center p-4"
      onMouseDown={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative max-w-[92vw] max-h-[88vh]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-3 -right-3 h-10 w-10 rounded-full bg-white/90 hover:bg-white shadow flex items-center justify-center text-slate-700"
          aria-label="닫기"
        >
          ✕
        </button>

        <img
          src={url}
          alt="zoom"
          className="max-w-[92vw] max-h-[88vh] object-contain rounded-2xl shadow-2xl"
          draggable={false}
        />
      </div>
    </div>,
    document.body
  );
}