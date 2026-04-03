<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Subscription Manager

This project was exported from Google AI Studio and adjusted for static deployment on GitHub Pages.

View the original AI Studio app: https://ai.studio/apps/fe430c2b-b459-44c0-b220-49af77cb1b27

## Local development

Prerequisite: Node.js 20+

1. Install dependencies:
   `npm install`
2. Start the dev server:
   `npm run dev`

## GitHub Pages deployment

This repository is configured for project-page deployment at:

`https://username.github.io/subscription_manager/`

### One-time GitHub setup

1. Create a GitHub repository.
2. Push this project to the `main` branch.
3. In GitHub, go to `Settings -> Pages`.
4. Set `Source` to `GitHub Actions`.

### How deployment works

- Every push to `main` runs `.github/workflows/deploy.yml`.
- The workflow installs dependencies, builds the Vite app, and deploys `dist/` to GitHub Pages.

## Notes

- The app is currently static and does not require a backend.
- No Gemini API key is needed for this version.
- If you rename the repository, update `repoName` in `vite.config.ts`.
