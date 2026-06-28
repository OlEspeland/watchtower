import type { MediaItem, SavedEntry, EntryStatus } from '../types'
import StarRating from '../components/StarRating';
import { getPosterUrl } from '../utils/media';

type DetailPageProps = {
  selectedItem: MediaItem
  detailLoading: boolean
  entries: Record<string, SavedEntry>
  onBack: () => void
  onSaveEntry: (item: MediaItem, status: EntryStatus) => void
  onChangeRating: (item: MediaItem, rating: number | null) => void
}

export default function DetailPage({
  selectedItem,
  detailLoading,
  entries,
  onBack,
  onSaveEntry,
  onChangeRating,
}: DetailPageProps) {
  const currentEntry = entries[`${selectedItem.mediaType}:${selectedItem.id}`]

  return (
    <main className="app-shell__main single">
      <section className="main-card detail-card">
        <div className="card-heading">
          <div>
            <p className="eyebrow">Details</p>
            <h2>{selectedItem.title}</h2>
          </div>
          <button type="button" className="secondary-button" onClick={onBack}>
            Back to list
          </button>
        </div>

        {detailLoading ? <p className="profile-note">Loading details…</p> : null}

        <div className="detail-body">
          <div className="detail-hero">
            <div className="detail-poster">
              {selectedItem.posterPath ? (
                <img className="media-poster" src={getPosterUrl(selectedItem.posterPath)} alt={selectedItem.title} />
              ) : (
                <div className="media-poster-fallback">
                  <span className="material-symbols-outlined">movie</span>
                </div>
              )}
            </div>
            <div className="detail-copy">
              <p className="detail-meta">
                {selectedItem.year} • {selectedItem.runtime ?? 'Details loading'}
              </p>
              <p>{selectedItem.overview || 'No synopsis available yet.'}</p>
              {selectedItem.genres?.length ? <p className="detail-genres">{selectedItem.genres.join(' • ')}</p> : null}
              <div className="card-actions">
                <button
                  type="button"
                  className={`icon-only-action ${currentEntry?.status === 'watchlist' ? 'is-active' : ''}`}
                  onClick={() => onSaveEntry(selectedItem, 'watchlist')}
                  title={currentEntry?.status === 'watchlist' ? 'Already in watchlist' : 'Add to watchlist'}
                  aria-label={currentEntry?.status === 'watchlist' ? 'Already in watchlist' : 'Add to watchlist'}
                >
                  <span className="material-symbols-outlined">
                    {currentEntry?.status === 'watchlist' ? 'bookmark_added' : 'bookmark_add'}
                  </span>
                </button>
                <button
                  type="button"
                  className={`icon-only-action ${currentEntry?.status === 'watched' ? 'is-active' : ''}`}
                  onClick={() => onSaveEntry(selectedItem, 'watched')}
                  title={currentEntry?.status === 'watched' ? 'Already marked watched' : 'Mark watched'}
                  aria-label={currentEntry?.status === 'watched' ? 'Already marked watched' : 'Mark watched'}
                >
                  <span className="material-symbols-outlined">
                    {currentEntry?.status === 'watched' ? 'check_circle' : 'check_circle_outline'}
                  </span>
                </button>
              </div>
              <StarRating
                label="Your rating"
                value={currentEntry?.rating ?? null}
                onChange={(rating) => onChangeRating(selectedItem, rating)}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
