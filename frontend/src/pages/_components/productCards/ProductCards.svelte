<script lang="ts">
  export let products;
  export let click_path;

  // Svelte Stuff
  import { fade, fly } from "svelte/transition";

  // Store
  import { currentOrder, currentProduct } from "../../../lib/store";

  // Observe current product or order
  $: {
    console.log("CURRENT PRODUCT:", $currentProduct);
    console.log("CURRENT ORDER:", $currentOrder);
  }

  // Routify
  import { goto } from "@roxi/routify";

  function clickHandler(product) {
    console.log("CARD CLICK HANDLER product:", product);

    console.log("CLICK PATH:", click_path);

    // Store the product or order info
    // so the next view can use it
    if (click_path.includes("product")) {
      currentProduct.set(product);
    }
    if (click_path.includes("order")) {
      currentOrder.set(product);
    }

    // Go to the click_path
    $goto(click_path);
  }
</script>

<div class="m-8 flex flex-wrap justify-evenly">
  {#each products as product}
    <article
      class="m-8 w-80 cursor-pointer rounded-md bg-slate-200 text-slate-700 active:opacity-70"
      in:fade
      on:click={() => {
        clickHandler(product);
      }}
    >
      <div class="flex rounded-t bg-gray-700 text-gray-400">
        <!-- heroicons photo -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="h-full w-full"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
          />
        </svg>
      </div>
      <div class="flex flex-col border-t-2 border-slate-400 p-5">
        <div class="flex items-center justify-between ">
          <h1 class="text-3xl font-bold">{product.name}</h1>
          <div class="ml-8 text-3xl font-semibold">${product.price}</div>
        </div>
        <div class="mt-8 flex items-center justify-end">
          <span class="mr-2 font-semibold">
            {product.stock}
          </span>
          in stock
        </div>
      </div>
    </article>
  {/each}
</div>
