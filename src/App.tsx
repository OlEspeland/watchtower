import './App.css';

import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { ACCENT_COLORS } from './colors';
import { TMDB_API_KEY } from './config';
import { auth, db, isFirebaseConfigured } from './firebase';
import DetailPage from './pages/DetailPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import SearchPage from './pages/SearchPage';
import { mapMovieResult, mapSeriesResult, TMDB_BASE_URL } from './utils/media';

import type { User } from 'firebase/auth';
import type { AccentKey } from './colors'
import type { EntryStatus, HomeFilter, MediaItem, SavedEntry, ViewMode, ScreenMode } from './types'
function App() {
  const [activeView, setActiveView] = useState<ViewMode>('movies')
  const [screen, setScreen] = useState<ScreenMode>('home')
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('watchtower-dark') === 'true')
  const [accentColor, setAccentColor] = useState<AccentKey>(() => {
    const saved = localStorage.getItem('watchtower-accent')
    if (saved && ACCENT_COLORS.some((c) => c.key === saved)) return saved as AccentKey
    return 'purple'
  })
  const [homeFilter, setHomeFilter] = useState<HomeFilter>('tracked')
  const [viewStyle, setViewStyle] = useState<'grid' | 'list'>('grid')
  const [profileName, setProfileName] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [statusMessage, setStatusMessage] = useState('')
  const [movies, setMovies] = useState<MediaItem[]>([])
  const [series, setSeries] = useState<MediaItem[]>([])
  const [moviesPage, setMoviesPage] = useState(1)
  const [seriesPage, setSeriesPage] = useState(1)
  const [hasMoreMovies, setHasMoreMovies] = useState(true)
  const [hasMoreSeries, setHasMoreSeries] = useState(true)
  const [searchPage, setSearchPage] = useState(1)
  const [hasMoreSearch, setHasMoreSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<MediaItem[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [entries, setEntries] = useState<Record<string, SavedEntry>>({})

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? 'dark' : 'light'
    document.documentElement.dataset.accent = accentColor
  }, [darkMode, accentColor])

  useEffect(() => {
    localStorage.setItem('watchtower-dark', String(darkMode))
  }, [darkMode])

  useEffect(() => {
    localStorage.setItem('watchtower-accent', accentColor)
  }, [accentColor])

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
        if (data.accent && ACCENT_COLORS.some((c) => c.key === data.accent)) {
          setAccentColor(data.accent)
          localStorage.setItem('watchtower-accent', data.accent)
        }
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
        setHasMoreMovies((moviesData.total_pages ?? 1) > 1)
        setHasMoreSeries((seriesData.total_pages ?? 1) > 1)
      } catch (error) {
        console.error(error)
      }
    }

    void loadDiscover()
  }, [])

  const handleLoadMoreDiscover = async (type: 'movie' | 'tv') => {
    if (!TMDB_API_KEY) return

    const page = type === 'movie' ? moviesPage + 1 : seriesPage + 1
    const endpoint = type === 'movie' ? 'movie' : 'tv'
    const mapper = type === 'movie' ? mapMovieResult : mapSeriesResult

    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/discover/${endpoint}?api_key=${TMDB_API_KEY}&language=en-US&sort_by=popularity.desc&page=${page}`
      )
      const data = await response.json()
      const items = (data.results ?? []).map(mapper)
      const update = type === 'movie' ? setMovies : setSeries
      const setPage = type === 'movie' ? setMoviesPage : setSeriesPage
      const setHasMore = type === 'movie' ? setHasMoreMovies : setHasMoreSeries
      update((prev) => [...prev, ...items])
      setPage(page)
      setHasMore((data.total_pages ?? 1) > page)
    } catch (error) {
      console.error(error)
    }
  }

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
          accent: accentColor,
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
    setDarkMode(false)
    setAccentColor('purple')
    localStorage.removeItem('watchtower-dark')
    localStorage.removeItem('watchtower-accent')
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
        releaseDate: data.release_date ?? data.first_air_date ?? undefined,
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
      const results = [
        ...(movieData.results ?? []).slice(0, 6).map(mapMovieResult),
        ...(seriesData.results ?? []).slice(0, 6).map(mapSeriesResult),
      ]
      setSearchResults(results)
      setSearchPage(1)
      setHasMoreSearch((movieData.total_pages ?? 1) > 1 || (seriesData.total_pages ?? 1) > 1)
      setScreen('search')
    } catch (error) {
      console.error(error)
      setSearchResults([])
    } finally {
      setSearchLoading(false)
    }
  }

  const handleLoadMoreSearch = async () => {
    if (!TMDB_API_KEY || !searchQuery.trim()) return

    const page = searchPage + 1
    setSearchLoading(true)

    try {
      const [movieResponse, seriesResponse] = await Promise.all([
        fetch(`${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&language=en-US&query=${encodeURIComponent(searchQuery)}&page=${page}`),
        fetch(`${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&language=en-US&query=${encodeURIComponent(searchQuery)}&page=${page}`),
      ])
      const [movieData, seriesData] = await Promise.all([movieResponse.json(), seriesResponse.json()])
      const results = [
        ...(movieData.results ?? []).slice(0, 6).map(mapMovieResult),
        ...(seriesData.results ?? []).slice(0, 6).map(mapSeriesResult),
      ]
      setSearchResults((prev) => [...prev, ...results])
      setSearchPage(page)
      setHasMoreSearch((movieData.total_pages ?? 1) > page || (seriesData.total_pages ?? 1) > page)
    } catch (error) {
      console.error(error)
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
      releaseDate: item.releaseDate,
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
            releaseDate: entry.releaseDate,
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
          accentColor={accentColor}
          statusMessage={statusMessage}
          isFirebaseConfigured={isFirebaseConfigured}
          onProfileNameChange={setProfileName}
          onAccentColorChange={setAccentColor}
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
          hasMoreSearch={hasMoreSearch}
          entries={entries}
          onSearchQueryChange={setSearchQuery}
          onSearch={handleSearch}
          onLoadMoreSearch={handleLoadMoreSearch}
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
          hasMoreMovies={hasMoreMovies}
          hasMoreSeries={hasMoreSeries}
          onLoadMoreDiscover={handleLoadMoreDiscover}
        />
      )}
    </div>
  )
}

export default App
