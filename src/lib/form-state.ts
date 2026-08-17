import type { ServiceRequestState } from "./actions";

/**
 * Initial state for the service request form.
 *
 * It lives outside `actions.ts` because every export from a `"use server"`
 * module must be an async function — plain constants belong in a normal module.
 */
export const initialServiceRequestState: ServiceRequestState = {
  status: "idle",
  message: "",
  errors: {},
};
