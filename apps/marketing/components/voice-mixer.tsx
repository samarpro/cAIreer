"use client"

import { Fragment, useId, useState, type CSSProperties } from "react"

const confidenceLevels = ["Modest", "Steady", "Bold"]
const toneLevels = ["Casual", "Balanced", "Formal"]

// Rows are confidence, columns are tone.
const openings = [
  [
    "I'm still early in my career, but I've spent the last year getting properly comfortable with SQL, mostly by building a sales dashboard for my capstone. I'd love the chance to keep learning on a team like yours.",
    "I'm early in my career, and I've spent the past year building real SQL experience, most recently a sales dashboard for my capstone project. I'd welcome the chance to keep growing on your team.",
    "Although I am at the start of my career, I have spent the past year developing practical SQL skills, most recently through a sales reporting dashboard for my capstone project. I would value the opportunity to continue developing with your team.",
  ],
  [
    "I built a sales dashboard in SQL for my capstone, and the team actually used it every week. That's the kind of work I want more of, and it's why this role caught my eye.",
    "For my capstone I built a SQL sales dashboard that the team used every week. That's the work I want to keep doing, and it's why this role stood out to me.",
    "For my capstone project, I designed a SQL sales dashboard that the team relied on for weekly reporting. This role closely matches the work I intend to pursue.",
  ],
  [
    "I built a SQL dashboard that cut my capstone team's weekly reporting from two days to one hour. Send me your messiest spreadsheet and I'll show you what I mean.",
    "I cut my capstone team's weekly reporting from two days to one hour with a SQL dashboard I built from scratch. I'd bring that same focus to your data from week one.",
    "I reduced my capstone team's weekly reporting time from two days to one hour by designing a SQL dashboard from the ground up. I am confident I can deliver similar results for your team.",
  ],
]

type DialProps = {
  label: string
  options: string[]
  value: number
  onChange: (value: number) => void
}

function Dial({ label, options, value, onChange }: DialProps) {
  const name = useId()

  return (
    <fieldset className="dial">
      <legend>{label}</legend>
      <div className="dial-track" style={{ "--value": value } as CSSProperties}>
        <span className="dial-thumb" aria-hidden="true" />
        {options.map((option, index) => (
          <Fragment key={option}>
            <input
              type="radio"
              id={`${name}-${index}`}
              name={name}
              checked={value === index}
              onChange={() => onChange(index)}
            />
            <label htmlFor={`${name}-${index}`}>{option}</label>
          </Fragment>
        ))}
      </div>
    </fieldset>
  )
}

export function VoiceMixer() {
  const [confidence, setConfidence] = useState(1)
  const [tone, setTone] = useState(1)
  const words = openings[confidence]![tone]!.split(" ")

  return (
    <div className="mixer">
      <div className="mixer-controls">
        <Dial
          label="Confidence"
          options={confidenceLevels}
          value={confidence}
          onChange={setConfidence}
        />
        <Dial label="Tone" options={toneLevels} value={tone} onChange={setTone} />
        <p className="mixer-note">
          Example only. In cAIreer, every claim comes from the profile you wrote.
        </p>
      </div>

      <figure className="mixer-output">
        <figcaption>
          <span>Cover letter opening · Junior Data Analyst</span>
          <span>
            {confidenceLevels[confidence]} · {toneLevels[tone]}
          </span>
        </figcaption>
        <div aria-live="polite">
          <p key={`${confidence}-${tone}`}>
            {words.map((word, index) => (
              <Fragment key={index}>
                <span style={{ "--i": index } as CSSProperties}>{word}</span>{" "}
              </Fragment>
            ))}
          </p>
        </div>
      </figure>
    </div>
  )
}
