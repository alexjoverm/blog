---
title: >-
  Test Computed Properties and Watchers in Vue.js Components with
  Jest
tags:
  - VueJS
  - JavaScript
  - Testing
description: Learn about testing the Computed Properties and Watchers reactivity in Vue.js.
---

Learn about testing Computed Properties and Watchers reactivity in Vue.js.

<!-- more -->

There is not much to test in the state, since is just data at a given time. So we'll test its value along the way while making tests.

## Computed Properties

<!-- Example of passing a property, changing it with `setProp` and test it -->

Computed properties are simple reactive functions that return data in another form. They behave exactly like the language standard `get/set` properties:

```javascript
class X {
  ...

  get fullName() {
    return `${this.name} ${this.surname}`
  }

  set fullName() {
    ...
  }
}
```

In fact, when you're building class based Vue components, as I explain in my [Egghead course "Use TypeScript to Develop Vue.js Web Applications"](https://egghead.io/courses/use-typescript-to-develop-vue-js-web-applications), you'll write it just like that. If you're using plain objects, it'd be:

```javascript
export default {
  ...
  computed: {
    fullName() {
      return `${this.name} ${this.surname}`
    }
  }
}
```

And you can even add the `set` as follows:

```javascript
computed: {
    fullName: {
      get() {
        return `${this.name} ${this.surname}`
      },
      set() {
        ...
      }
    }
  }
```

### Testing Computed Properties

Testing a computed property is very simple, and probably sometimes you don't test a computed property exclusively, but test it as part of other tests. But most times it's good to have a test for it, whether that computed property is cleaning up an input, or combining data, we wanna make sure things work as intended. So let's begin.

First of all, create a `Form.vue` component:

```html
<template>
  <div>
    <form action="">
      <input type="text" v-model="inputValue">
      <span class="reversed">{{ reversedInput }}</span>
    </form>
  </div>
</template>

<script>
export default {
  props: ['reversed'],
  data: () => ({
    inputValue: ''
  }),
  computed: {
    reversedInput() {
      return this.reversed ?
        this.inputValue.split("").reverse().join("") :
        this.inputValue
    }
  }
}
</script>
```

It will show an input, and next to it the same string but reversed. It's just a silly example, but enough to test it.

Now add it to `App.vue`, put it after the `MessageList` component, and remember to import it and include it within the `components` component option. Then, create a `test/Form.test.js` with the usual bare-bones we've used in other tests:

```javascript
import { shallow } from 'vue-test-utils'
import Form from '../src/components/Form'

describe('Form.test.js', () => {
  let cmp

  beforeEach(() => {
    cmp = shallow(Form)
  })
})
```

Now create a test suite with 2 test cases:

```javascript
describe('Properties', () => {
  it('returns the string in normal order if reversed property is not true', () => {
    cmp.vm.inputValue = 'Yoo'
    expect(cmp.vm.reversedInput).toBe('Yoo')
  })

  it('returns the reversed string if reversed property is true', () => {
    cmp.vm.inputValue = 'Yoo'
    cmp.setProps({ reversed: true })
    expect(cmp.vm.reversedInput).toBe('ooY')
  })
})
```

We can access the component instance within `cmp.vm`, so we can access the internal state, computed properties and methods. Then, to test it is just about changing the value and making sure it returns the same string when reversed is false.

For the second case, it would be almost the same, with the difference that we must set the `reversed` property to true. We could navigate through `cmp.vm...` to change it, but vue-test-utils give us a helper method `setProps({ property: value, ... })` that makes it very easy.

That's it, depending on the computed property it may need more test cases.













