---
title: 初识 Laravel 11
---

# 初识 Laravel 11

在去年年初，我就留意到泰勒（Taylor）在 X(推特) 平台上宣布了一个令人期待的计划，即对 Laravel 进行精简，力图打造一个更为简洁的骨架。经过 Laravel 开发组一年的辛勤努力，也随着即将发布的 Laravel 11，X 上各种关于 Laravel 11 的讨论、分享也越来越多。我将这些信息做了一个聚合，分享给社区的各位。

## 安装

:::tip
Laravel 11 最低版本要求 8.2 了，所以各位想要尝鲜先提前准备下环境 😄
:::

执行下面的命令安装项目

```shell
composer create-project --prefer-dist laravel/laravel laravel-dev dev-master
```

如果遇到报错，例如下面的，可以先不用管，是数据库默认驱动的问题。

```shell
could not find driver (Connection: sqlite, SQL: PRAGMA foreign_keys = ON;)
```

在写这篇文章的时候，Laravel 将 Database 的默认`DB_CONNECTION`设置成了 `sqlite` 导致的。不用管它，如果你不用 sqlite，建议设置成 Mysql。
先来看下目录结构

```shell
|---- app/  应用目录
|---- bootstrap/ 启动目录
|---- config/ 配置目录
|---- database/ 数据迁移目录
|---- public/ 入口
|---- resources/ 资源目录，主要是视图，静态文件
|---- routes/ 路由
|---- storage/ 存储目录
|---- tests/ 测试
|---- vendor/ 依赖目录
|---- vite.config.js vite 配置
|---- artisan
|---- composer.json PHP 依赖
|---- package.json 前端依赖
|---- phpunit.xml
|---- README.md
```

## app 目录

根目录的目录结构没有大的变化，但是子目录的变化可大了。基本都给咱整没了 😂，展开看下,这里为了区别，只把变化的目录留下。首先是 `app 目录`

```shell
├─app // [!code focus]
│  ├─Http // [!code focus]
│  │  └─Controllers // [!code focus]
│  │          Controller.php // [!code focus]
│  │          // [!code focus]
│  ├─Models // [!code focus]
│  │      User.php // [!code focus]
│  └─Providers // [!code focus]
│          AppServiceProvider.php // [!code focus]
├─bootstrap
│  │  app.php
│  │  providers.php
│  │
│  └─cache
│          packages.php
│          services.php
├─config
│      .gitkeep
├─routes
│      console.php
│      web.php
```

`app` 目录删除了太多的东西了，大概有下面这些，以后都不用关注了

- Consoles 控制台 Kernel ❌
- 异常 ❌
- Http
  - 中间件全部取消 ❌
  - Http Kernel ❌
- 服务提供者
  - 认证 ❌
  - 事件 ❌
  - 路由 ❌
  - Broadcast(广播?) ❌

只保留了 `AppServiceProvider` 服务。还有就是提供的一个默认控制器，之前是这样的

```php
namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;

class Controller extends BaseController
{
    use AuthorizesRequests;
    use DispatchesJobs;
    use ValidatesRequests;
}

```

提供三个 Trait 组合，现在也全都没了，只是一个 `Controller`, 如下

```php
amespace App\Http\Controllers;

abstract class Controller
{
    //
}

```

## bootstrap 目录

下面来看 bootstrap 目录的变化

```shell
├─app
│  ├─Http
│  │  └─Controllers
│  │          Controller.php
│  │
│  ├─Models
│  │      User.php
│  └─Providers
│          AppServiceProvider.php
├─bootstrap // [!code focus]
│  │  app.php // [!code focus]
│  │  providers.php // [!code focus]
│  │  // [!code focus]
│  └─cache // [!code focus]
│          packages.php // [!code focus]
│          services.php // [!code focus]
├─config
│      .gitkeep
├─routes
│      console.php
│      web.php

```

bootstrap 的 cache 目录是没有啥变化的，变化所以新增了一个 `providers` 文件，这是 Laravel 项目自动生成的文件，里面只有一个 `AppServiceProvider` 服务，应该并不是给用户预留的，可以在里面增加服务提供者，但是肯定不建议。个人认为这个文件以后可能还会被删除掉 😂。
因为这个文件实在是很简单，只是返回一个服务提供者数组

```php
return [
    App\Providers\AppServiceProvider::class,
];
```

然后就是 `app.php` 这个文件变化蛮大的，先来看下之前的吧

```php
// 注册根目录
$app = new Illuminate\Foundation\Application(
    $_ENV['APP_BASE_PATH'] ?? dirname(__DIR__)
);

// 注册 Http kernel
$app->singleton(
    Illuminate\Contracts\Http\Kernel::class,
    App\Http\Kernel::class
);
// 注册 Console kernel
$app->singleton(
    Illuminate\Contracts\Console\Kernel::class,
    App\Console\Kernel::class
);
// 注册异常处理
$app->singleton(
    Illuminate\Contracts\Debug\ExceptionHandler::class,
    App\Exceptions\Handler::class
);


return $app;

```

之前做了四件事

- ☑️ 注册根目录
- ☑️ 注册 Http kernel
- ☑️ 注册 Console kernel
- ☑️ 注册异常处理

然后在 Laravel11 的新版本呢，大概是这样的

```php
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withProviders()
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        // api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        // channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        //
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
```

目前来看只有两个相同点，只是从当前文件看到的

- ☑️ 注册根目录
- ☑️ 注册异常处理（需要自己写）
- ☑️ 注册路由
- ☑️ 注册中间件

然后从 Application 内核看到的，其实内核中自动注册了这些，这里不用代码展示了，了解下就好了，感兴趣可以看代码

- ☑️ Http 和 Console 内核
- ☑️ 事件服务提供者
- ☑️ 注册 app 目录的 Console/Commands
- ☑️ 中间件（指之前的 app 目录的，已经全部移至内核）

这里要特别提一点，虽然框架自动注册了 app 目录下的中间件，本来我们可以自由修改中间件代码或者使用不同的中间件，现在也是可以的，只不过需要你自己权衡了。在：

```php
->withMiddleware(function (Middleware $middleware) {
    // 修改 golbal 中间件
    middleware->use(array $middleware)
    // 然后还有 api web 之类的都可以通过曝露的方法进行修改
})

```

## config 目录

配置目录变化真大，啥都没了。现在只用 env 就行了，管那么多 config 文件干嘛，看的头皮发麻。什么 app，什么 database 还有 session，queue。大部分时候都用不着。
但是如果你有特定需求，可以通过 config 发布修改

```shell
 php artisan | grep config
```

找到这个命令

```shell
php artisan config:publish
```

如果想发布全部配置文件

```shell
php artisan config:publish --all
```

如果想发布某个配置文件，目前好像没有提供哪些可用配置文件的命令，这个可能会在文档中提到。如果有需要，可以通过下面的命令发布数据库配置文件（对老用户比较友好）

```shell
php artisan config:publish database
```

:::tip
默认配置文件全部对用户隐藏了，虽然如此，但实际上仍然全部加载了，这对新用户是利好，省去了一些烦恼。
:::

## route 目录

这个目录没啥说的，就是保留了 web 和 console 两个路由。但是如果你是开发 api 项目，你可以使用下面的命令

```shell
php artisan install:api
```

这个命令会自动安装 sanctum 包，并创建一个 api.php 路由文件，示例如下：

```php
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware(Authenticate::using('sanctum'));
```

## 总结

个人观点是，某种意义上更加黑盒了。如果你不去了解源代码，你根本不知道框架在背后做了什么。这只是`精简骨架`。

但是，对于新用户来说，这是好消息。对于刚开始使用 Laravel 的用户来说，不再需要去关心那么多的概念，比如 Http 内核、中间件、服务提供者等。现在只需要一个 MVC 就可以开始开发应用了。这样看来，框架更加渐进式了 😂。

简而言之，这利好新用户 👍。
