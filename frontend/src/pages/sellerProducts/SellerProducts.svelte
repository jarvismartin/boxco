<script lang="ts">
  // Routify
  import { url } from "@roxi/routify";

  // Components
  import ProductCards from "../_components/productCards/ProductCards.svelte";

  // Stores
  import { msg, sellerProducts, user } from "../../lib/store";

  // Observe changes to this seller's $sellerProducts
  $: console.log("SELLER PRODUCTS:", $sellerProducts);

  let fetching = true;

  async function fetchSellerProducts() {
    const data = { sellerID: $user.sellerID };
    const product_response = await fetch(`/api/v1/seller_products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${$user.token}`,
      },
      body: JSON.stringify(data),
    });
    console.log("SELLER PRODUCT RESPONSE:", product_response);
    const ret = await product_response.json();

    // ret: {items: Array(n)}
    // So, just take the array
    const items = ret.items;

    // item: {key: string, value: object}
    // Strip keys, which are not used here,
    // to make a flatter array of objects
    const arr = Object.entries(items).map((item) => {
      return item[1].value;
    });

    sellerProducts.set(arr);
    
    fetching = false;

    return;
  }

  // Get Products
  fetchSellerProducts();
</script>

<div class="flex flex-col">
  <!-- Add Product Control -->
  <a href={$url("./add")}>
    <button
      class="fixed bottom-6 right-6 flex h-16 w-16 flex-col items-center justify-center rounded-full bg-slate-300 text-slate-800 hover:bg-slate-100 hover:ring-black active:opacity-70"
      title="Add a product"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="4"
        stroke="currentColor"
        class="h-10 w-10"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M12 4.5v15m7.5-7.5h-15"
        />
      </svg>
    </button>
  </a>

  {#if !fetching}
    <ProductCards products={$sellerProducts} click_path={"/product"} />
  {:else}
    <!-- Let the user know something is happening -->
    <div class="flex items-center ">
      <div class="mb-3 mr-2 text-2xl font-bold">Fetching your products</div>
      <!-- Loading.io pure CSS spinner -->
      <div class="lds-ellipsis">
        <div />
        <div />
        <div />
        <div />
      </div>
    </div>
  {/if}
</div>

<style>
  /* Loading.io pure CSS spinner styles */
  .lds-ellipsis {
    display: inline-block;
    position: relative;
    width: 80px;
    height: 80px;
  }
  .lds-ellipsis div {
    position: absolute;
    top: 33px;
    width: 13px;
    height: 13px;
    border-radius: 50%;
    background: #fff;
    animation-timing-function: cubic-bezier(0, 1, 1, 0);
  }
  .lds-ellipsis div:nth-child(1) {
    left: 8px;
    animation: lds-ellipsis1 0.6s infinite;
  }
  .lds-ellipsis div:nth-child(2) {
    left: 8px;
    animation: lds-ellipsis2 0.6s infinite;
  }
  .lds-ellipsis div:nth-child(3) {
    left: 32px;
    animation: lds-ellipsis2 0.6s infinite;
  }
  .lds-ellipsis div:nth-child(4) {
    left: 56px;
    animation: lds-ellipsis3 0.6s infinite;
  }
  @keyframes lds-ellipsis1 {
    0% {
      transform: scale(0);
    }
    100% {
      transform: scale(1);
    }
  }
  @keyframes lds-ellipsis3 {
    0% {
      transform: scale(1);
    }
    100% {
      transform: scale(0);
    }
  }
  @keyframes lds-ellipsis2 {
    0% {
      transform: translate(0, 0);
    }
    100% {
      transform: translate(24px, 0);
    }
  }
</style>
