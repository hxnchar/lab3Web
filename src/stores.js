import { writable } from "svelte/store";

export const messageToUser = writable("");
export const loadersCount = writable(0);
export const isOnline = writable(true);
