import {
  BusinessOwnerIDType, Countries, CurrencyCodes, MerchantLocationType,
  MerchantType,
  NumberOfEmployees
} from 'shared-lib'
import * as z from 'zod'

export const BusinessLicenseSubmitDataSchema = z.object({
  license_number: z.string(),
  license_document_link: z.string().url().nullable()
}).strict()

export const MerchantSubmitDataSchema = z.object({
  dba_trading_name: z.string(),
  registered_name: z.string().optional().nullable().default(null),
  employees_num: z.nativeEnum(NumberOfEmployees),
  monthly_turnover: z.string().nullable().default(null),
  currency_code: z.nativeEnum(CurrencyCodes),
  category_code: z.string(),
  merchant_type: z.nativeEnum(MerchantType),
  // registration_status: z.nativeEnum(SubmitRegistratonStatus),
  // registration_status_reason: z.string(),
  payinto_alias: z.string().nonempty(),
  license_number: z.string().optional(),
  file: z.custom<File>(val => val instanceof File).or(z.null())

}).strict()

export const MerchantLocationSubmitDataSchema = z.object({
  location_type: z.nativeEnum(MerchantLocationType),
  country: z.nativeEnum(Countries).or(z.null()),
  web_url: z.string().optional(),
  address_type: z.string().optional(),
  department: z.string().optional(),
  sub_department: z.string().optional(),
  street_name: z.string().optional(),
  building_number: z.string().optional(),
  building_name: z.string().optional(),
  floor_number: z.string().optional(),
  room_number: z.string().optional(),
  post_box: z.string().optional(),
  postal_code: z.string().optional(),
  town_name: z.string().optional(),
  district_name: z.string().optional(),
  country_subdivision: z.string().optional(),
  address_line: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  checkout_description: z.string().optional()
}).strict()

export const ContactPersonSubmitDataSchema = z.object({
  name: z.string(),
  phone_number: z.string(),
  email: z.string().email().or(z.literal(null)),
  is_same_as_business_owner: z.boolean().default(false)
}).strict()

export const BusinessOwnerSubmitDataSchema = z.object({
  id: z.number().optional(), // only needed for updating
  name: z.string(),
  email: z.string().email().or(z.null()).optional(),
  phone_number: z.string(),
  identificaton_type: z.nativeEnum(BusinessOwnerIDType),
  identification_number: z.string(),
  address_type: z.string().optional(),
  department: z.string().optional(),
  sub_department: z.string().optional(),
  street_name: z.string().optional(),
  building_number: z.string().optional(),
  building_name: z.string().optional(),
  floor_number: z.string().optional(),
  room_number: z.string().optional(),
  post_box: z.string().optional(),
  postal_code: z.string().optional(),
  town_name: z.string().optional(),
  district_name: z.string().optional(),
  country: z.nativeEnum(Countries).optional(),
  country_subdivision: z.string().optional(),
  address_line: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional()
}).strict()
