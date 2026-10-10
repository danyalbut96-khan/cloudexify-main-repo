import { Star } from "lucide-react";
import { getAdminClient } from '@/lib/supabase/server';
import { unstable_noStore as noStore } from "next/cache";
import TestimonialCard from "./TestimonialCard";

export default async function Testimonials() {
  noStore();
  const supabase = getAdminClient();

  const { data: testimonials } = await supabase
    .from('testimonials')
    .select(`
      id,
      rating,
      review_text,
      batch_name,
      created_at,
      interns (
        full_name,
        university,
        semester
      )
    `)
    .eq('status', 'approved')
    .order('rating', { ascending: false })
    .order('created_at', { ascending: false });

  // Get average rating for approved testimonials
  const totalReviews = testimonials?.length || 0;
  const avgRating = totalReviews > 0
    ? (testimonials!.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1)
    : "5.0";

  const displayTestimonials = testimonials?.slice(0, 30) || [];
  const hasTestimonials = displayTestimonials.length > 0;

  return (
    <section className="py-24 bg-brandDark relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-brandBlue">
            Testimonials
          </p>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            What Our Interns Say
          </h2>
          <p className="mt-4 text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {hasTestimonials ? "Real words from our successful interns" : "Real words from our first batch — coming soon"}
          </p>

          {hasTestimonials && (
            <div className="mt-8 flex flex-col items-center justify-center space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-5xl font-black text-white">{avgRating}</span>
                <div className="flex flex-col items-start justify-center">
                  <div className="flex items-center text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-5 w-5 ${i < Math.round(Number(avgRating)) ? 'fill-amber-400' : 'text-slate-600'}`} />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-slate-400 mt-1">Based on {totalReviews} reviews</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-12 w-full">
          <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {hasTestimonials ? displayTestimonials.map((testimonial: any) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            )) : (
              // Placeholder when no testimonials
              Array.from({ length: 4 }).map((_, index) => (
                <TestimonialCard key={index} isPlaceholder={true} />
              ))
            )}
          </div>
        </div>

        {!hasTestimonials && (
          <p className="mt-8 text-center text-slate-500 text-sm max-w-2xl mx-auto">
            Testimonials will be updated after Batch 1 completes.
          </p>
        )}
      </div>
    </section>
  );
}
