"use client";

import { useTranslations } from "next-intl";
import InfoPageLayout from "../components/InfoPageLayout";

const GAMES = ["shark", "card", "tension"] as const;

export default function AboutPage() {
  const t = useTranslations("About");

  return (
    <InfoPageLayout title={t("title")}>
      {/* Hero */}
      <div className="text-center py-4">
        <div className="text-6xl mb-3">🎉</div>
        <h2 className="text-2xl font-black text-white">{t("title")}</h2>
        <p className="text-gray-400 mt-3 leading-relaxed">{t("description")}</p>
      </div>

      {/* Game cards */}
      <section>
        <h3 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-2">
          {t("gameIntroTitle")}
        </h3>
        <div className="flex flex-col gap-4">
          {GAMES.map((key) => (
            <div
              key={key}
              className="rounded-2xl bg-white/5 border border-white/10 p-4 flex flex-col gap-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{t(`${key}Emoji`)}</span>
                <div>
                  <div className="text-white font-black text-lg leading-tight">
                    {t(`${key}Name`)}
                  </div>
                  <div className="text-white/40 text-xs mt-0.5">
                    👥 {t(`${key}Players`)}
                  </div>
                </div>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                {t(`${key}Desc`)}
              </p>
              <div className="bg-white/5 rounded-xl px-3 py-2">
                <p className="text-white/40 text-xs font-bold mb-1">HOW TO PLAY</p>
                <p className="text-gray-400 text-xs leading-relaxed">
                  {t(`${key}How`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tip */}
      <section>
        <h3 className="text-lg font-bold text-white mb-3 border-b border-white/10 pb-2">
          {t("tipTitle")}
        </h3>
        <p className="text-gray-400 leading-relaxed">{t("tip")}</p>
      </section>

      {/* Languages */}
      <section>
        <h3 className="text-lg font-bold text-white mb-3 border-b border-white/10 pb-2">
          {t("supportTitle")}
        </h3>
        <div className="flex flex-wrap gap-2">
          {["🇰🇷 한국어", "🇺🇸 English", "🇻🇳 Tiếng Việt", "🇹🇭 ภาษาไทย", "🇱🇦 ພາສາລາວ"].map((lang) => (
            <span key={lang} className="px-3 py-1 rounded-full bg-white/10 text-sm text-gray-300">
              {lang}
            </span>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section>
        <h3 className="text-lg font-bold text-white mb-3 border-b border-white/10 pb-2">
          {t("contactTitle")}
        </h3>
        <p className="text-gray-400 mb-1">{t("contact")}</p>
        <a
          href={`mailto:${t("email")}`}
          className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
        >
          {t("email")}
        </a>
      </section>
    </InfoPageLayout>
  );
}
