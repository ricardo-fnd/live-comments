import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['esm'],
    dts: false,
    outDir: 'dist',
    external: ['react', 'react-dom', 'next', 'live-comments/actions'],
    banner: {
      js: '"use client";',
    },
    sourcemap: true,
    clean: true,
  },
  {
    entry: ['src/actions/index.ts'],
    format: ['esm'],
    dts: true,
    outDir: 'dist/actions',
    external: ['react', 'react-dom', 'next', 'pg', 'nodemailer', 'crypto'],
    banner: {
      js: '"use server";',
    },
    sourcemap: true,
  },
  {
    entry: ['bin/cli.ts'],
    format: ['esm'],
    outDir: 'dist/bin',
    banner: {
      js: '#!/usr/bin/env node',
    },
    sourcemap: true,
  },
])
