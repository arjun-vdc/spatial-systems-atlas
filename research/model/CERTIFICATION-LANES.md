---
gas_schema: gas.doc.v1
legacy_document_type: design
type: spec
title: Certification lanes — four bundles of must-interoperate capabilities, with what conformance would mean and what would prove it
status: draft for steward review
created: 2026-09-06T14:02:41Z
project: msf-wg-tool
workstream: infrastructure-wg-map
source_work_order: /Users/grig/work/spatial-computing-research-projects-msf/repo/msf-wg-tool/.dev/ai/workorders/2026-09-04-21-42-57Z-WO-msf-wg-tool-20260904-065-certification-lanes.md
created_by: project steward
depends_on: infrastructure-wg/model/INTEROPERABILITY-BOUNDARIES.md (WO-msf-wg-tool-20260904-064, approved by the owner 2026-09-06T13:51:17Z); infrastructure-wg/tests/PILOT-AVATAR-PORTABILITY.md (WO-msf-wg-tool-20260904-066)
updated: 2026-09-11T07:51:29Z
data_basis: 164 capabilities in 14 groups and 57 subjects. Membership derives from accepted capabilities.csv metadata. Integrated coverage contains 6,996 accepted claims and 1,943 sources, including 1,693 accepted claims for the 47 additions; 986 new subject-capability pairs remain explicitly unscored.
data_basis_2026_09_06: "infrastructure-wg/data/territory.db read 2026-09-06T19:27Z — 46 subjects, 117 capabilities, 4,016 claims, 1,507 sources; sha256 81dbf0dbec1a6f07653885d2a0d6134fc8955a0e07c0c362d3666ffa02522ca9, written by the rebuild of WO-msf-wg-tool-20260906-074, which applied the owner's answer to question 5 of the boundaries page: 40 must, 62 should, 15 none, lanes U1 22, U2 19, U3 20, U4 12. Lane 1 gained five rows and no other lane moved. Every number in lane 1 was re-derived against that database. The earlier basis line follows."
data_basis_previous: "infrastructure-wg/data/territory.db read 2026-09-06T18:19Z — 46 subjects, 117 capabilities, 4,016 claims, 1,507 sources; sha256 9f4dd1aaab7bdbb625cf9769b495c5a2f4d1b9b07f333a1a4f9637b9ce7fb096, written 2026-09-06T18:08Z by the reconcile rebuild of WO-msf-wg-tool-20260906-073, whose 35 must, 67 should and 15 none match the boundaries table row for row. Every lane number on this page was re-derived against that database and none of them moved: the 28 capabilities added on 2026-09-06 are 21 shoulds and 7 nones, so no lane gained or lost a row. The page was first written against the database of 2026-09-06T14:10Z — 89 capabilities, 2,728 claims, 1,436 sources, sha256 25ab2eb7f0082bf0b0b6bf98d724d05c1122c48fcce54908f19667e093964143"
project_root: /Users/grig/work/spatial-computing-research-projects-msf/repo/msf-wg-tool
project_code_note: Omitted because the project registry has no uppercase alias; the frontmatter standard directs omission rather than invention.
---

# Certification lanes

Since 2026-10-20 the four lanes hold 30, 27, 32 and 21 must rows: `commerce.payment` joined U4, and `commerce.entitlement` joined U2, U3 and U4. The support tables below are as of 2026-09-11.

## What this is, and what it is not

Four lanes, one for each use case the boundaries page was built from. A lane is a named bundle of the
capabilities that must interoperate for that use case to work at all, and for every capability in it:
what conformance would mean in one sentence, the test that would prove it, and the status of its recorded support evidence.

**This is a lane definition, not a certification programme.** There is no badge, no mark, no register
of certified products, no body that issues anything, and no plan on this page for any of them. The
owner's direction of 2026-09-04 is plain: no official certification; build the lanes slowly, tests to
follow. Alfred Tom and Don Brutzman asked for the same order of work from the other side of the
meeting — build the tests, certification follows — and Don's line is the one to keep: if you cannot
measure it, maybe you have not defined it.

So the order is: the boundary, which is done; the lanes, which are this page; the tests, which start
with the avatar pilot; and only then, if the Forum ever wants one, a conversation about what a badge
would say. **A test suite comes before any badge.** A lane with no test in it is a list of things
worth testing, and that is the whole of what this page claims to be.

Slowly is also the instruction, and the page is built to be argued with one line at a time. Every row
carries its own conformance sentence and its own test, so a member of the working group can throw out
one line without throwing out the lane.

## What a lane is

A lane takes one use case and turns it into a bundle, with four things recorded for every capability
in it:

- **The capability**, taken from the boundaries table, with the id the database uses.
- **What conformance would mean**, in one sentence, written as something two independent systems
  either do or do not do.
- **The test that would prove it** — a pointer to the pilot test set where one already exists, and
  otherwise one line saying what the test would be. A test idea is not a test, and the page never
  pretends otherwise.
- **Recorded support**, from the integrated accepted scores across 57 subjects: how many systems have it built in, how many reach it
  through an extension, how many are partial, and the systems named where there are few enough to
  name. The 47 additions have completed source acceptance; unsupported cells remain unscored.

**A lane holds must rows only.** The boundaries page classifies all 164 capabilities as must, should or
none: must means at least one use case fails outright unless two independent systems agree. Fifty-four of
the 164 are musts. A lane is
the set of rows that would stop the use case, because a test suite that starts with the rows that
merely degrade the experience will never be finished. The should rows are not lost; they are the
second pass, and the boundaries page still holds them.

| Lane | Use case | Rows | Route |
|---|---|---|---|
| 1 Content portability | U1 An asset moves between tools with no hand fixes | 30 | `/msf/atlas/#lane=content` |
| 2 Avatar portability | U2 An avatar, its items and its expressions travel | 26 | `/msf/atlas/#lane=avatar` |
| 3 World-to-world travel | U3 A person travels through a portal and stays themselves | 31 | `/msf/atlas/#lane=travel` |
| 4 Agent participation | U4 An agent joins a world, acts, and pays | 19 | `/msf/atlas/#lane=agent` |

The four lanes hold 106 places between them, filled by 54 distinct capabilities. Every must row belongs to at least one lane. The approved additions contribute 14 new must rows and 33 lane places. The five captured-content rows made must by the owner on 2026-09-06 remain in U1.

All new test entries below are proposed tests. None was executed as part of this metadata preparation, and membership does not establish runtime conformance.

## How to read the numbers

Current membership covers 164 capabilities and 57 subjects. Current support tables below derive from all 6,996 integrated claims; all 5,303 prior claims are unchanged. The historical tables and interpretations retain their 2026-09-06 basis of 46 subjects. No final lane percentage or single-subject count is inferred for the expanded scope.

Two words are used exactly as the map's own row rules use them, so this page and the site cannot
disagree. The rules are in `infrastructure-wg/board/predicates.js`.

- **Built in** — a claim of `native`. **Through an extension** — a claim of `via-extension`.
  **Reaches** is either of those, which is the same test behind the map's "No native or extension support recorded".
- **Rests on a single system** — exactly one claim at `native`, which is the same test behind the
  map's "thin" filter.

One warning that matters more than any number here. **The map counts subjects, not independent
implementations.** A standard and a runtime that implements it are two subjects on the map and one
agreement in the world, so "two systems have it built in" is a floor under the question a test would
ask, never an answer to it. That is exactly why the lanes exist: the test is the thing that settles
it, and everything on this page before the test is a way of deciding where to spend the test-writing
effort.

## Lane 1 — Content portability (U1)

**The use case.** An asset made in one tool loads, renders and behaves in another system with no hand fixes.

**The bundle.** 30 must-interoperate capabilities. **The route.** `/msf/atlas/#lane=content`

**Historical lane description — 2026-09-06.** The following description records the earlier bundle; the current membership and proposed tests follow.

The oldest ask in the working group, and the lane with the most systems already standing on it. Ten
of its twenty-two rows are the file itself and the conventions inside it, four are about content
pinned to a place on the Earth, three are behaviour, versions and the test suite itself, and five are
the carriage formats for captured content, which joined the lane on 2026-09-06 when the owner
answered that captured content is first-class. **Those five are the only rows in this lane that no
other lane shares, and four of the five rest on one system.** The lane got wider and thinner on the
same day.

### What conformance would mean, and what would prove it

| Capability | What conformance would mean | The test that would prove it |
|---|---|---|
| Scene graph model `scene.graph` | The receiving system rebuilds the sender's node tree with the same parents, names and local transforms, so every part of the asset sits where the file says it sits. | Test idea: load one file in two systems, ask each for its node tree, and compare parent, name and local transform for every node against the file read by a parser that draws nothing. |
| Transforms and coordinate convention `scene.transform` | Two systems agree on handedness, axis order and rotation order, so an object arrives in the same place, the same way up and facing the same way. | Pilot T2: the avatar must face the reference direction within 2 degrees and stand on the ground plane within 1 cm. |
| Asset container format `scene.container` | A system opens a file written by the other and reaches every part of it, with no converter and no re-export. | Pilot T1: all four fixture files load, the runtime reports no error, and the scene holds the avatar's skinned mesh. |
| Geometry encoding `scene.geometry` | The receiver decodes the mesh as encoded, compression included, and ends with the same vertices and faces the sender had. | Test idea: feed each system the same mesh uncompressed, Draco-compressed and Meshopt-compressed, and require the vertex count and the bounding box to match the uncompressed original within tolerance. |
| Texture encoding `scene.texture` | The receiver decodes every texture the file carries, in the forms it carries them, and draws the asset textured rather than blank. | Pilot T6 sees it in the picture; the rule the pilot still needs is separate and blunt: a texture that fails to decode is a fail, whatever the similarity score says. |
| Material exchange `scene.material-x` | The receiver reproduces the sender's material parameters, not an approximation of them, so the surface is the same surface. | Test idea: read back base colour, metallic, roughness, normal and emissive for every material and compare each number with the file; report the picture separately, as pilot T6 does. |
| Animation encoding `scene.animation` | A clip authored in one system plays in the other on the same bones, at the same times, with the same values. | Pilot T3: ten samples of fifteen bones, every world position within 2 cm of the reference, and something must move. |
| Skeleton and rig definition `scene.skeleton` | The receiver rebuilds the same bone hierarchy in the same rest pose, so motion has the same body to bind to. | Pilot T2: all fifteen required bones resolve to a node, and the body they describe measures the same as the reference. |
| Units and scale `scene.units` | One metre in the sender is one metre in the receiver, with no scaling by hand at either end. | Pilot T2: the head sits within 1 cm of the reference height and the feet within 1 cm of the ground. |
| Rights and licence metadata `scene.licence` | The receiver reads the terms that travel with the asset and can state them back — who made it, and what may be done with it — without asking a person. | Test idea: hand each system one asset with a VRM licence block and one signed with C2PA, require it to print the terms it read, and require it to refuse one use those terms forbid. |
| Geospatial pose `geo.pose` | Content pinned to a place on the Earth lands within a stated distance of the same place in the other system. | Test idea: place one GeoPose fixture in two systems and report the distance between the two placements in metres and the difference in heading in degrees. |
| Coordinate reference systems `geo.crs` | Both systems read the same frame and datum and put the origin in the same place. | Test idea: convert a set of surveyed points between frames in each system and compare against the surveyed values. |
| Shared and persistent anchors `geo.anchor-shared` | Two people on two systems see the same virtual thing in the same real place, and it is still there the next day. | Test idea: create an anchor on one system, resolve it on the other in the same room, measure the offset, and measure it again 24 hours later. |
| Tiled terrain and city streaming `geo.tiles` | A client streams another party's tileset without converting it first, and draws the same tiles at the same detail. | Test idea: point two clients at one tileset at a fixed camera and compare which tiles each requested and drew. |
| Behaviour graphs and interactivity `logic.behaviour` | Behaviour authored with the asset runs in the receiving system: the door opens, the switch fires, the timer ends. | Test idea: one fixture with a trigger, a timer and a state change, and a check that each fires in each system within a fixed time. |
| Versioning and update `deliver.version` | A reader can tell which version of the format it holds, and behaves predictably with the parts it does not know. | Test idea: feed each system a file with an unknown required extension and one with an unknown optional extension; it must refuse the first and load the second. |
| Conformance testing `deliver.conformance` | A shared test suite exists for the row, both parties run it, and the results are public. | This row is the lane machinery itself. The pilot test set (WO-msf-wg-tool-20260904-066) is its first instance; until a suite exists for a row, every other line in that row's lane is a claim. |
| Splat data interchange format `capture.splat-format` | A splat capture written by one tool is read by another from the named format alone — the same splats, in the same places, with the same scales, rotations, colours and opacities — with no converter and no re-export. | Test idea: write one capture as a splat `.ply` and as a glTF carrying `KHR_gaussian_splatting`, load each in two systems, and compare the splat count and every splat's position, scale, rotation, colour and opacity against the file read by a parser that draws nothing. |
| Volumetric video capture and playback `capture.volumetric-video` | A volumetric clip plays in the receiving system as the recording it is, with the camera calibration and the masks the sender wrote, rather than with the receiver's own guess at them. | Test idea: hand each system one clip with its calibration and mask metadata, require it to report the camera parameters it read, and compare a named frame reprojected to a named viewpoint against the reference within a stated pixel tolerance. |
| Point cloud encoding `capture.point-cloud` | The receiver decodes the point set as encoded, compression included, and ends with the same points and the same per-point attributes the sender had. | Test idea: feed each system one cloud uncompressed and the same cloud under each compression the format defines, and require the point count, the bounding box and the per-point colour to match the uncompressed original within tolerance. It is the geometry test written for points instead of triangles. |
| Multi-view plus depth `capture.multiview-depth` | The receiver reads every view's intrinsics and extrinsics beside its depth map and reprojects the set into one consistent scene, rather than showing the views as loose pictures. | Test idea: hand each system the same calibrated view set, ask it to reproject to one viewpoint the fixture names, and measure how far each system put a fixed list of surveyed scene points from where the survey says they are. |
| Time-varying capture `capture.4d` | A moving capture arrives as one timed sequence: the receiver plays it at the rate the sender recorded, in the sender's order, without a person telling it either. | Test idea: send one capture of known duration and frame rate between two implementations, require the receiver to report the rate and the ordering it read, and require playback within a stated timing tolerance of the reference. |
| Extension mechanism `deliver.extension` | Two receivers identify the same declared extension and apply its required or optional handling rule when they do not implement it. | Proposed test: exchange fixtures with a supported extension, an unknown optional extension and an unknown required extension; compare each receiver's declared handling and result with the extension contract. |
| Asset reference resolution `deliver.resolve` | Two receivers resolve a scene's resource identifiers to the intended resources using the declared base location or resolver context. | Proposed test: resolve relative references and context-dependent aliases from one scene fixture in two receivers; compare the selected resources with an expected mapping, including a missing reference. |
| Pose series and live pose streams `geo.trajectory` | Two receivers reconstruct the same ordered location and orientation samples from a pose sequence with a declared time base and reference frame. | Proposed test: send timestamped pose samples with known frame and ordering to two receivers; compare the decoded samples and their times. Evaluate interpolation only when the fixture separately declares its rule. |
| Content protection signalling `deliver.protection` | Two receivers identify the protection mechanism declared for each protected content component without treating that signal as a rights grant or key. | Proposed test: exchange content fixtures with supported and unknown protection-scheme identifiers; compare the mechanism each receiver identifies and its reported handling against the declared contract. |
| Linked pose structures `geo.pose-graph` | Two receivers reconstruct the same related coordinate frames from exchanged pose links and declared transform meanings. | Proposed test: exchange a pose chain and graph with known frame links; compare each reconstructed frame with the reference transforms, and check the declared handling of an unresolved link. |
| Consent carried with the subject `identity.consent` | Two recipients interpret the scope, purpose, validity and withdrawal information of a carried permission grant for the same proposed use. | Proposed test: send grant fixtures with permitted and excluded purposes, an expired validity period and withdrawn permission; compare both recipients' interpretation with the fixture contract, without claiming the grant was validly obtained. |
| Exact and parametric geometry `scene.parametric` | Two receivers evaluate the same transmitted parametric curves and surfaces from their mathematical descriptions. | Proposed test: exchange fixtures with known curves and surfaces; evaluate a fixed set of parameter values in each receiver and compare with reference points using tolerances set by the future test design. |
| Voxel volumes `scene.voxel` | Two receivers reconstruct the same spatial cells and properties from an exchanged voxel volume and its declared updates. | Proposed test: exchange a small volume with known occupancy and properties, then apply a recorded cell update; compare each receiver's decoded volume and updated cells with the reference data. |

### Recorded support — 57 subjects, accepted integration of 2026-09-11

These are recorded claims, not independent implementation counts or conformance results. Unscored cells are omitted and remain distinct from recorded unverified claims.

| Capability | Built in | Through an extension | Partial | Native subjects or score status |
|---|---|---|---|---|
| Scene graph model `scene.graph` | 21 | 0 | 7 | 21 subjects |
| Transforms and coordinate convention `scene.transform` | 17 | 0 | 20 | 17 subjects |
| Asset container format `scene.container` | 16 | 2 | 20 | 16 subjects |
| Geometry encoding `scene.geometry` | 14 | 0 | 19 | 14 subjects |
| Texture encoding `scene.texture` | 15 | 0 | 16 | 15 subjects |
| Material exchange `scene.material-x` | 2 | 1 | 11 | X3D (ISO/IEC 19775-1), glTF |
| Animation encoding `scene.animation` | 15 | 1 | 11 | 15 subjects |
| Skeleton and rig definition `scene.skeleton` | 15 | 0 | 6 | 15 subjects |
| Units and scale `scene.units` | 18 | 0 | 16 | 18 subjects |
| Rights and licence metadata `scene.licence` | 1 | 3 | 5 | VRM |
| Geospatial pose `geo.pose` | 7 | 2 | 7 | 7 subjects |
| Coordinate reference systems `geo.crs` | 3 | 2 | 9 | CesiumJS, OGC 3D Tiles (Community Standard), X3D (ISO/IEC 19775-1) |
| Shared and persistent anchors `geo.anchor-shared` | 4 | 1 | 8 | Apple ARKit and RealityKit, Google ARCore and Android XR, Niantic Lightship, Open AR Cloud (Open Spatial Computing Platform) |
| Tiled terrain and city streaming `geo.tiles` | 4 | 3 | 4 | CesiumJS, OGC 3D Tiles (Community Standard), Open AR Cloud (Open Spatial Computing Platform), X3D (ISO/IEC 19775-1) |
| Behaviour graphs and interactivity `logic.behaviour` | 6 | 1 | 6 | 6 subjects |
| Versioning and update `deliver.version` | 17 | 1 | 21 | 17 subjects |
| Conformance testing `deliver.conformance` | 8 | 1 | 19 | 8 subjects |
| Splat data interchange format `capture.splat-format` | 12 | 2 | 6 | 12 subjects |
| Volumetric video capture and playback `capture.volumetric-video` | 1 | 0 | 6 | MPEG-I Visual Volumetric Video-based Coding (V3C, V-PCC and MIV) |
| Point cloud encoding `capture.point-cloud` | 2 | 3 | 19 | MPEG-I Visual Volumetric Video-based Coding (V3C, V-PCC and MIV), Polycam |
| Multi-view plus depth `capture.multiview-depth` | 2 | 0 | 9 | MPEG-I Visual Volumetric Video-based Coding (V3C, V-PCC and MIV), NVIDIA Omniverse NuRec and 3DGRUT |
| Time-varying capture `capture.4d` | 1 | 2 | 7 | MPEG-I Visual Volumetric Video-based Coding (V3C, V-PCC and MIV) |
| Extension mechanism `deliver.extension` | 17 | 1 | 13 | Accepted source claims; no runtime conformance claim |
| Asset reference resolution `deliver.resolve` | 17 | 3 | 2 | Accepted source claims; no runtime conformance claim |
| Pose series and live pose streams `geo.trajectory` | 18 | 7 | 10 | Accepted source claims; no runtime conformance claim |
| Content protection signalling `deliver.protection` | 0 | 0 | 1 | Accepted source claims; no runtime conformance claim |
| Linked pose structures `geo.pose-graph` | 23 | 9 | 2 | Accepted source claims; no runtime conformance claim |
| Consent carried with the subject `identity.consent` | 1 | 0 | 5 | Accepted source claims; no runtime conformance claim |
| Exact and parametric geometry `scene.parametric` | 2 | 2 | 6 | Accepted source claims; no runtime conformance claim |
| Voxel volumes `scene.voxel` | 0 | 1 | 3 | Accepted source claims; no runtime conformance claim |

### Historical support and interpretation — 2026-09-06, 46 subjects

The following table and lane interpretation are the earlier snapshot, retained as evidence. They do not describe the expanded current lane.

| Capability | Built in | Through an extension | Partial | The systems that have it built in |
|---|---|---|---|---|
| Scene graph model `scene.graph` | 20 | 0 | 5 | 20 systems |
| Transforms and coordinate convention `scene.transform` | 16 | 0 | 11 | 16 systems |
| Asset container format `scene.container` | 15 | 2 | 12 | 15 systems |
| Geometry encoding `scene.geometry` | 12 | 0 | 15 | 12 systems |
| Texture encoding `scene.texture` | 14 | 0 | 13 | 14 systems |
| Material exchange `scene.material-x` | 2 | 1 | 10 | X3D (ISO/IEC 19775-1), glTF |
| Animation encoding `scene.animation` | 15 | 1 | 6 | 15 systems |
| Skeleton and rig definition `scene.skeleton` | 15 | 0 | 4 | 15 systems |
| Units and scale `scene.units` | 16 | 0 | 10 | 16 systems |
| Rights and licence metadata `scene.licence` | 1 | 3 | 5 | VRM |
| Geospatial pose `geo.pose` | 7 | 2 | 2 | 7 systems |
| Coordinate reference systems `geo.crs` | 3 | 2 | 7 | CesiumJS, OGC 3D Tiles (Community Standard), X3D (ISO/IEC 19775-1) |
| Shared and persistent anchors `geo.anchor-shared` | 4 | 1 | 7 | Apple ARKit and RealityKit, Google ARCore and Android XR, Niantic Lightship, Open AR Cloud (Open Spatial Computing Platform) |
| Tiled terrain and city streaming `geo.tiles` | 4 | 3 | 2 | CesiumJS, OGC 3D Tiles (Community Standard), Open AR Cloud (Open Spatial Computing Platform), X3D (ISO/IEC 19775-1) |
| Behaviour graphs and interactivity `logic.behaviour` | 6 | 1 | 6 | 6 systems |
| Versioning and update `deliver.version` | 17 | 1 | 15 | 17 systems |
| Conformance testing `deliver.conformance` | 8 | 0 | 17 | 8 systems |
| Splat data interchange format `capture.splat-format` | 7 | 2 | 2 | 7 systems |
| Volumetric video capture and playback `capture.volumetric-video` | 1 | 0 | 2 | MPEG-I Visual Volumetric Video-based Coding (V3C, V-PCC and MIV) |
| Point cloud encoding `capture.point-cloud` | 1 | 3 | 12 | MPEG-I Visual Volumetric Video-based Coding (V3C, V-PCC and MIV) |
| Multi-view plus depth `capture.multiview-depth` | 1 | 0 | 2 | MPEG-I Visual Volumetric Video-based Coding (V3C, V-PCC and MIV) |
| Time-varying capture `capture.4d` | 1 | 1 | 2 | MPEG-I Visual Volumetric Video-based Coding (V3C, V-PCC and MIV) |

**The lane's numbers.** Restricted to these 22 rows, the coverage metric reads 100% built in, 100% with extensions and 100% with partial over every subject switched on, and 100%, 100% and 100% counting production subjects only. 17 of the 22 rows have two or more systems with the capability built in; 5 rest on a single system: Rights and licence metadata (VRM), and Volumetric video capture and playback, Point cloud encoding, Multi-view plus depth and Time-varying capture, all four of them MPEG-I V3C.

Two or more implementations is the floor a test needs: a test between two systems is only worth
writing when two systems exist to run it. **This lane used to clear that floor everywhere but one
row, and now it fails it on five.** The captured-content rows raised the count that clears the floor
from 16 to 17 and the count that does not from 1 to 5, so the lane's honest reading got worse on the
day it got wider, exactly as the boundaries page said it would. Four of the five new rows have one
system with the capability built in, and it is the same system in all four: MPEG-I V3C. A conformance
test for those four has nothing to run against but that standard's own reference software until a
second implementation exists. Splat data interchange format is the exception and it is a good one:
seven systems have it built in and two more reach it through an extension, which makes it the most
testable row of the five.

That is a finding, not a fault in the lane. **A must row with one implementation is where standards
work is needed; a must row with none would be worse**, and none of the five is in that position. Six
of the twenty-two rows already have a test in the pilot design, because the pilot's items and its
clip are ordinary assets, so a failure on them is a failure of this lane too — and not one of the six
is a captured-content row. The five have no test anywhere today.

## Lane 2 — Avatar portability (U2)

**The use case.** A person's avatar, with its equipped items and expressions, is readable and drawn by every system it enters.

**The bundle.** 26 must-interoperate capabilities. **The route.** `/msf/atlas/#lane=avatar`

**Historical lane description — 2026-09-06.** The following description records the earlier bundle; the current membership and proposed tests follow.

The lane the pilot test set was built for, and content portability with a body attached: nine of the
content lane's file rows, three behaviour and delivery rows it shares with that lane too, the five
avatar rows that decide whether the person who arrives is the person who left, and two rows borrowed
from travel — the portal, and the identity root behind it.

### What conformance would mean, and what would prove it

| Capability | What conformance would mean | The test that would prove it |
|---|---|---|
| Scene graph model `scene.graph` | The receiving system rebuilds the sender's node tree with the same parents, names and local transforms, so every part of the asset sits where the file says it sits. | Test idea: load one file in two systems, ask each for its node tree, and compare parent, name and local transform for every node against the file read by a parser that draws nothing. |
| Transforms and coordinate convention `scene.transform` | Two systems agree on handedness, axis order and rotation order, so an object arrives in the same place, the same way up and facing the same way. | Pilot T2: the avatar must face the reference direction within 2 degrees and stand on the ground plane within 1 cm. |
| Asset container format `scene.container` | A system opens a file written by the other and reaches every part of it, with no converter and no re-export. | Pilot T1: all four fixture files load, the runtime reports no error, and the scene holds the avatar's skinned mesh. |
| Geometry encoding `scene.geometry` | The receiver decodes the mesh as encoded, compression included, and ends with the same vertices and faces the sender had. | Test idea: feed each system the same mesh uncompressed, Draco-compressed and Meshopt-compressed, and require the vertex count and the bounding box to match the uncompressed original within tolerance. |
| Texture encoding `scene.texture` | The receiver decodes every texture the file carries, in the forms it carries them, and draws the asset textured rather than blank. | Pilot T6 sees it in the picture; the rule the pilot still needs is separate and blunt: a texture that fails to decode is a fail, whatever the similarity score says. |
| Material exchange `scene.material-x` | The receiver reproduces the sender's material parameters, not an approximation of them, so the surface is the same surface. | Test idea: read back base colour, metallic, roughness, normal and emissive for every material and compare each number with the file; report the picture separately, as pilot T6 does. |
| Animation encoding `scene.animation` | A clip authored in one system plays in the other on the same bones, at the same times, with the same values. | Pilot T3: ten samples of fifteen bones, every world position within 2 cm of the reference, and something must move. |
| Skeleton and rig definition `scene.skeleton` | The receiver rebuilds the same bone hierarchy in the same rest pose, so motion has the same body to bind to. | Pilot T2: all fifteen required bones resolve to a node, and the body they describe measures the same as the reference. |
| Units and scale `scene.units` | One metre in the sender is one metre in the receiver, with no scaling by hand at either end. | Pilot T2: the head sits within 1 cm of the reference height and the feet within 1 cm of the ground. |
| Avatar body format `avatar.body` | The receiving system loads the portable body and draws a whole person, dropping no part of the description in silence. | Pilot T1: the avatar file loads and the scene holds at least one skinned mesh from it. |
| Avatar skeleton standard `avatar.skeleton` | The bones a humanoid body needs resolve by their agreed names in every system, so motion authored anywhere binds to any body. | Pilot T2: the fifteen bones VRM 1.0 requires each resolve to a node; the total bone count is recorded and never judged. |
| Facial expression standard `avatar.expression` | A named expression drives the same face in the receiving system as it does in the sending one. | Test idea: drive each named expression to full, measure how far the face vertices move against the reference, and fail any name that moves nothing. The pilot's fixture does not cover expressions yet; its design lists them as the first extension. |
| Attachments and wearables `avatar.wearable` | An equipped item lands on the right attachment point with the right offset and stays there while the body moves. | Pilot T4 measures both items at rest and at frame ten, within 2 cm and 5 degrees; pilot T7 makes one runtime write the record of what is equipped and another read it. |
| Avatar to identity binding `avatar.identity` | The receiving world can check that the avatar arriving belongs to the person presenting it. | Test idea: present an avatar with a signed binding to an identifier, require the world to verify it, then present the same avatar bound to a different identifier and require refusal. |
| Session handoff and portals `net.handoff` | A person leaves one world through a portal and arrives in another, keeping who they are and what they carry, on one handoff message both ends read the same way. | Test idea: run one portal handoff between two servers written by different parties and compare what arrives with what left, field by field. |
| Identity root `identity.root` | One identifier for a person or an agent resolves to the same subject in both worlds. | Test idea: resolve the same identifier with two independent resolvers and compare the documents returned, then repeat with a revoked identifier and require the same answer from both. |
| Behaviour graphs and interactivity `logic.behaviour` | Behaviour authored with the asset runs in the receiving system: the door opens, the switch fires, the timer ends. | Test idea: one fixture with a trigger, a timer and a state change, and a check that each fires in each system within a fixed time. |
| Versioning and update `deliver.version` | A reader can tell which version of the format it holds, and behaves predictably with the parts it does not know. | Test idea: feed each system a file with an unknown required extension and one with an unknown optional extension; it must refuse the first and load the second. |
| Conformance testing `deliver.conformance` | A shared test suite exists for the row, both parties run it, and the results are public. | This row is the lane machinery itself. The pilot test set (WO-msf-wg-tool-20260904-066) is its first instance; until a suite exists for a row, every other line in that row's lane is a claim. |
| Extension mechanism `deliver.extension` | Two receivers identify the same declared extension and apply its required or optional handling rule when they do not implement it. | Proposed test: exchange fixtures with a supported extension, an unknown optional extension and an unknown required extension; compare each receiver's declared handling and result with the extension contract. |
| Key rotation, revocation and recovery `identity.key-lifecycle` | Two receivers discover the verification material that applies after an identity-control key is changed, revoked or recovered under the declared method. | Proposed test: use an identity fixture with a recorded key change, revocation and recovery; ask each receiver which verification material applies to each supplied verification case and compare with the method's expected result. |
| Asset reference resolution `deliver.resolve` | Two receivers resolve a scene's resource identifiers to the intended resources using the declared base location or resolver context. | Proposed test: resolve relative references and context-dependent aliases from one scene fixture in two receivers; compare the selected resources with an expected mapping, including a missing reference. |
| Pose series and live pose streams `geo.trajectory` | Two receivers reconstruct the same ordered location and orientation samples from a pose sequence with a declared time base and reference frame. | Proposed test: send timestamped pose samples with known frame and ordering to two receivers; compare the decoded samples and their times. Evaluate interpolation only when the fixture separately declares its rule. |
| Linked pose structures `geo.pose-graph` | Two receivers reconstruct the same related coordinate frames from exchanged pose links and declared transform meanings. | Proposed test: exchange a pose chain and graph with known frame links; compare each reconstructed frame with the reference transforms, and check the declared handling of an unresolved link. |
| Consent carried with the subject `identity.consent` | Two recipients interpret the scope, purpose, validity and withdrawal information of a carried permission grant for the same proposed use. | Proposed test: send grant fixtures with permitted and excluded purposes, an expired validity period and withdrawn permission; compare both recipients' interpretation with the fixture contract, without claiming the grant was validly obtained. |
| Experience containment `scene.containment` | The containing runtime hosts another party's experience with its own logic and lifecycle, and both parties agree on what the contained experience may perceive, change and create within the container. | Proposed test: run one experience fixture inside two independent containing runtimes and compare what the contained experience perceives, what state it changes, and what the container restricts, against the containment contract declared by each host. |

### Recorded support — 57 subjects, accepted integration of 2026-09-11

These are recorded claims, not independent implementation counts or conformance results. Unscored cells are omitted and remain distinct from recorded unverified claims.

| Capability | Built in | Through an extension | Partial | Native subjects or score status |
|---|---|---|---|---|
| Scene graph model `scene.graph` | 21 | 0 | 7 | 21 subjects |
| Transforms and coordinate convention `scene.transform` | 17 | 0 | 20 | 17 subjects |
| Asset container format `scene.container` | 16 | 2 | 20 | 16 subjects |
| Geometry encoding `scene.geometry` | 14 | 0 | 19 | 14 subjects |
| Texture encoding `scene.texture` | 15 | 0 | 16 | 15 subjects |
| Material exchange `scene.material-x` | 2 | 1 | 11 | X3D (ISO/IEC 19775-1), glTF |
| Animation encoding `scene.animation` | 15 | 1 | 11 | 15 subjects |
| Skeleton and rig definition `scene.skeleton` | 15 | 0 | 6 | 15 subjects |
| Units and scale `scene.units` | 18 | 0 | 16 | 18 subjects |
| Avatar body format `avatar.body` | 4 | 3 | 7 | MPEG-I Avatar Representation Format, Roblox, VRM, X3D (ISO/IEC 19775-1) |
| Avatar skeleton standard `avatar.skeleton` | 4 | 0 | 12 | Roblox, Unity, VRM, X3D (ISO/IEC 19775-1) |
| Facial expression standard `avatar.expression` | 1 | 0 | 9 | VRM |
| Attachments and wearables `avatar.wearable` | 1 | 0 | 9 | Roblox |
| Avatar to identity binding `avatar.identity` | 2 | 0 | 6 | Roblox, Universal Manifest |
| Session handoff and portals `net.handoff` | 2 | 0 | 6 | Inter-World Portaling System, Roblox |
| Identity root `identity.root` | 3 | 2 | 14 | Decentralized Identifiers, Roblox, Universal Manifest |
| Behaviour graphs and interactivity `logic.behaviour` | 6 | 1 | 6 | 6 subjects |
| Versioning and update `deliver.version` | 17 | 1 | 21 | 17 subjects |
| Conformance testing `deliver.conformance` | 8 | 1 | 19 | 8 subjects |
| Extension mechanism `deliver.extension` | 17 | 1 | 13 | Accepted source claims; no runtime conformance claim |
| Key rotation, revocation and recovery `identity.key-lifecycle` | 0 | 0 | 2 | Accepted source claims; no runtime conformance claim |
| Asset reference resolution `deliver.resolve` | 17 | 3 | 2 | Accepted source claims; no runtime conformance claim |
| Pose series and live pose streams `geo.trajectory` | 18 | 7 | 10 | Accepted source claims; no runtime conformance claim |
| Linked pose structures `geo.pose-graph` | 23 | 9 | 2 | Accepted source claims; no runtime conformance claim |
| Consent carried with the subject `identity.consent` | 1 | 0 | 5 | Accepted source claims; no runtime conformance claim |
| Experience containment `scene.containment` | 2 | 0 | 12 | Fortnite Creative and the Unreal Editor for Fortnite, Verse |

### Historical support and interpretation — 2026-09-06, 46 subjects

The following table and lane interpretation are the earlier snapshot, retained as evidence. They do not describe the expanded current lane.

| Capability | Built in | Through an extension | Partial | The systems that have it built in |
|---|---|---|---|---|
| Scene graph model `scene.graph` | 20 | 0 | 5 | 20 systems |
| Transforms and coordinate convention `scene.transform` | 16 | 0 | 11 | 16 systems |
| Asset container format `scene.container` | 15 | 2 | 12 | 15 systems |
| Geometry encoding `scene.geometry` | 12 | 0 | 15 | 12 systems |
| Texture encoding `scene.texture` | 14 | 0 | 13 | 14 systems |
| Material exchange `scene.material-x` | 2 | 1 | 10 | X3D (ISO/IEC 19775-1), glTF |
| Animation encoding `scene.animation` | 15 | 1 | 6 | 15 systems |
| Skeleton and rig definition `scene.skeleton` | 15 | 0 | 4 | 15 systems |
| Units and scale `scene.units` | 16 | 0 | 10 | 16 systems |
| Avatar body format `avatar.body` | 4 | 3 | 5 | MPEG-I Avatar Representation Format, Roblox, VRM, X3D (ISO/IEC 19775-1) |
| Avatar skeleton standard `avatar.skeleton` | 4 | 0 | 12 | Roblox, Unity, VRM, X3D (ISO/IEC 19775-1) |
| Facial expression standard `avatar.expression` | 1 | 0 | 8 | VRM |
| Attachments and wearables `avatar.wearable` | 1 | 0 | 9 | Roblox |
| Avatar to identity binding `avatar.identity` | 2 | 0 | 6 | Roblox, Universal Manifest |
| Session handoff and portals `net.handoff` | 2 | 0 | 6 | Inter-World Portaling System, Roblox |
| Identity root `identity.root` | 3 | 2 | 14 | Decentralized Identifiers, Roblox, Universal Manifest |
| Behaviour graphs and interactivity `logic.behaviour` | 6 | 1 | 6 | 6 systems |
| Versioning and update `deliver.version` | 17 | 1 | 15 | 17 systems |
| Conformance testing `deliver.conformance` | 8 | 0 | 17 | 8 systems |

**The lane's numbers.** Restricted to these 19 rows, the coverage metric reads 100% built in, 100% with extensions and 100% with partial over every subject switched on, and 100%, 100% and 100% counting production subjects only. 17 of the 19 rows have two or more systems with the capability built in; 2 rest on a single system: Facial expression standard (VRM), Attachments and wearables (Roblox).

The two rows that rest on one system are the two the working group would most want measured:
named facial expressions, which one avatar format defines, and attachments and wearables, whose only
complete answer is one platform's internal rule and therefore crosses no boundary at all. Nine of the
nineteen rows have a test in the pilot design, which is why this is the lane that can be measured
first.

## Lane 3 — World-to-world travel (U3)

**The use case.** A person moves from one world to another through a portal, keeping identity, inventory, preferences and the session's continuity.

**The bundle.** 31 must-interoperate capabilities. **The route.** `/msf/atlas/#lane=travel`

**Historical lane description — 2026-09-06.** The following description records the earlier bundle; the current membership and proposed tests follow.

The widest lane and the least testable one. Nothing here can be proved with a file and a loader.
Every row needs a running world at each end, an identity both ends accept, and a portal between
them.

### What conformance would mean, and what would prove it

| Capability | What conformance would mean | The test that would prove it |
|---|---|---|
| Rights and licence metadata `scene.licence` | The receiver reads the terms that travel with the asset and can state them back — who made it, and what may be done with it — without asking a person. | Test idea: hand each system one asset with a VRM licence block and one signed with C2PA, require it to print the terms it read, and require it to refuse one use those terms forbid. |
| Avatar body format `avatar.body` | The receiving system loads the portable body and draws a whole person, dropping no part of the description in silence. | Pilot T1: the avatar file loads and the scene holds at least one skinned mesh from it. |
| Attachments and wearables `avatar.wearable` | An equipped item lands on the right attachment point with the right offset and stays there while the body moves. | Pilot T4 measures both items at rest and at frame ten, within 2 cm and 5 degrees; pilot T7 makes one runtime write the record of what is equipped and another read it. |
| Avatar to identity binding `avatar.identity` | The receiving world can check that the avatar arriving belongs to the person presenting it. | Test idea: present an avatar with a signed binding to an identifier, require the world to verify it, then present the same avatar bound to a different identifier and require refusal. |
| State replication `net.replication` | A client written by one party reads and writes the other's state stream and sees the same world as everybody else in it. | Test idea: an independent client joins a reference server, and a third observer compares the two views of one moving object over sixty seconds. |
| Transport protocol `net.transport` | Two independent implementations open a session over the same wire protocol and exchange messages with no bridge between them. | Test idea: one conformance client completes a handshake, an echo and a clean close against two servers written by different parties. |
| Session establishment `net.session` | A visitor's client joins a running world it was not built for, authentication included, and is placed in it. | Test idea: join twice, once with a valid credential and once with an expired one; entry then refusal, and any other pair of outcomes is a fail. |
| Session handoff and portals `net.handoff` | A person leaves one world through a portal and arrives in another, keeping who they are and what they carry, on one handoff message both ends read the same way. | Test idea: run one portal handoff between two servers written by different parties and compare what arrives with what left, field by field. |
| World addressing and naming `net.address` | A name written down in one system resolves to the same destination when another system resolves it. | Test idea: resolve a fixed list of world addresses from two independent clients and require the same endpoint, including the failure cases. |
| Identity root `identity.root` | One identifier for a person or an agent resolves to the same subject in both worlds. | Test idea: resolve the same identifier with two independent resolvers and compare the documents returned, then repeat with a revoked identifier and require the same answer from both. |
| Credential format `identity.credential` | A credential issued by one party is read and verified by a party that did not issue it. | Test idea: verify a signed credential, then verify a copy with one byte changed, and require acceptance then rejection. |
| Credential exchange protocol `identity.exchange` | A world asks for a credential and the holder presents it, over a protocol neither of them owns. | Test idea: run one request-and-present exchange between an independent verifier and holder, then a request the holder refuses, and check both sides end in a state each expected. |
| Capability and permission grant `identity.capability` | A world reads what an arriving person or agent is permitted to do, from a grant it did not issue, and acts on it. | Test idea: present a grant that allows one action and forbids another; the world must allow the first and refuse the second, and say which grant it read. |
| Geospatial pose `geo.pose` | Content pinned to a place on the Earth lands within a stated distance of the same place in the other system. | Test idea: place one GeoPose fixture in two systems and report the distance between the two placements in metres and the difference in heading in degrees. |
| Coordinate reference systems `geo.crs` | Both systems read the same frame and datum and put the origin in the same place. | Test idea: convert a set of surveyed points between frames in each system and compare against the surveyed values. |
| Shared and persistent anchors `geo.anchor-shared` | Two people on two systems see the same virtual thing in the same real place, and it is still there the next day. | Test idea: create an anchor on one system, resolve it on the other in the same room, measure the offset, and measure it again 24 hours later. |
| Immersive session lifecycle `input.session` | An application starts an immersive session on a runtime it was not written for and receives pose and frames from it. | Test idea: run one session lifecycle — start, frame loop, end — against two runtimes and require the same states in the same order, including a refused start. |
| Inventory `persist.inventory` | What a person carries is readable at the destination and comes back unchanged. | Pilot T7 is the nearest thing that exists: one runtime writes the record of what is equipped, another reads it and repeats T4. No runtime in the pilot holds an inventory, so the harness stands in for the platform layer, and the design says so. |
| Preference portability `persist.prefs` | Comfort and accessibility settings a person set in one world are read and honoured by the next. | Test idea: set three named preferences — turning style, comfort vignette, text size — travel, and require the destination to report the same three. |
| Conformance testing `deliver.conformance` | A shared test suite exists for the row, both parties run it, and the results are public. | This row is the lane machinery itself. The pilot test set (WO-msf-wg-tool-20260904-066) is its first instance; until a suite exists for a row, every other line in that row's lane is a claim. |
| Extension mechanism `deliver.extension` | Two receivers identify the same declared extension and apply its required or optional handling rule when they do not implement it. | Proposed test: exchange fixtures with a supported extension, an unknown optional extension and an unknown required extension; compare each receiver's declared handling and result with the extension contract. |
| Claim vocabulary and schema `identity.schema` | A receiver interprets the declared claim vocabulary and checks the claim structure against the applicable schema, separately from checking truth and issuer trust. | Proposed test: give two independent verifiers one structurally valid claim, one invalid claim and one unknown vocabulary; compare their interpretation and validation results with the declared contract. |
| Key rotation, revocation and recovery `identity.key-lifecycle` | Two receivers discover the verification material that applies after an identity-control key is changed, revoked or recovered under the declared method. | Proposed test: use an identity fixture with a recorded key change, revocation and recovery; ask each receiver which verification material applies to each supplied verification case and compare with the method's expected result. |
| Credential status and revocation `identity.status` | Two receivers discover and interpret a credential's status through the same declared status mechanism, independently of expiry and signing-key status. | Proposed test: check credential fixtures with active, suspended and revoked status plus an unavailable status response; compare the discovered status and failure handling with the declared mechanism. |
| Pose series and live pose streams `geo.trajectory` | Two receivers reconstruct the same ordered location and orientation samples from a pose sequence with a declared time base and reference frame. | Proposed test: send timestamped pose samples with known frame and ordering to two receivers; compare the decoded samples and their times. Evaluate interpolation only when the fixture separately declares its rule. |
| Content protection signalling `deliver.protection` | Two receivers identify the protection mechanism declared for each protected content component without treating that signal as a rights grant or key. | Proposed test: exchange content fixtures with supported and unknown protection-scheme identifiers; compare the mechanism each receiver identifies and its reported handling against the declared contract. |
| Linked pose structures `geo.pose-graph` | Two receivers reconstruct the same related coordinate frames from exchanged pose links and declared transform meanings. | Proposed test: exchange a pose chain and graph with known frame links; compare each reconstructed frame with the reference transforms, and check the declared handling of an unresolved link. |
| Consent carried with the subject `identity.consent` | Two recipients interpret the scope, purpose, validity and withdrawal information of a carried permission grant for the same proposed use. | Proposed test: send grant fixtures with permitted and excluded purposes, an expired validity period and withdrawn permission; compare both recipients' interpretation with the fixture contract, without claiming the grant was validly obtained. |
| Deciding whether to admit an arrival `net.admission` | The origin and destination interpret the same pre-arrival approval or refusal and its validity limit without requiring disclosure of private decision rules. | Proposed test: exchange approval, refusal and expired-approval responses between independent origin and destination implementations; compare the interpreted outcome and validity while keeping authentication and session setup separate. |
| Experience containment `scene.containment` | The containing runtime hosts another party's experience with its own logic and lifecycle, and both parties agree on what the contained experience may perceive, change and create within the container. | Proposed test: run one experience fixture inside two independent containing runtimes and compare what the contained experience perceives, what state it changes, and what the container restricts, against the containment contract declared by each host. |
| Unattended world coupling `net.world-coupling` | A state change in one world causes the declared effect in another with no participant present in either, and both ends agree on who held authority, in what order changes applied, and that settlement is final. | Proposed test: trigger a coupling event in one world with no participant in either and compare the resulting state in the coupled world against the declared effect, checking that authority, ordering and settlement match the coupling contract. |

### Recorded support — 57 subjects, accepted integration of 2026-09-11

These are recorded claims, not independent implementation counts or conformance results. Unscored cells are omitted and remain distinct from recorded unverified claims.

| Capability | Built in | Through an extension | Partial | Native subjects or score status |
|---|---|---|---|---|
| Rights and licence metadata `scene.licence` | 1 | 3 | 5 | VRM |
| Avatar body format `avatar.body` | 4 | 3 | 7 | MPEG-I Avatar Representation Format, Roblox, VRM, X3D (ISO/IEC 19775-1) |
| Attachments and wearables `avatar.wearable` | 1 | 0 | 9 | Roblox |
| Avatar to identity binding `avatar.identity` | 2 | 0 | 6 | Roblox, Universal Manifest |
| State replication `net.replication` | 9 | 1 | 6 | 9 subjects |
| Transport protocol `net.transport` | 5 | 1 | 10 | 5 subjects |
| Session establishment `net.session` | 4 | 3 | 10 | Fortnite Creative and the Unreal Editor for Fortnite, Resonite, Roblox, TeleportXR |
| Session handoff and portals `net.handoff` | 2 | 0 | 6 | Inter-World Portaling System, Roblox |
| World addressing and naming `net.address` | 6 | 0 | 11 | 6 subjects |
| Identity root `identity.root` | 3 | 2 | 14 | Decentralized Identifiers, Roblox, Universal Manifest |
| Credential format `identity.credential` | 2 | 1 | 3 | Universal Manifest, Verifiable Credentials Data Model |
| Credential exchange protocol `identity.exchange` | 1 | 0 | 5 | Roblox |
| Capability and permission grant `identity.capability` | 1 | 1 | 16 | Universal Manifest |
| Geospatial pose `geo.pose` | 7 | 2 | 7 | 7 subjects |
| Coordinate reference systems `geo.crs` | 3 | 2 | 9 | CesiumJS, OGC 3D Tiles (Community Standard), X3D (ISO/IEC 19775-1) |
| Shared and persistent anchors `geo.anchor-shared` | 4 | 1 | 8 | Apple ARKit and RealityKit, Google ARCore and Android XR, Niantic Lightship, Open AR Cloud (Open Spatial Computing Platform) |
| Immersive session lifecycle `input.session` | 9 | 2 | 6 | 9 subjects |
| Inventory `persist.inventory` | 3 | 1 | 4 | Fortnite Creative and the Unreal Editor for Fortnite, Resonite, Roblox |
| Preference portability `persist.prefs` | 1 | 0 | 6 | Roblox |
| Conformance testing `deliver.conformance` | 8 | 1 | 19 | 8 subjects |
| Extension mechanism `deliver.extension` | 17 | 1 | 13 | Accepted source claims; no runtime conformance claim |
| Claim vocabulary and schema `identity.schema` | 5 | 0 | 0 | Accepted source claims; no runtime conformance claim |
| Key rotation, revocation and recovery `identity.key-lifecycle` | 0 | 0 | 2 | Accepted source claims; no runtime conformance claim |
| Credential status and revocation `identity.status` | 2 | 2 | 0 | Accepted source claims; no runtime conformance claim |
| Pose series and live pose streams `geo.trajectory` | 18 | 7 | 10 | Accepted source claims; no runtime conformance claim |
| Content protection signalling `deliver.protection` | 0 | 0 | 1 | Accepted source claims; no runtime conformance claim |
| Linked pose structures `geo.pose-graph` | 23 | 9 | 2 | Accepted source claims; no runtime conformance claim |
| Consent carried with the subject `identity.consent` | 1 | 0 | 5 | Accepted source claims; no runtime conformance claim |
| Deciding whether to admit an arrival `net.admission` | 1 | 0 | 2 | Accepted source claims; no runtime conformance claim |
| Experience containment `scene.containment` | 2 | 0 | 12 | Fortnite Creative and the Unreal Editor for Fortnite, Verse |
| Unattended world coupling `net.world-coupling` | 0 | 0 | 0 | No native, extension or partial support recorded |

### Historical support and interpretation — 2026-09-06, 46 subjects

The following table and lane interpretation are the earlier snapshot, retained as evidence. They do not describe the expanded current lane.

| Capability | Built in | Through an extension | Partial | The systems that have it built in |
|---|---|---|---|---|
| Rights and licence metadata `scene.licence` | 1 | 3 | 5 | VRM |
| Avatar body format `avatar.body` | 4 | 3 | 5 | MPEG-I Avatar Representation Format, Roblox, VRM, X3D (ISO/IEC 19775-1) |
| Attachments and wearables `avatar.wearable` | 1 | 0 | 9 | Roblox |
| Avatar to identity binding `avatar.identity` | 2 | 0 | 6 | Roblox, Universal Manifest |
| State replication `net.replication` | 9 | 1 | 6 | 9 systems |
| Transport protocol `net.transport` | 5 | 1 | 6 | 5 systems |
| Session establishment `net.session` | 4 | 3 | 10 | Fortnite Creative and the Unreal Editor for Fortnite, Resonite, Roblox, TeleportXR |
| Session handoff and portals `net.handoff` | 2 | 0 | 6 | Inter-World Portaling System, Roblox |
| World addressing and naming `net.address` | 6 | 0 | 9 | 6 systems |
| Identity root `identity.root` | 3 | 2 | 14 | Decentralized Identifiers, Roblox, Universal Manifest |
| Credential format `identity.credential` | 2 | 1 | 3 | Universal Manifest, Verifiable Credentials Data Model |
| Credential exchange protocol `identity.exchange` | 1 | 0 | 5 | Roblox |
| Capability and permission grant `identity.capability` | 1 | 1 | 13 | Universal Manifest |
| Geospatial pose `geo.pose` | 7 | 2 | 2 | 7 systems |
| Coordinate reference systems `geo.crs` | 3 | 2 | 7 | CesiumJS, OGC 3D Tiles (Community Standard), X3D (ISO/IEC 19775-1) |
| Shared and persistent anchors `geo.anchor-shared` | 4 | 1 | 7 | Apple ARKit and RealityKit, Google ARCore and Android XR, Niantic Lightship, Open AR Cloud (Open Spatial Computing Platform) |
| Immersive session lifecycle `input.session` | 9 | 2 | 5 | 9 systems |
| Inventory `persist.inventory` | 3 | 1 | 4 | Fortnite Creative and the Unreal Editor for Fortnite, Resonite, Roblox |
| Preference portability `persist.prefs` | 1 | 0 | 6 | Roblox |
| Conformance testing `deliver.conformance` | 8 | 0 | 17 | 8 systems |

**The lane's numbers.** Restricted to these 20 rows, the coverage metric reads 100% built in, 100% with extensions and 100% with partial over every subject switched on, and 95%, 95% and 100% counting production subjects only. 15 of the 20 rows have two or more systems with the capability built in; 5 rest on a single system: Rights and licence metadata (VRM), Attachments and wearables (Roblox), Credential exchange protocol (Roblox), Capability and permission grant (Universal Manifest), Preference portability (Roblox).

Three of the five single-system rows are one company's own mechanism seen from outside, which is
not interoperability however green the cell looks. Read against production systems only, capability
and permission grant drops to nothing at all: the one system that has it built in, the Universal
Manifest, is a draft. Three rows in this lane have a test today and all three are borrowed from the
avatar pilot; the rest need a running world at each end, which nothing in a test rig can drive
today.

## Lane 4 — Agent participation (U4)

**The use case.** A software agent joins a world, acts in it, and pays for what it uses.

**The bundle.** 19 must-interoperate capabilities. **The route.** `/msf/atlas/#lane=agent`

**Historical lane description — 2026-09-06.** The following description records the earlier bundle; the current membership and proposed tests follow.

The newest lane, and the one where the use case is larger than the map. Eleven of its twelve rows it
shares with world-to-world travel — a session, an address, an identity, a credential, a permission —
because an agent joins a world much as a person does. One row belongs to the agent alone, and the
half of the use case about paying has no row on the map at all.

### What conformance would mean, and what would prove it

| Capability | What conformance would mean | The test that would prove it |
|---|---|---|
| Rights and licence metadata `scene.licence` | The receiver reads the terms that travel with the asset and can state them back — who made it, and what may be done with it — without asking a person. | Test idea: hand each system one asset with a VRM licence block and one signed with C2PA, require it to print the terms it read, and require it to refuse one use those terms forbid. |
| Avatar to identity binding `avatar.identity` | The receiving world can check that the avatar arriving belongs to the person presenting it. | Test idea: present an avatar with a signed binding to an identifier, require the world to verify it, then present the same avatar bound to a different identifier and require refusal. |
| State replication `net.replication` | A client written by one party reads and writes the other's state stream and sees the same world as everybody else in it. | Test idea: an independent client joins a reference server, and a third observer compares the two views of one moving object over sixty seconds. |
| Transport protocol `net.transport` | Two independent implementations open a session over the same wire protocol and exchange messages with no bridge between them. | Test idea: one conformance client completes a handshake, an echo and a clean close against two servers written by different parties. |
| Session establishment `net.session` | A visitor's client joins a running world it was not built for, authentication included, and is placed in it. | Test idea: join twice, once with a valid credential and once with an expired one; entry then refusal, and any other pair of outcomes is a fail. |
| World addressing and naming `net.address` | A name written down in one system resolves to the same destination when another system resolves it. | Test idea: resolve a fixed list of world addresses from two independent clients and require the same endpoint, including the failure cases. |
| Identity root `identity.root` | One identifier for a person or an agent resolves to the same subject in both worlds. | Test idea: resolve the same identifier with two independent resolvers and compare the documents returned, then repeat with a revoked identifier and require the same answer from both. |
| Credential format `identity.credential` | A credential issued by one party is read and verified by a party that did not issue it. | Test idea: verify a signed credential, then verify a copy with one byte changed, and require acceptance then rejection. |
| Credential exchange protocol `identity.exchange` | A world asks for a credential and the holder presents it, over a protocol neither of them owns. | Test idea: run one request-and-present exchange between an independent verifier and holder, then a request the holder refuses, and check both sides end in a state each expected. |
| Capability and permission grant `identity.capability` | A world reads what an arriving person or agent is permitted to do, from a grant it did not issue, and acts on it. | Test idea: present a grant that allows one action and forbids another; the world must allow the first and refuse the second, and say which grant it read. |
| Agent integration `logic.agent` | An agent written for one world perceives and acts in another through an interface neither world owns. | Test idea: one agent completes the same three-step task in two worlds using only the published interface, and both worlds log the same actions. |
| Conformance testing `deliver.conformance` | A shared test suite exists for the row, both parties run it, and the results are public. | This row is the lane machinery itself. The pilot test set (WO-msf-wg-tool-20260904-066) is its first instance; until a suite exists for a row, every other line in that row's lane is a claim. |
| Extension mechanism `deliver.extension` | Two receivers identify the same declared extension and apply its required or optional handling rule when they do not implement it. | Proposed test: exchange fixtures with a supported extension, an unknown optional extension and an unknown required extension; compare each receiver's declared handling and result with the extension contract. |
| Claim vocabulary and schema `identity.schema` | A receiver interprets the declared claim vocabulary and checks the claim structure against the applicable schema, separately from checking truth and issuer trust. | Proposed test: give two independent verifiers one structurally valid claim, one invalid claim and one unknown vocabulary; compare their interpretation and validation results with the declared contract. |
| Key rotation, revocation and recovery `identity.key-lifecycle` | Two receivers discover the verification material that applies after an identity-control key is changed, revoked or recovered under the declared method. | Proposed test: use an identity fixture with a recorded key change, revocation and recovery; ask each receiver which verification material applies to each supplied verification case and compare with the method's expected result. |
| Credential status and revocation `identity.status` | Two receivers discover and interpret a credential's status through the same declared status mechanism, independently of expiry and signing-key status. | Proposed test: check credential fixtures with active, suspended and revoked status plus an unavailable status response; compare the discovered status and failure handling with the declared mechanism. |
| Consent carried with the subject `identity.consent` | Two recipients interpret the scope, purpose, validity and withdrawal information of a carried permission grant for the same proposed use. | Proposed test: send grant fixtures with permitted and excluded purposes, an expired validity period and withdrawn permission; compare both recipients' interpretation with the fixture contract, without claiming the grant was validly obtained. |
| Deciding whether to admit an arrival `net.admission` | The origin and destination interpret the same pre-arrival approval or refusal and its validity limit without requiring disclosure of private decision rules. | Proposed test: exchange approval, refusal and expired-approval responses between independent origin and destination implementations; compare the interpreted outcome and validity while keeping authentication and session setup separate. |
| Unattended world coupling `net.world-coupling` | A state change in one world causes the declared effect in another with no participant present in either, and both ends agree on who held authority, in what order changes applied, and that settlement is final. | Proposed test: trigger a coupling event in one world with no participant in either and compare the resulting state in the coupled world against the declared effect, checking that authority, ordering and settlement match the coupling contract. |

### Recorded support — 57 subjects, accepted integration of 2026-09-11

These are recorded claims, not independent implementation counts or conformance results. Unscored cells are omitted and remain distinct from recorded unverified claims.

| Capability | Built in | Through an extension | Partial | Native subjects or score status |
|---|---|---|---|---|
| Rights and licence metadata `scene.licence` | 1 | 3 | 5 | VRM |
| Avatar to identity binding `avatar.identity` | 2 | 0 | 6 | Roblox, Universal Manifest |
| State replication `net.replication` | 9 | 1 | 6 | 9 subjects |
| Transport protocol `net.transport` | 5 | 1 | 10 | 5 subjects |
| Session establishment `net.session` | 4 | 3 | 10 | Fortnite Creative and the Unreal Editor for Fortnite, Resonite, Roblox, TeleportXR |
| World addressing and naming `net.address` | 6 | 0 | 11 | 6 subjects |
| Identity root `identity.root` | 3 | 2 | 14 | Decentralized Identifiers, Roblox, Universal Manifest |
| Credential format `identity.credential` | 2 | 1 | 3 | Universal Manifest, Verifiable Credentials Data Model |
| Credential exchange protocol `identity.exchange` | 1 | 0 | 5 | Roblox |
| Capability and permission grant `identity.capability` | 1 | 1 | 16 | Universal Manifest |
| Agent integration `logic.agent` | 4 | 1 | 13 | Fortnite Creative and the Unreal Editor for Fortnite, Google ARCore and Android XR, Horizon Worlds, Unreal Engine |
| Conformance testing `deliver.conformance` | 8 | 1 | 19 | 8 subjects |
| Extension mechanism `deliver.extension` | 17 | 1 | 13 | Accepted source claims; no runtime conformance claim |
| Claim vocabulary and schema `identity.schema` | 5 | 0 | 0 | Accepted source claims; no runtime conformance claim |
| Key rotation, revocation and recovery `identity.key-lifecycle` | 0 | 0 | 2 | Accepted source claims; no runtime conformance claim |
| Credential status and revocation `identity.status` | 2 | 2 | 0 | Accepted source claims; no runtime conformance claim |
| Consent carried with the subject `identity.consent` | 1 | 0 | 5 | Accepted source claims; no runtime conformance claim |
| Deciding whether to admit an arrival `net.admission` | 1 | 0 | 2 | Accepted source claims; no runtime conformance claim |
| Unattended world coupling `net.world-coupling` | 0 | 0 | 0 | No native, extension or partial support recorded |

### Historical support and interpretation — 2026-09-06, 46 subjects

The following table and lane interpretation are the earlier snapshot, retained as evidence. They do not describe the expanded current lane.

| Capability | Built in | Through an extension | Partial | The systems that have it built in |
|---|---|---|---|---|
| Rights and licence metadata `scene.licence` | 1 | 3 | 5 | VRM |
| Avatar to identity binding `avatar.identity` | 2 | 0 | 6 | Roblox, Universal Manifest |
| State replication `net.replication` | 9 | 1 | 6 | 9 systems |
| Transport protocol `net.transport` | 5 | 1 | 6 | 5 systems |
| Session establishment `net.session` | 4 | 3 | 10 | Fortnite Creative and the Unreal Editor for Fortnite, Resonite, Roblox, TeleportXR |
| World addressing and naming `net.address` | 6 | 0 | 9 | 6 systems |
| Identity root `identity.root` | 3 | 2 | 14 | Decentralized Identifiers, Roblox, Universal Manifest |
| Credential format `identity.credential` | 2 | 1 | 3 | Universal Manifest, Verifiable Credentials Data Model |
| Credential exchange protocol `identity.exchange` | 1 | 0 | 5 | Roblox |
| Capability and permission grant `identity.capability` | 1 | 1 | 13 | Universal Manifest |
| Agent integration `logic.agent` | 4 | 1 | 12 | Fortnite Creative and the Unreal Editor for Fortnite, Google ARCore and Android XR, Horizon Worlds, Unreal Engine |
| Conformance testing `deliver.conformance` | 8 | 0 | 17 | 8 systems |

**The lane's numbers.** Restricted to these 12 rows, the coverage metric reads 100% built in, 100% with extensions and 100% with partial over every subject switched on, and 92%, 92% and 100% counting production subjects only. 9 of the 12 rows have two or more systems with the capability built in; 3 rest on a single system: Rights and licence metadata (VRM), Credential exchange protocol (Roblox), Capability and permission grant (Universal Manifest).

All three single-system rows are the ones that decide what an agent is allowed to do: licence
metadata, credential exchange and permission grant. No row in this lane has a test today. The lane is
also incomplete by construction. The use case says the agent pays for what it uses, and the map has no
payment row to put that on until the commerce rows are added
(WO-msf-wg-tool-20260904-063, held until after the Forum's X402 session).

## What the four lanes say together

| Lane | Current must rows | Prior rows with baseline scores | Added rows with accepted score dispositions |
|---|---|---|---|
| Content portability (U1) | 30 | 22 | 8 |
| Avatar portability (U2) | 26 | 19 | 7 |
| World-to-world travel (U3) | 31 | 20 | 11 |
| Agent participation (U4) | 19 | 12 | 7 |

There are 106 lane places and 54 distinct must rows. The accepted support tables now include every approved must row; a zero means no claim at that level is recorded. A recorded subject claim alone does not demonstrate agreement between independent implementations.

## Historical cross-lane findings — 2026-09-06

This section retains the earlier 117-capability, 46-subject measurements and the interpretation written with them.

| Lane | Rows | Two or more have it built in | Only one has it built in | Metric on the lane, all subjects | Metric on the lane, production only | Rows with a test today |
|---|---|---|---|---|---|---|
| 1 Content portability (U1) | 22 | 17 | 5 | 100% | 100% | 6 |
| 2 Avatar portability (U2) | 19 | 17 | 2 | 100% | 100% | 9 |
| 3 World-to-world travel (U3) | 20 | 15 | 5 | 100% | 95% | 3 |
| 4 Agent participation (U4) | 12 | 9 | 3 | 100% | 92% | 0 |

**The restricted metric is honest and nearly useless, and that is worth knowing before the routes
ship.** Read over a lane, the coverage figure asks whether any one system anywhere has the row built
in. On a must row, in a database of 46 subjects, the answer is almost always yes, so every lane reads
100% under the default. The five rows the content lane gained on 2026-09-06 prove the point rather
than moving the number: four of them rest on a single standard, MPEG-I V3C, which is ratified and so
counts as a production subject, so the lane still reads 100% under both readings. **A metric that
cannot tell 22 rows from 17 when four of the five added rows have one implementation each is a metric
that is not measuring what a reader thinks it measures.** The two places it does move are the
production reading of the travel and agent lanes, where capability and permission grant falls to
nothing because the only system that has it, the Universal Manifest, is a draft. The number a lane
should be judged by is the next column along: how many of its rows have two or more systems with the
capability built in, because that is the condition for a test between two implementations to be
possible at all. **Read that way, the content lane fell from 16 of 17 to 17 of 22 in one day**, which
is the truer account of what the owner's answer did. The avatar lane still clears it almost
everywhere; travel clears fifteen of its twenty rows, and the agent lane nine of its twelve.

**Eighteen rows on the whole map rest on a single system. Ten of the eighteen are must rows, and
every one of those ten is in a lane.** They are rights and licence metadata (VRM), facial expressions
(VRM), attachments and wearables (Roblox), credential exchange (Roblox), capability and permission
grant (Universal Manifest), preference portability (Roblox), and the four captured-content rows that
joined lane 1 on 2026-09-06 — volumetric video, point cloud encoding, multi-view plus depth and
time-varying capture, all four of them MPEG-I V3C. Three of the ten are one company's internal
mechanism, which by definition crosses no boundary: the cell is green and the row is empty. Four are
one standard, which is a different case — a standard is written for parties that did not write it, so
the row is open and simply unimplemented so far by anyone else. All ten are where a lane cannot be
tested yet for want of a second implementation to test against, and they are the sharpest argument
the map makes for what the Forum's standards work should do next.

**The thin list doubled on 2026-09-06, and later the same day the owner's answer moved four of the
thin rows into a lane.** The map grew from 89 rows to 117, and ten of the 28 new rows have exactly
one system with the capability built in. When those 28 were scored, every one of the ten was a should
or a none, so the lanes did not move at all. Then question 5 of the boundaries page was answered yes
— captured content is first-class — and five capture rows became musts under U1. The four lanes now
hold 40 capabilities in 73 places, the content lane holds 22 rows rather than 17, and the count of
thin must rows went from six to ten. **The thin list itself is still eighteen rows.** Nothing became
thin; four thin rows became load-bearing.

**One thing the boundaries page said was out of date, and it has now been corrected there.** That
page was written against 35 subjects and said shared and persistent anchors `geo.anchor-shared` had
no native implementation anywhere. Against the 46 subjects in the database today it has four — Apple
ARKit and RealityKit, Google ARCore and Android XR, Niantic Lightship, and Open AR Cloud — because
the breadth pass added the systems whose whole business that row is. The rest of the boundaries
page's must-row picture holds: no must row is unreached, and the six rows above are the same six it
named.

## The order of work

The sequence remains boundary, lane, test suite, then any separate badge decision. The progress descriptions below record the 2026-09-06 state; the 12 added must rows now have proposed test ideas above, with no execution claimed.

1. **Decide the boundary.** Done: `infrastructure-wg/model/INTEROPERABILITY-BOUNDARIES.md`, approved
   by the owner on 2026-09-06.
2. **Define the lane.** This page.
3. **Write one test suite at a time, starting where two implementations already exist.** The avatar
   pilot is the first, by the owner's choice, and it covers nine of lane 2's nineteen rows.
4. **Run the tests in public and put the results in the map.** Nothing is built for this yet; the
   pilot's results shape is the first sketch of it.
5. **Only then**, if the Forum wants one, a conversation about what a badge would say. Not before,
   and nothing in this page assumes it happens.

Where each lane stands against that list: lane 2 is at step 3; lane 1 is at step 3 for the six rows
the pilot borrows and at step 2 for the rest, including all five captured-content rows, four of which
cannot reach step 3 at all until a second system implements them; lane 3 has three borrowed rows and
otherwise needs a kind of test rig nobody here has, two running worlds that will talk to each other;
lane 4 is at step 2 entirely, and cannot be finished at all until the map has a payment row.

## The four routes on the atlas

One named route per lane, all four landing on the atlas's top level with the lane's capabilities
flagged and the coverage metric restricted to them. The addresses are the four in the table at the
top of this page. A route flags rows, it does not hide the rest: the reader sees the lane inside the
whole map, because a lane the reader cannot see in context is a filter, not a lane.

The maintained `infrastructure-wg/board/atlas.html` source contains all four lane routes and a startup guard that checks their sizes against the metadata. The candidate constants are U1 30, U2 26, U3 31 and U4 19; the guard remains in place. This preparation does not establish integrated browser behavior or deployment. Final integrated browser QA remains required.

## How the counts were made

Current lane membership is derived from `capabilities.csv`: a row belongs when `interop` is `must` and `interop_uses` includes that lane's use case. Every current conformance table matches those memberships: 106 places, 54 distinct rows. The source CSV retains the prior 117 records and appends the 47 accepted additions.

The current recorded-support tables use the 6,996 integrated claims across 57 subjects. The 1,693 additions passed independent source acceptance; all 5,303 prior claim objects remain unchanged. No conformance result is inferred from these source-backed claims.

The SQL below preserves the historical query examples. It illustrates the method; the current support tables were recalculated from the integrated accepted inputs, and the canonical database is rebuilt by the existing loader.

```sql
-- who reaches a lane's rows today (lane 2 shown)
SELECT c.id, c.name,
       sum(CASE WHEN cov.level = 'native'        THEN 1 ELSE 0 END) AS built_in,
       sum(CASE WHEN cov.level = 'via-extension' THEN 1 ELSE 0 END) AS extension,
       sum(CASE WHEN cov.level = 'partial'       THEN 1 ELSE 0 END) AS partial
FROM lane l
JOIN capability c ON c.id = l.capability_id
LEFT JOIN coverage cov ON cov.capability_id = c.id
WHERE l.use_case = 'U2' AND c.interop = 'must'
GROUP BY c.id
ORDER BY c.sort;

-- the coverage metric restricted to a lane, and the two counts that matter more
SELECT round(100.0 * sum(b3) / count(*)) AS built_in_pct,
       round(100.0 * sum(b2) / count(*)) AS with_extensions_pct,
       round(100.0 * sum(b1) / count(*)) AS with_partial_pct,
       sum(CASE WHEN natives >= 2 THEN 1 ELSE 0 END) AS two_or_more,
       sum(CASE WHEN natives  = 1 THEN 1 ELSE 0 END) AS only_one,
       count(*) AS rows_in_lane
FROM (
  SELECT c.id,
    max(CASE WHEN cov.level = 'native' THEN 1 ELSE 0 END) AS b3,
    max(CASE WHEN cov.level IN ('native','via-extension') THEN 1 ELSE 0 END) AS b2,
    max(CASE WHEN cov.level IN ('native','via-extension','partial') THEN 1 ELSE 0 END) AS b1,
    sum(CASE WHEN cov.level = 'native' THEN 1 ELSE 0 END) AS natives
  FROM lane l
  JOIN capability c ON c.id = l.capability_id
  LEFT JOIN coverage cov ON cov.capability_id = c.id
  WHERE l.use_case = 'U2' AND c.interop = 'must'
  GROUP BY c.id);
```

For the production reading, each `CASE` gains
`AND s.status IN ('shipping','ratified','board-approved','mixed')` over a join to `subject`, which is
the same status set the map's metric uses. The historical page was read back against its 2026-09-06
database: 73 lane places, 40 distinct capabilities, every id present in `capability`, every row of
every lane carrying a must value and its use case in the boundaries table, and every count in the
tables reproduced by the queries above.

## What this page does not decide

- **It does not create a certification of any kind.** No badge, no levels, no register, no body, no
  self-declaration form. If one is ever wanted, it is a separate decision after the tests exist.
- **It does not rank the lanes against each other.** Lane 2 is the first to be measured because the
  owner chose the pilot example, not because this page put it there.
- **It does not set tolerances.** Every number in a test — centimetres, degrees, frames — belongs to
  the test design, where it can be argued with measurements. The sentences here say what would be
  true, not how close is close enough.
- **It does not touch the database, the pages or the coverage metric.** The current source defines the atlas routes; candidate integration and browser QA are separate from this document.
- **It does not decide who would run a test.** That is a conversation with the working group, and it
  is Alfred's and Don's to open.

## Historical steward review — 2026-09-06

These earlier questions are retained as context, not as a new gate for the 45 approved additions. Their support percentages describe the historical snapshot.

The gate is the document, before the routes are built or deployed. Four questions where a different
answer changes the page:

1. **Lanes hold must rows only.** The should rows would roughly double every lane and would put
   materials, lighting, physics and voice into the test scope. The argument for keeping them out is
   that a suite that starts with degradation never ships; the argument for letting them in is that
   "it looks the same in both" is what a member will actually ask for.
2. **A lane route flags rows and hides nothing.** The alternative is a filter that shows the lane's
   rows alone, which reads more sharply in a meeting and loses the context that makes the map a map.
   Both can exist; only one can be the route.
3. **The restricted metric reads 100% on all four lanes under the default reading**, and moves only
   on travel and agents when the subject chips are set to production systems. That is honest and it
   is flat. The alternative is to put the "two or more systems" count on the route as well, which is
   a figure the site does not have today and which the metric's own wording would have to explain.
4. **Lane 4 is incomplete on purpose.** It has no payment row because the map has none yet. It can
   ship as it stands with the gap written on it, or wait for the commerce rows.
