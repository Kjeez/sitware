// Razorpay Checkout (https://checkout.razorpay.com/v1/checkout.js), opened in the browser for the
// Razorpay order the backend's payment provider created for the cart's payment session.

export const RAZORPAY_CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js"

export type RazorpaySuccess = {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

type RazorpayInstance = {
  open: () => void
  on: (
    event: "payment.failed",
    cb: (resp: { error: { description?: string } }) => void
  ) => void
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance
  }
}

/**
 * Opens Razorpay Checkout. Resolves on payment success and rejects when the
 * shopper closes the window or the payment fails.
 */
export function openRazorpay({
  sessionData,
  name,
  email,
  phone,
}: {
  sessionData: Record<string, unknown>
  name: string
  email: string
  phone: string
}): Promise<RazorpaySuccess> {
  return new Promise((resolve, reject) => {
    if (!window.Razorpay) {
      reject(
        new Error(
          "The payment window failed to load. Check your connection and try again."
        )
      )
      return
    }
    const rzp = new window.Razorpay({
      key: sessionData.key_id,
      order_id: sessionData.razorpay_order_id,
      amount: sessionData.amount,
      currency: sessionData.currency,
      name: "Sitware",
      image: `${window.location.origin}/images/sitware-logo.svg`,
      prefill: { name, email, contact: phone },
      notes: { session_id: sessionData.session_id },
      theme: { color: "#ac6035" },
      handler: (resp: RazorpaySuccess) => resolve(resp),
      modal: {
        ondismiss: () =>
          reject(
            new Error(
              "Payment cancelled. You can try again whenever you are ready."
            )
          ),
      },
    })
    rzp.on("payment.failed", (resp) => {
      reject(new Error(resp.error?.description || "Payment failed. Please try again."))
    })
    rzp.open()
  })
}
