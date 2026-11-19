# gta6-trophy-guide-01-001
[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Fajargh/gta6-trophy-guide-01-001/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Fajargh/gta6-trophy-guide-01-001/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

**Leonida Trophy Guide** — an offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI. Every trophy is shown with its official name, description and grade as PlayStation publishes them, plus a guide written in our own words that cites its sources (PowerPyx, Exophase, PSNProfiles, Output Lag, Planet GTA 6). Five guides are honestly marked *unconfirmed* where no guide had pinned the trigger down at launch, instead of guessing.

What it does:

- **Checklist tracker** — tick trophies off; progress is saved in the browser (localStorage) and can be exported to a file and imported back.
- **Filters** — by kind (story, missable, collectibles, activities, online), by grade, by earned-only, plus text search.
- **Spoiler setting** — hides story trophy names, descriptions and guides until they are earned.
- **Roadmap to the platinum** — three stages built from the official descriptions and PowerPyx's roadmap (about 200 hours, one playthrough, no mission replay): play the story, grind the 100% checklist, then clean up the questlines.
- **Missables flagged** — only one trophy is potentially missable (Positive Mental Attitude, Chapter 1 meditation), with the save advice to match: keep a manual save at the start and end of each chapter, and leave cheats off (they disable trophies and saving).
- **Fully offline** — static files under `app/`, no build step, no network requests at runtime.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080. Or serve `app/` with any static file server.

## Layout

- `app/index.html`, `app/app.js`, `app/style.css` — the guide itself.
- `app/data/trophies.json` — the 55 official trophies with guides, kinds, roadmap stages, missable flags and sources.
- `screenshots/` — renders of the guide running in a browser.
- `main.ts` — the entry program: copies `app/` and `screenshots/` to `/output` and writes `/output/dossier.json`.
- `vendor/makefun-frontend.ts` — the kit's dossier library, unchanged.

<sub>Entered on [make.fun](https://make.fun/?ref=8cvj6bwy&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
