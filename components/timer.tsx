import React, { useState, useEffect, useRef, useMemo } from 'react'
import {
  BoxProps,
  HStack,
  StackProps,
  Text,
  TextProps,
  useSlotRecipe,
  VStack,
} from '@chakra-ui/react'

export interface TimerProps extends Omit<StackProps, 'children'> {
  /**
   * Starting hours.
   * @default 8
   */
  initialHours?: number

  /**
   * Starting minutes.
   * @default 10
   */
  initialMinutes?: number

  /**
   * Starting seconds.
   * @default 42
   */
  initialSeconds?: number

  /**
   * Optional callback invoked when the countdown reaches 00:00:00.
   */
  onComplete?: () => void
}

/**
 * @name Timer
 *
 * @description
 * Displays a countdown in HH:MM:SS format starting from the given initial time.
 * Calls `onComplete` when the countdown reaches 00:00:00.
 *
 * @author Giuseppe Del Campo
 */
const Timer: React.FC<TimerProps> = ({
  initialHours = 8,
  initialMinutes = 10,
  initialSeconds = 42,
  onComplete,
  ...props
}) => {
  const recipe = useSlotRecipe({ key: 'timerComponent' })
  const styles = recipe({}) as Record<string, BoxProps & StackProps & TextProps>

  const initialTotalSeconds = useMemo(
    () => initialHours * 3600 + initialMinutes * 60 + initialSeconds,
    [initialHours, initialMinutes, initialSeconds]
  )

  const [time, setTime] = useState<number>(initialTotalSeconds)

  // Keep onComplete reference fresh without triggering interval resets on re-render
  const onCompleteRef = useRef(onComplete)
  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    if (initialTotalSeconds <= 0) {
      setTime(0)
      onCompleteRef.current?.()
      return
    }

    let remaining = initialTotalSeconds
    setTime(remaining)

    const timer: ReturnType<typeof setInterval> = setInterval(() => {
      remaining -= 1

      if (remaining <= 0) {
        clearInterval(timer)
        setTime(0)
        onCompleteRef.current?.()
      } else {
        setTime(remaining)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [initialTotalSeconds])

  const hours = Math.floor(time / 3600)
  const minutes = Math.floor((time % 3600) / 60)
  const seconds = time % 60

  return (
    <HStack
      {...styles.wrapper}
      gap={24}
      role="timer"
      aria-live="off"
      aria-label={`Time remaining: ${hours} hours, ${minutes} minutes, ${seconds} seconds`}
      {...props}
    >
      <VStack gap={8}>
        <Text
          {...styles.unitValue}
          fontVariantNumeric="tabular-nums"
          userSelect="none"
        >
          {hours.toString().padStart(2, '0')}
        </Text>
        <Text {...styles.unitLabel}>Hours</Text>
      </VStack>

      <Text {...styles.unitSeparator} userSelect="none">
        :
      </Text>

      <VStack mx={14} gap={8}>
        <Text
          {...styles.unitValue}
          fontVariantNumeric="tabular-nums"
          userSelect="none"
        >
          {minutes.toString().padStart(2, '0')}
        </Text>
        <Text {...styles.unitLabel}>Minutes</Text>
      </VStack>

      <Text {...styles.unitSeparator} userSelect="none">
        :
      </Text>

      <VStack gap={8}>
        <Text
          {...styles.unitValue}
          fontVariantNumeric="tabular-nums"
          userSelect="none"
        >
          {seconds.toString().padStart(2, '0')}
        </Text>
        <Text {...styles.unitLabel}>Seconds</Text>
      </VStack>
    </HStack>
  )
}

export default Timer
