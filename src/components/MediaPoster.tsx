import type { MediaType } from '../types'
import { getPosterUrl } from '../utils/media'

type MediaPosterProps = {
  posterPath: string | null
  title: string
  mediaType: MediaType
}

export default function MediaPoster({ posterPath, title, mediaType }: MediaPosterProps) {
  return (
    <div className="media-poster-shell">
      {posterPath ? (
        <img className="media-poster" src={getPosterUrl(posterPath)} alt={title} />
      ) : (
        <div className="media-poster-fallback">
          <span className="material-symbols-outlined">movie</span>
        </div>
      )}
      <div className="media-poster-badge">{mediaType === 'movie' ? 'Movie' : 'TV'}</div>
    </div>
  )
}
