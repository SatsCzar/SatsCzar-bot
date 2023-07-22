const { herbarium } = require("@herbsjs/herbarium")
const { entity, field } = require("@herbsjs/herbs")

const BitcoinIndex = entity("BitcoinIndex", {
  lastPrice: field(String),
  priceChangePercent: field(String),
})

const fromCoinGecko = ({ bitcoin }) => {
  const bitcoinIndex = new BitcoinIndex()

  bitcoinIndex.lastPrice = bitcoin?.usd.toString()
  bitcoinIndex.priceChangePercent = bitcoin.usd_24h_change?.toFixed(2)

  return bitcoinIndex
}

module.exports = herbarium.entities.add(BitcoinIndex, "BitcoinIndex").entity
module.exports.fromCoinGecko = fromCoinGecko
