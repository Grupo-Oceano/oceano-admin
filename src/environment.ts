import { isBrowser } from "@builder.io/qwik";

const { API_URL = "", NODE_ENV = "" } = isBrowser ? {} : process?.env || {};

export const environment = { API_URL, NODE_ENV };
