# Contribution: demand from the Virtual Worlds Use Case Repository

**A proposal on the branch `vw-ucr-contributions`. Nothing here changes a published figure.**

The map measures **supply**: which systems provide each capability, with the evidence attached. It
holds no use cases, so it cannot measure **demand**: which capabilities real deployments actually
depend on. The Virtual Worlds Use Case Repository (Virtual Worlds UCR) of the Virtual Dimension Center (VDC),
Fellbach, holds that half. It describes virtual-world use cases in the IEC 62559-2 template and
files real deployments under them. Each use case is linked to the capabilities on this map that it
depends on.

- Repository: <https://usecases.vdc-fellbach.de>
- Contact: Virtual Dimension Center Fellbach

## What is here

| File | One row per | What it offers the map |
|---|---|---|
| `demand.csv` | capability with at least one use case | Use cases linked, records that specialise them, deployments under them, beside the map's own native/partial/scored counts |
| `links.csv` | use case → capability link | The link's basis (`derived` or `proposed`) and the sentence of the use case it rests on, with the record's address |
| `deployment-evidence.csv` | deployment × capability, for deployments built on a system the map scores | The map's verdict for that pair, or a blank where the map has no claim. `realisation` says whether the deployment fully realises its use case |
| `interop-evidence.csv` | product × must-agree capability × standard | Standards a public deployment's own record names for a must-agree row, for the Atlas's `via` list (1.4.57). Columns: `subject_id`, `cap_id`, `interop`, `standard_id` (an Atlas standard subject), `implementation_id`, `via_use_cases` (a use case of that deployment linked to the capability), `quote` (the record's own words, exact) and `url`. Not a claim: the repository holds no product claims, so each row is evidence for a maintainer to turn into a `via` entry with the claim's own source |
| `lane-candidates.csv` | lane × capability, for five candidate use case lanes (U5–U9) | Use cases the repository holds many deployments for, with the rows that stop them; where a row rated *should* would become *must*. Read with `LANE-CANDIDATES.md` |
| `candidate-capabilities.csv` | need the map had no row for | A proposed row in the columns of `data/capabilities.csv`, with the use cases that need it, and a `status` column: adopted or open |

`build_demand.py` reads these files and `board/territory.json` and writes
`board/demand-standalone.html`, a self-contained page that shows them together. It refuses to build
if a capability id here is not in the export.

```bash
cd data
python3 build_demand.py
```

## How the links were made

Every use case scope in the repository was read against the map's capability definitions: the
164 of the 2026-09-22 capture, since 2026-10-21 the 175 of the 2026-10-20 capture, and since
2026-11-10 the 178 of the 2026-11-09 data. A link is made only where a reader comparing the two texts arrives at the
pairing, and its note gives the words it rests on, quoted or closely paraphrased. `derived` means the scope states the need;
`proposed` means the scope implies it without naming it, and the note says what is missing. Many
plausible pairings were left out on purpose. Individual use cases (a named company's realisation)
inherit the links of the generic use case they specialise, and carry their own only where they name a
need their parent does not.

**Public records only.** Nothing that is restricted in the repository is in these files.

## What the maintainers could do with it, smallest first

1. **Look at the deployment checks.** Rows with a `none` or `conflicts` verdict are a deployment that
   worked around its platform, or a claim worth reading again. Rows with no verdict are pairs the map
   never scored where a deployment bears on them. Each can be filed as a `kind:correction`
   submission.
2. **Weigh the candidate capabilities.** All six are in the map and marked `adopted` here: the
   first five (model-based object tracking, remote (split) rendering, live data binding, activity
   and learning records, physiological signals as input) since its 2026-10-20 data, and non-visual
   sensory effects since 2026-11-01. They stay in the file because the map cites it as their source.
3. **Use demand as evidence for `interop_uses`.** The interoperability boundaries rest on four use
   cases, U1 to U4. Section 2 of the demo page lists rows rated *should* or *none* that three or more
   real deployments depend on. That does not settle a rating, but it gives the next boundary
   review somewhere to look.
4. **Consider more lanes.** `LANE-CANDIDATES.md` proposed U5 to U9 from clusters of real deployments. The map took U6 (the same thing at the same real place) and U7 (a training result leaves the simulator) on 2026-11-03; `lane_status` in `lane-candidates.csv` says which. U5, U8 and U9 stay here as evidence.
5. **Carry a demand column.** A *must* row that many use cases need and few systems provide is a
   standardisation gap with deployments behind it. That is a sharper ranking than coverage alone.

## Keeping it current

The repository regenerates these files from its database with one command
(a script the VDC maintains), so a refresh is a new commit on this branch,
not hand work. The repository imports the map's claims the same way, from a dated capture.

The files were last refreshed on 2026-11-17, after the map's version 1.4.57 was merged into this branch. They now hold 383 links on 219 public use cases, 115 demand rows and 132 deployment checks; only public records are exported. The repository added 76 linked use cases since 2026-10-21.

Before that, the files were refreshed on 2026-11-10, after the map's 2026-11-09 data (version 1.4.49)
was merged into this branch. The repository imported it, linked the three new rows where use case
scopes name the need (non-visual sensory effects on four use cases, portal preview on one; no scope
names a renderer swap), and read the use cases added since its previous pass (VW-UC-0418 to 0431)
against all 178 rows: 24 new links, each quoting its scope word for word.

Before that, the files were refreshed on 2026-10-27, after the map's 2026-10-21 publication (pop-up note
wording only; no claim changed) was merged into this branch; the counts moved with the repository's
new deployments. The same day the repository read the 80 use cases added since its previous pass
(VW-UC-0338 to 0417) against all 175 rows: 112 new links on 51 use cases, each quoting its scope
word for word. The refresh before that, on 2026-10-21, followed the map's 2026-10-20 data.

On 2026-10-21 the files were refreshed after the map's 2026-10-20 data was merged into this
branch. The repository imported that capture, linked its eleven new rows where use case scopes name
the need (the five adopted from here among them), and read the use cases added since the previous
refresh against all 175 rows: 74 new links, each quoting its scope word for word.

The previous refresh, on 2026-10-19, followed the rewrite of the repository's record texts: every
link note was read again against the current scope, and scores of the map frozen into note text were
removed (the `demand.csv` columns carry them instead).

## Interop evidence (2026-11-17)

`interop-evidence.csv` holds 4 rows, from 82 public deployments on the 14 products joined to repository systems: 47 of them touch a must-agree row through their use cases, 5 name a standard that is an Atlas subject in their own text, and 4 of those name it for a row their use case needs. The repository has no structured link from a deployment to a standard, so the rows come from the deployment's own text only; no standard is inferred. Two cases were left out: IEEE 2874 on lunar-rover twin VW-IMP-0227 (no must-agree row is named for it) and WebXR on VW-IMP-XRU01 (named as the renderer, not for replication). Each row is a deployment built with the product, not a statement that the product itself implements the standard.

## Licence

Offered under CC0 1.0, the map's own licence. The `note`
column quotes the repository's own use case text.
