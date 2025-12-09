# Changelog

## Navigation Restructure & Canonicalization (2025-10-25)
- **Created /about page**: Renamed /start-here → /about for clarity (90-sec tour + keyboard shortcuts)
- **Redirect stubs**: /start-here, /trust, /trust.html redirect to canonical URLs with meta refresh + noindex
- **Created /content-rated**: Canonical page for content rating (replaces /trust.html)
- **astro.config.mjs redirects**: Added 301 redirects for /start-here → /about, /trust* → /content-rated
- **Left nav updates**:
  - Added "Index" as first link → /
  - Changed "Start Here" → "About" → /about
  - Updated badge link to /content-rated
  - Added aria-current="page" for active states
- **Footer nav updates**:
  - Added "Index" and "About" links
  - Removed "Start Here" link
  - Added aria-current states for active page highlighting
- **Homepage intro**: Added "New here? About →" link below H1 (kept "Start Here" heading)
- **Back to index**: Added "↑ Back to index" above footer nav on all subpages (monospace, small, center)
- **Shortcuts hint**: Added "Shortcuts: Evidence [E] · Raw [R] · Full guide" in footer metadata
- **Logo a11y**: Added aria-label="Workshop Almanac, go to index" to logo link
- **Active state CSS**: Bold + underline for current page in left nav, bold in footer nav
- **Badge spacing**: Reduced left nav badge margin from 20px → 12px

## Client-Side Filtering & Content Badge Fixes (2025-10-25)
- **Client-side catalog filtering**: Replaced SSG filtering with JavaScript-based filtering for instant results
- **Filter persistence**: URL params work with browser back/forward navigation
- **Content Rated badge**: Added en_aw_88x31.gif to left nav under Shrine with "Content Rated:" label
- **Removed duplicate badge**: Removed trust-88x31.gif from footer (now only in left nav)
- **Left nav badge link**: Points to /trust.html (consolidating content rating pages)
- **Footer typography**: Removed italics from "Site by" and "Served statically" lines
- **Badge spacing**: Increased left nav badge top margin from 12px to 20px
- **Data attributes**: All projects now have data-domain, data-status, data-year for filtering

## ARJ Footer & Navigation Cleanup (2025-10-24)
- **Removed top navigation bar**: Left nav + footer provide all navigation (reduces redundancy)
- **ARJ-inspired footer**: Authentic 1999 layout with italic, bold, underlined links
- **littbut.gif separators**: Brown metallic dots between footer links (8px spacing)
- **88×31 badges**: Added libreboot.gif and bvbstar.gif alongside trust badge
- **Semantic HTML**: Footer wrapped in `<address>` tag for 90s authenticity
- **Copyright & metadata**: PGP fingerprint, site credits, update date, Astro credit
- **Header simplification**: Logo-only header, proof strip flows directly after
- **Moved assets**: black_sign.gif to /public/, badges to /public/assets/

## Font Rendering - Rugged Text (2025-10-24)
- **Disabled font smoothing**: `-webkit-font-smoothing: none` for bitmap/pixelated look
- **Geometric precision**: `text-rendering: geometricPrecision` for sharp edges
- **Pixelated images**: `image-rendering: pixelated` for CRT-era graphics
- **Darker text**: Changed body color to #111 for better contrast with unsmoothed fonts

## Polish - Authentic 2000s Density (2025-10-24)
- **Typography hierarchy**: Bold italic headers (H1-H3) for that handcrafted feel
- **Tight spacing**: Line-height 1.35, paragraph margin 0.35em, tighter list items
- **Boxed-in layout**: 880px max-width, 10px side padding (era-correct constraints)
- **Monospace metadata**: Dull gray (#444) for badges/tags, no backgrounds
- **Authentic blue links**: #0000EE (default browser blue), hover #0000CC, visited #551A8B (purple)
- **Engraved numbers**: Italic numeric gutter with subtle drop-shadow (Win98 depth)
- **Footer dots**: Added drop-shadow for beveled 3D pearl effect
- **Trust badge**: Fixed bottom-left at 12px with 0.9 opacity
- **Logbook spacing**: Tight 4px padding between entries, 1px metadata line-height
- **Removed all hr/dividers**: Explicit `display:none !important`
- **Dense content blocks**: Reduced all padding/margins for print-like density

## Style Update - Early 2000s Academic (2025-10-24)
- Changed typography: Arial/Helvetica body (16px), Courier New monospace
- Blue underlined links (#0066CC), visited links purple (#663399)
- Removed ALL horizontal lines/borders sitewide (header, footer, nav, logbook, year headers)
- Added ARJ-style footer with beveled dot separators
- Added 88×31 trust badge (bottom-left fixed position)
- Implemented numeric gutter (01, 02, 03) for home and catalog pages
- Geeklog-style logbook: bracketed metadata tokens, warning glyph for anomalies
- Uppercase nav labels with letter-spacing
- Evidence mode now preserves links (dims prose only)
- Removed scanlines effect
- Background changed to pure white
- All interactions and hooks (data-portal, #portal-overlay, Evidence, Raw) preserved

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
- Added hardware content: Hephaestus BOM and wiring pages
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
- Created hardware.astro: Hephaestus build pages grouped by part
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
