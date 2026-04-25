"use client";

import { useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import PenaltyScreen from "../components/PenaltyScreen";

const TOTAL_TEETH = 20;

// all.png 픽셀 분석: 이빨 위치 + 주변 잇몸 색 + 방향별 마스크
const POSITIONS: { x: number; y: number; w: number; h: number; gum: string; mask: string; rot: number }[] = [
  { x: 13.1, y: 13.8, w: 11.3, h: 7.5, gum: "#634946", mask: "/mask-top.png",        rot:   0 },
  { x: 33.4, y: 12.1, w: 11.3, h: 7.7, gum: "#634743", mask: "/mask-top.png",        rot:   0 },
  { x: 55.5, y: 12.1, w: 11.3, h: 7.7, gum: "#624743", mask: "/mask-top.png",        rot:   0 },
  { x: 75.8, y: 13.8, w: 11.5, h: 7.5, gum: "#634945", mask: "/mask-top.png",        rot:   0 },
  { x:  5.2, y: 22.1, w: 11.3, h: 7.7, gum: "#604642", mask: "/mask-left.png",       rot: 0 },
  { x:  5.9, y: 31.8, w: 11.5, h: 7.7, gum: "#59403d", mask: "/mask-left.png",       rot: 0 },
  { x:  7.4, y: 42.2, w: 11.3, h: 7.7, gum: "#5d4643", mask: "/mask-left.png",       rot: 0 },
  { x:  7.7, y: 56.8, w: 11.5, h: 7.5, gum: "#1e0203", mask: "/mask-left-flip.png",  rot: 180 },
  { x:  6.3, y: 67.0, w: 11.3, h: 7.7, gum: "#461918", mask: "/mask-left-flip.png",  rot: 180 },
  { x:  5.6, y: 76.7, w: 11.3, h: 7.7, gum: "#63443f", mask: "/mask-left-flip.png",  rot: 180 },
  { x: 83.5, y: 22.1, w: 11.5, h: 7.7, gum: "#5f4642", mask: "/mask-right.png",      rot: 0 },
  { x: 82.8, y: 32.0, w: 11.5, h: 7.5, gum: "#654c48", mask: "/mask-right.png",      rot: 0 },
  { x: 81.5, y: 42.2, w: 11.3, h: 7.7, gum: "#5d4744", mask: "/mask-right.png",      rot: 0 },
  { x: 81.0, y: 56.8, w: 11.3, h: 7.5, gum: "#1e0203", mask: "/mask-right-flip.png", rot: 180 },
  { x: 82.4, y: 67.0, w: 11.5, h: 7.7, gum: "#431817", mask: "/mask-right-flip.png", rot: 180 },
  { x: 83.3, y: 76.7, w: 11.3, h: 7.7, gum: "#634440", mask: "/mask-right-flip.png", rot: 180 },
  { x: 13.8, y: 84.7, w: 11.3, h: 7.7, gum: "#591514", mask: "/mask-bottom.png",     rot: 180 },
  { x: 33.4, y: 86.8, w: 11.5, h: 7.5, gum: "#9a2f25", mask: "/mask-bottom.png",     rot: 180 },
  { x: 55.3, y: 86.8, w: 11.3, h: 7.5, gum: "#a03428", mask: "/mask-bottom.png",     rot: 180 },
  { x: 75.2, y: 84.7, w: 11.3, h: 7.7, gum: "#49110f", mask: "/mask-bottom.png",     rot: 180 },
];

function pickPenaltyIndex() {
  return Math.floor(Math.random() * TOTAL_TEETH);
}

type ToothState = "idle" | "pushed" | "penalty";

export default function AlligatorPage() {
  const t = useTranslations("Lobby");
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const [penaltyIndex, setPenaltyIndex] = useState(pickPenaltyIndex);
  const [teeth, setTeeth] = useState<ToothState[]>(Array(TOTAL_TEETH).fill("idle"));
  const [gameOver, setGameOver] = useState(false);
  const [locked, setLocked] = useState(false);

  const handlePress = useCallback(
    (i: number) => {
      if (teeth[i] !== "idle" || gameOver || locked) return;
      if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(40);
      if (i === penaltyIndex) {
        setLocked(true);
        setTeeth((prev) => { const n = [...prev]; n[i] = "penalty"; return n; });
        setTimeout(() => setGameOver(true), 1000);
      } else {
        setTeeth((prev) => { const n = [...prev]; n[i] = "pushed"; return n; });
      }
    },
    [teeth, penaltyIndex, gameOver, locked]
  );

  const restart = () => {
    setPenaltyIndex(pickPenaltyIndex());
    setTeeth(Array(TOTAL_TEETH).fill("idle"));
    setGameOver(false);
    setLocked(false);
  };

  const pushedCount = teeth.filter((s) => s === "pushed").length;

  return (
    <>
      {gameOver && (
        <PenaltyScreen
          onPlayAgain={restart}
          onBackToLobby={() => router.push(`/${locale}/lobby`)}
        />
      )}

      <div className="min-h-screen flex flex-col bg-black">
        <div className="flex items-center justify-between px-4 py-4 z-10">
          <button
            onClick={() => router.push(`/${locale}/lobby`)}
            className="text-white/60 hover:text-white text-sm px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            ‹ 뒤로
          </button>
          <h1 className="text-xl font-black text-white">{t("alligator.name")}</h1>
          <span className="text-white/50 text-sm w-16 text-right">
            {pushedCount}/{TOTAL_TEETH - 1}
          </span>
        </div>

        <div className="flex-1 flex items-center justify-center px-2 overflow-hidden">
          <div
            className="relative max-w-full"
            style={{
              aspectRatio: "443/782",
              height: "calc(100dvh - 160px)",
              maxWidth: "100%",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/all.png"
              alt="alligator"
              className="absolute inset-0 w-full h-full object-fill rounded-2xl"
              draggable={false}
            />

            {POSITIONS.map((p, i) => {
              const state = teeth[i];
              return (
                <div
                  key={i}
                  onPointerDown={() => handlePress(i)}
                  style={{
                    position: "absolute",
                    left: `${p.x}%`,
                    top: `${p.y}%`,
                    width: `${p.w}%`,
                    height: `${p.h}%`,
                    cursor: state === "idle" ? "pointer" : "default",
                  }}
                >
                  {state === "pushed" && (
                    <div
                      style={{
                        position: "absolute",
                        inset: "-20%",
                        background: `radial-gradient(ellipse at 50% 42%, #080101 15%, #200606 45%, #3a1010 68%, ${p.gum} 100%)`,
                        WebkitMaskImage: `url('${p.mask}')`,
                        WebkitMaskSize: "100% 100%",
                        WebkitMaskRepeat: "no-repeat",
                        maskImage: `url('${p.mask}')`,
                        maskSize: "100% 100%",
                        maskRepeat: "no-repeat",
                      }}
                    />
                  )}
                  {state === "penalty" && (
                    <div style={{ position: "absolute", inset: "-20%",
                      WebkitMaskImage: `url('${p.mask}')`, WebkitMaskSize: "100% 100%", WebkitMaskRepeat: "no-repeat",
                      maskImage: `url('${p.mask}')`, maskSize: "100% 100%", maskRepeat: "no-repeat",
                      overflow: "hidden",
                    }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/badtooth.png"
                        alt=""
                        draggable={false}
                        style={{
                          width: "100%", height: "100%", objectFit: "cover", display: "block",
                          transform: p.rot ? `rotate(${p.rot}deg)` : undefined,
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-4 pb-6 pt-3">
          <div className="max-w-sm mx-auto">
            <p className="text-center text-white/40 text-xs mb-2">
              {t("alligator.description")}
            </p>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-300"
                style={{ width: `${(pushedCount / (TOTAL_TEETH - 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
