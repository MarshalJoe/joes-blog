---
title: Simple Automated Scanning with Arachni
date: 2016-06-05 17:00
author: Joe Marshall
layout: article.pug
---

*Note: This guide assumes you have access to a UNIX terminal like the ones found in Apple and Linux systems.*

Scanners have a tricky reputation. Their point-and-click simplicity and utility as automated reconnassiance tools means they get love from script kiddies and professionals alike. They also have compelling use cases for flushing out certain vulnerabilities, like [XSS](http://bughunting.guide/a-gentle-introduction-to-cross-site-scripting-xss/), where there may be too many input vectors or payload varities to feasibly go through the application by hand.

The problem is a lot of the most popular scanners, like [Burp Suite](https://portswigger.net/burp/) and [Websecurify](http://www.websecurify.com/), rely on a [GUI](https://en.wikipedia.org/wiki/Graphical_user_interface) for their targeting information and follow a similar pattern:

1. Type the target URL into the proper field
2. Start the attack
3. Watch the results stream in.

Considering a complete scan of a web app can often take hours, this workflow isn't  ideal: You have to manually kick off a process where you don't know the ultimate duration and need to keep checking in periodically to see its status. It would be *much* better instead to just have the entire scan report ready and waiting for you at the time and inbox of your choosing &mdash; and even *better* if you didn't have to clutter-up a perfectly good monitor with a process that should be daemonized anyway. Enter Arachni.

### Arachni

[Arachni](https://github.com/Arachni/arachni) is an open-source web application vulnerability scanner built in [Ruby](https://www.ruby-lang.org/en/) by Tasos Laskos ([@Zap0tek](https://twitter.com/Zap0tek)). It relies on Ruby version 2.0 or later, and as a gem can be installed in the usual way (`gem install arachni`). In addition to a web-based GUI and many other common enterprise options, Arachni offers a simple set of shell tools to control a scan from the command line. The easiest way to kick off an Arachni scan couldn't be more direct: Simply enter `arachni <HOSTNAME>` on the command line.

The more interesting component to Arachni, for our purposes, is its configurability. Here are some of the options Arachni allows you to pass on the command line, and what they mean for us (in no particular order). 

##### 1. Configure Checks

```
--checks=*,-emails
```

The `checks` option allows you to select which vulnerabilities you'd like Arachni to attempt to discover. In this case, we've told it to search for everything (using our asterisk) then told it to skip `emails`, an option meant more for preparing social engineering attacks than discovering vulnerabilities. You can see all the vulnerability checks available using `arachni --checks-list`.

##### 2. Set Email Notifications

```    
--plugin 'email_notify:to=<EMAIL>,from=<EMAIL>,server_address=<SERVER>,server_port=<PORT>,username=<USER>,password=<PASS>'
```
The Arachni plugin that allows you to email yourself reports requires you to first install the `pony` gem (`gem install pony`). Once that's ready, this option will allow you to skip having to check back on the local machine and allow you to receive the report in a way that's easy, portable, and log-friendly.

##### 3. Enable Spidering

```
--scope-include-subdomains
```

Rather than just check the one main page we feed in as the target url, we want to examine the entire application in question. Passing in this option will tell arachni to spider everything under this url's scope.

##### 4. Force Timeout

```
--timeout <HOURS>:<MINUTES>:<SECONDS>
```

Although generally resilient, the Arachni scanner can sometimes get caught up on weird javascript, broken links, or other malformed code. To prevent it from getting stuck in a rut and failing to complete a scan, the timeout option will close out the scan after the given value has elapsed if the service hasn't already completed.

Here's what it looks like when we put it all together under a new file,  `scan.sh`. I've added the ability to pass in the target url as your first argument.
```
arachni $1 \
    --plugin    'email_notify:to=<EMAIL>,from=<EMAIL>,server_address=<SERVER>,server_port=<PORT>,username=<USER>,password=<PASS>' \
    --checks=*,-emails* \
    --scope-include-subdomains \
    --timeout <HOURS>:<MINUTES>:<SECONDS>
```
Now at the command line we can initiate a scan targeting a given host simply be entering `sh scan.sh <TARGET_URL>` and without having to retype all the accompanying options each time.

### Scheduling The Scan

Since the entire scan is now run on the command line, it's easy to schedule. While `cron` is a fantastic utility if you want to schedule a recurring job, there's another [POSIX](https://en.wikipedia.org/wiki/POSIX) function that's even better for scheduling scripts if you only want to execute them once, `at`. [At](http://manpages.ubuntu.com/manpages/hardy/man1/at.1posix.html) is as easy to use as it sounds: Let's say you're working late at night and, during this moonlit hacking session, you want to schedule an automated scan as the first step in a reconnassaince effort aimed at a new website advertising their lucrative bug bounties. Since it's Friday (you're a real worker bee!) you want the scan to run in the wee hours of weekend, so you can minimize the risk of affecting normal traffic, but still have your report waiting for your morning coffee on Monday. In this case, it's as easy as entering:

```
./scan http://example.com  at now + 2 day
```

That last part isn't pseudo-code &mdash; `at` allows you to use relative time with the keyword `now`, an integer value, and either `min`, `hour`, or `day` (you can also chain these different values, entering `./scan http://example.com at now + 20 min + 2 day` if you wanted to schedule a scan for 2 days and 20 minutes from now, for example). Of course you can also enter absolute dates. Assuming that the Friday in question is Friday the 13th, in the month of May, the above would code would now look like the following:

```
./scan.sh http://example.com at 2 am may 16
```

Now available on the command line, the entire scanning operation practically automates itself.

### Going Further

Operating a scanning client from the command line is just the beginning. Besides making it much easier to use a headless [VPS](https://en.wikipedia.org/wiki/Virtual_private_server) client as your penetration testing toolkit, it also makes the entire automated scanning process more extensible. Augment your current scanning regimen with another open-source scanner &mdash; or two &mdash; then email yourself the aggregated results. Or add in specialty binaries like [sqlmap](http://sqlmap.org/) or [dirbuster](http://tools.kali.org/web-applications/dirbuster) to look for hidden directories or specific vulnerabilities. The UNIX philosophy of building a bunch of small, modular tools that each do one thing particularly well is an excellent fit for the world penetration testing.