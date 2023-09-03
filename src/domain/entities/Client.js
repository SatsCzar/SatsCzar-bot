const { herbarium } = require("@herbsjs/herbarium")
const { entity, field, id, checker } = require("@herbsjs/herbs")

const Group = entity("Group", {
  title: field(String),
  members: field(Number),
  admins: field([String]),
})

const Client = entity("Client", {
  id: id(String),
  username: field(String),
  type: field(String),
  chatId: field(Number, { validation: { presence: true } }),
  group: field(Group),
  language: field(String),
  features: field([String], { default: () => [] }),
})

const fromTelegram = ({ username, type, chatId, features, language, groupInfo }) => {
  const client = new Client()

  client.username = username
  client.type = type
  client.chatId = chatId
  client.language = language

  if (!checker.isEmpty(features)) client.features = features
  if (!checker.isEmpty(groupInfo)) {
    const group = Group.fromJSON({
      ...groupInfo,
      admins: groupInfo.admins.map((admin) => admin?.user?.username),
    })

    client.group = group
  }

  return client
}

module.exports = herbarium.entities.add(Client, "Client").entity
module.exports.fromTelegram = fromTelegram
