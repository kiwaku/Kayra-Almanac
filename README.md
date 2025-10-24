# Kayra — Workshop Almanac

A sober, 2000s-leaning, artifact-first portfolio built with Astro.

## Features

- **Content Collections**: Projects, logbook, notebooks, hardware documentation
- **Filtering**: Domain and status filters via query params
- **Evidence Mode** [E]: Dims prose, highlights artifacts
- **Raw Markdown** [R]: Toggle raw markdown view
- **Lazy Loading**: All images load lazily for performance
- **Mobile Responsive**: Clean stack layout on ≤768px
- **2000s Aesthetic**: Verdana, 1px borders, subtle scanlines, no gloss

## Tech Stack

- Astro 5.x (SSG)
- MDX for content
- Zod for schema validation
- Sharp for image processing
- TypeScript (strict mode)

## Development

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Deployment

Configured for Vercel with auto-deploy on push.

## Content Structure

- `src/content/projects/`: Project MDX files
- `src/content/logbook/`: Chronological log entries
- `src/content/notebooks/`: Technical deep-dives
- `src/content/hardware/`: Hardware build documentation
- `public/artifacts/`: Images, diagrams, wiring photos

## Keyboard Shortcuts

- **E**: Toggle Evidence Mode
- **R**: Toggle Raw Markdown

## Version

v0.1 — Workshop Almanac
