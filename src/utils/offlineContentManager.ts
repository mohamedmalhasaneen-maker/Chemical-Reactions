/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Offline Content Manager
 * Handles downloading, pausing, resuming, sizing, caching, and deleting:
 * - Core Platform Shell & Simulations
 * - Baccalaureate Part 1 / Part 2 / Individual Chapters & Lessons
 * - Offline Lesson Audio Narration Packs
 * - Official Ministry of Education PDF Textbooks (with real chunked pause/resume)
 */

import { BACCALAUREATE_PART_1 } from "../data/baccalaureatePart1";
import { BACCALAUREATE_PART_2 } from "../data/baccalaureatePart2";
import { getDetailedLessonSync } from "../curriculum/curriculumRegistry";
import { createOfflineAudioTrack } from "./lessonAudioGenerator";
import {
  deleteAudioTrackIDB,
  deleteOfflinePackRecord,
  getStorageEstimate,
  listAudioTracksIDB,
  loadOfflinePackRecords,
  OfflinePackRecord,
  requestPersistentStorage,
  saveAudioTrackIDB,
  saveOfflinePackRecord,
  saveStudentKV,
  StorageEstimateReport,
} from "./offlineDb";

export const CACHE_NAMES = {
  lessons: "chem-offline-lessons-v1",
  audio: "chem-offline-audio-v1",
  pdfs: "chem-offline-pdfs-v1",
};

export const OFFICIAL_PDF_SPECS = [
  {
    id: "pdf_part1",
    packId: "pdf_part1",
    title: "الكتاب الأصلي للوزارة - الجزء الأول (PDF)",
    url: "/assets/aistudio/Chemistry-Ar-EB-part1__1__7dd275d6.pdf",
    estimatedBytes: 20_631_191, // 19.68 MB exact
  },
  {
    id: "pdf_part2",
    packId: "pdf_part2",
    title: "الكتاب الأصلي للوزارة - الجزء الثاني (PDF)",
    url: "/assets/aistudio/_____________________________________________________2027________________________________________53bd65ca.pdf",
    estimatedBytes: 7_911_855, // 7.55 MB exact
  },
];

export interface PackDescriptor {
  id: string;
  category: OfflinePackRecord["category"];
  title: string;
  description: string;
  estimatedBytes: number;
  partNumber?: 1 | 2;
  chapterId?: string;
  lessonIds?: string[];
  pdfUrl?: string;
}

// Active pause/resume download state stored in memory for resumable chunk streams
interface ActiveDownloadHandle {
  controller: AbortController;
  paused: boolean;
  chunks: Uint8Array[];
  receivedBytes: number;
  totalBytes: number;
}

const activeDownloads = new Map<string, ActiveDownloadHandle>();

export function formatBytesArabic(bytes: number): string {
  if (!bytes || bytes <= 0) return "0 KB";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function buildCatalogDescriptors(): PackDescriptor[] {
  const part1Lessons = BACCALAUREATE_PART_1.chapters.flatMap((c) => c.lessons);
  const part2Lessons = BACCALAUREATE_PART_2.chapters.flatMap((c) => c.lessons);

  const packs: PackDescriptor[] = [
    {
      id: "part_1_lessons",
      category: "part",
      partNumber: 1,
      title: "منهج البكالوريا - الجزء الأول كاملاً (26 درساً)",
      description: "جميع الشروحات المفاهيمية، المعادلات، الأمثلة، وبنوك الأسئلة للجزء الأول.",
      estimatedBytes: part1Lessons.length * 42_000,
      lessonIds: part1Lessons.map((l) => l.id),
    },
    {
      id: "part_2_lessons",
      category: "part",
      partNumber: 2,
      title: "منهج البكالوريا - الجزء الثاني كاملاً (26 درساً)",
      description: "الكيمياء غير العضوية والعضوية بجميع الشروحات والأسئلة للجزء الثاني.",
      estimatedBytes: part2Lessons.length * 42_000,
      lessonIds: part2Lessons.map((l) => l.id),
    },
    {
      id: "audio_part_1",
      category: "audio",
      partNumber: 1,
      title: "الشروحات الصوتية - الجزء الأول (26 مقطعاً)",
      description: "ملفات صوتية موجزة قابلة للتشغيل والتحكم بالسرعة دون إنترنت لدروس الجزء الأول.",
      estimatedBytes: part1Lessons.length * 720_000,
      lessonIds: part1Lessons.map((l) => l.id),
    },
    {
      id: "audio_part_2",
      category: "audio",
      partNumber: 2,
      title: "الشروحات الصوتية - الجزء الثاني (26 مقطعاً)",
      description: "ملفات صوتية موجزة قابلة للتشغيل والتحكم بالسرعة دون إنترنت لدروس الجزء الثاني.",
      estimatedBytes: part2Lessons.length * 720_000,
      lessonIds: part2Lessons.map((l) => l.id),
    },
    ...OFFICIAL_PDF_SPECS.map((pdf) => ({
      id: pdf.packId,
      category: "pdf" as const,
      title: pdf.title,
      description: "حفظ نسخة PDF الرسمية كاملة في ذاكرة المتصفح لفتحها وتصفحها دون إنترنت.",
      estimatedBytes: pdf.estimatedBytes,
      pdfUrl: pdf.url,
    })),
  ];

  // Chapter-level packs
  [...BACCALAUREATE_PART_1.chapters, ...BACCALAUREATE_PART_2.chapters].forEach((ch) => {
    packs.push({
      id: `chapter_${ch.id}`,
      category: "chapter",
      partNumber: ch.partNumber,
      chapterId: ch.id,
      title: `${ch.title} (${ch.lessons.length} دروس)`,
      description: ch.description,
      estimatedBytes: ch.lessons.length * 42_000,
      lessonIds: ch.lessons.map((l) => l.id),
    });
  });

  return packs;
}

export async function isPdfCachedOffline(pdfUrl: string): Promise<boolean> {
  if (typeof caches === "undefined") return false;
  try {
    const cache = await caches.open(CACHE_NAMES.pdfs);
    const match = await cache.match(pdfUrl);
    return Boolean(match);
  } catch {
    return false;
  }
}

export async function getAllPackStatuses(): Promise<Record<string, OfflinePackRecord>> {
  const records = await loadOfflinePackRecords();
  const map: Record<string, OfflinePackRecord> = {};
  for (const r of records) {
    map[r.id] = r;
  }

  // Reconcile PDF cache status so Cache Storage is source of truth
  if (typeof caches !== "undefined") {
    for (const pdf of OFFICIAL_PDF_SPECS) {
      const cached = await isPdfCachedOffline(pdf.url);
      if (cached && (!map[pdf.packId] || map[pdf.packId].status !== "downloaded")) {
        map[pdf.packId] = {
          id: pdf.packId,
          category: "pdf",
          title: pdf.title,
          status: "downloaded",
          bytesDownloaded: pdf.estimatedBytes,
          totalBytes: pdf.estimatedBytes,
          updatedAt: new Date().toISOString(),
        };
      }
    }
  }

  return map;
}

function isQuotaError(err: unknown): boolean {
  return (
    err instanceof DOMException &&
    (err.name === "QuotaExceededError" || err.code === 22 || err.code === 1014)
  );
}

/**
 * Pause an active download without discarding progress
 */
export function pauseOfflineDownload(packId: string) {
  const handle = activeDownloads.get(packId);
  if (handle) {
    handle.paused = true;
    handle.controller.abort();
  }
}

/**
 * Download or resume a lesson, chapter, part, audio pack, or Ministry PDF
 */
export async function startOrResumePackDownload(
  descriptor: PackDescriptor,
  onProgress: (record: OfflinePackRecord) => void
): Promise<OfflinePackRecord> {
  // Check storage quota estimate first
  const est = await getStorageEstimate();
  if (est.quotaBytes > 0 && est.usageBytes + descriptor.estimatedBytes > est.quotaBytes * 0.98) {
    const quotaErrRec: OfflinePackRecord = {
      id: descriptor.id,
      category: descriptor.category,
      title: descriptor.title,
      status: "error",
      bytesDownloaded: 0,
      totalBytes: descriptor.estimatedBytes,
      errorMessage: "مساحة التخزين المتاحة على الجهاز غير كافية لإتمام التنزيل.",
      updatedAt: new Date().toISOString(),
    };
    await saveOfflinePackRecord(quotaErrRec);
    onProgress(quotaErrRec);
    return quotaErrRec;
  }

  // Ensure persistent storage is requested once when saving content
  requestPersistentStorage().catch(() => {});

  const existingHandle = activeDownloads.get(descriptor.id);
  const controller = new AbortController();
  const handle: ActiveDownloadHandle = {
    controller,
    paused: false,
    chunks: existingHandle?.chunks || [],
    receivedBytes: existingHandle?.receivedBytes || 0,
    totalBytes: existingHandle?.totalBytes || descriptor.estimatedBytes,
  };
  activeDownloads.set(descriptor.id, handle);

  const emit = async (partial: Partial<OfflinePackRecord>) => {
    const rec: OfflinePackRecord = {
      id: descriptor.id,
      category: descriptor.category,
      title: descriptor.title,
      status: partial.status || "downloading",
      bytesDownloaded: partial.bytesDownloaded ?? handle.receivedBytes,
      totalBytes: partial.totalBytes ?? handle.totalBytes,
      errorMessage: partial.errorMessage,
      updatedAt: new Date().toISOString(),
    };
    await saveOfflinePackRecord(rec);
    onProgress(rec);
    return rec;
  };

  try {
    // 1. PDF Streaming Download with real byte tracking & pause/resume
    if (descriptor.category === "pdf" && descriptor.pdfUrl) {
      if (!navigator.onLine) {
        return await emit({
          status: "paused",
          errorMessage: "تم إيقاف التنزيل مؤقتاً لعدم توفر اتصال بالإنترنت. يمكنك الاستكمال فور عودة الاتصال.",
        });
      }

      const headers: HeadersInit = {};
      if (handle.receivedBytes > 0 && handle.chunks.length > 0) {
        headers["Range"] = `bytes=${handle.receivedBytes}-`;
      }

      const response = await fetch(descriptor.pdfUrl, {
        signal: controller.signal,
        headers,
      });

      if (!response.ok && response.status !== 206) {
        throw new Error(`HTTP ${response.status}`);
      }

      // If server did not honor Range (returned 200 instead of 206), reset chunk buffer cleanly
      if (response.status === 200 && handle.receivedBytes > 0) {
        handle.chunks = [];
        handle.receivedBytes = 0;
      }

      const contentLenHeader = response.headers.get("Content-Length");
      if (contentLenHeader) {
        const len = parseInt(contentLenHeader, 10);
        if (!isNaN(len) && len > 0) {
          handle.totalBytes =
            response.status === 206 ? handle.receivedBytes + len : len;
        }
      }

      const reader = response.body?.getReader();
      if (!reader) {
        const blob = await response.blob();
        handle.receivedBytes = blob.size;
        handle.totalBytes = blob.size;
        const cache = await caches.open(CACHE_NAMES.pdfs);
        await cache.put(
          descriptor.pdfUrl,
          new Response(blob, {
            headers: {
              "Content-Type": "application/pdf",
              "Content-Length": String(blob.size),
            },
          })
        );
      } else {
        let lastUiUpdate = 0;
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            handle.chunks.push(value);
            handle.receivedBytes += value.byteLength;
            const now = Date.now();
            if (now - lastUiUpdate > 180) {
              lastUiUpdate = now;
              await emit({ status: "downloading" });
            }
          }
        }

        const fullBlob = new Blob(handle.chunks as BlobPart[], { type: "application/pdf" });
        const cache = await caches.open(CACHE_NAMES.pdfs);
        await cache.put(
          descriptor.pdfUrl,
          new Response(fullBlob, {
            status: 200,
            headers: {
              "Content-Type": "application/pdf",
              "Content-Length": String(fullBlob.size),
            },
          })
        );
      }

      activeDownloads.delete(descriptor.id);
      return await emit({
        status: "downloaded",
        bytesDownloaded: handle.totalBytes,
        totalBytes: handle.totalBytes,
      });
    }

    // 2. Lesson / Chapter / Part Packs (stored in Cache Storage + IndexedDB)
    if (
      (descriptor.category === "part" ||
        descriptor.category === "chapter" ||
        descriptor.category === "lesson") &&
      descriptor.lessonIds
    ) {
      const lessonIds = descriptor.lessonIds;
      const cache = typeof caches !== "undefined" ? await caches.open(CACHE_NAMES.lessons) : null;
      let accumulated = handle.receivedBytes;
      const startIndex = Math.min(
        lessonIds.length,
        Math.floor((accumulated / Math.max(1, descriptor.estimatedBytes)) * lessonIds.length)
      );

      let actualTotal = 0;
      for (let i = startIndex; i < lessonIds.length; i++) {
        if (controller.signal.aborted) {
          throw new DOMException("Paused", "AbortError");
        }
        const id = lessonIds[i];
        const detailed = getDetailedLessonSync(id);
        if (detailed) {
          const jsonStr = JSON.stringify(detailed);
          actualTotal += jsonStr.length;
          if (cache) {
            await cache.put(
              `/offline-lessons/${id}.json`,
              new Response(jsonStr, {
                headers: { "Content-Type": "application/json; charset=utf-8" },
              })
            );
          }
          await saveStudentKV(`cached_lesson_${id}`, true);
          accumulated = Math.round(((i + 1) / lessonIds.length) * descriptor.estimatedBytes);
          handle.receivedBytes = accumulated;
          if (i % 3 === 0 || i === lessonIds.length - 1) {
            await emit({
              status: "downloading",
              bytesDownloaded: accumulated,
              totalBytes: descriptor.estimatedBytes,
            });
          }
        }
        // Yield briefly to keep UI smooth & allow pause button response
        await new Promise((r) => setTimeout(r, 15));
      }

      const finalSize = Math.max(actualTotal, accumulated);
      activeDownloads.delete(descriptor.id);
      return await emit({
        status: "downloaded",
        bytesDownloaded: finalSize,
        totalBytes: finalSize,
      });
    }

    // 3. Audio Narration Packs (real seekable WAV blobs + Arabic segment timelines)
    if (descriptor.category === "audio" && descriptor.lessonIds) {
      const lessonIds = descriptor.lessonIds;
      const cache = typeof caches !== "undefined" ? await caches.open(CACHE_NAMES.audio) : null;
      let totalSize = 0;
      const alreadyTracks = new Set((await listAudioTracksIDB()).map((t) => t.lessonId));

      for (let i = 0; i < lessonIds.length; i++) {
        if (controller.signal.aborted) {
          throw new DOMException("Paused", "AbortError");
        }
        const id = lessonIds[i];
        if (!alreadyTracks.has(id)) {
          const detailed = getDetailedLessonSync(id);
          if (detailed) {
            const track = createOfflineAudioTrack(detailed);
            await saveAudioTrackIDB(track);
            if (cache) {
              await cache.put(
                `/offline-audio/${id}.wav`,
                new Response(track.wavBlob, {
                  headers: {
                    "Content-Type": "audio/wav",
                    "Content-Length": String(track.wavBlob.size),
                  },
                })
              );
            }
            totalSize += track.bytesSize;
          }
        } else {
          totalSize += 720_000;
        }
        handle.receivedBytes = Math.round(((i + 1) / lessonIds.length) * descriptor.estimatedBytes);
        if (i % 2 === 0 || i === lessonIds.length - 1) {
          await emit({
            status: "downloading",
            bytesDownloaded: handle.receivedBytes,
            totalBytes: descriptor.estimatedBytes,
          });
        }
        await new Promise((r) => setTimeout(r, 15));
      }

      const finalBytes = Math.max(totalSize, handle.receivedBytes);
      activeDownloads.delete(descriptor.id);
      return await emit({
        status: "downloaded",
        bytesDownloaded: finalBytes,
        totalBytes: finalBytes,
      });
    }

    activeDownloads.delete(descriptor.id);
    return await emit({ status: "downloaded" });
  } catch (err) {
    if (
      (err instanceof DOMException && err.name === "AbortError") ||
      handle.paused
    ) {
      return await emit({
        status: "paused",
        errorMessage: "تم إيقاف التحميل مؤقتاً ويمكن استكماله في أي وقت.",
      });
    }

    activeDownloads.delete(descriptor.id);

    if (isQuotaError(err)) {
      return await emit({
        status: "error",
        errorMessage: "امتلأت مساحة التخزين المتاحة على جهازك. يرجى حذف بعض الحزم غير المستخدمة.",
      });
    }

    return await emit({
      status: !navigator.onLine ? "paused" : "error",
      errorMessage: !navigator.onLine
        ? "انقطع الاتصال بالإنترنت أثناء التنزيل. يمكنك الضغط على استكمال عند عودة الاتصال."
        : "تعذر إكمال التنزيل. يرجى المحاولة مجدداً.",
    });
  }
}

/**
 * Download ALL platform offline packs sequentially with unified progress callback
 */
export async function downloadAllPlatformContent(
  onPackUpdate: (record: OfflinePackRecord) => void,
  onOverallProgress: (percent: number, label: string) => void,
  abortSignal?: AbortSignal
): Promise<void> {
  const catalog = buildCatalogDescriptors().filter(
    (d) =>
      d.id === "part_1_lessons" ||
      d.id === "part_2_lessons" ||
      d.id === "audio_part_1" ||
      d.id === "audio_part_2" ||
      d.category === "pdf"
  );

  for (let i = 0; i < catalog.length; i++) {
    if (abortSignal?.aborted) break;
    const item = catalog[i];
    onOverallProgress(Math.round((i / catalog.length) * 100), item.title);
    const res = await startOrResumePackDownload(item, onPackUpdate);
    if (res.status === "paused" || res.status === "error") {
      break;
    }
  }
  onOverallProgress(100, "اكتمل تجهيز الحزم المحددة");
}

/**
 * Delete a saved offline package safely to free device space
 */
export async function deleteOfflinePack(descriptor: PackDescriptor): Promise<void> {
  pauseOfflineDownload(descriptor.id);
  activeDownloads.delete(descriptor.id);

  if (descriptor.category === "pdf" && descriptor.pdfUrl && typeof caches !== "undefined") {
    const cache = await caches.open(CACHE_NAMES.pdfs);
    await cache.delete(descriptor.pdfUrl);
  }

  if (
    (descriptor.category === "part" ||
      descriptor.category === "chapter" ||
      descriptor.category === "lesson") &&
    descriptor.lessonIds &&
    typeof caches !== "undefined"
  ) {
    const cache = await caches.open(CACHE_NAMES.lessons);
    for (const id of descriptor.lessonIds) {
      await cache.delete(`/offline-lessons/${id}.json`);
    }
  }

  if (descriptor.category === "audio" && descriptor.lessonIds) {
    const cache = typeof caches !== "undefined" ? await caches.open(CACHE_NAMES.audio) : null;
    for (const id of descriptor.lessonIds) {
      await deleteAudioTrackIDB(id);
      if (cache) await cache.delete(`/offline-audio/${id}.wav`);
    }
  }

  await deleteOfflinePackRecord(descriptor.id);
}

/**
 * Delete ALL saved offline content packs (preserves student XP, progress & quiz scores!)
 */
export async function clearAllOfflineContentPacks(): Promise<void> {
  for (const id of Array.from(activeDownloads.keys())) {
    pauseOfflineDownload(id);
    activeDownloads.delete(id);
  }
  if (typeof caches !== "undefined") {
    await caches.delete(CACHE_NAMES.lessons);
    await caches.delete(CACHE_NAMES.audio);
    await caches.delete(CACHE_NAMES.pdfs);
  }
  const records = await loadOfflinePackRecords();
  for (const r of records) {
    await deleteOfflinePackRecord(r.id);
  }
  const tracks = await listAudioTracksIDB();
  for (const t of tracks) {
    await deleteAudioTrackIDB(t.lessonId);
  }
}

export async function getOfflineManagerSummary(): Promise<{
  storage: StorageEstimateReport;
  packCount: number;
  audioCount: number;
  pdfCachedCount: number;
}> {
  const storage = await getStorageEstimate();
  const packs = await getAllPackStatuses();
  const downloadedPacks = Object.values(packs).filter((p) => p.status === "downloaded");
  const tracks = await listAudioTracksIDB();
  let pdfCachedCount = 0;
  for (const pdf of OFFICIAL_PDF_SPECS) {
    if (await isPdfCachedOffline(pdf.url)) pdfCachedCount++;
  }
  return {
    storage,
    packCount: downloadedPacks.length,
    audioCount: tracks.length,
    pdfCachedCount,
  };
}
