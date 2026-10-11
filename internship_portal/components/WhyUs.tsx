"use client";

import { motion } from "framer-motion";
import { Briefcase, Award, Globe } from "lucide-react";

export default function WhyUs() {
  const cards = [
    {
      icon: <Briefcase className="w-8 h-8 text-brandBlue" />,
      title: "Real Client Projects",
      description:
        "You won't work on dummy tasks. Every project is a real website for a real business, giving you genuine commercial portfolio items.",
      color: "from-brandBlue/20 to-transparent",
    },
    {
      icon: <Award className="w-8 h-8 text-[#34A853]" />,
      title: "Official Certificate",
      description:
        "Receive a signed certificate of completion recognized on LinkedIn, including code repository links and a review from your PM.",
      color: "from-[#34A853]/20 to-transparent",
    },
    {
      icon: <Globe className="w-8 h-8 text-[#FBBC04]" />,
      title: "Remote & Flexible",
      description:
        "Work from anywhere in the world. Set your own schedule around university or other commitments, as long as you deliver on time.",
      color: "from-[#FBBC04]/20 to-transparent",
    },
  ];

  return (
    <section id="why-us" className="py-24 bg-brandDark relative overflow-hidden">
      {/* Background Glow Accents */}
      <div className="absolute right-0 top-1/4 w-[350px] h-[350px] glow-blur-yellow rounded-full opacity-30" />
      <div className="absolute left-0 bottom-1/4 w-[350px] h-[350px] glow-blur-blue rounded-full opacity-30" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Title Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight"
          >
            Why Intern With Us?
          </motion.h2>
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: 80 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="h-[4px] bg-brandBlue mx-auto mt-4 rounded-full"
          />
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-4 text-lg text-slate-400"
          >
            We run an elite training ground designed to transition aspiring developers into professional, job-ready engineers.
          </motion.p>
        </div>

        {/* Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              whileHover={{ y: -8 }}
              className="relative p-[1px] rounded-2xl bg-gradient-to-b from-white/10 to-transparent hover:from-white/20 transition-all duration-300 shadow-xl overflow-hidden group"
            >
              {/* Inner Card Background */}
              <div className="relative h-full bg-brandDark-card rounded-[15px] p-8 flex flex-col items-start overflow-hidden">
                {/* Floating radial card glow */}
                <div
                  className={`absolute -top-16 -right-16 w-32 h-32 bg-gradient-to-br ${card.color} blur-2xl group-hover:scale-150 transition-all duration-500 rounded-full`}
                />

                {/* Icon Container */}
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 mb-6 group-hover:bg-brandDark-light transition-all duration-300">
                  {card.icon}
                </div>

                {/* Card Title */}
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-brandBlue transition-colors">
                  {card.title}
                </h3>

                {/* Card Description */}
                <p className="text-slate-400 leading-relaxed text-sm md:text-base">
                  {card.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
