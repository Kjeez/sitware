import {
  configureStoreSearch,
  defineMiddlewares,
  validateAndTransformBody,
  validateAndTransformQuery,
} from '@medusajs/framework/http'
import {
  AdminListReviews,
  AdminUpdateReview,
  StoreAddWishlistItem,
  StoreCreateReview,
} from './validators'

// Routes under /store/customers/me* are already authenticated as a customer by Medusa core.
export default defineMiddlewares({
  routes: [
    {
      // The product index declares filterable `status` and `sales_channel_ids`, so
      // the route narrows it to published products in the key's sales channels.
      method: ['POST'],
      matcher: '/store/search',
      middlewares: [
        configureStoreSearch({
          allowed_indexes: {
            product: true,
          },
        }),
      ],
    },
    {
      method: ['POST'],
      matcher: '/store/customers/me/wishlist',
      middlewares: [validateAndTransformBody(StoreAddWishlistItem)],
    },
    {
      method: ['POST'],
      matcher: '/store/customers/me/reviews',
      middlewares: [validateAndTransformBody(StoreCreateReview)],
    },
    {
      method: ['GET'],
      matcher: '/admin/reviews',
      middlewares: [validateAndTransformQuery(AdminListReviews, {})],
    },
    {
      method: ['POST'],
      matcher: '/admin/reviews/:id',
      middlewares: [validateAndTransformBody(AdminUpdateReview)],
    },
  ],
})
