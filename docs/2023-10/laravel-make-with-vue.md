---
title: Laravel Vue 组合开发
---

# Laravel Vue 组合开发

## 为什么需要组合开发

夏至冬来的一次久违的分享！从之前 `catchadmin` 开发情况来看，使用该项目的多是后端人员，极大可能还是前后端都有参与，所以将两者组合到一起会很方便开发者。当然如果需要单独开发也没有问题，将该篇 blog 的操作逆向看也行。而且 `Laravel` 和 `Vue` 集合也是相当好，生态也很丰富，反观 `thinkphp`, 简直一塌糊涂，每每小版本升级都导致很多问题。这种事情在 v3 下会很少发生了。

## 迁移

首先 v3 也是有前端的，但是 v3 前端的仓库将会是单独的纯前端仓库，不会再跟后台耦合。所以在开发前第一步就是要将前端迁移到 Laravel。当然这篇 blog 只是记录过程，实际上项目上已经完全迁移好了

### 项目文件

前端项目一般都是根目录存有依赖，config 配置等文件，`src` 则是开发目录，首先是将根目录的依赖 config 复制到 Laravel 项目根目录下

- package.json
- .env
- .env.production
- postcss.config.js
- tailwind.config.js
- tsconfig.json
- tsconfig.node.json
- vite.config.js

等等，上面列出主要文件

### 开发目录迁移

Laravel 一般规定前端开发的文件都存储在 `resources` 目录，所以先在该目录下创建 `admin` 目录, 然后将前端的 `src` 目前复制到 Laravel 的 `resources/admin` 目录。迁移进去之后，先不要着急运行
`yarn dev`，首先安装 Laravel Vite 开发插件

```shell
yarn add -D laravel-vite-plugin
```

在 resources/views 目录下建立 `admin.blade.php` 文件，将前端的 index.html 内容复制到该文件中，目前 v3 内容如下

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />

    <title>Laravel</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        overflow: hidden;
        width: 100%;
        height: 100%;
      }
    </style>
    <!-- 这里引入前端的入口文件 -->
    @vite('resources/admin/app.ts')
  </head>
  <body id="app"></body>
</html>
```

### 配置 vite.config.js

这个配置是最重要的一环，首先引入

```javascript
import laravel from 'laravel-vite-plugin'

return {
  plugins: [
    laravel({
      input: ['resources/admin/app.ts'],
      // 监控目录刷新
      refresh: ['resources/admin']
    }),
    // 前端都是使用 @ 作为项目根目录，但是这里不能这么使用
    // 即使使用 @ =>  resources/admin 也不会生效
    // 因为 laravel-vite-plugin 在插件写死 @ => resources/js
    // 虽然可以覆盖，但由于在写下 blog 的时候，vite 3.2 的配置和 3.0 的配置有所区别，导致无法覆盖
    // 所以这里使用 /admin 前缀表示
    // @ 留给自主开发应用
    alias({
      entries: [
        {
          find: '/admin',
          replacement: resolve(rootPath, 'resources/admin')
        }
      ]
    }),
    // 自动生成全局组件
    // 不需要在 import 组件
    Components({
      dirs: ['resources/admin/components/', 'resources/admin/layout/'],

      extensions: ['vue'],

      deep: true,

      dts: true,

      include: [/\.vue$/, /\.vue\?vue/],

      exclude: [/[\\/]node_modules[\\/]/, /[\\/]\.git[\\/]/, /[\\/]\.nuxt[\\/]/]
      // resolvers: [ ElementPlusResolver({ importStyle: 'sass'}) ]
    })
  ]
}
```

目前就需要这么多的配置，后期改变继续添加

### 配置 tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  darkMode: 'class',
  // 主要
  content: ['./resources/admin/**/*.{vue,js,ts,jsx.tsx}'],
  theme: {
    extend: {
      transitionProperty: {
        width: 'width',
        spacing: 'margin, padding'
      },
      colors: {
        'regal-dark': '#283046'
      }
    }
  },
  plugins: []
}
```

## 配置 ts

```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "target": "esnext",
    "useDefineForClassFields": true,
    "module": "esnext",
    "moduleResolution": "node",
    "strict": true,
    "jsx": "preserve",
    "sourceMap": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "allowJs": true,
    "lib": ["esnext", "dom"],
    "skipLibCheck": true,
    // "types": ["element-plus/golbal"],
    "paths": {
      "@/*": ["resources/js/*"],
      // 主要
      "/admin/*": ["resources/admin/*"]
    }
  },
  "include": [
    // 主要配置
    "resources/admin/js/**/*.ts",
    "resources/admin/js/**/*.d.ts",
    "resources/admin/js/**/*.tsx",
    "resources/admin/js/**/*.vue",
    "resources/admin/js/**/*.js",
    "resources/admin/js/env.d.ts"
  ],
  "references": [
    {
      "path": "./tsconfig.node.json"
    }
  ]
}
```

### env

因为 `Laravel` 目录也是有 `.env` 文件，所以将 `vue` 的项目 `.env` 和 `Larave`l 的 `.env` 合并，主要就是添加一个配置项

```javascript
VITE_BASE_URL=http://127.0.0.1:9091/api/
```

## 代码格式化

在 `PHPStorm` 安装 `prettier` 插件，然后在 `preferences` 中选择 `Languages & Frameworks`,
选中 `Javascript` 的 `Prettier`, 会看到 prettier package, 因为项目已经安装 `prettier` 插件，所以选择 `node_modules/prettier`，再勾选 `On Save` 选项。

另外项目的根目录下有一个 `.prettierrc` 文件，内容如下

```json
{
  // 句末加分号
  "semi": false,
  "printWidth": 200,
  "tabWidth": 2,
  "useTabs": false,
  // 用单引号
  "singleQuote": true,
  // 箭头函数参数括号 (x) => {} always
  // x => {} avoid
  "arrowParens": "avoid",
  "trailingComma": "all",
  // 对象&数组是否追加空格
  "bracketSpacing": true
}
```

## 最后

找到 `routes/web.php` 文件，添加路由

```php
Route::get('/', function () {
    return view('admin');
});
```

使用

```shell
 yarn dev
```

启动前端项目

使用

```shell
php artisan serve
```

启动后端项目，通过后端的链接访问项目，大功完成 ✅
