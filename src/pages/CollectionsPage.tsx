import type { Collection } from '../types'
import CardHeading from '../components/CardHeading'

type CollectionsPageProps = {
  collections: Collection[]
  onOpenCollection: (id: string) => void
  onCreateCollection: (name: string, description: string) => void
  onDeleteCollection: (id: string) => void
  onBack: () => void
}

export default function CollectionsPage({
  collections,
  onOpenCollection,
  onCreateCollection,
  onDeleteCollection,
  onBack,
}: CollectionsPageProps) {
  return (
    <main className="app-shell__main single">
      <section className="main-card">
        <CardHeading
          eyebrow="Library"
          title="My Collections"
          onBack={onBack}
          backLabel="Back to profile"
        />

        <CreateCollectionForm onSubmit={onCreateCollection} />

        {collections.length === 0 ? (
          <p className="profile-note">No collections yet. Create your first one above.</p>
        ) : (
          <div className="collections-grid">
            {collections.map((col) => (
              <div key={col.id} className="collection-card">
                <button
                  type="button"
                  className="collection-card-main"
                  onClick={() => onOpenCollection(col.id)}
                >
                  <div className="collection-card-avatar">
                    <span className="material-symbols-outlined">collections_bookmark</span>
                  </div>
                  <div className="collection-card-info">
                    <div className="collection-card-name">{col.name}</div>
                    <div className="collection-card-meta">
                      {col.itemCount} item{col.itemCount !== 1 ? 's' : ''}
                      {col.description ? ` · ${col.description}` : ''}
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  className="collection-card-delete"
                  onClick={() => {
                    if (window.confirm(`Delete "${col.name}"?`)) {
                      onDeleteCollection(col.id)
                    }
                  }}
                  aria-label={`Delete ${col.name}`}
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

function CreateCollectionForm({ onSubmit }: { onSubmit: (name: string, desc: string) => void }) {
  return (
    <form
      className="create-collection-form"
      onSubmit={(e) => {
        e.preventDefault()
        const form = e.currentTarget
        const nameInput = form.elements.namedItem('col-name') as HTMLInputElement
        const descInput = form.elements.namedItem('col-desc') as HTMLInputElement
        if (!nameInput.value.trim()) return
        onSubmit(nameInput.value.trim(), descInput.value.trim())
        nameInput.value = ''
        descInput.value = ''
      }}
    >
      <div className="create-collection-inputs">
        <input name="col-name" placeholder="Collection name" required />
        <input name="col-desc" placeholder="Description (optional)" />
      </div>
      <button type="submit" className="primary-button">
        <span className="material-symbols-outlined">add</span>
        <span>Create</span>
      </button>
    </form>
  )
}
