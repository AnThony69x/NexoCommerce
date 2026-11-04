import { Link } from 'react-router-dom'

type CategoryCardProps = {
  title: string
  description: string
  image: string
  href: string
}

export default function CategoryCard({
  title,
  description,
  image,
  href,
}: CategoryCardProps) {
  return (
    <Link
      to={href}
      className="group relative block overflow-hidden rounded-3xl bg-stone-200"
    >
      <img
        src={image}
        alt={title}
        className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brown/90 via-brown/50 to-transparent px-5 pb-5 pt-16 text-white">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h3 className="font-display text-xl font-semibold">{title}</h3>
            {description && (
              <p className="mt-1 text-xs leading-5 text-white/80">
                {description}
              </p>
            )}
          </div>
          <span
            aria-hidden="true"
            className="mb-1 text-lg transition-transform duration-300 group-hover:translate-x-1"
          >
            →
          </span>
        </div>
      </div>
    </Link>
  )
}
