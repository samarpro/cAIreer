"use client"

import { Lock } from "lucide-react"
import { useEffect, useRef, useState, type CSSProperties } from "react"

const DRAFT =
  "Last semester I built a SQL dashboard that cut my capstone team's weekly reporting from two days to one hour. Your ad asks for someone who can make data useful to people outside the data team. That's the part of the work I like most."

const PHASES = [
  { id: "read", ms: 2800 },
  { id: "match", ms: 2200 },
  { id: "draft", ms: 5600 },
  { id: "wait", ms: 4400 },
] as const

const CYCLE_MS = PHASES.reduce((total, phase) => total + phase.ms, 0)
const DRAFT_PHASE = 2
const TYPING_SHARE = 0.85

const matches = [
  ["SQL", "Capstone dashboard"],
  ["Weekly reporting", "Retail team lead"],
  ["Explaining findings", "Stats tutoring"],
]

type Frame = { phase: number; chars: number }

function frameAt(elapsed: number): Frame {
  let phase = 0
  let phaseStart = 0
  while (elapsed >= phaseStart + PHASES[phase]!.ms) {
    phaseStart += PHASES[phase]!.ms
    phase += 1
  }

  if (phase < DRAFT_PHASE) return { phase, chars: 0 }
  if (phase > DRAFT_PHASE) return { phase, chars: DRAFT.length }

  const typingMs = PHASES[DRAFT_PHASE].ms * TYPING_SHARE
  const share = Math.min(1, (elapsed - phaseStart) / typingMs)
  return { phase, chars: Math.round(share * DRAFT.length) }
}

export function HeroDemo() {
  const rootRef = useRef<HTMLDivElement>(null)
  const [frame, setFrame] = useState<Frame>({ phase: 0, chars: 0 })

  useEffect(() => {
    const root = rootRef.current
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return
    }

    let raf = 0
    let start = performance.now()
    let pausedAt: number | null = null

    function tick(now: number) {
      const next = frameAt((now - start) % CYCLE_MS)
      setFrame((prev) =>
        prev.phase === next.phase && prev.chars === next.chars ? prev : next
      )
      raf = requestAnimationFrame(tick)
    }

    // Pause the loop while the demo is off screen so it costs nothing.
    const observer = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(raf)
      if (entry?.isIntersecting) {
        if (pausedAt !== null) start += performance.now() - pausedAt
        pausedAt = null
        raf = requestAnimationFrame(tick)
      } else {
        pausedAt = performance.now()
      }
    })
    observer.observe(root)

    return () => {
      observer.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [])

  const { phase, chars } = frame
  const on = (from: number) => (phase >= from ? " is-on" : "")

  return (
    <div
      ref={rootRef}
      className="demo"
      data-step={phase}
      role="img"
      aria-label="Illustration: cAIreer reads a Junior Data Analyst listing on Seek, matches three requirements to the user's profile, drafts a cover letter opening, then waits for the user's approval before anything is submitted."
    >
      <div className="demo-bar">
        <i />
        <i />
        <i />
        <span>seek.com.au/job/81234567</span>
      </div>

      <div className="demo-body">
        <article className="demo-listing">
          <p className="demo-eyebrow">Harbour &amp; Co · Melbourne VIC</p>
          <h3>Junior Data Analyst</h3>
          <p className="demo-meta">Full time · Graduates welcome</p>
          <h4>What you&apos;ll do</h4>
          <ul>
            <li>
              Write <mark style={{ "--i": 0 } as CSSProperties}>SQL</mark> to
              answer questions from the sales team
            </li>
            <li>
              Own the <mark style={{ "--i": 1 } as CSSProperties}>weekly reporting</mark>{" "}
              pack
            </li>
            <li>
              <mark style={{ "--i": 2 } as CSSProperties}>Explain findings</mark> to
              people outside the data team
            </li>
          </ul>
          <div className="demo-scan" />
        </article>

        <aside className="demo-panel">
          <header>
            <b>
              c<span>AI</span>reer
            </b>
            <small>side panel</small>
          </header>

          <div className="demo-msg is-on">
            <span className="demo-thinking">Reading the listing</span>
            <span className="demo-read">
              Read the listing. 3 of its asks match your profile.
            </span>
          </div>

          <ul className={"demo-matches" + on(1)}>
            {matches.map(([ask, source], index) => (
              <li key={ask} style={{ "--i": index } as CSSProperties}>
                <span>{ask}</span>
                <i />
                <span>{source}</span>
              </li>
            ))}
          </ul>

          <div className={"demo-draft" + on(2)}>
            <small>Cover letter · opening</small>
            <p>
              {DRAFT.slice(0, chars)}
              {phase === DRAFT_PHASE && <span className="demo-caret" />}
              <span className="demo-ghost">{DRAFT.slice(chars)}</span>
            </p>
          </div>

          <div className={"demo-approve" + on(3)}>
            <span className="demo-locked">
              <Lock aria-hidden="true" /> Submit
            </span>
            <span className="demo-review">Review and approve</span>
          </div>
          <p className={"demo-count" + on(3)}>Sent without asking: 0</p>
        </aside>
      </div>
    </div>
  )
}
