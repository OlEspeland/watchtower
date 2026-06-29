export type ViewMode = 'movies' | 'series' | 'watchlist'
export type ScreenMode = 'home' | 'search' | 'detail' | 'profile' | 'social' | 'userDetail'
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
  rating?: number | null
  releaseDate?: string
}

export type Review = {
  mediaType: MediaType
  mediaId: number
  title: string
  year: string
  overview: string
  posterPath: string | null
  releaseDate?: string
  rating: number
  comment: string
  createdAt: string
}

export type FriendRequestData = {
  fromUid: string
  fromName: string
  sentAt: string
}

export type UserProfile = {
  uid: string
  name: string
  accent: string
}
