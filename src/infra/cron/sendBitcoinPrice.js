// eslint-disable-next-line no-unused-vars
const { Telegraf } = require("telegraf")
const getBitcoinIndex = require("../../domain/usecases/getBitcoinIndex")
const config = require("../config")
const sendMessageByFeature = require("../../domain/usecases/sendMessageByFeature")
const featuresEnum = require("../../domain/enums/features")

/**
 * @param {Telegraf<Context<Update>>} bot
 * */
const sendBitcoinPrice = async (bot) => {
  try {
    const priceUseCase = getBitcoinIndex()
    await priceUseCase.authorize()

    const priceUseCaseResult = await priceUseCase.run()

    if (priceUseCaseResult.isErr) {
      console.log(`Error in getBitcoinIndex: ${sendMessageUcResult.err}`)
      await enviaMensagemErro(bot, priceUseCaseResult.err)
      return
    }

    const { lastPrice, priceChangePercent } = priceUseCaseResult.ok

    const message = `O preço do Bitcoin é de US$ ${lastPrice} com alteração de ${priceChangePercent}%`

    const sendMessageUc = sendMessageByFeature({ bot })

    await sendMessageUc.authorize()

    const sendMessageUcResult = await sendMessageUc.run({
      message,
      feature: featuresEnum.bitcoinPrice,
    })

    if (sendMessageUcResult.isErr) {
      console.log(`Error in sendBitcoinPrice: ${sendMessageUcResult.err}`)
      await enviaMensagemErro(bot, sendMessageUcResult.err)
      return
    }
  } catch (error) {
    console.log(error)
  }
}

const enviaMensagemErro = async (bot, mensagem) => {
  await bot.telegram.sendMessage(config.ownerChatId, mensagem)
}

module.exports = sendBitcoinPrice
