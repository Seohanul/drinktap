"use client";

import { useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import PenaltyScreen from "../components/PenaltyScreen";

const TOTAL_HOLES = 8;

function pickPenaltyHole() {
  return Math.floor(Math.random() * TOTAL_HOLES);
}

export default function PiratePage() {
  const t = useTranslations("Lobby");
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const [penaltyHole] = useState(pickPenaltyHole);
  const [stabbed, setStabbed] = useState<boolean[]>(Array(TOTAL_HOLES).fill(false));
  const [penaltyAt, setPenaltyAt] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);

  const handleStab = useCallback(
    (i: number) => {
      if (stabbed[i] || gameOver) return;
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(60);
      }
      setStabbed((prev) => {
        const next = [...prev];
        next[i] = true;
        return next;
      });
      if (i === penaltyHole) {
        setPenaltyAt(i);
        setTimeout(() => setGameOver(true), 600);
      }
    },
    [stabbed, penaltyHole, gameOver]
  );

  const restart = () => {
    setStabbed(Array(TOTAL_HOLES).fill(false));
    setPenaltyAt(null);
    setGameOver(false);
    router.replace(`/${locale}/pirate`);
  };

  return (
    <>
      {gameOver && (
        <PenaltyScreen
          onPlayAgain={restart}
          onBackToLobby={() => router.push(`/${locale}/lobby`)}
        />
      )}

      <div className="min-h-screen flex flex-col bg-gradient-to-br from-amber-900 via-yellow-900 to-orange-900 px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.push(`/${locale}/lobby`)}
            className="text-white/60 hover:text-white text-sm px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            ‹ 뒤로
          </button>
          <h1 className="text-xl font-black text-white">{t("pirate.name")}</h1>
          <div className="w-16" />
        </div>

        {/* Barrel */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <span className="text-[100px] leading-none select-none">🛢️</span>
            {penaltyAt !== null && (
              <span className="absolute inset-0 flex items-center justify-center text-5xl animate-bounce">
                ⚔️
              </span>
            )}
          </div>
        </div>

        <p className="text-center text-amber-200 text-sm mb-6 px-4">
          {t("pirate.description")}
        </p>

        {/* Knife holes grid */}
        <div className="grid grid-cols-4 gap-4 max-w-xs mx-auto w-full">
          {stabbed.map((isStabbed, i) => (
            <button
              key={i}
              onPointerDown={() => handleStab(i)}
              disabled={isStabbed || gameOver}
              className={[
                "aspect-square rounded-xl flex items-center justify-center text-3xl transition-all duration-150 active:scale-90 select-none touch-none",
                isStabbed && i === penaltyAt
                  ? "bg-red-500 scale-110"
                  : isStabbed
                  ? "bg-amber-800/40 border-2 border-amber-700 opacity-50"
                  : "bg-white/20 hover:bg-white/30 shadow-lg",
              ].join(" ")}
            >
              {isStabbed && i === penaltyAt ? "💥" : isStabbed ? "🗡️" : "🕳️"}
            </button>
          ))}
        </div>

        <p className="text-center text-amber-700 text-xs mt-6">
          {stabbed.filter(Boolean).length} / {TOTAL_HOLES}
        </p>
      </div>
    </>
  );
}
