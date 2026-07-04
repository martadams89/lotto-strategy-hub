# 🍀 Lotto Strategy Hub

**Play smart. Win alone.** An honest number picker and full results archive for
**UK Lotto** and **EuroMillions**.

---

## What this is (and isn't)

Let's be completely straight, because the internet is full of the opposite:

- **No one can predict a lottery draw.** Draws are physically random and
  independent. Past results tell you nothing about the next draw — a number that
  hasn't shown for months is *not* "due". No model, statistic, or AI can beat
  this, because there is no pattern to beat. This app never pretends otherwise.

- **There is exactly one real edge, and it isn't about winning — it's about
  *sharing*.** Jackpots are split between everyone who matches. Most players
  crowd onto birthdays (1–31), "lucky" numbers like 7, and tidy patterns. If a
  winning line is built from those, the prize is split many ways. Picking
  *uncrowded* numbers doesn't change your odds of winning at all — but it makes a
  shared jackpot less likely, which raises your **expected payout given a win**.

That's the whole philosophy. Everything below serves it honestly.

## Features

- **Day-aware home.** Shows the next draw front and centre — EuroMillions on
  Tue/Fri, UK Lotto on Wed/Sat — and features whichever is soonest today.
- **Your numbers.** Uncrowded lines generated just for you. They're seeded from a
  stable per-visitor id (stored in your browser), so they're the *same every time
  you visit* but *different from everyone else* — which is the whole point of
  not sharing a prize. Add a personal word or spin up a new identity anytime.
- **Real coloured balls.** Banded by number, matching the physical UK Lotto ball
  colours.
- **A "rarity" score** — our honest estimate of how uncrowded a line is (higher =
  fewer people likely share it). Clearly labelled as an estimate of human
  behaviour, never a probability of winning.
- **The complete archive.** Every UK Lotto draw since 1994 and every EuroMillions
  draw since 2004 — searchable by number or date, filterable by year, paginated.
- **Honest insights.** Frequency, sums, odd/even and birthday-zone stats — framed
  as *descriptions of the past*, with a flat "even chance" reference line to make
  the randomness visible.
- **Estimated jackpots, done honestly.** When a verified figure is available it's
  shown (labelled "estimated, as of {date}"); otherwise we link to the official
  source rather than display a number we can't verify.

## Architecture

A single, static, edge-hosted SPA. No server, no fake API.

```
src/
  lib/            Pure, unit-tested TypeScript — no UI, no framework:
    games.ts        game rules + real ball colours
    schedule.ts     draw-day awareness
    rng.ts          seedable deterministic RNG
    strategy.ts     popularity model, rarity scoring, line generation
    analytics.ts    descriptive statistics
    validate.ts     the draw-integrity guard (used by app, scraper AND tests)
    identity.ts     stable per-visitor seed
    data.ts         loads + revalidates the archive at runtime
  components/     React views (Play, History, Insights, About)
public/data/      The draw archive + jackpots, served as static assets
scripts/scrape.ts The results updater
tests/            Vitest — including a data-integrity gate over the real files
```

Data lives in `public/data/*.json`. The **committed archive is the source of
truth** — nothing is fetched from third parties at runtime.

## Keeping itself up to date

- **`Update draw results` workflow** runs after each UK draw. It fetches recent
  official results, merges any it doesn't already have, and — crucially — **runs
  the test suite before committing**. Every row passes the same validation the
  app uses, so a malformed draw (like the 12-ball row this rewrite removed) can
  never be committed again.
- **CI** runs typecheck + tests + build on every push and PR.
- **Renovate** keeps dependencies current and **auto-merges updates once CI is
  green** — including majors (with a short soak), because the test suite and
  build are the gate.
- **Release Please** manages versioning and changelogs from Conventional Commits.

> **To make auto-merge safe**, enable branch protection on `main` and mark the CI
> job (`CI / Lint, test & build`) as a **required status check**, and turn on
> "Allow auto-merge" in the repo settings. Renovate then only merges when tests
> and the build pass. Auto-merging majors is opt-in policy — dial it back in
> `renovate.json` if you'd rather review them.

## Development

```bash
npm install
npm run dev        # Vite dev server
npm test           # unit tests + data integrity
npm run lint       # typecheck
npm run build      # production build
npm run scrape     # fetch + validate the latest official results
```

## Please play responsibly

The lottery has a negative expected return — on average you get back less than
you put in. Never spend money you can't comfortably lose, and never chase losses.
Free, confidential help: [BeGambleAware.org](https://www.begambleaware.org/) or
the National Gambling Helpline on **0808 8020 133**. 18+.
