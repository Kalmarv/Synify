<script>
  import { resetSite } from '../helpers.js'
  export let errorMsg
  let nodeRef
  let showError = false
</script>

<div bind:this={nodeRef} class="alert alert-error shadow-lg m-8 max-w-md absolute">
  <div>
    <svg
      on:click={() => nodeRef.parentNode.removeChild(nodeRef)}
      xmlns="http://www.w3.org/2000/svg"
      class="stroke-current flex-shrink-0 h-6 w-6 cursor-pointer"
      fill="none"
      viewBox="0 0 24 24"
      ><path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
      /></svg
    >
    <span class="font-bold">Error!</span>
  </div>
  <div class="flex-none">
    <div class="tooltip tooltip-bottom" data-tip={errorMsg}>
      <button class="btn btn-sm btn-ghost">Show Error</button>
    </div>
    <button class="btn btn-sm" on:click={resetSite}>Reset</button>
  </div>
</div>
