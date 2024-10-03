'use client'
import { useState } from 'react'

import Image from 'next/image'

type ImageWithMultipleFallbacksProps = {
  sources: string[]
  alt: string
  width?: number
  height?: number
  customClassName?: string
}

const ImageWithMultipleFallbacks = ({
  sources,
  alt,
  width,
  height,
  customClassName,
}: ImageWithMultipleFallbacksProps) => {
  const [currentSrcIndex, setCurrentSrcIndex] = useState(0)

  const handleError = () => {
    if (currentSrcIndex < sources.length - 1) {
      setCurrentSrcIndex(currentSrcIndex + 1)
    }
  }

  return (
    <Image
      src={sources[currentSrcIndex]}
      alt={alt}
      onError={handleError}
      className={customClassName}
      width={width ?? 250}
      height={height ?? 150}
    />
  )
}

export default ImageWithMultipleFallbacks
