"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { Inter, Vazirmatn } from "next/font/google";
import dynamic from "next/dynamic";
import { TrendingUp, TrendingDown, Flame, BarChart3, Ship, Newspaper, Radio, AlertTriangle, Play, Pause, Download, Loader2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { toPng } from "html-to-image";

import dashboardData from "./data.json";

const DynamicMap = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center bg-zinc-900 text-zinc-600 text-sm">Loading Map...</div>,
});

const inter = Inter({ subsets: ["latin"], display: "swap" });
const vazirmatn = Vazirmatn({ subsets: ["arabic"], display: "swap" });

const useAnimatedNumber = (targetValue, duration = 500) => {
  const [value, setValue] = useState(targetValue);

  useEffect(() => {
    let startTimestamp;
    let animationFrame;
    const startValue = value;
    const distance = targetValue - startValue;
    if (distance === 0) return;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      setValue(startValue + distance * easeProgress);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      } else {
        setValue(targetValue);
      }
    };

    animationFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrame);
  }, [targetValue, duration]);

  return value;
};

const AnimatedNumber = ({ value, isFloat = false, decimals = 1 }) => {
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  const animatedValue = useAnimatedNumber(numValue);

  if (isFloat) return <>{animatedValue.toFixed(decimals)}</>;
  return <>{Math.round(animatedValue).toLocaleString()}</>;
};

const uiDictionary = {
  en: {
    title: "Regional Conflict Analysis Dashboard",
    subtitle: "Daily monitoring of conflicts, energy markets, and Strait of Hormuz traffic",
    base: "Base",
    compareWith: "Compare with previous day",
    fireRange: "Fire Range in Region",
    energyStatus: "Energy Market Status",
    hormuzTraffic: "Hormuz Strait Traffic",
    newsSources: "News Sources & References",
    nightGatherings: "Night Gatherings Nationwide",
    martyrsStats: "Martyrs Statistics",
    severity: "Severity Level",
    critical: "Critical",
    defensive: "Defensive",
    medium: "Medium",
    normal: "Normal",
    brentOil: "Brent Oil Price",
    lngGas: "LNG Gas Price",
    usGasoline: "US Gasoline",
    tankersPassed: "Tankers Passed",
    tankersInTraffic: "Tankers in Traffic",
    cargoPassed: "Cargo Ships Passed",
    cargoInTraffic: "Cargo Ships in Traffic",
    gatheringsToday: "Gatherings Today",
    majorCities: "Major Cities:",
    totalMartyrsToday: "Total Martyrs Today",
    womenChildren: "Women & Children Martyrs Today",
    ofTotal: "of total",
    totalMartyrsSince: "Total Martyrs Since War Started",
    day: "Day",
    techUsed: "Technologies Used:",
    download: "Download Dashboard Screenshot",
    today: "Today",
    statsRef: "Data collected based on public reports.",
    teuDesc: "1 TEU = 1 standard 20-foot cargo container",
  },
  fa: {
    title: "داشبورد پایش تحولات منطقه",
    subtitle: "نمایش داده‌های روزانه درگیری، بازار انرژی و ترافیک تنگه هرمز",
    base: "پایه",
    compareWith: "مقایسه با روز قبل",
    fireRange: "گستره آتش در منطقه",
    energyStatus: "وضعیت بازار انرژی",
    hormuzTraffic: "ترافیک تنگه هرمز",
    newsSources: "منابع و مراجع خبری",
    nightGatherings: "تجمعات شبانه کشور",
    martyrsStats: "آمار شهدا",
    severity: "سطح اهمیت:",
    critical: "بحرانی",
    defensive: "پدافندی",
    medium: "متوسط",
    normal: "عادی",
    brentOil: "قیمت نفت برنت",
    lngGas: "قیمت گاز LNG",
    usGasoline: "قیمت گاز طبیعی",
    tankersPassed: "نفتکش‌های عبوری",
    tankersInTraffic: "نفتکش در ترافیک",
    cargoPassed: "کشتی‌های باری عبوری",
    cargoInTraffic: "کشتی باری در ترافیک",
    gatheringsToday: "تجمعات امروز",
    majorCities: "شهرهای اصلی:",
    totalMartyrsToday: "کل شهدای امروز",
    womenChildren: "زن و کودک شهید امروز",
    ofTotal: "از کل شهدا",
    totalMartyrsSince: "شهدای کل از ابتدای جنگ",
    day: "روز",
    techUsed: "فناوری‌های مورد استفاده:",
    download: "دریافت تصویر داشبورد",
    today: "امروز",
    statsRef: "داده‌ها بر اساس گزارش‌های عمومی جمع‌آوری شده‌اند.",
    teuDesc: "واحد استاندارد حمل بار (هر کانتینر ۲۰ فوتی یک TEU است)",
  },
};

const Header = ({ appLanguage, setAppLanguage, uiTranslations, currentTimeState }) => {
  const isPersian = appLanguage === "fa";
  const formattedDate = currentTimeState.toLocaleDateString(isPersian ? "fa-IR" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = currentTimeState.toLocaleTimeString(isPersian ? "fa-IR" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <header className="flex flex-col items-center justify-center pt-8 pb-6 relative">
      <div className="flex bg-zinc-800 rounded-lg p-1 mb-6 gap-2 no-capture">
        <button
          onClick={() => setAppLanguage("fa")}
          className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
            isPersian ? "bg-blue-600 text-white" : "text-zinc-400 hover:text-white"
          }`}
        >
          فارسی
        </button>
        <button
          onClick={() => setAppLanguage("en")}
          className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
            !isPersian ? "bg-blue-600 text-white" : "text-zinc-400 hover:text-white"
          }`}
        >
          English
        </button>
      </div>
      <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
        {uiTranslations.title} <span>🇮🇷</span>
      </h1>
      <p className="text-zinc-400 text-sm mb-1">{uiTranslations.subtitle}</p>
      <p className="text-zinc-500 text-xs flex gap-1 items-center" dir={isPersian ? "rtl" : "ltr"}>
        {formattedDate} • {isPersian ? "ساعت" : "Time"} {formattedTime}
      </p>
      <p className="text-zinc-600 text-[10px] mt-1">{uiTranslations.statsRef}</p>
    </header>
  );
};

const MetricCard = ({
  title,
  value,
  isFloatValue = false,
  baseValue,
  percentageChange,
  isTrendingUp,
  uiTranslations,
  prefix = "",
  suffix = "",
  subtitle = "",
}) => (
  <div className="bg-[#1e1e24] p-5 rounded-xl border border-zinc-800 flex flex-col justify-between h-36 hover:border-zinc-700 transition-colors shadow-sm">
    <div className="flex justify-between items-start">
      <div>
        <h3 className="text-zinc-400 text-xs font-medium mb-1">{title}</h3>
        {subtitle ? (
          <p className="text-zinc-500 text-[10px] leading-tight max-w-[240px]">{subtitle}</p>
        ) : (
          <p className="text-zinc-500 text-[10px]">{uiTranslations.compareWith}</p>
        )}
      </div>
      <div className="w-6 h-6 rounded bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20"></div>
    </div>
    <div className="flex justify-between items-end mt-4">
      <div className="flex flex-col">
        <span className="text-3xl font-bold text-white tracking-tight">
          {prefix}
          <AnimatedNumber value={value} isFloat={isFloatValue} />
          {suffix}
        </span>
        <div className={`text-[11px] mt-1 flex items-center gap-1 font-semibold ${isTrendingUp ? "text-green-500" : "text-red-500"}`}>
          {isTrendingUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          <AnimatedNumber value={percentageChange} isFloat={true} />%
        </div>
      </div>
      <div className="text-end">
        <span className="text-zinc-600 text-[10px] block mb-0.5">{uiTranslations.base}</span>
        <span className="text-zinc-400 text-xs font-medium">
          {prefix}
          {baseValue}
          {suffix}
        </span>
      </div>
    </div>
  </div>
);

const IncidentMapCard = ({ appLanguage, uiTranslations, dailyMetrics, activeNewsId, setActiveNewsId }) => {
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (activeNewsId && scrollContainerRef.current) {
      const activeElement = document.getElementById(`news-item-${activeNewsId}`);
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [activeNewsId]);

  return (
    <div className="bg-[#1e1e24] p-5 rounded-xl border border-zinc-800 flex flex-col h-full">
      <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
        <Flame className="text-red-500" size={18} /> {uiTranslations.fireRange}
      </h2>
      <div className="bg-zinc-900 rounded-lg h-56 mb-4 shrink-0 relative overflow-hidden border border-zinc-800 z-0">
        <DynamicMap
          locations={dailyMetrics.locations || []}
          newsList={dailyMetrics.news || []}
          activeNewsId={activeNewsId}
          setActiveNewsId={setActiveNewsId}
          appLanguage={appLanguage}
        />
      </div>

      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto max-h-52 space-y-2 pr-2 rtl:pr-0 rtl:pl-2 
          [&::-webkit-scrollbar]:w-1.5 
          [&::-webkit-scrollbar-track]:bg-transparent 
          [&::-webkit-scrollbar-thumb]:bg-zinc-700 
          [&::-webkit-scrollbar-thumb]:rounded-full 
          hover:[&::-webkit-scrollbar-thumb]:bg-zinc-500
          transition-colors"
      >
        {dailyMetrics.news.map((newsItem) => {
          const isActive = activeNewsId === newsItem.id;
          return (
            <div
              key={newsItem.id}
              id={`news-item-${newsItem.id}`}
              onClick={() => setActiveNewsId(isActive ? null : newsItem.id)}
              className={`border-l-2 pl-3 rtl:border-r-2 rtl:border-l-0 rtl:pr-3 rtl:pl-0 cursor-pointer p-2 transition-all rounded-r-lg rtl:rounded-l-lg rtl:rounded-r-none ${
                isActive ? "border-blue-500 bg-zinc-800/80 shadow-md" : "border-zinc-700 hover:border-blue-400 hover:bg-zinc-800/30"
              }`}
            >
              <h4 className={`text-sm font-medium mb-1 leading-snug transition-colors ${isActive ? "text-white" : "text-zinc-300"}`}>
                {appLanguage === "en" ? newsItem.titleEn : newsItem.titleFa}
              </h4>
              <div className="flex justify-between text-xs text-zinc-500">
                <span>{appLanguage === "en" ? newsItem.sourceEn : newsItem.sourceFa}</span>
                <span>{appLanguage === "en" ? newsItem.timeEn : newsItem.timeFa}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 shrink-0 border-t border-zinc-800 flex items-center gap-4 text-xs">
        <span className="text-zinc-500">{uiTranslations.severity}</span>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500"></span> <span className="text-zinc-400">{uiTranslations.critical}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500"></span> <span className="text-zinc-400">{uiTranslations.defensive}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-yellow-500"></span> <span className="text-zinc-400">{uiTranslations.medium}</span>
        </div>
      </div>
    </div>
  );
};

const EnergyMarketCard = ({ appLanguage, uiTranslations, dailyMetrics, chartData }) => {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-900 border border-zinc-700 p-3 rounded-lg shadow-xl text-xs" dir={appLanguage === "fa" ? "rtl" : "ltr"}>
          <p className="text-zinc-300 font-semibold mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="flex justify-between gap-4 py-0.5 font-medium">
              <span>
                {entry.dataKey === "brent" && uiTranslations.brentOil}
                {entry.dataKey === "lng" && uiTranslations.lngGas}
                {entry.dataKey === "gasoline" && uiTranslations.usGasoline}
              </span>
              <span>${entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#1e1e24] p-5 rounded-xl border border-zinc-800 flex flex-col h-full">
      <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
        <BarChart3 className="text-yellow-500" size={18} /> {uiTranslations.energyStatus}
      </h2>
      <div className="bg-zinc-900/50 rounded-lg h-56 mb-6 shrink-0 border border-zinc-800/80 pt-4 pr-4 pb-2" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
            <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} tickMargin={10} />
            <YAxis
              stroke="#71717a"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              domain={["auto", "auto"]}
              tickFormatter={(value) => `$${value}`}
            />
            <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: "#52525b", strokeWidth: 1, strokeDasharray: "4 4" }} />
            <Line
              type="monotone"
              dataKey="brent"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ r: 3, fill: "#ef4444", strokeWidth: 0 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
              animationDuration={800}
            />
            <Line
              type="monotone"
              dataKey="lng"
              stroke="#eab308"
              strokeWidth={2}
              dot={{ r: 3, fill: "#eab308", strokeWidth: 0 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
              animationDuration={800}
            />
            <Line
              type="monotone"
              dataKey="gasoline"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 3, fill: "#3b82f6", strokeWidth: 0 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
              animationDuration={800}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-4 flex-1">
        <div className="flex justify-between items-center bg-zinc-800/40 hover:bg-zinc-800/80 transition-colors p-3 rounded-lg">
          <div className="flex items-center gap-2 text-zinc-300 text-sm">
            <span className="text-red-500">⛽</span> {uiTranslations.brentOil}
          </div>
          <div className="text-end">
            <div className="text-white font-bold">
              $<AnimatedNumber value={dailyMetrics.energy.brent.price} isFloat={false} />
            </div>
            <div className="text-green-500 text-xs flex items-center justify-end gap-1">
              <TrendingUp size={12} /> <AnimatedNumber value={dailyMetrics.energy.brent.change} isFloat={true} />%
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center bg-zinc-800/40 hover:bg-zinc-800/80 transition-colors p-3 rounded-lg">
          <div className="flex items-center gap-2 text-zinc-300 text-sm">
            <span className="text-yellow-500">🔥</span> {uiTranslations.lngGas}
          </div>
          <div className="text-end">
            <div className="text-white font-bold">
              $<AnimatedNumber value={dailyMetrics.energy.lng.price} isFloat={true} />
            </div>
            <div className="text-green-500 text-xs flex items-center justify-end gap-1">
              <TrendingUp size={12} /> <AnimatedNumber value={dailyMetrics.energy.lng.change} isFloat={true} />%
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center bg-zinc-800/40 hover:bg-zinc-800/80 transition-colors p-3 rounded-lg">
          <div className="flex items-center gap-2 text-zinc-300 text-sm">
            <span className="text-blue-500">🛢️</span> {uiTranslations.usGasoline}
          </div>
          <div className="text-end">
            <div className="text-white font-bold">
              $<AnimatedNumber value={dailyMetrics.energy.gasoline.price} isFloat={true} />
            </div>
            <div
              className={`text-xs flex items-center justify-end gap-1 ${
                parseFloat(dailyMetrics.energy.gasoline.change) >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {parseFloat(dailyMetrics.energy.gasoline.change) >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}{" "}
              <AnimatedNumber value={Math.abs(parseFloat(dailyMetrics.energy.gasoline.change))} isFloat={true} />%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MarineTrafficCard = ({ uiTranslations, dailyMetrics }) => (
  <div className="bg-[#1e1e24] p-5 rounded-xl border border-zinc-800 flex flex-col h-full">
    <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
      <Ship className="text-blue-500" size={18} /> {uiTranslations.hormuzTraffic}
    </h2>

    <div className="bg-zinc-900 rounded-lg h-56 mb-6 shrink-0 relative overflow-hidden border border-zinc-800 z-0 flex items-center justify-center">
      <img src="/marine-map.png" alt="Strait of Hormuz Traffic" className="w-full h-full object-cover opacity-80 grayscale-[20%]" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#1e1e24] via-transparent to-transparent pointer-events-none"></div>
    </div>

    <div className="space-y-4 flex-1">
      <div className="flex justify-between items-center border-b border-zinc-800/50 pb-3">
        <div className="flex items-center gap-2 text-zinc-300 text-sm">
          <Ship size={14} className="text-red-500" /> {uiTranslations.tankersPassed}
        </div>
        <div className="text-end flex items-center gap-4">
          <div className="text-red-500 text-xs flex items-center gap-1">
            <TrendingDown size={12} /> <AnimatedNumber value={Math.abs(dailyMetrics.traffic.tankersPassed.change)} />%
          </div>
          <div className="text-white font-bold text-lg">
            <AnimatedNumber value={dailyMetrics.traffic.tankersPassed.current} />
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center border-b border-zinc-800/50 pb-3">
        <div className="flex items-center gap-2 text-zinc-300 text-sm">
          <Ship size={14} className="text-blue-500" /> {uiTranslations.tankersInTraffic}
        </div>
        <div className="text-white font-bold text-lg">
          <AnimatedNumber value={dailyMetrics.traffic.tankersInTraffic.current} />
        </div>
      </div>
      <div className="flex justify-between items-center border-b border-zinc-800/50 pb-3">
        <div className="flex items-center gap-2 text-zinc-300 text-sm">
          <Ship size={14} className="text-yellow-500" /> {uiTranslations.cargoPassed}
        </div>
        <div className="text-end flex items-center gap-4">
          <div className="text-red-500 text-xs flex items-center gap-1">
            <TrendingDown size={12} /> <AnimatedNumber value={Math.abs(dailyMetrics.traffic.cargoPassed.change)} />%
          </div>
          <div className="text-white font-bold text-lg">
            <AnimatedNumber value={dailyMetrics.traffic.cargoPassed.current} />
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-zinc-300 text-sm">
          <Ship size={14} className="text-blue-300" /> {uiTranslations.cargoInTraffic}
        </div>
        <div className="text-white font-bold text-lg">
          <AnimatedNumber value={dailyMetrics.traffic.cargoInTraffic.current} />
        </div>
      </div>
    </div>
  </div>
);

const AnalyticsRow = ({ appLanguage, uiTranslations, dailyMetrics, allSources }) => {
  const sourcesToRender = dailyMetrics.sources || allSources || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
      <div className="bg-[#1e1e24] p-5 rounded-xl border border-zinc-800">
        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Newspaper className="text-blue-500" size={18} /> {uiTranslations.newsSources}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {sourcesToRender.map((src, i) => (
            <div
              key={i}
              className="bg-zinc-800/40 hover:bg-zinc-700 hover:text-white transition-colors text-zinc-400 text-xs py-2.5 px-3 rounded-lg text-center border border-zinc-700/50"
            >
              {appLanguage === "en" ? src.en : src.fa}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#1e1e24] p-5 rounded-xl border border-zinc-800">
        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Radio className="text-yellow-500" size={18} /> {uiTranslations.nightGatherings}
        </h2>
        <div className="flex justify-between items-end mb-6 pb-4 border-b border-zinc-800/50">
          <div>
            <p className="text-zinc-500 text-xs mb-1">{uiTranslations.gatheringsToday}</p>
            <p className="text-zinc-600 text-[10px]">{uiTranslations.base} 0</p>
          </div>
          <div className="text-end">
            <div className="text-2xl font-bold text-white mb-1 flex items-center justify-end gap-2">
              <AlertTriangle size={16} className="text-yellow-500" /> <AnimatedNumber value={dailyMetrics.gatherings.total} />
            </div>
            <div className="text-green-500 text-xs flex items-center justify-end gap-1">
              <TrendingUp size={12} /> <AnimatedNumber value={dailyMetrics.gatherings.change} />%
            </div>
          </div>
        </div>
        <div className="space-y-2.5">
          <p className="text-zinc-500 text-[11px] mb-3 uppercase tracking-wider">{uiTranslations.majorCities}</p>
          {dailyMetrics.gatherings.cities.map((city, i) => (
            <div key={i} className="flex justify-between items-center text-sm">
              <span className="text-zinc-300">{appLanguage === "en" ? city.nameEn : city.nameFa}</span>
              <span className="text-white font-medium bg-zinc-800/50 px-2 py-0.5 rounded">
                <AnimatedNumber value={city.count} />
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#1e1e24] p-5 rounded-xl border border-zinc-800 flex flex-col justify-between">
        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="text-red-500" size={18} /> {uiTranslations.martyrsStats}
        </h2>
        <div className="bg-red-600/90 text-white p-4 rounded-xl flex justify-between items-center mb-4 shadow-lg shadow-red-900/20">
          <span className="font-medium text-sm">{uiTranslations.totalMartyrsToday}</span>
          <span className="text-3xl font-bold tracking-tight">
            <AnimatedNumber value={dailyMetrics.martyrs.today} />
          </span>
        </div>
        <div className="flex justify-between items-center mb-6 px-1">
          <div>
            <p className="text-zinc-300 text-sm">{uiTranslations.womenChildren}</p>
            <p className="text-zinc-500 text-[11px] mt-0.5">{uiTranslations.ofTotal}</p>
          </div>
          <div className="text-end">
            <div className="text-white font-bold text-xl">
              <AnimatedNumber value={dailyMetrics.martyrs.womenChildren} />
            </div>
            <div className="text-yellow-500 text-xs font-medium">
              <AnimatedNumber value={dailyMetrics.martyrs.womenChildrenPercent} />%
            </div>
          </div>
        </div>
        <div className="bg-zinc-900/80 border border-zinc-700/50 p-4 rounded-xl">
          <div className="flex justify-between items-center mb-3">
            <span className="text-zinc-400 text-xs">{uiTranslations.totalMartyrsSince}</span>
            <span className="text-red-500 font-bold text-lg">
              <AnimatedNumber value={dailyMetrics.martyrs.total} />
            </span>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-gradient-to-r from-red-700 to-red-500 h-full rounded-full" style={{ width: "100%" }}></div>
          </div>
          <div className="text-end text-zinc-500 text-[10px] mt-2 font-medium">
            {uiTranslations.day} {dailyMetrics.martyrs.day}
          </div>
        </div>
      </div>
    </div>
  );
};

const TimelineFooter = ({
  appLanguage,
  uiTranslations,
  selectedDay,
  setSelectedDay,
  isPlaying,
  togglePlay,
  handleDownload,
  isDownloading,
  totalDays,
}) => {
  const sliderPercentage = ((selectedDay - 1) / Math.max(1, totalDays - 1)) * 100;
  const isRtl = appLanguage === "fa";
  const sliderPositioning = isRtl ? "right" : "left";

  return (
    <div className="mt-6 space-y-4">
      <div className="bg-[#1e1e24] p-4 rounded-xl border border-zinc-800 flex items-center gap-5">
        <button
          onClick={togglePlay}
          className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0 hover:bg-blue-500 hover:scale-105 transition-all shadow-lg shadow-blue-900/20"
        >
          {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
        </button>
        <div className="flex-1 relative pt-6 pb-2 group">
          <div className="absolute top-0 start-0 text-red-500 text-xs font-medium">Start</div>
          <div className="absolute top-0 end-0 text-green-500 text-xs font-medium">{uiTranslations.today}</div>
          <div className="relative h-2 w-full rounded-full bg-zinc-800 overflow-visible">
            <div
              className="absolute top-0 h-full bg-blue-600 rounded-full pointer-events-none transition-all duration-200 ease-out"
              style={{ [sliderPositioning]: 0, width: `${sliderPercentage}%` }}
            />
            <input
              type="range"
              min="1"
              max={totalDays}
              value={selectedDay}
              onChange={(e) => {
                if (isPlaying) togglePlay();
                setSelectedDay(Number(e.target.value));
              }}
              className="absolute w-full top-1/2 -translate-y-1/2 opacity-0 cursor-pointer z-20 h-6"
              dir={isRtl ? "rtl" : "ltr"}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-400 rounded-full border-2 border-zinc-900 pointer-events-none transition-all duration-200 ease-out shadow-[0_0_10px_rgba(96,165,250,0.5)]"
              style={{ [sliderPositioning]: `calc(${sliderPercentage}% - 8px)` }}
            />
            <div
              className={`absolute -top-8 bg-zinc-800 text-zinc-200 text-[10px] font-bold px-2 py-1 rounded transition-all duration-300 ease-out pointer-events-none border border-zinc-700 ${
                selectedDay === totalDays ? "opacity-0 scale-95" : "opacity-100 scale-100"
              }`}
              style={{ [sliderPositioning]: `${sliderPercentage}%`, transform: isRtl ? "translateX(50%)" : "translateX(-50%)" }}
            >
              Day {selectedDay}
            </div>
          </div>
        </div>
      </div>
      {/* Moved no-capture here to hide the entire section including tech info in the screenshot */}
      <div className="bg-[#1e1e24] p-4 rounded-xl border border-zinc-800 flex justify-end items-center no-capture">
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className={`bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all cursor-pointer  ${
            isDownloading ? "opacity-60 cursor-not-allowed" : "hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-900/20 active:scale-95"
          }`}
        >
          {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          {isDownloading ? (appLanguage === "fa" ? "در حال دریافت..." : "Downloading...") : uiTranslations.download}
        </button>
      </div>
    </div>
  );
};

const TOTAL_DAYS_IN_DATA = Object.keys(dashboardData.days).length;

export default function RegionalDashboard() {
  const [appLanguage, setAppLanguage] = useState("fa");
  const [selectedDay, setSelectedDay] = useState(TOTAL_DAYS_IN_DATA);
  const [currentTimeState, setCurrentTimeState] = useState(new Date());
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeNewsId, setActiveNewsId] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const dashboardRef = useRef(null);

  useEffect(() => {
    setCurrentTimeState(new Date());
    const timer = setInterval(() => setCurrentTimeState(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let playInterval;
    if (isPlaying) {
      playInterval = setInterval(() => {
        setSelectedDay((prevDay) => {
          if (prevDay >= TOTAL_DAYS_IN_DATA) {
            setIsPlaying(false);
            return TOTAL_DAYS_IN_DATA;
          }
          return prevDay + 1;
        });
      }, 2000);
    }
    return () => {
      if (playInterval) clearInterval(playInterval);
    };
  }, [isPlaying]);

  useEffect(() => {
    setActiveNewsId(null);
  }, [selectedDay]);

  const togglePlay = () => {
    if (selectedDay === TOTAL_DAYS_IN_DATA && !isPlaying) setSelectedDay(1);
    setIsPlaying(!isPlaying);
  };

  const screenshotFilter = (node) => {
    const exclusionClasses = ["no-capture"];
    if (node.classList && typeof node.classList.contains === "function") {
      return !exclusionClasses.some((classname) => node.classList.contains(classname));
    }
    return true;
  };

  const handleDownload = async () => {
    if (!dashboardRef.current) return;
    try {
      setIsDownloading(true);
      const dataUrl = await toPng(dashboardRef.current, {
        quality: 0.95,
        backgroundColor: "#121212",
        filter: screenshotFilter,
      });
      const link = document.createElement("a");
      link.download = `regional-dashboard-day-${selectedDay}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate image.", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const uiTranslations = uiDictionary[appLanguage];
  const layoutDirection = appLanguage === "fa" ? "rtl" : "ltr";
  const dailyMetrics = dashboardData.days[selectedDay.toString()];

  const energyChartData = useMemo(() => {
    const data = [];
    for (let i = 1; i <= selectedDay; i++) {
      const historicalDay = dashboardData.days[i.toString()];
      if (historicalDay) {
        data.push({
          name: appLanguage === "en" ? `Day ${i}` : `روز ${i}`,
          brent: historicalDay.energy.brent.price,
          lng: historicalDay.energy.lng.price,
          gasoline: historicalDay.energy.gasoline.price,
        });
      }
    }
    return data;
  }, [selectedDay, appLanguage]);

  if (!dailyMetrics) return <div className="p-8 text-white flex justify-center items-center min-h-screen">Loading operational data...</div>;

  return (
    <div
      ref={dashboardRef}
      dir={layoutDirection}
      className={`min-h-screen bg-[#121212] selection:bg-blue-500/30 text-zinc-100 p-4 md:p-8 ${
        appLanguage === "en" ? inter.className : vazirmatn.className
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <Header appLanguage={appLanguage} setAppLanguage={setAppLanguage} uiTranslations={uiTranslations} currentTimeState={currentTimeState} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <MetricCard
            title={uiTranslations.brentOil}
            value={dailyMetrics.kpis.brent.value}
            isFloatValue={true}
            baseValue={dailyMetrics.kpis.brent.base}
            percentageChange={dailyMetrics.kpis.brent.change}
            isTrendingUp={dailyMetrics.kpis.brent.isUp}
            uiTranslations={uiTranslations}
            prefix="$"
          />
          <MetricCard
            title={uiTranslations.lngGas}
            value={dailyMetrics.kpis.lng.value}
            isFloatValue={true}
            baseValue={dailyMetrics.kpis.lng.base}
            percentageChange={dailyMetrics.kpis.lng.change}
            isTrendingUp={dailyMetrics.kpis.lng.isUp}
            uiTranslations={uiTranslations}
            prefix="$"
          />
          <MetricCard
            title={uiTranslations.hormuzTraffic}
            value={dailyMetrics.kpis.hormuz.value}
            isFloatValue={false}
            baseValue={dailyMetrics.kpis.hormuz.base}
            percentageChange={dailyMetrics.kpis.hormuz.change}
            isTrendingUp={dailyMetrics.kpis.hormuz.isUp}
            uiTranslations={uiTranslations}
          />
          <MetricCard
            title={"TEU Index"}
            subtitle={uiTranslations.teuDesc}
            value={dailyMetrics.kpis.teu.value}
            isFloatValue={false}
            baseValue={dailyMetrics.kpis.teu.base}
            percentageChange={dailyMetrics.kpis.teu.change}
            isTrendingUp={dailyMetrics.kpis.teu.isUp}
            uiTranslations={uiTranslations}
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <IncidentMapCard
            appLanguage={appLanguage}
            uiTranslations={uiTranslations}
            dailyMetrics={dailyMetrics}
            activeNewsId={activeNewsId}
            setActiveNewsId={setActiveNewsId}
          />
          <EnergyMarketCard appLanguage={appLanguage} uiTranslations={uiTranslations} dailyMetrics={dailyMetrics} chartData={energyChartData} />
          <MarineTrafficCard uiTranslations={uiTranslations} dailyMetrics={dailyMetrics} />
        </div>

        <AnalyticsRow appLanguage={appLanguage} uiTranslations={uiTranslations} dailyMetrics={dailyMetrics} allSources={dashboardData.sources} />

        <TimelineFooter
          appLanguage={appLanguage}
          uiTranslations={uiTranslations}
          selectedDay={selectedDay}
          setSelectedDay={setSelectedDay}
          isPlaying={isPlaying}
          togglePlay={togglePlay}
          handleDownload={handleDownload}
          isDownloading={isDownloading}
          totalDays={TOTAL_DAYS_IN_DATA}
        />
      </div>
    </div>
  );
}
