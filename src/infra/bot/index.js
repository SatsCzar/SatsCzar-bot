const { Telegraf } = require("telegraf")
const config = require("../config")
const getBitcoinIndex = require("../../domain/usecases/getBitcoinIndex")
const getFearAndGreedIndex = require("../../domain/usecases/getFearAndGreedIndex")

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

  bot.command("fearAndGreedIndex", async (ctx) => {
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

  bot.launch()
  console.log("🤖 Bot funcionando \n")

  return bot
}

module.exports = runBot
