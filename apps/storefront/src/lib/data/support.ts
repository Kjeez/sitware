"use server"

import { sdk } from "@lib/config"

export type OrderStatus = {
  display_id: number
  status: string
  created_at: string
  total: number
  currency_code: string
  fulfillment_status?: string
  payment_status?: string
  items: { title: string; variant_title: string | null; quantity: number }[]
}

export async function lookupOrder(
  _currentState: unknown,
  formData: FormData
): Promise<{ state: "found"; order: OrderStatus } | { state: "error"; error: string } | null> {
  const orderNumber = String(formData.get("order_number") ?? "").trim().replace(/^#/, "")
  const email = String(formData.get("email") ?? "").trim()

  if (!/^\d+$/.test(orderNumber)) {
    return { state: "error", error: "Enter your order number, for example 1024." }
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { state: "error", error: "Enter the email address you used at checkout." }
  }

  try {
    const { order } = await sdk.client.fetch<{ order: OrderStatus }>("/store/order-status", {
      method: "POST",
      body: { order_number: Number(orderNumber), email },
      cache: "no-store",
    })
    return { state: "found", order }
  } catch {
    return {
      state: "error",
      error: "We couldn't find an order with that number and email. Please check both and try again.",
    }
  }
}

export async function sendContactMessage(
  _currentState: unknown,
  formData: FormData
): Promise<{ state: "sent" } | { state: "error"; error: string } | null> {
  const value = (name: string) => String(formData.get(name) ?? "").trim()
  const body = {
    name: value("name"),
    email: value("email"),
    phone: value("phone") || undefined,
    subject: value("subject") || undefined,
    message: value("message"),
    website: value("website"),
  }

  if (!body.name) {
    return { state: "error", error: "Please tell us your name." }
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return { state: "error", error: "Enter a valid email address so we can reply." }
  }
  if (body.message.length < 10) {
    return { state: "error", error: "Please write a little more about how we can help." }
  }

  try {
    await sdk.client.fetch("/store/contact", { method: "POST", body })
    return { state: "sent" }
  } catch (error) {
    const message = error instanceof Error ? error.message : ""
    return {
      state: "error",
      error: /available/i.test(message)
        ? "The contact form isn't available yet."
        : "Your message could not be sent. Please try again.",
    }
  }
}
