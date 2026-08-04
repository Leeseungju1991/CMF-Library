import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";
import { DEMO_MODE } from "./lib/env";
import "./styles/index.css";

/**
 * ✅ HashRouter 사용 이유
 * - GitHub Pages 같은 정적 호스팅(서브패스, 서버 rewrite 불가)에서도
 *   딥링크/새로고침이 항상 동작하도록 하기 위함(#/detail/xxx 형태).
 * - Firebase Hosting(실서비스)에도 `firebase.json` 의 rewrite 유무와 무관하게
 *   그대로 잘 동작하므로, 빌드 모드에 따라 라우터를 분기할 필요가 없다.
 */
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <HashRouter>
        <App />
      </HashRouter>
    </ErrorBoundary>
  </React.StrictMode>
);


// ✅ PWA(웹앱) 지원: 서비스 워커 등록 (프로덕션에서만 동작)
// 데모(GitHub Pages) 빌드는 서브패스 배포이고 오프라인 캐시가 핵심 기능이 아니므로
// sw.js 의 base-path 불일치로 인한 문제를 피하기 위해 등록을 건너뛴다.
if (import.meta.env.PROD && !DEMO_MODE && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {
      // 등록 실패는 앱 동작에 영향 없도록 무시
    });
  });
}
