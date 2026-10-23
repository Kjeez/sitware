import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Orders placed at guest checkout with the customer's email that don't belong to any
 * registered account yet. Guest checkouts get a customer record with has_account = false.
 */
export async function findClaimableGuestOrders(container: MedusaContainer, customerId: string) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { data: [customer] } = await query.graph({
    entity: "customer",
    fields: ["id", "email"],
    filters: { id: customerId },
  })
  if (!customer?.email) {
    return []
  }

  const { data: orders } = await query.graph({
    entity: "order",
    fields: ["id", "display_id", "customer_id", "status"],
    filters: { email: customer.email },
  })
  const ownerIds = orders.map((o) => o.customer_id).filter((id): id is string => !!id)
  const { data: owners } = ownerIds.length
    ? await query.graph({ entity: "customer", fields: ["id", "has_account"], filters: { id: ownerIds } })
    : { data: [] }
  const accountOwners = new Set(owners.filter((c) => c.has_account).map((c) => c.id))

  return orders.filter(
    (o) => o.customer_id !== customer.id && !(o.customer_id && accountOwners.has(o.customer_id))
  )
}

/** True when the customer signed in with Google, which verifies the email address. */
export async function hasVerifiedEmail(container: MedusaContainer, authIdentityId: string) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: [identity] } = await query.graph({
    entity: "auth_identity",
    fields: ["id", "provider_identities.provider"],
    filters: { id: authIdentityId },
  })
  return Boolean(identity?.provider_identities?.some((p) => p?.provider === "google"))
}
