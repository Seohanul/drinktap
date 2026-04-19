"use client";

import { useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import PenaltyScreen from "../components/PenaltyScreen";

const TOTAL_TEETH = 12;

function pickPenaltyIndex() {
  return Math.floor(Math.random() * TOTAL_TEETH);
}

type ToothState = "idle" | "safe" | "penalty";

export default function AlligatorPage() {
  const t = useTranslations("Lobby");
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const [penaltyIndex] = useState(pickPenaltyIndex);
  const [teeth, setTeeth] = useState<ToothState[]>(
    Array(TOTAL_TEETH).fill("idle")
  );
  const [gameOver, setGameOver] = useState(false);

  const handlePress = useCallback(
    (i: number) => {
      if (teeth[i] !== "idle" || gameOver) return;
      if (i === penaltyIndex) {
        setTeeth((prev) => {
          const next = [...prev];
          next[i] = "penalty";
          return next;
        });
        setTimeout(() => setGameOver(true), 400);
      } else {
        setTeeth((prev) => {
          const next = [...prev];
          next[i] = "safe";
          return next;
        });
      }
    },
    [teeth, penaltyIndex, gameOver]
  );

  const restart = () => {
    setTeeth(Array(TOTAL_TEETH).fill("idle"));
    setGameOver(false);
    // re-mount trick: navigate same page to reset penaltyIndex
    router.replace(`/${locale}/alligator`);
  };

  return (
    <>
      {gameOver && (
        <PenaltyScreen
          onPlayAgain={restart}
          onBackToLobby={() => router.push(`/${locale}/lobby`)}
        />
      )}

      <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.push(`/${locale}/lobby`)}
            className="text-white/60 hover:text-white text-sm px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            ‹ 뒤로
          </button>
          <h1 className="text-xl font-black text-white">{t("alligator.name")}</h1>
          <div className="w-16" />
        </div>

        {/* Alligator mouth illustration */}
        <div className="flex justify-center mb-6">
          <div className="text-8xl select-none">🐊</div>
        </div>

        <p className="text-center text-green-200 text-sm mb-6 px-4">
          {t("alligator.description")}
        </p>

        {/* Teeth grid */}
        <div className="grid grid-cols-4 gap-3 flex-1 content-center max-w-xs mx-auto w-full">
          {teeth.map((state, i) => (
            <button
              key={i}
              onPointerDown={() => handlePress(i)}
              disabled={state !== "idle" || gameOver}
              className={[
                "aspect-square rounded-xl flex items-center justify-center text-3xl font-black transition-all duration-150 active:scale-90 select-none touch-none",
                state === "idle"
                  ? "bg-white shadow-lg shadow-black/30 hover:bg-green-50 active:bg-green-100"
                  : state === "safe"
                  ? "bg-green-400/40 border-2 border-green-400 scale-90 opacity-50"
                  : "bg-red-500 scale-110 animate-ping-once",
              ].join(" ")}
            >
              {state === "idle" ? "🦷" : state === "safe" ? "✓" : "💥"}
            </button>
          ))}
        </div>

        <p className="text-center text-green-700 text-xs mt-6">
          {teeth.filter((s) => s === "safe").length} / {TOTAL_TEETH - 1}
        </p>
      </div>
    </>
  );
}
