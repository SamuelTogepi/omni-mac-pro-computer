import React, { useCallback, useEffect, useRef, useState } from 'react'
import { RotateSmartphoneIcon } from '@/assets/icons'
import {
  Box,
  IconButton,
  Text,
  VStack,
  BoxProps,
  chakra,
  shouldForwardProp,
} from '@chakra-ui/react'
import { AnimatePresence, motion, isValidMotionProp } from 'framer-motion'
import { X } from 'lucide-react'

// Consistent Chakra UI + Framer Motion wrapper
const MotionBox = chakra(motion.div, {
  shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop),
})

export interface PortraitOrientationOverlayProps extends Omit<BoxProps, 'children'> {
  /** Visibility status (true when device is in portrait orientation). */
  isVisible: boolean
  /** Optional custom message to display below the icon. */
  message?: string
  /** Callback fired when overlay is closed. */
  onClose?: () => void
  /**
   * Delay in milliseconds before automatically closing the overlay.
   * Set to 0 to disable auto-close.
   * @default 2500
   */
  autoCloseDelay?: number
}

/**
 * @name PortraitOrientationOverlay
 *
 * @description
 * Fullscreen overlay component displayed when the device is in **portrait orientation**.
 * Prompts the user to rotate their device to landscape for the best experience.
 *
 * @author Giuseppe Del Campo
 */
const PortraitOrientationOverlay: React.FC<PortraitOrientationOverlayProps> = ({
  isVisible,
  onClose,
  message = 'Please rotate your device to landscape or use a desktop / tablet for the best experience.',
  autoCloseDelay = 2500,
  ...props
}) => {
  const [showOverlay, setShowOverlay] = useState(false)
  const hasBeenSeenRef = useRef(false)

  const handleClose = useCallback(() => {
    hasBeenSeenRef.current = true
    setShowOverlay(false)
    onClose?.()
  }, [onClose])

  // Manage visibility based on orientation changes
  useEffect(() => {
    if (!hasBeenSeenRef.current && isVisible) {
      setShowOverlay(true)
    } else if (!isVisible && showOverlay) {
      // Immediately dismiss if the user actually rotates to landscape
      setShowOverlay(false)
    }
  }, [isVisible, showOverlay])

  // Automatically closes after autoCloseDelay
  useEffect(() => {
    if (!showOverlay || autoCloseDelay <= 0) return

    const timer: ReturnType<typeof setTimeout> = setTimeout(() => {
      handleClose()
    }, autoCloseDelay)

    return () => clearTimeout(timer)
  }, [showOverlay, handleClose, autoCloseDelay])

  return (
    <AnimatePresence>
      {showOverlay && (
        <MotionBox
          key="portrait-orientation-overlay"
          position="fixed"
          inset={0}
          w="100vw"
          h="100vh"
          bg="blackAlpha.900"
          backdropFilter="blur(8px)"
          zIndex={9999}
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          color="white"
          p={6}
          fontFamily="sans-serif"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          {...props}
        >
          <IconButton
            aria-label="Close orientation notice"
            variant="ghost"
            size="md"
            color="white"
            position="absolute"
            top={4}
            right={4}
            _hover={{ bg: 'whiteAlpha.200' }}
            _active={{ bg: 'whiteAlpha.300' }}
            onClick={handleClose}
          >
            <X size={20} />
          </IconButton>

          <VStack gap={4} color="white" textAlign="center">
            <RotateSmartphoneIcon />
            <Text fontSize="lg" maxW="400px" px={4} lineHeight="tall">
              {message}
            </Text>
          </VStack>
        </MotionBox>
      )}
    </AnimatePresence>
  )
}

export default PortraitOrientationOverlay
