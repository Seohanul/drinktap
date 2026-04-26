"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import Script from "next/script";

interface PenaltyScreenProps {
  onPlayAgain: () => void;
  onBackToLobby: () => void;
}

export default function PenaltyScreen({
  onPlayAgain,
  onBackToLobby,
}: PenaltyScreenProps) {
  const t = useTranslations("Penalty");
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Vibrate the device on penalty (if supported)
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([300, 100, 300, 100, 500]);
    }
  }, []);

  return (
    <div className="penalty-screen fixed inset-0 z-50 flex flex-col items-center justify-between bg-red-600 px-6 py-10">
      <style>{`
        @keyframes flashRed {
          0%, 100% { background-color: #dc2626; }
          50%       { background-color: #7f1d1d; }
        }
        .penalty-screen {
          animation: flashRed 0.5s ease-in-out 6;
        }
      `}</style>

      {/* Top: penalty text */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div className="text-8xl animate-bounce">💀</div>
        <h1 className="text-6xl font-black text-white text-center drop-shadow-lg tracking-tight">
          {t("title")}
        </h1>
        <p className="text-2xl text-red-200 font-bold text-center">
          {t("subtitle")}
        </p>
      </div>

      {/* Middle: ad slot */}
      <div className="w-full max-w-sm flex items-center justify-center" ref={adRef}>
        <ins
          className="kakao_ad_area"
          style={{ display: "none" }}
          data-ad-unit="DAN-vI5KTjMGteTbKwkc"
          data-ad-width="300"
          data-ad-height="250"
        />
        <Script src="//t1.kakaocdn.net/kas/static/ba.min.js" strategy="lazyOnload" />
      </div>

      {/* Bottom: buttons */}
      <div className="w-full max-w-sm flex flex-col gap-3 pt-4">
        <button
          onClick={onPlayAgain}
          className="w-full py-4 rounded-2xl bg-white text-red-600 font-black text-xl active:scale-95 transition-transform shadow-lg"
        >
          🔄 {t("playAgain")}
        </button>
        <button
          onClick={onBackToLobby}
          className="w-full py-4 rounded-2xl bg-red-800/60 text-white font-bold text-lg active:scale-95 transition-transform"
        >
          🏠 {t("backToLobby")}
        </button>
      </div>
    </div>
  );
}
