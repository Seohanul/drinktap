"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import PenaltyScreen from "../components/PenaltyScreen";
import HowToPlay from "../components/HowToPlay";

const FILL_RATE = 1 / (5 * 60);

// [leftPct, durationSec, delaySec, sizePx]
const BUBBLES = [
  [18, 2.1, 0.0, 4],
  [42, 1.7, 0.6, 3],
  [68, 2.4, 1.1, 5],
  [30, 1.9, 0.3, 3],
  [58, 2.2, 0.9, 4],
  [12, 1.8, 1.6, 3],
  [78, 2.0, 0.2, 4],
  [50, 2.5, 1.3, 3],
] as const;

export default function TensionPage() {
  const ht = useTranslations("TensionHowTo");
  const t = useTranslations("Lobby");
  const tc = useTranslations("Common");
  const tg = useTranslations("TensionGame");
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
  // Foam visible from the very start, growing as glass fills
  const foamHeight = fillDisplay > 0.01 ? Math.max(5, Math.round(fillDisplay * 26)) : 0;
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
            ‹ {tc("back")}
          </button>
          <h1 className="text-xl font-black text-white">🥤 {t("tension.name")}</h1>
          <div className="w-16" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-8 select-none px-6">

          {/* Bottle + glass scene — 300px wide, 420px tall */}
          <div style={{ position: "relative", width: 300, height: 420 }}>

            {/*
              Bottle geometry (300px wide scene):
                bottle center x=270 (left:235), pivot (bottom-center) at (270, 188)
                idle +10deg → mouth just right of scene (resting upright)
                hold -75deg (15° from horizontal) → mouth at (270-162, 188-43) ≈ (108, 145)
                glass center x≈110, glass top y≈190, stream falls ~45px into center
            */}
            <div style={{
              position: "absolute",
              left: 235,
              top: 20,
              width: 70,
              height: 168,
              transform: `rotate(${holding ? -75 : 10}deg)`,
              transformOrigin: "bottom center",
              transition: "transform 0.38s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}>
              {/* Cap */}
              <div style={{
                position: "absolute", top: 0, left: "50%",
                transform: "translateX(-50%)",
                width: 22, height: 14,
                background: "linear-gradient(180deg, #FF1A1A, #AA0000)",
                borderRadius: "4px 4px 0 0",
              }} />
              {/* Neck */}
              <div style={{
                position: "absolute", top: 14, left: "50%",
                transform: "translateX(-50%)",
                width: 18, height: 32,
                background: "linear-gradient(90deg, #2A0C04, #5A1E10, #3A1008, #2A0C04)",
              }} />
              {/* Shoulder */}
              <div style={{
                position: "absolute", top: 46, left: "50%",
                transform: "translateX(-50%)",
                width: 60, height: 20,
                background: "#3A1208",
                clipPath: "polygon(18% 0%, 82% 0%, 100% 100%, 0% 100%)",
              }} />
              {/* Body */}
              <div style={{
                position: "absolute", top: 66, left: "50%",
                transform: "translateX(-50%)",
                width: 64, height: 88,
                background: "linear-gradient(135deg, #7C3010 0%, #4A1808 45%, #1A0804 100%)",
                borderRadius: "4px 4px 10px 10px",
                border: "1px solid rgba(255,255,255,0.09)",
                overflow: "hidden",
              }}>
                {/* Label */}
                <div style={{
                  position: "absolute",
                  top: "16%", left: "10%", right: "10%", bottom: "16%",
                  background: "rgba(180, 0, 0, 0.75)",
                  borderRadius: "3px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexDirection: "column", gap: 2,
                }}>
                  <span style={{ color: "white", fontSize: 11, fontWeight: 900, letterSpacing: 2 }}>COLA</span>
                  <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 7, letterSpacing: 1 }}>500ml</span>
                </div>
                {/* Shine */}
                <div style={{
                  position: "absolute", top: 0, left: "12%",
                  width: "14%", height: "100%",
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
                  pointerEvents: "none",
                }} />
              </div>
              {/* Base */}
              <div style={{
                position: "absolute", bottom: 0, left: "50%",
                transform: "translateX(-50%)",
                width: 64, height: 14,
                background: "linear-gradient(180deg, #1A0804, #0A0200)",
                borderRadius: "0 0 8px 8px",
              }} />
            </div>

            {/* Pour stream */}
            {holding && !exploded && (
              <div style={{
                position: "absolute",
                left: 105,
                top: 145,
                width: 7,
                height: 45,
                background: "linear-gradient(180deg, #8C3818 0%, #4A1808 50%, transparent 100%)",
                borderRadius: "4px",
                animation: "streamWiggle 0.14s ease-in-out infinite",
                transformOrigin: "top center",
              }} />
            )}

            {/* Overflow bubbles */}
            <div style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              bottom: 240,
              height: 48,
              display: "flex", alignItems: "flex-end", justifyContent: "center",
            }}>
              {overflowing && (
                <div className="text-3xl animate-bounce">🫧🫧🫧</div>
              )}
            </div>

            {/* Mug handle + glass — centered in 240px container */}
            <div style={{ position: "absolute", bottom: 0, left: 40, width: 160 }}>
              {/* Handle */}
              <div style={{
                position: "absolute",
                right: -22, top: 30,
                width: 22, height: 80,
                borderRadius: "0 16px 16px 0",
                border: "3px solid rgba(255,255,255,0.2)",
                borderLeft: "none",
              }} />

              {/* Glass body */}
              <div style={{
                width: 140, height: 220,
                position: "relative",
                borderRadius: "4px 4px 20px 20px",
                border: "3px solid rgba(255,255,255,0.2)",
                overflow: "hidden",
                background: "rgba(255,255,255,0.03)",
                boxShadow: "inset -10px 0 20px rgba(0,0,0,0.25)",
              }}>
                {/* Cola liquid */}
                <div style={{
                  position: "absolute",
                  bottom: 0, left: 0, right: 0,
                  height: `${fillDisplay * 100}%`,
                  background: "linear-gradient(180deg, #7C3010 0%, #4A1808 35%, #2A0C04 75%, #110400 100%)",
                  transition: holding ? "none" : "height 0.15s ease-out",
                  overflow: "hidden",
                }}>
                  {/* Rising bubbles inside liquid */}
                  {fillDisplay > 0.01 && BUBBLES.map(([lp, dur, delay, sz], i) => (
                    <div key={i} style={{
                      position: "absolute",
                      bottom: "4%",
                      left: `${lp}%`,
                      width: sz,
                      height: sz,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.55)",
                      animation: `rise ${dur}s ${delay}s linear infinite`,
                    }} />
                  ))}
                </div>

                {/* Foam — visible from first pour, grows with fill */}
                {foamHeight > 0 && (
                  <div style={{
                    position: "absolute",
                    bottom: `${fillDisplay * 100}%`,
                    left: 0, right: 0,
                    height: `${foamHeight}px`,
                    background: "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.5) 100%)",
                    borderRadius: "3px 3px 0 0",
                    transition: holding ? "none" : "bottom 0.15s ease-out, height 0.15s ease-out",
                  }} />
                )}

                {/* Shine */}
                <div style={{
                  position: "absolute", top: 0, left: "10%",
                  width: "12%", height: "100%",
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)",
                  pointerEvents: "none",
                }} />
              </div>

              {/* Base */}
              <div style={{
                width: "100%", height: 10,
                background: "rgba(255,255,255,0.12)",
                borderRadius: "0 0 10px 10px",
              }} />
            </div>
          </div>

          {/* Status */}
          {exploded ? (
            <div className="text-center">
              <div className="text-7xl mb-3">💥</div>
              <p className="text-white font-black text-3xl tracking-tight">{tg("explosion")}</p>
            </div>
          ) : (
            <p className="text-white/40 text-sm text-center leading-relaxed whitespace-pre-line">
              {holding ? tg("pouring") : tg("instruction")}
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
              {holding ? tg("holdButton") : tg("pourButton")}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
