import React, { useEffect, useRef, useState } from 'react'
import {
  Box,
  Text,
  Link,
  BoxProps,
  IconButton,
  HStack,
  chakra,
  shouldForwardProp,
} from '@chakra-ui/react'
import { motion, AnimatePresence, isValidMotionProp } from 'framer-motion'
import { Info, X } from 'lucide-react'

// Official Chakra + Framer Motion integration (eliminates @ts-expect-error on transition)
const MotionBox = chakra(motion.div, {
  shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop),
})

/**
 * Props for {@link AboutHint}.
 */
export interface AboutHintProps extends BoxProps {
  /**
   * Distance from the top of the viewport where the hint should appear.
   * @default "20px"
   */
  top?: string | number
  /**
   * Auto-dismiss delay in milliseconds. Set to 0 to disable auto-hide.
   * @default 6000
   */
  autoHideDuration?: number
}

/**
 * @name AboutHint
 *
 * @description
 * A dismissible overlay banner that appears at the top of the screen
 * and provides information about the **Syndrome Main Computer** project.
 *
 * The banner:
 * - Fades and slides in on mount, and fades/slides out on dismiss.
 * - Automatically hides after `autoHideDuration` ms unless hovered.
 * - Can be dismissed immediately with the close button.
 * - Displays project information.
 *
 * @example
 * ```tsx
 * <AboutHint top="30px" autoHideDuration={6000} />
 * ```
 */
const AboutHint: React.FC<AboutHintProps> = ({
  top = '20px',
  autoHideDuration = 6000,
  ...props
}) => {
  const [visible, setVisible] = useState(true)
  const [isHovering, setIsHovering] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!isHovering && visible && autoHideDuration > 0) {
      timerRef.current = setTimeout(() => setVisible(false), autoHideDuration)
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isHovering, visible, autoHideDuration])

  const handleClose = () => setVisible(false)

  return (
    <AnimatePresence>
      {visible && (
        <MotionBox
          position="fixed"
          top={top}
          insetX={0}
          mx="auto"
          zIndex={999}
          bg="white"
          borderWidth="1px"
          borderColor="gray.200"
          shadow="xl"
          rounded="2xl"
          p={6}
          w={{ base: '90%', sm: '500px' }}
          textAlign="left"
          fontFamily="sans-serif"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          {...props}
        >
          <IconButton
            aria-label="Close"
            size="sm"
            variant="plain"
            color="black"
            position="absolute"
            top="6px"
            right="6px"
            onClick={handleClose}
          >
            <X size={18} />
          </IconButton>

          <HStack gap={3} align="start">
            <Info size={40} style={{ flexShrink: 0 }} />

            <Text fontSize="sm">
              <b>Syndrome Main Computer</b> is a faithful recreation of Syndrome’s
              computer interface from <i>The Incredibles</i> (2004), built as a modern
              web app with React, Next.js and Chakra UI.{' '}
              <Link
                href="https://github.com/Giuseppetm/syndrome-main-computer"
                color="#3a9191"
                target="_blank"
                rel="noopener noreferrer"
                fontWeight="semibold"
                _hover={{ color: '#175252' }}
              >
                View on GitHub
              </Link>
            </Text>
          </HStack>
        </MotionBox>
      )}
    </AnimatePresence>
  )
}

export default AboutHint
