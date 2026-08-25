# Jeevant Virasat

Explore the India tourists don't see.

Jeevant Virasat is a full-stack prototype for SIH26195 — Heritage & Culture. It helps travelers discover living traditions, lesser-known places, local food, artisans and community stories, then turn those interests into a personalized cultural trail.

## What is implemented

- Editorial landing page focused on Kurukshetra, Haryana
- Heritage discovery with search, region/category/duration filters and URL state
- Real Leaflet/OpenStreetMap interactive map with selectable heritage markers
- Heritage detail pages with context, “still alive today” guidance, related stories and artisans
- Artisan discovery and profiles with a mock, clearly labelled connection action
- Editorial stories and related content
- Global grouped search across heritage, artisans, stories and regions
- Multi-step trail builder for interests, time and experience preference
- Deterministic recommendation service with duration limits and match explanations
- Trail result timeline with map integration
- Local-storage favorites for places, artisans, stories and trails
- Responsive navigation, empty/error/loading states, accessible labels and focusable controls
- Typed Express API and shared models/data contracts

The current data source is a typed in-memory demonstration dataset so the prototype runs without external credentials. The repository is structured so a repository/database adapter can replace `shared/data.ts` without changing the UI contract.

## Architecture

```text
src/                  React presentation, routes and client services
  components/         Layout, cards, map and trail-builder UI
  lib/                API client and local favorites service
shared/               Domain types and demonstration seed data
server/               Express API and recommendation service
tests/                Recommendation business-logic tests
```

The browser talks to `/api/*`. Vite proxies those requests to the Express server during development. The trail builder only knows the `POST /api/trails/generate` contract; the server owns the recommendation implementation.

## Requirements

- Node.js 20+
- npm 10+

## Setup

```bash
npm install
copy .env.example .env
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

The API runs on [http://localhost:8787](http://localhost:8787). Set `PORT` in `.env` if needed; Vite reads the same value for its development proxy.

## Verification commands

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm start
```

The package scripts call local tool entry points directly because this project lives in a Windows folder whose name contains `&`, which can break npm’s generated `.bin` PATH. Vite’s development optimizer is constrained to an explicit dependency include list for the same Windows path edge case; production builds still use normal bundling.

## Render deployment

This repository is configured as a single Render web service: the build creates the Vite frontend in `dist`, and the Express server serves that frontend plus `/api/*` from the same process.

Recommended Render settings:

```text
Environment: Node
Build command: npm install && npm run build
Start command: npm start
```

Render provides `PORT` automatically. The server listens on `0.0.0.0` and keeps `8787` only as the local-development fallback. A matching `render.yaml` blueprint is included for one-click configuration.

## API endpoints

```text
GET  /api/health
GET  /api/regions
GET  /api/regions/:slug
GET  /api/heritage?search=&region=&category=&duration=&sort=
GET  /api/heritage/:slug
GET  /api/artisans?search=&region=
GET  /api/artisans/:slug
GET  /api/stories?search=&region=
GET  /api/stories/:slug
GET  /api/search?q=
POST /api/trails/generate
GET  /api/trails/:id
```

Example trail request:

```json
{
  "interests": ["Crafts", "Food", "Local Stories"],
  "timeChoice": "Half day",
  "experienceType": "Cultural & Social",
  "regionSlug": "region-kurukshetra"
}
```

## Recommendation logic

`server/recommendation.ts` validates input, ranks compatible heritage locations and selects stops without exceeding the selected time budget. Scoring considers category, tags, duration fit, region fit and experience preference. The service is intentionally deterministic for the MVP and is isolated so an LLM-backed implementation can be introduced later without exposing secrets to the browser.

## Content and authenticity

Demonstration entries are deliberately marked when claims need research. The app does not invent UNESCO status, official certifications, testimonials, reviews, statistics or partnerships. Prototype content should be validated with cultural researchers, local institutions and community practitioners before public deployment.

Map tiles are provided by OpenStreetMap. If tiles are unavailable, the marker list and heritage navigation remain usable.

## Backend foundation

The Express server now has a modular production foundation while retaining the existing frontend and response contracts:

- `server/config` validates environment configuration and never logs secret values.
- `server/db` provides parameterized PostgreSQL queries, forward-only migrations, and a seed command for the current Haryana dataset.
- `server/repositories` selects PostgreSQL when `DATABASE_URL` is configured and uses an explicitly labelled in-memory development fallback otherwise.
- `server/auth`, `server/middleware`, `server/services`, and `server/integrations` provide secure sessions, RBAC, request IDs, validation, audit logging, private livelihood records, and provider adapters.
- `docs/openapi.yaml` documents the public, authenticated, private, moderation, and disabled-commerce endpoints.

The current dataset is seeded without changing its provenance. Prototype artisans, prices, food placeholders, livelihood examples, deterministic trail recommendations, and deterministic Ask Jeevant responses remain labelled as prototype or fallback data. QR responses verify a Jeevant Virasat record only; they are not government certification, legal identity, or official approval.

## Database setup

Configure `DATABASE_URL` and a non-committed `SESSION_SECRET`, then run:

```bash
npm run db:migrate
npm run db:seed
```

`npm run db:setup` runs both. Migrations are forward-only in this foundation; production schema changes must be made through reviewed migration files. Without `DATABASE_URL`, local development continues with the in-memory fallback and private writes remain process-local. Set `REQUIRE_DATABASE=true` to fail startup when PostgreSQL is unavailable.

Required production variables are `DATABASE_URL`, `SESSION_SECRET`, `APP_URL`, and `FRONTEND_URL`. Set `REQUIRE_PRODUCTION_CONFIG=true` to validate all four at startup. Optional provider variables are `WEATHER_API_KEY`, `AI_API_KEY`, `STORAGE_BUCKET`, `STORAGE_ACCESS_KEY`, `STORAGE_SECRET_KEY`, `PAYMENT_SECRET_KEY`, and `EMAIL_API_KEY`. Empty provider configuration produces an explicit unavailable/disabled response; it does not fabricate live weather, AI, media, emails, payments, orders, or transactions.

Authentication uses bcrypt password hashes and an HttpOnly `jv_session` cookie; roles are `VISITOR`, `USER`, `ARTISAN`, `ORGANIZATION`, `VERIFIER`, and `ADMIN`. Financial, inventory, production, sales, and expense routes require the artisan owner, an authorized organization, or an administrator. Public profiles never expose private contact or financial records.

## Current API surface

In addition to the original discovery routes, the server supports `/api/auth/*`, heritage/story/artisan/product CRUD for authorized roles, provenance, verification requests/reviews, `/api/food`, `/api/weather`, `/api/food/recommendations`, favorites, protected inventory and livelihood records, business-health derivation, community submissions/moderation, audit hooks, and explicit `503` responses for unconfigured commerce. See [docs/openapi.yaml](docs/openapi.yaml) for request/response details and structured errors.

Render should provide `DATABASE_URL`, `SESSION_SECRET`, `APP_URL`, and `FRONTEND_URL` before enabling strict production configuration. The service still binds to Render's `PORT` on `0.0.0.0`; no deployment is performed by this change.
