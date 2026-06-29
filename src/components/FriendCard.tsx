import type { UserProfile } from '../types'

type FriendCardProps = {
  profile: UserProfile
  onViewProfile: () => void
  onRemove?: () => void
}

export default function FriendCard({ profile, onViewProfile, onRemove }: FriendCardProps) {
  const letter = (profile.name || '?')[0].toUpperCase()

  return (
    <div className="friend-card">
      <button type="button" className="friend-card-main" onClick={onViewProfile}>
        <div className="friend-avatar" style={{ backgroundColor: `var(--accent)` }}>
          {letter}
        </div>
        <div className="friend-card-info">
          <strong className="friend-card-name">{profile.name}</strong>
        </div>
      </button>
      {onRemove ? (
        <button type="button" className="friend-card-remove" onClick={onRemove} title="Remove friend">
          <span className="material-symbols-outlined">person_remove</span>
        </button>
      ) : null}
    </div>
  )
}
