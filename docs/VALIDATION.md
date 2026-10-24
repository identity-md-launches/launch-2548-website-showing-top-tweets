# Worker validation and design review

Status: **Complete for the stated implementation scope**, with the browser and data limitations listed below. These are actual worker-side checks, not an independent certification. Final checks ran on October 24, 2026 UTC against the production export.

## Requirements

| Requirement | Result | Evidence |
| --- | --- | --- |
| Website showing top tweets about identity MD | Met | Eight real, attributed post excerpts and editorial summaries; observed-like ranking; direct source links |
| Dark green, pepes armed with AI | Met | Forest-green surfaces, lime accent, original Pepe operators with neural visor, drone and AI module |
| Working primary interactions and responsive layouts | Met | Search, all topic filters, Top/Latest, save/unsave, sharing, About, keyboard and recovery checks |
| Static export, source and lockfile | Met | `dist/index.html`, complete `dist/assets/`, Vite `base: './'`, source and `package-lock.json`; nested-subpath test |
| Production build, typecheck and useful validation | Met | Build and typecheck exit 0; 43 interaction checks pass |
| Better Interface applied and reviewed across six domains | Met | Domain coverage and findings below; 16/16 pinned design checks pass |
| Product and main action visible at 390px | Met | Rendered 390×844 screenshot shows identity.md description, Explore, search/filter controls and first post excerpt |
| Title, favicon, description, og:title, og:image | Met | Pinned share check passes; real local SVG favicon and 1200×630 PNG share card |
| Root design documentation | Met | `DESIGN.md` extracted after final source corrections |
| Install, preview and rebuild documentation | Met | Root `README.md` |

Idea: an identity.md conversation reader carried by a restrained forest-green interface and a squad of Pepe AI operators.

## Scope and assumptions

A single static React/TypeScript page, with no backend, live X API, wallet, or account system. The feed deliberately presents a dated public snapshot. Each card separates a quoted excerpt from our summary, links to the source, and shows observed engagement counts. “Top” ranks only the included posts. Saved items belong to one browser, not a shared network.

Public X profile payloads supplied eight posts. All eight individual original-post URLs were fetched successfully (HTTP 200); every excerpt appeared in its decoded original-post response. `SOURCES.md` records the URLs, dates and observed counts. Author claims were not independently audited.

## Actual commands and results

| Check | Actual result |
| --- | --- |
| `npm install --cache /tmp/imd-swamp-npm --no-audit --no-fund` | Installed 71 packages; generated npm lockfile |
| `npm run build` | Exit 0; Vite 7.3.7; 1581 modules transformed |
| `npm run typecheck` | Exit 0; `tsc --noEmit` |
| `PLAYWRIGHT_BROWSERS_PATH=/opt/imd-tools/ms-playwright npm run validate` | Exit 0; 43 passed, 0 failed |
| Pinned `taste.mjs --out test/scratch/taste` with the documented Playwright paths | Exit 0; all 16 checks passed |
| Public original-post retrieval and excerpt cross-check | 8/8 HTTP 200; 8/8 excerpts verified |
| Submission size and static-path audit | See the final size record below |

An attempted font-subset import was not supported by the installed package. It was reverted to the supported package import before the final successful build; no broken import remains.

Interaction validation serves the actual `dist/` beneath a nested path and blocks third-party requests. It covers case-insensitive text and author search, combined filters, no-results recovery, all four topic filters, like/date sorting, saved-empty recovery, pressed bookmark state, reload persistence, save/unsave counts, clipboard success, selectable URL fallback, storage denial, malformed persisted data, source-link destinations, opener protection, topic navigation, modal background inertness, Escape/focus return, `/` shortcut, keyboard activation, reduced motion, forced colors and enlarged text. Observed browser errors: 0. Missing local resources: 0. Third-party runtime requests: 0.

## Six-domain coverage

| Domain | Coverage | Evidence and remaining limits |
| --- | --- | --- |
| Accessibility | Checked | Native buttons/links/search/dialogs; explicit input label; named icon actions; skip link; pressed states; stable polite result/confirmation regions; keyboard save and modal checks; visible focus screenshot; reduced-motion and forced-colors checks. Screen-reader and physical-device sessions unperformed. |
| Layout | Checked | Rendered export at 320, 390, 600, 800, 1120, 1440px; no horizontal overflow; pinned probe finds no overlapping or clipped text. 390 and desktop screenshots inspected. 200% root text sizing reflows; native browser zoom and RTL are not verified. |
| Writing | Checked | Five-word hero plus one plain product line; explicit snapshot and browser-local storage scope; source attribution; specific recovery actions; no fake live/trending totals. The single briefing statement is subordinate to the feed. |
| Typography | Checked | Actual DM Sans font loads; one family; weights 400/500/700; five rendered sizes per measured width; 16px search input; wrapping handles and source text; no prose in monospace or clipped text. Translation variants not implemented. |
| Colors | Checked | Rendered initial-page solid text pairs pass the pinned contrast check; source-token WCAG calculations below. Focus perimeter inspected in screenshot. Only the requested dark theme exists. Forced colors inspected; no claim of full WCAG conformance. |
| UI | Checked | Hover/selected/focus/empty/failure/copy/save states exercised; flat borders and tonal surfaces; no nested cards or border-plus-shadow combination. No autoplay or endless animation. 120ms transitions are disabled under reduced motion. Slow-motion animation-panel inspection was not performed. |

## Findings and corrections

Locations refer to final source, not generated bundles.

| Finding | Source | Evidence, fix and recheck |
| --- | --- | --- |
| Repeated secondary topic copy | `src/App.tsx:140` | First probe reported four identical “2 posts in this snapshot” lines. Reduced each count to “2 posts”; the final repetition check passes. |
| Hero art interfered with composition | `src/styles.css:72` and phone override | First desktop screenshot cropped the operator’s head; phone illustration approached the description. Reduced desktop art width/capped its size and shifted the phone art farther right. Final screenshots show clear text and the operator’s face. |
| Enlarged text caused horizontal reflow failure | `src/styles.css:52`, `:75`, `:81` | Initial 200% text-size check measured horizontal overflow. Enabled wrapping for header, feed heading and view selector. Final 390px enlarged-text check passes; inspected screenshot shows readable wrapping. |
| Active transition survived a motion-preference switch | `src/styles.css:192` | The initial interaction check observed one transition immediately after switching to reduced motion. Added an explicit reduced-motion reset. Final test observes zero running animations. |
| Floating save feedback covered post text | `src/App.tsx:131`, `src/styles.css:164` | A saved-state phone screenshot showed the fixed notice over a summary. Moved feedback into the feed’s normal flow, with persistent dismiss control and polite announcement. Final screenshots and interaction flow no longer show an overlay. |
| Search clear button shared a label wrapper | `src/App.tsx:127` | Source review found a button nested in the search input’s label. Changed the wrapper to a div and used an explicit `label`/`id` pair. Search and clear validation pass. |

No unresolved blocking finding remains in the implemented Chromium scope.

## Pinned taste@1 results

16/16 pass: render, layout, targets, contrast, casing, tracking, eyebrows, type-sizes, type-faces, glyphs, slogans, repetition, copy-budget, chrome, motion, share.

- No horizontal scroll at 320/390/1440; no text-box overlap, fixed controls covering text, or text clipped by hidden overflow.
- All 59 measured controls meet the 24px-or-spacing rule at 390px. The probe notes 48 are below the optional 44px comfort size; compact filters and links remain deliberately dense. Primary search/action controls and mobile bookmark buttons use larger targets.
- All measured initial-page solid-background text passes 4.5:1, or 3:1 for large text.
- At 390px: 12, 14, 16, 20, 28px. At 1440px: 12, 14, 16, 20, 48px.
- First-screen prose measured by the probe: 6 words at 390px and 23 at 1440px.
- No endless animation, `transition: all`, gradient text, nested cards, or border-plus-shadow surfaces.

Computed directly from the implemented sRGB token values with the WCAG relative-luminance formula:

| Foreground / background | Ratio |
| --- | ---: |
| `--text` / `--page` | 16.30:1 |
| `--text` / `--surface` | 14.91:1 |
| `--muted` / `--surface` | 7.51:1 |
| `--muted` / `--surface-raised` | 6.19:1 |
| `--accent-ink` / `--accent` | 11.75:1 |
| `--focus` / `--surface` | 15.41:1 |
| `--focus` / `--surface-raised` | 12.70:1 |

These token calculations do not measure the decorative SVG’s internal artwork.

## Browser evidence and limitations

The managed MCP browser returned “Transport closed.” Required rendering and interactions were completed using the assignment’s supplied local Playwright Chromium runtime in a bounded foreground script. Preview server and browser close when that script ends.

Disposable evidence generated during checks:

- `test/scratch/taste/taste.json` and `shots/390.png`, `shots/1440.png`, with full-page versions.
- `test/scratch/validation/results.json`, `390-first-screen.png`, `390.png`, `1440.png`, `keyboard-focus.png`, `forced-colors.png`, `text-200-percent.png` and `text-200-percent-top.png`.
- `test/scratch/source-link-check.json` and `test/scratch/bundle-sizes.json`.

Scratch files are deliberately excluded from submission and are not required by the build. Written results are preserved here.

WebKit launch failed because its executable is absent from the supplied runtime. Safari is unverified. No physical phone, assistive-technology session, browser-native 200% zoom, RTL localization, or exhaustive accessibility certification is claimed. Dynamic content is local, so no network-loading/retry state applies to the feed. Clipboard failure and storage failure have tested recovery paths. Original X pages can change, require sign-in, or disappear after this snapshot. Share-card metadata is relative because the final public hosting address is assigned later.

## Final size record

The complete useful submission, excluding generated dependencies, caches, pinned inputs and disposable scratch files, is below 1 MiB against the 8,388,608-byte cap. `dist/` contains 497,095 bytes. The final total is 838548 bytes across 42 files. `dist/` is not ignored; dependencies and caches are ignored at every nesting level. No submodules, dependency archives or generated packaging directories are included.
