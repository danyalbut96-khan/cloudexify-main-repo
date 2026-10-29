"use client";

import { motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";

export default function Requirements() {
  const positiveCriteria = [
    "You are in semester 5 or above (or equivalent self-taught level)",
    "You know basic HTML/CSS or have introductory React experience",
    "You can dedicate 10–20 hours per week consistently",
    "You want real project experience to put on your resume",
    "You want a professional certificate to boost your LinkedIn profile",
  ];

  const negativeCriteria = [
    "You are looking for a paid internship (this role is unpaid)",
    "You cannot meet deadlines or work independently",
    "You are looking for offline/in-person work environments",
    "You are not serious about learning or receiving PM feedback",
  ];

  return (
    <section id="requirements" className="py-24 bg-brandDark relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute left-1/4 bottom-10 w-96 h-96 glow-blur-yellow rounded-full opacity-10 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight"
          >
            Who Should Apply?
          </motion.h2>
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: 80 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="h-[4px] bg-brandBlue mx-auto mt-4 rounded-full"
          />
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Apply Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-8 rounded-2xl border border-[#34A853]/20 bg-brandDark-card relative overflow-hidden shadow-lg"
          >
            <div className="absolute top-0 left-0 w-full h-[4px] bg-[#34A853]" />
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-[#34A853]">✅</span> You Should Apply If...
            </h3>
            <ul className="space-y-4">
              {positiveCriteria.map((item, index) => (
                <li key={index} className="flex items-start space-x-3 text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-[#34A853] shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Not For You Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-8 rounded-2xl border border-brandYellow/20 bg-brandDark-card relative overflow-hidden shadow-lg"
          >
            <div className="absolute top-0 left-0 w-full h-[4px] bg-brandYellow" />
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-brandYellow">❌</span> This Is Not For You If...
            </h3>
            <ul className="space-y-4">
              {negativeCriteria.map((item, index) => (
                <li key={index} className="flex items-start space-x-3 text-slate-300">
                  <XCircle className="w-5 h-5 text-brandYellow shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
