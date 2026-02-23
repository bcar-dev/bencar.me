---
title: "AI won't replace developers, it will raise the bar for what being one means"
description: 'AI is changing the landscape of software development; it is making execution cheap and clarity essential. The real advantage now belongs to those who can define problems precisely, design testable systems, and shape outcomes rather than just produce code.'
pubDatetime: 2026-02-22T14:45:32+01:00
tags: ['development', 'opinion', 'ai']
heroImage: '/assets/img/2026/ai-wont-replace-developers/generated-photorealistic-man-coding.png'
heroImageAlt: "A generated, photorealistic image of a developer in his workspace with a monstera plant, books, and a view of the city of Paris. This could well be me, but some small details don't lie."
---

There is a trend in the tech industry-a sort of consensus applied and almost evangelized by big tech companies-that AI will kill entry-level roles in software development.

I have read it [here](https://stackoverflow.blog/2025/12/26/ai-vs-gen-z/), on some Medium and LinkedIn articles too. In a recent talk at École Polytechnique, [the CEO of Mistral AI shared his insights](https://www.youtube.com/watch?v=boIiMLR37kA) on the different career strategies students must adopt to remain relevant in an AI-driven job market, among other things.

My take is that entry-level roles will change; they will be different, but they will not disappear.

## The landscape is shifting

This isn't new; we have seen it with programming languages, with frameworks, with tools. Rust is slowly killing C++, Docker has already killed VMs for most use cases ... the list is long.

Behind every paradigm shift, there is a period of adaptation, change, and uncertainty. Some people, stuck in the old "code craftsman" paradigm and clinging to the old way because it's what they know, might be left behind.

These changes took time, but with AI it's different; it's happening fast, and it's happening now.

I started at 42 by learning Assembly, then C, then Python because it was a no-brainer for data science, and now I'm discovering Rust (yes, going back to memory management 😅, although easier this time).

With each generation, the abstraction level is going higher and higher and it feels like cheating. AI is next on the list.

Engineers who get this right will be the ones who thrive. Others who still think that writing code is the main part of the job will be left behind, because their value just evaporated with LLMs.

## The center of gravity is moving

In practice, AI feels more like an accelerator-an "exoskeleton," as I've read elsewhere-than a substitute engineer. It handles the repetitive structures, mechanical transformations, scaffolding, refactors, and glue work-all the small tasks we know are necessary but tend to slow us down.

That last category is important. Developers have always been selective about where they spend cognitive energy. AI removes that selectivity by making the uninteresting parts almost frictionless.

The result is that the distance between intention and implementation collapses. When implementation becomes fast, the most valuable work shifts toward shaping problems instead of executing solutions.

Developers are being pushed, whether they like it or not, closer to product thinking, design reasoning, and system modeling. The job is less about producing output and more about defining direction. Less about typing and more about structuring intent.

For some people, this feels like scope creep. For others, it feels like software engineering is finally becoming actual engineering. Because if a machine can implement anything you can describe clearly, then clarity itself becomes the scarce skill.

## Precision and tests are the new compilers

One pattern becomes obvious very quickly when working seriously with AI systems. Output quality correlates almost perfectly with how well the task is specified and how clearly success can be evaluated.

Ambiguous problems produce impressive-looking nonsense, whereas well-bounded problems produce shockingly good results. The limitation on the context window is still a bit of a pain, but it has been addressed lately, and hallucinations have become rather rare in my experience.

Boris Cherny, the creator of Claude Code, shared in an X thread some very interesting [insights on his setup](https://x.com/bcherny/status/2007179832300581177). According to him, models work best when you give them a way to test what they produce.

This is particularly true for frontend development where the visual aspect of the job makes it easier to validate the output. On some IDEs, AI has finally closed the feedback loop. Instead of just generating code and crossing its fingers, today’s AI can open a browser, deploy its changes, and instantly verify the results. It's the difference between blindly guessing what a UI looks like and actually interacting with it.

That idea is deceptively simple. It means AI performs best in environments with explicit feedback loops and objective validation, which is exactly what good engineering has always required.

Tests used to be framed mostly as a quality safeguard or a discipline of craftsmanship; something responsible teams did to avoid regressions. Now tests play a different role. They are not just protecting software; they are guiding generation.

When you define expected behavior precisely enough to be checked automatically, you create a target the AI can iterate toward. The system stops guessing and starts converging. Tests become a communication layer between human intent and machine execution.

This is a profound shift. We are no longer writing tests only to defend code after it exists. We are writing tests to shape what gets created in the first place.

## My two cents recommendations

- Learn how to communicate with AI: treat context engineering as a core technical skill. Master the art of feeding context through markdown files, setting up rules, and exploring new integrations like MCP (Model Context Protocol). Ideally, companies will provide tools to help with that.

- Treat AI as if it were a new generation of programming language: don't just use it casually; learn to use it well. Study its quirks, understand its constraints, and master its "syntax."

- Shift your time from coding to understanding: just like spending time learning memory allocation in Assembly makes you a better Python developer years later, use the time AI saves you to deeply understand how your systems actually work under the hood. You can even use AI as an assistant to help you deconstruct those complex concepts.

- Use AI to keep learning: the landscape is moving too fast to stop. Use these tools to explore new domains, ask stupid questions without judgment, and continuously expand your knowledge base.
