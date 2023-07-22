const { Ok, Err, usecase, step } = require("@herbsjs/herbs")
const { herbarium } = require("@herbsjs/herbarium")
const FearAndGreedIndex = require("../entities/FearAndGreedIndex")
const AlternativeMeClient = require("../../infra/clients/AlternativeMeClient")

const dependency = {
  fearAndGreedClient: AlternativeMeClient,
}

const getFearAndGreedIndex = (injection) =>
  usecase("Get the Fear and Greed index", {
    request: {},

    response: FearAndGreedIndex,

    authorize: () => Ok(),

    setup: (ctx) => {
      ctx.di = Object.assign({}, dependency, injection)
      ctx.di.clientInstance = new ctx.di.fearAndGreedClient()
    },

    "Get Fear and Greed index from external api and return": step(async (ctx) => {
      const { clientInstance } = ctx.di

      const response = await clientInstance.getFearAndGreedIndex()

      if (response.isErr) return Err("")

      ctx.ret = response.ok
      return Ok()
    }),
  })

module.exports = herbarium.usecases
  .add(getFearAndGreedIndex, "GetFearAndGreedIndex")
  .metadata({ group: "Price", entity: FearAndGreedIndex }).usecase
