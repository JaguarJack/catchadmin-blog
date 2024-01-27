---
title: Vue3 使用第三方图标 heroIcons
---

# Vue3 使用第三方图标 heroIcons

## 原因

为什么要使用第三方的图标？因为 `ElementPlus` 的 `icon` 实在是太少了，不够用。[hreIcons](https://heroicons.com/) 感觉还可以，并且可以很好的和 `tailwindcss` 集合，图标数量也有 230+ ，感觉能满足后台需求。所以整个项目为了 `icon` 统一，就去除了 `ElementPlus Icon ` 了，统一使用 `heroIcons`。

## 安装

```
yarn add @heroicons/vue
```

## 使用

为了统一使用，并且为了之后的动态 `icon` 做铺垫，所以这里需要二次封装下。创建 `src/icon/index.vue` 组件。

```javascript
<template>
    <component :is="icon" class="ct-w-5 ct-h-5"/>
</template>

<script>
import { defineComponent } from 'vue'
import * as heroIcons from '@heroicons/vue/outline'
export default defineComponent({
  name: 'icon',
  props: {
    name: {
      type: String,
      required: true
    }
  },
  setup (props, ctx) {
    let name = ''

    props.name.split('-').forEach(v => {
      name += v[0].toUpperCase() + v.substr(1)
    })

    const icon = heroIcons[name + 'Icon']

    return {
      icon
    }
  }
})
</script>
```

创建完成之后，为了可以全局使用，需要注册在 vue 中注册下，还是找到后台的入口 `utils/catchadmin.ts`

```javascript
import icon from '@/components/icon/index.vue'


// 找到 registerComponents 方法，注册
protected registerComponent () : CatchAdmin {
    this.app.component('icon', icon)

    return this
  }

```

注册完成之后，就可以全局使用了，例如这样

```javascript
<Icon name='logout' />
```

当然这个使用是有一个小小弊端，修改之后无法立即刷新图标，但是这个应该不是什么大问题，因为图标是静态的。
当然如果你不喜欢这样，也可以直接在页面中引入 `heroIcons`

```javascript
<template>
  <div>
    <BeakerIcon class="w-5 h-5 text-blue-500"/>
    <p>...</p>
  </div>
</template>

<script>
import { BeakerIcon } from '@heroicons/vue/solid'

export default {
  components: { BeakerIcon }
}
</script>
```
