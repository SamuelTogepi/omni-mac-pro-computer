import React from 'react'
import { ImageProps, chakra, shouldForwardProp } from '@chakra-ui/react'
import { motion, isValidMotionProp } from 'framer-motion'

// Consistent Chakra UI + Framer Motion wrapper that prevents type conflicts with `transition`
const MotionImage = chakra(motion.img, {
  shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop),
})

export interface AnimatedImageProps
  extends Omit<ImageProps, 'transition' | 'initial' | 'animate'> {
  /**
   * Source URL of the image.
   */
  src: string

  /**
   * Alternative text for the image.
   * Used for accessibility and SEO.
   */
  alt: string

  /**
   * Optional width of the image (accepts numbers in px or CSS strings like "100%").
   */
  width?: string | number

  /**
   * Optional height of the image (accepts numbers in px or CSS strings like "auto").
   */
  height?: string | number

  /**
   * Duration of the invert filter animation in seconds.
   * @default 0.5
   */
  duration?: number
}

/**
 * @name AnimatedImage
 *
 * @description
 * A wrapper around an image component that uses Framer Motion and Chakra UI
 * to animate a smooth invert filter transition effect.
 *
 * On initial render (and when `src` changes), the image starts fully inverted (100%),
 * and then smoothly transitions to normal colors (0%) over the specified duration.
 *
 * @example
 * ```tsx
 * <AnimatedImage
 *   src="/images/hero.png"
 *   alt="Hero image"
 *   width={300}
 *   height={200}
 *   objectFit="cover"
 *   borderRadius="md"
 * />
 * ```
 *
 * @author
 * Giuseppe Del Campo
 */
const AnimatedImage: React.FC<AnimatedImageProps> = ({
  src,
  alt,
  width,
  height,
  duration = 0.5,
  ...props
}) => {
  return (
    <MotionImage
      key={`${src}-${alt}`}
      src={src}
      alt={alt}
      width={width}
      height={height}
      initial={{ filter: 'invert(100%)' }}
      animate={{ filter: 'invert(0%)' }}
      transition={{ duration, ease: 'easeOut' }}
      {...props}
    />
  )
}

export default AnimatedImage
