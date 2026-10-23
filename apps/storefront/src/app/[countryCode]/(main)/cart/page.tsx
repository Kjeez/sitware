import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import CartTemplate from "@modules/cart/templates"
import { Metadata } from "next"
import { NOINDEX } from "@lib/site"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Your bag | SITWARE",
  description: "The items in your bag.",
  robots: NOINDEX,
}

export default async function Cart() {
  const cart = await retrieveCart().catch((error) => {
    console.error(error)
    return notFound()
  })

  const customer = await retrieveCustomer()

  return <CartTemplate cart={cart} customer={customer} />
}
