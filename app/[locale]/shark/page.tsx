"use client";

import { useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import PenaltyScreen from "../components/PenaltyScreen";

const TOTAL_TEETH = 20;

const POSITIONS: { x: number; y: number; w: number; h: number; gum: string; mask: string; rot: number }[] = [
  // top row (left → right)
  { x: 10.7, y: 12.8, w: 14.3, h:  9.4, gum: "#682d2c", mask: "/mask-top.png",        rot:   0 },
  { x: 31.6, y: 11.1, w: 14.5, h:  9.4, gum: "#5f2424", mask: "/mask-top.png",        rot:   0 },
  { x: 54.2, y: 11.2, w: 14.3, h:  9.3, gum: "#5e2424", mask: "/mask-top.png",        rot:   0 },
  { x: 75.3, y: 12.8, w: 14.1, h:  9.4, gum: "#682d2c", mask: "/mask-top.png",        rot:   0 },
  // left upper side (top → bottom)
  { x:  2.6, y: 21.3, w: 13.5, h:  9.3, gum: "#562424", mask: "/mask-left.png",       rot:   0 },
  { x:  3.5, y: 31.7, w: 14.3, h:  9.0, gum: "#4c1c1c", mask: "/mask-left.png",       rot:   0 },
  { x:  5.1, y: 42.2, w: 13.9, h:  9.0, gum: "#421718", mask: "/mask-left.png",       rot:   0 },
  // right upper side (top → bottom)
  { x: 84.2, y: 21.3, w: 13.2, h:  9.3, gum: "#582524", mask: "/mask-right.png",      rot:   0 },
  { x: 82.4, y: 31.8, w: 14.3, h:  8.9, gum: "#4d1d1d", mask: "/mask-right.png",      rot:   0 },
  { x: 81.3, y: 42.2, w: 13.7, h:  9.1, gum: "#421818", mask: "/mask-right.png",      rot:   0 },
  // left lower side (top → bottom)
  { x:  5.8, y: 58.1, w: 13.5, h:  8.2, gum: "#582626", mask: "/mask-left-flip.png",  rot: 180 },
  { x:  4.0, y: 68.7, w: 14.0, h:  8.0, gum: "#7c3734", mask: "/mask-left-flip.png",  rot: 180 },
  { x:  3.2, y: 78.4, w: 14.1, h:  7.6, gum: "#813f3c", mask: "/mask-left-flip.png",  rot: 180 },
  // right lower side (top → bottom)
  { x: 80.8, y: 58.1, w: 13.5, h:  8.1, gum: "#582727", mask: "/mask-right-flip.png", rot: 180 },
  { x: 82.2, y: 68.7, w: 14.0, h:  8.0, gum: "#7b3633", mask: "/mask-right-flip.png", rot: 180 },
  { x: 82.9, y: 78.5, w: 14.1, h:  7.7, gum: "#7f3c39", mask: "/mask-right-flip.png", rot: 180 },
  // bottom row (left → right)
  { x: 10.5, y: 84.5, w: 16.0, h:  9.5, gum: "#79403e", mask: "/mask-bottom.png",     rot: 180 },
  { x: 30.5, y: 86.5, w: 16.0, h:  9.5, gum: "#833f3c", mask: "/mask-bottom.png",     rot: 180 },
  { x: 53.5, y: 86.5, w: 16.0, h:  9.5, gum: "#83403c", mask: "/mask-bottom.png",     rot: 180 },
  { x: 73.5, y: 84.5, w: 16.0, h:  9.5, gum: "#773e3c", mask: "/mask-bottom.png",     rot: 180 },
];

function pickPenaltyIndices(count: number): number[] {
  const indices = Array.from({ length: TOTAL_TEETH }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices.slice(0, count);
}

type ToothState = "idle" | "pushed" | "penalty";

function SetupScreen({ onStart }: { onStart: (count: number) => void }) {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [value, setValue] = useState("");

  const parsed = parseInt(value, 10);
  const valid = !isNaN(parsed) && parsed >= 1 && parsed <= 5;

  const handleSubmit = () => {
    if (valid) onStart(parsed);
  };

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <div className="flex items-center px-4 py-4">
        <button
          onClick={() => router.push(`/${locale}/lobby`)}
          className="text-white/60 hover:text-white text-sm px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          ‹ 뒤로
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-8 px-6">
        <div className="text-center">
          <div className="text-6xl mb-4">🦈</div>
          <h1 className="text-2xl font-black text-white mb-2">상어 이빨</h1>
          <p className="text-white/50 text-sm">벌칙 몇 개로 할까요?</p>
        </div>

        <div className="w-full max-w-xs flex flex-col items-center gap-4">
          <input
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            min={1}
            max={5}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="숫자 입력"
            className="w-full text-center text-4xl font-black bg-white/10 text-white rounded-2xl py-5 px-4 border-2 border-white/20 focus:border-white/60 outline-none placeholder:text-white/20"
          />
          {value !== "" && !valid && (
            <p className="text-red-400 text-sm">1 ~ 5 사이로 입력해주세요</p>
          )}
          <button
            onClick={handleSubmit}
            disabled={!valid}
            className="w-full py-4 rounded-2xl font-black text-xl transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed bg-blue-500 text-white"
          >
            게임 시작
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SharkPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const [penaltyCount, setPenaltyCount] = useState<number | null>(null);
  const [penaltyIndices, setPenaltyIndices] = useState<number[]>([]);
  const [teeth, setTeeth] = useState<ToothState[]>(Array(TOTAL_TEETH).fill("idle"));
  const [gameOver, setGameOver] = useState(false);
  const [locked, setLocked] = useState(false);
  const [flash, setFlash] = useState(false);

  const startGame = useCallback((count: number) => {
    setPenaltyCount(count);
    setPenaltyIndices(pickPenaltyIndices(count));
    setTeeth(Array(TOTAL_TEETH).fill("idle"));
    setGameOver(false);
    setLocked(false);
    setFlash(false);
  }, []);

  const handlePress = useCallback(
    (i: number) => {
      if (teeth[i] !== "idle" || gameOver || locked) return;
      if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(40);
      if (penaltyIndices.includes(i)) {
        setLocked(true);
        setFlash(true);
        setTeeth((prev) => { const n = [...prev]; n[i] = "penalty"; return n; });
        setTimeout(() => setGameOver(true), 1000);
      } else {
        setTeeth((prev) => { const n = [...prev]; n[i] = "pushed"; return n; });
      }
    },
    [teeth, penaltyIndices, gameOver, locked]
  );

  const restart = () => {
    if (penaltyCount !== null) {
      setPenaltyIndices(pickPenaltyIndices(penaltyCount));
    }
    setTeeth(Array(TOTAL_TEETH).fill("idle"));
    setGameOver(false);
    setLocked(false);
    setFlash(false);
  };

  const backToSetup = () => {
    setPenaltyCount(null);
    setPenaltyIndices([]);
    setTeeth(Array(TOTAL_TEETH).fill("idle"));
    setGameOver(false);
    setLocked(false);
    setFlash(false);
  };

  if (penaltyCount === null) {
    return <SetupScreen onStart={startGame} />;
  }

  const pushedCount = teeth.filter((s) => s === "pushed").length;

  return (
    <>
      {gameOver && (
        <PenaltyScreen
          onPlayAgain={restart}
          onBackToLobby={() => router.push(`/${locale}/lobby`)}
        />
      )}

      <div
        className="min-h-screen flex flex-col transition-colors duration-200"
        style={{ backgroundColor: flash ? "#dc2626" : "#000000" }}
      >
        <div className="flex items-center justify-between px-4 py-4 z-10">
          <button
            onClick={backToSetup}
            className="text-white/60 hover:text-white text-sm px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            ‹ 뒤로
          </button>
          <h1 className="text-xl font-black text-white">🦈 상어 이빨</h1>
          <span className="text-white/50 text-sm w-16 text-right">
            {pushedCount}/{TOTAL_TEETH - penaltyCount}
          </span>
        </div>

        <div className="flex-1 flex items-center justify-center px-2 overflow-hidden">
          <div
            className="relative max-w-full"
            style={{
              aspectRatio: "1536/2712",
              height: "calc(100dvh - 160px)",
              maxWidth: "100%",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/shark.png"
              alt="shark"
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
                        inset: "-10%",
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
                    <div style={{
                      position: "absolute", inset: "-10%",
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
              충치 이빨을 누르면 벌칙!
            </p>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-blue-400 rounded-full transition-all duration-300"
                style={{ width: `${(pushedCount / (TOTAL_TEETH - penaltyCount)) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
