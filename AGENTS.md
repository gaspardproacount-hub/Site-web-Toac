# Direct-to-main deployment policy

The repository owner has pre-authorized skipping pull request review for Claude Code sessions on this repo. Once your changes build and lint cleanly:

- Push the finished work directly to `main` (in addition to any session/task branch you were assigned) instead of waiting for a pull request to be opened or merged.
- Do not create a pull request for routine changes — `main` deploys straight to production via Vercel.
- Still run `npm run lint` and `npm run build` before pushing, and never force-push over `main`.
- If a change is large, architecturally significant, or risky (schema/auth/payment changes), pause and confirm with the user before pushing to `main` even though PR review is otherwise skipped.
