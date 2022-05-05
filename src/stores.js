import { readable, writable } from "svelte/store";

export const code = readable(null, function start(set) {
  const url = new URL(window.location);
  let searchTest = window.location.search;

  while (window.location.search) {
    const resCode = url.searchParams.get("code");
    set(resCode);
    window.history.pushState("object or string", "Title", "/");
    searchTest = false;
  }
});

export const appUrl = readable(null, function start(set) {
  set("ROLLUP_REPLACE");
});

export const tokenExpired = writable(false);

export let authToken = writable(null);

export const clientID = readable("6888734b4fc749cdb701c89482a3db41");

export let songName = writable(null);
export let songArtist = writable(null);
export let songImage = writable(null);
export let songLink = writable(null);
