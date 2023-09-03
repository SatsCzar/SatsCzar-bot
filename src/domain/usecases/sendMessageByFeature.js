const { usecase, step, Ok, Err, checker } = require("@herbsjs/herbs")
const { herbarium } = require("@herbsjs/herbarium")
const featuresEnum = require("../enums/features")
const ClientRepository = require("../../infra/database/clientRepository")

const dependency = {
  ClientRepository,
}

const sendMessageByFeature = (injection) =>
  usecase("Send message to all clients with the feature", {
    request: {
      feature: String,
      message: String,
    },

    authorize: async () => Ok(),

    setup: (ctx) => {
      ctx.di = Object.assign({}, dependency, injection)
      ctx.di.clientRepositoryInstance = new ctx.di.ClientRepository()
      ctx.data = {}
    },

    "Verify the feature": step((ctx) => {
      const { feature, message } = ctx.req
      const features = Object.values(featuresEnum)

      const isValidFeature = features.includes(feature)

      if (!isValidFeature || checker.isEmpty(message))
        return Err.invalidArguments({
          message: "Invalid feature or message",
          payload: { feature, message },
        })

      return Ok()
    }),

    "Find all clients with this feature": step(async (ctx) => {
      const { clientRepositoryInstance } = ctx.di
      const { feature } = ctx.req

      try {
        const clients = await clientRepositoryInstance.findAllByFeature(feature)

        if (checker.isEmpty(clients))
          return Err.notFound({
            message: "Not found any client",
          })

        ctx.data.clients = clients

        return Ok()
      } catch (error) {
        return Err.unknown({
          message: "Error while try to get clients",
          cause: error.message,
        })
      }
    }),

    "Send the message to all clients": step(async (ctx) => {
      const { clients } = ctx.data
      const { message } = ctx.req
      const { bot } = ctx.di
      const errors = []

      const promises = clients.map(async (client) => {
        try {
          await bot.telegram.sendMessage(client.chatId, message)
        } catch (error) {
          console.log(`Error while try to send message to client ${client.chat_id}: ${error.message}`)
          errors.push({ client, error })
        }
      })

      await Promise.all(promises)

      ctx.data.errors = errors

      return Ok()
    }),
  })

module.exports = herbarium.usecases
  .add(sendMessageByFeature, "SendMessageByFeature")
  .metadata({ group: "Notification" }).usecase
