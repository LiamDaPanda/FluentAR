# FluentAR

A personal, immersion-first language course with 16 levels covering vocabulary, grammar, speaking practice, and AR challenges. Everything runs on your device by default — your transcripts, your streak, your progress — with optional sync to a backend you own.

**All features are free and open.**

## Layout

| Path | Role |
|------|------|
| `mobile/` | Expo (React Native) — course map, lessons, AR challenge, My Journey, Settings |
| `backend/` | Express + SQLite — optional personal cloud sync for progress + AR transcripts |
| `mocks/` | Local mock ASR + scripted tutor dialogue so the app works with zero API cost |
| `shared/` | Per-language course JSON (`shared/courses/{en,es,fr,ja,ko}.json`) + TypeScript types |

Backend listens on **4000** by default (`PORT` env overrides). It only ever serves the device that owns it — there is no teacher view, no leaderboard, no shared state.

## Run (one-click on Windows)

1. Open **File Explorer** and go to this folder.
2. **Right-click `start.bat` → Open** (or just double-click it).
   - Windows SmartScreen may say "Windows protected your PC" the first time → click **More info → Run anyway**. The script is local and only runs `npm`.
3. A black terminal opens. First run takes 2-5 minutes for `npm install`. After that it:
   - opens the backend in a second window (close it any time for device-only mode), and
   - keeps Expo running in the first window.
4. In the Expo window, press **w** to open in a browser on your computer, or scan the QR code with the **Expo Go** app on your **iPhone**. (Android isn't supported in this build.)

If anything fails, the window now stays open with the error so you can read it. Common fixes are printed inline.

## Run (manual)

If you'd rather run things by hand:

```bash
npm install
npm run mobile        # Expo (mobile)
npm run backend       # optional personal cloud sync, in a second terminal
```

In the mobile app, **Settings → Keep everything on this device** is on by default. Turn it off and point **My backend URL** at your machine (web on same machine: `http://localhost:4000`; iPhone via Expo Go: your PC's LAN IP, e.g. `http://192.168.1.42:4000`) to sync your progress and AR transcripts to your own backend.

## My Journey

The Journey screen (CourseMap → "My Journey") is your private log:

- Course completion %, weekly active days, AR conversations saved
- The lessons you've finished, grouped under their modules
- Every AR conversation you've had with the tutor — tap to expand and re-read the transcript

History is stored on the device in AsyncStorage; clearing it is a tap away.

## Course Content

The English course has 16 levels:
1. The Alphabet
2. Greetings
3. Introductions
4. Numbers
5. Family
6. Daily Routine
7. Food
8. Shopping
9. Directions
10. Hobbies
11. Health
12. Hotel
13. Airport
14. Social Phrases
15. Past Tense
16. Future Tense

Each level contains modules with vocabulary flashcards, grammar explanations, speaking practice, and an AR challenge as the final exam.

## Cursor / Claude

Use this repo as the single source of truth: extend the per-language files under `shared/courses/`, add tutor lines under `mocks/claude_responses/`, and wire new screens in `mobile/src/`. The AR screen uses a **WebView stub** (iframe fallback on web); replace with AR.js or native AR when you are ready.
