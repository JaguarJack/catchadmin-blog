---
title: Laravel 实现自定义资源路由
---

# Laravel 如何实现自定义资源路由

最近在开发过程中，发现总有一些路由需要重复定义，比如切换状态，导出，回收站啊之类的。如果使用 Laravel 自带的资源路由方法，还不足以满足重复劳动得过程。所以是否有方法可以自定义项目得资源路由呢？在 Laravel 中，资源路由一般有两种

### 服务端渲染

```php
Route::resource('xxxxx')
```

`resource` 路由包含以下几个方法

- index
- store
- create
- show
- edit
- upate
- destroy

### Api 资源路由

```php
Route::apiResource('xxxxx')
```

而 `ApiResource` 则是用 `Resource` 方法生成，仅仅保存了下面几个方法

```php
$only = ['index', 'show', 'store', 'update', 'destroy'];
```

现在项目一般都采用前后端分离，所以一般都是使用 `apiResource` 这个方法，这个方法如上所示只提供五个方法，即五个路由。所以如果项目中需要一些特定得每次都加得路由，必须还要自己再添加一条，很不方便。那在 Laravel 中是不是可以自己扩展属于项目独有得 `resource` 方法呢？答案是当然可以，而且非常简单

## 如何实现

一般都是在项目中这样定义资源路由的, 通过门面 `Route` 访问 `apiResource` 方法进行定义，如下

```php
Route::apiResource('hello', HelloController::class);
```

实际上通过门面调用的实际是 `Illuminate\Routing\Router` 的 `apiResource` 方法，内容如下

```php
public function apiResource($name, $controller, array $options = [])
{
    $only = ['index', 'show', 'store', 'update', 'destroy'];

    if (isset($options['except'])) {
        $only = array_diff($only, (array) $options['except']);
    }

    // 实际调用的是 resource 方法
    return $this->resource($name, $controller, array_merge([
        'only' => $only,
    ], $options));
}
```

实际上 `apiResource` 是用 `resource` 方法包装的，所以再来看看 `resource` 方法做了啥

```php
public function resource($name, $controller, array $options = [])
{
    // 这里是关键的地方
    if ($this->container && $this->container->bound(ResourceRegistrar::class)) {
        $registrar = $this->container->make(ResourceRegistrar::class);
    } else {
        $registrar = new ResourceRegistrar($this);
    }

    // 这一步不用关注
    return new PendingResourceRegistration(
        $registrar, $name, $controller, $options
    );
}
```

最关键的地方就是 `ResourceRegistrar`，这里就叫`资源路由注册器`吧。

- 首先查找容器中是否有资源路由注册器的绑定实现，如果有，直接从容器中 make 出来
- 如果容器中没有绑定，则直接使用 new 实例化

那就是说，如果自定义自己的资源路由注册器，然后再绑定 `ResourceRegistrar` 的实现，就可以实现让框架使用自定义的路由注册器了。

这解决了资源路由注册器的问题，还需要一个方法来调用，从上来得知

```php
Route::apiResource('hello', HelloController::class);
```

实际上就是 `Illuminate\Routing\Router` 的 `apiResource` 方法。那么如何在 `Illuminate\Routing\Router` 添加自定义方法呢？没错，首先就要想到它支不支持
`Macroable`？🤣 显而易见，肯定是支持的，那么依葫芦画瓢，去注册一个吧。找到 `AppServiceProvider`，在里面注册即可

### 添加自定义的资源路由方法

因为是做后台系统项目，这里就将资源路由方法定义为 `adminResource` 吧

```php
Router::macro('adminResource', function ($name, $controller, array $options = []) {
    // 这里添加 enable 和 export
    $only = ['index', 'show', 'store', 'update', 'destroy', 'enable', 'export'];

    if (isset($options['except'])) {
        $only = array_diff($only, (array) $options['except']);
    }

    return $this->resource($name, $controller, array_merge([
        'only' => $only,
    ], $options));
});
```

### 实现一个资源路由注册器

当然并不是自己去实现，而是集成 `Illuminate\Routing\ResourceRegistrar` 即可。在它的基础上，再添加 `enable` 和 `export` 两个方法实现就可以，如下

```php
namespace Defined;

use Illuminate\Routing\ResourceRegistrar as LaravelResourceRegistrar;
use Illuminate\Routing\Route;

class ResourceRegistrar extends LaravelResourceRegistrar
{
    protected $resourceDefaults = ['index', 'create', 'store', 'show', 'edit', 'update', 'destroy', 'enable', 'export'];

    // 添加 enable 方法路由
    protected function addResourceEnable($name, $base, $controller, $options): Route
    {
        $name = $this->getShallowName($name, $options);

        $uri = $this->getResourceUri($name).'/enable/{'.$base.'}';

        $action = $this->getResourceAction($name, $controller, 'enable', $options);

        return $this->router->put($uri, $action);
    }

    // 添加 export 方法路由
    protected function addResourceExport($name, $base, $controller, $options): Route
    {
        $uri = $this->getResourceUri($name).'/export';

        unset($options['missing']);

        $action = $this->getResourceAction($name, $controller, 'export', $options);

        return $this->router->get($uri, $action);
    }
}

```

实现好了之后，还需要绑定到容器里, 还是找到 `AppServiceProvider`，在里面注册即可

```php
// 资源路由注册器
$this->app->bind(ResourceRegistrar::class, \Defined\ResourceRegistrar::class);
```

完成之后测试一下看看，我本地使用 UserController 测试

```
Route::adminResource('users', UserController::class);
```

完成之后呢，使用 `php artisan route:list | grep users` 查看

```shell
GET|HEAD api/users ................... users.index › UserController@index
POST api/users ....................... users.store › UserController@store
# put 请求 符合预期
PUT api/users/enable/{user} ...........users.enable › UserController@enable
# Get 请求 符合预期
GET|HEAD api/users/export ............. users.export › UserController@export
GET|HEAD api/users/{user} ............. users.show › UserController@show
PUT|PATCH api/users/{user} ............users.update › UserController@update
DELETE api/users/{user} ............... users.destroy › UserController@destroy
```
