type BakeryCategoryCardProps = {
  title: string
  description: string
}

export default function BakeryCategoryCard({
  title,
  description,
}: BakeryCategoryCardProps) {
  return (
    <article className="rounded-xl border border-stone-200 bg-white p-5">
      <h3 className="text-base font-semibold text-stone-800">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-stone-600">{description}</p>
    </article>
  )
}
