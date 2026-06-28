import type { FC } from 'react'

type StarRatingProps = {
  value: number | null
  onChange: (value: number | null) => void
  label?: string
}

const StarRating: FC<StarRatingProps> = ({ value, onChange, label }) => {
  return (
    <div className="rating-select">
      {label ? <span>{label}</span> : null}
      <div className="star-rating" role="radiogroup" aria-label="Rating">
        {Array.from({ length: 5 }, (_, index) => {
          const starValue = index + 1
          const isFilled = value !== null && value >= starValue
          const isHalf = value !== null && value >= index + 0.5 && value < starValue

          return (
            <div key={starValue} className="star-shell">
              <button
                type="button"
                className="star-half-button star-half-button--left"
                aria-label={`Set rating ${index + 0.5}`}
                onClick={() => onChange(index + 0.5)}
              />
              <button
                type="button"
                className="star-half-button star-half-button--right"
                aria-label={`Set rating ${starValue}`}
                onClick={() => onChange(starValue)}
              />
              <span className={`material-symbols-outlined star-icon ${isFilled ? 'is-filled' : ''} ${isHalf ? 'is-half' : ''}`}>
                star
              </span>
            </div>
          )
        })}
        <button type="button" className="clear-rating" onClick={() => onChange(null)}>
          Clear
        </button>
      </div>
    </div>
  )
}

export default StarRating
