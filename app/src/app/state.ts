// The whole interface state, and the address that carries it.
//
// Two design decisions are structural here and must not be softened:
//
// 1. The sidebar scopes the view. It never switches which display you are in.
//    Only the display switcher changes `view`, plus one explicit per-subject
//    "put this in focus" action that is labelled as navigation.
// 2. The comparison IS the selection. `on` is the comparison and `focus` is
//    whichever member of it is in the foreground. An earlier build kept a
//    second list, the two drifted, and that produced a bug. Do not reintroduce
//    a second list and do not "synchronise" one.

import type { Basis, LaneId, Model, Query, RowFilter } from '../design-model.ts'
import { laneIds } from '../design-model.ts'
import { shareUrl } from '../design-model.ts'
import { normalizeCustomPreset } from './custom-preset.ts'
import type { CustomPreset } from './custom-preset.ts'
import type { PanelMode } from './layout.ts'

export type ViewId = 'subject' | 'compare' | 'groups' | 'relations'
export type Theme = 'light' | 'dark'

/**
 * The sections the tool rail shows or hides, in rail order. Several can be on at
 * once; they stack in this order. Which are on is a per-viewer preference.
 */
export type PanelId = 'presets' | 'subjects' | 'rows' | 'counting' | 'lane'
export const PANEL_IDS: PanelId[] = ['presets', 'subjects', 'rows', 'counting', 'lane']

export interface DetailTarget {
  cid: string
  /** Which subject inside the row is expanded. Null means the row opened from a header. */
  sid: string | null
}

export interface AppState {
  view: ViewId
  /** The subject in the foreground. Always a member of `on`. */
  focus: string | null
  /** Subject ids switched on. This is the comparison; there is no second list. */
  on: string[]
  filter: RowFilter
  hasEntry: boolean
  basis: Basis
  lane: LaneId | null
  relGroup: string
  /** Which group is expanded in the subject display. */
  openGroups: Record<string, boolean>
  detail: DetailTarget | null
  /**
   * The preset the view currently is. Empty the moment the reader changes
   * anything the preset wrote, so a preset is never shown as selected over a
   * view that no longer matches it.
   */
  presetName: string
  customPreset: CustomPreset | null
  /** Rows picked by a preset or a link (`sel`). Empty means every row. */
  sel: string[]

  // Preferences. Not analysis, so they never travel in the address.
  theme: Theme
}

/** Everything the counting rules read, taken from the state. */
export const queryOf = (s: AppState): Query => ({
  on: s.on,
  filter: s.filter,
  hasEntry: s.hasEntry,
  basis: s.basis,
  lane: s.lane,
  sel: s.sel,
})

export type Action =
  | { type: 'view'; view: ViewId }
  | { type: 'focus'; id: string }
  | { type: 'toggle-subject'; id: string }
  | { type: 'set-on'; on: string[] }
  | { type: 'filter'; filter: RowFilter }
  | { type: 'has-entry'; value: boolean }
  | { type: 'basis'; basis: Basis }
  | { type: 'lane'; lane: LaneId | null }
  | { type: 'rel-group'; id: string }
  | { type: 'toggle-group'; id: string }
  | { type: 'detail'; detail: DetailTarget | null }
  | { type: 'preset'; state: Partial<AppState>; name: string }
  | { type: 'custom-preset'; title: string; details: string; on?: string[] }
  | { type: 'theme'; theme: Theme }
  | { type: 'clear-picked' }
  | { type: 'replace'; state: AppState }

/** The view has departed from its preset, so no preset is selected any more. Preferences never do this. */
const edited = (s: AppState, next: Partial<AppState>): AppState => ({
  ...s,
  ...next,
  presetName: '',
  customPreset: null,
})

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    // The display switcher is the only control that changes the display.
    case 'view':
      return edited(state, { view: action.view, detail: null })

    // The one labelled exception: putting a subject in focus is navigation, so
    // it sets the display and guarantees the subject is in the comparison.
    case 'focus':
      return edited(state, {
        view: 'subject',
        focus: action.id,
        on: state.on.includes(action.id) ? state.on : [...state.on, action.id],
        detail: null,
      })

    case 'toggle-subject': {
      const on = state.on.includes(action.id)
        ? state.on.filter((id) => id !== action.id)
        : [...state.on, action.id]
      // Focus must stay inside the comparison, or the foreground shows a
      // subject the reader just switched off.
      const focus = on.includes(state.focus ?? '') ? state.focus : (on[0] ?? null)
      return edited(state, { on, focus })
    }

    case 'set-on': {
      const focus = action.on.includes(state.focus ?? '') ? state.focus : (action.on[0] ?? null)
      return edited(state, { on: action.on, focus })
    }

    case 'filter':
      return edited(state, { filter: action.filter })
    case 'has-entry':
      return edited(state, { hasEntry: action.value })
    case 'basis':
      return edited(state, { basis: action.basis })
    case 'lane':
      return edited(state, { lane: action.lane })
    case 'rel-group':
      return edited(state, { relGroup: action.id })

    case 'toggle-group':
      return { ...state, openGroups: { ...state.openGroups, [action.id]: !state.openGroups[action.id] } }
    case 'detail':
      return { ...state, detail: action.detail }

    // A preset writes the whole view at once, and is the only control besides
    // the switcher permitted to move between displays.
    case 'preset':
      return { ...state, ...action.state, presetName: action.name, customPreset: null, detail: null }

    case 'custom-preset': {
      const customPreset = normalizeCustomPreset(action.title, action.details)
      if (!customPreset) return state
      const on = action.on ?? state.on
      const focus = on.includes(state.focus ?? '') ? state.focus : (on[0] ?? null)
      return { ...state, on, focus, presetName: '', customPreset }
    }

    // Preferences. They change nothing about what is counted.
    case 'theme':
      return { ...state, theme: action.theme }

    case 'clear-picked':
      return edited(state, { sel: [] })

    case 'replace':
      return action.state
  }
}

// ---------------------------------------------------------------------------
// The address is the state.
//
// The prototype only displayed a plausible link; it never read or wrote the
// real address, so a shared link restored nothing. This does both.
// ---------------------------------------------------------------------------

/**
 * The keys the address carries. A link may put them after `?` or after `#`; the app writes `#`.
 * `only` is a retired key: the subject figures were row filters until 2026-11 (see LEGACY_KEYS).
 */
export const ADDRESS_KEYS = ['view', 's', 'of', 'rows', 'basis', 'lane', 'group', 'open', 'sel', 'only', 'title', 'details']

/**
 * Keys older links may still carry but that no longer mean anything. `only` held
 * the subject figure filters (reach, built in, assessed, conflicts), which were
 * withdrawn: the figures are plain figures now. Reading a link ignores these
 * keys, and the app drops them from the address it shows.
 */
export const LEGACY_KEYS = ['only']

/**
 * An address part (`#…` or `?…`) with the retired keys removed and every other
 * byte left as it was, so a link's subject order and unknown fields survive.
 */
export function withoutLegacyKeys(part: string): string {
  const lead = part.match(/^[?#]/)?.[0] ?? ''
  const body = part.slice(lead.length)
  if (!body) return part
  const kept = body.split('&').filter((pair) => !LEGACY_KEYS.includes(pair.split('=')[0]))
  return kept.length ? lead + kept.join('&') : ''
}

/** The part of the address that holds the view: the fragment when it has one, otherwise the query. */
export const addressOf = (hash: string, search: string): string => (hash.length > 1 ? hash : search)

/** The query with the Atlas's keys removed, so a link opened with `?` is not left beside the `#` the app writes. */
export function queryWithoutAddress(search: string): string {
  const p = new URLSearchParams(search.replace(/^\?/, ''))
  for (const k of ADDRESS_KEYS) p.delete(k)
  const rest = p.toString()
  return rest ? `?${rest}` : ''
}

const VIEWS: ViewId[] = ['subject', 'compare', 'groups', 'relations']
const FILTERS: RowFilter[] = ['all', 'overlap', 'thin', 'gap', 'conflict', 'connect', 'interop']
const BASES: Basis[] = ['prod', 'all', 'must']

/**
 * The opening view is the whole map: every subject, the Groups display, every
 * row, no focus and no lane. It is not a preset, so no preset is shown as
 * selected and the heading stays generic. One look at coverage across all the
 * groups comes before choosing a question.
 */
export function initialState(model: Model): AppState {
  return {
    view: 'groups',
    focus: null,
    on: model.subjects.map((s) => s.id),
    filter: 'all',
    hasEntry: false,
    basis: 'prod',
    lane: null,
    relGroup: model.groups[0]?.id ?? '',
    openGroups: {},
    detail: null,
    presetName: '',
    customPreset: null,
    sel: [],
    theme: 'light',
  }
}

// ---------------------------------------------------------------------------
// The theme is a preference, so it lives in the browser, never in the address.
// A first visit follows the reader's system setting; an explicit choice is kept.
// ---------------------------------------------------------------------------

const THEME_KEY = 'spatial-systems-atlas.theme'

/** The reader's explicit choice, if they have made one. */
export function storedTheme(): Theme | null {
  try {
    const v = window.localStorage.getItem(THEME_KEY)
    return v === 'light' || v === 'dark' ? v : null
  } catch {
    return null
  }
}

/** What the system asks for. Light when the browser cannot say. */
export function systemTheme(): Theme {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

export const preferredTheme = (): Theme => storedTheme() ?? systemTheme()

export function rememberTheme(theme: Theme): void {
  try {
    window.localStorage.setItem(THEME_KEY, theme)
  } catch {
    // Storage blocked: the choice holds for this visit only.
  }
}

// ---------------------------------------------------------------------------
// The tool rail: which sections are on, and how wide their column is. Both are
// per-viewer preferences, kept in the browser and never in the address.
// ---------------------------------------------------------------------------

const PANELS_KEY = 'spatial-systems-atlas.panels'
const PANEL_WIDTH_KEY = 'spatial-systems-atlas.panel-width'
const LEGEND_KEY = 'spatial-systems-atlas.legend-open'
const PANEL_DOCK_KEY = 'spatial-systems-atlas.panel-dock'

export const PANEL_WIDTH = { min: 240, max: 560, initial: 300, step: 16 } as const

export const clampPanelWidth = (w: number): number =>
  Number.isFinite(w) ? Math.round(Math.min(PANEL_WIDTH.max, Math.max(PANEL_WIDTH.min, w))) : PANEL_WIDTH.initial

/**
 * Reads a stored section list. Anything that is not a list of known sections,
 * including values an older build may have left behind, reads as nothing stored.
 */
export function parsePanels(raw: string | null): PanelId[] | null {
  if (raw === null) return null
  try {
    const v: unknown = JSON.parse(raw)
    if (!Array.isArray(v)) return null
    return PANEL_IDS.filter((id) => v.includes(id))
  } catch {
    return null
  }
}

function readPref(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function writePref(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // Storage blocked: the choice holds for this visit only.
  }
}

/**
 * The sections on after a rail button is pressed. On a phone the sheet shows one
 * section at a time. Elsewhere the button turns its section on or off, except
 * while the column is closed by its close button: then it reopens the column
 * with every section that was on, plus this one, and turns nothing off.
 */
export function nextPanels(prev: PanelId[], id: PanelId, mode: PanelMode, closed: boolean): PanelId[] {
  if (mode === 'sheet') return prev.includes(id) ? [] : [id]
  if (closed) return PANEL_IDS.filter((p) => p === id || prev.includes(p))
  return PANEL_IDS.filter((p) => (p === id ? !prev.includes(p) : prev.includes(p)))
}

export const storedPanels = (): PanelId[] | null => parsePanels(readPref(PANELS_KEY))
export const rememberPanels = (panels: PanelId[]): void => writePref(PANELS_KEY, JSON.stringify(panels))

/** Whether the "Reading the marks" key is open. Open until the reader closes it. */
export const storedLegendOpen = (): boolean => readPref(LEGEND_KEY) !== 'closed'
export const rememberLegendOpen = (open: boolean): void => writePref(LEGEND_KEY, open ? 'open' : 'closed')

export function storedPanelWidth(): number {
  const raw = readPref(PANEL_WIDTH_KEY)
  return raw === null ? PANEL_WIDTH.initial : clampPanelWidth(Number(raw))
}
export const rememberPanelWidth = (w: number): void => writePref(PANEL_WIDTH_KEY, String(clampPanelWidth(w)))

/** The tool rail's own width, and the least the display keeps beside a docked panel column by default. */
export const RAIL_WIDTH = 64
export const DOCK_MIN_DISPLAY = 360

/**
 * Below 1100px the panel column either docks beside the display (pinned) or
 * floats over it. Docked is the default wherever the display would still keep
 * about 360px beside the rail and the column; on a phone it floats.
 */
export const defaultPanelsDocked = (viewport: number, panelWidth: number): boolean =>
  viewport - RAIL_WIDTH - panelWidth >= DOCK_MIN_DISPLAY

/** The reader's pin/float choice, or null until they make one. */
export function storedPanelsDocked(): boolean | null {
  const raw = readPref(PANEL_DOCK_KEY)
  return raw === 'docked' ? true : raw === 'floating' ? false : null
}
export const rememberPanelsDocked = (docked: boolean): void => writePref(PANEL_DOCK_KEY, docked ? 'docked' : 'floating')

/** The query half of the address, in the shape shareUrl writes. */
export function encode(state: AppState, total: number): string {
  const analysis = shareUrl(
    queryOf(state),
    state.view,
    state.focus,
    state.view === 'relations' ? state.relGroup : null,
    state.detail,
    total,
  ).replace(/^[^?]*\?/, '')
  const custom = state.customPreset && normalizeCustomPreset(state.customPreset.title, state.customPreset.details)
  if (!custom) return analysis
  const metadata = new URLSearchParams({ title: custom.title, details: custom.details })
  return `${analysis}&${metadata}`
}

/**
 * Read an address back into state. Anything the address does not carry returns
 * to its default, and the scope line on screen states what is being counted, so
 * a reset is never silent.
 */
export function decode(search: string, model: Model, base: AppState): AppState {
  const p = new URLSearchParams(search.replace(/^[?#]/, ''))
  // Only the Atlas's own keys count, so a tracking tag a mail client adds does not reset the view.
  if (![...p.keys()].some((k) => ADDRESS_KEYS.includes(k))) return base

  const all = model.subjects.map((s) => s.id)
  const pick = <T,>(value: string | null, allowed: readonly T[], fallback: T): T =>
    (allowed as readonly unknown[]).includes(value) ? (value as T) : fallback

  // The address writes "rows=<filter>+assessed". A query string decodes "+" as a
  // space, so what comes back here is "<filter> assessed". Accept both spellings
  // rather than silently dropping the filter, which is what happens if only the
  // literal "+" is handled.
  const rows = (p.get('rows') ?? '').trim()
  const hasEntry = /[+ ]assessed$/.test(rows)
  const filter = pick(hasEntry ? rows.replace(/[+ ]assessed$/, '') : rows, FILTERS, 'all')

  const s = p.get('s')
  const on = s === null || s === 'all' ? all : all.filter((id) => s.split(',').includes(id))

  const open = p.get('open')
  const detail = open
    ? { cid: open.split(':')[0], sid: open.includes(':') ? open.split(':')[1] : null }
    : null

  const focusParam = p.get('of')
  const focus = focusParam && on.includes(focusParam) ? focusParam : (on[0] ?? null)

  // Unknown row ids are dropped, so a stale link shows the rows it still names, or every row.
  const sel = (p.get('sel') ?? '').split(',').filter((id) => model.byCapability.has(id))

  const view = pick(p.get('view'), VIEWS, 'subject')
  const basis = pick(p.get('basis'), BASES, 'prod')
  // Any lane the data carries; an unknown lane id is dropped.
  const lane = pick(p.get('lane'), laneIds(model), null as LaneId | null)
  // A retired `only` (the withdrawn figure filters) is ignored, so an old link
  // opens the same view with every row, and every other row filter as it says.
  const customPreset = normalizeCustomPreset(p.get('title'), p.get('details'))

  // An address names a preset only when it is exactly what that preset writes.
  // Anything the reader changed afterwards (focus, basis, the assessed-only
  // switch) means it is no longer that preset. A retired key changes nothing.
  const sameSel = (a: string[], b: string[]) => a.length === b.length && [...a].sort().every((id, i) => id === [...b].sort()[i])
  const matched = PRESETS.find((preset) => {
    const pOn = presetSubjects(preset, model)
    return preset.view === view
      && sameSel(preset.sel ?? [], sel)
      && preset.filter === filter
      && (preset.lane ?? null) === lane
      && basis === 'prod'
      && !hasEntry
      && (view !== 'subject' || focus === (preset.focus ?? pOn[0]))
      && pOn.length === on.length
      && [...pOn].sort().every((id, i) => id === [...on].sort()[i])
  })

  return {
    ...base,
    view,
    on,
    focus,
    filter,
    hasEntry,
    basis,
    lane,
    relGroup: p.get('group') ?? base.relGroup,
    detail,
    sel,
    presetName: customPreset ? '' : matched?.name ?? '',
    customPreset,
  }
}

// ---------------------------------------------------------------------------
// Presets. One click writes the whole view.
// ---------------------------------------------------------------------------

export interface Preset {
  /** Plain name in the presets list. */
  name: string
  /** The question the preset answers. It is the heading while the preset is selected. */
  question: string
  /** One line under the name saying what the preset shows. */
  scope: string
  /** Subject ids. Empty means every subject, unless `mostConflicts` picks them. */
  on: string[]
  view: ViewId
  filter: RowFilter
  focus?: string
  lane?: LaneId
  /**
   * Pick the subjects from the data instead: the N with the most recorded
   * conflicts, ties in map order. Keeps Compare readable while staying true as
   * the record changes.
   */
  mostConflicts?: number
  /** Pick the subjects from the data instead: every subject the OpenSpatials platform register names. */
  platforms?: boolean
  /** Capability ids the preset picks; only those rows show. Carried in the address as `sel`. */
  sel?: string[]
}

// The presets (2026-11-01). Each preset answers a question a real
// reader asks; none centres on one format. Compare presets hold 8 subjects or fewer.
export const PRESETS: Preset[] = [
  { name: 'What has to be agreed',
    question: 'Where can worlds not work together until there is a shared answer?',
    scope: 'Every subject · the rows that must interoperate',
    on: [], view: 'groups', filter: 'interop' },
  { name: 'Where nobody has built it yet',
    question: 'Where has nobody built it yet?',
    scope: 'Every subject · rows nobody has built in or by extension',
    on: [], view: 'groups', filter: 'gap' },
  { name: 'Where the sources disagree',
    question: 'Where do the sources disagree?',
    scope: 'The 8 subjects with the most recorded conflicts · conflict rows',
    on: [], mostConflicts: 8, view: 'compare', filter: 'conflict' },
  { name: 'Moving 3D content between tools and worlds',
    question: 'What breaks when a 3D asset leaves the tool it was made in?',
    scope: 'Formats and engines · must-interoperate rows · content portability lane',
    on: ['gltf', 'usd', 'x3d', 'mpeg-scene', '3dtiles', 'unity', 'unreal', 'threejs'],
    view: 'compare', filter: 'interop', lane: 'U1' },
  { name: 'Carrying your avatar with you',
    question: 'Who supports a portable avatar, and what is still missing?',
    scope: 'Avatar formats and platforms · must-interoperate rows · avatar portability lane',
    on: ['vrm', 'mpeg-arf', 'gltf', 'usd', 'vrchat', 'roblox', 'resonite', 'wow'],
    view: 'compare', filter: 'interop', lane: 'U2' },
  { name: 'Travelling between worlds',
    question: 'What does a crossing between worlds need, and who provides it?',
    scope: 'Portals and world links · must-interoperate rows · world-to-world travel lane',
    on: ['wow', 'iwps', 'rp1', 'omb', 'teleportxr', 'vibejam', 'horizon'],
    view: 'compare', filter: 'interop', lane: 'U3' },
  { name: 'AI agents inside worlds',
    question: 'What does an AI agent need to act in a world, and which platforms offer it today?',
    scope: 'Agent and identity standards beside platforms · agent participation lane',
    on: ['mcp', 'oauth', 'did', 'vc', 'roblox', 'unity', 'unreal', 'arrival'],
    view: 'compare', filter: 'interop', lane: 'U4' },
  { name: 'The open web stack',
    question: 'What can a browser do with no app store and no install?',
    scope: 'Browser standards and web engines · every row',
    on: ['webxr', 'webgpu', 'wasm', 'threejs', 'babylonjs', 'playcanvas', 'gltf', 'jsonld'],
    view: 'compare', filter: 'all' },
  { name: 'Real places and maps',
    question: 'What does it take to anchor content to a real place?',
    scope: 'Location standards, map engines and phone AR · every row',
    on: ['geopose', '3dtiles', 'spatialdds', 'oarc', 'stac', 'cesiumjs', 'arcore', 'arkit'],
    view: 'compare', filter: 'all' },
  { name: 'Capturing the real world',
    question: 'How do photos and video become worlds?',
    scope: 'Capture methods, tools and world models · every row',
    on: ['4dgs', 'dynsplat', 'nurec', 'nerfstudio', 'polycam', 'scaniverse', 'hyperscape', 'marble'],
    view: 'compare', filter: 'all' },
  { name: 'Identity, trust and who made what',
    question: 'Who are you, and who made what, across worlds?',
    scope: 'Identity, credential and provenance standards · every row',
    on: ['did', 'vc', 'c2pa', 'oauth', 'um'], view: 'compare', filter: 'all' },
  { name: 'Closed platforms against open formats',
    question: 'Where do walled platforms meet open standards, and where do they not?',
    scope: 'Five platforms beside three open standards · must-interoperate rows',
    on: ['roblox', 'vrchat', 'horizon', 'fortnite', 'recroom', 'gltf', 'vrm', 'webxr'],
    view: 'compare', filter: 'interop' },
  { name: 'Engines against the formats',
    question: 'Which formats do the engines support, and how far?',
    scope: 'Unity, Unreal, Godot, Three.js beside glTF and OpenUSD · every row',
    on: ['unity', 'unreal', 'godot', 'threejs', 'gltf', 'usd'], view: 'compare', filter: 'all' },
  { name: "The Forum's own projects",
    question: "What do the Forum's own standards and projects cover, and where are they thin?",
    scope: '6 Forum standards and projects · every row',
    on: ['omb', 'rp1', 'teleportxr', 'wow', 'iwps', 'um'], view: 'compare', filter: 'all' },
  { name: 'Platforms OpenSpatials supports',
    question: 'How do the platforms OpenSpatials supports compare, row by row?',
    scope: 'Every subject that is an OpenSpatials platform · every row',
    on: [], platforms: true, view: 'compare', filter: 'all' },
]

/**
 * The Presets section lists the first three; "More" opens a box six cards tall
 * that scrolls through every preset, and "Fewer" returns to three.
 */
export const PRESETS_SHOWN = 3
export const PRESETS_BOX = 6

export const listedPresets = (expanded: boolean): Preset[] =>
  expanded ? PRESETS : PRESETS.slice(0, PRESETS_SHOWN)

/** Whether a preset sits behind "More", so selecting it must open the box. */
export const presetBehindMore = (presetName: string): boolean =>
  PRESETS.findIndex((p) => p.name === presetName) >= PRESETS_SHOWN

/** Subjects that are OpenSpatials platforms, in map order. */
export const platformSubjects = (model: Model): string[] =>
  model.subjects.filter((s) => s.platform?.length).map((s) => s.id)

/** Recorded conflict cells per subject, most first; ties keep map order. */
function mostConflicted(model: Model, n: number): string[] {
  const count = (id: string) =>
    model.capabilities.filter((c) => model.cov[id]?.[c.id]?.[0] === 'c').length
  return model.subjects
    .map((s, i) => ({ id: s.id, i, n: count(s.id) }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n || a.i - b.i)
    .slice(0, n)
    .map((x) => x.id)
}

/** The subjects a preset switches on. An empty list means every subject. */
export const presetSubjects = (preset: Preset, model: Model): string[] =>
  preset.mostConflicts ? mostConflicted(model, preset.mostConflicts)
    : preset.platforms ? platformSubjects(model)
    : preset.on.length ? preset.on : model.subjects.map((s) => s.id)

/** The heading: the selected preset's question, or the generic heading. */
export const presetQuestion = (presetName: string): string | null =>
  PRESETS.find((p) => p.name === presetName)?.question ?? null
