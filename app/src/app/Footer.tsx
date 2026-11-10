// The page footer: author, licence, contact, how to cite, the way back to the
// OpenSpatials home page, and the version.
//
// It is fixed to the foot of the window. The credits sit at the left and wrap in
// their own column when the line is too narrow; the version keeps a column of its
// own at the right. The footer writes its height to --footer-h on the page root,
// so the page can keep its last content and the side rail clear of it.
//
// The contact address is not in the page or the bundle as text. It is put
// together after the page loads, so a crawler that reads the HTML or the
// script without running it finds no address to harvest.

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { RELEASED, VERSION } from '../version.ts'
import { HoverTip } from './HoverTip.tsx'
import { citation } from './citation.ts'

const HOME = 'https://openspatials.com/'
const AUTHOR = 'https://github.com/grigb'
const CC0 = 'https://creativecommons.org/publicdomain/zero/1.0/'
// The mailto link, one character code per letter, last letter first.
const CONTACT = [104, 99, 101, 116, 46, 116, 101, 115, 109, 117, 115, 64, 103, 105, 114, 103, 58, 111, 116, 108, 105, 97, 109]

export function Footer({ style }: { style: CSSProperties }) {
  const [mail, setMail] = useState('')
  const [copied, setCopied] = useState<'no' | 'yes' | 'failed'>('no')
  useEffect(() => { setMail(String.fromCharCode(...CONTACT.slice().reverse())) }, [])

  const foot = useRef<HTMLElement>(null)
  useLayoutEffect(() => {
    const el = foot.current
    if (!el) return
    const root = document.documentElement
    const write = () => root.style.setProperty('--footer-h', `${el.getBoundingClientRect().height}px`)
    write()
    const watch = new ResizeObserver(write)
    watch.observe(el, { box: 'border-box' })
    return () => { watch.disconnect(); root.style.removeProperty('--footer-h') }
  }, [])

  const cite = citation(VERSION, RELEASED)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(cite)
      setCopied('yes')
    } catch {
      setCopied('failed')
    }
    window.setTimeout(() => setCopied('no'), 2000)
  }

  return (
    <footer ref={foot} style={{ ...style, display: 'flex', alignItems: 'center', gap: 16 }}>
      <span style={S.line}>
        <span style={S.whole}>Spatial Systems Atlas</span>
        <HoverTip label="Licence" trigger="CC0" triggerStyle={S.word} above width={300}>
          Free for any use, commercial or not, with no permission needed: the data and code are
          dedicated to the public domain under{' '}
          <a href={CC0} style={S.tipLink} target="_blank" rel="noopener noreferrer">CC0 1.0</a>.
          {' '}A citation and a link back are welcome, never required.
        </HoverTip>
        <span style={S.whole}>by Grig Bilham</span>
        {mail && (
          <a href={mail} style={S.icon} aria-label="Email" title="Email">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="M3.5 6.5l8.5 6.5 8.5-6.5" />
            </svg>
          </a>
        )}
        <a href={AUTHOR} style={S.icon} aria-label="GitHub" title="GitHub" target="_blank" rel="noopener noreferrer">
          <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
        </a>
        <HoverTip label="Cite" trigger="Cite" triggerStyle={S.word} above width={420}>
          <span style={{ display: 'flex', gap: 4, alignItems: 'flex-start' }}>
            <span style={{ flex: 1 }}>Cite as: {cite}</span>
            <button type="button" onClick={copy} style={S.copy}
              aria-label="Copy the citation" title={copied === 'yes' ? 'Copied' : 'Copy the citation'}>
              {copied === 'yes' ? (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                  strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                  <rect x="9" y="9" width="11" height="11" rx="2" />
                  <path d="M5 15V6a2 2 0 0 1 2-2h9" />
                </svg>
              )}
            </button>
          </span>
          <span role="status" style={{ display: 'block', marginTop: 4, fontSize: 11.5, color: 'var(--soft)' }}>
            {copied === 'yes' ? 'Copied to the clipboard.' : copied === 'failed' ? 'Copy failed: select the text instead.' : ''}
          </span>
        </HoverTip>
        <span style={S.whole}>
          <span aria-hidden="true">·</span> An <a href={HOME} style={{ color: 'inherit' }}>OpenSpatials</a> project
        </span>
      </span>
      <span style={S.version} title={`Version ${VERSION} · Last update: ${RELEASED}`}>v{VERSION}/{RELEASED}</span>
    </footer>
  )
}

const S = {
  // The credits column: it takes the room the version leaves and wraps between items.
  line: { flex: '1 1 auto', minWidth: 0, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0 6px' } as const,
  whole: { whiteSpace: 'nowrap' } as const,
  version: { flex: '0 0 auto', marginLeft: 'auto', whiteSpace: 'nowrap', textAlign: 'right' } as const,
  // A word that opens a tip, set like the footer text around it.
  word: {
    font: 'inherit', letterSpacing: 'inherit', color: 'inherit', background: 'none', border: 0, padding: 0,
    cursor: 'pointer', textDecoration: 'underline', textDecorationStyle: 'dotted', textUnderlineOffset: 3,
  } as const,
  icon: { display: 'inline-flex', color: 'inherit', padding: 1 } as const,
  copy: {
    display: 'inline-flex', flexShrink: 0, padding: 3, border: '1px solid var(--ruleS)', borderRadius: 4,
    background: 'var(--bg)', color: 'var(--ink)', cursor: 'pointer',
  } as const,
  tipLink: { color: 'var(--ac)' } as const,
}
