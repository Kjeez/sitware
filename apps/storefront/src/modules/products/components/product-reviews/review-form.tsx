"use client"

import { useFormAction } from "@lib/hooks/use-form-action"
import { submitReview } from "@lib/data/reviews"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import { Button } from "@modules/common/components/ui"
import { useState } from "react"

const ReviewForm = ({ productId }: { productId: string }) => {
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [state, onSubmit, pending] = useFormAction(submitReview, null)

  if (state?.state === "done") {
    return (
      <p className="sw-review-note" data-testid="review-submitted-message">
        Thank you. Your review will appear here once it has been checked.
      </p>
    )
  }

  if (!open) {
    return (
      <Button
        variant="secondary"
        onClick={() => setOpen(true)}
        data-testid="write-review-button"
      >
        Write a review
      </Button>
    )
  }

  return (
    <form
      onSubmit={onSubmit}
      className="sw-review-form"
      data-testid="review-form"
    >
      <input type="hidden" name="product_id" value={productId} />
      <fieldset>
        <legend>Your rating</legend>
        <div className="sw-rating-input">
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} title={`${n} star${n === 1 ? "" : "s"}`}>
              <input
                type="radio"
                name="rating"
                value={n}
                checked={rating === n}
                onChange={() => setRating(n)}
                required
              />
              <span aria-hidden="true" data-filled={n <= rating}>
                ★
              </span>
              <span className="sr-only">
                {n} star{n === 1 ? "" : "s"}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <Input label="Title (optional)" name="title" maxLength={120} />
      <textarea
        name="content"
        rows={5}
        minLength={10}
        maxLength={2000}
        required
        placeholder="What do you like or dislike? How do you use it?"
        aria-label="Your review"
        className="w-full px-4 py-3 border border-ui-border-base rounded-md bg-ui-bg-field txt-medium"
      />
      <ErrorMessage
        error={state?.state === "error" ? state.error : null}
        data-testid="review-error-message"
      />
      <div className="flex flex-wrap gap-3">
        <SubmitButton isLoading={pending} data-testid="submit-review-button">
          Submit review
        </SubmitButton>
        <Button
          variant="transparent"
          type="button"
          onClick={() => setOpen(false)}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}

export default ReviewForm
