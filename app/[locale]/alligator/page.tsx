"use client";

import { useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import PenaltyScreen from "../components/PenaltyScreen";

const TOTAL_TEETH = 12;

// 이미지 위 이빨 위치 (%) — 위턱 6개, 아래턱 6개
// 이미지 비율 3:4 기준으로 조정
const BASE_POSITIONS: { x: number; y: number; w: number; h: number }[] = [
  // 위턱 (왼→오른, 곡선을 따라)
  { x: 19, y: 18, w: 8,  h: 11 },
  { x: 28, y: 14, w: 9,  h: 12 },
  { x: 38, y: 11, w: 10, h: 13 },
  { x: 49, y: 10, w: 10, h: 13 },
  { x: 60, y: 11, w: 9,  h: 12 },
  { x: 70, y: 14, w: 8,  h: 11 },
  // 아래턱 (왼→오른, 곡선을 따라)
  { x: 25, y: 55, w: 9,  h: 12 },
  { x: 35, y: 60, w: 10, h: 13 },
  { x: 46, y: 63, w: 10, h: 13 },
  { x: 57, y: 63, w: 10, h: 13 },
  { x: 67, y: 60, w: 9,  h: 12 },
  { x: 77, y: 55, w: 8,  h: 11 },
];

// 매 게임 소폭 랜덤 오프셋 (±2%)
function generatePositions() {
  return BASE_POSITIONS.map((p) => ({
    ...p,
    x: p.x + (Math.random() - 0.5) * 3,
    y: p.y + (Math.random() - 0.5) * 2.5,
  }));
}

function pickPenaltyIndex() {
  return Math.floor(Math.random() * TOTAL_TEETH);
}

type ToothState = "idle" | "pulled" | "cavity";

// 이빨 하나 — 처음엔 하얀 이빨, 눌리면 상태 변화
function Tooth({
  state,
  isBottom,
  onPress,
}: {
  state: ToothState;
  isBottom: boolean;
  onPress: () => void;
}) {
  if (state === "pulled") {
    // 뽑힌 이빨: 잇몸만 남음
    return (
      <svg viewBox="0 0 50 50" className="w-full h-full opacity-50" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="25" cy={isBottom ? 12 : 38} rx="18" ry="8" fill="#7b1a2e" opacity="0.7" />
      </svg>
    );
  }

  if (state === "cavity") {
    // 충치 이빨: 검은 반점 + 갈색
    return (
      <svg viewBox="0 0 50 70" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {/* 잇몸 */}
        <ellipse cx="25" cy={isBottom ? 12 : 58} rx="20" ry="10" fill="#7b1a2e" />
        {/* 이빨 몸통 (갈색/충치) */}
        <path
          d={isBottom
            ? "M 8 18 Q 5 50 12 65 Q 25 72 38 65 Q 45 50 42 18 Q 35 10 25 10 Q 15 10 8 18 Z"
            : "M 8 52 Q 5 20 12 5 Q 25 -2 38 5 Q 45 20 42 52 Q 35 60 25 60 Q 15 60 8 52 Z"
          }
          fill="#5a3010"
          stroke="#3a1a05"
          strokeWidth="1"
        />
        {/* 충치 검은 반점들 */}
        <ellipse cx="20" cy={isBottom ? 38 : 32} rx="6" ry="5" fill="#1a0a00" opacity="0.9" />
        <ellipse cx="32" cy={isBottom ? 30 : 40} rx="5" ry="4" fill="#1a0a00" opacity="0.8" />
        <ellipse cx="24" cy={isBottom ? 50 : 20} rx="4" ry="3" fill="#1a0a00" opacity="0.7" />
        {/* 해골 */}
        <text
          x="25" y={isBottom ? 28 : 48}
          textAnchor="middle"
          fontSize="14"
          fill="white"
          opacity="0.8"
        >💀</text>
      </svg>
    );
  }

  // 기본: 하얀 정상 이빨
  return (
    <svg
      viewBox="0 0 50 70"
      className="w-full h-full cursor-pointer active:scale-90 transition-transform duration-100 select-none touch-none drop-shadow-md"
      onPointerDown={onPress}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 잇몸 */}
      <ellipse
        cx="25"
        cy={isBottom ? 12 : 58}
        rx="20"
        ry="10"
        fill="#c0394a"
      />
      {/* 이빨 몸통 */}
      <path
        d={isBottom
          ? "M 8 18 Q 5 50 12 65 Q 25 72 38 65 Q 45 50 42 18 Q 35 10 25 10 Q 15 10 8 18 Z"
          : "M 8 52 Q 5 20 12 5 Q 25 -2 38 5 Q 45 20 42 52 Q 35 60 25 60 Q 15 60 8 52 Z"
        }
        fill="#f8f4ee"
        stroke="#ddd5c8"
        strokeWidth="1"
      />
      {/* 이빨 측면 그림자 */}
      <path
        d={isBottom
          ? "M 42 18 Q 45 50 38 65 Q 35 67 33 65 Q 40 50 37 18 Z"
          : "M 42 52 Q 45 20 38 5 Q 35 3 33 5 Q 40 20 37 52 Z"
        }
        fill="#e0d8cc"
        opacity="0.6"
      />
      {/* 광택 */}
      <ellipse
        cx="20"
        cy={isBottom ? 30 : 40}
        rx="5"
        ry="8"
        fill="white"
        opacity="0.4"
        transform={isBottom ? "" : ""}
      />
    </svg>
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
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(40);
      }
      if (i === penaltyIndex) {
        setTeeth((prev) => {
          const next = [...prev];
          next[i] = "cavity";
          return next;
        });
        setTimeout(() => setGameOver(true), 800);
      } else {
        setTeeth((prev) => {
          const next = [...prev];
          next[i] = "pulled";
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

  const pulledCount = teeth.filter((s) => s === "pulled").length;

  return (
    <>
      {gameOver && (
        <PenaltyScreen
          onPlayAgain={restart}
          onBackToLobby={() => router.push(`/${locale}/lobby`)}
        />
      )}

      <div className="min-h-screen flex flex-col bg-black">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-4 py-4 z-10">
          <button
            onClick={() => router.push(`/${locale}/lobby`)}
            className="text-white/60 hover:text-white text-sm px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            ‹ 뒤로
          </button>
          <h1 className="text-xl font-black text-white">{t("alligator.name")}</h1>
          <span className="text-white/50 text-sm w-16 text-right">
            {pulledCount}/{TOTAL_TEETH - 1}
          </span>
        </div>

        {/* 악어 입 배경 + 이빨 버튼 */}
        <div className="flex-1 flex items-center justify-center px-2">
          <div
            className="relative w-full max-w-sm"
            style={{ aspectRatio: "3/4" }}
          >
            {/* 배경 이미지 */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/alligator-bg.png"
              alt="alligator mouth"
              className="absolute inset-0 w-full h-full object-cover rounded-2xl"
              draggable={false}
            />

            {/* 이빨 버튼 오버레이 */}
            {teeth.map((state, i) => {
              const p = positions[i];
              const isBottom = i >= 6;
              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: `${p.x}%`,
                    top: `${p.y}%`,
                    width: `${p.w}%`,
                    height: `${p.h}%`,
                  }}
                  className={state === "cavity" ? "animate-pulse" : ""}
                >
                  <Tooth
                    state={state}
                    isBottom={isBottom}
                    onPress={() => handlePress(i)}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* 하단 진행 표시 */}
        <div className="px-4 pb-6 pt-3">
          <div className="max-w-sm mx-auto">
            <p className="text-center text-white/40 text-xs mb-2">
              {t("alligator.description")}
            </p>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-300"
                style={{ width: `${(pulledCount / (TOTAL_TEETH - 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
