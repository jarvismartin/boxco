<script lang="ts">
  // Svelte Stuff
  import { fade, fly } from "svelte/transition";

  // Routify
  import { goto } from "@roxi/routify";

  // Store
  import { currentOrder, msg, user } from "../../lib/store";

  let product_quantity = $currentOrder.qty;

  // Save the old stock quantity so we can calculate the delta
  let old_qty = $currentOrder.qty;
  let order_quantity = 1;

  // Observe
  $: {
    console.log("order_quantity", order_quantity);
  }

  async function updateOrder() {
    console.log("UPDATE ORDER");

    // Is user logged in?
    if (!Object.hasOwn($user, "id")) {
      console.log("USER NEEDS TO LOG IN");
      return msg.set("Please log in");
    }

    // Calculate stock quantity delta
    const qty_delta = parseInt(old_qty) - order_quantity;

    // Prepare data
    const data = {
      id: null,
      product: $currentOrder,
      buyer_id: $user.id,
      qty: order_quantity,
    };
    console.log("UPDATE ORDER DATA:", data);

    const order_update_response = await fetch(`/api/v1/update_order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${$user.token}`,
      },
      body: JSON.stringify(data),
    });
    console.log("ORDER UPDATE RESPONSE:", order_update_response);
    const json = await order_update_response.json();
    console.log("JSON:", json);

    // Handle errors

    // Inform user the update was successful
    msg.set("Order update successful");

    // Return the user to the seller products page
    $goto("/");
  }
</script>

<form class="mt-8 flex flex-col" in:fade on:submit|preventDefault={updateOrder}>
  <h1 class="text-3xl font-semibold">{$currentOrder.name}</h1>

  <div class="flex flex-col items-center">
    <div class="m-8 flex rounded-md bg-gray-700 text-gray-400">
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
      <div
        class="my-2 flex items-center justify-center text-5xl font-extrabold"
      >
        ${$currentOrder.price}
      </div>
      <div class="my-4 flex items-center justify-center text-xl font-semibold">
        <label for="order_qty" class="mr-7 flex w-10">
          Qty.
          <span aria-label="required" class="ml-1">*</span>
        </label>
        <input
          type="number"
          name="order_qty"
          bind:value={order_quantity}
          class="w-40 flex-1 rounded border-0 bg-transparent text-3xl font-semibold hover:cursor-pointer focus:border-b focus:outline-none focus:ring-0"
          min="1"
        />
      </div>
    </section>
  </div>
  <div class="mt-8 flex items-center justify-center">
    <div class="ml-16 flex items-center justify-center">
      <a href="/">
        <button type="button" class="mx-2 ">Cancel</button>
      </a>
      <button
        type="submit"
        class="mx-2 bg-slate-300 text-slate-800 hover:bg-slate-100 active:opacity-70"
        >Place Order</button
      >
    </div>
  </div>
</form>
