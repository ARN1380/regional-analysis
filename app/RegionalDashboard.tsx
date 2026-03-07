'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Inter, Vazirmatn } from 'next/font/google';
import dynamic from 'next/dynamic';
import { 
  TrendingUp, TrendingDown, Flame, BarChart3, Ship, 
  Quote, Megaphone, Image as ImageIcon, PlayCircle, 
  ChevronRight, ChevronLeft, Play, Pause, Download, Loader2,
  Droplet, Package
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer 
} from 'recharts';
import { toPng } from 'html-to-image';

import dashboardData from './data.json'; 

const DynamicMap = dynamic(() => import('./MapComponent'), { 
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center bg-zinc-900 text-zinc-600 text-sm">Loading Map...</div>
});

const inter = Inter({ subsets: ['latin'], display: 'swap' });
const vazirmatn = Vazirmatn({ subsets: ['arabic'], display: 'swap' });

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
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  const animatedValue = useAnimatedNumber(numValue);
  
  if (isFloat) return <>{animatedValue.toFixed(decimals)}</>;
  return <>{Math.round(animatedValue).toLocaleString()}</>;
};

const uiDictionary = {
  en: {
    title: "Ramadan War Dashboard",
    base: "Base",
    compareWith: "Vs Previous",
    fireRange: "Fire Range in Region",
    energyStatus: "Energy Market Fluctuations (%)",
    hormuzTraffic: "Hormuz Strait Traffic",
    quotes: "Reported Speeches",
    announcements: "Official Announcements",
    media: "Watch (Selected Media)",
    severity: "Level:",
    critical: "Critical",
    defensive: "Defensive",
    medium: "Medium",
    brentOil: "Brent Oil",
    lngGas: "LNG Gas",
    usGasoline: "US Gasoline",
    tankersPassed: "Tankers Passed",
    tankersInTraffic: "Tankers in Traffic",
    cargoPassed: "Cargo Ships Passed",
    cargoInTraffic: "Cargo Ships in Traffic",
    day: "Day",
    download: "Download Dashboard PNG",
    today: "Today",
    teuDesc: "1 TEU = 1 standard 20-foot cargo container",
    langToggle: "Persian",
    overlayTitle: "Preparing Image...",
    overlayDesc: "Please wait a moment"
  },
  fa: {
    title: "داشبورد جنگ رمضان",
    base: "پایه",
    compareWith: "مقایسه با روز قبل",
    fireRange: "گستره آتش در منطقه",
    energyStatus: "نوسانات بازار انرژی (درصد)",
    hormuzTraffic: "ترافیک تنگه هرمز",
    quotes: "نقل قول ها",
    announcements: "جنگ رمضان",
    media: "ببینید (عکس و فیلم منتخب)",
    severity: "سطح:",
    critical: "بحرانی",
    defensive: "پدافندی",
    medium: "متوسط",
    brentOil: "قیمت نفت برنت",
    lngGas: "قیمت گاز LNG",
    usGasoline: "بنزین آمریکا",
    tankersPassed: "نفتکش‌های عبوری",
    tankersInTraffic: "نفتکش در ترافیک",
    cargoPassed: "کشتی‌های باری عبوری",
    cargoInTraffic: "کشتی باری در ترافیک",
    day: "روز",
    download: "دریافت تصویر داشبورد",
    today: "امروز",
    teuDesc: "واحد استاندارد حمل بار (هر کانتینر ۲۰ فوتی یک TEU است)",
    langToggle: "English",
    overlayTitle: "در حال آماده‌سازی تصویر...",
    overlayDesc: "لطفا چند لحظه صبر کنید"
  }
};

const Header = ({ appLanguage, setAppLanguage, uiTranslations, currentTimeState }) => {
  const isPersian = appLanguage === 'fa';
  const formattedDate = currentTimeState.toLocaleDateString(isPersian ? 'fa-IR' : 'en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
  const formattedTime = currentTimeState.toLocaleTimeString(isPersian ? 'fa-IR' : 'en-US', {
    hour: '2-digit', minute: '2-digit', hour12: false
  });

  return (
    <header className="relative flex flex-col items-center justify-center pt-4 pb-10 w-full">
      <div className="absolute top-0 left-0 z-10 no-capture">
        <button 
          onClick={() => setAppLanguage(isPersian ? 'en' : 'fa')} 
          className="text-xs font-medium bg-[#345d9d]/10 border border-[#345d9d]/30 hover:bg-[#345d9d] text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg transition-all"
        >
          {uiTranslations.langToggle}
        </button>
      </div>

      <div className="absolute top-0 right-0 z-10 text-right">
        <p className="text-zinc-400 text-xs font-medium">{formattedDate}</p>
        <p className="text-[#ffb71b] text-sm font-bold tracking-widest mt-0.5" dir="ltr">{formattedTime}</p>
      </div>

      <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3 mt-12">
        {uiTranslations.title} <span>🇮🇷</span>
      </h1>
      
      <img 
        src="/farsnews_logo.svg" 
        alt="Fars News" 
        className="h-8 opacity-90 object-contain"
        crossOrigin="anonymous"
      />
    </header>
  );
};

const MetricCard = ({ title, value, isFloatValue = false, baseValue, percentageChange, isTrendingUp, uiTranslations, prefix = "", suffix = "", subtitle = "", Icon }) => (
  <div className="bg-[#1e1e24] p-5 rounded-xl border border-zinc-800 flex flex-col justify-between h-36 hover:border-zinc-700 transition-colors shadow-sm w-full">
    <div className="flex justify-between items-start">
      <div>
        <h3 className="text-zinc-400 text-xs font-medium mb-1">{title}</h3>
        {subtitle ? (
          <p className="text-zinc-500 text-[10px] leading-tight max-w-[200px] whitespace-normal">{subtitle}</p>
        ) : (
          <p className="text-zinc-500 text-[10px]">{uiTranslations.compareWith}</p>
        )}
      </div>
      <div className="w-8 h-8 rounded-lg bg-[#345d9d]/10 text-[#345d9d] flex items-center justify-center shrink-0 ml-2 rtl:mr-2 rtl:ml-0 border border-[#345d9d]/20">
        {Icon && <Icon size={16} />}
      </div>
    </div>
    <div className="flex justify-between items-end mt-4">
      <div className="flex flex-col">
        <span className="text-3xl font-bold text-white tracking-tight">
          {prefix}<AnimatedNumber value={value} isFloat={isFloatValue} />{suffix}
        </span>
        <div className={`text-[11px] mt-1 flex items-center gap-1 font-semibold ${isTrendingUp ? 'text-green-500' : 'text-red-500'}`}>
          {isTrendingUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          <AnimatedNumber value={percentageChange} isFloat={true} />%
        </div>
      </div>
      <div className="text-end">
        <span className="text-zinc-600 text-[10px] block mb-0.5">{uiTranslations.base}</span>
        <span className="text-zinc-400 text-xs font-medium">{prefix}{baseValue}{suffix}</span>
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
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [activeNewsId]);

  return (
    <div className="bg-[#1e1e24] p-5 rounded-xl border border-zinc-800 flex flex-col h-full">
      <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
        <Flame className="text-[#ffb71b]" size={18} /> {uiTranslations.fireRange}
      </h2>
      <div className="bg-zinc-900 rounded-lg h-56 mb-4 shrink-0 relative overflow-hidden border border-zinc-800 z-0">
        <DynamicMap locations={dailyMetrics.locations || []} newsList={dailyMetrics.news || []} activeNewsId={activeNewsId} setActiveNewsId={setActiveNewsId} appLanguage={appLanguage} />
      </div>
      
      <div 
        ref={scrollContainerRef} 
        className="hide-scroll-for-print flex-1 overflow-y-auto overflow-x-hidden max-h-52 space-y-2 pr-2 rtl:pr-0 rtl:pl-2 
          [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-700 
          [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-zinc-500 transition-colors"
      >
        {dailyMetrics.news.map((newsItem) => {
          const isActive = activeNewsId === newsItem.id;
          return (
            <div 
              key={newsItem.id} 
              id={`news-item-${newsItem.id}`}
              onClick={() => setActiveNewsId(isActive ? null : newsItem.id)}
              className={`border-l-2 pl-3 rtl:border-r-2 rtl:border-l-0 rtl:pr-3 rtl:pl-0 cursor-pointer p-2 transition-all rounded-r-lg rtl:rounded-l-lg rtl:rounded-r-none ${isActive ? 'border-[#ffb71b] bg-[#345d9d]/20 shadow-md' : 'border-zinc-700 hover:border-[#345d9d]/50 hover:bg-zinc-800/30'}`}
            >
              <h4 className={`text-sm font-medium mb-1 leading-snug transition-colors ${isActive ? 'text-white' : 'text-zinc-300'}`}>{appLanguage === 'en' ? newsItem.titleEn : newsItem.titleFa}</h4>
              <div className="flex justify-between text-xs text-zinc-500">
                <span>{appLanguage === 'en' ? newsItem.sourceEn : newsItem.sourceFa}</span>
                <span className="text-[#ffb71b]">{appLanguage === 'en' ? newsItem.timeEn : newsItem.timeFa}</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 pt-4 shrink-0 border-t border-zinc-800 flex items-center gap-4 text-xs">
        <span className="text-zinc-500">{uiTranslations.severity}</span>
        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> <span className="text-zinc-400">{uiTranslations.critical}</span></div>
        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> <span className="text-zinc-400">{uiTranslations.defensive}</span></div>
        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#ffb71b]"></span> <span className="text-zinc-400">{uiTranslations.medium}</span></div>
      </div>
    </div>
  );
};

const EnergyMarketCard = ({ appLanguage, uiTranslations, dailyMetrics, chartData, isDownloading }) => {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-900 border border-zinc-700 p-3 rounded-lg shadow-xl text-xs" dir={appLanguage === 'fa' ? 'rtl' : 'ltr'}>
          <p className="text-zinc-300 font-semibold mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="flex justify-between gap-6 py-0.5 font-medium">
              <span>{entry.dataKey === 'brent' && uiTranslations.brentOil}{entry.dataKey === 'lng' && uiTranslations.lngGas}{entry.dataKey === 'gasoline' && uiTranslations.usGasoline}</span>
              <span>{entry.value > 0 ? '+' : ''}{entry.value}%</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#1e1e24] p-5 rounded-xl border border-zinc-800 flex flex-col h-full">
      <h2 className="text-white font-semibold mb-4 flex items-center gap-2"><BarChart3 className="text-[#345d9d]" size={18} /> {uiTranslations.energyStatus}</h2>
      
      <div className="bg-zinc-900/50 rounded-lg h-56 mb-6 shrink-0 border border-zinc-800/80 pt-4 pr-4 pb-2" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
            <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} tickMargin={10} />
            <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} domain={['auto', 'auto']} tickFormatter={(val) => `${val}%`} />
            <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: '#52525b', strokeWidth: 1, strokeDasharray: '4 4' }} />
            <Line isAnimationActive={!isDownloading} type="monotone" dataKey="brent" stroke="#ffb71b" strokeWidth={2} dot={{ r: 3, fill: '#ffb71b', strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 0 }} />
            <Line isAnimationActive={!isDownloading} type="monotone" dataKey="lng" stroke="#345d9d" strokeWidth={2} dot={{ r: 3, fill: '#345d9d', strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 0 }} />
            <Line isAnimationActive={!isDownloading} type="monotone" dataKey="gasoline" stroke="#ef4444" strokeWidth={2} dot={{ r: 3, fill: '#ef4444', strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 0 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-4 flex-1">
        <div className="flex justify-between items-center bg-zinc-800/40 hover:bg-zinc-800/80 transition-colors p-3 rounded-lg">
          <div className="flex items-center gap-2 text-zinc-300 text-sm"><span className="text-[#ffb71b]">⛽</span> {uiTranslations.brentOil}</div>
          <div className="text-end">
            <div className="text-white font-bold">$<AnimatedNumber value={dailyMetrics.energy.brent.price} isFloat={false} /></div>
            <div className="text-green-500 text-xs flex items-center justify-end gap-1"><TrendingUp size={12}/> <AnimatedNumber value={dailyMetrics.energy.brent.change} isFloat={true} />%</div>
          </div>
        </div>
        <div className="flex justify-between items-center bg-zinc-800/40 hover:bg-zinc-800/80 transition-colors p-3 rounded-lg">
          <div className="flex items-center gap-2 text-zinc-300 text-sm"><span className="text-[#345d9d]">🔥</span> {uiTranslations.lngGas}</div>
          <div className="text-end">
            <div className="text-white font-bold">$<AnimatedNumber value={dailyMetrics.energy.lng.price} isFloat={true} /></div>
            <div className="text-green-500 text-xs flex items-center justify-end gap-1"><TrendingUp size={12}/> <AnimatedNumber value={dailyMetrics.energy.lng.change} isFloat={true} />%</div>
          </div>
        </div>
        <div className="flex justify-between items-center bg-zinc-800/40 hover:bg-zinc-800/80 transition-colors p-3 rounded-lg">
          <div className="flex items-center gap-2 text-zinc-300 text-sm"><span className="text-red-500">🛢️</span> {uiTranslations.usGasoline}</div>
          <div className="text-end">
            <div className="text-white font-bold">$<AnimatedNumber value={dailyMetrics.energy.gasoline.price} isFloat={true} /></div>
            <div className={`text-xs flex items-center justify-end gap-1 ${parseFloat(dailyMetrics.energy.gasoline.change) >= 0 ? 'text-green-500' : 'text-red-500'}`}>{parseFloat(dailyMetrics.energy.gasoline.change) >= 0 ? <TrendingUp size={12}/> : <TrendingDown size={12}/>} <AnimatedNumber value={Math.abs(parseFloat(dailyMetrics.energy.gasoline.change))} isFloat={true} />%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MarineTrafficCard = ({ uiTranslations, dailyMetrics }) => (
  <div className="bg-[#1e1e24] p-5 rounded-xl border border-zinc-800 flex flex-col h-full">
    <h2 className="text-white font-semibold mb-4 flex items-center gap-2"><Ship className="text-[#345d9d]" size={18} /> {uiTranslations.hormuzTraffic}</h2>
    <div className="bg-zinc-900 rounded-lg h-56 mb-6 shrink-0 relative overflow-hidden border border-zinc-800 z-0 flex items-center justify-center">
       <img src="/marine-map.png" crossOrigin="anonymous" alt="Strait of Hormuz Traffic" className="w-full h-full object-cover opacity-80 grayscale-[20%]" />
       <div className="absolute inset-0 bg-gradient-to-t from-[#1e1e24] via-transparent to-transparent pointer-events-none"></div>
    </div>
    <div className="space-y-4 flex-1 px-2">
      <div className="flex justify-between items-center border-b border-zinc-800/50 pb-3"><div className="flex items-center gap-2 text-zinc-300 text-sm"><Ship size={14} className="text-red-500" /> {uiTranslations.tankersPassed}</div><div className="text-end flex items-center gap-4"><div className="text-red-500 text-xs flex items-center gap-1"><TrendingDown size={12}/> <AnimatedNumber value={Math.abs(dailyMetrics.traffic.tankersPassed.change)} />%</div><div className="text-white font-bold text-lg"><AnimatedNumber value={dailyMetrics.traffic.tankersPassed.current} /></div></div></div>
      <div className="flex justify-between items-center border-b border-zinc-800/50 pb-3"><div className="flex items-center gap-2 text-zinc-300 text-sm"><Ship size={14} className="text-[#345d9d]" /> {uiTranslations.tankersInTraffic}</div><div className="text-white font-bold text-lg"><AnimatedNumber value={dailyMetrics.traffic.tankersInTraffic.current} /></div></div>
      <div className="flex justify-between items-center border-b border-zinc-800/50 pb-3"><div className="flex items-center gap-2 text-zinc-300 text-sm"><Ship size={14} className="text-[#ffb71b]" /> {uiTranslations.cargoPassed}</div><div className="text-end flex items-center gap-4"><div className="text-red-500 text-xs flex items-center gap-1"><TrendingDown size={12}/> <AnimatedNumber value={Math.abs(dailyMetrics.traffic.cargoPassed.change)} />%</div><div className="text-white font-bold text-lg"><AnimatedNumber value={dailyMetrics.traffic.cargoPassed.current} /></div></div></div>
       <div className="flex justify-between items-center"><div className="flex items-center gap-2 text-zinc-300 text-sm"><Ship size={14} className="text-[#345d9d]/60" /> {uiTranslations.cargoInTraffic}</div><div className="text-white font-bold text-lg"><AnimatedNumber value={dailyMetrics.traffic.cargoInTraffic.current} /></div></div>
    </div>
  </div>
);

const DashboardBottomRow = ({ appLanguage, uiTranslations, dailyMetrics, isCapturing }) => {
  const isEn = appLanguage === 'en';
  
  const quotes = dailyMetrics.quotes || [];
  const announcements = dailyMetrics.announcements || [];
  const media = dailyMetrics.media || [];

  const [quoteIdx, setQuoteIdx] = useState(0);
  const [mediaIdx, setMediaIdx] = useState(0);
  const [openAnn, setOpenAnn] = useState(0); 

  useEffect(() => {
    setQuoteIdx(0);
    setMediaIdx(0);
    setOpenAnn(0);
  }, [dailyMetrics]);

  const nextQuote = () => setQuoteIdx((i) => (i + 1) % quotes.length);
  const prevQuote = () => setQuoteIdx((i) => (i - 1 + quotes.length) % quotes.length);
  const nextMedia = () => setMediaIdx((i) => (i + 1) % media.length);
  const prevMedia = () => setMediaIdx((i) => (i - 1 + media.length) % media.length);

  return (
    <div className={`gap-6 mt-6 ${isCapturing ? 'grid grid-cols-3' : 'grid grid-cols-1 md:grid-cols-3'}`}>
      
      {/* 1. Quotes Slider */}
      <div className="bg-[#1e1e24] p-5 rounded-xl border border-zinc-800 flex flex-col h-[350px]">
        <h2 className="text-white font-semibold mb-4 flex items-center gap-2"><Quote className="text-[#ffb71b]" size={18} /> {uiTranslations.quotes}</h2>
        {quotes.length > 0 ? (
          <>
            <div className="flex-1 flex flex-col justify-center items-center text-center relative px-6">
              <Quote className="absolute top-0 opacity-10 text-[#345d9d] w-16 h-16" />
              <p className="text-zinc-200 font-medium text-sm leading-relaxed z-10 italic">
                "{isEn ? quotes[quoteIdx].textEn : quotes[quoteIdx].textFa}"
              </p>
              <div className="mt-4 z-10">
                <span className="bg-[#345d9d]/20 text-[#ffb71b] px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                  {isEn ? quotes[quoteIdx].authorEn : quotes[quoteIdx].authorFa}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center mt-4 border-t border-zinc-800/50 pt-3" dir="ltr">
              <button onClick={prevQuote} className="p-2 bg-zinc-800 hover:bg-[#345d9d] text-zinc-400 hover:text-white rounded-full transition-colors"><ChevronLeft size={16}/></button>
              <div className="flex gap-1.5">{quotes.map((_, i) => (<div key={i} className={`h-1.5 rounded-full transition-all ${i === quoteIdx ? 'w-4 bg-[#ffb71b]' : 'w-1.5 bg-zinc-700'}`} />))}</div>
              <button onClick={nextQuote} className="p-2 bg-zinc-800 hover:bg-[#345d9d] text-zinc-400 hover:text-white rounded-full transition-colors"><ChevronRight size={16}/></button>
            </div>
          </>
        ) : (<div className="flex-1 flex items-center justify-center text-zinc-600 text-xs">No quotes recorded</div>)}
      </div>

      {/* 2. Official Announcements */}
      <div className="bg-[#1e1e24] p-5 rounded-xl border border-zinc-800 flex flex-col h-[350px]">
        <h2 className="text-white font-semibold mb-4 flex items-center gap-2"><Megaphone className="text-[#345d9d]" size={18} /> {uiTranslations.announcements}</h2>
        <div className="hide-scroll-for-print flex-1 overflow-y-auto overflow-x-hidden space-y-2 pr-2 rtl:pr-0 rtl:pl-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-700 hover:[&::-webkit-scrollbar-thumb]:bg-zinc-500">
          {announcements.length > 0 ? announcements.map((ann, i) => {
            const isOpen = openAnn === i;
            return (
              <div key={i} onClick={() => setOpenAnn(isOpen ? null : i)} className="bg-zinc-800/30 border border-zinc-700/50 hover:border-[#345d9d]/50 hover:bg-zinc-800/60 rounded-xl p-3 transition-all cursor-pointer">
                <div className="flex justify-between items-start">
                  <h4 className="text-zinc-200 text-xs font-semibold leading-snug">{isEn ? ann.titleEn : ann.titleFa}</h4>
                  <p className="text-[#ffb71b] text-[10px] font-medium shrink-0 ml-2">{isEn ? ann.timeEn : ann.timeFa}</p>
                </div>
                {isOpen && (<p className="mt-3 text-[11px] text-zinc-400 leading-relaxed border-t border-zinc-700/50 pt-2">{isEn ? ann.textEn : ann.textFa}</p>)}
              </div>
            )
          }) : <div className="text-center text-zinc-600 text-xs mt-10">No announcements</div>}
        </div>
      </div>

      {/* 3. Media Slider */}
      <div className="bg-[#1e1e24] p-5 rounded-xl border border-zinc-800 flex flex-col h-[350px]">
        <h2 className="text-white font-semibold mb-4 flex items-center gap-2"><ImageIcon className="text-[#ffb71b]" size={18} /> {uiTranslations.media}</h2>
        {media.length > 0 ? (
          <>
            <a href={media[mediaIdx].link} target="_blank" rel="noopener noreferrer" className="flex-1 bg-zinc-900 rounded-xl relative overflow-hidden border border-zinc-800 group block cursor-pointer">
              <img src={media[mediaIdx].url} crossOrigin="anonymous" alt="media" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
              <div className="absolute inset-0 flex items-center justify-center text-white/70 group-hover:text-white transition-colors">
                {media[mediaIdx].type === 'video' ? <PlayCircle size={48} className="drop-shadow-lg" /> : <ImageIcon size={32} className="opacity-0 group-hover:opacity-50 transition-opacity" />}
              </div>
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#121212] via-black/80 to-transparent pt-12 pb-3 px-4 text-center">
                <p className="text-white text-xs font-medium leading-tight">{isEn ? media[mediaIdx].captionEn : media[mediaIdx].captionFa}</p>
              </div>
            </a>
            <div className="flex justify-between items-center mt-4 border-t border-zinc-800/50 pt-3" dir="ltr">
              <button onClick={prevMedia} className="p-2 bg-zinc-800 hover:bg-[#ffb71b] text-zinc-400 hover:text-black rounded-full transition-colors"><ChevronLeft size={16}/></button>
              <div className="flex gap-1.5">{media.map((_, i) => (<div key={i} className={`h-1.5 rounded-full transition-all ${i === mediaIdx ? 'w-4 bg-[#345d9d]' : 'w-1.5 bg-zinc-700'}`} />))}</div>
              <button onClick={nextMedia} className="p-2 bg-zinc-800 hover:bg-[#ffb71b] text-zinc-400 hover:text-black rounded-full transition-colors"><ChevronRight size={16}/></button>
            </div>
          </>
        ) : (<div className="flex-1 flex items-center justify-center text-zinc-600 text-xs">No media available</div>)}
      </div>
    </div>
  );
};

const TimelineFooter = ({ appLanguage, uiTranslations, selectedDay, setSelectedDay, isPlaying, togglePlay, handleDownload, isDownloading, totalDays }) => {
  const sliderPercentage = ((selectedDay - 1) / Math.max(1, totalDays - 1)) * 100;
  const isRtl = appLanguage === 'fa';
  const sliderPositioning = isRtl ? 'right' : 'left';

  return (
    <div className="mt-6 space-y-4">
      <div className="bg-[#1e1e24] p-4 rounded-xl border border-zinc-800 flex items-center gap-5">
        <button onClick={togglePlay} className="w-10 h-10 rounded-full bg-[#345d9d] flex items-center justify-center text-white shrink-0 hover:bg-[#345d9d]/80 hover:scale-105 transition-all shadow-lg shadow-[#345d9d]/20">
          {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
        </button>
        <div className="flex-1 relative pt-6 pb-2 group">
          <div className="absolute top-0 start-0 text-zinc-500 text-xs font-medium">Start</div>
          <div className="absolute top-0 end-0 text-green-500 text-xs font-medium">{uiTranslations.today}</div>
          <div className="relative h-2 w-full rounded-full bg-zinc-800 overflow-visible">
            <div className="absolute top-0 h-full bg-[#345d9d] rounded-full pointer-events-none transition-all duration-200 ease-out" style={{ [sliderPositioning]: 0, width: `${sliderPercentage}%` }} />
            <input type="range" min="1" max={totalDays} value={selectedDay} onChange={(e) => { if (isPlaying) togglePlay(); setSelectedDay(Number(e.target.value)); }} className="absolute w-full top-1/2 -translate-y-1/2 opacity-0 cursor-pointer z-20 h-6" dir={isRtl ? 'rtl' : 'ltr'} />
            <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-[#ffb71b] rounded-full border-2 border-[#1e1e24] pointer-events-none transition-all duration-200 ease-out shadow-[0_0_10px_rgba(255,183,27,0.5)]" style={{ [sliderPositioning]: `calc(${sliderPercentage}% - 8px)` }} />
            <div className={`absolute -top-8 bg-zinc-800 text-zinc-200 text-[10px] font-bold px-2 py-1 rounded transition-all duration-300 ease-out pointer-events-none border border-zinc-700 ${selectedDay === totalDays ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`} style={{ [sliderPositioning]: `${sliderPercentage}%`, transform: isRtl ? 'translateX(50%)' : 'translateX(-50%)' }}>
              {uiTranslations.day} {selectedDay}
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-[#1e1e24] p-4 rounded-xl border border-zinc-800 flex justify-end items-center no-capture">
        <button onClick={handleDownload} disabled={isDownloading} className={`bg-[#345d9d] text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${isDownloading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-[#345d9d]/80 hover:shadow-lg active:scale-95'}`}>
          {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          {isDownloading ? (appLanguage === 'fa' ? 'در حال پردازش...' : 'Downloading...') : uiTranslations.download}
        </button>
      </div>
    </div>
  );
};

// Dynamically read total days
const TOTAL_DAYS_IN_DATA = dashboardData.days.length;

export default function RegionalDashboard() {
  const [appLanguage, setAppLanguage] = useState('fa'); 
  const [selectedDay, setSelectedDay] = useState(TOTAL_DAYS_IN_DATA); 
  const [currentTimeState, setCurrentTimeState] = useState(new Date());
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeNewsId, setActiveNewsId] = useState(null); 
  
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false); 
  
  const dashboardRef = useRef(null);

  useEffect(() => { 
    const timer = setInterval(() => setCurrentTimeState(new Date()), 1000); 
    return () => clearInterval(timer); 
  }, []);
  
  useEffect(() => { 
    let playInterval; 
    if (isPlaying) { 
      playInterval = setInterval(() => { 
        setSelectedDay((prevDay) => { 
          if (prevDay >= TOTAL_DAYS_IN_DATA) { setIsPlaying(false); return TOTAL_DAYS_IN_DATA; } 
          return prevDay + 1; 
        }); 
      }, 2000); 
    } 
    return () => { if (playInterval) clearInterval(playInterval); }; 
  }, [isPlaying]);
  
  useEffect(() => { setActiveNewsId(null); }, [selectedDay]);
  
  const togglePlay = () => { 
    if (selectedDay === TOTAL_DAYS_IN_DATA && !isPlaying) setSelectedDay(1); 
    setIsPlaying(!isPlaying); 
  };
  
  const screenshotFilter = (node) => {
    const exclusionClasses = ['no-capture'];
    if (node.classList && typeof node.classList.contains === 'function') {
      return !exclusionClasses.some((classname) => node.classList.contains(classname));
    }
    return true;
  };

  const handleDownload = async () => { 
    if (!dashboardRef.current) return; 
    
    setIsDownloading(true);
    setIsCapturing(true); // Triggers the visual overlay and forces desktop dimensions

    // Save scroll position and instantly move to top to prevent browser viewport clipping
    const originalScrollY = window.scrollY;
    window.scrollTo(0, 0);

    // Completely disable all body clipping mechanisms just for the capture moment
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'visible';
    document.documentElement.style.overflow = 'visible';

    const scrollContainers = document.querySelectorAll('.hide-scroll-for-print');
    scrollContainers.forEach(el => el.style.overflow = 'hidden');

    // Wait for the DOM to physically scale to 1280px and Recharts to redraw
    await new Promise(resolve => setTimeout(resolve, 800));

    try { 
      const el = dashboardRef.current;
      
      const captureWidth = 1280;
      const captureHeight = el.scrollHeight;

      const dataUrl = await toPng(el, { 
        quality: 1, 
        backgroundColor: '#121212',
        filter: screenshotFilter,
        useCORS: true, 
        imagePlaceholder: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
        width: captureWidth, // Force the canvas to explicitly be 1280 wide
        height: captureHeight, // Force the canvas to explicitly capture the entire height
        style: {
          width: `${captureWidth}px`,
          height: `${captureHeight}px`,
          margin: '0',
          position: 'relative'
        }
      }); 
      
      const link = document.createElement('a'); 
      link.download = `ramadan-war-day-${selectedDay}.png`; 
      link.href = dataUrl; 
      link.click(); 
    } catch (err) { 
      console.error("Failed to generate image.", err); 
      alert("Failed to create screenshot. Some external resources may be blocking the capture.");
    } finally { 
      scrollContainers.forEach(el => {
        el.style.overflow = '';
        el.style.overflowX = 'hidden';
        el.style.overflowY = 'auto';
      });
      
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;

      setIsCapturing(false); // Remove overlay and restore mobile layout
      setIsDownloading(false); 
      window.scrollTo(0, originalScrollY);
    } 
  };
  
  const uiTranslations = uiDictionary[appLanguage];
  const layoutDirection = appLanguage === 'fa' ? 'rtl' : 'ltr';
  // Note: SelectedDay is 1-indexed, array is 0-indexed
  const dailyMetrics = dashboardData.days[selectedDay - 1];
  
  const energyChartData = useMemo(() => { 
    const data = []; 
    for (let i = 1; i <= selectedDay; i++) { 
      const historicalDay = dashboardData.days[i - 1]; 
      if (historicalDay) { 
        data.push({ 
          name: appLanguage === 'en' ? `Day ${i}` : `روز ${i}`, 
          brent: parseFloat(historicalDay.energy.brent.change), 
          lng: parseFloat(historicalDay.energy.lng.change), 
          gasoline: parseFloat(historicalDay.energy.gasoline.change) 
        }); 
      } 
    } 
    return data; 
  }, [selectedDay, appLanguage]);
  
  if (!dailyMetrics) return <div className="p-8 text-white flex justify-center items-center min-h-screen">Initializing Strategic Systems...</div>;

  return (
    <>
      {/* Blurred Overlay: Completely hides the jarring desktop layout shift from the user */}
      {isCapturing && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#121212]/80 backdrop-blur-md no-capture">
          <Loader2 size={48} className="animate-spin text-[#ffb71b] mb-4" />
          <h2 className="text-white font-bold text-xl tracking-widest">{uiTranslations.overlayTitle}</h2>
          <p className="text-zinc-400 text-sm mt-2">{uiTranslations.overlayDesc}</p>
        </div>
      )}

      <div dir={layoutDirection} className={`${isCapturing ? 'bg-[#121212]' : 'min-h-screen bg-[#121212]'} selection:bg-[#345d9d]/30 text-zinc-100 ${appLanguage === 'en' ? inter.className : vazirmatn.className}`}>
        
        {/* Main Wrapper: If isCapturing is true, it forcibly injects explicit dimensions to guarantee zero cropping */}
        <div ref={dashboardRef} className={isCapturing ? 'w-[1280px] p-8 mx-auto bg-[#121212]' : 'w-full max-w-7xl mx-auto p-4 md:p-8 bg-[#121212]'}>
          
          <Header appLanguage={appLanguage} setAppLanguage={setAppLanguage} uiTranslations={uiTranslations} currentTimeState={currentTimeState} />
          
          {/* Top KPI Cards: Dynamic grid mapping */}
          <div className={isCapturing 
            ? "grid grid-cols-4 gap-6 mb-6" 
            : "flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-4 px-4 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-6 mb-6 md:pb-0 md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          }>
            <div className={isCapturing ? "w-full" : "w-[75vw] sm:w-[45vw] shrink-0 snap-center md:w-auto md:shrink"}>
              <MetricCard title={uiTranslations.brentOil} value={dailyMetrics.kpis.brent.value} isFloatValue={true} baseValue={dailyMetrics.kpis.brent.base} percentageChange={dailyMetrics.kpis.brent.change} isTrendingUp={dailyMetrics.kpis.brent.isUp} uiTranslations={uiTranslations} prefix="$" Icon={Droplet} />
            </div>
            <div className={isCapturing ? "w-full" : "w-[75vw] sm:w-[45vw] shrink-0 snap-center md:w-auto md:shrink"}>
              <MetricCard title={uiTranslations.lngGas} value={dailyMetrics.kpis.lng.value} isFloatValue={true} baseValue={dailyMetrics.kpis.lng.base} percentageChange={dailyMetrics.kpis.lng.change} isTrendingUp={dailyMetrics.kpis.lng.isUp} uiTranslations={uiTranslations} prefix="$" Icon={Flame} />
            </div>
            <div className={isCapturing ? "w-full" : "w-[75vw] sm:w-[45vw] shrink-0 snap-center md:w-auto md:shrink"}>
              <MetricCard title={uiTranslations.hormuzTraffic} value={dailyMetrics.kpis.hormuz.value} isFloatValue={false} baseValue={dailyMetrics.kpis.hormuz.base} percentageChange={dailyMetrics.kpis.hormuz.change} isTrendingUp={dailyMetrics.kpis.hormuz.isUp} uiTranslations={uiTranslations} Icon={Ship} />
            </div>
            <div className={isCapturing ? "w-full" : "w-[75vw] sm:w-[45vw] shrink-0 snap-center md:w-auto md:shrink"}>
              <MetricCard title={"TEU Index"} subtitle={uiTranslations.teuDesc} value={dailyMetrics.kpis.teu.value} isFloatValue={false} baseValue={dailyMetrics.kpis.teu.base} percentageChange={dailyMetrics.kpis.teu.change} isTrendingUp={dailyMetrics.kpis.teu.isUp} uiTranslations={uiTranslations} Icon={Package} />
            </div>
          </div>

          <div className={`gap-6 ${isCapturing ? 'grid grid-cols-3' : 'grid grid-cols-1 lg:grid-cols-3'}`}>
            <IncidentMapCard appLanguage={appLanguage} uiTranslations={uiTranslations} dailyMetrics={dailyMetrics} activeNewsId={activeNewsId} setActiveNewsId={setActiveNewsId} />
            <EnergyMarketCard appLanguage={appLanguage} uiTranslations={uiTranslations} dailyMetrics={dailyMetrics} chartData={energyChartData} isDownloading={isDownloading} />
            <MarineTrafficCard uiTranslations={uiTranslations} dailyMetrics={dailyMetrics} />
          </div>
          
          <DashboardBottomRow appLanguage={appLanguage} uiTranslations={uiTranslations} dailyMetrics={dailyMetrics} isCapturing={isCapturing} />
          
          <TimelineFooter appLanguage={appLanguage} uiTranslations={uiTranslations} selectedDay={selectedDay} setSelectedDay={setSelectedDay} isPlaying={isPlaying} togglePlay={togglePlay} handleDownload={handleDownload} isDownloading={isDownloading} totalDays={TOTAL_DAYS_IN_DATA} />
        </div>
      </div>
    </>
  );
}