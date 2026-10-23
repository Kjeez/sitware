import { HttpTypes } from "@medusajs/types"

export const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
  "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka",
  "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
]

// HTML `pattern` attributes for instant browser feedback; the server re-validates.
export const MOBILE_PATTERN = "[6-9][0-9]{9}"
export const PINCODE_PATTERN = "[1-9][0-9]{5}"

/** Strips spaces, dashes and a leading +91 / 91 / 0 so only the 10-digit number remains. */
export function normalizePhone(phone: string) {
  return phone.replace(/[\s-]/g, "").replace(/^(\+91|91|0)(?=\d{10}$)/, "")
}

/** The stored `+91XXXXXXXXXX` form shown back as the 10-digit number customers type. */
export function displayPhone(phone?: string | null) {
  return phone ? normalizePhone(phone) : ""
}

/** Returns one message per invalid field; empty when the address can be used. */
export function validateIndianAddress(
  address: HttpTypes.StoreAddAddress,
  label: string
) {
  const errors: string[] = []
  if (!address.first_name?.trim()) {
    errors.push(`${label}: first name is required.`)
  }
  if ((address.address_1?.trim().length ?? 0) < 5) {
    errors.push(`${label}: enter your house and street address.`)
  }
  if (!address.city?.trim()) {
    errors.push(`${label}: city is required.`)
  }
  if (!address.province || !INDIAN_STATES.includes(address.province)) {
    errors.push(`${label}: select your state.`)
  }
  if (!/^[1-9]\d{5}$/.test(address.postal_code?.trim() ?? "")) {
    errors.push(`${label}: enter a valid 6-digit pincode.`)
  }
  if (!/^[6-9]\d{9}$/.test(normalizePhone(address.phone ?? ""))) {
    errors.push(`${label}: enter a valid 10-digit mobile number.`)
  }
  return errors
}
