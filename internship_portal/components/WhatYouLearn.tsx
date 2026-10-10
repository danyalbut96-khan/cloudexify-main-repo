"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Layout, Server, Layers } from "lucide-react";

export default function WhatYouLearn() {
  const skills = [
    { name: "Frontend (HTML, CSS, React, Nextjs)", icon: <Layout className="w-5 h-5 text-brandBlue" /> },
    { name: "Backend (Nodejs, Python, Supabase, Express)", icon: <Server className="w-5 h-5 text-emerald-400" /> },
    { name: "Fullstack (React, Nextjs, Nodejs, Database)", icon: <Layers className="w-5 h-5 text-purple-400" /> },
  ];

  return (
    <section id="skills" className="py-24 bg-brandDark-darker relative overflow-hidden">
      {/* Background glowing shape */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] glow-blur-blue rounded-full opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)]">
          <div className="mx-auto lg:mx-0 w-full max-w-[400px]">
            <Image
              src="/images/tech-stack.jpg"
              alt="Full stack tech stack visual"
              width={400}
              height={320}
              className="w-full h-auto rounded-2xl shadow-lg"
              style={{ objectFit: "contain" }}
              sizes="(max-width: 1024px) 100vw, 400px"
            />
          </div>

          <div>
            {/* Header */}
            <div className="text-center lg:text-left mb-16">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight"
              >
                Skills You&apos;ll Build
              </motion.h2>
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: 80 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="h-[4px] bg-[#34A853] mx-auto lg:mx-0 mt-4 rounded-full"
              />
            </div>

            {/* Skill badges grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-12">
              {skills.map((skill, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center space-x-3 p-4 rounded-xl border border-white/5 bg-brandDark/40 backdrop-blur-sm hover:border-white/15 hover:bg-brandDark-light/50 transition-all duration-200 shadow-md cursor-default group"
                >
                  <div className="p-2 bg-white/5 rounded-lg border border-white/5 group-hover:bg-white/10 transition-colors">
                    {skill.icon}
                  </div>
                  <span className="text-slate-200 font-semibold text-sm sm:text-base group-hover:text-white transition-colors">
                    {skill.name}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Description paragraph */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center lg:text-left p-8 rounded-2xl border border-white/5 bg-brandDark-card/50 backdrop-blur-md shadow-inner"
            >
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
                Our interns don&apos;t just write code — they learn how to deliver complete products to real clients, communicate professionally, and use modern AI-assisted development workflows to maximize velocity and code quality.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
