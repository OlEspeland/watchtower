import './App.css';

import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { TMDB_API_KEY } from './config';
import { auth, db, isFirebaseConfigured } from './firebase';
import DetailPage from './pages/DetailPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import SearchPage from './pages/SearchPage';
import { mapMovieResult, mapSeriesResult, TMDB_BASE_URL } from './utils/media';

import type { User } from 'firebase/auth';
import type { EntryStatus, HomeFilter, MediaItem, SavedEntry, ViewMode, ScreenMode } from './types'
function App() {
  const [activeView, setActiveView] = useState<ViewMode>('movies')
  const [screen, setScreen] = useState<ScreenMode>('home')
  const [darkMode, setDarkMode] = useState(false)
  const [homeFilter, setHomeFilter] = useState<HomeFilter>('tracked')
  const [viewStyle, setViewStyle] = useState<'grid' | 'list'>('grid')
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
      await setDoc(
        profileRef,
        {
          uid: user.uid,
          name: profileName,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      )
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
      setStatusMessage('Opening Google sign-in…')
      await signInWithPopup(auth, provider)
      setStatusMessage('Signed in successfully.')
    } catch (error) {
      if (error instanceof Error && 'code' in error && (error as { code?: string }).code === 'auth/popup-closed-by-user') {
        setStatusMessage('Sign-in was cancelled.')
      } else {
        const message = error instanceof Error ? error.message : 'Unknown error'
        setStatusMessage(`Google sign-in failed. ${message}`)
      }
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
    const existingEntry = entries[entryKey]
    const nextEntry: SavedEntry = {
      mediaType: item.mediaType,
      mediaId: item.id,
      title: item.title,
      year: item.year,
      overview: item.overview,
      posterPath: item.posterPath,
      status,
      rating: rating === null ? existingEntry?.rating ?? null : rating,
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

  const watchlistEntries = Object.values(entries).filter((entry) => entry.status === 'watchlist')
  const ratedEntries = Object.values(entries).filter((entry) => entry.rating)
  const trackedEntries = Object.values(entries)

  const filteredWatchlistItems = homeFilter === 'tracked'
    ? trackedEntries
    : homeFilter === 'rated'
      ? ratedEntries
      : homeFilter === 'pending'
        ? watchlistEntries
        : trackedEntries

  const visibleItems: MediaItem[] =
    activeView === 'movies'
      ? movies
      : activeView === 'series'
        ? series
        : filteredWatchlistItems.map((entry) => ({
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
        <ProfilePage
          user={user}
          profileName={profileName}
          statusMessage={statusMessage}
          isFirebaseConfigured={isFirebaseConfigured}
          onProfileNameChange={setProfileName}
          onSaveProfile={handleSaveProfile}
          onSignOut={handleSignOut}
          onGoogleSignIn={handleGoogleSignIn}
          onBack={() => setScreen('home')}
        />
      ) : screen === 'search' ? (
        <SearchPage
          searchQuery={searchQuery}
          searchLoading={searchLoading}
          searchResults={searchResults}
          entries={entries}
          onSearchQueryChange={setSearchQuery}
          onSearch={handleSearch}
          onOpenDetail={handleOpenDetail}
          onSaveEntry={handleSaveEntry}
          onBack={() => setScreen('home')}
        />
      ) : screen === 'detail' && selectedItem ? (
        <DetailPage
          selectedItem={selectedItem}
          detailLoading={detailLoading}
          entries={entries}
          onBack={() => setScreen('home')}
          onSaveEntry={handleSaveEntry}
          onChangeRating={(item, rating) => handleSaveEntry(item, entries[`${item.mediaType}:${item.id}`]?.status ?? 'watched', rating)}
        />
      ) : (
        <HomePage
          activeView={activeView}
          visibleItems={visibleItems}
          entries={entries}
          onOpenDetail={handleOpenDetail}
          onSaveEntry={(item, status) => handleSaveEntry(item, status)}
          homeFilter={homeFilter}
          onFilterChange={setHomeFilter}
          viewStyle={viewStyle}
          onViewStyleChange={setViewStyle}
        />
      )}
    </div>
  )
}

export default App
