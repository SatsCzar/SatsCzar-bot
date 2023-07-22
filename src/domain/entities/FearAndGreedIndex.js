const { entity, field } = require("@herbsjs/herbs")
const { herbarium } = require("@herbsjs/herbarium")

const FearAndGreenIndex = entity("FearAndGreenIndex", {
  value: field(String),
  valueClassification: field(String),
  date: field(Date),
})

const fromAlternativeMe = (data) => {
  const timeStampInSeconds = data.timestamp
  const timeStampInMilliseconds = parseInt(timeStampInSeconds) * 1000

  return FearAndGreenIndex.fromJSON({
    value: data.value,
    valueClassification: data.value_classification,
    date: new Date(timeStampInMilliseconds),
  })
}

module.exports = herbarium.entities.add(FearAndGreenIndex, "FearAndGreenIndex").entity
module.exports.fromAlternativeMe = fromAlternativeMe
