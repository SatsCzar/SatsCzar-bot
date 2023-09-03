const { Telegraf } = require("telegraf")
const config = require("../config")
const getBitcoinIndex = require("../../domain/usecases/getBitcoinIndex")
const getFearAndGreedIndex = require("../../domain/usecases/getFearAndGreedIndex")
const Client = require("../../domain/entities/Client")
const verifyClient = require("../../domain/usecases/verifyClient")
const changeClient = require("../../domain/usecases/changeClient")
const featuresEnum = require("../../domain/enums/features")
const botButtons = require("./components/botButtons")
const enableDisableFeature = require("../../domain/usecases/enableDisableFeature")

const runBot = () => {
  const bot = new Telegraf(config.token)

  bot.command("start", async (ctx) => {
    try {
      await ctx.reply("Eu sou um robô")
    } catch (error) {
      console.log(error)
    }
  })

  bot.command("bitcoin", async (ctx) => {
    try {
      const usecase = getBitcoinIndex()

      await usecase.authorize()

      const ucResponse = await usecase.run()

      if (ucResponse.isErr) await ctx.reply("Erro ao buscar o preço do Bitcoin")

      const { lastPrice, priceChangePercent } = ucResponse.ok

      await ctx.reply(`O preço do Bitcoin é de US$ ${lastPrice} com alteração de ${priceChangePercent}%`)
    } catch (error) {
      console.log(error)
    }
  })

  bot.command("fearandgreedindex", async (ctx) => {
    try {
      const usecase = getFearAndGreedIndex()

      await usecase.authorize()

      const ucResponse = await usecase.run()

      if (ucResponse.isErr) await ctx.reply("Erro ao buscar o índice")

      const { value, valueClassification } = ucResponse.ok

      await ctx.reply(`O índice é de ${value} - ${valueClassification}`)
    } catch (error) {
      console.log(error)
    }
  })

  bot.command("cadastro", async (ctx) => {
    try {
      await ctx.telegram.sendChatAction(ctx.update.message.chat.id, "typing")
      const name = ctx.update.message.from.first_name

      const params = {
        username: ctx.update.message.from.username,
        language: ctx.update.message.from.language_code,
        type: ctx.update.message.chat.type,
        chatId: ctx.message.chat.id,
      }

      const cliente = Client.fromTelegram(params)

      const usecase = verifyClient()

      await usecase.authorize()

      const ucResponse = await usecase.run(cliente)

      if (ucResponse.isErr) {
        await ctx.reply("Erro ao consultar seu cadastro")
        return
      }

      const { isRegistred, client } = ucResponse.ok

      if (isRegistred) {
        const buttons = [botButtons.unsubscribe]

        const hasBitcoinPriceFeature = client.features?.includes(featuresEnum.bitcoinPrice)

        if (hasBitcoinPriceFeature) {
          buttons.push(botButtons.disableBitcoinPrice)
        }

        if (!hasBitcoinPriceFeature) {
          buttons.push(botButtons.enableBitcoinPrice)
        }

        await ctx.reply(`Olá ${name}, este chat já está cadastrado`, {
          reply_markup: {
            inline_keyboard: buttons,
          },
        })

        return
      }

      await ctx.reply(
        `Olá ${name}, este chat ainda não está cadastrado\nAo se cadastrar, você concorda com nossa [política de privacidade](https://satsczar.top/politica-de-privacidade.html)`,
        {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [botButtons.register],
          },
        },
      )
    } catch (error) {
      console.log(error)
    }
  })

  bot.action("changeRegister", async (ctx) => {
    try {
      await ctx.editMessageReplyMarkup()
      await ctx.telegram.sendChatAction(ctx.update.callback_query.message.chat.id, "typing")
      await ctx.deleteMessage(ctx.update.callback_query.inline_message_id)
      const name = ctx.update.callback_query.from.first_name

      const params = {
        username: ctx.update.callback_query.message.chat.username,
        type: ctx.update.callback_query.message.chat.type,
        chatId: ctx.update.callback_query.message.chat.id,
        language: ctx.update.callback_query.from.language_code,
      }

      if (params.type !== "private") {
        params.groupInfo = {
          title: ctx.update.callback_query.message.chat.title,
          members: await ctx.telegram.getChatMembersCount(ctx.update.callback_query.message.chat.id),
          admins: await ctx.telegram.getChatAdministrators(ctx.update.callback_query.message.chat.id),
        }
      }

      const cliente = Client.fromTelegram(params)

      const usecase = changeClient()

      await usecase.authorize()

      const ucResponse = await usecase.run(cliente)

      if (ucResponse.isErr) {
        console.log(ucResponse.err)

        await ctx.reply("Ocorreu um erro interno no servidor")
        return
      }

      const { wasRegistred } = ucResponse.ok

      if (wasRegistred) {
        await ctx.reply("Descadastrado com sucesso")

        return
      }

      await ctx.reply(`Olá ${name}, este chat foi cadastrado com sucesso.`, {
        reply_markup: {
          inline_keyboard: [botButtons.enableBitcoinPrice],
        },
      })
    } catch (error) {
      console.log(error)
    }
  })

  bot.action("enableDisableBitcoinPrice", async (ctx) => {
    try {
      await ctx.telegram.sendChatAction(ctx.update.callback_query.message.chat.id, "typing")
      await ctx.deleteMessage(ctx.update.callback_query.inline_message_id)

      const params = {
        client: Client.fromTelegram({
          chatId: ctx.update.callback_query.message.chat.id,
        }),
        featureRequested: featuresEnum.bitcoinPrice,
      }

      const usecase = enableDisableFeature()

      await usecase.authorize()

      const ucResponse = await usecase.run(params)

      if (ucResponse.isErr) {
        console.log(ucResponse.err)

        await ctx.reply(`Ocorreu um erro interno no servidor, ${ucResponse.err}`)
        return
      }

      const { included } = ucResponse.ok

      if (included) {
        await ctx.reply("Cadastrado com sucesso para receber o preço do Bitcoin")

        return
      }

      await ctx.reply("Descadastrado com sucesso.")
    } catch (error) {
      console.log(error)
    }
  })

  bot.launch()
  console.log("🤖 Bot funcionando \n")

  return bot
}

module.exports = runBot
