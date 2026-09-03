import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Box, Button, HStack, BoxProps } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { ROUTES } from '@/utils/routes'
import { ArrowLeft, ArrowRight, Home, Pause, Play } from 'lucide-react'
import { useControlsStore } from '@/store/controls'
import { useMainStore } from '@/store'

export interface NavigationControlsProps extends BoxProps {}

/**
 * @name NavigationControls
 *
 * @description
 * Control bar for navigating between Super/Omnidroid pages
 * with support for autoplay, pause, skip, and back.
 *
 * @example
 * ```tsx
 * <NavigationControls />
 * ```
 *
 * @author Giuseppe Del Campo
 */
const NavigationControls: React.FC<NavigationControlsProps> = (props) => {
  const router = useRouter()
  const { enableControls } = useControlsStore()
  const { encounterSet } = useMainStore()
  const navigationDelay = useMainStore((state) => state.universe.navigationDelay) ?? 1100

  const { entityA_slug, entityB_slug, autoplay } = router.query as {
    entityA_slug?: string
    entityB_slug?: string
    autoplay?: string
  }

  const [isPlaying, setIsPlaying] = useState<boolean>(autoplay !== '0')

  // Keep isPlaying synchronized if query updates after hydration
  useEffect(() => {
    if (router.isReady && typeof autoplay === 'string') {
      setIsPlaying(autoplay !== '0')
    }
  }, [router.isReady, autoplay])

  const encounters = useMemo(() => encounterSet?.encounters ?? [], [encounterSet])
  const totalEncounters = encounters.length

  const currentIndex = useMemo(() => {
    return encounters.findIndex(
      (e) => e.entityA_slug === entityA_slug && e.entityB_slug === entityB_slug
    )
  }, [encounters, entityA_slug, entityB_slug])

  const goBackToMenu = useCallback(() => {
    router.push(ROUTES.MENU)
  }, [router])

  const goToIndex = useCallback(
    (index: number, playState: boolean = isPlaying) => {
      if (index >= 0 && index < totalEncounters) {
        const next = encounters[index]
        router.push(
          `${ROUTES.ENCOUNTER}/${next.entityA_slug}/${next.entityB_slug}?autoplay=${playState ? 1 : 0}`
        )
      }
    },
    [router, isPlaying, encounters, totalEncounters]
  )

  const goNext = useCallback(() => {
    setIsPlaying(false)
    goToIndex(currentIndex + 1, false)
  }, [currentIndex, goToIndex])

  const goPrev = useCallback(() => {
    setIsPlaying(false)
    goToIndex(currentIndex - 1, false)
  }, [currentIndex, goToIndex])

  // Dedicated toggle handler to keep router state outside of the useState updater
  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => {
      const nextVal = !prev
      router.replace(
        {
          pathname: router.pathname,
          query: { ...router.query, autoplay: nextVal ? 1 : 0 },
        },
        undefined,
        { shallow: true }
      )
      return nextVal
    })
  }, [router])

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Don't intercept shortcuts if typing inside an input/textarea
      const target = e.target as HTMLElement | null
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return
      }

      if (e.key === 'Escape') {
        goBackToMenu()
      } else if (e.key === 'ArrowRight') {
        if (currentIndex < totalEncounters - 1) goNext()
      } else if (e.key === 'ArrowLeft') {
        if (currentIndex > 0) goPrev()
      } else if (e.key === ' ') {
        e.preventDefault()
        togglePlay()
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [currentIndex, totalEncounters, goNext, goPrev, goBackToMenu, togglePlay])

  // Navigation auto-play timer
  useEffect(() => {
    if (!isPlaying) return

    const timer = setTimeout(() => {
      if (currentIndex < totalEncounters - 1) {
        goToIndex(currentIndex + 1, true)
      } else {
        // Automatically halt playback when reaching the last encounter
        setIsPlaying(false)
      }
    }, navigationDelay)

    return () => clearTimeout(timer)
  }, [isPlaying, currentIndex, goToIndex, navigationDelay, totalEncounters])

  return (
    <Box
      position="fixed"
      bottom={enableControls ? '20px' : '-100px'}
      left="50%"
      transform="translateX(-50%)"
      zIndex={1000}
      bg="gray.700"
      color="white"
      px={4}
      py={2}
      rounded="full"
      shadow="md"
      fontFamily="sans-serif"
      transition="bottom 0.3s ease-in-out, opacity 0.3s ease-in-out"
      opacity={enableControls ? 1 : 0}
      pointerEvents={enableControls ? 'auto' : 'none'}
      aria-hidden={!enableControls}
      {...props}
    >
      <HStack gap={3}>
        {/* Back to menu */}
        <Button
          size="sm"
          onClick={goBackToMenu}
          colorScheme="gray"
          leftIcon={<Home size={16} />}
        >
          Menu
        </Button>

        {/* Pause / Resume */}
        <Button
          size="sm"
          onClick={togglePlay}
          colorScheme={isPlaying ? 'yellow' : 'green'}
          leftIcon={isPlaying ? <Pause size={16} /> : <Play size={16} />}
        >
          {isPlaying ? 'Pause' : 'Resume'}
        </Button>

        {/* Prev */}
        <Button
          size="sm"
          onClick={goPrev}
          isDisabled={currentIndex <= 0}
          colorScheme="gray"
          leftIcon={<ArrowLeft size={16} />}
        >
          Prev
        </Button>

        {/* Next */}
        <Button
          size="sm"
          onClick={goNext}
          isDisabled={currentIndex >= totalEncounters - 1}
          colorScheme="gray"
          rightIcon={<ArrowRight size={16} />}
        >
          Next
        </Button>
      </HStack>
    </Box>
  )
}

export default NavigationControls
