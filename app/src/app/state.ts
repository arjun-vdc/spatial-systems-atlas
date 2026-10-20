// The whole interface state, and the address that carries it.
//
// Two owner decisions are structural here and must not be softened:
//
// 1. The sidebar scopes the view. It never switches which display you are in.
//    Only the display switcher changes `view`, plus one explicit per-subject
//    "put this in focus" action that is labelled as navigation.
// 2. The comparison IS the selection. `on` is the comparison and `focus` is
//    whichever member of it is in the foreground. An earlier build kept a
//    second list, the two drifted, and that produced a bug. Do not reintroduce
//    a second list and do not "synchronise" one.

import type { Basis, LaneId, Model, Query, RowFilter } from '../design-model.ts'
import { shareUrl } from '../design-model.ts'

export type ViewId = 'subject' | 'compare' | 'groups' | 'relations'
export type Theme = 'light' | 'dark'
export type SidebarMode = 'pinned' | 'open' | 'collapsed'

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
  presetName: string
  presetEdited: boolean

  // Preferences. Not analysis, so they never travel in the address.
  theme: Theme
  sidebar: SidebarMode
}

/** Everything the counting rules read, taken from the state. */
export const queryOf = (s: AppState): Query => ({
  on: s.on,
  filter: s.filter,
  hasEntry: s.hasEntry,
  basis: s.basis,
  lane: s.lane,
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
  | { type: 'theme'; theme: Theme }
  | { type: 'sidebar'; mode: SidebarMode }
  | { type: 'replace'; state: AppState }

/** Marks the view as departed from its preset. Preferences never do this. */
const edited = (s: AppState, next: Partial<AppState>): AppState => ({
  ...s,
  ...next,
  presetEdited: true,
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
      return { ...state, ...action.state, presetName: action.name, presetEdited: false, detail: null }

    // Preferences. They change nothing about what is counted.
    case 'theme':
      return { ...state, theme: action.theme }
    case 'sidebar':
      return { ...state, sidebar: action.mode }

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

const VIEWS: ViewId[] = ['subject', 'compare', 'groups', 'relations']
const FILTERS: RowFilter[] = ['all', 'overlap', 'thin', 'gap', 'conflict', 'connect', 'interop']
const BASES: Basis[] = ['prod', 'all', 'must']
const LANES: LaneId[] = ['U1', 'U2', 'U3', 'U4']

export function initialState(model: Model): AppState {
  const preset = PRESETS[0]
  return {
    view: preset.view,
    focus: preset.focus ?? preset.on[0],
    on: preset.on,
    filter: preset.filter,
    hasEntry: false,
    basis: 'prod',
    lane: preset.lane ?? null,
    relGroup: model.groups[0]?.id ?? '',
    openGroups: {},
    detail: null,
    presetName: preset.name,
    presetEdited: false,
    theme: 'light',
    sidebar: 'pinned',
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

/** The query half of the address, in the shape shareUrl writes. */
export function encode(state: AppState, total: number): string {
  return shareUrl(
    queryOf(state),
    state.view,
    state.focus,
    state.view === 'relations' ? state.relGroup : null,
    state.detail,
    total,
  ).replace(/^[^?]*\?/, '')
}

/**
 * Read an address back into state. Anything the address does not carry returns
 * to its default, and the scope line on screen states what is being counted, so
 * a reset is never silent.
 */
export function decode(search: string, model: Model, base: AppState): AppState {
  const p = new URLSearchParams(search.replace(/^[?#]/, ''))
  if ([...p.keys()].length === 0) return base

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

  const view = pick(p.get('view'), VIEWS, 'subject')
  const basis = pick(p.get('basis'), BASES, 'prod')
  const lane = pick(p.get('lane'), LANES, null as LaneId | null)

  const matched = PRESETS.find((preset) => {
    const pOn = presetSubjects(preset, model)
    return preset.view === view
      && preset.filter === filter
      && (preset.lane ?? null) === lane
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
    presetName: matched?.name ?? '',
    presetEdited: false,
  }
}

// ---------------------------------------------------------------------------
// Presets. One click writes the whole view.
// ---------------------------------------------------------------------------

export interface Preset {
  name: string
  scope: string
  on: string[]
  view: ViewId
  filter: RowFilter
  focus?: string
  lane?: LaneId
  /** Shown only behind the "More" disclosure, which the owner will populate. */
  more?: boolean
}

export const PRESETS: Preset[] = [
  { name: 'glTF beside its neighbours', scope: 'glTF, OpenUSD, X3D, glTF 2.1, VRM',
    on: ['gltf', 'usd', 'x3d', 'gltf21', 'vrm'], view: 'subject', filter: 'all', focus: 'gltf' },
  { name: "The Forum's own", scope: '6 MSF standards and projects',
    on: ['omb', 'rp1', 'teleportxr', 'wow', 'iwps', 'um'], view: 'compare', filter: 'all' },
  { name: 'World-to-world travel', scope: '29 must-agree rows · lane U3',
    on: ['wow', 'rp1', 'iwps', 'omb', 'teleportxr'], view: 'compare', filter: 'interop', lane: 'U3' },
  { name: 'Web of Worlds, and what blocks it', scope: 'WoW against the standards it has to meet',
    on: ['wow', 'gltf', 'usd', 'openxr', 'webxr', 'geopose'], view: 'subject', filter: 'interop', focus: 'wow' },
  { name: 'Recorded conflicts', scope: 'every subject · the conflict rows', more: true,
    on: [], view: 'compare', filter: 'conflict' },
  { name: 'Where nobody has built it', scope: 'no built-in or extension support', more: true,
    on: [], view: 'groups', filter: 'gap' },
  { name: 'Avatar portability', scope: '25 must-agree rows · lane U2', more: true,
    on: ['vrm', 'usd', 'gltf', 'wow', 'vrchat'], view: 'compare', filter: 'interop', lane: 'U2' },
  { name: 'Engines against the formats', scope: 'Unity, Unreal, Godot, Three.js', more: true,
    on: ['unity', 'unreal', 'godot', 'threejs', 'gltf', 'usd'], view: 'compare', filter: 'all' },
]

/** A preset with an empty subject list means every subject. */
export const presetSubjects = (preset: Preset, model: Model): string[] =>
  preset.on.length ? preset.on : model.subjects.map((s) => s.id)
