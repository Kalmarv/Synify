<script>
  import { onMount } from "svelte";
  import { authToken } from "../stores.js";

  let user;

  const getUserData = async () => {
    const res = await fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: "Bearer " + $authToken,
      },
    });
    if (res.ok) {
      const data = await res.json();
      user = data;
    }
  };

  onMount(async () => {
    getUserData();
  });
</script>

{#if user}
  <p class="welcome-btn">Welcome, {user.display_name}!</p>
{/if}
