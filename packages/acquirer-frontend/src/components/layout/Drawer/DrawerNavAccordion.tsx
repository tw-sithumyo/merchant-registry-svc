import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Flex,
  HStack,
  Icon,
  Stack,
} from '@chakra-ui/react'

import type { NavAccordion } from '@/components/layout/Sidebar/navItems'
import DrawerNavItem from './DrawerNavItem'

interface DrawerNavAccordionProps {
  navAccordion: NavAccordion
}

const DrawerNavAccordion = ({
  navAccordion: { name, icon, subNavItems },
}: DrawerNavAccordionProps) => {
  // This is to control the state of the accordion.
  // An accordion will initially be expanded if one of the nav items inside it is active.
  const isOpen = subNavItems.some(subNavItem => subNavItem.to === location.pathname)
  const initialIndex = isOpen ? 0 : 1

  return (
    <Accordion allowToggle defaultIndex={initialIndex}>
      <AccordionItem border='0'>
        <AccordionButton pl='3' pr='1' borderRadius='md' _hover={{ bg: 'secondary' }}>
          <HStack w='full'>
            {icon && (
              <Flex w='5' justify='center' align='center'>
                <Icon as={icon} color='primary' fontSize='20px' />
              </Flex>
            )}

            <Box as='span' flex='1' textAlign='left' fontSize='sm' fontWeight='medium'>
              {name}
            </Box>

            <AccordionIcon />
          </HStack>
        </AccordionButton>

        <AccordionPanel pr='1' pb='1'>
          <Stack>
            {subNavItems.map(subNavItem => (
              <DrawerNavItem key={subNavItem.name} navItem={subNavItem} />
            ))}
          </Stack>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
}

export default DrawerNavAccordion
