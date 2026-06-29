import { useState } from 'react'
import StarRating from './StarRating'
import type { Review } from '../types'

type ReviewFormProps = {
  existingReview: Review | null
  onSave: (rating: number, comment: string) => void
  onDelete: () => void
}

export default function ReviewForm({ existingReview, onSave, onDelete }: ReviewFormProps) {
  const [rating, setRating] = useState<number | null>(existingReview?.rating ?? null)
  const [comment, setComment] = useState(existingReview?.comment ?? '')
  const [submitting, setSubmitting] = useState(false)

  const canSave = rating != null && !submitting

  const handleSave = async () => {
    if (rating == null) return
    setSubmitting(true)
    onSave(rating, comment)
    setSubmitting(false)
  }

  return (
    <div className="review-form">
      <h4 className="review-form-heading">{existingReview ? 'Your review' : 'Write a review'}</h4>
      <StarRating value={rating} onChange={setRating} label="Rating (required)" />
      <textarea
        className="review-comment-input"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write a comment (optional)"
        rows={3}
      />
      <div className="review-form-actions">
        <button type="button" className="primary-button" disabled={!canSave} onClick={() => void handleSave()}>
          <span className="material-symbols-outlined">rate_review</span>
          <span>{existingReview ? 'Update review' : 'Save review'}</span>
        </button>
        {existingReview ? (
          <button type="button" className="secondary-button" onClick={onDelete}>
            <span className="material-symbols-outlined">delete</span>
            <span>Delete</span>
          </button>
        ) : null}
      </div>
    </div>
  )
}
