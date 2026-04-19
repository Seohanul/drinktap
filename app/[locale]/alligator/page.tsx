"use client";

import { useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import PenaltyScreen from "../components/PenaltyScreen";

const TOTAL_TEETH = 12;

function pickPenaltyIndex() {
  return Math.floor(Math.random() * TOTAL_TEETH);
}

// 위턱 6개 + 아래턱 6개, 게임마다 x 간격 랜덤
function generatePositions() {
  const topRowY = 40 + Math.random() * 6;   // 위턱 줄 y
  const botRowY = 63 + Math.random() * 6;   // 아래턱 줄 y
  const startX = 12 + Math.random() * 4;    // 시작 x
  const gap = 12 + Math.random() * 3;       // 이빨 간격

  const raw = Array.from({ length: TOTAL_TEETH }, (_, i) => ({
    x: startX + (i % 6) * gap + Math.random() * 2.5,
    y: i < 6 ? topRowY : botRowY,
  }));

  // 인덱스 셔플 (어떤 이빨이 penalty인지 위치로 티 안 나게)
  const order = Array.from({ length: TOTAL_TEETH }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order.map((idx) => raw[idx]);
}

type ToothState = "idle" | "pressed" | "penalty";

// 이빨 하나 SVG
function Tooth({
  state,
  onPress,
}: {
  state: ToothState;
  onPress: () => void;
}) {
  const isIdle = state === "idle";
  const isSafe = state === "pressed";
  const isPenalty = state === "penalty";

  return (
    <svg
      viewBox="0 0 40 52"
      className={[
        "w-full h-full select-none touch-none transition-transform duration-100",
        isIdle ? "active:scale-90 cursor-pointer" : "",
        isSafe ? "opacity-40" : "",
        isPenalty ? "scale-125" : "",
      ].join(" ")}
      onPointerDown={isIdle ? onPress : undefined}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 잇몸 */}
      <ellipse
        cx="20"
        cy={isSafe ? 42 : 38}
        rx="16"
        ry="10"
        fill={isPenalty ? "#ff3333" : "#c0394a"}
        className="transition-all duration-150"
      />
      {/* 이빨 몸통 */}
      <rect
        x="7"
        y={isSafe ? 14 : 4}
        width="26"
        height={isSafe ? 28 : 34}
        rx="8"
        fill={isPenalty ? "#ffdddd" : "white"}
        stroke={isPenalty ? "#ff6666" : "#e8e0d8"}
        strokeWidth="1.5"
        className="transition-all duration-150"
      />
      {/* 이빨 윗면 (3D 광택) */}
      <ellipse
        cx="20"
        cy={isSafe ? 14 : 4}
        rx="13"
        ry="7"
        fill={isPenalty ? "#ffbbbb" : "#f8f5f0"}
        stroke={isPenalty ? "#ff6666" : "#e8e0d8"}
        strokeWidth="1.5"
        className="transition-all duration-150"
      />
      {/* 광택 하이라이트 */}
      {isIdle && (
        <ellipse cx="15" cy={3} rx="5" ry="3" fill="white" opacity="0.6" />
      )}
      {/* 벌칙 이빨 - X 표시 */}
      {isPenalty && (
        <>
          <line x1="14" y1="16" x2="26" y2="28" stroke="#ff4444" strokeWidth="3" strokeLinecap="round" />
          <line x1="26" y1="16" x2="14" y2="28" stroke="#ff4444" strokeWidth="3" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

// 악어 입 SVG (배경)
function AlligatorMouth({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full" style={{ aspectRatio: "16/10" }}>
      <svg
        viewBox="0 0 480 300"
        className="absolute inset-0 w-full h-full drop-shadow-2xl"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 그림자 */}
        <ellipse cx="240" cy="270" rx="200" ry="18" fill="black" opacity="0.25" />

        {/* ── 위턱 ── */}
        <path d="M 30 160 Q 240 5 450 160 L 460 0 L 20 0 Z" fill="#33691e" />
        {/* 위턱 하이라이트 */}
        <path d="M 30 160 Q 240 5 450 160" fill="none" stroke="#558b2f" strokeWidth="5" />
        {/* 위 비늘 (장식) */}
        {[70, 130, 190, 240, 290, 350, 410].map((x, i) => (
          <ellipse key={i} cx={x} cy={Math.max(10, 160 - Math.sqrt(Math.max(0, 220 * 220 - (x - 240) * (x - 240))) * 155 / 220) + 12}
            rx="18" ry="10" fill="#2e7d32" opacity="0.5" />
        ))}

        {/* ── 아래턱 ── */}
        <path d="M 30 160 Q 240 295 450 160 L 460 300 L 20 300 Z" fill="#388e3c" />
        {/* 아래턱 하이라이트 */}
        <path d="M 30 160 Q 240 295 450 160" fill="none" stroke="#66bb6a" strokeWidth="5" />

        {/* ── 입 안쪽 ── */}
        <ellipse cx="240" cy="160" rx="208" ry="115" fill="#1a0208" />

        {/* 혀 */}
        <ellipse cx="240" cy="198" rx="72" ry="26" fill="#ad1457" />
        <ellipse cx="240" cy="200" rx="72" ry="10" fill="#880e4f" opacity="0.5" />
        <line x1="240" y1="172" x2="240" y2="224" stroke="#880e4f" strokeWidth="2.5" strokeLinecap="round" />

        {/* ── 눈 왼쪽 ── */}
        <ellipse cx="90" cy="55" rx="32" ry="26" fill="#2e7d32" />
        <ellipse cx="90" cy="55" rx="20" ry="22" fill="#0a0a0a" />
        <ellipse cx="83" cy="48" rx="7" ry="7" fill="white" />
        <ellipse cx="84" cy="49" rx="3" ry="3" fill="#222" />

        {/* ── 눈 오른쪽 ── */}
        <ellipse cx="390" cy="55" rx="32" ry="26" fill="#2e7d32" />
        <ellipse cx="390" cy="55" rx="20" ry="22" fill="#0a0a0a" />
        <ellipse cx="383" cy="48" rx="7" ry="7" fill="white" />
        <ellipse cx="384" cy="49" rx="3" ry="3" fill="#222" />

        {/* 콧구멍 */}
        <ellipse cx="212" cy="22" rx="10" ry="6" fill="#1b5e20" />
        <ellipse cx="268" cy="22" rx="10" ry="6" fill="#1b5e20" />

        {/* 잇몸 라인 (위) */}
        <path d="M 55 155 Q 240 48 425 155" fill="none" stroke="#880e4f" strokeWidth="12" strokeLinecap="round" opacity="0.6" />
        {/* 잇몸 라인 (아래) */}
        <path d="M 55 165 Q 240 272 425 165" fill="none" stroke="#880e4f" strokeWidth="12" strokeLinecap="round" opacity="0.6" />
      </svg>

      {/* 이빨 버튼들 */}
      {children}
    </div>
  );
}

export default function AlligatorPage() {
  const t = useTranslations("Lobby");
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const [gameKey, setGameKey] = useState(0); // 리셋 강제 트리거
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
        setTimeout(() => setGameOver(true), 500);
      } else {
        setTeeth((prev) => {
          const next = [...prev];
          next[i] = "pressed";
          return next;
        });
      }
    },
    [teeth, penaltyIndex, gameOver]
  );

  const restart = () => {
    const newPositions = generatePositions();
    const newPenalty = pickPenaltyIndex();
    setPenaltyIndex(newPenalty);
    setPositions(newPositions);
    setTeeth(Array(TOTAL_TEETH).fill("idle"));
    setGameOver(false);
    setGameKey((k) => k + 1);
  };

  const safeCount = teeth.filter((s) => s === "pressed").length;

  return (
    <>
      {gameOver && (
        <PenaltyScreen
          onPlayAgain={restart}
          onBackToLobby={() => router.push(`/${locale}/lobby`)}
        />
      )}

      <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-950 to-emerald-950 px-3 py-5">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-2">
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

        <p className="text-center text-green-300/60 text-xs mb-3">
          {t("alligator.description")}
        </p>

        {/* 악어 입 */}
        <div className="flex-1 flex items-center justify-center px-1">
          <div className="w-full max-w-lg" key={gameKey}>
            <AlligatorMouth>
              {teeth.map((state, i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: `${positions[i].x}%`,
                    top: `${positions[i].y}%`,
                    width: "10%",
                    aspectRatio: "0.8",
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <Tooth state={state} onPress={() => handlePress(i)} />
                </div>
              ))}
            </AlligatorMouth>
          </div>
        </div>

        {/* 진행 바 */}
        <div className="mt-3 max-w-lg mx-auto w-full px-2">
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-green-400 rounded-full transition-all duration-300"
              style={{ width: `${(safeCount / (TOTAL_TEETH - 1)) * 100}%` }}
            />
          </div>
          <p className="text-center text-green-700 text-xs mt-1">
            {safeCount} / {TOTAL_TEETH - 1}
          </p>
        </div>
      </div>
    </>
  );
}
