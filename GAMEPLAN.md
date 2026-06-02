# Strokes Gained Attitude — Launch & Online Presence Gameplan

Goal: take the app from "working again" to a **public launch with real golfers using it**.

This is a living document. Treat the phases as sequential-ish, but the
"presence" work (domain, socials, content) can start in parallel with finishing
the product.

---

## 0. Positioning — what we actually sell

Most golf apps track *strokes*. This app tracks the **mental game** — trust,
confidence, focus, routine, decision-making — round over round, and shows you
the trends. That's the wedge.

- **One-liner:** "Strokes Gained Attitude — track your mental game like a pro
  and watch your scores follow."
- **Who it's for (start narrow):** competitive amateurs, league/club players,
  and golfers already into the mental side (read Bob Rotella, listen to golf
  psych podcasts). They already believe the premise; you don't have to convince
  them mindset matters.
- **The proof:** correlate mental-category scores against `roundScore` over
  time. "Your scoring is 4 strokes lower on rounds where your Commitment score
  is 4+." That insight is the shareable hook and the reason to keep logging.

> Action: lock a single sentence of positioning before building a landing page.
> Everything (screenshots, copy, ad creative) flows from it.

---

## Phase 1 — Get the product launch-ready (engineering)

Status after this session: app typechecks and lints clean, functions build &
lint clean, mental-category aggregation bug fixed. Remaining before launch:

- [ ] **Auth + onboarding polish.** First-run experience: explain the concepts
      in 2-3 screens, get them to log their first round in <2 minutes.
- [ ] **Empty states & error handling.** Every screen needs a graceful "no data
      yet" and "something went wrong" state. (Charts/History already have some.)
- [ ] **The "aha" insight screen.** Surface the score↔mental correlation. This
      is the retention driver — build it before launch, not after.
- [ ] **Firestore security rules.** Right now the data model is open by default.
      Lock reads/writes to `request.auth.uid == resource.data.uid` before any
      real user touches it. **Non-negotiable for launch.**
- [ ] **GolfCourse API key** is read from `functions.config()`/env — confirm
      it's set in the deployed environment and not committed.
- [ ] **Analytics + crash reporting.** Wire Firebase Analytics + a crash tool
      (Sentry or Crashlytics). You can't improve what you can't see.
- [ ] **Account deletion / data export.** App stores now require account
      deletion in-app. Build the path.
- [ ] **Push notifications** (Expo Notifications): "Log your round" nudge after
      a round is the single highest-leverage retention feature.

### Build/run cheatsheet
```bash
# App
cd app && npm install && npx expo start

# Functions
cd functions && npm install && npm run build && npm run serve  # emulators
```

---

## Phase 2 — Beta (validate before you spend on marketing)

- [ ] **TestFlight (iOS) + Play Internal Testing (Android)** via EAS Build
      (`eas build`, `eas submit`). Expo makes this straightforward.
- [ ] Recruit **15–30 beta golfers**: your network, one local club, one
      Reddit/Discord post. Watch them onboard (record sessions or do it in
      person). The first-round drop-off is where apps die.
- [ ] Instrument the funnel: install → signup → first round logged → 3rd round
      logged (the habit-forming threshold). Fix the biggest leak before scaling.
- [ ] Collect testimonials and a few "score went down" stories — these become
      launch-day social proof.

**Gate:** don't go to public launch until a meaningful share of beta users log
**3+ rounds**. That's the signal the loop works.

---

## Phase 3 — Online presence (can start during Phase 1)

### Foundation
- [ ] **Domain:** grab `strokesgainedattitude.com` (+ `.app`) and a short
      alias if the name is long for socials.
- [ ] **Landing page:** single page — hero (one-liner + phone mockup), the
      "track your mental game" pitch, 3 feature shots, email waitlist capture,
      App Store / Play / "Open web app" buttons. Expo already supports web, so
      the web build *is* a usable demo — link it.
- [ ] **Email capture from day one** (ConvertKit/Mailchimp/Resend). An email
      list is the one channel you own; everything else is rented.
- [ ] **App Store Optimization:** title + subtitle with "golf mental game /
      golf psychology / mindset" keywords, 5–6 polished screenshots that each
      teach one benefit, a 15-second preview video.

### Social handles (claim the name everywhere now, even if dormant)
- **Instagram + TikTok + YouTube Shorts** — primary. Golf content performs well
  in short-form video and the mental-game angle is underserved.
- **X/Twitter** — golf-improvement and "golf Twitter" community.
- **Reddit** — r/golf, r/golfgeeks (be a member first; market by being useful).

### Content engine (the actual growth lever)
Theme: **the mental game of golf**, not "use my app." Earn attention with
genuinely useful content; the app is the call-to-action.
- Short-form video: "1 mental cue to stop blowing up after a double bogey,"
  "the 10-second pre-shot routine," etc. Post 3–5×/week, repurpose across IG /
  TikTok / Shorts.
- A simple blog / SEO play targeting long-tail searches: "how to stop getting
  nervous on the first tee," "golf pre-shot routine," "mental game drills."
  These rank and compound.
- A weekly email: one mental-game tip + one user insight from aggregate data.

---

## Phase 4 — Launch sequence

1. **Waitlist warm-up (2–4 weeks out):** landing page live, start posting
   content, build the email list, tease the beta results.
2. **Launch day:**
   - Email the waitlist first (your warmest audience).
   - Post the story across socials (the "I tracked my mental game for X rounds
     and here's what happened" narrative).
   - **Product Hunt** launch (Tuesday–Thursday best). Line up early upvotes.
   - **Reddit r/golf** — a genuine "I built this" post; the community responds
     well to authentic indie builds, badly to ads.
   - Relevant golf newsletters / smaller golf YouTubers & podcasts — pitch the
     mental-game data angle.
3. **Post-launch (first 30 days):** ship fast on beta feedback, reply to every
   review and comment, keep the content cadence. Momentum compounds or dies in
   month one.

---

## Phase 5 — Monetization (don't gate too early)

- **Freemium:** logging + basic trends free forever. Paid unlocks deep
  analytics, score↔mindset correlations, history export, unlimited courses.
- Pricing to test: ~$3–5/mo or ~$30/yr. Annual converts better for habit apps.
- B2B later: coaches & academies want client dashboards — a real revenue lane
  once you have individual traction.

---

## Metrics that matter (review weekly)

| Stage      | Metric                                   | Why |
|------------|------------------------------------------|-----|
| Acquisition| Installs, landing→install rate           | Is the message landing? |
| Activation | % who log their **first round**          | Onboarding quality |
| Retention  | % who log **3+ rounds**, W1/W4 retention | Does the loop stick? |
| Referral   | Shares of insight cards                  | Built-in growth |
| Revenue    | Free→paid conversion                     | Is it a business? |

**North star:** rounds logged per active user per month. Everything above
ladders up to that.

---

## Immediate next actions (this week)

1. Finish the Firestore **security rules** (blocking for any public exposure).
2. Build the **insight/correlation screen** (the reason to keep using it).
3. Claim **domain + social handles**; stand up the landing page with email
   capture.
4. Set up **EAS Build** and get a **TestFlight/Play internal** build out to
   10–15 beta golfers.
5. Start posting **mental-game short-form content** now — the audience takes
   months to build, so start before you "need" it.
