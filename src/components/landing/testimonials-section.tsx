import amitImg from "@/assets/avatar-amit.jpg";
import priyaImg from "@/assets/avatar-priya.jpg";
import rahulImg from "@/assets/avatar-rahul.jpg";
import { Star } from "lucide-react";

export function TestimonialsSection() {
  const testimonials = [
    {
      name: "Amit Verma",
      role: "Cafe Owner, Lucknow",
      image: amitImg,
      quote:
        "DineOS has completely changed the way we operate. Orders are faster, staff is more efficient and customers love it!",
      rating: 5,
    },
    {
      name: "Priya Sharma",
      role: "Restaurant Owner, Delhi",
      image: priyaImg,
      quote:
        "Easy to set up and very user friendly. Our customers love the QR ordering and the kitchen display is amazing.",
      rating: 5,
    },
    {
      name: "Rahul Mehta",
      role: "Cloud Kitchen Owner, Mumbai",
      image: rahulImg,
      quote:
        "Great support and powerful features. DineOS cut our turnaround time in half and is a must-have for any modern restaurant.",
      rating: 5,
    },
  ];

  return (
    <section
      id="testimonials"
      className="py-20 sm:py-28 bg-stone-50 border-t border-stone-200/80 text-stone-900 scroll-mt-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 shadow-xs mb-4">
            Loved by Restaurant Owners
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-stone-900">
            What Our <span className="text-emerald-600">Customers Say</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-stone-600">
            Trusted by restaurant owners across India.
          </p>
        </div>

        {/* Testimonials 3 Columns */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="flex flex-col justify-between rounded-3xl border border-stone-200 bg-white p-6 sm:p-7 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div>
                {/* 5 Stars */}
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-sm text-stone-700 leading-relaxed italic">"{t.quote}"</p>
              </div>

              {/* Author Info */}
              <div className="mt-6 flex items-center gap-3.5 pt-4 border-t border-stone-100">
                <img
                  src={t.image}
                  alt={t.name}
                  className="h-11 w-11 rounded-full object-cover ring-2 ring-emerald-500/30"
                />
                <div>
                  <h4 className="font-display text-sm font-bold text-stone-900">{t.name}</h4>
                  <p className="text-xs text-stone-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
