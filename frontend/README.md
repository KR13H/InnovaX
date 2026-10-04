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

- `POST /auth/signup`, `POST /auth/login`, `GET /auth/me` — sign up / log in; JWT kept in `localStorage`.
- `POST|PATCH /athlete/profile`, `GET /athlete/profile` — onboarding details; names/stats on Home, Profile, Settings.
- `GET /sports`, `POST /athlete/sports` — onboarding sport selection.
- `POST /sessions` + `POST /sessions/{id}/upload` — capture/upload flow. The upload endpoint currently
  returns 501 on the backend; the app says so and continues to the analysis screen.

## How the screens were made

`scripts/stitch-to-jsx.mjs` converts a Stitch `code.html` into a JSX component, keeping every
Tailwind class. `tailwind.config.ts` is Stitch's config verbatim. The generated components in
`components/screens/` were then hand-wired (state, navigation, API), so **re-running the converter
overwrites that wiring** — only use it to bootstrap a new screen.

The Stitch nav bars differed per screen; all tab screens now share `components/BottomNav.tsx`
(the 5-tab variant from the My Avatar screen).
