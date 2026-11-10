---
type: roadmap
title: The map's roadmap after meeting 2 — now, next, and later behind an approval gate
status: active
created: 2026-09-04T21:10:30Z
project: msf-wg-tool
source: infrastructure-wg/meetings/2026-09-04-meeting-notes.md (F1 to F12) and the chair's notes
---

# Roadmap

Three lanes. **Now** runs without another decision. **Next** needs one small decision each. **Later** is hard or long work; each item stays behind an approval gate with the gate's category and the evidence that it is real, and becomes a task only on approval. Everything on the map's future is on this page; nothing is recorded anywhere else.

## Now — this week, no decision needed

| Id | Item | From | Scope | Done when |
|---|---|---|---|---|
| R1 | Search box on every page | F1 | Type-ahead over capability names and definitions, subject names, group names; Enter jumps to the row, card or subject and highlights it; keyboard reachable; no library | Alfred's "transport protocol" query lands on Transport protocol in one keystroke sequence on all three pages |
| R2 | Plain labels: "Gaps — no system has it"; a terminology pass on every label, chip, eyebrow and legend key against plain meaning and the Forum's words | F3, F12 | Labels only; explanations follow the new words; the register is consulted for every changed term | A member who did not hear the talk reads every control without the explanation |
| R3 | Coverage metric on the header line | F7 | "Covered: N% built in · M% with extensions · P% with partial", with a selector for which subjects count: production only (status shipping, ratified, board-approved, mixed) or every subject switched on; one sentence under the number defining it; the same numbers on the atlas top level | The three percentages equal their queries under both selector positions |
| R4 | Comment button | F2 | A "Comment on this map" button that opens a prefilled email to the maintainer with the page and current location in the subject; a line saying comments are folded in every two weeks | Members can send a comment from any page in one click |
| R5 | Forum overlap routes on the atlas | F10 | Three named routes: "Web of Worlds with and without RP1", "Portals and handoff across the Forum's projects" (Inter-World Portaling System, Web of Worlds, RP1 Spatial Fabric, TeleportXR on Session handoff and portals and World addressing), "TeleportXR, alone and beside the standards" | Each route lands with the right subjects on and the right rows in view |
| R6 | "Layers" entry and layers-only view | F8 | A "Layers" link on every page to the atlas top level; on the atlas, a switch that hides the shores and shows the twelve regions alone | A newcomer reaches a twelve-box picture in one click from anywhere |
| R7 | Fortnightly maintenance pass | F2 | A standing rule: every two weeks, read the comments received, fold accepted changes into the data, rebuild, republish, and post the change list on the page | First pass 2026-09-18 before the meeting |

## Next — one decision each, then it runs

| Id | Item | From | The decision | Recommendation |
|---|---|---|---|---|
| N1 | DONE 2026-09-04 (deploy fa188a11). The atlas as the landing page at /msf/map/, matrix and C4 as modes behind it; retire /msf/map/c4/ with a redirect | F8, and the open C4 choice | Which of the three C4 designs survives | Done as recommended: the atlas lands at /msf/map/; the matrix is one click away at /msf/map/matrix/; C4-in-page is the matrix's diagram mode at /msf/map/matrix/#mode=c4; /msf/map/c4/ returns 301 to /msf/map/; the map as it stood on 2026-09-04 is frozen at /msf/map/v1/ |
| N2 | Public comment list | F2 | Where comments live so everyone sees them: a public repository's issues, or a form and list served by the site itself (needs a store and a mail path on the hosting account), or email only for now | Email only now (R4); revisit after the first fortnightly pass shows the volume |
| N3 | Payments, entitlements and trust as capabilities | F11 | Scope expansion: about four new rows (machine and agent payments, entitlement and licence checks, payment identity binding, trust registries) scored across 35 subjects, one to two days of sourced research | Yes, after the 2026-09-14 X402 session so the rows use the Forum's own framing |
| N4 | Unreal Engine 6 statement | notes, "one thing said in the room" | Update the register with newer evidence, or send the chair a one-line correction | Send the correction unless newer evidence exists |

## Later — hard or long, behind an approval gate

Each item stays here until it is approved. Gate category and evidence are stated so the gate is real, not ceremony.

| Id | Item | From | Size | Gate category | Current evidence the gate is real |
|---|---|---|---|---|---|
| L1 | Interoperability boundaries: a "must interoperate" flag per capability with its reason, derived from three or four lightweight use cases (move content between platforms; an avatar and its equipped items readable everywhere; AI movement solvers) | F5 | M, days | Scope and strategy: decides what the Forum tests and what it leaves alone; the working group should see the list | Grig 00:35:04: "defining those boundaries would help define where the tests are" — no boundary list exists in the data |
| L2 | Test framework design: two levels (functional per capability; pairwise interoperation), pass/fail definitions that a person cannot ignore, automated versus human, web runtimes first (GPU, CPU, time to first paint) | F5 | L, weeks | Scope and cost: multi-week effort with working-group participation | Don 00:22:53, Alfred 00:36:29; nothing exists yet; depends on L1 |
| L3 | Test results linked into the map: each cell can carry a result and a date; nightly runs | F5 | L, weeks | Depends on L2; needs a place to run tests | Don 00:20:36 |
| L4 | Per-subject scope tracing: every one of the 57 subjects traced to its full published scope so the capability list is complete and more gaps surface | F4 | L, days to weeks of research | Cost: the first pass was "about a week's worth of research" (Grig 00:18:34) | 6,882 claims today across 162 capabilities; the capability list has not been derived from the subjects' own scopes |
| L5 | Swappability and a stack advisor: which parts can be swapped and why; suggest a stack for a stated need | F6 | M to L | Data model change plus a new view; product judgement on recommendations | Grig 00:21:03; no attribute for this exists |
| L6 | OMB performance evidence: benchmarks for multi-layer rendering from many network locations against today's browsers | F9 | L | External dependency: OMB team, hardware, agreed method | Grig 00:28:27; the map records features, not speed |
| L7 | Certification concept note: levels from open-source-as-standard, through conformance tests, to a certification body and third-party labs; tests first, certification follows | F5 | S, one note | Low; kept behind the gate only because it is not map work | Alfred 00:33:48–00:39:13, Don 00:40:23 |
| L8 | OMB roadmap view: scope of work, versions, release candidates on a timeline | F9 | M | External dependency: the OMB team's own plan | Grig 00:25:36 |

Each Later item starts once it is approved.


## Answers, 2026-09-04T21:42:57Z
- Addresses: today's map is frozen at /msf/map/v1/; the atlas becomes the landing page; the matrix stays one click away at /msf/map/matrix/; the separate C4 page redirects.
- N1 approved as recommended. N2: no email; a public GitHub repository whose issues show every submission, on the PeerMesh pattern (the organisation is the maintainer's call). N3 approved, after 2026-09-14. N4: the maintainer is right that a first game is announced for version 6 (Rocket League, 2026-05-24); the register gains that fact with its dates; nothing runs on version 6 yet. N5 withdrawn.
- L1 now. L4 after breadth: a breadth pass first, then depth. L7 reframed: no official certification; certification lanes built slowly, tests to follow. Tests in general: one obvious example defines the pilot test set; the maintainers' choice, avatar portability, to be confirmed.
- All of these were written up and held, then started one at a time.

## Answers, 2026-09-04T23:06:02Z
- Submissions: the organisation exists, https://github.com/openspatials/spatial-systems-atlas ; the comment button floats bottom right, a modal files the issue itself (title and body required, email optional and never published), the modal then points to the submission; the email link on the C4 page is replaced in that same update, not before.
- Pilot: avatar portability confirmed.
- Breadth batch 1 replaced by the maintainer's list: AR support (Apple, Google, Niantic), Open AR Cloud, Verse and Fortnite with its editor, world models (NVIDIA Cosmos, World Labs Marble, Tencent Hunyuan World 2.0), volumetric capture (MPEG V3C/MIV, 4D Gaussian splatting and splat formats); new kinds and chip groups; research passes may propose new capabilities. The earlier list becomes batch 2.

## Capability proposals from breadth batch 1, 2026-09-06T13:52:39Z
38 distinct proposals. Recommendation: take 28 (a Generation & capture group of 17, a World sensing group of 4, seven rows in existing groups), park 7 (capture.sensor-stream, capture.gen-job, render.scalability, scene.localisation, logic.transaction, logic.concurrency, logic.typecheck), fold persist.entitlement into the commerce research task. A separate change carries the exact list and the merges, on the maintainer's go. Parked rows stay here for a later pass.
