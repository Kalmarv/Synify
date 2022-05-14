<script>
  import { code, appUrl, clientID } from '../stores.js'
  import { Buffer } from 'buffer/'

  const generateCodeChallenge = async (codeVerifier) => {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(codeVerifier))

    const shaChallenge = Buffer.from(digest)
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')

    return shaChallenge
  }

  const generateRandomString = (length) => {
    let text = ''
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return text
  }

  const scope =
    'user-read-recently-played user-read-playback-position user-read-playback-state user-read-currently-playing'

  const generateUrlWithSearchParams = (url, params) => {
    const urlObject = new URL(url)
    urlObject.search = new URLSearchParams(params).toString()

    return urlObject.toString()
  }

  const requestSpotifyAuth = async () => {
    const codeVerifier = generateRandomString(64)

    let code_challenge = await generateCodeChallenge(codeVerifier)

    window.localStorage.setItem('code_verifier', codeVerifier)

    window.location.replace(
      generateUrlWithSearchParams('https://accounts.spotify.com/authorize', {
        response_type: 'code',
        client_id: $clientID,
        scope,
        code_challenge_method: 'S256',
        code_challenge,
        redirect_uri: $appUrl,
      })
    )
  }
</script>

{#if $code == null}
  <div id="login">
    <h1 class="font-bold text-8xl text-center m-8">ThreeSpot</h1>
    <div class="flex items-center justify-center">
      <div
        class="flex justify-center w-max items-center flex-row bg-green-500 p-4 m-8 rounded-full shadow-md font-bold cursor-pointer"
        on:click={requestSpotifyAuth}
      >
        <div><button class="text-center font-bold">Connect to Spotify</button></div>
        <div><img class="ml-2 object-cover w-8" src="./pictures/spotifylogo.png" alt="" /></div>
      </div>
    </div>
  </div>
{/if}
