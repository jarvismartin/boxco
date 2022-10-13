<script lang="ts">
  /*
   * THIS IS BASICALLY THE HOME PAGE
   */

  // Store
  import { products } from "../lib/store";

  // Components
  import ProductCards from "./_components/productCards/ProductCards.svelte";

  // Observe changes to $products
  $: console.log("PRODUCTS:", $products);

  let fetching = true;

  async function fetchProducts() {
    const product_response = await fetch(`/api/v1/products`);
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

    products.set(arr);

    fetching = false;
    console.log("FETCHING IS FALSE");

    return;
  }
  // Get Products
  fetchProducts();
</script>

<div class="">
  {#if !fetching}
    <ProductCards products={$products} click_path={"/order"} />
  {:else}
    <!-- Let the user know something is happening -->
    <div class="flex items-center ">
      <div class="mb-3 mr-2 text-2xl font-bold">
        Finding products just for you
      </div>
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
