"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import PenaltyScreen from "../components/PenaltyScreen";

function randomTimer() {
  return Math.floor(Math.random() * 21) + 10; // 10–30 seconds
}

export default function BombPage() {
  const t = useTranslations("Lobby");
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(randomTimer);
  const [ticking, setTicking] = useState(false); // pulse on pass
  const [exploded, setExploded] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Countdown
  useEffect(() => {
    if (!started || exploded) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(intervalRef.current!);
          setExploded(true);
          setTimeout(() => setGameOver(true), 800);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, [started, exploded]);

  const handlePass = useCallback(() => {
    if (!started) {
      setStarted(true);
      return;
    }
    if (exploded) return;
    // Tick-tock visual pulse
    setTicking(true);
    setTimeout(() => setTicking(false), 300);
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(80);
    }
  }, [started, exploded]);

  const restart = () => {
    setStarted(false);
    setTimeLeft(randomTimer());
    setTicking(false);
    setExploded(false);
    setGameOver(false);
  };

  const dangerLevel = timeLeft <= 5 ? "danger" : timeLeft <= 10 ? "warn" : "safe";

  return (
    <>
      {gameOver && (
        <PenaltyScreen
          onPlayAgain={restart}
          onBackToLobby={() => router.push(`/${locale}/lobby`)}
        />
      )}

      <div
        className={[
          "min-h-screen flex flex-col items-center justify-between px-4 py-6 transition-colors duration-500",
          dangerLevel === "danger"
            ? "bg-gradient-to-br from-red-900 via-red-800 to-orange-900"
            : dangerLevel === "warn"
            ? "bg-gradient-to-br from-orange-900 via-amber-900 to-yellow-900"
            : "bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900",
        ].join(" ")}
        onPointerDown={handlePass}
      >
        {/* Header */}
        <div className="flex items-center justify-between w-full">
          <button
            onPointerDown={(e) => {
              e.stopPropagation();
              router.push(`/${locale}/lobby`);
            }}
            className="text-white/60 hover:text-white text-sm px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            ‹ 뒤로
          </button>
          <h1 className="text-xl font-black text-white">{t("bomb.name")}</h1>
          <div className="w-16" />
        </div>

        {/* Timer display */}
        <div className="flex flex-col items-center gap-2">
          {started && !exploded && (
            <span
              className={[
                "text-7xl font-black tabular-nums transition-colors",
                dangerLevel === "danger" ? "text-red-300 animate-pulse" : "text-white",
              ].join(" ")}
            >
              {timeLeft}
            </span>
          )}
          {!started && (
            <p className="text-white/60 text-lg font-semibold text-center">
              화면을 터치해서 시작!
            </p>
          )}
        </div>

        {/* Bomb */}
        <div
          className={[
            "flex flex-col items-center gap-4 transition-transform duration-150 select-none",
            ticking ? "scale-125" : "scale-100",
            exploded ? "scale-150 opacity-0 duration-700" : "",
          ].join(" ")}
        >
          <span className="text-[140px] leading-none drop-shadow-2xl">
            {exploded ? "💥" : "💣"}
          </span>
          {started && !exploded && (
            <p className="text-white/70 text-base font-medium text-center pointer-events-none">
              터치해서 옆 사람에게 넘겨라!
            </p>
          )}
          {!started && (
            <p className="text-white/50 text-sm text-center pointer-events-none">
              {t("bomb.description")}
            </p>
          )}
        </div>

        {/* Fuse dots */}
        <div className="flex gap-2 pb-4">
          {Array.from({ length: Math.min(timeLeft, 15) }).map((_, i) => (
            <div
              key={i}
              className={[
                "w-2.5 h-2.5 rounded-full transition-colors",
                i < 5 ? "bg-red-400" : i < 10 ? "bg-orange-400" : "bg-green-400",
              ].join(" ")}
            />
          ))}
        </div>
      </div>
    </>
  );
}
