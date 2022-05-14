<script>
  import Callback from './components/Callback.svelte'
  import Playing from './components/Playing.svelte'
  import Auth from './components/Auth.svelte'
  import Login from './components/Login.svelte'
  import { code, authToken } from './stores.js'
</script>

<main>
  <Login />
  <Callback />

  {#if $code}
    {#if $authToken}
      <Playing />
    {/if}
    <Auth />
  {/if}
</main>

<style lang="postcss" global>
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
</style>
