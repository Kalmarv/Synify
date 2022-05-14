<script>
  export let errorMsg
  let nodeRef
  let showError = false

  const toggleError = () => {
    if (showError) {
      showError = false
    } else {
      showError = true
    }
  }

  const resetSite = () => {
    localStorage.clear()
    window.location.reload()
  }
</script>

<div bind:this={nodeRef} class="bg-red-500 rounded-3xl absolute px-4 pt-3 pb-4 m-8 max-w-md">
  <div class="flex justify-between">
    <p class="font-bold">Error!</p>
    <img
      class="w-5 cursor-pointer"
      src="./pictures/close.svg"
      alt=""
      on:click={() => nodeRef.parentNode.removeChild(nodeRef)}
    />
  </div>
  <div class="m-2" />
  {#if showError}
    <p class="text-sm mb-2">{errorMsg}</p>
  {/if}
  <button class="bg-red-400 rounded-full px-3 py-1 mr-2" on:click={toggleError}>Show Error</button>
  <button class="bg-slate-700 rounded-full px-3 py-1 text-slate-300" on:click={resetSite}>Reset Site</button>
</div>
