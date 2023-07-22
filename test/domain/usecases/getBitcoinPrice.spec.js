const { Ok } = require("@herbsjs/herbs")
const BitcoinIndex = require("../../../src/domain/entities/BitcoinIndex")
const getBitcoinIndex = require("../../../src/domain/usecases/getBitcoinIndex")
const { expect } = require("chai")

describe("Usecase getBitcoinPrice", () => {
  let usecase

  const defaultInjection = {
    bitcoinPriceClient: class {
      getBitcoinPriceAndChange() {
        const data = {
          lastPrice: "29934.45555",
          priceChangePercent: "0.061",
        }
        return Ok(BitcoinIndex.fromBinance(data))
      }
    },
  }

  beforeEach(async () => {
    usecase = getBitcoinIndex(defaultInjection)
    await usecase.authorize()
  })

  it("Should return a valid BitcoinIndex entity when client return valid data", async () => {
    const ucResponse = await usecase.run()

    expect(ucResponse.isOk).to.be.true
    expect(ucResponse.ok).is.instanceOf(BitcoinIndex)
  })
})
