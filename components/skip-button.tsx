import React from 'react'
import { Button, ButtonProps, Box, BoxProps } from '@chakra-ui/react'
import { useControlsStore } from '@/store/controls'

export interface SkipButtonProps extends ButtonProps {
  /**
   * Text or content inside the button.
   * @default "Skip"
   */
  label?: React.ReactNode

  /**
   * Distance from the bottom of the viewport when visible.
   * @default "20px"
   */
  bottom?: string | number

  /**
   * Optional style overrides for the outer positioning container.
   */
  containerProps?: BoxProps
}

/**
 * @name SkipButton
 *
 * @description
 * A button fixed at the bottom of the viewport,
 * commonly used to allow skipping onboarding/tutorials.
 *
 * @example
 * ```tsx
 * <SkipButton onClick={() => console.log("Skipped!")} />
 * ```
 *
 * @author Giuseppe Del Campo
 */
const SkipButton: React.FC<SkipButtonProps> = ({
  label = 'Skip',
  bottom = '20px',
  children,
  containerProps,
  ...props
}) => {
  const { enableControls } = useControlsStore()

  return (
    <Box
      position="fixed"
      bottom={enableControls ? bottom : '-100px'}
      left="50%"
      transform="translateX(-50%)"
      zIndex={1000}
      fontFamily="sans-serif"
      transition="bottom 0.3s ease-in-out, opacity 0.3s ease-in-out"
      opacity={enableControls ? 1 : 0}
      pointerEvents={enableControls ? 'auto' : 'none'}
      aria-hidden={!enableControls}
      {...containerProps}
    >
      <Button
        colorScheme="gray"
        variant="solid"
        size="md"
        rounded="full"
        shadow="md"
        tabIndex={enableControls ? 0 : -1}
        {...props}
      >
        {children ?? label}
      </Button>
    </Box>
  )
}

export default SkipButton
