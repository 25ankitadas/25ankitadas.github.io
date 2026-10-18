import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://25ankitadas.github.io',
  base: '/Portfolio',
  output: 'static',
  vite: { plugins: [tailwindcss()] },
});
