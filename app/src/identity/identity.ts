// Switching between the candidate identities, and checking their contrast.
//
// The address picks a candidate with ?identity=a|b|c. Without it the app keeps
// today's look. The candidate's tokens are written as !important rules scoped
// to the document element's data-identity and data-theme attributes: the shell
// writes today's palette as inline custom properties on the same element, and
// only an !important stylesheet declaration outranks those.

import type { IdentityId, Palette } from './tokens.ts'
import { IDENTITIES, IDENTITY_IDS } from './tokens.ts'

/** The candidate named in an address's query string, or null for today's look. */
export function readIdentity(search: string): IdentityId | null {
  const value = new URLSearchParams(search).get('identity')?.trim().toLowerCase() ?? ''
  return (IDENTITY_IDS as string[]).includes(value) ? (value as IdentityId) : null
}

// The stylesheet's older names, used by the loading screen before the shell
// mounts and by the page body behind it.
const legacy = (p: Palette): Palette => ({
  '--paper': p['--panel'], '--paper-soft': p['--sunk'], '--line': p['--rule'], '--accent': p['--ac'],
})

const block = (selector: string, p: Palette): string =>
  `${selector} {\n${Object.entries({ ...p, ...legacy(p) })
    .map(([k, v]) => `  ${k}: ${v} !important;`).join('\n')}\n}`

/** The CSS text for one candidate, light and dark. */
export function identityCss(id: IdentityId): string {
  const { light, dark } = IDENTITIES[id]
  const root = `:root[data-identity='${id}']`
  return [
    block(`${root}[data-theme='light'],\n${root}:not([data-theme])`, light),
    block(`${root}[data-theme='dark']`, dark),
    // Before the shell sets a theme, the system setting decides.
    `@media (prefers-color-scheme: dark) {\n${block(`${root}:not([data-theme])`, dark)}\n}`,
  ].join('\n\n')
}

// ---------- WCAG 2.x contrast ----------

const channel = (c: number): number => {
  const s = c / 255
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}

export function luminance(hex: string): number {
  const h = hex.replace('#', '')
  const n = h.length === 3 ? h.split('').map((x) => x + x).join('') : h
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16))
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

export interface Pair {
  fg: string
  bg: string
  /** Where the pair appears on screen. */
  use: string
  /** 4.5 for text (WCAG 1.4.3 AA), 3 for mark and control edges (WCAG 1.4.11). */
  min: number
}

/** Every text and mark-edge pairing the app draws from these tokens. */
export const PAIRS: Pair[] = [
  ...['--ink', '--soft', '--faint'].flatMap((fg) => ['--bg', '--panel', '--sunk', '--acF'].map((bg) => ({
    fg, bg, use: `${fg.slice(2)} text on ${bg.slice(2)}`, min: 4.5,
  }))),
  { fg: '--label', bg: '--bg', use: 'quiet uppercase labels on the page', min: 4.5 },
  { fg: '--label', bg: '--panel', use: 'quiet uppercase labels on panels', min: 4.5 },
  { fg: '--label', bg: '--sunk', use: 'Compare corner label', min: 4.5 },
  { fg: '--ac', bg: '--panel', use: 'links, active rail label, Built in glyph on panel', min: 4.5 },
  { fg: '--ac', bg: '--bg', use: 'links on the page', min: 4.5 },
  { fg: '--ac', bg: '--acF', use: 'active rail label, Built in mark glyph', min: 4.5 },
  { fg: '--warn', bg: '--panel', use: 'Partial glyph and must-agree badge', min: 4.5 },
  { fg: '--warn', bg: '--warnF', use: 'Partial mark glyph on its stripe', min: 4.5 },
  { fg: '--bad', bg: '--panel', use: 'Absent and Conflict glyphs, unverified flag', min: 4.5 },
  { fg: '--bad', bg: '--badF', use: 'Conflict mark glyph on its fill', min: 4.5 },
  { fg: '--lane', bg: '--panel', use: 'lane badge', min: 4.5 },
  { fg: '--selInk', bg: '--sel', use: 'selected chip, switcher segment, primary button', min: 4.5 },
  { fg: '--ac', bg: '--panel', use: 'Built in and extension mark edge', min: 3 },
  { fg: '--warn', bg: '--panel', use: 'Partial mark edge', min: 3 },
  { fg: '--bad', bg: '--panel', use: 'Absent and Conflict mark edge', min: 3 },
  { fg: '--ruleS', bg: '--panel', use: 'Not assessed mark edge, input border', min: 3 },
]

export interface Check extends Pair {
  ratio: number
  pass: boolean
}

export function checkPalette(p: Palette): Check[] {
  return PAIRS.map((pair) => {
    const ratio = contrast(p[pair.fg], p[pair.bg])
    return { ...pair, ratio, pass: ratio >= pair.min }
  })
}
