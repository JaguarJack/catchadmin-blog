---
title: Vue3 使用状态管理 Pinia
---

# Vue3 使用状态管理 Pinia

[Pinia](https://pinia.vuejs.org/introduction.html) 是 `vue3` 新推的状态管理，当然你也可以使用 `vuex`, 但是不是很建议，因为这个 `plugin` 就相当于 `vuex5` 了。

## 为什么使用它

引用官方文档的内容
`Pinia` 是 `Vue` 的存储库，它允许您跨组件/页面共享状态。 如果您熟悉 `Composition API`，您可能会认为您已经可以通过一个简单的 `export const state = reactive({})`. 这对于单页应用程序来说是正确的，但如果它是服务器端呈现的，会使您的应用程序暴露于安全漏洞。 但即使在小型单页应用程序中，您也可以从使用 `Pinia` 中获得很多好处：

- `dev-tools` 支持
  - 跟踪动作、突变的时间线
  - `Store` 出现在使用它们的组件中
  - `time travel` 和 更容易的调试
- 热模块更换
  - 在不重新加载页面的情况下修改您的 `Store`
  - 在开发时保持任何现有状态
- 插件：使用插件扩展 `Pinia` 功能
- 为 `JS` 用户提供适当的 `TypeScript` 支持或 `autocompletion`
- 服务器端渲染支持

## 安装

```shell
yarn add pinia
# 或者使用 npm
npm install pinia
```

## 使用

找到 `utils/catchadmin.ts`, 全局引入

```javascript
import { createPinia } from 'pinia'

protected usePinia () : CatchAdmin {
    this.app.use(createPinia())

    return this
}
```

创建 `store` 文件夹

```shell
mkdir src/store

// then

touch index.ts

// 保留主入口
```

### 创建模块

```shell
cd src/store && mkdir modules
```

创建 app Store

```shell
cd modules && mkdir app

// then

touch index.ts
```

内容如下

```javascript
import { defineStore } from 'pinia'

const initSize = 'small'

const initLocale = 'zh'

/**
 * app
 */
type app = {
  size: 'small' | 'medium' | 'large',

  isExpand: boolean,

  locale: 'zh' | 'en',

  isMobile: boolean
}

export const useAppStore = defineStore('app', {
  state: (): app => ({
    size: initSize,
    isExpand: true,
    locale: initLocale,
    isMobile: false
  }),

  actions: {
    changeSize(size: 'small' | 'medium' | 'large') {
      this.size = size
    },

    changeLocale(locale: 'zh' | 'en') {
      this.locale = locale
    },

    changeExpaned() {
      this.isExpand = !this.isExpand
    }
  }
})
```

这里还是用的 `optional api`，本人体验了下 `composition api` 写法，似乎很麻烦，然后参考了下相关的项目的写法，都是使用的 `optional api` 写法。

## 为什么要使用

在项目中有一些状态需要在组件之间流转，例如，目前在写这个 blog 文章的时候，项目遇到的菜单「展开关闭」这个状态值，这个值需要在 `header` 组件，`Slide` 组件及其子组件之间不停的流转，就很麻烦，不仅需要 props 还需要 emit 这样的操作无疑增加了代码的复杂度以及维护的难度，使用状态管理之后，因为状态管理是响应式的，所以可以通过一个接口，就可以对状态进行操作，很方便。

找到 `layout/componetns/header/index.vue`

```javascript
import { useAppStore } from '@/stores/modules/app'

const store = useAppStore()

const { changeExpaned } = store
```

就可以直接在组件中使用了 `changeExpaned` 方法，对应的状态也可以改变
