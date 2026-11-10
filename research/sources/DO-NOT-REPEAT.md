# Numbers and claims not to state at the meeting

Written 2026-08-20 from a read of the local research corpus.
**Extended 2026-08-24** with the findings of six re-verification passes: the habit that keeps
producing these errors, the numbers and dates withdrawn, and a rewrite of the "What is safe"
section, which was blessing claims the coverage database had already contradicted.

The rule behind this file: material from this project reaches the Metaverse Standards Forum, and a
false claim shipped into a specification is the worst thing this work can produce. Anything listed
here is either unsourced, misattributed, or arithmetically wrong in the local corpus. Do not repeat
it, even casually.

---

## The habit that has now caught us six times

**Added 2026-08-24, from six separate re-verification passes.**

This project keeps calling a capability new, or a gap empty, when an older ratified standard already
covered it and the industry passed it over. It is not a slip. It is a habit, and it has been caught
six times now.

**The six, in the order we found them:**

1. **Spatial audio.** Called an empty cell — no standard for spatial audio parameters, room and
   occlusion behaviour per-engine. A full international standard for six-degree-of-freedom immersive
   audio published three days after that claim was written, and the older 3D scene standard had
   carried a full audio component since 2023. `VERIFIED-CORRECTIONS.md` section 1.
2. **Physics.** Called empty. The same older scene standard has defined rigid bodies, collidable
   shapes, collision spaces, contacts and six joint types **since 2008**, in a clause still present
   in the current edition. `VERIFIED-CORRECTIONS.md` section 9.
3. **Avatars.** A draft avatar format was described here as *"the first formal standard whose
   declared job is carrying a personalized avatar between different applications, services and
   worlds."* The **same committee's 2016 standard** exists, in its own words, "to make it possible
   to migrate a virtual object or its characteristics from one virtual world to another." Ten years
   earlier, same committee. `VERIFIED-CORRECTIONS.md` section 16.7.
4. **Humanoid skeletons.** Treated as the thing the common asset format still lacks and nobody has.
   Clause 26 of that same older scene standard binds a separate international standard in as nodes —
   humanoid, joints, segments, attachment sites, displacers. Ratified.
5. **Tiled terrain streaming.** Treated as the tiled geospatial format's own invention. Clause 25 of
   the same standard defines a terrain level-of-detail node holding four child addresses in a
   quadtree and managing their loading. Ratified.
6. **Shared state between running instances.** Called empty across this whole map. Clause 28 of the
   same standard defines networked state sharing across host computers, bound to a long-standing
   protocol. Ratified. Nothing else on this map has it.

(A seventh sits alongside them and is the same shape: **conformance**. Clause 6 of that standard
covers files, generators and readers separately, with a base profile, while the newest scene
specification on the map says its own conformance tests "will be made available" — future tense.)

**What follows from it, and this is the part that matters.**

Every one of these was ratified and every one was ignored. **So the problem is not capability. The
problem is adoption.** A capability gap and an adoption gap look identical from the outside — both
show up as "nobody does this" — and they need opposite interventions. **Writing another
specification is the answer to a capability gap. It does nothing whatever for an adoption gap, and
it has now failed six times in a row here.** An adoption gap needs the other kind of work: finding
out why implementers passed the thing over, whether it was profile complexity, licence terms,
tooling, timing or simply nobody asking; and then fixing that, or making a deliberate, stated
decision to supersede it.

**The rule, and it is cheap to follow.** Before this group declares any cell empty:

1. **Check the older ratified standards first**, especially the components-based scene standard,
   which has been the answer five of the six times.
2. **If something already covers it, say so, and say the gap is adoption.** That is a stronger and
   less contestable claim than "nobody has done this", and it cannot be corrected from the floor.
3. **If you still want a new specification, say what changed** — what the old one got wrong, or what
   the world needs now that it did not need then. If you cannot answer that, you are about to write
   the seventh.

**Do not say "nobody has standardized X" without doing step 1.** Every one of the six above would
have been caught in a few minutes of looking, and each of them would have been corrected in the room
by somebody who already knew.

## Numbers and dates withdrawn 2026-08-24

Each of these was asserted somewhere in this project and is now known to be wrong. The withdrawn
text is quoted so you recognise it if you meet it again in an old file, a slide or somebody's notes.
Full entries, with what replaced them, are in `VERIFIED-CORRECTIONS.md` sections 14 to 20.

- **"The ratified list holds 26 entries."** It holds **23** — twenty with one prefix, three with the
  multi-vendor prefix. Do not say twenty-six. None of the 23 is physics and none is audio, which is
  the part that was always load-bearing.
- **"268 are registered"** / **"not among the 268 registered ones"**, of identifier methods. It is
  **267**. The 268 counted the table's header row as a method. The register is dated 2026-08-12 and
  the figure moves, so date it whenever you say it.
- **"The matching avatar extension for the common asset format does not exist yet: unmerged draft,
  ratification targeted December 2026."** **There is no such extension at any stage of that
  registry** — not ratified, not in progress, not vendor. There is no draft, so there is nothing
  behind the date. Do not state a ratification target for it. What is real is a press item dated
  2024-10-23 announcing a collaboration towards international standardization.
- **"The audio emitter proposal has been open since 2022-03-31"**, with a pull-request number. That
  extension name is not in the registry. The proposal that exists is a different one, at the earliest
  stage, under a different number. Do not repeat the old name, date or number.
- **"The physics draft was accepted by vote at the end of October 2025 and targeted for ratification
  in the second quarter of 2026."** Neither date could be reached in a primary source. Do not state
  a vote date or a ratification quarter for it.
- **"The first formal standard whose declared job is carrying a personalized avatar between
  different applications, services and worlds."** Wrong — the same committee's 2016 standard says it
  does that. See the habit section above.
- **"[The tiled format] is an OGC Implementation Standard"**, with an address under the `is` path.
  It is a **Community Standard**, submitted by a single company, and the `is` address returns HTTP
  404. Fixed in `data/subjects.csv` on 2026-08-24.
- **"It was adopted on 2023-09-08"**, of the geospatial pose standard. That conflates two dates the
  document states separately: approval 2022-06-20, publication 2023-09-08.
- **"[That platform] runs on the immersive session standard."** One of the two large social
  platforms scored here **does not** — it targets vendor runtimes instead, and its own lead developer
  names the standard as future work. Do not assume conformance from the fact that a platform
  supports headsets.
- **"The maintainer has not answered the disclosure question"** and **"the claim has never been
  re-checked."** Both stale. Answered 2026-08-01, re-checked 2026-08-23 and 2026-08-24. See
  `VERIFIED-CORRECTIONS.md` section 19.

## Misattributed figures

- **The data-scale figures for a visual positioning service** — street images, aerial images, 3D
  points, and total storage — previously appeared in
  `open-metaverse/03-technical-architecture/technology-stacks/RECOMMENDED-TECH-STACKS.md`
  attributed to a city digital-twin programme, and appeared verbatim in
  `open-metaverse/03-technical-architecture/architecture-diagrams/01-SPATIAL-COMPUTING-ARCHITECTURES.md`
  attributed to a commercial positioning service. **Corrected 2026-09-11:** the unsupported bundle
  has been removed from both locations. A bounded search of the original-source context and the
  Singapore Land Authority, National Research Foundation and Dassault Systèmes domains did not
  recover a primary citation for the exact bundle. Secondary repetition is insufficient to restore
  it. **Say neither.**

## Arithmetic and method errors

- **Corrected 2026-09-11:** the medium-scale stack's six historical line items total
  **$4,295-9,095/month**, not $4,295-8,095. At its stated 10,000 peak concurrent capacity, the
  rounded monthly cost per unit of that capacity is $0.43-0.91. Prices were not refreshed.
- **Withdrawn 2026-09-11:** the break-even conclusions treated concurrent capacity as paying
  monthly subscribers. No subscriber base or conversion between those units is supplied, so no
  replacement profitability claim is supported.

## Stale in a way that matters

- **The Unreal version claim in this family is wrong, and this project repeated it.** The runtime
  comparison at `research/xr-runtime-comparison/COMPARISON.md`, written 2026-08-18, says Unreal
  Engine 6 shipped on 2026-06-17 and makes Verse the primary gameplay language. Checked against
  Epic's own release notes and forum announcement on 2026-08-22: **what shipped that day was version
  5.8.** The version 6 plan was announced the same day with early access targeted for late 2027, and
  Epic's documentation carries no version 6 pages. **Verse is not the gameplay language of any
  shipping Unreal Engine** — Epic documents it only for Fortnite and the Fortnite editor, and it
  does not appear in the 5.8 feature list, which does name forty other experimental items. Do not
  repeat the version 6 claim. The correction matters for portability: Verse today runs only inside
  Epic's own service, so Verse content cannot move to another engine, another runtime, or even to
  standalone Unreal.
- **Updated 2026-09-04: version 6 now has a named game, and it still has not shipped.** Rocket
  League is the game. The teaser came from Epic's own channel on **2026-05-24** — *"Rocket League®
  | A New Era"*, posted by the Rocket League channel at 22:00 UTC that day, described as *"the
  first teaser of what's next for Rocket League"* — and the game's own front page carries the line
  **"New Era. New Engine. This is Rocket League."** over that video. Epic's engine lead confirmed
  what the teaser showed in *The road to Unreal Engine 6*, dated **2026-06-22**: *"If you were
  watching the Rocket League Championship Series a few weeks ago, you might have noticed a familiar
  logo with a 6 on it."* Epic's own player support carries an article named **"Rocket League Unreal
  Engine 6 Update"** for *"the Unreal Engine 6 update coming to Rocket League"*. The same Epic post
  gives the timetable in Epic's words: *"We're targeting a Unreal Engine 6 Early Access release at
  the end of 2027, with the full release of UE6 coming 12-18 months later."*
  **The line to say:** *"Version 6 has its first game announced, Rocket League; nothing runs on
  version 6 yet; early access is targeted for the end of 2027."*
  **Two things to keep out of your mouth, because no primary source says them.** First, the phrase
  **"first game"** is the trade press's, not Epic's: neither Epic nor Psyonix has published the
  words *first game* or *first title* anywhere we can find, so say *"the first game announced"* as
  our own reading and do not put it in quotation marks or attribute it to Epic. Second, **there is
  no date for Rocket League's move.** Epic's support page gives none, and the teaser gives none.
  Late 2027 to 2029 is arithmetic on the engine's own timetable — early access at the end of 2027,
  full release 12 to 18 months after — not a statement by anybody. Say it as arithmetic or not at
  all. Retrieved 2026-09-04; see `VERIFIED-CORRECTIONS.md` section 17.10 for the addresses.

## Thin, not wrong — do not present as researched

- **Model A1, updated 2026-09-11.** The Map-local [fact sheet](MODEL-A1-FACT-SHEET.md) and accepted
  September 10 Unreal scope trace now document the Pixel Streaming example. They establish a
  browser/WebRTC media and input route, not general client interchangeability, a headset latency
  budget, GPU cost per user, recovery behavior or cross-server state handoff. The remaining Model
  A1/A2 prose is description, and the group's remote-rendering scope decision remains unrecorded. (Superseded on 2026-10-20: `render.remote` is now a row, recorded descriptively.)
- **Failure behaviour** is nearly absent for all three topology models. No reconnection,
  state-recovery, or network-partition behaviour is documented. The failure lines on the board are
  descriptive, not measured.

### The eighteen unverified claims on the map, and what would settle each

**Added 2026-09-06.** Until 2026-09-06 every claim in the coverage database was verified or
second-hand and none was unverified. The 28 new capability rows brought eighteen that are not, and
they are listed here because an unverified claim is exactly the kind of thing that gets repeated as
a finding. **Every one of the eighteen says a system does not have something. Not one asserts that a
system does.** So no positive claim on the map is unverified, and the gaps view is still solid — but
these eighteen absences are thin, and "X does not do Y" is the sentence a member of the working
group is most likely to quote back at its vendor.

- **Four Horizon Worlds rows — passthrough, face and body tracking as input, permanent code
  identity, content review and safety gating.** Meta's Horizon Worlds creator documentation now sits
  behind a developer sign-in and could not be read. **What would settle them:** a reader with a Meta
  developer account opening the creator documentation and looking for a passthrough setting, a face
  or body stream reaching world logic, a published unit of logic with a name outside the platform,
  and a statement of who reviews published content and when.
- **Four Rec Room rows — passthrough, face and body tracking, navigable space and arrival points,
  content review and safety gating.** Rec Room closed on 1 June 2026 and its creator documentation
  went offline with it. **What would settle them:** an archived capture of that documentation, from
  the Internet Archive or a copy somebody kept. Until one is found these rows cannot be verified
  against a live source and should be quoted as history, with the closure date attached.
- **Two passthrough rows, on VRChat and Resonite**, and one more on Niantic Lightship for face and
  body tracking. Each was read off a live primary page that describes what the system does and never
  says it does not do this. **What would settle them:** a sentence in the vendor's own documentation
  that names the absence, or a feature page that would have to mention it and does not, quoted as
  such.
- **The remaining seven** are the same shape on ARCore, Godot, Roblox, three.js, PlayCanvas, World
  Labs Marble and Tencent Hunyuan World: an absence read off a primary page that does not itself
  declare the absence. **What would settle them:** the vendor saying so, an API reference with no
  such call in it quoted by its index, or a maintainer's answer on the record.

**How to say it.** *"Our reading of the published documentation found nothing, and the row is marked
unverified for that reason"* — never *"the platform does not support it"*. The map prints the number
on its own counts line so that nobody has to take this on trust: 18 of 4,016 claims, and the line
carries it even when it is zero.

## What is safe

**Rewritten 2026-08-24. The old version of this section blessed the wrong claims.** It read: "which
parts an engine has, which are welded, **which sockets have standards and which do not**, and the
split between file standards and session standards." That file was written 2026-08-20. The coverage
database was built 2026-08-22 and contradicts precisely the socket-coverage half of it. Anyone
relying on the old line today is being told the wrong thing. What it blessed is now listed as wrong
in `VERIFIED-CORRECTIONS.md` section 17.

- **Safe:** which parts an engine has, which are welded, and the split between file standards and
  session standards. These are structural arguments, not measurements.
- **No longer safe: which sockets have standards and which do not.** The board answers a different
  question from the database — the board asks *is there a standard for this*, the database asks
  *does this subject do this* — and both print the word "empty". Seven sockets the board calls empty
  are occupied in the database. Nine capabilities the database finds genuinely unreached appear
  almost nowhere on the board. **Take coverage claims from the database, not from the board.**
- **Also no longer safe: the board's four sharpest chips.** Asset licence and rights, portal
  handoff, addressing and portable capability are all marked empty and all four are occupied. Detail
  and the surviving careful versions are in `VERIFIED-CORRECTIONS.md` section 17.
- The runtime comparison document is the only 2026-dated source in the corpus and ranks its own
  evidence quality. Prefer it wherever it overlaps with the older files.

## Still open

**Updated 2026-08-24: the standards check has landed.** Version numbers and statuses are now
recorded in `VERIFIED-CORRECTIONS.md` and in the coverage records, each tied to a source. The
blanket rule is lifted, and replaced by a narrower one: **state a version number only where that
file states one, and state its date with it.** Several of the numbers this project was carrying
turned out to be wrong — see sections 14 and 15 of that file — so the figures are safe now
*because* they were checked, not because they are old enough to trust.

**Still genuinely open:** the board and `model/COMPANION.md` have not been brought into line with
sections 14 to 20 of the corrections file. Until they are, do not read a coverage claim off either
of them.

Full extraction with per-claim source attribution:
the maintainers' working notes (not published)
