import { useState } from 'react'

type ProductImage = {
  src: string
  alt: string
}

type ProductGalleryProps = {
  images: ProductImage[]
}

export default function ProductGallery({ images }: ProductGalleryProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const activeImage = images[activeImageIndex]

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
        <img
          src={activeImage.src}
          alt={activeImage.alt}
          className="aspect-square w-full object-cover"
        />
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {images.map((image, index) => (
          <button
            key={image.src}
            type="button"
            onClick={() => setActiveImageIndex(index)}
            aria-label={`Ver ${image.alt}`}
            className={`overflow-hidden rounded-lg border-2 bg-white focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2 ${
              index === activeImageIndex
                ? 'border-stone-800'
                : 'border-stone-200'
            }`}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="aspect-square w-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  )
}
