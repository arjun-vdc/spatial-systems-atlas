---
type: brief
title: Capture and generation — what splats, four-dimensional capture and splat avatars can do today, and what carries them
status: draft for working group review
created: 2026-09-06T20:40:00Z
project: msf-wg-tool
author: the maintainers
data_basis: infrastructure-wg/data/territory.db read 2026-09-06T20:35Z — 57 subjects, 117 capability rows (now 162), 5,303 claims (now 6,882), 1,575 sources (now 1,932), 7,333 quotes (now 8,544); sha256 6d3e76e9dcb96fd7b324ecca93ee913d321d6a64454187916cdddb3fa1024923. Eleven subjects were added in this round — nine capture and generation tools and two research families — each scored against all rows from public primary sources read on 2026-09-06. Every count on this page is derived from that database, not typed by hand. The database has since gained 45 capabilities and the counts have grown; the body figures are accurate for the 2026-09-06 read.
---

# Capture and generation

Members from Meta and NVIDIA asked what is current in four-dimensional volumetric capture, in
Gaussian splats, and in turning a capture into an avatar, with attention to free and open tools that
run on a phone. This brief answers from the map's own rows. It names systems only to say what they
do; it recommends nothing, quotes no price and discusses no patent.

## What splats and captured content can do today

A Gaussian splat is a captured place stored as millions of small semi-transparent ellipsoids and
drawn by sorting and blending them. In 2026 that representation is no longer exotic. Twelve subjects
on this map write or read a splat container natively and two more reach one through an extension.
The most consequential change since the map last looked is that splats have arrived inside OpenUSD
as a schema rather than as a private payload. NVIDIA's simulator documentation states it plainly:

> Compatible environments are published as USD stages that use OpenUSD ParticleField geometry (3D
> Gaussian splats and related radiance fields), which Omniverse RTX renders natively together with
> polygonal scene content.
> — Isaac Sim 6.0 documentation, *Neural Volume Rendering*, read 2026-09-06

The same company is retiring its own container in favour of that schema. Its open training code
lists three export formats — PLY, standard USD `ParticleField3DGaussianSplat`, and the older NuRec
package — and says: *"NuRec is going to be deprecated and replaced by `ParticleField`. Prefer
`ParticleField` for new assets."* On the other side of the industry the Khronos extension is
finished: `KHR_gaussian_splatting`'s own status line reads *"Complete, Ratified by the Khronos
Group"*, with compression left to extensions that *"SHOULD extend this base extension"* and none of
them ratified. So a splat now has two credible destinations, USD and glTF, and neither has settled
compression.

Time is where the field stops. One subject on the whole map carries volumetric video natively — the
MPEG video-based coding family — and three carry time-varying capture at all. Everything else plays
a flipbook. The clearest statement of the problem comes from the 2026 streaming research:

> current models remain monolithic bitstreams that clients must download in full before any frame can
> be rendered, causing black-screen waits of tens to hundreds of seconds on mobile bandwidth and
> leaving 4DGS incompatible with modern adaptive-bitrate delivery
> — PD-4DGS, arXiv 2605.11427, read 2026-09-06

That paper's own fix — splitting a model into a static scaffold, a global deformation and a local
refinement so that any prefix renders — takes first-frame latency on a two-megabit link from
*"73--930 s to ~1.7 s"*. It is one implementation's decomposition, not a bitstream two systems share.
The commercial state of the art agrees: the leading volumetric-video service delivers *".mint for
proprietary temporal stability, or a .PLY sequence"* through its own engine kits, and requires
*"shutter sync and genlock with hardware-synchronized cameras"* to capture at all.

## What the containers carry, and what they drop

Reading the map's own rows for the eleven capture subjects added today:

- **Time.** Not one of the nine products captures a moving scene. The only route to time in this
  group is an open specification from a scanner company, `colmap4d`, which adds *"one timestamp per image + one timestamp per point"* to a standard reconstruction as sidecar files that change
  nothing existing — and it describes the inputs to a capture, not the splats that come out.
- **Units.** Two of the eleven state real-world scale as a matter of course: a phone product whose
  captures are *"measured to within a 0.5 inch tolerance on standard interior captures"*, and the
  reconstruction stack whose input specification stores every transform as a four-by-four rigid
  matrix *"in the metric units of the sequence"*. One desktop tool fixes scale from a printed marker
  whose *"side-length"* is given *"in millimeters"*. The rest inherit an arbitrary scale and write no
  unit at all — and one open trainer normalises the world by default, so real scale is lost unless
  the operator turns it off.
- **Licence.** Eleven subjects, more than twenty export formats between them, and **not one licence
  field**. `scene.licence` is scored absent for every capture subject on this map.
- **Provenance.** Two partials, both technical rather than human: a reconstruction package that
  carries the sensor trajectories that made it, and a desktop tool that writes *"several non-standard
  metadata in the PLY header, including the color space, anti-aliasing mode, and world origin"*
  because no splat format has anywhere to put them. No authorship. No signature.

Coordinate frames are half solved. The most widely adopted compact splat container states a default
frame and sixteen named alternatives, and warns that *"If the coordinate system is `UNSPECIFIED`,
data will be saved and loaded without conversion, which may harm interoperability."* Its fourth
version, released in May 2026, also put *"the 32-byte file header in plaintext at a fixed offset"*
and added a vendor extension chain — the only splat container scored here with an extension
mechanism. Against that, Meta's own developer sample has to correct the frame by hand: *"Notice the -90 degree rotation on the X axis to align the splat’s coordinate space with the room
environment."*

## What is free, open, and runs on a phone

Three open-source trainers were scored. Only one of them runs where the pictures are taken.

- **Brush** (Apache-2.0) targets WebGPU rather than CUDA, and its README says *"Training is fully
  supported natively, on mobile, and in a browser."* The limit is stated in the same file: on the web
  *"only Chrome 134+ on Windows and macOS is currently supported."* It writes PLY and nothing else.
- **OpenSplat** (AGPL-3.0) is desktop only and will fall back to the processor *"(~100x slower)"*. It
  is the one tool here that keeps a coordinate reference system: *"By default OpenSplat preserves the
  input coordinate reference system of the model."* It writes four containers from one run.
- **Nerfstudio with gsplat** (Apache-2.0) is the most capable and the least portable: *"CUDA-accelerated
  differentiable rasterization"*, so no phone and no browser. Its splat path cannot produce ordinary
  geometry — *"Can I export a mesh or pointcloud? Currently these export options are not supported"* —
  and the Nerfstudio repository's own metadata gives `"pushed_at": "2025-07-29T02:30:55Z"`, so the
  documentation a newcomer reads is older than the library it describes.

The free phone products go further than the open trainers on everything except openness. All three
scanners scored — from Niantic Spatial, Polycam and KIRI Innovation — ship free tiers on iOS and
Android and export a mesh derived from a splat; two of them write glTF, USDZ and FBX. One writes a
USDZ that carries *"a Gaussian splat with an automatically generated and aligned mesh"* for a named
robot simulator. The honest counterweight is a vendor's own answer on interchange: *"Since Gaussian
Splatting is relatively new, support for using it within other 3D software is a work in progress."*

Meta's consumer capture is the outlier and it moved backwards. Sharing, invitations and being in a
capture with somebody else were withdrawn: *"As of May 12, 2026, these features are no longer
available. Hyperscape Worlds have moved out of Horizon Worlds and are now only accessible as “view
only”"*, with old links no longer resolving and rendering moved onto the headset. Nothing can be
exported. Meanwhile Meta's development kit renders splats from `.spz` files — a container Niantic
published.

## From a capture to an avatar, and what breaks

Every research family that turns a capture into a driveable person binds splats to a borrowed
parametric model: *"3D Gaussian splats that are rigged to a parametric morphable face model"*, or
Gaussians *"defined by barycentric coordinates and displacement on a triangle mesh"*, or the
whole-body case built on *"whole-body (body, hands, and face) drivability of SMPL-X"*. The results are
excellent and one line relights a head in real time *"on a tethered consumer VR headset"*.

What breaks is everything after the render. Against the map's avatar rows:

- **Avatar body format** — 7 subjects reach it; none of them is a splat method.
- **Avatar skeleton** — 4 reach it. The splat families reach none: the skeleton, where it exists, is
  inside a body model distributed *"for research purposes"* behind a sign-up, which is not an
  interoperability agreement.
- **Facial expression** — one subject on the entire map has it built in.
- **Attachments and wearables** — one subject on the entire map has it built in.
- **Rights enforcement** — nothing on the map reaches it, and two leading avatar implementations
  carry terms that stop a product shipping at all, one of them stating that *"Any commercial use,
  reproduction, disclosure or distribution of this software and related documentation without an
  express license agreement from Toyota Motor Europe NV/SA is strictly prohibited."*

A receiving runtime would therefore need the same body model, the same binding scheme and the same
rasteriser — which is to say, the same code. One consumer product already crosses the gap in the
other direction: a splat becomes a mesh, and that mesh gets *"Auto-Rig Generation"*. No bone naming
convention is stated, so the rig means whatever the receiving tool guesses.

## The content lane: two implementations, or a wish

The maintainer's answer to question 5 made captured content first-class, so the content lane now holds 22
must rows. Counting subjects that reach each row natively or through an extension, from the database:

    comfortable (10 or more)   scene.graph 21, scene.container 18, scene.units 18,
                               deliver.version 18, scene.transform 17, scene.animation 16,
                               scene.texture 15, scene.skeleton 15, scene.geometry 14,
                               capture.splat-format 14
    two to nine                geo.pose 9, deliver.conformance 9, geo.tiles 7,
                               logic.behaviour 7, geo.crs 5, geo.anchor-shared 5,
                               capture.point-cloud 5, scene.licence 4, scene.material-x 3,
                               capture.4d 3, capture.multiview-depth 2
    a wish                     capture.volumetric-video 1

Read the bottom two lines rather than the top one. **Four of the lane's 22 rows have fewer than four
independent implementations, and one of those has a single one.** Time-varying capture reaches three;
multi-view plus depth reaches two; volumetric video reaches exactly one, the MPEG family. Rights
metadata — four. Material exchange — three. These are the rows where a conformance test would have
nothing to test between, because there is no second implementation to disagree with.

## Five questions for the Meta and NVIDIA members

1. **Is `ParticleField` the destination?** NVIDIA is deprecating its own splat package in favour of
   the OpenUSD schema. Will Meta's Splat interface read a `ParticleField` stage, and would either
   company support one profile that says which attributes a conforming reader must handle?
2. **Where should time live — in the primitive, or in the composition?** NuRec puts moving objects in
   their own layers with tracks and trajectories and leaves the Gaussians static; the research puts
   time inside the primitive and ships a monolithic bitstream. Both cannot become the interchange.
3. **What would it take to publish a layered splat bitstream?** The 2026 work shows the gain is real.
   Is there appetite for a shared layering and a delivery profile, rather than one per implementation?
4. **What carries consent and authorship on a capture of a real place?** Hyperscape has the clearest
   capture rules of anyone — no people, no pets, permission for the space — and none of it survives
   as data. Should a splat container carry a rights and provenance record, and which existing one?
5. **Can a captured avatar reach a named skeleton?** If a splat avatar exported a mesh with an agreed
   bone naming and an agreed expression set, most of the avatar lane would open. What is missing on
   the vendor side — the export, the licence on the body model, or an agreement about the names?

## Where the numbers come from

Every count above is derived from `infrastructure-wg/data/territory.db` at the sha256 in the front
matter. Every quote was read from a public primary source on 2026-09-06 and is stored with its
address and retrieval date on the claim it supports, which the map shows when the cell is opened.
Four claims in this region are marked unverified; all four are absences on Meta's Hyperscape, and
each says our reading of the published documentation found nothing, never that the capability is
absent.
