import { loadEnv, defineConfig } from "@medusajs/framework/utils"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

const razorpayConfigured = Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)
const googleConfigured = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
const resendConfigured = Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM)
// Production sets REDIS_URL; local development leaves it unset and Medusa uses in-memory fallbacks.
const redisUrl = process.env.REDIS_URL
// S3-compatible storage (Oracle Object Storage in production). Unset keeps uploads on local disk.
const s3Configured = Boolean(
  process.env.S3_BUCKET && process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY
)

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl,
    // "shared" runs the API and background jobs in one process, which suits a single server.
    workerMode: (process.env.MEDUSA_WORKER_MODE as "shared" | "worker" | "server") || "shared",
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    },
  },
  admin: {
    disable: process.env.DISABLE_MEDUSA_ADMIN === "true",
    backendUrl: process.env.MEDUSA_BACKEND_URL,
  },
  modules: [
    {
      // Cash on Delivery uses the built-in pp_system_default provider, which is always registered.
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: razorpayConfigured
          ? [
              {
                resolve: "./src/modules/razorpay",
                id: "razorpay",
                options: {
                  key_id: process.env.RAZORPAY_KEY_ID,
                  key_secret: process.env.RAZORPAY_KEY_SECRET,
                  webhook_secret: process.env.RAZORPAY_WEBHOOK_SECRET,
                },
              },
            ]
          : [],
      },
    },
    {
      // Listing providers replaces the defaults, so emailpass (also used by admin users) is kept explicitly.
      resolve: "@medusajs/medusa/auth",
      dependencies: ["cache", "logger"],
      options: {
        providers: [
          { resolve: "@medusajs/medusa/auth-emailpass", id: "emailpass" },
          ...(googleConfigured
            ? [
                {
                  resolve: "@medusajs/medusa/auth-google",
                  id: "google",
                  options: {
                    clientId: process.env.GOOGLE_CLIENT_ID,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                    callbackUrl: `${process.env.STOREFRONT_URL}/auth/google/callback`,
                  },
                },
              ]
            : []),
        ],
      },
    },
    {
      // Without Resend credentials, emails are only logged (handy in development).
      resolve: "@medusajs/medusa/notification",
      options: {
        providers: [
          resendConfigured
            ? {
                resolve: "./src/modules/resend",
                id: "resend",
                options: {
                  channels: ["email"],
                  api_key: process.env.RESEND_API_KEY,
                  from: process.env.EMAIL_FROM,
                },
              }
            : {
                resolve: "@medusajs/medusa/notification-local",
                id: "local",
                options: { channels: ["email"] },
              },
        ],
      },
    },
    ...(s3Configured
      ? [
          {
            resolve: "@medusajs/medusa/file",
            options: {
              providers: [
                {
                  resolve: "@medusajs/medusa/file-s3",
                  id: "s3",
                  options: {
                    // Public URL prefix for uploaded files, e.g.
                    // https://objectstorage.ap-mumbai-1.oraclecloud.com/n/<namespace>/b/<bucket>/o
                    file_url: process.env.S3_FILE_URL,
                    access_key_id: process.env.S3_ACCESS_KEY_ID,
                    secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
                    region: process.env.S3_REGION,
                    bucket: process.env.S3_BUCKET,
                    // e.g. https://<namespace>.compat.objectstorage.ap-mumbai-1.oraclecloud.com
                    endpoint: process.env.S3_ENDPOINT,
                    prefix: "uploads/",
                    // Oracle's S3 API has no per-object ACLs; the bucket itself is made public.
                    acl: false,
                    additional_client_config: { forcePathStyle: true },
                  },
                },
              ],
            },
          },
        ]
      : []),
    ...(redisUrl
      ? [
          { resolve: "@medusajs/medusa/cache-redis", options: { redisUrl } },
          { resolve: "@medusajs/medusa/event-bus-redis", options: { redisUrl } },
          { resolve: "@medusajs/medusa/workflow-engine-redis", options: { redis: { redisUrl } } },
          {
            resolve: "@medusajs/medusa/locking",
            options: {
              providers: [
                {
                  resolve: "@medusajs/medusa/locking-redis",
                  id: "locking-redis",
                  is_default: true,
                  options: { redisUrl },
                },
              ],
            },
          },
        ]
      : []),
    { resolve: "./src/modules/wishlist" },
    { resolve: "./src/modules/review" },
  ],
})
