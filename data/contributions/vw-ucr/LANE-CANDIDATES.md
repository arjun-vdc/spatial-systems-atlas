# Candidate use case lanes from the Virtual Worlds UCR

**A proposal. Nothing here changes a published figure or a lane.**

The four lanes in `research/model/CERTIFICATION-LANES.md` come from four use cases the map wrote for
itself (U1 content moves, U2 an avatar travels, U3 a person travels, U4 an agent participates). The
Virtual Worlds Use Case Repository (Virtual Worlds UCR) holds use cases and real deployments that
cluster around five more. Each is offered here in the lanes' own shape: one use case, the rows that
stop it, and where the map already rates those rows *must*.

The point of each lane is the column `role_in_lane` in `lane-candidates.csv`. Under the map's own
rule a row is *must* when at least one use case fails without two systems agreeing. Each lane below
is such a use case for rows the map now rates *should*, and the repository's deployments show the
use case is not hypothetical. Only rows that at least one repository use case is linked to are
listed; every link carries the sentence of the use case it rests on, in `links.csv`.

**What accepting a lane would change.** A row has one `interop` rating on the map, not one per
lane, and a lane is the rows rated *must* whose `interop_uses` name its use case
(`INTEROPERABILITY-BOUNDARIES.md`). Accepting a lane therefore raises each of its "would become
*must*" rows to *must* for the whole map, adds the lane to the row's `interop_uses`, and moves the row
into the first pass of test writing. It does not put the row into U1 to U4, whose membership still
needs their own use case named, and it does not change how those use cases read the row: for moving
content, live data binding still only degrades the result. That difference would have to be carried
in `interop_reason`. The question each lane puts to the map is therefore whether its use case
belongs in the map's scope; once it does, the rating follows from the map's own rule.

Figures are from the repository's public records on 2026-10-21, against the map's data of
2026-10-20. *Records* counts the lane's use cases and the records that specialise them; *deployments*
counts the real implementations filed under them.

| Lane | Use case | Records | Deployments | Rows (must now / would become must) |
|---|---|---:|---:|---|
| U5 A twin follows its asset | A digital twin stays in step with the real asset it represents, from live data or a real controller, so that people judge and act on the asset through it | 14 | 13 | 4 / 2 |
| U6 The same thing at the same real place | People on different devices see the same virtual content at the same real place, or registered to the same physical object, and find it there again later | 19 | 53 | 3 / 4 |
| U7 A training result leaves the simulator | What a person did in a simulation, and how well, reaches the employer, the assessor or the authority that has to act on it, in a form they can read and trust | 37 | 144 | 3 / 3 |
| U8 Engineering data reaches the point of use | Engineering data from the system of record reaches a viewer, a headset or a kiosk at the point of use with its structure, units and metadata, without hand preparation | 21 | 30 | 3 / 1, plus `render.remote` recorded descriptively |
| U9 A live event reaches remote viewers as captured | A live event or a remote person is captured and presented elsewhere as it happens, volumetrically or as panoramic video, with sound placed where the source is | 7 | 11 | 3 / 1 |

## What each lane would change

**U7 is the strongest case.** `persist.activity-record` (adopted from this branch on 2026-10-20 and
rated *should*) sits under 10 repository use cases and 132 deployments, and no scored system provides
it natively (0 of 8). Training is the largest body of real deployments in the repository. A training
result that cannot leave the vendor's dashboard is a use case that fails, which is the map's
definition of *must*. With it come `identity.privacy` and `sense.privacy`: the record carries
personal and sometimes biometric data (VW-UC-0280 records vital signs).

**U6 makes four sensing and positioning rows *must*.** `sense.object-track` alone sits under 28
deployments with one native provider of 18. `geo.vps` and `geo.map-align` are what lets a second
device find content a first one placed (VW-UC-0311, from ETSI GS ARF 003, and the factory inspection
of VW-UC-0313).

**U5 makes `net.live-data` *must*.** It was proposed as *must* from this branch and adopted as
*should*. The map's U1 to U4 do not need it, which is why it rates *should* there. Under a twin use case
nothing works without it (VW-UC-0021, 0246 where a real crane controller drives the simulation,
0249 coupling real controllers to machine models). One native provider of 15 scored.

**U8 gathers rows already *must* under U1** (parametric geometry, units, material exchange) but
adds the engineering point of use, where `scene.metadata` (structure and PLM attributes) is what the
use case is for. `render.remote` is listed as the map records it, descriptively: six repository use
cases depend on it (from ETSI GS ARF 003 and the Hololight, mixpace and instant3Dhub deployments),
which may be worth a second look at the 2026-09-18 decision not to rate it.

**U9 is the smallest**, and mostly restates U1's captured-content rows for live delivery. Its one new
claim is `net.media` as *must*: 22 deployments, two native of 29.

## How to use it

1. Read `lane-candidates.csv`. One row per lane and capability, with the map's rating, the lane's
   proposed role, the repository's use cases and deployments for the row, and the map's native and
   scored counts.
2. Each lane's use cases are listed in `lane_ucr_use_cases`, with links to the records in
   `links.csv`. Reading three or four of them is the quickest way to judge a lane.
3. If a lane is accepted, its rows' conformance sentences and test ideas would be written the way
   `CERTIFICATION-LANES.md` writes them. That is the maintainer's work and is not attempted here.

## Licence

CC0 1.0, as the rest of this folder.
