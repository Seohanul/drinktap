"use client";

import { useTranslations } from "next-intl";
import InfoPageLayout from "../components/InfoPageLayout";

const SECTIONS = ["s1", "s2", "s3", "s4", "s5", "s6"] as const;

export default function TermsPage() {
  const t = useTranslations("Terms");

  return (
    <InfoPageLayout title={t("title")}>
      <p className="text-gray-500 text-sm">{t("updated")}</p>

      {SECTIONS.map((key) => (
        <section key={key}>
          <h3 className="text-base font-bold text-white mb-2">{t(`${key}title`)}</h3>
          <p className="text-gray-400 leading-relaxed">{t(key)}</p>
        </section>
      ))}
    </InfoPageLayout>
  );
}
