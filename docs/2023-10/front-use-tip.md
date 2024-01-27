---
title: 前端项目开发小技巧
---

# 前端项目开发小技巧

## 查看依赖版本

```javascript
npm outdated

// 可以看到项目依赖的版本情况
Package                  Current   Wanted  Latest  Location                              Depended by
@element-plus/icons-vue    1.1.4    1.1.4   2.0.6  node_modules/@element-plus/icons-vue  catchadmin-pro
@types/node              17.0.45  17.0.45  18.0.4  node_modules/@types/node              catchadmin-pro
@vitejs/plugin-vue         2.3.3    2.3.3   3.0.0  node_modules/@vitejs/plugin-vue       catchadmin-pro
@vitejs/plugin-vue-jsx    1.3.10   1.3.10   2.0.0  node_modules/@vitejs/plugin-vue-jsx   catchadmin-pro
unplugin-auto-import       0.7.2    0.7.2   0.9.3  node_modules/unplugin-auto-import     catchadmin-pro
unplugin-vue-components   0.19.9   0.19.9  0.21.1  node_modules/unplugin-vue-components  catchadmin-pro
vite                      2.9.14   2.9.14   3.0.0  node_modules/vite                     catchadmin-pro
vue-tsc                  0.34.17  0.34.17  0.38.5  node_modules/vue-tsc                  catchadmin-pro
```

## 更新依赖

```
yarn upgrade
```

通过该命令可以升级依赖，然后通过上面的命令继续查看下，如果发现`devDependencies`没有更新的话，可以根据`latest`手动修改版本之后，再执行命令

```
yarn install
```

就可以完成项目的依赖升级了

## 代码格式化

新版前端开发使用的代码格式化的两个`vscode`插件，一个是 `eslint`，另外一个是 `prettier`。在 `vscode` 配置如下

````json
// prettier 配置
{
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "[javascript]": {
      "editor.formatOnSave": true
    },
    "[html]": {
        "editor.formatOnSave": true
    },
    "[css]": {
        "editor.formatOnSave": true
    },
    "[vue]": {
        "editor.formatOnSave": true
    },
    "prettier.semi": false,
    "prettier.bracketSameLine": true,
    "prettier.htmlWhitespaceSensitivity": "ignore",
    "prettier.singleQuote": true,
    "prettier.singleAttributePerLine": true,
    "prettier.printWidth": 200,
    "prettier.jsxSingleQuote": true,
    "prettier.trailingComma": "none"
}

// eslint
```json
{
    "editor.formatOnSave": false,
    //代码保存时，自动执行ESlint格式化代码
    "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true,
    },
}
````
