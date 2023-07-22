const axios = require("axios")
const { Ok, Err } = require("@herbsjs/herbs")
const FearAndGreedIndex = require("../../domain/entities/FearAndGreedIndex")

class AlternativeMeClient {
  constructor() {
    this._axios = axios.create({
      baseURL: "https://api.alternative.me/",
    })
  }

  getFearAndGreedIndex() {
    return this._axios
      .get("fng")
      .then(({ data }) => {
        const errors = data.metadata.error
        if (errors != null) return Err(errors)

        const fearAndGreed = data.data[0]
        return Ok(FearAndGreedIndex.fromAlternativeMe(fearAndGreed))
      })
      .catch((error) => Err(error.message))
  }
}

module.exports = AlternativeMeClient
