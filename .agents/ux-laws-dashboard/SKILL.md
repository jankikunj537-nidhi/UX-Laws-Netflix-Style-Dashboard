---
name: ux-laws-dashboard
description: >-
  Skill for managing the UX Laws Netflix‑Style Dashboard project.
  Provides shortcuts for common developer tasks such as starting the dev server,
  building for production, deploying to Vercel, and applying UI tweaks.

# Usage

- **/dev** – Starts the development server (`npm run dev`).
- **/build** – Builds the production bundle (`npm run build`).
- **/deploy** – Deploys the latest commit to Vercel using the `vercel` CLI.
- **/update‑ui** – Runs a script that removes match percentages, duration badges, and shrinks the play button.
- **/git‑status** – Shows `git status` for the project.

# Implementation Details

The skill executes commands in the project's root directory:

```powershell
cd "D:\\STUDY\\Experiments\\UX_Laws_Dashboard_FINAL"
```

Each command is run with a short timeout and logs its output to the console.

# Example Slash Command

```text
/dev
```

Will run:
```powershell
npm run dev
```

# Notes
- Ensure the `vercel` CLI is installed (`npm i -g vercel`).
- The `/update‑ui` command invokes the custom script `scripts/update-ui.js` you can add to the repo.
---
