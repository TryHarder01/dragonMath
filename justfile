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
