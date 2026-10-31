import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Plus, Check, Sparkles, QrCode } from "lucide-react";
import paneerImg from "@/assets/food-paneer.jpg";
import dosaImg from "@/assets/food-dosa.jpg";
import lassiImg from "@/assets/food-lassi.jpg";
import gulabImg from "@/assets/food-gulab.jpg";
import qrStandPhoto from "@/assets/step-qr-stand.jpg";

export function HeroPhoneMockup() {
  const [activeCategory, setActiveCategory] = useState("Starters");
  const [addedItems, setAddedItems] = useState<Record<string, number>>({});

  const toggleItem = (name: string) => {
    setAddedItems((prev) => ({
      ...prev,
      [name]: (prev[name] || 0) + 1,
    }));
  };

  const totalCount = Object.values(addedItems).reduce((a, b) => a + b, 0);

  return (
    <div className="relative mx-auto w-full max-w-xl lg:max-w-none flex flex-col items-center mt-6 lg:mt-0">
      {/* Playful Handwritten Arrow & Note */}
      <div className="flex items-center gap-2 self-start ml-4 sm:ml-8 lg:ml-12 mb-2 -rotate-3 z-20">
        <span className="font-handwriting text-xl sm:text-3xl text-amber-200 tracking-wider drop-shadow-md">
          Your Menu On Their Phone
        </span>
        {/* Curled Doodle Arrow pointing to phone */}
        <svg
          className="w-10 sm:w-16 h-7 sm:h-10 text-amber-300 drop-shadow -scale-x-100 rotate-12"
          viewBox="0 0 100 60"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
        >
          <path d="M10 15 C 40 5, 70 10, 85 45" />
          <path d="M72 42 L 85 45 L 88 32" />
        </svg>
      </div>

      <div className="relative flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-7 w-full">
        {/* 1. Realistic Smartphone Mockup */}
        <div className="relative w-[265px] sm:w-[300px] rounded-[38px] sm:rounded-[42px] p-2.5 sm:p-3 bg-stone-900 border-[3px] sm:border-[3.5px] border-stone-700/80 shadow-2xl shadow-black/80 ring-1 ring-white/20 transition-transform duration-500 hover:scale-[1.01]">
          {/* Outer edge subtle metallic highlights */}
          <div className="absolute -inset-0.5 rounded-[44px] bg-gradient-to-b from-white/20 via-transparent to-black/60 pointer-events-none -z-10" />

          {/* Screen Container */}
          <div className="relative w-full overflow-hidden rounded-[32px] bg-stone-950 text-white select-none shadow-inner border border-stone-800">
            {/* Status Bar & Dynamic Island */}
            <div className="relative flex items-center justify-between px-5 pt-3 pb-2 text-[11px] font-semibold text-stone-300">
              <span>9:41</span>
              {/* Dynamic Island */}
              <div className="h-4.5 w-20 rounded-full bg-black border border-stone-800 flex items-center justify-end px-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="flex items-center gap-1.5 text-[10px]">
                <span>5G</span>
                <span className="h-2 w-3.5 rounded-xs border border-current flex items-center justify-end p-0.5">
                  <span className="h-1 w-2 bg-current rounded-xs" />
                </span>
              </div>
            </div>

            {/* In-app Restaurant Banner */}
            <div className="relative h-24 overflow-hidden bg-gradient-to-t from-stone-950 via-stone-900/90 to-transparent">
              <img
                src={paneerImg}
                alt="Riverside Café"
                className="absolute inset-0 h-full w-full object-cover opacity-40 brightness-75 scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />
              <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between">
                <div>
                  <h4 className="font-display text-base font-extrabold text-white flex items-center gap-1.5">
                    Riverside Café
                    <span className="inline-flex items-center text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded-full font-semibold border border-amber-500/30">
                      ★ 4.8
                    </span>
                  </h4>
                  <p className="text-[11px] text-stone-400">Great Food, Cozy Mood • Table 14</p>
                </div>
              </div>
            </div>

            {/* Menu Category Pills */}
            <div className="flex gap-1.5 px-3 py-2 border-b border-stone-800/80 bg-stone-900/60 overflow-x-auto no-scrollbar">
              {["Starters", "Main Course", "Drinks"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all whitespace-nowrap ${
                    activeCategory === cat
                      ? "bg-emerald-500 text-stone-950 shadow-sm shadow-emerald-500/25"
                      : "bg-stone-800/80 text-stone-300 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Food Menu Items */}
            <div className="p-3 space-y-2.5 max-h-[310px] overflow-y-auto no-scrollbar bg-stone-950">
              {/* Item 1: Paneer Tikka */}
              <div className="flex gap-2.5 rounded-2xl bg-stone-900/80 p-2 border border-stone-800 hover:border-stone-700 transition-all">
                <img
                  src={paneerImg}
                  alt="Paneer Tikka"
                  className="h-16 w-16 rounded-xl object-cover shrink-0"
                />
                <div className="flex flex-1 flex-col justify-between py-0.5">
                  <div>
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-white">Paneer Tikka</h5>
                      <span className="h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/30" />
                    </div>
                    <p className="text-[10px] text-stone-400 line-clamp-1">Charred cottage cheese & mint dip</p>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-bold text-amber-400">₹250</span>
                    <button
                      onClick={() => toggleItem("Paneer Tikka")}
                      className={`flex h-6 w-6 items-center justify-center rounded-lg text-xs font-bold transition-all ${
                        addedItems["Paneer Tikka"]
                          ? "bg-emerald-500 text-stone-950"
                          : "bg-stone-800 text-emerald-400 hover:bg-emerald-500 hover:text-stone-950"
                      }`}
                    >
                      {addedItems["Paneer Tikka"] ? <Check className="h-3 w-3 stroke-[3]" /> : <Plus className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Item 2: Masala Dosa */}
              <div className="flex gap-2.5 rounded-2xl bg-stone-900/80 p-2 border border-stone-800 hover:border-stone-700 transition-all">
                <img
                  src={dosaImg}
                  alt="Masala Dosa"
                  className="h-16 w-16 rounded-xl object-cover shrink-0"
                />
                <div className="flex flex-1 flex-col justify-between py-0.5">
                  <div>
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-white">Masala Dosa</h5>
                      <span className="h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/30" />
                    </div>
                    <p className="text-[10px] text-stone-400 line-clamp-1">Crisp crepe with spiced potato</p>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-bold text-amber-400">₹180</span>
                    <button
                      onClick={() => toggleItem("Masala Dosa")}
                      className={`flex h-6 w-6 items-center justify-center rounded-lg text-xs font-bold transition-all ${
                        addedItems["Masala Dosa"]
                          ? "bg-emerald-500 text-stone-950"
                          : "bg-stone-800 text-emerald-400 hover:bg-emerald-500 hover:text-stone-950"
                      }`}
                    >
                      {addedItems["Masala Dosa"] ? <Check className="h-3 w-3 stroke-[3]" /> : <Plus className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Mini Item 3 & 4 row */}
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <div className="rounded-xl bg-stone-900/60 p-2 border border-stone-800 text-center">
                  <img src={lassiImg} alt="Cold Brew" className="h-10 w-full object-cover rounded-lg mb-1" />
                  <p className="text-[10px] font-bold text-stone-200 truncate">Mango Lassi</p>
                  <p className="text-[10px] font-bold text-amber-400">₹160</p>
                </div>
                <div className="rounded-xl bg-stone-900/60 p-2 border border-stone-800 text-center">
                  <img src={gulabImg} alt="Dessert" className="h-10 w-full object-cover rounded-lg mb-1" />
                  <p className="text-[10px] font-bold text-stone-200 truncate">Gulab Jamun</p>
                  <p className="text-[10px] font-bold text-amber-400">₹150</p>
                </div>
              </div>
            </div>

            {/* Bottom Floating Bar */}
            <div className="p-3 bg-stone-900/90 border-t border-stone-800">
              <Link
                to="/menu/$restaurantSlug"
                params={{ restaurantSlug: "saffron-table" }}
                className="flex h-9 w-full items-center justify-between rounded-xl bg-emerald-500 px-3 text-xs font-bold text-stone-950 hover:bg-emerald-400 transition-colors"
              >
                <span>View Full Menu Demo</span>
                <span className="rounded-lg bg-stone-950/20 px-2 py-0.5 text-[10px]">
                  {totalCount > 0 ? `${totalCount} items` : "Live Demo"}
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* 2. Sleek QR Table Stand Visual */}
        <div className="relative group w-[210px] sm:w-[220px] shrink-0 rounded-2xl bg-gradient-to-b from-stone-100 to-stone-200 text-stone-900 p-4 shadow-2xl shadow-black/60 border border-stone-300 transition-all hover:scale-[1.02] sm:self-end sm:mb-4">
          {/* Acrylic Glass Top Sheen */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/40 to-transparent pointer-events-none" />

          {/* Stand Header */}
          <div className="text-center pb-2.5 border-b border-stone-300">
            <div className="mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-lg bg-stone-900 text-amber-400 shadow-sm">
              <Sparkles className="h-4 w-4" />
            </div>
            <h4 className="font-display text-sm font-extrabold text-stone-900 tracking-tight">Riverside Café</h4>
            <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Table # 14</p>
          </div>

          {/* Authentic QR Display */}
          <div className="my-3 flex flex-col items-center">
            <div className="p-2.5 bg-white rounded-xl shadow-md border border-stone-200">
              {/* Scaled QR representation */}
              <svg className="w-28 h-28" viewBox="0 0 120 120" fill="currentColor">
                {/* Clean QR matrix visual */}
                <rect x="5" y="5" width="30" height="30" rx="3" fill="#18181b" />
                <rect x="11" y="11" width="18" height="18" fill="#ffffff" />
                <rect x="15" y="15" width="10" height="10" rx="1" fill="#18181b" />

                <rect x="85" y="5" width="30" height="30" rx="3" fill="#18181b" />
                <rect x="91" y="11" width="18" height="18" fill="#ffffff" />
                <rect x="95" y="15" width="10" height="10" rx="1" fill="#18181b" />

                <rect x="5" y="85" width="30" height="30" rx="3" fill="#18181b" />
                <rect x="11" y="91" width="18" height="18" fill="#ffffff" />
                <rect x="15" y="95" width="10" height="10" rx="1" fill="#18181b" />

                {/* QR Data Dots */}
                <rect x="42" y="8" width="6" height="6" rx="1" fill="#18181b" />
                <rect x="52" y="12" width="6" height="6" rx="1" fill="#18181b" />
                <rect x="62" y="8" width="6" height="6" rx="1" fill="#18181b" />
                <rect x="72" y="14" width="6" height="6" rx="1" fill="#18181b" />

                <rect x="10" y="45" width="6" height="6" rx="1" fill="#18181b" />
                <rect x="22" y="50" width="6" height="6" rx="1" fill="#18181b" />
                <rect x="35" y="44" width="6" height="6" rx="1" fill="#18181b" />
                <rect x="45" y="52" width="6" height="6" rx="1" fill="#18181b" />
                <rect x="58" y="42" width="6" height="6" rx="1" fill="#18181b" />
                <rect x="70" y="50" width="6" height="6" rx="1" fill="#18181b" />
                <rect x="82" y="42" width="6" height="6" rx="1" fill="#18181b" />
                <rect x="94" y="52" width="6" height="6" rx="1" fill="#18181b" />

                <rect x="45" y="66" width="6" height="6" rx="1" fill="#18181b" />
                <rect x="60" y="62" width="6" height="6" rx="1" fill="#18181b" />
                <rect x="75" y="68" width="6" height="6" rx="1" fill="#18181b" />
                <rect x="88" y="74" width="6" height="6" rx="1" fill="#18181b" />

                <rect x="45" y="88" width="6" height="6" rx="1" fill="#18181b" />
                <rect x="55" y="96" width="6" height="6" rx="1" fill="#18181b" />
                <rect x="70" y="90" width="6" height="6" rx="1" fill="#18181b" />
                <rect x="85" y="98" width="6" height="6" rx="1" fill="#18181b" />
                <rect x="98" y="88" width="6" height="6" rx="1" fill="#18181b" />

                {/* Center logo badge */}
                <rect x="48" y="48" width="24" height="24" rx="5" fill="#10b981" />
                <path d="M54 60 L 59 65 L 67 55" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </div>
            <span className="mt-2 text-xs font-black tracking-tight uppercase text-stone-900">
              Scan to Order
            </span>
            <span className="text-[10px] text-stone-600">No app download needed</span>
          </div>

          {/* Wooden Base Footer */}
          <div className="mt-2 -mx-4 -mb-4 rounded-b-2xl bg-amber-900/90 px-3 py-1.5 text-center text-[10px] font-semibold text-amber-200 border-t border-amber-800/60 shadow-inner">
            DineOS Smart Table System
          </div>
        </div>
      </div>
    </div>
  );
}
