---
title: Building @SouthBotFunWest, a Twitterbot that Recommends SXSW Parties
date: 2015-03-15 12:00
author: Joe Marshall
layout: article.pug
---

It's that time of year, when a product manager's thoughts turn to daydrinking and the streets of Austin are turned into a bacchanalia of technology celebrating the almighty God of the Web — SXSW Interactive!

SXSW has been the launching ground for many web businesses that have gone on to greater success, but none of them can hold a candle to the festival's own true prodigal son, Twitter, a technology that didn't even launch at the event — it actually [debuted 9 months earlier](http://mashable.com/2011/03/05/sxsw-launches/) — but became so popular at the 2008 festival that its rise became indelibly associated with the conference.

Twitter is appealing as a data source because its short snippets provide useful insight into the vagaries of popular sentiment — part of the reason it's being [archived for future generations](http://www.cnn.com/2010/TECH/04/14/library.congress.twitter/) by the Library of Congress. The social network is also a fantastic source for programmatic content: NASA has a twitter handle for posting high-definition images from the Hubble Space Telescope daily ([@HubbleDaily](https://twitter.com/hubbledaily)), another plank in the argument that just about everyone is getting on board the twitterbot bandwagon.

With that in mind, let's use Node, everyone's favorite server-side Javascript solution, and `twit`, an npm package that taps into both the streaming and RESTful Twitter APIs, to build a bot that can harness the collective hipness of the Twitterati to provide that elusive social secret — the perfect SXSW party recommendation.

## Setup

If you haven't already, install Node and npm, Node's package manager. When you've confirmed that they're in your path (an easy way to check is `which node` and `which npm`), create a directory for your project and navigate into it: We'll accomplish this with `mkdir SouthBotFunWest && cd SouthBotFunWest`

Next start a new Node project with `npm init`. You'll be prompted to enter a name and some other particulars, but if you prefer you can just hit return and skip through everything.

Now down to business! Our first and only dependency for this project will be `twit`, a Node module for working with the Twitter API. Use the following command to install the module and save it to your `package.json` in one go:

```
npm install --save twit
```

(If you're getting some weird warnings installing the packages, add the line `'private': true` to the exported object in your `package.json` to get rid of them.)

At this point, you'll need to create a twitter profile (in my case, @SouthBotFunWest) and link it to an associated developer account, which you can create at `dev.twitter.com/apps`. When you create your account make sure to change the app's permissions to "Read, Write, and Access Direct Messages":

![](http://i61.tinypic.com/11imwat.png)

After you've created and linked your accounts, write down your consumer key and secret somewhere safe, and click on the "Create my access token" button. Record these too.

![](http://i61.tinypic.com/2ceroz8.png)

In your root directory, create a `config.js` file to store these Twitter secret keys and access tokens. Add this to your `.gitignore file` (if you haven't made one yet, there's no time like the present!). Your `config.js` should look like this:

```javascript
module.exports = {
    consumer_key: "",
    consumer_secret: "",
    access_token: "",
    access_token_secret: ""
}
```

(Except with actual keys and tokens!)

You might notice that this is different than how the `twit` documentation describes inputting your consumer and access keys/tokens, that we're abstracting our Twitter credentials into a separate file. We've done this for the purpose of keeping it secure. By keeping sensitive credentials in a separate file that we can add to our `.gitignore`, we can keep from committing that information to a public repo, which would be very bad.

To test our Twitter API access, let's slightly modify one of the twit boilerplate examples to post a classic "hello world!" message.
The new `index.js` should look like this.

```javascript
var Twit = require('twit');
var twitInfo = require('./config.js');

var twitter = new Twit(twitInfo);

twitter.post('statuses/update', { status: 'hello world!' }, function(err, data, response) {
  console.log(data);
});
```

We talked about abstracting our sensitive credentials into a separate `config.js` file. The key to making that work is the `require()` function's ability to import javascript files. Using `require('./config.js')` we can make accessible the config object exported inside of it and pass it along as an argument to the new Twit constructor function. We know what the Twit constructor function is expecting, which is why the `config.js` file has been written so that the attribute names are consistent with the twit API.
Start the bot with `node index.js`. You should see the data object associated with your tweet logged to the terminal and if you go to your Twitter profile, you should see those familiar two words!

![](http://i57.tinypic.com/lxy6d.png)

Success!

## The Twitter Search API

Now that we've got the basic proof of concept for the "posting to twitter" part of our twitterbot, we can look at the "finding the parties" portion. There are a few different ways one could go about writing a script that finds SXSW parties: we could write something that culled info from event websites using a web scraper like [PhantomJS](http://phantomjs.org/), we could use the API of a social network like Reddit to find party leads, or we could query a search engine hoping to find the actual RSVP pages of some honest-to-goodness bashes.

But ultimately the best solution that results in the neatest stack, clearest separation of concerns, and returns the results we want is right in front of our faces — the Twitter search API.

So let's look at the `twit` documentation and find some examples for searching tweets. This next code is lifted directly from the `twit` github page and searches that hot topic on everbody's minds today: bananas.

```javascript
twitter.get('search/tweets', { q: 'banana since:2011-11-11', count: 100 }, function(err, data, response) {
  console.log(data)
})
```

To make some sense of the structure by printing out all the top-level attributes, change `console.log(data)` to:

```javascript
for (attr in data) {
    console.log(attr);
}
```

The `statuses` attribute looks like what we want. Exploring that a little further, we can see that it consists of an array of tweet objects. Let's modify our code to print out the text of all those tweets.

```javascript
var Twit = require('twit');
var twitInfo = require('./config.js');
var twitter = new Twit(twitInfo);

var tweets;

twitter.get('search/tweets', { q: 'banana since:2011-11-11', count: 100 }, function(err, data, response) {
  tweets = data.statuses;
  for (index in tweets) {
    console.log(tweets[index].text);
  }
})
```

That is a *lot* of banana talk.

OK, that's nice and good as a first step getting a handle on the search API and how to return text, but let's apply it to the object of our attention.

The following code repeats some code in a brute force attempt to return some links to the types of parties we're after.

```javascript
var musicParties, 
        interactiveParties, 
        filmParties;


twitter.get('search/tweets', { q: 'SXSW music party ', count: 100 }, function(err, data, response) {
  musicParties = data.statuses;
  console.log("MUS " + musicParties[0].text);
})

twitter.get('search/tweets', { q: 'SXSW interactive party ', count: 100 }, function(err, data, response) {
  interactiveParties = data.statuses;
  console.log("INT " + interactiveParties[0].text);
})

twitter.get('search/tweets', { q: 'SXSW film party ', count: 100 }, function(err, data, response) {
  filmParties = data.statuses;
  console.log("FLM " + filmParties[0].text);
})
```

When we run the new `index.js`, it produces the following output:

```
FLM RT @NGeistofficial: Salem to host 2015 #SXSW Film Festival opening #party http://t.co/ytDINxCflW #SXSW2015 #SXSWFilm #Salem @SalemWGNA http…

INT RT @Skoop_Events: North of 41 - 5th Annual SxSW Interactive Party
March 14, 8-11:30pm
RSVP: http://t.co/DZWA9osAIG
/#sxsw15 #sxsw #sxsw2015 …

MUS Yuuuhhh "@austin360: Ghostface Killah headlines another SXSW party http://t.co/MiAO81rxVm" @sinhalesepolice in atx for sxsw?
```

Those look like things we want!

That was a sample of searches intended to aggregate a large database of tweets that we could then analyze and tweet to people asking for specific types of parties.

But what's the *largest* single database of tweets? Twitter itself.

Let's refactor our approach to rely on a one-for-one search as opposed to a data aggregation stategy — which can get messy and requires a sizeable back-end. Using this strategy, here's a more generalized twitter search function:

```javascript
function search (query) {
    twitter.get('search/tweets', { q: query, count: 1 }, function(err, data, response) {
      console.log(data.statuses[0].text);
    })
}
```

Logging `data.statuses[0].text` is a stand-in right now for when we'll post the tweet later.

Testing this code out with `search('SXSW music party')` we return the same result as the music party tweet mentioned before.

That's all a good start. Now let's get to work on the responding-to-users part of the twitterbot, which will require the streaming API functionality of our `twit` client.

## Making the Bot Interactive

Looking at the API, it seems simple enough to open a stream tracking mentions of a specific word. In our case, since we want to track people who are tweeting at the bot, it makes sense to track our handle, @SouthBotFunWest. Here's the code to open a stream tracking our mentions logging both the tweets and their posters.

```javascript
var stream = twitter.stream('statuses/filter', { track: '@SouthBotFunWest' });

stream.on('tweet', function (tweet) {
  var asker = tweet.user.screen_name;
  var text = tweet.text;
  console.log(asker + " tweeted: " + text);
})
```

Log out of your bot's profile (if you're logged in of course), log in to another, tweet at your bot and check back at your terminal. You should see your name and tweet logged on the command line!

Now we've got the ability to track tweets that mention our bot. The next logical step is putting in place a system to trigger different search queries depending on the content of those tweets.

The easiest way of doing this is with [Regular Expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions). Regular expressions are basically a self-contained programming language for matching patterns of natural language (e.g. words, expressions) in text. Let's say we want to the bot to respond whenever someone says "hi." That's a perfect use case for regular expressions. First though, let's work on breaking the text of the tweet down word-by-word, so we can use our beginning of line (`^`) and end of line (`$`) operators to signify the beginning and endings of words, as opposed to the full text of the tweet. We can do this using the `natural`module and it's word tokenizer function, which takes a body of text and turns it into an array of words. Let's install and save it.

```
npm install --save natural
```

And of course `require()` it in our `index.js` file, then instantiate a new instance of `WordTokenizer()`.

```javascript
var natural = require('natural'),
  tokenizer = new natural.WordTokenizer();
```

Then try it out. Uncommenting the stream code to prevent the script from hanging, we can log the tokenized version of a typical tweet:

```javascript
console.log(tokenizer.tokenize("hey @SouthBotFunWest, where's a cool party?"))
```

```
[ 'hey', 'SouthBotFunWest', 'where', 's', 'a', 'cool', 'party' ]
```

It comes out in a (nearly) perfect array! It's important to note how the tokenizer captures punctuation (namely, that it doesn't), but this is generally the response that we want. It's time to add the tokenizer to our stream code.

Underneath the `console.log(asker + " tweeted: " + text)`; in your `stream.on()` callback, add:

```javascript
  var wordArray = tokenizer.tokenize(text);
  var greetingRE = /^hi$/;

  for(var i=0;i < wordArray.length;i++) {
    if (greetingRE.test(wordArray[i])) {
      console.log(wordArray[i]);
      console.log("Sup " + "@" + asker + ". So, I've heard about some cool South-by parties. You know, whatever [music, interactive, film, free, food, drink]");
    }
  }
```

This code tokenizes the incoming tweet into an array of words, checks each word to see if it matches "hi," and — if it does — prints the word and our response message.

Try tweeting at your bot from another account with "hi" somewhere in the post. You should see "hi" and our response logged to the terminal!

## Connecting Response and Search

Recap: We've built a rudimentary search function that returns the text of the first matching tweet and the ability to match various keywords to the posts tweeted to us at @SouthBotFunWest. What's left? Linking up the two.

As our goal, let's try to match a basic category of party to a related search. In our case, that's interactive. Let's update our code so that every time someone tweets the word "interactive" at us, we log the text of the first related tweet to to terminal. While we're at it, let's make sure to capture and pass to the `search()` function the person we've identified is tweeting at us. For the instances where someone is tweeting at us just to say hi, we can go ahead and post our standard response straight away. As ever, we need a `return` to break us out once we post a tweet so that we don't double post.

```javascript
var stream = twitter.stream('statuses/filter', { track: '@SouthBotFunWest' })

stream.on('tweet', function (tweet) {
  var asker = tweet.user.screen_name;
  var text = tweet.text;
  var wordArray = tokenizer.tokenize(text);

  // RegExes
  var greetingRE = /^hi$/;
  var interactiveRE = /^interactive$/

  for(var i=0;i < wordArray.length;i++) {
    if (interactiveRE.test(wordArray[i])) {
      search("interactive", asker);
      return;
    } else if (greetingRE.test(wordArray[i])) {
      post("Sup " + "@" + asker + " . So, I've heard about some cool South-by parties. You know, whatever [music, interactive, film, free, food, drink]");
      return;
    } else {
    }
  }

})
```

Running this code, you'll quickly see a big problem: A string where `hi` comes before `interactive` will always trigger the greeting regular expression first and end the loop (since the tweet is evaluated word-by-word). That's definitely an issue! What we really want here is a function that will take a regular expression and the text its matching it against, then search over the word array and return `true` if there's a match and `false` if, by the end of the loop, no match turns up.

```javascript
function matchRE (re, text) {
var wordArray = tokenizer.tokenize(text);
  for(var i=0;i < wordArray.length;i++) {
    if (re.test(wordArray[i])) {
      return true;
    }
  }
  return false; 
}
```

Let's update our code to not only reflect this new function, but an approach the matches keywords beyond "interactive":

```javascript
var stream = twitter.stream('statuses/filter', { track: '@SouthBotFunWest' })

stream.on('tweet', function (tweet) {
  var asker = tweet.user.screen_name;
  var text = tweet.text;

  // RegExes
  var greetingRE = /^hi$/;
  var musicRE = /^music$/;
  var interactiveRE = /^interactive$/;
  var filmRE = /^film$/;
  var foodRE = /^food$/;
  var drinkRE = /^drink$/;

  if (matchRE(interactiveRE, text)) {
    console.log("interactive")
  } else if (matchRE(filmRE, text)) {
    console.log("film", text)
  } else if (matchRE(musicRE, text)) {
    console.log("music")
  } else if (matchRE(drinkRE, text)) {
    console.log("drink");
  } else if (matchRE(foodRE, text)) {
    console.log("food")
  } else if (matchRE(greetingRE, text)) {
    console.log("greeting");
  } else {
  }

})
```

Here are the results that are produced from feeding different text inputs into this logic tree:

hi @SouthBotFunWest, where's a cool party? => "greeting"

hi @SouthBotFunWest, where's a cool music party? => "music"

@SouthBotFunWest! Where's some food? => "food"

That looks perfect (for a first iteration, at least). It's important to note how essential the order is: if the "greeting" response is one of the first options in the `if / else if / else` sequence, as opposed to the last, it will consistently trigger and prevent the more topic-specific searches later down the chain from ocurring.

The final tasks before us are linking up the regex matches to related searches and returning something from the seach function that we can tweet back at whoever's asking for information. Let's work backwards and start with the latter task first.

Twitter, it turns out, has some seriously nifty data fields in the `tweet` objects it returns through its search API. One is the `urls` attribute, which contains an array featuring different versions of any links referenced in the post (including a shortened version, the version Twitter displays in the tweet, and others). By saving the links referenced in the tweets we return in our search, which almost invariably point to RSVP pages or lists of related parties, we can provide them in addition to our text response.

Of course not all posts will contain links, but those are the only ones we're interested in. That's why we need to modify our `search()` function to return 10 tweets, then iterate over the results to select one that has elements in its `urls` array. I've put that loop in an `else` block, because nine times out of ten the first result, in the `if` block, will be something that we can use.

Let's write the code to take the first tweet with a link, exit the loop, and post that link

```javascript
function search (query, asker) {
  var search = "SXSW party " + query + " filter:links";
  twitter.get('search/tweets', { q: search, count: 10 }, function(err, data, response) {

    var resultLink; 

    if (data.statuses[0].entities.urls.length > 0) {
      resultLink = data.statuses[0].entities.urls[0].url;
    } else {
      for (var i=0;i < data.statuses.length;i++) {
        if (data.statuses[i].entities.urls.length > 0) {
          resultLink = data.statuses[i].entities.urls[0].url;
          i = data.statuses.length;
        }
      }
    };    

    var result = "@" + asker + " Cool cool. Totally get that... " + query + " is neat. How about this? " + resultLink;
    post(result);
  })
}
```

That's it. All we need to do now is hook everything up by placing a `search()` function with the appropriate parameters within our regular expression logic tree. Here's the full final `index.js` file:

```javascript
var Twit = require('twit');
var twitInfo = require('./config.js');
var twitter = new Twit(twitInfo);
var natural = require('natural'),
  tokenizer = new natural.WordTokenizer();

function matchRE (re, text) {
  var wordArray = tokenizer.tokenize(text);
  for(var i=0;i < wordArray.length;i++) {
    if (re.test(wordArray[i])) {
      return true;
    }
  }
  return false; 
}

function search (query, asker) {
  var search = "SXSW party " + query + " filter:links";
  twitter.get('search/tweets', { q: search, count: 10 }, function(err, data, response) {

    var resultLink; 

    if (data.statuses[0].entities.urls.length > 0) {
      resultLink = data.statuses[0].entities.urls[0].url;
    } else {
      for (var i=0;i < data.statuses.length;i++) {
        if (data.statuses[i].entities.urls.length > 0) {
          resultLink = data.statuses[i].entities.urls[0].url;
          i = data.statuses.length;
        }
      }
    };    

    var result = "@" + asker + " Cool cool. Totally get that... " + query + " is neat. How about this? " + resultLink;
    post(result);
  })
}

function post (content) {
  twitter.post('statuses/update', { status: content }, function(err, data, response) {
  })
}

var stream = twitter.stream('statuses/filter', { track: '@SouthBotFunWest' })

stream.on('tweet', function (tweet) {
  var asker = tweet.user.screen_name;
  var text = tweet.text;

  // RegExes
  var greetingRE = /^hi$/;
  var musicRE = /^music$/;
  var interactiveRE = /^interactive$/;
  var filmRE = /^film$/;
  var foodRE = /^food$/;
  var drinkRE = /^drink$/;

  if (matchRE(interactiveRE, text)) {
    search("interactive", asker)
  } else if (matchRE(filmRE, text)) {
    search("film", asker)
  } else if (matchRE(musicRE, text)) {
    search("music", asker);
  } else if (matchRE(drinkRE, text)) {
    search("drink", asker)
  } else if (matchRE(foodRE, text)) {
    search("food", asker)
  } else if (matchRE(greetingRE, text)) {
    post("Hey " + "@" + asker + " . So, I've heard about some cool South-by parties. Or you know, whatever. [music, interactive, film, free, food, drink]");
  } else {
  }

})
```

Now for the moment of truth: If we reach out to our bot with our script running, asking it for a super sweet South-by rec, it responds with ...

![](http://i62.tinypic.com/seltw0.png)

... complete disaffection. It's enough to make any father proud.

## Deployment

So how would we go about actually setting up this script to run continously? Luckily for us Node has an excellent module for that — `forever` — that couldn't be easier to use.

Simply install it on your Node-capable machine (note that unless you use a different module, `forever` needs to be installed globally)...

```
sudo npm install -g forever
```

Then start your script with:

```
forever start index.js
```

That's it! You might get a warning or two, but if you enter `forever list` you should see your process, along with its current uptime.

## Parting Thoughts

There are a lot of ways we could improve the current setup (check out [github](https://github.com/MarshalJoe/SouthBotFunWest) to see some extra tweaks I've made), but this fulfills our original goal — to build a bot that can respond to incoming tweets with a cheeky response and a link to an appropriate party.