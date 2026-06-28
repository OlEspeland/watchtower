import type { ReactNode } from 'react'

type CardHeadingProps = {
  eyebrow: string
  title: string
  onBack?: () => void
  backLabel?: string
  children?: ReactNode
}

export default function CardHeading({ eyebrow, title, onBack, backLabel = 'Back', children }: CardHeadingProps) {
  return (
    <div className="card-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      {children ?? (onBack ? (
        <button type="button" className="secondary-button" onClick={onBack}>
          <span className="material-symbols-outlined">arrow_back</span>
          <span>{backLabel}</span>
        </button>
      ) : null)}
    </div>
  )
}
