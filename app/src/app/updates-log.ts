// The Atlas's history of updates, newest first. Each entry says what changed for a reader and the
// counts at that release. It names no people and no development details.

export type Update = {
  date: string
  text: string
  subjects: number
  capabilities: number
  claims: number
  sources: number
}

/** One entry per date, newest first; a day's changes share one entry and that day's latest counts. */
export const UPDATES: Update[] = [
  { date: '14 November 2026', text: 'A new view, Interop, shows which parts two systems must agree on can already work together, because shipping products use the same standard for them, and which cannot yet. Four figures and one bar per use case give the answer at a glance; a use case lists its parts, and each part shows the standards that cover it, which shipping products use each one, and their sources. A product counts as using a standard only where its own sources name that standard for the part. A new starting view, training results that travel, gives the reason each of its six rows is there. A row\'s panel now lists its related use cases from public use-case records, each marked as a stated or implied need and as reviewed or unreviewed by the Atlas, with dated counts from the repository they come from. Use cases explain why a row is needed; they never change a rating. Two new platform subjects, Spawn and Project 0, where games and worlds are built by instructing an AI. Platforms are now grouped into social worlds, game platforms, and AI-built game and world platforms, in the subject list, the family chips and on each platform\'s own page.',
    subjects: 84, capabilities: 178, claims: 14619, sources: 3357 },
  { date: '3 November 2026', text: "Sixteen new subjects: the X3D web players X_ITE and X3DOM, H-Anim, Hyperfy, and twelve web and data standards (IMDF, DDS, W3C Geolocation, WebXR Anchors, WebXR Hand Input, WebGL 2.0, MPEG-V, JSON Pointer, HTTP, WebSocket, the URL Standard and OpenAPI). Two new rows, renderer swap and fallback, and portal preview. Three new lanes: same place, same thing; training results that travel; and shared presence. A new starting view shows the platforms OpenSpatials supports. A subject's four figures now filter its rows when clicked, and links and starting views can pick the rows to show. The counts sit under one button, a lane shows only its must rows with a number that matches, the key folds away, a footer gives how to cite, the licence and a link to OpenSpatials, and search engines can now find the Atlas.",
    subjects: 82, capabilities: 178, claims: 14386, sources: 3323 },
  { date: '1 November 2026', text: 'A new row for non-visual sensory effects (wind, scent, light, motion), a new menu and layout, and new starting views.',
    subjects: 66, capabilities: 176, claims: 11605, sources: 3069 },
  { date: '30 October 2026', text: 'The open data now matches the live Atlas, with broken links fixed.',
    subjects: 66, capabilities: 175, claims: 11539, sources: 3061 },
  { date: '26 October 2026', text: 'More evidence added across the Atlas.',
    subjects: 66, capabilities: 175, claims: 11539, sources: 3061 },
  { date: '23 October 2026', text: 'A large round of new evidence, filling many open cells.',
    subjects: 66, capabilities: 175, claims: 11513, sources: 3041 },
  { date: '20 October 2026', text: 'Nine new subjects, and new rows for object tracking, remote rendering, live data, activity records and physiological input.',
    subjects: 66, capabilities: 175, claims: 10659, sources: 2687 },
  { date: '22 September 2026', text: 'The Infrastructure Territory Map is now the Spatial Systems Atlas.',
    subjects: 57, capabilities: 164, claims: 6996, sources: 1963 },
  { date: '14 September 2026', text: 'First public release of the data, build and interface.',
    subjects: 57, capabilities: 162, claims: 6882, sources: 1932 },
]
