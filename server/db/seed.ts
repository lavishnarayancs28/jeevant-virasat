import { demoData } from '../../shared/data'
import type { Database } from './database'
import { randomUUID } from 'node:crypto'

export async function seedDatabase(db: Database) {
  if (!db.enabled) throw new Error('DATABASE_URL is required to seed PostgreSQL.')
  await db.migrate()
  await db.transaction(async (client) => {
    for (const region of demoData.regions) await client.query('INSERT INTO regions (id, slug, payload) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING', [region.id, region.slug, JSON.stringify(region)])
    for (const item of demoData.heritage) {
      await client.query('INSERT INTO heritage_records (id, slug, region_id, district, category, verification_status, is_prototype, payload) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (id) DO NOTHING', [item.id, item.slug, item.regionId, item.district, item.category, item.provenance?.verificationStatus ?? 'PROTOTYPE', item.provenance?.isPrototype ?? true, JSON.stringify(item)])
      if (item.provenance) await client.query('INSERT INTO heritage_sources (id, heritage_id, source, source_url, verification_status, last_updated, image_source, image_license) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (id) DO NOTHING', [randomUUID(), item.id, item.provenance.source, item.provenance.sourceUrl, item.provenance.verificationStatus, item.provenance.lastUpdated, item.provenance.imageSource ?? null, item.provenance.imageLicense ?? null])
    }
    for (const artisan of demoData.artisans) await client.query('INSERT INTO artisan_profiles (id, slug, region_id, district, verification_status, is_prototype, public_profile, payload) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (id) DO NOTHING', [artisan.id, artisan.slug, artisan.regionId, artisan.district, artisan.verificationStatus, artisan.isPrototype, JSON.stringify(artisan), JSON.stringify(artisan)])
    for (const story of demoData.stories) await client.query('INSERT INTO cultural_stories (id, slug, region_id, verification_status, is_prototype, payload) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO NOTHING', [story.id, story.slug, story.regionId, 'PROTOTYPE', true, JSON.stringify(story)])
    for (const product of demoData.products) await client.query('INSERT INTO products (id, slug, artisan_id, verification_status, is_prototype, payload) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO NOTHING', [product.id, product.slug, product.artisanId, product.verificationStatus, product.isPrototype, JSON.stringify(product)])
    for (const record of demoData.livelihoodRecords) await client.query('INSERT INTO livelihood_records (id, artisan_id, period, payload, is_prototype) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (id) DO NOTHING', [randomUUID(), record.artisanId, record.period, JSON.stringify(record), record.isPrototype])
    for (const food of demoData.heritage.filter((item) => item.category === 'Food')) await client.query('INSERT INTO food_records (id, region_id, verification_status, is_prototype, payload) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (id) DO NOTHING', [food.id, food.regionId, food.provenance?.verificationStatus ?? 'PROTOTYPE', true, JSON.stringify(food)])
  })
  console.log(`Seeded existing dataset: ${demoData.heritage.length} heritage records, ${demoData.artisans.length} artisan records, ${demoData.products.length} products.`)
}
