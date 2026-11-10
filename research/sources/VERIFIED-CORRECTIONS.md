# Corrections from the verification pass

Sections 1 to 13 were checked 2026-08-20 against primary sources and applied to the board and to
`model/COMPANION.md` at that time.

**Sections 14 to 20 were merged 2026-08-24 from six separate re-verification passes** (passes A, B and C,
D, E and the platform scoring pass). Those passes found claims in sections 1
to 13 that were wrong. **Every one of them has been corrected in place above, each marked
"Corrected 2026-08-24" or "Withdrawn 2026-08-24" at the line where the wrong claim used to sit.**
Read the marked lines before repeating anything from the earlier sections.

**Sections 14 to 20 have not yet been applied to the board or to `model/COMPANION.md`.** Both still
carry claims listed here as wrong. Section 17 says which ones. Section 20 records the one change
that has already been made, to the subject register.

## 1. Spatial audio is not an empty cell. Our own research was wrong.

**What we said:** no standard exists for spatial audio parameters; room and occlusion behaviour is
per-engine. That claim comes from the gap analysis written 2025-10-31.

**What is true:** a full International Standard for six-degree-of-freedom immersive audio in
virtual and augmented environments published on **2025-11-03** — three days after that gap analysis
was written. It is ISO/IEC 23090-4:2025, edition 1.0, from the joint technical committee on coding
of multimedia information. It defines audio objects together with room acoustic properties:
reverberation, early reflections, occlusion, diffraction and Doppler shift, with listener movement
in three translation axes on top of three rotation axes.

**Refined 2026-08-24 (re-verification pass C).** The verification test line was written from memory. The
report itself is ISO/IEC JTC 1/SC 29/WG 6 N0396, dated **2026-01-23**: six laboratories, 56
listeners after screening, median 84 on a 100-point scale, in the band the test method labels
excellent. Say the report and its date, not "January 2026".

**And say the limit out loud.** The normative text of ISO/IEC 23090-4:2025 was never read by this
project. It is sold, not published — the co-publisher's record prices a single-user electronic copy
at CHF 227. Everything above comes from the catalogue record, the group's own standard page, the
approved white paper and the verification test report. Every row in the coverage record now sits at
`reported` for that reason. The old record claimed `verified` on all five of its audio rows while
citing a catalogue abstract and a summary page.

**Also moved:**
- A spatial audio extension entered the cross-vendor immersive runtime interface on 2026-03-31 and
  is carried in the current specification. It parameterizes sound objects, directivity, distance
  attenuation, Doppler, ambisonic and surround sound fields, and acoustic materials on obstacle
  meshes. It is a single-vendor extension and **not ratified**.
- A separate 3D scene format has carried a full audio component as part of an International Standard
  since 2023, covering spatialized sound and acoustic rendering.
- The audio file-exchange format for spatial acoustic data went to public comment on a revision on
  2026-01-09, targeted at 2027.

**What is genuinely missing, stated narrowly:** a ratified, royalty-free, engine-neutral audio
extension for the common 3D asset format.

**Corrected 2026-08-24 (re-verification pass B).** This paragraph used to read "That proposal has been open
since 2022-03-31 and is still unmerged", sourced to pull request 2137. **The name that sentence
carried is not in the registry at any stage.** What the registry's in-progress table actually lists
is `KHR_audio_graph` at **Proposal** — the earliest stage — in pull request 2421. Do not repeat the
old extension name, the 2022 date or the old pull-request number without a fresh check. Two further
audio proposals were filed against the same repository on 2026-08-19.

The load-bearing claim is unaffected and is now stronger: **the word "audio" does not occur once in
the body of the glTF 2.0 specification.** The seven occurrences in the published file are all in its
own page styling.

**Say the narrow gap, not the wide one.** Claiming nobody is working on spatial audio is false and
several people in the room will know it.

**Also confirmed empty:** the internet engineering body has no working group, no charter item and
no active draft on spatial audio. Nothing since a 2018 document on ambisonics in a container
format. The Metaverse Standards Forum has no audio group; it held one cross-organization session on
audio on 2025-05-28 and formed nothing after it.

## 2. Browser immersive device access is not settled

**What we said:** both the native and the browser immersive interfaces are real, implemented and
multi-vendor.

**What is true:** the native cross-vendor runtime interface is genuinely multi-vendor. The browser
one is not. It ships by default in the browsers built on one engine family. A second engine ships
it only on a headset platform, first in September 2024. A third engine has never enabled it in a
release; its tracking bug is still open and its recorded standards position is a blanket defer.
Two engine families, and one of those is headset-only.

**Applied:** this socket moved from covered to contested on the board.

## 3. The web graphics interface is now genuinely covered

The modern web graphics interface now ships by default in all three browser engines: since May 2023
in the first, since July 2025 in the second on one desktop platform and January 2026 on another, and
since September 2025 in the third across its desktop, phone, tablet and headset systems. Gaps
remain on some operating system and hardware combinations. Stating that it ships across browsers is
safe.

## Method note

The verification used primary sources: specification registries, browser release notes, standards
body project pages, and publisher records. Two sources could not be reached and anything depending
on them is marked unverified in the underlying result files, not repeated here.

Underlying results:
the maintainers' working notes (not published)

## 4. Eight claims in our own standards research are wrong

A check of nineteen standards against primary sources on 2026-08-20 returned two safe to repeat,
nine needing update, and eight wrong. The eight, with what is actually true:

- **Pose on Earth.** Called a draft seeking uplift. It is an adopted standard. It was already wrong
  when our research was written. This is the one most likely to be caught by someone in a
  geospatial-adjacent room. **Refined 2026-08-24 (re-verification pass C):** the single date 2023-09-08 was a
  conflation. The document records **two** dates in its own front matter — approval **2022-06-20**
  and publication **2023-09-08**. State both, or state which one you mean.
- **The spatial web protocol from the electrical engineering body.** Called a draft with an
  uncertain timeline. It was board-approved on 2025-05-28 and carries both a modelling language and
  a transaction protocol. A whole standard shipped while we were not looking.
- **Verifiable credentials.** Called an implementation phase with a 2024 call for implementations.
  It has been a full recommendation since 2025-05-15, with six companion recommendations the same
  day.
- **The tiled 3D format at version 1.1.** Called adopted January 2025 with the specification
  address unknown. It was approved 2022-12-17 and published 2023-01-12 — off by two years. Both
  dates re-confirmed 2026-08-24 from the document's own front matter. **Two corrections to the rest
  of this bullet, both 2026-08-24 (re-verification pass B) — see section 14 for the full entry.** It is an
  **OGC Community Standard, not an OGC Implementation Standard**, and the address we published for
  it returned nothing. And the 2.0 sentence was two things run together: version **1.1 already**
  deprecated the four original tile formats in favour of the common asset format, in the published
  standard; version **2.0**, in development, rebases the whole tileset on the unratified next
  version of that format and carries the tile tree itself as an extension to it.
- **The Forum's own working groups.** Our research lists fifteen. There are six: 3D assets,
  accessibility, artificial intelligence and the metaverse, ecosystem, infrastructure, and spatial
  computing. Membership is above 2,500, not 2,400. The Forum does now publish deliverables.
- **The modern web graphics interface.** Called a working draft. It is a candidate recommendation,
  a full stage further on, and that was already true when our research was written.
- **The open avatar format.** Listed at a zero-point version. It has been at 1.0 since 2022-09-22.
  **This bullet used to end: "The matching avatar extension for the common asset format does not
  exist yet: unmerged draft, ratification targeted December 2026." That sentence is withdrawn as of
  2026-08-24 (re-verification pass B).** There is no avatar extension anywhere in the format's registry — not
  ratified, not in progress, not vendor. There is no draft to point at, so there is nothing behind
  the December 2026 date and it must not be repeated. What is verifiable is a press item dated
  **2024-10-23** announcing a collaboration between the graphics consortium and the avatar format
  consortium to work towards international standardization. Say that, and say no date.
- **The cyber-physical interface family.** A year and a publication date are transposed, one
  standard's title carries scope belonging to a separate project, and one date given as approval is
  actually publication.

One further trap inside an otherwise safe section: the interactivity extension for the common asset
format is listed as ratified. It is a release candidate, submitted for ratification on 2026-07-16.

## 5. Two findings that bear on your own seat

- **The Infrastructure Working Group is the renamed Digital Asset Management group.** The former
  address redirects to it, and the public page still carries the unrevised earlier charter text.
  Nothing about that consolidation was announced publicly, which is why a research pass built from
  public sources missed it.
- **A consortium newsletter dated 2026-05-19 lists Universal Manifest, credited to Sumset Tech, as
  one of its four standards tracks.** Worth knowing before someone else mentions it.

## 6. Three gaps moved backwards — one of these was wrong, corrected below

Reported by the first check. The independent verification changed one of them, so read section 11
before repeating any of this.

- The portal primitive for the common asset format was reported archived on 2026-03-10 with no
  successor. **Still unconfirmed. Do not state it.**
- The inter-world portaling work at one consortium was reported frozen. **That word is wrong — see
  section 11.** The dormancy is real; the freeze is not a public position.
- A web consortium community group on metaverse interoperability has no deliverables and almost no
  list traffic. **Confirmed independently.**

None of the seventeen gaps in our research has fully closed. One is half closed: spatial audio,
covered above.

## 7. Physics: verified, and the reason matters more than the fact

Checked 2026-08-20 against the format registry, the ratified specification text, the complete press
release index back to November 2023, the news and blog indexes, the working group officer list, and
the format's own July 2026 roadmap presentation.

- **Ratified physics extensions for the common asset format: zero.** The ratified list holds **23**
  entries and none is physics. The ratified specification text contains no physics functionality at
  all; the single occurrence of the word is a naming example.
  **Corrected 2026-08-24 (re-verification pass B): this line used to say 26. It is 23** — twenty carrying the
  consortium prefix and three carrying the multi-vendor prefix, ratified after becoming widely used.
  Counted twice from the downloaded registry file. The load-bearing half is untouched: none of the
  23 is physics and none is audio. Only the number changed. Do not say twenty-six.
- Rigid bodies and collision shapes sit at **review draft** — two stages below ratified, on a ladder
  of proposal, initial draft, review draft, release candidate, ratified. They live in open pull
  requests with **no merged specification folder**.
- A third proposed extension for basic shapes was **withdrawn**: version 2.1 of the core format
  absorbs it as a top-level shapes array covering box, sphere, capsule, cylinder and plane.
- A fourth name that circulates, for physics joints, **is not in the registry at all**. Joints are
  described in roadmap material as a feature of the rigid-body work, not a separate extension. Do
  not cite it as one.
- **There is no dedicated physics sub-group.** The five named sub-groups are tooling, physically
  based rendering, volumetric media, interactivity, and character and avatar. Physics runs under the
  3D formats group itself.
- **Ratification is gated on version 2.1 of the core format**, which that group's own July 2026
  roadmap slide says the last quarter of 2026 — see the timing caution below. It cannot ratify
  before the version it depends on, whenever that lands.

So the honest sentence is not "nobody is standardizing physics." It is: **the work is real, it is
two stages from ratified, and it cannot land before the core format version it is tied to.**

### Related, and worth knowing before the call

- Version 2.1 of the common asset format adds complex scenes and the shapes array. **Be careful
  with its timing.** Checked again 2026-08-22: draft text exists only on a working branch, two
  feature sets are merged and several announced ones have no draft text at all, the specification
  address returns nothing, and **no specification page, press release, milestone or roadmap page
  states a ratification date.** The only source for the last quarter of 2026 is a slide in a Khronos
  conference presentation. Say a conference slide said it. Do not say it is scheduled.
- The shapes supersession is real but half-executed: the extension registry still lists that work as
  active at review draft, under a different name from the pull request itself, and the core gives
  shapes no behaviour — the draft says they do not automatically have behavior, leaving colliders to
  extensions, and the rigid-body extension has had no activity since January 2026.
- The interactivity extension was **submitted** for ratification on 2026-07-16, with three companion
  extensions. Submitted is not ratified. Our research calls it ratified. It is not.
- A Gaussian splatting extension is at release candidate, announced 2026-02-03.
- An initiative to extend the format for volumetric media was announced 2026-06-15.
- **No completed ratification of any extension to that format was announced in 2025 or 2026.**

## 8. The scene description standard is real, and narrower than we said

Checked 2026-08-20 against the alliance's own specification repository, its published process
document, its working group charters, and its news index.

- The alliance has published **exactly one specification**: the core specification, version 1.0.1,
  dated 2025-12-12. It is a ratified final deliverable under a no-derivatives licence.
- It covers data types, the document model, paths, resource resolution, composition, value
  resolution, schemas, colour, collections and file formats. The only schemas it normatively
  defines are colour and collections.
- It **explicitly excludes geometry, materials and physics**. The word physics appears in the whole
  document exactly once, in the sentence that excludes it.
- Geometry, materials and physics are separate working groups with separate specifications. **None
  is published.** Their 1.0 releases were described in July 2026 as expected later this year.
- ~~The physics draft was accepted by vote at the end of October 2025 and targeted for ratification
  in the second quarter of 2026.~~ **Withdrawn 2026-08-24 (re-verification pass B): neither date could be
  reached in a primary source on a fresh pass. Do not state a vote date or a ratification quarter
  for that draft.** What survives, and is quoted in the coverage record, is the exclusion itself:
  geometry, materials and physics are outside the published core, and nothing has been published in
  their place.
- The next core version has begun an international standardization process.

**How to say it:** the composition machinery is standardized. What you put inside a scene — its
geometry, its materials, its physics — is not, on either side of the format argument.

**One naming trap.** The announcement calls it version 1.0; the only artifact that exists is 1.0.1,
whose own changelog calls itself the initial release. There is no 1.0.0. Cite 1.0.1 and the date.

**A second trap.** A later announcement refers to a next-version "release", but no such document
exists in the specification repository. Do not treat that as published.

## 9. Physics is not empty either — and this is now a pattern

Checked 2026-08-20 across the international standards catalogue, the web consortium's technical
report index, the electrical engineering body's standards catalogue, the geospatial consortium's
published standards list, and the Metaverse Standards Forum's own pages.

**A published international standard has defined rigid body physics for 3D scenes since 2008.** It
is clause 37 of the architecture part of the older extensible 3D scene standard, current fourth
edition published December 2023, status published, stage 60.60. It defines rigid bodies, rigid body
collections, collidable shapes and offsets, collision spaces, collision collections, collision
sensors, contacts, and six joint types: ball, single-axis hinge, double-axis hinge, motor, slider
and universal. The same clause is present in the 2008 and 2013 editions.

**Nobody else has one.** The web consortium has no physics specification at any maturity. The
electrical engineering body's metaverse standards cover sensors, actuators, synchronization
architecture and a training-system architecture — not scene physics. The geospatial consortium has
none. The immersive media scene description standard has no physics in any published edition. And
the Metaverse Standards Forum, by its own published statement, does not create standards at all.

**So the honest position on physics** is: a ratified international standard exists and is being
ignored by the formats in current use; those formats have drafts that have both slipped; and
cross-engine determinism — two engines producing the same outcome from the same inputs — is a
separate problem that nobody has solved and that may not be solvable.

### The pattern, which is the more useful finding

Two cells were called empty in our research. Both turned out to be filled by the same older scene
standard that today's formats passed over: audio, and now physics. That is not a coincidence worth
ignoring. **Before this working group declares a gap, the first question is whether a standard
already answers it and was passed over — and why.** Sometimes the answer to a gap is not a new
specification.

**Updated 2026-08-24: it is no longer two. It is six.** The re-verification passes found four more,
all in the same older standard, all ratified, all passed over: avatar skeletons and bodies, tiled
terrain streaming, shared state between running instances, and conformance. A separate committee's
2016 standard turned out to have declared the avatar-portability job years before the draft we
called the first to try it. **Six instances is not a coincidence, and it is the strongest single
argument this group can make.** The pattern, and what follows from it, is written out in
`DO-NOT-REPEAT.md`. Read it before declaring any cell empty.

### One constraint to keep in view

The Forum's own published answers state that it does not itself create standards, and that all the
standardization work stays with existing standards organizations. Picking a winner in a contested
cell is therefore not available to this group. Defining a boundary and handing it to a body that can
act is.

### Two cautions on citation

- The catalogue lists a low page count for that scene standard because it is published in web page
  form. It is not evidence that the physics clause was removed. Expect that question if you cite it.
- The catalogue's own online viewer would not serve the text. The clause evidence comes from the
  consortium's copy, which its publisher states is functionally identical to the international one.

## 10. Identity: the headline is right, the detail is where you get caught

Checked 2026-08-20 against the web consortium's specification pages, its technical report index, its
process document, the other body's specification pages, and the registry data itself.

**Ratified, and safe to say:**
- The credential data model, second version, recommendation dated 2025-05-15. Two securing formats
  and a revocation status format were published as recommendations the same day.
- The identifier core, first version, recommendation dated 2022-07-19.

**Not ratified, and easy to get wrong:**
- The revision of the identifier core has been at candidate stage since 2026-03-05. Its own text
  says it was not expected to advance before 2026-04-05. That date has passed and it has not
  advanced. If someone says the identifier standard is at its newer version, that is wrong.
- **No concrete identifier method is standardized.** **267** are registered, in the register dated
  **2026-08-12**. The registry states in its own words that it is not an endorsement of any method
  and exists so developers can discover them. The most commonly cited method is a draft in a
  community group with no status header.
  **Corrected 2026-08-24 (re-verification pass A): this line used to say 268. That count included the table's
  header row.** The correct figure is 267 rows in the table body, counted programmatically from the
  downloaded register. Always date the figure, because it moves.
- **No ratified recommendation defines a presentation exchange protocol.** The one that exists is a
  final specification at a different standards body, dated 2025-07-09, built on an authorization
  framework. At the consortium that owns the data model, the equivalent work is a working draft with
  a charter target of 2028, and a browser-side interface that explicitly declares itself agnostic to
  the exchange protocol and treats the payloads as opaque.

**The load-bearing finding for the map.** The identity specifications stop before the session, and
they say so. The identifier standard: what is done after the authentication check is out of scope.
The credential standard: the separation of roles suggests likely interfaces for standardization —
that is an acknowledgement that the protocols are future work. A full-text check of both, plus the
newer identifier draft, found the word handoff zero times, and every occurrence of the word session
was either an acknowledgements line or a privacy warning about correlation.

**Say this before somebody else does (added 2026-08-24, re-verification pass A).** The "separation of roles"
sentence sits directly under a line reading **"This section is non-normative."** The sentence is
real and it is the right point, but anyone who opens the specification will see that line above it.
Lead with it. Quoting a non-normative sentence as your evidence, and being told so, is an avoidable
embarrassment.

So: **portable claims about a person are standardized. A portable session is not.** A world-to-world
handoff needs a protocol layer nobody has ratified, plus asset and scene-state meaning that sits
outside both specification families entirely.

**One naming trap for the room.** That consortium's index now shows friendly labels — standard,
candidate standard, draft standard — while the specification headers and the process document still
use the formal names. Two people can read the same page and disagree about what stage something is
at. Quote the header, not the index.

**Confirmed dormant.** Filtering the whole technical report index for the word metaverse returns
nothing. The community group on the subject was proposed in 2021, has published no reports, and its
public list has one message since June 2024. Its associated code repositories are active, but that
output is not a consortium report and is not on any standards track.

## 11. The last check: addressing survives, portal handoff needs rewording, and I was wrong once

Checked 2026-08-20 against 141 sources, with nine points explicitly left unverified.

### Addressing — the claim stands. This is the cell to put forward.

The spatial web standard from the electrical engineering body does **not** fill it. Its own scope
says it defines requirements for a set of implementation specifications **to be developed**. It is
twice over a reference model, and the specifications it calls for are unwritten. Corroborating: no
spatial or hyperspace scheme appears among the 433 registered address schemes, and its identifier
method is not among the **267** registered ones (register dated 2026-08-12).
**Corrected 2026-08-24 (re-verification pass A): this line used to say 268. The old count included a header
row.** Both facts were re-checked independently that day: the method is still absent from the
register.

**Caution on that standard.** Board approval on 2025-05-28 is confirmed, re-confirmed 2026-08-24.
**Publication is not.** The title still reads "approved draft standard", the record carries no
publication date, the only item on sale is the approved draft, and no registration record exists.
Say board-approved. Do not say published, and do not give a publication date.

**One date trap added 2026-08-24 (re-verification pass A).** The originating foundation's own page says the
standard was approved on **2025-05-29**. The standards body's catalogue record says board approval
**2025-05-28**. One day apart, two official sources. **Cite the catalogue record.** If somebody in
the room quotes the 29th, they are reading the foundation's page, and that is worth knowing before
you contradict them.

**One more caution, same date and same source.** Two of that body's own records do not read the same
way. The catalogue abstract says the standard "includes specifications for" a layer stack, a query
format, an ontology, a credentialing method and a contracting language. The project record says it
"defines requirements for a set of Implementation Specifications to be developed." Both are official.
The honest move is to quote both and let the room see the tension, rather than picking the ambitious
reading or the dismissive one. The foundation's own page settles it in practice: it lists the
implementation standards as under development.

### Portal handoff — right cell, wrong sentence

**Plain traversal is ratified.** The older extensible 3D standard has an anchor node that replaces
one world with another, and it has been an international standard for years. So "no standard lets
you leave one world and arrive in another" is false and will be corrected in the room.

The true sentence is: **nothing ratified carries your state across the jump.** Say "arrive with your
identity, appearance or possessions intact."

The only specification that actually designs the handoff is at version 0.3, with no release and no
tag, and its asset transfer and look-and-feel sections both read, in full, "to be decided."

### I was wrong about that consortium freezing its portaling work

I reported it as frozen. **It is not publicly frozen.** That body still lists the work as an active
project and describes it as an approved standard on a page edited 2026-06-10. The dormancy is real —
last commit 2025-09-25, nothing in 2026, and the organization has pivoted to other tracks — but
"frozen" is my word, not theirs.

**If a member of that body is in the room, expect them to quote the active-project line.** The
answer is not to argue about dormancy. It is that their own page calls the thing "ratified (draft)",
which cannot be both, and the same line concedes asset transfer is still in development.

### Physics, restated correctly

A blanket "nobody has published a physics standard for virtual worlds" is **false** and would be
caught. The narrow claim is solid: for the common asset format, nothing is ratified — the rigid-body
work has never been merged, lives in an open pull request, its own status line reads draft, and the
registry says review draft.

**One naming trap:** the shapes extension has been renamed, and two official pages disagree on both
its name and its stage. Describe it, do not name it.

### Two more facts worth having

- The open interoperability group has ratified **zero** extensions, ever. Its own ladder defines a
  stage as "the extension has been ratified" and that stage is empty.
- The Forum states in its own words that it does not create standards. Nothing it produces can fill
  any of these cells. That is a constraint on what this group can promise.

### Still unverified

The publication status of the physics schemas in the scene description implementation was not
checked by this pass. Do not claim a negative there.

## 12. Addressing, checked a second time and in depth

A separate pass on 2026-08-20 went after the one standard that could have filled the addressing cell.
It could not.

**The decisive evidence is the standard's own project record.** The scope was rewritten in 2024, and
the record says why: the earlier version *"gave the impression that an implementation level
specification was to be developed that described formats and methods,"* while the new one
*"clarifies that the specification provides a reference model for Spatial Web components."* The
current scope states in its own words that it *"defines requirements for a set of Implementation
Specifications to be developed."* Those specifications are unwritten.

What the standard actually pairs is a semantic data model with an application-layer messaging
protocol, plus a governance model. Finding something is done by querying a graph, gated by
credentials — not by resolving a name to a location. A full-text search of the originating
foundation's own published introduction found no occurrence of the words scheme, resolver, or the
domain name system, and the word resolution appears once, in the phrase "dispute resolution."

**The registry that would make naming work does not exist.** The original 2020 project record said
no registration activity was required. The 2024 revision changed that to yes and recorded that the
originating foundation was *"coordinating with the IEEE registration authority to determine the best
course for implementing the new registry."* That authority's public pages carry no such registry
today.

**Three independent confirmations:**
- No spatial or hyperspace scheme is registered among the public address schemes.
- The identifier method the originators publicly say they use is **not** registered among the 267
  registered methods, despite their own site stating that they use it.
- No draft or published document on either component exists at the internet engineering body.

**One trap, and it is a good one.** The public scheme registry does list two provisional entries
whose names look almost right. They come from a software identification standard and have nothing to
do with spatial addressing. If someone produces them as proof the scheme exists, that is what they
have found.

**Verdict: addressing is genuinely empty, and it is the cell to put forward.** Of everything checked
today, it is the claim that held up best.

## 13. Addressing, checked a third time across every standards body

A full survey on 2026-08-20 covering the internet body, the web consortium, the geospatial
consortium, the graphics consortium, the web3 consortium, the Forum, the 3D web consortium, the
international standards organization, the European telecommunications body, and the international
telecommunication union.

**Verdict: no ratified standard from any accredited body names a place and resolves that name into a
joinable destination.** Every candidate does one half. Identifier formats with no resolution;
resolution mechanisms with no portable identifier; ratified standards about adjacent things —
coordinates, devices, files, identity subjects; or drafts and reports with no standards status.

### The three facts that make this arguable rather than assertable

1. **External corroboration.** A recognized European standards body published a virtual worlds
   landscape report in October 2025 assessing **912 standards and 354 technical reports**. No
   place-addressing standard, no address scheme, no portaling standard appears anywhere in it, and
   its eight-domain taxonomy contains no addressing category. Its February 2026 follow-up names the
   same hole. Cite their survey rather than our claim.
2. **The failed precedent.** The internet standards body chartered a working group on moving avatars
   between regions. It ran from 2010 and concluded in 2011 having produced **zero** published
   documents; its predecessor exploratory meeting also produced zero. Across the entire published
   document series there is not one entry mentioning virtual worlds.
3. **The deliberate step-back.** An international geographic standard from 2012 defines a place
   identifier architecture whose scope explicitly covers places "not only in the real world but also
   those in the virtual world" — and then says it is "not about... defining a unique, standardized
   description of defined places, such as an address coding scheme." Identifier model plus
   equivalence table, no resolver. The gap was seen and left open on purpose.

### The convergence, which points at the answer

Independently, the older 3D standard, two well-known shared-world systems, and the Forum's own most
advanced addressing proposal all landed on the same thing: **ordinary web addresses plus fragment
and path conventions, inventing no new scheme.** That is a design signal. The answer is likely a
profile over the existing web rather than a new scheme.

Supporting detail: the only registered scheme that actually addresses a virtual place is a
provisional entry for one commercial world, registered by a third party and last touched in 2012.

### The referral path already exists

The Forum has stated in its own words where this belongs: the 3D web consortium and the
international standards organization, with liaisons at the web, geospatial and graphics bodies, to
develop an address interface. For a body that does not write standards, using that path is exactly
the job.

### One more roster gap at the Forum

The group that produced that addressing work no longer exists — its page carries a banner saying it
has been folded into the spatial computing group, along with two others. That group's public page
lists only chair names: no charter link, no scope paragraph, no deliverables. So the Forum's most
advanced addressing work now sits in a group with no published scope.

### Three citation traps

- The public scheme registry lists two provisional entries whose names closely resemble the spatial
  web identifier. They come from a software identification standard.
- A registry entry that looks like a blockchain naming service is actually a pandemic exposure
  notification scheme from two phone manufacturers.
- Old drafts matching the portaling acronym are a 1995 internet white pages directory project.

### What you can honestly say is buildable today

Ordinary secure web addresses plus your own conventions; a coordinate encoding scheme, identifier
only; the geospatial pose standard for position and orientation once you have arrived; an anchor
storage interface for real-world anchors by opaque identifier; the identifier standard for the
person arriving; and the two ratified asset formats for what is at the destination. The draft
portaling specification is the only published design that resolves a portal into a joinable
destination — and it leaves the place-name syntax explicitly undefined, as an optional free-text
field whose form is chosen by the destination world.

**That last point is the sharpest one-sentence version of the gap:** the only design that resolves a
portal does not standardize the name inside it.

---

# Merged 2026-08-24 — six re-verification passes

Six independent passes re-read the primary sources behind this map. Their corrections were first
recorded in five result notes and four coverage records, not in this file. This is
the merge. Each entry gives the old claim, the new claim, and where it came from.

Sources merged, from the maintainers' working notes (not published):
the result notes of passes A to E (2026-08-24),
and the platform coverage records `infrastructure-wg/data/coverage/{vrchat,resonite,roblox,recroom}.json`.

## 14. The asset and geospatial formats

Source: re-verification pass B, which rewrote the four coverage records for the common asset format, the
scene description standard, the older 3D scene standard and the tiled geospatial format. 110 rows,
131 quotes, every quote checked as an exact substring of a downloaded primary source.

### 14.1 The tiled 3D format is a Community Standard and our address for it was dead

- **Old:** the document address `https://docs.ogc.org/is/22-025r4/22-025r4.html`, in
  `data/subjects.csv`, presented as an Implementation Standard.
- **New:** that address returns **HTTP 404**. The document is at
  `https://docs.ogc.org/cs/22-025r4/22-025r4.html`, which returns 200. The path segment is the whole
  point: `is` is the path for an **Implementation Standard**, `cs` for a **Community Standard**. The
  document's own front matter reads "Document type: OGC Community Standard" and "Document stage:
  Approved", and the submitting organisation is a single company. A community standard is one a
  member brings in and the membership approves. It is not the product of a working group there.
- **Why it matters:** anyone in the room who works at that consortium knows the difference, and the
  link fails in front of them at the same moment.
- **Applied 2026-08-24:** `data/subjects.csv`, `3dtiles` row — address corrected and the name now
  carries "(Community Standard)". See section 20 for the exact line.
- **Source:** re-verification pass B item 1; the maintainers verified both the 404 and the front matter
  first-hand.

### 14.2 Ratified extensions to the common asset format: 23, not 26

- **Old:** section 7 of this file — "The ratified list holds 26 entries."
- **New:** **23** — twenty with the consortium prefix, three with the multi-vendor prefix, ratified
  after becoming widely used. Counted twice from the downloaded registry.
- **Unaffected:** none of the 23 is physics and none is audio. Only the number changed.
- **Source:** re-verification pass B item 2. Corrected in place in section 7.

### 14.3 The audio proposal we named is not the one that exists

- **Old:** section 1 — "The audio emitter proposal has been open since 2022-03-31", pull request 2137.
- **New:** that name appears nowhere in the registry. The in-progress table lists `KHR_audio_graph`
  at **Proposal**, the earliest stage, in pull request 2421.
- **Stronger replacement fact:** the word "audio" does not occur once in the body of the glTF 2.0
  specification. The seven occurrences in the published file are page styling.
- **Source:** re-verification pass B item 3. Corrected in place in section 1.

### 14.4 There is no avatar extension for the common asset format, at any stage

- **Old:** section 4 — "unmerged draft, ratification targeted December 2026."
- **New:** no avatar extension appears anywhere in the registry: not ratified, not in progress, not
  vendor. There is no draft, so the December 2026 date has nothing behind it. What is verifiable is
  a press item dated **2024-10-23** announcing a collaboration with the avatar format consortium
  towards international standardization.
- **Source:** re-verification pass B item 4. Withdrawn in place in section 4.

### 14.5 The interactivity extension: both halves of the old sentence were true

- **Old:** "submitted for ratification on 2026-07-16. Submitted is not ratified." Scored `partial`.
- **New:** both stay, and one thing is added. The registry lists it at **Release Candidate**, and
  unlike the physics work **its specification text is merged into the repository**, not sitting in
  an open pull request. The submission date is confirmed. The level stays `partial`.
- **Same picture** for the Gaussian splatting extension: Release Candidate, merged text, announced
  2026-02-03. It defines how to **store** splats, not how to draw them.
- **Source:** re-verification pass B item 5.

### 14.6 The older 3D scene standard was under-scored by a wide margin

- **Old:** 8 rows — physics, audio, scene graph and two networking rows.
- **New:** 39 rows. Missed entirely, all of it inside the ratified text:
  - **Clause 26, Humanoid Animation.** Binds a separate international standard into the scene
    standard as nodes: a humanoid, joints, segments, attachment sites and displacers. A **ratified**
    answer to avatar body, avatar skeleton and morph targets — the thing the common asset format
    still does not have.
  - **Clause 25, Geospatial.** Named spatial reference frames with a table of ellipsoids and a
    geoid, a geographic location node with a defined local frame, and a terrain level-of-detail node
    holding four child addresses in a quadtree and managing loading. Coordinate reference systems,
    geographic pose and **tiled terrain streaming**, ratified.
  - **Clause 28, Distributed Interactive Simulation.** Networked state sharing across host
    computers, bound to a long-standing protocol. A ratified international standard covering
    **state replication**, which nothing else on this map has.
  - **Clause 6, Conformance.** Separately for files, generators and readers, with a base profile.
  - Also added: text with fonts, viewpoints, level of detail, lighting and shadows, volume
    rendering, programmable shaders with three named shading-language bindings, the behaviour graph,
    the scripting component, physics materials and trigger volumes.
- **The one to take to the meeting:** Clause 12 states in a note that its physical material is
  deliberately consistent with the common asset format's material, and that converting either way is
  equivalent. That is the clearest worked example on this whole map of two bodies making an exchange
  lossless **on purpose**.
- **Source:** re-verification pass B item 6.

### 14.7 That standard's physics and audio come with two conditions we never stated

- **Old:** physics and audio scored as flatly supported.
- **New, two conditions:**
  - **Profile gating.** Rigid body physics and the simulation component sit in the fullest profile.
    A reader can conform to the standard without implementing either. The old rows implied
    unconditional support.
  - **Occlusion is not in the sound clause.** The words "occlusion" and "obstruction" occur **zero
    times** in clause 16. The propagation model covers reflection, refraction and absorption against
    surrounding geometry. Nothing specifies what happens to a sound behind a wall. Anyone
    extrapolating from "acoustic rendering" to "occlusion is covered" would be corrected in the room.
- **Source:** re-verification pass B item 7.

### 14.8 That standard lets a file change its unit of length

- **Old:** not recorded anywhere.
- **New:** the base unit of length is metres, but a file may declare a different one with a UNIT
  statement. The common asset format fixes metres with no escape. A reader that assumes metres will
  silently mis-scale content.
- **Source:** re-verification pass B item 8.

### 14.9 The scene description alliance has published exactly one specification — now properly sourced

- **Old:** an absence argument — "explicitly excluded from the published core specification; a
  separate group, unpublished."
- **New:** the alliance's own specifications repository carries a table headed "Available
  Specifications" with **exactly one row**: Core, 1.0.1, released 2025-12-12. That is a stable
  citation rather than an argument from silence.
- **Also confirmed:** the licence is Attribution-NoDerivatives. In its own words, a derivative work
  made from the deliverable may not be distributed. That constrains how another standards body can
  build on it.
- **Source:** re-verification pass B item 9.

### 14.10 The physics vote and ratification quarter for that specification are not sourced

- **Old:** section 8 — "accepted by vote at the end of October 2025 and targeted for ratification in
  the second quarter of 2026."
- **New:** neither date could be reached in a primary source on a fresh pass. **Do not repeat
  either.** The exclusion itself is verified and quoted; the timeline is not.
- **Source:** re-verification pass B item 10. Withdrawn in place in section 8.

### 14.11 That specification defines no unit of length and no up axis

- **Old:** not recorded.
- **New:** the ratified core defines neither. The metres-per-unit field and the up-axis field do
  appear in the document, but **only inside example code blocks demonstrating a different feature**,
  so they carry no normative force. Two conforming files can disagree about scale and orientation
  with nothing in the standard to settle it.
- **Why it matters:** "adopt it and you get scale interoperability" is false, and this is the
  sharpest single finding in that record.
- **Source:** re-verification pass B item 11.

### 14.12 That specification's conformance tests do not exist yet

- **Old:** not recorded.
- **New:** it defines a compliance rubric naming three required conformance tests, then says the
  tests "will be made available" at the alliance website. Future tense. Related, and quoted in the
  animation row: interpolation methods "are not subject to specification or compliance validation at
  the time of this writing", so two conforming readers may return different values between keys.
- **Source:** re-verification pass B item 12.

### 14.13 The tiled format's 2.0 sentence was two things run together

- **Old:** section 4 — "A 2.0 is in development that drops its own scene file in favour of the
  common asset format."
- **New:** two separate things happened. Version **1.1 already** deprecated the four original tile
  formats in favour of the common asset format at version 2.0 — that is in the **published**
  standard. Version **2.0**, in development, goes further and rebases the whole tileset on the
  format's **next, unratified** version, carrying the tile tree itself as an extension to it.
- **Caveat to keep:** those next-version extensions live on a branch of one company's fork, not in
  the format owner's registry, and that next version is itself not ratified.
- **Source:** re-verification pass B item 13. Corrected in place in section 4.

### 14.14 The tiled format never mentions the geospatial pose standard

- **Old:** not recorded.
- **New:** **zero occurrences** in the full text. Two standards from the same consortium, both about
  placing things on the Earth, with no reference between them. A concrete, checkable gap a working
  group can act on rather than argue about.
- **Source:** re-verification pass B item 14.

### 14.15 The tiled format normatively depends on two extensions its own registry does not list

- **Old:** not recorded.
- **New:** it references `EXT_structural_metadata` and `EXT_mesh_features` normatively for its
  metadata model. Neither name appears anywhere in the format owner's extension registry — not
  ratified, not in progress, not vendor. An approved standard from one body has a normative
  dependency on extensions another body's registry does not carry.
- **Source:** re-verification pass B item 15.

### 14.16 Three short quotes worth having ready

Each settles an argument, and each is exact.

- The tiled format, clause IV: *"No security considerations have been made for this document."* From
  a standard whose whole job is fetching remote content and evaluating expressions in it.
- The scene description core: its entire treatment of security is a pointer to the security sections
  of the general web address specifications. A scene can pull files from anywhere; no allowed-list,
  no isolation model, no budget.
- The common asset format: *"glTF 2.0 only supports animating node transforms and morph target
  weights."* Useful when someone claims the format carries full animation.
- **Source:** re-verification pass B.

## 15. Identity and provenance

Source: re-verification pass A, which rewrote the four coverage records for the identifier standard, the
credential data model, the content provenance coalition's specification and the spatial web
standard. 53 quotes checked, 53 matched.

**Start with why this pass was needed.** The four old records held 13 rows between them. **Six of
those thirteen were marked `confidence: verified` with no quote at all** — a claim of having read a
primary source with nothing read. Three further provenance rows cited the coalition's marketing
home page as a `primary` source for technical claims. Nothing in the old provenance record cited
the specification itself.

### 15.1 The identifier method register holds 267 methods, not 268

- **Old:** sections 10 and 11 of this file — "268 are registered", "not among the 268 registered
  ones".
- **New:** **267**. The register is a Group Note dated **2026-08-12**, and 267 is the number of rows
  in its table body. The 268 counted the header row as a method.
- **Always date it.** The figure moves.
- **Source:** re-verification pass A. Corrected in place in sections 10 and 11.

### 15.2 Asserting that a specification says nothing is not a quotation

- **Old:** an identifier-standard row scored `none` at `verified` confidence with no quote, resting
  on "the word handoff does not appear."
- **New:** the row was **removed** rather than dressed up. A full-text search result is evidence,
  but it is not something the specification says, and it cannot carry a `verified` row that claims a
  quotation. The search result itself still stands and is recorded in section 10 of this file.
- **Source:** re-verification pass A.

### 15.3 The identity specifications do have permission slots — the vocabulary is what is missing

- **Old:** the credential row read `none` — "Carries claims about a holder, not permissions a
  receiving world can act on" — at `verified` confidence with no quote. The whole old row set
  implied the identity family says nothing about permissions.
- **New:** the level was wrong. The identifier standard defines `capabilityInvocation` and
  `capabilityDelegation`. The credential data model has a `termsOfUse` property and can carry
  permissions as claims. Both are now scored `partial`, quoted.
- **The sharper sentence:** the **slot exists and the vocabulary does not.** That is more useful in
  a room than "absent", and it cannot be contradicted.
- **Source:** re-verification pass A.

### 15.4 Verifiable credentials do not require decentralized identifiers

- **Old:** implied throughout — the two were treated as one story.
- **New:** the data model requires the issuer to be a web address and **recommends** that it resolve
  to a *controlled identifier document*, which is a separate recommendation published the same day,
  2025-05-15. Decentralized identifiers appear as one example among plain identifiers and ordinary
  web addresses. Five recommendations of 2025-05-15 were re-confirmed: the data model, the two
  securing formats, the status list, and controlled identifiers.
- **Source:** re-verification pass A.

### 15.5 Selective disclosure is the issuer's choice, not the holder's

- **Old:** a privacy row at `partial`, `verified`, **no quote**, sourced to the wrong document — the
  data-integrity companion rather than the data model.
- **New:** quoted from the data model itself, and with the trap stated: **the issuer must secure the
  credential with a mechanism that supports selective disclosure, at issuing time. A holder cannot
  add it to a credential they already hold.**
- **Why it matters here:** this bears directly on any avatar or wearable credential design where the
  issuer is a platform. The person wearing the credential has no way to narrow it later.
- **Source:** re-verification pass A.

### 15.6 The provenance specification cannot be embedded in a 3D asset

This is the finding from that pass that matters most to this working group.

- **Old:** not recorded. The old rows cited a marketing home page and implied general asset coverage.
- **New:** the technical specification version 2.4 lists the formats it supports. They are JPEG,
  JPEG-XL, PNG, SVG, HTML, FLAC, MP3, GIF, DNG, TIFF-based formats, WAV and BWF, AVI, WebP, other
  container-based formats of that family, fonts, unstructured text, structured text, PDF, EPUB,
  Office Open XML, Open Document, OpenXPS, other ZIP-based formats, MP4, MOV, AAC, ALAC, HEIF, Ogg
  Vorbis and other BMFF-based formats. **No glTF. No binary glTF. No OpenUSD. No USDZ.** A binary
  glTF file is neither ZIP-based nor BMFF-based, so it falls outside every catch-all in the annex.
- **The constructive half:** the byte-range hard binding "can be used on any type of asset", and the
  specification provides for external manifests. So a model **can** be covered — as a sidecar file,
  with **nothing in any standard keeping the two together**.
- **That is a real, specific, fillable gap and it is squarely this group's business.**
- **Source:** re-verification pass A.

### 15.7 Two things people say that provenance specification carries were removed from it in 2024

- **Old:** rows implying the coalition's core specification carries do-not-train signals and
  verifiable credentials.
- **New:** **both were removed from the core in version 2.0, January 2024.** The specification's own
  version history says so. Both now live at a different body, in its creator assertions working
  group:
  - the **training and data mining assertion**, version 1.1, ratified **2025-05-16**;
  - the **identity assertion**, version 1.3, ratified **2026-08-17** — six days before the check.
  The replacement says in its own words: "This specification is not a product of the C2PA itself, so
  it can not use the c2pa. prefix."
- **The substance survives** — the identity assertion does use verifiable credentials — but the
  attribution was wrong, and anyone saying "that specification carries verifiable credentials" is
  describing a document that has not existed for two and a half years. A member of that coalition in
  the room will correct it.
- **Levels changed with it:** the licence row moved from `partial`/`reported` to
  `via-extension`/`verified`, because a named external assertion is not a partial core feature.
- **Source:** re-verification pass A.

### 15.8 The spatial web rows were claiming a reading of text nobody paid for

- **Old:** three rows at `verified`, two of them with no quote, and a note claiming the standard
  "defers the identifier format to the web standard".
- **New:** every row downgraded to `reported`. The normative text is sold, not published, and was
  not read, so `verified` was never available. The deferral claim **is not in any record of that
  body** — it comes from the originating foundation's own page, which says the system *will* use a
  particular identifier method. That claim has been moved to a row where it can be sourced, and the
  method re-checked against the register: **it is not registered.**
- **Source:** re-verification pass A. The date trap and the two-official-records tension that came with it
  are recorded in place in section 11.

## 16. Pose on Earth, and the two immersive media parts

Source: re-verification pass C, which rewrote the coverage records for the geospatial pose standard, the
immersive audio standard and the draft avatar representation format.

### 16.1 The geospatial pose standard has a typo in a normative requirement

- **Old:** not recorded anywhere.
- **New:** Requirement 5, the tangent-point latitude rule, reads in the published text:
  **"The minimum value shall be 90.0 degrees and the maximum value shall be 90.0 degrees."**
  The minus sign on the minimum is missing. The neighbouring longitude rule correctly reads
  "-180.0 degrees", so this is not an artifact of our text extraction — it was checked against the
  raw published page, where the longitude minus sign is present and the latitude one is not.
- **Read literally, the normative rule permits only the north pole.**
- **Say it before you are asked.** Anyone citing conformance to that standard in a room with
  geospatial people should know this first.
- **Source:** re-verification pass C; the maintainers verified the published text first-hand.

### 16.2 Two conforming systems can exchange a valid pose and still disagree about where it is

- **Old:** "Anchors poses to Earth-centred and other astronomical reference frames, but does not
  itself define a coordinate reference system registry." No quote.
- **New:** the two simple forms fix the frame to an implicit world geodetic datum with a local
  tangent plane. The flexible form carries three strings naming an outside authority, an identifier
  and parameters, and the standard says reading them is not its job:
  **"The interpretation of the contents of these fields is outside the scope of GeoPose."**
- **The failure mode is now stated, and it is the point:** two conforming systems can exchange a
  valid pose and still disagree about where it is.
- **Source:** re-verification pass C.

### 16.3 The "does not resolve" finding now rests on evidence, not memory

- **Old:** "The word resolve does not appear in it at all", asserted.
- **New:** confirmed against the raw source. **Zero occurrences** of "resolve" in the whole
  document. The four occurrences of "resolution" are all in one revision-history line about public
  review comment resolution.
- **Also re-confirmed:** the document header reads "Approved", "OGC Standard", "Document stage:
  Approved". Section 4's correction — an adopted standard, not a draft seeking uplift — stands.
- **Source:** re-verification pass C.

### 16.4 Every immersive audio row is `reported`, and the record used to say `verified`

- **Old:** five rows, all `verified`, three of them with no quote.
- **New:** twelve rows, all `reported`, every one carrying an exact quote from a document that was
  downloaded and read. The normative text is sold, not published, so `verified` was never available.
  This is the exact failure the re-verification pass existed to fix.
- **Source:** re-verification pass C. Recorded in place in section 1.

### 16.5 An otherwise complete audio standard has no voice transport

- **Old:** not recorded.
- **New:** the standard can render a talker's voice into a scene once it has arrived, and its white
  paper lists social use as a use case. **It defines nothing about carrying live voice between
  participants.** Scored `none`, and this is the honest gap.
- **Source:** re-verification pass C.

### 16.6 That standard describes the room a second time, for sound

- **Old:** not recorded.
- **New:** its encoder takes its own scene description holding sources, geometry as primitives,
  meshes or voxels, transforms and material acoustic coefficients. That is the room described again,
  separately from however it is described for pictures. **A duplication cost, and a candidate for a
  binding between two descriptions of one room.**
- **Related trap:** it does define surface "materials", but they are frequency-dependent sound
  energy coefficients — transmitted, reflected, coupled, absorbed. **No friction, no restitution.**
  Do not score a physics cell off the word "material".
- **Source:** re-verification pass C.

### 16.7 The avatar draft is not the first formal standard to try this

- **Old:** "The first formal standard whose declared job is carrying a personalized avatar between
  different applications, services and worlds."
- **New:** **removed as wrong.** The same committee's **2016** standard is described on the group's
  own page as existing "to make it possible to migrate a virtual object or its characteristics from
  one virtual world to another." The prior art is now cited as a second source on the avatar row so
  it cannot be lost again.
- **This is the same pattern as sections 1 and 9 of this file:** a cell called empty, filled years
  earlier by work that was passed over. See `DO-NOT-REPEAT.md`.
- **Source:** re-verification pass C.

### 16.8 A quote we were using could not be re-read, so it was dropped

- **Old:** an abstract quoted from the publisher's catalogue page.
- **New:** **removed.** That page returns HTTP 403 to this environment on every route tried, and the
  catalogue detail feed that does answer carries no abstract. The sentence may well be correct, but
  it was not seen on this pass, so it is not quoted. The row now quotes the group's own press
  release, which was read.
- **Stage, restated carefully:** the catalogue record shows stage 40.99 reached **2026-07-31**, the
  catalogue still titles the document a **draft**, and the press release describes the move to the
  final draft stage. Publication is expected at the beginning of 2027. Do not call it published.
- **Source:** re-verification pass C.

### 16.9 The avatar draft transposes its matrices relative to the common asset format

- **Old:** not recorded.
- **New:** the group's own implementation guidelines state: **"Compared to glTF, these matrices are
  transposed."** A converter that copies the sixteen numbers straight across **loads without error
  and places the avatar wrongly.** The same document flags a second clash: what this draft calls a
  **skeleton** is what the common asset format calls a **skin**.
- Both traps are documented by the group itself, which makes them safe to raise.
- **Source:** re-verification pass C.

### 16.10 The avatar draft borrows the agreement that would make an avatar portable

- **Old:** "Defines animation sample formats for transmitting animation parameters; how faithfully
  motion transfers between differing bodies is not settled."
- **New, sharper and sourced:** the draft defines the **structure** but not the **agreement**. Joint
  and shape identifiers must match an outside animation framework, named in the file header by a
  reference string, and the group's own worked examples name one headset maker's body and face
  tracking plus one phone maker's landmark set. **The agreement is borrowed, not made here.**
- **On retargeting specifically:** the file may carry a mapping — weighted sums for the simple case,
  a controller-style mapping for the harder one — that lets an outside framework drive a component
  built for a different one. What is missing is the **body** problem: this maps parameter to
  parameter between tracking frameworks, not motion between differently proportioned bodies, and the
  mapping must be authored in advance.
- **Source:** re-verification pass C.

### 16.11 Three more things about that draft worth carrying

- **It sits on top of the common asset format, it does not compete with it.** In the group's own
  examples every mesh is a binary file in that format, and the guidelines say it "can be loaded with
  any conformant glTF software."
- **A shape there is a whole replacement mesh** with matching topology, not per-vertex offsets. The
  guidelines say so directly. That is a conversion trap.
- **Its replication row is the only live shared avatar state any formal standard now defines** — a
  wire form for the moving parts as timed units. **No session, no ownership rule, no interest
  management, no correction after a late packet.** That is a precise statement of what is still
  missing, and it is better than calling the cell empty.
- **One source deliberately not used:** a detailed public summary site for that format. Its own
  footer says its content is summarized from draft materials and nothing establishes it as official,
  so nothing rests on it. One discrepancy is worth recording: it expands an abbreviation one way and
  the group's own guidelines expand it another, so the expansion is asserted nowhere.
- **Source:** re-verification pass C.

## 17. The board's own coverage claims are contradicted by our own database

Source: pass D, a read-only review of the narrative board, the generated comparison page and the
written companion, dated 2026-08-24.

**None of the following has been applied to the board or the companion.** They are recorded here so
nobody repeats them from those pages. The recommendation from that review was to remove the board's
third plane and the coverage overlay switch entirely, and to link to the comparison page in their
place, so that no coverage claim exists in two places with two answers. **That decision has not been
taken and is not this file's to take.**

**The root of most of the disagreement is one word.** The board scores *is there a standard for
this*. The database scores *does this subject do this*. Both call the result "empty". They are not
the same question and cannot be reconciled by editing a chip.

### 17.1 Asset licence and rights is not the one empty noun

- **Old:** the board — asset licence and rights is **Empty**, *"The one empty noun. Permissions do
  not travel with the asset."* The companion builds its closing argument on it: *"it is the one noun
  we did not standardize"*, *"That is the sharpest thing this map says."*
- **New:** the database withdrew that on 2026-08-22, in as many words: a **ratified** extension to
  the common asset format exists precisely to attach attribution and licensing metadata to an asset
  or to individual objects. The open avatar format sits in the same cell **natively** — its meta
  block requires a name, at least one author and a licence document link, then adds eleven
  machine-readable settings covering who may act as this avatar, commercial use, credit,
  redistribution and modification.
- **The true position is split:** licence **metadata** is covered — one format natively, another
  through a ratified extension. Rights **enforcement** is genuinely empty and is reached by nobody.
  The board and the companion collapse both halves into one chip and get one of them wrong.
- **Source:** pass D decision one, item 1.

### 17.2 Portal handoff is not empty

- **Old:** the board — **Empty**, *"Traversal is ratified. Carrying your state across the jump is
  not."*
- **New:** the portaling draft sits in that cell **natively and verified** — it is the subject's only
  fully specified capability. One spatial fabric sits there as a recorded collision. And one row
  describes a crossing that **was actually performed**: it carried pose, session, equipment, a
  continuity identifier and fifteen manifest facets between two separate world servers, with a
  fail-closed gate deciding whether traversal into a child scope was allowed at all.
- **The board says carrying state across the jump does not exist. The database records one that was
  built and run.**
- **Source:** pass D decision one, item 2.

### 17.3 Addressing: the flat word "Nothing" does not survive

- **Old:** the board — **Empty**, *"Nothing names a place and resolves it. A survey of 912 standards
  found none."*
- **New:** two subjects reach that cell natively and verified — the Forum's own worlds-on-the-web
  work, where *"a world is a URL, joined and previewed by fragment"*, and one spatial fabric. Four
  more sit at `partial`, including the portaling draft, whose row reads *"The resolving half is real
  and specified ... so a name genuinely resolves to a reachable endpoint. The naming half is not."*
- **The companion's careful version survives:** *no ratified standard from an accredited body* does
  both halves. Sections 11, 12 and 13 of this file are unaffected. **The board's flat word "Nothing"
  is what fails.**
- **Source:** pass D decision one, item 3.

### 17.4 Portable capability is not empty, and its only occupant is a governance problem

- **Old:** the board — **Empty**, *"Claims about a holder, not permissions a world can act on."*
- **New:** the Universal Manifest sits there **natively**, and it is the **only** occupant. It is a
  draft at version 0.4, scored at `reported` confidence, and it belongs to the co-chair's own
  company.
- **Two problems, not one.** The chip is contradicted; and the thing contradicting it, shown on a
  shared screen, is the co-chair's own unpublished draft as the sole occupant of a cell the group is
  being asked to adopt. **That is a governance problem before it is a data problem.** Whoever
  presents this must say so first.
- **Source:** pass D decision one, item 4.

### 17.5 The two gap lists do not intersect at all

This is the finding that makes the rest unavoidable.

- **The board names seven empty sockets. Not one of them is empty in the database.** All seven have
  at least one subject reaching them natively or through an extension.
- **The database finds nine capabilities that nothing reaches:** content addressing; sandboxing and
  isolation; shared and persistent anchors; attachments and wearables; indoor mapping; preference
  portability; credential exchange protocol; rights enforcement; world state persistence.
- **Eight of those nine appear nowhere on the board.** The ninth — a protocol for two parties to
  exchange a credential — is named inside the text of the board's identity chip, but that chip is
  coloured contested rather than empty.
- **Persistence is the clearest case.** It is the emptiest region in the whole database: four
  capabilities, three reached by nobody at all. On the board it is one engine part labelled
  "Replaceable", with no socket in the standards plane at all.
- **Source:** pass D decision one, item 6.

### 17.6 Three more chips where the words are right and the picture is wrong

- **State replication, federated presence and behaviour portability** are marked **Empty** and the
  board's sentences about them are correct — the database says the same thing in more detail. But
  the matrix rows show four, five and two names in them, because the two pages are answering
  different questions. See the note above about the word "empty".
- **The scene graph is marked Welded**, glossed as *"engine part a standard cannot reach."* Two
  ratified standards sit in that capability natively. The companion's version — welded *in the major
  engines* — survives. The board's flat version does not. Two of the board's five welded parts, the
  user interface and the editor, have no capability in the database at all, so the map cannot test
  them either way.
- **The physics chip says "Ratified since 2008."** The database's row for that standard records
  version 4.0 dated December 2023 and no 2008 anywhere. The companion gets this right; the chip
  loses the qualifier. Section 9 of this file states the defensible version: the same clause is
  present in the 2008 and 2013 editions, and the current edition is the fourth, December 2023.
- **Source:** pass D decision one, items 5 and 7.

### 17.7 The "What is safe" list in `DO-NOT-REPEAT.md` was blessing the wrong claims

- **Old:** that file, written 2026-08-20, listed as safe "which sockets have standards and which do
  not."
- **New:** the database was built 2026-08-22 and contradicts precisely those claims. Anyone relying
  on that line today is being told the wrong thing.
- **Applied 2026-08-24:** that line has been rewritten in `DO-NOT-REPEAT.md`.
- **Source:** pass D decision one, item 8.

### 17.8 The gaps view is trustworthy, and the full wall is not yet

- **New, and worth knowing before anything is shown on a screen:** every row in the database that
  **asserts a capability is present** was checked, and **not one sits at `unverified` confidence.**
  All 34 unverified rows assert **absence**, never presence. So the gaps filter is solid.
- **The caution that goes with it:** the standards rows are still thin and still moving. Nine
  runtimes carry all 89 rows each; the ratified standards carry between two and eight rows apiece.
  Putting the whole 89-row wall up invites the reading "the standards cover nothing", which would be
  an artifact of how much has been scored, not a finding. Show the gaps filter and the collisions.
- **Scale at that read, 2026-08-24, and it moves:** 89 capabilities in 12 groups, 34 subjects of
  which 29 scored, 1,155 claims, 606 sources, 15 recorded collisions.
- **Source:** pass D decision one.

### 17.9 The comments on the portaling draft do not exist

- **Old:** referred to in project files as though a comments artifact existed and could be sent.
- **New:** **there is no such file anywhere.** No comment numbers, no severities, no proposed
  remedies, no cover note. What exists is a capability assessment written in the register of a
  scorecard, living in one coverage record and copied mechanically into two generated files.
  Somebody has to write the comments before anything can be sent.
- **Every finding in that assessment was re-checked against the upstream document and still stands.**
  The upstream repository has not moved since **2025-09-25**; the specification text has not been
  touched in 2026.
- **Four editorial defects, all confirmed present today, all certain:**
  1. The same callback field is listed twice in the query request table, once where the **failure**
     callback belongs — two names differing only in one capital letter, at consecutive lines. The
     later table gets it right with a properly distinct name.
  2. A procedure step refers to a section "7.8". **The document's last top-level section is 6.**
  3. A normative protocol table carries a row reading, in full, `ws | TBD`.
  4. An operating system version is typed as a decimal number, so a commonplace version like 10.15.7
     cannot be written at all. The operating system list is a closed set that ends with "etc."
- **The substantive finding, confirmed verbatim:** the destination field reads *"Coordinates in a
  form determined by the Destination World. If not given, Destination World chooses the location"*,
  and it is **optional**. There is **no orientation field at all**, so a person can be placed but not
  aimed. This is the strongest single sentence in the project: **the only published design that
  resolves a portal does not standardize the name inside it.** It matches section 13 of this file.
- **Three sections are advertised and unwritten** — asset transfer, look and feel, and payments each
  consist of one line reading "TBD" — while the document's own summary advertises asset transfer.
- **One finding this project's own record says not to publish:** the parameter tables mark the assets
  field reserved for future use, meaning a receiver must ignore it, and a procedure then instructs
  the destination to construct an approved-assets value **from** it. Both are confirmed. The scope
  boundary report states plainly that this is not a criticism to publish, because the unsettled
  meaning of that field is exactly why the Universal Manifest must not claim a binding to it.
- **One judgement that is not a defect:** "there is nothing here to build against yet" is a verdict
  on maturity, not a defect in the text, and this project's own ecosystem note already recorded the
  restraint — nobody in this stack publishes a conformance suite, so it is not a criticism we are
  entitled to make loudly.
- **Nothing has ever been sent to that consortium.** The decision is the maintainer's alone.
- **Source:** pass D decision two.

### 17.10 Unreal Engine 6 has a named game — Rocket League — and still has not shipped

**Checked 2026-09-04 against Epic's own pages.** This does not overturn the version 6 correction in
`DO-NOT-REPEAT.md`; it adds the fact that entry was missing, so that nobody says "no game" and
nobody says "shipped".

- **Old, in the register from 2026-08-22:** version 5.8 shipped 2026-06-17, version 6 was announced
  with early access targeted for late 2027, and no game was named.
- **New:** Rocket League is announced for version 6. Epic's own teaser went up on **2026-05-24**,
  during the Rocket League Championship Series Paris Major, and Epic's engine lead confirmed a month
  later what it showed. Nothing runs on version 6 yet.

**The line to say:** *"Version 6 has its first game announced, Rocket League; nothing runs on
version 6 yet; early access is targeted for the end of 2027."*

**The addresses, all retrieved 2026-09-04.** All four refuse an ordinary fetcher with HTTP 403
(Cloudflare); they were read with a headless browser. Anyone re-checking should expect that.

1. **The teaser, Epic's own channel.** `https://www.youtube.com/watch?v=1t9IMJrEe-8` — *"Rocket
   League® | A New Era"*, posted by the Rocket League channel, publish date stamped
   **2026-05-24T15:00:02-07:00** (22:00 UTC). Description: *"A new era. Check out the first teaser
   of what's next for Rocket League."*
2. **The game's front page.** `https://www.rocketleague.com/en` — carries **"New Era. New Engine.
   This is Rocket League."** with a Watch Trailer link to that same video.
3. **Epic's engine post.** `https://www.unrealengine.com/news/the-road-to-ue-6` — *"The road to
   Unreal Engine 6"*, by Marcus Wassmer, who leads the development team at Epic Games, dated **June
   22, 2026**. *"If you were watching the Rocket League Championship Series a few weeks ago, you
   might have noticed a familiar logo with a 6 on it."* And the timetable: *"We're targeting a
   Unreal Engine 6 Early Access release at the end of 2027, with the full release of UE6 coming
   12-18 months later."* The same post says the gameplay programming model moves to Verse, and that
   5.8 is the last planned UE5 release, with a 5.9 reserved as an option.
4. **Epic's player support.**
   `https://www.epicgames.com/help/c-202300000001622/c-202300000001682/rocket-league-unreal-engine-6-update-a202300000085684`
   — an article titled **"Rocket League Unreal Engine 6 Update"**, whose whole body is *"For any news and updates on the Unreal Engine 6
   update coming to Rocket League, keep an eye on our official Rocket League news page"*. It gives
   no date and no detail.
5. **Corroboration on the timetable, same body, different page.**
   `https://www.unrealengine.com/news/state-of-unreal-2026-top-news-from-the-show`, dated **June 17,
   2026**: *"We're targeting an Early Access release at the end of 2027."* That page does not
   mention Rocket League.

**Two claims the trade press makes that no primary source supports. Do not repeat either.**

- **"The first game."** Neither Epic nor Psyonix has published the words *first game* or *first
  title*. Epic's post does not rank Rocket League against anything. Say *the first game announced*
  as our own reading, unquoted and unattributed.
- **A date for Rocket League's move.** There is none. Epic's support article gives none, the teaser
  gives none, and the Rocket League news page carries no version 6 article at all — its 2026-05-24
  entry is the Paris Major result and never mentions the engine. A window of late 2027 to 2029 is
  arithmetic on Epic's engine timetable, not a statement by anybody, and must be labelled as such.

**One loose end for whoever owns the 5.8 line.** The register dates the 5.8 release to 2026-06-17,
which matches Epic's forum announcement and the State of Unreal page of that date. Epic's own
`unreal-engine-5-8-is-now-available` news post is stamped **June 23, 2026**, and the road-to-UE6
post **June 22, 2026** — so the register's "the version 6 plan was announced the same day" is true
of the show, not of the blog posts. Left as found; it was not this pass's to change.

**The coverage file was checked and nothing in it changed.** In
`infrastructure-wg/data/coverage/unreal.json`, two of the 79 rows touch this subject. `logic.script`
says *"Epic's stated direction is to make Verse the gameplay language of version 6"* — the road-to-
UE6 post confirms that in Epic's own words, so the row stands. `logic.sandbox` names the Fortnite
editor as Epic's sandboxed model and does not depend on version 6 at all. The file's subject
summary already says version 6 has not shipped and dates early access to the end of 2027. **No row
changed, so nothing was rebuilt and nothing was deployed.**

- **Source:** the 2026-09-04 maintenance pass.

### 17.11 The Khronos Gaussian splatting extension is ratified. Two of our own rows said it was not.

**Checked 2026-09-06 by fetching the specification and the extension registry.** This settles a
contradiction the map had been carrying in the open since 2026-09-05, when a new subject read the
extension's status line as ratified while the two glTF subjects said it was not.

- **Old, in `gltf.json`, retrieved 2026-08-23:** *"KHR_gaussian_splatting has merged draft text at
  release candidate stage, announced 2026-02-03. It defines how to store splats as point attributes;
  it does not define how to render them, and it is not ratified."* Scored `partial`.
- **Old, in `gltf21.json`, retrieved 2026-08-22:** *"KHR_gaussian_splatting, which is a release
  candidate written against 2.0 and not ratified; the 64-bit container that large captures need is
  announced for 2.1 but its pull request is still open, so there is no draft text for it."* Scored
  `partial`.
- **New, both addresses read 2026-09-06.** The specification's own Status section says, in full:
  **"Complete, Ratified by the Khronos Group"**. The extension registry lists it under the heading
  **"Ratified Khronos Extensions"**, whose lead sentence is *"The following extensions have been
  ratified by the Khronos Group:"* — the same registry whose in-progress table we quoted on
  2026-08-22. So the ratification happened between our two reads, and the old note was true when it
  was written and false when it was published.
- **The second half of the `gltf.json` note was wrong as well, and in a way a date does not
  excuse.** The ratified text does define how splats are drawn. Its "Ellipse Kernel Rendering"
  section opens *"To render a field of 3D Gaussian splats, the renderer reconstructs each Gaussian
  splat using the same forward pass algorithm used during training, projects it onto a 2D plane,
  computes its color, and composes it with other splats"*, and it goes on to make reconstruction,
  projection, sorting and the alpha-blending equation normative.
- **What changed on the map.** `gltf` on Gaussian splatting and radiance fields `render.splat` moves
  from `partial` to `via-extension`: both grounds for scoring it partial are gone, and splats reach
  glTF through a ratified extension rather than through the core. `gltf21` stays at `partial` for a
  different and still-true reason — the extension is written against 2.0, so 2.1 inherits it and
  defines nothing of its own — which is what its own `capture.splat-format` row already said. Its
  note is corrected on both false clauses.
- **One more claim in that note did not survive either.** Pull request 2628, *Draft changes for
  64-bit Upgrade to Binary Format in glTF 2.1*, is not open. It was **merged into the repository's
  `draft-2.1` branch on 2026-08-28**, and a `specification/2.1` folder now stands on that branch. It
  does not stand on `main`, so "there is no draft text" is wrong and "2.1 is published" would be
  wrong too. The careful sentence is: the draft text exists, on a draft branch.
- **What to say.** *"The Khronos Gaussian splatting extension is ratified, and it defines both how
  splats are stored and how they are drawn. It is written against glTF 2.0. Compression is not in
  it, and none of the open compression proposals is ratified."* Do not say the extension is a
  release candidate, and do not say glTF 2.1 has no draft text.
- **The addresses, all retrieved 2026-09-06, all fetched without a browser:**
  `https://raw.githubusercontent.com/KhronosGroup/glTF/main/extensions/2.0/Khronos/KHR_gaussian_splatting/README.md`
  (HTTP 200, 38,933 bytes),
  `https://raw.githubusercontent.com/KhronosGroup/glTF/main/extensions/README.md` (HTTP 200, 16,007
  bytes), `https://github.com/KhronosGroup/glTF/pull/2628` (HTTP 200; the page's own state field
  reads `MERGED` with `mergedTime` 2026-08-28T17:08:24Z) and
  `https://github.com/KhronosGroup/glTF/tree/draft-2.1/specification/2.1` (HTTP 200).
- **Source:** the 2026-09-06 scoring pass.

## 18. The platforms — nineteen recorded collisions

Source: the platform scoring pass. That pass stopped on a server error before it could
record a result, so its findings were read directly out of the four coverage records it had
already written: `coverage/vrchat.json` (86 rows), `resonite.json` (89), `roblox.json` (89) and
`recroom.json` (44). Every item below is a row scored **`conflicts`** — the level this project uses
when a platform's own documented behaviour clashes head-on with a neutral standard. There are
**nineteen** of them across the four records, and they are the most concrete material in the whole
map because every one is quoted from the platform's own documentation.

**The general shape, which no chip on the board says:** across all four platforms the traffic runs
one way. Assets go in; nothing runnable comes out. Only one of the four can write a neutral format
at all, and only for content its creator is permitted to take.

### 18.1 The Unity-based social platform — eight collisions

- **Container and package.** An upload is not a model file. It is compiled into a **Unity asset
  bundle** keyed to **one pinned editor version and one target platform**, so the same avatar must
  be built and uploaded separately for computers, standalone headsets and phones. Nothing outside a
  matching client can open, run, inspect or convert the result. The platform's own upgrade page:
  *"Upgrading your version will result in content not loading once uploaded."*
- **Avatar body.** Not a portable body description. The widely adopted portable avatar format is
  **not natively supported**; entry needs a community-written converter, and there is no export at
  all. A neutral body cannot enter without an out-of-band step and cannot leave at all.
- **Transport.** It plainly has a working transport and **publishes nothing about it**. Across every
  networking page checked, no protocol, port, framing or handshake is named. No independent client
  can join, and no other system can speak to one. Scored `reported`, because absence of publication
  is what was observed.
- **Portal handoff.** Portals work well and point at a world identifier. But the platform **forbids
  the second half outright**: *"Persistent data cannot be shared between different worlds."* You
  arrive with your account and your avatar and nothing else, and portals only reach its own worlds.
  **This is the clearest shipped example of the exact gap this group is considering adopting.**
- **Scripting and behaviour.** World rules run on the platform's own bytecode interpreter. The
  dialect creators write **"is not conformant to any version of the C# language specification"** in
  the platform's own words. The visual node graph — which sounds like the portable declarative
  behaviour other systems are converging on — compiles into the same private assembly, so
  interactivity never travels with an asset.
- **Versioning.** Shipping a change routinely breaks things and the platform says so: changing
  editor version stops uploaded content loading; adding a networked component makes the next build
  incompatible with instances already running. It ships a whole tool whose only job is keeping
  object identifiers stable, because if they drift, people see different objects receiving each
  other's data.
- **The one genuinely open interface,** worth saying because it is a positive: a local control
  protocol lets a program on the same machine read and set avatar values, push in gaze and body
  tracker poses and drive movement, with the platform advertising itself for discovery and asking
  the person's consent before it sends anything out.
- **Trap for a standards reader:** the coordinate convention is left-handed with Y up, the opposite
  of the neutral transfer formats.

### 18.2 The fully reflective social platform — five collisions

- **Coordinate frame.** Left-handed, Y up, +Z forward, matching one game engine. The transfer format
  it imports most cleanly is right-handed with -Z forward, so every transform, rotation sign and
  winding order flips on the way in and on the way out.
- **Geometry.** Every mesh that enters is converted to the platform's own representation and **the
  link to the source file is dropped**. That representation has no published specification and the
  code that reads and writes it is closed. On the way out the export wizard offers two formats only;
  one more is disabled and the neutral transfer format **is not offered at all**. Exported skinned
  meshes lose bone weights and shape keys, which its own documentation concedes. One mesh
  compression extension is unsupported on import, which is also why version 1.x of the portable
  avatar format cannot load.
- **Avatar body.** No portable avatar description. It **reads** three rig formats and **writes
  none**, and the one widely adopted portable avatar standard is explicitly unsupported on import.
- **Facial expression — and this one cuts both ways, which is why it is useful.** Mouth shapes for
  speech **are** an external set: its enumeration is index-for-index the fifteen-entry list one
  vendor published, proven from the platform's own source. Facial **expressions** are not: about
  ninety proprietary names, with adopting either open set left as an **open, unimplemented issue**
  in its own tracker, currently bridged by a third-party modification.
- **It does not run on the immersive session standard.** It targets one vendor runtime family plus
  others selected by command-line flags, and its lead developer names support for the standard as
  something a future renderer replacement will unlock. **Any assumption that this platform is
  conformant to that standard today is wrong.** There is also no standalone headset client.
- **The positive worth carrying:** every asset is named by a **hash of its own bytes** and fetched
  over an ordinary web address. That is a real shipped content-addressing system rather than an
  intention — and it is unauthenticated, so **holding a hash is holding the content**. Its visual
  behaviour language genuinely travels inside the exported object, which is the portable-behaviour
  property many standards are reaching for. It travels only to another copy of the same platform.

### 18.3 The largest proprietary platform — three collisions

- **Units, and this is a hard collision with any metre-based approach.** Its length unit converts to
  **28 centimetres**, not a metre. Its mass unit is **21.952 kilograms**. Its default gravity is
  196.2 of its units per second squared, which its own page converts to **54.936 metres per second
  squared — about five and a half times Earth** — while listing 35 separately as the realistic
  value. **The engine performs no unit conversion internally.** A scene authored in metres arrives
  both the wrong size and falling at the wrong rate, and **neither error announces itself.**
- **Container.** Its place and model files have **no published byte-level specification** anywhere,
  and its own upload documentation warns that files touched by anything other than its editor
  *"might not upload or function."*
- **Physics materials.** Two collisions in one row. Density is expressed per cubic unit of its own
  length, clamped between 0.0001 and 100. Friction ranges **0 to 2**, not the usual 0 to 1. And when
  two surfaces meet, friction and restitution are combined by a **pairwise weighted average** using
  per-part weight values — not the multiply, minimum or maximum rule other engines use — so imported
  friction numbers will not reproduce the same contact behaviour.
- **The positives, and they are real.** It is the **only platform in this group that can write a
  neutral format at all**: its importer reads three formats and a beta exporter writes the neutral
  one back out with meshes, textures, rigging, cages and facial pose data — never animation, and
  only for assets the creator is permitted to take. It drives **every headset through the immersive
  session standard**. Its facial animation is built on a published outside coding system with fifty
  poses, seventeen required for marketplace items — a shared vocabulary rather than a private one.
  And its scripting language is published separately under a permissive licence with a standalone
  runtime, making it the one artifact of that platform anyone else can simply pick up and use.

### 18.4 The platform that shut down — three collisions, and the whole record is the finding

- **Already applied, recorded here only.** The `recroom` row in `data/subjects.csv` already reads
  status `shutdown` with status date **2026-06-01**. **It shut down 2026-06-01, announced
  2026-03-30.** That row was fixed by the platform pass and was **not** re-edited by this merge.
- **Addressing.** Rooms were named and reached only through the operator's own website and client,
  with **no second resolver and no fallback**. When the operator switched off, the website went
  offline and **every address ever minted became unresolvable on the same day**. That is exactly the
  failure mode any federated or multi-resolver naming approach exists to prevent.
- **Inventory.** Items and the currency that bought them were issued and held by one operator, could
  not leave, and were switched off by announcement — tokens simply stopped being spendable on a
  date. Any approach where a held item travels with its owner collides directly with an inventory
  only one company can honour.
- **Package.** A published room was never a package a creator could hold or run. **Even at shutdown,
  with every incentive to help**, the operator could offer only underlying data to help rebuild the
  experience elsewhere, and only through the computer version of the client.
- **Its own shutdown notice told creators they could not download a working copy of their rooms**, so
  every world built in it is now both unreachable and unrecoverable.
- **Why this record earns its place:** it is the clearest worked example in this map of what a closed
  platform costs when its operator stops. The addresses, the inventory, the accounts and the content
  all ceased to exist on one day. **Use it instead of a hypothetical.**

## 19. The Universal Manifest security claim — the technical core holds, the framing did not

Source: pass E, a live re-check on 2026-08-24. Recorded here because this project's own maintainers
files were carrying a version of this claim that was wrong in three ways, and because the corrected
framing changes what anyone should do about it.

**The technical core survives, word for word.** The weakness in the reciprocal binding mode is still
live at the same two line numbers in the published draft, and on the public rendered site. The
affected text is normative production-candidate content, not a preview section. The file has not
changed by a single byte since 2026-07-09, which is why line numbers written in July still land.
Nothing has reached upstream: zero pull requests, zero issues, zero forks, and no commit in the
maintainer's private working repository has ever touched that file either.

### 19.1 "Upstream" is the maintainer's own publication surface, not a third party's

- **Old:** carried in the register with the weight of an **undisclosed third-party vulnerability**.
- **New:** every commit in that repository was authored and committed by the maintainer, and the
  authenticated account holds administrator permission on it. **There is no external gatekeeper to
  persuade and no vendor to notify. Structurally this is a self-fix.**
- **This is the single most important correction to how the claim has been circulating.**
- **Source:** pass E hypothesis 6.

### 19.2 "The maintainer has not answered the disclosure question" is stale

- **Old:** the maintainers' list of open constraints — "Maintainer has not answered."
- **New:** **he answered on 2026-08-01 and it was re-recorded 2026-08-03:** quiet fix, ordinary
  specification-improvement pull request rather than a security advisory, the maintainer submits personally.
  The maintainers' notes were never updated, and that one line set off a whole round of work.
- **Source:** pass E.

### 19.3 "The claim has never been re-checked" is false

- **Old:** asserted in the brief that commissioned the re-check.
- **New:** it had been re-checked **2026-08-23T22:49Z**, about five hours earlier, in a queue this
  project's maintainers were not reading — and again on 2026-08-24.
- **Source:** pass E.

### 19.4 The specification does have a limitations section, and that makes it worse

- **Old:** recorded as having no limitations disclosure.
- **New:** a section named for exactly that mode **does exist**, and the affected line points readers
  at it. But what it discloses is a **different** limitation — that the two keys may belong to two
  cooperating people rather than one person. It says nothing about replay, transplantation or
  capture. **So the pointer actively works against the reader:** it signals that the limits of the
  mode are documented over there, and the thing documented over there is not this.
- **Source:** pass E hypothesis 3.

### 19.5 Cite the newer fix package, not the July prototype

- **Old:** the register points at a package dated 2026-07-09 in a neighbouring repository.
- **New:** that package is a **prototype and proposal draft**, not a submittable pull request — it
  names no target file, carries an internal absolute path, has no problem statement and does not
  amend the limitations section. A later, superseding version dated **2026-08-03** lives inside this
  project at `docs/rp1-um-security-finding/SPEC-PR-reciprocal-control-v2.md`. It is public-safe,
  names the target file and the exact sections to change, states the problem and rebuts the obvious
  objection. **Point at that one.**
- **Source:** pass E hypothesis 4.

### 19.6 State the severity as two answers, because it is two questions

- **As a specification defect: HIGH.** The signing input is completely attacker-controlled — no
  nonce, no audience, no content binding, no domain separation, four independent defences all
  absent. The impact is a forged identity binding that promotes a claim a tier, which is precisely
  the property the mode exists to provide. The specification routes non-interactive presentations
  straight at the gap, and it contains the correct construction for the same problem **in the same
  document** and does not apply it there. The conformance suite has no negative fixture for it, so
  an implementation can be fully conformant and fully vulnerable.
- **As real-world exposure today: LOW.** The document is a draft; the repository has zero stars,
  watchers, forks, issues and pull requests; a search across public code for the mode returns **zero
  results anywhere**; and the one real external integrator uses the envelope, not the binding.
- **The sentence to keep:** **the exposure window is governed by adoption, not by elapsed time.**
  Delay has cost nothing because nobody built on it. That stops being true the moment a third party
  implements the mode, or the moment the draft is promoted to current. **Elapsed time is not a
  reactivation condition. Adoption is.**
- **One limit on the finding, stated honestly:** a private message to the maintainers would leave no
  trace in any repository and cannot be seen from here. Everything above rules out delivery through
  code, pull requests and issues. Only the maintainer can close that gap absolutely.
- **Source:** pass E.

## 20. The subject register — what was changed on 2026-08-24

One row changed in `infrastructure-wg/data/subjects.csv`. Nothing else in that file was touched.

**Before**

```
3dtiles,OGC 3D Tiles,standard,OGC,royalty-free,https://docs.ogc.org/is/22-025r4/22-025r4.html,ratified,1.1,2023-01-12
```

**After**

```
3dtiles,OGC 3D Tiles (Community Standard),standard,OGC,royalty-free,https://docs.ogc.org/cs/22-025r4/22-025r4.html,ratified,1.1,2023-01-12
```

**Two changes on one line, for two separate reasons.**

1. **The address.** The old one returns HTTP 404. The new one returns 200. Verified first-hand.
2. **The name.** The path segment is what classified the document: `is` is the path for an
   **Implementation Standard**, `cs` for a **Community Standard**. Fixing the address alone would
   have silently reclassified the row with nothing on the page saying so, so the name now carries
   the classification where a reader will see it. The document's own front matter reads
   "Document type: OGC Community Standard".

The `kind` column stays `standard` and the `status` column stays `ratified`: the schema's closed
lists have no value for a community standard, and the schema is not this pass's to change.
The name is the only field that can carry the distinction today. **If the schema ever grows a field
for the class of a standard, this is the row that needs it.**

**Deliberately not changed:** the `recroom` row. It already reads status `shutdown` with status date
`2026-06-01`, fixed by the platform pass. It is recorded in section 18.4, not re-edited here.

## 21. Quote counts published before 2026-09-04 undercount by 248

**2026-09-04:** the loader kept only the first quote whenever one claim cited one address more than once, so every quote count published before this date — the map page, the atlas, the C4 page and the meeting material all said 2,421 — is short by 248; the true figure is 2,669 quotes against the same 1,057 sources, and no other total moved.
