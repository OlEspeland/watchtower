import type { Review } from '../types'
import { getPosterUrl } from '../utils/media'

type ReviewCardProps = {
  review: Review
  reviewerName?: string
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return ''
  }
}

export default function ReviewCard({ review, reviewerName }: ReviewCardProps) {
  return (
    <div className="review-card">
      {review.posterPath ? (
        <img className="review-card-poster" src={getPosterUrl(review.posterPath)} alt={review.title} />
      ) : (
        <div className="review-card-poster review-card-poster-fallback">
          <span className="material-symbols-outlined">movie</span>
        </div>
      )}
      <div className="review-card-body">
        <div className="review-card-header">
          <strong className="review-card-title">{review.title}</strong>
          <span className="review-card-year">{review.year}</span>
        </div>
        <div className="review-card-stars">
          {Array.from({ length: 5 }, (_, i) => {
            const starValue = i + 1
            const isFilled = review.rating >= starValue
            const isHalf = review.rating >= i + 0.5 && review.rating < starValue
            return (
              <span
                key={starValue}
                className={`material-symbols-outlined review-star ${isFilled ? 'is-filled' : ''} ${isHalf ? 'is-half' : ''}`}
              >
                star
              </span>
            )
          })}
          <span className="review-card-rating">{review.rating.toFixed(1)}</span>
        </div>
        {review.comment ? <p className="review-card-comment">{review.comment}</p> : null}
        <div className="review-card-footer">
          {reviewerName ? <span className="review-card-author">{reviewerName}</span> : null}
          <span className="review-card-date">{formatDate(review.createdAt)}</span>
        </div>
      </div>
    </div>
  )
}
