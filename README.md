# Spatial Systems Atlas

**Convergence / Interoperability Matrix**

An evidence-backed map of what spatial-computing systems actually do.

66 subjects scored against 175 capabilities in 15 groups: 10,659 claims drawn from
2,687 distinct sources, with 62 recorded conflicts and 141 unverified claims
counted separately rather than blurred into the rest.

Every claim here is tied to a source you can open. That is the point of it. The
map exists because the Metaverse Standards Forum Infrastructure Working Group
needed to see what interoperates with the evidence attached, instead of taking
vendor claims at face value.

## Read the map

The published map is at **https://openspatials.com/msf/atlas/**.

## What is here

- **`board/`** — the published map. `territory.json` is the export every view is
  computed from; the standalone HTML pages are self-contained copies that run
  from any static host. The directory keeps this name because the build scripts
  resolve it by name.
- **`data/`** — the research sources and the scripts that turn them into the
  export. This is what makes the map checkable rather than assertable.
- **`app/`** — the interface, in React and TypeScript.
- **`research/`** — how capabilities were defined, where the interoperability
  boundaries were drawn and why, and the corrections made along the way.

## Reproduce every number

Nothing here is hand-maintained. The chain runs one way and you can run all of it:

```
CSV seeds and per-subject coverage JSON  →  data/load.py   →  data/territory.db
data/territory.db                        →  data/build.py  →  board/territory.json
```

```bash
cd data
python3 load.py          # rebuild the database from the sources
python3 build.py         # rebuild the published export and pages
```

Run `build.py` twice against an unchanged database and it produces identical
bytes. The one line that legitimately moves is the build stamp in
`board/territory.md`, which is the database file's own modification time.

**Nothing reads the database live, and the published site does not either.** The
site serves a static export. That is deliberate: you can check the numbers
without trusting a running service.

The written explanations quote figures from the database and the build
substitutes them at build time. It refuses to publish a figure typed in by hand
that has gone stale — that had already happened once, and the published map spent
months reporting 1,749 claims while the database held 6,882.

## Run the interface

```bash
cd app
npm install
npm run dev
npm test        # 50 tests over the counting rules and the published figures
```

The tests are worth reading before the code. They state the rules the map lives
by: that seven claim meanings stay distinct, that a capability nobody has checked
is never reported as absent, that "reach" has exactly one definition, and that
every percentage states what it counts.

## How to read a claim

A claim is one subject scored against one capability. Seven meanings are kept
apart and never merged:

- **Built in** — the subject ships it.
- **Through an extension** — available, not in the core.
- **Partial** — some of it, with limits.
- **Absent** — somebody checked, and it is not there.
- **Conflict** — two systems will not agree.
- **Out of scope** — not this kind of subject.
- **Not assessed** — nobody has checked yet.

The last two are the ones most often lost elsewhere. *Absent* and *not assessed*
are different facts, and collapsing them would be the most damaging thing that
could happen to this dataset.

Confidence is recorded separately from support. Verified means somebody read the
primary source and can quote it.

## What the coverage percentages do and do not say

A capability counts as covered when **at least one** counted subject reaches it.
That says somebody has built the thing once. **It does not say any two systems
work together.** Read it as a floor, not a verdict.

## Contributing a correction

Corrections are welcome and the issue list is the place for them. A correction
lands fastest when it names the claim, says what is wrong, and cites a primary
source — specification text, an official registry, official documentation, or the
project's own repository.

The map's own comment button files an issue here too, and
[SUBMISSIONS.md](SUBMISSIONS.md) explains the whole process: the three kinds of
submission, what happens to one after you file it, and the rule that an email
address given on the form is never written into the public issue.

## A note on paths

This repository is assembled from a working repository where the same content
sits under `tool/`, and which earlier kept it under `infrastructure-wg/`. Older documents in `research/` and
`board/CHANGES.md` refer to paths like `infrastructure-wg/data/territory.db`.
Read those as `data/territory.db` here. The files are the same; only the
directory layout was flattened for publication.

## Licence

**Public domain. CC0 1.0 Universal.** Take it, change it, sell it, build on it.
No permission needed, no conditions, no credit required. See `LICENSE`.

What I would like, and it is a request rather than a condition: if this ends up
in something you make, mention where it came from.

    Spatial Systems Atlas by Grig Bilham
    https://github.com/openspatials/spatial-systems-atlas
    https://openspatials.com/msf/atlas/

If you quote a figure, give the date you took it as well. The map is rebuilt as
the research grows and the numbers move.

### The one part that is not mine to give

The research data contains 8,363 short quotations from other parties'
specifications and documentation — a median of 15 words each, none longer than
68. Every one carries the address it came from, the document title and the date
it was retrieved.

They are here so you can check a claim instead of trusting it. They belong to
their sources, and the public domain dedication above does not reach them.
