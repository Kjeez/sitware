import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type { OrderDTO } from "@medusajs/framework/types"
import { MedusaError } from "@medusajs/framework/utils"
import { getOrdersListWorkflow } from "@medusajs/medusa/core-flows"
import type { StoreOrderStatusLookupType } from "../../validators"

type OrderWithStatus = OrderDTO & {
  fulfillment_status?: string
  payment_status?: string
}

/**
 * Order status for the storefront's track-order page. Both the order number and the email used
 * at checkout must match, and only the status, items and total are returned: never addresses or
 * contact details.
 */
export async function POST(req: MedusaRequest<StoreOrderStatusLookupType>, res: MedusaResponse) {
  const { order_number, email } = req.validatedBody

  // The list workflow also computes fulfillment and payment status, as the store order routes do.
  const { result } = await getOrdersListWorkflow(req.scope).run({
    input: {
      fields: [
        "id",
        "display_id",
        "status",
        "created_at",
        "total",
        "currency_code",
        "fulfillment_status",
        "payment_status",
        "items.title",
        "items.product_title",
        "items.variant_title",
        "items.quantity",
      ],
      variables: {
        filters: { display_id: order_number, email: email.toLowerCase(), is_draft_order: false },
      },
    },
  })
  const [order] = (Array.isArray(result) ? result : result.rows) as OrderWithStatus[]
  if (!order) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "We couldn't find an order with that number and email."
    )
  }

  res.json({
    order: {
      display_id: order.display_id,
      status: order.status,
      created_at: order.created_at,
      total: order.total,
      currency_code: order.currency_code,
      fulfillment_status: order.fulfillment_status,
      payment_status: order.payment_status,
      items: (order.items ?? []).map((item) => ({
        title: item.product_title ?? item.title,
        variant_title: item.variant_title,
        quantity: item.quantity,
      })),
    },
  })
}
