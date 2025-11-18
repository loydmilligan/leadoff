import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@leadoff/types': path.resolve(__dirname, '../shared/types'),
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/integration/**/*.test.ts'],
    testTimeout: 10000,
    hookTimeout: 10000,
    pool: 'forks', // Run tests in separate processes for isolation
    poolOptions: {
      forks: {
        singleFork: true, // Use single fork for SQLite to avoid database locking
      },
    },
  },
})
