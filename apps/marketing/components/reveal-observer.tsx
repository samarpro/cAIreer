"use client"

import { useEffect } from "react"

export function RevealObserver() {
  useEffect(() => {
    const root = document.documentElement
    const targets = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]")
    )
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    if (reduceMotion || !("IntersectionObserver" in window)) {
      targets.forEach((target) => (target.dataset.revealed = "true"))
      return
    }

    // Anything already on screen must stay visible, or it would flash hidden
    // for a frame when motion switches on.
    for (const target of targets) {
      const rect = target.getBoundingClientRect()
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        target.dataset.revealed = "true"
      }
    }

    root.dataset.motion = "on"

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const target = entry.target as HTMLElement
          target.dataset.revealed = "true"
          observer.unobserve(target)
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.15 }
    )

    targets
      .filter((target) => !target.dataset.revealed)
      .forEach((target) => observer.observe(target))

    return () => {
      observer.disconnect()
      delete root.dataset.motion
    }
  }, [])

  return null
}
