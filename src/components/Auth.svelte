<script>
  import { authToken, appUrl, code, clientID } from "../stores.js";

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
        code_verifier: window.localStorage.getItem("code_verifier"),
      }),
    });

    let json = await res.json();

    if (res.status === 200) {
      authToken.set(json.access_token);
    } else {
      console.error(res);
    }
  };

  if ($code) requestAuth();
</script>
