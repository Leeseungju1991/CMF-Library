import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../firebase";
import type { OutfitPhoto } from "./types";

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_PREFIX = "image/";

export async function uploadOutfitPhoto(opts: { itemId: string; file: File }): Promise<OutfitPhoto> {
  const { itemId, file } = opts;

  if (file.size > MAX_BYTES) {
    throw new Error(`이미지 용량 초과 (최대 ${Math.round(MAX_BYTES / 1024 / 1024)}MB)`);
  }
  if (!file.type.startsWith(ALLOWED_PREFIX)) {
    throw new Error("이미지 파일만 업로드할 수 있습니다.");
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `cmf/${itemId}/outfit/${Date.now()}_${safeName}`;
  const r = ref(storage, path);

  await uploadBytes(r, file, { contentType: file.type });
  const url = await getDownloadURL(r);

  return { url, name: file.name, path, createdAt: Date.now() };
}

export async function deleteOutfitPhoto(path: string): Promise<void> {
  if (!path) return;
  try {
    await deleteObject(ref(storage, path));
  } catch (e) {
    console.warn("[storage] deleteOutfitPhoto failed:", e);
  }
}