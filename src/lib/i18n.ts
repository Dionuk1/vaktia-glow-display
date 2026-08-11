import { useEffect, useState } from "react";

export type Lang = "sq" | "en" | "de" | "tr";

export const LANGS: { code: Lang; label: string; short: string; flag: string }[] = [
  { code: "sq", label: "Shqip (AL/KS)", short: "AL", flag: "🇦🇱" },
  { code: "en", label: "English", short: "EN", flag: "🇬🇧" },
  { code: "de", label: "Deutsch", short: "DE", flag: "🇩🇪" },
  { code: "tr", label: "Türkçe", short: "TR", flag: "🇹🇷" },
];

const LANG_KEY = "vaktia:lang";

type Dict = Record<string, string>;

const STRINGS: Record<Lang, Dict> = {
  sq: {
    menu: "Menu",
    about: "Rreth VaktiaKS",
    aboutText:
      "VaktiaKS është platforma juaj dixhitale për oraret zyrtare të namazit, orientimin drejt Kibles, gjetjen e xhamive dhe ndjekjen e zakoneve ditore në Kosovë dhe Shqipëri.",
    features: "Veçoritë",
    rekate: "Tabela e Rekateve",
    rekateSub: "Sunet, Farz dhe Vitr për secilin namaz",
    close: "Mbyll",
    analytics: "Analitika e Tespihut",
    analyticsSub: "Grafiku 7-ditor i dhikrit tuaj",
    kaza: "Gjurmuesi i Kazave",
    kazaSub: "Regjistro dhe plotëso namazet e humbura",
    streaks: "Seritë dhe Arritjet",
    streaksSub: "Bexha motivuese dhe progres",
    mosque: "Xhamia më e Afërt",
    mosqueSub: "Gjeolokacion dhe udhëzime",
    langs: "Shumëgjuhësia",
    langsSub: "Shqip, English, Deutsch, Türkçe",
    widget: "Widget për Ekran & Kutizat",
    widgetSub: "Widget-e dhe Wear OS tiles",
    new: "I RI",
    newF: "E RE",
    updated: "PËRDITËSUAR",
    soon: "SË SHPEJTI",
  },
  en: {
    menu: "Menu",
    about: "About VaktiaKS",
    aboutText:
      "VaktiaKS is your digital platform for official prayer times, Qibla direction, finding mosques and tracking daily worship across Kosovo and Albania.",
    features: "Features",
    rekate: "Rakat Table",
    rekateSub: "Sunnah, Fard and Witr for each prayer",
    close: "Close",
    analytics: "Tasbih Analytics",
    analyticsSub: "Your 7-day dhikr chart",
    kaza: "Missed Prayer Tracker",
    kazaSub: "Log and complete missed prayers",
    streaks: "Streaks & Achievements",
    streaksSub: "Motivational badges and progress",
    mosque: "Nearest Mosque",
    mosqueSub: "Geolocation and directions",
    langs: "Multi-language",
    langsSub: "Shqip, English, Deutsch, Türkçe",
    widget: "Home Screen Widgets & Tiles",
    widgetSub: "Widgets and Wear OS tiles",
    new: "NEW",
    newF: "NEW",
    updated: "UPDATED",
    soon: "SOON",
  },
  de: {
    menu: "Menü",
    about: "Über VaktiaKS",
    aboutText:
      "VaktiaKS ist deine digitale Plattform für offizielle Gebetszeiten, Qibla-Richtung, Moscheesuche und die Verfolgung deiner täglichen Andacht im Kosovo und in Albanien.",
    features: "Funktionen",
    rekate: "Rakat-Tabelle",
    rekateSub: "Sunnah, Fard und Witr pro Gebet",
    close: "Schließen",
    analytics: "Tasbih-Analyse",
    analyticsSub: "Dein 7-Tage-Dhikr-Diagramm",
    kaza: "Nachhol-Gebete",
    kazaSub: "Verpasste Gebete erfassen",
    streaks: "Serien & Erfolge",
    streaksSub: "Abzeichen und Fortschritt",
    mosque: "Nächste Moschee",
    mosqueSub: "Standort und Route",
    langs: "Mehrsprachigkeit",
    langsSub: "Shqip, English, Deutsch, Türkçe",
    widget: "Widgets & Tiles",
    widgetSub: "Widgets und Wear OS Tiles",
    new: "NEU",
    newF: "NEU",
    updated: "AKTUALISIERT",
    soon: "BALD",
  },
  tr: {
    menu: "Menü",
    about: "VaktiaKS Hakkında",
    aboutText:
      "VaktiaKS; resmî namaz vakitleri, kıble yönü, cami bulma ve günlük ibadet takibi için dijital platformunuzdur (Kosova ve Arnavutluk).",
    features: "Özellikler",
    rekate: "Rekât Tablosu",
    rekateSub: "Her namaz için sünnet, farz ve vitir",
    close: "Kapat",
    analytics: "Tesbih Analitiği",
    analyticsSub: "7 günlük zikir grafiği",
    kaza: "Kaza Takipçisi",
    kazaSub: "Kaçan namazları kaydet",
    streaks: "Seriler ve Başarımlar",
    streaksSub: "Motive edici rozetler",
    mosque: "En Yakın Cami",
    mosqueSub: "Konum ve yol tarifi",
    langs: "Çoklu Dil",
    langsSub: "Shqip, English, Deutsch, Türkçe",
    widget: "Widget ve Kutucuklar",
    widgetSub: "Widget ve Wear OS tiles",
    new: "YENİ",
    newF: "YENİ",
    updated: "GÜNCELLENDİ",
    soon: "YAKINDA",
  },
};

export function readLang(): Lang {
  if (typeof window === "undefined") return "sq";
  const v = window.localStorage.getItem(LANG_KEY) as Lang | null;
  return v && v in STRINGS ? v : "sq";
}

export function setLang(l: Lang) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LANG_KEY, l);
  window.dispatchEvent(new CustomEvent("vaktia:lang-changed"));
}

export function useLang() {
  const [lang, setLangState] = useState<Lang>("sq");

  useEffect(() => {
    setLangState(readLang());
    const onChange = () => setLangState(readLang());
    window.addEventListener("vaktia:lang-changed", onChange);
    return () => window.removeEventListener("vaktia:lang-changed", onChange);
  }, []);

  const t = (key: string) => STRINGS[lang][key] ?? STRINGS.sq[key] ?? key;
  return { lang, t, setLang };
}
