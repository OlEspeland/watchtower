import CardHeading from '../components/CardHeading'
import ReviewCard from '../components/ReviewCard'
import type { UserProfile, Review } from '../types'

type UserDetailPageProps = {
  profile: UserProfile | null
  reviews: Review[]
  isFriend: boolean
  isCurrentUser: boolean
  hasPendingRequest: boolean
  onAddFriend: () => void
  onBack: () => void
  loading: boolean
}

export default function UserDetailPage({
  profile,
  reviews,
  isFriend,
  isCurrentUser,
  hasPendingRequest,
  onAddFriend,
  onBack,
  loading,
}: UserDetailPageProps) {
  if (loading || !profile) {
    return (
      <main className="app-shell__main single">
        <section className="main-card">
          <CardHeading eyebrow="User" title="Loading…" onBack={onBack} backLabel="Back" />
          <p className="profile-note">Loading user profile…</p>
        </section>
      </main>
    )
  }

  const letter = (profile.name || '?')[0].toUpperCase()

  return (
    <main className="app-shell__main single">
      <section className="main-card">
        <CardHeading eyebrow="User" title={profile.name} onBack={onBack} backLabel="Back" />

        <div className="user-detail-header">
          <div className="friend-avatar user-detail-avatar">{letter}</div>
          <div className="user-detail-info">
            <h3>{profile.name}</h3>
          </div>
          {!isCurrentUser ? (
            isFriend ? (
              <span className="friend-status-label friend-status-badge">Friends</span>
            ) : hasPendingRequest ? (
              <span className="friend-status-label friend-status-badge">Request sent</span>
            ) : (
              <button type="button" className="primary-button" onClick={onAddFriend}>
                <span className="material-symbols-outlined">person_add</span>
                <span>Add friend</span>
              </button>
            )
          ) : null}
        </div>

        <h4 className="section-heading">Reviews</h4>
        {reviews.length === 0 ? (
          <p className="profile-note">{isCurrentUser ? 'You haven\'t reviewed anything yet.' : `${profile.name} hasn't reviewed anything yet.`}</p>
        ) : (
          <div className="user-reviews-list">
            {reviews.map((review) => (
              <ReviewCard key={`${review.mediaType}:${review.mediaId}`} review={review} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
