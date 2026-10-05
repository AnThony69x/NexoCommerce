type SublimationOptionCardProps = {
  title: string
  description: string
}

export default function SublimationOptionCard({
  title,
  description,
}: SublimationOptionCardProps) {
  return (
    <article className="rounded-xl border border-stone-200 bg-white p-5">
      <h2 className="text-base font-semibold text-stone-800">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-stone-600">{description}</p>
    </article>
  )
}
