const workflowSteps = [
  {
    number: "01",
    title: "Build your profile",
    description: "Capture the experience, evidence, and voice you want every application to reflect.",
  },
  {
    number: "02",
    title: "Prepare with context",
    description: "Compare each role with your real experience and draft tailored application material.",
  },
  {
    number: "03",
    title: "You make the call",
    description: "Review every consequential action. Nothing is submitted or sent without your approval.",
  },
] as const;

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f4f1e8] text-[#17251d]">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-7 sm:px-10 lg:px-14">
        <a className="flex items-center gap-3" href="#top" aria-label="A2A Hire home">
          <span className="grid size-9 place-items-center rounded-full bg-[#173f2b] text-sm font-bold text-[#f8f4e9]">
            A
          </span>
          <span className="text-lg font-semibold tracking-[-0.03em]">A2A Hire</span>
        </a>
        <span className="rounded-full border border-[#173f2b]/20 bg-white/50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#315440]">
          Foundation · v0.1
        </span>
      </nav>

      <section
        id="top"
        className="mx-auto grid w-full max-w-7xl gap-14 px-6 pb-24 pt-14 sm:px-10 lg:grid-cols-[1.2fr_0.8fr] lg:px-14 lg:pb-32 lg:pt-24"
      >
        <div>
          <p className="mb-6 flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#a3482f]">
            <span className="h-px w-10 bg-current" />
            A job-search assistant on your side
          </p>
          <h1 className="max-w-4xl text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-7xl lg:text-[5.6rem]">
            Scale the effort.
            <span className="block font-serif italic font-normal text-[#a3482f]">Keep your voice.</span>
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-8 text-[#526158] sm:text-xl">
            A2A Hire handles repetitive preparation while you stay in control of your story, standards, and every action that represents you.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <span className="rounded-full bg-[#173f2b] px-6 py-3.5 text-sm font-semibold text-[#f8f4e9] shadow-[0_10px_30px_rgba(23,63,43,0.18)]">
              Candidate profiles coming next
            </span>
            <a className="px-3 py-3 text-sm font-semibold underline decoration-[#a3482f]/50 underline-offset-4" href="#workflow">
              See how control works
            </a>
          </div>
        </div>

        <aside className="relative self-end lg:pb-2">
          <div className="absolute -right-24 -top-24 size-72 rounded-full border border-[#a3482f]/20" />
          <div className="relative rotate-[-1.5deg] rounded-[2rem] border border-[#173f2b]/15 bg-[#fffdf7] p-7 shadow-[0_25px_80px_rgba(49,41,26,0.12)] sm:p-9">
            <div className="flex items-start justify-between gap-6 border-b border-[#173f2b]/10 pb-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#778178]">Your workspace</p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.035em]">Application control centre</p>
              </div>
              <span className="mt-1 size-3 shrink-0 rounded-full bg-[#d69b3b] shadow-[0_0_0_6px_rgba(214,155,59,0.14)]" />
            </div>
            <div className="py-7">
              <p className="text-sm text-[#667169]">Current principle</p>
              <p className="mt-3 font-serif text-3xl leading-tight italic text-[#173f2b]">
                “Automation proposes. You approve.”
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-[#e8efe8] p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-[#667169]">Product state</p>
                <p className="mt-2 font-semibold">Foundation ready</p>
              </div>
              <div className="rounded-2xl bg-[#f6e8df] p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-[#7b6558]">Next slice</p>
                <p className="mt-2 font-semibold">Candidate profile</p>
              </div>
            </div>
          </div>
        </aside>
      </section>

      <section id="workflow" className="border-t border-[#173f2b]/12 bg-[#173f2b] text-[#f8f4e9]">
        <div className="mx-auto w-full max-w-7xl px-6 py-20 sm:px-10 lg:px-14 lg:py-24">
          <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#d6b16f]">The workflow</p>
              <h2 className="mt-4 max-w-sm text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
                Useful automation, with a clear boundary.
              </h2>
            </div>
            <div className="grid gap-px overflow-hidden rounded-3xl border border-white/15 bg-white/15 sm:grid-cols-3">
              {workflowSteps.map((step) => (
                <article className="bg-[#173f2b] p-7 sm:min-h-64" key={step.number}>
                  <p className="font-mono text-xs text-[#d6b16f]">{step.number}</p>
                  <h3 className="mt-10 text-xl font-semibold tracking-[-0.025em]">{step.title}</h3>
                  <p className="mt-4 text-sm leading-6 text-[#c4cec7]">{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
