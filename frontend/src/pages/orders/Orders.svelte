<script lang="ts">
  // Routify
  import { url } from "@roxi/routify";

  // Svelte Stuff
  import { fade, fly } from "svelte/transition";

  // Stores
  import { currentOrder, msg, orders, user } from "../../lib/store";

  // Observe changes to this seller's $sellerProducts
  $: console.log("ORDERS", $orders);

  // If user is NOT A SELLER, disable inputs
  const disabled = !Object.hasOwn($user, "sellerID");

  // Control showing the spinner
  let fetching = true;

  async function fetchOrders() {
    const seller_id = Object.hasOwn($user, "sellerID") ? $user.sellerID : null;
    const data = { buyer_id: $user.id, seller_id };
    const orders_response = await fetch(`/api/v1/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${$user.token}`,
      },
      body: JSON.stringify(data),
    });

    const json = await orders_response.json();

    // buyer: {items: Array(n)}
    // seller: {items: Array(n)}
    // So, just take the array
    const buyer_items = json.buyer.items;
    const seller_items = json.seller.items;

    // item: {key: string, value: object}
    // Strip keys, which are not used here,
    // to make a flatter array of objects
    const buyer_arr = Object.entries(buyer_items).map((item) => {
      return item[1].value;
    });
    const seller_arr = Object.entries(seller_items).map((item) => {
      return item[1].value;
    });

    orders.set({
      buyer: buyer_arr,
      seller: seller_arr,
    });

    fetching = false;

    return;
  }

  // Get Orders
  fetchOrders();

  // Take advantage of screen width
  document.querySelector("#routify-app").style.width = "100%";

  async function updateOrder(order) {
    console.log("UPDATED ORDER:", order);

    const order_update_response = await fetch(`/api/v1/update_order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${$user.token}`,
      },
      body: JSON.stringify(order),
    });
    console.log("ORDER UPDATE RESPONSE:", order_update_response);
    const json = await order_update_response.json();
    console.log("JSON:", json);

    // Inform user the update was successful
    msg.set("Order updated");
  }
</script>

<div class="mt-10 flex flex-col">
  {#if !fetching}
    {#if $orders.buyer.length === 0 && $orders.seller.length === 0}
      <h1>Your orders will appear here.</h1>
      <p>Click on "Home" at the top of the page to find products to order.</p>
    {/if}
    {#if !disabled}
      <h1>Seller Orders</h1>
      {#each $orders.seller as order}
        <form
          class="m-1 flex rounded-md bg-slate-200 text-slate-700"
          in:fade
          on:submit|preventDefault={() => {
            updateOrder(order);
          }}
        >
          <div class="flex items-center rounded-l bg-gray-700 text-gray-400">
            <!-- heroicons photo -->
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="h-24 w-24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
          </div>
          <div class="flex flex-1 flex-col p-4 pl-16">
            <div
              class="my-2 flex flex-1 flex-wrap items-center text-xl font-semibold"
            >
              <h1 class="flex-1 text-left text-3xl font-bold">
                {order.product.name}
              </h1>
              <div class="flex-1 text-left">
                ${order.product.price}
              </div>
              <div class="flex flex-1 items-center">
                <span class="text-sm font-light">qty:</span>
                <span class="ml-2">
                  {order.qty}
                </span>
              </div>
            </div>
            <!-- Update-able Info -->
            <div
              class="flex flex-1 flex-wrap items-center text-xl font-semibold"
            >
              <div class="flex-1 text-left">
                <label for="order_carrier" class="text-sm font-light">
                  carrier:
                </label>
                <input
                  type="text"
                  name="order_carrier"
                  bind:value={order.shipping.carrier}
                  placeholder={order.shipping.carrier}
                  class="w-40 flex-1 rounded border-0 bg-transparent text-xl font-semibold focus:border-b focus:outline-none focus:ring-0 {disabled
                    ? ''
                    : 'hover:cursor-pointer'}"
                  {disabled}
                />
              </div>
              <div class="flex-1 text-left">
                <label for="order_status" class="text-sm font-light">
                  status:
                </label>
                <input
                  type="text"
                  name="order_status"
                  bind:value={order.status}
                  placeholder={order.status}
                  class="w-40 flex-1 rounded border-0 bg-transparent text-xl font-semibold focus:border-b focus:outline-none focus:ring-0 {disabled
                    ? ''
                    : 'hover:cursor-pointer'}"
                  {disabled}
                />
              </div>
              <div class="flex-1" />
            </div>
            <div class="flex justify-end">
              <div class="flex items-center" style="flex: 2;">
                <label for="order_tracking" class="text-sm font-light">
                  tracking:
                </label>
                <input
                  type="text"
                  name="order_tracking"
                  bind:value={order.shipping.tracking_number}
                  placeholder={order.shipping.tracking_number}
                  class="flex-1 rounded border-0 bg-transparent text-xl font-semibold focus:border-b focus:outline-none focus:ring-0 {disabled
                    ? ''
                    : 'hover:cursor-pointer'}"
                  {disabled}
                />
              </div>
              {#if !disabled}
                <div class="flex flex-1 justify-start">
                  <button
                    type="submit"
                    class="m-2 bg-slate-600 text-slate-300 hover:bg-slate-800 active:opacity-70"
                    >Update Order
                  </button>
                </div>
              {/if}
            </div>
          </div>
        </form>
      {/each}
    {/if}

    {#if !disabled}
      <h1>Buyer Orders</h1>
    {/if}

    {#each $orders.buyer as order}
      <form
        class="m-1 flex rounded-md bg-slate-200 text-slate-700"
        in:fade
        on:submit|preventDefault={() => {
          updateOrder(order);
        }}
      >
        <div class="flex items-center rounded-l bg-gray-700 text-gray-400">
          <!-- heroicons photo -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="h-24 w-24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
            />
          </svg>
        </div>
        <div class="flex flex-1 flex-col p-4 pl-16">
          <div
            class="my-2 flex flex-1 flex-wrap items-center text-xl font-semibold"
          >
            <h1 class="flex-1 text-left text-3xl font-bold">
              {order.product.name}
            </h1>
            <div class="flex-1 text-left">
              ${order.product.price}
            </div>
            <div class="flex flex-1 items-center">
              <span class="text-sm font-light">qty:</span>
              <span class="ml-2">
                {order.qty}
              </span>
            </div>
          </div>
          <!-- Update-able Info -->
          <div class="flex flex-1 flex-wrap items-center text-xl font-semibold">
            <div class="flex-1 text-left">
              <label for="order_carrier" class="text-sm font-light">
                carrier:
              </label>
              <input
                type="text"
                name="order_carrier"
                bind:value={order.shipping.carrier}
                placeholder={order.shipping.carrier}
                class="w-40 flex-1 rounded border-0 bg-transparent text-xl font-semibold focus:border-b focus:outline-none focus:ring-0 {disabled
                  ? ''
                  : 'hover:cursor-pointer'}"
                disabled
              />
            </div>
            <div class="flex-1 text-left">
              <label for="order_status" class="text-sm font-light">
                status:
              </label>
              <input
                type="text"
                name="order_status"
                bind:value={order.status}
                placeholder={order.status}
                class="w-40 flex-1 rounded border-0 bg-transparent text-xl font-semibold focus:border-b focus:outline-none focus:ring-0 {disabled
                  ? ''
                  : 'hover:cursor-pointer'}"
                disabled
              />
            </div>
            <div class="flex-1" />
          </div>
          <div class="flex justify-end">
            <div class="flex items-center" style="flex: 2;">
              <label for="order_tracking" class="text-sm font-light">
                tracking:
              </label>
              <input
                type="text"
                name="order_tracking"
                bind:value={order.shipping.tracking_number}
                placeholder={order.shipping.tracking_number}
                class="flex-1 rounded border-0 bg-transparent text-xl font-semibold focus:border-b focus:outline-none focus:ring-0 {disabled
                  ? ''
                  : 'hover:cursor-pointer'}"
                disabled
              />
            </div>
            {#if !disabled}
              <div class="flex flex-1 justify-start">
                <button
                  type="submit"
                  class="m-2 bg-slate-600 text-slate-300 hover:bg-slate-800 active:opacity-70"
                  >Update Order
                </button>
              </div>
            {/if}
          </div>
        </div>
      </form>
    {/each}
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
