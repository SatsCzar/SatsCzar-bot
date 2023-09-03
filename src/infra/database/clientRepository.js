const { Repository } = require("@herbsjs/herbs2mongo")
const { herbarium } = require("@herbsjs/herbarium")
const connection = require("./connection")
const Client = require("../../domain/entities/Client")
const config = require("../config")

class ClientRepository extends Repository {
  constructor() {
    super({
      entity: Client,
      collection: "clients",
      database: config.database.dbName,
      ids: ["id"],
      mongodb: connection,
    })
  }

  async findAllByFeature(feature) {
    return this.find({
      filter: { features: feature },
    })
  }
}

module.exports = herbarium.repositories
  .add(ClientRepository, "ClientRepository")
  .metadata({ entity: Client }).repository
