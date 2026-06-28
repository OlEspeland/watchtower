import { useEffect, useState } from 'react'
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithRedirect,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth'
import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore'
import './App.css'
import { TMDB_API_KEY } from './config'
import { auth, db, isFirebaseConfigured } from './firebase'

type ViewMode = 'movies' | 'series' | 'watchlist'
type ScreenMode = 'home' | 'search' | 'detail' | 'profile'
type MediaType = 'movie' | 'tv'
type EntryStatus = 'watchlist' | 'watched'

type MediaItem = {
  id: number
  mediaType: MediaType
  title: string
  year: string
  overview: string
  posterPath: string | null
  runtime?: string
  genres?: string[]
}

type SavedEntry = {
  mediaType: MediaType
  mediaId: number
  title: string
  year: string
  overview: string
  posterPath: string | null
  status: EntryStatus
  rating: number | null
}

const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'

type StarRatingProps = {
  value: number | null
  onChange: (value: number | null) => void
  label?: string
}

function StarRating({ value, onChange, label }: StarRatingProps) {
  return (
    <div className="rating-select">
      {label ? <span>{label}</span> : null}
      <div className="star-rating" role="radiogroup" aria-label="Rating">
        {Array.from({ length: 5 }, (_, index) => {
          const starValue = index + 1
          const isFilled = value !== null && value >= starValue
          const isHalf = value !== null && value >= index + 0.5 && value < starValue

          return (
            <div key={starValue} className="star-shell">
              <button
                type="button"
                className="star-half-button star-half-button--left"
                aria-label={`Set rating ${index + 0.5}`}
                onClick={() => onChange(index + 0.5)}
              />
              <button
                type="button"
                className="star-half-button star-half-button--right"
                aria-label={`Set rating ${starValue}`}
                onClick={() => onChange(starValue)}
              />
              <span className={`material-symbols-outlined star-icon ${isFilled ? 'is-filled' : ''} ${isHalf ? 'is-half' : ''}`}>
                star
              </span>
            </div>
          )
        })}
        <button type="button" className="clear-rating" onClick={() => onChange(null)}>
          Clear
        </button>
      </div>
    </div>
  )
}

function getPosterUrl(posterPath: string | null) {
  return posterPath ? `${TMDB_IMAGE_BASE_URL}${posterPath}` : ''
}

function App() {
  const [activeView, setActiveView] = useState<ViewMode>('movies')
  const [screen, setScreen] = useState<ScreenMode>('home')
  const [darkMode, setDarkMode] = useState(false)
  const [profileName, setProfileName] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [statusMessage, setStatusMessage] = useState('')
  const [movies, setMovies] = useState<MediaItem[]>([])
  const [series, setSeries] = useState<MediaItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<MediaItem[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [entries, setEntries] = useState<Record<string, SavedEntry>>({})

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? 'dark' : 'light'
  }, [darkMode])

  useEffect(() => {
    if (!auth) {
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)

      if (!currentUser || !db) {
        return
      }

      const profileRef = doc(db, 'users', currentUser.uid)
      const profileSnap = await getDoc(profileRef)

      if (profileSnap.exists()) {
        const data = profileSnap.data()
        setProfileName(data.name ?? '')
      } else {
        setProfileName('')
      }

      const entriesRef = collection(db, 'users', currentUser.uid, 'entries')
      const snapshot = await getDocs(entriesRef)
      const nextEntries: Record<string, SavedEntry> = {}

      snapshot.forEach((entryDoc) => {
        const data = entryDoc.data() as SavedEntry
        nextEntries[entryDoc.id] = data
      })

      setEntries(nextEntries)
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const loadDiscover = async () => {
      if (!TMDB_API_KEY) {
        return
      }

      try {
        const [moviesResponse, seriesResponse] = await Promise.all([
          fetch(`${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=en-US&sort_by=popularity.desc&page=1`),
          fetch(`${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&language=en-US&sort_by=popularity.desc&page=1`),
        ])

        const [moviesData, seriesData] = await Promise.all([moviesResponse.json(), seriesResponse.json()])
        setMovies((moviesData.results ?? []).slice(0, 8).map(mapMovieResult))
        setSeries((seriesData.results ?? []).slice(0, 8).map(mapSeriesResult))
      } catch (error) {
        console.error(error)
      }
    }

    void loadDiscover()
  }, [])

  const handleSaveProfile = async () => {
    if (!user || !db) {
      setStatusMessage('Please sign in first.')
      return
    }

    try {
      const profileRef = doc(db, 'users', user.uid)
      await setDoc(profileRef, {
        uid: user.uid,
        name: profileName,
        updatedAt: new Date().toISOString(),
      }, { merge: true })
      setStatusMessage('Profile saved to Firebase.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setStatusMessage(`Unable to save profile right now. ${message}`)
      console.error(error)
    }
  }

  const handleGoogleSignIn = async () => {
    if (!auth) {
      setStatusMessage('Firebase is not configured yet.')
      return
    }

    try {
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({ prompt: 'select_account' })
      await signInWithRedirect(auth, provider)
      setStatusMessage('Redirecting to Google sign-in…')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setStatusMessage(`Google sign-in failed. ${message}`)
      console.error(error)
    }
  }

  const handleSignOut = async () => {
    if (!auth) {
      return
    }

    await firebaseSignOut(auth)
    setProfileName('')
    setEntries({})
    setStatusMessage('Signed out.')
  }

  const handleOpenDetail = async (item: MediaItem) => {
    setScreen('detail')
    setSelectedItem(item)
    setDetailLoading(true)

    if (!TMDB_API_KEY) {
      setDetailLoading(false)
      return
    }

    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/${item.mediaType === 'movie' ? 'movie' : 'tv'}/${item.id}?api_key=${TMDB_API_KEY}&language=en-US`
      )
      const data = await response.json()
      setSelectedItem({
        ...item,
        title: data.title ?? data.name ?? item.title,
        overview: data.overview ?? item.overview,
        year: data.release_date?.slice(0, 4) ?? data.first_air_date?.slice(0, 4) ?? item.year,
        posterPath: data.poster_path ?? item.posterPath,
        runtime: item.mediaType === 'movie' ? `${data.runtime ?? 0} min` : `${data.episode_run_time?.[0] ?? 0} min/ep`,
        genres: data.genres?.slice(0, 3).map((genre: { name: string }) => genre.name) ?? [],
      })
    } catch (error) {
      console.error(error)
    } finally {
      setDetailLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!TMDB_API_KEY || !searchQuery.trim()) {
      setSearchResults([])
      return
    }

    setSearchLoading(true)

    try {
      const [movieResponse, seriesResponse] = await Promise.all([
        fetch(`${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&language=en-US&query=${encodeURIComponent(searchQuery)}&page=1`),
        fetch(`${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&language=en-US&query=${encodeURIComponent(searchQuery)}&page=1`),
      ])

      const [movieData, seriesData] = await Promise.all([movieResponse.json(), seriesResponse.json()])
      const combined = [
        ...(movieData.results ?? []).slice(0, 6).map(mapMovieResult),
        ...(seriesData.results ?? []).slice(0, 6).map(mapSeriesResult),
      ]
      setSearchResults(combined)
      setScreen('search')
    } catch (error) {
      console.error(error)
      setSearchResults([])
    } finally {
      setSearchLoading(false)
    }
  }

  const handleSaveEntry = async (item: MediaItem, status: EntryStatus, rating: number | null = null) => {
    if (!user || !db) {
      setStatusMessage('Please sign in to save movies and shows.')
      return
    }

    const entryKey = `${item.mediaType}:${item.id}`
    const nextEntry: SavedEntry = {
      mediaType: item.mediaType,
      mediaId: item.id,
      title: item.title,
      year: item.year,
      overview: item.overview,
      posterPath: item.posterPath,
      status,
      rating,
    }

    try {
      await setDoc(doc(db, 'users', user.uid, 'entries', entryKey), nextEntry, { merge: true })
      setEntries((current) => ({ ...current, [entryKey]: nextEntry }))
      setStatusMessage(`Saved to ${status === 'watched' ? 'watched list' : 'watchlist'}.`)
    } catch (error) {
      console.error(error)
      setStatusMessage('Unable to save this title right now.')
    }
  }

  const visibleItems: MediaItem[] =
    activeView === 'movies'
      ? movies
      : activeView === 'series'
        ? series
        : Object.values(entries)
            .filter((entry) => entry.status === 'watchlist' || entry.status === 'watched')
            .map((entry) => ({
              id: entry.mediaId,
              mediaType: entry.mediaType,
              title: entry.title,
              year: entry.year,
              overview: entry.overview,
              posterPath: entry.posterPath,
            }))

  return (
    <div className="app-shell">
      <header className="app-shell__header">
        <div className="brand-block">
          <div className="brand-mark">W</div>
          <div>
            <p className="brand-label">Watchtower</p>
            <h1>Movie & TV Tracker</h1>
          </div>
        </div>

        <nav className="nav-pill" aria-label="Primary navigation">
          <button
            type="button"
            className={activeView === 'movies' ? 'is-active' : ''}
            onClick={() => {
              setActiveView('movies')
              setScreen('home')
            }}
          >
            Movies
          </button>
          <button
            type="button"
            className={activeView === 'series' ? 'is-active' : ''}
            onClick={() => {
              setActiveView('series')
              setScreen('home')
            }}
          >
            TV Shows
          </button>
          <button
            type="button"
            className={activeView === 'watchlist' ? 'is-active' : ''}
            onClick={() => {
              setActiveView('watchlist')
              setScreen('home')
            }}
          >
            Watchlist
          </button>
        </nav>

        <div className="header-actions">
          <button
            type="button"
            className="icon-button"
            onClick={() => setDarkMode((value) => !value)}
            aria-label="Toggle theme"
          >
            <span className="material-symbols-outlined">{darkMode ? 'light_mode' : 'dark_mode'}</span>
          </button>
          <button type="button" className="icon-button" onClick={() => setScreen('search')} aria-label="Search">
            <span className="material-symbols-outlined">search</span>
          </button>
          <button
            type="button"
            className="icon-button"
            onClick={() => setScreen(screen === 'profile' ? 'home' : 'profile')}
            aria-label="Open profile"
          >
            <span className="material-symbols-outlined">person</span>
          </button>
        </div>
      </header>

      {screen === 'profile' ? (
        <main className="app-shell__main single">
          <section className="main-card profile-card">
            <div className="card-heading">
              <div>
                <p className="eyebrow">Profile</p>
                <h2>{user ? (profileName ? `Welcome, ${profileName}` : 'Set your nickname') : 'Sign in to sync your account'}</h2>
              </div>
              <button type="button" className="secondary-button" onClick={() => setScreen('home')}>
                <span className="material-symbols-outlined">arrow_back</span>
                <span>Back to app</span>
              </button>
            </div>

            {!user ? (
              <div className="auth-form">
                <p className="profile-note">
                  Watchtower uses Google sign-in so your profile, watchlist, and ratings can sync to Firebase.
                </p>

                <button type="button" className="primary-button" onClick={handleGoogleSignIn}>
                  <span className="material-symbols-outlined">login</span>
                  <span>Continue with Google</span>
                </button>
              </div>
            ) : (
              <>
                {user ? <p className="profile-note">Signed in as {user.email ?? 'your Google account'}</p> : null}

                <label className="profile-field" htmlFor="profile-name">
                  <span>Nickname</span>
                  <input
                    id="profile-name"
                    value={profileName}
                    onChange={(event) => setProfileName(event.target.value)}
                    placeholder="Enter your nickname"
                  />
                </label>

                <div className="profile-actions">
                  <button type="button" className="primary-button" onClick={handleSaveProfile}>
                    <span className="material-symbols-outlined">save</span>
                    <span>Save profile</span>
                  </button>
                  <button type="button" className="secondary-button" onClick={handleSignOut}>
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
      ) : screen === 'search' ? (
        <main className="app-shell__main single">
          <section className="main-card">
            <div className="card-heading">
              <div>
                <p className="eyebrow">Search</p>
                <h2>Find movies and TV shows</h2>
              </div>
              <button type="button" className="secondary-button" onClick={() => setScreen('home')}>
                <span className="material-symbols-outlined">arrow_back</span>
                <span>Back home</span>
              </button>
            </div>

            <div className="search-bar">
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    void handleSearch()
                  }
                }}
                placeholder="Search for a title"
              />
              <button type="button" className="primary-button" onClick={() => void handleSearch()}>
                <span className="material-symbols-outlined">search</span>
                <span>Search</span>
              </button>
            </div>

            {searchLoading ? <p className="profile-note">Searching TMDB…</p> : null}

            {!searchLoading && searchResults.length === 0 && searchQuery ? (
              <p className="profile-note">No results yet. Try another title.</p>
            ) : null}

            <div className="content-grid">
              {searchResults.map((item) => {
                const entry = entries[`${item.mediaType}:${item.id}`]
                return (
                  <article key={`${item.mediaType}-${item.id}`} className="media-card">
                    <button type="button" className="media-title-button" onClick={() => void handleOpenDetail(item)}>
                      <div className="media-poster-shell">
                        {item.posterPath ? <img className="media-poster" src={getPosterUrl(item.posterPath)} alt={item.title} /> : <div className="media-poster-fallback"><span className="material-symbols-outlined">movie</span></div>}
                        <div className="media-poster-badge">{item.mediaType === 'movie' ? 'Movie' : 'TV'}</div>
                      </div>
                      <div className="media-card-copy">
                        <p className="media-year">{item.year}</p>
                        <h3>{item.title}</h3>
                      </div>
                    </button>
                    <div className="media-card-footer">
                      <p className="media-rating">
                        <span className="material-symbols-outlined">star</span>
                        <span>{entry?.rating ? `${entry.rating.toFixed(1)}/5` : 'Unrated'}</span>
                      </p>
                      <p className="media-status">{entry?.status === 'watched' ? 'Watched' : entry?.status === 'watchlist' ? 'In watchlist' : 'Not saved'}</p>
                    </div>
                    <div className="card-actions">
                      <button
                        type="button"
                        className={`icon-only-action ${entry?.status === 'watchlist' ? 'is-active' : ''}`}
                        onClick={() => void handleSaveEntry(item, 'watchlist')}
                        title={entry?.status === 'watchlist' ? 'Already in watchlist' : 'Add to watchlist'}
                        aria-label={entry?.status === 'watchlist' ? 'Already in watchlist' : 'Add to watchlist'}
                      >
                        <span className="material-symbols-outlined">{entry?.status === 'watchlist' ? 'bookmark_added' : 'bookmark_add'}</span>
                      </button>
                      <button
                        type="button"
                        className={`icon-only-action ${entry?.status === 'watched' ? 'is-active' : ''}`}
                        onClick={() => void handleSaveEntry(item, 'watched')}
                        title={entry?.status === 'watched' ? 'Already marked watched' : 'Mark watched'}
                        aria-label={entry?.status === 'watched' ? 'Already marked watched' : 'Mark watched'}
                      >
                        <span className="material-symbols-outlined">{entry?.status === 'watched' ? 'check_circle' : 'check_circle_outline'}</span>
                      </button>
                    </div>
                    <StarRating
                      value={entry?.rating ?? null}
                      onChange={(rating) => void handleSaveEntry(item, entry?.status ?? 'watched', rating)}
                    />
                  </article>
                )
              })}
            </div>
          </section>
        </main>
      ) : screen === 'detail' && selectedItem ? (
        <main className="app-shell__main single">
          <section className="main-card detail-card">
            <div className="card-heading">
              <div>
                <p className="eyebrow">Details</p>
                <h2>{selectedItem.title}</h2>
              </div>
              <button type="button" className="secondary-button" onClick={() => setScreen('home')}>
                Back to list
              </button>
            </div>

            {detailLoading ? <p className="profile-note">Loading details…</p> : null}

            <div className="detail-body">
              <div className="detail-hero">
                <div className="detail-poster">
                  {selectedItem.posterPath ? <img className="media-poster" src={getPosterUrl(selectedItem.posterPath)} alt={selectedItem.title} /> : <div className="media-poster-fallback"><span className="material-symbols-outlined">movie</span></div>}
                </div>
                <div className="detail-copy">
                  <p className="detail-meta">{selectedItem.year} • {selectedItem.runtime ?? 'Details loading'}</p>
                  <p>{selectedItem.overview || 'No synopsis available yet.'}</p>
                  {selectedItem.genres?.length ? <p className="detail-genres">{selectedItem.genres.join(' • ')}</p> : null}
                  <div className="card-actions">
                    <button
                      type="button"
                      className={`icon-only-action ${entries[`${selectedItem.mediaType}:${selectedItem.id}`]?.status === 'watchlist' ? 'is-active' : ''}`}
                      onClick={() => void handleSaveEntry(selectedItem, 'watchlist')}
                      title={entries[`${selectedItem.mediaType}:${selectedItem.id}`]?.status === 'watchlist' ? 'Already in watchlist' : 'Add to watchlist'}
                      aria-label={entries[`${selectedItem.mediaType}:${selectedItem.id}`]?.status === 'watchlist' ? 'Already in watchlist' : 'Add to watchlist'}
                    >
                      <span className="material-symbols-outlined">{entries[`${selectedItem.mediaType}:${selectedItem.id}`]?.status === 'watchlist' ? 'bookmark_added' : 'bookmark_add'}</span>
                    </button>
                    <button
                      type="button"
                      className={`icon-only-action ${entries[`${selectedItem.mediaType}:${selectedItem.id}`]?.status === 'watched' ? 'is-active' : ''}`}
                      onClick={() => void handleSaveEntry(selectedItem, 'watched')}
                      title={entries[`${selectedItem.mediaType}:${selectedItem.id}`]?.status === 'watched' ? 'Already marked watched' : 'Mark watched'}
                      aria-label={entries[`${selectedItem.mediaType}:${selectedItem.id}`]?.status === 'watched' ? 'Already marked watched' : 'Mark watched'}
                    >
                      <span className="material-symbols-outlined">{entries[`${selectedItem.mediaType}:${selectedItem.id}`]?.status === 'watched' ? 'check_circle' : 'check_circle_outline'}</span>
                    </button>
                  </div>
                  <StarRating
                    label="Your rating"
                    value={entries[`${selectedItem.mediaType}:${selectedItem.id}`]?.rating ?? null}
                    onChange={(rating) => void handleSaveEntry(selectedItem, entries[`${selectedItem.mediaType}:${selectedItem.id}`]?.status ?? 'watched', rating)}
                  />
                </div>
              </div>
            </div>
          </section>
        </main>
      ) : (
        <main className="app-shell__main">
          <section className="main-card">
            <div className="card-heading">
              <div>
                <p className="eyebrow">Now browsing</p>
                <h2>{activeView === 'movies' ? 'Movies' : activeView === 'series' ? 'TV Shows' : 'Watchlist'}</h2>
              </div>
              <span className="status-pill">TMDB ready: {TMDB_API_KEY ? 'yes' : 'no'}</span>
            </div>

            <div className="content-grid">
              {visibleItems.map((item) => {
                const entry = entries[`${item.mediaType}:${item.id}`]
                return (
                  <article key={`${item.mediaType}-${item.id}`} className="media-card">
                    <button type="button" className="media-title-button" onClick={() => void handleOpenDetail(item)}>
                      <div className="media-poster-shell">
                        {item.posterPath ? <img className="media-poster" src={getPosterUrl(item.posterPath)} alt={item.title} /> : <div className="media-poster-fallback"><span className="material-symbols-outlined">movie</span></div>}
                        <div className="media-poster-badge">{item.mediaType === 'movie' ? 'Movie' : 'TV'}</div>
                      </div>
                      <div className="media-card-copy">
                        <p className="media-year">{item.year}</p>
                        <h3>{item.title}</h3>
                      </div>
                    </button>
                    <div className="media-card-footer">
                      <p className="media-rating">
                        <span className="material-symbols-outlined">star</span>
                        <span>{entry?.rating ? `${entry.rating.toFixed(1)}/5` : 'Unrated'}</span>
                      </p>
                      <p className="media-status">{entry?.status === 'watched' ? 'Watched' : entry?.status === 'watchlist' ? 'In watchlist' : 'Not saved'}</p>
                    </div>
                    <div className="card-actions">
                      <button
                        type="button"
                        className={`icon-only-action ${entry?.status === 'watchlist' ? 'is-active' : ''}`}
                        onClick={() => void handleSaveEntry(item, 'watchlist')}
                        title={entry?.status === 'watchlist' ? 'Already in watchlist' : 'Add to watchlist'}
                        aria-label={entry?.status === 'watchlist' ? 'Already in watchlist' : 'Add to watchlist'}
                      >
                        <span className="material-symbols-outlined">{entry?.status === 'watchlist' ? 'bookmark_added' : 'bookmark_add'}</span>
                      </button>
                      <button
                        type="button"
                        className={`icon-only-action ${entry?.status === 'watched' ? 'is-active' : ''}`}
                        onClick={() => void handleSaveEntry(item, 'watched')}
                        title={entry?.status === 'watched' ? 'Already marked watched' : 'Mark watched'}
                        aria-label={entry?.status === 'watched' ? 'Already marked watched' : 'Mark watched'}
                      >
                        <span className="material-symbols-outlined">{entry?.status === 'watched' ? 'check_circle' : 'check_circle_outline'}</span>
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>

          <aside className="side-card">
            <div className="card-heading compact">
              <div>
                <p className="eyebrow">Overview</p>
                <h2>What’s next?</h2>
              </div>
            </div>
            <ul className="overview-list">
              <li>
                <strong>Tracked</strong>
                <span>{Object.keys(entries).length} titles</span>
              </li>
              <li>
                <strong>Rated</strong>
                <span>{Object.values(entries).filter((entry) => entry.rating).length} favorites</span>
              </li>
              <li>
                <strong>Pending</strong>
                <span>{Object.values(entries).filter((entry) => entry.status === 'watchlist').length} planned</span>
              </li>
            </ul>
          </aside>
        </main>
      )}
    </div>
  )
}

function mapMovieResult(result: any): MediaItem {
  return {
    id: result.id,
    mediaType: 'movie',
    title: result.title ?? 'Untitled movie',
    year: result.release_date?.slice(0, 4) ?? '',
    overview: result.overview ?? '',
    posterPath: result.poster_path ?? null,
  }
}

function mapSeriesResult(result: any): MediaItem {
  return {
    id: result.id,
    mediaType: 'tv',
    title: result.name ?? 'Untitled show',
    year: result.first_air_date?.slice(0, 4) ?? '',
    overview: result.overview ?? '',
    posterPath: result.poster_path ?? null,
  }
}

export default App
