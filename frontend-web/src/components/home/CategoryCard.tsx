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
      className="group relative block overflow-hidden rounded-2xl bg-stone-200"
    >
      <img
        src={image}
        alt={title}
        className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-stone-900/85 via-stone-900/45 to-transparent px-5 pb-5 pt-14 text-white">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-1 text-xs text-stone-100">{description}</p>
      </div>
    </Link>
  )
}
