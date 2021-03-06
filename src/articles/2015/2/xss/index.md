---
title: A Gentle Introduction to Cross-Site Scripting (XSS)
date: 2015-02-03 18:00
author: Joe Marshall
layout: article.pug
---

*Originally posted at [bughunting.guide](http://bughunting.guide/a-gentle-introduction-to-cross-site-scripting-xss/)*.

Freelance security research is a daunting subject for the uninitiated: Five-figure bounties, corporate lawsuits, and the ever-present threat of prison time, combine to make it just the *slightest* bit intimidating.

But freelance pentesting is worth the (potentially) high stakes: As an independent bug hunter, you're contributing to a more secure web. And by allowing themselves to be vetted by ethical hackers, sites harden themselves against malicious online agents less interested in politely reporting vulnerabilities than painfully exploiting them.

My [bank](https://www.simple.com/) is awesome. Partly because they have a great suite of account management tools, partly because they have a bug bounty program. Even though I'm not on their security team, I can actively contribute to the safety of my account by finding and reporting vulnerabilities. Like other sites that open their systems to testing by independent security researchers, their app is made more safe — not less — by widening the audit process to include as many certified actors as possible.

But we're getting ahead of ourselves.

The purpose of this guide is to ever-so-gently introduce you to pentesting by walking you through the theory and practical application of a single, basic security vulnerability (XSS). You'll get theory, code, and guidance, all designed to be as easily digestible as possible. The goal is to provide you with a minimum-viable-tutorial — the smallest amount of information necessary to get you up and running probing for your own vulnerabilities.

This document does presuppose, however, a certain familiarity with the web and its technologies, including:

- HTML
- HTTP
- Javascript
- The Browser
- Cookies

If you're not one hundred percent on all of these subjects, that's OK. I've tried to link liberally to pertinent concepts throughout the tutorial, but there's a lot to cover. Be forewarned!

With that in mind, we're going to cover one of the most common vulnerabilities found in websites today: Cross-site scripting, or XSS (the 'X' stands for cross). There are a couple different flavors of XSS, but we're going to focus on [Embedded XSS](https://www.owasp.org/index.php/Types_of_Cross-Site_Scripting#Stored_XSS_.28AKA_Persistent_or_Type_I.29) (so called because it entails embedding executable code in areas of a web application where other users will stumble across it). [Reflected XSS](https://www.owasp.org/index.php/Types_of_Cross-Site_Scripting#Reflected_XSS_.28AKA_Non-Persistent_or_Type_II.29) is another common variation of XSS and operates on many of the same principles.

## Cross-Site Scripting (XSS)

First-off, XSS is the real deal. [This guy](http://news.softpedia.com/news/Singapore-Hacker-Jailed-for-XSS-on-Prime-Minister-s-Office-Website-466921.shtml) went to jail for it, albeit in a place not-so-affectionately known as ["Disneyland with the Death penalty"](http://archive.wired.com/wired/archive/1.04/gibson.html). Google will pay you a cool $3,133.7 for discovering the bug on a Google site. And to top it all off XSS is, according to the [2014 Cenzic vulnerability survey](https://www.info-point-security.com/sites/default/files/cenzic-vulnerability-report-2014.pdf), the most common vulnerability found in web applications today, discovered in a quarter of all the sites surveyed for the study. So we know XSS is common and (as we'll show later) can do some nasty stuff, but how does it work? This is as good a time as any to segue into a very boring but necessary disclaimer:

**Do not use any of the resources covered in this document to scan, assess, or otherwise attack sites who have not given you their explicit permission to do so.**

There, that's better! Now, because we want to demonstrate this vulnerability in a way that won't incur legal liability for advertising a live exploit, and, also importantly, that will allow you to reproduce it on your own, we're going to use a deliberately vulnerable teaching web app called Google Gruyere.

Before we set up Google Gruyere and began working through our XSS attack though, it's important to first understand an important security safeguard of the modern web — the very same safeguard we're going to subvert, actually: **The same-origin policy**.

## The Same-Origin Policy

All modern browsers implement some version of the same-origin policy, which is as straightforward as its name implies: Only scripts from pages on the same site may access that site's [DOM](http://www.w3.org/TR/DOM-Level-2-Core/introduction.html) (Document Object Model, a nested, traversible map of a page's HTML elements). The reasoning is also direct: without some version of a same-origin policy, buttons on different sites could affect HTTP requests and DOM changes on other sites, permitting all sorts of malicious behavior.

## Exceptions

But there are exceptions to this rule, as there are to so many. Without it, [Google Fonts](https://www.google.com/fonts), Javascript libraries (e.g. [jQuery](http://jquery.com/), [Mootools](http://mootools.net/), etc.), and other CDN-served (Content Delivery Network) static content wouldn't work:

```html
<link rel="stylesheet" href="http://site.com/style.css"/> 
<script src="https://site.com/script.js"></script>
```

Because (using `<script>` as our example) the javascript file being included on the the HTML page with the `<script>` tag must be pulled from the `src`, then executed, that means an exception must be made to the same-origin policy to allow for that code (from another site, remember!) to run.

But by allowing `<link>` and `<script>` to bypass the typical conventions of the same-origin policy, serving up content from CDNs to execute on your page, a hole is opened up. A tiny hole, really, but — like all holes on the internet — big enough.

That exception makes it possible to execute valid javascript code within those and other HTML elements' attributes. The fact that running code in attributes is not limited to `<script>` and `<link>` is a key point. It's also useful to keep in mind that any javascript included executes within the context of the visiting user's browser environment. More about this later.

Before we get to the actual code, let's take a look at our testing environment.

## Testing with Google Gruyere

[Google Gruyere](http://google-gruyere.appspot.com/) is a wonderful teaching tool and something every infosec hobbyist and early-career web security professional should have on their list of resources. It's a generator that creates sandboxed, live sites with deliberately-introduced vulnerabilities, meant to be exploited in a consequence-free environment, where the software's isolation (and lack of useful data) make it a safe target. The app itself is modeled after a basic social network skeleton, where users with profiles post "snippets" for public consumption.

![google gruyere](gruyere_home.png)

Although the instructions for setting up your live sandbox are readily available on the Google Gruyere website, they're simple enough to be easily summarized here:

1. Navigate over to http://google-gruyere.appspot.com/start
2. That's it!

![google gruyere - index](gruyere_index.png)

Navigating to that address generates the sandboxed app you can mess around with to your heart's content.

Since the vulnerability we're interested in exploiting relies on posting unsanitized code where it can be executed (unwittingly) by other users, let's go ahead and create an account so that we can create snippets. We'll cover sanitizing code and user-to-user attacks in more detail in a bit.

This is what my screen looks like after logging in with the super-semantic username "SomeGuy."

Next click on the "New Snippet" link, located in the header, which should bring you to this page.

![google gruyere - new snippet](gruyere_new_snippet.png)

Aha! There's an important clue here to a possibly fruitful approach. Specifically, the "*Limited HTML is now supported...*" part. But first the greater detail on code sanitation and how it applies to user data, like I promised.

## Data Sanitation

Those users! Just when you think you can count on them to stick to kitten videos and real estate pyramid scams, they submit code that drops your email registry! The problem of input variability — the idea that anything open to the public web can and will be subjected to all manner of nasty stuffs — is a fundamental one in web application security. In order to cope with the reality of malicious user input, developers have created a number of different strategies for retaining the meat of valid posts, while stripping away elements (like escape characters for certain languages) that can prove harmful to either the application or its userbase.

Let's talk about two of the most common methods for sanitizing data (before swinging back to our Google Gruyere XSS attack).

**[Blacklisting](http://en.wikipedia.org/wiki/Blacklist_%28computing%29)** is the process of creating and keeping up-to-date a list of all the sites, scripts, or elements that are not allowed to perform a particular action or access certain information on a given site.

**[Whitelisting](http://en.wikipedia.org/wiki/Whitelist)** is the process of creating/keeping current a list of all the sites, scripts, or elements that are allowed to perform an action or access information on a site.

Of the two, whitelisting is considered the better security strategy because blacklisting can be so easily circumvented by rejiggering names and other relevant identity markers. With that in mind, let's get to the actual code!

## Code

So how does all this sanitation talk apply to the "New Snippet" form we've opened in our instance of Google Gruyere?

As mentioned before, the "*Limited HTML...*" language implies that there is some sanitation going on — Gruyere is allowing certain HTML markup elements meant to make the text/snippet more readable, but disallowing other ones (I'm looking at you `<script>`). Hence the word "limited." It's unclear whether they're whitelisting or blacklisting, at this point, since the strategies are just inversions of one another.

If you're asking yourself "What HTML elements or tags could be dangerous? If everything was allowed, what's the worst that could happen?" we'll cover that in a little bit, under the **Effects** section. For now, just recognize that being able to embed executable javascript is bad for the site (but a vulnerability for us!)

So let's test the waters a bit. The submission form says "*Limited HTML*," but that could just be a smokescreen, meant to discourage shenanigans, right? Pretty sneaky, Google Gruyere! Let's start out with the slowest possible pitch: `<script type="text/javascript">alert('hey!')</script>`

In this case, `alert('hey!')` is a simple canary for testing the browser coalmine: If the alert appears, then the javascript is being executed — and a whole lot of hijinks are possible.

If we submit that code as a snippet, we get redirected to the following page on Google Gruyere.

![google gruyere - first submit](gruyere_new_snippet.png)

No luck! Our alert didn't activiate on submission and (absent any other trigger) will remain inert, harmless text. This was, admittedly, doomed from the start. `<script>` tags are almost always scrubbed from any content because of their clear utility for malicious purposes.

This is where everything about javascript code in certain HTML elements being executable comes into play. `<script>` tags, as stated before, are almost always stripped from any content. But what about code lurking in the `href` or `src` attribute of more innocuous markup?

Let's try another tag. One that might more easily slip past whatever basic sanitation mechanisms Google Gruyere has in place.

Opening another "New Snippet" submission form, enter the following code:

```html
<a onmouseover="alert('hey!')" href="#">read this!</a>
```

`onmouseover` is a typical XSS go-to because it so often slips past sanitation censors. Let's see if it meets with any success here.

Once you've submitted that snippet and been redirected to the main index, mouse over your most recent post. You should see...

![gruyere - successful xss](gruyere_successful_xss.png)

Success! Success is most definitely what you should see.

You've now embedded code that can be remotely executed by other users visiting the site and mousing over that particular snippet. That's a vulnerability just waiting to be exploited and a definite headache in the making for whatever webmaster or sysadmin lies on the other side of all those [tubes](http://en.wikipedia.org/wiki/Series_of_tubes).

Before we discuss it in depth, let's make a quick, (hopefully) illustrative change to the code we just submitted as a snippet. Go ahead and submit the following code as a new snippet.

```html
<a onmouseover="alert(document.cookie)" href="#">read this too!</a>
```

Mousing over this third entry, "read this too!" you should see something like the following:

![gruyere successful xss](gruyere_successful_xss.png)

Cookies are how websites identify when it's you that's returned to that site, as opposed to any of the other thousands — or millions — of other individuals bombarding the server with HTTP requests at that moment. Since HTTP is [stateless](http://en.wikipedia.org/wiki/Stateless_protocol) and HTTP requests don't have the ability to access outside information about your identity and security privileges, all that information must be contained *inside each HTTP* request, to be communicated *each time you hit the server*. Cookies are numeric hashes (or in some rare, terrible cases) plaintext variales used by your browser to store that information and communicate it to the server — allowing you to sign in without logging in, because you've already been authenticated by your cookie.

Are the alarm bells ringing? If cookies authenticate an individual, then if someone else steals that cookie, they can impersonate the person it's tied to — accessing their account, payment information, and other sensitive details without having to know their username or password!

Since the code `alert(document.cookie)` that we've inserted as a snippet into Google Gruyere is always executed within the context of each individual accessing user's browser environment, it will `alert()` that user's own particular cookie set. All it would take to weaponize this exploit would be to include code initiating an HTTP POST request to the server of your choice with the cookie included along in the parameters. As discussed before, once you have their cookie, you can access someone's account as if you're them. For Google Gruyere, that's not a big deal. For a critical ecommerce platform like Amazon or Ebay... maybe so.

Unfortunately (or perhaps, fortunately), I'll forego covering that code, the last-criminal-mile in setting up a malicious XSS exploit. The more **important point** is that you now know enough to identify XSS bugs in the wild.

Thanks for reading and happy hunting!