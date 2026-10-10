"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: "Is this internship paid?",
      a: "No, this is an unpaid internship. The focus is to provide you with real client project experience, mentoring from senior developers, and an official internship certificate to build your commercial portfolio.",
    },
    {
      q: "How many projects will I work on?",
      a: "Each intern is assigned 3 real client projects during the internship period. This ensures you build diverse skills across different website structures.",
    },
    {
      q: "What skills do I need?",
      a: "Basic HTML/CSS and Javascript knowledge is enough to start. Knowing React and Tailwind is a big plus but not strictly required as your PM will help guide your learning journey.",
    },
    {
      q: "Can I do this alongside university?",
      a: "Yes! The internship is 100% remote and highly flexible. You can set your own schedule. You will need to dedicate 10–20 hours per week to complete projects on time.",
    },
    {
      q: "Will I get a certificate?",
      a: "Yes. Upon successful completion of all assigned client projects, you will receive an official Cloudexify internship certificate recognized on LinkedIn.",
    },
    {
      q: "How will projects be assigned?",
      a: "Your assigned Project Manager (PM) will share project specifications, repository targets, and team guidelines via WhatsApp, Discord, and GitHub issues.",
    },
  ];

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 bg-brandDark relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute left-10 top-1/4 w-80 h-80 glow-blur-blue rounded-full opacity-10 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Title */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight"
          >
            Frequently Asked Questions
          </motion.h2>
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: 80 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="h-[4px] bg-brandBlue mx-auto mt-4 rounded-full"
          />
        </div>

        {/* Accordions */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="border border-white/10 rounded-2xl bg-brandDark-card overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => handleToggle(index)}
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none hover:bg-white/[0.02] transition-colors"
                >
                  <span className="flex items-center space-x-3 pr-4">
                    <HelpCircle className="w-5 h-5 text-brandBlue shrink-0" />
                    <span className="font-bold text-white text-base sm:text-lg">{faq.q}</span>
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-brandBlue" : ""
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="p-6 pt-0 border-t border-white/5 text-slate-300 text-sm sm:text-base leading-relaxed">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
