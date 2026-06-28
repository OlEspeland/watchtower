import { useState } from 'react'
import type { HomeFilter, MediaItem, SavedEntry } from '../types'
import CardHeading from '../components/CardHeading'
import ViewToggle from '../components/ViewToggle'
import MediaCard from '../components/MediaCard'

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
  hasMoreMovies: boolean
  hasMoreSeries: boolean
  onLoadMoreDiscover: (type: 'movie' | 'tv') => void
}

const WATCHLIST_PAGE_SIZE = 12

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
  hasMoreMovies,
  hasMoreSeries,
  onLoadMoreDiscover,
}: HomePageProps) {
  const [watchlistLimit, setWatchlistLimit] = useState(WATCHLIST_PAGE_SIZE)
  const headingTitle = activeView === 'movies' ? 'Movies' : activeView === 'series' ? 'TV Shows' : 'Watchlist'
  const trackedCount = Object.keys(entries).length
  const ratedCount = Object.values(entries).filter((entry) => entry.rating).length
  const pendingCount = Object.values(entries).filter((entry) => entry.status === 'watchlist').length
  const displayItems = activeView === 'watchlist' ? visibleItems.slice(0, watchlistLimit) : visibleItems

  return (
    <main className={`app-shell__main ${activeView === 'watchlist' ? '' : 'single'}`}>
      <section className="main-card">
        <CardHeading eyebrow="Now browsing" title={headingTitle}>
          <ViewToggle value={viewStyle} onChange={onViewStyleChange} />
        </CardHeading>

        <div className={`content-grid ${viewStyle === 'list' ? 'list-view' : 'grid-view'}`}>
          {displayItems.map((item) => {
            const entryKey = `${item.mediaType}:${item.id}`
            const entry = entries[entryKey]
            return (
              <MediaCard
                key={entryKey}
                item={item}
                entry={entry}
                onOpenDetail={() => onOpenDetail(item)}
                onAddToWatchlist={() => onSaveEntry(item, 'watchlist')}
                onMarkWatched={() => onSaveEntry(item, 'watched')}
              />
            )
          })}
        </div>

        {activeView === 'movies' && hasMoreMovies ? (
          <button type="button" className="load-more" onClick={() => onLoadMoreDiscover('movie')}>
            <span className="material-symbols-outlined">expand_more</span>
            <span>Load more movies</span>
          </button>
        ) : null}
        {activeView === 'series' && hasMoreSeries ? (
          <button type="button" className="load-more" onClick={() => onLoadMoreDiscover('tv')}>
            <span className="material-symbols-outlined">expand_more</span>
            <span>Load more shows</span>
          </button>
        ) : null}
        {activeView === 'watchlist' && watchlistLimit < visibleItems.length ? (
          <button type="button" className="load-more" onClick={() => setWatchlistLimit((prev) => prev + WATCHLIST_PAGE_SIZE)}>
            <span className="material-symbols-outlined">expand_more</span>
            <span>Load more ({visibleItems.length - watchlistLimit} remaining)</span>
          </button>
        ) : null}
      </section>

      {activeView === 'watchlist' ? (
        <aside className="side-card">
          <CardHeading eyebrow="Overview" title="What&rsquo;s next?" />
          <ul className="overview-list">
            <li>
              <button
                type="button"
                className={`overview-filter ${homeFilter === 'tracked' ? 'is-active' : ''}`}
                aria-pressed={homeFilter === 'tracked'}
                onClick={() => { setWatchlistLimit(WATCHLIST_PAGE_SIZE); onFilterChange('tracked') }}
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
                onClick={() => { setWatchlistLimit(WATCHLIST_PAGE_SIZE); onFilterChange('rated') }}
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
                onClick={() => { setWatchlistLimit(WATCHLIST_PAGE_SIZE); onFilterChange('pending') }}
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
