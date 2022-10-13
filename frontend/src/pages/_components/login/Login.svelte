<script lang="ts">
  // Routify
  import { goto } from "@roxi/routify";

  // Stores
  import { msg, user } from "../../../lib/store";

  // Svelte
  import { slide } from "svelte/transition";

  // Node Modules
  import isEmail from "validator/es/lib/isEmail";
  import isStrongPassword from "validator/es/lib/isStrongPassword";

  let login_email = "";
  let login_password = "";

  let showSpinner = false;
  async function loginSubmit() {
    // Reset msg
    msg.set("");

    // Clean Inputs
    let email = login_email.trim().toLowerCase();
    let password = login_password.trim();

    // validate email
    let valid_email = isEmail(email);
    console.log("valid_email? ", valid_email);

    if (!valid_email) {
      return msg.set("Please enter your email address");
    }

    let valid_password = isStrongPassword(password);
    console.log("valid_password? ", valid_password);

    if (!valid_password) {
      return msg.set("Please enter your password");
    }

    // If all valid, POST to API
    if (valid_email && valid_password) {
      // Show user something is happening
      showSpinner = true;

      const data = {
        email,
        password,
      };

      fetch(`/api/v1/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Log in Success");

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
          login_email = "";
          login_password = "";

          // Send the user back to /
          // $goto("/");

          // Tell user it worked
          return msg.set("Welcome Back!");
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  }
</script>

<form
  class="absolute right-40 top-14 rounded border-2 border-zinc-500  p-10 shadow-lg backdrop-blur"
  transition:slide={{ y: -200 }}
  on:submit|preventDefault={loginSubmit}
>
  <h2 class="text-2xl">
    Sign in to
    <strong class="text-orange-600">BOXCO</strong>
  </h2>

  <section class="">
    <p class="my-4 flex items-center justify-center">
      <input
        type="email"
        id="login_email"
        placeholder="you@domain.ext"
        name="login_email"
        onClick="this.select()"
        bind:value={login_email}
        class="flex-1 rounded text-slate-800"
      />
    </p>
    <p class="my-4 flex items-center justify-center">
      <input
        type="password"
        id="login_password"
        name="login_password"
        placeholder="password"
        onClick="this.select()"
        bind:value={login_password}
        class="flex-1 rounded text-slate-800"
      />
    </p>
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
        <span>Log in</span>
      </button>
    {/if}
  </section>
</form>

<style>
  form {
    background-color: #242424;
  }
</style>
