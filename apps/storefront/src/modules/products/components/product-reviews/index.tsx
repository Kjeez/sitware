import { MyReview, Review, ReviewSummary } from "@lib/data/reviews"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ReviewForm from "./review-form"
import Stars from "./stars"

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

/**
 * Approved customer reviews. With none yet, only the invitation to write one is shown: no
 * placeholder ratings or counts.
 */
const ProductReviews = ({
  productId,
  reviews,
  summary,
  signedIn,
  myReview,
}: {
  productId: string
  reviews: Review[]
  summary: ReviewSummary | null
  signedIn: boolean
  myReview: MyReview | null
}) => {
  const hasReviews = !!summary && summary.count > 0

  return (
    <div className="sw-reviews">
      <div className="sw-reviews-head">
        <div>
          <p className="eyebrow">Customer reviews</p>
          <h2 id="reviews-title">
            {hasReviews ? "What owners say." : "Share your experience."}
          </h2>
          {hasReviews ? (
            <p className="sw-reviews-summary" data-testid="review-summary">
              <Stars rating={summary.average} size={18} />
              <span>
                {summary.average.toFixed(1)} out of 5 · {summary.count}{" "}
                {summary.count === 1 ? "review" : "reviews"}
              </span>
            </p>
          ) : (
            <p className="sw-review-note">
              There are no reviews yet. Owners can share how it fits their
              workspace.
            </p>
          )}
        </div>
        <div>
          {myReview ? (
            <p className="sw-review-note" data-testid="my-review-status">
              {myReview.status === "pending"
                ? "Thank you. Your review will appear once it has been checked."
                : "You have already reviewed this product."}
            </p>
          ) : signedIn ? (
            <ReviewForm productId={productId} />
          ) : (
            <LocalizedClientLink
              href="/account"
              className="sw-review-sign-in"
              data-testid="review-sign-in-link"
            >
              Sign in to write a review
            </LocalizedClientLink>
          )}
        </div>
      </div>
      {hasReviews && (
        <ul className="sw-review-list">
          {reviews.map((review) => (
            <li key={review.id}>
              <div className="sw-review-meta">
                <Stars rating={review.rating} />
                <span>{review.customer_name}</span>
                {review.verified_purchase && (
                  <span className="sw-verified">Verified Buyer</span>
                )}
                <time dateTime={review.created_at}>
                  {formatDate(review.created_at)}
                </time>
              </div>
              {review.title && <h3>{review.title}</h3>}
              <p>{review.content}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default ProductReviews
