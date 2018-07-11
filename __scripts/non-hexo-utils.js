const slugize = require('hexo-util').slugize
const fs = require('fs')
const path = require('path')

const funcs = {
  insertTitle(title, source) {
    let pos = [],
      i = -1
    while ((i = source.indexOf(/^---$/, i + 1) > -1)) pos.push(i)
    console.log(pos)
  },
  getSeries() {
    const file = path.join(hexo.config.series.folder, 'series.json')
    return JSON.parse(fs.readFileSync(path.resolve(process.cwd(), file)))
  },

  isSamePost(p, c) {
    return p.title === c.title
  },

  isDevMode() {
    return process.argv.indexOf('server') > -1 || process.argv.indexOf('s') > -1
  },

  // To use from generated file
  formatSeriesFromFile() {
    const series = funcs.getSeries()

    return series
      .map(serie => {
        serie.permalink = slugize(serie.title)
        serie.date = new Date(serie.date)
        serie.imagePath = path.join(hexo.config.series.folder, serie.image)
        serie.posts = serie.posts.map(post => {
          return (
            hexo.locals.get('posts').data.find(p => p.title === post.title) ||
            post
          )
        })
        return serie
      })
      .filter(serie => serie.published !== false)
  }
}

module.exports = function(a) {
  hexo = a
  return funcs
}
