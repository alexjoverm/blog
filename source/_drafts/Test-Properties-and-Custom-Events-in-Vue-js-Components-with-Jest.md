---
title: Test Properties and Custom Events in Vue.js Components with Jest
tags:
  - VueJS
  - JavaScript
  - Testing
description: Properties and Custom Events are the communication wires of Vue.js Component.
---



<!-- more -->

Properties are custom attributes passed from parent to child components. Custom events solve just the opposite, they send data out to the direct parent via an event. They both combined are the wires of interaction and communication in Vue.js components.

In Unit Testing, testing the in and outs (properties and custom events) means to test how a component behaves when it receives and sends out data in isolation. Let's get our hands dirty!

## Properties

When we are testing component properties, we can test how the component behave when we pass them certain properties. But before going on, an important note:

> To pass properties to components, use `propsData`, and not `props`. The last one is to define properties, not to pass them data.

First create a `Message.test.js` file and add the following code:

```javascript
describe('Message.test.js', () => {
  let cmp

  describe('Properties', () => {
    // @TODO
  })
})
```

We group test cases within a `describe` expression, and they can be nested. So we can use this strategy to group the tests for properties and events separately.

Then we'll create a helper factory function to create a message component, give some properties

```javascript
const createCmp = propsData => mount(Message, { propsData })
```

### Testing property existence

Two obvious things we can test is that a property exists, or it doesn't. Remember that the `Message.vue` component has a `message` property, so let's assert that it receives correctly that property. vue-test-utils comes with a `hasProp(prop, value)` function, which is very handy for this case:

```javascript
it('has a message property', () => {
  cmp = createCmp({ message: 'hey' })
  expect(cmp.hasProp('message', 'hey')).toBeTruthy()
})
```

The properties behave in a way that they will be received only if they're declared in the component. Meaning that if we pass a **property that is not defined, it won't be received**. So to check for the no existence of a property, the same test as above with another property should return `false`:

```javascript
it('has no cat property', () => {
  cmp = createCmp({ cat: 'hey' })
  expect(cmp.hasProp('cat', 'hey')).toBeFalsy()
})
```

We can test the **default value** as well. Go to `Message.vue` and change the props as follows:

```javascript
props: {
  message: String,
  author: {
    type: String,
    default: 'Paco'
  }
},
```

Then the test could be:

```javascript
it('Paco is the default author', () => {
  cmp = createCmp({ message: 'hey' })
  expect(cmp.hasProp('author', 'Paco')).toBeTruthy()
})
```

### Asserting properties validation

Properties can have validation rules, ensuring that a property is required or it is of a determined type. Let's write the `message` property as follows:

```javascript
props: {
  message: {
    type: String,
    required: true
  }
}
```

Going further, you could use custom constructors types or custom validation rules, as you can see in [the docs](https://vuejs.org/v2/guide/components.html#Prop-Validation). Don't do this right now, I'm just showing it as an example:

```javascript
class Message {}
...
props: {
  message: {
    type: Message, // It's compared using instance of
    required: true,
    validator(message) {
      return message.someProp > 1
    }
  }
}
```

Whenever a validation rule is not fulfilled, Vue shows a console.error. For example, for `createCmp({ message: 1 })`, the next error will be shown:

```
[Vue warn]: Invalid prop: type check failed for prop "message". Expected String, got Number.
(found in <Root>)
```

By the date of writing, vue-test-utils doesn't have any utility to test this. But we can access the `vm.$option` ourselves. In there we'll found the expanded proper:

```javascript
it('message is of type string', () => {
  let spy = jest.spyOn(console, 'error')
  cmp = createCmp({ message: 1 })
  expect(spy).toBeCalled()

  spy.mockReset() // or mockRestore() to completely remove the mock
})
```

Be aware to call `spy.mockReset()` at the end of the test, so following tests don't share the state of the spy.

We could be more specific in the tests, so we can ensure that it's a Vue property error:

```javascript
it('message is of type string', () => {
  let spy = jest.spyOn(console, 'error')
  cmp = createCmp({ message: 1 })
  expect(spy).toBeCalledWith(expect.stringContaining('[Vue warn]: Invalid prop'))

  spy.mockReset()
})
```

With `expect.stringContaining` we can pass a substring to match against. This way we're ensuring it's a `[Vue warn]: Invalid prop` error.

Let's test as well that the property is required, and that it passes validity when everything is correct. Also, we could refactor de spy creation/reset on the `afterEach` hook, wrapping it into another nested `describe`. The whole test suite is:

```javascript
describe('Message.test.js', () => {
  ...
  describe('Properties', () => {
    ...
    describe('Validation', () => {
      let spy = jest.spyOn(console, 'error')

      afterEach(() => spy.mockReset())

      it('message is of type string', () => {
        cmp = createCmp({ message: 1 })
        expect(spy).toBeCalledWith(expect.stringContaining('[Vue warn]: Invalid prop'))
      })

      it('message is required', () => {
        cmp = createCmp()
        expect(spy).toBeCalledWith(expect.stringContaining('[Vue warn]: Missing required prop'))
      })

      it('message is OK when called with expected props', () => {
        cmp = createCmp({ message: 'hey' })
        expect(spy).not.toBeCalled()
      })
    })
  ...
```

## Custom Events

We can test at least two things in Custom Events:

 - Asserting that after an action an event gets triggered
 - Checking what an event listener calls when it gets triggered

Which in the case of the `MessageList.vue` and `Message.vue` components example, that gets translated to:

 - Assert that `Message` components triggers a `message-clicked` when a message gets clicked
 - Check in `MessageList` that when a `message-clicked` happens, a `handleMessageClick` function is called

First, go to `Message.vue` and use `$emit` to trigger that custom event:

```html
<template>
    <li
      style="margin-top: 10px"
      class="message"
      @click="handleClick">
        {{message}}
    </li>
</template>

<script>
  export default {
    name: 'Message',
    props: ['message'],
    methods: {
      handleClick() {
        this.$emit('message-clicked', this.message)
      }
    }
  }
</script>
```

And in `MessageList.vue`, handle the event using `@message-clicked`:

```html
<template>
    <ul>
        <Message
          @message-clicked="handleMessageClick"
          :message="message"
          v-for="message in messages"
          :key="message"/>
    </ul>
</template>

<script>
import Message from './Message'

export default {
  name: 'MessageList',
  props: ['messages'],
  methods: {
    handleMessageClick(message) {
      console.log(message)
    }
  },
  components: {
    Message
  }
}
</script>
```

Now it's time to write a unit test. Create a nested describe within the `test/Message.spec.js` file and prepare the barebones of the test case _"Assert that `Message` components triggers a `message-clicked` when a message gets clicked"_ that we mentioned before:

```javascript
...
describe('Message.test.js', () => {
  ...
  describe('Events', () => {
    beforeEach(() => {
      cmp = createCmp({ message: 'Cat' })
    })

    it('calls handleClick when click on message', () => {
      // @TODO
    })
  })
})
```

### Testing the Event Click calls a method handler

The first thing we can test is that when clicking a message, the `handleClick` function gets called. For that we can use a `trigger` of the wrapper component, and a jest spy using `spyOn` function:

```javascript
it('calls handleClick when click on message', () => {
  const spy = spyOn(cmp.vm, 'handleClick')
  cmp.update() // Forces to re-render, applying changes on template

  const el = cmp.find('.message').trigger('click')
  expect(cmp.vm.handleClick).toBeCalled()
})
```

>See the `cmp.update()`? When we change things that are used in the template, `handleClick` in this case, and we want the template to apply the changes, we need to use the `update` function.

Keep in mind that by using a spy the original method `handleClick` will be called. Probably you intentionally want that, but normally we want to avoid it and just check that on click the methods is indeed called. For that we can use a Jest Mock function:

```javascript
it('calls handleClick when click on message', () => {
  cmp.vm.handleClick = jest.fn()
  cmp.update()

  const el = cmp.find('.message').trigger('click')
  expect(cmp.vm.handleClick).toBeCalled()
})
```

Here we're totally replacing the `handleClick` method, accessible on the vm of the wrapper component returned by the mount function.

We can make it even easier by using `setMethods` helper that the official tools provide us:

```javascript
it('calls handleClick when click on message', () => {
  const stub = jest.spy()
  cmp.setMethods({ handleClick: stub })
  cmp.update()

  const el = cmp.find('.message').trigger('click')
  expect(stub).toBeCalled()
})
```

Using **`setMethods` is the suggested way** to do it, since is an abstraction that official tools give us in case the Vue internals change.

### Testing the Custom Event `message-clicked` is emitted

We've tested that the click method calls it's handler, but we haven't tested that the handler emits the `message-clicked` event itself. We can call directly the `handleClick` method, and use a Jest Mock function in combination with the Vue vm `$on` method:

```javascript
it('triggers a message-clicked event when a handleClick method is called', () => {
  const stub = jest.fn()
  cmp.vm.$on('message-clicked', stub)
  cmp.vm.handleClick()

  expect(stub).toBeCalledWith('Cat')
})
```

See that here we're using `toBeCalledWith` so we can assert exactly which parameters we expect, making the test even more robust. Not that we're not using `cmp.update()` here, since we're making no changes that need to propagate to the template.

### Testing the @message-clicked triggers an event

For custom events, we cannot use the `trigger` method, since it's just for DOM events. But, we can emit the event ourselves, by getting the Message component and using its `vm.$emit` method. So add the following test to `MessageList.test.js`:

```javascript
it('Calls handleMessageClick when @message-click happens', () => {
  const stub = jest.fn()
  cmp.setMethods({ handleMessageClick: stub })
  cmp.update()

  const el = cmp.find(Message).vm.$emit('message-clicked', 'cat')
  expect(stub).toBeCalledWith('cat')
})
```

I'll leave up to you to test what `handleMessageClicked` does ;).

>Note that if inside `handleMessageClicked` any side effects are performed, such a call to an external `http.get` or whatever, they must be mocked as explained in {% post_link Test-State-Computed-Properties-and-Methods-in-Vue-js-Components-with-Jest "Test State, Computed Properties and Methods in Vue.js Components with Jest" %}

## Wrapping up

Here we've seen several cases to test properties and events. `vue-test-utils`, the official Vue testing tools, makes this much easier indeed.

You can find the working code we've used here in [this repo](https://github.com/alexjoverm/vue-testing-series/tree/Test-Properties-and-Custom-Events-in-Vue-js-Components-with-Jest).

