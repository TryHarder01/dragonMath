# Ember's Egg Rescue

# List available recipes
default:
    @just --list

# Install dependencies if needed, then start the game (open http://localhost:5173)
run:
    @[ -d node_modules ] || npm install
    npm run dev

# Install dependencies
install:
    npm install

# Type-check the code
typecheck:
    npm run typecheck

# Production build into dist/
build:
    npm run build

# Serve the production build
preview: build
    npm run preview

# Merge guard: conflict markers, and { } balance in each styles.css section (~1s)
check:
    node scripts/check.mjs

# List agent friction reports (docs/retros/), newest first
retros:
    @ls -1r docs/retros/*.md | grep -v README | head -20

# Check every screen uses the window well (screenshots in audit-screens/)
audit:
    node scripts/audit.mjs

# Drive full rounds in Chrome (screenshots in playthrough-screens/). e.g. `just playthrough nest --level=6`, `all --level=all`, `--real` for real speed
playthrough game="all" *args:
    node scripts/playthrough.mjs {{game}} {{args}}

# Everything before pushing (pushing main deploys): typecheck + build, layout audit, every level of every game played through
verify: check
    npm run build
    node scripts/audit.mjs
    node scripts/playthrough.mjs all --level=all
