---
gas_schema: gas.doc.v1
legacy_document_type: decision-input
type: decision
title: Interoperability boundaries — which of the 175 capabilities must interoperate at all
status: draft for owner review
created: 2026-09-04T21:42:57Z
revised: "2026-09-06T19:27:08Z — WO-msf-wg-tool-20260906-074 applied the owner's answer to question 5: captured content is first-class, so Splat data interchange format, Volumetric video capture and playback, Point cloud encoding, Multi-view plus depth and Time-varying capture are must rows under U1, and every count on this page is re-derived at 40 must, 62 should and 15 none."
revised_previous: 2026-09-06T18:20:00Z — WO-msf-wg-tool-20260906-073 scored the 28 capabilities added on 2026-09-06 and re-derived every count from 117 rows in 14 groups. The 89 rows the owner approved on 2026-09-06 are unchanged, word for word.
project: msf-wg-tool
workstream: infrastructure-wg-map
source_work_order: /Users/grig/work/spatial-computing-research-projects-msf/repo/msf-wg-tool/.dev/ai/workorders/2026-09-04-21-42-57Z-WO-msf-wg-tool-20260904-064-interoperability-boundaries.md
created_by: project steward
source: infrastructure-wg/meetings/2026-09-04-meeting-notes.md (F5) — Don Brutzman on tests 00:19:54–00:24:35 and 00:32:53; Grig Bilham 00:35:04–00:36:29 ("defining those boundaries would help define where the tests are")
updated: 2026-09-11T07:51:29Z
data_basis: 175 capabilities in 15 groups and 66 subjects (2026-10-20). Membership derives from accepted capabilities.csv metadata. Integrated coverage contains 10,659 claims and 2,687 sources; 891 subject-capability pairs remain unscored.
data_basis_2026_09_06: infrastructure-wg/data/territory.db as of 2026-09-06 (46 subjects, 117 capabilities, 4,016 claims, 1,507 sources). The 89 rows were first scored against the database of 2026-09-04T10:03:30Z (35 subjects, 1,749 claims, 1,057 sources); the reach figures on this page have been re-derived against the current database and the two that moved are marked.
project_root: /Users/grig/work/spatial-computing-research-projects-msf/repo/msf-wg-tool
project_code_note: Omitted because the project registry has no uppercase alias; the frontmatter standard directs omission rather than invention.
---

# Interoperability boundaries

The map says who has what. It does not say where two systems have to agree. This page decides that,
once, for all 175 capabilities, so that the test work has a target and the certification lanes have a
scope. It is the first step the meeting asked for, and nothing about tests is settled until it is
agreed.

**Historical decision — 2026-09-06.** The page was written for 89 capabilities and approved by the owner on 2026-09-06. On the same day
the map gained 28 rows and two regions — Generation & capture, World sensing — and those 28 were put
through the same rule, which put none of them on must. **The owner then answered question 5 below:
captured content is first-class.** Five capture rows move up on that answer — Splat data interchange
format, Volumetric video capture and playback, Point cloud encoding, Multi-view plus depth and
Time-varying capture — because each of them is the captured-content twin of a mesh-world row that is
already a must. **The map now holds 40 must rows, 62 should and 15 none.** The content lane grows
from 17 rows to 22, and four of the five arrive already thin: only one system has each of them built
in.

**Current metadata — 2026-09-11.** The 45 approved additions bring the table to 52 must, 87 should and 23 none rows. The prior 117 classifications are unchanged. The new metadata adds 12 must rows across the existing four use cases; it does not establish runtime support or conformance.

The list is a judgement, not a measurement. Every row carries its reason in one sentence so that a
member of the working group can disagree with a row without arguing about the whole page.

## The four use cases the boundaries come from

- **U1 Content moves.** An asset made in one tool loads, renders and behaves in another system with
  no hand fixes.
- **U2 An avatar travels.** A person's avatar, with its equipped items and expressions, is readable
  and drawn by every system it enters.
- **U3 A person travels.** A person moves from one world to another through a portal, keeping
  identity, inventory, preferences and the session's continuity.
- **U4 An agent participates.** A software agent joins a world, acts in it, and pays for what it
  uses.

## The rule

- **must** — at least one use case fails outright unless two independent systems agree on this
  capability.
- **should** — a use case works but degrades noticeably without agreement.
- **none** — the capability is internal to one system; disagreement costs nothing across the
  boundary.

Two working tests were applied so that the rows are consistent with each other. First: does the
artefact or the exchange itself cross the boundary, or does the behaviour stay inside one system? A
rendering method stays inside; a file, a wire protocol or a credential crosses. Second: if two
systems disagree, does the use case stop, or does it finish with visible loss? Stopping is **must**;
finishing worse is **should**. Where the binding is `connect` the row is a live agreement between
two parties and lands on **must** or **should** unless the thing being agreed never leaves one
device.

## The table

The prior 117 rows retain their approved wording, including dated reach observations in their reasons. Those observations are historical context, not current support measurements. The final 45 rows carry the accepted addition metadata.

| Capability | Group | Binding | Value | Use cases | Reason |
|---|---|---|---|---|---|
| Rasterization pipeline `render.raster` | Rendering & presentation | build | none | — | How a system turns geometry into pixels never leaves that system, so two runtimes can draw the same scene by different means and nothing crosses. |
| Graphics interface binding `render.gpu-api` | Rendering & presentation | build | none | — | The graphics interface a runtime targets is a build choice inside one system, and an arriving asset cannot tell the difference. |
| Material model `render.material` | Rendering & presentation | build | should | U1, U2 | An asset that arrives against a different surface model still loads, but the further apart the two models are the more the look drifts. |
| Lighting and global illumination `render.lighting` | Rendering & presentation | build | should | U1 | A moved scene whose lights are read differently is lit wrong rather than lost. |
| Post-processing `render.post` | Rendering & presentation | build | none | — | Effects applied after the main pass are the receiving system's taste and carry nothing across. |
| Level of detail and streaming order `render.lod` | Rendering & presentation | connect | should | U1, U3 | Without an agreed order for what to send first, a large scene still arrives, it just pops and stalls on the way in. |
| Gaussian splatting and radiance fields `render.splat` | Rendering & presentation | build | should | U1 | Only content captured as splats is affected: a system that cannot draw them shows nothing of it, while mesh content is untouched. |
| Volumetric and point cloud `render.volumetric` | Rendering & presentation | build | should | U1 | The same holds for point clouds and volumetric video, which travel in forms few systems read. |
| Text rendering `render.text` | Rendering & presentation | build | should | U1, U2 | Labels, signs and name tags lose their font and layout when the two systems disagree, so the text degrades while the rest of the asset is fine. |
| Camera and viewpoint model `render.camera` | Rendering & presentation | build | should | U1, U3 | Authored viewpoints are part of a scene, and losing them costs the arrival shot, not the scene. |
| Passthrough and environment blending `render.passthrough` | Rendering & presentation | build | none | — | How much of the real room a runtime lets through is its own presentation, and an arriving asset cannot tell the difference. |
| Scene graph model `scene.graph` | Scene & assets | build | must | U1, U2 | If the receiving system cannot rebuild the same tree, parenting and transforms collapse and the asset does not assemble at all. |
| Transforms and coordinate convention `scene.transform` | Scene & assets | build | must | U1, U2 | A disagreement about handedness or axis order puts every object in the wrong place or mirrored, which is the classic hand fix. |
| Asset container format `scene.container` | Scene & assets | build | must | U1, U2 | The file is the boundary: if the second system cannot open it, nothing else on this list matters. |
| Geometry encoding `scene.geometry` | Scene & assets | build | must | U1, U2 | A mesh encoded in a way the receiver cannot decode is not a mesh, and the compression choice is where this usually breaks. |
| Texture encoding `scene.texture` | Scene & assets | build | must | U1, U2 | Device-specific texture compression is the common failure: the model arrives untextured and someone must re-export it. |
| Material exchange `scene.material-x` | Scene & assets | build | must | U1, U2 | Carrying materials without loss is what "renders in another system" means, and only two subjects reach this row natively today. |
| Animation encoding `scene.animation` | Scene & assets | build | must | U1, U2 | A clip that cannot be read leaves the object still, and an avatar that cannot move is not an avatar. |
| Skeleton and rig definition `scene.skeleton` | Scene & assets | build | must | U1, U2 | The bone hierarchy is what makes a body move correctly elsewhere; without an agreed one, motion has nothing to bind to. |
| Morph targets and blend shapes `scene.morph` | Scene & assets | build | should | U1, U2 | Blend shapes carry facial detail, so losing them freezes a face rather than stopping the transfer. |
| Instancing `scene.instancing` | Scene & assets | build | should | U1 | A scene without agreed instancing still loads, it just costs far more memory and frames. |
| Scene composition and overrides `scene.compose` | Scene & assets | build | should | U1 | Layered references are a working convenience, and flattening on export is the fallback that keeps the asset moving. |
| Units and scale `scene.units` | Scene & assets | build | must | U1, U2 | A metre read as a centimetre makes the asset useless on arrival, and rescaling by hand is the fix the use case forbids. |
| Rights and licence metadata `scene.licence` | Scene & assets | build | must | U1, U3, U4 | An item that arrives with no readable terms cannot be lawfully worn, shown or sold, so the move fails at the rights boundary even when every byte arrives. |
| Provenance and authorship `scene.provenance` | Scene & assets | build | should | U1, U3 | A signed record of who made an asset lets a receiver trust it; without one the asset still works but nobody can check its history. |
| Navigable space and arrival points `scene.navmesh` | Scene & assets | build | should | U1, U3 | A place that arrives without its walkable surface and arrival points still loads, but whoever opens it has to work out where a body may stand and where a portal lands. |
| Avatar body format `avatar.body` | Avatars | build | must | U2, U3 | The portable description of the body is the artefact this use case moves; with no agreement the person arrives as nothing. |
| Avatar skeleton standard `avatar.skeleton` | Avatars | build | must | U2 | Agreed bone names are what let animation authored anywhere play on the arriving body. |
| Facial expression standard `avatar.expression` | Avatars | build | must | U2 | The use case names expressions, and named shapes the destination does not know leave a blank face. |
| Animation retargeting `avatar.retarget` | Avatars | connect | should | U2 | Retargeting is the repair when skeletons differ, so its absence costs motion quality rather than the visit. |
| Attachments and wearables `avatar.wearable` | Avatars | build | must | U2, U3 | Equipped items are named in the use case, and attachment points that do not survive leave items on the floor or on the wrong bone. |
| Avatar level of detail `avatar.lod` | Avatars | connect | should | U2 | Reduced forms matter for crowds and weak devices, and their absence costs frames, not presence. |
| Avatar to identity binding `avatar.identity` | Avatars | connect | must | U2, U3, U4 | Without a way to bind an avatar to a verifiable identity, the person who arrives cannot be shown to be the person who left. |
| Rigid bodies `physics.rigid` | Physics & simulation | build | should | U1 | Mass and velocity carried across make a moved object behave nearly the same; their absence changes the behaviour without stopping it. |
| Collision shapes `physics.collision` | Physics & simulation | build | should | U1, U3 | Collision shapes travel separately from visible geometry, and losing them means objects pass through each other until the destination builds its own. |
| Joints and constraints `physics.joint` | Physics & simulation | build | should | U1 | Hinges and sliders that do not survive turn an assembly into loose parts, which is a loss of behaviour rather than of the asset. |
| Physics materials `physics.material` | Physics & simulation | build | none | — | Friction and restitution numbers mean different things to different solvers, so agreeing on them buys little and each world may keep its own feel. |
| Deterministic simulation `physics.determinism` | Physics & simulation | connect | should | U1, U3 | Two engines producing the same trajectory would let one object be simulated in two places at once, and nothing does that today. |
| Soft bodies and cloth `physics.soft` | Physics & simulation | build | should | U1, U2 | Cloth and hair are the visible part, so a moved avatar arrives stiff rather than absent. |
| Trigger volumes `physics.trigger` | Physics & simulation | build | should | U1 | Regions that fire events are part of how content behaves, and their loss makes the content inert rather than unreadable. |
| Positioned audio sources `audio.source` | Audio | build | should | U1 | Positioned sounds are authored into a scene, and losing them leaves a silent room. |
| Spatialization model `audio.spatial` | Audio | build | none | — | How direction is turned into sound at the ears is the receiving system's method, like a rendering method. |
| Room acoustics and reverb `audio.room` | Audio | build | should | U1 | A space's acoustic description is authored with it, and without agreement the room sounds wrong rather than silent. |
| Occlusion and obstruction `audio.occlusion` | Audio | build | none | — | The receiving runtime works this out from its own geometry, frame by frame. |
| Audio streaming `audio.stream` | Audio | connect | should | U3 | A visitor can be given audio by other means, so disagreement costs quality and scale. |
| Voice transport `audio.voice` | Audio | connect | should | U3, U4 | A visitor who cannot be heard is diminished but still present, and text remains a fallback. |
| State replication `net.replication` | Networking & session | connect | must | U3, U4 | A client or agent that cannot read the destination's state stream arrives blind, which ends both use cases on the spot. |
| Authority and ownership `net.authority` | Networking & session | connect | should | U3, U4 | Disagreement about who owns an arriving object shows up as rubber-banding and contested edits rather than as a failed arrival. |
| Interest management `net.interest` | Networking & session | connect | should | U3 | Without agreement the destination sends everything or too little, which costs scale. |
| Prediction and reconciliation `net.prediction` | Networking & session | connect | should | U3 | Latency hiding is local repair work, so its absence is felt as lag. |
| Transport protocol `net.transport` | Networking & session | connect | must | U3, U4 | With no shared wire protocol there is no session to join at all. |
| Media transport `net.media` | Networking & session | connect | should | U3 | Live audio and video degrade or drop out while the visit continues. |
| Session establishment `net.session` | Networking & session | connect | must | U3, U4 | Joining a running world, authentication included, is the door: no agreement, no entry. |
| Session handoff and portals `net.handoff` | Networking & session | connect | must | U2, U3 | This row is the portal itself, and the travel use case is nothing but the handoff. |
| Presence and roster `net.presence` | Networking & session | connect | should | U2, U3 | A roster that does not cross operators means you cannot see who is where, but you can still be there. |
| World addressing and naming `net.address` | Networking & session | connect | must | U3, U4 | A destination name that does not resolve cannot be travelled to, so naming and resolution are the first agreement. |
| Discovery `net.discovery` | Networking & session | connect | should | U3, U4 | Worlds can be reached by a known address, so discovery adds reach rather than making it possible. |
| Clock and time model `net.time` | Networking & session | connect | should | U3, U4 | A shared clock keeps events in order; without one the ordering drifts and coarse clocks still hold the session together. |
| Identity root `identity.root` | Identity, trust & rights | connect | must | U2, U3, U4 | With no shared base identifier the same person or agent is a stranger in every world they enter. |
| Credential format `identity.credential` | Identity, trust & rights | connect | must | U3, U4 | Claims about age, membership or ownership are worthless if the receiving world cannot read them. |
| Credential exchange protocol `identity.exchange` | Identity, trust & rights | connect | must | U3, U4 | A credential nobody can ask for or present is not a credential, and one subject reaches this row natively today. |
| Capability and permission grant `identity.capability` | Identity, trust & rights | connect | must | U3, U4 | A world that cannot read what an arriving person or agent is allowed to do must either refuse it or trust it blindly. |
| Selective disclosure `identity.privacy` | Identity, trust & rights | connect | should | U3, U4 | Without selective disclosure the traveller over-shares, which is a harm rather than a stop. |
| Reputation and social graph `identity.social` | Identity, trust & rights | connect | should | U3 | Relationships and standing that do not travel leave the person present but unknown. |
| Rights enforcement `identity.rights` | Identity, trust & rights | connect | should | U1, U3, U4 | The terms themselves must cross, and that row is a must; acting on them is the receiver's own behaviour, and no agreed mechanism exists yet. |
| Geospatial pose `geo.pose` | Spatial & geospatial | build | must | U1, U3 | Content pinned to the Earth must land in the same place in the other system, and a pose that cannot be read puts it somewhere else. |
| Coordinate reference systems `geo.crs` | Spatial & geospatial | build | must | U1, U3 | A frame disagreement is measured in metres or kilometres, not in taste. |
| Local anchors `geo.anchor-local` | Spatial & geospatial | connect | none | — | An anchor made on one device never leaves it; the sharing case is the next row. |
| Shared and persistent anchors `geo.anchor-shared` | Spatial & geospatial | connect | must | U1, U3 | Two people in two systems must see the same thing in the same spot, and today one subject reaches this row, through an extension. |
| Visual positioning `geo.vps` | Spatial & geospatial | connect | should | U3 | Recovering pose from imagery can fall back to satellite position and manual alignment, at worse accuracy. |
| Tiled terrain and city streaming `geo.tiles` | Spatial & geospatial | connect | must | U1 | City-scale data is streamed by tile, and a tileset the receiving client cannot stream has to be converted before it is usable. |
| Indoor mapping `geo.indoor` | Spatial & geospatial | build | should | U1, U3 | A structured description of an interior makes placement and routing better; without one both are cruder, and nothing reaches this row today. |
| Map lifecycle and alignment `geo.map-align` | Spatial & geospatial | connect | should | U3 | Two maps of one place with no published transform between them put the same content in two positions, so a person arrives beside where they meant to be. |
| Coverage declaration `geo.coverage` | Spatial & geospatial | connect | should | U3 | A service that never declares where it applies still answers, so a client has to call it and find out instead of testing whether it is relevant. |
| Real-world reconstruction `sense.mesh` | World sensing | connect | should | U1, U3 | A reconstruction that cannot leave the device that made it keeps the room private to one session, so anything placed against it has to be fitted again elsewhere. |
| Semantic labelling of the real world `sense.semantics` | World sensing | connect | should | U1 | Labels each vendor names differently still serve one application, but a second one cannot act on floor or sky without being rewritten for that vendor. |
| Real-world depth `sense.depth` | World sensing | connect | should | U1 | Depth reported in units the receiver does not share puts real surfaces at the wrong distance, so content is placed badly rather than not at all. |
| Real-world occlusion `sense.occlusion` | World sensing | connect | none | — | Whether real surfaces hide virtual content is drawn on the device that sees them, and none of that decision crosses to a second system. |
| Immersive session lifecycle `input.session` | Input & devices | connect | must | U3 | The visitor's app and the device runtime are two independent systems, and if they cannot start an immersive session the visit does not happen. |
| Controller input `input.controller` | Input & devices | connect | should | U3, U4 | A world that reads controllers differently is harder to use, and pointer and text paths remain. |
| Hand tracking `input.hand` | Input & devices | connect | should | U3 | Hand tracking adds a way in, and its absence falls back to controllers. |
| Eye tracking `input.eye` | Input & devices | connect | should | U3 | Gaze is an aid with privacy limits, and everything works without it. |
| Haptics `input.haptic` | Input & devices | connect | should | U3 | Touch feedback is felt when it is missing, and nothing stops. |
| Device capability discovery `input.devcaps` | Input & devices | connect | should | U1, U3 | A world that cannot ask what the arriving device can do will guess, and guessing wrong costs quality rather than entry. |
| Face and body tracking as input `input.face` | Input & devices | connect | should | U2 | A face and body stream in a shape the receiver does not read leaves the avatar still rather than absent, and its privacy terms have to be agreed with it. |
| Scripting runtime `logic.script` | Logic & behaviour | build | none | — | The language a world writes its rules in is its own business and never has to cross. |
| Behaviour graphs and interactivity `logic.behaviour` | Logic & behaviour | build | must | U1, U2 | The use case says the asset must behave, so a door that will not open in the second system is the failure this row names. |
| Sandboxing and isolation `logic.sandbox` | Logic & behaviour | build | should | U1, U4 | A host can sandbox guest content on its own; agreement only makes the limits predictable for the guest. |
| Agent integration `logic.agent` | Logic & behaviour | connect | must | U4 | An agent with no agreed way to perceive and act in a world it did not come from cannot join it at all. |
| Resource budgets `logic.budget` | Logic & behaviour | build | should | U1, U4 | Without agreed limits, guest content and agents are throttled or refused unpredictably. |
| Permanent code identity `logic.namespace` | Logic & behaviour | connect | should | U4 | A published unit of logic whose name resolves to something else elsewhere still runs, but nobody can be sure which code they called. |
| World state persistence `persist.world` | Persistence & storage | connect | should | U3 | What survives a restart is mostly the host's business; it crosses the boundary only when a visitor's changes must last. |
| Inventory `persist.inventory` | Persistence & storage | connect | must | U3 | The use case names inventory, and items that cannot be read at the destination do not travel with the person. |
| Preference portability `persist.prefs` | Persistence & storage | connect | must | U3 | The use case names preferences, and for a person who depends on comfort and accessibility settings, arriving without them ends the visit. |
| Content addressing `persist.content-addr` | Persistence & storage | build | should | U1, U3 | Naming content by hash makes an item the same item everywhere; without it copies drift while still loading. |
| Bundle format `deliver.bundle` | Packaging & delivery | build | should | U1 | A runnable experience moves between hosts far less often than an asset does, and repackaging is the fallback. |
| Content delivery `deliver.cdn` | Packaging & delivery | connect | should | U1, U3 | Assets reach clients over ordinary web delivery, so agreement here buys scale and cost rather than possibility. |
| Versioning and update `deliver.version` | Packaging & delivery | build | must | U1, U2 | A reader that cannot tell which version it holds, or what to do with the parts it does not know, breaks on the first update, which is the "no hand fixes" test again. |
| Conformance testing `deliver.conformance` | Packaging & delivery | build | must | U1, U2, U3, U4 | Every other must row is a claim until a shared test says it holds, which is exactly what the meeting asked for. |
| Content review and safety gating `deliver.moderation` | Packaging & delivery | connect | should | U1, U3 | A receiving world that cannot tell what review arriving content has already had still shows it, and has to repeat the whole review itself. |
| World generation from a prompt or an image `capture.worldgen` | Generation & capture | build | should | U1 | A generated place that arrives only as frames to watch still reaches the viewer, but as a recording rather than a world the receiver can open and use. |
| Simulation from a learned model `capture.sim-learned` | Generation & capture | connect | should | U1 | A world continued by a model still reaches a viewer, but only as what the model chooses to show, so the receiver cannot keep it or run it again. |
| Photogrammetric object capture `capture.photogrammetry` | Generation & capture | build | none | — | How a system turns photographs into a model is its own method, and what leaves is an ordinary asset the container and geometry rows already carry. |
| Splat data interchange format `capture.splat-format` | Generation & capture | build | must | U1 | Captured content is first-class, so this row is what geometry encoding is for a mesh: splat content in a named format the receiving tool cannot read does not arrive at all, and re-exporting it is the hand fix the use case forbids. |
| Captured-scene streaming `capture.stream` | Generation & capture | connect | should | U1, U3 | Without an agreed order for what arrives first, a large capture still loads, it just makes the viewer wait for the whole of it. |
| Volumetric video capture and playback `capture.volumetric-video` | Generation & capture | build | must | U1 | Captured content is first-class, so a volumetric clip is an asset like any other: without the calibration and mask metadata a second implementation needs, what arrives is not the recording and no one can make it one by hand. |
| Point cloud encoding `capture.point-cloud` | Generation & capture | build | must | U1 | Captured content is first-class, so a point cloud encoded in a way the receiver cannot decode is not a point cloud, exactly as an undecodable mesh is not a mesh, and that capture shows nothing. |
| Multi-view plus depth `capture.multiview-depth` | Generation & capture | build | must | U1 | Captured content is first-class, so views that arrive without their intrinsics and extrinsics cannot be reprojected: the capture lands as loose pictures rather than as the place it recorded. |
| Novel view synthesis `capture.novel-view` | Generation & capture | build | none | — | Making an image from a viewpoint no camera occupied is a method inside one system, and what crosses to a second system is the picture it produced. |
| Time-varying capture `capture.4d` | Generation & capture | connect | must | U1 | Captured content is first-class, so a moving capture handed over as unrelated frames is not the capture: the receiver has to guess the rate and the ordering the sender already knew, and guessing is the hand fix the use case forbids. |
| Relighting captured content `capture.relight` | Generation & capture | build | none | — | Whether a captured scene answers the light around it is work the receiving system does, and the asset arrives either way. |
| Editing a capture after the fact `capture.edit` | Generation & capture | build | none | — | Editing a capture happens in the tool that holds it, and what leaves is the edited asset, which the format rows already carry. |
| Generative editing of a world `capture.gen-edit` | Generation & capture | build | none | — | Describing a change to a world you already made is one service's own interface, and the world that results still leaves by the ordinary export rows. |
| Control over what gets generated `capture.gen-control` | Generation & capture | connect | should | U1 | A generator that cannot read the specification another tool wrote still produces a world, it just will not be the world that was asked for. |
| Deriving conventional assets from a generated scene `capture.derived-asset` | Generation & capture | build | should | U1 | Derived meshes and panoramas are how a generated world reaches a conventional engine at all, and each route loses something the receiver has to be told about. |
| Action and control exchange `capture.action-io` | Generation & capture | connect | should | U4 | Actions that arrive without their embodiment, frame and units cannot be replayed elsewhere, so an agent acts only in the system it was written for. |
| Panoramic scene imagery `capture.panorama` | Generation & capture | build | should | U1 | A panorama whose projection is not stated is still an image, but the receiver has to guess before it can use it as a backdrop or as a light. |
| Extension mechanism `deliver.extension` | Packaging & delivery | build | must | U1, U2, U3, U4 | A receiver must distinguish required additions from optional ones or it cannot safely interpret an arriving asset or exchange. |
| Named subsets and levels `deliver.profile` | Packaging & delivery | connect | should | U1, U2, U3, U4 | Named subsets make compatible requirements easier to select, while systems can still agree on the individual requirements without a named profile. |
| Colour space and dynamic range `render.color` | Rendering & presentation | build | should | U1, U2 | Content still arrives when color conventions differ, but its colors and brightness can change visibly. |
| Domain metadata carried with an asset `scene.metadata` | Scene & assets | build | should | U1, U2, U3, U4 | An asset can load without shared descriptive properties, but receivers lose the classifications and facts that drive its use. |
| Assurance and evidence behind a claim `identity.assurance` | Identity, trust & rights | connect | should | U3, U4 | A credential can be presented without shared assurance detail, but the receiver has less evidence for deciding whether to trust it. |
| Claim vocabulary and schema `identity.schema` | Identity, trust & rights | connect | must | U3, U4 | A receiving world cannot use a credential reliably unless it can interpret the claim vocabulary and check its structure. |
| Pairwise identifiers and unlinkability `identity.unlinkable` | Identity, trust & rights | connect | should | U2, U3, U4 | Travel can continue with reusable identifiers, but correlating visits across relationships creates a privacy loss. |
| Preview image for an asset `scene.thumbnail` | Scene & assets | build | should | U1, U2, U3 | A moved asset remains usable without a shared preview image, but selection and arrival previews become slower or less informative. |
| Encryption keys and confidential delivery `identity.encryption` | Identity, trust & rights | connect | should | U3, U4 | Travel and participation can use a shared session without encrypted subject payloads, but lack of agreement prevents confidential subject data from following safely. |
| Key rotation, revocation and recovery `identity.key-lifecycle` | Identity, trust & rights | connect | must | U2, U3, U4 | After identity keys change, a destination must find the applicable verification material to recognize the same person or agent safely. |
| Credential status and revocation `identity.status` | Identity, trust & rights | connect | must | U3, U4 | A destination cannot rely on an issued credential for admission or authority unless the agreed mechanism lets it discover that the credential has been withdrawn. |
| Two-dimensional interface surfaces `render.ui` | Rendering & presentation | build | should | U1, U3, U4 | A scene or visit can continue when interface layouts differ, but carried controls and information may become hard to use. |
| Real-world lighting estimation `sense.lighting` | World sensing | connect | none | — | Estimating illumination for the local view stays within the sensing and rendering system and requires no agreement between the independent worlds in the four use cases. |
| Marker and image tracking `sense.marker` | World sensing | connect | should | U1, U3 | Shared marker references improve physical alignment across systems, while a scene or visit can still proceed with another placement method. |
| Asset reference resolution `deliver.resolve` | Packaging & delivery | connect | must | U1, U2 | An asset with external resources cannot load intact if the receiver cannot resolve its resource references in the intended context. |
| Pose series and live pose streams `geo.trajectory` | Spatial & geospatial | connect | must | U1, U2, U3 | Systems exchanging moving subjects must agree on the time and frame of each pose or the subject's movement cannot be reconstructed correctly. |
| Pointing and selection against content `input.pointing` | Input & devices | connect | none | — | Turning local pointing input into a scene hit stays inside the receiving application and does not require agreement between independent worlds. |
| Text entry `input.text` | Input & devices | connect | none | — | Receiving text through a local input field or keyboard interface is a device-side interaction and need not be shared between worlds. |
| Compositor layers `render.layer` | Rendering & presentation | connect | none | — | The choice of image layers sent to a device compositor is local presentation work and need not be shared across a world boundary. |
| Bounding volumes and spatial index `scene.bounds` | Scene & assets | build | should | U1 | Shared bounds let a receiver select content before loading its geometry; without them the content can still move but loads and traverses less efficiently. |
| Named sets of objects `scene.collection` | Scene & assets | build | should | U1 | Losing agreed object sets weakens grouped scene operations while the individual objects can still be transferred and rendered. |
| Transform constraints `scene.constraint` | Scene & assets | build | should | U1, U2 | A moved object or avatar can still load when constraints are lost, but linked movement and pose behavior degrade. |
| Timed media inside a scene `scene.timed-media` | Scene & assets | build | should | U1 | A scene can transfer without agreed media timing, but its video, sound and coordinated presentation can be lost or drift. |
| Usable physical area `sense.play-space` | World sensing | connect | none | — | Physical play-area bounds and floor references describe one device's surroundings and can remain local while the four cross-system use cases proceed. |
| Sound generated at play time `audio.procedural` | Audio | build | should | U1 | A moved scene remains usable without its agreed synthesis model, but generated sound and its response to changing controls are lost. |
| Content protection signalling `deliver.protection` | Packaging & delivery | connect | must | U1, U3 | A receiver cannot access protected transferred content unless it can identify the protection mechanism required for that content. |
| Linked pose structures `geo.pose-graph` | Spatial & geospatial | build | must | U1, U2, U3 | Without agreed links and transform meaning, receivers cannot reconstruct the same related frames for transferred content or participants. |
| Published zones and spatial events `geo.zone-event` | Spatial & geospatial | connect | should | U1, U3, U4 | Travel and participation can continue without shared zone-event meaning, but spatial notifications and summaries lose useful context. |
| Consent carried with the subject `identity.consent` | Identity, trust & rights | connect | must | U1, U2, U3, U4 | A recipient that cannot interpret the carried permission cannot determine whether the requested use of the subject or data is authorized. |
| Record of what a system decided `identity.receipt` | Identity, trust & rights | connect | should | U3, U4 | A shared evaluation receipt makes cross-system actions auditable, while travel or participation can still occur without that record. |
| Deciding whether to admit an arrival `net.admission` | Networking & session | connect | must | U3, U4 | A traveller or agent cannot safely complete entry unless the origin and destination understand the destination's approval, refusal and validity conditions. |
| General-purpose GPU computation `render.compute` | Rendering & presentation | build | none | — | Choosing and dispatching internal GPU computation does not require agreement between the systems that exchange an asset. |
| Frame pacing and predicted display time `render.frame-timing` | Rendering & presentation | connect | should | U3 | Disagreement between an arriving application and the device runtime about display timing degrades the view through stale poses or poor frame pacing. |
| Portable shader language `render.shader-lang` | Rendering & presentation | build | should | U1, U2 | An asset can still load with fallback materials when its shaders are not understood, but authored appearance degrades. |
| Exact and parametric geometry `scene.parametric` | Scene & assets | build | must | U1 | A receiver that cannot evaluate the transmitted curves and surfaces cannot reconstruct an asset whose geometry is carried in that form. |
| Emitter-based effects `scene.particle` | Scene & assets | build | should | U1, U2 | Losing an exchanged emitter's parameters removes or changes visual effects while the containing asset or avatar can still arrive. |
| Recovering a stripped provenance record `scene.provenance-recovery` | Scene & assets | connect | should | U1, U3 | A stripped provenance record weakens trust in an arriving asset while the asset remains usable. |
| Declarative styling carried apart from the content `scene.style` | Scene & assets | build | should | U1 | Without shared styling rules, a moved scene can still load while its metadata-driven visibility and appearance change. |
| Selectable variants of an asset `scene.variant` | Scene & assets | build | should | U1, U2 | A default asset can arrive when variant selection is lost, but the chosen configuration of the asset or avatar changes. |
| Voxel volumes `scene.voxel` | Scene & assets | build | must | U1 | A receiver that cannot decode the exchanged cells and their properties cannot reconstruct content represented as a voxel volume. |
| Hit test against the real world `sense.hit-test` | World sensing | connect | should | U1, U3 | A disagreement about sensing hit results makes placement and interaction worse, while manual placement can keep the experience usable. |
| Privacy terms on sensed data `sense.privacy` | World sensing | connect | should | U1, U2, U3, U4 | Without shared sensed-data disclosure terms, content, avatars, travellers and agents can still operate but may expose more data than intended. |
| Musical event-device input `input.event-device` | Input & devices | connect | should | U1, U3 | Without an agreed musical-event interface, an arriving performance or interactive experience loses instrument input while other interaction paths remain. |
| Radiance-field reconstruction `capture.radiance-training` | Generation & capture | build | none | — | The fitting method stays inside the capture tool, while the resulting field crosses through the separate representation and format capabilities. |
| Generation of individual 3D objects `capture.objectgen` | Generation & capture | build | none | — | The generation method stays inside one tool, while its placeable output travels through the ordinary asset and representation capabilities. |
| Experience containment `scene.containment` | Scene & assets | build | must | U2, U3 | If two systems disagree on what a contained experience may do, the containment either fails or becomes a security hole; there is no partial agreement that works. |
| Unattended world coupling `net.world-coupling` | Networking & session | connect | must | U3, U4 | A coupling that carries change without anyone crossing needs both ends to agree on authority, ordering and settlement, or the two worlds silently diverge. |
| Machine and agent payments `commerce.payment` | Commerce & payments | connect | must | U4 | The agent use case says an agent pays for what it uses; if payer and payee share no payment exchange, the payment cannot happen at all. |
| Entitlements and licence checks at use `commerce.entitlement` | Commerce & payments | connect | must | U2, U3, U4 | A destination that cannot read a grant must refuse the item, the entry or the agent, or admit it blindly. |
| Receipts and proofs of purchase `commerce.receipt` | Commerce & payments | build | should | U3, U4 | A grant can still be checked with its issuer without a portable receipt, but a third system cannot verify the purchase on its own. |
| Governed trust registries `identity.trust-registry` | Identity, trust & rights | connect | should | U3, U4 | Credentials still verify without a shared registry, but each receiver must decide alone whom to trust, so acceptance differs from world to world. |
| Agent authoring and publishing interface `logic.agent-authoring` | Logic & behaviour | connect | should | U1, U4 | An agent can still build in each platform through that platform's own interface, but without a shared one every agent needs a separate integration for every platform. |
| Taking a whole world out `persist.world-export` | Persistence & storage | build | should | U1 | Assets can still move one at a time, but a place that cannot leave its host as a whole has to be rebuilt by hand when the host changes or closes. |
| Model-based object tracking `sense.object-track` | World sensing | build | should | U1 | The object model arrives from another system, so its format and units must be readable by the tracker, while the tracking itself stays on the device. |
| Remote (split) rendering `render.remote` | Rendering & presentation | connect | none | — | Recorded descriptively by the owner's decision of 2026-09-18: the Atlas records which systems render remotely and does not define an agreement between client and renderer. |
| Live data binding `net.live-data` | Networking & session | connect | should | U1 | A digital twin can still be shown without a shared binding, but each data source must be wired by hand; the Atlas's four use cases do not yet include digital twins, so the row is recorded against content that moves. |
| Activity and learning records `persist.activity-record` | Persistence & storage | connect | should | U3 | Training still finishes without a portable record, but the result stays in one vendor's dashboard instead of travelling with the person. |
| Physiological signals as input `input.physiological` | Input & devices | build | should | U3 | Sensors and experiences come from different vendors; without a shared signal description each adaptation is wired to one device, though the experience still runs without it. |


## Current counts

Of the 175 capabilities in 15 groups (re-derived from `tool/data/capabilities.csv`, on 2026-10-20, after the five rows contributed by the Virtual Dimension Center): **56 must**, **95 should**, **24 none**.

| Group | must | should | none |
|---|---|---|---|
| Rendering & presentation | 0 | 11 | 7 |
| Scene & assets | 13 | 15 | 0 |
| Avatars | 5 | 2 | 0 |
| Physics & simulation | 0 | 6 | 1 |
| Audio | 0 | 5 | 2 |
| Networking & session | 7 | 8 | 0 |
| Identity, trust & rights | 8 | 8 | 0 |
| Commerce & payments | 2 | 1 | 0 |
| Spatial & geospatial | 6 | 5 | 1 |
| World sensing | 0 | 7 | 3 |
| Input & devices | 1 | 8 | 2 |
| Logic & behaviour | 2 | 4 | 1 |
| Persistence & storage | 2 | 4 | 0 |
| Packaging & delivery | 5 | 4 | 0 |
| Generation & capture | 5 | 7 | 7 |
| **All** | **56** | **95** | **24** |

The 88 `connect` rows contain 28 must, 52 should and 8 none rows. The 87 `build` rows contain 28 must, 43 should and 16 none rows.

Must-row memberships are **U1 30**, **U2 27**, **U3 32** and **U4 21**: 110 lane places filled by 56 distinct capabilities. A row can serve more than one use case.

The subject table contains 66 subjects. Final reach, thin-row and lane-coverage measurements depend on accepted scores for the 45 additions. They are not inferred from omitted cells or from the older measurements below.

## Historical counts and reach — 2026-09-06

The following counts and interpretation retain the 117-capability, 46-subject snapshot and the owner decision made that day. They are not measurements of the current 175-capability scope.

Of the 117 capabilities in 14 groups: **40 must**, **62 should**, **15 none**.

| Group | must | should | none |
|---|---|---|---|
| Rendering & presentation | 0 | 7 | 4 |
| Scene & assets | 10 | 5 | 0 |
| Avatars | 5 | 2 | 0 |
| Physics & simulation | 0 | 6 | 1 |
| Audio | 0 | 4 | 2 |
| Networking & session | 5 | 7 | 0 |
| Identity, trust & rights | 4 | 3 | 0 |
| Spatial & geospatial | 4 | 4 | 1 |
| World sensing | 0 | 3 | 1 |
| Input & devices | 1 | 6 | 0 |
| Logic & behaviour | 2 | 3 | 1 |
| Persistence & storage | 2 | 2 | 0 |
| Packaging & delivery | 2 | 3 | 0 |
| Generation & capture | 5 | 7 | 5 |
| **All** | **40** | **62** | **15** |

By binding, the split lands where the rule predicted. Of the 55 `connect` rows, 17 are must, 36 are
should and 2 are none. Of the 62 `build` rows, 23 are must, 26 are should and 13 are none: the
formats that cross a boundary are musts, and the rows about how a system draws or simulates are not.
Generation & capture now reads 5 must, 7 should and 5 none. The five musts are the carriage formats —
splats, volumetric video, point clouds, multi-view plus depth, and the time-varying capture that ties
frames into one recording — and the answer to question 5 is what put them there: a captured asset is
an asset, so a receiver that cannot read the format has nothing, exactly as with a mesh. The seven
shoulds and the five nones are the rows about how a place is made rather than how it travels, and
they did not move. World sensing is three shoulds and one none, and the none is the row where a
device's reading of the room never leaves the device.

Which use cases the must rows serve: 22 must rows for content moving (U1), 19 for the travelling
avatar (U2), 20 for the travelling person (U3) and 12 for the participating agent (U4). A row may
serve more than one, so these do not sum to 40. **One of the four numbers moved on the owner's
answer**: all five new musts serve U1 and nothing else, because a splat capture and a room scan have
no part in an avatar's journey, a portal crossing or an agent's session. So the content lane grows
from 17 rows to 22 and the other three lanes are the bundles they were.

**Must rows that nothing reaches today: 0.** Every must row has at least one subject at `native` or
`via-extension`. Across all 117 rows only two are reached by nothing — Rights enforcement
`identity.rights`, a should, and Relighting captured content `capture.relight`, a none. Indoor
mapping `geo.indoor`, which this page named as the second on that list when it was written against
35 subjects, is now reached through an extension.

**Must rows reached natively by only one subject: 10**, up from six. The six the page already named
are Rights and licence metadata `scene.licence`, Facial expression standard `avatar.expression`,
Attachments and wearables `avatar.wearable`, Credential exchange protocol `identity.exchange`,
Capability and permission grant `identity.capability`, and Preference portability `persist.prefs`.
Four of the five new musts join them — Volumetric video capture and playback
`capture.volumetric-video`, Point cloud encoding `capture.point-cloud`, Multi-view plus depth
`capture.multiview-depth` and Time-varying capture `capture.4d` — and in each of the four the single
system is the same one, MPEG-I V3C. Splat data interchange format `capture.splat-format` is the
exception, with seven systems holding it built in. This page once named a seventh thin row,
Shared and persistent anchors `geo.anchor-shared`, as reached by nothing natively; against the 46
subjects in the database today four systems reach it built in — Apple ARKit and RealityKit, Google
ARCore and Android XR, Niantic Lightship and Open AR Cloud — because the breadth pass of 2026-09-05
added the systems whose whole business that row is.

**Rows on the whole map reached natively by exactly one subject: 18**, up from eight, because ten of
the 28 new rows have a single native claimant. That total did not move on the owner's answer, but its
shape did: **ten of the eighteen are now musts**, not six, because four of the thin rows have been
moved into a certification lane. The other eight are shoulds and nones.


## Historical interpretation — 2026-09-06

Nothing on the must list is untouched: every one of the 40 must rows has at least one subject that
reaches it. That is the good news, and it is thinner than it looks. Ten must rows are reached
natively by a single subject. One further row is in this table because this page named it when it was
written, and the record of what happened to it is worth keeping.

| Must row | The only subject that reaches it natively | What that means |
|---|---|---|
| Rights and licence metadata `scene.licence` | VRM | Licence terms travel with an avatar format and with nothing else; general assets carry no terms. |
| Facial expression standard `avatar.expression` | VRM | One avatar format defines named expressions; a face that leaves it arrives blank. |
| Attachments and wearables `avatar.wearable` | Roblox | The only complete answer is one platform's internal rule, which by definition does not cross a boundary. |
| Credential exchange protocol `identity.exchange` | Roblox | Again a platform's own sign-in, one direction only, not an exchange between peers. |
| Capability and permission grant `identity.capability` | Universal Manifest | A draft standard is the only place permissions are written to be read by a party that did not issue them. |
| Preference portability `persist.prefs` | Roblox | Accessibility settings follow the player inside one platform and stop at its edge. |
| Volumetric video capture and playback `capture.volumetric-video` | MPEG-I V3C | A must since the owner's answer of 2026-09-06. One standard carries volumetric media with the calibration and mask metadata a second implementation needs; two engines reach it only in part. |
| Point cloud encoding `capture.point-cloud` | MPEG-I V3C | The same standard, and here it has company at the next level down: three systems read point clouds through an extension and twelve in part, so this is the least thin of the four. |
| Multi-view plus depth `capture.multiview-depth` | MPEG-I V3C | The thinnest of the four. One standard, no extension anywhere, two partials. A capture that arrives without its intrinsics and extrinsics has nowhere else to be read. |
| Time-varying capture `capture.4d` | MPEG-I V3C | The one `connect` row of the five: what has to be agreed is the rate and the ordering, not a file, and one standard and one extension is the whole of it today. |
| Shared and persistent anchors `geo.anchor-shared` | **no longer thin: four systems, corrected 2026-09-06** | This page said no system reached it natively. Against 46 subjects, Apple ARKit and RealityKit, Google ARCore and Android XR, Niantic Lightship and Open AR Cloud all do, and Unreal Engine still reaches it through an extension. The row was read against 35 subjects; the breadth pass added the systems whose whole business it is. |

Three of those ten are one company's internal mechanism. A must row whose only implementation is
inside a single platform is not interoperable at all; it only looks covered. That is the sharpest
result on this page, and it is the argument for the "Must interoperate" filter: read against the
must rows, the map's coverage number means something different from the number read against all 117.

**Four more of the ten are one standard**, MPEG-I V3C, and that is a different kind of thin from the
platform kind. A standard is written to be implemented by parties that did not write it, so the row
is not closed the way a platform's internal rule is closed; it is simply unimplemented so far, at the
`native` level, by anyone else. That is a better position to be in and it is still one system, and a
test between two implementations cannot be written until there is a second one.

**The owner's answer made the thin list matter more without making it longer.** The 28 rows added on
2026-09-06 brought ten single-system rows onto the map, and at the time every one of them was a
should or a none. Four are now musts. The map still has eighteen thin rows; ten of them are now in a
certification lane rather than six. A thin should is a research finding, and a thin must is a hole in
the stack — the same two lists, with four rows moved from the first to the second.

## How the counts were made

The current classification table and counts derive from `infrastructure-wg/data/capabilities.csv`: 175 rows, with exact `interop`, `interop_uses` and `interop_reason` values. The prior 117 records are preserved; the 45 additions match their accepted metadata. Lane membership is `interop=must` plus the named use case in `interop_uses`.

The SQL below records the earlier reach-measurement method. Current coverage must be derived from the accepted integrated data; this metadata preparation does not refresh those measurements.

The counts below were joined to `coverage` in the database itself; the queries are written against a
`capability_id, value` table because that is how they were first run, and `capability.interop` now
holds the same values. Two definitions were taken from the board's own row rules
(`infrastructure-wg/board/predicates.js`) so that this page and the site cannot disagree:

- **reaches** — a subject claim of `native` or `via-extension`. This is the same test behind
  "No native or extension support recorded".
- **reached natively by only one subject** — exactly one claim at `native`. This is the same test
  behind the map's "thin" filter, where one system alone has a capability built in.

The queries are these, with `interop` holding the values from the table above:

```sql
-- must rows that nothing reaches today
SELECT count(*) FROM (
  SELECT c.id FROM interop i JOIN capability c ON c.id = i.capability_id
  LEFT JOIN coverage cov ON cov.capability_id = c.id
  WHERE i.value = 'must'
  GROUP BY c.id
  HAVING sum(CASE WHEN cov.level IN ('native','via-extension') THEN 1 ELSE 0 END) = 0
     AND sum(CASE WHEN cov.level <> 'out-of-scope' THEN 1 ELSE 0 END) > 0);

-- must rows reached natively by only one subject
SELECT count(*) FROM (
  SELECT c.id FROM interop i JOIN capability c ON c.id = i.capability_id
  LEFT JOIN coverage cov ON cov.capability_id = c.id
  WHERE i.value = 'must'
  GROUP BY c.id
  HAVING sum(CASE WHEN cov.level = 'native' THEN 1 ELSE 0 END) = 1);
```

## What this page does not decide

- It does not say who should write the missing standard, or which existing one should win.
- It does not rank the must rows against each other; that is the certification lanes' work
  (WO-msf-wg-tool-20260904-065).
- It does not define a single test. It defines what is worth testing, which the meeting asked for
  first.
- It does not touch the database, the pages or the coverage metric on its own. Those follow a
  decision, and the answer to question 5 has been carried through all three.

## Historical owner review — 2026-09-06

These questions preserve the earlier scope discussion and the answered captured-content decision. They do not reopen the prior 117 classifications or the 45 approved additions.

The gate is scope and strategy: this list decides what the Forum would test and what it would leave
alone. Four questions where a different answer changes the table. **Question 5 is answered and the
answer is applied**; questions 1 to 4 are open, and question 4 is now half spent, because the reading
it asks about has been overturned for the carriage rows and kept for the two rendering rows.

1. **The rendering group has no must rows.** Ten capabilities about how a system draws are all
   should or none, on the ground that the drawing method stays inside one system while the file that
   crosses is in Scene & assets. If the working group expects "it looks the same in both" to be
   testable, then Material model, Lighting and Text rendering move up to must.
2. **Licence metadata is a must, rights enforcement is a should.** The terms cross the boundary; the
   enforcement is the receiver's own behaviour. The opposite call is defensible and would make the
   rights lane much larger.
3. **Preference portability is a must** because the use case names preferences and because losing
   comfort and accessibility settings can end a visit. Read strictly as "the person still arrives",
   it is a should.
4. **Splats and volumetric content are shoulds.** They fail outright when they fail, but only for
   content captured that way. If the Forum wants captured content to be first-class, both become
   must and the gap list grows.
5. **Is captured content first-class? ANSWERED YES by the owner, 2026-09-06.** The question was
   whether Generation & capture should stay a should-or-none region. It was scored on the reading
   that kept `render.splat` and `render.volumetric` at should: captured content is one class of
   asset, so a receiver that cannot read it loses that class and keeps everything else. The owner's
   answer overturns that reading for the five rows the question named — Splat data interchange
   format, Point cloud encoding, Volumetric video capture and playback, Multi-view plus depth and
   Time-varying capture. Each of them has a mesh-world neighbour that is already a must: an encoding
   a receiver cannot decode is `scene.geometry`, and a clip it cannot read is `scene.animation`.
   **All five are now musts under U1, the content lane holds 22 rows, and four of the five arrived
   thin, as the question said they would.** What the answer did not touch: the two rendering rows
   `render.splat` and `render.volumetric` are still shoulds, because they are about drawing what has
   arrived rather than carrying it, and the twelve other Generation & capture rows are still shoulds
   and nones, because they are about making a place rather than moving one.

Reply with the row ids to change, or with "as it stands", and the column, the filter, the mark and
the third metric selector follow (task 3 of the work order). The five rows of question 5 have been
through that chain already: the column, the mark, the filter, the atlas route and the restricted
metric all carry the answer.

## What the steward expected, and what the rule gave

The order that scored these 28 rows carried an expectation, to be checked and not assumed. Three
parts of it did not survive the rule, and saying so is the point of writing the expectation down.

- **"The sensing rows and the splat, volumetric, point cloud and time-varying rows are must or
  should under U1 and U2."** The rule made them shoulds; the owner's answer of 2026-09-06 has since
  made four of them musts, so the "must or should" half of the expectation is now half right by
  decision rather than by rule. **U2 is still not their use case**, and that is the half the answer
  did not touch. U2 is an avatar travelling with its items and its expressions; a room scan and a
  splat capture have nothing to do with it. All five capture rows serve U1; the streaming row also
  serves U3. Of the sensing rows two
  serve U1, one serves U1 and U3, and **Real-world occlusion `sense.occlusion` is a none**: whether
  a real wall hides a virtual chair is decided and drawn on the device that sees the wall, and the
  rule's own exception for a `connect` row says a decision that never leaves one device crosses no
  boundary.
- **"Generation control, generated editing and generation jobs are none."** Generated editing
  `capture.gen-edit` is a none, as expected. **Control over what gets generated `capture.gen-control`
  is a should**, because it is the one row in that family where something arrives from outside: the
  specification of the world to make can be a reference image, a panorama or uploaded coarse
  geometry, authored in another tool, and a generator that cannot read it builds the wrong world.
  **There is no "generation jobs" row on the map** — no capability of that name exists, and the two
  nearest, World generation from a prompt or an image and Simulation from a learned model, are both
  shoulds because what leaves them is either a world a receiver can keep or frames it can only watch,
  and that difference crosses.
- **"Navigable space and arrival points is a must under U3."** It is a **should under U1 and U3**.
  In world-to-world travel the destination places the arriving person by its own rules, so nothing
  stops when the two ends disagree; the loss is real and it is in U1, where a place arrives as a file
  and whoever opens it has to work out again where a body may stand. The portal row `net.handoff`
  already carries the must that travel depends on.

One expectation held: the splat and captured-media rows are shoulds under U1, which is what the
approved page already said about `render.splat` and `render.volumetric`. Question 5 above was the
place to overturn all of this at once, and the owner has now done so in part. **What survives the
answer:** the use cases. The five rows that moved to must serve U1 and only U1, so the steward's
original expectation that they served U2 as well is still wrong, and the sensing rows, the streaming
row and `sense.occlusion` are all where the rule put them. **What the answer overturned:** the value
on those five rows, and the sentence above that called their shoulds the one expectation that held.
The value changed; the use case did not.
