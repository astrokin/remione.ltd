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

Authenticate once. The repo is already configured to use the `remione-ltd` Firebase project:

```bash
npx firebase login
```

Deploy manually from the terminal:

```bash
npm run deploy
```
