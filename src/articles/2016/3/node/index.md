---
title: An Event Loop Allegory
date: 2015-08-25 18:18
author: Joe Marshall
layout: article.pug
---

Two jugglers walked around a small track, practicing their craft.

The first one, Sync, wasn't really what you'd call a juggler, so much as an apprentice juggler or (less charitably) a juggler-wannabe - a straight up ball tossin' poseur.

Sync could only keep one ball in the air at a time. In fact, he only owned one ball. As he traced the circle of the track with his steps, his bouncy red ball would draw a series of parabolas in the air, tracing a gentle up-and-down curve following his path. As he walked, Sync would think somber thoughts about his place in the larger hierarchy of the cutthroat world of professional juggling.

![](http://i.imgur.com/4O3wxly.jpg)

The second, Async, is the complete opposite of Sync. 

Async is a juggling master - an empresario, ambassador, and all around icon of the sport. In the juggling hall of fame, there's one name — Async — written in fire that's never allowed to go out. This is because Async has a secret: One that makes her a virtuousic juggler of the highest calibre.

Many years ago, when Async was young, a wizard granted her a powerful, some might say frustratingly-specific ability — the power to toss up, and successively catch, any number of small bright red balls. It doesn't work with anything else, especially not knives or tiki torches, but it's still been more than enough to catapault Async to stardom, with audiences captivated as she tosses, 1, 2 or even 3,000 balls in the air, only to catch them in a blinding flurry of catches too quick for the naked eye.

The path of Async's tosses, as she makes the circuit, looks very different from Sync's. Because of wind, the force behind each toss, and other factors, each ball might be up in the air for different periods of time, but ultimately their paths can be reduced to the two events Async most cares about — the moment each ball leaves her hand and the moment each returns. That is the secret and source of her true power.

![](http://i.imgur.com/VAy1Rmr.jpg)

What's the moral of the story? It becomes easier to track multiple processes in a single-threaded environment if, instead of stacking them end-to-end, you throw ordering to the wind and only focus on what you care about the most - when each process begins and when each ends. It can require database writes to be coordinated differently, and can influence other elements of application architecture, but it also represents the key to greater concurrency.

Also, wizards are good people to know.