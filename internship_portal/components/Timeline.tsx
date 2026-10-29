"use client";

import { motion } from "framer-motion";
import { CalendarDays, Flag, MessageSquareCode, Mail, Users, UserCog, MonitorPlay, Rocket } from "lucide-react";

export default function Timeline() {
  const steps = [
    {
      num: 1,
      date: "Step 1",
      title: "Pick Domain",
      desc: "Select your desired internship domain based on your skills.",
      icon: <Users className="w-5 h-5 text-[#34A853]" />,
    },
    {
      num: 2,
      date: "Step 2",
      title: "Apply",
      desc: "Fill out the online application form with your details.",
      icon: <CalendarDays className="w-5 h-5 text-brandBlue" />,
    },
    {
      num: 3,
      date: "Step 3",
      title: "Get Accepted",
      desc: "Our review committee evaluates applications and sends acceptance emails.",
      icon: <MessageSquareCode className="w-5 h-5 text-sky-400" />,
    },
    {
      num: 4,
      date: "Step 4",
      title: "Dashboard Unlocked",
      desc: "Gain access to your personalized intern dashboard and start your journey.",
      icon: <Rocket className="w-5 h-5 text-purple-400" />,
    },
    {
      num: 5,
      date: "Step 5",
      title: "Submit Your Project",
      desc: "Complete your tasks and submit your projects through the dashboard.",
      icon: <Flag className="w-5 h-5 text-[#FBBC04]" />,
    },
    {
      num: 6,
      date: "Step 6",
      title: "Get Your Certificates",
      desc: "Receive your verified internship certificates and letter of recommendation.",
      icon: <MonitorPlay className="w-5 h-5 text-emerald-400" />,
    },
  ];

  return (
    <section id="onboarding" className="py-24 bg-brandDark-darker relative overflow-hidden">
      {/* Background radial highlight */}
      <div className="absolute right-0 bottom-0 w-[500px] h-[500px] glow-blur-blue rounded-full opacity-10 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Title */}
        <div className="text-center mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight"
          >
            What Happens After You Apply?
          </motion.h2>
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: 80 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="h-[4px] bg-[#34A853] mx-auto mt-4 rounded-full"
          />
        </div>

        {/* Timeline Path */}
        <div className="relative border-l border-white/10 ml-4 md:ml-32 pl-8 md:pl-12 space-y-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative group"
            >
              {/* Timeline dot & icon */}
              <div className="absolute -left-[53px] md:-left-[69px] top-1.5 flex items-center justify-center w-12 h-12 rounded-full bg-brandDark border border-white/10 group-hover:border-brandBlue/70 shadow-lg transition-colors duration-300">
                {step.icon}
              </div>

              {/* Date Box (Desktop absolute layout on the left side) */}
              <div className="hidden md:block absolute -left-[180px] top-3 text-right w-[100px] font-bold text-sm tracking-wide text-brandBlue">
                {step.date}
              </div>

              {/* Content Card */}
              <div className="p-6 rounded-2xl bg-brandDark-card border border-white/5 shadow-md hover:border-white/10 transition-colors">
                <span className="inline-block md:hidden text-brandBlue font-bold text-xs uppercase tracking-wider mb-2">
                  {step.date}
                </span>
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  <span className="text-white/20 text-sm">#{step.num}</span> {step.title}
                </h3>
                <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
