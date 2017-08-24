#!/bin/bash

hexo clean
hexo generate -f
if [[ $# -eq 1 && $1 == "algolia" ]]; then
  hexo algolia
fi
sw-precache --config sw-config.js
cp service-worker.js public
hexo deploy
