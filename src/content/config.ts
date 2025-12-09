import { defineCollection, z } from 'astro:content';

const project = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    id: z.string(),                        // slug-like, unique
    year: z.number(),
    domain: z.array(z.enum(['ai','security','os','hardware','ux','viz'])),
    status: z.enum(['active','archived','paused']),
    featured: z.boolean().default(false),  // NEW: for homepage
    summary: z.string().optional(),        // Short summary for catalog/index
    metrics: z.object({
      loc: z.number().optional(),
      gpu_hours: z.number().optional(),
      boot_sec: z.number().optional(),
      dataset_size: z.string().optional(), // e.g. "60k prompts"
    }).optional(),
    artifacts: z.object({
      diagram: z.string().optional(),      // /artifacts/.../arch.png
      diagram2: z.string().optional(),     // Second diagram (for projects like Hephaestus)
      readme: z.string().optional(),       // external or internal
      postmortem: z.string().optional()
    }).optional(),
    images: z.array(z.string()).optional(), // /public/artifacts/...
    related: z.array(z.string()).optional()
  })
});

const logEntry = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.string(),                       // ISO yyyy-mm-dd
    tags: z.array(z.string()).default([]),
    project: z.string().optional(),
    images: z.array(z.string()).optional(),
    anomaly: z.boolean().default(false)     // NEW: shrine hook
  })
});

const note = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.string().optional(),
    tags: z.array(z.string()).default([])
  })
});

const hardware = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    part: z.enum(['overview','bom','wiring','thermals','mounts']),
    date: z.string().optional(),
    images: z.array(z.string()).optional()
  })
});

export const collections = {
  projects: project,
  logbook: logEntry,
  notebooks: note,
  hardware
};
