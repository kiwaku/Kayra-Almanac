# 00 — Tooling Reference (Mobile Redesign Research Track)

Scope: which tools to reach for across the six research tasks (01–06) and the
implementation tasks that follow. This is a reference, not a research finding.
It does not answer *what* the mobile design should be — only *how* to look.

Spine: modern-retro hybrid on Astro 5 SSG. Research happens first; decisions
and implementation follow.

---

## 1. MCPs

### context7 (`mcp__context7__*`)

- **Purpose:** fetch versioned, canonical library/framework docs without
  hitting rate-limited search or stale cached pages.
- **When to use:**
  - Any Astro 5 API question (`astro:content`, Image component, view
    transitions, `@astrojs/*` integrations).
  - CSS/HTML/Web API lookups where MDN would be authoritative but you want
    the spec-clean version.
  - Tailwind, Vite, or any framework that ships a `resolve-library-id`-able
    package.
- **When NOT to use:**
  - Opinion sources (NN/g, A List Apart, blog posts) — use WebFetch.
  - Spec bodies like W3C/WCAG — use WebFetch on the canonical URL.
  - Design systems (HIG, Material) — WebFetch.
- **Example invocation:**
  - `resolve-library-id` → `"astro"` → use returned ID in `query-docs` with
    topic `"content collections glob loader"`.

### github (`mcp__github__*`)

- **Purpose:** inspect prior-art repos, file issues on this repo, read
  existing PRs, or cross-reference public Astro examples.
- **When to use:**
  - Looking at how other Astro sites structure mobile layouts
    (`search_code`, `get_file_contents`).
  - Checking issue history on `withastro/astro` for known mobile quirks.
  - Drafting an issue/PR once implementation starts.
- **When NOT to use:**
  - Local git work — use Bash.
  - General web search — use WebSearch.
  - Reading local files — use Read.
- **Example invocation:**
  - `search_code` q=`"@media (max-width" language:astro repo:withastro/astro`.

### sequential-thinking (`mcp__sequential-thinking__sequentialthinking`)

- **Purpose:** explicit multi-step reasoning scratchpad for decisions with
  several competing constraints (e.g., reconciling HIG touch targets with
  retro typography scale).
- **When to use:**
  - Synthesis tasks at the end of a research doc where 4+ sources must be
    reconciled.
  - Tradeoff matrices where flat prose would hide the branching.
- **When NOT to use:**
  - Lookup tasks ("what is the iOS safe-area token name?").
  - Anything a short bulleted list already handles.
- **Example invocation:**
  - One call per research task's *Decision* section; skip for *Findings*.

### claude_ai_Google_Drive

- **Purpose:** retrieve user-authored notes, PDFs, or design references
  stored in the user's Drive.
- **When to use:**
  - User says "see the doc in Drive" or references an uploaded PDF.
  - Pulling a pre-existing mobile brief, moodboard notes, or client-supplied
    spec.
- **When NOT to use:**
  - Public web content — WebFetch.
  - Code or repo artifacts — Read/Grep.
  - Speculatively trawling Drive without a user-named document.
- **Example invocation:** only when user cites a Drive doc by name/title.

> Note: this MCP is not listed in the current tool inventory for this session;
> see §6 and §7 below.

---

## 2. Skills

| Skill | Phase | Purpose |
|---|---|---|
| `simplify` | implementation / validation | Review changed code for reuse, quality, efficiency; applied after each mobile component lands. |
| `review` | validation | PR review pass once a research→implementation cycle produces a branch. |
| `security-review` | validation | Scan pending changes for security regressions; low-priority for a static portfolio but run before any form/endpoint work. |
| `codex:rescue` | implementation (when stuck) | Hand off a stubborn bug or request a second-opinion implementation via Codex. Not for research. |
| `claude-api` | n/a | Not relevant — no Anthropic SDK usage in this project. Skip unless the portfolio gains an API-backed feature. |
| `update-config` | all phases | Configure `settings.json` hooks/permissions (e.g., auto-run Lighthouse on save, allow `pnpm` without prompts). |
| `loop` | research / validation | Recurring check, e.g., "run Lighthouse every 5 min during perf tuning". Not for one-off tasks. |
| `schedule` | n/a (optional) | Cron-scheduled remote agents; only if a nightly perf budget check is wanted. |
| `init` | n/a | Already have CLAUDE.md implicitly via memory; skip. |
| `keybindings-help` | n/a | Personal ergonomics only, no project relevance. |
| `less-permission-prompts` | setup | Run once before the implementation phase to reduce permission friction on common Bash/MCP calls. |

Phase legend: **research** = tasks 01–06, **decisions** = synthesis at the end
of each research doc, **implementation** = building the mobile pass,
**validation** = testing/reviewing the result.

---

## 3. Built-in tools

| Tool | Prefer when |
|---|---|
| `WebFetch` | You have a known canonical URL (HIG page, WCAG section, NN/g article). |
| `WebSearch` | You need to discover URLs — exploratory queries, finding precedents. |
| `Glob` | Locating files by path pattern (`src/pages/**/*.astro`, `*.css`). |
| `Grep` | Finding a string/regex inside the repo (existing breakpoints, tokens). |
| `Read` | Reading a specific known file, fully or by line range. |
| `Edit` | Modifying an existing file — default for implementation. |
| `Write` | Creating a new file (like this one) or full rewrites only. |
| `Bash` | Shell-only work: `git`, `pnpm`, `astro build`, lighthouse CLI, file ops that don't fit dedicated tools. |

---

## 4. Recommendation matrix

One row per upcoming research task. *Primary* is the first tool to reach for,
*secondary* fills the remaining gaps. URLs are the canonical sources to
target with WebFetch (or to plug into context7 where applicable).

| Task | Primary | Secondary | Canonical sources |
|---|---|---|---|
| **01 — UI conventions** | WebFetch | WebSearch, sequential-thinking (synthesis) | Apple HIG <https://developer.apple.com/design/human-interface-guidelines/> · Material 3 <https://m3.material.io/> · WCAG 2.2 <https://www.w3.org/TR/WCAG22/> · NN/g <https://www.nngroup.com/> |
| **02 — Typography** | WebFetch | WebSearch, Grep (current tokens) | Tufte CSS <https://edwardtufte.github.io/tufte-css/> · Material 3 type scale <https://m3.material.io/styles/typography/overview> · WCAG 2.2 §1.4 <https://www.w3.org/TR/WCAG22/#text-spacing> · web.dev typography <https://web.dev/learn/design/typography/> |
| **03 — Performance** | WebFetch | Bash (lighthouse/`astro build`), context7 (Astro perf APIs) | web.dev <https://web.dev/> (Core Web Vitals, LCP, INP) · 512kb club <https://512kb.club/> · Astro perf docs via context7 <https://docs.astro.build/> |
| **04 — Responsive foundations** | WebFetch | Grep (existing media queries), WebSearch | A List Apart / Marcotte <https://alistapart.com/article/responsive-web-design/> · web.dev responsive <https://web.dev/learn/design/> · WCAG 2.2 reflow §1.4.10 <https://www.w3.org/TR/WCAG22/#reflow> |
| **05 — Retro precedents** | WebSearch | WebFetch, github `search_code` | Tufte CSS <https://edwardtufte.github.io/tufte-css/> · 512kb club member sites <https://512kb.club/> · NN/g on nostalgic UI patterns <https://www.nngroup.com/> |
| **06 — Astro patterns** | context7 | WebFetch, Read (local `src/`), github `search_code` | Astro 5 docs <https://docs.astro.build/> (via context7 for API specifics) · Astro examples repo on GitHub |

Notes:

- Prefer **context7 over WebFetch** for `docs.astro.build` — it resolves the
  correct 5.x version and returns clean markdown.
- For HIG/Material/WCAG/Tufte/512kb, WebFetch is better — these sites are
  versioned by URL path, not package, so context7 doesn't index them well.
- sequential-thinking is optional per task; only invoke when the *Decision*
  section needs to reconcile ≥4 competing constraints.

---

## 5. Implementation-phase tools (later)

Anticipated, not set up yet. Listed so tasks 01–06 can flag dependencies.

- **Astro docs via context7** — primary reference for `astro:content`, image
  pipeline, islands, view transitions during build-out.
- **Lighthouse** (`npx lighthouse` or Chrome DevTools) — Core Web Vitals
  measurement on each mobile breakpoint. Run via Bash; gate on LCP / INP /
  CLS budgets set in task 03.
- **axe-core** (`@axe-core/cli` or Playwright integration) — a11y validation
  against WCAG 2.2 AA. Run via Bash on built output.
- **Visual regression** — Playwright `toHaveScreenshot` or Percy/Chromatic if
  added. Needed once mobile layouts ship to catch desktop regressions. Most
  pragmatic: Playwright screenshots committed to the repo, diffed per PR.
- **Browserstack / real-device testing** — optional; iOS Safari quirks
  (safe-area, 100vh, momentum scroll) are the usual failure modes.
- **Bundle analysis** — `astro build --verbose` plus `source-map-explorer`
  or Astro's built-in build stats for the 512kb-club budget.

---

## 6. Gaps (material only)

- **No Linear / Jira MCP** — acceptable. Task tracking lives in the repo or
  in memory; a PM MCP isn't worth the setup for a solo portfolio.
- **No Figma MCP** — moderate gap if moodboards/comps are produced in Figma.
  If the retro precedents task (05) surfaces visual references that need
  pixel-accurate extraction, consider the Figma MCP then. Skip for now.
- **No Playwright / browser-automation MCP** — real gap for the validation
  phase. Workaround: run Playwright via Bash; not blocking for research.
- **No Lighthouse MCP** — skip; the CLI via Bash is fine.
- **claude_ai_Google_Drive not currently listed** — gap only if the user has
  a Drive-stored brief. Surface this in task 01 kickoff; otherwise ignore.

---

## 7. Setup friction

Things to resolve before the relevant phase, not upfront:

- **GitHub MCP token scope** — current token likely read-only public.
  - Needed for: `search_code`, `get_file_contents` on public repos (works).
  - Not needed for research phase.
  - For implementation: confirm write scope only if the plan is to open
    PRs/issues from this session. Otherwise use local `git` + `gh` via Bash.
- **context7** — no auth; should work out of the box. If `resolve-library-id`
  returns nothing for `astro`, fall back to WebFetch on `docs.astro.build`.
- **Google Drive MCP** — requires OAuth. Only set up if user names a Drive
  doc to pull.
- **Lighthouse / axe-core** — `pnpm add -D` during implementation; not now.
  Add to `package.json` scripts so `less-permission-prompts` can allowlist
  them.
- **Playwright** — `pnpm create playwright` during validation phase.
  Allowlist `npx playwright` via `update-config` once installed.
- **`update-config` allowlist candidates** (run `less-permission-prompts`
  before implementation):
  - `pnpm run build`, `pnpm run dev`, `pnpm run check`
  - `git status`, `git diff`, `git log`
  - `npx lighthouse`, `npx playwright test`
- **No hooks needed yet** — deferred until implementation uncovers a
  repetitive command worth automating.

---

## Quick-reference: one-line-per-task

- **01 UI conventions** → WebFetch HIG + Material + NN/g; synthesize with sequential-thinking.
- **02 Typography** → WebFetch Tufte + Material type scale + WCAG text-spacing; Grep existing font tokens.
- **03 Performance** → WebFetch web.dev + 512kb; Bash `astro build` + lighthouse for baseline.
- **04 Responsive foundations** → WebFetch Marcotte + web.dev; Grep current breakpoints.
- **05 Retro precedents** → WebSearch for precedents; WebFetch Tufte + 512kb members.
- **06 Astro patterns** → context7 `astro` docs; Read local `src/`; github `search_code` for precedents.
