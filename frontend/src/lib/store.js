import { writable } from "svelte/store";

// Writable
export const user = writable({});
export const msg = writable("");
export const products = writable([]);
export const orders = writable([]);
export const sellerProducts = writable([]);
export const currentProduct = writable({});
export const currentOrder = writable({});
