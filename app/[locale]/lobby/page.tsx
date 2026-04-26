"use client";

import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";

const GAMES = [
  {
    key: "shark",
    emoji: "🦈",
    color: "from-blue-500 to-cyan-700",
    border: "border-blue-400/40",
    path: "shark",
  },
  {
    key: "card",
    emoji: "💎",
    color: "from-indigo-500 to-purple-700",
    border: "border-indigo-400/40",
    path: "card",
  },
] as const;

export default function LobbyPage() {
  const t = useTranslations("Lobby");
  const tCommon = useTranslations("Common");
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.push(`/${locale}`)}
          className="text-white/60 hover:text-white text-sm font-medium px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          ‹ 🌐
        </button>
        <h1 className="text-2xl font-black text-white">{t("title")}</h1>
        <div className="w-16" />
      </div>

      <p className="text-center text-slate-400 text-sm mb-6">{t("subtitle")}</p>

      {/* Game Cards */}
      <div className="flex flex-col gap-4 flex-1">
        {GAMES.map((game) => (
          <button
            key={game.key}
            onClick={() => router.push(`/${locale}/${game.path}`)}
            className={`relative flex items-center gap-4 w-full px-5 py-5 rounded-2xl bg-gradient-to-r ${game.color} border ${game.border} shadow-lg active:scale-95 transition-transform duration-100 touch-none select-none`}
          >
            <span className="text-5xl">{game.emoji}</span>
            <div className="flex-1 text-left">
              <div className="text-white font-black text-xl leading-tight">
                {t(`${game.key}.name`)}
              </div>
              <div className="text-white/80 text-sm mt-0.5 leading-snug">
                {t(`${game.key}.description`)}
              </div>
            </div>
            <span className="text-white/60 text-2xl font-bold">›</span>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-6 text-center space-x-3 text-xs text-slate-700">
        <button onClick={() => router.push(`/${locale}/about`)} className="hover:text-slate-400 transition-colors">{tCommon("about")}</button>
        <span>·</span>
        <button onClick={() => router.push(`/${locale}/terms`)} className="hover:text-slate-400 transition-colors">{tCommon("terms")}</button>
        <span>·</span>
        <button onClick={() => router.push(`/${locale}/privacy`)} className="hover:text-slate-400 transition-colors">{tCommon("privacy")}</button>
      </div>
    </div>
  );
}
