<script>
  import Canvas from "./Canvas.svelte";
  import Navbar from "./Navbar.svelte";
  import { onMount } from "svelte";
  import {
    authToken,
    tokenExpired,
    songName,
    songArtist,
    songImage,
    songLink,
  } from "./stores.js";

  let playing;

  async function getUserPlaying() {
    const res = await fetch(
      "https://api.spotify.com/v1/me/player/currently-playing",
      {
        headers: {
          Authorization: "Bearer " + $authToken,
        },
      }
    );
    if (res.status == 200) {
      const data = await res.json();

      songName.set(data.item.name);
      songArtist.set(data.item.album.artists[0].name);
      songImage.set(data.item.album.images[0].url);
      songLink.set(data.item.external_urls.spotify);

      playing = true;
    } else if (res.status == 204) {
      playing = false;
    } else {
      tokenExpired.set(true);
    }
  }

  onMount(async () => {
    getUserPlaying();
    setInterval(() => {
      console.log("Checking for new song...");
      getUserPlaying();
    }, 5000);
  });
</script>

{#if playing == true}
  <Canvas />
{/if}
{#if playing == false}
  <Navbar />
  <h1>Try playing a song</h1>
{/if}
