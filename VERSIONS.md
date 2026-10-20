# Versions

There is one version number. It lives in `app/package.json`, the build raises it,
and the interface prints it in its footer.

**To find out what you are looking at, scroll to the bottom of the page.** That is
the whole mechanism. Nothing else carries a version and nothing else needs to.

    major . line . build

The build number rises by one every time `npm run build` runs. It is not a
release count and it does not mean anything on its own; it exists so two builds
of the same line can be told apart.

## The lines

**1.0 — the original atlas.** One self-contained HTML file, built by
`tool/data/build.py`. Was live at `https://openspatials.com/msf/map/` until the
1.4 interface replaced it on 2026-09-15. Recreated for comparison as
`app/design-candidate/MSF Map - today.dc.html`, which is a rendering of this line
rather than a version of its own.

**1.1 — the matrix page.** The tidy-up of 1.0. Was live at
`https://openspatials.com/msf/map/matrix/`, now a 301 redirect to `/msf/map/`
(WO-100, 2026-09-18). Also one self-contained file from the same build.

**1.2 — the first redesign.** `app/design-candidate/MSF Map - redesign.dc.html`.
Frozen at the owner's instruction and kept as the record of what changed between
the two design rounds. Never deployed.

**1.3 — the accepted redesign.** `app/design-candidate/MSF Map - redesign v3.dc.html`.
The design the current interface was built from. Never deployed.

**1.4 — the current interface.** The React and TypeScript implementation of 1.3,
in `app/`. **This is the only living line.** It is the one that gets built, the
one that carries a build number, and the one that prints its version.

1.0 to 1.3 are finished artifacts with no build counter, so they are written
without one. Only 1.4 has builds.

## What is deployed

**The live Atlas is 1.4.11** (read from the served interface on 2026-10-19).
`https://openspatials.com/msf/atlas/` serves it, since 2026-10-02. The old address
`https://openspatials.com/msf/map/` shows a five-second moved-page notice and then
opens `/msf/atlas/`, keeping the query and the fragment. The page prints its own
version at the bottom, so this file can go stale and the page cannot.

On 2026-10-20 the data behind it was updated without a new build: deployment
`c400e673`, 66 subjects, 175 capabilities in 15 groups and 10,659 claims. The
interface is still 1.4.11.

The first 1.4 deploy was 1.4.5, on 2026-09-15, as deployment `7ebe4b7f`, at
`/msf/map/`.

`/msf/map/matrix/` redirects to `/msf/map/` with a 301, since 2026-09-18
(deployment `8279c9d1`, WO-100). The matrix page was version 1.1, the tidy-up of
the original atlas. The current interface's Compare display does everything it
did, so it was retired the same way the c4 and atlas addresses were: a permanent
redirect, not a removal, because working-group material links to it.

`/msf/map/v1/` is the frozen 2026-09-04 snapshot and is meant to stay exactly as
it is.

Every deploy keeps a copy of what the site served beforehand, so any version
can be put back.

## Reading an address

The interface keeps its state in the **hash** of the address, after the `#`. A
link with the same values in the query string, before the `#`, loads the default
view and silently ignores them. The copy-link button always writes the hash form,
so a shared link is correct; only a hand-typed one can get this wrong.

    .../msf/map/#view=subject&s=all&of=verse&rows=all&basis=all      restores Verse
    .../msf/map/?view=subject&s=all&of=verse&rows=all&basis=all      does not

## How it works

`app/package.json` holds the version. `npm run build` runs
`scripts/stamp-version.mjs` first, which raises the build number there and writes
`app/src/version.ts`. The interface imports that and prints it in the footer.

The stamp is the first command inside the `build` script rather than a `prebuild`
hook on purpose: this machine has npm's `ignore-scripts` set to `true`, which
skips every lifecycle hook without saying so. A version that silently stops being
stamped is how a build gets misidentified.

`app/src/version.ts` is generated. Do not edit it; edit `app/package.json` if you
need to change the line, and let the build set the build number.

## Starting a new line

Raise the middle number in `app/package.json` and set the build number to 0. Add
a paragraph here saying what the line is and what it replaces. Two lines never
live at once: when a new one starts, the one before it is finished and stops
being built.
