#!/usr/bin/env node
/**
 * Copy coverage-summary.json to public/ so the Testing page can display it.
 * Run after: npm run test:coverage
 */
const { copyFileSync, existsSync, mkdirSync } = require('fs')
const { dirname, join } = require('path')

const root = join(__dirname, '..')
const src = join(root, 'coverage', 'coverage-summary.json')
const dest = join(root, 'public', 'coverage-summary.json')

if (existsSync(src)) {
  const publicDir = dirname(dest)
  if (!existsSync(publicDir)) {
    mkdirSync(publicDir, { recursive: true })
  }
  copyFileSync(src, dest)
  console.log('Copied coverage-summary.json to public/')
} else {
  console.warn('coverage/coverage-summary.json not found. Run: npm run test:coverage')
}
