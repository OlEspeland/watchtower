import type { Collection, CollectionItem } from '../types'
import CardHeading from '../components/CardHeading'
import MediaPoster from '../components/MediaPoster'
import { getPosterUrl } from '../utils/media'

type CollectionDetailPageProps = {
  collection: Collection | null
  items: CollectionItem[]
  onRemoveItem: (itemKey: string) => void
  onOpenDetail: (item: CollectionItem) => void
  onBack: () => void
}

export default function CollectionDetailPage({
  collection,
  items,
  onRemoveItem,
  onOpenDetail,
  onBack,
}: CollectionDetailPageProps) {
  return (
    <main className="app-shell__main single">
      <section className="main-card">
        <CardHeading
          eyebrow="Collection"
          title={collection?.name ?? 'Collection'}
          onBack={onBack}
          backLabel="Back to collections"
        />

        {collection?.description ? (
          <p className="profile-note">{collection.description}</p>
        ) : null}

        {items.length === 0 ? (
          <p className="profile-note">This collection is empty. Add items from the detail page of any movie or show.</p>
        ) : (
          <div className="collection-items">
            {items.map((item) => {
              const itemKey = `${item.mediaType}:${item.mediaId}`
              return (
                <div key={itemKey} className="collection-item-row">
                  <button
                    type="button"
                    className="collection-item-main"
                    onClick={() => onOpenDetail(item)}
                  >
                    {item.posterPath ? (
                      <img className="collection-item-poster" src={getPosterUrl(item.posterPath)} alt={item.title} />
                    ) : (
                      <div className="collection-item-poster collection-item-poster-fallback">
                        <MediaPoster posterPath={null} title={item.title} mediaType={item.mediaType} />
                      </div>
                    )}
                    <div className="collection-item-info">
                      <div className="collection-item-title">{item.title}</div>
                      <div className="collection-item-year">{item.year}</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    className="collection-item-remove"
                    onClick={() => {
                      if (window.confirm(`Remove "${item.title}" from this collection?`)) {
                        onRemoveItem(itemKey)
                      }
                    }}
                    aria-label={`Remove ${item.title}`}
                  >
                    <span className="material-symbols-outlined">remove_circle</span>
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}
