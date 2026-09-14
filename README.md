# GradScheme 2027

A native SwiftUI iPhone app with scheduled GitHub monitoring for UK marketing, brand-management and FMCG graduate schemes. Results are accepted only when the source explicitly states a 2027 start, with London roles ranked first.

## Repository layout

- `ios/` — iOS 17+ SwiftUI app (generated with XcodeGen)
- `worker/` — crawler, verification rules and tests
- `docs/api/schemes` — automatically updated live data feed used by the app

## Quick start: iPhone app

1. On a Mac, install Xcode 16+ and XcodeGen: `brew install xcodegen`.
2. In `ios/`, run `xcodegen generate`.
3. Open `GradScheme2027.xcodeproj`.
4. Change the development team and bundle identifier under Signing & Capabilities.
5. Run on an iPhone or Simulator. It is already configured to use this repository's live feed.

## Automatic monitoring

GitHub Actions runs `.github/workflows/scan.yml` every six hours and updates the feed. It can also be started manually from the repository's Actions tab. No Cloudflare account or server is required.

## Verification rule

The worker does not infer the start year from the posting date. A role is published only when its title or page text contains explicit start evidence such as `start in September 2027`, `Summer 2027 start`, or `2027 Graduate Programme`. Ambiguous vacancies are kept out of the API.

## Responsible crawling

Each source is checked at a modest rate with a clear user agent. Before production use, confirm each site's robots.txt and terms. Prefer official employer feeds/APIs whenever available. Site markup changes over time, so selectors are isolated in `worker/src/sources.ts`.
