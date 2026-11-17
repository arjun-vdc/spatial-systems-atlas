// The Atlas's history of updates: a header button and a dialog, newest first.
//
// Each entry says what changed for a reader and the counts at that release.
// It names no people and no development details.

import { useEffect, useRef, useState } from 'react'
import { UPDATES } from './updates-log.ts'

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
          {UPDATES.map((u, i) => (
            <li key={`${u.date}-${i}`} style={US.item}>
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

  // The window fits the screen: 32px above and below on a desktop, less on a phone.
  backdrop: {
    position: 'fixed', inset: 0, zIndex: 70,
    background: 'rgba(27,29,26,.42)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 'clamp(12px, 4vw, 32px) 16px', overflow: 'hidden', boxSizing: 'border-box',
  } as const,

  // The title and Close stay put; only the list scrolls.
  card: {
    background: 'var(--panel)', border: '1px solid var(--ruleS)',
    borderRadius: 'var(--r)', boxShadow: '0 2px 12px rgba(0,0,0,.3)',
    width: '100%', maxWidth: 540, maxHeight: '100%', boxSizing: 'border-box',
    display: 'flex', flexDirection: 'column',
    padding: '18px 20px 8px', color: 'var(--ink)',
  } as const,

  head: { flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingBottom: 12 } as const,

  h2: { margin: 0, fontFamily: 'var(--fl)', fontWeight: 700, fontSize: 17 } as const,

  list: { listStyle: 'none', margin: 0, padding: 0, flex: '1 1 auto', minHeight: 0, overflowY: 'auto', overscrollBehavior: 'contain' } as const,

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
