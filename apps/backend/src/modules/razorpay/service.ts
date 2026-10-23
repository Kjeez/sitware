import crypto from "crypto"
import {
  AbstractPaymentProvider,
  MedusaError,
  PaymentActions,
  PaymentSessionStatus,
} from "@medusajs/framework/utils"
import type {
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  CancelPaymentInput,
  CancelPaymentOutput,
  CapturePaymentInput,
  CapturePaymentOutput,
  DeletePaymentInput,
  DeletePaymentOutput,
  GetPaymentStatusInput,
  GetPaymentStatusOutput,
  InitiatePaymentInput,
  InitiatePaymentOutput,
  Logger,
  ProviderWebhookPayload,
  RefundPaymentInput,
  RefundPaymentOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
  WebhookActionResult,
} from "@medusajs/framework/types"

type Options = {
  key_id: string
  key_secret: string
  webhook_secret?: string
}

type RazorpayOrder = {
  id: string
  amount: number
  amount_paid: number
  currency: string
  status: "created" | "attempted" | "paid"
  notes?: Record<string, string>
}

type RazorpayPayment = {
  id: string
  order_id: string
  amount: number
  currency: string
  status: "created" | "authorized" | "captured" | "refunded" | "failed"
  notes?: Record<string, string>
}

const API_BASE = "https://api.razorpay.com/v1"

// Medusa amounts are in major units (₹1 = 1); Razorpay wants paise.
const toPaise = (amount: unknown) => Math.round(Number(amount) * 100)
const fromPaise = (amount: number) => amount / 100

class RazorpayProviderService extends AbstractPaymentProvider<Options> {
  static identifier = "razorpay"

  protected logger_: Logger
  protected options_: Options

  static validateOptions(options: Record<string, unknown>) {
    if (!options.key_id || !options.key_secret) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Razorpay provider requires `key_id` and `key_secret` options."
      )
    }
  }

  constructor(container: { logger: Logger }, options: Options) {
    super(container, options)
    this.logger_ = container.logger
    this.options_ = options
  }

  private async request<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
    const auth = Buffer.from(`${this.options_.key_id}:${this.options_.key_secret}`).toString("base64")
    const res = await fetch(`${API_BASE}${path}`, {
      method: init.method ?? "GET",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: init.body ? JSON.stringify(init.body) : undefined,
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
      const message = json?.error?.description || `Razorpay request failed (${res.status})`
      throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, message)
    }
    return json as T
  }

  private async createOrder(amount: unknown, currency: string, sessionId?: unknown) {
    const order = await this.request<RazorpayOrder>("/orders", {
      method: "POST",
      body: {
        amount: toPaise(amount),
        currency: currency.toUpperCase(),
        receipt: typeof sessionId === "string" ? sessionId.slice(0, 40) : undefined,
        notes: sessionId ? { session_id: String(sessionId) } : undefined,
      },
    })
    return {
      razorpay_order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      // Public key, handed to the storefront so it can open Razorpay Checkout.
      key_id: this.options_.key_id,
      session_id: sessionId,
    }
  }

  // Latest successful payment against the Razorpay order, if any.
  private async findPaidPayment(orderId: string): Promise<RazorpayPayment | undefined> {
    const { items } = await this.request<{ items: RazorpayPayment[] }>(`/orders/${orderId}/payments`)
    return (
      items.find((p) => p.status === "captured") ??
      items.find((p) => p.status === "authorized")
    )
  }

  private statusOf(payment?: RazorpayPayment) {
    if (payment?.status === "captured") return PaymentSessionStatus.CAPTURED
    if (payment?.status === "authorized") return PaymentSessionStatus.AUTHORIZED
    return PaymentSessionStatus.PENDING
  }

  async initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentOutput> {
    const data = await this.createOrder(input.amount, input.currency_code, input.data?.session_id)
    return { id: data.razorpay_order_id, data }
  }

  async updatePayment(input: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    // A Razorpay order's amount is immutable, so a changed cart total needs a fresh order.
    if (input.data?.amount === toPaise(input.amount)) {
      return { data: input.data }
    }
    const data = await this.createOrder(input.amount, input.currency_code, input.data?.session_id)
    return { data }
  }

  async authorizePayment(input: AuthorizePaymentInput): Promise<AuthorizePaymentOutput> {
    const orderId = input.data?.razorpay_order_id as string | undefined
    if (!orderId) {
      return { status: PaymentSessionStatus.ERROR, data: input.data }
    }

    // Checkout's success callback can land a moment before Razorpay records the payment.
    let payment: RazorpayPayment | undefined
    for (let attempt = 0; attempt < 3 && !payment; attempt++) {
      if (attempt > 0) await new Promise((r) => setTimeout(r, 1500))
      payment = await this.findPaidPayment(orderId)
    }

    return {
      status: this.statusOf(payment),
      data: { ...input.data, razorpay_payment_id: payment?.id },
    }
  }

  async capturePayment(input: CapturePaymentInput): Promise<CapturePaymentOutput> {
    const paymentId = input.data?.razorpay_payment_id as string | undefined
    if (!paymentId) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "Missing Razorpay payment id")
    }
    const payment = await this.request<RazorpayPayment>(`/payments/${paymentId}`)
    if (payment.status === "authorized") {
      await this.request(`/payments/${paymentId}/capture`, {
        method: "POST",
        body: { amount: payment.amount, currency: payment.currency },
      })
    }
    return { data: input.data }
  }

  async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentOutput> {
    const paymentId = input.data?.razorpay_payment_id as string | undefined
    if (!paymentId) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "Missing Razorpay payment id")
    }
    const refund = await this.request<{ id: string }>(`/payments/${paymentId}/refund`, {
      method: "POST",
      body: { amount: toPaise(input.amount) },
    })
    return { data: { ...input.data, last_refund_id: refund.id } }
  }

  async cancelPayment(input: CancelPaymentInput): Promise<CancelPaymentOutput> {
    // Uncaptured Razorpay payments are auto-refunded by Razorpay; nothing to call.
    return { data: input.data }
  }

  async deletePayment(input: DeletePaymentInput): Promise<DeletePaymentOutput> {
    return { data: input.data }
  }

  async getPaymentStatus(input: GetPaymentStatusInput): Promise<GetPaymentStatusOutput> {
    const orderId = input.data?.razorpay_order_id as string | undefined
    if (!orderId) return { status: PaymentSessionStatus.PENDING, data: input.data }
    const payment = await this.findPaidPayment(orderId)
    return { status: this.statusOf(payment), data: input.data }
  }

  async retrievePayment(input: RetrievePaymentInput): Promise<RetrievePaymentOutput> {
    const orderId = input.data?.razorpay_order_id as string | undefined
    if (!orderId) return { data: input.data }
    const order = await this.request<RazorpayOrder>(`/orders/${orderId}`)
    return { data: { ...input.data, razorpay_order: order } }
  }

  async getWebhookActionAndData(
    payload: ProviderWebhookPayload["payload"]
  ): Promise<WebhookActionResult> {
    const secret = this.options_.webhook_secret
    const signature = payload.headers["x-razorpay-signature"] as string | undefined
    if (!secret || !signature) {
      return { action: PaymentActions.NOT_SUPPORTED }
    }

    const raw = Buffer.isBuffer(payload.rawData) ? payload.rawData : Buffer.from(String(payload.rawData))
    const expected = crypto.createHmac("sha256", secret).update(raw).digest("hex")
    const valid =
      expected.length === signature.length &&
      crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
    if (!valid) {
      this.logger_.warn("Razorpay webhook rejected: invalid signature")
      return { action: PaymentActions.NOT_SUPPORTED }
    }

    const event = payload.data as {
      event: string
      payload: { payment?: { entity: RazorpayPayment }; order?: { entity: RazorpayOrder } }
    }
    const payment = event.payload.payment?.entity
    const order = event.payload.order?.entity
    const sessionId = order?.notes?.session_id ?? payment?.notes?.session_id
    if (!sessionId || !payment) {
      return { action: PaymentActions.NOT_SUPPORTED }
    }
    const data = { session_id: sessionId, amount: fromPaise(payment.amount) }

    switch (event.event) {
      case "payment.authorized":
        return { action: PaymentActions.AUTHORIZED, data }
      case "payment.captured":
      case "order.paid":
        return { action: PaymentActions.SUCCESSFUL, data }
      case "payment.failed":
        return { action: PaymentActions.FAILED, data }
      default:
        return { action: PaymentActions.NOT_SUPPORTED }
    }
  }
}

export default RazorpayProviderService
