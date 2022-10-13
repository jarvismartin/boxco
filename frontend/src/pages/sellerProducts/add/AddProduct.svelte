<script lang="ts">
  // Routify
  import { goto } from "@roxi/routify";

  // Svelte Stuff
  import { msg, user, sellerProducts } from "../../../lib/store";
  import { fade, fly, scale } from "svelte/transition";

  // Observe seller's products
  $: console.log("SELLER PRODUCTS:", $sellerProducts);

  // Add Product
  let product_name = "";
  let product_price = 0;
  let product_stock = 0;
  let product_sku = "";

  let showSpinner = false;
  async function addProduct() {
    // Reset msg
    msg.set("");

    // Clean inputs
    let name = product_name.trim();
    let sku = product_sku.trim();

    // Validate product name
    let valid_name = name.length > 1;
    if (!valid_name) {
      return msg.set("Please enter a valid product name");
    }

    // Validate product price
    let valid_price = product_price > 0;
    if (!valid_price) {
      return msg.set("Please enter a valid product price");
    }

    // Validate product stock
    let valid_stock = product_stock > 0;
    if (!valid_stock) {
      return msg.set("Please enter a valid product stock amount");
    }

    // If all valid, POST to API
    if (valid_name && valid_price && valid_stock) {
      // Show user something is happening
      showSpinner = true;

      console.log("CALL API");

      let data = {
        name,
        price: product_price,
        stock: product_stock,
        sku: product_sku,
        sellerID: $user.sellerID,
      };

      fetch("/api/v1/products/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${$user.token}`,
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Success");

          // Handle response
          if (data.err) {
            console.log(data.err);
            // Alert user
            return msg.set(data.err);
          }

          // Update product list on client
          const newSellerProductList = [...$sellerProducts, data];
          sellerProducts.set(newSellerProductList);

          /*
           * Clean up
           */
          // Hide spinner
          showSpinner = false;

          // Reset values
          product_name = "";
          product_price = 0;
          product_stock = 0;
          product_sku = "";

          // Send the user back to products page
          $goto("/sellerProducts");

          // Tell user it worked
          return msg.set("Product added!");
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  }
</script>

<form class="rounded border-2 border-zinc-500 p-10" in:fade={{ duration: 300 }}>
  <h2 class="text-2xl">Add a Product</h2>
  <p class="text-sm">* items are required</p>
  <section class="">
    <div class="my-4 flex items-center justify-center">
      <label for="product_name" class="mr-7 flex w-10">
        Name
        <span aria-label="required" class="ml-1">*</span>
      </label>
      <input
        type="text"
        name="product_name"
        placeholder="product name"
        bind:value={product_name}
        class="flex-1 rounded text-slate-800"
      />
    </div>
    <div class="my-4 flex items-center justify-center">
      <label for="product_price" class="mr-4 flex w-10">
        Price
        <span aria-label="required" class="ml-1">*</span>
      </label>
      <div class="flex flex-1 items-center">
        <span
          class="relative left-5 mb-1 flex items-center justify-center self-stretch rounded-l text-xl text-slate-800"
        >
          $
        </span>
        <input
          type="number"
          name="product_price"
          bind:value={product_price}
          class="flex-1 rounded pl-6 text-slate-800"
          min="0"
        />
      </div>
    </div>
    <div class="my-4 flex items-center justify-center">
      <label for="product_stock" class="mr-7 flex w-10">
        Stock
        <span aria-label="required" class="ml-1">*</span>
      </label>
      <input
        type="number"
        name="product_stock"
        bind:value={product_stock}
        class="flex-1 rounded text-slate-800"
        min="0"
      />
    </div>
    <div class="my-4 flex items-center justify-center">
      <label for="product_sku" class="mr-7 flex w-10"> SKU </label>
      <input
        type="text"
        name="product_sku"
        placeholder="product SKU"
        bind:value={product_sku}
        class="flex-1 rounded text-slate-800"
      />
    </div>
  </section>

  <section class="flex items-center justify-end">
    <a href="/sellerProducts">
      <button type="button" class="m-2 ">Cancel</button>
    </a>
    {#if showSpinner}
      <button
        type="button"
        class="inline-flex cursor-not-allowed items-center rounded-md bg-orange-600 px-4 py-2 text-sm font-semibold leading-6 text-white shadow transition duration-150 ease-in-out hover:bg-orange-400"
        disabled
      >
        <svg
          class="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span>Processing...</span>
      </button>
    {:else}
      <button
        type="button"
        class="inline-flex items-center rounded-md bg-orange-600 px-4 py-2 text-sm font-semibold leading-6 text-white shadow transition duration-150 ease-in-out hover:bg-orange-400"
        on:click={addProduct}
      >
        <span>Add product</span>
      </button>
    {/if}
  </section>
</form>

<style>
</style>
