# Ember's Egg Rescue

A math game for a young child, built by a parent: warm dragon eggs, walk dinos home and share gems while practising adding, subtracting, place value and the times tables. No timers, lives or scores. Every instruction is spoken, and every wrong answer gets a picture hint.

**Play:** https://effulgent-dieffenbachia-f29f59.netlify.app/

On a phone or iPad, open it in Safari and use Share → Add to Home Screen to get a full-screen app. Progress is saved on that device.

## Run it locally

```sh
just run      # installs dependencies if needed, then serves http://localhost:5173
just          # lists the other recipes: typecheck, build, audit, playthrough, verify
```

`just run` also serves it to a phone on the same wifi (use the Network address it prints).

## Deploying

Netlify builds and publishes every push to `main` on GitHub (`npm run build` → `dist/`, set in `netlify.toml`). There's no separate deploy step. Run `just verify` before pushing.

## More

- `AGENTS.md`: how the code is laid out and the rules for working on it (for people and coding agents).
- `DESIGN.md`: the game design. `docs/specs/`: one spec per game. `docs/research/`: the research behind it.
- The in-game "For grown-ups" page (also at `/#parents`) explains each game and its levels.
