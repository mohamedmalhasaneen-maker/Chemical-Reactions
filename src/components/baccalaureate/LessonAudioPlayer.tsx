import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  Download,
  Headphones,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
} from "lucide-react";
import { DetailedBacLesson } from "../../curriculum/types";
import {
  loadAudioTrackIDB,
  OfflineAudioTrack,
  saveAudioTrackIDB,
} from "../../utils/offlineDb";
import { createOfflineAudioTrack } from "../../utils/lessonAudioGenerator";
import { CACHE_NAMES, formatBytesArabic } from "../../utils/offlineContentManager";
import { playSound } from "../../utils/soundEngine";

interface LessonAudioPlayerProps {
  lesson: DetailedBacLesson;
}

const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5, 2];

export const LessonAudioPlayer: React.FC<LessonAudioPlayerProps> = ({ lesson }) => {
  const [track, setTrack] = useState<OfflineAudioTrack | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [enableSpeechNarration, setEnableSpeechNarration] = useState(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastSpokenSegIdxRef = useRef<number>(-1);

  // Load saved track for current lesson
  useEffect(() => {
    let active = true;
    setIsPlaying(false);
    setCurrentTime(0);
    lastSpokenSegIdxRef.current = -1;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    loadAudioTrackIDB(lesson.id).then((saved) => {
      if (!active) return;
      if (saved) {
        setTrack(saved);
        setDuration(saved.durationSec);
        const url = URL.createObjectURL(saved.wavBlob);
        setAudioUrl(url);
      } else {
        setTrack(null);
        setAudioUrl(null);
        setDuration(0);
      }
    });

    return () => {
      active = false;
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [lesson.id]);

  // Revoke object URL on change/unmount
  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  // Keep HTMLAudioElement playbackRate synchronized
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const currentSegmentIndex = useMemo(() => {
    if (!track || track.segments.length === 0) return 0;
    let idx = 0;
    for (let i = 0; i < track.segments.length; i++) {
      if (currentTime >= track.segments[i].timeSec) idx = i;
    }
    return idx;
  }, [track, currentTime]);

  const activeSegment = track?.segments[currentSegmentIndex];

  // Synchronized offline-capable Web Speech narration when supported by device OS
  useEffect(() => {
    if (!isPlaying || !enableSpeechNarration || !activeSegment) return;
    if (lastSpokenSegIdxRef.current === currentSegmentIndex) return;
    lastSpokenSegIdxRef.current = currentSegmentIndex;

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(
          `${activeSegment.heading}. ${activeSegment.text}`
        );
        utter.lang = "ar-EG";
        utter.rate = Math.min(2, Math.max(0.75, playbackRate));
        window.speechSynthesis.speak(utter);
      } catch {
        // Ignore OS speech synthesis availability issues; WAV audio continues smoothly
      }
    }
  }, [isPlaying, enableSpeechNarration, currentSegmentIndex, activeSegment, playbackRate]);

  const handleDownloadTrack = async () => {
    setIsDownloading(true);
    playSound("select");
    try {
      const created = createOfflineAudioTrack(lesson);
      await saveAudioTrackIDB(created);
      if (typeof caches !== "undefined") {
        const cache = await caches.open(CACHE_NAMES.audio);
        await cache.put(
          `/offline-audio/${lesson.id}.wav`,
          new Response(created.wavBlob, {
            headers: {
              "Content-Type": "audio/wav",
              "Content-Length": String(created.wavBlob.size),
            },
          })
        );
      }
      setTrack(created);
      setDuration(created.durationSec);
      const url = URL.createObjectURL(created.wavBlob);
      setAudioUrl(url);
      playSound("success");
    } finally {
      setIsDownloading(false);
    }
  };

  const togglePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      if ("speechSynthesis" in window) window.speechSynthesis.pause();
      playSound("click");
    } else {
      try {
        audio.playbackRate = playbackRate;
        await audio.play();
        setIsPlaying(true);
        if ("speechSynthesis" in window && window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      } catch {
        // Ignore playback rejection
      }
    }
  };

  const handleSeek = (nextSec: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = nextSec;
    }
    lastSpokenSegIdxRef.current = -1;
    setCurrentTime(nextSec);
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="rounded-2xl border border-cyan-500/30 bg-slate-900/75 p-4 space-y-3 shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/35">
            <Headphones size={18} />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-white">
              الشرح الصوتي الموجز للدرس
            </h4>
            <p className="text-[11px] text-slate-400">
              {track
                ? `محفوظ دون إنترنت (${formatBytesArabic(track.bytesSize)}) · جاهز للتشغيل والتحكم في السرعة`
                : "نزّل المقطع الصوتي للاستماع إلى ملخص الدرس دون اتصال بالإنترنت"}
            </p>
          </div>
        </div>

        {!track ? (
          <button
            type="button"
            onClick={handleDownloadTrack}
            disabled={isDownloading}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 px-3.5 py-2 text-xs font-extrabold text-white transition active:scale-95"
          >
            <Download size={14} />
            <span>{isDownloading ? "جارٍ التجهيز..." : "تنزيل الشرح الصوتي"}</span>
          </button>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/35 px-2.5 py-1 text-[11px] font-bold text-emerald-300">
            <CheckCircle2 size={12} />
            <span>متاح دون إنترنت</span>
          </span>
        )}
      </div>

      {track && audioUrl && (
        <div className="space-y-3 pt-1">
          <audio
            ref={audioRef}
            src={audioUrl}
            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
            onLoadedMetadata={(e) => {
              if (e.currentTarget.duration && !isNaN(e.currentTarget.duration)) {
                setDuration(e.currentTarget.duration);
              }
            }}
            onEnded={() => {
              setIsPlaying(false);
              lastSpokenSegIdxRef.current = -1;
            }}
            className="hidden"
          />

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={togglePlayPause}
              aria-label={isPlaying ? "إيقاف مؤقت" : "تشغيل الشرح الصوتي"}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm transition active:scale-95 shrink-0"
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>

            <button
              type="button"
              onClick={() => handleSeek(0)}
              aria-label="إعادة من البداية"
              title="إعادة من البداية"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition shrink-0"
            >
              <RotateCcw size={15} />
            </button>

            {/* Seek Slider */}
            <div className="flex-1 min-w-[140px] flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min={0}
                max={Math.max(1, duration)}
                step={0.5}
                value={currentTime}
                onChange={(e) => handleSeek(Number(e.target.value))}
                className="flex-1 accent-cyan-400 cursor-pointer"
                aria-label="شريط تقدم الصوت"
              />
              <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                {formatTime(duration)}
              </span>
            </div>

            {/* Playback Speed Controls */}
            <div className="inline-flex items-center rounded-xl bg-slate-950 border border-slate-800 p-0.5">
              {SPEED_OPTIONS.map((spd) => (
                <button
                  key={spd}
                  type="button"
                  onClick={() => {
                    setPlaybackRate(spd);
                    playSound("click");
                  }}
                  className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition ${
                    playbackRate === spd
                      ? "bg-cyan-500/25 text-cyan-300"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            {/* Speech Voice Toggle */}
            <button
              type="button"
              onClick={() => {
                const next = !enableSpeechNarration;
                setEnableSpeechNarration(next);
                if (!next && "speechSynthesis" in window) {
                  window.speechSynthesis.cancel();
                }
              }}
              title={enableSpeechNarration ? "إيقاف القراءة الصوتية" : "تفعيل القراءة الصوتية"}
              className={`inline-flex h-9 items-center gap-1 rounded-xl border px-2.5 text-[11px] font-bold transition ${
                enableSpeechNarration
                  ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300"
                  : "border-slate-700 bg-slate-800 text-slate-400"
              }`}
            >
              {enableSpeechNarration ? <Volume2 size={14} /> : <VolumeX size={14} />}
              <span className="hidden sm:inline">نطق</span>
            </button>
          </div>

          {activeSegment && (
            <div className="rounded-xl border border-slate-800 bg-slate-950/75 p-3 text-xs space-y-1">
              <div className="font-bold text-cyan-300">{activeSegment.heading}</div>
              <p className="text-slate-300 leading-relaxed line-clamp-2">{activeSegment.text}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
