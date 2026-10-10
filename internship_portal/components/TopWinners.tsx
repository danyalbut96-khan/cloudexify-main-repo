export default function TopWinners() {
  return (
    <section className="py-24 bg-brandDark relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-brandBlue">
            Rewards
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Exciting Cash Prizes & Recognition.
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left mt-12">
            {/* Card 1 — Gold */}
            <div className="rounded-3xl border border-white/10 bg-brandDark-card/70 p-6 shadow-2xl shadow-black/20 flex flex-col justify-between">
              <div>
                <p className="text-amber-400 text-sm font-semibold uppercase tracking-[0.24em] mb-2 flex items-center gap-1">
                  🥇 Rank 1
                </p>
                <p className="text-[#FFD700] text-3xl font-black mb-1 select-none">
                  ₨ 5,000
                </p>
              </div>
              <p className="text-slate-300 text-sm font-medium mt-2">+ Certificate + LOR</p>
            </div>

            {/* Card 2 — Silver */}
            <div className="rounded-3xl border border-white/10 bg-brandDark-card/70 p-6 shadow-2xl shadow-black/20 flex flex-col justify-between">
              <div>
                <p className="text-slate-300 text-sm font-semibold uppercase tracking-[0.24em] mb-2 flex items-center gap-1">
                  🥈 Rank 2
                </p>
                <p className="text-slate-200 text-3xl font-black mb-1 select-none">
                  ₨ 3,000
                </p>
              </div>
              <p className="text-slate-300 text-sm font-medium mt-2">+ Certificate + LOR</p>
            </div>

            {/* Card 3 — Bronze */}
            <div className="rounded-3xl border border-white/10 bg-brandDark-card/70 p-6 shadow-2xl shadow-black/20 flex flex-col justify-between">
              <div>
                <p className="text-orange-400 text-sm font-semibold uppercase tracking-[0.24em] mb-2 flex items-center gap-1">
                  🥉 Rank 3
                </p>
                <p className="text-orange-300 text-3xl font-black mb-1 select-none">
                  ₨ 2,000
                </p>
              </div>
              <p className="text-slate-300 text-sm font-medium mt-2">+ Certificate + LOR</p>
            </div>

            {/* Card 4 — All interns */}
            <div className="rounded-3xl border border-white/10 bg-brandDark-card/70 p-6 shadow-2xl shadow-black/20 flex flex-col justify-between">
              <div>
                <p className="text-emerald-400 text-sm font-semibold uppercase tracking-[0.24em] mb-2 flex items-center gap-1">
                  🎓 All Interns
                </p>
                <p className="text-[#34A853] text-xl font-extrabold mb-1 select-none">
                  Certificate
                </p>
              </div>
              <p className="text-slate-400 text-xs font-medium mt-2">Guaranteed on completion</p>
            </div>
          </div>

          <p className="text-[12px] text-white/40 text-center mt-8">
            💰 Cash prizes transferred directly to winner&apos;s account after internship completion.
          </p>
        </div>
      </div>
    </section>
  );
}
