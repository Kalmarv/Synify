<script>
  import Canvas from './Canvas.svelte'
  import { onMount } from 'svelte'
  import { authToken, songName, songArtist, songImage, songLink, clientID, refreshToken } from '../stores.js'

  let playingSong

  const parseArtists = (artistJSON) => {
    let artists = []

    for (let i = 0; i < artistJSON.length; i++) {
      artists.push(artistJSON[i].name)
    }

    return artists.join(', ')
  }

  async function getUserPlaying() {
    const res = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: {
        Authorization: 'Bearer ' + $authToken,
      },
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
        console.log(data)
        songName.set("Spotify doesn't give podcast images :(")
        songArtist.set('Try a song instead')
        songImage.set('./sadamongus.png')
        songLink.set('https://github.com/Kalmarv/ThreeSpot')
      }

      playingSong = true
    } else if (res.status == 204) {
      // Token expired
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
      songImage.set('./nothingPlaying.png')
      songLink.set('https://github.com/Kalmarv/ThreeSpot')
    } else if (res.status == 401) {
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
      }
    } else {
      const errorResponse = await res.json()
      const errorMessage = errorResponse.error.message
      const errorStatus = errorResponse.error.status

      console.error(errorStatus, errorMessage)
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
