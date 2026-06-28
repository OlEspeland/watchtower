import type { MediaItem, SavedEntry, EntryStatus } from '../types'
import CardHeading from '../components/CardHeading'
import MediaPoster from '../components/MediaPoster'
import EntryActions from '../components/EntryActions'
import StarRating from '../components/StarRating'
import { getPosterUrl } from '../utils/media'

function formatReleaseDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

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
              <EntryActions
                entry={currentEntry}
                onAddToWatchlist={() => onSaveEntry(selectedItem, 'watchlist')}
                onMarkWatched={() => onSaveEntry(selectedItem, 'watched')}
              />
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
