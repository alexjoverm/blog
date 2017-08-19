---
title: Enhance Jest configuration with Module Aliases
tags:
  - VueJS
  - JavaScript
  - Testing
description: Learn how to use Module Aliases Jest configuration to avoid using relative paths
---

Learn how to use Module Aliases Jest configuration to avoid using relative paths.

<!-- more -->

[Webpack aliases](https://webpack.js.org/configuration/resolve/#resolve-alias) give us a very comfortable way to deal with the relative path dots hell, such:

```javascript
import SomeComponent from '../../../../components/SomeComponent'
```

The project has already a `@` alias in `build/webpack.base.conf.js`, pointing to `src` folder. So with that we can write the previous import as:

```javascript
import SomeComponent from '@/components/SomeComponent'
```

Jest out of the box doesn't understand that, since it is a Webpack feature. But Jest provide us a way to do it using `moduleNameMapper` option. So go to `package.json` and add the following to the `jest` configuration:

```json
"jest": {
    "moduleNameMapper": {
      "@\/([^\\.]*).vue$": "<rootDir>/src/$1.vue",
      "@\/([^\\.]*)$": "<rootDir>/src/$1.js",
      "^vue$": "vue/dist/vue.common.js"
    },
```

With `"@\/([^\\.]*).vue$": "<rootDir>/src/$1.vue"` we are telling Jest to map any module starting by `@` and ending with `.vue` to the same path under `src` folder. So:

```javascript
import X from "@/anyfolder/anymorefolder/X.vue"
// Will map to: "/src/anyfolder/anymorefolder/X.vue"
```

And with `"@\/([^\\.]*)$": "<rootDir>/src/$1.js"`, the same, but modules without extension will map it to a `js` file:

```javascript
import X from "@/anyfolder/X"
// Will map to: "/src/anyfolder/X.js"
```

Make sure you import the Vue components using the extension `.vue` explicitly, both in `test` and in `src`, otherwise Jest will not find them and tests will not pass.

Now you can make the following changes:

```javascript
// In src/App.vue
// import MessageList from './components/MessageList'
import MessageList from '@/components/MessageList.vue'

// In test/MessageList.test.js
// import MessageList from '../src/components/MessageList'
import MessageList from '@/components/MessageList.vue'
```

And the same everywhere if you wanna apply Module Aliases.

Find the [full example on Github](https://github.com/alexjoverm/vue-testing-series/tree/lesson-1)