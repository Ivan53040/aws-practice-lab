# AWS Practice Lab

AWS Certified Cloud Practitioner (CLF-C02) and AWS Certified AI Practitioner (AIF-C01) practice exams in a static, offline-friendly web app.

## Features

- 65 randomized questions per attempt, selected from the local JSON banks.
- Domain-weighted question selection for both certifications.
- Single choice, multiple response, ordering, and matching questions.
- 90-minute timer with automatic submission when time expires.
- 75% raw-score practice pass threshold.
- Incorrect-question review with the English answer and explanation.
- EN and Traditional Chinese interface labels in the top-right corner.
- No account, API, database, analytics, or score history.
- PWA manifest and static output suitable for Vercel hosting.
- Service worker that caches the app shell and Astro assets for offline relaunch.

Questions, options, and explanations remain in English so the practice experience matches the exam language.

## Local development

Requires Node.js 22 and pnpm.

```sh
pnpm install
pnpm dev
```

Open the local URL shown by Astro. The app does not require a `.env` file or any secret.

## Verification

```sh
pnpm run validate
pnpm run check
pnpm run build
```

The build validates all committed question banks, then emits only the static app and 404 page. The `saa-c03` sample bank is retained as source data for now and may emit its existing explanation-format warnings during validation; it is not exposed by the offline UI.

## Vercel and offline use

`vercel.json` sets the Astro build command, `dist` output directory, immutable caching for `/_astro/*`, and no-cache headers for `sw.js` so service-worker updates are not stuck behind a CDN cache. Deploy the project root as a static Vercel project. No Vercel environment variables are required.

The first online visit registers `/sw.js` and caches the HTML shell, the generated JavaScript assets, the manifest, and app icons. Open the app once while online, then it can be relaunched without a network connection. A later online visit refreshes the HTML shell while hashed assets remain cache-first.

## Data and license

The active offline banks are under `src/data/clf-c02` and `src/data/aif-c01`. The original MIT license and attribution are retained in `LICENSE`.
