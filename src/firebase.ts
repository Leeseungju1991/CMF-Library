import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { DEMO_MODE } from "./lib/env";

/**
 * Firebase 웹 SDK 구성.
 * - 우선순위: `import.meta.env.VITE_FIREBASE_*` → 레거시 하드코딩 기본값.
 * - Firebase 웹 config 값은 공개 식별자이며 보안은 Firestore/Storage 규칙으로 처리한다.
 *   (자세한 내용은 docs/SECURITY.md 참고)
 *
 * ✅ 데모 모드(VITE_DEMO_MODE=true): 실제 Firebase 프로젝트가 없으므로
 *    initializeApp/getFirestore/getStorage/analytics 를 아예 호출하지 않는다.
 *    `db`/`storage`/`app` 은 null 이 되며, `src/lib/firestore.ts`/`src/lib/storage.ts`
 *    가 데모 분기에서 이 값들을 사용하지 않도록 되어 있다.
 */
const env = (import.meta as any).env ?? {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "YOUR_FIREBASE_API_KEY",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "your-project",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "your-project.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "000000000000",
  appId: env.VITE_FIREBASE_APP_ID || "1:000000000000:web:0000000000000000000000",
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || "G-XXXXXXXXXX",
};

export const app: ReturnType<typeof initializeApp> | null = DEMO_MODE ? null : initializeApp(firebaseConfig);
export const db: ReturnType<typeof getFirestore> | null = DEMO_MODE ? null : getFirestore(app!);
export const storage: ReturnType<typeof getStorage> | null = DEMO_MODE ? null : getStorage(app!);

export async function initAnalytics() {
  if (DEMO_MODE || !app) return;
  try {
    const ok = await isSupported();
    if (ok) getAnalytics(app);
  } catch {
    // ignore
  }
}