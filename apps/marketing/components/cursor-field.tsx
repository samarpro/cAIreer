"use client"

import { useEffect, useRef } from "react"

export function CursorField() {
  const fieldRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const field = fieldRef.current

    if (!field || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return
    }

    let frame = 0

    function followCursor(event: PointerEvent) {
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(() => {
        fieldRef.current?.style.setProperty("--cursor-x", `${event.clientX}px`)
        fieldRef.current?.style.setProperty("--cursor-y", `${event.clientY}px`)
      })
    }

    window.addEventListener("pointermove", followCursor, { passive: true })

    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener("pointermove", followCursor)
    }
  }, [])

  return <div ref={fieldRef} className="cursor-field" aria-hidden="true" />
}
