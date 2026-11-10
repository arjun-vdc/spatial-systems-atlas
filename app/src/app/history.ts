// The browser history of the analysis.
//
// Each change the address carries becomes a history entry, so back and forward
// step through views. A quick burst of changes within one display (several
// subject toggles, say) merges into one entry, so back does not replay every click.

import type { Model } from '../design-model.ts'
import { ADDRESS_KEYS, addressOf, decode, initialState } from './state.ts'
import type { AppState } from './state.ts'

/** Changes closer together than this, in one display, share an entry. */
export const BURST_MS = 700

/** The last address this app wrote, and when. */
export interface Written {
  encoded: string
  at: number
}

const viewOf = (encoded: string) => new URLSearchParams(encoded.replace(/^[?#]/, '')).get('view')

/**
 * Push a new entry, or replace the current one as part of a burst. The first
 * write after a load or a back/forward (no `last`) always pushes, and a change
 * of display always pushes, however quick.
 */
export function historyStep(last: Written | null, encoded: string, at: number, burstMs = BURST_MS): 'push' | 'replace' {
  if (!last) return 'push'
  return at - last.at < burstMs && viewOf(last.encoded) === viewOf(encoded) ? 'replace' : 'push'
}

/**
 * The state an entry the reader went back or forward to stands for. An entry
 * with no analysis address is the opening view. Preferences and the expanded
 * groups stay as they are.
 */
export function restoreFromAddress(hash: string, search: string, model: Model, current: AppState): AppState {
  const address = addressOf(hash, search)
  const named = [...new URLSearchParams(address.replace(/^[?#]/, '')).keys()].some((k) => ADDRESS_KEYS.includes(k))
  const base = named ? current : { ...initialState(model), theme: current.theme, openGroups: current.openGroups }
  return decode(address, model, base)
}
