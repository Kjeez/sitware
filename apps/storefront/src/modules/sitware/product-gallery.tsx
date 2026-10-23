"use client"

import Image from "next/image"
import { useState } from "react"

export type GalleryImage = { id: string; url?: string; label: string; conceptClass?: string }

export default function ProductGallery({ images, title }: { images: GalleryImage[]; title: string }) {
  const [selectedId, setSelectedId] = useState(images[0]?.id)
  const selected = images.find((image) => image.id === selectedId) || images[0]
  return (
    <div className="pd-gallery">
      <div className="pd-main-image" aria-live="polite">
        {selected?.conceptClass ? <div className={"reference-photo pd-concept-photo " + selected.conceptClass} role="img" aria-label={selected.label} /> : selected?.url ? <Image src={selected.url} alt={title + " — " + selected.label} fill priority sizes="(max-width: 760px) 90vw, 600px" style={{ objectFit: "contain" }} /> : <p className="pd-no-image">Product photography will be added here.</p>}
      </div>
      {images.length > 1 && <div className="pd-thumbnails" aria-label="Product images">{images.map((image) => <button key={image.id} type="button" onClick={() => setSelectedId(image.id)} aria-label={"View " + image.label} aria-pressed={selected?.id === image.id} className={selected?.id === image.id ? "is-selected" : ""}>{image.conceptClass ? <div className={"reference-photo pd-concept-thumb " + image.conceptClass} /> : image.url ? <Image src={image.url} alt="" fill sizes="72px" style={{ objectFit: "contain" }} /> : null}</button>)}</div>}
      {selected && <p className="pd-image-label">{selected.label}</p>}
    </div>
  )
}
