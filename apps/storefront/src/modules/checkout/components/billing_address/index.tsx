import { HttpTypes } from "@medusajs/types"
import { displayPhone } from "@lib/util/indian-address"
import React, { useState } from "react"
import AddressFields from "../address-fields"

const BillingAddress = ({ cart }: { cart: HttpTypes.StoreCart | null }) => {
  const [formData, setFormData] = useState<Record<string, string>>({
    "billing_address.first_name": cart?.billing_address?.first_name || "",
    "billing_address.last_name": cart?.billing_address?.last_name || "",
    "billing_address.address_1": cart?.billing_address?.address_1 || "",
    "billing_address.address_2": cart?.billing_address?.address_2 || "",
    "billing_address.postal_code": cart?.billing_address?.postal_code || "",
    "billing_address.city": cart?.billing_address?.city || "",
    "billing_address.province": cart?.billing_address?.province || "",
    "billing_address.phone": displayPhone(cart?.billing_address?.phone),
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <AddressFields
      prefix="billing_address"
      values={formData}
      onChange={handleChange}
    />
  )
}

export default BillingAddress
