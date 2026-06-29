import type { FriendRequestData } from '../types'

type FriendRequestCardProps = {
  request: FriendRequestData
  onAccept: () => void
  onDecline: () => void
}

export default function FriendRequestCard({ request, onAccept, onDecline }: FriendRequestCardProps) {
  const letter = (request.fromName || '?')[0].toUpperCase()

  return (
    <div className="friend-request-card">
      <div className="friend-avatar">{letter}</div>
      <div className="friend-request-info">
        <strong>{request.fromName}</strong>
        <span className="friend-request-label">Wants to be friends</span>
      </div>
      <div className="friend-request-actions">
        <button type="button" className="primary-button" onClick={onAccept}>
          <span className="material-symbols-outlined">check</span>
          <span>Accept</span>
        </button>
        <button type="button" className="secondary-button" onClick={onDecline}>
          <span className="material-symbols-outlined">close</span>
          <span>Decline</span>
        </button>
      </div>
    </div>
  )
}
