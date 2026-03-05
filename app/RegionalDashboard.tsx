'use client';

import React, { useState, useEffect } from 'react';
import { Inter, Vazirmatn } from 'next/font/google';
import { 
  TrendingUp, TrendingDown, Flame, BarChart3, Ship, 
  Newspaper, Radio, AlertTriangle, Play, Download 
} from 'lucide-react';

// ==========================================
// 1. FONTS (Next.js App Router setup)
// ==========================================
const inter = Inter({ subsets: ['latin'], display: 'swap' });
const vazirmatn = Vazirmatn({ subsets: ['arabic'], display: 'swap' });

// ==========================================
// 2. MOCK DATA GENERATOR (9 Days)
// ==========================================
const generateMockData = () => {
  const daysData = {};
  
  for (let day = 1; day <= 9; day++) {
    const scale = day / 9; // Scales from ~0.11 to 1.0 (Day 9 is the exact Figma design)
    
    daysData[day] = {
      kpis: {
        brent: { value: Math.round(72 + (16 * scale)), base: 72, change: (22.2 * scale).toFixed(1), isUp: true },
        lng: { value: +(13.2 + (4.0 * scale)).toFixed(1), base: 13.2, change: (30.3 * scale).toFixed(1), isUp: true },
        hormuz: { value: Math.round(53 - (8 * scale)), base: 53, change: (15.1 * scale).toFixed(1), isUp: false },
        teu: { value: Math.round(28500 - (3700 * scale)), base: 28500, change: Math.round(13 * scale), isUp: false }
      },
      news: [
        { id: 1, titleEn: `Day ${day}: Missile attack on military facilities`, titleFa: `روز ${day}: حمله موشکی به تأسیسات نظامی`, sourceEn: "Reuters", sourceFa: "رویترز", timeEn: "2 hours ago", timeFa: "۲ ساعت پیش", severity: "critical" },
        { id: 2, titleEn: `Day ${day}: Explosion reported near US base`, titleFa: `روز ${day}: گزارش انفجار در نزدیکی پایگاه آمریکا`, sourceEn: "Al Jazeera", sourceFa: "الجزیره", timeEn: "4 hours ago", timeFa: "۴ ساعت پیش", severity: "medium" },
        { id: 3, titleEn: `Day ${day}: Drone interceptions ongoing`, titleFa: `روز ${day}: ادامه رهگیری پهپادها`, sourceEn: "BBC", sourceFa: "بی‌بی‌سی", timeEn: "6 hours ago", timeFa: "۶ ساعت پیش", severity: "normal" }
      ],
      energy: {
        brent: { price: Math.round(72 + (16 * scale)), change: (22.2 * scale).toFixed(1) },
        lng: { price: +(13.2 + (4.0 * scale)).toFixed(1), change: (30.3 * scale).toFixed(1) },
        gasoline: { price: +(3.3 + (1.1 * scale)).toFixed(1), change: (33.3 * scale).toFixed(1) }
      },
      traffic: {
        tankersPassed: { current: Math.round(24 - (6 * scale)), change: Math.round(25 * scale) },
        tankersInTraffic: { current: Math.round(8 + (4 * scale)) },
        cargoPassed: { current: Math.round(22 - (2 * scale)), change: Math.round(9 * scale) },
        cargoInTraffic: { current: Math.round(10 + (5 * scale)) }
      },
      gatherings: {
        total: Math.round(12 + (35 * scale)),
        change: Math.round(292 * scale),
        cities: [
          { nameEn: "Tehran", nameFa: "تهران", count: Math.round(12 * scale) || 1 },
          { nameEn: "Mashhad", nameFa: "مشهد", count: Math.round(8 * scale) || 1 },
          { nameEn: "Isfahan", nameFa: "اصفهان", count: Math.round(6 * scale) || 1 },
          { nameEn: "Shiraz", nameFa: "شیراز", count: Math.round(5 * scale) || 1 },
          { nameEn: "Other Cities", nameFa: "سایر شهرها", count: Math.round(16 * scale) || 1 }
        ]
      },
      martyrs: {
        today: Math.round(50 + (74 * scale)),
        womenChildren: Math.round(15 + (28 * scale)),
        womenChildrenPercent: Math.round(35 * scale) || 10,
        total: 46000 + Math.round(584 * scale),
        day: 512 + day
      }
    };
  }
  return daysData;
};

const mockDataByDay = generateMockData();

const sourcesData = [
  { en: "Reuters", fa: "رویترز (Reuters)" },
  { en: "Al Jazeera", fa: "الجزیره (Al Jazeera)" },
  { en: "BBC", fa: "بی‌بی‌سی (BBC)" },
  { en: "CNN", fa: "سی‌ان‌ان (CNN)" },
  { en: "France 24", fa: "فرانس ۲۴ (France 24)" },
  { en: "Sky News", fa: "اسکای نیوز (Sky News)" },
  { en: "NY Times", fa: "نیویورک تایمز (NY Times)" },
  { en: "The Guardian", fa: "گاردین (The Guardian)" }
];

// ==========================================
// 3. TRANSLATION DICTIONARY
// ==========================================
const dict = {
  en: {
    title: "Regional Conflict Analysis Dashboard",
    subtitle: "Daily monitoring of conflicts, energy markets, and Strait of Hormuz traffic",
    base: "Base",
    compareWith: "Compare with Feb 27",
    fireRange: "Fire Range in Region",
    energyStatus: "Energy Market Status",
    hormuzTraffic: "Hormuz Strait Traffic",
    newsSources: "News Sources & References",
    nightGatherings: "Night Gatherings Nationwide",
    martyrsStats: "Martyrs Statistics",
    severity: "Severity Level",
    critical: "Critical",
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
    statsRef: "Data collected based on public reports."
  },
  fa: {
    title: "داشبورد پایش تحولات منطقه",
    subtitle: "نمایش داده‌های روزانه درگیری، بازار انرژی و ترافیک تنگه هرمز",
    base: "پایه",
    compareWith: "مقایسه با ۹ اسفند",
    fireRange: "گستره آتش در منطقه",
    energyStatus: "وضعیت بازار انرژی",
    hormuzTraffic: "ترافیک تنگه هرمز",
    newsSources: "منابع و مراجع خبری",
    nightGatherings: "تجمعات شبانه کشور",
    martyrsStats: "آمار شهدا",
    severity: "سطح اهمیت:",
    critical: "بحرانی",
    medium: "متوسط",
    normal: "عادی",
    brentOil: "قیمت نفت برنت",
    lngGas: "قیمت گاز LNG",
    usGasoline: "بنزین آمریکا",
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
    statsRef: "داده‌ها بر اساس گزارش‌های عمومی جمع‌آوری شده‌اند."
  }
};

// ==========================================
// 4. SUB-COMPONENTS
// ==========================================

const Header = ({ lang, setLang, t, currentTime }) => {
  // Format Date & Time dynamically based on language (Gregorian vs Jalali)
  const formattedDate = currentTime.toLocaleDateString(lang === 'fa' ? 'fa-IR' : 'en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
  const formattedTime = currentTime.toLocaleTimeString(lang === 'fa' ? 'fa-IR' : 'en-US', {
    hour: '2-digit', minute: '2-digit', hour12: false
  });

  return (
    <header className="flex flex-col items-center justify-center pt-8 pb-6">
      <div className="flex bg-zinc-800 rounded-lg p-1 mb-6 gap-2">
        <button 
          onClick={() => setLang('fa')}
          className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${lang === 'fa' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-white'}`}
        >
          فارسی IR
        </button>
        <button 
          onClick={() => setLang('en')}
          className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${lang === 'en' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-white'}`}
        >
          GB English
        </button>
      </div>
      <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
        {t.title} <span className="text-xl">🇮🇷</span>
      </h1>
      <p className="text-zinc-400 text-sm mb-1">{t.subtitle}</p>
      <p className="text-zinc-500 text-xs flex gap-1 items-center" dir={lang === 'fa' ? 'rtl' : 'ltr'}>
        {formattedDate} • {lang === 'fa' ? 'ساعت' : 'Time'} {formattedTime}
      </p>
      <p className="text-zinc-600 text-[10px] mt-1">{t.statsRef}</p>
    </header>
  );
};

const KPICard = ({ title, value, base, change, isUp, t, prefix = "", suffix = "" }) => (
  <div className="bg-[#1e1e24] p-5 rounded-xl border border-zinc-800 flex flex-col justify-between h-32">
    <div className="flex justify-between items-start">
      <div>
        <h3 className="text-zinc-400 text-sm mb-1">{title}</h3>
        <p className="text-zinc-600 text-xs">{t.compareWith}</p>
      </div>
      <div className="w-8 h-8 rounded bg-blue-500/10 flex items-center justify-center">
        <div className="w-4 h-4 bg-blue-500 rounded-sm"></div>
      </div>
    </div>
    <div className="flex justify-between items-end mt-4">
      <div className="text-3xl font-bold text-white">
        {prefix}{value.toLocaleString()}{suffix}
      </div>
      <div className="flex flex-col items-end">
        <span className="text-zinc-500 text-xs mb-1">{t.base} {prefix}{base}</span>
        <span className={`text-sm flex items-center gap-1 ${isUp ? 'text-green-500' : 'text-red-500'}`}>
          {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {change}%
        </span>
      </div>
    </div>
  </div>
);

const FireRangeCard = ({ lang, t, data }) => (
  <div className="bg-[#1e1e24] p-5 rounded-xl border border-zinc-800 flex flex-col">
    <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
      <Flame className="text-red-500" size={18} /> {t.fireRange}
    </h2>
    <div className="bg-zinc-900 rounded-lg h-40 mb-4 relative overflow-hidden flex items-center justify-center border border-zinc-800">
      <span className="text-zinc-700">Map Visualization Placeholder</span>
    </div>
    <div className="flex-1 overflow-y-auto space-y-4 pr-2">
      {data.news.map((item) => (
        <div key={item.id} className="border-l-2 border-zinc-700 pl-3 rtl:border-r-2 rtl:border-l-0 rtl:pr-3 rtl:pl-0">
          <h4 className="text-zinc-200 text-sm font-medium mb-1">
            {lang === 'en' ? item.titleEn : item.titleFa}
          </h4>
          <div className="flex justify-between text-xs text-zinc-500">
            <span>{lang === 'en' ? item.sourceEn : item.sourceFa}</span>
            <span>{lang === 'en' ? item.timeEn : item.timeFa}</span>
          </div>
        </div>
      ))}
    </div>
    <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center gap-4 text-xs">
      <span className="text-zinc-500">{t.severity}</span>
      <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> <span className="text-zinc-400">{t.critical}</span></div>
      <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500"></span> <span className="text-zinc-400">{t.medium}</span></div>
      <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> <span className="text-zinc-400">{t.normal}</span></div>
    </div>
  </div>
);

const EnergyMarketCard = ({ lang, t, data }) => (
  <div className="bg-[#1e1e24] p-5 rounded-xl border border-zinc-800 flex flex-col">
    <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
      <BarChart3 className="text-yellow-500" size={18} /> {t.energyStatus}
    </h2>
    <div className="bg-zinc-900 rounded-lg h-40 mb-6 flex items-center justify-center border border-zinc-800">
       <span className="text-zinc-700">Line Chart Placeholder</span>
    </div>
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-zinc-800/50 p-3 rounded-lg">
        <div className="flex items-center gap-2 text-zinc-300 text-sm">
           <span className="text-red-500">⛽</span> {t.brentOil}
        </div>
        <div className="text-end">
          <div className="text-white font-bold">${data.energy.brent.price}</div>
          <div className="text-green-500 text-xs flex items-center justify-end gap-1"><TrendingUp size={12}/> {data.energy.brent.change}%</div>
        </div>
      </div>
      <div className="flex justify-between items-center bg-zinc-800/50 p-3 rounded-lg">
        <div className="flex items-center gap-2 text-zinc-300 text-sm">
           <span className="text-yellow-500">🔥</span> {t.lngGas}
        </div>
        <div className="text-end">
          <div className="text-white font-bold">${data.energy.lng.price}</div>
          <div className="text-green-500 text-xs flex items-center justify-end gap-1"><TrendingUp size={12}/> {data.energy.lng.change}%</div>
        </div>
      </div>
      <div className="flex justify-between items-center bg-zinc-800/50 p-3 rounded-lg">
        <div className="flex items-center gap-2 text-zinc-300 text-sm">
           <span className="text-blue-500">🛢️</span> {t.usGasoline}
        </div>
        <div className="text-end">
          <div className="text-white font-bold">${data.energy.gasoline.price}</div>
          <div className="text-green-500 text-xs flex items-center justify-end gap-1"><TrendingUp size={12}/> {data.energy.gasoline.change}%</div>
        </div>
      </div>
    </div>
  </div>
);

const TrafficCard = ({ lang, t, data }) => (
  <div className="bg-[#1e1e24] p-5 rounded-xl border border-zinc-800 flex flex-col">
    <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
      <Ship className="text-blue-500" size={18} /> {t.hormuzTraffic}
    </h2>
    <div className="bg-zinc-900 rounded-lg h-32 mb-6 flex items-center justify-center border border-zinc-800">
       <span className="text-zinc-700">World Map Placeholder</span>
    </div>
    <div className="space-y-4">
      <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2 text-zinc-300 text-sm">
           <Ship size={14} className="text-red-500" /> {t.tankersPassed}
        </div>
        <div className="text-end flex items-center gap-4">
          <div className="text-red-500 text-xs flex items-center gap-1"><TrendingDown size={12}/> {data.traffic.tankersPassed.change}%</div>
          <div className="text-white font-bold text-lg">{data.traffic.tankersPassed.current}</div>
        </div>
      </div>
      <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2 text-zinc-300 text-sm">
           <Ship size={14} className="text-blue-500" /> {t.tankersInTraffic}
        </div>
        <div className="text-white font-bold text-lg">{data.traffic.tankersInTraffic.current}</div>
      </div>
      <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2 text-zinc-300 text-sm">
           <Ship size={14} className="text-yellow-500" /> {t.cargoPassed}
        </div>
         <div className="text-end flex items-center gap-4">
          <div className="text-red-500 text-xs flex items-center gap-1"><TrendingDown size={12}/> {data.traffic.cargoPassed.change}%</div>
          <div className="text-white font-bold text-lg">{data.traffic.cargoPassed.current}</div>
        </div>
      </div>
       <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-zinc-300 text-sm">
           <Ship size={14} className="text-blue-300" /> {t.cargoInTraffic}
        </div>
        <div className="text-white font-bold text-lg">{data.traffic.cargoInTraffic.current}</div>
      </div>
    </div>
  </div>
);

const SmallCardsRow = ({ lang, t, data }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
    {/* News Sources */}
    <div className="bg-[#1e1e24] p-5 rounded-xl border border-zinc-800">
      <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
        <Newspaper className="text-blue-500" size={18} /> {t.newsSources}
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {sourcesData.map((src, i) => (
          <div key={i} className="bg-zinc-800/50 text-zinc-400 text-xs py-2 px-3 rounded-lg text-center border border-zinc-700/50">
            {lang === 'en' ? src.en : src.fa}
          </div>
        ))}
      </div>
    </div>

    {/* Gatherings */}
    <div className="bg-[#1e1e24] p-5 rounded-xl border border-zinc-800">
      <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
        <Radio className="text-yellow-500" size={18} /> {t.nightGatherings}
      </h2>
      <div className="flex justify-between items-end mb-6 pb-4 border-b border-zinc-800">
        <div>
           <p className="text-zinc-500 text-xs mb-1">{t.gatheringsToday}</p>
           <p className="text-zinc-600 text-[10px]">{t.base} 12</p>
        </div>
        <div className="text-end">
          <div className="text-2xl font-bold text-white mb-1 flex items-center justify-end gap-2">
             <AlertTriangle size={16} className="text-yellow-500"/> {data.gatherings.total}
          </div>
          <div className="text-green-500 text-xs flex items-center justify-end gap-1"><TrendingUp size={12}/> {data.gatherings.change}%</div>
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-zinc-500 text-xs mb-3">{t.majorCities}</p>
        {data.gatherings.cities.map((city, i) => (
          <div key={i} className="flex justify-between items-center text-sm">
            <span className="text-zinc-300">{lang === 'en' ? city.nameEn : city.nameFa}</span>
            <span className="text-white font-medium">{city.count}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Martyrs */}
    <div className="bg-[#1e1e24] p-5 rounded-xl border border-zinc-800 flex flex-col justify-between">
      <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
        <AlertTriangle className="text-red-500" size={18} /> {t.martStats || t.martyrsStats}
      </h2>
      <div className="bg-red-600 text-white p-4 rounded-xl flex justify-between items-center mb-4">
        <span className="font-medium text-sm">{t.totalMartyrsToday}</span>
        <span className="text-3xl font-bold">{data.martyrs.today}</span>
      </div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-zinc-300 text-sm">{t.womenChildren}</p>
          <p className="text-zinc-500 text-xs">{t.ofTotal}</p>
        </div>
        <div className="text-end">
           <div className="text-white font-bold text-xl">{data.martyrs.womenChildren}</div>
           <div className="text-yellow-500 text-xs">{data.martyrs.womenChildrenPercent}%</div>
        </div>
      </div>
      <div className="bg-zinc-900 border border-zinc-700 p-4 rounded-xl">
        <div className="flex justify-between items-center mb-2">
          <span className="text-zinc-400 text-sm">{t.totalMartyrsSince}</span>
          <span className="text-red-500 font-bold text-xl">{data.martyrs.total.toLocaleString()}</span>
        </div>
        <div className="w-full bg-zinc-800 rounded-full h-1 mt-2">
           <div className="bg-red-600 h-1 rounded-full" style={{ width: '100%' }}></div>
        </div>
        <div className="text-end text-zinc-600 text-[10px] mt-1">{t.day} {data.martyrs.day}</div>
      </div>
    </div>
  </div>
);

const Footer = ({ t, currentDay, setCurrentDay }) => {
  // Calculate width for the active blue bar inside the slider
  const sliderPercentage = ((currentDay - 1) / 8) * 100;

  return (
    <div className="mt-6 space-y-4">
      {/* Timeline Slider */}
      <div className="bg-[#1e1e24] p-4 rounded-xl border border-zinc-800 flex items-center gap-4">
        <button className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0 hover:bg-blue-500 transition-colors">
          <Play size={16} className="ml-1" />
        </button>
        <div className="flex-1 relative pt-6 pb-2 group">
          <div className="absolute top-0 left-0 text-red-500 text-xs font-medium">Feb 27, 2026</div>
          <div className="absolute top-0 right-0 text-green-500 text-xs font-medium">{t.today}</div>
          
          {/* Custom Range Input Container */}
          <div className="relative h-2 w-full rounded-full bg-zinc-800">
            
            {/* Filled blue track */}
            <div 
              className="absolute left-0 top-0 h-full bg-blue-600 rounded-full pointer-events-none transition-all duration-200"
              style={{ width: `${sliderPercentage}%` }}
            ></div>
            
            {/* The Invisible interactive slider */}
            <input 
              type="range" 
              min="1" 
              max="9" 
              value={currentDay}
              onChange={(e) => setCurrentDay(Number(e.target.value))}
              className="absolute w-full top-1/2 -translate-y-1/2 opacity-0 cursor-pointer z-20"
            />
            
            {/* Custom thumb visual */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-400 rounded-full border-2 border-zinc-900 pointer-events-none transition-all duration-200 shadow-[0_0_10px_rgba(96,165,250,0.5)]"
              style={{ left: `calc(${sliderPercentage}% - 8px)` }}
            ></div>
            
            {/* Floating Label */}
            <div 
              className="absolute -top-7 -translate-x-1/2 bg-zinc-800 text-zinc-300 text-[10px] px-2 py-1 rounded transition-all duration-200 pointer-events-none"
              style={{ left: `${sliderPercentage}%` }}
            >
              Day {currentDay}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="bg-[#1e1e24] p-4 rounded-xl border border-zinc-800 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-zinc-500 text-sm">{t.techUsed}</span>
          <div className="flex gap-2">
            <div className="w-8 h-4 rounded bg-cyan-400"></div>
            <div className="w-8 h-4 rounded bg-pink-400"></div>
            <div className="w-8 h-4 rounded bg-green-500"></div>
            <div className="w-8 h-4 rounded bg-emerald-600"></div>
            <div className="w-8 h-4 rounded bg-green-400"></div>
          </div>
        </div>
        <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors">
          <Download size={16} />
          {t.download}
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 5. MAIN DASHBOARD COMPONENT
// ==========================================
export default function RegionalDashboard() {
  const [lang, setLang] = useState('en');
  const [currentDay, setCurrentDay] = useState(9); // Default to Day 9
  const [currentTime, setCurrentTime] = useState(new Date());

  // Keep time updated every minute safely on client side
  useEffect(() => {
    setCurrentTime(new Date()); // Fixes hydration mismatch by setting immediately on mount
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const t = dict[lang];
  const direction = lang === 'fa' ? 'rtl' : 'ltr';
  const activeData = mockDataByDay[currentDay];

  return (
    <div 
      dir={direction} 
      className={`min-h-screen bg-[#121212] selection:bg-blue-500/30 text-zinc-100 p-4 md:p-8 ${lang === 'en' ? inter.className : vazirmatn.className}`}
    >
      <div className="max-w-7xl mx-auto">
        <Header lang={lang} setLang={setLang} t={t} currentTime={currentTime} />

        {/* Top KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <KPICard 
            title={t.brentOil} value={activeData.kpis.brent.value} base={activeData.kpis.brent.base} 
            change={activeData.kpis.brent.change} isUp={activeData.kpis.brent.isUp} t={t} prefix="$"
          />
          <KPICard 
            title={t.lngGas} value={activeData.kpis.lng.value} base={activeData.kpis.lng.base} 
            change={activeData.kpis.lng.change} isUp={activeData.kpis.lng.isUp} t={t} prefix="$"
          />
          <KPICard 
            title={t.hormuzTraffic} value={activeData.kpis.hormuz.value} base={activeData.kpis.hormuz.base} 
            change={activeData.kpis.hormuz.change} isUp={activeData.kpis.hormuz.isUp} t={t}
          />
          <KPICard 
            title={"TEU Index"} value={activeData.kpis.teu.value} base={activeData.kpis.teu.base} 
            change={activeData.kpis.teu.change} isUp={activeData.kpis.teu.isUp} t={t}
          />
        </div>

        {/* Middle Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <FireRangeCard lang={lang} t={t} data={activeData} />
          <EnergyMarketCard lang={lang} t={t} data={activeData} />
          <TrafficCard lang={lang} t={t} data={activeData} />
        </div>

        {/* Bottom Small Cards */}
        <SmallCardsRow lang={lang} t={t} data={activeData} />

        {/* Footer & Timeline */}
        <Footer t={t} currentDay={currentDay} setCurrentDay={setCurrentDay} />
      </div>
    </div>
  );
}