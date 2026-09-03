import React, { useEffect, useRef, useState } from 'react'
import {
  Box,
  Button,
  Heading,
  Text,
  HStack,
  VStack,
  IconButton,
  BoxProps,
  chakra,
  shouldForwardProp,
} from '@chakra-ui/react'
import { motion, AnimatePresence, isValidMotionProp } from 'framer-motion'
import { Coffee, X } from 'lucide-react'

// Consistent Chakra UI + Framer Motion wrapper
const MotionBox = chakra(motion.div, {
  shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop),
})

export interface DonationPopupProps extends BoxProps {
  /**
   * Channel or donation link URL.
   * @default "https://youtube.com/@dolphincircuits"
   */
  channelUrl?: string
  /**
   * Time in milliseconds before automatically hiding the popup. Set to 0 to disable.
   * @default 15000
   */
  hideTimeout?: number
  /**
   * Optional initial delay in milliseconds before appearing.
   * @default 1000
   */
  delay?: number
}

/**
 * @name DonationPopup
 *
 * @description
 * A dismissible floating banner anchored at the bottom of the viewport
 * prompting users to support the project via YouTube channel subscription.
 */
const DonationPopup: React.FC<DonationPopupProps> = ({
  channelUrl = 'https://youtube.com/@dolphincircuits',
  hideTimeout = 15000,
  delay = 1000,
  ...props
}) => {
  const [visible, setVisible] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Trigger initial appearance after delay
  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(showTimer)
  }, [delay])

  // Manage auto-dismiss with hover pause
  useEffect(() => {
    if (!isHovering && visible && hideTimeout > 0) {
      timerRef.current = setTimeout(() => setVisible(false), hideTimeout)
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isHovering, visible, hideTimeout])

  const handleClose = () => setVisible(false)

  return (
    <AnimatePresence>
      {visible && (
        <MotionBox
          position="fixed"
          bottom="20px"
          insetX={0}
          mx="auto"
          bg="white"
          borderWidth="1px"
          borderColor="gray.200"
          shadow="xl"
          rounded="2xl"
          p={6}
          w={{ base: '90%', sm: '400px' }}
          zIndex={1400}
          fontFamily="sans-serif"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
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

          <VStack align="stretch" gap={4}>
            <HStack gap={3} align="start">
              <Coffee size={40} style={{ flexShrink: 0 }} />
              <VStack align="start" gap={1}>
                <Heading size="md">
                  Support{' '}
                  <Box as="span" color="purple.600">
                    syndromemaincomputer.app
                  </Box>
                </Heading>
                <Text fontSize="sm" color="gray.600">
                  If you like this project and have the financial possibility,{' '}
                  <Box as="span" fontWeight="semibold">
                    please consider subscribing to my channel
                  </Box>
                  . Your support helps keep me motivated to make videos.
                </Text>
              </VStack>
            </HStack>

            <Button
              as="a"
              href={channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              colorScheme="purple"
              size="sm"
              rounded="xl"
              fontWeight="bold"
              leftIcon={<Coffee size={16} />}
              w="full"
              _hover={{ textDecoration: 'none', opacity: 0.9 }}
            >
              Subscribe to my Channel
            </Button>
          </VStack>
        </MotionBox>
      )}
    </AnimatePresence>
  )
}

export default DonationPopup
