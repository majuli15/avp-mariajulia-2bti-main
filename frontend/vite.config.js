
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss()
  ],
  server: {
    proxy: {
      '/usuarios': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/produtos': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})

