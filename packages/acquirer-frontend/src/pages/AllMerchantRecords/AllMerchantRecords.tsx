import { useMemo } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import {
  Box,
  Checkbox,
  HStack,
  Heading,
  SimpleGrid,
  Stack,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import type { RegisteredMerchantInfo } from '@/types/registeredMerchants'
import {
  type RegisteredMerchants,
  registeredMerchantsSchema,
} from '@/lib/validations/registeredMerchants'
import { convertKebabCaseToReadable } from '@/utils'
import { CustomButton, MerchantInformationModal } from '@/components/ui'
import { FormInput, FormSelect } from '@/components/form'
import AllMerchantsDataTable from './AllMerchantsDataTable'

const REGISTRATION_STATUSES = [
  { value: 'approved', label: 'Approved' },
  { value: 'pending', label: 'Pending' },
  { value: 'rejected', label: 'Rejected' },
]

const REGISTRATION_STATUS_COLORS = {
  approved: 'success',
  pending: 'warning',
  rejected: 'danger',
}

type StatusKey = keyof typeof REGISTRATION_STATUS_COLORS

const registeredMerchant: RegisteredMerchantInfo = {
  no: 1,
  dbaName: 'K Company Pte.Ltd',
  registeredName: '122132',
  payintoAccount: '06103461954',
  merchantType: 'individual',
  state: 'Shan',
  city: 'Taunggyi',
  counterDescription: 'Online Shopping - 01',
  registeredDfspName: 'AA',
  registrationStatus: 'approved',
}

const dummyData = new Array(10)
  .fill(0)
  .map((_, index) => ({ ...registeredMerchant, no: index + 1 }))

const AllMerchantRecords = () => {
  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<RegisteredMerchants>({
    resolver: zodResolver(registeredMerchantsSchema),
    defaultValues: {
      registrationStatus: null,
    },
  })

  const { isOpen, onOpen, onClose } = useDisclosure()

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<RegisteredMerchantInfo>()

    return [
      columnHelper.display({
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            isChecked={table.getIsAllPageRowsSelected()}
            onChange={e => table.toggleAllPageRowsSelected(!!e.target.checked)}
            aria-label='Select all'
            borderColor='blackAlpha.400'
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            isChecked={row.getIsSelected()}
            onChange={e => row.toggleSelected(!!e.target.checked)}
            aria-label='Select row'
            borderColor='blackAlpha.400'
          />
        ),
        enableSorting: false,
      }),
      columnHelper.accessor('no', {
        cell: info => info.getValue(),
        header: 'No',
      }),
      columnHelper.accessor('dbaName', {
        cell: info => info.getValue(),
        header: 'Doing Business As Name',
      }),
      columnHelper.accessor('registeredName', {
        cell: info => info.getValue(),
        header: 'Registered Name',
      }),
      columnHelper.accessor('payintoAccount', {
        cell: info => info.getValue(),
        header: 'Payinto Account',
      }),
      columnHelper.accessor('merchantType', {
        cell: info => convertKebabCaseToReadable(info.getValue()),
        header: 'Merchant Type',
      }),
      columnHelper.accessor('state', {
        cell: info => info.getValue(),
        header: 'State',
      }),
      columnHelper.accessor('city', {
        cell: info => info.getValue(),
        header: 'City',
      }),
      columnHelper.accessor('counterDescription', {
        cell: info => info.getValue(),
        header: 'Counter Description',
      }),
      columnHelper.accessor('registeredDfspName', {
        cell: info => info.getValue(),
        header: 'Registered DFSP Name',
      }),
      columnHelper.accessor('registrationStatus', {
        cell: info => (
          <HStack justify='center' spacing='1.5'>
            <Box
              as='span'
              w='2'
              h='2'
              borderRadius='full'
              bg={REGISTRATION_STATUS_COLORS[info.getValue().toLowerCase() as StatusKey]}
            />

            <Text>{convertKebabCaseToReadable(info.getValue())}</Text>
          </HStack>
        ),
        header: 'Registration Status',
      }),
      columnHelper.display({
        id: 'view-details',
        cell: () => (
          <CustomButton
            mt={{ base: '2', xl: '0' }}
            mr={{ base: '-2', xl: '3' }}
            onClick={onOpen}
          >
            View Details
          </CustomButton>
        ),
        enableSorting: false,
      }),
    ]
  }, [onOpen])

  const onSubmit = (values: RegisteredMerchants) => {
    console.log(values)
  }

  return (
    <Box mb='-14'>
      <Heading size='md' mb='10'>
        View Registered Merchants
      </Heading>

      <Stack as='form' spacing='8' onSubmit={handleSubmit(onSubmit)}>
        <SimpleGrid
          templateColumns={{
            base: 'repeat(1, 1fr)',
            md: 'repeat(2, 1fr)',
            lg: 'repeat(3, 1fr)',
            xl: 'repeat(4, 1fr)',
          }}
          columnGap='8'
          rowGap={{ base: '4', sm: '6' }}
          justifyItems='center'
        >
          <FormInput
            name='addedBy'
            register={register}
            errors={errors}
            label='Added By'
            placeholder='Enter the one who is added by'
          />

          <FormInput
            name='approvedBy'
            register={register}
            errors={errors}
            label='Approved By'
            placeholder='Enter the one who is approved by'
          />

          <FormInput
            name='addedTime'
            register={register}
            errors={errors}
            label='Added Time'
            placeholder='Choose added date and time'
            inputProps={{ type: 'datetime-local' }}
          />

          <FormInput
            name='updatedTime'
            register={register}
            errors={errors}
            label='Updated Time'
            placeholder='Choose updated date and time'
            inputProps={{ type: 'datetime-local' }}
          />

          <FormInput
            name='dabName'
            register={register}
            errors={errors}
            label='DAB Name'
            placeholder='Enter DAB name'
          />

          <FormInput
            name='merchantId'
            register={register}
            errors={errors}
            label='Merchant ID'
            placeholder='Enter Merchant ID'
          />

          <FormInput
            name='payintoId'
            register={register}
            errors={errors}
            label='Payinto ID'
            placeholder='Enter Payinto ID'
          />

          <FormSelect
            name='registrationStatus'
            register={register}
            errors={errors}
            label='Registration Status'
            placeholder='Choose registration status'
            options={REGISTRATION_STATUSES}
          />
        </SimpleGrid>

        <Box alignSelf='end'>
          <CustomButton colorVariant='accent-outline' mr='4' onClick={() => reset()}>
            Clear Filter
          </CustomButton>

          <CustomButton type='submit' px='6'>
            Search
          </CustomButton>
        </Box>
      </Stack>

      <MerchantInformationModal isOpen={isOpen} onClose={onClose} />

      <Box
        bg='primaryBackground'
        mx={{ base: '-4', sm: '-6', lg: '-8' }}
        mt='5'
        pt='6'
        px='4'
        pb='14'
      >
        <AllMerchantsDataTable
          columns={columns}
          data={dummyData}
          breakpoint='xl'
          alwaysVisibleColumns={[1]}
          onExport={() => console.log('exported')}
        />
      </Box>
    </Box>
  )
}

export default AllMerchantRecords
