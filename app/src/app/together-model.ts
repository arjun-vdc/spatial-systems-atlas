// The counting rules behind the Interop display.
//
// The question it answers: for the thing a reader wants to do across systems,
// which parts can already work together because shipping products use the same
// standard for them, and which cannot yet?
//
// Every number comes from the research snapshot at run time:
// - the parts are the rows that must interoperate;
// - the counted products are the engines, platforms, device platforms, web
//   runtimes and tools whose status counts as production (the same set as the
//   Production basis);
// - a product uses a standard for a part only when it does the part (built in or
//   through an extension) and the snapshot's `via` record for that claim names
//   the standard. Nothing in a note or a quote is matched.
//
// No React, so the rules can be tested on their own.

import type { Capability, LaneId, Level, Model } from '../design-model.ts'
import { inLane, laneIds, laneLabel, levelOf, productionIds } from '../design-model.ts'

/** The six statuses, in reading order from "works together" to "nothing in place". */
export type TogetherStatus = 'agreed' | 'rivals' | 'some' | 'own' | 'paper' | 'none'
export const STATUS_ORDER: TogetherStatus[] = ['agreed', 'rivals', 'some', 'own', 'paper', 'none']

/** A standard is widely used on a part when at least this many shipping products use it. */
export const WIDE_DEFAULT = 5

/** Projects whose main output is a specification; they can cover a part like a standard. */
export const SPEC_PROJECTS = ['rp1', 'teleportxr', 'vibejam', 'wow']
/** Kinds of subject that are products: things people ship and use. */
export const PRODUCT_KINDS = new Set(['game-engine', 'platform', 'device-platform', 'web-runtime', 'tool'])
const DOES: Level[] = ['n', 'x']

/** Short names for standards and products in the figures, the notches and the lists. */
const SHORT: Record<string, string> = {
  v3c: 'MPEG-I V3C', oarc: 'Open AR Cloud', imdf: 'IMDF', http: 'HTTP', oauth: 'OAuth 2.0',
  '3dtiles': 'OGC 3D Tiles', dds: 'OMG DDS', 'mpeg-v': 'MPEG-V', hanim: 'H-Anim', x3d: 'X3D',
  'json-pointer': 'JSON Pointer', websocket: 'WebSocket', usd: 'OpenUSD', webxr: 'WebXR',
  fortnite: 'Fortnite Creative', arkit: 'ARKit and RealityKit', arcore: 'ARCore and Android XR',
  lightship: 'Niantic Spatial SDK', postshot: 'Postshot', nurec: 'NVIDIA NuRec',
  nerfstudio: 'Nerfstudio', hyperscape: 'Hyperscape Capture', stac: 'STAC',
  'mpeg-arf': 'MPEG-I Avatar Format', 'mpeg-audio': 'MPEG-I Immersive Audio', 'mpeg-scene': 'MPEG-I Scene Description',
  omi: 'OMI glTF extensions', vc: 'Verifiable Credentials', did: 'Decentralized Identifiers',
  c2pa: 'C2PA Content Credentials', ieee2874: 'IEEE 2874', vibejam: 'Vibe Jam portals',
  geolocation: 'W3C Geolocation', 'webxr-anchors': 'WebXR Anchors', 'webxr-hand': 'WebXR Hand Input',
  gltf21: 'glTF 2.1', geopose: 'OGC GeoPose', iwps: 'Inter-World Portaling', openapi: 'OpenAPI',
  webgl2: 'WebGL 2.0', jsonld: 'JSON-LD', rp1: 'RP1 Spatial Fabric', wow: 'Web of Worlds',
  um: 'Universal Manifest', mcp: 'Model Context Protocol', url: 'URL Standard',
}

/** One plain sentence per use case, under its name. */
const LANE_PLAIN: Partial<Record<LaneId, string>> = {
  U1: 'Moving a 3D asset from one tool or world to another.',
  U2: 'Taking your avatar, its clothes and its expressions with you.',
  U3: 'Stepping through a portal into another world and staying yourself.',
  U4: 'Letting a software agent join a world and act in it.',
  U6: 'Two devices seeing the same object at the same real-world spot.',
  U7: 'A training record that another system can read.',
  U10: 'People in different systems seeing each other in one session.',
}

const KIND_WORD: Record<string, string> = {
  'game-engine': 'game engine', platform: 'platform', 'device-platform': 'device platform',
  'web-runtime': 'web runtime', tool: 'tool', standard: 'standard', project: 'specification project',
}

export interface StandardOnPart {
  id: string
  /** Shipping products that do the part and whose `via` record names this standard, in product order. */
  named: string[]
}

export interface Part {
  cap: Capability
  /** Standards and specification projects that cover the part, built in or through an extension; most used first. */
  std: StandardOnPart[]
  /** Standards that cover it only partly. Not counted. */
  part: string[]
  /** Shipping products that do the part, built in or through an extension. */
  doers: string[]
}

export interface Together {
  /** The shipping products counted, in map order. */
  products: string[]
  /** Products that are not shipping yet. Listed, not counted. */
  notShipping: string[]
  /** Standards plus the specification projects. */
  standards: string[]
  /** Subjects that are neither: techniques, world models, research and preview projects. */
  leftOut: string[]
  /** Every part two systems must agree on, in map order. */
  parts: Part[]
  byId: Map<string, Part>
  /** Use cases with at least one such part, in number order. */
  lanes: LaneId[]
}

/** Which standards the snapshot records a product using for a row. */
export const viaOf = (model: Model, subjectId: string, rowId: string): string[] =>
  model.via?.[subjectId]?.[rowId] ?? []

/** Builds the parts and their standards from the snapshot. */
export function buildTogether(model: Model): Together {
  const all = model.subjects.map((s) => s.id)
  const production = new Set(productionIds(model, all))
  const kindOf = (id: string) => model.bySubject.get(id)?.kind ?? ''
  const standards = [...model.subjects.filter((s) => s.kind === 'standard').map((s) => s.id),
    ...SPEC_PROJECTS.filter((id) => model.bySubject.has(id))]
  const products = all.filter((id) => PRODUCT_KINDS.has(kindOf(id)) && production.has(id))
  const notShipping = all.filter((id) => PRODUCT_KINDS.has(kindOf(id)) && !production.has(id))
  const counted = new Set([...standards, ...products, ...notShipping])
  const leftOut = all.filter((id) => !counted.has(id))
  const nameOf = (id: string) => (model.bySubject.get(id)?.name ?? id).toLowerCase()
  const level = (sid: string, cid: string) => levelOf(model.cov[sid]?.[cid])

  const parts: Part[] = model.capabilities.filter((c) => c.interop === 'must').map((cap) => {
    const std: StandardOnPart[] = []
    const part: string[] = []
    const doers = products.filter((p) => DOES.includes(level(p, cap.id) as Level))
    for (const st of standards) {
      const l = level(st, cap.id)
      if (l && DOES.includes(l)) std.push({ id: st, named: doers.filter((p) => viaOf(model, p, cap.id).includes(st)) })
      else if (l === 'p') part.push(st)
    }
    std.sort((a, b) => b.named.length - a.named.length || (nameOf(a.id) < nameOf(b.id) ? -1 : nameOf(a.id) > nameOf(b.id) ? 1 : 0))
    return { cap, std, part, doers }
  })
  const lanes = laneIds(model).filter((lane) => parts.some((p) => inLane(p.cap, lane)))
  return { products, notShipping, standards, leftOut, parts, byId: new Map(parts.map((p) => [p.cap.id, p])), lanes }
}

/** The first rule that fits. */
export function statusOf(part: Part, wide: number = WIDE_DEFAULT): TogetherStatus {
  const counts = part.std.map((s) => s.named.length)
  const widely = counts.filter((n) => n >= wide).length
  if (widely >= 2) return 'rivals'
  if (widely === 1) return 'agreed'
  if (counts.some((n) => n >= 1)) return 'some'
  if (part.doers.length) return 'own'
  return part.std.length ? 'paper' : 'none'
}

/** Which side of the centre line a status sits on: a standard is in use (left), or none is (right). */
export const IN_USE: Record<TogetherStatus, boolean> = { agreed: true, rivals: true, some: true, own: false, paper: false, none: false }

/** A use case, or every part ('all'). */
export type Scope = LaneId | 'all'

/** The parts of one use case, in map order (group, then row); 'all' keeps the snapshot's row order. */
export function partsOf(t: Together, model: Model, scope: Scope): Part[] {
  if (scope === 'all') return t.parts
  const gsort = new Map(model.groups.map((g) => [g.id, g.sort]))
  return t.parts
    .filter((p) => inLane(p.cap, scope))
    .sort((a, b) => (gsort.get(a.cap.g) ?? 0) - (gsort.get(b.cap.g) ?? 0) || a.cap.sort - b.cap.sort)
}

export type Tally = Record<TogetherStatus, number>

export function tally(parts: Part[], wide: number = WIDE_DEFAULT): Tally {
  const t = Object.fromEntries(STATUS_ORDER.map((k) => [k, 0])) as Tally
  for (const p of parts) t[statusOf(p, wide)]++
  return t
}

export const inUse = (t: Tally): number => t.agreed + t.rivals + t.some
export const notInUse = (t: Tally): number => t.own + t.paper + t.none

/** The four figures in the question bar. */
export interface Figures {
  parts: number
  inUse: number
  shared: number
  notInUse: number
}

export function figures(parts: Part[], wide: number = WIDE_DEFAULT): Figures {
  const t = tally(parts, wide)
  return { parts: parts.length, inUse: inUse(t), shared: t.agreed, notInUse: notInUse(t) }
}

export const shortName = (model: Model, id: string): string => SHORT[id] ?? model.bySubject.get(id)?.name ?? id
export const fullName = (model: Model, id: string): string => model.bySubject.get(id)?.name ?? id
export const kindWord = (model: Model, id: string): string => {
  const k = model.bySubject.get(id)?.kind ?? ''
  return KIND_WORD[k] ?? k
}
export const scopeName = (scope: Scope): string => scope === 'all' ? 'All use cases' : laneLabel(scope)
export const scopePlain = (scope: Scope): string =>
  scope === 'all' ? 'Every part that some use case needs two systems to agree on.' : LANE_PLAIN[scope] ?? ''

export const plural = (n: number, one: string, many = `${one}s`): string => `${n} ${n === 1 ? one : many}`

/** A one-line figure for a part in a list: what a reader most needs to know about it. */
export function partFigure(model: Model, t: Together, p: Part, wide: number): string {
  const k = statusOf(p, wide)
  const np = t.products.length
  if (k === 'agreed' || k === 'rivals' || k === 'some') {
    const used = p.std.filter((s) => s.named.length).slice(0, k === 'rivals' ? 2 : 1)
    return k === 'rivals'
      ? `${used.map((s) => `${shortName(model, s.id)} ${s.named.length}`).join(' · ')} of ${np}`
      : `${shortName(model, used[0].id)} ${used[0].named.length} of ${np}`
  }
  if (k === 'own') return `${p.doers.length} of ${np}${p.std.length ? '' : ', no standard'}`
  if (k === 'paper') return plural(p.std.length, 'standard')
  return 'no standard'
}

/** The sentence under a status in the row panel, worked out with this part's own numbers. */
export function verdict(model: Model, t: Together, p: Part, wide: number): string {
  const k = statusOf(p, wide)
  const np = t.products.length
  const top = p.std.filter((x) => x.named.length)
  const sn = (id: string) => shortName(model, id)
  switch (k) {
    case 'agreed':
      return `${sn(top[0].id)} is used for it by ${top[0].named.length} of ${np} shipping products, the only standard used by ${wide} or more.`
    case 'rivals':
      return `${top.filter((x) => x.named.length >= wide).map((x) => `${sn(x.id)} by ${x.named.length}`).join(' and ')} of ${np} shipping products. A product picks one.`
    case 'some':
      return `The most used standard, ${sn(top[0].id)}, is used by ${top[0].named.length} of ${np} shipping products, fewer than ${wide}. ${p.doers.length} of ${np} do the part by some route.`
    case 'own':
      return `${p.doers.length} of ${np} shipping products do it. ${p.std.length
        ? `${plural(p.std.length, 'standard covers', 'standards cover')} it, but no product's sources name one as what it uses.`
        : 'No standard or specification in the Atlas covers it.'}`
    case 'paper':
      return `${p.std.map((x) => sn(x.id)).join(', ')} ${p.std.length === 1 ? 'covers' : 'cover'} it, and 0 of ${np} shipping products do it.`
    case 'none':
      return `No standard covers it and 0 of ${np} shipping products do it.`
  }
}

/** The status words and their one-line rules, for the key and the panel. */
export function statusWords(np: number, wide: number): Record<TogetherStatus, { word: string; line: string }> {
  return {
    agreed: { word: 'One shared standard', line: `One standard is used for it by ${wide} or more of the ${np} shipping products.` },
    rivals: { word: 'Two rival standards', line: `Two standards are each used by ${wide} or more shipping products.` },
    some: { word: 'A standard, little used', line: `The most used standard has 1 to ${wide - 1} shipping products behind it.` },
    own: { word: 'Each product its own way', line: 'Shipping products do it, but no source says one uses a standard for it, whether or not one exists.' },
    paper: { word: 'A standard, no products', line: 'A standard covers it, but no shipping product does it at all.' },
    none: { word: 'Nothing yet', line: 'No standard covers it and no shipping product does it.' },
  }
}

/** The three checked findings under the chart, each computed from the snapshot. Missing rows drop a finding. */
export interface Findings {
  travel: { u3: Tally; u3n: number; u4: Tally; u4n: number } | null
  commerce: { entitlement: number; payment: number; standards: number } | null
  paper: { n: number; example: Part | null }
}

export function findings(model: Model, t: Together, wide: number): Findings {
  const has = (lane: LaneId) => t.lanes.includes(lane)
  const u3 = has('U3') ? partsOf(t, model, 'U3') : null
  const u4 = has('U4') ? partsOf(t, model, 'U4') : null
  const ent = t.byId.get('commerce.entitlement')
  const pay = t.byId.get('commerce.payment')
  const paperParts = t.parts.filter((p) => statusOf(p, wide) === 'paper')
  const cred = t.byId.get('identity.credential')
  return {
    travel: u3 && u4 ? { u3: tally(u3, wide), u3n: u3.length, u4: tally(u4, wide), u4n: u4.length } : null,
    commerce: ent && pay ? { entitlement: ent.doers.length, payment: pay.doers.length, standards: ent.std.length + pay.std.length } : null,
    paper: { n: paperParts.length, example: cred && paperParts.includes(cred) ? cred : paperParts[0] ?? null },
  }
}

/** How far each side of the chart reaches: the largest in-use and not-in-use totals over every bar. */
export function chartScale(model: Model, t: Together, wide: number): [number, number] {
  const bars = (['all', ...t.lanes] as Scope[]).map((s) => tally(partsOf(t, model, s), wide))
  return [Math.max(1, ...bars.map(inUse)), Math.max(1, ...bars.map(notInUse))]
}
