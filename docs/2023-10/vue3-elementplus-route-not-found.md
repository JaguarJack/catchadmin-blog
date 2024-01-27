---
title: 解决 Vue3 + ElementPlus 动态路由刷新页面后跳转到 404
---

# 解决 Vue3 + ElementPlus 动态路由刷新页面后跳转到 404

## 问题由来

在发布`CatchAdmin` 3.0 版本，有用户提到，在安装权限管理模块之后，刷新管理模块的页面的路由时，页面会直接跳转到`404`页面，而不是当前页面。其实这个问题在开发期间就已经发现了，但是当时因为赶着进度，所以就没有管。

## 查找原因

如何查找呢？因为`catchadmin` 的路由是由动态和静态路由组成，所以首先确定静态路由是否存在该问题。通过刷新用户管理模块，发现并没有跳转到 404，说明静态路由是没有问题的。在通过代码 debug 发现路由 Guard 时

```javascript
router.beforeEach(async (to, from, next) => {
    // 发现 to.path 已经是 404 了
}
```

说明在挂载动态路由前，就已经被拦截了。说明在 `beforeEach` 之前就已经进行了路由匹配。

## 解决

找到 `resource/admin/route/index.ts` 文件

```javascript
const defaultRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: '/',
    component: () => import('/admin/layout/index.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: '/404',
        name: '404',
        meta: { title: '404' },
        component: () => import('/admin/components/404/index.vue')
      }
    ]
  },
  // 未定义路有重定向到 404
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
]
```

会发现在 `createRouter` 的时候就已经将匹配路由添加了，问题原因就出现在这里。
因为动态路由还没有加载，那么此时肯定无法跟动态路由匹配的，自然跳转到了 `404` 页面。

既然是在动态路由前进行匹配，那么解决起来就很简单了。只需要在动态路由挂载之后匹配不就可以了吗？
所以找到 `resource/admin/router/guard/index.ts`

```javascript
 // 阻塞获取用户信息
await userStore.getUserInfo()
// 如果后端没有返回 permissions，前台则只使用静态路由
if (userStore.getPermissions !== undefined) {
    // 挂载路由（实际是从后端获取用户的权限）
    const permissionStore = usePermissionsStore()
    // 动态路由挂载
    const asyncRoutes = permissionStore.getAsyncMenusFrom(toRaw(userStore.getPermissions))
    asyncRoutes.forEach((route: Menu) => {
        router.addRoute(route as unknown as RouteRecordRaw)
    })

    // 在动态路由之后挂载匹配 404 路由
    router.addRoute({
        path: '/:pathMatch(.*)*',
        redirect: '/404',
    })
}
next({ ...to, replace: true });
```

完美解决
