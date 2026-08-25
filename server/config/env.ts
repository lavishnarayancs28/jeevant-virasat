import { randomBytes } from 'node:crypto'

export type AppConfig = {
  nodeEnv: 'development' | 'test' | 'production'
  port: number
  host: string
  appUrl: string
  frontendUrl: string
  databaseUrl?: string
  sessionSecret: string
  sessionSecretEphemeral: boolean
  requireDatabase: boolean
  requireProductionConfig: boolean
  weatherApiKey?: string
  weatherProvider?: string
  trafficApiKey?: string
  trafficProvider?: string
  aiApiKey?: string
  storageBucket?: string
  storageAccessKey?: string
  storageSecretKey?: string
  paymentSecretKey?: string
  emailApiKey?: string
}

function optional(value: string | undefined) {
  const trimmed = value?.trim()
  return trimmed || undefined
}

function positiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number(value ?? fallback)
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) throw new Error('PORT must be an integer between 1 and 65535.')
  return parsed
}

export function loadConfig(environment: NodeJS.ProcessEnv = process.env): AppConfig {
  const nodeEnv = environment.NODE_ENV === 'production' ? 'production' : environment.NODE_ENV === 'test' ? 'test' : 'development'
  const databaseUrl = optional(environment.DATABASE_URL)
  const sessionSecret = optional(environment.SESSION_SECRET)
  const productionConfigRequired = environment.REQUIRE_PRODUCTION_CONFIG === 'true'
  const missing: string[] = []
  if (nodeEnv === 'production' && productionConfigRequired) {
    for (const name of ['DATABASE_URL', 'SESSION_SECRET', 'APP_URL', 'FRONTEND_URL']) {
      if (!optional(environment[name])) missing.push(name)
    }
  }
  if (missing.length) throw new Error(`Missing required production configuration: ${missing.join(', ')}.`)

  return {
    nodeEnv,
    port: positiveInteger(environment.PORT, 8787),
    host: optional(environment.HOST) ?? '0.0.0.0',
    appUrl: optional(environment.APP_URL) ?? `http://localhost:${environment.PORT ?? '8787'}`,
    frontendUrl: optional(environment.FRONTEND_URL) ?? `http://localhost:${environment.VITE_PORT ?? '5173'}`,
    databaseUrl,
    sessionSecret: sessionSecret ?? randomBytes(32).toString('hex'),
    sessionSecretEphemeral: !sessionSecret,
    requireDatabase: environment.REQUIRE_DATABASE === 'true',
    requireProductionConfig: productionConfigRequired,
    weatherApiKey: optional(environment.WEATHER_API_KEY),
    weatherProvider: optional(environment.WEATHER_PROVIDER) ?? 'openweathermap',
    trafficApiKey: optional(environment.TRAFFIC_API_KEY),
    trafficProvider: optional(environment.TRAFFIC_PROVIDER),
    aiApiKey: optional(environment.AI_API_KEY ?? environment.LLM_API_KEY),
    storageBucket: optional(environment.STORAGE_BUCKET),
    storageAccessKey: optional(environment.STORAGE_ACCESS_KEY),
    storageSecretKey: optional(environment.STORAGE_SECRET_KEY),
    paymentSecretKey: optional(environment.PAYMENT_SECRET_KEY),
    emailApiKey: optional(environment.EMAIL_API_KEY),
  }
}

export function safeConfigSummary(config: AppConfig) {
  return {
    nodeEnv: config.nodeEnv,
    port: config.port,
    host: config.host,
    databaseConfigured: Boolean(config.databaseUrl),
    sessionSecretConfigured: !config.sessionSecretEphemeral,
    weatherConfigured: Boolean(config.weatherApiKey),
    trafficConfigured: Boolean(config.trafficApiKey && config.trafficProvider),
    aiConfigured: Boolean(config.aiApiKey),
    storageConfigured: Boolean(config.storageBucket),
    paymentsConfigured: Boolean(config.paymentSecretKey),
    emailConfigured: Boolean(config.emailApiKey),
  }
}
