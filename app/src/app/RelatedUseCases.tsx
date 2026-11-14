// The row panel's Related use cases section: why a task needs this row, from public use-case
// records, each with its basis and its Atlas review status, and the coverage of the repository
// the records come from. It sits above the subject bands and says nothing about support.

import { useState } from 'react'
import type { Capability, Model, UseCaseLink } from '../design-model.ts'
import {
  alsoLinks, basisLabel, basisMeaning, caseOf, coverageFor, currentFigures, day, linksFor, notImported,
  originLabel, overlapOf, reasonText, reviewLabel, shortCommit, specificityLabel,
} from './use-cases.ts'

export function RelatedUseCases({ model, capability }: { model: Model; capability: Capability }) {
  const [open, setOpen] = useState(true)
  const [openCase, setOpenCase] = useState<string | null>(null)
  const loaded = model.detLoaded
  const links = loaded ? linksFor(model, capability.id) : []
  const src = model.useCases.source
  const contribution = src ? `contribution of ${src.refreshed}` : 'no contribution imported'
  const readOn = src ? day(src.records_read_at) : ''

  return (
    <section style={u.section} aria-labelledby="ruc-heading">
      <div style={u.head}>
        <button type="button" style={u.toggle} aria-expanded={open} aria-controls="ruc-body"
          onClick={() => setOpen(!open)}>
          <span aria-hidden="true">{open ? '▾' : '▸'}</span>
          <span style={u.srOnly}>Show or hide related use cases</span>
        </button>
        <h3 id="ruc-heading" style={u.h3}>Related use cases</h3>
        {loaded && <span style={u.count}>{links.length}</span>}
      </div>
      {open && (
        <div id="ruc-body">
          {!loaded ? (
            <p style={u.quiet} role="status">Loading related use cases…</p>
          ) : (
            <>
              <p style={u.intro}>
                Why a task needs this row, from public use-case records
                {src ? ` in the ${src.use_case_repository}` : ''}. These records say nothing about
                which subjects support the row; that is below.
              </p>
              {links.length > 0
                ? links.map((l) => (
                    <Case key={l.id} model={model} link={l} open={openCase === l.case}
                      toggle={() => setOpenCase(openCase === l.case ? null : l.case)} />
                  ))
                : (
                  <div style={u.empty}>
                    <strong>No use case links to this row.</strong> No record imported into the
                    Atlas from the contributing repository is linked to it ({contribution}
                    {readOn ? `; records read ${readOn}` : ''}). Unmapped does not mean unneeded.
                  </div>
                )}
              <Coverage model={model} capability={capability} links={links} />
            </>
          )}
        </div>
      )}
    </section>
  )
}

function Case({ model, link, open, toggle }: { model: Model; link: UseCaseLink; open: boolean; toggle: () => void }) {
  const c = caseOf(model, link)
  const src = model.useCases.source
  const origin = originLabel(link)
  const also = alsoLinks(model, link)
  const body = `ruc-${link.id.replace(/[^A-Za-z0-9-]/g, '-')}`
  const title = c?.title ?? link.case
  return (
    <div style={u.case}>
      <button type="button" style={u.caseButton} aria-expanded={open} aria-controls={body} onClick={toggle}>
        <span aria-hidden="true" style={{ width: 12, flex: 'none' }}>{open ? '▾' : '▸'}</span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={u.caseTitle}>{title}</span> <span style={u.mono}>{link.case}</span>
          <span style={u.tags}>
            <span style={link.basis === 'derived' ? u.tagDerived : u.tagProposed} title={basisMeaning(link.basis)}>
              {basisLabel(link.basis)}
            </span>
            <span style={link.review.status === 'unreviewed' || link.review.status === 'stale' ? u.tagReview : u.tag}>
              {reviewLabel(link.review.status)}
            </span>
            {c && <span style={u.tag}>{specificityLabel(c)}</span>}
            {origin && <span style={u.tag}>{origin}</span>}
          </span>
        </span>
      </button>
      {open && (
        <div id={body} style={u.caseBody}>
          <span style={u.eyebrow}>The record says</span>
          <blockquote style={u.quote}>“{link.passage}”</blockquote>
          <span style={u.eyebrow}>Why this row</span>
          <p style={{ margin: '2px 0 6px' }}>{reasonText(link)}</p>
          {also.length > 0 && <p style={u.small}>This case also links to: {also.join(', ')}</p>}
          <dl style={u.dl}>
            {link.section && <><dt style={u.dt}>Section</dt><dd style={u.dd}>{link.section}</dd></>}
            {c && (
              <><dt style={u.dt}>Record</dt><dd style={u.dd}>
                {[c.version, c.status, c.date ? `dated ${c.date}` : null].filter(Boolean).join(', ')}
                {c.readAt ? `; read ${day(c.readAt)}` : ''}
              </dd></>
            )}
            <dt style={u.dt}>Link from</dt>
            <dd style={u.dd}>
              {link.origin === 'contributor' && src
                ? `Contribution of ${src.refreshed} (commit ${shortCommit(src.commit)})`
                : link.origin === 'contributor-public-record'
                  ? `The public record page only, read ${day(c?.readAt)}; not in the contribution of ${src?.refreshed ?? 'the pinned commit'}`
                  : 'An Atlas reader'}
            </dd>
            <dt style={u.dt}>Review</dt>
            <dd style={u.dd}>
              {reviewLabel(link.review.status)}{link.review.at ? `, ${day(link.review.at)}` : ''}. Basis and
              review are separate: review can accept or reject the link; it does not turn an implied
              need into a stated one.
            </dd>
          </dl>
          {link.drift.map((d, i) => (
            <p key={i} style={u.flag}>
              <strong>Source copy of an Atlas value:</strong> the source shows this row as{' '}
              <em>{d.source_value}</em>; the current Atlas rates it <em>{d.current_atlas_value}</em>. The
              Atlas value stands.
            </p>
          ))}
          {link.review.note && <p style={u.flag}><strong>Review note:</strong> {link.review.note}</p>}
          {c && (
            <a href={c.url} target="_blank" rel="noreferrer">
              Open the original public record {link.case}<span style={u.srOnly}> (opens in a new tab)</span> ↗
            </a>
          )}
        </div>
      )}
    </div>
  )
}

function Coverage({ model, capability, links }: { model: Model; capability: Capability; links: UseCaseLink[] }) {
  const cov = coverageFor(model, capability.id)
  const src = model.useCases.source
  if (!cov || !src) return null
  const outside = notImported(cov, links)
  const overlap = overlapOf(model, links)
  const now = currentFigures(model, capability.id)
  return (
    <div style={u.cov} role="group" aria-labelledby="cov-heading">
      <span style={u.eyebrow} id="cov-heading">Coverage in the contributing repository</span>
      <div style={u.tiles}>
        <Tile n={cov.useCases} label="use cases linked to this row" />
        <Tile n={cov.specialisations} label="records that specialise them" />
        <Tile n={cov.deployments} label="deployments filed under them" />
      </div>
      <p style={u.covText}>
        Source: contribution of {src.refreshed} ({src.folder}/demand.csv, commit {shortCommit(src.commit)}).
        Three separate counts: do not add them. Which records make up the specialisations and the
        deployments is not published, so a distinct combined total is <strong>unknown</strong>.
      </p>
      {outside.length > 0 && (
        <p style={u.covText}>
          Linked in the contribution but not imported as records here: {outside.join(', ')}. They
          have not been checked against their public records.
        </p>
      )}
      {overlap && (
        <p style={u.covText}>
          Overlap: {overlap.extending.length
            ? `some cases extend others shown here (${overlap.extending.join('; ')}), so case counts overlap. `
            : ''}
          Reading the {overlap.read} records on {readDay(model)}: {overlap.sum} implementation links,{' '}
          <strong>{overlap.distinct} distinct</strong>
          {overlap.repeated.length ? `; ${overlap.repeated.length} appear under more than one case` : ''}.
        </p>
      )}
      {cov.interop && cov.interop !== capability.interop && (
        <p style={u.covText}>
          The source shows this row as <em>{cov.interop}</em>; the current Atlas rates it{' '}
          <em>{capability.interop}</em>. The Atlas value stands.
        </p>
      )}
      {cov.atlas.scored !== null && (
        <p style={u.covText}>
          The source also carries the Atlas figures of {src.atlas_figures_date} ({cov.atlas.native} built
          in, {cov.atlas.partial} partial, {cov.atlas.scored} assessed). Current Atlas: {now.native} built
          in, {now.partial} partial, {now.assessed} assessed in scope.
        </p>
      )}
      <p style={{ ...u.covText, color: 'var(--faint)' }}>
        This is coverage of one repository, which collects cases from its own sources. It is not
        market demand and never changes a support or interoperability rating.
      </p>
    </div>
  )
}

const readDay = (model: Model) => day(model.useCases.source?.records_read_at)

function Tile({ n, label }: { n: number; label: string }) {
  return (
    <div style={u.tile}>
      <strong style={{ fontFamily: 'var(--fm)', fontSize: 17 }}>{n}</strong>
      <span style={{ fontSize: 11.5, color: 'var(--soft)' }}>{label}</span>
    </div>
  )
}

const tagBase = { fontFamily: 'var(--fm)', fontSize: 10, lineHeight: 1.5, border: '1px solid var(--ruleS)', borderRadius: 2, padding: '0 4px', color: 'var(--soft)', whiteSpace: 'normal' } as const

const u = {
  section: { border: '1px solid var(--ruleS)', borderRadius: 'var(--r)', padding: '8px 10px', margin: '0 0 12px', background: 'var(--bg)' } as const,
  head: { display: 'flex', alignItems: 'center', gap: 8 } as const,
  toggle: { fontFamily: 'var(--fl)', fontSize: 11, background: 'transparent', border: '1px solid var(--rule)', borderRadius: 'var(--r)', padding: '1px 7px', cursor: 'pointer', color: 'var(--ink)' } as const,
  h3: { margin: 0, fontFamily: 'var(--fl)', fontWeight: 700, fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase' } as const,
  count: { fontFamily: 'var(--fm)', fontSize: 11, color: 'var(--faint)' } as const,
  intro: { margin: '6px 0 6px', fontSize: 12.5, color: 'var(--soft)' } as const,
  quiet: { margin: '6px 0', fontSize: 12, color: 'var(--faint)', fontStyle: 'italic' } as const,
  empty: { margin: '6px 0', fontSize: 12.5, padding: '6px 8px', border: '1px dashed var(--ruleS)', borderRadius: 'var(--r)' } as const,
  case: { borderTop: '1px solid var(--rule)', padding: '4px 0' } as const,
  caseButton: { display: 'flex', gap: 6, width: '100%', textAlign: 'left', background: 'transparent', border: 0, padding: '4px 0', cursor: 'pointer', color: 'var(--ink)', fontSize: 12.5, alignItems: 'flex-start' } as const,
  caseTitle: { fontFamily: 'var(--fl)', fontWeight: 600, overflowWrap: 'anywhere' } as const,
  mono: { fontFamily: 'var(--fm)', fontSize: 10, color: 'var(--faint)' } as const,
  tags: { display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 } as const,
  tag: tagBase,
  tagDerived: { ...tagBase, borderColor: 'var(--ac)', color: 'var(--ac)' } as const,
  tagProposed: { ...tagBase, borderStyle: 'dashed', borderColor: 'var(--warn)', color: 'var(--warn)' } as const,
  tagReview: { ...tagBase, background: 'var(--warnF)', borderColor: 'var(--warn)', color: 'var(--ink)' } as const,
  caseBody: { padding: '4px 0 8px 18px', fontSize: 12.5, overflowWrap: 'anywhere' } as const,
  eyebrow: { fontFamily: 'var(--fl)', fontWeight: 700, fontSize: 9.5, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--faint)' } as const,
  quote: { margin: '2px 0 6px', paddingLeft: 8, borderLeft: '2px solid var(--ruleS)', fontStyle: 'italic' } as const,
  small: { margin: '0 0 6px', fontSize: 11.5, color: 'var(--faint)' } as const,
  dl: { display: 'grid', gridTemplateColumns: 'max-content 1fr', gap: '2px 10px', margin: '0 0 6px', fontSize: 12 } as const,
  dt: { color: 'var(--faint)', fontFamily: 'var(--fl)', fontSize: 11 } as const,
  dd: { margin: 0 } as const,
  flag: { margin: '0 0 6px', padding: '4px 8px', borderLeft: '3px solid var(--warn)', background: 'var(--warnF)', fontSize: 12 } as const,
  cov: { marginTop: 8, padding: '8px 10px', border: '1px solid var(--rule)', borderRadius: 'var(--r)', background: 'var(--panel)' } as const,
  tiles: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(96px, 1fr))', gap: 6, margin: '6px 0' } as const,
  tile: { display: 'flex', flexDirection: 'column', gap: 2, border: '1px solid var(--rule)', borderRadius: 'var(--r)', padding: '4px 8px', background: 'var(--bg)' } as const,
  covText: { margin: '0 0 6px', fontSize: 12 } as const,
  srOnly: { position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 } as const,
}
