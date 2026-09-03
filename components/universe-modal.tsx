import React, { useState, useEffect } from 'react'
import {
  Dialog,
  Box,
  Text,
  SimpleGrid,
  Image,
  Button,
  IconButton,
} from '@chakra-ui/react'
import { UNIVERSES } from '@/data'
import { useMainStore } from '@/store'
import { Globe, X } from 'lucide-react'
import { useRouter } from 'next/router'
import { ROUTES } from '@/utils/routes'

const UNIVERSE_IMAGE_PATH = '/images/universes/'

/**
 * @name UniverseModal
 *
 * @description
 * Modal dialog that allows users to switch the active universe theme,
 * updating encounters, characters, and visuals.
 */
const UniverseModal: React.FC = () => {
  const { universe, setUniverse } = useMainStore()
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [selectedId, setSelectedId] = useState(universe.id)

  // Sync selectedId when the dialog opens
  useEffect(() => {
    if (open) setSelectedId(universe.id)
  }, [open, universe.id])

  const handleConfirm = () => {
    const chosen = UNIVERSES.find((u) => u.id === selectedId)

    if (chosen) {
      router.push(ROUTES.MENU)
      setUniverse(chosen)
    }

    setOpen(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={(details) => setOpen(details.open)}>
      <Dialog.Trigger asChild>
        <Button
          variant="solid"
          size="md"
          rounded="full"
          shadow="lg"
          gap={2}
          px={4}
          bg="blue.800"
          color="white"
          opacity={0.6}
          _hover={{ opacity: 1, transform: 'scale(1.02)' }}
          _active={{ transform: 'scale(0.98)' }}
          transition="all 0.2s ease"
        >
          <Globe size={18} />
          <Text as="span">Change universe</Text>
        </Button>
      </Dialog.Trigger>

      <Dialog.Backdrop
        bg="blackAlpha.700"
        backdropFilter="blur(6px)"
        w="full"
        h="full"
      />

      <Dialog.Positioner w="full" h="full">
        <Dialog.Content
          bg="gray.900"
          color="white"
          borderRadius="lg"
          p={6}
          maxW="800px"
          w="90vw"
          boxShadow="0 0 30px rgba(0,0,0,0.6)"
          my="auto"
          fontFamily="sans-serif"
        >
          <Dialog.CloseTrigger position="absolute" top={4} right={4} asChild>
            <IconButton
              aria-label="Close dialog"
              variant="ghost"
              size="sm"
              color="gray.400"
              _hover={{ color: 'white', bg: 'whiteAlpha.200' }}
            >
              <X size={18} />
            </IconButton>
          </Dialog.CloseTrigger>

          <Dialog.Title fontSize="2xl" fontWeight="bold" mb={2}>
            Select universe theme
          </Dialog.Title>

          <Dialog.Description fontSize="sm" color="gray.300" mb={6}>
            Changing the universe updates characters, encounters, and the overall visual mood of the experience.
          </Dialog.Description>

          <SimpleGrid
            columns={{
              base: 1,
              sm: Math.min(2, UNIVERSES.length),
              md: UNIVERSES.length,
            }}
            gap={4}
            mb={6}
          >
            {UNIVERSES.map((u) => {
              const isSelected = selectedId === u.id

              return (
                <Box
                  key={u.id}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  onClick={() => setSelectedId(u.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setSelectedId(u.id)
                    }
                  }}
                  cursor="pointer"
                  borderRadius="md"
                  overflow="hidden"
                  borderWidth="3px"
                  borderStyle="solid"
                  borderColor={isSelected ? '#4D7676' : 'gray.700'}
                  transition="all 0.2s ease"
                  _hover={{
                    transform: 'scale(1.02)',
                    borderColor: '#4D7676',
                  }}
                  _focusVisible={{
                    outline: '2px solid #4D7676',
                    outlineOffset: '2px',
                  }}
                >
                  <Image
                    src={`${UNIVERSE_IMAGE_PATH}${u.img}`}
                    alt={u.label}
                    objectFit="cover"
                    w="100%"
                    h="120px"
                  />

                  <Box p={2} bg="gray.800">
                    <Text fontWeight="bold" textAlign="center" fontSize="sm">
                      {u.label}
                    </Text>
                  </Box>
                </Box>
              )
            })}
          </SimpleGrid>

          <Button
            w="100%"
            bg="#4D7676"
            _hover={{ bg: '#364F50' }}
            _active={{ bg: '#364F50' }}
            color="white"
            size="md"
            rounded="md"
            onClick={handleConfirm}
          >
            Confirm
          </Button>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  )
}

export default UniverseModal
