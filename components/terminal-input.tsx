import React, {
  forwardRef,
  useCallback,
  useRef,
  useState,
  useLayoutEffect,
  useEffect,
} from 'react'
import {
  Box,
  BoxProps,
  HStack,
  Input,
  InputProps,
  StackProps,
  useSlotRecipe,
  keyframes,
} from '@chakra-ui/react'

// SSR-safe layout effect to measure width synchronously before paint (prevents 1-frame typing lag)
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect

/**
 * Animation keyframes for the blinking underscore cursor.
 */
const blink = keyframes`
  0%, 50% { opacity: 1; }
  50.01%, 100% { opacity: 0; }
`

export interface TerminalInputProps extends Omit<InputProps, 'variant'> {
  value: string
  alignment?: 'center' | 'start'
  variant?: 'search'
  /**
   * Character used for the blinking terminal cursor.
   * @default "_"
   */
  blinkCharacter?: string
}

/**
 * @name TerminalInput
 *
 * @description
 * Custom input component designed to simulate
 * the look and feel of a terminal value prompt.
 *
 * Features:
 * - Dynamically resizes based on the length of the `value`.
 * - Displays a blinking underscore cursor next to the input field.
 * - Prevents layout shift with synchronous pre-paint text width calculation.
 *
 * @example
 * ```tsx
 * <TerminalInput
 *   value={value}
 *   onChange={(e) => setValue(e.target.value)}
 * />
 * ```
 *
 * @author Giuseppe Del Campo
 */
const TerminalInput = forwardRef<HTMLInputElement, TerminalInputProps>(
  (
    {
      value,
      alignment = 'center',
      variant,
      blinkCharacter = '_',
      onChange,
      ...props
    },
    ref
  ) => {
    const recipe = useSlotRecipe({ key: 'terminalInputComponent' })
    const styles = recipe({ mode: variant }) as Record<string, BoxProps & StackProps>

    const inputRef = useRef<HTMLInputElement | null>(null)
    const measureRef = useRef<HTMLDivElement>(null)
    const [textWidth, setTextWidth] = useState(0)

    // Merged ref handler so internal click-to-focus works alongside forwarded ref
    const setRefs = useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node
        if (typeof ref === 'function') {
          ref(node)
        } else if (ref) {
          ref.current = node
        }
      },
      [ref]
    )

    // Measure text width before browser paint to prevent cursor flickering
    useIsomorphicLayoutEffect(() => {
      const updateWidth = () => {
        if (measureRef.current) {
          setTextWidth(measureRef.current.offsetWidth)
        }
      }

      updateWidth()

      // Re-measure when web fonts (e.g. Orbitron) finish loading
      if (typeof document !== 'undefined' && 'fonts' in document) {
        document.fonts.ready.then(updateWidth)
      }
    }, [value])

    return (
      <HStack
        {...styles.wrapper}
        justifyContent={alignment === 'center' ? 'center' : 'flex-start'}
        position="relative"
        cursor="text"
        onClick={() => inputRef.current?.focus()}
      >
        <Input
          {...styles.valueInput}
          {...props}
          ref={setRefs}
          autoFocus
          type="text"
          value={value}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          onChange={onChange}
          w={`${Math.max(textWidth, 1)}px`}
        />

        {/* Blinking cursor */}
        <Box
          {...styles.blinkUnderscore}
          as="span"
          animation={`${blink} 1s step-start infinite`}
          lineHeight={1}
          userSelect="none"
          pointerEvents="none"
          {...(value.length === 0 && {
            position: 'absolute',
            left: alignment === 'center' ? '50%' : '0',
            transform: alignment === 'center' ? 'translateX(-50%)' : 'none',
          })}
        >
          {blinkCharacter}
        </Box>

        {/* Hidden offscreen element used strictly for pixel-accurate width measurement */}
        <Box
          ref={measureRef}
          visibility="hidden"
          whiteSpace="pre"
          position="absolute"
          top={0}
          left={0}
          pointerEvents="none"
          userSelect="none"
          aria-hidden="true"
          {...styles.valueInput}
        >
          {value}
        </Box>
      </HStack>
    )
  }
)

TerminalInput.displayName = 'TerminalInput'

export default TerminalInput
