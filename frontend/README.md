# ShadowAthlete — mobile web frontend

Next.js 15 + Tailwind 3 app built from the Google Stitch designs in `../design/stitch/`.
It renders as a phone-width app (full-screen on phones, a centered 430px frame on desktop).

## Run

```bash
cd frontend
npm install
npm run dev        # http://localhost:3000
```

API calls go to `/api/*`, which Next proxies to FastAPI at `http://localhost:8000`
(override with `API_URL=...`). With the backend down, the app runs on the Stitch demo data
(Alex Carter) and auth screens show a "can't reach the server" message.

## Screens

| Route | Stitch screen |
| --- | --- |
| `/` | welcome_shadowathlete |
| `/login`, `/signup`, `/reset-password` | log_in / sign_up / password_reset |
| `/onboarding/details` → `/onboarding/sports` → `/onboarding/analyzing` → `/onboarding/reveal` | onboarding + cinematic loading + digital twin reveal |
| `/home` | athlete_home_dashboard |
| `/avatar` | my_avatar_shadowathlete |
| `/sports`, `/sports/tennis` | sports_hub, tennis_details_analysis |
| `/sessions` | mobile_session_history |
| `/capture` → `/capture/review`, `/capture/upload` | camera_recording, mobile_video_review_submission, gallery_video_upload |
| `/profile`, `/settings` | mobile_athlete_profile_settings, settings_preferences |

## Backend wiring

Signed out, every screen shows the Stitch demo athlete (Alex Carter). Signed in, screens use live
data and show "—" (or an empty state) where the backend has nothing yet — never invented numbers.

| Screen | Endpoints |
| --- | --- |
| Sign up / log in | `POST /auth/signup`, `POST /auth/login`, `GET /auth/me` |
| Onboarding | `POST·PATCH /athlete/profile`, `GET /sports`, `POST /athlete/sports` |
| Home | `GET /athlete/dashboard` (name, level, XP, score, attributes), `GET /sessions` |
| My Avatar | `GET /athlete/dashboard` attributes → radar (current / peak / target) |
| Sessions | `GET /sessions`, `GET /sessions/{id}/recap` |
| Session detail (`/sessions/[id]`) | `GET /sessions/{id}`, `/recap`, `/explanation`, `/video` (clip playback), analyze endpoints for un-analyzed clips |
| Progress (`/progress?sport=`) | `GET /sessions` + each session's `recap`; key metrics per sport and a "future you" projection (`lib/progress.ts`) |
| Compare (`/compare?now=&past=`) | two sessions' `recap` + `video`; in-browser ghost overlay of both skeletons (`components/GhostCompare.tsx`) |
| Train (`/train?sport=`) | `POST /training/generate/{sport}/{session_id}`, `GET /training/athlete/{id}/history`, `GET /training/plan/{id}`, `POST /training/workout/{id}/complete\|skip`; basketball shows the drills from its analysis (no backend planner) |
| Sports hub | `GET /sessions` (latest per sport) |
| Tennis | latest tennis `recap` → stroke split, elbow/knee angles, pose detection |
| Profile / Settings | `GET /athlete/dashboard`, `GET /records`, `GET /auth/me` |
| Capture → analysis | `POST /sessions`, `POST /sessions/{id}/upload`, then `analyze-tennis` / `analyze` (cricket) / `analyze-running` |

Not wired because the backend returns 501 for them: `/athlete/xp`, `/athlete/level`,
`/athlete/versions`, `/athlete/archetype`, `/athlete/heatmap`, `/sports/{slug}/stats|history`,
`/progress/*`, `/shadow/*`. Basketball has no video analyzer endpoint.

## How the screens were made

`scripts/stitch-to-jsx.mjs` converts a Stitch `code.html` into a JSX component, keeping every
Tailwind class. `tailwind.config.ts` is Stitch's config verbatim. The generated components in
`components/screens/` were then hand-wired (state, navigation, API), so **re-running the converter
overwrites that wiring** — only use it to bootstrap a new screen.

The Stitch nav bars differed per screen; all tab screens now share `components/BottomNav.tsx`
(the 5-tab variant from the My Avatar screen).
