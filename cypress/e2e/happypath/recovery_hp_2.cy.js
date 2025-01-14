import * as constants from '../../support/constants'
import * as main from '../pages/main.page'
import * as ownerP from '../pages/owners.pages'
import * as recovery from '../pages/recovery.pages'

describe('Recovery happy path tests 2', () => {
  beforeEach(() => {
    cy.visit(constants.homeUrl + constants.SEPOLIA_TEST_SAFE_24_RECOVERY_2)
    cy.clearLocalStorage()
    main.acceptCookies()
  })

  // Check that recoverer can start and complete the process if not cancelled by the owner
  it('Recovery setup happy path 2', { defaultCommandTimeout: 300000 }, () => {
    Cypress.on('uncaught:exception', (err, runnable) => {
      recovery.clickOnRecoveryExecuteBtn()
      return false
    })
    main.fetchSafeData(constants.SEPOLIA_TEST_SAFE_24_RECOVERY_2.substring(4)).then((response) => {
      expect(response.status).to.eq(200)
      console.log(response.body)
      expect(response.body).to.have.property('owners')

      const owners = response.body.owners

      let owner = constants.SPENDING_LIMIT_ADDRESS_2
      if (owners.includes(constants.SPENDING_LIMIT_ADDRESS_2)) {
        owner = constants.SEPOLIA_OWNER_2
      }

      ownerP.waitForConnectionStatus()
      recovery.postponeRecovery()

      recovery.clickOnStartRecoveryBtn()
      recovery.enterOwnerAddress(owner)
      recovery.clickOnNextBtn()
      recovery.clickOnRecoveryExecuteBtn()
      recovery.clickOnGoToQueueBtn()
      cy.wait(10000)
      recovery.clickOnRecoveryExecuteBtn()
      cy.wait(10000)
      recovery.verifyTxNotInQueue()
      cy.wait(2000)

      main.fetchSafeData(constants.SEPOLIA_TEST_SAFE_24_RECOVERY_2.substring(4)).then((response) => {
        const owners = response.body.owners
        expect(owners).to.include(owner)
      })
    })
  })
})
