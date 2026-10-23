"use client"

/* eslint-disable @next/next/no-img-element */
import { useState } from "react"

export type GalleryImage = {
  src: string
  alt: string
  caption: string
  studio?: boolean
}

/** Main product image with captions and a row of thumbnails. */
export default function WorkstationGallery({
  images,
}: {
  images: GalleryImage[]
}) {
  const [active, setActive] = useState(0)

  if (!images.length) {
    return (
      <div className="sw-gallery-main sw-gallery-empty">
        <p>Product photography will be added here.</p>
      </div>
    )
  }

  const current = images[active]

  return (
    <div className="sw-gallery">
      <div className={`sw-gallery-main${current.studio ? " is-studio" : ""}`}>
        {images.map((image, i) => (
          <img
            key={image.src + i}
            src={image.src}
            alt={i === active ? image.alt : ""}
            aria-hidden={i !== active}
            className={`${image.studio ? "is-studio" : ""}${
              i === active ? " is-active" : ""
            }`}
            loading={i === 0 ? "eager" : "lazy"}
          />
        ))}
        <div className="sw-gallery-caption">
          <span>{current.caption}</span>
          <span>
            {String(active + 1).padStart(2, "0")} /{" "}
            {String(images.length).padStart(2, "0")}
          </span>
        </div>
      </div>
      {images.length > 1 && (
        <div className="sw-thumbs">
          {images.map((image, i) => (
            <button
              key={image.src + i}
              type="button"
              aria-label={`Show image ${i + 1}: ${image.caption}`}
              aria-pressed={i === active}
              onClick={() => setActive(i)}
            >
              <span className={image.studio ? "is-studio" : undefined}>
                <img src={image.src} alt="" loading="lazy" />
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
