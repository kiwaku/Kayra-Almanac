# Quick Guide: Adding & Editing Projects

## Add a New Project

1. **Create project file**: `src/content/projects/your-project-id.mdx`

```yaml
---
title: Your Project Name
id: your-project-id
year: 2025
domain: ["ai", "security", "os", "hardware", "ux", "viz"]  # Pick relevant tags
status: "active"  # or "paused", "archived"
featured: true    # Shows on homepage (false = catalog only)
summary: "Short 1-2 sentence summary shown in catalog/index. Full content below is only shown on project page."
metrics:
  loc: 12000
  gpu_hours: 150
  boot_sec: 11.2
  dataset_size: "60k prompts"
artifacts:
  diagram: "/artifacts/your-project/diagram.png"
  diagram2: "/artifacts/your-project/diagram2.png"  # Optional second diagram
  readme: "https://github.com/you/repo"
  postmortem: "/notebooks/your-project-notes"
images:
  - "/artifacts/your-project/photo1.jpg"
  - "/artifacts/your-project/photo2.jpg"
related: ["other-project-id"]
---

Your 1-2 sentence summary here. This appears on Index/Catalog.

Optional bullet points for capabilities/features go here.
```

2. **Add artifacts**: Put images/diagrams in `public/artifacts/your-project/`

3. **View it**:
   - Full page: `/projects/your-project-id`
   - If `featured: true`: Shows on `/` (homepage)
   - Always visible: `/catalog`

---

## Edit Existing Project

1. **Find the file**: `src/content/projects/[project-id].mdx`

2. **Edit what you need**:
   - Change `featured: true/false` to show/hide on homepage
   - Update `status: "active"/"paused"/"archived"`
   - Add/remove images from the `images:` array
   - Change diagrams in `artifacts:`
   - Edit the summary text (keep it short for Index/Catalog)

3. **Update artifacts**: Replace files in `public/artifacts/[project-id]/`

---

## Add Hardware Docs (like Hephaestus BOM/wiring)

1. **Create file**: `src/content/hardware/project-name-part.mdx`

```yaml
---
title: Your Hardware Doc Title
part: bom  # or "wiring", "thermals", "mounts", "overview"
date: "2025-01-01"
images:
  - "/artifacts/your-project/photo.jpg"
---

Your hardware documentation here.

## Related Material
- [Project Page → /projects/your-project](/projects/your-project)
```

2. **View it**: `/hardware` page (auto-grouped by `part` type)

---

## Add Debug/Technical Notes

1. **Create file**: `src/content/notebooks/your-notes.mdx`

```yaml
---
title: Your Note Title
date: "2025-01-01"
tags: ["hardware", "virtualization", "debug"]
---

Your technical notes/debug logs here.

## Related Material
- [Project Page → /projects/your-project](/projects/your-project)
```

2. **View it**: `/notebooks` page

---

## Quick Reference

| File Location | What It Does | Where It Shows |
|--------------|--------------|----------------|
| `src/content/projects/*.mdx` | Main project entry | `/projects/[id]`, `/catalog`, `/` (if featured) |
| `src/content/hardware/*.mdx` | Hardware docs | `/hardware` |
| `src/content/notebooks/*.mdx` | Technical notes | `/notebooks` |
| `src/content/logbook/*.mdx` | Dev log entries | `/logbook` |
| `public/artifacts/[project]/` | Images/diagrams | Referenced in project files |

---

## Tips

- **Use `summary:` field** in frontmatter for short description in catalog/index
- **Full content** (everything after `---`) only appears on individual project pages
- **Without summary field**: Full content shows everywhere (catalog + project page)
- **Diagrams**: Use `.png` for compatibility, naming convention: `diagram_name.png`
- **Featured projects**: Limit to 3-4 max for clean homepage
- **Cross-link**: Add "Related Material" sections to connect project/hardware/notebooks
