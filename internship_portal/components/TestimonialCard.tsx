'use client';

import { useState } from "react";
import { Star, User } from "lucide-react";
import Image from "next/image";

export default function TestimonialCard({ testimonial, isPlaceholder = false }: { testimonial?: any, isPlaceholder?: boolean }) {
  const [expanded, setExpanded] = useState(false);

  // Fallback data for placeholders
  const name = isPlaceholder ? 'Intern Name' : (testimonial?.interns?.full_name || 'Intern Name');
  const uni = isPlaceholder ? 'University — Semester X' : (testimonial?.interns?.university || 'University');
  const rating = isPlaceholder ? 5 : (testimonial?.rating || 5);
  const text = isPlaceholder ? "This internship gave me real project experience that I couldn't get anywhere else. Highly recommended for any CS student." : (testimonial?.review_text || "");
  const batch = isPlaceholder ? 'Batch 1 — Coming Soon' : (testimonial?.batch_name || 'CloudExify Internship');
  const profilePic = !isPlaceholder && testimonial?.interns?.profile_picture_url;

  return (
    <article
      className="group snap-center w-[350px] sm:w-[400px] shrink-0 rounded-3xl border border-white/10 bg-brandDark-card/70 p-8 shadow-2xl shadow-black/20 transition-all duration-300 hover:border-brandBlue/40 hover:shadow-[0_0_60px_rgba(56,189,248,0.18)] flex flex-col"
    >
      <div className="flex items-center gap-4 mb-6 shrink-0">
        {profilePic ? (
          <div className="relative h-16 w-16 overflow-hidden rounded-full border border-white/10">
            <Image src={profilePic} alt={name} fill className="object-cover" />
          </div>
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-brandBlue shrink-0">
            <User className="h-8 w-8" />
          </div>
        )}
        <div>
          <p className="text-white font-semibold">{name}</p>
          <p className="text-slate-400 text-sm mt-1">{uni}</p>
        </div>
      </div>

      <div className="flex items-center gap-1 mb-4 shrink-0">
        {Array.from({ length: 5 }).map((_, starIndex) => (
          <Star key={starIndex} className={`h-4 w-4 ${starIndex < rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
        ))}
      </div>

      <div className="mb-6 flex-grow">
        <p className={`text-slate-300 leading-relaxed whitespace-normal ${!expanded ? 'line-clamp-4' : ''}`}>
          &quot;{text}&quot;
        </p>
        {text.length > 150 && (
          <button 
            onClick={() => setExpanded(!expanded)}
            className="text-brandBlue text-sm font-semibold mt-2 hover:underline focus:outline-none"
          >
            {expanded ? 'Show Less' : 'See More'}
          </button>
        )}
      </div>

      <div className="shrink-0 mt-auto">
        <span className="inline-flex items-center rounded-full bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 border border-white/10">
          {batch}
        </span>
      </div>
    </article>
  );
}
