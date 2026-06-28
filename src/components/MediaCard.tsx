import type { ReactNode } from 'react'
import type { MediaItem, SavedEntry } from '../types'
import MediaPoster from './MediaPoster'
import EntryBadge from './EntryBadge'
import EntryActions from './EntryActions'

type MediaCardProps = {
  item: MediaItem
  entry: SavedEntry | undefined
  onOpenDetail: () => void
  onAddToWatchlist: () => void
  onMarkWatched: () => void
  children?: ReactNode
}

export default function MediaCard({
  item,
  entry,
  onOpenDetail,
  onAddToWatchlist,
  onMarkWatched,
  children,
}: MediaCardProps) {
  return (
    <article className="media-card">
      <button type="button" className="media-title-button" onClick={onOpenDetail}>
        <MediaPoster posterPath={item.posterPath} title={item.title} mediaType={item.mediaType} />
        <div className="media-card-copy">
          <p className="media-year">{item.year}</p>
          <h3>{item.title}</h3>
        </div>
      </button>

      <EntryBadge entry={entry} />
      <EntryActions
        entry={entry}
        onAddToWatchlist={onAddToWatchlist}
        onMarkWatched={onMarkWatched}
      />

      {children}
    </article>
  )
}
