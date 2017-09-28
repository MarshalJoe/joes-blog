var metalsmith = require('metalsmith')
var drafts = require('metalsmith-drafts')
var define = require('metalsmith-define')
var layouts = require('metalsmith-layouts')
var markdown = require('metalsmith-markdown')
var permalinks = require('metalsmith-permalinks')
var collections = require('metalsmith-collections')
var date = require('metalsmith-build-date')
var redirect = require('metalsmith-redirect')
var autoprefixer = require('metalsmith-autoprefixer')
var css = require('metalsmith-clean-css')
var fingerprint = require('metalsmith-fingerprint')
var each = require('metalsmith-each')

metalsmith(__dirname)
  .source('src')
  .use(define({
    blog: {
      url: 'http://joecmarshall.com',
      title: 'Joe Marshall | Developer ',
      description: 'Developer, Writer, Human Person'
    },
    googleAnalytics: "UA-105604576-1",
    owner: {
      url: 'http://joecmarshall.com',
      name: 'Joe Marshall'
    },
    moment: require('moment')
  }))
  .use(collections({
    articles: {
      pattern: 'articles/**/*.md',
      sortBy: 'date',
      limit:15,
      reverse: true
    }
  }))
  .use(markdown({
    gfm: true,
    tables: true,
    highlight: require('highlighter')()
  }))
  .use(date())
  .use(drafts())
  .use(permalinks())
  .use(autoprefixer())
  .use(css({
    files: '**/*.css',
    cleanCSS: {
      rebase: true
    }
  }))
  .use(fingerprint({
    pattern: '{css,vendor}/**/*'
  }))
  .use(layouts({
    engine: 'pug',
    directory: 'layouts'
  }))
  .use( // basic tests to check for proper formatting, required metadata in YAML article frontmatter
    each(function (file, filename) {
        if (filename.includes('html') && filename.includes('articles')) {
          if (!file['title']) throw('title missing - ' + filename);
          if (!file['author']) throw('author missing - ' + filename);
          if (!file['date']) throw('date missing - ' + filename);
          if (!file['layout']) throw('layout missing - ' + filename);
        }
      }
    ))
  .destination('build')
  .build(function (err) {
    if (err) {
      throw err
    }

    console.log("Joe's Blog build completed!")
  })
