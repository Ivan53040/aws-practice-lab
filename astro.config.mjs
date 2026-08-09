import { defineConfig } from 'astro/config'
import react from '@astrojs/react'

export default defineConfig({
  output: 'static',
  trailingSlash: 'never',
  build: {
    format: 'file',
    inlineStylesheets: 'always',
  },
  integrations: [react()],
  vite: {
    css: {
      postcss: './postcss.config.js',
    },
  },
})
