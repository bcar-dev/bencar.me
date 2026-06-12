# Benjamin Carlier's Personal Website

This is the source code for my personal website, built with [Astro](https://astro.build) and [Vue](https://vuejs.org) islands, and deployed on [Vercel](https://vercel.com).

## About

I'm Benjamin Carlier, a backend developer and bike enthusiast.

## Stack

- **Astro** for static, content-first pages (zero JS by default)
- **Vue** islands for the interactive pieces (theme toggle, nav, tag filter, search)
- **Tailwind CSS v4** via the `@tailwindcss/vite` plugin
- **Pagefind** for static full-text search
- **Vitest** for tests, **pnpm** as the package manager

## Commands

All commands are run from the root of the project:

| Command             | Action                                          |
| :------------------ | :---------------------------------------------- |
| `pnpm install`      | Installs dependencies                           |
| `pnpm dev`          | Starts local dev server at `localhost:4321`     |
| `pnpm build`        | Builds the production site to `dist/`           |
| `pnpm preview`      | Previews the production build locally           |
| `pnpm build:search` | Rebuilds the Pagefind index (`public/pagefind`) |
| `pnpm check`        | Type-checks the project (`astro check`)         |
| `pnpm lint`         | Runs the linter (eslint)                        |
| `pnpm format`       | Runs the formatter (prettier)                   |
| `pnpm test`         | Runs the tests (vitest)                         |

The search index is rebuilt automatically before `dev` and during `build` (via an Astro build hook that writes it into `dist/pagefind`).

## Deployment

This site is set up for easy deployment on Vercel. Just connect your GitHub repository to Vercel, and it will automatically build and deploy the site when changes are pushed.

## License

This repository uses dual licensing:

- **Documentation & Blog Posts**: Licensed under [CC BY 4.0](http://creativecommons.org/licenses/by/4.0/)
- **Code & Code Snippets**: Licensed under the [MIT License](LICENSE)

See the [LICENSE](LICENSE) file for full details.
