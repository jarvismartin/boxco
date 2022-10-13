<script lang="ts">
  // Svelte Stuff
  import { fade, fly } from "svelte/transition";

  // Routify
  import { goto } from "@roxi/routify";

  // Store
  import { currentProduct, msg, user } from "../../lib/store";

  let product_name = $currentProduct.name;
  let product_price = $currentProduct.price;
  let product_sku = $currentProduct.sku;

  // Save the old stock quantity so we can calculate the delta
  let old_stock = $currentProduct.stock;
  let product_stock = $currentProduct.stock;

  async function updateProduct() {
    console.log("UPDATE PRODUCT");

    // Calculate stock quantity delta
    const qty_delta = product_stock - old_stock;

    // Prepare data
    const data = {
      id: $currentProduct.id,
      name: product_name,
      price: product_price,
      sku: product_sku,
      qty_delta,
    };
    console.log("UPDATE PRODUCT DATA:", data);

    const product_update_response = await fetch(`/api/v1/update_product`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${$user.token}`,
      },
      body: JSON.stringify(data),
    });
    console.log("PRODUCT UPDATE RESPONSE:", product_update_response);
    const json = await product_update_response.json();
    console.log("JSON:", json);

    // Reset currentProduct in store
    currentProduct.set({});

    // Inform user the update was successful
    msg.set("Product update successful");

    // Return the user to the seller products page
    $goto("/sellerProducts");
  }
</script>

<form class="flex flex-col" in:fade on:submit|preventDefault={updateProduct}>
  <h1 class="text-3xl">Update your product</h1>

  <div class="flex flex-wrap items-center">
    <div class="m-16 flex rounded-md bg-gray-700 text-gray-400">
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
    <section class="flex flex-col">
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
        <div class="flex items-center">
          <span
            class="relative left-5 mb-1 flex items-center justify-center self-stretch rounded-l text-xl text-slate-800"
          >
            $
          </span>
          <input
            type="number"
            name="product_price"
            bind:value={product_price}
            class="rounded pl-6 text-slate-800"
            min="0"
          />
        </div>
      </div>
      <div class="my-4 flex items-center justify-center">
        <label for="product_stock" class="mr-7 flex w-10">
          stock
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
  </div>
  <div class="relative bottom-8 flex justify-end">
    <a href="/sellerProducts">
      <button type="button" class="m-2 ">Cancel</button>
    </a>
    <button
      type="submit"
      class=" m-2 bg-slate-300 text-slate-800 hover:bg-slate-100 active:opacity-70"
      >Update Product</button
    >
  </div>
</form>
