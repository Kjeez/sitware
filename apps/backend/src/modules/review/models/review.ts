import { model } from "@medusajs/framework/utils"

const Review = model
  .define("review", {
    id: model.id({ prefix: "rev" }).primaryKey(),
    product_id: model.text(),
    customer_id: model.text(),
    customer_name: model.text(),
    rating: model.number(),
    title: model.text().nullable(),
    content: model.text(),
    status: model.enum(["pending", "approved", "rejected"]).default("pending"),
    verified_purchase: model.boolean().default(false),
  })
  .indexes([
    { on: ["product_id", "status"] },
    {
      on: ["product_id", "customer_id"],
      unique: true,
      where: "deleted_at IS NULL",
    },
  ])

export default Review
