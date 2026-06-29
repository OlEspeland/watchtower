import { useState } from 'react'
import CardHeading from '../components/CardHeading'
import FriendRequestCard from '../components/FriendRequestCard'
import FriendCard from '../components/FriendCard'
import type { FriendRequestData, UserProfile } from '../types'

type SocialPageProps = {
  friendRequests: FriendRequestData[]
  friends: UserProfile[]
  friendUids: string[]
  onAcceptRequest: (fromUid: string, fromName: string) => void
  onDeclineRequest: (fromUid: string) => void
  onSearchUsers: (query: string) => Promise<UserProfile[]>
  onViewUser: (uid: string) => void
  onSendRequest: (toUid: string, toName: string) => void
  onRemoveFriend: (friendUid: string) => void
  onBack: () => void
  currentUserUid: string
}

export default function SocialPage({
  friendRequests,
  friends,
  friendUids,
  onAcceptRequest,
  onDeclineRequest,
  onSearchUsers,
  onViewUser,
  onSendRequest,
  onRemoveFriend,
  onBack,
  currentUserUid,
}: SocialPageProps) {
  const [tab, setTab] = useState<'friends' | 'requests' | 'find'>('friends')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<UserProfile[]>([])
  const [searching, setSearching] = useState(false)
  const [sentIds, setSentIds] = useState<Set<string>>(new Set())

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setSearching(true)
    const results = await onSearchUsers(searchQuery)
    setSearchResults(results.filter((u) => u.uid !== currentUserUid))
    setSearching(false)
  }

  const handleSendRequest = async (toUid: string, toName: string) => {
    await onSendRequest(toUid, toName)
    setSentIds((prev) => new Set(prev).add(toUid))
  }

  return (
    <main className="app-shell__main single">
      <section className="main-card social-card">
        <CardHeading eyebrow="Social" title="Friends" onBack={onBack} backLabel="Back to app">
          <div className="social-tabs">
            <button
              type="button"
              className={`social-tab ${tab === 'friends' ? 'is-active' : ''}`}
              onClick={() => setTab('friends')}
            >
              Friends ({friends.length})
            </button>
            <button
              type="button"
              className={`social-tab ${tab === 'requests' ? 'is-active' : ''}`}
              onClick={() => setTab('requests')}
            >
              {friendRequests.length > 0 ? (
                <span className="social-tab-with-badge">
                  Requests
                  <span className="badge-count">{friendRequests.length}</span>
                </span>
              ) : (
                'Requests'
              )}
            </button>
            <button
              type="button"
              className={`social-tab ${tab === 'find' ? 'is-active' : ''}`}
              onClick={() => setTab('find')}
            >
              Find users
            </button>
          </div>
        </CardHeading>

        {tab === 'requests' ? (
          friendRequests.length === 0 ? (
            <p className="profile-note">No pending friend requests.</p>
          ) : (
            <div className="friend-request-list">
              {friendRequests.map((req) => (
                <FriendRequestCard
                  key={req.fromUid}
                  request={req}
                  onAccept={() => onAcceptRequest(req.fromUid, req.fromName)}
                  onDecline={() => onDeclineRequest(req.fromUid)}
                />
              ))}
            </div>
          )
        ) : null}

        {tab === 'find' ? (
          <div>
            <div className="search-bar">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') void handleSearch() }}
                placeholder="Search by username"
              />
              <button type="button" className="primary-button" onClick={() => void handleSearch()}>
                <span className="material-symbols-outlined">search</span>
                <span>Search</span>
              </button>
            </div>
            {searching ? <p className="profile-note">Searching…</p> : null}
            {!searching && searchResults.length > 0 ? (
              <div className="user-search-results">
                {searchResults.map((u) => {
                  const isFriend = friendUids.includes(u.uid)
                  const isSent = sentIds.has(u.uid)
                  return (
                    <div key={u.uid} className="user-search-row">
                      <button type="button" className="user-search-main" onClick={() => onViewUser(u.uid)}>
                        <div className="friend-avatar">{u.name[0].toUpperCase()}</div>
                        <strong>{u.name}</strong>
                      </button>
                      {isFriend ? (
                        <span className="friend-status-label">Friends</span>
                      ) : isSent ? (
                        <span className="friend-status-label">Request sent</span>
                      ) : (
                        <button
                          type="button"
                          className="primary-button"
                          onClick={() => void handleSendRequest(u.uid, u.name)}
                        >
                          <span className="material-symbols-outlined">person_add</span>
                          <span>Add</span>
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : null}
            {!searching && searchQuery && searchResults.length === 0 ? (
              <p className="profile-note">No users found. Try a different name.</p>
            ) : null}
          </div>
        ) : null}

        {tab === 'friends' ? (
          friends.length === 0 ? (
            <p className="profile-note">
              You haven't added any friends yet. Use "Find users" to search and send friend requests.
            </p>
          ) : (
            <div className="friends-list">
              {friends.map((profile) => (
                <FriendCard
                  key={profile.uid}
                  profile={profile}
                  onViewProfile={() => onViewUser(profile.uid)}
                  onRemove={() => onRemoveFriend(profile.uid)}
                />
              ))}
            </div>
          )
        ) : null}
      </section>
    </main>
  )
}
