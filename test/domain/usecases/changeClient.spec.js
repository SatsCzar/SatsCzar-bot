const { expect } = require("chai")
const changeClient = require("../../../src/domain/usecases/changeClient")
const Client = require("../../../src/domain/entities/Client")

describe("Usecase changeClient", () => {
  it("Should register a client if he is not registered", async () => {
    const clientData = {
      chatId: 101010,
      type: "Private",
    }

    class mockClientRepository {
      find() {
        return []
      }
      insert() {
        return Promise.resolve()
      }
    }

    const injection = {
      clientRepository: mockClientRepository,
    }

    const uc = changeClient(injection)
    await uc.authorize()
    const response = await uc.run(Client.fromJSON(clientData))

    expect(response.isOk).to.be.true
    expect(response.ok.wasRegistred).to.be.false
  })

  it("Should delete a client if he is registered", async () => {
    const clientData = {
      chatId: 11121245,
      type: "Private",
    }

    const client = Client.fromJSON(clientData)

    class mockClientRepository {
      find() {
        return [client]
      }
      delete() {
        return Promise.resolve()
      }
    }

    const injection = {
      clientRepository: mockClientRepository,
    }

    const uc = changeClient(injection)
    await uc.authorize()
    const response = await uc.run(client)

    expect(response.isOk).to.be.true
    expect(response.ok.wasRegistred).to.be.true
  })
})
