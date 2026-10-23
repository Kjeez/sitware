import path from "node:path"
import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, MedusaError, Modules } from "@medusajs/framework/utils"
import { updateProductsWorkflow } from "@medusajs/medusa/core-flows"

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
}

const isLocal = (url?: string | null) => !!url && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//.test(url)

/**
 * Moves product images that still point at a local development URL (Medusa's local file storage,
 * http://localhost:9000/static/..., or the storefront's http://localhost:8000/images/...) into the
 * configured file storage (Oracle Object Storage when S3_* is set) and updates the products.
 *
 * Images are downloaded from their original URL, or from IMAGE_SOURCE_URL + the same path when
 * that is set (for example a deployed site that serves the same files). Safe to re-run: products
 * whose images are already off localhost are skipped.
 *
 *   pnpm --filter @sitware/backend exec medusa exec ./src/scripts/migrate-product-images.ts
 */
export default async function migrateProductImages({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const fileService = container.resolve(Modules.FILE)

  if (!process.env.S3_BUCKET) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "S3_* storage is not configured, so images would be stored locally again. Set S3_* first."
    )
  }
  const source = process.env.IMAGE_SOURCE_URL?.replace(/\/$/, "")

  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "thumbnail", "images.url", "images.rank"],
  })

  // The same local file may be used as thumbnail and image; upload it once.
  const uploaded = new Map<string, string>()
  const upload = async (localUrl: string) => {
    const cached = uploaded.get(localUrl)
    if (cached) {
      return cached
    }
    const pathname = new URL(localUrl).pathname
    const downloadUrl = source ? `${source}${pathname}` : localUrl
    const res = await fetch(downloadUrl)
    if (!res.ok) {
      throw new MedusaError(MedusaError.Types.NOT_FOUND, `Could not download ${downloadUrl} (${res.status})`)
    }
    const ext = path.extname(pathname).toLowerCase()
    const [file] = await fileService.createFiles([
      {
        filename: `products/${path.basename(pathname)}`,
        mimeType: MIME_TYPES[ext] ?? "application/octet-stream",
        content: Buffer.from(await res.arrayBuffer()).toString("base64"),
        access: "public",
      },
    ])
    uploaded.set(localUrl, file.url)
    logger.info(`Uploaded ${pathname} -> ${file.url}`)
    return file.url
  }

  let updated = 0
  for (const product of products) {
    const images = [...(product.images ?? [])]
      .filter((image): image is NonNullable<typeof image> => !!image)
      .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
    const needsWork = isLocal(product.thumbnail) || images.some((image) => isLocal(image.url))
    if (!needsWork) {
      continue
    }

    const newImages: string[] = []
    for (const image of images) {
      newImages.push(isLocal(image.url) ? await upload(image.url) : image.url)
    }
    const thumbnail = isLocal(product.thumbnail) ? await upload(product.thumbnail!) : product.thumbnail ?? undefined

    await updateProductsWorkflow(container).run({
      input: { products: [{ id: product.id, images: newImages.map((url) => ({ url })), thumbnail }] },
    })
    updated++
    logger.info(`Updated images for product "${product.handle}"`)
  }

  logger.info(updated ? `Done: ${updated} product(s) updated.` : "No products had local image URLs.")
}
