# Feed sources and snapshot method

Collected October 24, 2026 UTC from public X profile pages. `src/posts.json` is the runtime source of truth. It holds eight selected ecosystem posts, original links, publication timestamps, observed likes/reposts/replies, short excerpts, editorial summaries, and locally bundled author avatars.

This is a finite snapshot, not a full X export, an authenticated X API feed, or an exhaustive measurement of all identity.md posts. Logged-out profiles expose a limited sample and pinned posts. No fabricated engagement or synthetic authors are included. All eight individual X post URLs were also fetched successfully (HTTP 200), and each excerpt was found in its decoded original-post response. These observations are about what the authors posted, not independent verification of their product, financial, or infrastructure claims.

## Original posts

| Post | Author | Date (UTC) | Likes | Reposts | Replies |
| --- | --- | --- | ---: | ---: | ---: |
| [we back](https://x.com/surfcoderepeat/status/2113665568414773675) | @surfcoderepeat | 2026-10-23 | 200 | 31 | 25 |
| [Beyond one domain](https://x.com/surfcoderepeat/status/2113709593788379329) | @surfcoderepeat | 2026-10-23 | 147 | 19 | 10 |
| [A hackathon full of builders](https://x.com/imdradar/status/2113661096481390726) | @imdradar | 2026-10-23 | 74 | 12 | 14 |
| [The art is the code](https://x.com/imdradar/status/2110765083311689890) | @imdradar | 2026-10-15 | 54 | 7 | 6 |
| [Pepes, activated](https://x.com/swarmpepes/status/2108177728054731138) | @swarmpepes | 2026-10-08 | 51 | 4 | 37 |
| [Around the ecosystem](https://x.com/imdradar/status/2112555334216663112) | @imdradar | 2026-10-20 | 37 | 14 | 16 |
| [The swarm keeps working](https://x.com/cryptokarlheinz/status/2113581751830553040) | @cryptokarlheinz | 2026-10-23 | 36 | 5 | 2 |
| [A vault for the ecosystem](https://x.com/imdradar/status/2112201269800522173) | @imdradar | 2026-10-19 | 30 | 1 | 2 |

## Collection and ranking

Direct public HTML requests to the four authors’ X profiles returned server-rendered GraphQL payloads. Decoded tweet objects supplied `rest_id`, author `core.screen_name`, `details.created_at_ms`, `counts.favorite_count`, `counts.retweet_count`, and `counts.reply_count`. Where a post was long, its `note_tweet` text provided context for the summary. Tweet IDs were deduplicated. Topics and titles are editorial groupings. Each displayed excerpt is at most 25 words; the full post is available through its direct “Read on X” link.

“Top” sorts these eight posts by observed likes descending, with post ID as a deterministic tie-breaker. “Latest” sorts the same set by timestamp descending. Saved posts sort by observed likes. Topic counts are computed from the actual collection, not trends across X. Likes and reposts are informational counts, not action buttons.

The selected public profile sources are [Adam](https://x.com/surfcoderepeat), [IMD Radar](https://x.com/imdradar), [Swarm Pepes](https://x.com/swarmpepes), and [Kalle Grabowski](https://x.com/cryptokarlheinz). Avatars came from the corresponding `pbs.twimg.com` URLs in those public profile objects and are bundled solely to attribute the posts. Author names and avatars remain their owners’ material. Search-engine mirrors helped locate the ecosystem; runtime posts and counts were taken from the direct public X responses.

## Refreshing the snapshot

Review public posts, update `src/posts.json` with real source URLs and observed counts, and update both the visible snapshot date and About dialog in `src/App.tsx`. Add any new local avatar under `public/assets/`. Keep excerpts short and distinguish summaries from quotations. Rebuild and run validation. No API secrets, proxy, scheduled refresh, or browser-side scraping is part of this project.
