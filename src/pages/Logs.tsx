import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listRecentLogs } from "../lib/firestore";

type LogRow = {
  id: string;
  action?: string;
  targetId?: string;
  payload?: any;
  createdAt?: any;
};

type Filter = "ALL" | "CREATE" | "UPDATE" | "DELETE" | "RESTORE";

function fmt(ts: any): string {
  if (!ts) return "-";
  try {
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    const yy = String(d.getFullYear()).slice(-2);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    return `${yy}.${mm}.${dd} ${hh}:${mi}`;
  } catch {
    return "-";
  }
}

const ACTION_LABEL: Record<string, string> = {
  CREATE: "추가",
  UPDATE: "수정",
  DELETE: "삭제",
  RESTORE: "복구",
};

const ACTION_COLOR: Record<string, string> = {
  CREATE: "bg-emerald-100 text-emerald-700 border-emerald-200",
  UPDATE: "bg-blue-100 text-blue-700 border-blue-200",
  DELETE: "bg-rose-100 text-rose-700 border-rose-200",
  RESTORE: "bg-amber-100 text-amber-700 border-amber-200",
};

export default function LogsPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("ALL");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await listRecentLogs(200);
        setRows(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    if (filter === "ALL") return rows;
    return rows.filter((r) => (r.action ?? "") === filter);
  }, [rows, filter]);

  return (
    <div className="space-y-6">
      <div className="glass-card p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="font-semibold text-slate-800">활동 로그 ({filtered.length})</div>
          <div className="flex flex-wrap items-center gap-2">
            {(["ALL", "CREATE", "UPDATE", "DELETE", "RESTORE"] as Filter[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={[
                  "px-3 py-1 rounded-full text-xs border transition",
                  filter === f
                    ? "bg-slate-800 text-white border-slate-800"
                    : "bg-white/70 text-slate-600 border-white/70 hover:bg-white",
                ].join(" ")}
              >
                {f === "ALL" ? "전체" : ACTION_LABEL[f]}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-sm text-muted py-10 text-center">불러오는 중...</div>
        ) : filtered.length === 0 ? (
          <div className="text-sm text-muted py-10 text-center">표시할 로그가 없습니다.</div>
        ) : (
          <ul className="space-y-2">
            {filtered.map((r) => {
              const action = r.action ?? "";
              const badge = ACTION_COLOR[action] || "bg-slate-100 text-slate-700 border-slate-200";
              const target = r.targetId ?? "";
              return (
                <li
                  key={r.id}
                  className="glass rounded-2xl border border-white/60 p-3 flex flex-col sm:flex-row sm:items-center gap-2"
                >
                  <span className={`inline-flex items-center justify-center min-w-[52px] px-2 py-0.5 rounded-full text-[11px] border ${badge}`}>
                    {ACTION_LABEL[action] || action || "-"}
                  </span>
                  <div className="text-xs text-slate-500 min-w-[110px]">{fmt(r.createdAt)}</div>
                  <button
                    type="button"
                    className="text-sm text-slate-700 truncate hover:underline text-left flex-1 min-w-0"
                    onClick={() => target && navigate(`/detail/${target}`)}
                    disabled={!target || action === "DELETE"}
                    title={target}
                  >
                    {target || "-"}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
