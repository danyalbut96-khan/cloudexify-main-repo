"use client";

import { motion } from "framer-motion";
import { Award } from "lucide-react";

export default function InternshipDetails({ activeBatch, comingBatch }: { activeBatch?: any, comingBatch?: any }) {
  const formatDate = (dateStr?: string) => {
    if (!dateStr || dateStr === 'TBD') return 'TBD';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const details = [
    { label: "Active Batch", value: activeBatch?.name || "CloudExify Internship" },
    { label: "Duration", value: "1 Month or 3 Months (Flexible Selection)" },
    { label: "Mode", value: "100% Remote (Online Work)" },
    { label: "Projects", value: "5 Real Client Projects assigned by your PM" },
    { label: "Compensation", value: "Unpaid (Industrial Experience & Mentorship)" },
    { label: "Certificate", value: "Yes — Official Cloudexify Internship Certificate" },
    { label: "Start Date", value: formatDate(activeBatch?.start_date) },
    { label: "Applications", value: `Open until ${formatDate(activeBatch?.registration_deadline)}` },
  ];

  if (comingBatch) {
    details.push({ label: "Coming Next", value: comingBatch.name });
  }

  return (
    <section id="details" className="py-24 bg-brandDark-darker relative overflow-hidden">
      {/* Background decoration elements */}
      <div className="absolute top-0 right-10 w-96 h-96 glow-blur-blue rounded-full opacity-10 pointer-events-none" />
      
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
            Internship Details
          </motion.h2>
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: 80 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="h-[4px] bg-brandBlue mx-auto mt-4 rounded-full"
          />
        </div>

        {/* Card Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl border border-white/10 bg-brandDark-card shadow-2xl overflow-hidden"
        >
          <div className="divide-y divide-white/10">
            {details.map((detail, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 p-6 hover:bg-white/[0.02] transition-colors"
              >
                <div className="text-slate-400 font-semibold text-sm uppercase tracking-wider flex items-center">
                  {detail.label}
                </div>
                <div className="md:col-span-2 text-white font-medium text-base flex items-center">
                  {detail.label === "Applications" ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FBBC04]/10 text-[#FBBC04] border border-[#FBBC04]/20">
                      {detail.value}
                    </span>
                  ) : detail.label === "Certificate" ? (
                    <span className="inline-flex items-center gap-1.5 text-emerald-400">
                      <Award className="w-4 h-4" />
                      {detail.value}
                    </span>
                  ) : (
                    detail.value
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
