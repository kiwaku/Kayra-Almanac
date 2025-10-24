# Changelog

## Phase 10 - SEO & Deploy (2025-10-24)
- Added robots.txt with sitemap reference
- Created vercel.json for Vercel deployment
- Added comprehensive README.md
- SEO meta tags already present in BaseLayout (OG tags, description)
- Sitemap integration configured in astro.config.mjs

## Phase 9 - Performance (2025-10-24)
- All gallery and hardware images already use loading="lazy"
- Placeholder images are minimal (empty files)
- No images exceed 2MB (all are placeholders awaiting real content)

## Phase 8 - QA Pass (2025-10-24)
- Fixed TypeScript errors in BaseLayout scripts (removed TS-specific syntax)
- Fixed catalog domain filter type issue
- Fixed index page async rendering with Promise.all
- Build now passes with 0 errors, 0 warnings
- All 9 pages generated successfully

## Phase 7 - Seed Content (2025-10-24)
- Added 3 featured projects: Himorogi (OS/security), RedLLM (AI/security), CREST-SNN (AI/hardware)
- Added 5 logbook entries (2024-2025), one marked as anomaly
- Added hardware content: Homunculus BOM and wiring pages
- Added 1 technical notebook: Initrd pitfalls
- Created placeholder images for all artifacts

## Phase 6 - Toggles & Portal Stub (2025-10-24)
- Added evidence-toggle.js: [E] key dims prose, highlights artifacts
- Added raw-toggle.js: [R] key toggles raw markdown <details> element
- Portal stub already wired in BaseLayout (data-portal attributes, #portal-overlay div)

## Phase 5 - Pages (2025-10-24)
- Created index.astro: homepage with featured projects and latest logbook
- Created catalog.astro: filterable project index with query params
- Created logbook.astro: chronological entries grouped by year, ALERT marker
- Created gallery.astro: lazy-loaded image grid from all projects
- Created hardware.astro: Homunculus build pages grouped by part
- Created notebooks.astro: technical notes index
- Created start-here.astro: 90-second tour and keyboard shortcuts
- Created shrine.astro: minimal v1 stub
- Created 404.astro: not found page

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
