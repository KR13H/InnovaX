<div align="center">

# ShadowAthlete

**Your next opponent is you.**

[![ShadowAthlete demo: click to watch the full video](demo-video/media/preview.gif)](demo-video/media/shadowathlete-demo.mp4)

▶ **[Watch the full 57-second demo (MP4)](demo-video/media/shadowathlete-demo.mp4)**

</div>

---
## About ShadowAthlete

### Your only opponent is you.

An AI-powered athlete digital twin platform that turns movement into insight and progress into a challenge against your past self.

**One athlete. One avatar. Multiple sports.**

---

## Overview

ShadowAthlete brings video analysis, athletic progression, and personalized coaching into one experience.

The idea is simple: record your performance, understand your movement, and use what you learn to beat your own best.

Instead of treating every sport as a separate profile, ShadowAthlete connects them through a persistent digital twin. Attributes such as speed, power, coordination, endurance, and technique reflect how an athlete develops over time.

**Meet the athlete you're chasing: you.**

## Inspiration

Athletes can record their training, but footage alone does not explain what changed or what to work on next. Personal records capture an outcome, while often missing the movement behind it.

We wanted to make improvement visible and personal. ShadowAthlete connects movement analysis with an evolving athlete identity and a simple challenge: outperform your previous self.

## How it works

1. **Capture** — Upload or record a sport session.
2. **Analyze** — Extract movement information using computer vision and sport-specific analysis.
3. **Build** — Use session results to develop the athlete's digital twin.
4. **Compare** — Measure progress against previous performances in Shadow Mode.
5. **Improve** — Turn insights into focused practice and track the next improvement.

## Product experience

ShadowAthlete is a hackathon prototype. The features below describe the product vision; availability depends on the current implementation. Some demo metrics may be simulated.

### Athlete digital twin

One athlete profile connects an avatar, performance history, sport skills, and universal attributes:

- Speed
- Power
- Endurance
- Agility
- Coordination
- Balance
- Mobility
- Reaction
- Technique
- Recovery

The twin brings together three perspectives:

| Perspective | Purpose |
| --- | --- |
| **Current You** | Understand your present performance. |
| **Peak You** | Compare against your personal bests. |
| **Target You** | Set goals for your future performance. |

### Video and movement analysis

The analysis experience is designed to combine:

- Athlete tracking and pose estimation
- Skeleton overlays
- Movement timing and joint angles
- Sport-specific movement classification
- Session summaries and technique feedback

The goal is to connect performance metrics to the movement behind them.

### Shadow Mode

Your previous performance becomes your next challenge.

Compare sessions, identify where you improved, and discover which parts of your technique still need work.

The longer-term vision includes synchronized ghost overlays that show current and previous movement together.

### AI coaching

The coaching experience is intended to use session history and athlete goals to:

- Explain changes in performance
- Identify areas to practice
- Recommend focused drills
- Suggest training priorities
- Summarize progress over time

Feedback should distinguish observed results from estimates and recommendations.

### Athlete progression

Levels, XP, achievements, and personal records make improvement visible.

The progression system is designed to reward consistency, technique, and recovery alongside performance.

## Multi-sport vision

Every sport contributes to one connected athlete profile.

| Sport | Intended analysis areas |
| --- | --- |
| **Running** | Cadence, stride consistency, posture, symmetry, and movement efficiency |
| **Basketball** | Shooting mechanics, release consistency, balance, and jumping movement |
| **Tennis** | Stroke classification, forehand and backhand mechanics, positioning, and footwork |
| **Cricket fast bowling** | Run-up consistency, delivery mechanics, release consistency, and follow-through |

Sport-specific measurements require appropriate models and validation. Physical measurements such as ball speed, stride length, and jump height may require camera calibration or additional inputs.

## What makes ShadowAthlete different

- **One connected identity:** Multiple sports contribute to the same athlete digital twin.
- **Personal competition:** Your own performance history becomes the benchmark.
- **Movement with context:** Video analysis helps explain what a metric means.
- **Cross-sport development:** Shared attributes connect improvement across activities.
- **Visible progression:** Your athlete profile evolves with your training history.

## Technical direction

The original project brief proposes the following stack. Check the repository's dependency manifests for the technologies currently implemented.

| Layer | Proposed technologies |
| --- | --- |
| Frontend | Next.js, React, TypeScript, Tailwind CSS, Framer Motion |
| Avatar and graphics | Three.js, React Three Fiber |
| Backend | Python, FastAPI |
| Computer vision and ML | OpenCV, MediaPipe, PyTorch, YOLO where appropriate |
| Database | PostgreSQL with an ORM |
| Background processing | Redis and a task queue such as Celery |
| Video storage | Object storage such as Amazon S3 |

### Intended architecture

Video analysis runs separately from the interface:

1. The athlete submits a video session.
2. The API creates a processing request.
3. A computer vision worker tracks movement and extracts features.
4. Sport-specific models produce analysis results.
5. The metrics layer updates the athlete profile.
6. The interface presents the session recap and progress.

This structure allows new sports and models to be added without rebuilding the core athlete experience.

## Getting started

Clone the repository:

~~~bash
git clone https://github.com/KR13H/InnovaX.git
cd InnovaX
~~~

The repository name is **InnovaX**; the product name is **ShadowAthlete**.

Use the dependency manifests, package scripts, and environment examples in your checkout to configure and run the frontend and backend.

Exact startup commands, required environment variables, and model downloads should be documented against the current source code.

Keep credentials in local environment files and out of version control.

## Prototype limitations

- Some interface metrics and historical data may be simulated for demonstration.
- Tracking and pose quality depend on camera angle, visibility, lighting, occlusion, and video quality.
- Detection coverage and model confidence do not establish classification accuracy.
- Model validation requires labeled examples and evaluation across varied footage.
- Athlete scores and cross-sport projections are not validated physiological measurements.
- Recovery and workload insights are performance guidance, not medical diagnoses.

## What's next

- Validate sport models on larger, labeled video datasets.
- Improve athlete tracking across different recording conditions.
- Expand sport-specific analysis and explainable feedback.
- Add synchronized session comparisons and ghost overlays.
- Connect measured results to persistent avatar progression.
- Develop coaching grounded in each athlete's actual history.
- Explore wearable integrations and adaptive training plans.
- Build coach dashboards for reviewing multiple athletes.

---

**Build your athlete. Challenge your shadow. Beat your best.**
