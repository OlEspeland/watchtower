import type { SavedEntry } from '../types'

type EntryBadgeProps = {
  entry: SavedEntry | undefined
}

export default function EntryBadge({ entry }: EntryBadgeProps) {
  const rating = entry?.rating
  if (rating == null) {
    return null
  }

  return (
    <div className="entry-stars">
      {Array.from({ length: 5 }, (_, i) => {
        const starValue = i + 1
        const isFilled = rating >= starValue
        const isHalf = rating >= i + 0.5 && rating < starValue
        return (
          <span
            key={starValue}
            className={`material-symbols-outlined entry-star ${isFilled ? 'is-filled' : ''} ${isHalf ? 'is-half' : ''}`}
          >
            star
          </span>
        )
      })}
    </div>
  )
}
