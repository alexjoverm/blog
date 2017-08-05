'use strict';

const slugize = require('hexo-util').slugize
const fs = require('fs')
const path = require('path')

function formatSeries(locals) {
  const filtered = locals.posts
    .filter(post => post.serie)

    filtered.sort((l, r) => l.date < r.date)

    return filtered.reduce((acum, post) => {
      let serie = acum.find(serie => serie.name === post.serie)

      if (serie) {
        serie.posts.push(post)
      } else {
        acum.push({ name: post.serie, permalink: slugize(post.serie), posts: [post] })
      }

      return acum
    }, [])
}

// To use from generated file
function formatSeriesFromFile(file) {
    const series = JSON.parse(fs.readFileSync(
        path.resolve(process.cwd(), file)
    ))

    return series.map(serie => {
        serie.permalink = slugize(serie.title)
        serie.date = new Date(serie.date)
        serie.imagePath = path.join(hexo.config.series.folder, serie.image)
        serie.posts = serie.posts.map(post => {
            return hexo.locals.get('posts').data.find(p => p.title === post.title) || post
        })
        return serie
    })
}

hexo.extend.generator.register('series', function(locals) {
  const series = formatSeriesFromFile(path.join(hexo.config.series.folder, 'series.json'))

  return {
    path: 'series/index.html',
    data: series,
    layout: 'series'
  }
})

hexo.extend.generator.register('serie', function(locals) {
  return formatSeriesFromFile(path.join(hexo.config.series.folder, 'series.json'))
    .map(serie => ({
        path: 'series/' + serie.permalink + '/index.html',
        data: serie,
        layout: 'serie'
    }))
})

hexo.extend.generator.register('serie-img', function(locals) {
  return formatSeriesFromFile(path.join(hexo.config.series.folder, 'series.json'))
    .map(serie => ({
        path: 'series/' + serie.image,
        data () {
            return fs.createReadStream(path.join(hexo.config.series.folder, serie.image))
        }
    }))
})

hexo.extend.filter.register('before_post_render', function(postInfo) {
    var config = hexo.config.post_series || {};
    var posts = hexo.locals.get('posts');

    var postsInSameSeries = posts.data.reduce(function(result, post) {
        if (post.series && post.series === postInfo.series) {
            result.push({
                'id' : post.id,
                'title' : post.title,
                'path' : post.path,
                'permalink' : post.permalink,
                'date' : post.date
            });
        }
        return result;
    }, []);

    postsInSameSeries.sort(function(left, right) {
        if (config.reverse_sort) {
            return left.date < right.date;
        }
        return left.date > right.date;
    });

    postInfo.postsInSameSeries = postsInSameSeries;
});

hexo.extend.tag.register('posts_in_same_series', function (args) {
    var postInfo = this;

    if (postInfo.postsInSameSeries.size === 0) {
        return '';
    }

    var config = hexo.config.post_series;

    var postSeriesHtmlSegments = ['<div class="post-series">'];
    if (config.list_title) {
        postSeriesHtmlSegments = postSeriesHtmlSegments.concat([ '<div class="post-series-title">', config.list_title, '</div>' ]);
    }
    postSeriesHtmlSegments.push('<ul class="post-series-list">');

    postInfo.postsInSameSeries.reduce(function(result, post) {
        result.push('<li class="post-series-list-item"><a href="');
        result.push(isRunningInLocalServerMode() ? '/' + post.path : post.permalink);
        result.push(config.open_in_new_tab ? '" target="_blank">' : '">');
        result.push(post.title);
        result.push('</a></li>');
        return result;
    }, postSeriesHtmlSegments);

    postSeriesHtmlSegments.push('</ul></div>');

    var postSeriesHtml = postSeriesHtmlSegments.join('');
    return postSeriesHtml;
});

function isRunningInLocalServerMode() {
   return process.argv.indexOf('server') > -1 || process.argv.indexOf('s') > -1;
}
