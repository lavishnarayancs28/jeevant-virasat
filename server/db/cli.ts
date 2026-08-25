import { loadConfig } from '../config/env'
import { Database } from './database'
import { seedDatabase } from './seed'

const config = loadConfig()
const db = new Database(config)
const command = process.argv[2] ?? 'migrate'

try {
  if (command === 'migrate') await db.migrate()
  else if (command === 'seed') await seedDatabase(db)
  else if (command === 'setup') await seedDatabase(db)
  else throw new Error(`Unknown database command: ${command}. Use migrate, seed, or setup.`)
} finally {
  await db.close()
}
