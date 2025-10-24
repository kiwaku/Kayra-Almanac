# Changelog

## Phase 4 - Core Components (2025-10-24)
- Created ProofStrip: dynamic project counts, OS builds, last update date
- Created LeftNav: navigation links with data-portal hooks
- Created ArtifactRow: displays diagrams, README, postmortem, image count
- Created Filters: domain and status query-param filters

## Phase 3 - Layouts & Styles (2025-10-24)
- Created BaseLayout with header, ProofStrip, left nav, footer, portal stub, lightbox script
- Created SectionLayout wrapper
- Implemented theme.css: 2000s sober aesthetic, scanlines, Evidence fade, mobile responsive

## Phase 2 - Content Schemas (2025-10-24)
- Implemented content collections: projects, logbook, notebooks, hardware
- Added `featured` flag to projects for homepage
- Added `anomaly` flag to logbook for shrine hooks

## Phase 1 - Structure (2025-10-24)
- Created folder structure per §3: public/artifacts, src/{components,layouts,pages,styles}, content collections
- Added placeholder files for favicon and OG image

## Phase 0 - Init (2025-10-24)
- Created Astro project with strict TypeScript
- Installed dependencies: @astrojs/mdx, @astrojs/sitemap, zod, sharp
- Configured astro.config.mjs with MDX and sitemap integrations
