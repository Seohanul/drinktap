"use client";

import { useTranslations } from "next-intl";
import InfoPageLayout from "../components/InfoPageLayout";

const SECTIONS = ["s1", "s2", "s3", "s4"] as const;

export default function PrivacyPage() {
  const t = useTranslations("Privacy");

  return (
    <InfoPageLayout title={t("title")}>
      <p className="text-gray-500 text-sm">{t("updated")}</p>
      <p className="text-gray-400 leading-relaxed">{t("intro")}</p>

      {SECTIONS.map((key) => (
        <section key={key}>
          <h3 className="text-base font-bold text-white mb-2">{t(`${key}title`)}</h3>
          <p className="text-gray-400 leading-relaxed">{t(key)}</p>
          {key === "s4" && (
            <a
              href={`mailto:${t("email")}`}
              className="mt-1 inline-block text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
            >
              {t("email")}
            </a>
          )}
        </section>
      ))}
    </InfoPageLayout>
  );
}
