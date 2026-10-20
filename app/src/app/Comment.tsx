// Comment submission against the real endpoint.
//
// The new Atlas endpoint shares the handler retained for cached Map clients.
// The submission becomes a public issue on github.com/openspatials/spatial-systems-atlas.
// The email address is optional, never written into the issue, and kept privately
// so a maintainer can reply.

import { useEffect, useRef, useState } from 'react'

const ENDPOINT = '/msf/atlas/api/submit'
const ISSUES = 'https://github.com/openspatials/spatial-systems-atlas/issues'
const NEW_ISSUE = 'https://github.com/openspatials/spatial-systems-atlas/issues/new/choose'
const SITEKEY = '0x4AAAAAAEqgjvsSDXAjf2mv'
const TURNSTILE_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

const KINDS = [
  { id: 'feedback', label: 'Feedback', tip: 'How the map reads, what it shows, or what it should show.' },
  { id: 'correction', label: 'Correction', tip: 'A claim on the map is wrong.' },
  { id: 'new-subject', label: 'New subject', tip: 'A system the map does not carry yet.' },
] as const

const TITLE_MIN = 4
const TITLE_MAX = 120
const BODY_MIN = 20
const BODY_MAX = 5000

function canPost(): boolean {
  const h = (window.location.hostname || '').toLowerCase()
  return h === 'openspatials.com' || h === 'www.openspatials.com' ||
    h === 'localhost' || h === '127.0.0.1' ||
    /(^|\.)openspatials-com\.pages\.dev$/.test(h)
}

type Phase = 'idle' | 'sending' | 'sent' | 'validation' | 'failure'

export function Comment() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" style={CS.trigger(open)} aria-expanded={open}
        aria-haspopup="dialog" onClick={() => setOpen(!open)}>
        Comment
      </button>
      {open && <CommentDialog onClose={() => setOpen(false)} />}
    </>
  )
}

function CommentDialog({ onClose }: { onClose: () => void }) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [kind, setKind] = useState('feedback')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [email, setEmail] = useState('')
  const [pot, setPot] = useState('')
  const [note, setNote] = useState('')
  const [issueUrl, setIssueUrl] = useState<string | null>(null)
  const [issueNum, setIssueNum] = useState<number | null>(null)
  const [emailKept, setEmailKept] = useState(false)
  const [testReady, setTestReady] = useState(false)

  const titleRef = useRef<HTMLInputElement>(null)
  const bodyRef = useRef<HTMLTextAreaElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const testMountRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const pendingRef = useRef<{
    resolve: (t: string) => void
    reject: (e: Error) => void
    timer: ReturnType<typeof setTimeout>
  } | null>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  const hosted = canPost()
  const locked = phase === 'sending' || phase === 'sent'

  useEffect(() => { if (hosted) titleRef.current?.focus() }, [hosted])

  useEffect(() => {
    if (!hosted) return
    const w = window as unknown as Record<string, unknown>
    if (w.turnstile) { mountWidget(); return }
    const s = document.createElement('script')
    s.src = TURNSTILE_SRC
    s.async = true
    s.onload = () => mountWidget()
    s.onerror = () => {
      if (s.parentNode) s.parentNode.removeChild(s)
      setNote('The human test could not be loaded. File your comment on GitHub instead.')
    }
    document.head.appendChild(s)
    return () => {
      if (widgetIdRef.current != null) {
        const t = w.turnstile as Record<string, (...a: unknown[]) => void> | undefined
        try { t?.remove(widgetIdRef.current) } catch { /* widget already gone */ }
        widgetIdRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hosted])

  function mountWidget() {
    if (widgetIdRef.current != null) { setTestReady(true); return }
    const t = (window as unknown as Record<string, unknown>).turnstile as
      | { render: (el: HTMLElement, opts: Record<string, unknown>) => string | null
          reset: (id: string) => void; execute: (id: string) => void
          remove: (id: string) => void }
      | undefined
    if (!t || !testMountRef.current) return
    try {
      const id = t.render(testMountRef.current, {
        sitekey: SITEKEY, execution: 'execute', appearance: 'execute',
        callback: (tok: string) => settle(tok, null),
        'error-callback': (code: string) => {
          settle(null, `Human test failed${code ? ` (${code})` : ''}. Try again.`)
          return true
        },
        'expired-callback': () => settle(null, 'Human test expired. Press Submit again.'),
        'timeout-callback': () => settle(null, 'Human test timed out. Press Submit again.'),
      })
      widgetIdRef.current = id ?? null
      if (id != null) setTestReady(true)
      else setNote('The human test could not be loaded. File your comment on GitHub instead.')
    } catch {
      setNote('The human test could not be loaded. File your comment on GitHub instead.')
    }
  }

  function settle(token: string | null, msg: string | null) {
    const p = pendingRef.current
    if (!p) return
    pendingRef.current = null
    clearTimeout(p.timer)
    if (token) p.resolve(token)
    else p.reject(new Error(msg ?? 'Human test failed'))
  }

  function getToken(): Promise<string> {
    return new Promise((resolve, reject) => {
      const t = (window as unknown as Record<string, unknown>).turnstile as
        | { reset: (id: string) => void; execute: (id: string) => void } | undefined
      if (!t || widgetIdRef.current == null) {
        reject(new Error('Human test not available. File your comment on GitHub instead.'))
        return
      }
      if (pendingRef.current) {
        reject(new Error('Human test still running. Wait a moment.'))
        return
      }
      pendingRef.current = {
        resolve, reject,
        timer: setTimeout(
          () => settle(null, 'Human test timed out. Press Submit again.'),
          20_000,
        ),
      }
      try {
        t.reset(widgetIdRef.current)
        t.execute(widgetIdRef.current)
      } catch {
        settle(null, 'Human test could not run. File your comment on GitHub instead.')
      }
    })
  }

  // Escape closes — capture phase, before Shell's handler.
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); onCloseRef.current() }
    }
    window.addEventListener('keydown', h, true)
    return () => window.removeEventListener('keydown', h, true)
  }, [])

  // Tab trap.
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !cardRef.current) return
      const els = Array.from(
        cardRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]),input:not([disabled]),textarea:not([disabled]),a[href]',
        ),
      ).filter((el) => el.offsetParent !== null || el === document.activeElement)
      if (!els.length) return
      if (e.shiftKey && document.activeElement === els[0]) {
        e.preventDefault(); els.at(-1)!.focus()
      } else if (!e.shiftKey && document.activeElement === els.at(-1)) {
        e.preventDefault(); els[0].focus()
      }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  const kindKeyDown = (e: React.KeyboardEvent) => {
    const btns = Array.from(
      (e.currentTarget as HTMLElement).querySelectorAll<HTMLElement>('[role="radio"]'),
    )
    const at = btns.indexOf(document.activeElement as HTMLElement)
    if (at < 0) return
    let next: number | null = null
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (at + 1) % btns.length
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (at + btns.length - 1) % btns.length
    if (next === null) return
    e.preventDefault()
    setKind(KINDS[next].id)
    btns[next].focus()
  }

  const doSubmit = async () => {
    if (locked || !testReady) return
    const t = title.trim()
    const b = body.trim()
    if (t.length < TITLE_MIN) {
      setPhase('validation')
      setNote(`The title needs at least ${TITLE_MIN} characters.`)
      titleRef.current?.focus()
      return
    }
    if (b.length < BODY_MIN) {
      setPhase('validation')
      setNote(`The comment needs at least ${BODY_MIN} characters so it can be acted on.`)
      bodyRef.current?.focus()
      return
    }
    setPhase('sending')
    setNote('Sending…')
    try {
      const token = await getToken()
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind, title: t, body: b, email: email.trim(),
          page: 'app', address: String(window.location.href),
          website: pot, turnstile: token,
        }),
      })
      let data: Record<string, unknown> | null = null
      try { data = await res.json() } catch { /* non-JSON response */ }
      if (res.ok && data?.ok && data.number) {
        setPhase('sent')
        setIssueNum(data.number as number)
        setIssueUrl(data.url as string)
        setEmailKept(!!data.email_kept)
        setNote('')
      } else {
        setPhase('failure')
        setNote(
          (data?.message as string) ??
          'The submission could not be filed. Try again, or file it on GitHub.',
        )
      }
    } catch (err) {
      setPhase('failure')
      setNote(
        err instanceof Error
          ? err.message
          : 'The submission could not be sent. Try again, or file it on GitHub.',
      )
    }
  }

  return (
    <div ref={backdropRef} style={CS.backdrop}
      onMouseDown={(e) => { if (e.target === backdropRef.current) onCloseRef.current() }}>
      <div ref={cardRef} style={CS.card} role="dialog" aria-modal="true"
        aria-labelledby="cm-heading">
        <span style={CS.eyebrow}>
          Metaverse Standards Forum · spatial technology map
        </span>
        <h2 id="cm-heading" style={CS.h2}>Comment on this map</h2>

        {hosted ? (
          <>
            <p style={CS.lede}>
              Your comment becomes a public issue on GitHub.
              The map's maintainers read every submission.
            </p>

            <form noValidate onSubmit={(e) => { e.preventDefault(); doSubmit() }}>
              <fieldset style={CS.publicSection}>
                <legend style={CS.sectionLegend}>
                  Public — becomes a GitHub issue
                </legend>

                <div style={CS.field}>
                  <span style={CS.lab} id="cm-kind-lab">What kind</span>
                  <div style={CS.kindRow} role="radiogroup"
                    aria-labelledby="cm-kind-lab" onKeyDown={kindKeyDown}>
                    {KINDS.map((k) => (
                      <button key={k.id} type="button" role="radio" title={k.tip}
                        aria-checked={kind === k.id} tabIndex={kind === k.id ? 0 : -1}
                        style={CS.kind(kind === k.id)} disabled={locked}
                        onClick={() => setKind(k.id)}>
                        {k.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={CS.field}>
                  <label style={CS.lab} htmlFor="cm-title">Title</label>
                  <input ref={titleRef} id="cm-title" type="text" style={CS.input}
                    maxLength={TITLE_MAX} placeholder="One line saying what this is about"
                    value={title} disabled={locked} autoComplete="off" spellCheck
                    onChange={(e) => {
                      setTitle(e.target.value)
                      if (phase === 'validation') { setPhase('idle'); setNote('') }
                    }} />
                </div>

                <div style={CS.field}>
                  <label style={CS.lab} htmlFor="cm-body">Your comment</label>
                  <textarea ref={bodyRef} id="cm-body" style={CS.ta}
                    maxLength={BODY_MAX}
                    placeholder="What you noticed, and what you would expect instead."
                    value={body} disabled={locked}
                    onChange={(e) => {
                      setBody(e.target.value)
                      if (phase === 'validation') { setPhase('idle'); setNote('') }
                    }} />
                  <p style={CS.hint}>
                    Anyone can read this. Put nothing here you would not publish.
                  </p>
                </div>
              </fieldset>

              <fieldset style={CS.privateSection}>
                <legend style={CS.sectionLegend}>Private — never published</legend>
                <div style={CS.field}>
                  <label style={CS.lab} htmlFor="cm-email">Email</label>
                  <input id="cm-email" type="email" style={CS.input} maxLength={254}
                    placeholder="Only if you want a reply" value={email} disabled={locked}
                    autoComplete="email" onChange={(e) => setEmail(e.target.value)} />
                  <p style={CS.hint}>
                    Optional. Kept privately so a maintainer can reply.
                    Never written into the issue.
                  </p>
                </div>
              </fieldset>

              <div aria-hidden="true"
                style={{ position: 'absolute', left: -9999, width: 1, height: 1, opacity: 0 }}>
                <label htmlFor="cm-hp">Leave this empty</label>
                <input id="cm-hp" type="text" tabIndex={-1} autoComplete="off"
                  value={pot} onChange={(e) => setPot(e.target.value)} />
              </div>

              <div ref={testMountRef} style={{ minHeight: 0 }} />

              <div style={CS.acts}>
                <button type="submit"
                  style={{ ...CS.go, opacity: locked || !testReady ? 0.5 : 1 }}
                  disabled={locked || !testReady}>
                  {phase === 'sending' ? 'Sending…' : phase === 'sent' ? 'Sent' : 'Submit'}
                </button>
                <button type="button" style={CS.no}
                  onClick={() => onCloseRef.current()}>
                  {phase === 'sent' ? 'Close' : 'Cancel'}
                </button>
              </div>
            </form>

            {note && (
              <p style={CS.say(phase === 'validation' || phase === 'failure')}
                role="status" aria-live="polite">
                {note}
                {phase === 'failure' && (
                  <>
                    {' '}
                    <a href={NEW_ISSUE} target="_blank" rel="noopener"
                      style={{ color: 'var(--ac)' }}>
                      Open an issue on GitHub
                    </a>
                  </>
                )}
              </p>
            )}

            {phase === 'sent' && issueUrl && (
              <p style={CS.say(false)} role="status" aria-live="polite">
                Your submission is number {issueNum}:{' '}
                <a href={issueUrl} target="_blank" rel="noopener"
                  style={{ color: 'var(--ac)' }}>{issueUrl}</a>.
                It is public. Comments are reviewed every two weeks.
                {emailKept &&
                  ' Your email address is kept privately and is not on that page.'}
              </p>
            )}

            {!testReady && phase === 'idle' && !note && (
              <p style={CS.hint}>Checking that you are a person…</p>
            )}
          </>
        ) : (
          <>
            <p style={CS.lede}>
              This copy of the map cannot file a submission.
              The address the form sends to only exists on openspatials.com.
            </p>
            <div style={CS.acts}>
              <a href={NEW_ISSUE} target="_blank" rel="noopener"
                style={{ ...CS.go, textDecoration: 'none', display: 'inline-block' }}>
                Open an issue on GitHub
              </a>
              <button type="button" style={CS.no}
                onClick={() => onCloseRef.current()} autoFocus>
                Close
              </button>
            </div>
          </>
        )}

        <p style={{ ...CS.hint, marginTop: 10 }}>
          Every submission is here:{' '}
          <a href={ISSUES} target="_blank" rel="noopener"
            style={{ color: 'var(--ac)' }}>{ISSUES}</a>
        </p>
      </div>
    </div>
  )
}

const CS = {
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

  eyebrow: {
    fontFamily: 'var(--fm)', fontSize: 9.5, letterSpacing: '.09em',
    textTransform: 'uppercase', color: 'var(--faint)',
  } as const,

  h2: {
    margin: '2px 0 6px', fontFamily: 'var(--fl)', fontWeight: 700, fontSize: 17,
  } as const,

  lede: {
    margin: '0 0 14px', fontFamily: 'var(--fb)', fontSize: 13,
    lineHeight: 1.45, color: 'var(--soft)',
  } as const,

  publicSection: {
    border: '1px solid var(--rule)', borderRadius: 'var(--r)',
    padding: '10px 12px 12px', margin: '0 0 12px',
  } as const,

  privateSection: {
    border: '1px solid var(--ruleS)', borderRadius: 'var(--r)',
    padding: '10px 12px 12px', margin: '0 0 12px',
    background: 'var(--sunk)',
  } as const,

  sectionLegend: {
    fontFamily: 'var(--fl)', fontWeight: 700, fontSize: 10,
    letterSpacing: '.1em', textTransform: 'uppercase',
    color: 'var(--faint)', padding: '0 4px',
  } as const,

  field: { margin: '0 0 10px' } as const,

  lab: {
    display: 'block', fontFamily: 'var(--fl)', fontWeight: 600,
    fontSize: 11, letterSpacing: '.06em', textTransform: 'uppercase',
    color: 'var(--soft)', margin: '0 0 5px',
  } as const,

  kindRow: { display: 'flex', flexWrap: 'wrap', gap: 5 } as const,

  kind: (on: boolean) => ({
    fontFamily: 'var(--fl)', fontWeight: 600, fontSize: 12, cursor: 'pointer',
    background: on ? 'var(--ink)' : 'var(--bg)',
    color: on ? 'var(--bg)' : 'var(--ink)',
    border: `1px solid ${on ? 'var(--ink)' : 'var(--rule)'}`,
    borderRadius: 'var(--r)', padding: '4px 9px',
  } as const),

  input: {
    width: '100%', boxSizing: 'border-box',
    fontFamily: 'var(--fb)', fontSize: 13.5,
    color: 'var(--ink)', background: 'var(--bg)',
    border: '1px solid var(--ruleS)', borderRadius: 'var(--r)',
    padding: '7px 8px',
  } as const,

  ta: {
    width: '100%', boxSizing: 'border-box',
    fontFamily: 'var(--fb)', fontSize: 13.5,
    color: 'var(--ink)', background: 'var(--bg)',
    border: '1px solid var(--ruleS)', borderRadius: 'var(--r)',
    padding: '7px 8px', minHeight: 100, resize: 'vertical', lineHeight: 1.45,
  } as const,

  hint: {
    fontFamily: 'var(--fb)', fontSize: 11.5, color: 'var(--faint)',
    lineHeight: 1.35, margin: '4px 0 0',
  } as const,

  acts: {
    display: 'flex', flexWrap: 'wrap', gap: 8,
    alignItems: 'center', marginTop: 14,
  } as const,

  go: {
    fontFamily: 'var(--fl)', fontWeight: 600, fontSize: 12.5,
    background: 'var(--ink)', color: 'var(--bg)',
    border: '1px solid var(--ink)', borderRadius: 'var(--r)',
    padding: '7px 14px', cursor: 'pointer',
  } as const,

  no: {
    fontFamily: 'var(--fl)', fontWeight: 600, fontSize: 12.5,
    background: 'var(--bg)', color: 'var(--ink)',
    border: '1px solid var(--ruleS)', borderRadius: 'var(--r)',
    padding: '7px 14px', cursor: 'pointer',
  } as const,

  say: (bad: boolean) => ({
    margin: '12px 0 0', fontFamily: 'var(--fb)', fontSize: 13,
    lineHeight: 1.45, color: bad ? 'var(--bad)' : 'var(--ink)',
  } as const),
}
