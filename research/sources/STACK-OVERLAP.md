---
type: report
title: "Engine parts and stack overlap: retained lab receipts and current Map questions"
status: complete
created: 2026-09-11T01:01:26Z
project: msf-wg-tool
created_by: the maintainers
---

# Engine parts and stack overlap

Prepared 2026-09-11. The early engine-plane request's stop-early test is met: Open Spatial Lab retains a real combination attempt and its failure checks. This table extracts that evidence and relates it to the current Map. No old toggle interface is rebuilt.

**Evidence grades:** “Retained test” means a saved, bounded test result was inspected; it was not rerun today. “Documented” means a primary-source trace or implementation report, not a runtime test. “Unproven” means the inspected evidence does not establish the connection; it does not mean the capability is absent everywhere. Recorded Map levels are a separate data layer and must keep their confidence and source notes.

## What actually met in the lab

| Stack or standard | Retained combination evidence | Boundary that matters |
|---|---|---|
| Web of Worlds + Three.js + local world servers | **Retained test:** the crossing receipt (an unpublished Open Spatial Lab record) passes 81 checks. It constructs Three.js scenes from two WoW graphs, resolves the local `Portal.destination` extension, carries a newly minted continuity ID across the wire and observes it in destination state. | This is deterministic Node/backend proof, explicitly **no Chrome**. It does not prove pixels, generic WoW conformance or arbitrary third-party interoperability. The receipt has no top-level capture timestamp; no new date is assigned to the run. |
| Continuity and portal claims | **Retained tests:** the same proof's continuity (an unpublished Open Spatial Lab record), claim (an unpublished Open Spatial Lab record), and route (an unpublished Open Spatial Lab record) negatives fail. The positive receipt records no IWPS parameters on the wire and keeps IWPS conformance false. | Matching the sequence or vocabulary of a portal protocol does not implement its wire contract. The broader standards-conformance and native-TeleportXR flags also remain false. |
| Universal Manifest | **Retained tests:** the July 12, 2026 UM matrix receipt (an unpublished Open Spatial Lab record) has 72 fixtures passing each of its two axes. The July 12 HTTP proof (an unpublished Open Spatial Lab record) passes 15 manifest-origin checks. | Fixture coverage and a separately served manifest are bounded evidence. They do not certify every v0.4 implementation or every consent operation during a long-running session. The maintainer’s connection to this subject must remain disclosed when presenting it. |
| RP1 spatial fabric + WoW + UM | **Documented:** the lab integration analysis (unpublished working notes) and RP1 layer (an unpublished Open Spatial Lab record) describe a signed `.msf` subtree and a UM pointer. Engine-signature trust and identity-signature trust stay separate. A named fail-closed verifier covers the lab's boundary model. | No new RP1 verifier run or native RP1 interoperability test occurred here. `SpatialFabricSubtree`, units, up-axis and placement are declared lab extension requirements; mid-session revocation is not proven by a traversal gate. |
| GeoPose | **Retained test:** the July 12 HTTP proof passes ten opt-in Spatial-descriptor checks, including a `geoPose` field. **Documented:** GeoPose 1.0 scope (not published) specifies location/orientation exchange. | Field presence does not test coordinate conversion, Earth anchoring, all conformance classes or the lab's mapping to GeoPose. WoW's recorded `geo.pose` conflict remains visible in the Map. |
| TeleportXR | **Documented:** the September 10 trace (not published) describes its server-owned streaming/session protocol and avatar signaling. | It was **not** embedded or called by the retained OSL attempt; OSL's claim boundary (an unpublished Open Spatial Lab record) is explicit. The current trace remains partial because the indexed avatar-manifest chapter returned 404. Signaling text cannot reconstruct it. |

The July 23 conformance receipt (an unpublished Open Spatial Lab record) records `ok: true` for its declared contract while preserving noncanonical flat-node representation and other divergences. That newer receipt corrects stale prose in the July layer summary; it still does not claim whole-standard conformance. Retained receipt metadata (not published) records the exact hashes and outcomes inspected here.

## The twelve engine parts, at useful granularity

Build/connect below follows the existing capability export. A `connect` label identifies when agreement is needed; it does not assert that any renderer or module is dynamically swappable.

| Original part | Current subquestions and choice time | Overlap and the remaining seam |
|---|---|---|
| 1. Renderer | `render.raster`, `render.gpu-api`, `render.material` — build; `render.lod` — connect | Three.js scope (not published) documents renderers and detail selection. The retained lab test builds a Three.js scene; it does not choose a new renderer on connection or test final pixels. Remote rendered views remain a held proposal. (Superseded on 2026-10-20: `render.remote` is now a row, recorded descriptively.) |
| 2. Scene/world model | `scene.graph`, `scene.transform`, `scene.compose`, `scene.units` — build; `geo.pose`, `geo.crs` — build | WoW records, Three.js objects and RP1 `.msf` subtrees meet through a declared adapter/extension. The nested-versus-flat-node divergence and explicit units/up-axis show where they do not simply match. GeoPose does not perform arbitrary frame resolution. |
| 3. Asset pipeline | `scene.container`, `scene.geometry`, `scene.texture`, `scene.material-x`, `scene.animation` — build; `deliver.cdn` — connect | The retained HTTP proof checks content negotiation across 21 media types. It does not render all 21. Three.js (scope trace, not published), Unreal (scope trace, not published), glTF/VRM and the existing Map separate import, conversion and supported behavior. |
| 4. Physics/simulation | `physics.rigid`, `physics.collision`, `physics.joint` — build; `physics.determinism` — connect | X3D scope (not published) and engine traces document concrete physics surfaces. No combined-physics runtime receipt was inspected in OSL; exchanging parameters does not ensure deterministic outcomes. |
| 5. Logic/scripting | `logic.script`, `logic.behaviour`, `logic.sandbox`, `logic.budget` — build; `logic.namespace` — connect | Verse scope (not published) separates language semantics from Fortnite/UEFN host libraries. Neither that documentation nor OSL's JavaScript proves portable guest code across these stacks. Parked language rows remain parked. |
| 6. Networking/replication | `net.transport`, `net.replication`, `net.session`, `net.handoff`, `net.presence` — connect | OSL proves one local continuity crossing; TeleportXR describes a different live transport. Same-machine presence, a boundary receipt and cross-operator federation are different levels of evidence. |
| 7. Audio | `audio.source`, `audio.room` — build; `audio.stream`, `audio.voice` — connect | Three.js documents positioned sources; TeleportXR documents streamed audio. X3D/MPEG cover standardization questions. No retained combined audio/voice interoperability test is claimed here. |
| 8. Input/device | `input.session`, `input.controller`, `input.hand`, `input.eye`, `input.devcaps` — connect | OpenXR/WebXR and Three.js scope (not published) describe different API/host boundaries. A device capability query does not negotiate arbitrary content, pose conventions or interchangeable engine clients. |
| 9. User interface | `render.text` — build; `input.controller` — connect | Glyph display and input do not define UI layout. `render.ui` is a reviewed proposal, absent from the current export. The old plane's UI question therefore remains explicit without adding a row here. |
| 10. Persistence | `persist.world`, `persist.inventory`, `persist.prefs` — connect; `persist.content-addr` — build | The local crossing observes continuity in destination state; UM describes portable context. Neither proves general database, inventory, progression or preference portability between all platforms. |
| 11. Packaging/distribution | `deliver.bundle`, `deliver.version`, `deliver.conformance` — build; `deliver.cdn` — connect | Format loaders, signed fabric files and manifest publication meet at retrieval boundaries. Valid signatures, successful packaging and a test suite answer different questions. |
| 12. Editor/authoring | `capture.edit`, `scene.compose` — build; other editor ergonomics outside present comparison | Unity (scope trace, not published), Unreal (scope trace, not published) and Godot (scope trace, not published) traces add documented depth. Their editor inventories do not establish editor interchange; no new editor umbrella or renderer is required. |

## Verse and the platform boundary

All entries below reuse September 7–10 source traces. “Complete” describes the declared source inventory, not current service availability or product conformance. These platforms were not participants in the retained OSL crossing.

| Subject | Relevant source treatment | Material limit |
|---|---|---|
| Verse (scope trace, not published) | Language book plus published API modules; logic, namespace and persistence questions. | The Map's language-only coverage and the wider host-API trace have different boundaries. Do not silently rescore one as the other. |
| Fortnite Creative / UEFN (scope trace, not published) | Complete selected feature/device inventories; host-specific Verse surface. | Whole-site index remains partial because the global hierarchy request failed. Documentation revision is not a runtime version claim. |
| Roblox (scope trace, not published) | Complete selected Creator Hub, Engine API and Open Cloud inventories. | Internal replication, Luau, OAuth and platform IDs do not establish cross-operator world interoperability. |
| VRChat (scope trace, not published) | Complete selected creator-documentation tree, including Udon, avatars, networking and persistence. | SDK/editor, uploaded world and hosted platform are distinct; persistence by account per world is not general cross-world transfer. |
| Rec Room (scope trace, not published) | Historical creator/Circuits documents and official shutdown/export notices. | Shutdown subject; Studio's full documentation and some archived bodies remain unavailable. Historical capabilities are not running services. |
| Horizon Worlds (scope trace, not published) | Bounded official historical feature-table supplements. | Current documentation/API bodies were unavailable even where HTTP returned 200; complete present scope is not established. |
| Resonite (scope trace, not published) | Complete selected official-domain wiki indexes and direct feature areas. | The publisher identifies missing component documentation. Wiki descriptions, host plugins and portable protocols remain distinct. |

## Current Map comparison

The matrix already compares subjects against detailed capability rows and carries build/connect filters, a must-interoperate lens and diagram mode. The atlas is the current landing page. The accepted boundary result (not published) supplies the implementation receipt; [ROADMAP.md](../model/ROADMAP.md) records the successor direction. The 117-row export was inspected for this crosswalk; the old twelve chips are not the remaining implementation task.

The following small comparison is copied from the current local export, not newly scored. Every populated cell retains its recorded confidence in the accompanying comparison data (not published). Here “no record” means no coverage entry, not “none.” A `native` level can describe one platform's internal mechanism and is not an interoperability certificate.

| Subject | Scene graph | GeoPose | Session handoff | Scripting |
|---|---|---|---|---|
| wow | conflicts / verified | conflicts / verified | partial / verified | none / verified |
| um | no record | none / verified | partial / verified | no record |
| rp1 | native / verified | none / verified | conflicts / verified | native / verified |
| teleportxr | native / verified | none / verified | none / verified | out-of-scope / verified |
| threejs | native / verified | out-of-scope / verified | no record | none / verified |
| geopose | no record | native / verified | no record | no record |
| verse | out-of-scope / verified | out-of-scope / verified | out-of-scope / verified | native / verified |
| fortnite | native / verified | out-of-scope / verified | partial / verified | native / verified |
| roblox | native / verified | out-of-scope / verified | native / verified | native / verified |
| vrchat | native / verified | out-of-scope / reported | conflicts / verified | conflicts / verified |
| recroom | native / verified | out-of-scope / reported | no record | native / verified |
| horizon | native / verified | out-of-scope / verified | conflicts / verified | partial / verified |
| resonite | native / verified | out-of-scope / verified | partial / verified | partial / verified |

**Stop-early disposition:** the overlap table is the delivered artifact for the original engine-plane request. Reuse the current matrix/atlas and accepted detailed source traces. Keep `render.remote`, `render.ui` and every other pending or parked proposal outside the current row set until their existing acceptance process decides otherwise. (Superseded on 2026-10-20: `render.remote` is now a row, recorded descriptively.) No coverage, score, subject, capability, renderer or deployment changed in this work.

Next step: use the table with the current Map's evidence drawers; evaluate any remaining proposal through the existing proposal process.
