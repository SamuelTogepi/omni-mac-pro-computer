import React from 'react'
import { Button, VStack, StackProps } from '@chakra-ui/react'
import { Eye, EyeOff, Volume2, VolumeOff } from 'lucide-react'
import { useControlsStore } from '@/store/controls'
import UniverseModal from './universe-modal'

export interface ControlsProps extends StackProps {}

/**
 * @name Controls
 *
 * @description
 * Fixed HUD controls at the bottom-left of the viewport to toggle audio,
 * toggle control hints, and open the universe modal.
 */
const Controls: React.FC<ControlsProps> = (props) => {
  const { enableControls, toggleControls, enableAudio, toggleAudio } = useControlsStore()

  return (
    <VStack
      position="fixed"
      bottom="20px"
      left="20px"
      gap={2}
      zIndex={1000}
      fontFamily="sans-serif"
      align="start"
      {...props}
    >
      <Button
        onClick={toggleAudio}
        variant="solid"
        size="md"
        rounded="full"
        shadow="lg"
        gap={2}
        px={4}
        opacity={enableAudio ? 1 : 0.6}
        _hover={{ opacity: 1, transform: 'scale(1.02)' }}
        _active={{ transform: 'scale(0.98)' }}
        transition="all 0.2s ease"
        aria-pressed={enableAudio}
      >
        {enableAudio ? <VolumeOff size={18} /> : <Volume2 size={18} />}
        {enableAudio ? 'Disable audio' : 'Enable audio'}
      </Button>

      <Button
        onClick={toggleControls}
        variant="solid"
        size="md"
        rounded="full"
        shadow="lg"
        gap={2}
        px={4}
        opacity={enableControls ? 1 : 0.6}
        _hover={{ opacity: 1, transform: 'scale(1.02)' }}
        _active={{ transform: 'scale(0.98)' }}
        transition="all 0.2s ease"
        aria-pressed={enableControls}
      >
        {enableControls ? <EyeOff size={18} /> : <Eye size={18} />}
        {enableControls ? 'Hide controls' : 'Show controls'}
      </Button>

      <UniverseModal />
    </VStack>
  )
}

export default Controls
