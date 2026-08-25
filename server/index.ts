import { createServer } from 'node:http'
import { createApp } from './app'
import { loadConfig, safeConfigSummary } from './config/env'
import { Database } from './db/database'

const config = loadConfig()
const db = new Database(config)

if (!db.enabled) {
  const message = 'DATABASE_URL is not configured; using the explicitly-labelled in-memory development fallback.'
  if (config.requireDatabase || (config.nodeEnv === 'production' && config.requireProductionConfig)) throw new Error(message)
  console.warn(message)
}
console.log('Jeevant Virasat configuration', safeConfigSummary(config))

const app = createApp({ config, db })
createServer(app).listen(config.port, config.host, () => {
  console.log(`Jeevant Virasat server listening on ${config.host}:${config.port}`)
})
