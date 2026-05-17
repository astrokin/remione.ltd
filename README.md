# Remione LTD

Static React/Vite rebuild of `remione.ltd`, configured for manual Firebase Hosting deploys.

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Firebase deploy

Authenticate once and attach the local repo to the Firebase project:

```bash
npx firebase login
npx firebase use --add
```

Deploy manually from the terminal:

```bash
npm run deploy
```

The Firebase project id is intentionally not committed because it depends on the hosting project selected in the local Firebase CLI.
