<script>
  import { code, appUrl, clientID } from "../stores.js";
  import { Buffer } from "buffer/";

  const generateCodeChallenge = async (codeVerifier) => {
    const digest = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(codeVerifier)
    );

    const shaChallenge = Buffer.from(digest)
      .toString("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

    return shaChallenge;
  };

  const generateRandomString = (length) => {
    let text = "";
    const possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };

  const scope =
    "user-read-recently-played user-read-playback-position user-read-playback-state user-read-currently-playing";

  const generateUrlWithSearchParams = (url, params) => {
    const urlObject = new URL(url);
    urlObject.search = new URLSearchParams(params).toString();

    return urlObject.toString();
  };

  const requestSpotifyAuth = async () => {
    const codeVerifier = generateRandomString(64);

    let code_challenge = await generateCodeChallenge(codeVerifier);

    window.localStorage.setItem("code_verifier", codeVerifier);

    window.location.replace(
      generateUrlWithSearchParams("https://accounts.spotify.com/authorize", {
        response_type: "code",
        client_id: $clientID,
        scope,
        code_challenge_method: "S256",
        code_challenge,
        redirect_uri: $appUrl,
      })
    );
  };
</script>

{#if $code == null}
  <div id="login">
    <button class="login-btn" on:click={requestSpotifyAuth}
      >Connect to Spotify</button
    >
  </div>
{/if}
