const { expect } = require("chai")
const sinon = require("sinon")
const enableDisableFeature = require("../../../src/domain/usecases/enableDisableFeature")
const Client = require("../../../src/domain/entities/Client")
const featuresEnum = require("../../../src/domain/enums/features")
const ClientRepository = require("../../../src/infra/database/clientRepository")

describe.only("Usecase enableDisableFeature", () => {
  let clientRepositoryMock
  let clientRepositoryConstructor

  const clientExample = Client.fromTelegram({
    username: "SlavaUkraini",
    chatId: 10101,
    features: [],
  })

  beforeEach(() => {
    clientRepositoryMock = {
      find: sinon.stub(),
      update: sinon.stub(),
    }

    clientRepositoryConstructor = sinon.stub(ClientRepository, "constructor").returns(clientRepositoryMock)
  })

  afterEach(() => {
    sinon.restore()
  })

  it("Should include the feature if the costumer don't have the feature", async () => {
    const params = {
      client: Client.fromTelegram({
        chatId: 101010,
      }),
      featureRequested: featuresEnum.bitcoinPrice,
    }

    clientRepositoryMock.find.returns([clientExample])

    const uc = enableDisableFeature({ clientRepository: clientRepositoryConstructor })
    await uc.authorize()
    const response = await uc.run(params)

    expect(clientRepositoryMock.update.calledOnce).to.be.true
    expect(response.isOk).to.be.true
    expect(response.ok.included).to.be.true
  })

  it("Should delete the feature if the costumer have the feature", async () => {
    const params = {
      client: Client.fromTelegram({
        chatId: 101010,
      }),
      featureRequested: featuresEnum.bitcoinPrice,
    }

    const clientWithFeature = {
      ...clientExample,
      features: [featuresEnum.bitcoinPrice],
    }

    clientRepositoryMock.find.returns([clientWithFeature])

    const uc = enableDisableFeature({ clientRepository: clientRepositoryConstructor })
    await uc.authorize()
    const response = await uc.run(params)

    expect(clientRepositoryMock.update.calledOnce).to.be.true
    expect(response.isOk).to.be.true
    expect(response.ok.included).to.be.false
  })
})
