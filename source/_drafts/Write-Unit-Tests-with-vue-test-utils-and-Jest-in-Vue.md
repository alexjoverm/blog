---
title: Write Unit Tests with the official Vue.js testing tools and Jest
tags:
  - VueJS
  - JavaScript
  - Testing
description: Learn how to write unit tests for VueJS components with the official tools and the Jest framework.
---

Learn how to write unit tests with the official VueJS tools and the Jest framework.

<!-- more -->

[vue-test-utils](https://github.com/vuejs/vue-test-utils), the official VueJS testing library and based on [avoriaz](https://github.com/eddyerburgh/avoriaz), is just around the corner. [@EddYerburgh](https://twitter.com/EddYerburgh) is indeed doing a very good job creating it. It provides all necessary tooling for making easy to write unit test in a VueJS application.

[Jest](https://facebook.github.io/jest), on the other side, is the testing framework developed at Facebook, which makes testing a breeze, with awesome features such as:

 - Almost no config by default
 - Very cool interactive mode
 - Run tests in parallel
 - Spies, stubs and mocks out of the box
 - Built in code coverage
 - Snapshot testing
 - Module mocking utilities

Probably you've already written test without this tools, and just by using karma + mocha + chai + sinon + ..., but you'll see how much easier it can be 😉.

## Set up a vue-test sample project

Let's start by creating a new project using [`vue-cli`](https://github.com/vuejs/vue-cli) answering NO to all yes/no questions:

```bash
npm install -g vue-cli
vue init webpack vue-test
cd vue-test
```

Then we'll need to install the dependencies:

```bash
# Install dependencies
npm i -D jest vue-test-utils jest-vue-preprocessor babel-jest
```

[`jest-vue-preprocessor`](https://github.com/vire/jest-vue-preprocessor) is needed for making jest understand `.vue` files, and [`babel-jest`](https://github.com/babel/babel-jest) for the integration with Babel.

Finally, let's add the following Jest configuration in the `package.json`:

```json
...
"jest": {
  "moduleNameMapper": {
    "^vue$": "vue/dist/vue.common.js"
  },
  "moduleFileExtensions": [
    "js",
    "vue"
  ],
  "transform": {
    "^.+\\.js$": "<rootDir>/node_modules/babel-jest",
    ".*\\.(vue)$": "<rootDir>/node_modules/jest-vue-preprocessor"
  }
}
...
```

`moduleFileExtensions` will tell Jest which extensions to look for, and `transform` which preprocessor to use for a file extension

## Testing a Component

We'll be using Single File Components here, and I haven't checked if it works by splitting them in their own `html`, `css` or `js` files, so let's assume you're doing that as well.



### What is Shallow Rendering?

[Shallow Rendering](http://airbnb.io/enzyme/docs/api/shallow.html) is a technique that assures your component is rendering without children. This is useful for:

 - Testing only the component you want to test (that's what Unit Test stands for)
 - Avoid side effects that children components can have, such as making HTTP calls, calling store actions...

For more info, [this article](http://engineering-blog.alphasights.com/testing-react-components-with-shallow-rendering/) explains it quite well.

## Testing a Component with vue-test-utils



-------- PROBABLY ADD A PART 2 --------

## Adding Module Aliases to Jest

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

## Mock Dependencies in Jest

