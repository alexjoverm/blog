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