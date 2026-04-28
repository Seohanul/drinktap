"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import PenaltyScreen from "../components/PenaltyScreen";
import HowToPlay from "../components/HowToPlay";

const FILL_RATE = 1 / (5 * 60); // fills to 100% in ~5 seconds at 60fps

export default function TensionPage() {
  const ht = useTranslations("TensionHowTo");
  const t = useTranslations("Lobby");
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const [fill, setFill] = useState(0);
  const [holding, setHolding] = useState(false);
  const [exploded, setExploded] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const fillRef = useRef(0);
  const holdingRef = useRef(false);
  const targetRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const explodedRef = useRef(false);

  const initGame = () => {
    targetRef.current = 0.95 + Math.random() * 0.10;
  };

  useEffect(() => {
    initGame();
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const triggerExplosion = useCallback(() => {
    if (explodedRef.current) return;
    explodedRef.current = true;
    holdingRef.current = false;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setHolding(false);
    setExploded(true);
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([400, 100, 400, 100, 600]);
    }
    setTimeout(() => setGameOver(true), 1800);
  }, []);

  const tick = useCallback(() => {
    if (!holdingRef.current || explodedRef.current) return;
    fillRef.current = fillRef.current + FILL_RATE;
    setFill(fillRef.current);
    if (fillRef.current >= targetRef.current) {
      triggerExplosion();
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [triggerExplosion]);

  const startHold = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    if (explodedRef.current) return;
    holdingRef.current = true;
    setHolding(true);
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const endHold = useCallback(() => {
    if (!holdingRef.current) return;
    holdingRef.current = false;
    setHolding(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  const restart = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    fillRef.current = 0;
    explodedRef.current = false;
    holdingRef.current = false;
    setFill(0);
    setHolding(false);
    setExploded(false);
    setGameOver(false);
    initGame();
  }, []);

  const fillDisplay = Math.min(fill, 1.0);
  const foamPct = fillDisplay > 0.72 ? (fillDisplay - 0.72) / 0.28 : 0;
  const overflowing = fill >= 1.0;

  return (
    <>
      {gameOver && (
        <PenaltyScreen
          onPlayAgain={restart}
          onBackToLobby={() => router.push(`/${locale}/lobby`)}
        />
      )}

      <div
        className="min-h-screen flex flex-col transition-colors duration-300"
        style={{ backgroundColor: exploded ? "#7f1d1d" : "#0f172a" }}
      >
        <div className="flex items-center justify-between px-4 py-4">
          <button
            onClick={() => router.push(`/${locale}/lobby`)}
            className="text-white/60 hover:text-white text-sm px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            ‹ 뒤로
          </button>
          <h1 className="text-xl font-black text-white">🥤 {t("tension.name")}</h1>
          <div className="w-16" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-10 select-none px-6">
          {/* Beer glass */}
          <div className="flex flex-col items-center">
            {/* Overflow bubbles */}
            <div style={{ height: 48, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
              {overflowing && (
                <div className="text-3xl animate-bounce">🫧🫧🫧</div>
              )}
            </div>

            {/* Mug handle + glass body */}
            <div style={{ position: "relative", width: 160 }}>
              {/* Handle */}
              <div
                style={{
                  position: "absolute",
                  right: -22,
                  top: 30,
                  width: 22,
                  height: 80,
                  borderRadius: "0 16px 16px 0",
                  border: "3px solid rgba(255,255,255,0.2)",
                  borderLeft: "none",
                }}
              />

              {/* Glass body */}
              <div
                style={{
                  width: 140,
                  height: 220,
                  position: "relative",
                  borderRadius: "4px 4px 20px 20px",
                  border: "3px solid rgba(255,255,255,0.2)",
                  overflow: "hidden",
                  background: "rgba(255,255,255,0.03)",
                  boxShadow: "inset -10px 0 20px rgba(0,0,0,0.25)",
                }}
              >
                {/* Beer liquid */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: `${fillDisplay * 100}%`,
                    background:
                      "linear-gradient(180deg, #7C3010 0%, #4A1808 35%, #2A0C04 75%, #110400 100%)",
                    transition: holding ? "none" : "height 0.15s ease-out",
                  }}
                />

                {/* Foam */}
                {foamPct > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: `${fillDisplay * 100}%`,
                      left: 0,
                      right: 0,
                      height: `${Math.round(foamPct * 36)}px`,
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.6) 100%)",
                      borderRadius: "3px 3px 0 0",
                      transition: holding ? "none" : "bottom 0.15s ease-out, height 0.15s ease-out",
                    }}
                  />
                )}

                {/* Shine */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: "10%",
                    width: "12%",
                    height: "100%",
                    background:
                      "linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)",
                    pointerEvents: "none",
                  }}
                />
              </div>

              {/* Base */}
              <div
                style={{
                  width: "100%",
                  height: 10,
                  background: "rgba(255,255,255,0.12)",
                  borderRadius: "0 0 10px 10px",
                }}
              />
            </div>
          </div>

          {/* Status */}
          {exploded ? (
            <div className="text-center">
              <div className="text-7xl mb-3">💥</div>
              <p className="text-white font-black text-3xl tracking-tight">대폭발! 당첨!</p>
            </div>
          ) : (
            <p className="text-white/40 text-sm text-center leading-relaxed whitespace-pre-line">
              {holding ? "🥤 따르는 중..." : "꾹 누르면 콜라가 채워집니다\n넘치기 전에 떼세요!"}
            </p>
          )}
        </div>

        <HowToPlay title={ht("title")}>
          <p><span className="text-white/70 font-semibold">{ht("prepHeading")}</span><br />{ht("prepBody")}</p>
          <p><span className="text-white/70 font-semibold">{ht("playHeading")}</span><br />{ht("playBody")}</p>
          <p><span className="text-white/70 font-semibold">{ht("penaltyHeading")}</span><br />{ht("penaltyBody")}</p>
          <p><span className="text-white/70 font-semibold">{ht("tipHeading")}</span><br />{ht("tipBody")}</p>
        </HowToPlay>

        {/* Pour button */}
        {!exploded && (
          <div className="px-6 pb-10">
            <button
              onPointerDown={startHold}
              onPointerUp={endHold}
              onPointerLeave={endHold}
              onPointerCancel={endHold}
              className="w-full rounded-3xl font-black text-2xl select-none"
              style={{
                padding: "1.75rem",
                background: holding
                  ? "linear-gradient(135deg, #7C3010, #3A1206)"
                  : "rgba(255,255,255,0.07)",
                color: "white",
                border: holding
                  ? "2px solid #A04020"
                  : "2px solid rgba(255,255,255,0.13)",
                userSelect: "none",
                WebkitUserSelect: "none",
                touchAction: "none",
                transition: "background 0.1s, border 0.1s",
              }}
            >
              {holding ? "🥤 따르는 중!" : "꾹 눌러서 따르기"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
