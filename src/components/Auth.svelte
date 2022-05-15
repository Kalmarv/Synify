<script>
  import { authToken, refreshToken, appUrl, code, clientID } from '../stores.js'
  import Error from './Error.svelte'

  let accumulatedErrors = []

  const newError = (msg) => {
    accumulatedErrors.push(msg)
    accumulatedErrors = accumulatedErrors
  }

  const requestAuth = async () => {
    const res = await fetch('https://accounts.spotify.com/api/token', {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'post',
      body: new URLSearchParams({
        client_id: $clientID,
        code: $code,
        redirect_uri: $appUrl,
        grant_type: 'authorization_code',
        code_verifier: window.localStorage.getItem('code_verifier'),
      }),
    })

    let json = await res.json()

    if (res.status === 200) {
      authToken.set(json.access_token)
      refreshToken.set(json.refresh_token)
    } else {
      newError(json.error)
    }
  }

  if ($code) requestAuth()
</script>

{#each accumulatedErrors as error}
  <Error errorMsg={error} />
{/each}
