import React from 'react'
import { Box, Text, BoxProps, HStack, Button } from '@chakra-ui/react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useControlsStore } from '@/store/controls'

export interface ControlsHintProps extends BoxProps {
  /**
   * Distance from the bottom when visible.
   * @default "20px"
   */
  bottom?: string | number

  /**
   * Show browser navigation buttons (back/forward).
   * @default false
   */
  showNavButtons?: boolean

  /**
   * Show controls navigation hint text.
   * @default true
   */
  showControlsHint?: boolean

  /**
   * Custom label or React node to replace the default navigation hint.
   */
  label?: React.ReactNode
}

/**
 * @name ControlsHint
 *
 * @description
 * A fixed hint box at the bottom of the viewport,
 * showing navigation instructions (arrows + enter/esc).
 *
 * @example
 * ```tsx
 * <ControlsHint showNavButtons />
 * ```
 *
 * @author Giuseppe Del Campo
 */
const ControlsHint: React.FC<ControlsHintProps> = ({
  bottom = '20px',
  showControlsHint = true,
  showNavButtons = false,
  label,
  ...props
}) => {
  const router = useRouter()
  const { enableControls } = useControlsStore()

  return (
    <Box
      position="fixed"
      bottom={enableControls ? bottom : '-100px'}
      left="50%"
      transform="translateX(-50%)"
      zIndex={1000}
      bg="gray.700"
      color="white"
      px={4}
      py={2}
      rounded="full"
      shadow="md"
      fontSize="sm"
      textAlign="center"
      fontFamily="sans-serif"
      transition="bottom 0.3s ease-in-out, opacity 0.3s ease-in-out"
      opacity={enableControls ? 1 : 0}
      pointerEvents={enableControls ? 'auto' : 'none'}
      aria-hidden={!enableControls}
      {...props}
    >
      <HStack gap={3}>
        {showNavButtons && (
          <HStack gap={1}>
            <Button
              size="sm"
              variant="ghost"
              color="white"
              aria-label="Go back"
              onClick={() => router.back()}
              px={2}
              h="28px"
              display="inline-flex"
              alignItems="center"
              gap={1.5}
              _hover={{ bg: 'gray.600' }}
              _active={{ bg: 'gray.500' }}
              _disabled={{ bg: 'gray.600', color: 'gray.400', cursor: 'not-allowed', opacity: 0.6 }}
            >
              <ArrowLeft size={16} /> Page back
            </Button>
            <Button
              size="sm"
              variant="ghost"
              color="white"
              aria-label="Go forward"
              onClick={() => router.forward()}
              px={2}
              h="28px"
              display="inline-flex"
              alignItems="center"
              gap={1.5}
              _hover={{ bg: 'gray.600' }}
              _active={{ bg: 'gray.500' }}
              _disabled={{ bg: 'gray.600', color: 'gray.400', cursor: 'not-allowed', opacity: 0.6 }}
            >
              <ArrowRight size={16} /> Page forward
            </Button>
          </HStack>
        )}

        {showControlsHint && (
          <Text as="span" whiteSpace="nowrap">
            {label ? (
              typeof label === 'string' ? (
                <span dangerouslySetInnerHTML={{ __html: label }} />
              ) : (
                label
              )
            ) : (
              <>
                Use <b>↑ ↓</b> to navigate — <b>Enter</b> to select — <b>Esc</b> to go back.
              </>
            )}
          </Text>
        )}
      </HStack>
    </Box>
  )
}

export default ControlsHint
