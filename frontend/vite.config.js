import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()],
  server: {
    // Zahteve na /api preusmeri na backend, da brskalnik vidi en sam izvor
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
  // Nastavitve za teste (Vitest) in poročilo o pokritosti kode
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.js'],
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: 'coverage',
    },
  },
})