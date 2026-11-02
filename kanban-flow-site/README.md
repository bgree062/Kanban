# Kanban Flow Lab

A complete React/Vite website featuring a three-phase Kanban workshop simulation.

## What is included
- Professional homepage and dedicated simulator section
- 3, 4, or 5 players; shuffled real 52-card deck (dealt without replacement per 10-day cycle)
- Manual simulation with legal red/black card actions and helping rules
- Automatic simulation with staged decisions
- Phase 1: Days 1–10, unlimited WIP
- Phase 2: Days 11–20, WIP 3 and random Daily Stand-Up leader
- Phase 3: fresh board and WIP 3, 10 or 20 days (chosen only after Day 20)
- Day 31 WIP adjustment (3/4; up to 5 for five-player teams) only on the 40-day path
- CFD, daily throughput lines, lead-time histograms, average, min, max, percentiles, oldest unfinished age
- Responsive layout, suitable for desktops, tablets, and mobile browsers

## Run locally
1. Install Node.js 20 or newer.
2. In this folder, run `npm install`.
3. Run `npm run dev` and open the URL printed by Vite.
4. Build with `npm run build`.

## Publish (Vercel)
1. Create a GitHub repository and upload the contents of this folder (not the enclosing folder).
2. In Vercel, import your repository as a new project.
3. Framework preset: Vite. Build command: `npm run build`. Output directory: `dist`.
4. Deploy. Your website gets a public URL; no backend required.

## Multiple simultaneous users
Each browser session runs entirely on the user's own device. This means many participants can visit the same published URL at the same time **without affecting one another**. There is no account, central database, synchronized instructor/participant view, or shared team board in this version. Do not interpret independent use as synchronized collaboration.

## Important simulation notes
- All phases replay the same shuffled 10-day card sequence. On the 40-day path, the final 10 days replay it a fourth time.
- Phase 2 carries the Phase 1 board; an over-limit column must drain before new work enters.
- Phase 3 has its own fresh board and independent CFD Day 0 baseline.
- Daily DSU leaders are randomly selected from the team. DSU does not independently alter automated outcomes.
- The automatic strategy starts work first in Phase 1 and favors unblocking/advancing work from Phase 2 onward. Results compare a *bundle of practices*, not an isolated causal effect of WIP alone.
- Lead-time percentiles are empirical completed-task percentiles, not statistically validated prediction intervals.
- This app is educational. It is not production-persistent, and refreshing the page resets the session.
