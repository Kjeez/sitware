import { Metadata } from "next"
import { retrieveCustomer } from "@lib/data/customer"
import { NOINDEX } from "@lib/site"
// TODO: Re-add Toaster component when needed
import AccountLayout from "@modules/account/templates/account-layout"

// Every account page (sign-in, profile, orders, addresses, wishlist) stays out of search results.
export const metadata: Metadata = { robots: NOINDEX }

export default async function AccountPageLayout({
  dashboard,
  login,
}: {
  dashboard?: React.ReactNode
  login?: React.ReactNode
}) {
  const customer = await retrieveCustomer().catch(() => null)

  return (
    <AccountLayout customer={customer}>
      {customer ? dashboard : login}
      {/* TODO: Re-add Toaster component when needed */}
    </AccountLayout>
  )
}
