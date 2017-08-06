#!/bin/bash

hexo clean
hexo generate -f
hexo algolia
sw-precache --config sw-config.js
cp service-worker.js public
hexo deploy