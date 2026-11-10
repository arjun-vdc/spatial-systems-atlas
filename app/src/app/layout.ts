// The shell's frame: how the page, the panel column and the display share the
// window height.
//
// Docked, at any width, the page is held to one window: the panel column runs
// from the header to the fixed footer and scrolls on its own, and so does the
// display. Floating over the display, the page stacks and scrolls as one, as
// it always has. On a phone an open panel is a sheet over the whole display,
// and the page is held to one window as when docked.

import type { CSSProperties } from 'react'

/** Under this width the screen is a phone: panels open as a sheet, with no pin. */
export const PHONE_WIDTH = 600
/** From this width up the panel column always docks. */
export const WIDE_WIDTH = 1100

export type PanelMode = 'docked' | 'floating' | 'sheet'

/**
 * How the panel column sits beside the display. A phone always takes the sheet,
 * whatever docked choice is stored; between a phone and a wide screen the
 * reader's pin choice holds, else the default for the width.
 */
export function panelMode(viewport: number, dockChoice: boolean | null, defaultDocked: boolean): PanelMode {
  if (viewport < PHONE_WIDTH) return 'sheet'
  if (viewport >= WIDE_WIDTH) return 'docked'
  return (dockChoice ?? defaultDocked) ? 'docked' : 'floating'
}

/** Whether the page is held to one window. Only a floating column lets it scroll as one. */
export const pageLocked = (floating: boolean): boolean => !floating

export interface Frame {
  root: CSSProperties
  /** The row that holds the rail, the panel column and the display. */
  body: CSSProperties
  /** The rail and the panel column. */
  side: CSSProperties
  /** The display, with its legend and the footer. */
  main: CSSProperties
}

export function frame(locked: boolean): Frame {
  // The bottom padding is the fixed footer's height, which the footer writes to --footer-h.
  const root: CSSProperties = { paddingBottom: 'var(--footer-h, 0px)', overflowX: 'hidden', maxWidth: '100vw', display: 'flex', flexDirection: 'column' }
  const body: CSSProperties = { display: 'flex', minHeight: 0, flex: 1, maxWidth: '100%' }
  const side: CSSProperties = { display: 'flex', zIndex: 20, flex: '0 0 auto' }
  const main: CSSProperties = { flex: 1, minWidth: 0, maxWidth: '100%', display: 'flex', flexDirection: 'column', overflowX: 'hidden' }
  if (locked) {
    return {
      // Longhands only, so React never mixes overflow with overflowX when the column is pinned or floated.
      root: { ...root, height: '100dvh', overflowY: 'hidden' },
      body: { ...body, alignItems: 'stretch' },
      side: { ...side, position: 'relative' },
      main: { ...main, overflowY: 'auto', minHeight: 0 },
    }
  }
  // Scrolling as one, the column sticks to the top of the window and stops at the footer.
  return {
    root: { ...root, minHeight: '100dvh' },
    body: { ...body, alignItems: 'flex-start' },
    side: { ...side, position: 'sticky', top: 0, alignSelf: 'flex-start', height: 'calc(100dvh - var(--footer-h, 0px))' },
    main,
  }
}

/** An item laid out in a wrapping row, measured from the row container's top left. */
export interface FlowBox {
  top: number
  bottom: number
  right: number
}

/** The collapsed list: how many chips show, and whether the last one is narrowed to fit the button. */
export interface Collapse {
  shown: number
  /** The last shown chip is the only one on the last row and is narrowed, so the button fits beside it. */
  squeeze: boolean
}

/**
 * The collapsed "Compared with" list: how many chips fit on its first two rows
 * with the Show more button after them. `items` is the label first, then every
 * chip, as one wrapping row lays them out. Null when every item already sits on
 * two rows, so the list needs no button. Otherwise chips are dropped from the end
 * of the second row until the button fits there; a dropped chip never moves the
 * ones before it, because the row fills left to right. A chip alone on the second
 * row is kept and narrowed instead, so a long name on a phone never leaves the
 * list showing no chip at all.
 */
export function collapsedCount(items: FlowBox[], toggleWidth: number, gap: number, width: number, rows = 2): Collapse | null {
  // Items share a row when they overlap vertically (the row centres them, so tops differ by height).
  const row: number[] = []
  let current = -1
  let bottom = -Infinity
  for (const it of items) {
    if (it.top >= bottom - 0.5) { current++; bottom = it.bottom } else bottom = Math.max(bottom, it.bottom)
    row.push(current)
  }
  if (row.every((r) => r < rows)) return null
  // Chips are items 1..n; the label is item 0, so chip k (1-based) is items[k].
  let shown = row.filter((r, i) => i > 0 && r < rows).length
  while (shown > 0) {
    if (row[shown] < rows - 1) break // no chip left on the last row; the button starts it
    if (items[shown].right + gap + toggleWidth <= width + 0.5) break
    if (row[shown - 1] < rows - 1) return { shown, squeeze: true } // the only chip on the last row
    shown--
  }
  return { shown, squeeze: false }
}
