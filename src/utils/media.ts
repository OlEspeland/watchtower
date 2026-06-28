import type { MediaItem } from '../types'

export const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'

export function getPosterUrl(posterPath: string | null) {
  return posterPath ? `${TMDB_IMAGE_BASE_URL}${posterPath}` : ''
}

export function mapMovieResult(result: any): MediaItem {
  return {
    id: result.id,
    mediaType: 'movie',
    title: result.title ?? 'Untitled movie',
    year: result.release_date?.slice(0, 4) ?? '',
    overview: result.overview ?? '',
    posterPath: result.poster_path ?? null,
    releaseDate: result.release_date ?? undefined,
  }
}

export function mapSeriesResult(result: any): MediaItem {
  return {
    id: result.id,
    mediaType: 'tv',
    title: result.name ?? 'Untitled show',
    year: result.first_air_date?.slice(0, 4) ?? '',
    overview: result.overview ?? '',
    posterPath: result.poster_path ?? null,
    releaseDate: result.first_air_date ?? undefined,
  }
}
