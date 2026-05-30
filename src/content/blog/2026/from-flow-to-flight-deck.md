---
title: 'From flow to flight deck: how AI changed the rhythm of writing software'
description: 'Some personal notes on how AI has changed the rhythm of the developer job. The restful flow of typing seems to be giving way to constantly piloting AI. I do not have firm answers, but I wanted to write down what I think we might be trading away, and what we could do with the time we get back.'
pubDatetime: 2026-05-30T18:00:00+02:00
tags: ['development', 'opinion', 'ai', 'productivity']
heroImage: '/assets/img/2026/from-flow-to-flight-deck/what-it-feels-like-to-be-a-developer.png'
heroImageAlt: 'A software developer stands alone in a dark office, facing a towering wall of monitors filled with live dashboards, code, and streaming system data. Blue screen glow and cinematic lighting create a tense, overwhelming atmosphere of managing too much information at once.'
---

There was a rhythm to writing software that you only really noticed once it was gone.

The job had two halves, and they took turns.

First came the most interesting part: taking on a task, planning it, talking it through with people to refine what we actually meant, hunting for the right tool, reading its documentation, sketching a technical solution, then writing down what we learned so the next person would not have to relearn it. This was the demanding half. It was where the thinking lived.

Then came the other half. Once the plan was clear in your head, you would sit down and unwind it through the keyboard. Translating intent into code. And something would shift. Your brain would drop into a lower gear, the part of the work that runs almost on its own. The plan was already made, so your mind was not racing anymore. It was executing.

That second half was the rest. It was where your brain got to breathe.

## Flow was the reward, not the work

The word for that second gear is flow. Mihaly Csikszentmihalyi described it as full immersion in an activity, where attention narrows, time bends, and the work feels effortless even when it is hard. Programmers know it well. You are deeply engaged and yet strangely relaxed, because the difficult decisions are behind you and what is left is execution.

Flow was not the part of the job where you produced the most insight. It was the part where you recovered from producing it. The planning, the arguing, the reading, all of that was expensive. Flow was the reward at the end of the climb, the long descent where the body does the work and the mind finally gets quiet.

I think we undersold how important that was. Not the typing itself, which was never the point, but the alternation. Heavy thinking, then a stretch of calm execution, then heavy thinking again. The job had a built-in rhythm that let your attention expand and contract. The keyboard was the exhale.

## The rhythm broke

Now the two halves do not take turns anymore, but they run at the same time.

The new loop looks like this: plan a task, hand it to AI, and while it works, jump to planning the next one. Hand that off too. Check the first result, correct it, re-explain what you meant, kick it off again, and in the gap, start a third thing. There is no descent. There is no stretch of quiet execution where the plan just flows out of your fingers. Every minute is the expensive half of the old job: the planning, the deciding, the verifying. The restful half has been handed to a machine that does not need a break.

At least it does not seem to be a feeling I invented. When METR ran a follow-up to its developer productivity work, it described the new agentic pattern directly: developers "would often work an unrelated task while waiting for the agent to complete its work" ([METR, February 2026](https://metr.org/blog/2026-02-24-uplift-update/)). That one sentence captures the shift pretty well. The waiting time that used to be flow has become context-switching time.

Domenic Denicola, a jsdom maintainer who took part in METR's trial, put the contrast better than I can. On AI-assisted tasks, he wrote, "I had to continually check their work, and refine my prompt." On tasks without AI, "I just sat down ... and coded with no distractions on a codebase I knew well" ([domenic.me](https://domenic.me/metr-ai-productivity/)). One of those is fragmented oversight. The other is flow. We have quietly traded the second for the first.

I feel it too. The days are more demanding than they were before AI, and the mind is taxed more, and more constantly.

## It feels faster, but that part is complicated

This is the part where I am least sure of myself, because the easy story might not be the right one.

The reason we accept the higher cognitive load is that it feels like we ship faster. And we might. But "feels faster" might also be one of the less reliable instruments we have.

There is one study I keep coming back to here: METR's randomized controlled trial. Experienced open-source developers working in their own mature repositories were actually about 19% slower when allowed to use early-2025 AI tools. The kicker is the perception gap: before the study they forecast a 24% speedup, and even after living through the slowdown they still estimated AI had made them roughly 20% faster ([METR, July 2025](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/), [paper](https://arxiv.org/abs/2507.09089)). That is a gap of nearly 40 points between what happened and what it felt like. An independent two-year case study at NAV IT in Norway found the same disconnect from the other direction: developers' perceived productivity from Copilot had no statistically significant correlation with their actual commit output ([arXiv](https://arxiv.org/html/2509.20353v2)).

I want to be careful here, because this evidence is narrow. It is about experienced engineers, on codebases they already know cold, with tools from early 2025. METR's own authors warn against reading the 19% as a universal law, and it almost certainly does not hold for a junior on a greenfield project, or for the agentic tools we have now.

METR's 2026 update makes that explicit: its newer numbers are mixed and unreliable, partly because the experiment itself is breaking down. So many developers now refuse to do parts of their work without AI, even when paid to, that the people who benefit most are dropping out of the sample. The team's honest summary is that they believe developers are more sped up in early 2026 than in 2025, but that "wider adoption of AI has made it more difficult to measure task-level productivity" ([METR, February 2026](https://metr.org/blog/2026-02-24-uplift-update/)).

I do not read this as "AI makes you slower." I read it more as a reminder that the speed we feel is not something to trust on instinct, and that there might be a real tax hiding inside the loop. Stack Overflow's 2025 survey, with around 49,000 respondents, found that the single biggest frustration with AI tools, cited by 66% of developers, is "AI solutions that are almost right, but not quite," and that 45% say debugging AI-generated code is more time-consuming than they expected ([Stack Overflow 2025](https://survey.stackoverflow.co/2025/ai/)). In practice, almost-right is the most expensive kind of wrong. It passes at a glance and fails on inspection, and catching it is exactly the kind of high-attention work that used to be the rare part of the day and feels like most of it now.

That same survey shows the mood cooling. Favorability toward AI tools fell from over 70% in 2023 and 2024 to 60% in 2025, trust in their accuracy dropped from 40% to 29%, and more developers now actively distrust the output (46%) than trust it (33%) ([Stack Overflow 2025](https://survey.stackoverflow.co/2025/ai/)). That distrust is not the same as rejection, though. It looks more like vigilance to me, and vigilance is its own quiet kind of cognitive load.

## The job changed, not just the tools

Lately I find it more useful to stop thinking of this as the same job with a better tool.

The clearest way I have seen it framed is the move from conductor to orchestrator. O'Reilly's writing on agentic coding describes engineers shifting from playing the instrument to directing the players ([O'Reilly](https://www.oreilly.com/radar/conductors-to-orchestrators-the-future-of-agentic-coding/)). I would push the metaphor one step further: we have become pilots. A pilot's hands are far quieter than those of a hands-on, stick-and-rudder flyer, but the mind is doing more, not less. The job is to know the systems cold, feed the right inputs, watch the instruments, and catch the moment the automation drifts off course.

That is what the day has become. We give AI context, we set its rules, and we harness it toward the result we actually want. The recurring failure mode is exactly what you would expect from a pilot whose instruments are lying: the model does not know the codebase the way you do. Closing that gap is probably a big part of why context engineering became a discipline almost overnight ([Simon Willison](https://simonwillison.net/2025/jun/27/context-engineering/)). Feeding the machine the right context feels like the new version of flying.

I went to a "Dev with AI" conference this week, and one exchange has stayed with me since. The two speakers were seasoned engineers, both somewhere past forty, with fifteen to twenty years in the job, and they were clearly fluent in all of this: building context, harnessing agents, guiding them toward exactly what they wanted. Someone in the audience asked them the question I think a lot of us are quietly sitting with: do you actually prefer crafting agents, or crafting code? One of them answered that he still prefers crafting code. What he finds rewarding now is getting the agent to build the thing the way he had imagined it should be built.

That felt honest to me. The craft we loved has not vanished. It has moved up a level, from writing the solution to describing it precisely enough that something else can write it. The satisfaction is real, but it is quieter and more secondhand than the flow state.

## What we do with the room we get back

To be fair to the optimists, the upside is real, and the recent numbers hold up better than the vintage vendor surveys. DORA's 2025 report, drawn from nearly 5,000 professionals, found AI adoption near-universal at 90%, and, unlike the year before, a positive relationship between AI and both software delivery throughput and product performance, even as it still weighed on delivery stability ([DORA 2025](https://cloud.google.com/blog/products/ai-machine-learning/announcing-the-2025-dora-report)). More than 80% of developers say it has made them more productive, though by now you know I would not lean too hard on a belief. Day to day, the honest version is quieter: the boring parts genuinely hurt less now. And the line I keep returning to from that report is the conditional one, "AI doesn't fix a team; it amplifies what's already there."

Here is where I land, and it is closer to hopeful than the studies might suggest.

The cognitive load is real, and it is heavier in specific stretches of the day, the ones where three agents are mid-task and all of them need attention. There is no pretending that away. But the mechanical half of the old job, the half that flow made restful, was also the half that AI is genuinely good at. We did not just lose the rest; we freed up the time the rest used to occupy.

OK, but then what to do with it? This is the part I find genuinely exciting, because it is a choice rather than an automatic outcome. The time that used to go into typing out a plan can go into making a better plan. Reading the documentation properly instead of skimming. Actually testing a tool to understand how it behaves before committing to it, rather than discovering its edges in production. Learning the system underneath instead of just shipping on top of it. The expensive, high-judgment half of the work was always the half that mattered most, and now we have more room for it.

That is the optimistic reframe I believe in. The breathing room did not disappear, but it moved. It used to live in the keyboard, in the flow of execution. Now it lives in the choices we make around the loop, in whether we use the reclaimed hours to think more deeply or just to start more tasks.

I think most developers miss flow, and we probably will not get it back the way it was. But if the job is shifting from execution to judgment, then the way to make it sustainable, and even enjoyable, is to protect the thinking. Take the planning seriously. Read the docs. Learn the systems. Spend the time AI gives back on getting smarter, not just on doing more.

The keyboard used to let your brain breathe. Now you have to decide with intent when to let it.
