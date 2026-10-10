"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, motion } from "framer-motion";

interface StatItemProps {
  value: number;
  suffix: string;
  label: string;
  prefix?: string;
}

function Counter({ value, suffix, label, prefix }: StatItemProps) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px 0px" });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = value;
      if (start === end) {
        setCount(end);
        return;
      }

      const duration = 1200; // milliseconds
      const stepTime = Math.max(Math.floor(duration / end), 12);
      const stepAmount = Math.max(Math.ceil(end / (duration / stepTime)), 1);

      const timer = setInterval(() => {
        start += stepAmount;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(start);
        }
      }, stepTime);

      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return (
    <div ref={ref} className="text-center flex flex-col items-center">
      <span className="text-4xl md:text-5xl font-extrabold text-brandBlue tracking-tight select-none">
        {prefix}
        {count}
        {suffix}
      </span>
      <span className="mt-2 text-slate-400 text-sm md:text-base font-medium">
        {label}
      </span>
    </div>
  );
}

export default function StatsBar() {
  const stats = [
    { value: 6, suffix: "", label: "Domains Available" },
    { value: 2, suffix: "", label: "Months Duration" },
    { value: 100, suffix: "%", label: "Free of Cost" },
    { value: 3, suffix: "", label: "Win Cash Prizes", prefix: "Top " },
  ];

  return (
    <section className="bg-brandDark-darker border-y border-white/5 py-12 relative overflow-hidden">
      {/* Decorative linear glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-brandBlue/45 to-transparent" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-brandBlue/45 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {stats.map((stat, idx) => (
            <Counter
              key={idx}
              value={stat.value}
              suffix={stat.suffix}
              label={stat.label}
              prefix={stat.prefix}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
