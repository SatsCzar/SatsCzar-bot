const { entity, field } = require("@herbsjs/herbs")
const { herbarium } = require("@herbsjs/herbarium")

const FearAndGreedIndex = entity("FearAndGreedIndex", {
  value: field(String),
  valueClassification: field(String),
  date: field(Date),
})

const fromAlternativeMe = (data) => {
  const timeStampInSeconds = data.timestamp
  const timeStampInMilliseconds = parseInt(timeStampInSeconds) * 1000

  return FearAndGreedIndex.fromJSON({
    value: data.value,
    valueClassification: data.value_classification,
    date: new Date(timeStampInMilliseconds),
  })
}

module.exports = herbarium.entities.add(FearAndGreedIndex, "FearAndGreedIndex").entity
module.exports.fromAlternativeMe = fromAlternativeMe
