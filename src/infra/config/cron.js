module.exports = {
  cronEnabled: process.env.CRON_ENABLED === "true",
  cronSchedule: process.env.CRON_SCHEDULE,
}
