# A map of the parts an open metaverse needs

**Metaverse Standards Forum — Infrastructure Working Group**
Companion text for the architecture map. Written 2026-08-20 for the 2026-08-21 call.

**Corrected 2026-08-24** against `sources/VERIFIED-CORRECTIONS.md` sections 14 to 20, which merged
six re-verification passes and withdrew eleven claims this document was carrying. Every figure and
date below now matches that file. Where a claim was withdrawn, what replaces it is stated at the
same specificity rather than hedged away. The narrative board has **not** been corrected and still
carries several of the withdrawn claims; take any coverage claim from the database, not from the
board.

This document is the written half of the map. The visual board shows the parts and the lines
between them. This text says what each part is, what it does, and why it matters when we argue
about standards. Read either one alone and it still makes sense; read both and the board stops
being decoration.

---

## How to read the map

The map has four planes and one overlay.

- **Plane 1 — Topology.** Where the computing happens, where the authoritative copy of the world
  lives, and what travels over the network. This is the plane people mean when they say
  "centralized or decentralized."
- **Plane 2 — Engine anatomy.** What a real-time 3D runtime is made of. Twelve separable parts.
  Each part is a socket, and a socket is where a standard can plug in.
- **Plane 3 — Stack choices.** What you can actually pick for each socket today, named.
- **Plane 4 — Entry points.** Where a builder starts, from whole hosted platform down to a bare
  protocol node. Five rungs.
- **Overlay — Standards.** For every socket in planes 2 and 3: which body covers it, where two
  bodies cover the same ground, and where nothing exists.

The four planes are not four separate diagrams that happen to share a page. They are stacked, and
the stacking is the argument:

**Your entry point mostly picks your topology. Your topology decides which engine parts you are
even allowed to swap. The parts you can swap are the only places a standard can do any work.**

That sentence is the whole map. Everything below is detail underneath it.

---

## Plane 1 — Topology

Four models. Every real system is one of these or an honest mixture of them.

**Changed 2026-08-21, from the working group's first meeting.** This plane held three models. Alfred
Tom pointed out that "the server does the rendering" quietly covers two different systems: the
server can send **finished video**, or it can send **geometry the client draws**. Those have
different wire loads, different client requirements and different standards needs, so the old Model
A is now A1 and A2. B and C are unchanged. The mistake this fixes is real: with one card, it was
easy to reach for large multiplayer titles as the example, and those are Model B.

### Model A1 — Cloud-rendered video

The server runs the whole world and rasterizes it. It sends the client compressed video
frames. The client sends back button presses, head pose, and controller pose. The client does
almost no 3D work at all and never sees geometry.

- **What crosses the network:** video downstream, input upstream.
- **Who holds the truth:** the server, completely. There is only one copy of the world.
- **What the client needs:** a video decoder and a network connection. No assets, no engine,
  no install.
- **What it costs:** a graphics processor per active user, or close to it, plus continuous video
  bandwidth for as long as the session lasts. The cost scales with time spent, not with the number
  of accounts.
- **How it fails:** the picture freezes. There is no local world to fall back to.
- **The latency problem:** input and display are separated by a round trip. Head movement in a
  headset is the hard case, because the eye notices the lag long before the hand does. This is why
  cloud rendering is common for engineering review on a laptop and rare for headsets.
- **Who uses it:** pixel-streaming deployments for large engineering and design models, cloud
  gaming services, virtual desktop products.

**Sourcing note, updated 2026-09-11.** The Map-local [Model A1 fact sheet](../sources/MODEL-A1-FACT-SHEET.md)
now cites Unreal's documented Pixel Streaming components, media and input route. The September 10
accepted Unreal scope trace supplies the later source context. The cost, headset-latency, failure
and general portability statements above remain descriptive, not measured findings; a browser
frontend is not proof of a universally interchangeable client protocol. A working-group scope
answer for remote rendering is still unrecorded, and the existing `render.remote` proposal remains
on hold. (Superseded on 2026-10-20: `render.remote` is now a row, recorded descriptively.) No shared-corpus or published-board update is claimed.

**What Model A1 demands of a standard:** almost nothing about assets or scene format, because the
client never sees them. What it needs standardized is the session: how you find the server, how
you authenticate to it, how input is described, how the video and the pose stream are carried, and
how you hand a session from one server to another.

### Model A2 — Streamed geometry

The server holds and assembles the world, but sends **geometry** rather than pixels. The client
rasterizes what arrives. Crucially, the client holds nothing in advance: no install, no asset
library, no download before you can enter.

- **What crosses the network:** scene geometry and scene data, streamed on demand.
- **Who holds the truth:** the server, but the drawing is local.
- **What the client needs:** a renderer and bandwidth. No prior assets.
- **What it costs:** bandwidth, plus server-side work to decide what to send and in what order.
- **How it fails:** the scene stops filling in. What already arrived keeps drawing, so it degrades
  rather than freezing.
- **The advantage over A1:** the round trip no longer sits between your head and the picture. Local
  drawing means local responsiveness, which is why this shape matters for headsets where A1 does not.
- **The advantage over B:** nothing to install and nothing to ship in advance, so a world can be
  entered from a link.

**What Model A2 demands of a standard:** the most interesting mix on this plane. It needs the asset
and scene formats that B needs, because the client must interpret what arrives — and it needs the
session and streaming behaviour that A1 needs. It is also the model where **level of detail and
streaming order** become interoperability questions rather than engine tuning, and nobody has
standardized those.

### Model B — Engine client with server state synchronization

The client holds the assets and does its own drawing. The server holds the authoritative state and
tells every client what changed. This is ordinary multiplayer, and it is what most virtual worlds
actually are.

- **What crosses the network:** state changes — positions, rotations, animation states, events,
  ownership transfers. Small messages, sent often.
- **Who holds the truth:** the server, for anything that can be cheated or contested. Clients
  predict locally and get corrected.
- **What the client needs:** the engine and the assets, installed or downloaded ahead of time.
- **What it costs:** far less bandwidth than Model A, and the server does no drawing. The cost
  moves to asset distribution and to the server's simulation load.
- **How it fails:** the world keeps drawing but stops updating. Other people freeze in place.
- **The lock-in problem:** the replication system is usually welded to the engine. If you write
  your world against one engine's networking, you have chosen that engine for the life of the
  project. This is the single strongest lock-in in the whole map.
- **Who uses it:** essentially every commercial virtual world and multiplayer game.

**What Model B demands of a standard:** a great deal. The client must be able to load the assets,
so asset format matters. The client must interpret the state messages, so the state schema matters.
Avatars must move correctly on a client that did not author them, so skeleton and animation
portability matters. This is the plane where most existing standards work lives, and it is not an
accident.

### Model C — Distributed nodes and edge mesh

Many small servers, each run by a different person or organization. A node can be a phone, a box in
a room, or a rented instance. You are on some node; your friend is on another; the nodes talk to
each other. There is no single authoritative copy of everything.

- **What crosses the network:** state between peers, plus whatever gossip or replication protocol
  keeps them roughly agreeing.
- **Who holds the truth:** each node holds truth about its own part. Shared regions need an
  agreement mechanism — a conflict-free replicated data type, a deterministic shared computation,
  or a lease on who owns which object.
- **What the client needs:** a runtime, plus a way to address and reach nodes.
- **What it costs:** cheap per node, and the cost sits with whoever runs the node. There is no
  central bill.
- **How it fails:** partially. Your local node keeps working while a distant one is unreachable.
  This is the model's real advantage and it is why it survives offline and on bad networks.
- **The hard problem:** identity and trust. In Models A and B the operator vouches for everyone. In
  Model C there is no operator, so identity has to be carried by the user and verified by the
  receiving node. Everything about verifiable credentials and portable manifests exists because of
  this.
- **Who uses it:** the open and self-hosted world — federated social platforms, self-hosted world
  servers, the lightweight node projects in our own ecosystem.

**What Model C demands of a standard:** the most of all, and the least of it exists. Addressing —
how you name a place. Handoff — how you move from one node to another with your things intact.
Portable identity and portable state. Discovery — how you find a node at all. These are the empty
cells on the standards overlay.

### The honest picture: hybrids

No production system is purely one model. The common mixtures:

- **B with A1 for heavy scenes.** Client renders normally, but a very large model or a distant
  region is streamed as video from a server.
- **B with C for federation.** Each world is a Model B server, but the servers federate, and moving
  between them is a Model C problem.
- **C with a central directory.** Nodes are independent, but one shared service answers "where is
  that place." This is usually where a decentralized design quietly re-centralizes, and it is worth
  naming out loud when we review any proposal.
- **Adaptive rendering, raised at the first meeting.** The server decides, per client, whether to
  rasterize or hand the geometry over, based on what the device can take, and falls back to
  server-side rendering when it cannot. The headset draws what must be low-latency; a nearby machine
  draws the rest.

  This is worth stating carefully, because it is more than another hybrid. It makes A1, A2 and B
  **runtime alternatives within one session**, chosen at connection time once the device and the
  content are known — not a decision made once when the project is built. That reframes plane 3:
  some sockets are build-time choices and some are connection-time choices, and a standard for the
  second kind has to describe a negotiation, not a format.

**The working group point:** arguing "centralized versus decentralized" as a single question hides
the fact that a system can be centralized on identity, federated on discovery, and peer-to-peer on
state — all at once. The map should let us say which, per axis.

---

## Plane 2 — Engine anatomy

An engine looks like one product. It is twelve parts in a shared harness. Naming them separately is
what makes standards conversation possible, because a standard can only plug into a part that can
be separated.

For each part below: what it does, and whether it is genuinely replaceable or welded in.

1. **Renderer.** Turns the scene into pixels. Talks to the graphics interface on the device.
   *Replaceable in principle, rarely in practice — most engines are built around their own.*

2. **Scene graph and world model.** The tree of objects, transforms, and relationships. The
   engine's idea of what exists and where.
   *Welded in the major engines. This is the engine's core data structure and everything else
   depends on its shape. Keep the qualifier: two ratified standards define a scene graph natively.
   What is welded is each engine's own scene graph, not the capability.*

3. **Asset pipeline.** Import, convert, compress, and package models, textures, materials, and
   animations for the target device.
   *Replaceable at the edges. This is the most successfully standardized part of the whole map.*

4. **Physics and simulation.** Collision, rigid bodies, cloth, fluids, and anything else that
   moves by rule rather than by script.
   *Replaceable — several engines let you swap the physics library. But results differ between
   libraries, which is exactly why cross-world physics is unsolved.*

5. **Game logic and scripting.** The rules of the world. What happens when you pick something up.
   *Welded, and deliberately so. Each engine's scripting is a selling point and a lock-in.*

6. **Networking and replication.** Which state is shared, who owns it, how often it is sent, and
   how disagreements resolve.
   *Welded in the big engines, replaceable in the web stacks. The most consequential socket on
   the board.*

7. **Audio, including spatial audio.** Positioned sound, room response, occlusion, voice.
   *Replaceable. Middleware for this is a real market, which is evidence the socket is real.*

8. **Input and device abstraction.** Controllers, hands, eyes, head pose, and the headset session
   itself.
   *Replaceable, and standardized better than most people expect.*

9. **User interface.** Menus, panels, text, and the two-dimensional layer over the three-
   dimensional world.
   *Welded, and a persistent source of pain for anyone porting between engines.*

10. **Persistence and state storage.** What survives a restart. Inventory, world edits, progress.
    *Replaceable — it is usually an ordinary database behind an ordinary interface.*

11. **Packaging and distribution.** Turning the project into something a user can run, and getting
    it to them.
    *Replaceable, but platform stores constrain it heavily.*

12. **Editor and authoring tools.** Where humans build the world.
    *Welded, and the real reason teams stay with an engine. Migrating a runtime is hard; migrating
    a team's editing habits is harder.*

**Read the welded list again — scene graph, scripting, networking, user interface, editor.** Those
five are where lock-in lives. A standards body can publish a perfect specification for any of the
other seven and still not move the market, because the five that bind you are untouched.

---

## Plane 3 — Stack choices

What you can actually pick, per socket. Maturity notes are structural, not benchmarks.

**Renderer and engine harness**
- Unreal Engine — heavy client, strongest visual ceiling, source available under its own licence.
  **Corrected 2026-08-22.** Version 6 has **not** shipped. What shipped on 2026-06-17 was version
  5.8; the version 6 plan was announced the same day, with early access targeted for the end of
  2027. And Verse is **not** the gameplay language of any shipping Unreal Engine — Epic documents it
  only for Fortnite and the Fortnite editor, and it is absent from the 5.8 feature list. Verse
  content therefore cannot move to another engine, another runtime, or even to standalone Unreal.
  This project asserted the opposite for two days; the claim came from a local research document and
  was not checked against Epic's own sources until now.
- Unity — heavy client, widest device reach, broadest asset market.
- Godot — open source under a permissive licence, lighter, growing fast.
- Three.js — the common web renderer. Library, not an engine: you bring your own everything else.
- Babylon.js — web renderer with more engine-like services included.
- Native code on the modern web graphics interface — most control, most work.
- Bevy and similar systems-language engines — small but serious, fully open.

**Scene and asset format**
- The Khronos transfer format for 3D scenes — the effective standard for delivering a model.
- Universal Scene Description — the effective standard for composing and exchanging a whole scene
  in production pipelines, with an industry alliance now behind it.
- Engine-native formats — fastest, portable nowhere.

**Networking and replication**
- Photon — hosted, mature, engine-agnostic.
- Unity's own networking for game objects — good inside Unity, nowhere else.
- Unreal's replication — powerful, and a one-way door into Unreal.
- Conflict-free replicated data types, such as Yjs — no central authority needed, excellent for
  collaborative editing, weaker for anything cheatable.
- Deterministic shared computation, such as Croquet — every peer computes the same result from the
  same inputs; elegant, and demanding about determinism.
- Selective forwarding units — the standard way to move many live media streams; the voice and
  video layer rather than the world state layer.

**Identity and credentials**
- Ordinary platform accounts and delegated web sign-in — what nearly everyone actually uses.
- Decentralized identifiers and verifiable credentials — the self-held route, and the only one that
  works in Model C.
- Content provenance credentials — signing what an asset is and who made it, rather than who you
  are.

**Immersive session and device**
- The cross-vendor immersive runtime interface for native headsets.
- The browser's immersive device interface for the web.
- Vendor-specific runtimes where a device insists on its own.

**Geospatial and world anchoring**
- Standard pose-on-Earth encoding from the geospatial body.
- Streaming formats for large tiled 3D terrain and city data.
- City modelling formats for structured built-environment data.
- Vendor visual positioning services — accurate, proprietary, and each one an island.

**Avatars**
- The Japanese-origin open avatar format, widely used in social virtual reality.
- Vendor avatar systems with their own pipelines.
- Engine-native rigs — no portability at all.

**Backend and hosting**
- Container orchestration for world servers, with autoscaling per region.
- Edge locations to shorten the round trip for Models A and C.
- Object storage plus a content delivery network for assets, which is where Model B's real cost
  sits.

---

## Plane 4 — Entry points

"I want to build a metaverse" means five very different projects. This is the ladder people
actually climb, from most packaged to least.

**Rung 1 — Whole hosted platform.** You get an editor, a runtime, hosting, identity, moderation,
payments, and an audience. You write content, not infrastructure.
*Time to something visible: days. Control: almost none. Portability: none. Your world cannot leave.*

**Rung 2 — Hosted backend plus your own client.** You pick your engine and write your world; you
rent the multiplayer, matchmaking, storage, and voice.
*Time: weeks. Control: over the experience. Portability: the client is yours, the backend is not.*

**Rung 3 — Engine only, self-hosted.** You take an engine and run your own servers.
*Time: months. Control: nearly complete. Portability: bounded by the five welded parts in plane 2.*

**Rung 4 — Renderer plus libraries.** No engine. A renderer, an avatar system, a scene loader, a
physics library, a networking library, assembled yourself.
*Time: months, and you own every seam. Control: complete. Portability: complete, because every
socket is a real socket. This is where open standards pay off most and where most open projects
live.*

**Rung 5 — Bare protocol node.** You implement the addressing, handoff, and state protocols and run
a node. You are not building a world; you are building a place other people's worlds can reach.
*Time: this is a research programme, not a project. This is the rung our own ecosystem work sits on.*

**The connection back to plane 1.** Rungs 1 and 2 give you Model B, occasionally Model A, and never
Model C. Rung 3 gives you B, and C only if you build the federation yourself. Rungs 4 and 5 are the
only ones from which Model C is reachable without fighting your tools. That is the honest reason
open topologies are rare: the easy rungs do not lead there.

---

## Overlay — Standards: coverage, overlap, gaps

Three states per socket: **covered**, **contested**, **empty**.

**What the three words mean.** Covered: a ratified standard exists and is implemented by more than
one party. Contested: more than one body covers the same ground and the boundary is live. Empty:
**no ratified standard you can build against today** — which is not the same as nobody working on
it. That definition was tightened on 2026-08-20 after two cells turned out to have standards we had
called missing. **Corrected 2026-08-24: it was two when that line was written and it is now six.**
See the closing pattern below. Where work is in flight in an empty cell, it is named.

**One more warning about the word, added 2026-08-24.** This overlay asks *is there a ratified
standard for this*. The project's coverage database asks a different question — *does any named
subject do this* — and both answers print as "empty". The two lists do not match, and where they
disagree the database is the one to quote, because it is sourced row by row. Read this overlay as an
argument about standards, never as a measurement of coverage.

### Covered — a real standard exists and is widely implemented
- **Asset delivery.** The Khronos transfer format is genuinely settled.
- **Scene composition mechanics.** Verified 2026-08-20, and narrower than we had it. The alliance
  behind the scene description format published its core specification, **version 1.0.1**, on
  2025-12-12. Cite that version and that date: the announcement calls it 1.0, the only artifact that
  exists is 1.0.1, and there is no 1.0.0. That is a real ratified standard — and it is the only one
  that alliance has published; its own repository's "Available Specifications" table has exactly one
  row. It covers data types,
  the document model, paths, resource resolution, composition, value resolution, schemas, colour,
  collections and file formats. It **explicitly excludes geometry, materials and physics**, which
  are separate specifications from separate groups, none of them published yet. So the composition
  machinery is standardized; what you put inside a scene is not.

  **Three limits on that coverage, added 2026-08-24, and they change what "covered" buys you.**
  First, the ratified core defines **no unit of length and no up axis**. Those two fields do appear
  in the document, but only inside example code blocks demonstrating a different feature, so they
  carry no normative force. Two conforming files can disagree about scale and orientation with
  nothing in the standard to settle it — so "adopt it and you get scale interoperability" is false.
  Second, its **conformance tests do not exist yet**: it names three required tests and says they
  "will be made available", future tense. Its animation interpolation methods are, in its own words,
  "not subject to specification or compliance validation at the time of this writing", so two
  conforming readers may return different values between keys. Third, the licence is
  **Attribution-NoDerivatives**: a derivative work made from the deliverable may not be distributed,
  which constrains how another standards body can build on it.
- **Graphics interface on the web.** The modern web graphics interface now ships by default in all
  three browser engines. Verified 2026-08-20.
- **Native immersive device access.** The cross-vendor native runtime interface is genuinely
  multi-vendor.
- **Pose on Earth.** The geospatial pose encoding is an adopted standard, not a draft seeking
  uplift. Our own research called it a draft. It is not. Do not repeat that.

  **Two dates, not one — corrected 2026-08-24.** This entry used to read "adopted since 2023-09-08".
  The document states two dates separately in its own front matter: **approval 2022-06-20** and
  **publication 2023-09-08**. The single date conflated them. Give whichever you mean and say which.

  **Two things to say before you are asked.** Requirement 5, the tangent-point latitude rule, reads
  in the published text: *"The minimum value shall be 90.0 degrees and the maximum value shall be
  90.0 degrees."* The minus sign on the minimum is missing, and the neighbouring longitude rule
  correctly reads "-180.0 degrees", so it is a typo in the published normative text rather than an
  extraction artifact. Read literally, the rule permits only the north pole. And the coverage is
  narrower than "covered" suggests: the two simple forms fix the frame to an implicit world geodetic
  datum, but the flexible form carries three strings naming an outside authority, and the standard
  says *"the interpretation of the contents of these fields is outside the scope of GeoPose."* **Two
  conforming systems can exchange a valid pose and still disagree about where it is.**
- **Content provenance.** Signing authorship into media is deployed and moving fast — for **media**.

  **Corrected 2026-08-24, and this is the correction that matters most to this group.** The
  provenance specification, version 2.4, lists the formats it supports: JPEG, JPEG-XL, PNG, SVG,
  HTML, FLAC, MP3, GIF, DNG, TIFF-based formats, WAV and BWF, AVI, WebP, fonts, unstructured and
  structured text, PDF, EPUB, Office Open XML, Open Document, OpenXPS, other ZIP-based formats, MP4,
  MOV, AAC, ALAC, HEIF, Ogg Vorbis and other formats of that container family. **No transfer format
  for 3D scenes, in either its text or binary form. No scene description format.** A binary 3D
  transfer file is neither ZIP-based nor of that container family, so it falls outside every
  catch-all in the annex. **So provenance cannot be embedded in a 3D asset.** The constructive half:
  the byte-range hard binding "can be used on any type of asset", and the specification provides for
  external manifests, so a model **can** be covered — as a sidecar file, with **nothing in any
  standard keeping the two together**. That is a real, specific, fillable gap and it is squarely
  this group's business.

  **One attribution trap, same date.** Do-not-train signals and verifiable credentials were
  **removed from that specification's core in version 2.0, January 2024**; its own version history
  says so. Both now live at a different body, in its creator assertions working group: the training
  and data mining assertion, version 1.1, ratified 2025-05-16, and the identity assertion, version
  1.3, ratified 2026-08-17. The substance survives — the identity assertion does use verifiable
  credentials — but anyone saying "that specification carries verifiable credentials" is describing
  a document that has not existed for two and a half years, and a member of that coalition in the
  room will correct it.

### Contested — more than one body covers the same ground
- **Identity.** Verified 2026-08-20, and the detail matters more than the headline. Two things are
  genuinely ratified: the credential data model, a recommendation since 2025-05-15 alongside two
  securing formats, a revocation status format and a controlled-identifier recommendation — five
  recommendations published that same day — and the identifier core, a recommendation since
  2022-07-19. Three things are not. The revision of the identifier core has sat at candidate stage
  since 2026-03-05 and has passed the date it could have advanced. **No concrete identifier method is
  standardized at all** — **267** are registered, in the register dated **2026-08-12**, and the
  registry says in its own words that listing is not endorsement; the most commonly cited one is a
  draft in a community group. And **no ratified recommendation defines how two parties actually
  exchange a presentation.** That protocol layer is a final specification at a different body, and
  only a working draft at the one that owns the data model. So: the nouns of identity are
  standardized and the verbs are not, which is the same pattern as everywhere else on this map.

  **Corrected 2026-08-24: the count was 268 here and it is 267.** The old figure counted the
  register table's header row as a method. Date the figure whenever you state it, because it moves.

  **Two things this entry used to run together, separated 2026-08-24.** Verifiable credentials do
  **not** require decentralized identifiers. The data model requires the issuer to be a web address
  and *recommends* that it resolve to a controlled identifier document; decentralized identifiers
  appear as one example among plain identifiers and ordinary web addresses. Treating the two as one
  story overstates how much of the credential stack depends on the identifier stack. And **selective
  disclosure is the issuer's choice at issuing time, not the holder's**: the data model requires the
  issuer to secure the credential with a mechanism that supports it. A holder cannot add selective
  disclosure to a credential they already hold. That bears directly on any avatar or wearable
  credential where the issuer is a platform — the person wearing it has no way to narrow it later.
- **Scene and world description.** The transfer format and the scene description format both claim
  parts of this, and their boundary is a live question rather than a settled one. Both sides are
  moving at once. Version 2.1 of the transfer format adds complex scenes and a top-level shapes
  array. **Be careful with its timing.** A Khronos conference presentation in July 2026 says ratify
  in the last quarter of that year, but no specification page, press release or roadmap states a
  date, the specification address returns nothing, and several announced features have no draft text
  at all. Say a conference slide said it, not that it is scheduled; interactivity was submitted for
  ratification on 2026-07-16, sits at **Release Candidate**, and — unlike the physics work — its
  specification text is **merged into the repository** rather than sitting in an open pull request.
  Submitted is still not ratified. A Gaussian splatting extension sits at Release Candidate too,
  announced 2026-02-03, with merged text; it defines how to **store** splats, not how to draw them.
  On the other side, the scene description alliance has geometry and materials specifications in
  progress, **described in July 2026 as expected later that year** — say who described them and
  when, not that they are scheduled — and has begun an international standardization process with
  its next core version. Expect the boundary argument to reopen twice before the year ends.

  **The ratified extension count, corrected 2026-08-24.** The ratified list for the transfer format
  holds **23** entries — twenty with the consortium prefix, three with the multi-vendor prefix. This
  project previously said 26. The load-bearing half is unchanged: **none of the 23 is physics and
  none is audio.**
- **Large 3D geospatial data.** Two different streaming formats from the same body, plus vendor
  alternatives.

  **Three findings added 2026-08-24, each checkable and each usable in a room.** The tiled format is
  an **OGC Community Standard**, not an Implementation Standard — submitted by a single company and
  approved by the membership rather than produced by a working group there — and the address this
  project was citing for it returned HTTP 404 because the path segment carries the classification.
  Anyone from that consortium in the room knows the difference. The tiled format **never mentions
  the geospatial pose standard**: zero occurrences in the full text. Two standards from the same
  consortium, both about placing things on the Earth, with no reference between them — a concrete
  gap this group can act on rather than argue about. And the tiled format **normatively depends on
  two extensions the transfer format's own registry does not list at any stage**, for its metadata
  model. An approved standard from one body depends on extensions another body's registry does not
  carry.
- **Avatar description.** Verified 2026-08-20, and moving faster than any other cell on the map.
  Today: the open avatar format has been at version 1.0 since **2022-09-22** — our research still
  lists it as a zero-point release — alongside vendor formats and engine-native rigs that do not
  fully round-trip into one another. And an **international avatar exchange format is one stage from
  publication**: approved for its final stage on 2026-07-31, expected to publish at the beginning of
  2027. The catalogue still titles the document a **draft**, so do not call it published. Its
  declared purpose, taken from the group's own press release rather than a catalogue abstract, is
  letting an application export and import a user's personalized avatar across other applications,
  services and worlds. It defines a data model, container formats, animation sample formats, and a
  binary streaming format.

  **Withdrawn 2026-08-24.** This entry used to say a matching avatar extension for the common asset
  format was "an unmerged draft targeted for December 2026". **No avatar extension for that format
  exists at any stage of its registry** — not ratified, not in progress, not vendor. There is no
  draft, so there was nothing behind the date. What is verifiable in its place is a press item dated
  **2024-10-23** announcing a collaboration with the avatar format consortium towards international
  standardization. No target date. Do not state one.

  **Also withdrawn 2026-08-24, and this is the important one.** This entry used to say the avatar
  exchange draft "is the first formal standard whose stated job is carrying an avatar between
  worlds." **That is false.** The **same committee's 2016 standard** is described on the group's own
  page as existing "to make it possible to migrate a virtual object or its characteristics from one
  virtual world to another." Ten years earlier, same committee. Nor is the skeleton unclaimed:
  **clause 26 of the older extensible 3D scene standard** binds a separate international standard in
  as nodes — humanoid, joints, segments, attachment sites and displacers — and it is **ratified**.
  Saying "first" here would be corrected in the room by somebody who already knows.

  **So why does the avatar draft still matter to us?** Not because it is first. Because it is the
  most recent formal attempt, and because of what it does and does not settle. It sits **on top of**
  the common asset format rather than competing with it — in the group's own examples every mesh is
  a binary file in that format, and the guidelines say it "can be loaded with any conformant glTF
  software." It does not carry a session, an inventory, or a permission, so it answers part of
  portal handoff and not the rest. And it defines the **structure** of animation without the
  **agreement**: joint and shape identifiers must match an outside animation framework, named in the
  file header by a reference string, and the group's own worked examples name one headset maker's
  body and face tracking plus one phone maker's landmark set. **The agreement is borrowed, not made
  here.** If this group is choosing what to work on, build on it rather than beside it, and be clear
  in public about which part of the problem it leaves open — which is the body problem: the draft
  maps parameter to parameter between tracking frameworks, not motion between differently
  proportioned bodies, and the mapping must be authored in advance.

  **Two conversion traps, both documented by the group itself, which makes them safe to raise.** Its
  matrices are **transposed** relative to the common asset format — the group's own implementation
  guidelines say so — so a converter that copies the sixteen numbers straight across **loads without
  error and places the avatar wrongly**. And what the draft calls a **skeleton** is what the common
  asset format calls a **skin**. A third: a shape there is a **whole replacement mesh** with matching
  topology, not per-vertex offsets.
- **Digital twin state.** Several bodies, several models, weak agreement on real-time state
  synchronization.
- **Spatial audio.** Corrected 2026-08-20 after checking, and this one was wrong in our own
  research. A full International Standard for six-degree-of-freedom immersive audio published on
  2025-11-03 — three days after the research that called this a gap was written. It models objects,
  reverberation, early reflections, occlusion, diffraction and Doppler shift. One immersive runtime
  interface gained a spatial audio extension on 2026-03-31, though from a single vendor and not
  ratified. A separate 3D scene format has carried an audio component as part of an International
  Standard since 2023. What is genuinely missing is narrower: a ratified, royalty-free,
  engine-neutral audio extension for the common asset format. Say the narrow gap, not the wide one.

  **The verification-test line was withdrawn 2026-08-24.** This entry used to say the verification
  test "completed in January 2026", written from memory. The report has its own identity and date:
  **2026-01-23**, six laboratories, 56 listeners after screening, median 84 on a 100-point scale, in
  the band the test method labels excellent. Cite the report and its date, not "January 2026".

  **And say the limit out loud.** The normative text of that audio standard was **never read by this
  project** — it is sold, not published. Everything above comes from the catalogue record, the
  group's own standard page, the approved white paper and the verification test report. Every row in
  its coverage record therefore sits at `reported` confidence, not `verified`. The record previously
  claimed `verified` on all five of its audio rows while citing a catalogue abstract.

  **The audio proposal's name, date and number were withdrawn 2026-08-24.** This entry used to say
  the missing extension's proposal "has been open since March 2022 and is still unmerged", with a
  pull-request number. **That extension name is not in the registry at any stage.** What the
  in-progress table lists is a different audio extension at **Proposal** — the earliest stage — under
  a different pull-request number. Do not repeat the old name, the 2022 date or the old number. Two
  further audio proposals were filed against the same repository on 2026-08-19. The load-bearing
  claim is unaffected and is now stronger: **the word "audio" does not occur once in the body of the
  common asset format's 2.0 specification.** The seven occurrences in the published file are page
  styling.

  **Three more limits, added 2026-08-24.** That audio standard has **no voice transport**: it can
  render a talker's voice into a scene once the voice has arrived, and its white paper lists social
  use as a use case, but it defines nothing about carrying live voice between participants. It
  **describes the room a second time, for sound** — its encoder takes its own scene description
  holding sources, geometry, transforms and material acoustic coefficients, separately from however
  the room is described for pictures. That is a duplication cost and a candidate for a binding
  between two descriptions of one room, which is squarely this group's kind of work. And its
  "materials" are frequency-dependent sound energy coefficients — transmitted, reflected, coupled,
  absorbed. **No friction, no restitution.** Do not score a physics cell off the word "material".

  **One trap on the older 3D scene format's audio, same date.** The words "occlusion" and
  "obstruction" occur **zero times** in its sound clause. Its propagation model covers reflection,
  refraction and absorption against surrounding geometry, and nothing specifies what happens to a
  sound behind a wall. Anyone extrapolating from "acoustic rendering" to "occlusion is covered"
  would be corrected in the room.
- **Physics.** Corrected 2026-08-20, and this is the second time in one day that a cell we called
  empty turned out to be filled. A published international standard has defined rigid bodies,
  collision shapes, collision spaces, contacts and six joint types since **2008**, and it is current:
  the fourth edition published in December 2023. It sits inside a scene format that today's engine
  ecosystem barely uses. Meanwhile the two formats that ecosystem does use have nothing ratified —
  rigid bodies and collision shapes at review draft on one side, and on the other a rigid-body draft
  that has never been merged and lives in an open pull request. And a declarative description of
  bodies and joints is not the same thing as two different engines producing the same outcome from
  the same inputs. That part is genuinely unsolved and may not be solvable.

  **A date claim was withdrawn 2026-08-24.** This entry used to say that second rigid-body draft
  "missed its second-quarter 2026 target", and elsewhere this project said the draft was accepted by
  vote at the end of October 2025. **Neither the vote date nor the ratification quarter could be
  reached in a primary source on a fresh pass. Do not state either.** What survives, verified and
  quoted, is the exclusion itself: geometry, materials and physics are outside that alliance's
  published core, and nothing has been published in their place.

  **One condition on the ratified standard, added 2026-08-24.** Its rigid body physics and its
  simulation component sit in the **fullest profile**. A reader can conform to the standard without
  implementing either. "Ratified since 2008" is true and it is not unconditional support; say the
  profile with it. Related, and useful: that standard also lets a file **declare a different unit of
  length** with a UNIT statement, where the common asset format fixes metres with no escape. A
  reader that assumes metres will silently mis-scale content.

- **Immersive device access in the browser.** Corrected 2026-08-20 after checking. This is not
  covered. The browser immersive interface ships by default in the Chromium engines; a second
  engine ships it only on headsets; a third has never enabled it in a release and its standards
  position is a blanket defer. Two engine families, not three, and one of those is headset-only. Do
  not describe browser immersive access as settled.

### Empty — no ratified standard to build against today
These are the cells where the working group has something to do. Where work is in flight, it is named.

- **Addressing.** Checked three separate ways, and it survived where other cells did not. No
  ratified standard from any accredited standards body names a place **and** resolves that name into
  a joinable destination. Every candidate does one half or the other.

  **Say it with someone else's survey, not your own claim.** A recognized European standards body
  published a virtual worlds landscape report in October 2025 that assessed 912 standards and 354
  technical reports. It contains no place-addressing standard, no address scheme, and no inter-world
  portaling standard — and its eight-domain taxonomy has no addressing or naming category at all.
  Its follow-up, six months old, names the same hole: no interoperable frameworks for identity,
  assets and immersive environments.

  **The precedent nobody mentions.** The internet standards body chartered exactly this work. A
  working group on moving avatars between regions ran from 2010 and concluded in 2011 with **zero
  published documents**. Its predecessor exploratory meeting also concluded with zero. So the first
  question for this group is not "should we do it" but "why did the last attempt fail, and what is
  different now."

  **The one ratified standard that contemplated virtual places, and stepped back.** An international
  geographic standard from 2012 defines a place identifier architecture, and its scope explicitly
  includes places "not only in the real world but also those in the virtual world." Then it says, in
  the same scope: it is *"not about... defining a unique, standardized description of defined
  places, such as an address coding scheme."* It ships an identifier model and an equivalence table.
  No resolver. The gap was seen and deliberately left open.

  **What everyone actually does instead, having converged on it independently:** ordinary web
  addresses plus fragment and path conventions. The older 3D standard does it. Two of the best-known
  shared-world systems do it. And the Forum's own most advanced addressing proposal does it too —
  its interface uses plain addresses with fragments for join, follow and preview, inventing no new
  scheme. That convergence is a finding, not an accident. It says the answer is probably a profile
  over the existing web, not a new scheme.

  **The Forum has already said where it thinks this belongs**, in its own words: the 3D web
  consortium and the international standards organization, with liaisons at the web, geospatial and
  graphics bodies, to develop an address interface. That is a ready-made referral path, and using it
  is exactly what a body that does not write standards is for.

  **Three traps.** The public scheme registry lists two entries whose names look close; they are
  from a software identification standard. Another registry entry that looks like a blockchain
  naming service is actually a pandemic exposure notification scheme from two phone makers. And old
  drafts matching the portaling acronym are a 1995 white pages directory project. All three are
  ready-made ways to be told you are wrong when you are not.

  **This is the cell I would put forward as ours.**

- **Portal handoff.** Say this precisely, because the loose version is wrong. **Plain traversal is
  ratified** — the older extensible 3D standard has an anchor node that replaces one world with
  another, and it has been an international standard for years. What nothing ratified does is
  **carry the user's state across that jump**. So the sentence is: **nothing ratified** lets you
  arrive in another world with your identity, appearance and possessions intact. Verified 2026-08-20
  by reading the identity specifications themselves: they stop short deliberately. The identifier
  standard says what happens after the authentication check is out of scope and left to
  applications. The credential standard says the separation of roles *suggests likely interfaces for
  standardization* — an admission that the protocols are future work. They give you portable claims
  about a person. They do not give you a portable session.

  **Two framing corrections, 2026-08-24, both of which stop you being caught.** First, that
  "separation of roles" sentence sits directly under a line reading **"This section is
  non-normative."** The sentence is real and it is the right point, but anyone who opens the
  specification sees that line above it. Lead with the fact yourself. Second, "the word handoff does
  not appear in either" is a **full-text search result**, not something either specification says.
  The search result stands — zero occurrences across both plus the newer identifier draft — but do
  not present it as a quotation, because it cannot carry one.

  **Name what is in flight, because the flat word "empty" is wrong here.** The project's own
  coverage database records the portaling draft occupying this cell **natively**, and it is that
  subject's only fully specified capability; one spatial fabric sits there as a recorded collision;
  and one row describes a crossing that **was actually performed**, carrying pose, session,
  equipment, a continuity identifier and fifteen manifest facets between two separate world servers,
  with a fail-closed gate deciding whether traversal into a child scope was allowed at all. None of
  that is ratified, so the cell stays here under this overlay's own definition — but "nobody has
  built one" is false and would be corrected in the room.

  **The single strongest sentence this project has, and it belongs here.** In the only published
  design that actually resolves a portal, the destination field reads *"Coordinates in a form
  determined by the Destination World. If not given, Destination World chooses the location"* — and
  it is **optional**. There is **no orientation field at all**, so a person can be placed but not
  aimed. **The only published design that resolves a portal does not standardize the name inside
  it.** That document also advertises three sections it has not written — asset transfer, look and
  feel, and payments each consist of one line reading "TBD" — while its own summary advertises asset
  transfer. Its upstream repository has not moved since 2025-09-25.

  **One thing to be careful about.** This project has referred to "the review comments on the
  portaling draft" as though a comments document existed. **It does not exist anywhere** — no
  comment numbers, no severities, no proposed remedies, no cover note. What exists is a capability
  assessment inside one coverage record. Somebody has to write the comments before anything can be
  sent, and nothing has ever been sent to that consortium.
- **Federated presence.** No standard way to know who is where, across operators. The web
  consortium has no report on the subject at all: filtering its whole technical report index for the
  word metaverse returns nothing, and its community group on the topic has published no reports, has
  one mailing list message since June 2024, and was proposed in 2021.
- **State replication.** Welded to each engine in practice, and nothing crosses vendor lines in the
  formats today's engines use.

  **Corrected 2026-08-24: "no body has proposed that it should" was false.** **Clause 28 of the
  older extensible 3D scene standard defines networked state sharing across host computers**, bound
  to a long-standing simulation protocol. It is **ratified**, and nothing else on this map has it.
  This is one of **five** capabilities that same older standard turned out to hold after this
  project called them unclaimed. So the honest sentence is not "nobody has standardized it" — it is **"a ratified
  international standard has covered it since before the current formats existed, and the industry
  passed it over."** That is a stronger claim and it cannot be corrected from the floor. What is
  genuinely absent is a replication design the engines in current use will adopt.

  One more thing does exist, and it is worth naming precisely: the avatar exchange draft's
  replication provision is **the only live shared avatar state any formal standard now defines** — a
  wire form for the moving parts as timed units. It carries **no session, no ownership rule, no
  interest management, and no correction after a late packet.** That is a precise statement of what
  is still missing, and it is better than calling the cell empty.
- **Portable capability and permission.** No agreed statement of what an entity is allowed to do,
  readable by a world that did not issue it, that any body has ratified.

  **Corrected 2026-08-24: the level was wrong, and the old sentence was the wrong sentence.** This
  entry used to read that the credential model "carries claims about a holder, not permissions a
  receiving world can act on". **The permission slots exist.** The identifier standard defines
  `capabilityInvocation` and `capabilityDelegation`. The credential data model has a `termsOfUse`
  property and can carry permissions as claims. Both are scored `partial`, quoted. The sharper and
  uncontestable sentence is: **the slot exists and the vocabulary does not.** Nobody has agreed what
  to put in those slots so that a world which did not issue the credential can act on it.

  **State this before you show the cell to anyone.** In the project's own coverage database the only
  subject sitting in this capability natively is the **Universal Manifest**, a draft at version 0.4
  scored at `reported` confidence — and it belongs to a co-chair's own company. That is a
  governance problem before it is a data problem. Whoever presents this must say so first,
  unprompted.
- **Portable animation and behaviour.** How a skeleton moves largely does not travel between worlds.

  **The skeleton half is not open, corrected 2026-08-24.** Clause 26 of the older extensible 3D
  scene standard binds a separate international standard in as nodes — humanoid, joints, segments,
  attachment sites and displacers — and it is **ratified**. It is the thing the common asset format
  still lacks, and it has existed for years. What remains genuinely unsettled is motion: the avatar
  exchange draft defines the structure of animation but borrows the agreement, requiring joint and
  shape identifiers to match an outside tracking framework named in the file header, and it maps
  parameter to parameter between frameworks rather than motion between differently proportioned
  bodies.
- **Rights enforcement.** Nothing anywhere makes a world honour the rules attached to an asset it
  did not issue. **This is the genuinely empty half.** The other half — writing the licence and
  rights down so they travel with the asset — **is covered**, natively by the open avatar format and
  through a ratified extension to the common asset format. This document used to collapse both
  halves into one empty cell and got one of them wrong; the correction is set out below.

**The pattern in that list.** Every covered cell is about a *file* — a thing you can write down,
hand over, and validate offline. Every empty cell is about a *live session* or an ongoing
obligation — two running systems agreeing about a moving world in real time, or one system honouring
a rule the other one set. We have standardized the nouns and left the verbs alone.

**The "one empty noun" argument is withdrawn, 2026-08-24.** This document used to close by saying
that licence and rights metadata is a file problem that is empty too — *"it is the one noun we did
not standardize"*, *"that is the sharpest thing this map says."* **The database withdrew that on
2026-08-22 and it is wrong.** Licence **metadata** is covered, twice over: the open avatar format
carries it **natively** — its meta block requires a name, at least one author and a licence document
link, then adds eleven machine-readable settings covering who may act as this avatar, commercial
use, credit, redistribution and modification — and a **ratified** extension to the common asset
format exists precisely to attach attribution and licensing metadata to an asset or to individual
objects.

**The true position is split, and the split is the finding.** Licence metadata travels. **Rights
enforcement does not, and is reached by nothing on this map.** Writing the permissions down is
solved. Making a world that did not sell you the asset act on them is untouched — and that is a
session-and-obligation problem, not a file problem. So the exception disappears and the pattern gets
cleaner: **everything we standardized is a file; everything we did not is a running system keeping
a promise.** Do not repeat the "one empty noun" line, in this document, on a slide, or from the
board — the board still carries it.

**And here is the sharpest thing this map says, which is not what this document used to claim.**
Six times now, this project has declared a cell empty and found a **ratified** standard already in
it that the industry passed over: spatial audio, physics, avatar portability, humanoid skeletons,
tiled terrain streaming, and shared state between running instances. Five of the six are in the same
older scene standard; the sixth is a 2016 standard from the same committee as the avatar draft we
called the first of its kind. A seventh of the same shape sits alongside them — conformance, covered
clause by clause in that standard while the newest scene specification on this map says its own
conformance tests "will be made available", future tense.

**What follows from that is the part that changes what this group does.** Every one of the six was
ratified and every one was ignored. **So the problem is not capability. The problem is adoption.** A
capability gap and an adoption gap look identical from outside — both read as "nobody does this" —
and they need opposite interventions. **Writing another specification answers a capability gap. It
does nothing whatever for an adoption gap, and it has now failed six times in a row here.** An
adoption gap needs the other work: finding out why implementers passed the thing over — profile
complexity, licence terms, tooling, timing, or nobody asking — and fixing that, or making a
deliberate and stated decision to supersede it.

**The rule, and it is cheap to follow.** Before this group declares any cell empty: check the older
ratified standards first, especially the components-based scene standard, which has been the answer
five of the six times. If something already covers it, say the gap is **adoption** — a stronger
claim that cannot be corrected from the floor. And if you still want a new specification, say what
changed. If you cannot answer that, you are about to write the seventh.

That is the sentence I would like the working group to argue with.

---

## How the planes connect

The lines worth drawing on the board:

- **Entry point → topology.** Rungs 1 and 2 force Model B. Only rungs 4 and 5 reach Model C.
- **Topology → which sockets matter.** Model A barely cares about asset format and cares intensely
  about session handoff. Model B is the reverse. Model C needs both plus identity.
- **Welded parts → where standards cannot reach.** Scene graph, scripting, networking, user
  interface, and editor are welded in the major engines. A standard aimed at a welded part will not
  land, however good it is.
- **Empty cells → Model C's blockers.** Every empty cell above is a thing Model C needs a *standard*
  for, and Models A and B can live without one, because a single operator supplies the agreement
  instead. The gaps are not random. They are exactly the work that only matters once you stop having
  a single operator.
- **Adoption gaps → where a new specification will not help.** Six of the cells this project called
  empty already hold a ratified standard nobody implemented. A line drawn to those cells should say
  "adoption", not "missing". They need a different intervention from the genuinely unclaimed ones.

---

## Questions for the working group

Six, in the order I would take them.

1. Do we accept the split between file standards and session standards, and if so, is the session
   half our scope?
2. Of the empty cells, which two are ours? Addressing and portal handoff are the candidates I would
   put forward.
3. Where a cell is contested, is our job to pick a winner, to define the boundary, or to stay out?
   Remember the constraint: the Forum's own published answers say it does not create standards and
   that all the standardization work stays with existing standards organizations. So picking a winner
   is not available to us. Defining a boundary and handing it to the body that can act on it is.
4. Do we take a position that a standard aimed at a welded engine part is not worth writing?
5. What does the Infrastructure Working Group own that the Ecosystem Working Group does not, given
   both of us have now produced a taxonomy? Worth knowing before you answer: the Forum consolidated
   to six working groups, and ours is the **renamed Digital Asset Management group** — the old
   address still redirects to it and the page still carries the unrevised earlier charter text. If
   the charter on the public page describes asset management rather than infrastructure, that is the
   first thing to fix, and it is squarely a co-chair's job. A second roster question: the Forum's
   interoperable characters and avatars group still has a live page with named chairs and a charter,
   but does not appear on the current active groups index, and its avatar and character translation
   framework is still listed as an upcoming deliverable rather than a published one. Whether that
   group concluded, merged, or the index is stale is not stated anywhere public. Worth asking,
   because the avatar exchange format above is about to land on exactly its subject.
6. **Added 2026-08-24, and I would rather this one were asked early than late.** Six times this
   project declared a cell empty and found a ratified standard already in it. Do we accept that our
   central finding is an **adoption** failure rather than a capability gap — and if we do, is
   investigating why six ratified standards were passed over a better use of this group than
   proposing a seventh?

---

*Companion to the architecture map board.*

**Before quoting anything from this document at a standards meeting, read**
`research/sources/DO-NOT-REPEAT.md`.
It lists the figures in this family's research that are misattributed, arithmetically wrong, or
stale, and the parts of this map that are description rather than findings.

**On version numbers, updated 2026-08-24.** This document used to state none by design. The blanket
rule is lifted, because the standards check has landed: version numbers and statuses are now
recorded in `sources/VERIFIED-CORRECTIONS.md` and in the coverage records, each tied to a source.
The narrower rule replaces it — **state a version number only where that file states one, and state
its date with it.** The figures here are safe because they were checked, not because they are old
enough to trust.

**On the board, and this is live.** The narrative board has **not** been brought into line with
sections 14 to 20 of the corrections file. It still carries "The one empty noun", the flat word
"Nothing" for addressing, "Traversal is ratified. Carrying your state across the jump is not.",
"Claims about a holder, not permissions a world can act on.", "Welded to each engine. Nothing
crosses vendor lines.", "Ratified since 2008" without its qualifier, "Pose on Earth adopted 2023",
and "engine part a standard cannot reach". **Do not read a coverage claim off the board.** A decision
on that page is open, which is why it has not been edited.
