---
title: 'Migrations are a product, not a chore'
description: 'Why most technical migrations die after the first proof of concept, and how treating them like product launches, with planning, tracking, and AI-assisted execution, is the only way to actually finish them.'
pubDatetime: 2026-03-28T12:00:00+01:00
tags: ['development', 'opinion', 'workflow', 'ai']
heroImage: '/assets/img/2026/migrations-are-a-product-not-a-chore/migration-rain-and-night.png'
heroImageAlt: 'A developer surrounded by screens with dasbhoards and graphs, with rain pouring against the windows of a dark city at night.'
---

I have seen recently a developer implementing FastAPI's lifespan management in one microservice. It was well done, clean implementation, proper context managers, everything by the book. However, the proof of concept seemed like it was good enough and this was never deployed to other projects, there was nothing planned. One service was done, the rest would happen "eventually," and eventually is where migrations go to die.

This is not a criticism of that developer. This is the default behavior of our entire industry. Someone identifies a needed upgrade, does the interesting part on one service, and moves on. The remaining work sits in a backlog that no one owns, slowly becoming invisible, until you end up maintaining two patterns across your codebase for months or years because nobody finished what was started. Trust me, I have seen it and I had to deal with this.

I have been thinking about this a lot recently, partly because I have been going through my own series of planned upgrades, Pydantic v1 to v2, Python version bumps, microservice dependency updates, and partly because I realized that the difference between the migrations that actually get completed and the ones that stall is not technical skill. It is whether someone decided to treat the migration as a real project with real milestones, or just as a thing that should happen organically.

## The long tail is where migrations die

The pattern is remarkably consistent. You start strong: the first service gets migrated, maybe the second one too because you are still in the flow. Then sprint priorities shift, a new feature lands on your plate, and suddenly the migration is competing with work that has visible stakeholders and deadlines. The migration has neither.

What follows is the long tail, that frustrating stretch where 70% of the work is done but the remaining 30% drags on for months. [I recently read an article about this](https://blog.pragmaticengineer.com/typical-migration-approaches/). At Uber, a temporary writeback system that was supposed to be part of a migration eventually caused an Instant Pay outage because it persisted far longer than anyone intended. The long tail is not just annoying. It is actively dangerous.

The fragmentation cost is real and compounds silently. New developers joining the team now have to learn two patterns instead of one. Your documentation covers the old way, but some services use the new way, and nobody is sure which approach to follow for the next feature. Testing becomes inconsistent. Deployment configurations diverge. The cognitive overhead of maintaining two concurrent approaches across a codebase is almost always worse than either approach on its own.

Research on refactoring efforts paints an even bleaker picture: studies have found that roughly 89% of refactoring commits do not actually reduce technical debt. The work gets done, but the debt remains, often because the refactoring was partial, touching one layer or one service without following through on the full scope of what needed to change.

## Why developers don't finish what they start

It is worth being honest about the reasons, because they are not about laziness or lack of skill.

The first reason is that doing the proof of concept feels like progress. You have figured out the new API, resolved the tricky edge cases, gotten tests passing on one service. Psychologically, that feels like the hard part is done. But one service out of ten is ten percent done, and the remaining ninety percent is where the actual value lives. The proof of concept has zero organizational value until it becomes the standard.

The second reason is that [migrations are invisible work](https://medium.com/tag-bio/refactoring-is-the-cure-for-technical-debt-but-only-if-you-take-it-9fd8cc42dd93). Nobody celebrates a Pydantic upgrade. There is no product demo where you show stakeholders that your models now use `model_validate` instead of `parse_obj`. The incentive structures in most organizations actively discourage finishing migrations because the reward system is built around features, not foundations.

The third reason is scope fear. Looking at the full migration across all services, with all their edge cases and integration points, is genuinely overwhelming. So developers do the rational thing in the moment: they do the easy part, declare it a success, and quietly hope someone else will handle the rest.

The FastAPI lifespan example is textbook: one service done, knowledge earned, zero commitment to completion. What made it worse is what came next. The developer scheduled a meeting, presented his work to the team proudly, and then casually explained that the rest of the services now needed the same treatment. It was a perfect execution of the classic pattern: "I found an issue" becomes a meeting, and after the meeting it is suddenly everyone's issue.

## Treat it like a product launch

The most compelling counter-example I have found comes from Spotify. [They treat tech migrations the way they treat product launches](https://engineering.atspotify.com/2020/06/tech-migrations-the-spotify-way): dedicated product managers, a single company-wide migration map, progress tracking visible to everyone, and a commitment to driving adoption to 100% by working hands-on with the last remaining teams. Instead of issuing mandates, they lead with value, explaining how the upgrade helps rather than just why the old way is deprecated.

That last part resonates with me. When I rolled out dependency updates across our microservices, the conversation was always about what the team gains, not about compliance. I also set up [Renovate](https://docs.renovatebot.com/) on all repositories so that automated dependency update PRs land regularly, keeping the gap between current and target versions small before it compounds into something unmanageable.

For my upcoming SQLAlchemy 1 to 2 migration, I applied the same thinking before writing a single line of code: milestones, task breakdowns per service, dependency ordering, and a clear timeline. Planning the migration thoroughly is itself part of treating it as a product.

Stripe shows what this looks like at full scale: they [migrated 3.5 million lines of code from Flow to TypeScript](https://newsletter.pragmaticengineer.com/p/real-world-engineering-challenges) over a weekend. That kind of execution is only possible when the migration is treated as a first-class project, not as background work between feature sprints.

## AI as your migration partner

This is where things get genuinely exciting, because AI is not just making migrations slightly faster. It is changing what is feasible.

Migrations are, by nature, repetitive and pattern-based. You are doing the same kind of transformation across dozens of files: renaming attributes, updating function signatures, adapting configuration patterns, adjusting import paths. This is exactly the kind of work that large language models excel at. Not because they understand your architecture deeply, but because they can apply consistent transformations across a codebase with a patience that no human developer can match.

There are numerous real-world examples now. [Airbnb used LLM-powered automation to migrate 3,500 test files in six weeks](https://www.nexgencloud.com/blog/case-studies/from-months-to-weeks-accelerating-code-migration-with-llms), a task that had been estimated at a year and a half of manual effort. By refining their prompts and re-running the migration iteratively, they pushed the success rate from 75% to 97% in just four days. That is not a marginal improvement. That is a fundamentally different calculus for whether a migration is worth attempting.

Spotify recently shared their own evolution in this direction. Their internal tool, [Honk, is an AI-powered coding agent](https://www.infoq.com/news/2026/03/spotify-honk-rewrite/) that now generates roughly 1,000 merged pull requests every 10 days for automated migrations. Before Honk, deterministic scripts could handle about 70% of migration work, but the remaining 30%, the complex edge cases with conditional logic and unusual patterns, required manual intervention. LLMs are now tackling that remaining portion, and the results reveal an interesting insight: the new bottleneck is no longer code generation. It is pull request review. The developer's role shifts from "person who writes the migration code" to "person who reviews and validates the migration output."

That shift matters. It means you can spend your cognitive energy on the hard architectural decisions, the edge cases that genuinely require human judgment, while the mechanical transformations happen in parallel. [The human-AI balance for migrations](https://www.aviator.co/blog/solving-the-nasty-code-migration-problem-with-assisted-ai-agents/) is not about replacing developers. It is about changing what they spend their time on.

You do not need Spotify's infrastructure to benefit from this. On a practical level, tools like Claude Code, Cursor, or similar AI coding assistants can handle the mechanical parts of your migration right now. When I work through dependency upgrades, the workflow has changed significantly: instead of spending hours on find-and-replace patterns and manually adapting each file, I describe the transformation pattern, let the AI apply it across the relevant files, and then review the output. What used to be days of tedious, error-prone work becomes focused review sessions where I am catching edge cases rather than typing boilerplate.

Spotify also surfaced a deeper insight that I think is underappreciated: standardization enables better AI. When your codebase is consistent, the prompts are simpler, the transformations are more reliable, and the review burden is lighter. This creates a virtuous cycle. Every completed migration makes the next one easier, because a more standardized codebase is a more AI-friendly codebase. Conversely, every half-finished migration, with its mix of old and new patterns, makes automated transformations harder and less trustworthy.

## Getting through the boring middle

The tools and the planning help, but there is still a stretch in every migration that is simply tedious. The first service is exciting because you are learning. The last few are tedious because you already know everything and you are just applying it. That middle-to-end stretch is where discipline matters more than skill.

The most effective approach I have found is to treat each service as a small, self-contained unit of work rather than thinking about the migration as one enormous task. "Migrate all services to Pydantic v2" is paralyzing. "Migrate the auth service to Pydantic v2" is a Tuesday afternoon. Breaking the work into completable units makes it possible to maintain momentum even when the novelty has worn off.

Making progress visible helps more than you might expect. A simple checklist, whether it is a project board, a spreadsheet, or a tracking issue, transforms the work from an amorphous obligation into something with a clear trajectory. "Five out of ten services migrated" feels like progress. "We're working on the Pydantic migration" feels like a status that could persist indefinitely.

[IBM's recommendation of allocating 10-15% of sprint capacity](https://www.ibm.com/think/insights/reduce-technical-debt) for technical debt resolution is a practical floor. Without dedicated time, migrations will always lose to feature work because feature work has louder stakeholders. Timeboxing matters too: set a deadline for the migration, because without one, drift is inevitable and the longer a migration stretches, the higher the risk it stalls completely.

And critically, do not hand off the work. The person or team who understands the migration best should be the one to see it through. Handing a half-finished migration to another team, or to "whoever has time next sprint," is how you end up with the FastAPI lifespan pattern: one service done, knowledge siloed, and the rest left indefinitely.

## Your codebase is a product too

The shift I am advocating for is not complicated: migrations deserve the same planning, tracking, and commitment that you give to features. They are not interruptions to "real work." They are real work, and arguably the kind of work that determines whether your codebase remains a productive environment or slowly becomes a drag on everything you build on top of it.

The discipline is not in starting the migration, because anyone can do that, and please don't be that guy who does 10% of the job and hands it to his colleagues, that's not very helpful. The discipline is in finishing it, service by service, file by file, until the old pattern no longer exists anywhere in your codebase and the new one is simply how things are done.

Your future self, and everyone who will work on that codebase after you, will thank you for it.
