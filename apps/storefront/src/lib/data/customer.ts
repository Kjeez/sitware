"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"
import { FetchError } from "@medusajs/js-sdk"
import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import { normalizePhone, validateIndianAddress } from "@lib/util/indian-address"
import {
  getAuthHeaders,
  getCacheOptions,
  getCacheTag,
  getCartId,
  getPendingCustomer,
  removeAuthToken,
  removeCartId,
  removePendingCustomer,
  setAuthToken,
  setPendingCustomer,
} from "./cookies"

export type CustomerAuthState =
  | { state: "error"; error: string }
  | { state: "verification_required"; email: string }
  | { state: "success" }
  | null

/** Turns Medusa auth errors into a sentence fit for the shopper. */
function friendlyAuthError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  if (/invalid email or password/i.test(message)) {
    return "Incorrect email or password."
  }
  if (/already exists/i.test(message)) {
    return "An account with this email already exists. Please sign in."
  }
  return message || "Something went wrong. Please try again."
}

// Requests a verification email for the given customer. The request must be
// authenticated with a token tied to the auth identity (the token returned by
// register or by a login that requires verification).
async function requestVerificationEmail(email: string, token: string) {
  await sdk.auth.verification.request(
    {
      entity_id: email,
      entity_type: "email",
    },
    {
      authorization: `Bearer ${token}`,
    }
  )
}

export const retrieveCustomer =
  async (): Promise<HttpTypes.StoreCustomer | null> => {
    const authHeaders = await getAuthHeaders()

    if (!authHeaders) return null

    const headers = {
      ...authHeaders,
    }

    const next = {
      ...(await getCacheOptions("customers")),
    }

    return await sdk.client
      .fetch<{ customer: HttpTypes.StoreCustomer }>(`/store/customers/me`, {
        method: "GET",
        query: {
          fields: "*orders",
        },
        headers,
        next,
        cache: "force-cache",
      })
      .then(({ customer }) => customer)
      .catch(() => null)
  }

export const updateCustomer = async (body: HttpTypes.StoreUpdateCustomer) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const updateRes = await sdk.store.customer
    .update(body, {}, headers)
    .then(({ customer }) => customer)
    .catch(medusaError)

  const cacheTag = await getCacheTag("customers")
  revalidateTag(cacheTag)

  return updateRes
}

export async function signup(
  _currentState: unknown,
  formData: FormData
): Promise<CustomerAuthState> {
  const password = formData.get("password") as string
  const customerForm = {
    email: formData.get("email") as string,
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    phone: formData.get("phone") as string,
  }

  try {
    await sdk.auth.register("customer", "emailpass", {
      email: customerForm.email,
      password,
    })
  } catch (error) {
    const fetchError = error as FetchError
    // An existing identity (for example, an admin user with the same email) is
    // expected and handled: the customer can still log in to link a customer
    // record. Any other error is surfaced.
    if (
      fetchError.statusText !== "Unauthorized" ||
      fetchError.message !== "Identity with email already exists"
    ) {
      return { state: "error", error: friendlyAuthError(error) }
    }
  }

  // Persist the extra signup fields. The customer record is created during
  // login, which is deferred until after email verification when the backend
  // requires it.
  await setPendingCustomer(customerForm)

  // Continue by logging in. The login response tells us whether the backend
  // requires email verification — we don't need a storefront-side flag.
  return completeLogin(customerForm.email, password)
}

export async function login(
  _currentState: unknown,
  formData: FormData
): Promise<CustomerAuthState> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  return completeLogin(email, password)
}

// Logs the customer in and reconciles the customer record. The behavior is
// driven entirely by the backend's login response, so it works whether or not
// email verification is enabled.
async function completeLogin(
  email: string,
  password: string
): Promise<CustomerAuthState> {
  let result: Awaited<ReturnType<typeof sdk.auth.login>>

  try {
    result = await sdk.auth.login("customer", "emailpass", { email, password })
  } catch (error) {
    return { state: "error", error: friendlyAuthError(error) }
  }

  // A `location` is returned by third-party auth providers, which this flow
  // doesn't support.
  if (typeof result === "object" && "location" in result) {
    return {
      state: "error",
      error: "This login method isn't supported by the storefront.",
    }
  }

  // The backend requires email verification and the customer hasn't verified
  // yet. Send the verification email and ask them to check their inbox.
  if (
    typeof result === "object" &&
    "verification_required" in result &&
    result.verification_required
  ) {
    try {
      await requestVerificationEmail(email, result.token)
    } catch {
      // Ignore: the customer can resend from the verification page.
    }
    return { state: "verification_required", email }
  }

  if (typeof result !== "string") {
    return {
      state: "error",
      error: "Authentication requires additional steps that aren't supported.",
    }
  }

  let token = result

  // The token may not be tied to a customer record yet — right after
  // registration, or after verifying a brand-new account. Ask the backend:
  // `/store/customers/me` rejects tokens without a registered actor, so a
  // failed retrieve means we still need to create the customer, then log in
  // again to obtain a customer-bound token.
  const customerExists = await sdk.store.customer
    .retrieve({}, { authorization: `Bearer ${token}` })
    .then(() => true)
    .catch(() => false)

  if (!customerExists) {
    const pending = await getPendingCustomer()

    try {
      await sdk.store.customer.create(
        {
          email,
          first_name: pending?.first_name,
          last_name: pending?.last_name,
          phone: pending?.phone,
        },
        {},
        { authorization: `Bearer ${token}` }
      )

      token = (await sdk.auth.login("customer", "emailpass", {
        email,
        password,
      })) as string
    } catch (error) {
      return { state: "error", error: String(error) }
    }

    await removePendingCustomer()
  }

  await setAuthToken(token)

  const customerCacheTag = await getCacheTag("customers")
  revalidateTag(customerCacheTag)

  try {
    await transferCart()
  } catch (error) {
    return { state: "error", error: String(error) }
  }

  return { state: "success" }
}

// Confirms a customer's email using the token from the verification link.
//
// The confirm route doesn't require authentication, so this works even when the
// customer opens the link on a different device than the one they signed up on.
export async function confirmEmailVerification(
  token: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await sdk.auth.verification.confirm({ code: token })
    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

export async function signout(countryCode: string) {
  await sdk.auth.logout()

  await removeAuthToken()

  const customerCacheTag = await getCacheTag("customers")
  revalidateTag(customerCacheTag)

  await removeCartId()

  const cartCacheTag = await getCacheTag("carts")
  revalidateTag(cartCacheTag)

  redirect(`/${countryCode}/account`)
}

export async function transferCart() {
  const cartId = await getCartId()

  if (!cartId) {
    return
  }

  const headers = await getAuthHeaders()

  await sdk.store.cart.transferCart(cartId, {}, headers)

  const cartCacheTag = await getCacheTag("carts")
  revalidateTag(cartCacheTag)
}

/** A saved address from the account form, validated and normalized like checkout's. */
function readIndianAddress(formData: FormData) {
  const value = (name: string) => String(formData.get(name) ?? "").trim()
  const address = {
    first_name: value("first_name"),
    last_name: value("last_name"),
    address_1: value("address_1"),
    address_2: value("address_2"),
    city: value("city"),
    postal_code: value("postal_code"),
    province: value("province"),
    country_code: "in",
    phone: value("phone"),
  }
  const errors = validateIndianAddress(address, "Address")
  return {
    address: { ...address, phone: `+91${normalizePhone(address.phone)}` },
    error: errors.length ? errors.join(" ") : null,
  }
}

export const addCustomerAddress = async (
  currentState: Record<string, unknown>,
  formData: FormData
): Promise<{ success: boolean; error: string | null }> => {
  const isDefaultBilling = (currentState.isDefaultBilling as boolean) || false
  const isDefaultShipping = (currentState.isDefaultShipping as boolean) || false

  const { address: indianAddress, error } = readIndianAddress(formData)
  if (error) {
    return { success: false, error }
  }
  const address = {
    ...indianAddress,
    is_default_billing: isDefaultBilling,
    is_default_shipping: isDefaultShipping,
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.customer
    .createAddress(address, {}, headers)
    .then(async () => {
      const customerCacheTag = await getCacheTag("customers")
      revalidateTag(customerCacheTag)
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}

export const deleteCustomerAddress = async (
  addressId: string
): Promise<void> => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  await sdk.store.customer
    .deleteAddress(addressId, headers)
    .then(async () => {
      const customerCacheTag = await getCacheTag("customers")
      revalidateTag(customerCacheTag)
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}

export const updateCustomerAddress = async (
  currentState: Record<string, unknown>,
  formData: FormData
): Promise<{ success: boolean; error: string | null }> => {
  const addressId =
    (currentState.addressId as string) || (formData.get("addressId") as string)

  if (!addressId) {
    return { success: false, error: "Address ID is required" }
  }

  const { address, error } = readIndianAddress(formData)
  if (error) {
    return { success: false, error }
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.customer
    .updateAddress(addressId, address, {}, headers)
    .then(async () => {
      const customerCacheTag = await getCacheTag("customers")
      revalidateTag(customerCacheTag)
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}

const customerHeaders = (token: string) => ({ authorization: `Bearer ${token}` })

/** Reads a JWT payload without verifying it (Medusa does that); used to check `actor_id`. */
function decodeToken(token: string): Record<string, unknown> | null {
  try {
    return JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString())
  } catch {
    return null
  }
}

/** Sends the customer to Google. Only offered when the backend has Google configured. */
export async function startGoogleLogin() {
  let result: Awaited<ReturnType<typeof sdk.auth.login>>
  try {
    result = await sdk.auth.login("customer", "google", {})
  } catch {
    redirect("/account?error=google")
  }
  if (typeof result === "object" && "location" in result && result.location) {
    redirect(result.location)
  }
  redirect("/account?error=google")
}

/**
 * Finishes a Google sign-in from the OAuth callback query. Creates the customer on the first
 * sign-in, stores the session, keeps the guest cart, and links guest orders placed with the same
 * (Google-verified) email. Returns how many orders were linked.
 */
export async function completeGoogleLogin(
  query: Record<string, string>
): Promise<{ linked: number }> {
  const result = await sdk.auth.callback("customer", "google", query)
  if (typeof result !== "string") {
    throw new Error("Google sign-in could not be completed.")
  }
  let token = result

  const payload = decodeToken(token)
  if (!payload?.actor_id) {
    // First Google sign-in: create the customer from Google's profile, then get a token for it.
    const meta = (payload?.user_metadata ?? {}) as Record<string, string | undefined>
    if (!meta.email) {
      throw new Error("Google didn't share an email address for this account.")
    }
    await sdk.store.customer.create(
      {
        email: meta.email.toLowerCase(),
        first_name: meta.given_name ?? "",
        last_name: meta.family_name ?? "",
      },
      {},
      customerHeaders(token)
    )
    token = (await sdk.auth.refresh(customerHeaders(token))).token
  }

  await setAuthToken(token)
  revalidateTag(await getCacheTag("customers"))
  await transferCart().catch(() => {})

  const found = await findGuestOrders().catch(() => ({ claimed: 0, emailed: 0 }))
  return { linked: found.claimed }
}

/**
 * Finds guest orders placed with the signed-in customer's email. Google accounts (verified email)
 * get them linked immediately; others get a confirmation email per order.
 */
export async function findGuestOrders(): Promise<{
  claimed: number
  emailed: number
}> {
  return sdk.client.fetch<{ claimed: number; emailed: number }>(
    "/store/customers/me/find-orders",
    { method: "POST", headers: await getAuthHeaders() }
  )
}

export async function findGuestOrdersAction(): Promise<
  { state: "done"; claimed: number; emailed: number } | { state: "error"; error: string }
> {
  try {
    return { state: "done", ...(await findGuestOrders()) }
  } catch {
    return { state: "error", error: "We couldn't look for your orders. Please try again." }
  }
}

export async function requestPasswordReset(
  _currentState: unknown,
  formData: FormData
): Promise<{ state: "sent"; email: string } | { state: "error"; error: string } | null> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { state: "error", error: "Enter a valid email address." }
  }
  try {
    await sdk.auth.resetPassword("customer", "emailpass", { identifier: email })
  } catch {
    // The response is the same whether or not an account exists, so addresses can't be probed.
  }
  return { state: "sent", email }
}

export async function resetPassword(
  _currentState: unknown,
  formData: FormData
): Promise<CustomerAuthState> {
  const token = String(formData.get("token") ?? "")
  const email = String(formData.get("email") ?? "")
  const password = String(formData.get("password") ?? "")
  if (password.length < 8) {
    return { state: "error", error: "Password must be at least 8 characters." }
  }
  if (password !== formData.get("confirm_password")) {
    return { state: "error", error: "Passwords don't match." }
  }
  try {
    await sdk.auth.updateProvider("customer", "emailpass", { email, password }, token)
  } catch {
    return {
      state: "error",
      error: "This reset link has expired or was already used. Please request a new one.",
    }
  }
  return completeLogin(email, password)
}
