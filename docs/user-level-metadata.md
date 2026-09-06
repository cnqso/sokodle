# Creator credits and difficulty

New submissions require a level title, creator username (up to 32 characters),
and difficulty (1–3). Usernames are display credits, not authenticated accounts
or unique handles. The editor remembers the last successfully submitted username
on the same browser. Old levels with no recorded creator display “Anonymous.”

The historical `user_name` database column remains the **level title**;
`creator_name` is the new, separate credit. Country lookup and display are removed.
Historical country data is retained.

Both submitted names are checked independently, before insertion, using the
[OpenAI moderation API](https://developers.openai.com/api/reference/resources/moderations/methods/create).
A flagged name, unavailable moderation service, or invalid response prevents saving.
Set `OPEN_AI_KEY` (existing name) or `OPENAI_API_KEY` on the server.

## Existing levels

Ratings are editorial assessments of route planning, staging, and traps, using
Sokodle's chain-pushing rules. Move counts are supporting evidence, not an automatic
difficulty formula. T2 has spare carrots; solving it only requires filling every bowl.

| ID | Level | Guinea pigs | Rationale |
| --- | --- | --- | --- |
| 3 | 4Box | 2 | Four deliveries through narrow passages; staging and access matter. |
| 6 | T1 | 1 | Two carrots, four pushes, and a short walk around the central wall. |
| 7 | T2 | 2 | A crowded seven-carrot board with five bowls and constrained access. |
| 8 | Cross | 1 | A repeated, readable delivery pattern around an open center. |
| 9 | 2 solutions | 1 | A compact chain-pushing puzzle with few viable branches. |
| 10 | Claustrophobic | 2 | Short but tight: four carrots constrain one another's routes. |
| 11 | Hard? | 2 | Longer routes and dead-end traps require planning. |
| 12 | Bottleneck | 3 | Interdependent staging and temporarily emptying a bowl; 106 moves minimum. |

Independent breadth-first search confirmed shortest solutions for T1 (24 moves),
Cross (34), 2 solutions (29), Claustrophobic (19), Hard? (43), 4Box (51), and
Bottleneck (106). T2 exceeded the 600,000-state search cap; its rating is based on
layout review, not a claimed shortest solution.

## Applying to an existing database

Run from the project root with the same database environment as the application:

```sh
node scripts/migrate-user-level-metadata.mjs
```

Apply **before deploying the new API code**. This additive migration creates
`creator_name` and `difficulty`, fills reviewed ratings, and credits Bottleneck to
Codex. It compares IDs, names, and layouts with `scripts/user-level-ratings.json`
to avoid rating a different puzzle by accident. Unreviewed unrated rows stop the
backfill transaction for review. Existing non-null ratings and creator names are
preserved on reruns. MySQL schema additions commit separately from the backfill;
a failed run can safely be retried after the reported issue is fixed.

`database-setup.sql` includes the new columns for fresh installations.

Production migration applied September 6, 2026. All eight stored layouts matched
the reviewed fixtures; their ratings were verified after the backfill. Bottleneck
is credited to Codex. The other seven levels have no recorded creator and display
Anonymous. Database credentials are supplied only through the process environment.
