const { usecase, step, Ok, Err, checker, request } = require("@herbsjs/herbs")
const ClientRepository = require("../../infra/database/clientRepository")
const Client = require("../entities/Client")
const { herbarium } = require("@herbsjs/herbarium")

const dependency = {
  ClientRepository,
}

const verifyClient = (injection) =>
  usecase("Verify if the client is registred", {
    request: request.from(Client, { ignoreIds: true }),

    response: {
      isRegistred: Boolean,
      client: Client,
    },

    authorize: () => Ok(),

    setup: (ctx) => {
      ctx.di = Object.assign({}, dependency, injection)
      ctx.di.clientRepositoryInstance = new ctx.di.ClientRepository()
      ctx.data = {}
    },

    "Verify the request": step((ctx) => {
      const client = ctx.req

      if (!client.isValid()) return Err("Invalid data")

      return Ok()
    }),

    "Find the client in database": step(async (ctx) => {
      const client = ctx.req
      const { clientRepositoryInstance } = ctx.di

      const clientFromDB = await clientRepositoryInstance.find({
        filter: {
          chat_id: client.chatId,
        },
      })

      if (checker.isEmpty(clientFromDB)) {
        ctx.ret.isRegistred = false
        return Ok(ctx.stop())
      }

      ctx.ret.client = clientFromDB[0]
      ctx.ret.isRegistred = true

      return Ok()
    }),
  })

module.exports = herbarium.usecases
  .add(verifyClient, "VerifyClient")
  .metadata({ group: "Client", entity: Client }).usecase
