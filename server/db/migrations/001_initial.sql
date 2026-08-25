CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  email_verified_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','SUSPENDED','DELETED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS roles (
  name TEXT PRIMARY KEY CHECK (name IN ('VISITOR','USER','ARTISAN','ORGANIZATION','VERIFIER','ADMIN'))
);

INSERT INTO roles (name) VALUES ('VISITOR'),('USER'),('ARTISAN'),('ORGANIZATION'),('VERIFIER'),('ADMIN') ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS user_roles (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_name TEXT NOT NULL REFERENCES roles(name),
  PRIMARY KEY (user_id, role_name)
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS regions (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS heritage_records (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  region_id TEXT,
  district TEXT,
  category TEXT,
  verification_status TEXT NOT NULL,
  is_prototype BOOLEAN NOT NULL DEFAULT FALSE,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS heritage_search_idx ON heritage_records (region_id, district, category, published);

CREATE TABLE IF NOT EXISTS heritage_sources (
  id TEXT PRIMARY KEY,
  heritage_id TEXT NOT NULL REFERENCES heritage_records(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  source_url TEXT,
  verification_status TEXT NOT NULL,
  verified_by TEXT,
  verified_at TIMESTAMPTZ,
  last_updated TIMESTAMPTZ,
  image_source TEXT,
  image_license TEXT,
  evidence_metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE IF NOT EXISTS heritage_images (
  id TEXT PRIMARY KEY,
  heritage_id TEXT NOT NULL REFERENCES heritage_records(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  source TEXT,
  license TEXT,
  is_prototype BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS artisan_profiles (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  owner_user_id TEXT REFERENCES users(id),
  region_id TEXT,
  district TEXT,
  verification_status TEXT NOT NULL,
  is_prototype BOOLEAN NOT NULL DEFAULT FALSE,
  public_profile JSONB NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  private_profile JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS artisan_verifications (
  id TEXT PRIMARY KEY,
  artisan_id TEXT NOT NULL REFERENCES artisan_profiles(id) ON DELETE CASCADE,
  reviewer_user_id TEXT REFERENCES users(id),
  status TEXT NOT NULL,
  source TEXT,
  evidence_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  notes TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS artisan_documents_metadata (
  id TEXT PRIMARY KEY,
  artisan_id TEXT NOT NULL REFERENCES artisan_profiles(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  storage_key TEXT NOT NULL,
  content_type TEXT,
  checksum TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cultural_stories (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  region_id TEXT,
  verification_status TEXT NOT NULL DEFAULT 'PROTOTYPE',
  is_prototype BOOLEAN NOT NULL DEFAULT FALSE,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS story_audio (
  id TEXT PRIMARY KEY,
  story_id TEXT NOT NULL REFERENCES cultural_stories(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  duration_seconds INTEGER,
  transcript TEXT,
  source TEXT,
  voice_type TEXT,
  is_prototype BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE TABLE IF NOT EXISTS crafts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  verification_status TEXT NOT NULL DEFAULT 'PROTOTYPE',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  artisan_id TEXT REFERENCES artisan_profiles(id),
  craft_id TEXT REFERENCES crafts(id),
  verification_status TEXT NOT NULL,
  is_prototype BOOLEAN NOT NULL DEFAULT FALSE,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS product_prices (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  price NUMERIC NOT NULL CHECK (price >= 0),
  currency TEXT NOT NULL DEFAULT 'INR',
  unit TEXT NOT NULL,
  source TEXT,
  source_url TEXT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_prototype BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE TABLE IF NOT EXISTS product_sources (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  source_url TEXT,
  verification_status TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS food_records (
  id TEXT PRIMARY KEY,
  region_id TEXT,
  verification_status TEXT NOT NULL DEFAULT 'PROTOTYPE',
  is_prototype BOOLEAN NOT NULL DEFAULT FALSE,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS food_sources (
  id TEXT PRIMARY KEY,
  food_id TEXT NOT NULL REFERENCES food_records(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  source_url TEXT,
  verification_status TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE IF NOT EXISTS weather_cache (
  cache_key TEXT PRIMARY KEY,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  payload JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS livelihood_records (
  id TEXT PRIMARY KEY,
  artisan_id TEXT NOT NULL REFERENCES artisan_profiles(id) ON DELETE CASCADE,
  period TEXT NOT NULL,
  payload JSONB NOT NULL,
  is_prototype BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS production_records (
  id TEXT PRIMARY KEY,
  artisan_id TEXT NOT NULL REFERENCES artisan_profiles(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id),
  units_produced INTEGER NOT NULL CHECK (units_produced >= 0),
  production_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS sales_records (
  id TEXT PRIMARY KEY,
  artisan_id TEXT NOT NULL REFERENCES artisan_profiles(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id),
  units_sold INTEGER NOT NULL CHECK (units_sold >= 0),
  selling_price NUMERIC NOT NULL CHECK (selling_price >= 0),
  sale_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS expense_records (
  id TEXT PRIMARY KEY,
  artisan_id TEXT NOT NULL REFERENCES artisan_profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  expense_date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS inventory_records (
  id TEXT PRIMARY KEY,
  artisan_id TEXT NOT NULL REFERENCES artisan_profiles(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity >= 0),
  reserved INTEGER NOT NULL DEFAULT 0 CHECK (reserved >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (artisan_id, product_id)
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  status TEXT NOT NULL CHECK (status IN ('PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED','REFUNDED')),
  currency TEXT NOT NULL DEFAULT 'INR',
  total NUMERIC NOT NULL CHECK (total >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC NOT NULL CHECK (unit_price >= 0)
);
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  provider_payment_id TEXT,
  status TEXT NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text TEXT,
  moderation_status TEXT NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS favorites (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, target_type, target_id)
);
CREATE TABLE IF NOT EXISTS trails (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS trail_stops (
  id TEXT PRIMARY KEY,
  trail_id TEXT NOT NULL REFERENCES trails(id) ON DELETE CASCADE,
  heritage_id TEXT NOT NULL REFERENCES heritage_records(id),
  stop_order INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS verification_records (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  status TEXT NOT NULL,
  reviewer_user_id TEXT REFERENCES users(id),
  source TEXT,
  evidence_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS community_submissions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  moderation_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  actor_user_id TEXT REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS audit_logs_created_idx ON audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS sales_artisan_idx ON sales_records (artisan_id, sale_date);
CREATE INDEX IF NOT EXISTS expenses_artisan_idx ON expense_records (artisan_id, expense_date);
CREATE INDEX IF NOT EXISTS production_artisan_idx ON production_records (artisan_id, production_date);
