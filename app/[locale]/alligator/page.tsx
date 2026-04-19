"use client";

import { useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import PenaltyScreen from "../components/PenaltyScreen";

const TOTAL_TEETH = 12;

function pickPenaltyIndex() {
  return Math.floor(Math.random() * TOTAL_TEETH);
}

// 입 안쪽 영역(%) 안에서 겹치지 않게 랜덤 배치
function generatePositions() {
  // 4열 3행 격자를 만들고 각 셀 안에서 랜덤 오프셋
  const cols = 4;
  const rows = 3;
  // 입 안쪽 영역: x 12~88%, y 38~78%
  const xMin = 12, xMax = 88;
  const yMin = 38, yMax = 78;
  const cellW = (xMax - xMin) / cols;
  const cellH = (yMax - yMin) / rows;
  const pad = 3;

  const positions: { x: number; y: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      positions.push({
        x: xMin + cellW * c + pad + Math.random() * (cellW - pad * 2),
        y: yMin + cellH * r + pad + Math.random() * (cellH - pad * 2),
      });
    }
  }

  // 피셔-예이츠 셔플
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }
  return positions;
}

type ToothState = "idle" | "safe" | "penalty";

// 악어 입 SVG 컴포넌트
function AlligatorMouth({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full" style={{ aspectRatio: "5/3" }}>
      <svg
        viewBox="0 0 500 300"
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 입 안쪽 (어두운 배경) */}
        <ellipse cx="250" cy="165" rx="225" ry="115" fill="#1a0505" />

        {/* 혀 */}
        <ellipse cx="250" cy="200" rx="75" ry="28" fill="#c0395a" />
        <line x1="250" y1="175" x2="250" y2="228" stroke="#a02848" strokeWidth="2" />

        {/* 위턱 */}
        <path
          d="M 25 165 Q 250 20 475 165 L 475 0 L 25 0 Z"
          fill="#2e7d32"
        />
        {/* 위턱 테두리 */}
        <path
          d="M 25 165 Q 250 20 475 165"
          fill="none"
          stroke="#43a047"
          strokeWidth="4"
        />

        {/* 위 이빨 (장식) */}
        {[60, 110, 160, 210, 250, 290, 340, 390, 440].map((x, i) => {
          const pct = (x - 25) / 450;
          const yBase = 20 + 145 * Math.sin(Math.PI * pct);
          return (
            <polygon
              key={i}
              points={`${x - 11},${yBase} ${x + 11},${yBase} ${x},${yBase + 32}`}
              fill="#f5f0e8"
              stroke="#e0d8cc"
              strokeWidth="1"
            />
          );
        })}

        {/* 아래턱 */}
        <path
          d="M 25 165 Q 250 310 475 165 L 475 300 L 25 300 Z"
          fill="#2e7d32"
        />
        {/* 아래턱 테두리 */}
        <path
          d="M 25 165 Q 250 310 475 165"
          fill="none"
          stroke="#43a047"
          strokeWidth="4"
        />

        {/* 아래 이빨 (장식) */}
        {[80, 130, 180, 230, 270, 320, 370, 420].map((x, i) => {
          const pct = (x - 25) / 450;
          const yBase = 165 + 130 * Math.sin(Math.PI * pct);
          return (
            <polygon
              key={i}
              points={`${x - 10},${yBase} ${x + 10},${yBase} ${x},${yBase - 28}`}
              fill="#f5f0e8"
              stroke="#e0d8cc"
              strokeWidth="1"
            />
          );
        })}

        {/* 눈 (왼쪽) */}
        <ellipse cx="95" cy="52" rx="28" ry="22" fill="#388e3c" />
        <ellipse cx="95" cy="52" rx="16" ry="18" fill="#111" />
        <ellipse cx="89" cy="46" rx="5" ry="5" fill="white" />

        {/* 눈 (오른쪽) */}
        <ellipse cx="405" cy="52" rx="28" ry="22" fill="#388e3c" />
        <ellipse cx="405" cy="52" rx="16" ry="18" fill="#111" />
        <ellipse cx="399" cy="46" rx="5" ry="5" fill="white" />

        {/* 콧구멍 */}
        <ellipse cx="220" cy="28" rx="8" ry="5" fill="#1b5e20" />
        <ellipse cx="280" cy="28" rx="8" ry="5" fill="#1b5e20" />
      </svg>

      {/* 인터랙티브 이빨 버튼들 */}
      {children}
    </div>
  );
}

export default function AlligatorPage() {
  const t = useTranslations("Lobby");
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const [penaltyIndex, setPenaltyIndex] = useState(pickPenaltyIndex);
  const [teeth, setTeeth] = useState<ToothState[]>(Array(TOTAL_TEETH).fill("idle"));
  const [positions, setPositions] = useState(generatePositions);
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
        setTimeout(() => setGameOver(true), 450);
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
    setPenaltyIndex(pickPenaltyIndex());
    setPositions(generatePositions());
    setTeeth(Array(TOTAL_TEETH).fill("idle"));
    setGameOver(false);
  };

  const safeCount = teeth.filter((s) => s === "safe").length;

  return (
    <>
      {gameOver && (
        <PenaltyScreen
          onPlayAgain={restart}
          onBackToLobby={() => router.push(`/${locale}/lobby`)}
        />
      )}

      <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-950 via-emerald-900 to-teal-900 px-4 py-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => router.push(`/${locale}/lobby`)}
            className="text-white/60 hover:text-white text-sm px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            ‹ 뒤로
          </button>
          <h1 className="text-xl font-black text-white">{t("alligator.name")}</h1>
          <span className="text-white/50 text-sm w-16 text-right">
            {safeCount}/{TOTAL_TEETH - 1}
          </span>
        </div>

        <p className="text-center text-green-300/70 text-sm mb-4 px-4">
          {t("alligator.description")}
        </p>

        {/* 악어 입 + 이빨 버튼 */}
        <div className="flex-1 flex items-center justify-center px-2">
          <div className="w-full max-w-md">
            <AlligatorMouth>
              {teeth.map((state, i) => (
                <button
                  key={i}
                  onPointerDown={() => handlePress(i)}
                  disabled={state !== "idle" || gameOver}
                  style={{
                    position: "absolute",
                    left: `${positions[i].x}%`,
                    top: `${positions[i].y}%`,
                    transform: "translate(-50%, -50%)",
                    width: "13%",
                    aspectRatio: "1",
                  }}
                  className={[
                    "rounded-full flex items-center justify-center font-black transition-all duration-150 select-none touch-none shadow-lg text-lg",
                    state === "idle"
                      ? "bg-white hover:bg-yellow-50 active:scale-75"
                      : state === "safe"
                      ? "bg-green-400/50 scale-75 opacity-50 pointer-events-none"
                      : "bg-red-500 scale-125 pointer-events-none",
                  ].join(" ")}
                >
                  {state === "idle" ? "🦷" : state === "safe" ? "✓" : "💥"}
                </button>
              ))}
            </AlligatorMouth>
          </div>
        </div>

        {/* 진행 바 */}
        <div className="mt-4 max-w-md mx-auto w-full px-2">
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-green-400 rounded-full transition-all duration-300"
              style={{ width: `${(safeCount / (TOTAL_TEETH - 1)) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
