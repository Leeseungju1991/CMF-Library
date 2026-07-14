import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

/**
 * Firebase 웹 SDK 구성.
 * - 우선순위: `import.meta.env.VITE_FIREBASE_*` → 레거시 하드코딩 기본값.
 * - Firebase 웹 config 값은 공개 식별자이며 보안은 Firestore/Storage 규칙으로 처리한다.
 *   (자세한 내용은 docs/SECURITY.md 참고)
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

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);

export async function initAnalytics() {
  try {
    const ok = await isSupported();
    if (ok) getAnalytics(app);
  } catch {
    // ignore
  }
}