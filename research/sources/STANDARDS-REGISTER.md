---
type: report
title: "Standards register and disposition of the 2025 gap list"
status: complete
created: 2026-09-11T01:01:26Z
project: msf-wg-tool
created_by: the maintainers
---

# Standards register

Prepared 2026-09-11. This replaces the **currency claims**, not the historical record, in the two standards documents dated 2025-10-31. Each row identifies the date on which its source was checked. Those dates are not a claim of a fresh September 11 standards census.

The retained evidence is the August 20 freshness report (not published), qualified by [VERIFIED-CORRECTIONS.md](VERIFIED-CORRECTIONS.md) and the accepted September 9 primary-source register (not published). The latter distinguishes normative text, drafts, catalog metadata and unread paid text. It takes precedence where the older report overreached, notably for C2PA, IEEE 2874 and VC companions. Source-scope tracing does not set Map scores.

| Subject | Version, status and date supported by retained evidence | Checked | Correction to the 2025 document / primary source |
|---|---|---|---|
| glTF | 2.0.1 specification, document dated 2021-10-11; registry identifies 2.0. Draft 2.1 is separate. | 2026-09-09 | Core status is usable. Audit extension status individually; do not inherit the old “ratified” list or an extension count. [Khronos registry](https://registry.khronos.org/glTF/) |
| OpenXR | 1.1; all-extensions build read as 1.1.63. Core 1.1 ratified 2024-04-15; patch build is not a new core edition. | 2026-09-09 | Update patch context; an extension in the build is not necessarily core, ratified, or implemented by a runtime. [Specification](https://registry.khronos.org/OpenXR/specs/1.1/html/xrspec.html) |
| WebGPU | Candidate Recommendation Draft, 2026-09-01. | 2026-09-09 | The old Working Draft label is wrong; final Recommendation is also wrong. [W3C publication](https://www.w3.org/TR/webgpu/) |
| WebXR | Device API Candidate Recommendation Draft, 2026-06-09; module maturity varies. | 2026-09-09 | Update draft date; keep browser support separate from specification status. [W3C publication](https://www.w3.org/TR/webxr/) |
| DID | DID Core 1.0 Recommendation, 2022-07-19. The August report separately records 1.1 and Resolution candidate snapshots. | 2026-09-09 (Core); 2026-08-20 (successors) | Core is usable with method-specific limits; do not call the successor drafts final. [DID Core](https://www.w3.org/TR/did/) |
| Verifiable Credentials | Data Model 2.0 Recommendation, 2025-05-15. Bitstring Status List is also a Recommendation; JSON Schema remains CR Draft in the September read. | 2026-09-09 | The implementation-phase label is wrong. Do not promote every companion to Recommendation. [VC 2.0](https://www.w3.org/TR/vc-data-model-2.0/), [JSON Schema](https://www.w3.org/TR/vc-json-schema/) |
| Web of Things | Architecture 1.1 and Thing Description 1.1 Recommendations, 2023-12-05; TD 2.0 FPWD, 2025-11-04. | 2026-08-20 | Keep the 1.1 claim; separate the TD draft from an assumed complete “WoT 2.0” suite. [Architecture](https://www.w3.org/TR/wot-architecture11/), [TD](https://www.w3.org/TR/wot-thing-description11/) |
| GeoPose | 1.0.0, approved OGC Implementation Standard 21-056r11; approved 2022-06-20, published 2023-09-08. | 2026-09-09 | “Draft, seeking uplift” is wrong. Publication and approval are different dates. [Normative document](https://docs.ogc.org/is/21-056r11/21-056r11.html) |
| 3D Tiles | 1.1 OGC Community Standard 22-025r4; approved 2022-12-17, published 2023-01-12. | 2026-09-09 | January 2025 adoption and “URL TBD” are wrong. The August report's 2.0 work is development, not this approved edition. [Normative document](https://docs.ogc.org/cs/22-025r4/22-025r4.html) |
| I3S | OGC 1.3, 17-014r9; approved 2022-12-12, published 2023-01-11. | 2026-08-20 | Add the version. OGC editions and Esri community/profile versions are distinct. [Normative document](https://docs.ogc.org/cs/17-014r9/17-014r9.html) |
| CityGML | 3.0 conceptual model: approved 2021-06-04, published 2021-09-13. GML encoding: approved 2023-05-10, published 2023-06-20. | 2026-08-20 | Both parts are adopted; I3S and 3D Tiles are not thereby CityGML encodings. [Part 1](https://docs.ogc.org/is/20-010/20-010.html), [Part 2](https://docs.ogc.org/is/21-006r2/21-006r2.html) |
| SensorThings | Sensing 1.1: approved 2020-11-26, published 2021-08-04. WebSub extension 1.0: approved 2026-03-05, published 2026-05-04. | 2026-08-20 | Keep 1.1, add the separately published extension; the retained 2.0 vote outcome is unverified. [Sensing](https://docs.ogc.org/is/18-088/18-088.html), [WebSub](https://docs.ogc.org/is/24-032r1/24-032r1.html) |
| IEEE 2888 family | 2888.1-2023 published 2024-01-08; 2888.3-2024 published 2025-01-30; 2888.5-2024 published 2024-10-01. | 2026-08-20 | Correct the .1 designation/date and .3 publication-vs-approval label. Physiological evaluation is P2888.5a, not the published .5 title. PAR approval is not publication. [IEEE .1](https://standards.ieee.org/ieee/2888.1/7676/), [.3](https://standards.ieee.org/ieee/2888.3/10470/), [.5](https://standards.ieee.org/ieee/2888.5/10787/) |
| IEEE 2874 | 2874-2025 board approval, 2025-05-28; September catalog carries active/approved-draft metadata. | 2026-09-09 | “D3.1, uncertain timeline” omits approval. Publication date and the approved normative body remain unverified/unread; do not infer their detailed behavior. [Catalog](https://standards.ieee.org/ieee/2874/11717/), [approval record](https://standards.ieee.org/about/sasb/sba/28may2025/) |
| VRM | VRMC_vrm 1.0; release date 2022-09-22 retained from August; 1.0 normative sections reread September. | 2026-09-09 | “0.x” is wrong. VRM and Khronos avatar-extension progress are separate; the old completed-international-standardization claim is unsupported. [Specification](https://github.com/vrm-c/vrm-specification/tree/master/specification/VRMC_vrm-1.0) |
| USD / AOUSD | AOUSD Core 1.0.1 artifact, 2025-12-12. Implementation release numbers are a different axis. | 2026-09-09 | Add the omitted Core specification. Do not turn an announced ISO route or implementation release into ISO publication. [Core text](https://raw.githubusercontent.com/aousd/specifications-public/main/core/1.0.1/core_spec.md) |
| C2PA | Technical Specification 2.4, April 2026. | 2026-09-09 | Add provenance context, but withdraw the August report's blanket “no 3D support of any kind”: absence of a named 3D embedding profile does not erase general mechanisms. No 3D-specific soft-binding or implementation support was proven. [Specification](https://spec.c2pa.org/specifications/specifications/2.4/specs/C2PA_Specification.html) |
| MSF deliverables | WoW whitepaper dated 2026-03-31; Sneeze announcement 2026-06-15; domain-group consolidation observed August. | 2026-08-20 | The old group list needs updating. Publishing code, whitepapers and API proposals does **not** establish that MSF is a normative standards body. Membership and officer counts are omitted here. [Domain groups](https://metaverse-standards.org/domain-groups/), [WoW paper](https://webofworlds.github.io/initial_MSF_Whitepaper) |
| OMA3 / IWPS | Historical v0.3 draft, last substantive PDF replacement 2025-06-13; current mutable repository text read September. | 2026-09-09 | Keep draft maturity; distinguish a mutable document from a newly proven tagged v0.3 release. Approval/refusal is specified, adaptation sections remain TBD; no implementation test. [Base specification](https://raw.githubusercontent.com/oma3dao/iwps-specification/main/IWPS%20Base%20Specification.md) |

Safe to retain with dates: established core editions such as glTF 2.0, OpenXR 1.1, DID Core 1.0, WoT 1.1 and SensorThings 1.1. Needs updating: omitted editions, separately versioned profiles, extensions and deliverables. Wrong claims to withdraw: GeoPose-as-draft; the 3D Tiles adoption date; VC 2.0's old phase; WebGPU-as-WD; VRM-as-0.x; the named IEEE designation/date/title errors; and unqualified glTF extension ratification. This is a correction list, not an adoption recommendation.

## Disposition of all 17 historical gaps

The old list is a set of 2025 research questions, **not seventeen empty cells in the current Map**. The [current capability export](../../board/territory.json) has 162 capabilities in 14 groups at this check. The accepted boundary implementation (not published) and accepted capability expansion (not published) supersede the early overlay. No old gap warrants a new capability merely because its title differs.

The mapping below names questions, not support levels. Current scope reports (not published) and the September proposal review (not published) qualify the sources. The [lab overlap table](STACK-OVERLAP.md) separates retained implementation receipts from documented scope.

| 2025 gap | Existing Map questions | Disposition and boundary |
|---|---|---|
| GAP-1 Federated presence | `net.presence`, `net.discovery`, `identity.social` | Retain cross-operator presence as a question. Local rosters and same-machine lab presence do not close it. |
| GAP-2 Asset ownership and transfer | `identity.credential`, `identity.rights`, `persist.inventory`, `net.handoff` | Separate ownership evidence, transfer, destination use and enforcement. No whole transfer system is accepted from their overlap. |
| GAP-3 Spatial identity and permissions | `identity.root`, `identity.exchange`, `identity.capability`, `avatar.identity` | Existing DID/VC/UM evidence reaches distinct parts. Do not call the whole area empty or infer interoperable destination policy. |
| GAP-4 Spatial audio | `audio.source`, `audio.spatial`, `audio.room`, `audio.occlusion` | Withdraw blanket absence. X3D and MPEG audio supply standards evidence; distinguish scene description from renderer/codec and current paid text from retained draft text. |
| GAP-5 Cross-world portaling | `net.address`, `net.session`, `net.handoff` | Existing WoW/IWPS/UM and lab evidence is partial and scoped. A local extension-assisted crossing is not whole-standard interoperability. |
| GAP-6 Avatar animation and behavior | `scene.animation`, `avatar.skeleton`, `avatar.retarget`, `logic.behaviour` | Existing X3D/H-Anim, VRM and glTF evidence supersedes blanket absence. Exchange, retargeting and execution remain separate. |
| GAP-7 Physics | `physics.rigid`, `physics.collision`, `physics.joint`, `physics.determinism` | Withdraw “no standard” and the failed glTF ratification forecast. X3D rigid-body definitions are existing standards evidence; equal simulation outcomes are another claim. |
| GAP-8 Procedural assets | `scene.geometry`, `render.material`, `logic.behaviour` | These cover adjacent results/execution, not a universal procedural recipe. Keep the residual distinction for the existing proposal process; no new row here. |
| GAP-9 Digital-twin state synchronization | `net.replication`, `net.time`, `persist.world` | X3D DIS contradicts blanket absence of standardized state sharing. It does not prove arbitrary digital-twin semantics agree. |
| GAP-10 Metaverse URI scheme | `net.address`, `net.discovery` | Existing HTTP(S)-based approaches make “needs a new scheme” an unproven requirement. Address syntax, resolution and navigation semantics differ. |
| GAP-11 Wearables | `avatar.wearable`, `avatar.skeleton`, `scene.licence` | Existing format/attachment evidence; fit, behavior and destination acceptance are not guaranteed by a wearable field. |
| GAP-12 Licensing metadata | `scene.licence`, `identity.rights`, `scene.provenance` | Metadata already exists. Keep enforcement and provenance separate; retract the empty-metadata claim. |
| GAP-13 Asset versioning | `deliver.version`, `persist.content-addr` | Existing revision/addressing mechanisms; no universal live-update or compatibility guarantee. Proposed dependency inventories remain distinct. |
| GAP-14 Accessibility | `persist.prefs`, `input.devcaps`, `render.text` (adjacent) | Partial questions only. These are not a complete accessibility contract. No new umbrella capability or closed-gap claim. |
| GAP-15 Carbon accounting | No dedicated capability | Retain outside the present Map comparison; IEEE project authorization alone does not supply a published accounting method. |
| GAP-16 Biometric integration | `input.eye`, `input.face`, `identity.privacy` (adjacent) | Tracking and disclosure do not constitute physiological evaluation. Leave that residual scope to an explicit product decision. |
| GAP-17 Sensory standards | `input.haptic`, `audio.spatial` (partial) | Existing haptic/audio questions do not cover every sense. Do not label the entire area empty or add a multisensory umbrella. |

**Overlay decision:** use the current atlas/matrix questions and their evidence drawers; retain this table as the historical crosswalk. No separate 17-gap overlay, renderer rebuild, score change or automatic proposal acceptance is warranted. The seven parked rows in [ROADMAP.md](../model/ROADMAP.md) stay parked. Recommendations in later source reviews remain recommendations until their existing acceptance process admits them.

Next step: cite the dated row and current capability evidence for a statement; send any genuinely different capability through the existing proposal process.
