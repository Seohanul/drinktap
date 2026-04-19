"use client";

import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";

interface InfoPageLayoutProps {
  title: string;
  children: React.ReactNode;
}

export default function InfoPageLayout({ title, children }: InfoPageLayoutProps) {
  const t = useTranslations("Common");
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-900/90 backdrop-blur border-b border-white/10 px-4 py-4 flex items-center gap-3">
        <button
          onClick={() => router.push(`/${locale}/lobby`)}
          className="text-gray-400 hover:text-white text-sm px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
        >
          ‹ {t("back")}
        </button>
        <h1 className="text-lg font-bold text-white">{title}</h1>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-5 py-8 space-y-6">
        {children}
      </div>

      {/* Footer links */}
      <div className="border-t border-white/10 mt-8 px-5 py-6 text-center space-x-4 text-sm text-gray-600">
        <button onClick={() => router.push(`/${locale}/about`)} className="hover:text-gray-400 transition-colors">{t("about")}</button>
        <span>·</span>
        <button onClick={() => router.push(`/${locale}/terms`)} className="hover:text-gray-400 transition-colors">{t("terms")}</button>
        <span>·</span>
        <button onClick={() => router.push(`/${locale}/privacy`)} className="hover:text-gray-400 transition-colors">{t("privacy")}</button>
      </div>
    </div>
  );
}
