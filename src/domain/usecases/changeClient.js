const { Ok, Err, usecase, step, request, ifElse } = require("@herbsjs/herbs")
const { herbarium } = require("@herbsjs/herbarium")
const Client = require("../entities/Client")
const ClientRepository = require("../../infra/database/clientRepository")
const verifyClient = require("./verifyClient")

const dependency = {
  ClientRepository,
  verifyClient,
}

const changeClient = (injection) =>
  usecase("Register or remove client", {
    request: request.from(Client, { ignoreIds: true }),

    response: {
      wasRegistred: Boolean,
    },

    authorize: () => Ok(),

    setup: (ctx) => {
      ctx.di = Object.assign({}, dependency, injection)
      ctx.di.clientRepositoryInstance = new ctx.di.ClientRepository()
      ctx.di.verifyClientUsecase = ctx.di.verifyClient(ctx.di)
      ctx.data = {}
    },

    "Verify the request": step((ctx) => {
      const client = ctx.req

      if (!client.isValid()) return Err("Invalid data")

      delete client.errors

      return Ok()
    }),

    "Verify if the client is already registred": ifElse({
      "isRegistred?": step(async (ctx) => {
        const { verifyClientUsecase } = ctx.di
        const client = ctx.req

        await verifyClientUsecase.authorize()
        const ucResponse = await verifyClientUsecase.run(client)

        if (ucResponse.isErr) return Err("Error when try to verify if the client is already registred")

        ctx.data.isRegistred = ucResponse.ok.isRegistred
        ctx.data.client = ucResponse.ok.client

        return Ok(ctx.data.isRegistred)
      }),

      "Then: Delete the client": step(async (ctx) => {
        const { clientRepositoryInstance } = ctx.di
        const { client } = ctx.data

        await clientRepositoryInstance.delete(client)

        ctx.ret.wasRegistred = true

        return Ok()
      }),

      "Else: Register the client": step(async (ctx) => {
        const client = ctx.req
        const { clientRepositoryInstance } = ctx.di

        await clientRepositoryInstance.insert(client)

        ctx.ret.wasRegistred = false

        return Ok()
      }),
    }),
  })

module.exports = herbarium.usecases
  .add(changeClient, "changeClient")
  .metadata({ group: "Client", entity: Client }).usecase
