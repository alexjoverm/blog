---
title: Test Vue.js Slots in Jest
tags:
  - VueJS
  - JavaScript
  - Testing
description: Learn how to test content distributed using slots and named slots.
---

Learn how to test content distributed using slots and named slots.

<!-- more -->

Slots are the way the way to make content distribution happen in the web components world. Vue.js slots are made following the [Web Component specs](https://github.com/w3c/webcomponents/blob/gh-pages/proposals/Slots-Proposal.md), meaning if you learn how to use them in Vue.js, that will be useful in the future ;).

They make components structure to be much more flexible, moving the responsibility of managing the state to the parent component. For example, we can have a `List` component, and different kind of item components, such `ListItem` and `ListItemImage`. They'll be used like:

```html
<template>
  <List>
    <ListItem :someProp="someValue" />
    <ListItem :someProp="someValue" />
    <ListItemImage :image="imageUrl" :someProp="someValue" />
  </List>
</template>
```

The inner content of `List` is the slot itself, and its accessible via `<slot/>` tag. So the `List implementation looks like:

```html
<template>
  <ul>
    <!-- slot here will equal to what's inside <List> -->
    <slot/>
  </ul>
</template>
```

And, say that the `ListItem` component looks like:

```html
<template>
  <li> {{ someProp }} </li>
</template>
```

Then, the final result rendered by Vue.js would be:

```html
<ul>
  <li> someValue </li>
  <li> someValue </li>
  <li> someValue </li> <!-- assume the same implementation for ListItemImage -->
</ul>
```

## Make MessageList slot based

Let's take a look at the `MessageList.vue` component:

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
```

MessageList has "hardcoded" the Message component inside. In a way that's more automated, but in the other is not flexible at all. What if you wanna have different types of Message components? What about changing its structure or styling? That's where slots come in handy.

Let's change `Message.vue` to use slots. First, move that `<Message...` part to the `App.vue` component, as well as the `handleMessageClick` method, so it's used externally:

```html
<template>
  <div id="app">
    <MessageList>
      <Message
          @message-clicked="handleMessageClick"
          :message="message"
          v-for="message in messages"
          :key="message"/>
    </MessageList>
  </div>
</template>

<script>
import MessageList from './components/MessageList'
import Message from './components/Message'

export default {
  name: 'app',
  data: () => ({ messages: ['Hey John', 'Howdy Paco'] }),
  methods: {
    handleMessageClick(message) {
      console.log(message)
    }
  },
  components: {
    MessageList,
    Message
  }
}
</script>
```

Don't forget to import the Message component and add it to the `components` option in `App.vue`.

Then, in `MessageList.vue`, we can remove the references to `Message`, looking like:

```html
<template>
    <ul class="list-messages">
        <slot/>
    </ul>
</template>

<script>
export default {
  name: 'MessageList',
}
</script>
```

## `$children` and `$slots`

Vue components have two instance variables useful for accessing slots:

 - `$children`: an array of Vue component instances of the default slot.
 - `$slots`: an object of VNodes mapping all the slots defined in the component instance.

The `$slots` object has more data available. In fact, `$children` is just a portion of the `$slots` variable, that could be accessed the same way by mapping over the `$slots.default` array, filtered by Vue component instances:

```javascript
const children = this.$slots.default
  .map(vnode => vnode.componentInstance)
  .filter(cmp => !!cmp)
```

Let's see how to use them by practise in the following tests.

## Testing slots

Probably what we want to test the most out of slots is where they end up in the component, and for that we can reuse the skills got in the article _{% post_link Test-Styles-and-Structure-in-Vue-js-and-Jest "Test Styles and Structure in Vue js and Jest" %}_.

Right now, most of the tests in `MessageList.test.js` will fail, so let's remove them all (or comment them out), and focus on slot testing.

One thing we can test, is to make sure that the Message components end up within a `ul` element with class `list-messages`. In order to pass slots to the `MessageList` component, we can use the `slots` property of the options object of `mount` or `shallow` methods. So let's create a `beforeMethod` with the following code:

```javascript
beforeEach(() => {
  cmp = mount(MessageList, {
    slots: {
      default: '<div class="fake-msg"></div>'
    }
  })
})
```

Since we just wanna test where the messages end up, it's ok to use `<div class="fake-msg"></div>`, in fact it doesn't matter at all. So then we can test it:

```javascript
it('Messages are inserted in a ul.list-messages element', () => {
  const list = cmp.find('ul.list-messages')
  expect(list.findAll('.fake-msg').length).toBe(1)
})
```

And that should be ok to go. The slots option has the following  also accept a component declaration, and even an array, so we could write:

```javascript
import AnyComponent from 'anycomponent'
...
mount(MessageList, {
  slots: {
    default: AnyComponent // or [AnyComponent, AnyComponent]
  }
})
```

## Testing Named Slots

## Testing Slots Functionality



   -----  Tests: we're passing instances of Message  -----

So, what can we test with it? Well... that's totally up to you. You could test anything related to the VNode or the Vue component instance, such as testing slots properties, making sure they handle whatever event...


## Conclusion

When testing slots, only test what makes sense to test of that slot in that context. Don't test things related to the component used as the slot, because those test will belong to that component test. You won't need to test slot functionality very ofter probably, so don't get too stick to the examples used here, they're just to show the tools to be able to do the work.

You can find the code of this article [in this repo](https://github.com/alexjoverm/vue-testing-series/tree/test-slots).