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
164 of the 2026-09-22 capture, and since 2026-10-21 the 175 of the 2026-10-20 capture. A link is made only where a reader comparing the two texts arrives at the
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
2. **Weigh the candidate capabilities.** The first five (model-based object tracking, remote
   (split) rendering, live data binding, activity and learning records, physiological signals as
   input) are in the map since its 2026-10-20 data, and are marked `adopted` here; they stay in the
   file because the map cites it as their source. One is open: **non-visual sensory effects** (wind,
   scent, light, a motion seat), rendered from effect metadata on whatever devices the viewer has.
   `input.haptic` covers touch only, and ISO/IEC 23005 (MPEG-V) defines such a description.
3. **Use demand as evidence for `interop_uses`.** The interoperability boundaries rest on four use
   cases, U1 to U4. Section 2 of the demo page lists rows rated *should* or *none* that three or more
   real deployments depend on. That does not settle a rating, but it gives the next boundary
   review somewhere to look.
4. **Carry a demand column.** A *must* row that many use cases need and few systems provide is a
   standardisation gap with deployments behind it. That is a sharper ranking than coverage alone.

## Keeping it current

The repository regenerates these files from its database with one command
(a script the VDC maintains), so a refresh is a new commit on this branch,
not hand work. The repository imports the map's claims the same way, from a dated capture.

The files were last refreshed on 2026-10-21, after the map's 2026-10-20 data was merged into this
branch. The repository imported that capture, linked its eleven new rows where use case scopes name
the need (the five adopted from here among them), and read the use cases added since the previous
refresh against all 175 rows: 74 new links, each quoting its scope word for word.

The previous refresh, on 2026-10-19, followed the rewrite of the repository's record texts: every
link note was read again against the current scope, and scores of the map frozen into note text were
removed (the `demand.csv` columns carry them instead).

## Licence

Offered under CC0 1.0, the map's own licence. The `note`
column quotes the repository's own use case text.
