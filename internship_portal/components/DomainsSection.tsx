"use client";

import { motion } from "framer-motion";
import { Globe, Terminal, Code2, Coffee, BarChart3, Shield } from "lucide-react";
import { APPLY_FORM_URL, OTHER_DOMAINS_FORM_URL } from "@/lib/constants";

interface DomainCard {
  title: string;
  description: string;
  iconName: "Globe" | "Terminal" | "Code2" | "Coffee" | "BarChart3" | "Shield";
  accent: string;
  accentBgHover: string;
  accentShadow: string;
  accentBgIcon: string;
  accentBorderIcon: string;
  badge: {
    text: string;
    bg: string;
    color: string;
    border: string;
  };
  techStack: string[];
  whatYouBuild: string[];
  duration: string;
  fee: string;
  href: string;
}

const domains: DomainCard[] = [
  {
    title: "Full Stack Web Development",
    description: "Build complete websites and web applications from scratch. Learn frontend and backend development using modern technologies.",
    iconName: "Globe",
    accent: "#1A73E8",
    accentBgHover: "rgba(26, 115, 232, 0.04)",
    accentShadow: "rgba(26, 115, 232, 0.15)",
    accentBgIcon: "rgba(26, 115, 232, 0.12)",
    accentBorderIcon: "rgba(26, 115, 232, 0.3)",
    badge: {
      text: "MOST POPULAR",
      bg: "rgba(26, 115, 232, 0.2)",
      color: "#1A73E8",
      border: "1px solid #1A73E8",
    },
    techStack: ["HTML", "CSS", "JavaScript", "React.js", "Node.js", "MongoDB"],
    whatYouBuild: ["Real client websites", "Portfolio-ready projects", "Complete web applications"],
    duration: "2 Months",
    fee: "100% Free",
    href: APPLY_FORM_URL,
  },
  {
    title: "Python Programming",
    description: "Master Python from basics to advanced. Build automation scripts, work with APIs, and create real utility applications.",
    iconName: "Terminal",
    accent: "#34A853",
    accentBgHover: "rgba(52, 168, 83, 0.04)",
    accentShadow: "rgba(52, 168, 83, 0.15)",
    accentBgIcon: "rgba(52, 168, 83, 0.12)",
    accentBorderIcon: "rgba(52, 168, 83, 0.3)",
    badge: {
      text: "BEGINNER FRIENDLY",
      bg: "rgba(52, 168, 83, 0.15)",
      color: "#34A853",
      border: "1px solid #34A853",
    },
    techStack: ["Python", "OOP", "NumPy", "Pandas", "APIs", "Automation"],
    whatYouBuild: ["Automation scripts", "Data processing tools", "Real utility applications"],
    duration: "2 Months",
    fee: "100% Free",
    href: OTHER_DOMAINS_FORM_URL,
  },
  {
    title: "C++ Programming",
    description: "Master one of the most powerful languages. Learn OOP, data structures, algorithms and build real console applications.",
    iconName: "Code2",
    accent: "#9C27B0",
    accentBgHover: "rgba(156, 39, 176, 0.04)",
    accentShadow: "rgba(156, 39, 176, 0.15)",
    accentBgIcon: "rgba(156, 39, 176, 0.12)",
    accentBorderIcon: "rgba(156, 39, 176, 0.3)",
    badge: {
      text: "UNIVERSITY FAVORITE",
      bg: "rgba(156, 39, 176, 0.15)",
      color: "#CE93D8",
      border: "1px solid #9C27B0",
    },
    techStack: ["C++", "OOP", "Data Structures", "Algorithms", "Memory Management"],
    whatYouBuild: ["OOP-based applications", "Data structure projects", "Algorithm solutions"],
    duration: "2 Months",
    fee: "100% Free",
    href: OTHER_DOMAINS_FORM_URL,
  },
  {
    title: "Java Programming",
    description: "Learn the language that powers billions of devices. Master OOP, collections, and build real Java applications.",
    iconName: "Coffee",
    accent: "#FF6B35",
    accentBgHover: "rgba(255, 107, 53, 0.04)",
    accentShadow: "rgba(255, 107, 53, 0.15)",
    accentBgIcon: "rgba(255, 107, 53, 0.12)",
    accentBorderIcon: "rgba(255, 107, 53, 0.3)",
    badge: {
      text: "HIGH DEMAND",
      bg: "rgba(255, 107, 53, 0.15)",
      color: "#FF6B35",
      border: "1px solid #FF6B35",
    },
    techStack: ["Java", "OOP", "Collections", "Exception Handling", "Spring Boot"],
    whatYouBuild: ["Console applications", "OOP-based projects", "Real Java applications"],
    duration: "2 Months",
    fee: "100% Free",
    href: OTHER_DOMAINS_FORM_URL,
  },
  {
    title: "Data Science & AI Basics",
    description: "Enter the most in-demand field of the decade. Work with real datasets, build AI models and visualize data insights.",
    iconName: "BarChart3",
    accent: "#00BCD4",
    accentBgHover: "rgba(0, 188, 212, 0.04)",
    accentShadow: "rgba(0, 188, 212, 0.15)",
    accentBgIcon: "rgba(0, 188, 212, 0.12)",
    accentBorderIcon: "rgba(0, 188, 212, 0.3)",
    badge: {
      text: "FUTURE OF TECH",
      bg: "rgba(0, 188, 212, 0.15)",
      color: "#00BCD4",
      border: "1px solid #00BCD4",
    },
    techStack: ["Python", "NumPy", "Pandas", "Matplotlib", "ML Basics", "AI"],
    whatYouBuild: ["Data analysis projects", "Visualization dashboards", "Basic AI/ML models"],
    duration: "2 Months",
    fee: "100% Free",
    href: OTHER_DOMAINS_FORM_URL,
  },
  {
    title: "Cybersecurity Fundamentals",
    description: "Enter one of the highest-paying fields in tech. Learn network security, ethical hacking basics and how to protect systems.",
    iconName: "Shield",
    accent: "#EA4335",
    accentBgHover: "rgba(234, 67, 53, 0.04)",
    accentShadow: "rgba(234, 67, 53, 0.15)",
    accentBgIcon: "rgba(234, 67, 53, 0.12)",
    accentBorderIcon: "rgba(234, 67, 53, 0.3)",
    badge: {
      text: "HIGHEST PAYING FIELD",
      bg: "rgba(234, 67, 53, 0.15)",
      color: "#EA4335",
      border: "1px solid #EA4335",
    },
    techStack: ["Network Security", "Linux", "Ethical Hacking", "Cryptography", "Cyber Threats"],
    whatYouBuild: ["Security audit reports", "Threat analysis projects", "Real security documentation"],
    duration: "2 Months",
    fee: "100% Free",
    href: OTHER_DOMAINS_FORM_URL,
  },
];

const iconMap = {
  Globe: Globe,
  Terminal: Terminal,
  Code2: Code2,
  Coffee: Coffee,
  BarChart3: BarChart3,
  Shield: Shield,
};

export default function DomainsSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  } as const;

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 15,
      },
    },
  } as const;

  return (
    <section id="domains" className="py-24 bg-brandDark-darker relative overflow-hidden">
      {/* Decorative Blur Glows */}
      <div className="absolute top-1/4 left-1/10 w-[300px] h-[300px] glow-blur-blue rounded-full opacity-20 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/10 w-[300px] h-[300px] glow-blur-green rounded-full opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-[11px] font-bold text-white/40 tracking-[3px] uppercase mb-3">
            CHOOSE YOUR PATH
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-white to-[#90CAF9] bg-clip-text text-transparent">
              6 Domains. One Internship.
            </span>
          </h2>
          <p className="text-sm sm:text-base text-white/50 max-w-xl mx-auto leading-relaxed">
            Pick the domain that excites you most. Build real projects. Earn your certificate.
          </p>
        </div>

        {/* Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-[1100px] mx-auto"
        >
          {domains.map((domain, index) => {
            const IconComponent = iconMap[domain.iconName];
            return (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover={{
                  y: -4,
                  borderColor: domain.accent,
                  backgroundColor: domain.accentBgHover,
                  boxShadow: `0 0 40px ${domain.accentShadow}`,
                }}
                className="relative bg-white/[0.02] border border-white/[0.06] rounded-[20px] p-7 transition-colors duration-300 flex flex-col justify-between h-full group"
                style={{
                  minHeight: "480px",
                }}
              >
                {/* Accent line at top */}
                <div
                  className="absolute top-0 left-0 right-0 h-[3px]"
                  style={{ backgroundColor: domain.accent }}
                />

                {/* Card Top Information */}
                <div>
                  {/* Icon & Badge Row */}
                  <div className="flex items-center justify-between mb-4">
                    {/* Icon container */}
                    <div
                      className="w-12 h-12 rounded-[12px] border flex items-center justify-center transition-all duration-300"
                      style={{
                        backgroundColor: domain.accentBgIcon,
                        borderColor: domain.accentBorderIcon,
                      }}
                    >
                      <IconComponent className="w-6 h-6" style={{ color: domain.accent }} />
                    </div>

                    {/* Badge */}
                    <span
                      style={{
                        backgroundColor: domain.badge.bg,
                        color: domain.badge.color,
                        border: domain.badge.border,
                      }}
                      className="text-[9px] font-extrabold px-[10px] py-[3px] rounded-[20px] tracking-[0.5px] uppercase"
                    >
                      {domain.badge.text}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-[17px] font-extrabold text-white mb-2 tracking-tight">
                    {domain.title}
                  </h3>

                  {/* Description */}
                  <p className="text-[13px] text-white/55 leading-relaxed mb-4">
                    {domain.description}
                  </p>

                  {/* Tech stack pills */}
                  <div className="flex flex-wrap gap-[6px] mb-5">
                    {domain.techStack.map((tech, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[10px] px-[10px] py-[3px] rounded-[20px] bg-white/[0.06] border border-white/[0.1] text-white/60 font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* What you build section */}
                  <div className="mb-6">
                    {domain.whatYouBuild.map((item, wIdx) => (
                      <div key={wIdx} className="flex gap-2 text-[12px] text-white/60 mb-1 items-start">
                        <span className="font-bold flex-shrink-0" style={{ color: domain.accent }}>
                          ✓
                        </span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Bottom / Action Row */}
                <div>
                  {/* Duration and Fee info */}
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[11px] text-white/50 flex items-center gap-1 font-medium">
                      ⏱️ {domain.duration}
                    </span>
                    <span className="text-[11px] text-[#34A853] font-bold flex items-center gap-1">
                      FREE ✓
                    </span>
                  </div>

                  {/* Apply Button */}
                  <a
                    href={domain.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center w-full py-3 rounded-[10px] text-[13px] font-bold text-white transition-all duration-200 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
                    style={{ backgroundColor: domain.accent }}
                  >
                    Apply Now →
                  </a>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
