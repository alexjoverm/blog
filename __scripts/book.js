'use strict'

const { formatSeriesFromFile, insertTitle } = require('./non-hexo-utils')(hexo)
const { slugize } = require('hexo-util')
const { copyDir, readFileSync, writeFileSync, unlinkSync } = require('hexo-fs')
const { join } = require('path')

hexo.extend.console.register('book', 'Creates a book', function(args) {
  hexo.load().then(() => {
    const Post = hexo.database.model('Post')
    const bookPath = join(hexo.base_dir, 'book')
    const bookTplPath = join(hexo.base_dir, 'book-tpl')
    const seriesPath = join(hexo.base_dir, 'series')

    const summaryList = []

    const serie = formatSeriesFromFile().find(s => s.title === args._[0])
    if (!serie) {
      console.error(`The serie "${args._[0]}" doesn't exist`)
      return
    }

    // Copy Book Template to Book
    copyDir(bookTplPath, bookPath).then(() => {
      // Add title and build summaryList
      serie.posts.forEach((post, index) => {
        const p = Post.find({ title: post.title }).data[0]

        // Add title and copy file to book folder
        const initArticle = p._content.substring(0, 20)
        const file = readFileSync(p.full_source)
        const filename = p.source.split('/').pop()
        const newStr = `# ${p.title}\n`
        const pos = file.indexOf(initArticle)
        const output = [file.slice(0, pos), newStr, file.slice(pos)].join('')
        writeFileSync(join(bookPath, filename), output)

        summaryList.push(`* [${index + 1}. ${p.title}](${filename})`)
      })

      // Create README.md
      let readme = readFileSync(join(bookPath, 'README.md'))
      unlinkSync(join(bookPath, 'README.md'))
      readme = readme
        .replace('{{title}}', serie.title)
        .replace('{{description}}', serie.description)
        .replace('{{image}}', serie.imagePath)
      writeFileSync(join(bookPath, 'README.md'), readme)

      // Create SUMMARY.md
      let summary = readFileSync(join(bookPath, 'SUMMARY.md'))
      unlinkSync(join(bookPath, 'SUMMARY.md'))
      summary = summary.replace('{{list}}', summaryList.join('\n'))
      writeFileSync(join(bookPath, 'SUMMARY.md'), summary)

      // Copy series dir
      copyDir(seriesPath, join(bookPath, 'series'))
    })
  })
})
