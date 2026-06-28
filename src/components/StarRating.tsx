import { useState, useCallback } from 'react'
import type { FC } from 'react'

type StarRatingProps = {
  value: number | null
  onChange: (value: number | null) => void
  label?: string
}

const StarRating: FC<StarRatingProps> = ({ value, onChange, label }) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null)

  const ratingFromEvent = useCallback((clientX: number, target: HTMLElement): number => {
    const rect = target.getBoundingClientRect()
    const ratio = (clientX - rect.left) / rect.width
    const raw = ratio * 5
    return Math.max(0.5, Math.min(5, Math.round(raw * 2) / 2))
  }, [])

  const displayValue = hoverValue ?? value

  return (
    <div className="rating-select">
      {label ? <span>{label}</span> : null}
      <div className="rating-slider-row">
        <div
          className="star-slider"
          onMouseMove={(e) => setHoverValue(ratingFromEvent(e.clientX, e.currentTarget))}
          onClick={(e) => {
            const r = ratingFromEvent(e.clientX, e.currentTarget)
            onChange(r === value ? null : r)
          }}
          onMouseLeave={() => setHoverValue(null)}
          role="slider"
          aria-label={label ?? 'Rating'}
          aria-valuenow={value ?? 0}
          aria-valuemax={5}
          aria-valuemin={0}
          aria-valuetext={value != null ? `${value} out of 5 stars` : 'Not rated'}
        >
          {Array.from({ length: 5 }, (_, i) => {
            const starValue = i + 1
            const isFilled = displayValue != null && displayValue >= starValue
            const isHalf = displayValue != null && displayValue >= i + 0.5 && displayValue < starValue
            return (
              <span
                key={starValue}
                className={`material-symbols-outlined star-icon ${isFilled ? 'is-filled' : ''} ${isHalf ? 'is-half' : ''}`}
              >
                {isHalf ? 'star_half' : 'star'}
              </span>
            )
          })}
        </div>
        {value != null ? <span className="rating-value">{value.toFixed(1)}</span> : null}
        <button type="button" className="clear-rating" onClick={() => onChange(null)}>
          Clear
        </button>
      </div>
    </div>
  )
}

export default StarRating
