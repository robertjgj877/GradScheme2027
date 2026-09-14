# GradScheme 2027

A native SwiftUI iPhone app and a Cloudflare Worker that monitors UK marketing, brand-management and FMCG graduate schemes. Results are accepted only when the source explicitly states a 2027 start, with London roles ranked first.

## Repository layout

- `ios/` — iOS 17+ SwiftUI app (generated with XcodeGen)
- `worker/` — Cloudflare Worker, scheduled crawler and D1 database

## Quick start: iPhone app

1. On a Mac, install Xcode 16+ and XcodeGen: `brew install xcodegen`.
2. In `ios/`, run `xcodegen generate`.
3. Open `GradScheme2027.xcodeproj`.
4. Change the development team and bundle identifier under Signing & Capabilities.
5. In `Configuration.swift`, replace the example API URL after deploying the worker.
6. Run on an iPhone or Simulator.

## Quick start: monitoring worker

1. Install Node 20+ and run `cd worker && npm install`.
2. Log in with `npx wrangler login`.
3. Create D1: `npx wrangler d1 create gradscheme-2027`.
4. Put the returned database ID into `wrangler.toml`.
5. Apply the schema: `npm run db:migrate:remote`.
6. Deploy: `npm run deploy`.
7. Trigger an immediate scan: `curl -X POST https://YOUR-WORKER.workers.dev/admin/scan -H 'Authorization: Bearer YOUR_ADMIN_TOKEN'`.

Set `ADMIN_TOKEN` with `npx wrangler secret put ADMIN_TOKEN`. The scheduled job runs every six hours.

## Verification rule

The worker does not infer the start year from the posting date. A role is published only when its title or page text contains explicit start evidence such as `start in September 2027`, `Summer 2027 start`, or `2027 Graduate Programme`. Ambiguous vacancies are kept out of the API.

## Responsible crawling

Each source is checked at a modest rate with a clear user agent. Before production use, confirm each site's robots.txt and terms. Prefer official employer feeds/APIs whenever available. Site markup changes over time, so selectors are isolated in `worker/src/sources.ts`.
