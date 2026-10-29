"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Laptop, Award } from "lucide-react";
import { APPLY_FORM_URL, OTHER_DOMAINS_FORM_URL } from "@/lib/constants";

export default function Hero({ activeBatchName = "CloudExify Internship Program" }: { activeBatchName?: string }) {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-brandDark pt-20"
    >
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] glow-blur-blue rounded-full opacity-60 animate-pulse" style={{ animationDuration: '6s' }} />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] glow-blur-green rounded-full opacity-40 animate-pulse" style={{ animationDuration: '8s' }} />
      
      {/* Decorative Dot Matrix Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
        <div className="text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brandBlue/30 bg-brandBlue/10 backdrop-blur-md text-brandBlue text-sm font-semibold tracking-wide shadow-md shadow-brandBlue/5 mb-8"
          >
            <Laptop className="w-4 h-4 text-brandBlue" />
            <span>100% Remote</span>
            <span className="text-white/20">•</span>
            <Award className="w-4 h-4 text-[#34A853]" />
            <span className="text-white/90">Certificate Included</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1] max-w-5xl"
          >
            Launch Your Tech Career{" "}
            <span className="block bg-gradient-to-r from-brandBlue via-sky-400 to-[#34A853] bg-clip-text text-transparent">
              With Real Projects 🚀
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg sm:text-xl text-slate-300 max-w-3xl mb-10 leading-relaxed"
          >
            Join {activeBatchName}. Choose your domain. Build real projects. Earn Certificate + LOR. 100% Free. 100% Remote.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 items-center justify-center lg:justify-start w-full sm:w-auto"
          >
            <a
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-base font-bold text-white bg-brandBlue hover:bg-brandBlue-dark transition-all duration-200 shadow-xl shadow-brandBlue/35 hover:scale-[1.03] active:scale-[0.98]"
            >
              🚀 Apply for Internship
            </a>
            <a
              href="/submit-project"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-base font-bold transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] border-2 border-brandYellow text-brandYellow hover:bg-brandYellow/10 bg-transparent"
            >
              📝 Submit Your Project
            </a>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: [0, 1, 1], y: [20, -10, 10] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="mx-auto lg:mx-0 w-full max-w-[420px]"
        >
          <div className="rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src="/images/get-ready.jpg"
              alt="Get ready with Cloudexify internship"
              width={420}
              height={420}
              className="w-full h-auto rounded-2xl"
              style={{ objectFit: "contain" }}
              sizes="(max-width: 1024px) 100vw, 420px"
            />
          </div>
        </motion.div>
      </div>

      {/* Ambient background accent shapes */}
      <div className="absolute left-10 bottom-10 w-24 h-24 border border-white/5 rounded-full hidden lg:block animate-bounce" style={{ animationDuration: '10s' }} />
      <div className="absolute right-20 top-20 w-32 h-32 border border-white/5 rounded-3xl hidden lg:block animate-pulse" style={{ animationDuration: '12s' }} />
    </section>
  );
}
