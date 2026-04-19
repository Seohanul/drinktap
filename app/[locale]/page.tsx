"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

const LANGUAGES = [
  { code: "ko", flag: "🇰🇷", name: "한국어" },
  { code: "en", flag: "🇺🇸", name: "English" },
  { code: "vi", flag: "🇻🇳", name: "Tiếng Việt" },
  { code: "th", flag: "🇹🇭", name: "ภาษาไทย" },
  { code: "lo", flag: "🇱🇦", name: "ພາສາລາວ" },
];

export default function LandingPage() {
  const t = useTranslations("Landing");
  const router = useRouter();

  const handleSelect = (code: string) => {
    router.push(`/${code}/lobby`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 px-4 py-8">
      <div className="w-full max-w-sm flex flex-col items-center gap-8">
        {/* Title */}
        <div className="text-center">
          <div className="text-7xl mb-3">🎉</div>
          <h1 className="text-5xl font-black text-white tracking-tight drop-shadow-lg">
            {t("title")}
          </h1>
          <p className="text-lg text-indigo-200 mt-2 font-medium">
            {t("subtitle")}
          </p>
        </div>

        {/* Language Selection */}
        <div className="w-full">
          <p className="text-center text-indigo-300 text-sm font-semibold uppercase tracking-widest mb-4">
            {t("selectLanguage")}
          </p>
          <div className="grid grid-cols-1 gap-3">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className="flex items-center gap-4 w-full px-5 py-4 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-white/30 border border-white/20 transition-all duration-150 active:scale-95 touch-none select-none"
              >
                <span className="text-3xl">{lang.flag}</span>
                <span className="text-white font-bold text-lg">{lang.name}</span>
                <span className="ml-auto text-white/40 text-xl">›</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
