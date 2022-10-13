<script type="ts">
  import { msg } from "../../../lib/store.js";

  import { fly } from "svelte/transition";

  // Set a timer for the alert
  setTimeout(() => {
    msg.set("");
  }, 10000);
</script>

<div
  class="fixed bottom-0 left-2 flex items-center justify-between rounded-t-lg bg-sky-600 p-4"
  transition:fly={{ y: 200, duration: 1000 }}
>
  <div class="">{$msg}</div>
  {#if $msg.length > 0}
    <div
      class="ml-4 cursor-pointer"
      on:click={() => {
        msg.set("");
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="h-6 w-6"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </div>
  {/if}
</div>

<style>
</style>
