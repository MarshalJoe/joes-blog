---
title: A Brief Illustration of Functional Programming
date: 2017-09-26 18:00
author: Joe Marshall
layout: article.pug
---

[Functional Programming](https://en.wikipedia.org/wiki/Functional_programming) is a powerful programming paradigm that tries to reduce bugs and make it easier to reason about an application by avoiding state changes and the mutation of global values, generally. 

In software coded using functional programming patterns, all functions can be understood by the arguments passed to them as parameters. There is no reliance on the instance variables of the class (like in [Object-Oriented Programming](https://en.wikipedia.org/wiki/Object-oriented_programming) (OOP) patterns) or some other state-dependent variable modified through assignment in runtime by the source code (like in [Imperative Programming](https://en.wikipedia.org/wiki/Imperative_programming)).

For languages built around expressly supporting it, functional programming (FP) can be a powerful tool. [Elixir](https://elixir-lang.org/) uses FP to cleanly execute massively concurrent processes: Because each function returns a value explicitly dependent on the arguments passed to it, with no reference to a global state, no function in an Elixir application "needs to know" anything more than the information already contained in its arguments.

That's one reason Elixir and OTP apps (a popular Elixir application design pattern) scale so well. Executing a function once is the same as executing it a thousand times concurrently, because there's no threat of race conditions or unwanted "[side effects](https://en.wikipedia.org/wiki/Side_effect_(computer_science))", because none of the functions ever share the same state - meaning they never have to depend on order-of-execution or some sort of global reference. As purely FP functions *if they're passed the right arguments, they'll produce the right response*.

FP is great in languages that explicitly support it, but it can also be used in languages not necessarily built around the paradigm to reduce complexity and write cleaner code. I'll be implementing a simple example in [Python](https://www.python.org/) even though Python is more of an OOP language, because in certain cases it still makes sense.

Also, I'm a rebel.

## The Movie Database (TMDB) API

I'm currently working on a [Jupyter notebook](http://jupyter.org/) meant for analyzing film data from the past 20 years, as part of the research I'm doing for a pop culture article.

For the function in question, I want to use The Movie Database free API to return all the unique `id`s associated with the films released in a particular year, passing the year as an argument and returning an array of `id`s corresponding to the films released that year. I can then use those `id`s to get more granular information about each movie, like the budget, audience popularity, or casting info.

## Setup

First let's set up the dependencies. To simplify things I'm going to use the `tmdbsimple` [python module](https://github.com/celiao/tmdbsimple/), which is a one-to-one wrapper for the TMDB API, representing the same methods in the official documentation. Let's start this notebook cell / script by `import`ing the module and setting the API key:

```python
import tmdbsimple as tmdb

tmdb.API_KEY='<SOME_API_KEY>'
```

The TMDB documentation says that, to discover the films released in a particular year, we'll want to use the `Discover` method, passing in a key-value pair specifying the `primary_release_year` we want to pull films from. Here's what the code looks like, passing in `2016` as an integer:

```python
discover = tmdb.Discover()
response = discover.movie(primary_release_year=2016)
```

Easy enough. Here's the response returned (Note that I've removed all but one of the movie objects returned in the `results` array to clarify the structure):

```python
{'page': 1, 'total_results': 11986, 'total_pages': 600, 'results': [{'vote_count': 11047, 'id': 293660, 'video': False, 'vote_average': 7.4, 'title': 'Deadpool', 'popularity': 640.193524, 'poster_path': '/inVq3FRqcYIRl2la8iZikYYxFNR.jpg', 'original_language': 'en', 'original_title': 'Deadpool', 'genre_ids': [28, 12, 35], 'backdrop_path': '/n1y094tVDFATSzkTnFxoGZ1qNsG.jpg', 'adult': False, 'overview': 'Deadpool tells the origin story of former Special Forces operative turned mercenary Wade Wilson, who after being subjected to a rogue experiment that leaves him with accelerated healing powers, adopts the alter ego Deadpool. Armed with his new abilities and a dark, twisted sense of humor, Deadpool hunts down the man who nearly destroyed his life.', 'release_date': '2016-02-09'}]}
```

Even though we're returning more movies than are included here, we can see in the `page` and `total_pages` keys that TMDB breaks its more extensive data into chunks. We need a function that can cleanly and directly paginate through all the necessary pages to aggregate the data we want. Let's take our initial crack at a function wrapper doing just that.

## The Code

Let's look at what the most basic function would be - returning a single page's worth of movies.

```python
def get_movies_by_year(year):
    movie_ids = []
    discover = tmdb.Discover()
    response = discover.movie(primary_release_year=year)
    for movie in response['results']:
        movie_ids.append(movie['id'])
    return movie_ids
```

But this'll just get us the first page. Using the TMDB API, we can also specific the page of results we want to return (for more fine grained control)...

```python
def get_movies_by_year(year, page):
    movie_ids = []
    discover = tmdb.Discover()
    response = discover.movie(primary_release_year=year, page=page)
    for movie in response['results']:
        movie_ids.append(movie['id'])
    return movie_ids
```

... but this has its own problems. Though we could add logic around the context of the function's execution, pulling out the current page and the total number of pages, iterating up through a loop until we pulled everything we wanted, that would be *ugly*. We want to do all this within the function itself. After all, it has all the information in the `response` object we need to iterate through the necessary pages.

The answer: recursion!

```python
def get_movies_by_year(year, page):
    movie_ids = []
    discover = tmdb.Discover()
    response = discover.movie(primary_release_year=year, page=page)
    for movie in response['results']:
        movie_ids.append(movie['id'])
    return movie_ids
```


