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

<div id="login hero min-h-screen bg-base-200">
  <div class="hero-content text-center">
    <div class="max-w-md">
      <h1 class="text-5xl font-bold m-8">ThreeSpot</h1>
      <p class="py-6">Display your Spotify currently playing track in a beautiful way.</p>
    </div>
  </div>

  <div class="flex items-center justify-center">
    <div
      class="flex justify-center w-max items-center flex-row bg-green-500 btn-circle hover:bg-green-600 p-4 m-4 rounded-full shadow-md font-bold cursor-pointer"
      on:click={requestSpotifyAuth}
    >
      <p><button class="text-stone-900 text-center font-bold">Connect to Spotify</button></p>
      <svg
        class="ml-2"
        width="24"
        height="24"
        xmlns="http://www.w3.org/2000/svg"
        fill-rule="evenodd"
        clip-rule="evenodd"
        ><path
          d="M19.098 10.638c-3.868-2.297-10.248-2.508-13.941-1.387-.593.18-1.22-.155-1.399-.748-.18-.593.154-1.22.748-1.4 4.239-1.287 11.285-1.038 15.738 1.605.533.317.708 1.005.392 1.538-.316.533-1.005.709-1.538.392zm-.126 3.403c-.272.44-.847.578-1.287.308-3.225-1.982-8.142-2.557-11.958-1.399-.494.15-1.017-.129-1.167-.623-.149-.495.13-1.016.624-1.167 4.358-1.322 9.776-.682 13.48 1.595.44.27.578.847.308 1.286zm-1.469 3.267c-.215.354-.676.465-1.028.249-2.818-1.722-6.365-2.111-10.542-1.157-.402.092-.803-.16-.895-.562-.092-.403.159-.804.562-.896 4.571-1.045 8.492-.595 11.655 1.338.353.215.464.676.248 1.028zm-5.503-17.308c-6.627 0-12 5.373-12 12 0 6.628 5.373 12 12 12 6.628 0 12-5.372 12-12 0-6.627-5.372-12-12-12z"
        /></svg
      >
    </div>
  </div>
  <footer class="fixed bottom-0 footer items-center p-4 bg-neutral text-neutral-content ">
    <div class="items-center grid-flow-col">
      <p>
        Made by
        <a href="https://github.com/Kalmarv" class="link link-hover">Kalmarv</a> with ❤
      </p>
    </div>
    <div class="grid-flow-col gap-4 md:place-self-center md:justify-self-end">
      <a href="https://github.com/Kalmarv/ThreeSpot" class="text-gray-400 hover:text-white">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"
          ><path
            fill-rule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            clip-rule="evenodd"
          /></svg
        >
      </a>
    </div>
  </footer>
</div>
