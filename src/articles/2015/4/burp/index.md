---
title: The Top 5 Burp Suite Extensions
date: 2015-04-24 17:00
author: Joe Marshall
layout: article.pug
---

*Originally posted at [bughunting.guide](http://bughunting.guide/the-top-5-burp-suite-extensions/)*.

If you're a freelance security researcher, chances are you've heard of — or use — [Burp Suite](http://portswigger.net/burp/), a program commonly considered the gold standard for penetration testing software. But if you're only using the stock version, as great as it is, you're missing out! Both the free and paid versions of Burp support helpful [extensions](https://pro.portswigger.net/bappstore/) that add extra functionality to the main client — whether it's a separate (and free) scanner, an IP randomizer, or a plugin for validating XSS vulnerabilities. This list is intended to give you a quick-hit overview of some of the best extensions that you can add easily and painlessly to your current setup to be more profitable and productive as a security researcher.

## XSS Validator

XSS vulnerabilities are [the most common bugs on the web today](https://www.info-point-security.com/sites/default/files/cenzic-vulnerability-report-2014.pdf) and, as vulnerabilities that have the potential to affect a wide swathe of a website's userbase, are often rewarded as a part of most bug bounty programs. As such common vulnerabilities however, they're often prone to overidentification and a general surplus of false positives. The [XSS Validator from Nvisium](https://blog.nvisium.com/2014/01/accurate-xss-detection-with-burpsuite.html) solves this problem by using phantomjs to set up a server that receives and verifies XSS findings exported from the [Burp Suite](http://phantomjs.org/) interface. It's a must for testing a target with a large attack surface and a valuable addition to the Burp Suite core.

## Burp Notes

The key to any good penetration testing program is standardization and repeatability (naturally) — developing a coherent testing plan beforehand can save a lot of pain later, while keeping detailed notes of your process could be the key to walking someone through it later. Burp Notes adds an additional tab to your Burp Suite interface, allowing you to save information related to particular targets and attacks. A must for anyone concerned with documentation.

## Sentinel

A Burp extension for all those who want a scanner but don't want to fork up the $200/year licensing fee, Sentinel does an admirable job of scanning web application targets, but isn't as fully featured as the Burp Pro option. Even if you have Burp Pro, though, I'd recommend giving this a shot, as different scanners will often produce differing results and there's always the possibility Sentinel might pick up something Burp Pro missed.

## Random IP Address Header

A critical extension if you're spending a lot of time on a site and a good precaution generally, the Random IP Address Header will periodically change your IP address to help evade any WAF (Web Application Firewalls) that might try to throttle your connection or ban your address. It's not always necessary (and won't always led you to new vulnerabilities) but when you need it, you need it. A great addition to any Burp setup.

## Bupy / Python Scripter

What's better than extensions? Extensions that allow for even more extending! The Bupy and Python Scripter add-ons allow potential Burp developers to write Ruby and Python scripts, respectively, for execution during Burp testing sessions. Using your scripting language of choice, you can access all the information burp does to modify and tweak what happens during response and request calls, meaning that what you can do with Burp is now only limited by your time, imagination, and programming commitment.

If this has piqued you're interest on [working with Burp](http://bughunting.guide/discovering-xss-vulnerabilities-with-burp-intruder/), or if you just find yourself wanting a bit more of a backstory for things like XSS vulnerabilities, consider checking out [Bug Hunt: A Quick Start Guide to Penetration Testing](https://leanpub.com/bughuntaquickstartguidetopenetrationtesting).

Thanks for reading and happy hunting!