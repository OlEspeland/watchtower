import type { User } from 'firebase/auth'
import { ACCENT_COLORS } from '../colors'
import CardHeading from '../components/CardHeading'

import type { AccentKey } from '../colors'

type ProfilePageProps = {
  user: User | null
  profileName: string
  accentColor: AccentKey
  statusMessage: string
  isFirebaseConfigured: boolean
  onProfileNameChange: (value: string) => void
  onAccentColorChange: (value: AccentKey) => void
  onSaveProfile: () => void
  onSignOut: () => void
  onGoogleSignIn: () => void
  onBack: () => void
}

export default function ProfilePage({
  user,
  profileName,
  accentColor,
  statusMessage,
  isFirebaseConfigured,
  onProfileNameChange,
  onAccentColorChange,
  onSaveProfile,
  onSignOut,
  onGoogleSignIn,
  onBack,
}: ProfilePageProps) {
  return (
    <main className="app-shell__main single">
      <section className="main-card profile-card">
        <CardHeading
          eyebrow="Profile"
          title={user ? (profileName ? `Welcome, ${profileName}` : 'Set your nickname') : 'Sign in to sync your account'}
          onBack={onBack}
          backLabel="Back to app"
        />

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
        ) : (
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
