"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders } from "./cookies"

export type Review = {
  id: string
  customer_name: string
  rating: number
  title: string | null
  content: string
  verified_purchase: boolean
  created_at: string
}

export type ReviewSummary = {
  count: number
  average: number
  distribution: { stars: number; count: number }[]
}

export type MyReview = {
  id: string
  product_id: string
  status: "pending" | "approved" | "rejected"
}

/** Approved reviews and their summary. Only real, moderated reviews are ever shown. */
export async function getProductReviews(
  productId: string
): Promise<{ reviews: Review[]; summary: ReviewSummary } | null> {
  return sdk.client
    .fetch<{ reviews: Review[]; summary: ReviewSummary }>(
      `/store/products/${productId}/reviews`,
      { method: "GET", next: { tags: ["reviews"], revalidate: 60 } }
    )
    .catch(() => null)
}

/** The signed-in customer's review of this product, if any (including pending ones). */
export async function getMyReview(productId: string): Promise<MyReview | null> {
  const headers = await getAuthHeaders()
  if (!("authorization" in headers)) {
    return null
  }
  return sdk.client
    .fetch<{ reviews: MyReview[] }>("/store/customers/me/reviews", {
      method: "GET",
      headers,
      cache: "no-store",
    })
    .then(({ reviews }) => reviews.find((r) => r.product_id === productId) ?? null)
    .catch(() => null)
}

export async function submitReview(
  _currentState: unknown,
  formData: FormData
): Promise<{ state: "done" } | { state: "error"; error: string } | null> {
  const rating = Number(formData.get("rating"))
  const title = String(formData.get("title") ?? "").trim()
  const content = String(formData.get("content") ?? "").trim()

  if (!(rating >= 1 && rating <= 5)) {
    return { state: "error", error: "Please choose a star rating." }
  }
  if (content.length < 10) {
    return { state: "error", error: "Please write at least a sentence about your experience." }
  }

  try {
    await sdk.client.fetch("/store/customers/me/reviews", {
      method: "POST",
      headers: await getAuthHeaders(),
      body: {
        product_id: String(formData.get("product_id")),
        rating,
        title: title || undefined,
        content,
      },
    })
  } catch (error) {
    return {
      state: "error",
      error: error instanceof Error ? error.message : "Your review could not be sent.",
    }
  }
  // New reviews stay hidden until approved in Medusa Admin, so nothing public changes yet.
  return { state: "done" }
}
