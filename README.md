# Nushi to Tanoshi (flat version)

A phone-first tracker for a 12-week glute, shoulder and abs plan.
Every file sits in one folder (no subfolders), so it uploads to GitHub in one drag.

## Deploy
1. Upload all files in this folder to the root of a GitHub repository.
2. Import the repository in Vercel (Framework: Vite, build `npm run build`, output `dist`).
3. Open the live URL on a phone and add it to the home screen.

Her log is saved on her phone as she types. Weeks carry forward automatically.

## Optional: cloud sync
1. In GitHub, click Add file, then Create new file. Type `api/sync.js` as the file name
   (typing the slash creates the folder) and paste in the contents of `api-sync.js`. Commit.
2. In Vercel, open Storage, add Upstash Redis and connect it to the project. Redeploy.
3. In the app open Settings, Cloud sync, and turn it on. Keep the sync code safe.

## Editing the plan
Everything (exercises, sets, reps, rests, home plan, video links) is in `plan.js`.
