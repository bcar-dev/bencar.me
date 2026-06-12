# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

### Changed

- Rebuilt the site on **Astro** with **Vue islands** (previously Next.js + React): pages render to static, zero-JS HTML, with hydration limited to interactive widgets (theme toggle, navigation, tag filter, search, table of contents, reading progress).
- Images are optimized via `astro:assets` (WebP + responsive/retina variants); styling moved to Tailwind CSS v4 through the `@tailwindcss/vite` plugin; icons are pulled per-use via `unplugin-icons` (Lucide + Bootstrap).
- Routing, sitemap, and per-page SEO/JSON-LD are handled by Astro and `@astrojs/sitemap`.
- Tooling moved to **pnpm**; the test suite runs on Vitest with Vue and Astro container tests.

### Removed

- Next.js / React stack and related packages (`next-themes`, `next-view-transitions`, `react-markdown`, `react-icons`).

## [2026-02-22]

### Added

- Initial public release of the project.
