// Reading the related use cases for one row. Need evidence only: what is computed here
// explains why a task needs a row and never feeds a cell, a count or a rating.

import type { Model, UseCase, UseCaseCoverage, UseCaseLink } from '../design-model.ts'

/** Every link to this row, in case-id order. */
export const linksFor = (model: Model, cid: string): UseCaseLink[] =>
  model.useCases.links.filter((l) => l.cap === cid).sort((a, b) => a.case.localeCompare(b.case))

export const coverageFor = (model: Model, cid: string): UseCaseCoverage | null =>
  model.useCases.coverage[cid] ?? null

export const caseOf = (model: Model, link: UseCaseLink): UseCase | null =>
  model.useCases.cases.get(link.case) ?? null

/** The basis as a reader says it. Basis is the contributor's reading, not a review result. */
export const basisLabel = (basis: UseCaseLink['basis']): string =>
  basis === 'derived' ? 'Stated need · derived' : 'Implied need · proposed'

export const basisMeaning = (basis: UseCaseLink['basis']): string =>
  basis === 'derived'
    ? 'The case states the need, in the contributor\'s reading.'
    : 'The case implies the need without naming it.'

/** The Atlas's own review, kept apart from the basis. */
export const reviewLabel = (status: UseCaseLink['review']['status']): string => ({
  unreviewed: 'Unreviewed by the Atlas',
  accepted: 'Accepted by the Atlas',
  'needs-change': 'Needs change',
  rejected: 'Rejected by the Atlas',
  stale: 'Stale: changed since review',
})[status]

export const specificityLabel = (c: UseCase): string =>
  c.specificity === 'generic' ? 'Generic'
    : c.extends.length ? `${c.specificity === 'individual' ? 'Individual' : 'Specialised'} · extends ${c.extends.join(', ')}`
    : c.specificity === 'unknown' ? 'Specificity not stated' : c.specificity === 'individual' ? 'Individual' : 'Specialised'

/** Where the link came from, in words, or null for a link in the contribution files. */
export function originLabel(link: UseCaseLink): string | null {
  if (link.origin === 'contributor-public-record') return 'On the public record, not in the pinned contribution'
  if (link.origin === 'atlas-reader') return 'Proposed by an Atlas reader'
  return null
}

/**
 * The reason without its leading quotation of the scope, which the panel already shows as the
 * record's own words. A reason that is only the quotation is kept whole.
 */
export function reasonText(link: UseCaseLink): string {
  const rest = link.reason.replace(/^Scope: "[^"]*"\.?\s*/, '')
  return rest.length >= 20 ? rest : link.reason
}

/** The other rows the same case links to, by name. */
export const alsoLinks = (model: Model, link: UseCaseLink): string[] =>
  model.useCases.links
    .filter((l) => l.case === link.case && l.cap !== link.cap)
    .map((l) => model.byCapability.get(l.cap)?.name ?? l.cap)

/**
 * How far the cases behind a row overlap: which of them extend another case shown, and how many
 * implementation records their public pages link, in total and distinct. Null when fewer than two
 * cases carry a page reading.
 */
export function overlapOf(model: Model, links: UseCaseLink[]):
  { read: number; sum: number; distinct: number; repeated: string[]; extending: string[] } | null {
  const cases = [...new Set(links.map((l) => l.case))]
    .map((id) => model.useCases.cases.get(id)).filter((c): c is UseCase => Boolean(c))
  const read = cases.filter((c) => c.readAt)
  if (read.length < 2) return null
  const seen = new Map<string, number>()
  for (const c of read) for (const id of c.implementationsLinked) seen.set(id, (seen.get(id) ?? 0) + 1)
  const ids = new Set(cases.map((c) => c.id))
  return {
    read: read.length,
    sum: read.reduce((n, c) => n + c.implementationsLinked.length, 0),
    distinct: seen.size,
    repeated: [...seen].filter(([, n]) => n > 1).map(([id]) => id).sort(),
    extending: cases.filter((c) => c.extends.some((p) => ids.has(p))).map((c) => `${c.id} extends ${c.extends.filter((p) => ids.has(p)).join(', ')}`),
  }
}

/** Linked in the source's coverage file but not imported as a record. */
export const notImported = (coverage: UseCaseCoverage, links: UseCaseLink[]): string[] =>
  coverage.ids.filter((id) => !links.some((l) => l.case === id))

/** "2026-10-21" from an ISO date or time. */
export const day = (iso: string | null | undefined): string => (iso ?? '').slice(0, 10)

/** "1d89b28" from a full commit id. */
export const shortCommit = (sha: string | null | undefined): string => (sha ?? '').slice(0, 7)

/** The current Atlas figures for a row, in the words the source's copy uses. */
export function currentFigures(model: Model, cid: string): { native: number; partial: number; assessed: number } {
  const a = model.agg[cid] ?? {}
  const n = (k: string) => a[k] ?? 0
  return {
    native: n('native'),
    partial: n('partial'),
    assessed: n('native') + n('via-extension') + n('partial') + n('none') + n('conflicts'),
  }
}

/** How many links back a row, for the preset's reason list. Null until the records arrive. */
export const linkCount = (model: Model, cid: string): number | null =>
  model.detLoaded ? linksFor(model, cid).length : null
