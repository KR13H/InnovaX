# ShadowAthlete — demo video

A 57-second, 1920×1080 / 30 fps motion-graphics demo of ShadowAthlete, built with
[Remotion](https://www.remotion.dev) (React → MP4). It's separate from the app: nothing in
`frontend/` or `backend/` depends on it.

- Final video: `media/shadowathlete-demo.mp4` (embedded at the top of the repo README)
- README preview: `media/preview.gif` (a 7 s loop of the model-output scene)
- Thumbnail: `media/thumbnail.png` (1920×1080)

Renders go to `out/` (gitignored). Copy them into `media/` to publish them, as shown below.

## Quick start

```bash
cd demo-video
npm install
npm run studio      # live preview + timeline scrubbing in the browser
npm run render      # → out/shadowathlete-demo.mp4
npm run thumbnail   # → out/thumbnail.png
```

The first render downloads Remotion's headless Chrome (~90 MB). Fonts (Space Grotesk, Inter)
are fetched from Google Fonts at render time, so stay online.

### Publishing a new render to the repo README

```bash
cp out/shadowathlete-demo.mp4 out/thumbnail.png media/
npx remotion ffmpeg -y -ss 16.4 -t 7.4 -i out/shadowathlete-demo.mp4 -vf "scale=960:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle" -r 12 media/preview.gif
```

GitHub doesn't play a repo-hosted MP4 inline in a README, so the README shows the GIF and
links it to the MP4. For an inline player, edit the README on github.com and drag the MP4 into
the editor. GitHub uploads it and inserts a `user-attachments` link that plays in place.

## Editing

Everything you'd normally change is in **`src/config.ts`**:

| What | Where |
| --- | --- |
| Project name and tagline | `PROJECT` |
| Every on-screen caption | `CAPTIONS` |
| Scene lengths (seconds; total must stay 45–60) | `SCENES` |

Colours and fonts follow the app's design tokens in `src/theme.ts`.

## Scenes

| Time | Scene | File | What it shows |
| --- | --- | --- | --- |
| 0–5 s | Hook | `scenes/Hook.tsx` | Tagline, an athlete silhouette and its shadow (drawn from real pose output), logo |
| 5–12 s | App intro | `scenes/Intro.tsx` | Real screens: Home → Train → guided workout |
| 12–15 s | Upload | `scenes/Upload.tsx` | Real Upload screen (drop zone only) |
| 15–24 s | Model output | `scenes/Model.tsx` | Per-frame YOLOv8 + ByteTrack box, MediaPipe skeleton, Random Forest probabilities, joint angles, action timeline |
| 24–30 s | Results | `scenes/Results.tsx` | Real in-app results screen + the pipeline's JSON stats and estimated swings |
| 30–42 s | Progress | `scenes/Progress.tsx` | Real Progress charts, Compare ghost overlay, "future you" + weekly shadow test |
| 42–52 s | Tech | `scenes/Tech.tsx` | Pipeline and stack |
| 52–57 s | Closing | `scenes/Closing.tsx` | Logo and tagline |

## Where the content comes from (accuracy notes)

- **Model output** (`src/data/tennis-output.json`) is real output of the tennis pipeline on the
  sample tennis clip in the dev database. It was produced by
  `scripts/export_tennis_output.py`, which mirrors `backend/analyze_tennis_yolo.py`:
  YOLOv8n + ByteTrack → MediaPipe Pose Landmarker on the player crop → Random Forest
  (`backend/ml_models/tennis_classifier.joblib`, classes: backhand, forehand, ready_position,
  serve) → shot grouping and joint angles. It uses the MediaPipe estimator from
  `app/vision/tennis_pose_estimator.py`, because `app/vision/pose_estimator.py` is now the
  cricket (RTMPose) estimator. It also picks the most prominent track, which is id 1, the same
  id the original script hard-codes.
- **The footage is never shown.** The sample clip is third-party broadcast footage, so only
  derived data (boxes, landmarks, labels) is drawn, and the scene says so on screen.
- **App screens** (`public/screens/`) are real captures of the running app
  (`scripts/capture-screens.mjs`), with every `<video>` hidden for the same reason. The test
  account's name was temporarily set to "Jordan" for capture and restored afterwards.
- **Tracking vs. the in-app endpoint.** YOLOv8 + ByteTrack runs in the offline tennis script.
  The app's `/sessions/{id}/analyze-tennis` endpoint uses MediaPipe + Random Forest without the
  tracking stage. The Tech scene states this.
- **Left out on purpose:**
  - the Welcome screen and the lower part of the Upload screen, which still contain
    placeholder design copy (e.g. "GHOST SYNC 99.4%", a sample `morning_forehand_rally.mov`);
  - the running "shadow race" (current vs. previous vs. predicted run), which isn't
    implemented. The Progress scene uses the implemented Compare, Progress and weekly
    shadow-test features instead.
- **Logo.** The app's logo is a remote image that didn't load headless, so the video uses a
  vector recreation: an athlete figure with an offset cyan shadow, in the app's colours.
- **Music.** None. No royalty-free track ships with the repo, and the video is designed to
  work without sound. To add one, put the file in `public/` and add
  `<Audio src={staticFile("music.mp3")} />` inside `Demo` in `src/Root.tsx`. Record its
  source and licence here.

## Refreshing the assets

**Screens** need the app running (frontend :3000, backend :8000) and a valid access token:

```bash
SA_TOKEN=<jwt> APP_URL=http://127.0.0.1:3000 npm run capture
```

**Model output**, from the repo root, using the backend's virtualenv:

```bash
.venv/bin/python demo-video/scripts/export_tennis_output.py "$PWD/backend/uploads/<user>/<id>.mp4" /tmp/tennis-output.json
python3 demo-video/scripts/slim-tennis-output.py /tmp/tennis-output.json
```

The first run downloads `yolov8n.pt` (~6 MB) from Ultralytics into `demo-video/scripts/`
(gitignored). Ultralytics also installs `lap` into the venv for ByteTrack.

### Better footage (optional)

To show real footage instead of a dark canvas, record your own clip with the right to publish
it: one player, side-on, full body in frame, 5–15 s, 30 fps or more. Re-run the export on it,
and optionally add the clip behind the overlay in `scenes/Model.tsx` with `<OffthreadVideo>`.
