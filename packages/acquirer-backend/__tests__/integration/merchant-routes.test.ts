import request from 'supertest'
import express from 'express'
import path from 'path'
import merchant_router from '../../src/routes/merchant-routes'
import { AppDataSource } from '../../src/database/data-source'
import logger from '../../src/logger'
import { PortalUserEntity } from '../../src/entity/PortalUserEntity'
import { initializeDatabase } from '../../src/database/init-database'
import { MerchantEntity } from '../../src/entity/MerchantEntity'
import { ContactPersonEntity } from '../../src/entity/ContactPersonEntity'
import { BusinessOwnerEntity } from '../../src/entity/BusinessOwnerEntity'
import {
  BusinessOwnerIDType,
  CurrencyCodes,
  MerchantRegistrationStatus, NumberOfEmployees
} from 'shared-lib'
import { CheckoutCounterEntity } from '../../src/entity/CheckoutCounterEntity'
import { BusinessLicenseEntity } from '../../src/entity/BusinessLicenseEntity'
import {
  createMerchantDocumentBucket,
  removeMerchantDocument,
  removeMerchantDocumentBucket
} from '../../src/middleware/minioClient'

const app = express()
app.use(express.json())
app.use('/api/v1', merchant_router)

logger.silent = true

describe('Merchant Routes Tests', () => {
  beforeAll(async () => {
    await initializeDatabase()
    await createMerchantDocumentBucket()
  }, 20000) // wait for 20secs for db to initialize

  afterAll(async () => {
    await AppDataSource.destroy()
    await removeMerchantDocumentBucket()
  })

  describe('POST /api/v1/merchants/draft', () => {
    beforeEach(async () => {
      await AppDataSource.manager.delete(BusinessLicenseEntity, {})
      await AppDataSource.manager.delete(CheckoutCounterEntity, {})

      await AppDataSource.manager.delete(MerchantEntity, {})
    })
    it('should respond with 201 status and the created merchant', async () => {
      // Arrange

      // Act
      const res = await request(app)
        .post('/api/v1/merchants/draft')
        .set('Authorization', `Bearer ${process.env.TEST1_DUMMY_AUTH_TOKEN ?? ''}`)
        .field('dba_trading_name', 'Test Merchant 1')
        .field('registered_name', 'Test Merchant 1')
        .field('employees_num', '1 - 5')
        .field('monthly_turnover', 0.5)
        .field('currency_code', CurrencyCodes.USD)
        .field('category_code', '01110')
        .field('payinto_alias', 'P33')
        .field('registration_status', MerchantRegistrationStatus.DRAFT)
        .field('registration_status_reason', 'Drafting Merchant')
        .field('license_number', '007')
        .attach('file', path.join(__dirname, '../test-files/dummy.pdf'))

      // Assert
      expect(res.statusCode).toEqual(201)
      expect(res.body).toHaveProperty('message')
      expect(res.body.message).toEqual('Drafting Merchant Successful')
      expect(res.body).toHaveProperty('data')
      expect(res.body.data).toHaveProperty('id')
      expect(res.body.data).toHaveProperty('business_licenses')
      expect(res.body.data.business_licenses).toHaveLength(1)
      expect(res.body.data.business_licenses[0]).toHaveProperty('license_document_link')

      // Clean up
      await AppDataSource.manager.delete(
        MerchantEntity,
        { id: res.body.data.id }
      )
      await AppDataSource.manager.delete(
        CheckoutCounterEntity,
        { alias_value: res.body.data.id }
      )
      await AppDataSource.manager.delete(
        BusinessLicenseEntity,
        {}
      )
      await removeMerchantDocument(res.body.data.business_licenses[0].license_document_link)
    })
    // TODO: Add more tests and failure cases
  })

  describe('POST /api/v1/merchants/:id/registration-status', () => {
    let test1User: PortalUserEntity | null
    let merchant: MerchantEntity | null

    beforeAll(async () => {
      test1User = await AppDataSource.manager.findOne(
        PortalUserEntity,
        { where: { email: process.env.TEST1_EMAIL ?? '' } }
      )
    })

    beforeEach(async () => {
      merchant = await AppDataSource.manager.save(
        MerchantEntity,
        {
          dba_trading_name: 'Test Merchant 1',
          registered_name: 'Test Merchant 1',
          employees_num: NumberOfEmployees.ONE_TO_FIVE,
          monthly_turnover: 0.5,
          currency_code: CurrencyCodes.USD,
          category_code: '01110',
          payinto_alias: 'merchant1',
          registration_status: MerchantRegistrationStatus.DRAFT,
          registration_status_reason: 'Drafting Merchant',
          // eslint-disable-next-line
          created_by: test1User ?? {}
        }
      )
    })

    afterEach(async () => {
      await AppDataSource.manager.delete(
        MerchantEntity,
        { id: merchant?.id }
      )
      merchant = null
    })

    it('should respond with 200 status and the updated merchant', async () => {
      // Arrange

      // Act
      const res = await request(app)
        // eslint-disable-next-line
        .put(`/api/v1/merchants/${merchant?.id}/registration-status`)
        .set('Authorization', `Bearer ${process.env.TEST2_DUMMY_AUTH_TOKEN ?? ''}`)
        .send({
          registration_status: MerchantRegistrationStatus.APPROVED,
          registration_status_reason: 'Approved Merchant'
        })

      // Assert
      expect(res.statusCode).toEqual(200)
      expect(res.body).toHaveProperty('message')
      expect(res.body.message).toEqual('Status Updated')
      expect(res.body).toHaveProperty('data')
      expect(res.body.data).toHaveProperty('id')
      expect(res.body.data.registration_status).toEqual(MerchantRegistrationStatus.APPROVED)
      expect(res.body.data.registration_status_reason).toEqual('Approved Merchant')

      const updatedMerchant = await AppDataSource.manager.findOne(
        MerchantEntity,
        { where: { id: merchant?.id } }
      )
      expect(updatedMerchant?.registration_status).toEqual(MerchantRegistrationStatus.APPROVED)
    })

    // eslint-disable-next-line
    it('should respond with 401 status with message \'Same Hub User cannot do both Sumitting and Review Checking\'', async () => {
      // Arrange

      // Act
      const res = await request(app)
        // eslint-disable-next-line
        .put(`/api/v1/merchants/${merchant?.id}/registration-status`)
        // Test1 is the creator of the merchant and is also the one updating the status
        .set('Authorization', `Bearer ${process.env.TEST1_DUMMY_AUTH_TOKEN ?? ''}`)
        .send({
          registration_status: MerchantRegistrationStatus.APPROVED,
          registration_status_reason: 'Approved Merchant'
        })

      // Assert
      expect(res.statusCode).toEqual(401)
      expect(res.body).toHaveProperty('message')
      expect(res.body.message).toEqual('Same Hub User cannot do both Sumitting and Review Checking')

      const originalMerchant = await AppDataSource.manager.findOne(
        MerchantEntity,
        { where: { id: merchant?.id } }
      )
      expect(originalMerchant?.registration_status).toEqual(MerchantRegistrationStatus.DRAFT)

      // Clean up
    })
  })

  describe('POST /api/v1/merchants/:id/contact-persons', () => {
    it('should respond with 201 status when create contact person valid data', async () => {
      // Arrange
      const merchant = await AppDataSource.manager.save(
        MerchantEntity,
        {
          dba_trading_name: 'Test Merchant 1',
          registered_name: 'Test Merchant 1',
          employees_num: NumberOfEmployees.ONE_TO_FIVE,
          monthly_turnover: 0.5,
          currency_code: CurrencyCodes.PHP,
          category_code: '10410',
          payinto_alias: 'merchant1'
        }
      )

      // Act
      const res = await request(app)
        .post(`/api/v1/merchants/${merchant.id}/contact-persons`)
        .send({
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone_number: '1234567890'
        })

      const merchantTest = await AppDataSource.manager.findOneOrFail(
        MerchantEntity,
        {
          where:
          { id: merchant.id },
          relations: ['contact_persons']
        }
      )
      // Assert
      expect(res.statusCode).toEqual(201)
      expect(res.body).toHaveProperty('message')
      expect(res.body).toHaveProperty('data')

      expect(merchantTest.contact_persons).toHaveLength(1)
      expect(merchantTest.contact_persons[0].name).toEqual('John Doe')
      expect(merchantTest.contact_persons[0].email).toEqual('john.doe@example.com')
      expect(merchantTest.contact_persons[0].phone_number).toEqual('1234567890')

      // Clean up
      await AppDataSource.manager.delete(
        ContactPersonEntity,
        { id: res.body.data.id }
      )
      await AppDataSource.manager.delete(
        MerchantEntity,
        { id: merchant.id }
      )
    })

    // eslint-disable-next-line
    it('should respond with 201 status when creating contact person with is_same_as_business_owner=true ', async () => {
      // Arrange
      const businessOwner = await AppDataSource.manager.save(
        BusinessOwnerEntity,
        {
          name: 'test business owner',
          email: 'test_buz_owner@email.com',
          phone_number: '1234567890',
          identificaton_type: BusinessOwnerIDType.NATIONAL_ID,
          identification_number: '1234567890'
        }
      )
      const merchant = await AppDataSource.manager.save(
        MerchantEntity,
        {
          dba_trading_name: 'Test Merchant 1',
          registered_name: 'Test Merchant 1',
          employees_num: NumberOfEmployees.ONE_TO_FIVE,
          monthly_turnover: 0.5,
          currency_code: CurrencyCodes.PHP,
          category_code: '10410',
          payinto_alias: 'merchant1',
          business_owners: [businessOwner]
        }
      )

      // Act
      const res = await request(app)
        .post(`/api/v1/merchants/${merchant.id}/contact-persons`)
        .send({
          is_same_as_business_owner: true
          // No Longer needed!
          // name: '',
          // email: '',
          // phone_number: ''
        })

      const merchantTest = await AppDataSource.manager.findOneOrFail(
        MerchantEntity,
        {
          where:
          { id: merchant.id },
          relations: ['contact_persons']
        }
      )

      // Assert
      expect(res.statusCode).toEqual(201)
      expect(res.body).toHaveProperty('message')
      expect(res.body).toHaveProperty('data')

      expect(res.body.data).toHaveProperty('name')
      expect(res.body.data.name).toEqual(businessOwner.name)
      expect(res.body.data).toHaveProperty('email')
      expect(res.body.data.email).toEqual(businessOwner.email)
      expect(res.body.data).toHaveProperty('phone_number')
      expect(res.body.data.phone_number).toEqual(businessOwner.phone_number)

      expect(merchantTest.contact_persons.length).toEqual(1)
      expect(merchantTest.contact_persons[0].name).toEqual(businessOwner.name)
      expect(merchantTest.contact_persons[0].email).toEqual(businessOwner.email)
      expect(merchantTest.contact_persons[0].phone_number).toEqual(businessOwner.phone_number)

      // Clean up
      await AppDataSource.manager.delete(
        MerchantEntity,
        { id: merchant.id }
      )
      await AppDataSource.manager.delete(
        ContactPersonEntity,
        { id: res.body.data.id }
      )
      await AppDataSource.manager.delete(
        BusinessOwnerEntity,
        { id: businessOwner.id }
      )
    })
  })

  describe('POST /api/v1/merchants/:id/business-owners', () => {
    it('should respond with 201 status and the created business owner', async () => {
      // Arrange
      const merchant = await AppDataSource.manager.save(
        MerchantEntity,
        {
          dba_trading_name: 'Test Merchant 1',
          registered_name: 'Test Merchant 1',
          employees_num: NumberOfEmployees.ONE_TO_FIVE,
          monthly_turnover: 0.5,
          currency_code: 'PHP',
          category_code: '10410',
          payinto_alias: 'merchant1'
        }
      )

      const res = await request(app)
        .post(`/api/v1/merchants/${merchant.id}/business-owners`)
        .send({
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone_number: '1234567890',
          identificaton_type: 'National ID',
          identification_number: '123456789'
        })

      expect(res.statusCode).toEqual(201)
      expect(res.body).toHaveProperty('message')
      expect(res.body).toHaveProperty('data')

      // Clean up
      await AppDataSource.manager.delete(
        MerchantEntity,
        { id: merchant.id }
      )
      await AppDataSource.manager.delete(
        BusinessOwnerEntity,
        { id: res.body.data.id }
      )
    })
  })
})
