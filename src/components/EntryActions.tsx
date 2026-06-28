import type { SavedEntry } from '../types'

type EntryActionsProps = {
  entry: SavedEntry | undefined
  onAddToWatchlist: () => void
  onMarkWatched: () => void
}

export default function EntryActions({ entry, onAddToWatchlist, onMarkWatched }: EntryActionsProps) {
  return (
    <div className="card-actions">
      <button
        type="button"
        className={`icon-only-action ${entry?.status === 'watchlist' ? 'is-active' : ''}`}
        onClick={onAddToWatchlist}
        title={entry?.status === 'watchlist' ? 'Already in watchlist' : 'Add to watchlist'}
        aria-label={entry?.status === 'watchlist' ? 'Already in watchlist' : 'Add to watchlist'}
      >
        <span className="material-symbols-outlined">
          {entry?.status === 'watchlist' ? 'bookmark_added' : 'bookmark_add'}
        </span>
      </button>
      <button
        type="button"
        className={`icon-only-action ${entry?.status === 'watched' ? 'is-active' : ''}`}
        onClick={onMarkWatched}
        title={entry?.status === 'watched' ? 'Already marked watched' : 'Mark watched'}
        aria-label={entry?.status === 'watched' ? 'Already marked watched' : 'Mark watched'}
      >
        <span className="material-symbols-outlined">
          {entry?.status === 'watched' ? 'check_circle' : 'check_circle_outline'}
        </span>
      </button>
    </div>
  )
}
