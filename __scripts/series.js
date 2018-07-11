'use strict'

const slugize = require('hexo-util').slugize
const fs = require('fs')
const path = require('path')
const {
  formatSeriesFromFile,
  getSeries,
  isSamePost,
  isDevMode
} = require('./non-hexo-utils')(hexo)

hexo.extend.generator.register('series', function(locals) {
  if (hexo.config.series.enabled) {
    const series = formatSeriesFromFile()

    return {
      path: 'series/index.html',
      data: series,
      layout: 'series'
    }
  }
})

hexo.extend.generator.register('serie', function(locals) {
  if (hexo.config.series.enabled) {
    return formatSeriesFromFile().map(serie => ({
      path: 'series/' + serie.permalink + '/index.html',
      data: serie,
      layout: 'serie'
    }))
  }
})

hexo.extend.generator.register('serie-img', function(locals) {
  if (hexo.config.series.enabled) {
    return formatSeriesFromFile().map(serie => ({
      path: 'series/' + serie.image,
      data() {
        return fs.createReadStream(
          path.join(hexo.config.series.folder, serie.image)
        )
      }
    }))
  }
})

hexo.extend.filter.register('before_post_render', function(currentPost) {
  if (hexo.config.series.enabled) {
    const series = getSeries()

    series.forEach(serie =>
      serie.posts.forEach(post => {
        if (post.title === currentPost.title) {
          currentPost.serie = serie
        }
      })
    )
  }
})

hexo.extend.helper.register('posts_in_same_serie', function(currentPost) {
  let result = ''

  if (hexo.config.series.enabled && currentPost.serie) {
    const serie = formatSeriesFromFile().find(
      s => s.title === currentPost.serie.title
    )

    if (serie) {
      const posts = serie.posts

      result = `
              <div class="post-serie">
                  <header>
                      <span class="serie-badge">Serie</span>
                      <a href="/series/${serie.permalink}" alt="${serie.title}">
                          ${serie.title}
                      </a>
                  </header>

                  <ol class="post-list">
                      ${posts
                        .map(
                          post => `
                          <li ${isSamePost(post, currentPost) &&
                            'class="current"'}>
                              ${post.permalink && !isSamePost(post, currentPost)
                                ? `
                                  <a href="${isDevMode()
                                    ? '/' + post.path
                                    : post.permalink}" alt="${post.title}">
                                      ${post.title}
                                  </a>
                              `
                                : post.title}
                          </li>`
                        )
                        .join('')}
                  </ol>
              </div>
          `
    }
  }

  return result
})
