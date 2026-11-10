---
type: design
title: The atlas — information architecture for the territory map as a C4 model, level by level
status: draft
created: 2026-09-04T13:56:54Z
project: msf-wg-tool
author: the maintainers
data_basis: infrastructure-wg/data/territory.db as of 2026-09-13 (57 subjects, 162 capabilities, 6,882 claims, 1,932 sources, 64 conflicts, 22 unverified claims). Originally written against 35 subjects and the first 89 rows on 2026-09-04T05:42Z; re-derived on 2026-09-06 when the map held 117 rows in 14 groups; all counts on this page re-derived 2026-09-13.
---

# The atlas

The territory map drawn as a C4 model that you walk through like a map: one screen per level, a click to go one level deeper, the same lens (subjects on, filter) carried from level to level, and detail only where you ask for it. This document is the information architecture for the third design. It fixes what each level is for, what is on it, what a click does, what is deliberately left off, and how every number on it is derived. It does not fix pixels.

The third design owns only new files (`infrastructure-wg/board/atlas.html`, `infrastructure-wg/data/build_atlas.py`, the generated `atlas-standalone.html`) and the address `/msf/map/atlas/`. It touches nothing the first two designs own.

---

## 1. The one idea

A map is not a document. A document is read top to bottom; a map is entered anywhere, at the altitude the reader needs, and it answers one question per altitude.

C4 gives four altitudes for one software system: context, containers, components, code. Our system is the **open metaverse stack**: the 162 capabilities an open metaverse needs, in 14 groups. The 57 subjects (standards, projects, engines, web runtimes, platforms, device platforms, protocols, world models, capture techniques and tools) are the systems that reach into it. So:

| C4 altitude | Atlas level | The one question it answers | What you see | A click goes to |
|---|---|---|---|---|
| System context | **L0 Territory** | Where is the standards work, and who is in the room? | 14 regions with their health; 57 subjects on eight shores | a region (L1) or a subject (S) |
| Container | **L1 Region** | Inside this group, which capabilities are settled, thin, empty, or contested? | the group's capabilities as cards, format rows and protocol rows apart | a capability (L2) |
| Component | **L2 Capability** | For this one capability, who reaches it, how far, and who will not interoperate? | the subjects on, banded by level, with connectors | a subject's claim (L3) |
| Code | **L3 Claim** | What exactly is claimed, at what confidence, on what source? | the row: level, confidence, note, quotes, links | back, or the subject's profile (S) |
| (a second axis) | **S Subject** | What does this one system reach across the whole territory? | its row of the matrix folded by group, plus its facts | a capability (L2) with it highlighted |

Where C4 does not fit, the atlas departs from it, and says so:
- C4 draws one product's parts. We draw a territory that 57 products contend for. So every relationship carries a **level**: built in, through an extension, partial, conflicts. Absence is also information and is shown as absence, not omitted.
- C4's "code" is code. Ours is a **claim with a source**. L3 is a reading surface, not a diagram.
- C4 has one system boundary. Ours has two axes: capability-first (L0 to L3) and subject-first (S). Both are first-class doors.

---

## 2. The map's grammar: four fixed parts on every screen

Every level is built from the same four parts, always in the same place, so the reader never re-learns the page.

1. **Wayfinder.** Breadcrumb (Territory › Identity, trust & rights › Credential exchange protocol › Roblox), the level's name, and the counts line the matrix already has ("6,882 claims / 1,932 sources / 64 conflicts / 22 unverified / 57 of 57 subjects shown"), recomputed under the lens.
2. **Lens bar.** The subject section (every display-group heading, every subject chip, group toggles) and the "Show only" row (Everything; Contested; Only one reaches it; Gaps; Recorded conflicts; Protocol rows; Only rows with an entry), with the matrix's exact labels and predicates, plus the mode links Matrix | C4 model | Atlas. The lens persists across levels and reshapes every level. It scrolls away with the page, as the matrix's bar now does.
3. **Stage.** The level's picture. One screen tall at 1440 × 900 with all subjects on; never a wall. Drawn in the board's language: planes, eyebrow labels, cards, curved connectors.
4. **Drawer.** Detail on demand, opening under the stage, never a new page: at L1 a card's row summary, at L2 the claim list, at L3 the full claim. Escape closes it; the stage stays where it was.

Always present: the legend (built in · through an extension · partial · absent · conflicts) and the explanations the page already has (hover or tab), honouring the explanations switch when it exists.

The **address hash** encodes location plus lens, so every screen is a link and the back button works: `#level=region&region=identity` · `#level=capability&cap=identity.exchange` · `#level=claim&cap=identity.exchange&subject=roblox` · `#level=subject&subject=roblox` · plus `&off=<subject ids switched off>&filter=<chip>&entry=1`. The matrix and the C4 page carry the same lens keys, so the mode links keep the lens.

---

## 3. L0 — Territory

**Question:** where is the standards work, and who is in the room?

**Picture.** The stack as fourteen regions, arranged by the board's own logic so the map reads top to bottom the way a person meets a world. Two regions were added on 2026-09-06: **World sensing**, a device reading the real room it is in, which is something a person meets; and **Generation & capture**, making a place or capturing one, which is what a world is made of. Reading a world and making one are different acts, and they sit on different shelves:

```
  what a person meets     [ Input & devices ] [ Rendering & presentation ] [ Audio ] [ World sensing ]
  what a world is made of [ Scene & assets ] [ Avatars ] [ Physics & simulation ] [ Logic & behaviour ] [ Generation & capture ]
  what makes it shared    [ Networking & session ] [ Identity, trust & rights ] [ Spatial & geospatial ] [ Persistence & storage ]
  how it ships            [ Packaging & delivery ]
```

Each region card carries: the group name; its capability count; its **binding tint**: format (settled when content is made) or protocol (agreed when two systems connect), tinted by the majority and labelled "n format · m protocol"; and its **health**, four numbers under the current lens: contested (two or more reach it natively or through an extension), only one reaches it, nothing reaches it, conflicts. A region with a gap carries the matrix's absent style on its edge; a region with a thin row carries the "only one" mark.

The insight L0 must make visible without a click: **the territory has two halves.** 82 capabilities are format questions and 80 are protocol questions, and the split falls along group lines: Scene & assets is 26 of 27 format; Networking & session (13), Identity, trust & rights (15), Input & devices (10) and World sensing (9) are protocol to the last row. Generation & capture straddles it, 14 format and 5 protocol. The protocol half is where interoperability is decided, and the map's "Protocol rows" filter is the view of that half. Draw the tint so the coastline between the halves is the first thing the eye finds.

**Shores.** Around the stack, eight shores, one per display group, in the lens bar's display-group order: MSF standards & projects (6), Standards (20), Device platforms (3), Game engines (3), Web runtimes (4), Platforms (6), World models & capture (6), Capture & generation tools (9). Each shore holds its subjects as chips carrying a reach number (native + extension + partial rows). Shores are not lines: 57 lines to 14 regions is noise. Reach is the number; a click is the line.

**Clicks.** Region → L1. Subject chip on a shore → S. The stack's title → the Groups summary drawer (fourteen rows: name, capabilities, reached by K of the M subjects on).

**Lens effects.** Switching subjects off recomputes every health number and reach; the filter chips do not hide regions (a region is never filtered away) but re-count them: under "Gaps", regions with no gap read "0 of n" and fade.

---

## 4. L1 — Region

**Question:** inside this group, which capabilities are settled, thin, empty, or contested?

**Picture.** Two planes in the board's style.

- **Top plane, eyebrow "CAPABILITIES · <group name>".** One card per capability passing the filter, in the group's sort order, in two bands when the group has both bindings: **format rows** then **protocol rows** (four groups have one band — Networking & session, Identity, trust & rights, Input & devices and World sensing, all protocol; the other ten have two, Generation & capture among them at 14 format and 5 protocol). Each card: name; binding word; the health readout among the subjects on, in the legend's colours: built in n · extension n · partial n · conflicts n · absent n; a flag when it is thin ("only Roblox", naming the one) or a gap ("nothing reaches it"). Out of scope is not counted on the card; the "N of M subjects scored here" line the matrix already draws is the card's footer.
- **Bottom plane, eyebrow "SUBJECTS REACHING THIS GROUP".** One chip per subject switched on that has a native, extension or partial row in the group, in display-group order, each with its reach into this group ("7 of 12").

**No connectors at L1.** With all subjects on, Networking alone would draw more than a hundred curves. Instead: hover or focus a subject chip and its capability cards light while the rest fade; hover a card and its subjects light. The relationship is shown by highlight, not by line.

**Drawer.** Click a card's footer: the row summary (the L2 band counts as a sentence and the list of who is in each band). Click the card body: go to L2.

**The insights L1 must surface, by example, with all subjects on:**
- Identity, trust & rights: fifteen protocol rows. Four rows on the whole map are reached by nothing natively or through an extension. The room should see in one look that the identity stack is where the map is emptiest.
- Generation & capture, the newest region: nineteen rows, five of them must, and the region holds several of the map's 21 thin rows. A region can be busy and empty at once, and this is what that looks like.
- Spatial & geospatial: twelve rows. Shared and persistent anchors is built in by four systems, reached through one extension and partly by several more. The cards must sit side by side so the contrast between well-covered and empty rows is visible.
- Scene & assets: twenty-seven rows (26 format, 1 protocol) and 26 of the 64 conflicts, the densest conflict cluster on the map. Conflicts count on the cards is the tell.
- Physics & simulation: deterministic simulation built in by nobody; partials and one extension.

---

## 5. L2 — Capability

**Question:** for this one capability, who reaches it, how far, and who will not interoperate?

**Picture.** The capability's name, binding word and definition as the plane's eyebrow and lede (the definition is the one sentence the database holds for it; no new prose). Below it, the subjects on, as cards in **level bands** from left to right or top to bottom: built in · through an extension · partial · conflicts · absent; out of scope folded into one count that expands on click. Each card: subject name, kind as a small label, confidence mark (verified or second-hand), and the first sentence of its note.

**Connectors are drawn here and only here.** One curve from the capability to each subject card, in the level's colour, at most 57. This is the altitude where a line per relationship is readable, and where the board's curve style earns its keep. Conflicts are drawn red and, where the note names the other party, bracketed to it with the note's first sentence.

**Drawer.** Click a card: the claim (L3) opens in the drawer without leaving L2; the card stays highlighted. A second click on another card swaps the drawer. "Open the subject's profile" in the drawer goes to S.

**Lens effects.** Subjects off vanish from the bands and the counts line follows. The filter chips do not apply inside L2 (there is one row); the wayfinder says so: "filter applies to lists, not to this row".

---

## 6. L3 — Claim

**Question:** what exactly is claimed, at what confidence, on what source?

**Surface.** Not a diagram. The drawer, in the matrix's claim-panel style: level and confidence as chips; the direction (read, write, both) when the row has one; the note in full; every source as a title, a quote in the source's words, and a link for public addresses (local evidence shows a title only, never a path); the retrieved date. Two links at the foot: "this capability" (L2, already open behind) and "this subject everywhere" (S).

The atlas adds nothing to a claim that the database does not hold. If a member wants more than L3 shows, the answer is "that is the whole record".

---

## 7. S — Subject profile, the second axis

**Question:** what does this one system reach across the whole territory?

**Picture.** A card of facts from the subjects table (kind, organisation, licence, status and its date, version, address) with the summary sentence; then the subject's row of the matrix **folded by group**: fourteen short strips in the L0 arrangement, one cell per capability in the level colours, so the eye reads the subject's shape in one look (a game engine is dense on the left and thin on the shared half; a standard is one or two strips and nothing else; the Forum's browser is seven built-in rows and thirty-nine absent). Under the strips: reach, built-in count, conflicts (each named with the capability), never-assessed count, sources count.

**Clicks.** A cell → L2 for that capability with this subject's card highlighted and its claim open in the drawer. A strip's eyebrow → L1 for that group with this subject's chip highlighted.

**Compare.** Two profiles can be pinned side by side (a second subject chosen from the lens bar while a profile is open). That is the only comparison view the atlas offers; the matrix is the many-to-many view and the atlas links to it for that.

---

## 8. Named routes: the questions the room will ask

A route is a link that sets the lens and lands at the level where the answer is visible. They are the map's pins. Each is a hash the wayfinder can show as a chip row "Routes".

| Route | Lens | Lands at | What the room sees |
|---|---|---|---|
| Where nothing reaches | filter Gaps | L0 | regions flagged where gaps exist; drawer lists the rows that nothing reaches natively or through an extension |
| Where one system stands alone | filter Only one reaches it | L0 | regions flagged; drawer lists the 21 thin rows and their one reacher |
| Where systems will not interoperate | filter Recorded conflicts | L0 | conflict counts on regions; Scene & assets 26 of 64 |
| The protocol half | filter Protocol rows | L0 | the 80 protocol rows; the coastline |
| The Forum's own | only the MSF group on | L0 | six subjects; reach numbers; what the Forum's projects and specifications reach without anyone else |
| Standards alone | only the Standards group on | L0 | twenty standards; where standards reach without any engine or platform |
| Shared anchors | L2 geo.anchor-shared | L2 | four built in; Unreal through an extension; seven partial; six built in next door on local anchors (link) |

Routes are derived, not written: each is a lens plus a location. Adding one is one line.

---

## 9. Density rules, so no level becomes a document

- One screen per level at 1440 × 900 with every subject on. If a level cannot fit, it folds, it does not scroll into a wall.
- L0: 14 regions, 8 shores, 57 chips. Fixed.
- L1: at most 27 cards (Scene & assets). Cards are one size; text is name, binding word, five numbers, one flag. Notes never appear at L1.
- L2: at most 57 cards in five bands; out of scope folded. Connectors at most 57, drawn once, redrawn on resize and toggle.
- Partial is never drawn as a line at L1 (it is counted); it is drawn at L2 in its own band and colour.
- Sources never appear above L3.
- Narrow screens (below 700 px): planes stack; shores become rows; connectors are not drawn and the L2 bands become lists with the level colour as a left rule; hover becomes tap; the drawer becomes a sheet.
- Empty states are sentences, in place, in the matrix's wording: "Nothing on screen has scored here" · "Switch on a subject to see who reaches this" · "This row is filtered away; clear the filter to see it".

---

## 10. Navigation model

- Breadcrumb is always clickable, one step per level. The stack's name is the root.
- Back and forward work through the hash; every state is a link that another person can open to the same screen with the same lens.
- Keyboard: arrows move between cards in a plane; Enter descends; Escape closes the drawer, then ascends; Tab reaches every chip and card; every eyebrow and term carries the page's explanation on focus.
- The three modes (Matrix, C4 model, Atlas) are links that carry the lens in the hash. Nothing is lost by switching.
- The board is linked from the wayfinder as "New here? Start with the board", never restated. The rungs, topology models and engine anatomy belong to the board.

---

## 11. Visual language

Only the two existing vocabularies, and nothing new:
- From the board: planes as titled bands; eyebrow labels ("PLANE n TITLE" style, here "L1 REGION · IDENTITY, TRUST & RIGHTS"); card faces; curved connectors; the honest-picture box style for the drawer.
- From the matrix: chips and their pressed state; the level colours and legend keys; the counts line; the binding colour on PROTOCOL; the claim-panel style; the IBM Plex typefaces both share.
- Region tint at L0: two tints only, format and protocol, taken from the binding colours; health numbers in the level colours.
- If a state has no existing style, derive it from the nearest existing one and record the derivation in the result. Do not invent a colour, an icon set, a shadow or a shape.

---

## 12. Data contract: every number is a query

Everything comes from the embedded `territory.json` (the same file the matrix embeds), never from prose. The derived numbers and their definitions, so the atlas and the matrix can never disagree:

- Reach (subject) = rows at native, via-extension or partial.
- Built in (subject) = rows at native.
- Health of a capability under the lens, among subjects on: contested = 2 or more at native or via-extension; only one = exactly 1 at native; gap = 0 at native and 0 at via-extension; conflicts = 1 or more at conflicts. (These are the matrix's predicates; copy them verbatim from `matrix.html`; do not rewrite them.)
- Region health = counts of its capabilities in each state.
- K of M (group) = subjects on with at least one native or via-extension row in the group / subjects on.
- N of M scored (row) = subjects on with any level other than out-of-scope / subjects on.
- Format and protocol = capability.binding build and connect; display words format and protocol.
- Unverified (counts line) = claims at `unverified` confidence among the subjects on. It is on the line because it is not zero: 22 of the 6,882 claims are unverified and every one of them is an absence, so a reader who takes the map's absences at face value has to be told how many of them rest on a page that could not be read. When the number is zero the part still prints, reading "0 unverified", because a missing part and an honest zero look the same and only one of them is.
- Counts line = the matrix's counts line under the same lens, byte for byte.

Acceptance: with the same lens, the atlas's counts line equals the matrix's; the thin rows and the gaps are the same by name; every L1 card's five numbers equal `select level, count(*) from coverage where capability_id=? and subject_id in (<on>) group by level`.

---

## 13. What is deliberately not on the atlas

- No lines at L0 or L1. Highlight replaces them; lines return at L2 where they are countable.
- No notes above L2 and no sources above L3.
- No prose that is not in the database: definitions come from the capability table, summaries from the subject table, notes from the claims.
- No restatement of the board. One link.
- No model-file download.
- No new metric. If a number cannot be written as a query in section 12, it does not appear.

---

## 14. Build outline for the third design

Files: `infrastructure-wg/board/atlas.html` (page, no library, no outside script), `infrastructure-wg/data/build_atlas.py` (inlines `territory.json` the way `build.py` does, into `atlas-standalone.html`), address `https://openspatials.com/msf/map/atlas/`, noindex like the map. Predicates and the lens bar markup copied verbatim from `matrix.html`; the claim panel's rendering copied, not rewritten, so L3 matches the matrix's panel.

Order of work, each step provable before the next:
1. The skeleton: lens bar, wayfinder, hash grammar, breadcrumb, mode links, empty stage. Prove: the lens round-trips through the hash; the counts line equals the matrix's under three lenses.
2. L0 with health and shores. Prove: region numbers against queries for two groups; the coastline reads.
3. L1 with bands and highlight. Prove: Identity and Spatial as in section 4; card numbers against queries.
4. L2 with bands and connectors, and L3 in the drawer. Prove: the shared-anchors row; connector count equals the row's non-absent, non-out-of-scope count among subjects on.
5. S with folded strips and compare. Prove: Roblox reach 76, built in 47; the browser 33 and 7.
6. Routes. Prove: each lands where section 8 says with the numbers it says.
7. Narrow screen and keyboard. Prove: at 390 px, no horizontal scroll; every card reachable by Tab.
8. Deploy with the production deploy script under the lock, only when every proof above passes; republish nothing else.

Each proof was recorded with its query and output, and the three screenshots (L0, L1 Identity, L2 shared anchors).
