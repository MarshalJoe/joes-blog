# Blog

[My Blog](http://joecmarshall.com) is a fork and repurposing of Blake Embrey's original repo, which you can find [here](https://github.com/blakeembrey).

I am developer and writer with particular interests in Functional Programming, Serverless Architecture, Python, Cybersecurity / Infosec, Literary Criticism, TV, and craft beer. 

## Setup

Set up Node dependencies in the usual fashion.

`npm install`

You'll also want access to Fabric's `fab` binary to use the deployment system I've set up here.

`pip install fabric`

## Usage

To create a new article, create the corresponding year and month folder under `src/articles`, then create a directory with the post inside of it with an `index.md` markdown file inside it. That directory will be used to construct the full permalink.

So for a blog post written on April 5th, 2017, you would structure the directory like so:

```
src/
	articles/
		2015/
		2016/
		2017/
			1/
			2/
			3/
			4/
				some-uri/
					index.md
```

And that would generate a realtive link to `/articles/2017/4/some-description/`

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

To keep credentials out of the source code and keep the code succinct I use Fabric's `local()` function to simply call the [AWS command line interface](https://aws.amazon.com/cli/) present in my local shell for deployment.

## License

MIT