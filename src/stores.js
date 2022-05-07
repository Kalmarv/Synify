import { readable, writable } from "svelte/store";

export const code = writable(null);

export const appUrl = readable(null, function start(set) {
  set("ROLLUP_REPLACE");
});

export let authToken = writable(null);
export let refreshToken = writable(null);

export const clientID = readable("6888734b4fc749cdb701c89482a3db41");

export let songName = writable(null);
export let songArtist = writable(null);
export let songImage = writable(null);
export let songLink = writable(null);
