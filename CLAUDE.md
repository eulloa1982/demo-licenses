# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run build       # TypeScript type-check only (tsc --noEmit)
npm run lint        # ESLint with auto-fix
npm run format      # Prettier formatting on src/ and test/
npm test            # Jest unit tests
npm run test:e2e    # End-to-end tests (jest-e2e.json config)
npm run test:cov    # Jest with coverage report
```

> There is no local dev server for the API — functions are meant to run on Vercel. Use `vercel dev` if you have the Vercel CLI installed.

## Architecture

This is a **Vercel Serverless Functions** backend (not a NestJS app at runtime — the NestJS dependency exists but is unused). The `api/` directory is the Vercel entrypoint; `src/` contains shared business logic organized in layers:

```
api/licenses/index.ts   → GET  /api/licenses      (list with filters)
api/licenses/scan.ts    → POST /api/licenses/scan  (OCR scan + save)

src/
  services/        # LicenseService (orchestration), OcrService, ImageKitService
  repositories/    # LicenseRepository (MongoDB CRUD)
  parsers/         # license.parser.ts — regex-based field extraction
  models/          # Mongoose schema (LicenseDocument)
  config/          # database.ts — cached MongoDB connection
  types/           # TypeScript interfaces
  utils/cors.ts    # CORS helper for Vercel handlers
```

### Request flow (scan)

1. Handler validates method + connects to MongoDB (connection cached at module scope)
2. `LicenseService.scanAndSave()` runs OCR and image upload **concurrently** via `Promise.all`
3. `OcrService` calls OCR.space with base64 image
4. `ImageKitService` uploads to ImageKit using Basic Auth
5. `parseLicenseText()` applies 20+ regex patterns to extract: holder name, license number, license type (25+ credential types), issuing state, issue/expiration dates, course title, credit hours
6. `LicenseRepository.save()` persists to MongoDB
7. Returns `{ success, data: LicenseDocument }`

### GET /api/licenses filters

All string filters (holderName, licenseNumber, licenseType, rawText) use case-insensitive MongoDB `$regex`. Pagination via `limit` (max 100, default 20) and `skip`.

## Environment Variables

```
MONGODB_URI              # MongoDB Atlas connection string
OCR_SPACE_API_KEY        # OCR.space API key
IMAGEKIT_PRIVATE_KEY     # Used as Basic Auth username for ImageKit uploads
IMAGEKIT_PUBLIC_KEY      # ImageKit public key
IMAGEKIT_URL_ENDPOINT    # ImageKit CDN domain
ALLOWED_ORIGINS          # Comma-separated CORS origins, or *
```

Local development: copy `.env.example` → `.env.local` (git-ignored).

## Key Design Notes

- **MongoDB connection caching**: `src/config/database.ts` stores the connection in module scope to survive warm serverless restarts. Always go through `connectToDatabase()` before querying.
- **Regex parser**: `src/parsers/license.parser.ts` is the core of the OCR pipeline. When adding new license types or field patterns, this is the file to update.
- **No NestJS at runtime**: Despite `@nestjs/*` deps, the runtime code is plain TypeScript with Vercel handlers. NestJS is scaffolding only; do not add NestJS modules/decorators to API handlers.
- **Vercel function config**: Memory is set to 512MB in `vercel.json`. Build command is `tsc --noEmit` (type-check only — Vercel compiles TypeScript natively).
