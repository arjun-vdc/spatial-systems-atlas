// How to cite the Atlas, for the footer's Cite tip and its copy button.

export const SITE = 'https://openspatials.com/msf/atlas/'
export const REPO = 'https://github.com/openspatials/spatial-systems-atlas'

export const citation = (version: string, released: string): string =>
  `Bilham, G. (${released.slice(0, 4)}). Spatial Systems Atlas (Version ${version}, last update: ${released}) ` +
  `[Data set and interface]. ${SITE}. Data and code: ${REPO}.`
