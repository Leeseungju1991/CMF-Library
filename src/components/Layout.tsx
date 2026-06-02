import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { logout } from "../lib/auth";
import { SidebarFilterProvider, type FilterKey, useSidebarFilters } from "../lib/filterContext";

type NavItem = {
  to: string;
  label: string;
  icon: (p: { className?: string }) => JSX.Element;
};

const nav: NavItem[] = [
  { to: "/dashboard", label: "대시보드", icon: DashboardIcon },
  { to: "/search", label: "검색 하기", icon: SearchIcon },
  { to: "/compare", label: "색상 비교", icon: CompareIcon },
  { to: "/add", label: "CMF 추가", icon: PlusIcon },
  { to: "/logs", label: "활동 로그", icon: LogsIcon },
  { to: "/export", label: "내보내기", icon: ExportIcon },
  { to: "/trash", label: "휴지통", icon: TrashIcon },
];

const FILTER_KEYS: { key: FilterKey; label: string }[] = [
  { key: "무게", label: "무게" },
  { key: "업체명", label: "업체명" },
  { key: "No", label: "No." },
  { key: "comp", label: "comp" },
  { key: "width", label: "width" },
  { key: "mount", label: "mount" },
  { key: "cost", label: "cost" },
  { key: "color", label: "color" },
];

function usePageTitle() {
  const { pathname } = useLocation();
  if (pathname.startsWith("/search")) return "검색 하기";
  if (pathname.startsWith("/compare")) return "색상 비교";
  if (pathname.startsWith("/add")) return "CMF 추가";
  if (pathname.startsWith("/trash")) return "휴지통";
  if (pathname.startsWith("/detail")) return "상세보기";
  if (pathname.startsWith("/filter")) return "검색 하기";
  if (pathname.startsWith("/logs")) return "활동 로그";
  if (pathname.startsWith("/export")) return "내보내기";
  return "대시보드";
}

const EMPTY_FIELDS: Record<FilterKey, boolean> = {
  무게: false,
  업체명: false,
  No: false,
  comp: false,
  width: false,
  mount: false,
  cost: false,
  color: false,
};

const EMPTY_VALUES: Record<FilterKey, string[]> = {
  무게: [],
  업체명: [],
  No: [],
  comp: [],
  width: [],
  mount: [],
  cost: [],
  color: [],
};

/**
 * ✅ 핵심: 다른 페이지로 이동하면 사이드바 필터 상태(칩 포함) 완전 초기화
 * - /filter 페이지에서만 유지, 그 외 이동 시 모두 제거
 */


export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const pageTitle = usePageTitle();

  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname]);

  return (
    <div
      className="min-h-[100dvh] p-3 sm:p-6"
      style={{
        paddingTop: "calc(env(safe-area-inset-top) + 0.75rem)",
        paddingRight: "calc(env(safe-area-inset-right) + 0.75rem)",
        paddingBottom: "calc(env(safe-area-inset-bottom) + 0.75rem)",
        paddingLeft: "calc(env(safe-area-inset-left) + 0.75rem)",
      }}
    >
      <div className="mx-auto w-full max-w-[95vw]">
        <div className="relative overflow-hidden rounded-[36px] glass-panel">
          <div className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full bg-accentBlue/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-44 -left-44 h-[28rem] w-[28rem] rounded-full bg-accentPink/20 blur-3xl" />

          <SidebarFilterProvider>
            {/* ✅ 라우트 이동 시 필터 상태 초기화 */}
            <ClearSidebarFiltersOnRouteChange />

            <div className="relative flex min-h-[calc(100dvh-48px)]">
              {/* Desktop sidebar */}
              <aside className="hidden md:block w-72 shrink-0 p-6 border-r border-white/50">
                <Brand />
                <NavMenu />
                <LogoutButton onLogout={() => navigate("/login")} />
              </aside>

              {/* Mobile sidebar */}
              {navOpen ? (
                <div className="fixed inset-0 z-50 md:hidden">
                  <button
                    className="absolute inset-0 bg-black/30"
                    aria-label="메뉴 닫기"
                    onClick={() => setNavOpen(false)}
                  />
                  <aside className="absolute left-0 top-0 h-full w-72 max-w-[82vw] p-6 border-r border-white/50 glass-panel rounded-r-[28px] shadow-card">
                    <div className="flex items-center justify-between mb-6">
                      <Brand compact />
                      <button
                        className="rounded-xl px-3 py-2 bg-white/70 border border-white/70 text-slate-600"
                        onClick={() => setNavOpen(false)}
                        type="button"
                      >
                        닫기
                      </button>
                    </div>
                    <NavMenu />
                    <LogoutButton onLogout={() => navigate("/login")} />
                  </aside>
                </div>
              ) : null}

              <main className="flex-1 min-w-0 p-4 sm:p-6 pb-10">
                <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <button
                      className="md:hidden mt-1 rounded-2xl px-3 py-2 glass hover:bg-white/70 border border-white/60 text-slate-700"
                      type="button"
                      onClick={() => setNavOpen(true)}
                      aria-label="메뉴 열기"
                    >
                      <span className="inline-flex items-center gap-2">
                        <span className="text-base">☰</span>
                        <span className="text-sm font-medium">메뉴</span>
                      </span>
                    </button>

                    <div>
                      <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{pageTitle}</h1>
                      <p className="text-sm text-muted mt-1">필터 적용 후 검색 결과를 확인하세요.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button type="button" className="btn-outline text-sm" onClick={() => navigate("/add")}>
                      + CMF 추가
                    </button>
                  </div>
                </header>

                <Outlet />
              </main>
            </div>
          </SidebarFilterProvider>
        </div>
      </div>
    </div>
  );
}

function Brand({ compact }: { compact?: boolean }) {
  return (
    <div className={compact ? "mb-2" : "mb-6"}>
      <div className="flex items-center gap-2">
        <div className="h-10 w-10 rounded-2xl bg-white/70 border border-white/70 shadow-sm flex items-center justify-center">
          <span className="text-accent font-black">S</span>
        </div>
        <div>
          <div className="font-extrabold tracking-tight text-slate-900">SOOM</div>
          <div className="text-xs text-muted -mt-0.5">CMF Dashboard</div>
        </div>
      </div>
    </div>
  );
}

function NavMenu() {
  const navigate = useNavigate();
  const location = useLocation();

  const { fieldKeys, setFieldKeys, valueSelections, setValueSelections, options, loadingOptions, apply } =
    useSidebarFilters();

  const [filterOpen, setFilterOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    if (!location.pathname.startsWith("/filter")) {
      setFilterOpen(false);
      setPanelOpen(false);
    }
  }, [location.pathname]);

  const [pendingFields, setPendingFields] = useState<Record<FilterKey, boolean>>(EMPTY_FIELDS);
  const [pendingValues, setPendingValues] = useState<Record<FilterKey, string[]>>(EMPTY_VALUES);

  useEffect(() => {
    if (!panelOpen) return;

    setPendingFields((prev) => {
      const next = { ...prev };
      (Object.keys(next) as FilterKey[]).forEach((k) => {
        next[k] = fieldKeys.includes(k);
      });
      return next;
    });

    setPendingValues(valueSelections);
  }, [panelOpen, fieldKeys, valueSelections]);

  const pendingSelectedFields = useMemo(
    () => FILTER_KEYS.filter((x) => pendingFields[x.key]).map((x) => x.key),
    [pendingFields]
  );

  const pendingValueChips = useMemo(() => {
    const chips: Array<{ k: FilterKey; v: string }> = [];
    for (const k of pendingSelectedFields) {
      const arr = pendingValues[k] ?? [];
      for (const v of arr) chips.push({ k, v });
    }
    return chips;
  }, [pendingSelectedFields, pendingValues]);

  function toggleValue(k: FilterKey, v: string) {
    setPendingValues((prev) => {
      const cur = prev[k] ?? [];
      const has = cur.includes(v);
      const next = has ? cur.filter((x) => x !== v) : [...cur, v];
      return { ...prev, [k]: next };
    });
  }

  function onClickFilterButton() {
    if (!filterOpen) {
      if (!location.pathname.startsWith("/filter")) navigate("/filter");
      setFilterOpen(true);
      setPanelOpen(true);
      return;
    }

    if (filterOpen && !panelOpen) {
      setPanelOpen(true);
      return;
    }

    setPanelOpen(false);
    setFilterOpen(false);
  }

  return (
    <nav className="space-y-1">
      {/* 대시보드 */}
      <NavLink
        to={nav[0].to}
        className={({ isActive }) =>
          [
            "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm transition",
            "hover:bg-white/60",
            isActive ? "bg-white/70 text-slate-900 shadow-card" : "text-slate-600",
          ].join(" ")
        }
      >
        <DashboardIcon className="w-5 h-5 text-accent" />
        <span className="font-medium">대시보드</span>
      </NavLink>

      {/* 필터하기 */}
      <div className="relative">
        <button
          type="button"
          className={[
            "w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl text-sm transition",
            "hover:bg-white/60",
            filterOpen ? "bg-white/70 text-slate-900 shadow-card" : "text-slate-600",
          ].join(" ")}
          onClick={onClickFilterButton}
          aria-expanded={filterOpen}
        >
          <span className="flex items-center gap-3">
            <SearchIcon className="w-5 h-5 text-accent" />
            <span className="font-medium">검색 하기</span>
          </span>
          <span className="text-slate-500">{filterOpen ? "▲" : "▼"}</span>
        </button>

        {/* 적용된 필터(필드) 칩 */}
{filterOpen && fieldKeys.length ? (
          <div className="mt-2 flex flex-wrap gap-2 px-1">
           {fieldKeys.filter((k) => k !== "mount").map((k) => (
              <span
                key={k}
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] bg-white/55 border border-white/60 text-slate-600"
              >
                {k === "No" ? "No." : k}
                <button
                  type="button"
                  className="text-slate-400 hover:text-slate-700"
                  aria-label={`${k} 제거`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setFieldKeys((prev) => prev.filter((x) => x !== k));
                    setValueSelections((prev) => ({ ...prev, [k]: [] }));
                    apply();
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        ) : null}

        {/* panelOpen=false이면 아무것도 렌더링 X */}
        {filterOpen && panelOpen ? (
          <div className="mt-2 glass rounded-2xl border border-white/60 p-3">
            {/* 1단: 필드 선택 */}
            <div className="flex flex-col gap-2">
              {FILTER_KEYS.map((x) => {
                const active = !!pendingFields[x.key];
                return (
                  <button
                    key={x.key}
                    type="button"
                    onClick={() => setPendingFields((p) => ({ ...p, [x.key]: !p[x.key] }))}
                    className={[
                      "w-full rounded-xl px-3 py-2 text-sm border transition text-left",
                      "flex items-center justify-between",
                      active
                        ? "bg-white/80 border-white/70 text-slate-900"
                        : "bg-white/40 border-white/60 text-slate-600 hover:bg-white/60",
                    ].join(" ")}
                  >
                    <span>{x.label}</span>
                    <span className={active ? "text-slate-700 text-xs" : "text-slate-300 text-xs"}>●</span>
                  </button>
                );
              })}
            </div>

            {/* 2단: 체크박스 */}
            <div className="mt-3 rounded-2xl bg-white/35 border border-white/50 p-3">
              {pendingSelectedFields.length === 0 ? (
                <div className="text-sm text-slate-500">필터 항목을 선택하세요.</div>
              ) : (
                <div className="space-y-5">
                  {pendingSelectedFields.map((k) => {
                    const list = options[k] ?? [];
                    const selected = pendingValues[k] ?? [];
                    return (
                      <div key={k}>
                        <div className="text-sm font-semibold text-slate-700 mb-2">{k === "No" ? "No." : k}</div>

                        {list.length === 0 ? (
                          <div className="text-xs text-slate-500">
                            {loadingOptions ? "옵션을 불러오는 중..." : "옵션이 없습니다."}
                          </div>
                        ) : (
                          <div className="max-h-[180px] overflow-auto pr-1 space-y-2">
                            {list.map((v) => {
                              const checked = selected.includes(v);
                              return (
                                <label key={v} className="flex items-center gap-2 text-sm text-slate-700">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => toggleValue(k, v)}
                                    className="h-4 w-4 rounded border-slate-300"
                                  />
                                  <span className={checked ? "font-medium" : ""}>{v}</span>
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 선택된 값 칩 */}
            {pendingValueChips.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {pendingValueChips.map(({ k, v }) => (
                  <span
                    key={`${k}:${v}`}
                    className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] bg-white/55 border border-white/60 text-slate-600"
                  >
                    {v}
                    <button
                      type="button"
                      className="text-slate-400 hover:text-slate-700"
                      aria-label={`${k}:${v} 제거`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setPendingValues((prev) => ({
                          ...prev,
                          [k]: (prev[k] ?? []).filter((x) => x !== v),
                        }));
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            ) : null}

            {/* 하단 버튼 */}
            <div className="mt-3 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setPanelOpen(false)}
                className={[
                  "h-9 min-w-[100px] px-3 rounded-full text-sm font-semibold",
                  "border border-slate-300 bg-white text-slate-500",
                  "shadow-sm hover:bg-slate-50 active:scale-[0.99] transition",
                ].join(" ")}
              >
                필터 접기
              </button>

              <button
                type="button"
                className={[
                  "h-9 min-w-[80px] px-5 rounded-full text-sm font-semibold text-white",
                  "bg-gradient-to-r from-purple-300 to-pink-300",
                  "shadow-sm hover:brightness-105 active:scale-[0.99] transition",
                ].join(" ")}
                onClick={() => {
                  const nextFields = FILTER_KEYS.filter((x) => pendingFields[x.key]).map((x) => x.key);
                  const nextValues: Record<FilterKey, string[]> = { ...pendingValues };

                  (Object.keys(nextValues) as FilterKey[]).forEach((kk) => {
                    if (!nextFields.includes(kk)) nextValues[kk] = [];
                  });

                  setFieldKeys(nextFields);
                  setValueSelections(nextValues);
                  apply();

                  setPanelOpen(false);
                  setFilterOpen(false);
                }}
              >
                적용
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* 나머지 메뉴 */}
      {nav.slice(2).map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            [
              "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm transition",
              "hover:bg-white/60",
              isActive ? "bg-white/70 text-slate-900 shadow-card" : "text-slate-600",
            ].join(" ")
          }
        >
          <item.icon className="w-5 h-5 text-accent" />
          <span className="font-medium">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

function LogoutButton({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="mt-6">
      <button
        className="w-full rounded-2xl px-4 py-3 text-sm bg-white/50 border border-white/60 hover:bg-white/70 transition text-slate-700"
        type="button"
        onClick={async () => {
          await logout();
          onLogout();
        }}
      >
        로그아웃
      </button>
    </div>
  );
}

/* ========================= Icons ========================= */

function DashboardIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 13h7V4H4v9zM13 20h7V11h-7v9zM13 4h7v5h-7V4zM4 20h7v-5H4v5z" />
    </svg>
  );
}
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}
function CompareIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 3H5a2 2 0 0 0-2 2v5h7V3zM21 14h-7v7h5a2 2 0 0 0 2-2v-5z" />
      <path d="M14 3h5a2 2 0 0 1 2 2v5h-7V3zM3 14h7v7H5a2 2 0 0 1-2-2v-5z" />
    </svg>
  );
}
function PlusIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
function TrashIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
    </svg>
  );
}
function LogsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16v16H4z" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  );
}
function ExportIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3v12" />
      <path d="M7 8l5-5 5 5" />
      <path d="M5 21h14" />
    </svg>
  );
}

function ClearSidebarFiltersOnRouteChange() {
  const location = useLocation();
  const { setFieldKeys, setValueSelections } = useSidebarFilters();

  useEffect(() => {
    if (!location.pathname.startsWith("/filter")) {
      setFieldKeys([]);
      setValueSelections({
        무게: [],
        업체명: [],
        No: [],
        comp: [],
        width: [],
        mount: [],
        cost: [],
        color: [],
      });
    }
  }, [location.pathname, setFieldKeys, setValueSelections]);

  return null;
}
