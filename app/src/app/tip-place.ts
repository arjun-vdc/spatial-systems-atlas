// Where a tip opens, in window coordinates. The tip is drawn at the end of the
// page with fixed positioning, so nothing on the page (a sticky table header, the
// footer, a panel) can draw over it; this works out its box from the button's.

export type TipSide = 'below' | 'above' | 'beside'

export interface TipBox {
  left: number
  width: number
  /** From the window's top edge, for a tip below or beside the button. */
  top?: number
  /** From the window's bottom edge, for a tip above the button. */
  bottom?: number
}

/** The gap between the button and the tip, and between the tip and the edge of its area. */
const GAP = 6
const EDGE = 16

export function tipPlace({ button, area, viewport, side, width }: {
  button: { left: number; right: number; top: number; bottom: number }
  /** The main column, which a tip below or beside a button stays inside, clear of the tool rail. */
  area?: { left: number; right: number } | null
  viewport: { width: number; height: number }
  side: TipSide
  width: number
}): TipBox {
  const inside = side === 'above' ? null : area
  const min = (inside?.left ?? 0) + EDGE
  const max = Math.min(inside?.right ?? viewport.width, viewport.width) - EDGE
  if (side === 'beside') {
    // To the left of the button, level with its top.
    const w = Math.min(width, button.left - GAP - min)
    return { left: button.left - GAP - w, width: w, top: button.top }
  }
  const w = Math.min(width, max - min)
  if (side === 'above') {
    // Centred over the button and kept inside the window.
    const centre = (button.left + button.right) / 2
    const left = Math.min(Math.max(centre - w / 2, min), max - w)
    return { left, width: w, bottom: viewport.height - button.top + GAP }
  }
  // Lined up with the button's right edge where it fits, and kept inside the area where not.
  const left = Math.min(Math.max(button.right - w, min), max - w)
  return { left, width: w, top: button.bottom + GAP }
}
