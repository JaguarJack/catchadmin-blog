---
title: Catchadmin-Vue3 国际化多语言
---

# Catchadmin-Vue3 国际化多语言

## 介绍

本篇文章主要介绍在`catchadmin` V3 中如何实现国际化多语言这个功能。由于后台是基于`ElementPlus`进行开发，所以国际化也分为两个部分。

- `vue-i18n`国际化,用于项目中自定义
- `ElementPlus`国际化,用于 `ElementPlus` UI 组件语言切换

## 安装 i18n

首先需要安装 [i18n](https://vue-i18n.intlify.dev/) 组件。

```
yarn add vue-i18n@9
```

:::tip
vue3 需要安装 9.0+ 版本
:::

## ElementPlus 多语言

找到 `src/utils/CatchAdmin.ts`, 引入多语言

```javascript
import zh from 'element-plus/es/locale/lang/zh-cn'
```

在使用 `ElementPlus` 的地方加入下面的代码

```javascript
this.app.use(ElementPlus, {
  // 本地语言切换
  locale: LocalStorage.get('language') === 'zh' && zh
})
```

## i18n 多语言

在 `src` 目录下建立 `i18n` 文件夹，创建 `index.ts` 之后引入 `i18n`

```javascript
import LocalStorage from '@/utils/LocalStorage'
import { createI18n } from 'vue-i18n'
import en from './languages/en'
import zh from './languages/zh'

const messages = {
  en,
  zh
}

const i18n = createI18n({
  locale: LocalStorage.get('language') || 'zh',
  messages,
  // 全局可以使用 $t 函数
  globalInjection: true
})

export default i18n
```

然后在 `i18n` 文件夹下建立 `languages` 文件夹，分别是

- en.ts
- zh.ts
  以 `zh` 为例，内容如下

```javascript
const zh = {
  system: {
    login: '登录',
    register: '注册',
    chinese: '中文',
    english: '英文'
  }
}

export default zh
```

### 在项目使用 i18n

还是找到 `src/utils/CatchAdmin.ts`, 引入 `i18n`

```javascript
import i18n from '@/i18n'

this.app.use(i18n) // 即可
```

## 多语言切换组件

找到 `layout/components/header/lang.vue` 组件，内容如下

```javascript
<template>
    <div class="ct-flex hover:ct-cursor-pointer ct-pl-1 ct-pr-1">
        <el-dropdown size="large" class="ct-flex ct-items-center ct-justify-center hover:ct-cursor-pointer ct-w-full" @command="selectLanguage">
            <TranslateIcon class="ct-h-5 ct-w-5"/>
            <template #dropdown>
                <el-dropdown-menu>
                    <el-dropdown-item v-for="lang in langs"
                        :key="lang.value"
                        :command="lang.value"
                        :disabled="lang.value == defaultLang">
                        {{ $t('system.' + lang.label) }}
                     </el-dropdown-item>
                </el-dropdown-menu>
            </template>
        </el-dropdown>
    </div>
</template>

<script lang="ts" setup>
import LocalStorage from '@/utils/LocalStorage'
import { computed } from '@vue/reactivity'
import { reactive } from 'vue'

const langs = reactive([
  { label: 'chinese', value: 'zh' },
  { label: 'english', value: 'en' }
])

const defaultLang = computed(() => {
    return LocalStorage.get('language') || 'zh'
})

const selectLanguage = (value: string | number | object) => {       LocalStorage.set('language', value);
location.reload()
}
</script>
```

在项目的任何位置引入该组件即可实现中英文切换，当然如果你需要其他语言的，可以根据自行在 `i18n` 文件夹下添加
