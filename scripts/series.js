"use strict"

const slugize = require("hexo-util").slugize
const fs = require("fs")
const path = require("path")

function formatSeries(locals) {
  const filtered = locals.posts.filter(post => post.serie)

  filtered.sort((l, r) => l.date < r.date)

  return filtered.reduce((acum, post) => {
    let serie = acum.find(serie => serie.name === post.serie)

    if (serie) {
      serie.posts.push(post)
    } else {
      acum.push({
        name: post.serie,
        permalink: slugize(post.serie),
        posts: [post]
      })
    }

    return acum
  }, [])
}

function getSeries() {
  const file = path.join(hexo.config.series.folder, "series.json")
  return JSON.parse(fs.readFileSync(path.resolve(process.cwd(), file)))
}

// To use from generated file
function formatSeriesFromFile(file) {
  const series = getSeries()

  return series.map(serie => {
    serie.permalink = slugize(serie.title)
    serie.date = new Date(serie.date)
    serie.imagePath = path.join(hexo.config.series.folder, serie.image)
    serie.posts = serie.posts.map(post => {
      return (
        hexo.locals.get("posts").data.find(p => p.title === post.title) || post
      )
    })
    return serie
  })
}

hexo.extend.generator.register("series", function(locals) {
  if(hexo.config.series.enabled) {
    const series = formatSeriesFromFile()

    return {
        path: "series/index.html",
        data: series,
        layout: "series"
    }
  }
})

hexo.extend.generator.register("serie", function(locals) {
  if(hexo.config.series.enabled) {
    return formatSeriesFromFile().map(serie => ({
        path: "series/" + serie.permalink + "/index.html",
        data: serie,
        layout: "serie"
    }))
  }
})

hexo.extend.generator.register("serie-img", function(locals) {
  if(hexo.config.series.enabled) {
    return formatSeriesFromFile().map(serie => ({
        path: "series/" + serie.image,
        data() {
        return fs.createReadStream(
            path.join(hexo.config.series.folder, serie.image)
        )
        }
    }))
  }
})

hexo.extend.filter.register("before_post_render", function(currentPost) {
  if(hexo.config.series.enabled) {
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

hexo.extend.helper.register("end_post", function(post) {
  const hashtags = encodeURIComponent(post.tags.data.map(t => t.name).join(','))
  const text = encodeURIComponent(post.title)
  const url = post.permalink
  const via = encodeURIComponent('alexjoverm')
  const uri = `https://twitter.com/intent/tweet?text=${text}&url=${url}&hashtags=${hashtags}&via=${via}`

  return `
    <p><a class="twitter-share-button"
  href="${uri}">Tweet</a></p>

    <p>If you like it, please go and share it!
    You can follow me <a href="https://egghead.io/instructors/alex-jover-morales">recording videos on Egghead</a>
    or on twitter as <a href="https://twitter.com/alexjoverm">@alexjoverm</a>. Any questions? Shoot!</p>
  `
})

hexo.extend.helper.register("posts_in_same_serie", function(currentPost) {
    let result = ""

    if (hexo.config.series.enabled && currentPost.serie) {
        const serie = formatSeriesFromFile().find(
        s => s.title === currentPost.serie.title
        )
        const posts = serie.posts

        result = `
            <div class="post-serie">
                <header>
                    <span class="serie-badge">Serie</span>
                    <a href="${serie.permalink}" alt="${serie.title}">
                        ${serie.title}
                    </a>
                </header>

                <ol class="post-list">
                    ${posts.map(post => `
                        <li ${isSamePost(post, currentPost) && 'class="current"'}>
                            ${post.permalink && !isSamePost(post, currentPost) ? `
                                <a href="${isDevMode() ? '/' + post.path : post.permalink}" alt="${post.title}">
                                    ${post.title}
                                </a>
                            `: post.title}
                        </li>`
                    ).join('')}
                </ol>
            </div>
        `
    }

    return result
})

function isSamePost(p, c) {
    return p.title === c.title
}

function isDevMode() {
  return process.argv.indexOf("server") > -1 || process.argv.indexOf("s") > -1
}
