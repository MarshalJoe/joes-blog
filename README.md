# Blog

[My Blog](http://joecmarshall.com). 

## Setup

`npm install`

## Usage

To create a new article, create the corresponding year and month folder under `src/articles`, then create a directory with the post inside of it with an `index.md` markdown file inside it. That directory will be used to construct the full permalink.

So for a network outage that occurred on April 5th, 2017, you would structure the directory like so:

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

And that would generate a realtive link to `/articles/2017/4/some-outage-description/`

## Formatting notifications

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
Each variable is necessary and must be filled out. The author is not displayed on the site, but kept for internal purposes.

It's also important to include the time in the current format. If a specific time can't be attributed to the incident, please still use a placeholder like `12:00`

## Development

During development, you can build the blog using `fab build`. This will run `build.js` and generate the full static site under the `build` directory.

```
fab build
```

To preview how the static site will be rendered via `localhost`, enter `fab preview`.

```
fab preview
```

To watch for changes and kick off new builds when you're making local edits use `fab watch`

```
fab watch
```

To deploy to S3

```
fab deploy
```


## License

MIT