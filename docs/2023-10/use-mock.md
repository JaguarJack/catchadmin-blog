---
title: 使用 mock-server 模拟接口
---

# 使用 mock-server 模拟接口

## 为什么使用 mock

在日常开发中，后端接口和前端开发的进度一般会不一致，有时候前端因为一个接口没有对接完成，就会卡住，无法进行下去，所以这个时候需要进行数据 mock，使得业务能正常开发下去，当然首要的前提是，需要前后端对接口的数据定义要统一。

## 安装

```
yarn add mockjs

yarn add @types/mockjs -D

yarn add vite-plugin-mock -D
```

## 使用

找到 vite.config.js

```javascript
import { viteMockServe } from 'vite-plugin-mock'


// 然后在 plugins 中添加 viteMockServe
return {
    plugins: [
      viteMockServe({
        // mock 数据的文件夹
        mockPath: './src/mock',
        // 根据实际情况，是否需要开启 mock
        localEnabled: command === 'serve',
        watchFiles: true // 监视文件夹中的文件更改。 并实时同步到请求结果
      }),
}
```

## 创建 mock 数据

```shell
mkdir ./src/mock

touch login.ts
```

添加一个 `login` 的 `mock` 数据

```javascript
import { MockMethod } from 'vite-plugin-mock'

export default [
  {
    url: '/api/login',
    method: 'post',
    response: ({ query }) => {
      return {
        code: 10000,
        data: {
          token: 'adminislogined'
        }
      }
    }
  },

  {
    url: '/api/logout',
    method: 'post',
    response: ({ query }) => {
      return {
        code: 10000,
        data: {
        }
      }
    }
  }
] as MockMethod[]
```

注意，这里的 `mock` 实际是会通过浏览器发送真实请求的，所以在业务开发中，后端可以先定义好接口返回的数据格式，前端按照接口数据格式模拟数据。一旦后端开发完成之后，通过关闭 `mock-serve`，可以迅速完成业务接口交接。
目前 `catchadmin vue3` 的后台，正是使用这样的方式开发，所以可以通过查看 mock 的数据接口，就可以了解接口的数据定义了
