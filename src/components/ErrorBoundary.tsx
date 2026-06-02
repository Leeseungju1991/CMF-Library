import React from "react";

type Props = { children: React.ReactNode };
type State = { hasError: boolean; message: string };

/**
 * 전역 ErrorBoundary
 * - 렌더 트리에서 발생한 예외가 앱 전체를 흰화면으로 만드는 것을 막는다.
 * - 사용자에게 새로고침/로그아웃 옵션을 제시한다.
 */
export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(err: unknown): State {
    return {
      hasError: true,
      message: err instanceof Error ? err.message : String(err ?? "Unknown error"),
    };
  }

  componentDidCatch(err: unknown, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", err, info?.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-[100dvh] flex items-center justify-center p-6">
        <div className="glass-card max-w-lg w-full p-8 text-center">
          <div className="text-2xl font-semibold text-slate-800 mb-2">오류가 발생했습니다</div>
          <div className="text-sm text-slate-500 mb-6 break-words">{this.state.message}</div>
          <div className="flex gap-3 justify-center">
            <button
              type="button"
              className="btn-primary px-5 py-2"
              onClick={() => window.location.reload()}
            >
              새로고침
            </button>
            <button
              type="button"
              className="btn-outline px-5 py-2"
              onClick={() => {
                try {
                  localStorage.removeItem("soom_auth");
                } catch {}
                window.location.href = "/login";
              }}
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
    );
  }
}
