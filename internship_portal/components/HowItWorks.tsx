"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { UserCheck, FileInput, Briefcase, Award } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      num: "01",
      icon: <FileInput className="w-6 h-6 text-brandBlue" />,
      title: "Apply",
      description: "Fill out our quick application form in less than 3 minutes.",
    },
    {
      num: "02",
      icon: <UserCheck className="w-6 h-6 text-sky-400" />,
      title: "Get Selected",
      description: "We review submissions and shortlist candidates within 7 days.",
    },
    {
      num: "03",
      icon: <Briefcase className="w-6 h-6 text-[#34A853]" />,
      title: "Get Projects",
      description: "Get assigned to a Project Manager and receive real client tasks.",
    },
    {
      num: "04",
      icon: <Award className="w-6 h-6 text-[#FBBC04]" />,
      title: "Deliver & Earn",
      description: "Complete your projects successfully and claim your official certificate.",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-brandDark relative overflow-hidden">
      {/* Decorative side lights */}
      <div className="absolute top-10 left-10 w-96 h-96 glow-blur-green rounded-full opacity-10 pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 glow-blur-blue rounded-full opacity-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight"
          >
            How It Works
          </motion.h2>
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: 80 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="h-[4px] bg-brandBlue mx-auto mt-4 rounded-full"
          />
        </div>

        <div className="w-full">
          <div className="relative">
            {/* Horizontal connecting line (Desktop only) */}
            <div className="hidden md:block absolute top-[64px] left-[0] right-[0] h-[2px] bg-gradient-to-r from-brandBlue/30 via-[#34A853]/30 to-[#FBBC04]/30 z-0" />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 relative z-10">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  className="flex flex-col items-center text-center group"
                >
                  {/* Step Circle with Icon */}
                  <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-brandDark-card border border-white/10 shadow-lg group-hover:border-brandBlue/55 group-hover:shadow-brandBlue/10 transition-all duration-300 mb-6">
                    {/* Floating Step Number */}
                    <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-brandDark-light border border-white/10 flex items-center justify-center text-xs font-bold text-slate-300">
                      {step.num}
                    </span>
                    {step.icon}
                  </div>

                  {/* Step Title */}
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-brandBlue transition-colors">
                    {step.title}
                  </h3>

                  {/* Step Description */}
                  <p className="text-slate-400 text-sm leading-relaxed max-w-[240px]">
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
