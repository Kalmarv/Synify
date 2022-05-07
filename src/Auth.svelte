<script>
  import { authToken, appUrl, code, clientID } from "./stores.js";

  // Since Svelte stores do not persist on reload, we store in local storage
  const code_verifier = localStorage.getItem("code_verifier");

  const requestAuth = async () => {
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

    // Removing the local storage item so it doesn't get used on subsequent reloads
    window.localStorage.removeItem("code_verifier");

    let json = await res.json();

    authToken.set(json.access_token);
  };

  if ($code) requestAuth();
</script>
