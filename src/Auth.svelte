<script>
  import { authToken, appUrl, code, clientID } from "./stores.js";

  // WHYYYYYYY
  const code_verifier = localStorage.getItem("code_verifier");

  async function requestAuth() {
    const res = await fetch("https://accounts.spotify.com/api/token", {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "post",
      body: new URLSearchParams({
        client_id: $clientID,
        code: $code,
        redirect_uri: $appUrl,
        grant_type: "authorization_code",
        code_verifier: code_verifier,
      }),
    });

    let json = await res.json();

    authToken.set(json.access_token);
  }

  if ($code) requestAuth();
</script>
