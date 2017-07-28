#!/bin/bash

hexo generate -f
sw-precache --config sw-config.js
cp service-worker.js public
hexo deploy