import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import RequireAuth from "./components/RequireAuth";
import LoginPage from "./pages/Login";

const DashboardPage = lazy(() => import("./pages/Dashboard"));
const SearchPage = lazy(() => import("./pages/Search"));
const FilterPage = lazy(() => import("./pages/Filter"));
const AddPage = lazy(() => import("./pages/Add"));
const TrashPage = lazy(() => import("./pages/Trash"));
const CompareSelectPage = lazy(() => import("./pages/Compare"));
const CompareViewPage = lazy(() => import("./pages/CompareView"));
const DetailPage = lazy(() => import("./pages/Detail"));
const LogsPage = lazy(() => import("./pages/Logs"));
const ExportPage = lazy(() => import("./pages/Export"));

function RouteFallback() {
  return <div className="glass-card p-6 text-sm text-muted">불러오는 중...</div>;
}

export default function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/"
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="filter" element={<FilterPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="add" element={<AddPage />} />
          <Route path="trash" element={<TrashPage />} />
          <Route path="compare" element={<CompareSelectPage />} />
          <Route path="compare/view" element={<CompareViewPage />} />
          <Route path="detail/:id" element={<DetailPage />} />
          <Route path="logs" element={<LogsPage />} />
          <Route path="export" element={<ExportPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}
