# FluentAR Mobile - Development

## Run the App

Run `start.bat` from the FluentAR root directory:

```cmd
start.bat
```

Or directly:

```cmd
npm run mobile
```

This starts Expo Dev Server at http://localhost:8081

## Project Structure

- `mobile/` - React Native app (Expo SDK 51)
- `mobile/src/screens/` - All app screens
- `mobile/src/context/` - React contexts
- `shared/courses/` - Course data (en, es, fr, ja, ko)

## Key Files

- `mobile/App.tsx` - Main entry with navigation
- `mobile/src/screens/LessonScreen.tsx` - Flashcard review with check/X buttons
- `mobile/src/screens/ARScreen.tsx` - AR experiences
- `shared/index.d.ts` - TypeScript types