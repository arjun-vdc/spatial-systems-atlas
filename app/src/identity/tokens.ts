// Three candidate visual identities for the Atlas, to choose from.
//
// Each one is a full replacement for the light and dark palettes in marks.ts
// (THEMES), keyed by the same custom properties, plus a few detail tokens the
// app does not read yet: the fill for selected controls (--sel, --selInk) and
// the quiet uppercase labels (--label*). Until the chosen identity becomes the
// default, identity.css maps those detail tokens onto the existing inline
// styles. --scopeEdge is the edge of the "Out of scope" mark, which today
// shares --rule with every card border. Layout is untouched: only colour,
// type, corner radius and rules.
//
// Every font named here is free (SIL Open Font License 1.1) and self-hosted
// from public/fonts; nothing is fetched from a font service.

export type IdentityId = 'a' | 'b' | 'c'
export type Palette = Record<string, string>

export interface Identity {
  id: IdentityId
  name: string
  /** The real-world object the identity is drawn from, in one sentence. */
  referent: string
  fonts: { label: string; body: string; data: string }
  light: Palette
  dark: Palette
}

// Shared by light and dark within one identity: type, radius, label rhythm.
const surveyType: Palette = {
  '--fl': "'Ysabeau Office',system-ui,sans-serif",
  '--fb': "'Ysabeau Office',system-ui,sans-serif",
  '--fm': "'Fira Mono',ui-monospace,monospace",
  '--r': '3px',
  '--labelFont': "'Ysabeau Office',system-ui,sans-serif",
  '--labelTrack': '.1em',
  '--labelWeight': '650',
  '--num': 'tabular-nums',
}

const signalType: Palette = {
  '--fl': "'Schibsted Grotesk',system-ui,sans-serif",
  '--fb': "'Schibsted Grotesk',system-ui,sans-serif",
  // No monospace: figures are set in the grotesk. Its tabular setting also
  // widens full stops and commas, so the default figures are kept.
  '--fm': "'Schibsted Grotesk',system-ui,sans-serif",
  '--r': '0px',
  '--labelFont': "'Schibsted Grotesk',system-ui,sans-serif",
  '--labelTrack': '.03em',
  '--labelWeight': '800',
  '--num': 'normal',
}

const chartType: Palette = {
  '--fl': "'Atkinson Hyperlegible',system-ui,sans-serif",
  '--fb': "'Atkinson Hyperlegible',system-ui,sans-serif",
  '--fm': "'Intel One Mono',ui-monospace,monospace",
  '--r': '4px',
  '--labelFont': "'Atkinson Hyperlegible',system-ui,sans-serif",
  '--labelTrack': '.06em',
  '--labelWeight': '700',
  '--num': 'tabular-nums',
}

export const IDENTITIES: Record<IdentityId, Identity> = {
  a: {
    id: 'a',
    name: 'Survey sheet',
    referent:
      'A national topographic map sheet: bright paper printed in a few process inks, black for names, ' +
      'green for woodland, brown for contours, red for roads, blue for water.',
    fonts: { label: 'Ysabeau Office', body: 'Ysabeau Office', data: 'Fira Mono' },
    light: {
      ...surveyType,
      '--bg': '#EEF1EB', '--panel': '#FBFCF9', '--sunk': '#E4E6E1',
      '--ink': '#151A15', '--soft': '#434C43', '--faint': '#535E52',
      '--rule': '#D3C2A8', '--ruleS': '#A3845F',
      '--ac': '#2C6832', '--acF': '#C6E2BB',
      '--warn': '#87501F', '--warnF': '#F0DCC2',
      '--bad': '#B1251D', '--badF': '#F7D4CE', '--lane': '#1C5C96',
      '--sel': '#2C6832', '--selInk': '#FBFCF9', '--scopeEdge': '#D3C2A8',
      '--label': '#87501F',
    },
    dark: {
      ...surveyType,
      '--bg': '#101410', '--panel': '#171C17', '--sunk': '#212721',
      '--ink': '#E5EBE2', '--soft': '#B7C2B4', '--faint': '#9AA697',
      '--rule': '#3D3829', '--ruleS': '#76694F',
      '--ac': '#86C98C', '--acF': '#1E3B22',
      '--warn': '#DDA56C', '--warnF': '#3E2B18',
      '--bad': '#F2897D', '--badF': '#47211C', '--lane': '#84BBEB',
      '--sel': '#86C98C', '--selInk': '#101410', '--scopeEdge': '#3D3829',
      '--label': '#DDA56C',
    },
  },
  b: {
    id: 'b',
    name: 'Signal code',
    referent:
      'The International Code of Signals flag chart: the oldest working interoperability standard, ' +
      'five flat colours (red, yellow, blue, black, white) that every ship reads the same way.',
    fonts: { label: 'Schibsted Grotesk', body: 'Schibsted Grotesk', data: 'Schibsted Grotesk (no monospace)' },
    light: {
      ...signalType,
      '--bg': '#FFFFFF', '--panel': '#FFFFFF', '--sunk': '#ECECEA',
      '--ink': '#111111', '--soft': '#3A3A3A', '--faint': '#5B5B5B',
      '--rule': '#2B2B2B', '--ruleS': '#111111',
      '--ac': '#0B4EA2', '--acF': '#D3E1F5',
      '--warn': '#6B4D00', '--warnF': '#FFD02E',
      '--bad': '#BF0F2C', '--badF': '#FCDFE2', '--lane': '#111111',
      '--sel': '#111111', '--selInk': '#FFFFFF', '--scopeEdge': '#C2C2C0',
      '--label': '#111111',
    },
    dark: {
      ...signalType,
      '--bg': '#0E0E0E', '--panel': '#151515', '--sunk': '#232323',
      '--ink': '#F3F3F3', '--soft': '#CACACA', '--faint': '#A3A3A3',
      '--rule': '#5A5A5A', '--ruleS': '#D8D8D8',
      '--ac': '#6CA6FF', '--acF': '#12305E',
      '--warn': '#FFD02E', '--warnF': '#4A3C00',
      '--bad': '#FF6464', '--badF': '#4E1218', '--lane': '#F3F3F3',
      '--sel': '#F3F3F3', '--selInk': '#0E0E0E', '--scopeEdge': '#3A3A3A',
      '--label': '#F3F3F3',
    },
  },
  c: {
    id: 'c',
    name: 'Flight chart',
    referent:
      'A VFR sectional aeronautical chart: pale terrain and water tints, airspace drawn in magenta and ' +
      'blue, lettering made to be read at a glance in a moving cockpit.',
    fonts: { label: 'Atkinson Hyperlegible', body: 'Atkinson Hyperlegible', data: 'Intel One Mono' },
    light: {
      ...chartType,
      '--bg': '#E5ECF2', '--panel': '#F8FAFC', '--sunk': '#D7E0E8',
      '--ink': '#0C1A2C', '--soft': '#36485D', '--faint': '#4D5F74',
      '--rule': '#BBC8D4', '--ruleS': '#7D90A4',
      '--ac': '#A1166E', '--acF': '#F5D8EA',
      '--warn': '#815809', '--warnF': '#F2E2BA',
      '--bad': '#B3320C', '--badF': '#F8D9CC', '--lane': '#1F55A6',
      '--sel': '#A1166E', '--selInk': '#FFFFFF', '--scopeEdge': '#BBC8D4',
      '--label': '#1F55A6',
    },
    dark: {
      ...chartType,
      '--bg': '#0A111C', '--panel': '#101A28', '--sunk': '#182436',
      '--ink': '#E3EAF2', '--soft': '#B0BDCC', '--faint': '#909EB0',
      '--rule': '#26364A', '--ruleS': '#5A6F89',
      '--ac': '#F27DC2', '--acF': '#4A1A3C',
      '--warn': '#E4B661', '--warnF': '#3D3014',
      '--bad': '#FF8E66', '--badF': '#4A2014', '--lane': '#86B4FF',
      '--sel': '#F27DC2', '--selInk': '#0A111C', '--scopeEdge': '#26364A',
      '--label': '#86B4FF',
    },
  },
}

export const IDENTITY_IDS = Object.keys(IDENTITIES) as IdentityId[]
