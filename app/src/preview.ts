// Candidate looks and displays not chosen yet.
// They switch on with ?identity= and ?candidates in the address, but only in the dev server
// or a build made with VITE_ATLAS_CANDIDATES=1. A production build ignores both, so the
// live site never carries an unchosen candidate.
export const PREVIEW = import.meta.env.DEV || import.meta.env.VITE_ATLAS_CANDIDATES === '1'
