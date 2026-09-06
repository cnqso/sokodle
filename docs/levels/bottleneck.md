# Bottleneck

An original 9-column × 8-row level with four carrots and four bowls.
Play locally at `/challenge`. The layout lives in `src/lib/levels/bottleneck.json`.

The lower passage starts congested. The puzzle requires staging carrots to regain
access to their other sides, including temporarily taking a carrot out of a bowl.
Chain pushing is intentional and follows Sokodle's existing rules.

## Verification

- The full solution was also played through the browser UI: the game reports **106 moves** and **You Win!**.
- Verified at a 390 px mobile viewport without horizontal overflow.
- Exact minimum: **106 successful movement inputs**, counting a chain push as one move.
- A shortest solution contains 27 push inputs, including 5 chain pushes.
- Reverse breadth-first search from all solved player positions covered 91,202 solvable states.
- A separate forward breadth-first solver independently found the same minimum,
  examining 106,294 discovered states with static dead-square pruning.
- A search that forbids removing carrots from occupied bowls exhausts 25,652 states
  without finding a solution. At least one bowl must be temporarily emptied.
- The independent forward simulator moves every carrot in a chain individually;
  it does not reuse the reverse solver's transition implementation.

<details>
<summary>Solution — spoilers</summary>

`U`, `R`, `D`, `L` mean up, right, down, left. Walls and boxes follow normal game rules.

```text
URUUURRRRRDDLRDDLLLUDRRURUUULLLLLDDDRURLLUURRRRRDDLLLRRDDLLULLUULURRRRDDLDLLUULURDDDRRULDLUULUURDDDRRRUULL
```

This route removes carrots from bowls three times; that is a property of this
route, not a claim that three removals is the minimum.

</details>
