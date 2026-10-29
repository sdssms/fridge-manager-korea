'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

const EASE = 'cubic-bezier(0.32,0.72,0,1)'

/**
 * Gentle, heavy fade-up on viewport entry (design system B7).
 * Uses IntersectionObserver, never a scroll listener.
 *
 * SSR and the first client render both start hidden (opacity 0), so markup
 * matches and there is no hydration mismatch. The reveal is driven only by the
 * observer callback (or a rAF fallback), never by a synchronous setState in the
 * effect body.
 */
export function Reveal({
  children,
  delay = 0,
  as: Tag = 'div',
  className = '',
}: {
  children: ReactNode
  delay?: number
  as?: 'div' | 'section' | 'li' | 'span'
  className?: string
}) {
  const ref = useRef<HTMLElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (typeof IntersectionObserver === 'undefined') {
      const raf = requestAnimationFrame(() => setShown(true))
      return () => cancelAnimationFrame(raf)
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true)
            observer.disconnect()
          }
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.15 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const Comp = Tag as 'div'
  return (
    <Comp
      ref={ref as React.Ref<HTMLDivElement>}
      className={className}
      style={{
        transition: `opacity 800ms ${EASE} ${delay}ms, transform 800ms ${EASE} ${delay}ms, filter 800ms ${EASE} ${delay}ms`,
        opacity: shown ? 1 : 0,
        transform: shown ? 'translateY(0)' : 'translateY(64px)',
        filter: shown ? 'blur(0)' : 'blur(6px)',
      }}
    >
      {children}
    </Comp>
  )
}

/**
 * Tagline reveal (design system B11): each word activates one at a time from a
 * muted tone to full color as the section crosses the viewport.
 */
export function WordReveal({ text, className = '' }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const words = text.split(' ')
  // Deterministic initial state for SSR/first client render: nothing active.
  const [active, setActive] = useState(0)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (typeof IntersectionObserver === 'undefined') {
      const raf = requestAnimationFrame(() => setActive(words.length))
      return () => cancelAnimationFrame(raf)
    }
    let timer = 0
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        let i = 0
        const step = () => {
          i += 1
          setActive(i)
          if (i < words.length) timer = window.setTimeout(step, 90) as unknown as number
        }
        timer = window.setTimeout(step, 90) as unknown as number
        observer.disconnect()
      },
      { threshold: 0.4 },
    )
    observer.observe(node)
    return () => {
      observer.disconnect()
      clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <p ref={ref} className={className} style={{ textWrap: 'balance' }}>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          style={{
            transition: `color 500ms ${EASE}, opacity 500ms ${EASE}`,
            color: i < active ? 'inherit' : 'rgba(23,23,23,0.28)',
            opacity: i < active ? 1 : 0.6,
          }}
        >
          {word}
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </p>
  )
}
