---
title: vue3 打包后动态配置
---

# vue3 打包后动态配置

## 为什么会有这么个需求呢

最近在开发`CMS`，所以想直接分发 cms 的打包后的代码。但是这里面就有个问题，如果我将打包后的代码直接让用户使用，那么不得不面临一个问题，就是打包后的接口地址也会直接打包给了用户。所以这里就需要用户自己去设置接口地址。但是前端是打包后的代码，没有办法去修改，所以就需要这么一个动态修改配置的功能

## 挂载

如何进行挂载呢？首先需要在入口文件`index.html`引入

```javascript
<div id="app"></div>
<script type="module" src="../resources/admin/app.ts"></script>

// 就在这里引入
<script src="./static/config.js"></script>
```

千万不要纠结这个路径，因为这是打包后的路径，所以开发的时候也不需要管它。

第二步，如果没有`public`目录，在项目的任意目录创建 `public` 目录，在`public`目录下创建 `static/config.js`, 内容如下

```javascript
window.admin_config = {
  title: '',
  BASE_URL: ''
}
```

然后找到 `axios` 请求，`CatchAdmin`进行了封装，所以使用的是 `support\http.ts`。
在这之前 `CatchAdmin` 还封装了两个助手方法

```javascript
// 从 window 对象获取配置
// 因为动态配置挂载在 window 的 admin.config 属性
export function _window(key: string) {
  if (window.hasOwnProperty('admin_config')) {
    //@ts-ignore
    return window.admin_config[key]
  }

  return null
}

// 获取 base_url
export function getBaseUrl() {
  // 如果动态配置存在并且 BASE_URL 有值，则从动态配置获取
  // 否则从 env 配置获取
  return _window('BASE_URL') ? _window('BASE_URL') : env('VITE_BASE_URL')
}
```

再到 http.ts 获取 baseURL

```javascript
  protected getConfig(): AxiosRequestConfig {
    // set base url
    this.config.baseURL = getBaseUrl()
  }
```

这样就可以了。那会有人有疑问？`./static/config.js` 怎么引入的呢？
在 build 打包后，`public` 会被打包到 `index.html` 平级目录，所以可以直接引入。对了，忘了一个很重要的，就是配置 `public` 目录，找到 `vite.config.js` 文件

```javascript
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
        publicDir: 'public 目录相对路径',
  }
}
```
