export type ViewMode = 'movies' | 'series' | 'watchlist'
export type ScreenMode = 'home' | 'search' | 'detail' | 'profile'
export type MediaType = 'movie' | 'tv'
export type EntryStatus = 'watchlist' | 'watched'
export type HomeFilter = 'tracked' | 'rated' | 'pending'

export type MediaItem = {
  id: number
  mediaType: MediaType
  title: string
  year: string
  overview: string
  posterPath: string | null
  runtime?: string
  genres?: string[]
  releaseDate?: string
}

export type SavedEntry = {
  mediaType: MediaType
  mediaId: number
  title: string
  year: string
  overview: string
  posterPath: string | null
  status: EntryStatus
  rating: number | null
  releaseDate?: string
}
