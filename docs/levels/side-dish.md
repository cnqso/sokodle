# Side Dish

An original 9-column × 8-row puzzle with four carrots and four bowls.
Play at `/challenge/side-dish`. The layout is in `src/lib/levels/side-dish.json`.
Rated **2 guinea pigs**, toward the harder end of that range.

The central wall divides two loops. Three carrots block the lower connecting
passage, and a fourth occupies the left approach. The puzzle asks the player to
create passing room, switch sides, and separate deliveries. At least one chain
push is required. Every bowl can stay filled once its carrot is delivered.

This aims below Bottleneck's difficulty: fewer moves, fewer pushes, and no required
removal of a carrot from a bowl. It still rewards planning the order of deliveries.

## Verification

- An independent forward breadth-first solver finds an exact minimum of **60
  successful movement inputs**, with chain pushes counting as one move.
- The returned shortest route has **16 push inputs**, **one chain push**, and
  **zero emptied bowls**. These counts describe that route, not separate minima.
- Forward search discovers 17,708 states before reaching its first solution.
- Disallowing chain pushes exhausts 1,374 states without a solution.
- Independent reverse search over this terrain finds the same 60-move distance;
  it enumerates 139,702 solvable states over all starting positions.
- Browser playthrough of the production build reaches “You Win!” in 60 moves.

Reproduce the forward checks:

```sh
node scripts/solve-level.cjs src/lib/levels/side-dish.json
node scripts/solve-level.cjs src/lib/levels/side-dish.json --no-chain
```

<details>
<summary>Solution — spoilers</summary>

`U`, `R`, `D`, `L` mean up, right, down, left.

```text
UURRRDDDDLUUURULLLDLDDRUUURRRDDDDLUURUULLLDDDRRUURDDLLLUUURR
```

</details>
