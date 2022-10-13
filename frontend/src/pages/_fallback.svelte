<script>
    import { url } from '@roxi/routify'
</script>

<div class="e404">
  <h1 class="text-9xl">404</h1>
  <div class="big">Page not found. 
  <!-- link to the parent folder of _fallback.svelte -->
  <a href={$url('../')} class="text-orange-600">Go back</a>
  </div>
</div>

<style>
</style>