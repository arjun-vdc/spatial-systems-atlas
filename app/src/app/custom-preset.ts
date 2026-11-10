import type { Model } from '../design-model.ts'

export const PRESET_TITLE_LIMIT = 80
export const PRESET_DETAILS_LIMIT = 160

export interface CustomPreset {
  title: string
  details: string
}

/** Shared by form submission and untrusted links; rendered only as plain text. */
export function normalizeCustomPreset(title: unknown, details: unknown): CustomPreset | null {
  const text = (value: unknown, limit: number) => typeof value === 'string'
    ? value.normalize('NFC').replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u202a-\u202e\u2066-\u2069]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, limit).trim()
    : ''
  const name = text(title, PRESET_TITLE_LIMIT)
  return name ? { title: name, details: text(details, PRESET_DETAILS_LIMIT) } : null
}

/** An assessment includes absence and unverified claims, but not out-of-scope or missing cells. */
export function assessedSubjects(model: Model, selected: string[]): string[] {
  const ids = selected.length ? selected : model.capabilities.map((c) => c.id)
  return model.subjects.filter((s) => ids.some((id) => {
    const code = model.cov[s.id]?.[id]
    return Boolean(code) && code[0] !== 'o'
  })).map((s) => s.id)
}
