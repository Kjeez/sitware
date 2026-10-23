import { z } from "@medusajs/framework/zod"

export const StoreAddWishlistItem = z.object({
  product_id: z.string().min(1),
})
export type StoreAddWishlistItemType = z.infer<typeof StoreAddWishlistItem>

export const StoreCreateReview = z.object({
  product_id: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(120).optional().nullable(),
  content: z.string().trim().min(10).max(2000),
})
export type StoreCreateReviewType = z.infer<typeof StoreCreateReview>

const ReviewStatus = z.enum(["pending", "approved", "rejected"])

export const AdminListReviews = z.object({
  status: ReviewStatus.optional(),
})
export type AdminListReviewsType = z.infer<typeof AdminListReviews>

export const AdminUpdateReview = z.object({
  status: ReviewStatus,
})
export type AdminUpdateReviewType = z.infer<typeof AdminUpdateReview>
