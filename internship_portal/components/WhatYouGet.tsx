import Image from "next/image";

export default function WhatYouGet() {
  return (
    <section className="py-24 bg-brandDark-darker relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="mx-auto lg:mx-0 max-w-[420px]">
            <Image
              src="/images/certificate.jpg"
              alt="Verified completion certificate preview"
              width={420}
              height={300}
              className="w-full h-auto rounded-2xl shadow-2xl"
              style={{ objectFit: "contain" }}
              sizes="(max-width: 1024px) 100vw, 420px"
            />
          </div>

          <div className="space-y-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-brandBlue">
                Certification
              </p>
              <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Every Intern Gets This.
              </h2>
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl border border-white/10 bg-brandDark-card/70 p-6 shadow-2xl shadow-black/20">
                <p className="text-white font-semibold text-lg mb-4">Verified Completion Certificate</p>
                <p className="text-slate-400 leading-relaxed">
                  Receive an official document that proves your internship success and strengthens your LinkedIn profile.
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-brandDark-card/70 p-6 shadow-2xl shadow-black/20">
                <p className="text-white font-semibold text-lg mb-4">Letter of Recommendation (LOR)</p>
                <p className="text-slate-400 leading-relaxed">
                  Get a personalized recommendation from your internship mentor for future job applications.
                </p>
              </div>
            </div>

            <p className="text-slate-300 text-base leading-relaxed">
              <span className="text-brandBlue">⭐ Top Interns</span> also win Cash Prizes and Paid Contract Projects.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
