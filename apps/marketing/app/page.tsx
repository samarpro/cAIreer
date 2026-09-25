import {
  ArrowDown,
  ArrowRight,
  Check,
  CheckCircle2,
  Circle,
  FileCheck2,
  Fingerprint,
  LockKeyhole,
  Radar,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react"

import { CursorField } from "@/components/cursor-field"
import "./marketing.css"

const steps = [
  ["I", "Lay out the material", "Bring the projects, constraints, preferences, and rough edges that a normal resume leaves behind."],
  ["II", "Name your standard", "Choose the kind of work, tone, and boundaries you are willing to stand behind."],
  ["III", "Approve the act", "Read the draft in plain view. Change it freely. Nothing external happens until you say yes."],
]

const principles = [
  [Fingerprint, "Sound like yourself", "Set the tone and edit every draft. If a sentence feels wrong, it does not leave."],
  [LockKeyhole, "Nothing sends itself", "Every application and note waits for you. You see the exact words before anyone else does."],
  [ShieldCheck, "Share less by default", "cAIreer uses the information needed for the task and leaves the rest alone."],
] as const

function Wordmark() {
  return <a className="wordmark" href="#top" aria-label="cAIreer home" translate="no"><span>c</span>cAIreer</a>
}

function StoicSeal() {
  return (
    <div className="stoic-seal" aria-hidden="true">
      <span>focus</span>
      <i />
      <span>on what is yours</span>
    </div>
  )
}

function ProductPreview() {
  return (
    <div className="preview" role="img" aria-label="Illustrative cAIreer application workspace showing roles assessed and drafts waiting for approval">
      <div className="preview-bar">
        <i /><i /><i />
        <span>Draft chamber</span>
        <b><i /> Waiting</b>
      </div>
      <div className="preview-layout">
        <aside className="preview-side">
          <em>c</em><i className="active" /><i /><i /><small>SK</small>
        </aside>
        <div className="preview-main">
          <header className="preview-heading">
            <div><span className="preview-label">TODAY&apos;S WORK</span><h3>Three honest drafts.</h3></div>
            <span className="preview-action">Review bench <span>3</span></span>
          </header>
          <div className="signal-grid">
            <article className="signal match">
              <div className="signal-icon"><Radar size={17} aria-hidden="true" /></div>
              <p><small>Worth attention</small><strong>Product Analyst</strong><small>Strong fit · Melbourne</small></p>
              <b>88</b>
            </article>
            <article className="signal"><span className="preview-label">THIS WEEK</span><strong className="metric">12</strong><small>roles weighed</small></article>
            <article className="signal dark"><Sparkles size={16} aria-hidden="true" /><p>2 drafts are ready for judgment.</p><ArrowRight size={16} aria-hidden="true" /></article>
          </div>
          <div className="application-panel">
            <header><div><span className="preview-label">APPLICATION IN REVIEW</span><h4>Associate Product Manager</h4></div><span>At your desk</span></header>
            <div className="application-body">
              <div className="document">
                <div className="doc-head"><b>S</b><p><strong>Sam Kanu</strong><small>Product · AI · Operations</small></p></div>
                <i className="wide" /><i /><i className="medium" /><hr /><i className="wide" /><i className="short" />
              </div>
              <div className="review-list">
                <div><CheckCircle2 aria-hidden="true" /><p><strong>Stories chosen</strong><small>3 grounded examples</small></p></div>
                <div><CheckCircle2 aria-hidden="true" /><p><strong>Tone restrained</strong><small>Clear, not inflated</small></p></div>
                <div className="current"><Circle aria-hidden="true" /><p><strong>Your judgment</strong><small>Required before sending</small></p></div>
                <span className="review-action">Read the draft <ArrowRight aria-hidden="true" /></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FlowDiagram() {
  const nodes = [
    [Search, "NOTICE", "A role worth weighing"],
    [Sparkles, "COMPOSE", "Your story, shaped"],
    [UserRound, "JUDGMENT", "You examine the work"],
    [FileCheck2, "ACTION", "Only after approval"],
  ] as const
  return (
    <div className="flow-card">
      {nodes.map(([Icon, meta, title], index) => (
        <div className="flow-item" key={title}>
          <article className={index === 2 ? "flow-node accent" : "flow-node"}>
            <span><Icon aria-hidden="true" /></span><span className="flow-meta">{meta}</span><strong>{title}</strong>
          </article>
          {index < nodes.length - 1 && <ArrowRight className="flow-arrow" aria-hidden="true" />}
        </div>
      ))}
    </div>
  )
}

export default function Page() {
  return (
    <div id="top" className="marketing-page">
      <CursorField />
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <nav className="site-nav" aria-label="Main navigation">
        <Wordmark />
        <div className="nav-links">
          <a href="#how-it-works">How it works</a><a href="#control">Your control</a>
          <a href="#early-access" className="nav-cta">Join early access <ArrowRight aria-hidden="true" /></a>
        </div>
      </nav>

      <main id="main-content">
      <section className="hero shell">
        <div className="hero-rings" aria-hidden="true" />
        <div className="hero-copy">
          <div className="availability"><i /> Private research preview</div>
          <h1>Keep showing up.<br /><span>We&apos;ll carry the repetition.</span></h1>
          <p>You bring your story and judgment. cAIreer keeps the search moving, prepares each application, and waits for your approval.</p>
          <div className="hero-actions">
            <a className="primary-button" href="#early-access">Join early access <ArrowRight aria-hidden="true" /></a>
            <a className="secondary-button" href="#how-it-works">Read the method <ArrowDown aria-hidden="true" /></a>
          </div>
          <small className="hero-note"><Check aria-hidden="true" /> Built for ambitious students and early-career professionals who want help, not replacement</small>
        </div>
        <div className="hero-preview-wrap">
          <StoicSeal />
          <ProductPreview />
        </div>
      </section>

      <section className="statement shell section-pad">
        <p className="kicker">WHAT IS YOURS</p>
        <div>
          <h2>You cannot control the outcome. You can control the work.</h2>
          <aside><p>Choose the roles. Tell the truth about your experience. Decide how you want to be seen. Those choices stay with you.</p><strong>Searching, sorting, and reformatting do not need your best hours.</strong></aside>
        </div>
      </section>

      <section id="how-it-works" className="process shell section-pad">
        <div className="section-heading"><p className="kicker">THE METHOD</p><h2>Do the work that needs you. Hand off the rest.</h2><p>cAIreer handles the searching, sorting, and first draft. You make the choices that shape your reputation.</p></div>
        <FlowDiagram />
        <div className="steps">
          {steps.map(([number, title, body]) => <article key={number}><span>{number}</span><div><h3>{title}</h3><p>{body}</p></div></article>)}
        </div>
      </section>

      <section id="control" className="control">
        <div className="shell control-inner">
          <div className="control-copy"><p className="kicker">YOUR CONTROL</p><h2>Nothing speaks for you without you.</h2><p>Every draft stays visible. Every boundary stays clear. Every application waits for your approval.</p></div>
          <div className="principles">
            {principles.map(([Icon, title, body]) => <article key={title}><Icon aria-hidden="true" /><h3>{title}</h3><p>{body}</p></article>)}
          </div>
        </div>
      </section>

      <section className="perspective shell section-pad">
        <div className="perspective-card">
          <div className="orbit-wrap"><i className="orbit one" /><i className="orbit two" /><b>c</b></div>
          <div className="perspective-copy"><p className="kicker">A STEADIER PRACTICE</p><h2>Make consistency easier. Keep judgment human.</h2><p>Each correction improves the next draft. Each approved story becomes useful context. cAIreer learns your standards while you remain the author.</p></div>
        </div>
      </section>

      <section id="early-access" className="cta shell">
        <div className="cta-card">
          <span className="cta-icon"><Sparkles aria-hidden="true" /></span><p className="kicker">EARLY ACCESS</p>
          <h2>You have enough to carry.</h2>
          <p>We are speaking with students and early-career professionals who want help staying consistent without handing over their voice.</p>
          <div className="waitlist-status" role="status">
            <span>Waitlist opens soon</span>
            <small>Signup storage is being connected. We are not collecting email addresses yet.</small>
          </div>
        </div>
      </section>
      </main>

      <footer className="site-footer shell"><Wordmark /><p>Keep the judgment. Lose the repetition.</p><span>© {new Date().getFullYear()} cAIreer</span></footer>
    </div>
  )
}
