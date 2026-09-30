import { ArrowDown, ArrowRight, Plus } from "lucide-react"
import { Fragment, type CSSProperties } from "react"

import { HeroDemo } from "@/components/hero-demo"
import { RevealObserver } from "@/components/reveal-observer"
import { ScrollStory } from "@/components/scroll-story"
import { VoiceMixer } from "@/components/voice-mixer"
import "./marketing.css"

const handOff = [
  "Rewriting the same summary for the ninth role this week",
  "Reordering bullet points to match a job ad",
  "Typing your uni, your dates, and your address into another portal",
  "Starting every cover letter from a blank page",
]

const keep = ["Where you apply.", "What you claim.", "How you sound.", "When it gets sent."]

const roles = [
  "Graduate Analyst",
  "Junior Developer",
  "Marketing Coordinator",
  "Customer Success Associate",
  "Junior Data Analyst",
  "Graduate Engineer",
  "Policy Officer",
  "Product Intern",
  "UX Researcher",
  "Finance Graduate",
]

const guardrails = [
  [
    "Submit is locked.",
    "Submitting, sending, or posting needs an approval record that only you can create. The assistant has no way to make one.",
  ],
  [
    "You see every action.",
    "Each click and each typed field shows up in the side panel before it happens, on the tab you have open.",
  ],
  [
    "It stays out of your accounts.",
    "cAIreer reads the visible text of the job page. It skips password fields and never stores your cookies.",
  ],
  [
    "Your stories, not invented ones.",
    "Drafts come from the profile you wrote. You can edit or throw away every one of them.",
  ],
]

const log = [
  ["21:14:02", "read", "seek.com.au/job/81234567"],
  ["21:14:05", "match", "3 of 4 asks found in your profile"],
  ["21:14:19", "type", "Cover letter field, 212 words"],
  ["21:14:20", "wait", "Submit needs your approval"],
  ["21:16:41", "you", "Approved after 2 edits"],
  ["21:16:42", "submit", "Application sent"],
]

const faqs = [
  [
    "Does it apply to jobs on its own?",
    "No. It prepares the application and fills in forms while you watch. Only your approval lets it press submit, and that rule lives in the server, not in a setting you might forget about.",
  ],
  [
    "Which job sites does it work with?",
    "Seek first, on job pages you open yourself. It doesn't crawl job boards in the background or apply to things you haven't seen.",
  ],
  [
    "How does it know how I sound?",
    "You set it up once. Upload your résumé, add the experience that never fit on one page, and write a few notes about how you want to come across. You can change them per application.",
  ],
  [
    "When can I use it?",
    "We're building it now and talking to students and early-career job seekers first. Early access opens soon.",
  ],
]

function Wordmark() {
  return (
    <a className="wordmark" href="#top" aria-label="cAIreer home" translate="no">
      c<span>AI</span>reer
    </a>
  )
}

function Words({ text, offset = 0 }: { text: string; offset?: number }) {
  const words = text.split(" ")
  return words.map((word, index) => (
    <Fragment key={index}>
      <span className="word" style={{ "--i": offset + index } as CSSProperties}>
        <span>{word}</span>
      </span>
      {index < words.length - 1 && " "}
    </Fragment>
  ))
}

export default function Page() {
  return (
    <div id="top" className="site">
      <RevealObserver />
      <div className="scroll-meter" aria-hidden="true" />
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <header className="nav">
        <div className="nav-inner shell">
          <Wordmark />
          <nav aria-label="Main">
            <a href="#how">How it works</a>
            <a href="#voice">Your voice</a>
            <a href="#control">Control</a>
            <a href="#faq">FAQ</a>
            <a className="nav-cta" href="#early-access">
              Early access
            </a>
          </nav>
        </div>
      </header>

      <main id="main">
        <section className="hero shell" aria-labelledby="hero-title">
          <p className="kicker hero-kicker">
            <i /> A Chrome side panel for Seek · In development
          </p>
          <h1 id="hero-title" className="hero-title">
            <span className="line">
              <Words text="Less copy-paste." />
            </span>{" "}
            <span className="line">
              <Words text="Same" offset={2} />{" "}
              <span className="word you" style={{ "--i": 3 } as CSSProperties}>
                <span>you.</span>
                <svg viewBox="0 0 220 24" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M4 16 C 50 6, 120 4, 216 12 M 30 20 C 90 14, 150 14, 200 18" />
                </svg>
              </span>
            </span>
          </h1>

          <div className="hero-grid">
            <div className="hero-copy">
              <p>
                Open a job on Seek. cAIreer reads the listing, pulls the right
                experience from your profile, and drafts the cover letter in the voice
                you set. Then it stops. Nothing gets submitted until you approve it.
              </p>
              <div className="hero-actions">
                <a className="btn btn-primary" href="#early-access">
                  Get early access <ArrowRight aria-hidden="true" />
                </a>
                <a className="btn btn-ghost" href="#how">
                  See how it works <ArrowDown aria-hidden="true" />
                </a>
              </div>
              <p className="hero-note">
                For students and early-career job seekers in Australia.
              </p>
            </div>
            <div className="hero-demo-wrap">
              <HeroDemo />
            </div>
          </div>
        </section>

        <div className="marquee" aria-label="Example roles">
          <div className="marquee-track">
            {[0, 1].map((copy) => (
              <ul key={copy} aria-hidden={copy === 1 ? true : undefined}>
                {roles.map((role) => (
                  <li key={role}>{role}</li>
                ))}
              </ul>
            ))}
          </div>
        </div>

        <section className="handoff shell" aria-labelledby="handoff-title">
          <div className="handoff-head">
            <p className="kicker">The trade</p>
            <h2 id="handoff-title">Hand over the busywork.</h2>
          </div>
          <ol className="handoff-list">
            {handOff.map((item, index) => (
              <li key={item} data-reveal style={{ "--i": index } as CSSProperties}>
                <span className="handoff-num">{String(index + 1).padStart(2, "0")}</span>
                <span>
                  <s>{item}</s>
                </span>
              </li>
            ))}
          </ol>
          <div className="keep" data-reveal>
            <h3>Keep the parts that are you.</h3>
            <ul>
              {keep.map((item, index) => (
                <li key={item} style={{ "--i": index } as CSSProperties}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <ScrollStory />

        <section id="voice" className="voice shell" aria-labelledby="voice-title">
          <div className="voice-head" data-reveal>
            <p className="kicker">Your voice</p>
            <h2 id="voice-title">Most AI writing sounds the same. Yours shouldn&apos;t.</h2>
            <p>
              You decide how much confidence goes into a sentence and how formal it
              reads. Set it once, then nudge it per application. Try it on this
              opening line.
            </p>
          </div>
          <VoiceMixer />
        </section>

        <section id="control" className="guard" aria-labelledby="guard-title">
          <div className="shell">
            <p className="kicker">Control</p>
            <h2 id="guard-title" className="guard-title" data-reveal>
              <span>It can type.</span> <em>It can&apos;t press send.</em>
            </h2>
            <div className="guard-grid">
              <div className="guard-rules">
                {guardrails.map(([title, body], index) => (
                  <article key={title} data-reveal style={{ "--i": index } as CSSProperties}>
                    <h3>{title}</h3>
                    <p>{body}</p>
                  </article>
                ))}
              </div>
              <figure className="log" data-reveal>
                <figcaption>
                  <span>Activity</span>
                  <span>Junior Data Analyst</span>
                </figcaption>
                <ol>
                  {log.map(([time, kind, detail], index) => (
                    <li
                      key={time}
                      className={`log-${kind}`}
                      style={{ "--i": index } as CSSProperties}
                    >
                      <time>{time}</time>
                      <b>{kind}</b>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ol>
              </figure>
            </div>
          </div>
        </section>

        <section id="faq" className="faq shell" aria-labelledby="faq-title">
          <h2 id="faq-title">Fair questions.</h2>
          <div className="faq-list">
            {faqs.map(([question, answer]) => (
              <details key={question}>
                <summary>
                  {question}
                  <Plus aria-hidden="true" />
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section id="early-access" className="cta shell" aria-labelledby="cta-title">
          <div className="cta-card" data-reveal>
            <p className="kicker">Early access</p>
            <h2 id="cta-title">Keep your voice. Lose the admin.</h2>
            <div className="cta-status" role="status">
              <i />
              <p>
                <strong>The waitlist opens soon.</strong> We&apos;re not collecting
                email addresses yet. When we are, the form goes right here.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-mark" data-reveal aria-hidden="true">
          {"cAIreer".split("").map((letter, index) => (
            <span
              key={index}
              className={index === 1 || index === 2 ? "is-ai" : undefined}
              style={{ "--i": index } as CSSProperties}
            >
              {letter}
            </span>
          ))}
        </div>
        <div className="footer-row shell">
          <span>© {new Date().getFullYear()} cAIreer</span>
          <nav aria-label="Footer">
            <a href="#how">How it works</a>
            <a href="#voice">Your voice</a>
            <a href="#control">Control</a>
            <a href="#faq">FAQ</a>
          </nav>
        </div>
      </footer>
    </div>
  )
}
