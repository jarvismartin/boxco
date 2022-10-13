<script lang="ts">
  import { url, isActive } from "@roxi/routify";

  import { user } from "../../../lib/store";
  import logo from "../../../assets/box.svg";

  import Login from "../login/Login.svelte";

  let navItems = [
    ["./index", "Home"],
    ["./about", "About"],
  ];

  // Observe $user for changes
  $: {
    // Show logged in users their orders
    if ($user?.id) {
      navItems = [...navItems, ["./orders", "Orders"]];
    }
    // Show Sellers Product Page so they can update products
    if ($user?.type === "seller") {
      navItems = [...navItems, ["./sellerProducts", "Products"]];
    }
  }

  let showLogin = false;
  function toggleLogin() {
    console.log("TOGGLE LOGIN");
    showLogin = !showLogin;
  }

  function logout() {
    location.reload();
  }
</script>

<header
  class="bg-gray-800/85 fixed top-0 left-0 right-0 flex flex-wrap items-center justify-between py-2 px-4 shadow-lg backdrop-blur"
>
  <div class="mr-2 flex flex-1 cursor-pointer items-center">
    <a href={$url("/")} class="flex active:opacity-70">
      <img src={logo} alt="Box Co. Home" class="mr-1 h-10" />
      <span class="ml-2 text-4xl font-semibold tracking-tight text-orange-600">
        BOXCO
      </span>
    </a>
  </div>
  <nav data-sveltekit-prefetch class="mx-2 flex flex-1 justify-center">
    <ul class="flex">
      {#each navItems as [path, display]}
        <li class="mx-2 text-sm lg:flex-grow">
          <a
            class="cursor-pointer text-slate-200 hover:text-orange-400 active:text-orange-600 {$isActive(
              path
            )
              ? 'text-orange-400'
              : ''}"
            href={$url(path)}
          >
            {display}
          </a>
        </li>
      {/each}
    </ul>
  </nav>
  <div class="flex flex-1 items-center justify-end">
    {#if !$user?.id}
      <div
        on:click={toggleLogin}
        class="mr-4 flex cursor-pointer items-center justify-center self-stretch text-slate-200 hover:text-orange-400 active:text-orange-600  "
      >
        Log in
      </div>
      {#if showLogin}
        <Login />
      {/if}
      <a href={$url("./signup")}>
        <button class="bg-orange-600 text-slate-200 active:bg-orange-400"
          >Join BOXCO</button
        >
      </a>
    {:else}
      <span
        class="cursor-pointer text-slate-200 hover:text-orange-400"
        on:click={logout}>Log out</span
      >
    {/if}
  </div>
</header>

<style>
</style>
