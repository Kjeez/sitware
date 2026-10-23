import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { REVIEW_MODULE } from "../../modules/review"
import type ReviewModuleService from "../../modules/review/service"

export type CreateReviewInput = {
  product_id: string
  customer_id: string
  rating: number
  title?: string | null
  content: string
}

type ReviewStatus = "pending" | "approved" | "rejected"

/**
 * Rejects duplicate reviews and unknown products, and works out the reviewer's display
 * name and whether they have bought the product.
 */
export const validateReviewStep = createStep(
  "validate-review",
  async (input: CreateReviewInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const reviews: ReviewModuleService = container.resolve(REVIEW_MODULE)

    const [existing] = await reviews.listReviews({
      product_id: input.product_id,
      customer_id: input.customer_id,
    })
    if (existing) {
      throw new MedusaError(MedusaError.Types.DUPLICATE_ERROR, "You have already reviewed this product.")
    }

    const { data: [product] } = await query.graph({
      entity: "product",
      fields: ["id"],
      filters: { id: input.product_id },
    })
    if (!product) {
      throw new MedusaError(MedusaError.Types.NOT_FOUND, "Product not found.")
    }

    const { data: [customer] } = await query.graph({
      entity: "customer",
      fields: ["first_name", "last_name"],
      filters: { id: input.customer_id },
    })
    const lastInitial = customer?.last_name ? ` ${customer.last_name.charAt(0)}.` : ""
    const customerName = `${customer?.first_name || "Sitware customer"}${lastInitial}`

    const { data: orders } = await query.graph({
      entity: "order",
      fields: ["id", "status", "items.product_id"],
      filters: { customer_id: input.customer_id },
    })
    const verifiedPurchase = orders.some(
      (o) => o.status !== "canceled" && o.items?.some((i) => i?.product_id === input.product_id)
    )

    return new StepResponse({ customer_name: customerName, verified_purchase: verifiedPurchase })
  }
)

export const createReviewStep = createStep(
  "create-review",
  async (
    input: CreateReviewInput & { customer_name: string; verified_purchase: boolean },
    { container }
  ) => {
    const reviews: ReviewModuleService = container.resolve(REVIEW_MODULE)
    const review = await reviews.createReviews({ ...input, status: "pending" })
    return new StepResponse(review, review.id)
  },
  async (id, { container }) => {
    if (!id) {
      return
    }
    const reviews: ReviewModuleService = container.resolve(REVIEW_MODULE)
    await reviews.deleteReviews(id)
  }
)

export const updateReviewStatusStep = createStep(
  "update-review-status",
  async (input: { id: string; status: ReviewStatus }, { container }) => {
    const reviews: ReviewModuleService = container.resolve(REVIEW_MODULE)
    const previous = await reviews.retrieveReview(input.id)
    const updated = await reviews.updateReviews(input)
    return new StepResponse(updated, { id: previous.id, status: previous.status as ReviewStatus })
  },
  async (previous, { container }) => {
    if (!previous) {
      return
    }
    const reviews: ReviewModuleService = container.resolve(REVIEW_MODULE)
    await reviews.updateReviews(previous)
  }
)
