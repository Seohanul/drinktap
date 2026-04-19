"use client";

import { useTranslations } from "next-intl";
import InfoPageLayout from "../components/InfoPageLayout";

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

      {/* Games */}
      <section>
        <h3 className="text-lg font-bold text-white mb-3 border-b border-white/10 pb-2">
          {t("featuresTitle")}
        </h3>
        <ul className="space-y-2">
          {(["feature1", "feature2", "feature3", "feature4"] as const).map((key) => (
            <li key={key} className="flex items-start gap-2 text-gray-300">
              <span className="text-indigo-400 mt-0.5">▸</span>
              <span>{t(key)}</span>
            </li>
          ))}
        </ul>
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
