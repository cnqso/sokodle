# Daily difficulty

Daily puzzles show the same 1–3 guinea pig badge as community levels, beside the
Sokodle title. The API returns `difficulty` with both stored and fallback layouts.

The current six-map fallback rotation keeps its existing order. Cross and
2 solutions are rated 1; 4Box, T2/Wikipedia, Claustrophobic, and Hard? are rated 2,
matching their community versions. Basic/T1 is also rated 1 when scheduled.
Ratings are editorial, not inferred from the date or randomized.

`src/lib/levels/daily-ratings.json` holds the layout-based ratings for these maps
and the older database seed layouts. The database `daily_levels.difficulty` field
can override them, accepts 1–3, and defaults to 2 for future inserted puzzles.
Set it explicitly when scheduling a new daily puzzle.

Run `node scripts/migrate-daily-difficulty.mjs` before deploying the API change,
with DB_HOST, DB_USER, DB_PWSS, and DB_NAME in the environment. The additive
migration matches exact layouts, stops on unreviewed unrated records, and preserves
existing ratings on reruns. Schema additions commit separately from the backfill.
It was applied to all 10 production daily records on September 6, 2026.

No level layout, scheduled date, or fallback rotation was changed.
