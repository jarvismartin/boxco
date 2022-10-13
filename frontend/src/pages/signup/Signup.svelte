<script lang="ts">
  // Routify
  import { goto } from "@roxi/routify";

  // Svelte Stuff
  import { msg, user } from "../../lib/store.js";
  import { fade, fly, scale } from "svelte/transition";

  import isEmail from "validator/es/lib/isEmail";
  import isStrongPassword from "validator/es/lib/isStrongPassword";

  // Sign Up
  let signup_email = "";
  let signup_password = "";
  let signup_store_name = "";
  let seller = false;

  let showSpinner = false;
  async function signupSubmit() {
    // Reset msg
    msg.set("");

    // Clean inputs
    let email = signup_email.trim().toLowerCase();
    let password = signup_password.trim();
    let store_name = signup_store_name.trim();

    let valid_email = false;
    if (email.length > 3) {
      // validate email
      valid_email = isEmail(email);
      // console.log("SignUp valid_email? ", valid_email);
    }

    if (!valid_email) {
      return msg.set("Please enter a valid email address");
    }

    // Encourage strong passwords
    let valid_password = isStrongPassword(password);
    // console.log("valid_password? ", valid_password);

    if (!valid_password) {
      return msg.set(
        "Please enter a strong password with at least 8 characters including at least one upper case, lower case, number, and symbol"
      );
    }

    // Validate Store Name
    let valid_store_name = true;
    if (seller) {
      if (!store_name.length > 2) {
        return msg.set("Please enter a valid store name");
        valid_store_name = false;
      }
    }

    // If all valid, POST to API
    if (valid_email && valid_password && valid_store_name) {
      // Show user something is happening
      showSpinner = true;

      console.log("CALL API");

      let data = {
        email: email,
        password: password,
        seller,
      };

      // Handle Sellers
      if (seller) {
        data.store_name = store_name;
      }

      fetch("/api/v1/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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

          user.set(data);

          /*
           * Clean up
           */
          // Hide spinner
          showSpinner = false;

          // Reset values
          signup_email = "";
          signup_password = "";
          store_name = "";

          // Send the user back to /
          $goto("/");

          // Tell user it worked
          return msg.set("Welcome to BoxCo!");
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  }
</script>

<form
  class="rounded border-2 border-zinc-500 p-14"
  in:fade
  on:submit|preventDefault={signupSubmit}
>
  <h2 class="text-2xl">
    Get Started with <strong class="text-orange-600">BOXCO</strong> Today!
  </h2>

  <section class="my-4">
    <div class="font-semibold">Are you a <strong>SELLER</strong>?</div>
    <label
      for="seller-toggle"
      class="relative flex cursor-pointer items-center justify-center rounded p-4"
    >
      No
      <input
        type="checkbox"
        id="seller-toggle"
        class="sr-only"
        bind:checked={seller}
      />
      <!-- Slider Groove -->
      <div
        class="mx-2 h-6 w-11 rounded-full border-2 border-gray-200 bg-gray-700 {seller
          ? 'bg-lime-600'
          : 'bg-gray-700'}"
      />
      <!-- Slider Switch -->
      <div
        class="{seller
          ? 'ml-6'
          : 'mr-8'} bg-gray-200a absolute mx-2 h-4 w-4 rounded-full border-2 border-gray-200 bg-slate-100"
      />
      Yes
    </label>
  </section>

  <section class="">
    <p class="my-4 flex items-center justify-center">
      <input
        type="email"
        id="signup_email"
        placeholder="you@domain.ext"
        name="signup_email"
        onClick="this.select()"
        bind:value={signup_email}
        class="flex-1 rounded text-slate-800"
      />
    </p>
    <p class="my-4 flex items-center justify-center">
      <input
        type="password"
        id="signup_password"
        name="signup_password"
        placeholder="password"
        onClick="this.select()"
        bind:value={signup_password}
        class="flex-1 rounded text-slate-800"
      />
    </p>
    {#if seller}
      <p
        class="my-4 flex items-center justify-center"
        in:fly={{ x: -200, duration: 500 }}
      >
        <input
          type="text"
          id="store_name"
          name="store_name"
          placeholder="Store name"
          onClick="this.select()"
          bind:value={signup_store_name}
          class="flex-1 rounded text-slate-800"
        />
      </p>
    {/if}
  </section>

  <section class="flex items-center justify-end">
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
        type="submit"
        class="inline-flex items-center rounded-md bg-orange-600 px-4 py-2 text-sm font-semibold leading-6 text-white shadow transition duration-150 ease-in-out hover:bg-orange-400"
      >
        <span>Create account</span>
      </button>
    {/if}
  </section>
</form>

<style>
</style>
