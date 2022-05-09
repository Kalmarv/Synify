import { readable, writable } from 'svelte/store'
import { tweened } from 'svelte/motion'
import { cubicOut } from 'svelte/easing'

export const appUrl = readable(null, function start(set) {
  set('ROLLUP_REPLACE')
})

export const code = writable(null)
export const authToken = writable(null)
export const refreshToken = writable(null)
export const clientID = readable('6888734b4fc749cdb701c89482a3db41')
export const songName = writable(null)
export const songArtist = writable(null)
export const songImage = writable(null)
export const songLink = writable(null)

export const albumProg = tweened(1, {
  duration: 150,
  cubicOut,
})
