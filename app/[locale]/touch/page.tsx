"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import PenaltyScreen from "../components/PenaltyScreen";

interface TouchPoint {
  id: number;
  x: number;
  y: number;
  penalty: boolean;
}

const COUNTDOWN_DURATION = 3; // seconds before picking a loser

export default function TouchRoulettePage() {
  const t = useTranslations("Lobby");
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const [phase, setPhase] = useState<"waiting" | "countdown" | "result">(
    "waiting"
  );
  const [countdown, setCountdown] = useState(COUNTDOWN_DURATION);
  const [touches, setTouches] = useState<TouchPoint[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (phase !== "waiting" && phase !== "countdown") return;
      e.preventDefault();
      const rect = containerRef.current!.getBoundingClientRect();
      const newTouches: TouchPoint[] = Array.from(e.touches).map((t) => ({
        id: t.identifier,
        x: t.clientX - rect.left,
        y: t.clientY - rect.top,
        penalty: false,
      }));
      setTouches(newTouches);

      if (newTouches.length >= 2 && phase === "waiting") {
        setPhase("countdown");
        setCountdown(COUNTDOWN_DURATION);
      }
      if (newTouches.length < 2 && phase === "countdown") {
        setPhase("waiting");
        clearInterval(intervalRef.current!);
      }
    },
    [phase]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (phase === "result") return;
      e.preventDefault();
      const rect = containerRef.current!.getBoundingClientRect();
      const newTouches: TouchPoint[] = Array.from(e.touches).map((t) => ({
        id: t.identifier,
        x: t.clientX - rect.left,
        y: t.clientY - rect.top,
        penalty: false,
      }));
      setTouches(newTouches);
      if (newTouches.length < 2 && phase === "countdown") {
        setPhase("waiting");
        clearInterval(intervalRef.current!);
      }
    },
    [phase]
  );

  // Countdown timer
  useEffect(() => {
    if (phase !== "countdown") return;
    intervalRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(intervalRef.current!);
          // Pick a random loser
          setTouches((prev) => {
            if (prev.length === 0) return prev;
            const loserIdx = Math.floor(Math.random() * prev.length);
            return prev.map((t, i) => ({ ...t, penalty: i === loserIdx }));
          });
          setPhase("result");
          setTimeout(() => setGameOver(true), 1200);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, [phase]);

  const restart = () => {
    setPhase("waiting");
    setCountdown(COUNTDOWN_DURATION);
    setTouches([]);
    setGameOver(false);
  };

  return (
    <>
      {gameOver && (
        <PenaltyScreen
          onPlayAgain={restart}
          onBackToLobby={() => router.push(`/${locale}/lobby`)}
        />
      )}

      <div
        ref={containerRef}
        className="min-h-screen flex flex-col bg-gradient-to-br from-pink-900 via-rose-900 to-purple-900 relative overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={(e) => e.preventDefault()}
        style={{ touchAction: "none" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-6 z-10">
          <button
            onPointerDown={(e) => {
              e.stopPropagation();
              router.push(`/${locale}/lobby`);
            }}
            className="text-white/60 hover:text-white text-sm px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            ‹ 뒤로
          </button>
          <h1 className="text-xl font-black text-white">{t("touch.name")}</h1>
          <div className="w-16" />
        </div>

        {/* Center instructions / countdown */}
        <div className="flex-1 flex flex-col items-center justify-center pointer-events-none z-10">
          {phase === "waiting" && (
            <div className="text-center px-6">
              <div className="text-6xl mb-4">👆👆</div>
              <p className="text-white font-bold text-xl">
                {t("touch.description")}
              </p>
              <p className="text-white/50 text-sm mt-2">2명 이상 손가락을 올려주세요</p>
            </div>
          )}
          {phase === "countdown" && (
            <div className="text-center">
              <p className="text-white/60 text-lg font-semibold mb-2">결과 발표까지...</p>
              <span className="text-9xl font-black text-white animate-pulse">
                {countdown}
              </span>
              <p className="text-white/50 text-sm mt-2">손가락을 떼지 마세요!</p>
            </div>
          )}
          {phase === "result" && touches.length > 0 && (
            <div className="text-center">
              <p className="text-white font-black text-2xl">결과 발표!</p>
            </div>
          )}
        </div>

        {/* Touch indicators */}
        {touches.map((touch) => (
          <div
            key={touch.id}
            className={[
              "absolute w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black border-4 transition-colors duration-300",
              touch.penalty
                ? "bg-red-500/80 border-red-300 animate-pulse scale-125"
                : phase === "result"
                ? "bg-green-500/80 border-green-300"
                : "bg-white/20 border-white/60",
            ].join(" ")}
            style={{
              left: touch.x - 40,
              top: touch.y - 40,
              pointerEvents: "none",
            }}
          >
            {touch.penalty ? "💀" : "👆"}
          </div>
        ))}

        {/* Player count badge */}
        {touches.length > 0 && (
          <div className="absolute top-20 right-4 bg-white/10 rounded-full px-3 py-1 text-white text-sm font-bold z-10 pointer-events-none">
            {touches.length}명
          </div>
        )}
      </div>
    </>
  );
}
