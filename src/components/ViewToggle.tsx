type ViewToggleProps = {
  value: 'grid' | 'list'
  onChange: (value: 'grid' | 'list') => void
}

export default function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div className="view-toggle" role="group" aria-label="Toggle grid or list view">
      <button
        type="button"
        className={`view-toggle-button ${value === 'grid' ? 'is-active' : ''}`}
        aria-pressed={value === 'grid'}
        onClick={() => onChange('grid')}
      >
        <span className="material-symbols-outlined">grid_view</span>
      </button>
      <button
        type="button"
        className={`view-toggle-button ${value === 'list' ? 'is-active' : ''}`}
        aria-pressed={value === 'list'}
        onClick={() => onChange('list')}
      >
        <span className="material-symbols-outlined">view_list</span>
      </button>
    </div>
  )
}
