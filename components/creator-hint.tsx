import React from 'react'
import { Link, Text, HStack, LinkProps, keyframes } from '@chakra-ui/react'
import { SquareCode } from 'lucide-react'
import { useControlsStore } from '@/store/controls'

// Native Chakra keyframes (eliminates raw <style> tags and SSR style injection issues)
const pulseColor = keyframes`
  0% { color: white; }
  50% { color: var(--chakra-colors-teal-200, #81E6D9); }
  100% { color: white; }
`

export interface CreatorHintProps extends LinkProps {
  /**
   * Creator contact email address.
   * @default "samuelbusinessbowers@gmail.com"
   */
  email?: string
  /**
   * Creator display name.
   * @default "Samuel Charlie Bowers"
   */
  creatorName?: string
}

/**
 * @name CreatorHint
 *
 * @description
 * A fixed hint badge anchored at the top-right of the viewport linking to
 * the creator's contact email, featuring a subtle pulsing text animation.
 */
const CreatorHint: React.FC<CreatorHintProps> = ({
  email = 'samuelbusinessbowers@gmail.com',
  creatorName = 'Samuel Charlie Bowers',
  ...props
}) => {
  const { enableControls } = useControlsStore()

  return (
    <Link
      position="fixed"
      top={enableControls ? '0.5rem' : '-100px'}
      right="0.5rem"
      zIndex="overlay"
      bg="gray.700"
      color="white"
      px="3"
      py="1"
      borderRadius="md"
      fontSize="sm"
      boxShadow="md"
      fontFamily="sans-serif"
      href={`mailto:${email}`}
      textDecoration="none"
      opacity={enableControls ? 0.8 : 0}
      pointerEvents={enableControls ? 'auto' : 'none'}
      aria-hidden={!enableControls}
      transition="top 0.3s ease-in-out, opacity 0.3s ease-in-out, color 0.2s ease"
      _hover={{
        textDecoration: 'none',
        opacity: 1,
        color: 'teal.200',
      }}
      {...props}
    >
      <HStack gap={2}>
        <SquareCode size={16} />
        <Text as="span">
          Created by{' '}
          <Text
            as="span"
            fontWeight={700}
            animation={`${pulseColor} 2s ease-in-out infinite`}
          >
            {creatorName}
          </Text>
        </Text>
      </HStack>
    </Link>
  )
}

export default CreatorHint
