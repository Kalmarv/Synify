<script>
  import Playing from "./components/Playing.svelte";
  import Auth from "./components/Auth.svelte";
  import Login from "./components/Login.svelte";
  import { code, authToken } from "./stores.js";
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
