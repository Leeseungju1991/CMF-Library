import { useState } from "react";
import Snackbar from "../components/Snackbar";
import { itemsToCsv, listAllItems } from "../lib/firestore";

function downloadBlob(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function tsForFilename() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}`;
}

export default function ExportPage() {
  const [busy, setBusy] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState("");

  async function onExportCsv() {
    if (busy) return;
    setBusy(true);
    try {
      const all = await listAllItems(10000);
      setCount(all.length);
      const csv = itemsToCsv(all);
      downloadBlob(`soom-cmf_${tsForFilename()}.csv`, csv, "text/csv");
      setSnackMsg(`${all.length}건 CSV로 내보냈습니다.`);
      setSnackOpen(true);
    } catch (e: any) {
      setSnackMsg(e?.message || "내보내기 중 오류가 발생했습니다.");
      setSnackOpen(true);
    } finally {
      setBusy(false);
    }
  }

  async function onExportJson() {
    if (busy) return;
    setBusy(true);
    try {
      const all = await listAllItems(10000);
      setCount(all.length);
      downloadBlob(
        `soom-cmf_${tsForFilename()}.json`,
        JSON.stringify(all, null, 2),
        "application/json"
      );
      setSnackMsg(`${all.length}건 JSON으로 내보냈습니다.`);
      setSnackOpen(true);
    } catch (e: any) {
      setSnackMsg(e?.message || "내보내기 중 오류가 발생했습니다.");
      setSnackOpen(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="glass-card p-5 sm:p-6">
        <div className="font-semibold text-slate-800 mb-2">데이터 내보내기</div>
        <p className="text-sm text-slate-500 mb-4">
          현재 DB(<b>cmfItems</b>)의 전체 항목을 CSV 또는 JSON 파일로 다운로드합니다.
          최대 10,000건까지 가져옵니다.
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="btn-primary px-5 py-2 disabled:opacity-50"
            disabled={busy}
            onClick={onExportCsv}
          >
            CSV 다운로드
          </button>
          <button
            type="button"
            className="btn-outline px-5 py-2 disabled:opacity-50"
            disabled={busy}
            onClick={onExportJson}
          >
            JSON 다운로드
          </button>
        </div>

        {count !== null ? (
          <div className="text-xs text-muted mt-3">최근 내보낸 항목 수: {count}건</div>
        ) : null}
      </div>

      <Snackbar open={snackOpen} message={snackMsg} onClose={() => setSnackOpen(false)} />
    </div>
  );
}
