# What changed on the map

Newest first. One section per pass. Every number here can be re-derived from
`infrastructure-wg/data/territory.db` with the queries recorded in that pass's result file.

---

## 2026-10-20 — nine new subjects, eleven new rows, and a commerce group

The map now scores 66 subjects against 175 capabilities in 15 groups: 10,659 claims from
2,687 distinct sources, with 62 recorded conflicts and 141 unverified claims counted
separately. Before this pass it held 57 subjects, 164 capabilities in 14 groups and 6,996
claims from 1,963 sources.

- New subjects: SpatialDDS, the Model Context Protocol, the SpatioTemporal Asset Catalog
  (STAC), WebAssembly, Arrival Space, OAuth 2.0 with protected-resource metadata, the Vibe
  Jam portal convention, the OMI glTF extensions and JSON-LD 1.1.
- New group, Commerce & payments: machine and agent payments (must), entitlements and
  licence checks at use (must), and receipts and proofs of purchase (should).
- New rows in other groups: governed trust registries, the agent authoring and publishing
  interface, taking a whole world out, model-based object tracking, remote (split)
  rendering (recorded descriptively, rated none), live data binding, activity and learning
  records, and physiological signals as input. The Virtual Dimension Center contributed
  the last five.
- Every claim cites a source, and its quotes were checked against the source text. A
  reviewer that did not write the claims checked them: all of them in the first two
  passes, a random quarter in the later two, and every claim of a batch whose quarter
  failed. Two Unity claims were corrected from Unity's own documentation.
- Renamed: Niantic Lightship is now the Niantic Spatial SDK (formerly Lightship).

## 2026-09-19 — two composability rows published, and the September maintenance pass folded

Two capabilities approved on 2026-09-18 reach the public map: **World-to-world coupling**
`net.world-coupling` and **Scene containment** `scene.containment`, both scored across all 57
subjects. The fortnightly maintenance pass re-read 49 verification flags against current primary
sources: 27 confirmed errors corrected, 6 claims re-scored where the world changed after they were
written (each note now carries the 2026-09-19 retrieval date), 1 recorded as undetermined, and the
flags no public source can settle left as they were. Nine cells changed level; every one says in
its note which part of the definition is still missing.

Examples: the glTF registry lists 27 ratified extensions and KHR_interactivity is one of them;
OpenXR is at 1.1.63; the Verifiable Credentials family has six companion Recommendations, not four;
C2PA 2.4 carries a depth-map assertion; Rec Room added avatar and creation-data exports at shutdown.

### The numbers

    capabilities              162  ->  164
    claims                  6,882  ->  6,996      (114 added, 0 removed, 194 changed)
    sources                 1,932  ->  1,963
    must / should / none  52/87/23 ->  54/87/23
    lanes         U1 30  U2 25  U3 29  U4 18  ->  U1 30  U2 26  U3 31  U4 19

Production deployment f088df00. Evidence and per-cell dispositions:
`.dev/ai/subtask-comms/2026-09-19-21-23-55Z-maintenance-pass-result.md` in the msf-wg-tool repository.

---

## 2026-09-06, later still — captured content is first-class, and five capture rows become musts

The owner answered question 5 of `infrastructure-wg/model/INTEROPERABILITY-BOUNDARIES.md`: **yes,
captured content is first-class.** No capability, no subject and no claim changed. What changed is
the boundary under five rows, and everything downstream of it.

### The five rows that moved, and why

Each of the five carries a named format or a named timing across the boundary, and each has a
mesh-world twin that was already a must. An encoding a receiver cannot decode is
`scene.geometry`; a clip it cannot read is `scene.animation`. The old reading treated a capture as
one class of asset a receiver could lose while keeping the rest. The new reading treats a captured
asset as an asset.

- **Splat data interchange format** `capture.splat-format`
- **Volumetric video capture and playback** `capture.volumetric-video`
- **Point cloud encoding** `capture.point-cloud`
- **Multi-view plus depth** `capture.multiview-depth`
- **Time-varying capture** `capture.4d`

All five serve use case U1, content moving, and only U1: a splat capture and a room scan have no
part in an avatar's journey, a portal crossing or an agent's session. So one lane grew and three did
not.

**What did not move.** `render.splat` and `render.volumetric` are still shoulds: they are about
drawing what has arrived, not carrying it. The other twelve Generation & capture rows are still
shoulds and nones, because they are about making a place rather than moving one.

### The numbers

    must / should / none      35/67/15  ->  40/62/15      of 117 capabilities
    lanes         U1 17  U2 19  U3 20  U4 12  ->  U1 22  U2 19  U3 20  U4 12
    lane places / distinct capabilities   68 / 35  ->  73 / 40
    Generation & capture      0 must, 12 should, 5 none  ->  5 must, 7 should, 5 none
    by binding    connect 16/37/2  ->  17/36/2      build 19/30/13  ->  23/26/13
    must rows nothing reaches                 0  ->   0
    must rows with one native implementation  6  ->  10
    thin rows on the whole map               18  ->  18      unchanged

### The honest part: the content lane got wider and thinner on the same day

The map's own "two or more have it built in" count is the one a test suite has to clear, because a
test between two implementations needs two implementations. **Lane 1 went from 16 of 17 rows
clearing that floor to 17 of 22.** Four of the five new rows have exactly one system with the
capability built in, and it is the same system in all four: MPEG-I V3C. Splat data interchange
format is the exception, with seven systems built in and two more through an extension.

Four of the ten thin must rows are now one standard rather than one platform, which is a different
kind of thin: a standard is written for parties that did not write it, so the row is open and simply
unimplemented so far by anyone else. Three of the ten are still one company's internal mechanism,
where the cell is green and the row crosses no boundary at all.

**The restricted metric did not move, and that is the finding.** Read over lane 1, coverage still
says 100 percent built in under both the default and the production reading, because V3C is ratified
and one system anywhere is all that figure asks for. A metric that cannot tell 22 rows from 17 when
four of the five added rows have one implementation each is not measuring what a reader thinks it
measures. The number beside it is the one to read.

### On the pages

The "must interoperate" mark now says 40 rows, not 35, on both map pages. The content lane route
`/msf/map/#lane=content` flags 22 rows rather than 17, and the atlas's own start-up check — which
refuses to draw the lanes when the data and `CERTIFICATION-LANES.md` disagree — passes at 22 and was
proved to fail at 17.

---

## 2026-09-06, later the same day — the map's own documents catch up, and one contradiction is settled

No capability and no subject was added. Two claims changed, three model documents were brought up to
117 rows in fourteen groups, and the counts line on both map pages gained a part it had been quietly
leaving out.

### The 28 new rows now have a boundary, and none of them is a must

Every one of the 28 capabilities added earlier today was put through the rule in
`infrastructure-wg/model/INTEROPERABILITY-BOUNDARIES.md`: must if a use case fails outright without
agreement between two independent systems, should if it degrades, none if the capability never
leaves one system. **Twenty-one are should, seven are none, and none is a must.**

    capabilities scored          89  ->  117        in 12 groups  ->  14 groups
    must / should / none    35/46/8  ->  35/67/15
    lanes  U1 17  U2 19  U3 20  U4 12             unchanged, because no new row is a must
    format rows / protocol rows  48/41  ->  62/55

Because no new row is a must, `infrastructure-wg/model/CERTIFICATION-LANES.md` keeps the same four
bundles, the same 35 capabilities in the same 68 places, and the same restricted metric. What that
document gained is the correction that goes with the wider map: **eighteen rows now rest on a single
system, not eight**, and six of the eighteen are musts — the same six as before.

Three of the steward's four expectations did not survive the rule, and the boundaries page now says
so in its own section. World sensing's occlusion row is a none, because whether a real wall hides a
virtual chair is decided on the device that sees the wall. Control over what gets generated is a
should, not a none, because the specification of the world to make can arrive from another tool as
an image, a panorama or coarse geometry. Navigable space and arrival points is a should, not a must,
because a destination world places an arriving person by its own rules.

### The glTF splat ratification contradiction is settled: it is ratified

The map has carried this in the open since 2026-09-05 and it is now closed against the source. The
Khronos Gaussian splatting extension's own status line, read 2026-09-06, says **"Complete, Ratified
by the Khronos Group"**, and the extension registry lists it under "Ratified Khronos Extensions"
rather than in the in-progress table we quoted on 2026-08-22.

- **glTF on Gaussian splatting and radiance fields moves from partial to through an extension.** Its
  note gave two reasons for partial — not ratified, and no rendering defined — and neither survives.
  The ratified text makes reconstruction, projection, sorting and alpha blending normative.
- **glTF 2.1 stays partial, for a reason that is still true:** the extension is written against 2.0,
  so 2.1 inherits it and defines nothing of its own.
- **One more claim in that note was out of date.** The 64-bit binary format pull request is not open.
  It was merged into the repository's `draft-2.1` branch on 2026-08-28, and a `specification/2.1`
  folder stands on that branch and on no other.

Full record, with every address and quote: `infrastructure-wg/sources/VERIFIED-CORRECTIONS.md`
section 17.11.

    claims                4,016     unchanged
    distinct sources      1,502  ->  1,507      five new addresses, none dropped
    quotes                5,721  ->  5,726
    levels    partial       722  ->    721
              via-extension 124  ->    125

### The counts line now says how many claims are unverified

Both map pages carried "claims / sources / conflicts / subjects shown" and said nothing about
confidence. That was honest while the number was zero and stopped being honest this morning, when
the 28 new rows brought eighteen unverified claims with them. The line now reads **"4016 claims /
1507 sources / 60 conflicts / 18 unverified / 46 of 46 subjects shown"**, it follows the subject
chips like every other part of it, and it prints even when the number is zero, because a part that
vanishes at zero and a part that was never there look the same to a reader.

**All eighteen are absences. Not one asserts that a system has something.** So no green cell on the
map rests on an unchecked source, and the gaps view is still solid. Four are Horizon Worlds rows
behind a Meta developer sign-in, four are Rec Room rows on a platform that closed on 1 June 2026,
three are passthrough or face-tracking rows on live platforms whose documentation does not mention
the feature, and seven are absences read off a primary page that does not itself declare the
absence. Each of the eighteen is listed in `infrastructure-wg/sources/DO-NOT-REPEAT.md`, under "Thin,
not wrong", with what would settle it.

### The three model documents

- `INTEROPERABILITY-BOUNDARIES.md` — the 28 rows written into the table, every count re-derived,
  the two things it said that the breadth pass had overtaken corrected in place: shared and
  persistent anchors is reached natively by four systems, and indoor mapping is no longer a gap.
- `CERTIFICATION-LANES.md` — 117 rows, eighteen thin rows, and a paragraph saying why no lane moved.
- `ATLAS-INFORMATION-ARCHITECTURE.md` — 117 capabilities in 14 regions, the two new regions in the
  top-level arrangement, seven shores instead of five, and section 12's data contract carrying the
  definition of the unverified count.

### Not done in this pass

The seven rows parked earlier today are still parked. The commerce rows are still held. No new
subject was scored, and the four Horizon Worlds rows still need a Meta developer account.

---

## 2026-09-06 — twenty-eight new capabilities, scored across all 46 subjects

The map grew sideways. Two new groups and 28 new capability rows were added, and every one of the
46 subjects was scored against every one of them. Nothing already on the map was re-scored: not one
earlier claim changed its level, its confidence or its direction, and no earlier note or quote was
edited. That was proved by comparing the rebuilt database against a copy taken before the run, row
by row.

### The two new groups

- **Generation & capture** (`capture`), 17 rows — making a place, capturing one, carrying it and
  editing it afterwards. It sits under "what a world is made of".
- **World sensing** (`sense`), 4 rows — a device reading the real room it is in. It sits under
  "what a person meets". Making a world and reading one are different acts, and they are now
  different regions.

The other seven rows joined groups that already existed: `render.passthrough`, `input.face`,
`scene.navmesh`, `logic.namespace`, `deliver.moderation`, `geo.map-align` and `geo.coverage`.

### The numbers that moved

    capabilities             89  ->  117        in 12 groups  ->  14 groups
    claims                2,728  ->  4,016      every subject scored on all 28 new rows
    distinct sources      1,436  ->  1,502
    quotes                4,448  ->  5,721
    claims with a direction 115  ->  200
    recorded conflicts       60  ->  60         unchanged
    unverified claims         0  ->  18

    levels    out-of-scope   872  ->  1,833
              partial        628  ->    722
              native         581  ->    660
              none           490  ->    617
              via-extension   97  ->    124

    covered, production subjects   92/97/100 over 35 subjects, now read over 117 rows
    covered, all subjects on       94/99/100  ->  94/98/100

28 × 46 = 1,288 new claims: 782 on the capture rows, 184 on the sensing rows, 322 on the other
seven. The coverage line reads built in / built in or through an extension / those two or partial.
Read over the old 89 rows alone the two figures are still 92/97/100 and 94/99/100, which is the
check that the older rows did not move.

### Two lists got longer

**Only one system reaches it** went from eight capabilities to eighteen. Ten of the new rows have a
single native claimant: the MPEG volumetric coding standard holds four of them, World Labs Marble
and NVIDIA Cosmos two each, Apple's kit and Open AR Cloud one each.

**No system has it** went from one capability to two. **Relighting captured content**
(`capture.relight`) joins **Rights enforcement** (`identity.rights`): four subjects reach it partly
and nothing reaches it at any level above that. The ratified Khronos splat extension says why — a
splat's colour is display-referred, the primitive's material must be ignored, and an implementation
may relight anyway by no defined method. Captured content therefore sits beside authored content
rather than mixing with it.

### What the new rows say

**Splat data is the widest new row and it splits into producers and consumers.** Seven subjects
are native on `capture.splat-format` and two more reach it through an extension. Four of the nine
carry the data both ways, one only writes it, and four only read it. The ratified Khronos extension
is the one address both sides name.

**Nothing on the map carries a capture that moves.** `capture.4d` has one native claimant, an MPEG
bitstream. The splat family's working interchange for moving content is a folder of numbered still
frames.

**One subject in 46 carries agent actions.** `capture.action-io` has a single claimant, Cosmos, and
45 subjects out of scope. It is either the emptiest row on the map or the earliest.

**Semantic labelling is where sensing breaks.** Five subjects reach `sense.semantics` built in
and three more through an extension, and the notes show no two of them naming the same set of
labels; two of the vocabularies are explicitly open-ended. Depth is the opposite: six subjects reach
`sense.depth` built in and everybody already says metres.

**Nobody publishes a transform between two maps of the same street except Open AR Cloud.**
`geo.map-align` has one native claimant and 37 subjects out of scope, while the three companies that
actually hold maps each keep their own.

**Almost nothing says where a body may stand in a way that travels.** On `scene.navmesh` four
engines reach it, two built in and two through an extension, and each bakes the walkable surface
into its own scene. Of the nine subjects scored partial, X3D is the only file format among them:
23 years old, and still the one that declares avatar size, a walking paradigm and named
viewpoints.

### Eighteen claims are unverified, and every one of them is an absence

No positive claim anywhere on the map is unverified. Ten of the eighteen are subjects whose
documentation could not be read at all this pass — four Meta Horizon Worlds rows now behind a
sign-in wall, four Rec Room rows on a platform that closed on 1 June 2026, and two passthrough rows
— and eight are absences read off a primary page that does not itself declare the absence. Each note
says how the absence was established and against which document. A reader with a Meta developer
account should settle the four Horizon rows.

### Not done in this pass

Seven proposed rows were parked with their reasons and one was folded into the commerce order, as
the owner's decision directed. No existing claim was re-scored, so the glTF splat ratification
contradiction recorded on 2026-09-05 still stands, and this pass adds a third row to it: the splat
lane read the Khronos extension's status line as ratified. Two model documents still describe the
map as 89 capabilities in twelve groups and need bringing up to 117 and fourteen.

---

## 2026-09-05 — eleven new subjects, breadth batch 1

Eleven subjects were added in one pass. Nothing already on the map was re-scored: no existing
subject's claims, levels, confidences or notes were touched.

### The eleven

Device platforms — the kits that run on a headset or a phone:

- **Apple ARKit and RealityKit** (`arkit`) — 89 claims, 147 quotes from 82 Apple documentation pages.
- **Google ARCore and Android XR** (`arcore`) — 89 claims, 150 quotes from 43 addresses.
- **Niantic Lightship** (`lightship`) — 89 claims, 164 quotes from 39 addresses.

Standards:

- **Open AR Cloud, the Open Spatial Computing Platform** (`oarc`) — 89 claims, 174 quotes.
- **MPEG-I visual volumetric video coding, V3C with V-PCC and MIV** (`v3c`) — 89 claims, 140 quotes.
- **Verse** (`verse`), Epic's language reference — 89 claims, 184 quotes.

Platforms:

- **Fortnite Creative and the Unreal Editor for Fortnite** (`fortnite`) — 89 claims, 196 quotes from
  89 addresses, the widest source base of the eleven.

World models and capture:

- **NVIDIA Cosmos** (`cosmos`) — 89 claims, 158 quotes.
- **World Labs Marble** (`marble`) — 89 claims, 155 quotes.
- **Tencent Hunyuan World 2.0** (`hyworld`) — 89 claims, 171 quotes.
- **4D Gaussian splatting and the splat formats** (`4dgs`) — 89 claims, 140 quotes.

Three kinds are new — `device-platform`, `world-model` and `technique` — and the chips gained two
groups for them: **Device platforms** and **World models & capture**, the second holding the three
world models and the splat technique together.

### The numbers that moved

    subjects                 35  ->  46
    claims                1,749  ->  2,728      every new subject scored on all 89 capabilities
    distinct sources      1,057  ->  1,436
    quotes                2,669  ->  4,448
    recorded conflicts       50  ->  60
    unverified claims         0  ->  0

    covered, production subjects   90/96/100 over 25  ->  92/97/100 over 35
    covered, all subjects on       92/98/100 over 35  ->  94/99/100 over 46

The coverage line reads built in / built in or through an extension / those two or partial, as
shares of the 89 capabilities.

### Two lists got shorter

**Only one system reaches it** went from nine capabilities to eight. Fortnite is the second system
to reach **Clock and time model** (`net.time`), which Roblox had held alone.

**No system has it** went from two capabilities to one. **Indoor mapping** (`geo.indoor`) is now
reached — through an extension by Apple's kit, partly by nine other subjects. **Rights enforcement**
(`identity.rights`) is the one capability left with no claimant at any level above partial, and it
is the map's last true gap.

### One contradiction the map now carries in the open

The glTF rows say the Khronos Gaussian splatting extension is **not ratified**; the new splat
technique row says it **is**, quoting the extension's own status line as read on 2026-09-04. Both
rows stand as their lanes wrote them. Settling it is the next pass's job, not this one's.

### Not done in this pass

No new capability was added. The eleven lanes made forty-four proposals between them, thirty-eight
distinct once duplicates are merged by meaning. They are consolidated into one table for the owner
to decide, and none of it was loaded. The map still has 89 capabilities.
