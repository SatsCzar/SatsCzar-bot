const { Ok } = require("@herbsjs/herbs")
const { expect } = require("chai")
const FearAndGreedIndex = require("../../../src/domain/entities/FearAndGreedIndex")
const getFearAndGreedIndex = require("../../../src/domain/usecases/getFearAndGreedIndex")

describe("Usecase getFearAndGreedIndex", () => {
  let usecase

  const defaultInjection = {
    fearAndGreedClient: class {
      getFearAndGreedIndex() {
        const data = {
          value: "52",
          value_classification: "Neutral",
          timestamp: "1689984000",
        }
        return Ok(FearAndGreedIndex.fromAlternativeMe(data))
      }
    },
  }

  beforeEach(async () => {
    usecase = getFearAndGreedIndex(defaultInjection)
    await usecase.authorize()
  })

  it("Should return a valid FearAndGreedIndex entity when client return valid data", async () => {
    const ucResponse = await usecase.run()

    expect(ucResponse.isOk).to.be.true
    expect(ucResponse.ok).is.instanceOf(FearAndGreedIndex)
  })
})
