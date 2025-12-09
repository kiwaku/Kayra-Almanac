import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://kayra-almanac.vercel.app',
  integrations: [mdx(), sitemap()],
  redirects: {
    '/start-here': '/about',
    '/trust': '/content-rated',
    '/trust.html': '/content-rated'
  },
  // [REMOVE_ALLOWED_HOSTS] - Delete vite block to remove allowedHosts override
  vite: {
    server: {
      allowedHosts: true,   // ← Fixes Cloudflare, ngrok, localhost.run forever
      host: true            // ← Accept external connections cleanly
    }
  }
});
