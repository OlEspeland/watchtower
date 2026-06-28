import type { MediaItem, SavedEntry, EntryStatus } from '../types'
import CardHeading from '../components/CardHeading'
import MediaCard from '../components/MediaCard'

type SearchPageProps = {
  searchQuery: string
  searchLoading: boolean
  searchResults: MediaItem[]
  hasMoreSearch: boolean
  entries: Record<string, SavedEntry>
  onSearchQueryChange: (value: string) => void
  onSearch: () => Promise<void>
  onLoadMoreSearch: () => Promise<void>
  onOpenDetail: (item: MediaItem) => void
  onSaveEntry: (item: MediaItem, status: EntryStatus, rating?: number | null) => void
  onBack: () => void
}

export default function SearchPage({
  searchQuery,
  searchLoading,
  searchResults,
  hasMoreSearch,
  entries,
  onSearchQueryChange,
  onSearch,
  onLoadMoreSearch,
  onOpenDetail,
  onSaveEntry,
  onBack,
}: SearchPageProps) {
  return (
    <main className="app-shell__main single">
      <section className="main-card">
        <CardHeading
          eyebrow="Search"
          title="Find movies and TV shows"
          onBack={onBack}
          backLabel="Back home"
        />

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

        {hasMoreSearch ? (
          <button type="button" className="load-more" onClick={() => void onLoadMoreSearch()}>
            <span className="material-symbols-outlined">expand_more</span>
            <span>Load more results</span>
          </button>
        ) : null}
      </section>
    </main>
  )
}
