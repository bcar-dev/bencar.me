---
title: 'Hello World: building my personal website'
description: 'The very first post on bencar.me - why I decided to build a personal website, what I plan to write about and the tech stack behind my blog.'
pubDatetime: 2026-02-21T17:00:00+01:00
tags: ['development', 'personal']
heroImage: '/assets/img/2026/hello-world/cover.jpg'
heroImageAlt: 'Line drawing of an open book linked to a terminal, a neural network, a bicycle wheel and a growing plant.'
---

Welcome to **bencar.me**!

## Why a personal website?

As a backend developer, I spend most of my time deep in code, designing systems, and most importantly solving problems.

I've always felt that writing about what I do helps me think more clearly, and sometimes, those thoughts are worth sharing, I mean hopefully.

So this is first and foremost for me, but I hope it can be useful for others too.

What I'm planning to write about:

- **Software development** - architecture, patterns, and what I've figured out building things
- **Artificial Intelligence** - what actually works in production, navigating the hype, and my latest experiments
- **Biking** - my way of unplugging and exploring, some of my favorite routes and experiences, moments I share with my friends on the bike
- **Life** - reflections, ideas, and everything in between

## The tech stack of this site

_Updated in June 2026, after moving the site from Next.js to Astro._

This site is built with:

- **Astro** for the framework - every page is generated as static HTML, with no JavaScript unless a component needs it
- **Vue** for the few interactive parts (search, tag filter, table of contents, theme toggle, the home page slider), loaded only where they are used
- **Tailwind CSS** for styling
- **Markdown** files with YAML frontmatter for managing blog content
- **Pagefind** for search, with the index generated at build time
- **Vercel** for hosting
- A simple file-based content system with just `.md` files

I wanted something lightweight that I could fully control. Writing a post is as simple as creating a new markdown file, and that feels right.

## What's next?

I plan to write regularly. Some posts will be technical deep-dives, others will be more casual reflections. Thanks for reading and stay tuned.
