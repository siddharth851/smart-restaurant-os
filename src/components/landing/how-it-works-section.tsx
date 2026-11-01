import qrStandImg from "@/assets/step-qr-stand.jpg";
import paneerImg from "@/assets/food-paneer.jpg";
import dosaImg from "@/assets/food-dosa.jpg";
import biryaniImg from "@/assets/food-biryani.jpg";
import { ArrowRight, Clock, CheckCircle2 } from "lucide-react";

export function HowItWorksSection() {
  const steps = [
    {
      num: "1",
      numColor: "bg-emerald-600 text-white",
      title: "Place QR at Tables",
      desc: "Print and place unique QR codes on each table in your restaurant.",
      visual: (
        <div className="relative h-44 w-full overflow-hidden rounded-2xl bg-stone-100 border border-stone-200">
          <img
            src={qrStandImg}
            alt="Place QR at Tables"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute bottom-2 left-2 right-2 rounded-xl bg-stone-900/80 backdrop-blur-xs px-2.5 py-1.5 text-center text-[11px] font-semibold text-white">
            Table QR Code Stand
          </div>
        </div>
      ),
    },
    {
      num: "2",
      numColor: "bg-amber-500 text-stone-950",
      title: "Customers Order",
      desc: "Customers scan, browse menu and place their order in seconds.",
      visual: (
        <div className="relative h-44 w-full overflow-hidden rounded-2xl bg-stone-900 p-2 border border-stone-800 flex items-center justify-center">
          {/* Mini Phone representation */}
          <div className="w-[155px] rounded-2xl bg-stone-950 p-2 border border-stone-700 shadow-lg text-white">
            <div className="h-14 rounded-lg overflow-hidden relative mb-1.5">
              <img src={dosaImg} alt="Menu" className="h-full w-full object-cover" />
              <span className="absolute bottom-1 left-1 text-[9px] font-bold bg-black/60 px-1 rounded text-white">
                Masala Dosa
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px] px-0.5">
              <span className="font-bold text-amber-400">₹180</span>
              <span className="bg-emerald-500 text-stone-950 px-2 py-0.5 rounded-full font-bold text-[9px]">
                Ordered ✓
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      num: "3",
      numColor: "bg-purple-600 text-white",
      title: "Kitchen Prepares",
      desc: "Orders appear instantly in kitchen with live tickets and prep timers.",
      visual: (
        <div className="relative h-44 w-full overflow-hidden rounded-2xl bg-stone-900 p-2.5 border border-stone-800 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-stone-800 pb-1.5 text-[10px] text-stone-400">
            <span className="font-bold text-amber-400 flex items-center gap-1">
              <Clock className="h-3 w-3" /> Live KDS
            </span>
            <span className="bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-mono">
              Table # 4
            </span>
          </div>
          <div className="rounded-xl bg-stone-800/90 p-2 border border-stone-700">
            <div className="flex items-center justify-between text-xs font-bold text-white mb-1">
              <span>#ORD-1042</span>
              <span className="text-[10px] text-emerald-400">Preparing (2m)</span>
            </div>
            <p className="text-[10px] text-stone-300">1x Butter Chicken</p>
            <p className="text-[10px] text-stone-300">2x Mango Lassi</p>
          </div>
          <div className="flex justify-end">
            <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
              Kitchen Screen Live
            </span>
          </div>
        </div>
      ),
    },
    {
      num: "4",
      numColor: "bg-blue-600 text-white",
      title: "Food is Served",
      desc: "Track order status until it's served hot and fresh to the table.",
      visual: (
        <div className="relative h-44 w-full overflow-hidden rounded-2xl bg-stone-100 border border-stone-200">
          <img
            src={paneerImg}
            alt="Food is Served"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-2 right-2 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-stone-950 flex items-center gap-1 shadow">
            <CheckCircle2 className="h-3 w-3" /> Served
          </div>
          <div className="absolute bottom-2 left-2 right-2 rounded-xl bg-stone-900/80 backdrop-blur-xs px-2.5 py-1.5 text-center text-[11px] font-semibold text-white">
            Table # 14 Enjoying
          </div>
        </div>
      ),
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-20 sm:py-28 bg-stone-50 border-t border-stone-200/80 text-stone-900 scroll-mt-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 shadow-xs mb-4">
            Simple Process
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-stone-900">
            How It <span className="text-emerald-600">Works</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-stone-600">
            Get started in minutes and transform the way you serve.
          </p>
        </div>

        {/* 4 Steps Horizontal Flow */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 relative">
          {steps.map((step, idx) => (
            <div
              key={step.title}
              className="group relative flex flex-col rounded-3xl border border-stone-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              {/* Step Visual */}
              <div className="mb-4">{step.visual}</div>

              {/* Number Badge & Title */}
              <div className="flex items-center gap-2.5 mb-2">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-extrabold shadow-sm ${step.numColor}`}
                >
                  {step.num}
                </span>
                <h3 className="font-display text-base font-bold text-stone-900 group-hover:text-emerald-700 transition-colors">
                  {step.title}
                </h3>
              </div>

              {/* Description */}
              <p className="text-xs text-stone-600 leading-relaxed">{step.desc}</p>

              {/* Connecting arrow for desktop between steps */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 z-10 text-stone-300">
                  <ArrowRight className="h-5 w-5" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
