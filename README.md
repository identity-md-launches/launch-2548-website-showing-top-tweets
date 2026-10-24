# The Swamp

A dark-green, AI-Pepe reader for the identity.md conversation. Explore eight sourced posts with search, four topic filters, Top/Latest sorting, browser-local bookmarks, copy-link sharing, and direct links to the originals. The original vector illustration depicts two Pepe agents armed with AI gear.

The feed is an explicitly labelled **October 24, 2026 snapshot**. “Top” means most liked within this selected collection, not a complete or live ranking of X. The About dialog explains the method; [docs/SOURCES.md](docs/SOURCES.md) records the source links and observed counts. Bookmarks stay in the visitor’s browser, with a session-only fallback when storage is unavailable.

## Install and develop

Use Node.js 22 and npm. Dependencies are ordinary public-registry packages pinned by `package-lock.json`.

```sh
npm ci
npm run dev
```

Open the local URL Vite prints. No private credentials, API keys, wallet, or backend are needed.

## Build and preview

```sh
npm run typecheck
npm run build
npm run preview
```

`dist/index.html` and all runtime assets are included in the submission alongside source and lockfile. Vite uses `base: './'`; the page uses hash anchors and relative asset URLs. Serve the entire `dist/` directory at a static root or subpath. Hosting and publication are handled outside this assignment.

## Validation

Final worker-side results:

- `npm run build`: passed.
- `npm run typecheck`: passed.
- Chromium production-export interaction checks: **43 passed, 0 failed**.
- Pinned `taste@1` design probe: **16 passed, 0 failed** at 320, 390 and 1440px.
- Additional reflow checks passed at 600, 800 and 1120px and with 200% text sizing. Phone screenshots show the product, search, and first post on the initial screen.
- Eight original X post URLs returned HTTP 200, and all eight displayed excerpts were verified in the original responses.
- No console errors, missing local resources, or third-party runtime requests occurred in the tested feed.

The installed Playwright runtime can rerun the interaction suite:

```sh
PLAYWRIGHT_BROWSERS_PATH=/opt/imd-tools/ms-playwright npm run validate
```

On another development machine, pass the path to an existing Playwright installation:

```sh
node scripts/validate.mjs /absolute/path/to/playwright/index.mjs
```

The script serves the production export beneath `/preview/swamp/`, checks interactions in Chromium, and closes its browser and preview server. It attempts WebKit when available and records an explicit limitation when it cannot launch. Disposable results and screenshots are written under `test/scratch/validation/`.

The assignment’s pinned probe was run with:

```sh
IMD_PLAYWRIGHT=/opt/imd-tools/playwright-mcp/node_modules/playwright/index.mjs PLAYWRIGHT_BROWSERS_PATH=/opt/imd-tools/ms-playwright node .imd/reads/skills/design-critic/scripts/taste.mjs --out test/scratch/taste
```

Pinned input files and scratch results are not delivery dependencies. The full six-domain design review, fixes, actual checks, and limitations are in [docs/VALIDATION.md](docs/VALIDATION.md). Implemented design tokens and responsive rules are in [DESIGN.md](DESIGN.md).

**Limitations:** WebKit/Safari could not run because its executable is absent from the supplied runtime. No physical-device or screen-reader session was performed. The 200% check enlarges text, not native browser zoom. External X browsing may depend on X’s login and availability policies. The site does not fetch fresh posts or synchronize saved posts across devices.

## Source and assets

`src/App.tsx` implements the feed and local interactions; `src/posts.json` is the snapshot; `src/styles.css` contains the design tokens. `public/assets/pepe-squad.svg` and `public/favicon.svg` are original code-native vector assets. `public/assets/share.png` is a generated 1200×630 share card. Regenerate it, if needed, with `scripts/generate-share.mjs` using the same Playwright runtime.

DM Sans is locally bundled under the SIL Open Font License. React uses MIT; Lucide uses ISC. Runtime license notices are included under `public/assets/` and copied into `dist/assets/`. Post excerpts and author avatars are attributed to their respective authors. Design-reference notices are preserved under `docs/`.

Generated dependencies, caches and scratch validation files are excluded. The explicit ignore-path and file budget is in [docs/PATH_BUDGET.md](docs/PATH_BUDGET.md); the complete useful submission is below the 8 MiB cap.
