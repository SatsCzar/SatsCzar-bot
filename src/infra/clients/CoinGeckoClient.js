const axios = require("axios")
const { Ok, Err } = require("@herbsjs/herbs")
const BitcoinIndex = require("../../domain/entities/BitcoinIndex")

class CoinGeckoClient {
  constructor() {
    this._axios = axios.create({
      baseURL: "https://api.coingecko.com/api/v3/",
    })
  }

  getBitcoinPriceAndChange() {
    return this._axios
      .get("simple/price", {
        params: {
          ids: "bitcoin",
          vs_currencies: "usd",
          include_24hr_change: true,
        },
      })
      .then(({ data }) => Ok(BitcoinIndex.fromCoinGecko(data)))
      .catch((error) => Err(error.message))
  }
}

module.exports = CoinGeckoClient
