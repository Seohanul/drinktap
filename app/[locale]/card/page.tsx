"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import PenaltyScreen from "../components/PenaltyScreen";

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 8;

type Phase = "setup" | "preview" | "shuffle" | "playing";
type CardFace = "skull" | "diamond";
type Transform = { tx: number; ty: number; rot: number; instant: boolean };

function CardSetup({ onStart, onBack }: { onStart: (n: number) => void; onBack: () => void }) {
  const [value, setValue] = useState("");
  const parsed = parseInt(value, 10);
  const valid = !isNaN(parsed) && parsed >= MIN_PLAYERS && parsed <= MAX_PLAYERS;

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <div className="flex items-center px-4 py-4">
        <button onClick={onBack} className="text-white/60 hover:text-white text-sm px-3 py-2 rounded-lg hover:bg-white/10 transition-colors">
          ‹ 뒤로
        </button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-8 px-6">
        <div className="text-center">
          <div className="text-6xl mb-4">💎</div>
          <h1 className="text-2xl font-black text-white mb-2">저주받은 다이아</h1>
          <p className="text-white/50 text-sm">몇 명이서 할까요?</p>
        </div>
        <div className="w-full max-w-xs flex flex-col items-center gap-4">
          <input
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            min={MIN_PLAYERS}
            max={MAX_PLAYERS}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && valid && onStart(parsed)}
            placeholder="숫자 입력"
            className="w-full text-center text-4xl font-black bg-white/10 text-white rounded-2xl py-5 px-4 border-2 border-white/20 focus:border-white/60 outline-none placeholder:text-white/20"
          />
          {value !== "" && !valid && (
            <p className="text-red-400 text-sm">{MIN_PLAYERS} ~ {MAX_PLAYERS} 사이로 입력해주세요</p>
          )}
          <button
            onClick={() => valid && onStart(parsed)}
            disabled={!valid}
            className="w-full py-4 rounded-2xl font-black text-xl transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed bg-indigo-500 text-white"
          >
            게임 시작
          </button>
        </div>
      </div>
    </div>
  );
}

function buildDeck(n: number): CardFace[] {
  return ["skull", ...Array(n - 1).fill("diamond")] as CardFace[];
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export default function CardPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const [phase, setPhase] = useState<Phase>("setup");
  const [playerCount, setPlayerCount] = useState(0);
  const [cardOrder, setCardOrder] = useState<CardFace[]>([]);
  const [flipped, setFlipped] = useState<boolean[]>([]);
  const [transforms, setTransforms] = useState<Transform[]>([]);
  const [gameOver, setGameOver] = useState(false);

  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardOrderRef = useRef<CardFace[]>([]);
  const transformsRef = useRef<Transform[]>([]);

  // keep refs in sync
  useEffect(() => { cardOrderRef.current = cardOrder; }, [cardOrder]);
  useEffect(() => { transformsRef.current = transforms; }, [transforms]);

  const startGame = useCallback((n: number) => {
    setPlayerCount(n);
    cardRefs.current = new Array(n).fill(null);
    const deck = buildDeck(n);
    const zero: Transform[] = Array(n).fill({ tx: 0, ty: 0, rot: 0, instant: false });
    setCardOrder(deck);
    setFlipped(Array(n).fill(false));
    setTransforms(zero);
    setGameOver(false);
    setPhase("preview");
  }, []);

  useEffect(() => {
    if (phase !== "preview") return;
    const t = setTimeout(() => setPhase("shuffle"), 2500);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "shuffle") return;
    let cancelled = false;
    const n = cardOrderRef.current.length;

    const getPos = (i: number) => {
      const r = cardRefs.current[i]?.getBoundingClientRect();
      return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : { x: 0, y: 0 };
    };

    const setT = (updates: { i: number; t: Transform }[]) => {
      setTransforms((prev) => {
        const next = [...prev];
        updates.forEach(({ i, t }) => { next[i] = t; });
        return next;
      });
    };

    const swapOrder = (i: number, j: number) => {
      setCardOrder((prev) => {
        const next = [...prev];
        [next[i], next[j]] = [next[j], next[i]];
        return next;
      });
    };

    // Pick k unique random indices from 0..n-1
    const pickIndices = (k: number) => {
      const pool = Array.from({ length: n }, (_, i) => i);
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      return pool.slice(0, k);
    };

    const runShuffle = async () => {
      const ROUNDS = 5;

      for (let r = 0; r < ROUNDS; r++) {
        if (cancelled) return;

        // Pick min(5, n) cards for this round
        const count = Math.min(5, n);
        const chosen = pickIndices(count);

        // Get current positions of chosen cards
        const positions = chosen.map((idx) => getPos(idx));

        // Create circular permutation: card[0]→pos[1], card[1]→pos[2], ..., card[k-1]→pos[0]
        const updates: { i: number; t: Transform }[] = chosen.map((cardIdx, k) => {
          const targetPos = positions[(k + 1) % count];
          const myPos = positions[k];
          return {
            i: cardIdx,
            t: {
              tx: targetPos.x - myPos.x,
              ty: targetPos.y - myPos.y,
              rot: (Math.random() - 0.5) * 28,
              instant: false,
            },
          };
        });

        setT(updates);
        await sleep(400);
        if (cancelled) return;

        // Rotate cardOrder to match the circular permutation
        setCardOrder((prev) => {
          const next = [...prev];
          const last = next[chosen[count - 1]];
          for (let k = count - 1; k > 0; k--) {
            next[chosen[k]] = next[chosen[k - 1]];
          }
          next[chosen[0]] = last;
          return next;
        });

        // Instant reset
        const resetInstant = chosen.map((i) => ({ i, t: { tx: 0, ty: 0, rot: 0, instant: true } }));
        setT(resetInstant);
        await sleep(30);
        if (cancelled) return;

        // Re-enable transitions
        const resetAnim = chosen.map((i) => ({ i, t: { tx: 0, ty: 0, rot: 0, instant: false } }));
        setT(resetAnim);
        await sleep(120);
      }

      if (!cancelled) setPhase("playing");
    };

    const t = setTimeout(runShuffle, 150);
    return () => { cancelled = true; clearTimeout(t); };
  }, [phase]);

  const handleCardPress = useCallback(
    (i: number) => {
      if (phase !== "playing" || flipped[i]) return;
      if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(40);
      const newFlipped = [...flipped];
      newFlipped[i] = true;
      setFlipped(newFlipped);
      if (cardOrder[i] === "skull") {
        setTimeout(() => setGameOver(true), 900);
      }
    },
    [phase, flipped, cardOrder]
  );

  const restart = () => startGame(playerCount);

  const cols = playerCount <= 3 ? playerCount : playerCount <= 6 ? 3 : 4;

  if (phase === "setup") {
    return <CardSetup onStart={startGame} onBack={() => router.push(`/${locale}/lobby`)} />;
  }

  return (
    <>
      {gameOver && (
        <PenaltyScreen
          onPlayAgain={restart}
          onBackToLobby={() => router.push(`/${locale}/lobby`)}
        />
      )}

      <div className="min-h-screen flex flex-col bg-gray-950">
        <div className="flex items-center justify-between px-4 py-4">
          <button
            onClick={() => setPhase("setup")}
            className="text-white/60 hover:text-white text-sm px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            ‹ 뒤로
          </button>
          <h1 className="text-xl font-black text-white">
            {phase === "preview" && "잘 기억해!"}
            {phase === "shuffle" && "섞는 중..."}
            {phase === "playing" && "뽑아봐!"}
          </h1>
          <div className="w-16" />
        </div>

        <div className="flex-1 flex items-center justify-center px-6">
          <div
            className="grid gap-4 w-full max-w-sm"
            style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
          >
            {cardOrder.map((face, i) => {
              const t = transforms[i] ?? { tx: 0, ty: 0, rot: 0, instant: false };
              const showFront = phase === "preview" || (phase === "playing" && flipped[i]);

              return (
                <div
                  key={i}
                  ref={(el) => { cardRefs.current[i] = el; }}
                  onClick={() => handleCardPress(i)}
                  style={{
                    transform: `translate(${t.tx}px, ${t.ty}px) rotate(${t.rot}deg)`,
                    transition: t.instant ? "none" : "transform 0.38s cubic-bezier(0.25,0.46,0.45,0.94)",
                    zIndex: (t.tx !== 0 || t.ty !== 0) ? 10 : 1,
                    aspectRatio: "2/3",
                    position: "relative",
                    cursor: phase === "playing" && !flipped[i] ? "pointer" : "default",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      position: "relative",
                      transformStyle: "preserve-3d",
                      transition: "transform 0.5s ease",
                      transform: showFront ? "rotateY(180deg)" : "rotateY(0deg)",
                    }}
                  >
                    {/* back */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: "12px",
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                        backgroundImage: "url('/card-back.jpg')",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                    {/* front */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        transform: "rotateY(180deg)",
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                        borderRadius: "12px",
                        overflow: "hidden",
                        backgroundColor: face === "skull" ? "#1a0005" : "#ffffff",
                        backgroundImage: `url('${face === "skull" ? "/card-skull.jpg" : "/card-diamond.jpg"}')`,
                        backgroundSize: face === "skull" ? "75%" : "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-4 pb-6 pt-2 text-center text-white/30 text-xs">
          {phase === "preview" && "해골 다이아 위치를 기억하세요!"}
          {phase === "playing" && "해골 다이아를 피하세요!"}
        </div>
      </div>
    </>
  );
}
