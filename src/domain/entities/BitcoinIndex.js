const { herbarium } = require("@herbsjs/herbarium")
const { entity, field } = require("@herbsjs/herbs")

const BitcoinIndex = entity("BitcoinIndex", {
  lastPrice: field(String),
  priceChangePercent: field(String),
})

const fromBinance = (data) => {
  const bitcoinIndex = new BitcoinIndex()

  const lastPrice = Number(data.lastPrice).toFixed(2)

  bitcoinIndex.lastPrice = lastPrice
  bitcoinIndex.priceChangePercent = data.priceChangePercent

  return bitcoinIndex
}

module.exports = herbarium.entities.add(BitcoinIndex, "BitcoinIndex").entity
module.exports.fromBinance = fromBinance
