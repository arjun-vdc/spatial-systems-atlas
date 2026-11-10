---
type: report
title: "Model A1: documented Pixel Streaming example and scope decision"
status: complete
created: 2026-09-11T01:01:26Z
project: msf-wg-tool
created_by: the maintainers
---

# Model A1: cloud-rendered video

Prepared 2026-09-11. Model A1 has a citable implementation example: Unreal Engine Pixel Streaming. This fact sheet is Map-local. It does not establish a working-group decision to standardize remote rendering, and it does not change the parent research corpus or the published board.

The September 10 accepted Unreal scope trace (not published) covers Pixel Streaming as item E102. Its source receipts were retrieved on September 10; the three primary pages below were also read through the web tool on September 11. These are documentation reads, with no running streaming session or measured headset trial.

| Question | Supported statement | Limit |
|---|---|---|
| Where does execution happen? | A packaged Unreal application runs on a remote desktop or cloud host. The plugin encodes its rendered output; a signaling/web server serves and connects the browser player. | This is one deployment architecture, not the definition of every thin client. [Epic overview](https://dev.epicgames.com/documentation/unreal-engine/overview-of-pixel-streaming-in-unreal-engine) |
| What crosses the connection? | Rendered frames and audio travel over WebRTC. Browser input returns to the remote application. | A video route does not require the client to interpret the source scene geometry. That does not make the frontend's application protocol universally interchangeable. [Epic Pixel Streaming](https://dev.epicgames.com/documentation/unreal-engine/pixel-streaming-in-unreal-engine?lang=en-US) |
| What input is documented? | The landing page lists keyboard, mouse, touch, gamepad/XR and custom HTML UI input. | This read did not establish exact pose fields, units, reference frames, sampling, prediction or controller semantics. “XR” in an input list is not a portable pose contract. [Input list](https://dev.epicgames.com/documentation/unreal-engine/pixel-streaming-in-unreal-engine?lang=en-US) |
| How is a session found and established? | The documented setup uses a signaling connection and a browser player; STUN/TURN may be needed across network boundaries. | This does not define cross-operator discovery, portable identity or world addressing. [Connection process](https://dev.epicgames.com/documentation/unreal-engine/overview-of-pixel-streaming-in-unreal-engine) |
| How does state move to another server? | No cross-server state-handoff contract was established by these inspected pages. | Unknown in this bounded read, not a claim that the whole product lacks one. Reconnection, session migration and a portal transfer are different questions. |
| What is the latency budget? | Epic describes a tradeoff among latency, quality and resiliency, affected by encoding, network conditions, geography and host resources. | No universal flat-screen/headset budget or service-quality guarantee was established. Do not turn the companion's qualitative headset discussion into measurements. [Stream Tuning Guide](https://dev.epicgames.com/documentation/unreal-engine/stream-tuning-guide) |
| What are the cost and failure guarantees? | These pages describe components and tuning. | No per-user GPU ratio, economic estimate, recovery guarantee or measured failure behavior was established here. |

## Current Map placement and the remaining decision

Existing questions such as `net.media`, `net.transport`, `net.session`, `input.session` and `input.devcaps` can describe parts of a remote session. A complete remote-view contract would need more than those parts. The September 9 proposal review (not published) retains the proposed `render.remote` hold. The September 10 Unreal trace explicitly preserves that hold and records **no new decision**. `render.remote` is absent from the current 117-capability export; Pixel Streaming documentation does not authorize adding it. (Superseded on 2026-10-20: `render.remote` is now a row, recorded descriptively.)

The original request asked the working group whether remote rendering belongs in scope. No answer to that specific question was found in the original request, current roadmap, accepted boundary result or accepted Unreal trace. The concrete choices remain:

1. **Retain Model A1 as descriptive context.** Use this bounded fact sheet; keep work focused on the existing portability and boundary questions. No additional research or capability row follows.
2. **Include a defined remote-rendering interoperability use case.** State the producer/receiver boundary and the required media, input/pose, timing and handoff properties, then reopen the existing `render.remote` proposal through its current review process. The missing protocol and measurement evidence above defines the scope of that work.

This prepares the decision and finishes the local research. It does not invent a group answer, upgrade a held proposal or claim that shared-corpus publication occurred.

## Decision recorded 2026-09-18

Cloud rendering stays descriptive. Model A1 is retained as bounded context only. No new capability row, no `render.remote` proposal reopened, no interoperability contract defined. The map records what exists; it does not author an agreement the working group would then have to ratify. (Superseded on 2026-10-20: `render.remote` is now a row, recorded descriptively.)
