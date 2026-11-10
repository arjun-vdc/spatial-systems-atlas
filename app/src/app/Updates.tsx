// The Atlas's history of updates: a header button and a dialog, newest first.
//
// Each entry says what changed for a reader and the counts at that release.
// It names no people and no development details.

import { useEffect, useRef, useState } from 'react'

type Update = {
  date: string
  text: string
  subjects: number
  capabilities: number
  claims: number
  sources: number
}

const UPDATES: Update[] = [
  { date: '3 November 2026', text: 'Sixteen new subjects: the X3D web players X_ITE and X3DOM, H-Anim, Hyperfy, and twelve web and data standards (IMDF, DDS, W3C Geolocation, WebXR Anchors, WebXR Hand Input, WebGL 2.0, MPEG-V, JSON Pointer, HTTP, WebSocket, the URL Standard and OpenAPI). Two new rows, renderer swap and fallback, and portal preview. Three new lanes: same place, same thing; training results that travel; and shared presence. A new starting view shows the platforms OpenSpatials supports.',
    subjects: 82, capabilities: 178, claims: 14386, sources: 3323 },
  { date: '3 November 2026', text: "A subject's four figures now filter its rows when clicked, and links and starting views can pick the rows to show. The counts sit under one button, a lane shows only its must rows with a number that matches, the key folds away, a footer gives how to cite, the licence and a link to OpenSpatials, and search engines can now find the Atlas.",
    subjects: 66, capabilities: 176, claims: 11605, sources: 3069 },
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

export function Updates() {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const close = () => { setOpen(false); triggerRef.current?.focus() }
  return (
    <>
      <button ref={triggerRef} type="button" style={US.trigger(open)} aria-expanded={open}
        aria-haspopup="dialog" onClick={() => setOpen(!open)}>
        Updates
      </button>
      {open && <UpdatesDialog onClose={close} />}
    </>
  )
}

function UpdatesDialog({ onClose }: { onClose: () => void }) {
  const backdropRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div ref={backdropRef} style={US.backdrop}
      onMouseDown={(e) => { if (e.target === backdropRef.current) onClose() }}>
      <div style={US.card} role="dialog" aria-modal="true" aria-labelledby="up-heading">
        <div style={US.head}>
          <h2 id="up-heading" style={US.h2}>Updates</h2>
          <button ref={closeRef} type="button" style={US.trigger(false)} onClick={onClose}>Close</button>
        </div>
        <ol style={US.list}>
          {UPDATES.map((u) => (
            <li key={u.date} style={US.item}>
              <span style={US.date}>{u.date}</span>
              <p style={US.text}>{u.text}</p>
              <p style={US.counts}>
                {u.claims.toLocaleString('en-US')} claims · {u.sources.toLocaleString('en-US')} sources · {u.subjects} subjects · {u.capabilities} capabilities
              </p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

const US = {
  trigger: (on: boolean) => ({
    fontFamily: 'var(--fl)', fontWeight: 600, fontSize: 10.5,
    background: on ? 'var(--ink)' : 'transparent',
    color: on ? 'var(--bg)' : 'var(--ink)',
    border: `1px solid ${on ? 'var(--ink)' : 'var(--rule)'}`,
    borderRadius: 'var(--r)', padding: '3px 8px', cursor: 'pointer',
  } as const),

  backdrop: {
    position: 'fixed', inset: 0, zIndex: 70,
    background: 'rgba(27,29,26,.42)',
    display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
    padding: '24px 16px', overflow: 'auto',
  } as const,

  card: {
    background: 'var(--panel)', border: '1px solid var(--ruleS)',
    borderRadius: 'var(--r)', boxShadow: '0 2px 12px rgba(0,0,0,.3)',
    width: '100%', maxWidth: 540, margin: 'auto',
    padding: '18px 20px 20px', color: 'var(--ink)',
  } as const,

  head: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 } as const,

  h2: { margin: 0, fontFamily: 'var(--fl)', fontWeight: 700, fontSize: 17 } as const,

  list: { listStyle: 'none', margin: '12px 0 0', padding: 0 } as const,

  item: { padding: '10px 0', borderTop: '1px solid var(--rule)' } as const,

  date: {
    fontFamily: 'var(--fm)', fontSize: 9.5, letterSpacing: '.09em',
    textTransform: 'uppercase', color: 'var(--faint)',
  } as const,

  text: {
    margin: '4px 0', fontFamily: 'var(--fb)', fontSize: 13,
    lineHeight: 1.45, color: 'var(--ink)',
  } as const,

  counts: { margin: 0, fontFamily: 'var(--fm)', fontSize: 11, color: 'var(--soft)' } as const,
}
