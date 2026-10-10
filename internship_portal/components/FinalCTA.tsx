"use client";

import { motion } from "framer-motion";
import { LifeBuoy } from "lucide-react";

export default function FinalCTA() {
  return (
    <section className="py-24 bg-brandDark relative overflow-hidden text-center flex items-center justify-center border-t border-white/5">
      {/* Intense Center Blue Ambient Glow */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] glow-blur-blue rounded-full opacity-40 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="p-10 sm:p-16 rounded-3xl border border-white/10 bg-brandDark-card/65 backdrop-blur-md shadow-2xl relative overflow-hidden"
        >
          {/* Accent light on top border */}
          <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-brandBlue to-transparent" />

          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight leading-tight">
            Ready to Start Your{" "}
            <span className="bg-gradient-to-r from-brandBlue to-emerald-400 bg-clip-text text-transparent">
              Tech Journey?
            </span>
          </h2>

          {/* Subtext */}
          <p className="text-slate-300 text-base sm:text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Choose your domain and apply today. 100% Free. 100% Remote. Get certified, win cash prizes, and get hired!
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-8 max-w-2xl mx-auto">
            <a
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-base font-bold text-brandBlue bg-white hover:bg-slate-100 transition-all duration-200 shadow-xl hover:scale-[1.03] active:scale-[0.98]"
            >
              🚀 Apply for Internship
            </a>
            <a
              href="/submit-project"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-base font-bold transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] border-2 border-white/20 text-white hover:bg-white/10"
            >
              📝 Submit Your Project
            </a>
            <a
              href="/support"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full text-base font-bold transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
            >
              <LifeBuoy className="w-5 h-5" /> Support
            </a>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-slate-300 font-semibold select-none">
            <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
              ✅ 100% Free
            </span>
            <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
              ✅ Certificate + LOR Guaranteed
            </span>
            <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
              💰 Cash Prizes for Top 3
            </span>
          </div>


        </motion.div>
      </div>
    </section>
  );
}
