import type { MediaItem, SavedEntry, EntryStatus } from '../types'
import StarRating from '../components/StarRating';
import { getPosterUrl } from '../utils/media';

type SearchPageProps = {
  searchQuery: string
  searchLoading: boolean
  searchResults: MediaItem[]
  entries: Record<string, SavedEntry>
  onSearchQueryChange: (value: string) => void
  onSearch: () => Promise<void>
  onOpenDetail: (item: MediaItem) => void
  onSaveEntry: (item: MediaItem, status: EntryStatus, rating?: number | null) => void
  onBack: () => void
}

export default function SearchPage({
  searchQuery,
  searchLoading,
  searchResults,
  entries,
  onSearchQueryChange,
  onSearch,
  onOpenDetail,
  onSaveEntry,
  onBack,
}: SearchPageProps) {
  return (
    <main className="app-shell__main single">
      <section className="main-card">
        <div className="card-heading">
          <div>
            <p className="eyebrow">Search</p>
            <h2>Find movies and TV shows</h2>
          </div>
          <button type="button" className="secondary-button" onClick={onBack}>
            <span className="material-symbols-outlined">arrow_back</span>
            <span>Back home</span>
          </button>
        </div>

        <div className="search-bar">
          <input
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                void onSearch()
              }
            }}
            placeholder="Search for a title"
          />
          <button type="button" className="primary-button" onClick={() => void onSearch()}>
            <span className="material-symbols-outlined">search</span>
            <span>Search</span>
          </button>
        </div>

        {searchLoading ? <p className="profile-note">Searching TMDB…</p> : null}
        {!searchLoading && searchResults.length === 0 && searchQuery ? (
          <p className="profile-note">No results yet. Try another title.</p>
        ) : null}

        <div className="content-grid">
          {searchResults.map((item) => {
            const entry = entries[`${item.mediaType}:${item.id}`]
            return (
              <article key={`${item.mediaType}-${item.id}`} className="media-card">
                <button type="button" className="media-title-button" onClick={() => onOpenDetail(item)}>
                  <div className="media-poster-shell">
                    {item.posterPath ? (
                      <img className="media-poster" src={getPosterUrl(item.posterPath)} alt={item.title} />
                    ) : (
                      <div className="media-poster-fallback">
                        <span className="material-symbols-outlined">movie</span>
                      </div>
                    )}
                    <div className="media-poster-badge">{item.mediaType === 'movie' ? 'Movie' : 'TV'}</div>
                  </div>
                  <div className="media-card-copy">
                    <p className="media-year">{item.year}</p>
                    <h3>{item.title}</h3>
                  </div>
                </button>

                <div className="media-card-footer">
                  <p className="media-rating">
                    <span className="material-symbols-outlined">star</span>
                    <span>{entry?.rating ? `${entry.rating.toFixed(1)}/5` : 'Unrated'}</span>
                  </p>
                  <p className="media-status">
                    {entry?.status === 'watched'
                      ? 'Watched'
                      : entry?.status === 'watchlist'
                      ? 'In watchlist'
                      : 'Not saved'}
                  </p>
                </div>

                <div className="card-actions">
                  <button
                    type="button"
                    className={`icon-only-action ${entry?.status === 'watchlist' ? 'is-active' : ''}`}
                    onClick={() => onSaveEntry(item, 'watchlist')}
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
                    onClick={() => onSaveEntry(item, 'watched')}
                    title={entry?.status === 'watched' ? 'Already marked watched' : 'Mark watched'}
                    aria-label={entry?.status === 'watched' ? 'Already marked watched' : 'Mark watched'}
                  >
                    <span className="material-symbols-outlined">
                      {entry?.status === 'watched' ? 'check_circle' : 'check_circle_outline'}
                    </span>
                  </button>
                </div>

                <StarRating
                  value={entry?.rating ?? null}
                  onChange={(rating) => onSaveEntry(item, entry?.status ?? 'watched', rating)}
                />
              </article>
            )
          })}
        </div>
      </section>
    </main>
  )
}
