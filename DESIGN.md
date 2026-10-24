# The Swamp design system

## Overview

The Swamp is a reader for people following identity.md. The brief’s dark green, AI-armed Pepe theme is implemented as a forest-green editorial feed with lime accents and an original vector squad carrying a neural visor, drone, and computation module. The feed is the product: short attributed excerpts, editorial summaries, original-post links, and lightweight discovery controls.

The main reuse points are `src/styles.css`, `PostCard` in `src/App.tsx`, `src/posts.json`, and `public/assets/pepe-squad.svg`. Cards and controls keep a compact, flat visual hierarchy. The decorative artwork never captures pointer input.

## Colors

Canonical values are the semantic custom properties at the start of `src/styles.css`. Only the requested dark theme is implemented.

| Token | Value | Role |
| --- | --- | --- |
| `--page` | `#09150f` | Page and search background |
| `--surface` | `#101f17` | Post cards, briefing, modal, segmented-control track |
| `--surface-hover` | `#172a1e` | Neutral link/button hover |
| `--surface-raised` | `#1b3022` | Selected view, saved state, empty-state icon |
| `--hero` | `#172e20` | Illustration panel |
| `--line` | `#293c2e` | Structural dividers and card boundaries |
| `--control-line` | `#45614b` | Search, external-action and dialog boundaries |
| `--text` | `#edf1e8` | Primary content |
| `--muted` | `#a1b0a1` | Handles, dates, summaries and secondary counts |
| `--accent` | `#b9ed7c` | Primary action, selected topic, saved icon and brand emphasis |
| `--accent-hover` | `#cdf5a0` | Primary action hover |
| `--accent-ink` | `#15260f` | Text on lime fills |
| `--focus` | `#dcffae` | Keyboard focus perimeter |

Illustration colors live in the SVG and are decorative. The inline confirmation surface uses `#29412d` with primary text and an explicit checkmark. The hero description uses `#c0cfb9`; topic and source links use pale green tints. Do not reuse a border token for readable text. Selected controls also expose pressed state; selection never depends solely on color.

Measured token-pair ratios and the rendered contrast probe are recorded in `docs/VALIDATION.md`.

## Typography

DM Sans Variable is bundled locally through `@fontsource-variable/dm-sans` in `src/main.tsx`. The generated Latin and Latin Extended WOFF2 files live in `dist/assets/`. The CSS stack is `'DM Sans Variable', 'DM Sans', sans-serif`. The rendered font was checked in Chromium. Font synthesis is disabled.

| Token | Size at a 16px root | Use |
| --- | --- | --- |
| `--text-xs` | 12px | Dates, handles, topics, counts and secondary links |
| `--text-sm` | 14px | Post excerpts, summaries and most controls |
| `--text-base` | 16px | Post titles, search input, modal subheadings |
| `--text-lg` | 20px | Wordmark, feed heading, briefing statement |
| `--text-xl` | 28px | Phone hero and modal title |
| `--text-display` | 48px | Desktop hero |

The only weights are 400, 500 and 700. Body text uses a 1.55 line height; excerpts and summaries use 1.65; modal prose uses 1.7. The hero uses 1.04, or 1.05 on phones. Display tracking is `-.055em` on desktop and `-.04em` on phones. Body text has normal tracking. Counters and dates use tabular numerals. Headings balance; prose uses pretty wrapping. Handles and content can wrap rather than truncate.

## Layout

`.page-shell` and `.header-inner` share a 1280px maximum, including 40px desktop side padding. Above 1600px, that maximum becomes 1360px. The usual spacing rhythm uses 4px increments with compact 6px/10px gaps where icon alignment needs them. Cards use 16–22px content insets, 16px grid gaps, and a 34px separation from the sidebar.

The primary responsive rules in `src/styles.css` are:

| Width | Implemented behavior |
| --- | --- |
| Above 1279px | Two post columns and a 276px sidebar; search beside view controls |
| 1121–1279px | Sidebar narrows to 252px and card insets tighten |
| 801–1120px | One post column beside a 244px sidebar; search moves to another toolbar row |
| 601–800px | Sidebar moves below the feed; post grid returns to two columns; 24px page margins |
| Up to 600px | One post column; 16px page margins; search precedes view controls; topic controls wrap; hero title is 28px |
| Up to 359px | Header gaps tighten, wordmark shrinks to 16px, and decorative art becomes less prominent |

The header, feed heading, and view selector wrap when text grows. Text containers use natural height. Only decorative hero art is clipped; post content is not clamped or ellipsized. At 390px, the initial viewport shows the product name, hero action, search, filters, and the first post excerpt. Reflow was checked at 320, 390, 600, 800, 1120 and 1440px, plus 200% root text size at 390px.

## Elevation & Depth

The site uses tonal surfaces and 1px structural borders, with no card shadows. Header and footer dividers establish page boundaries. The native modal occupies the browser’s top layer with a dark translucent backdrop. Confirmation feedback is an inline dismissible notice above the results, so it cannot cover post text.

## Shapes

The main radius token is 14px for the hero and empty state. Post/briefing cards use 11px; the phone hero also uses 11px. Inputs and the view switch use 8–9px. Primary actions use 7px; topic filters use 6px. Modals use 16px. Author avatars are circles with a subtle white outline. Avoid adding nested decorative cards or a second shadow system.

## Components

| Pattern | Source and use | States and access |
| --- | --- | --- |
| `PostCard` | `src/App.tsx`; takes `post`, global snapshot `rank`, `saved`, `onSave`, `onShare` | Real author and original-post links; static metric counts; save is a pressed button; share copies the source URL |
| `.primary-button` | `src/styles.css`; hero, recovery and dialog actions | Lime fill, hover tint, visible focus; press scale `.96` only without reduced motion |
| `.view-switch` | `src/App.tsx`; Top, Latest, Saved | Native button group with `aria-pressed`; allows wrapping under text enlargement |
| `.search-field` | `src/App.tsx`; labelled native search input and separate clear button | `/` focuses search outside editable controls and dialogs; clear restores focus; input is 16px |
| `.topic-filters` | `src/App.tsx`; selected topic and All posts | Native pressed buttons; wraps instead of sideways scrolling |
| `.empty-state` | `src/App.tsx`; no matches or no bookmarks | Explains the state and provides Clear filters or Explore posts |
| `.status-notice` | `src/App.tsx`; stable polite live region | Dismissible copy/save result; storage failures explicitly say the bookmark lasts for this visit |
| `.info-dialog` | `src/App.tsx`; native About and copy-fallback dialogs | Native modal background inertness, Escape, focus return, labelled title; selectable fallback URL |
| Sidebar topic row | `src/App.tsx` | Filters the feed and scrolls to it; count derives from `posts.json` |

Icons use Lucide and `currentColor`; the X mark is a small inline brand glyph. Focus uses a 2px perimeter with a 4px offset. High-frequency color/background transitions last 120ms. Reduced motion disables transitions and animations. Forced colors provides visible outlines for selected controls. There is no autoplay, loading animation, account system, wallet connection, or live API state.

## Do’s and Don’ts

- Start another reader surface with `.page-shell`, the existing type tokens, and `PostCard` where appropriate.
- Use one lime primary action per action group; selected-topic fills communicate selection.
- Keep snapshot dates, source attribution and browser-only bookmark scope visible and accurate.
- Use real buttons for local actions, real links for destinations, and the existing recovery patterns for empty states.
- Add posts through `src/posts.json`, source them as described in `docs/SOURCES.md`, then rebuild `dist/`.
- Keep art decorative, locally bundled, and clear of reading text. Do not add glowing text, competing gradients, fake live counters, or clipped source values.

Design guidance: Jakub Krehel’s [Better Interface](https://github.com/jakubkrehel/skills/tree/267330e1adfc66a718fb65fa6918c1f06d0a689e/skills/better-interface), MIT. Documentation method: Paul Bakaus’s [Impeccable](https://github.com/pbakaus/impeccable/blob/9d715cc4f5564a990ca8345abfdd5df6dc9b41c8/skill/reference/document.md), Apache-2.0. This document adapts those methods to the implemented site. Both license notices are preserved in `docs/DESIGN_GUIDANCE_LICENSE.txt`.
