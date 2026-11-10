// A small tip behind a button: it opens on hover, keyboard focus or a tap, and
// stays open while the pointer is over it, so the links and buttons inside it can
// be used. Escape, a tap elsewhere or moving the pointer away closes it.
//
// The tip is drawn at the end of the page with fixed positioning (tipPlace), above
// every other layer, so a sticky table header, the footer or a panel never covers it.
// Tab still moves from the button into the tip and on out of it, as if it sat there.

import { useEffect, useId, useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { tipPlace } from './tip-place.ts'
import type { TipBox } from './tip-place.ts'

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function HoverTip({ label, trigger, triggerStyle, openStyle, above = false, beside = false, width = 340, children }: {
  /** What the tip is, read out by screen readers for the button and the tip. */
  label: string
  /** What the button shows: an icon or a word. */
  trigger: ReactNode
  triggerStyle: CSSProperties
  /** Extra style for the button while the tip is open. */
  openStyle?: CSSProperties
  /** Open above the button, centred over it and kept inside the window, for a button
   *  in the footer, which spans the whole window. */
  above?: boolean
  /** Open to the left of the button, level with it, for a button in a slim right-hand column. */
  beside?: boolean
  width?: number
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  // Below the button the tip lines up with the button's right edge where it fits, and
  // stays inside the main column, clear of the tool rail, where not. Above, it is
  // centred over the button and stays inside the window.
  const [place, setPlace] = useState<TipBox>({ left: 0, width })
  const id = useId()
  const wrap = useRef<HTMLSpanElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  const tip = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<number | undefined>(undefined)
  const within = (node: Node | null) => !!node && (!!wrap.current?.contains(node) || !!tip.current?.contains(node))

  const measure = () => {
    const r = button.current?.getBoundingClientRect()
    if (!r) return
    setPlace(tipPlace({
      button: r,
      area: wrap.current?.closest('main')?.getBoundingClientRect(),
      viewport: { width: window.innerWidth, height: window.innerHeight },
      side: above ? 'above' : beside ? 'beside' : 'below',
      width,
    }))
  }
  const show = () => {
    window.clearTimeout(closeTimer.current)
    measure()
    setOpen(true)
  }
  const keep = () => window.clearTimeout(closeTimer.current)
  // A short delay lets the pointer cross the gap between the button and the tip.
  const hideSoon = () => {
    window.clearTimeout(closeTimer.current)
    closeTimer.current = window.setTimeout(() => setOpen(false), 150)
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    const onDown = (e: PointerEvent) => { if (!within(e.target as Node)) setOpen(false) }
    // Fixed to the window, the tip follows its button when anything scrolls or the window resizes.
    const onMove = () => measure()
    window.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onDown)
    window.addEventListener('scroll', onMove, { capture: true, passive: true })
    window.addEventListener('resize', onMove)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onDown)
      window.removeEventListener('scroll', onMove, { capture: true })
      window.removeEventListener('resize', onMove)
    }
  }, [open, above, beside, width]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => window.clearTimeout(closeTimer.current), [])

  // Tab from the button goes into the tip; Tab past its last control goes on to whatever
  // follows the button on the page, and Shift+Tab from its first comes back to the button.
  const tipItems = () => Array.from(tip.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])
  const onButtonKey = (e: ReactKeyboardEvent) => {
    const first = tipItems()[0]
    if (open && e.key === 'Tab' && !e.shiftKey && first) { e.preventDefault(); first.focus() }
  }
  const onTipKey = (e: ReactKeyboardEvent) => {
    if (e.key !== 'Tab') return
    const items = tipItems()
    if (e.shiftKey && document.activeElement === items[0]) {
      e.preventDefault()
      button.current?.focus()
    } else if (!e.shiftKey && document.activeElement === items[items.length - 1]) {
      const page = Array.from(document.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => !tip.current?.contains(el))
      const next = page[page.indexOf(button.current as HTMLElement) + 1]
      if (next) { e.preventDefault(); setOpen(false); next.focus() }
    }
  }

  return (
    <span ref={wrap} style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={show} onMouseLeave={hideSoon}
      onFocus={show}
      onBlur={(e) => { if (!within(e.relatedTarget as Node | null)) setOpen(false) }}>
      <button ref={button} type="button" style={{ ...triggerStyle, ...(open ? openStyle : null) }} onClick={show}
        onKeyDown={onButtonKey} aria-label={label} aria-expanded={open} aria-controls={id}>
        {trigger}
      </button>
      {open && createPortal(
        <div ref={tip} id={id} role="region" aria-label={label}
          onMouseEnter={keep} onMouseLeave={hideSoon} onKeyDown={onTipKey}
          style={{ ...S.tip, left: place.left, width: place.width, top: place.top, bottom: place.bottom }}>
          {children}
        </div>,
        document.body,
      )}
    </span>
  )
}

const S = {
  tip: {
    // Above every layer of the page: the footer (30), the export menu (40), the row panel (60) and dialogs (70).
    position: 'fixed', zIndex: 100, boxSizing: 'border-box', padding: '10px 12px',
    background: 'var(--panel)', color: 'var(--ink)', border: '1px solid var(--ruleS)', borderRadius: 6,
    boxShadow: '0 6px 18px rgba(0, 0, 0, .14)', fontFamily: 'var(--fl)', fontSize: 12.5, lineHeight: 1.45,
    letterSpacing: 'normal', textAlign: 'left',
  } as const,
}
