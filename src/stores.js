import { readable, writable } from 'svelte/store'
import { tweened } from 'svelte/motion'
import { cubicOut } from 'svelte/easing'

export const appUrl = readable(null, function start(set) {
  set('ROLLUP_REPLACE')
})

export const code = writable(localStorage.getItem('code') || null)
code.subscribe((val) => {
  if (val !== null) localStorage.setItem('code', val)
})

export const authToken = writable(localStorage.getItem('authToken') || null)
authToken.subscribe((val) => {
  if (val !== null) localStorage.setItem('authToken', val)
})

export const refreshToken = writable(localStorage.getItem('refreshToken') || null)
refreshToken.subscribe((val) => {
  if (val !== null) localStorage.setItem('refreshToken', val)
})

export const clientID = readable('6888734b4fc749cdb701c89482a3db41')
export const songName = writable(null)
export const songArtist = writable(null)
export const songImage = writable(null)
export const songLink = writable(null)

export const albumProg = tweened(1, {
  duration: 150,
  cubicOut,
})
