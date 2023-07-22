const axios = require("axios")
const { Ok, Err } = require("@herbsjs/herbs")
const BitcoinIndex = require("../../domain/entities/BitcoinIndex")

class BinanceClient {
  constructor() {
    this._axios = axios.create({
      baseURL: "https://api.binance.com/api/v3/",
    })
  }

  getBitcoinPriceAndChange() {
    return this._axios
      .get("ticker/24hr", {
        params: {
          symbol: "BTCUSDT",
        },
      })
      .then(({ data }) => Ok(BitcoinIndex.fromBinance(data)))
      .catch((error) => Err(error.message))
  }
}

module.exports = BinanceClient
