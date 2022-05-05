<script>
  import Playing from "./Playing.svelte";
  import Auth from "./Auth.svelte";
  import Login from "./Login.svelte";
  import { code, tokenExpired, authToken } from "./stores.js";
</script>

<main>
  <Login />

  {#if $code}
    <Auth />
    {#if $authToken}
      <Playing />
    {/if}
  {/if}
</main>

<style>
  main {
    text-align: center;
  }
</style>
