# How to score a subject against the territory map

**Write to this directory, `tool/data/`. Never to `spatial-tech-map/data/`, which
is a generated export that the next sync erases.**

You are filling cells in one subject's row of a comparison matrix for the Metaverse Standards
Forum Infrastructure Working Group. The map's purpose: say which standard or tool does what, where
two of them overlap, and where nothing reaches. A false claim here is worse than a missing one.

`VISION.md` at the workspace root is the authority. Where this guide and the vision disagree,
the vision wins; report the disagreement.

## Read first
- `capabilities.csv` in this folder. Count its rows; do not trust a number written anywhere else.
  Columns: `id, group_id, name, definition, binding, interop, interop_reason, interop_uses, sort`.
  **Score against the definition, not the name.**
- `interop` says how much two independent systems must agree on the row: `must`, `should` or
  `none`. `interop_uses` lists which of the four use cases (U1 to U4) the row serves. Work on
  `must` rows first.
- `subjects.csv` for the subject's identity and stated version, and `scope/<subject_id>.md` for its
  published scope trace.

## Levels — use exactly these
- `native` — the subject specifies or implements this itself, in its core.
- `via-extension` — supported through a named extension, plug-in, module or optional profile. Say which in the note.
- `partial` — some of the definition is met and some is not. The note must say which part is missing.
- `none` — in scope for something like this subject, but absent.
- `conflicts` — the subject does this in a way that will not interoperate with the common approach. Say how.
- `out-of-scope` — the subject is not the kind of thing that would do this, and its own scope
  statement shows it. It never means "not researched", and it never means "the grid cannot
  express what this subject does".

## Evidence — what each level needs
Every source carries `url`, `title`, `retrieved` (YYYY-MM-DD), `kind` and an exact `quote` from
the page. A source without a quote is not evidence.

- `native`, `via-extension`, `partial`: at least one primary source whose quote supports the claim.
- `conflicts`: a quoted primary source for each side of the conflict. One document may hold both.
- `none`: a quoted primary source showing the area is within the subject's scope, and a search
  record in the note, in this form: "Searched <documents and versions> for <terms> on
  YYYY-MM-DD; <result>." Confidence is `verified` only if the subject's full primary
  documentation was searched; otherwise `unverified`.
- `out-of-scope`: a quoted primary source in which the subject states what it is for. One scope
  statement may serve many of a subject's out-of-scope cells, but each note says why this
  capability falls outside it.

## Confidence — use exactly these
- `verified` — you read it in a primary source and quoted it, under the evidence rule above.
  Never `verified` without a source attached.
- `reported` — a credible secondary source says so and you could not reach a primary one.
- `unverified` — an absence you could not fully check. Prefer leaving the cell empty.

## Sources
- Primary only for `verified`: specification text, official registries, official
  documentation, the project's own repository. Not blogs, not marketing, not encyclopedias.
- Never cite MSF member-only material, such as meeting minutes or draft proposals: the map is public.
- Pin the version or commit when the source is a repository, and record the retrieval date.
- `local-evidence` is the project's own test record. Use it only beside a public source, or to
  record a tested observation the note labels as such. The export removes its local path.
- Licensed or paywalled text: score only what you actually read, and say so in the note.
- Do not guess version numbers or dates. Leave them out rather than approximate.
- Where a capability is genuinely contested inside the subject, say so in the note.

## Empty cells
An empty cell means "not assessed". That is an honest answer. Never fill a cell to raise a
percentage. Skip capabilities you cannot assess, and list every skipped target cell in your lane
result with the reason.

## Output
Do not edit `coverage/<subject_id>.json` directly. Write your new or changed entries to the
lane's staging file; the merge step adds them after an independent check. Never rewrite a whole
coverage file, and never delete an entry without a recorded reason: a rewritten file can lose
claims without anyone noticing.

An entry has this shape:

```json
{
  "capability_id": "render.raster",
  "level": "native",
  "note": "one clear sentence",
  "confidence": "verified",
  "sources": [
    {"url": "https://...", "title": "...", "retrieved": "2026-10-20", "kind": "primary", "quote": "short exact quote"}
  ]
}
```

A new subject's file also carries a `summary`: three to six sentences on what the subject is,
what it covers well, what it leaves to others, and any trap a standards audience should know.
Plain English, no jargon, no acronyms spelled short.

Return in your final reply: the count of entries by level, the count by confidence, the paths of
your staging and lane result files, and the three findings most likely to matter to a standards
working group. Do not paste the JSON.

## Direction: does it read the thing, write it, or both

A coverage row may carry an optional `direction` field, next to `confidence`. It says which way
the support runs for that one claim, and it takes exactly one of `read`, `write` or `both`.

- `read` — the subject can take the thing in but cannot put it back out. A runtime that loads a
  format and ships no exporter for it belongs here.
- `write` — the reverse. It can produce the thing but cannot consume it.
- `both` — it does each way. Where the two sides are uneven, say so in the note; one word cannot
  carry a per-format list.

Leave the key out when the claim is not about moving data in or out, or when you did not settle
the direction. A missing key is not a claim, and every row written before the field existed has
none. Set it only from the same evidence that supports the level, and never from the level alone:
`native` says nothing about which way the data flows. Never drop a direction an entry already has
without saying why.

```json
{"capability_id": "scene.container", "level": "native", "note": "...",
 "confidence": "verified", "direction": "read", "sources": [ ... ]}
```

The field exists so the lopsided cases can be counted and queried. Several runtimes read a format
they cannot write, which decides whether they are a conduit between tools or a terminus, and until
now that fact was buried in note text where nothing could find it.
