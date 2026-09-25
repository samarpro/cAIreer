"use client"

import { Check, Lock, MousePointer2 } from "lucide-react"
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react"

type Step = { label: string; title: string; body: string; visual: ReactNode }

function ListingVisual() {
  return (
    <div className="v-frame v-listing">
      <div className="v-toolbar">
        <span>seek.com.au/job/81234567</span>
        <b className="v-extension">c</b>
      </div>
      <div className="v-page">
        <small>Harbour &amp; Co</small>
        <strong>Junior Data Analyst</strong>
        <i className="wide" />
        <i />
        <i className="short" />
        <i className="wide" />
        <i />
      </div>
      <div className="v-panel">
        <b>
          c<span>AI</span>reer
        </b>
        <p>Want me to read this listing?</p>
        <span>Yes, read it</span>
      </div>
      <MousePointer2 className="v-cursor" aria-hidden="true" />
    </div>
  )
}

const matchRows = [
  ["SQL", "Capstone: sales dashboard, 2025"],
  ["Weekly reporting", "Retail team lead, 2 years"],
  ["Explaining findings", "Tutoring first-year stats"],
  ["Python", "No match yet"],
]

function MatchVisual() {
  return (
    <div className="v-frame v-match">
      <div className="v-match-head">
        <small>The ad asks for</small>
        <small>From your profile</small>
      </div>
      {matchRows.map(([ask, source], index) => (
        <div
          key={ask}
          className={index === matchRows.length - 1 ? "v-row is-gap" : "v-row"}
          style={{ "--i": index } as CSSProperties}
        >
          <span className="v-ask">{ask}</span>
          <i className="v-link" />
          <span className="v-source">{source}</span>
        </div>
      ))}
    </div>
  )
}

function DraftVisual() {
  return (
    <div className="v-frame v-draft">
      <header>
        <small>Cover letter · Harbour &amp; Co</small>
        <div>
          <span>Confident, not loud</span>
          <span>Plain English</span>
        </div>
      </header>
      <p style={{ "--i": 0 } as CSSProperties}>Hi Harbour team,</p>
      <p style={{ "--i": 1 } as CSSProperties}>
        Last semester I built a SQL dashboard that cut my capstone team&apos;s
        reporting from <mark>two days to one hour</mark>.
      </p>
      <p style={{ "--i": 2 } as CSSProperties}>
        I also spent two years leading a retail team, which taught me to explain
        numbers to people who have somewhere else to be.
      </p>
      <aside>Source: Capstone project, your profile</aside>
    </div>
  )
}

function ApproveVisual() {
  return (
    <div className="v-frame v-approve">
      <small>Ready for you</small>
      <strong>Junior Data Analyst · Harbour &amp; Co</strong>
      <ul>
        <li>
          <Check aria-hidden="true" /> Résumé tailored
        </li>
        <li>
          <Check aria-hidden="true" /> Cover letter, edited by you
        </li>
        <li>
          <Check aria-hidden="true" /> Form fields filled in
        </li>
      </ul>
      <div className="v-gate">
        <span className="v-before">
          <Lock aria-hidden="true" /> Submit is locked until you approve
        </span>
        <span className="v-after">
          <Check aria-hidden="true" /> Approved by you · 9:14 pm
        </span>
        <b className="v-approve-btn">
          <span className="v-before">Approve</span>
          <span className="v-after">Sent</span>
        </b>
      </div>
      <MousePointer2 className="v-cursor" aria-hidden="true" />
    </div>
  )
}

const steps: Step[] = [
  {
    label: "Open",
    title: "Open a job you actually want.",
    body: "Browse Seek the way you already do. When a listing looks right, open the cAIreer side panel. It only works on the tab in front of you.",
    visual: <ListingVisual />,
  },
  {
    label: "Match",
    title: "It reads the ad properly.",
    body: "cAIreer pulls out what the employer is asking for and lines each point up with real experience from your profile. Gaps show up as gaps.",
    visual: <MatchVisual />,
  },
  {
    label: "Draft",
    title: "It writes like you wrote it.",
    body: "Drafts follow the voice notes you set: how confident, how formal, which stories you lead with. Edit any line. Bin the whole thing if you want.",
    visual: <DraftVisual />,
  },
  {
    label: "Approve",
    title: "You approve, or it doesn't go.",
    body: "cAIreer can fill in the form while you watch. Pressing submit needs an approval that only you can give.",
    visual: <ApproveVisual />,
  },
]

export function ScrollStory() {
  const sectionRef = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    let frame = 0

    function update() {
      frame = 0
      if (!section) return
      const rect = section.getBoundingClientRect()
      const distance = rect.height - window.innerHeight
      const progress =
        distance > 0 ? Math.min(1, Math.max(0, -rect.top / distance)) : 0
      section.style.setProperty("--progress", progress.toFixed(4))
      setActive(Math.min(steps.length - 1, Math.floor(progress * steps.length)))
    }

    function schedule() {
      if (!frame) frame = requestAnimationFrame(update)
    }

    schedule()
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
    }
  }, [])

  function jumpTo(index: number) {
    const section = sectionRef.current
    if (!section) return
    const distance = section.offsetHeight - window.innerHeight
    const top =
      section.getBoundingClientRect().top +
      window.scrollY +
      ((index + 0.5) / steps.length) * distance
    window.scrollTo({ top, behavior: "smooth" })
  }

  return (
    <section
      ref={sectionRef}
      id="how"
      className="story"
      aria-labelledby="how-title"
      style={{ "--steps": steps.length } as CSSProperties}
    >
      <div className="story-sticky shell">
        <header className="story-head">
          <p className="kicker" id="how-title">
            How it works
          </p>
          <nav className="story-rail" aria-label="Steps">
            {steps.map((step, index) => (
              <button
                key={step.label}
                type="button"
                onClick={() => jumpTo(index)}
                aria-current={active === index ? "step" : undefined}
                style={{ "--i": index } as CSSProperties}
              >
                <span>
                  {String(index + 1).padStart(2, "0")} {step.label}
                </span>
                <i />
              </button>
            ))}
          </nav>
        </header>

        <div className="story-steps">
          {steps.map((step, index) => (
            <div
              key={step.label}
              className={active === index ? "story-step is-active" : "story-step"}
            >
              <div className="story-text">
                <span className="story-num">{String(index + 1).padStart(2, "0")}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
              <div className="story-visual" aria-hidden="true">
                {step.visual}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
