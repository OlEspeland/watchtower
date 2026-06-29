import { useState } from 'react'
import type { User } from 'firebase/auth'
import { ACCENT_COLORS } from '../colors'
import CardHeading from '../components/CardHeading'
import FriendRequestCard from '../components/FriendRequestCard'
import FriendCard from '../components/FriendCard'
import type { AccentKey } from '../colors'
import type { Collection, FriendRequestData, UserProfile } from '../types'

type ProfilePageProps = {
  user: User | null
  profileName: string
  accentColor: AccentKey
  statusMessage: string
  isFirebaseConfigured: boolean
  friendRequests: FriendRequestData[]
  friends: UserProfile[]
  friendUids: string[]
  collections: Collection[]
  onProfileNameChange: (value: string) => void
  onAccentColorChange: (value: AccentKey) => void
  onSaveProfile: () => void
  onSignOut: () => void
  onGoogleSignIn: () => void
  onBack: () => void
  onAcceptRequest: (fromUid: string, fromName: string) => void
  onDeclineRequest: (fromUid: string) => void
  onSearchUsers: (query: string) => Promise<UserProfile[]>
  onViewUser: (uid: string) => void
  onSendRequest: (toUid: string, toName: string) => void
  onRemoveFriend: (friendUid: string) => void
  onOpenCollection: (id: string) => void
  onCreateCollection: (name: string, description: string) => void
  onDeleteCollection: (id: string) => void
}

type ProfileTab = 'profile' | 'friends' | 'collections'

export default function ProfilePage({
  user,
  profileName,
  accentColor,
  statusMessage,
  isFirebaseConfigured,
  friendRequests,
  friends,
  friendUids,
  collections,
  onProfileNameChange,
  onAccentColorChange,
  onSaveProfile,
  onSignOut,
  onGoogleSignIn,
  onBack,
  onAcceptRequest,
  onDeclineRequest,
  onSearchUsers,
  onViewUser,
  onSendRequest,
  onRemoveFriend,
  onOpenCollection,
  onCreateCollection,
  onDeleteCollection,
}: ProfilePageProps) {
  const [tab, setTab] = useState<ProfileTab>('profile')
  const requestCount = friendRequests.length

  return (
    <main className="app-shell__main single">
      <section className="main-card profile-card">
        <CardHeading
          eyebrow="Profile"
          title={user ? (profileName ? `Welcome, ${profileName}` : 'Set your nickname') : 'Sign in to sync your account'}
          onBack={onBack}
          backLabel="Back to app"
        />

        {user ? (
          <div className="profile-tabs">
            <button
              type="button"
              className={`profile-tab ${tab === 'profile' ? 'is-active' : ''}`}
              onClick={() => setTab('profile')}
            >
              <span className="material-symbols-outlined">person</span>
              <span>Profile</span>
            </button>
            <button
              type="button"
              className={`profile-tab ${tab === 'friends' ? 'is-active' : ''}`}
              onClick={() => setTab('friends')}
            >
              <span className="material-symbols-outlined">people</span>
              <span>Friends</span>
              {requestCount > 0 ? <span className="badge-count">{requestCount}</span> : null}
            </button>
            <button
              type="button"
              className={`profile-tab ${tab === 'collections' ? 'is-active' : ''}`}
              onClick={() => setTab('collections')}
            >
              <span className="material-symbols-outlined">collections_bookmark</span>
              <span>Collections</span>
            </button>
          </div>
        ) : null}

        {!user ? (
          <div className="auth-form">
            <p className="profile-note">
              Watchtower uses Google sign-in so your profile, watchlist, and ratings can sync to Firebase.
            </p>
            <button type="button" className="primary-button" onClick={onGoogleSignIn}>
              <span className="material-symbols-outlined">login</span>
              <span>Continue with Google</span>
            </button>
          </div>
        ) : tab === 'profile' ? (
          <ProfileTab
            user={user}
            profileName={profileName}
            accentColor={accentColor}
            onProfileNameChange={onProfileNameChange}
            onAccentColorChange={onAccentColorChange}
            onSaveProfile={onSaveProfile}
            onSignOut={onSignOut}
          />
        ) : tab === 'friends' ? (
          <FriendsTab
            friendRequests={friendRequests}
            friends={friends}
            friendUids={friendUids}
            currentUserUid={user.uid}
            onAcceptRequest={onAcceptRequest}
            onDeclineRequest={onDeclineRequest}
            onSearchUsers={onSearchUsers}
            onViewUser={onViewUser}
            onSendRequest={onSendRequest}
            onRemoveFriend={onRemoveFriend}
          />
        ) : (
          <CollectionsTab
            collections={collections}
            onOpenCollection={onOpenCollection}
            onCreateCollection={onCreateCollection}
            onDeleteCollection={onDeleteCollection}
          />
        )}

        {statusMessage ? <p className="profile-note">{statusMessage}</p> : null}
        {!isFirebaseConfigured ? (
          <p className="profile-note">
            Firebase is not configured yet. Add your Firebase project credentials to the environment variables so your data can sync.
          </p>
        ) : null}
      </section>
    </main>
  )
}

/* ─── Profile Tab ─── */

type ProfileTabProps = {
  user: User
  profileName: string
  accentColor: AccentKey
  onProfileNameChange: (value: string) => void
  onAccentColorChange: (value: AccentKey) => void
  onSaveProfile: () => void
  onSignOut: () => void
}

function ProfileTab({
  user,
  profileName,
  accentColor,
  onProfileNameChange,
  onAccentColorChange,
  onSaveProfile,
  onSignOut,
}: ProfileTabProps) {
  return (
    <>
      <p className="profile-note">Signed in as {user.email ?? 'your Google account'}</p>
      <label className="profile-field" htmlFor="profile-name">
        <span>Nickname</span>
        <input
          id="profile-name"
          value={profileName}
          onChange={(event) => onProfileNameChange(event.target.value)}
          placeholder="Enter your nickname"
        />
      </label>
      <label className="profile-field">
        <span>Accent color</span>
        <div className="accent-picker">
          {ACCENT_COLORS.map((color) => (
            <button
              key={color.key}
              type="button"
              className={`accent-swatch ${accentColor === color.key ? 'is-active' : ''}`}
              style={{ backgroundColor: color.light }}
              onClick={() => onAccentColorChange(color.key)}
              aria-label={color.name}
              title={color.name}
            />
          ))}
        </div>
      </label>
      <div className="profile-actions">
        <button type="button" className="primary-button" onClick={onSaveProfile}>
          <span className="material-symbols-outlined">save</span>
          <span>Save profile</span>
        </button>
        <button type="button" className="secondary-button" onClick={onSignOut}>
          <span className="material-symbols-outlined">logout</span>
          <span>Sign out</span>
        </button>
      </div>
    </>
  )
}

/* ─── Friends Tab ─── */

type FriendsTabProps = {
  friendRequests: FriendRequestData[]
  friends: UserProfile[]
  friendUids: string[]
  currentUserUid: string
  onAcceptRequest: (fromUid: string, fromName: string) => void
  onDeclineRequest: (fromUid: string) => void
  onSearchUsers: (query: string) => Promise<UserProfile[]>
  onViewUser: (uid: string) => void
  onSendRequest: (toUid: string, toName: string) => void
  onRemoveFriend: (friendUid: string) => void
}

function FriendsTab({
  friendRequests,
  friends,
  friendUids,
  currentUserUid,
  onAcceptRequest,
  onDeclineRequest,
  onSearchUsers,
  onViewUser,
  onSendRequest,
  onRemoveFriend,
}: FriendsTabProps) {
  const [subtab, setSubtab] = useState<'friends' | 'requests' | 'find'>('friends')
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
    <>
      <div className="social-tabs">
        <button
          type="button"
          className={`social-tab ${subtab === 'friends' ? 'is-active' : ''}`}
          onClick={() => setSubtab('friends')}
        >
          Friends ({friends.length})
        </button>
        <button
          type="button"
          className={`social-tab ${subtab === 'requests' ? 'is-active' : ''}`}
          onClick={() => setSubtab('requests')}
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
          className={`social-tab ${subtab === 'find' ? 'is-active' : ''}`}
          onClick={() => setSubtab('find')}
        >
          Find users
        </button>
      </div>

      {subtab === 'friends' ? (
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

      {subtab === 'requests' ? (
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

      {subtab === 'find' ? (
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
    </>
  )
}

/* ─── Collections Tab ─── */

type CollectionsTabProps = {
  collections: Collection[]
  onOpenCollection: (id: string) => void
  onCreateCollection: (name: string, description: string) => void
  onDeleteCollection: (id: string) => void
}

function CollectionsTab({
  collections,
  onOpenCollection,
  onCreateCollection,
  onDeleteCollection,
}: CollectionsTabProps) {
  return (
    <>
      <form
        className="create-collection-form"
        onSubmit={(e) => {
          e.preventDefault()
          const form = e.currentTarget
          const nameInput = form.elements.namedItem('col-name') as HTMLInputElement
          const descInput = form.elements.namedItem('col-desc') as HTMLInputElement
          if (!nameInput.value.trim()) return
          onCreateCollection(nameInput.value.trim(), descInput.value.trim())
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
    </>
  )
}
