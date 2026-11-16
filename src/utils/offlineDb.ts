/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Offline-First IndexedDB Persistence Layer
 * Stores student progress, quiz attempts, AI reaction cache, audio explanations,
 * offline package metadata, and last visited navigation state.
 */

import { AppPage, ReactionDetail } from "../types";
import { StudentQuizAttempt } from "../curriculum/types";

const DB_NAME = "chem_lab_offline_db";
const DB_VERSION = 1;

export type StoreName =
  | "kv_store"
  | "quiz_attempts"
  | "ai_cache"
  | "offline_packs"
  | "audio_tracks";

export interface LastNavState {
  activePage: AppPage;
  bacView?: "selection" | "list" | "reader";
  selectedPartNum?: 1 | 2;
  activeBacLessonId?: string | null;
  activeLabLessonId?: string | null;
  updatedAt: string;
}

export interface AiReactionCacheEntry {
  reactantsKey: string;
  reactantNames: string[];
  reaction: ReactionDetail;
  savedAt: string;
}

export interface OfflinePackRecord {
  id: string;
  category: "core" | "part" | "chapter" | "lesson" | "audio" | "pdf";
  title: string;
  status: "idle" | "downloading" | "paused" | "downloaded" | "error";
  bytesDownloaded: number;
  totalBytes: number;
  errorMessage?: string;
  updatedAt: string;
}

export interface OfflineAudioTrack {
  lessonId: string;
  title: string;
  partNumber: 1 | 2;
  chapterNumber: number;
  wavBlob: Blob;
  durationSec: number;
  segments: { timeSec: number; heading: string; text: string }[];
  bytesSize: number;
  savedAt: string;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB is not supported in this browser."));
  }
  if (dbPromise) return dbPromise;

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("kv_store")) {
        db.createObjectStore("kv_store", { keyPath: "key" });
      }
      if (!db.objectStoreNames.contains("quiz_attempts")) {
        const attempts = db.createObjectStore("quiz_attempts", { keyPath: "id" });
        attempts.createIndex("by_lesson", "lessonId", { unique: false });
        attempts.createIndex("by_date", "timestamp", { unique: false });
      }
      if (!db.objectStoreNames.contains("ai_cache")) {
        db.createObjectStore("ai_cache", { keyPath: "reactantsKey" });
      }
      if (!db.objectStoreNames.contains("offline_packs")) {
        db.createObjectStore("offline_packs", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("audio_tracks")) {
        db.createObjectStore("audio_tracks", { keyPath: "lessonId" });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => {
      dbPromise = null;
      reject(req.error || new Error("Failed to open IndexedDB"));
    };
  });

  return dbPromise;
}

async function idbGet<T>(storeName: StoreName, key: IDBValidKey): Promise<T | undefined> {
  try {
    const db = await openDb();
    return await new Promise<T | undefined>((resolve, reject) => {
      const tx = db.transaction(storeName, "readonly");
      const store = tx.objectStore(storeName);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result as T | undefined);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return undefined;
  }
}

async function idbPut<T>(storeName: StoreName, value: T): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(storeName, "readwrite");
      const store = tx.objectStore(storeName);
      const req = store.put(value);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "QuotaExceededError") {
      throw err;
    }
  }
}

async function idbDelete(storeName: StoreName, key: IDBValidKey): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(storeName, "readwrite");
      const store = tx.objectStore(storeName);
      const req = store.delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Ignore
  }
}

async function idbGetAll<T>(storeName: StoreName): Promise<T[]> {
  try {
    const db = await openDb();
    return await new Promise<T[]>((resolve, reject) => {
      const tx = db.transaction(storeName, "readonly");
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve((req.result as T[]) || []);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

// =========================================================================
// 1. Key-Value Student Data Store (mirrors & upgrades localStorage)
// =========================================================================
export async function saveStudentKV<T>(key: string, value: T): Promise<void> {
  await idbPut("kv_store", {
    key,
    value,
    updatedAt: new Date().toISOString(),
  });
}

export async function loadStudentKV<T>(key: string): Promise<T | undefined> {
  const row = await idbGet<{ key: string; value: T; updatedAt: string }>("kv_store", key);
  return row?.value;
}

export async function saveLastNavState(nav: LastNavState): Promise<void> {
  try {
    localStorage.setItem("chem_lab_last_nav_v1", JSON.stringify(nav));
  } catch {
    // ignore
  }
  await saveStudentKV("last_nav_state", nav);
}

export function loadLastNavStateSync(): LastNavState | null {
  try {
    const raw = localStorage.getItem("chem_lab_last_nav_v1");
    return raw ? (JSON.parse(raw) as LastNavState) : null;
  } catch {
    return null;
  }
}

export async function loadLastNavState(): Promise<LastNavState | null> {
  const fromIdb = await loadStudentKV<LastNavState>("last_nav_state");
  if (fromIdb) return fromIdb;
  return loadLastNavStateSync();
}

// =========================================================================
// 2. Quiz Attempts Store
// =========================================================================
export async function saveQuizAttemptIDB(attempt: StudentQuizAttempt): Promise<void> {
  await idbPut("quiz_attempts", attempt);
}

export async function loadAllQuizAttemptsIDB(): Promise<StudentQuizAttempt[]> {
  const all = await idbGetAll<StudentQuizAttempt>("quiz_attempts");
  return all.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

// =========================================================================
// 3. AI Reaction Prediction Offline Cache
// =========================================================================
export function buildReactantsCacheKey(reactantIds: string[]): string {
  return [...reactantIds].map((id) => id.toLowerCase().trim()).sort().join("+");
}

export async function saveAiReactionCache(
  reactantIds: string[],
  reactantNames: string[],
  reaction: ReactionDetail
): Promise<void> {
  const reactantsKey = buildReactantsCacheKey(reactantIds);
  if (!reactantsKey) return;
  const entry: AiReactionCacheEntry = {
    reactantsKey,
    reactantNames,
    reaction,
    savedAt: new Date().toISOString(),
  };
  await idbPut("ai_cache", entry);
}

export async function loadAiReactionCache(
  reactantIds: string[]
): Promise<AiReactionCacheEntry | undefined> {
  const reactantsKey = buildReactantsCacheKey(reactantIds);
  if (!reactantsKey) return undefined;
  return await idbGet<AiReactionCacheEntry>("ai_cache", reactantsKey);
}

export async function listAiReactionCache(): Promise<AiReactionCacheEntry[]> {
  return await idbGetAll<AiReactionCacheEntry>("ai_cache");
}

// =========================================================================
// 4. Offline Package Metadata & Audio Tracks
// =========================================================================
export async function saveOfflinePackRecord(record: OfflinePackRecord): Promise<void> {
  await idbPut("offline_packs", record);
}

export async function loadOfflinePackRecords(): Promise<OfflinePackRecord[]> {
  return await idbGetAll<OfflinePackRecord>("offline_packs");
}

export async function deleteOfflinePackRecord(id: string): Promise<void> {
  await idbDelete("offline_packs", id);
}

export async function saveAudioTrackIDB(track: OfflineAudioTrack): Promise<void> {
  await idbPut("audio_tracks", track);
}

export async function loadAudioTrackIDB(
  lessonId: string
): Promise<OfflineAudioTrack | undefined> {
  return await idbGet<OfflineAudioTrack>("audio_tracks", lessonId);
}

export async function deleteAudioTrackIDB(lessonId: string): Promise<void> {
  await idbDelete("audio_tracks", lessonId);
}

export async function listAudioTracksIDB(): Promise<OfflineAudioTrack[]> {
  return await idbGetAll<OfflineAudioTrack>("audio_tracks");
}

// =========================================================================
// 5. Storage Quota, Persistence Request, & Safe Temp Cleanup
// =========================================================================
export interface StorageEstimateReport {
  usageBytes: number;
  quotaBytes: number;
  usagePercent: number;
  isPersisted: boolean;
}

export async function getStorageEstimate(): Promise<StorageEstimateReport> {
  let usageBytes = 0;
  let quotaBytes = 0;
  let isPersisted = false;

  try {
    if (navigator.storage?.estimate) {
      const est = await navigator.storage.estimate();
      usageBytes = est.usage || 0;
      quotaBytes = est.quota || 0;
    }
    if (navigator.storage?.persisted) {
      isPersisted = await navigator.storage.persisted();
    }
  } catch {
    // Ignore unsupported StorageManager APIs
  }

  const usagePercent =
    quotaBytes > 0 ? Math.min(100, Math.round((usageBytes / quotaBytes) * 1000) / 10) : 0;

  return { usageBytes, quotaBytes, usagePercent, isPersisted };
}

export async function requestPersistentStorage(): Promise<boolean> {
  try {
    if (navigator.storage?.persist) {
      return await navigator.storage.persist();
    }
  } catch {
    // Ignore
  }
  return false;
}

/**
 * Cleans up expired temporary AI cache entries (> 60 days) and orphaned temp cache keys,
 * never touching student progress, quizzes, or explicitly downloaded lessons/PDFs.
 */
export async function cleanupTemporaryOfflineData(): Promise<number> {
  let removed = 0;
  try {
    const entries = await listAiReactionCache();
    const cutoff = Date.now() - 60 * 24 * 60 * 60 * 1000;
    for (const entry of entries) {
      const ts = new Date(entry.savedAt).getTime();
      if (!isNaN(ts) && ts < cutoff) {
        await idbDelete("ai_cache", entry.reactantsKey);
        removed++;
      }
    }
  } catch {
    // ignore
  }
  return removed;
}
