---
title: 'Building a practical AI coding setup for legacy codebases'
description: 'How I went from chasing over-engineered agentic workflows to a lightweight, practical AI setup that actually holds up on a messy, real-world codebase.'
pubDatetime: 2026-02-28T12:30:00+01:00
tags: ['development', 'ai', 'agents', 'workflow']
heroImage: '/assets/img/2026/building-a-practical-ai-coding-setup-for-legacy-codebases/factory-library.png'
heroImageAlt: 'Cursor, Gemini and Clawd fighting with minecraft swords on a Ghostty computer terminal.'
---

For years, I thought I had my development setup figured out - the right editor, the right extensions, the right habits - and then agentic AI came along and quietly made everything I knew feel a little outdated, not in a dramatic way, but in the slow, creeping way where you realize the tools you ignored for months have become things you can no longer imagine working without.

It all started with Cursor. Coming from VS Code, the transition was seamless enough that I barely noticed the switch, which is probably why it clicked so fast - there was no friction, no learning curve to justify, just a simple experiment: one agent, one goal, ramping up on a codebase I had never touched before.

The results were immediate enough to be surprising. Tasks that would have sent me bouncing between abstraction layers for half a day - tracing microservice interactions, untangling successive function calls and class inheritances, navigating error handling that was, let's say, not the codebase's strongest suit - suddenly became manageable in a fraction of the time. I won't pretend the codebase wasn't a mess, because it was, but for the first time I had something to help me navigate it without losing the thread entirely, and that felt like a genuine shift in how I could work.

That early win, though, turned out to be a little deceptive - it made me think that more tooling, more structure, more process would compound those gains linearly, and that assumption sent me down a rabbit hole that took a few months to fully climb out of.

## The Rube Goldberg Phase

Or how to overthink it.

The next logical step, or so it seemed at the time, was to adopt one of the structured agentic workflows that were being shared everywhere - the kind that come with bold claims about multiplying your output, restructuring how you think about tasks, and escaping the limitations of context windows through sheer architectural cleverness.

I tried a few of them, and the pattern was always the same: impressive in theory, overwhelming in practice, at least for my use case. The BMAD method, for instance, is genuinely well-designed for greenfield projects - if you are building a new product from scratch and want your agents to reason carefully through architecture and planning, it makes a lot of sense - but applied to an existing product with years of legacy code, the planning overhead started to feel heavier than the work it was meant to accelerate.

The vibe kanban approach was lighter, and I will admit it helped me ship code faster in the short term, but it introduced a different kind of bottleneck that I had not anticipated: I became a full-time reviewer. Every change still needed a human eye before it could go anywhere near the main branch, which meant that the speed I gained on my end was immediately capped by the bandwidth of my colleagues, and the whole process started to feel less like acceleration and more like redistribution of the same amount of total effort.

What I needed was not a framework designed for scale or for greenfield development - it was something I could use daily, on a legacy codebase, without adding enough overhead to offset the gains.

## The Tools That Actually Changed My Workflow

The answer, as it turned out, was not a new methodology but a sharper set of tools - things that quietly removed friction rather than adding structure on top of it.

[**Superpowers**](https://github.com/obra/superpowers) is a skill framework built with low overhead in mind, particularly well-suited to solo backend developers who want help with brainstorming, elaborating plans, and working in a test-driven development flow. It is now available as a plugin for Claude Code, which makes the barrier to entry essentially zero.

[**Context7**](https://context7.com/) is an MCP server that gives your agent access to real-world documentation, code examples, and best practices on demand - which sounds simple until you realize how much time you used to spend copy-pasting docs into context manually, hoping the agent would use them correctly.

[**rtk**](https://github.com/rtk-ai/rtk) (Rust Token Killer) is a CLI proxy designed to minimize token consumption, with a hook that triggers automatically when needed - a small thing that compounds significantly over the course of a working day, both in cost and in keeping context windows from bloating unnecessarily.

[**Serena**](https://github.com/oraios/serena) effectively gives Claude Code an indexing system, allowing it to retrieve relevant parts of your codebase efficiently rather than relying on you to surface the right files manually - which, on a large legacy codebase, is less a convenience and more a necessity.

A few smaller things that made a real difference: keeping your `AGENTS.md` or `CLAUDE.md` as lean as possible - every line of overhead you add there is overhead the agent carries on every single request - and if you are using Claude Code, [the on-demand tool loading feature ](https://www.anthropic.com/engineering/advanced-tool-use)(`ENABLE_TOOL_SEARCH=true`) is worth enabling, as it keeps the active toolset focused rather than sprawling.

## Where This Actually Lands

The honest summary is that the tools which stuck were the ones that solved a specific, concrete friction point in my daily work - not the ones that promised to transform the entire way I thought about software development, even if some of those were genuinely interesting to explore.

What surprised me most about this whole process is not how much faster I can write code now, though that is real - it is how much more time I spend thinking about architecture and business logic, the parts of the work that actually require judgment, rather than the boilerplate and the repetitive scaffolding that used to quietly consume a significant portion of every day.

The tooling will keep evolving, and some of what I am using now will probably feel quaint in a year - but the underlying shift, spending less cognitive energy on the mechanical and more on the meaningful, feels durable in a way that the specific tools do not. I will keep updating this as things change, and I am curious to hear what has actually stuck for others working in similar contexts.

*What tools or workflows have genuinely changed how you work - and which ones didn't survive contact with a real codebase?*