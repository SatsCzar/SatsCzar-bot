const { Ok, Err, usecase, step, ifElse, checker } = require("@herbsjs/herbs")
const { herbarium } = require("@herbsjs/herbarium")
const Client = require("../entities/Client")
const ClientRepository = require("../../infra/database/clientRepository")
const verifyClient = require("./verifyClient")

const dependency = {
  ClientRepository,
  verifyClient,
}

const enableDisableFeature = (injection) =>
  usecase("Register client", {
    request: {
      client: Client,
      featureRequested: String,
    },

    response: {
      included: Boolean,
    },

    authorize: () => Ok(),

    setup: (ctx) => {
      ctx.di = Object.assign({}, dependency, injection)
      ctx.di.clientRepositoryInstance = new ctx.di.ClientRepository()
      ctx.di.verifyClientUsecase = ctx.di.verifyClient(ctx.di)
      ctx.data = {}
    },

    "Verify the request": step((ctx) => {
      const { client, featureRequested } = ctx.req

      if (!client.isValid() || checker.isEmpty(featureRequested)) return Err("Invalid data")

      delete client.errors

      return Ok()
    }),

    "Get the client": step(async (ctx) => {
      const { verifyClientUsecase } = ctx.di
      const { client } = ctx.req

      await verifyClientUsecase.authorize()
      const ucResponse = await verifyClientUsecase.run(client)

      if (ucResponse.isErr) return Err("Error when try to verify if the client is already registred")

      const { isRegistred } = ucResponse.ok

      if (!isRegistred) return Err("User not registred")

      ctx.data.clientFromDB = ucResponse.ok.client

      return Ok()
    }),

    "Verify if the feature requested is already active": step((ctx) => {
      const { featureRequested } = ctx.req
      const { clientFromDB } = ctx.data

      if (checker.isEmpty(clientFromDB.features)) clientFromDB.features = []

      const featureAlreadyActive = clientFromDB.features?.includes(featureRequested)

      ctx.data = {
        clientFromDB,
        featureRequested,
        featureAlreadyActive,
      }

      return Ok()
    }),

    "Verify if the feature is already active": ifElse({
      "Feature is active?": step((ctx) => {
        const { featureAlreadyActive } = ctx.data

        return Ok(featureAlreadyActive)
      }),

      "Then: Remove the feature": step(async (ctx) => {
        const { clientRepositoryInstance } = ctx.di
        const { featureRequested, clientFromDB } = ctx.data

        const features = clientFromDB.features.filter((feature) => feature != featureRequested)

        clientFromDB.features = features

        await clientRepositoryInstance.update(clientFromDB)

        ctx.ret.included = false

        return Ok()
      }),

      "Else: includes the feature": step(async (ctx) => {
        const { clientRepositoryInstance } = ctx.di
        const { featureRequested, clientFromDB } = ctx.data

        clientFromDB.features.push(featureRequested)

        await clientRepositoryInstance.update(clientFromDB)

        ctx.ret.included = true

        return Ok()
      }),
    }),
  })

module.exports = herbarium.usecases
  .add(enableDisableFeature, "enableDisableFeature")
  .metadata({ group: "Client", entity: Client }).usecase
