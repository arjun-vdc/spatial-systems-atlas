import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { adapt, mergeDetail } from './design-model.ts'
import type { Model } from './design-model.ts'
import { Shell } from './app/Shell.tsx'
import { identityCss, readIdentity } from './identity/identity.ts'
import { PREVIEW } from './preview.ts'
import './styles.css'
import './identity/identity.css'

// A candidate visual identity, chosen in the address with ?identity=a|b|c.
// Without it the page keeps today's look. Preview builds only (src/preview.ts).
const identity = PREVIEW ? readIdentity(window.location.search) : null
if (identity) {
  document.documentElement.dataset.identity = identity
  const tokens = document.createElement('style')
  tokens.id = 'identity-tokens'
  tokens.textContent = identityCss(identity)
  document.head.append(tokens)
}

function Root() {
  const [model, setModel] = useState<Model | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const loadFull = () =>
      fetch('territory.json')
        .then((r) => {
          if (!r.ok) throw new Error(`The data request failed: HTTP ${r.status} ${r.statusText}`)
          return r.json()
        })

    fetch('territory-index.json')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((raw) => {
        if (cancelled) return
        setModel(adapt(raw))
        loadFull()
          .then((full) => { if (!cancelled) setModel((prev) => prev ? mergeDetail(prev, full) : prev) })
          .catch(() => {})
      })
      .catch(() => {
        if (cancelled) return
        loadFull()
          .then((raw) => { if (!cancelled) setModel(adapt(raw)) })
          .catch((e: unknown) => { if (!cancelled) setError(e instanceof Error ? e.message : String(e)) })
      })

    return () => { cancelled = true }
  }, [])

  // A load failure is not an empty result, and must never read as one.
  if (error) {
    return (
      <main className="load-state">
        <h1>The map data did not load</h1>
        <p>{error}</p>
        <p>
          This is a failure to fetch the research snapshot, not a result of nothing being found.
          No part of the map can be drawn until the snapshot loads.
        </p>
        <button type="button" onClick={() => window.location.reload()}>Try again</button>
      </main>
    )
  }

  if (!model) {
    return (
      <main className="load-state">
        <h1>Loading the research snapshot…</h1>
        <p>Every count and percentage on the map is computed from it.</p>
      </main>
    )
  }

  return <Shell model={model} />
}

createRoot(document.getElementById('root')!).render(<StrictMode><Root /></StrictMode>)
