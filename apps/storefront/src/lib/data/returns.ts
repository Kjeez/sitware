"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders } from "./cookies"

export type ReturnReason = { id: string; label: string; value: string }
export type ReturnOption = { id: string; name: string; amount: number }

export async function listReturnReasons(): Promise<ReturnReason[]> {
  return sdk.client
    .fetch<{ return_reasons: ReturnReason[] }>("/store/return-reasons", {
      method: "GET",
      cache: "no-store",
    })
    .then(({ return_reasons }) => return_reasons)
    .catch(() => [])
}

/** Return shipping options from the backend's /store/return-options route. */
export async function listReturnOptions(): Promise<ReturnOption[]> {
  return sdk.client
    .fetch<{ return_options: ReturnOption[] }>("/store/return-options", {
      method: "GET",
      cache: "no-store",
    })
    .then(({ return_options }) => return_options)
    .catch(() => [])
}

export async function requestReturn(
  _currentState: unknown,
  formData: FormData
): Promise<{ state: "done" } | { state: "error"; error: string } | null> {
  const orderId = String(formData.get("order_id") ?? "")
  const reasonId = String(formData.get("reason_id") ?? "")
  const note = String(formData.get("note") ?? "").trim()
  const items = formData
    .getAll("item_id")
    .map(String)
    .map((id) => ({ id, quantity: Number(formData.get(`quantity_${id}`) ?? 0) }))
    .filter((item) => item.quantity > 0)

  if (!items.length) {
    return { state: "error", error: "Select at least one item to return." }
  }
  if (!reasonId) {
    return { state: "error", error: "Tell us why you are returning the items." }
  }
  const [option] = await listReturnOptions()
  if (!option) {
    return {
      state: "error",
      error: "Returns can't be requested online right now. Please contact us.",
    }
  }

  try {
    await sdk.client.fetch("/store/returns", {
      method: "POST",
      headers: await getAuthHeaders(),
      body: {
        order_id: orderId,
        // The note is kept on each item too, where Medusa Admin shows it with the reason.
        items: items.map((item) => ({
          ...item,
          reason_id: reasonId,
          note: note || undefined,
        })),
        return_shipping: { option_id: option.id },
        note: note || undefined,
      },
    })
  } catch (error) {
    return {
      state: "error",
      error: error instanceof Error ? error.message : "The return could not be requested.",
    }
  }

  return { state: "done" }
}
