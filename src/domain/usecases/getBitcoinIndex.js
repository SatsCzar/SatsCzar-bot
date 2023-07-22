const { Ok, Err, usecase, step } = require("@herbsjs/herbs")
const { herbarium } = require("@herbsjs/herbarium")
const BitcoinIndex = require("../entities/BitcoinIndex")
const BinanceClient = require("../../infra/clients/BinanceClient")

const dependency = {
  bitcoinPriceClient: BinanceClient,
}

const getBitcoinIndex = (injection) =>
  usecase("Get the bitcoin index", {
    request: {},

    response: BitcoinIndex,

    authorize: () => Ok(),

    setup: (ctx) => {
      ctx.di = Object.assign({}, dependency, injection)
      ctx.di.clientInstance = new ctx.di.bitcoinPriceClient()
    },

    "Get bitcoin price from external api and return": step(async (ctx) => {
      const { clientInstance } = ctx.di

      const response = await clientInstance.getBitcoinPriceAndChange()

      if (response.isErr) return Err("")

      ctx.ret = response.ok
      return Ok()
    }),
  })

module.exports = herbarium.usecases
  .add(getBitcoinIndex, "GetBitcoinIndex")
  .metadata({ group: "Price", entity: BitcoinIndex }).usecase
