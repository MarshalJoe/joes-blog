---
title: Advancing the State of Wedding Tech
date: 2015-11-28 12:00
author: Joe Marshall
layout: article.pug
---

As someone entering that certain age, where a heavy cardstock "save the date" gracing my mailbox is a near weekly occurrence, I've been reflecting on the state of wedding technology.

It's pretty rough.

Weddings should be classy, reserved, sophisticated ceremonies — meaning a robot waitstaff is probably out of the question. But that doesn't mean we can't advance the state of things the tiniest bit. And I know just where to start: wedding cameras.

Not the camera a wedding photographer hired by the couple might use to take their official portraits, but the disposable cameras that are bought en masse for people to record memories for the happy pair.

I say we update this system by building an app (using Twilio, everyone's favorite text and voice messaging API) that allows people to text in their pictures and share their precious wedding moments in realtime. Let's build it and, in the process, learn how Node and Twilio can be combined to make just about any SMS or MMS sharing solution possible.

## The App

To clarify what we'd like to achieve with this project: We want to build an app that will allow people to text their wedding pictures to our Twilio number and then display them in a running slideshow displayable via a projector. The slideshow app should:
- Cycle through all available slides continously
- Update itself as pictures come in
- Animate slide transitions smoothly
- Respond to texts with a confirmation SMS

There are a lot of bells and whistles this list doesn't cover, but it's a good target for getting us started.

## Setup

Create a new directory for the app and inside create a new file named `package.json`. We're going to use this to install our project's dependencies.
```js
{
  "name": "SMS-Slideshow",
  "version": "0.0.1",
  "description": "A Twilio Nodejs app for running an SMS-powered slideshow",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "Joe Marshall",
  "license": "MIT",
  "dependencies": {
    "body-parser": "^1.12.2",
    "express": "^4.12.2",
    "socket.io": "^1.3.5",
    "twilio": "^1.11.1"
  }
}
```
Enter `npm install` from within the directory containing `package.json`. That will download everything we need to get going.

For our first task, let's use Express to build a simple server. We're also going to add Twilio to the mix, since we're going to need it in a bit.
```js
var twilio = require('twilio');
var app = require('express')();
var server = require('http').Server(app);

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

server.listen(3000, function(){
  console.log('listening on port 3000');
});
```
Of course after writing this, we need to create an `index.html` file for our server to serve up:
```html
<html>
<head>
    <title>SMS Slideshow</title>
</head>
<h1>Hello World</h1>
<body>

</body>
</html>
```
If you put up the server with `npm start` and open `localhost:3000` in your browser, you should see a cheery "Hello World" greeting you.

Now that we've got our server, let's start grafting cool things onto it. Enter TwiML, the Twilio Markup language, which is what we need to use to respond to Twilio webhooks.

## Using TwiML, The Twilio Markup Language

Twilio runs off webhooks, meaning that when someone sends a text message, either an SMS or MMS, to your Twilio number, a server controlled by Twilio sends an HTTP POST request to wherever you specificy with information like the text's body and the phone number it's coming from in the request's parameters. The idea behind this is that you can configure Twilio to send information to your app, and then either respond with TwiML code, which is an XML-like shorthand TwiLio uses to direct certain actions, or by saving the information to your servers and doing whatever you want with it there (or doing both, which is our course of action).

Let's copy some of the TwiML boilerplate from the Twilio API documentation, just to get things going.
```js
app.post('/message', function(request, response) {
    // create a TwiML response object. This object helps us generate an XML
    // string that we will ultimately return as the result of this HTTP request
    var twiml = new twilio.TwimlResponse();

    // prepare the TwiML response
    twiml.message(function() {
        this.body('Trust Pound!');
        this.media('http://i.imgur.com/Act0Q.gif');
    });

    // Render an XML response
    response.type('text/xml');
    response.send(twiml.toString());
});
```
It turns out that, before we can use this, we'll need to install a program called ngrok that will expose our localhost to the outside world — and specifically our Twilio webhooks.
Install ngrok with this command (let's do it globally).

`sudo npm install -g ngrok`

Enter `ngrok 3000` (since we're using port 3000 for our app) and you should see this on your terminal screen:

![ngrok terminal output screen](http://i58.tinypic.com/2zrkry9.png)

Now go to your Twilio account page and specifically your phone number index page. Click on the number you want to use. Make sure there's a picture icon listed under the number indicating that it's MMS-enabled.
Under the "Messaging" dropdown, find the "Request URL" field and put in the (http) URL you copied from the ngrok terminal output, making sure to add /message to the end, which is the path we've told our Node server to use for receiving Twilio webhooks. Make sure to save your URL.

If you spin up the app with npm start and text your number, you should get an Adventure Time GIF in response!

## Storing Incoming Texts

Responding to texts is great — we'll definitely want to confirm submissions with a "Text received!" message — but more critical for our purposes is actually getting information from these incoming texts.

Let's add a couple of lines to our index.js so that we can parse the parameters of incoming POST requests, which is how we'll be receiving information texted to our Twilio number.
```js
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
Then let's examine the request.body object to see exactly what we can pull from the text Twilio is POST-ing us.
for (attr in request.body) {
    console.log(attr);
}
```
This is what we print out:
```
ToCountry ToState SmsMessageSid NumMedia ToCity FromZip SmsSid FromState SmsStatus FromCity Body FromCountry To ToZip MessageSid AccountSid From ApiVersion
```
`NumMedia` looks like what we want. If we try shooting another text to our Twilio number, making sure to include a picture this time, we should see an even more critical attribute, MediaUrl0. If we try logging the value of MediaURL0 we'll see the (surprise!) URL for the first picture attached to the text. It turns out Twilio hosts every picture texted to its MMS-capable numbers on a CDN (Content Delivery Network). This is great for us, since it means we don't have to worry about text blobs or any other wonky means of communicating image data — we can just pass around references to the picture's online location.

Speaking of passing around a picture's URL...

## Hooking Up socket.io

Now that we've got the URL of the pictures we're texting in to our MMS-enabled Twilio number (that in turn is communicating with our Node server via webhooks), we need to push those URLs to our client, so we can display them in a slideshow. We can do this using socket.io. Let's add a line to our index.js to support a socket.io server:
```js
var io = require('socket.io')(server);
```
Commenting out our Twilio code, we can do a simple test of our io object's `emit()` function, which communicates an event and passes associated data to each connected client, with the following snippets.
```js
function update () {
    io.emit("news", "Heya!");
}

setInterval(update, 2000);
```
And our index.html should now look like...
```html
<html>
<head>
    <title>SMS Slideshow</title>
</head>
<body>
    <h1>Hello World</h1>

<script src="https://cdn.socket.io/socket.io-1.2.0.js"></script>
<script>
  var socket = io();
  socket.on("news", function (data) {
    console.log(data);
  });
</script>


</body>
</html>
```
If we fire this up with npm start, navigate to `localhost:3000` and open up our browser console, we should see "Heya!" being logged every 2 seconds — just like we planned!

With our basic "Hello World" example out of the way, we can adapt the code to push something we actually want to our client — our pictures! Let's uncomment our Twilio webhook route and tweak things a little, changing our TwiML code to respond to texts with "Text received!" and a websocket event pushing our picture URL to the browser.
```html
// Handle an incoming request from Twilio
app.post('/message', function(request, response) {
    //create a TwiML response object. This object helps us generate an XML
    //string that we will ultimately return as the result of this HTTP request
    var twiml = new twilio.TwimlResponse();

    // prepare the TwiML response
    twiml.message(function() {
        this.body('Text received!');
    });

    console.log("Message: " + request.body.Body);
    console.log(request.body.NumMedia);

    if (request.body.NumMedia > 0) {
        io.emit("picture", request.body.MediaUrl0)
    }

    // Render an XML response
    response.type('text/xml');
    response.send(twiml.toString());
});
<html>
<head>
    <title>SMS Slideshow</title>
</head>
<body>
    <h1>Hello World</h1>


<script src="https://cdn.socket.io/socket.io-1.2.0.js"></script>
<script>
  var socket = io();
  socket.on('picture', function (data) {
    console.log(data);
  });
</script>


</body>
</html>
```
Now that our code pushes our picture URL to the client and logs it to the browser console, we can work on accomplishing something a little more useful with that information — creating an `<img>` tag to actually display the picture.

Although we could hack out creating the `<img>` tag in plain 'ol javascript, jQuery is perfect for this sort of DOM object manipulation. Searching around the web, this StackOverflow question seems to directly address our predicament. Here's our new index.html adding in a few jQuery lines to create our picture tag. I've hard-coded some dimensions for our new #slides container div just to make sure we can tell what's going on, and to give our background some color and height before we have a picture to fill it with.
```html
<html>
    <head>
        <title>SMS Slideshow</title>
        <style>

        #slides {
            height: 500px;
            width: 500px;
            background-color: gray;
        }

        img {
            height:500px;
            width:500px;
        }

        </style>
    <script src="http://code.jquery.com/jquery-latest.min.js"></script> 
    </head>
    <body>
        <h1>Hello World</h1>
        <div id="slides"></div>
        <script src="https://cdn.socket.io/socket.io-1.2.0.js"></script>
        <script>
          var socket = io();
          socket.on("picture", function (data) {
            var img = $("<img>");
            img.attr("src", data);
            img.appendTo("#slides");
            console.log(data);
          });

        </script>
    </body>
</html>
```
Putting up our script with npm start and opening up our browser to `localhost:3000` we should see our Hello World header and a dark gray square.

![blank slide](http://i59.tinypic.com/a3ffxk.png)

But if we text in a picture we'll see...

![cat slide](http://i57.tinypic.com/2e5s2mc.png)

... our extremely cute, not-as-fat-as-she-looks-here Twilio Cat Model, Ella! 

Well done Ella.

## Coding a Slideshow

There are a lot of jQuery slideshow plugins. But they don't really allow for updating on-the-fly like we want. But our needs for a slideshow are otherwise so simple — going from slide to slide, no overlaid text, no previous or next buttons — that it's easiest if we just make it ourselves.

The simplest way of going about this is using jQuery and its "nth-child()" selector to iterate through all the <img> tags we have nested under our #slides div. By changing through slides one at a time, and calculating the number of slides at each function call (properly resetting when necessary), we can ensure that all of our slides get shown. It's useful to note when you're reading the code that the first image in our slide show will always be "nth-child(1)" (and not "nth-child(0)") because of the way nth-child works.
Once we finish looping over elements with "nth-child()", all we need is to fadeIn() and fadeOut() the elements we're iterating over, separating those two functions with a delay() call. Here's our full app, starting with the index.html we've just now modified and the index.js which is just putting together everything we've already talked about.

Note that for the index.html I've added a couple of filler <img> tags so our length call won't be 0, and changed the styling to reflect our desire to make the pictures we text in full-screen, but not stretched or distorted.

The `index.html`:
```html
<html>
    <head>
        <title>SMS Slideshow</title>
        <style>
        #slides {
            height: 100%;
            width: 100%;
            margin:0;
            background-color: #4D4E53;
        }

        img {
            height: 100%;
            width: auto;
            display:none;
        }

        </style>
    <script src="http://code.jquery.com/jquery-latest.min.js"></script>
    </head>
    <body>      
        <div id="slides">
            <img src="http://cdn.wonderfulengineering.com/wp-content/uploads/2014/07/background-wallpapers-32.jpg">
            <img src="http://cdn.wonderfulengineering.com/wp-content/uploads/2014/07/background-wallpapers-26.jpg">
        </div>
        <script src="https://cdn.socket.io/socket.io-1.2.0.js"></script>
        <script>
          var socket = io();
          socket.on('picture', function (data) {
            var img = $('<img>');
            img.attr('src', data);
                img.appendTo('#slides');

                console.log(data);
          });

          $(function() {

            var images = $('#slides img').length;
            var currentImage = 0;

          function changeSlide () {
            images = $('#slides img').length;
            currentImage++;
            if (currentImage > images) {
                currentImage = 1;
            }
            $( "#slides img:nth-child(" + currentImage+ ")" ).fadeIn("fast").delay(6000).fadeOut('fast');
          }


          setInterval(changeSlide, 6000);
        });

        </script>
    </body>
</html>
```
The `index.js`:

```js
var app = require('express')();
var server = require('http').Server(app);
var twilio = require('twilio');
var bodyParser = require('body-parser');
var io = require('socket.io')(server);

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});


// Handle an incoming request from Twilio
app.post('/message', function(request, response) {
    //create a TwiML response object. This object helps us generate an XML
    //string that we will ultimately return as the result of this HTTP request
    var twiml = new twilio.TwimlResponse();

    // prepare the TwiML response
    twiml.message(function() {
        this.body('Text received!');
    });

    if (request.body.NumMedia > 0) {
        io.emit("picture", request.body.MediaUrl0)
    }

    // Render an XML response
    response.type('text/xml');
    response.send(twiml.toString());
});

server.listen(3000, function(){
  console.log('listening on port 3000');
});
```

## Parting Thoughts

That's it, we're done! Although you can go through the extra steps to deploy this app, it's also not necessary, since you could just as easily run this program on a laptop hooked up to a projector with ngrok set up and call it a day.

Sadly, the app isn't entirely free, since Twilio charges about a dollar a number, plus one cent per incoming MMS message. The confirmation texts are a fraction of a cent each but also aren't necessary, strictly speaking. Still, it's a bargain when you consider all those instant cameras it's replacing!
The next time someone in your life gets married, or you're doing another event that's social and photo-friendly, consider breaking out this little app "you brewed custom for them." It won't replace the food processor they asked for in their registry, but it might buy you enough goodwill to go with the gravy boat instead.