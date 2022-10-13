<!-- routify:options preload="proximity" -->

<script lang="ts">
    import { metatags } from '@roxi/routify'
    
    metatags.title = 'BOXCO'
    metatags.description = 'Reebelo Case Study'

  // Store
  import { msg, user } from "../lib/store";

  // Components
  import Alert from "./_components/alert/Alert.svelte";
  import Header from "./_components/header/Header.svelte";
  
  $: {
    console.log("MSG: ", $msg);
    console.log("USER: ", $user);
  }
</script>

<Header />

<main>
    <slot />
</main>

{#if $msg.length > 0}
  <Alert />
{/if}

<style>
</style>
