const runBot = require("./infra/bot")
const cronJobs = require("./infra/cron")
const config = require("./infra/config")

const botInstance = runBot()

if (config.cron.cronEnabled) cronJobs(botInstance)
