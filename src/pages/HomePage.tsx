import type { HomeFilter, MediaItem, SavedEntry } from '../types'
import { getPosterUrl } from '../utils/media';

type HomePageProps = {
  activeView: 'movies' | 'series' | 'watchlist'
  visibleItems: MediaItem[]
  entries: Record<string, SavedEntry>
  onOpenDetail: (item: MediaItem) => void
  onSaveEntry: (item: MediaItem, status: 'watchlist' | 'watched') => void
  homeFilter: HomeFilter
  onFilterChange: (filter: HomeFilter) => void
  viewStyle: 'grid' | 'list'
  onViewStyleChange: (view: 'grid' | 'list') => void
}

export default function HomePage({
  activeView,
  visibleItems,
  entries,
  onOpenDetail,
  onSaveEntry,
  homeFilter,
  onFilterChange,
  viewStyle,
  onViewStyleChange,
}: HomePageProps) {
  const trackedCount = Object.keys(entries).length
  const ratedCount = Object.values(entries).filter((entry) => entry.rating).length
  const pendingCount = Object.values(entries).filter((entry) => entry.status === 'watchlist').length

  return (
    <main className={`app-shell__main ${activeView === 'watchlist' ? '' : 'single'}`}>
      <section className="main-card">
        <div className="card-heading">
          <div>
            <p className="eyebrow">Now browsing</p>
            <h2>{activeView === 'movies' ? 'Movies' : activeView === 'series' ? 'TV Shows' : 'Watchlist'}</h2>
          </div>
          <div className="view-toggle" role="group" aria-label="Toggle grid or list view">
            <button
              type="button"
              className={`view-toggle-button ${viewStyle === 'grid' ? 'is-active' : ''}`}
              aria-pressed={viewStyle === 'grid'}
              onClick={() => onViewStyleChange('grid')}
            >
              <span className="material-symbols-outlined">grid_view</span>
            </button>
            <button
              type="button"
              className={`view-toggle-button ${viewStyle === 'list' ? 'is-active' : ''}`}
              aria-pressed={viewStyle === 'list'}
              onClick={() => onViewStyleChange('list')}
            >
              <span className="material-symbols-outlined">view_list</span>
            </button>
          </div>
        </div>

        <div className={`content-grid ${viewStyle === 'list' ? 'list-view' : 'grid-view'}`}>
          {visibleItems.map((item) => {
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
              </article>
            )
          })}
        </div>
      </section>

      {activeView === 'watchlist' ? (
        <aside className="side-card">
          <div className="card-heading compact">
            <div>
              <p className="eyebrow">Overview</p>
              <h2>What’s next?</h2>
            </div>
          </div>
          <ul className="overview-list">
            <li>
              <button
                type="button"
                className={`overview-filter ${homeFilter === 'tracked' ? 'is-active' : ''}`}
                aria-pressed={homeFilter === 'tracked'}
                onClick={() => onFilterChange('tracked')}
              >
                <strong>Tracked</strong>
                <span>{trackedCount} titles</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`overview-filter ${homeFilter === 'rated' ? 'is-active' : ''}`}
                aria-pressed={homeFilter === 'rated'}
                onClick={() => onFilterChange('rated')}
              >
                <strong>Rated</strong>
                <span>{ratedCount} favorites</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`overview-filter ${homeFilter === 'pending' ? 'is-active' : ''}`}
                aria-pressed={homeFilter === 'pending'}
                onClick={() => onFilterChange('pending')}
              >
                <strong>Pending</strong>
                <span>{pendingCount} planned</span>
              </button>
            </li>
          </ul>
        </aside>
      ) : null}
    </main>
  )
}
