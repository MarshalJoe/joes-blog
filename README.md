# Blog

[My Blog](http://joecmarshall.com) is a fork and repurposing of [Blake Embrey's](https://github.com/blakeembrey) original personal blog repo. He has since migrated his site to [Gatsby](https://www.gatsbyjs.org/).

I am developer and writer with particular interests in Functional Programming, Serverless Architecture, Python, Cybersecurity / Infosec, Literary Criticism, TV, and craft beer. 

## Setup

Set up Node dependencies in the usual fashion.

`npm install`

You'll also want access to Fabric's `fab` binary to use the deployment system I've set up here.

`pip install fabric`

## Usage

To create a new article, create two nested folders, corresponding to the current year and month under `src/articles`, then create a directory within that named whatever you want your uri to be, with an `index.md` markdown file inside it. That directory will be used to construct the title portion of the full permalink.

So for a blog post written on April 5th, 2017, you would structure the directory like this:

```
src/articles/2017/4/some-uri/index.md
```

And that would generate a realtive link to `/articles/2017/4/some-uri/`

## Formatting Metadata

Your `index.md` should be a YAML file with front-matter key-value pair template variables

```
---
title: <Some sentence description>
date: <YYYY-MM-DD HH:MM>
author: <NAME>
layout: article.pug
---

some *markdown* content
```

Each key-value pair is required.

## Development

During development, you can build the blog using `fab build`. This will run `build.js` and generate the full static site under the `build` directory.

```
fab build
```

To preview how the static site will be rendered via `localhost`:

```
fab preview
```

To watch for changes and kick off new builds when you're making local edits:

```
fab watch
```

And to deploy to S3:

```
fab deploy
```

To keep credentials out of the source code and keep the code succinct I use Fabric's `local()` function to simply call the [AWS command line interface](https://aws.amazon.com/cli/) that's present in my local shell in order to deploy.

## License

All code is under the [MIT](https://opensource.org/licenses/MIT) open source license. I reserve the original copyright for all the blog posts and article content.