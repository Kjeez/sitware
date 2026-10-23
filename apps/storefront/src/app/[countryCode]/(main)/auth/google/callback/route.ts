import { completeGoogleLogin } from "@lib/data/customer"
import { NextRequest, NextResponse } from "next/server"

/**
 * Google redirects here after sign-in (the backend's callback URL is
 * <STOREFRONT_URL>/auth/google/callback; middleware adds the country).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ countryCode: string }> }
) {
  const { countryCode } = await params
  const query = Object.fromEntries(request.nextUrl.searchParams.entries())
  const destination = new URL(`/${countryCode}/account`, request.nextUrl.origin)

  try {
    const { linked } = await completeGoogleLogin(query)
    if (linked > 0) {
      destination.pathname = `/${countryCode}/account/orders`
      destination.searchParams.set("linked", String(linked))
    }
  } catch {
    destination.searchParams.set("error", "google")
  }
  return NextResponse.redirect(destination)
}
