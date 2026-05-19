---
title: 'The tools I actually use'
description: 'An honest look at my daily tech stack: the editors, CLI tools, plugins, and small utilities that survived months of daily use on real projects.'
pubDatetime: 2026-05-14T14:00:00+02:00
tags: ['development', 'workflow', 'tools']
heroImage: '/assets/img/2026/the-tools-i-actually-use/developer-at-night.png'
heroImageAlt: "A generated, nime-style illustration of a hoodie-wearing developer coding late at night in a cozy modern workspace, seated in a Herman Miller Aeron chair facing dual monitors filled with code. The room is softly lit with warm ambient lighting, plants, posters, and tech accessories, while a nighttime city skyline glows through the window, creating a cinematic and focused atmosphere."
---

There is a difference between the tools you try and the tools you keep. Over the past year or so, I have tried dozens of editors, terminals, CLI utilities, and AI plugins, and most of them did not survive more than a week or two of real use. What follows is the set that did. It's the things I reach for every day without thinking about it, which is probably the best metric for whether a tool actually works.

## The editor

VS Code, still. I have tried alternatives, and I keep coming back to it. Not because it is the best at any single thing, but because the plugin ecosystem means I can shape it into exactly what I need without fighting the tool itself.

The plugins that stayed:

- **Claude Code** - I mostly use Claude Code in my terminal but I sometimes use the extension too
- **ESLint** - the standard for JavaScript and TypeScript linting, reliable and well-integrated
- **Ruff** - fast Python linting and formatting that replaced a whole chain of slower tools
- **GitLens** - inline blame and history that saves me from context-switching to the terminal for git archaeology
- **Night Owl** - I put this theme on everything, and I mean everything, every editor, every terminal, every tool that lets me change the color scheme

## The terminal

I switched to [Ghostty](https://ghostty.org/) a few months ago and never looked back. It is fast, it is minimal, and easy to config.

## CLI tools

The default Unix utilities are fine, but there are replacements that are just better in ways that compound over a full working day:

- **ripgrep** (`rg`) - faster than grep, better defaults, respects `.gitignore` out of the box
- **fd** - a better `find`, simpler syntax, faster
- **zoxide** - a smarter `cd` that learns your most-used directories. One of those tools that feels invisible until you try to work without it
- **jq** - indispensable for anything involving JSON, which in my line of work is most things
- **htop** - process monitoring that actually makes sense visually, for when I have my whole stack running and need to figure out which process is making my laptop fan spin up
- **[mole](https://github.com/tw93/mole)** - deep clean and optimize your Mac from the terminal, replacing a handful of paid apps I never wanted to install in the first place
- **glab** - GitLab CLI, because work uses GitLab. I use GitHub for my personal projects though
- **[rtk](https://github.com/rtk-ai/rtk)** - filters and compresses command outputs before they reach your LLM context, saving tokens with almost no overhead

## Data tools

**DataGrip** with the AWS Toolkit and Big Data Tools plugins handles everything database-related. I have tried lighter alternatives, but for the kind of work I do: querying across multiple databases, working with large datasets, managing connections to various AWS services; nothing else comes close.

## Claude Code plugins

- **Linear** - because we use Linear at my company
- **Superpowers** - brainstorming, planning, and TDD flows with minimal overhead
- **Context7** - real-time documentation access that keeps me from copy-pasting docs into context manually
- **Serena** - codebase indexing that makes Claude Code actually useful on large projects
- **Caveman** - compresses agent output by roughly 75%, making responses faster and cheaper without losing technical accuracy
- **Colgrep** - semantic code search that combines regex filtering with AI-powered ranking, right from the terminal

With Caveman, Colgrep, Serena, and rtk combined, I never find myself reaching Anthropic's Max $100/month plan limit. I would strongly recommend these tools to anyone looking to get more out of their token budget. 

I sometimes manually prompt Caveman off for when I need to understand something, the brevity of the response is sometimes not very helpful for when learning new stuff.

## The small things

**Boop** for quick text transformations, JWT decoding, JSON formatting, all the little conversions you need from time to time, but do not want to write a script for.

**OrbStack** as a Docker Desktop replacement. Lighter, faster, less intrusive.

**Whispering** with Nvidia's Parakeet multilingual model for voice input when working with Claude Code. I'm still not fully comfortable talking to my terminal, but when I do, it works surprisingly well.

## What I tried and moved on from

I experimented with **VibeKanban** and **Paperclip** for managing multiple AI agent workflows, and they are well-designed tools for what they do. But I found that I prefer running multiple Claude Code windows side by side and jumping between them manually. It is less structured, but the directness of it suits how I think and I can see everything and intervene immediately.

I have been using this multi-window approach extensively for mypy migration, dependency updates, and setting up Renovate on more than 10 microservices, and it has held up well enough that I stopped looking for something more sophisticated.

## Conclusion

The common thread: fast, focused, and out of the way. The tools that survived are not the most feature-rich or the most impressive, they are the ones that removed a specific friction point without introducing new ones.

If you want to keep one phrase out of this: the best tool is the one you stop noticing.
