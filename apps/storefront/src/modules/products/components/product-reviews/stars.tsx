const Star = ({ filled, size }: { filled: boolean; size: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden="true"
  >
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
)

const Stars = ({ rating, size = 15 }: { rating: number; size?: number }) => (
  <span
    className="sw-stars inline-flex gap-0.5"
    role="img"
    aria-label={`${rating.toFixed(1)} out of 5 stars`}
  >
    {[1, 2, 3, 4, 5].map((n) => (
      <Star key={n} filled={n <= Math.round(rating)} size={size} />
    ))}
  </span>
)

export default Stars
