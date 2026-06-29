import { useState } from 'react'
import type { MediaItem, SavedEntry, EntryStatus, Review } from '../types'
import type { Collection } from '../types'
import CardHeading from '../components/CardHeading'
import MediaPoster from '../components/MediaPoster'
import EntryActions from '../components/EntryActions'
import ReviewForm from '../components/ReviewForm'
import { getPosterUrl } from '../utils/media'

function formatReleaseDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function renderStars(rating: number) {
  const stars = []
  for (let i = 1; i <= 5; i++) {
    const filled = rating >= i
    const half = !filled && rating >= i - 0.5
    stars.push(
      <span
        key={i}
        className={`star-icon${filled ? ' is-filled' : ''}${half ? ' is-half' : ''}`}
      >
        {half ? 'star_half' : 'star'}
      </span>
    )
  }
  return stars
}

type DetailPageProps = {
  selectedItem: MediaItem
  detailLoading: boolean
  entries: Record<string, SavedEntry>
  existingReview: Review | null
  friendReviews: (Review & { authorUid: string; authorName: string })[]
  friendReviewLoading: boolean
  collections: Collection[]
  onBack: () => void
  onSaveEntry: (item: MediaItem, status: EntryStatus) => void
  onSaveReview: (item: MediaItem, rating: number, comment: string) => void
  onDeleteReview: (item: MediaItem) => void
  onAddToCollection: (collectionId: string, item: MediaItem) => void
}

export default function DetailPage({
  selectedItem,
  detailLoading,
  entries,
  existingReview,
  friendReviews,
  friendReviewLoading,
  collections,
  onBack,
  onSaveEntry,
  onSaveReview,
  onDeleteReview,
  onAddToCollection,
}: DetailPageProps) {
  const [collectionPickerOpen, setCollectionPickerOpen] = useState(false)
  const entryKey = `${selectedItem.mediaType}:${selectedItem.id}`
  const currentEntry = entries[entryKey]
  const isUnreleased = selectedItem.releaseDate && new Date(selectedItem.releaseDate) > new Date()

  return (
    <main className="app-shell__main single">
      <section className="main-card detail-card">
        <CardHeading
          eyebrow="Details"
          title={selectedItem.title}
          onBack={onBack}
          backLabel="Back to list"
        />

        {detailLoading ? <p className="profile-note">Loading details…</p> : null}

        <div className="detail-body">
          <div className="detail-hero">
            <div className="detail-poster">
              {selectedItem.posterPath ? (
                <img className="media-poster" src={getPosterUrl(selectedItem.posterPath)} alt={selectedItem.title} />
              ) : (
                <MediaPoster posterPath={null} title={selectedItem.title} mediaType={selectedItem.mediaType} />
              )}
            </div>
            <div className="detail-copy">
              <p className="detail-meta">
                {selectedItem.year} • {selectedItem.runtime ?? 'Details loading'}
              </p>
              <p>{selectedItem.overview || 'No synopsis available yet.'}</p>
              {selectedItem.genres?.length ? <p className="detail-genres">{selectedItem.genres.join(' • ')}</p> : null}
              {isUnreleased ? <p className="detail-release-date">Releases {formatReleaseDate(selectedItem.releaseDate!)}</p> : null}

              <h4 className="section-heading">My tracking</h4>
              <EntryActions
                entry={currentEntry}
                onAddToWatchlist={() => onSaveEntry(selectedItem, 'watchlist')}
                onMarkWatched={() => onSaveEntry(selectedItem, 'watched')}
              />

              <div className="detail-review-section">
                <ReviewForm
                  existingReview={existingReview}
                  onSave={(rating, comment) => onSaveReview(selectedItem, rating, comment)}
                  onDelete={() => onDeleteReview(selectedItem)}
                />
              </div>

              {collections.length > 0 ? (
                <div className="collection-picker-wrapper">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => setCollectionPickerOpen(!collectionPickerOpen)}
                  >
                    <span className="material-symbols-outlined">playlist_add</span>
                    <span>Add to collection</span>
                  </button>
                  {collectionPickerOpen ? (
                    <div className="collection-picker-dropdown">
                      {collections.map((col) => (
                        <button
                          key={col.id}
                          type="button"
                          className="collection-picker-option"
                          onClick={() => {
                            onAddToCollection(col.id, selectedItem)
                            setCollectionPickerOpen(false)
                          }}
                        >
                          {col.name}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}

              {friendReviewLoading ? (
                <p className="profile-note">Loading friend reviews…</p>
              ) : friendReviews.length > 0 ? (
                <div className="friend-reviews-section">
                  <h4 className="section-heading">From friends</h4>
                  <div className="friend-reviews-list">
                    {friendReviews.map((r) => (
                      <div key={`${r.authorUid}`} className="review-card">
                        <div className="review-card-body">
                          <div className="review-card-header">
                            <span className="review-card-author">{r.authorName}</span>
                            <span className="review-card-stars">{renderStars(r.rating)}</span>
                          </div>
                          {r.comment ? <p className="review-card-comment">{r.comment}</p> : null}
                          <div className="review-card-footer">
                            <span className="review-card-date">{new Date(r.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
