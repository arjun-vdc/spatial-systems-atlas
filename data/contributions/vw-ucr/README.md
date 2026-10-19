# Contribution: demand from the Virtual Worlds Use Case Repository

**A proposal on the branch `vw-ucr-contributions`. Nothing here changes a published figure.**

The map measures **supply**: which systems provide each capability, with the evidence attached. It
holds no use cases, so it cannot measure **demand**: which capabilities real deployments actually
depend on. The Virtual Worlds Use Case Repository (VW-UCR) of the Virtual Dimension Center (VDC),
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
| `candidate-capabilities.csv` | need the map has no row for | A proposed row in the columns of `data/capabilities.csv`, with the use cases that need it |

`build_demand.py` reads these files and `board/territory.json` and writes
`board/demand-standalone.html`, a self-contained page that shows them together. It refuses to build
if a capability id here is not in the export.

```bash
cd data
python3 build_demand.py
```

## How the links were made

Every use case scope in the repository was read against the map's 164 capability definitions
(capture of 2026-09-22). A link is made only where a reader comparing the two texts arrives at the
pairing, and its note quotes the words it rests on. `derived` means the scope states the need;
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
2. **Weigh the candidate capabilities.** Five needs turned up that no row describes: model-based
   object tracking, remote (split) rendering, live data binding of a twin, activity and learning
   records, and physiological signals as input. The proposed `interop` value is argued with the map's
   own rule.
3. **Use demand as evidence for `interop_uses`.** The interoperability boundaries rest on four use
   cases, U1 to U4. Section 2 of the demo page lists rows rated *should* or *none* that three or more
   real deployments depend on. That does not settle a rating, but it gives the next boundary
   review somewhere to look.
4. **Carry a demand column.** A *must* row that many use cases need and few systems provide is a
   standardisation gap with deployments behind it. That is a sharper ranking than coverage alone.

## Keeping it current

The repository regenerates these files from its database with one command
(`scripts/atlas_contribution_export.py` in the VDC wiki), so a refresh is a new commit on this branch,
not hand work. The repository imports the map's claims the same way, from a dated capture.

## Licence

Offered under CC0 1.0, the map's own licence. The `note`
column quotes the repository's own use case text.
