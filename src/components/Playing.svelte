<script>
  import Canvas from './Canvas.svelte'
  import Error from './Error.svelte'
  import Fullscreen from './Fullscreen.svelte'
  import { onMount } from 'svelte'
  import { authToken, songName, songArtist, songImage, songLink, clientID, refreshToken } from '../stores.js'
  import { parseArtists } from '../helpers.js'

  let playingSong
  let accumulatedErrors = []

  const newError = (msg) => {
    accumulatedErrors.push(msg)
    accumulatedErrors = accumulatedErrors
  }

  async function getUserPlaying() {
    const res = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: { Authorization: 'Bearer ' + $authToken },
    })
    if (res.status == 200) {
      const data = await res.json()

      if (data.currently_playing_type == 'track') {
        songName.set(data.item.name)
        songArtist.set(parseArtists(data.item.artists))
        songImage.set(data.item.album.images[0].url)
        songLink.set(data.item.external_urls.spotify)
      }

      if (data.currently_playing_type == 'episode') {
        songName.set("Spotify doesn't give podcast images :(")
        songArtist.set('Try a song instead')
        songImage.set('./pictures/sadamongus.png')
        songLink.set('https://github.com/Kalmarv/Synify')
      }

      playingSong = true
    } else if (res.status == 204) {
      const getUserData = async () => {
        const res = await fetch('https://api.spotify.com/v1/me', {
          headers: {
            Authorization: 'Bearer ' + $authToken,
          },
        })
        if (res.ok) {
          const data = await res.json()
          songName.set(`Hi, ${data.display_name}!`)
        }
      }

      playingSong = true
      getUserData()

      songArtist.set('Try playing a song')
      songImage.set('./pictures/nothingPlaying.png')
      songLink.set('https://github.com/Kalmarv/Synify')
    } else if (res.status == 401) {
      const errorMessage = await res.json()

      if (errorMessage.error.message !== 'The access token expired') {
        newError(errorMessage.error.message)
        return
      }
      // Token expired
      const refreshRes = await fetch('https://accounts.spotify.com/api/token', {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        method: 'post',
        body: new URLSearchParams({
          client_id: $clientID,
          grant_type: 'refresh_token',
          refresh_token: $refreshToken,
        }),
      })

      let json = await refreshRes.json()

      if (refreshRes.status === 200) {
        authToken.set(json.access_token)
        refreshToken.set(json.refresh_token)
        getUserPlaying()
      }
    } else {
      const errorMessage = await res.json()
      newError(errorMessage.error.message)
    }
  }
  onMount(async () => {
    getUserPlaying()
    setInterval(() => {
      console.log('Checking for new song...')
      getUserPlaying()
    }, 5000)
  })
</script>

{#if playingSong == true}
  <Canvas />
{/if}
<Fullscreen />

{#each accumulatedErrors as error}
  <Error errorMsg={error} />
{/each}

<style>
  :root {
    --tp-base-background-color: hsla(0, 0%, 10%, 0.8);
    --tp-base-shadow-color: hsla(0, 0%, 0%, 0.2);
    --tp-button-background-color: hsla(0, 0%, 80%, 1);
    --tp-button-background-color-active: hsla(0, 0%, 100%, 1);
    --tp-button-background-color-focus: hsla(0, 0%, 95%, 1);
    --tp-button-background-color-hover: hsla(0, 0%, 85%, 1);
    --tp-button-foreground-color: hsla(0, 0%, 0%, 0.8);
    --tp-container-background-color: hsla(0, 0%, 0%, 0.3);
    --tp-container-background-color-active: hsla(0, 0%, 0%, 0.6);
    --tp-container-background-color-focus: hsla(0, 0%, 0%, 0.5);
    --tp-container-background-color-hover: hsla(0, 0%, 0%, 0.4);
    --tp-container-foreground-color: hsla(0, 0%, 100%, 0.5);
    --tp-groove-foreground-color: hsla(0, 0%, 0%, 0.2);
    --tp-input-background-color: hsla(0, 0%, 0%, 0.3);
    --tp-input-background-color-active: hsla(0, 0%, 0%, 0.6);
    --tp-input-background-color-focus: hsla(0, 0%, 0%, 0.5);
    --tp-input-background-color-hover: hsla(0, 0%, 0%, 0.4);
    --tp-input-foreground-color: hsla(0, 0%, 100%, 0.5);
    --tp-label-foreground-color: hsla(0, 0%, 100%, 0.5);
    --tp-monitor-background-color: hsla(0, 0%, 0%, 0.3);
    --tp-monitor-foreground-color: hsla(0, 0%, 100%, 0.3);
  }
</style>
