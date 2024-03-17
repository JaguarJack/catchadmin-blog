---
title: 另辟蹊径！如何在 Laravel 更优雅的响应 JSON 数据
---

# 另辟蹊径！如何在 Laravel 更优雅的响应 JSON 数据

## 传统的 JSON 数据响应方式

`Laravel11` 最近刚发布了，我也想输出点内容。起这个标题的确有点那味了。因为社区里有很多关于怎么规范或者响应 JSON 数据的文章了。但我还是想输出一点不同的内容或者方法，因为我还没见过有文章讨论过这么做，可能不是最佳实践。回到正题，一般 Laravel 做 API 项目，响应数据格式都是这么做的。

```php
class TestController extends Controller
{

    public function index()
    {
        return json(['code' => 10000, 'message' => '', 'data' => 1])
    }
}
```

再简便点，就是把这个 `json` 输出封装到基类，或者 `trait` 中供使用者自己调用。我也是这么使用，但在使用过程中，我在想能不能更加简单点，因为有时候仅仅是想返回数据而已。可不可以像下面的示例这样

```php
class TestController extends Controller
{

    public function index()
    {
        return 1;
    }
}
```

只需要业务方法调用返回就可以了，不需要每次都使用类似下面的代码

```php
class TestController extends Controller
{

    public function index()
    {
        // 基类方法
        return $this->json(1)
    }
}
```

## 更优雅的响应方式

在研究 Laravel 的源码时，我发现了一个有趣的事件 RequestHandled，这个事件在请求处理完成后被触发。通过监听这个事件，我们可以在数据响应阶段进行处理，从而实现更优雅的 JSON 数据响应方式。看下面这段代码，目前这段代码在 `Laravel11` 中的 `Illuminate\Foundation\Http` 类中

```php
public function handle($request)
    {
        $this->requestStartedAt = Carbon::now();

        try {
            $request->enableHttpMethodParameterOverride();

            $response = $this->sendRequestThroughRouter($request);
        } catch (Throwable $e) {
            $this->reportException($e);

            $response = $this->renderException($request, $e);
        }

        // 在这里可以对响应做些什么
        $this->app['events']->dispatch(
            new RequestHandled($request, $response)
        );

        return $response;
    }
```

首先创建一个 `Listener`，使用 `php artisan make:listener RequestHandledListener` ，创建完成之后，Laravel 框架会自动帮注册，不需要手动去注册。
下面只是简单的示例，因为只需要 `Json` 响应，所以这里过滤掉所有非 `JsonRespons` 响应

```php
class RequestHandledListener
{
    /**
     * Handle the event.
     */
    public function handle(RequestHandled $event): void
    {
        $response = $event->response;

        if ($response instanceof JsonResponse) {
            $exception = $response->exception;

            if ($response->getStatusCode() == SymfonyResponse::HTTP_OK && !$exception) {
                $response->setData($this->formatData($response->getData()));
            }
        }
    }

     // 拦截数据，然后格式化数据
     // 具体内容跟规则可以根据实际业务设置
    protected function formatData(mixed $data): array
    {
        $responseData = [
            'code' => 10000, // 业务成功 code
            'message' => 'success', // 成功信息
        ];

        $responseData['data'] = $data;

        return $responseData;
    }
}
```

回到控制器的时候，再使用下面的代码进行输出

```php
class TestController extends Controller
{

    public function index()
    {
        return 1;
    }
}
```

发现根本没有任何作用。根本不是 Json 响应啊。想一想为啥? 为什么控制要输出 Json Response 对象呢？上面的代码到浏览器只会输出个 `1`，就是一个普通的响应，而不是 `Json Response`。所以需要想响应始终设置为 `Json Reponse` 对象。来写一个中间件解决这个问题。使用 `php artisan make:middleware JsonResponseMiddleware` 创建中间件

```php
namespace App\Http\Middleware;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class JsonResponseMiddleware
{
    public function handle(Request $request, \Closure $next)
    {
        $response = $next($request);
        // response
        if ($response instanceof Response) {
            return new JsonResponse($response->getContent());
        }

        return $response;
    }
}
```

切换到路由 web.php 文件，加上路由

```php
Route::get('/', [\App\Http\Controllers\IndexController::class, 'index'])->middleware(\App\Http\Middleware\JsonResponseMiddleware::class);
```

回到浏览器，刷新下，你将会看到下面的输出

```json
{
  "code": 10000,
  "message": "success",
  "data": "1"
}
```

## 处理不同请求来源

有时，我们可能需要根据请求的来源不同来处理响应数据的格式。例如，后台管理系统和客户端的请求可能需要不同的数据格式。这时，我们可以通过设置请求头信息来区分不同的请求来源。下面只是一个示例。现在前端请求一般都用 `axios`, 所以只要在全局 axios 对象设置一个头信息。如下

```js
axios.defaults.headers['Request-from'] = 'WhereFrom'
```

后端可以根据头信息来判断是否需要使用该返回，可以这么做，回到 `RequestHandledListener` 中

```php
public function handle(RequestHandled $event): void
{
    // 只有后台请求才处理
    if (Request::hasHeader('Request-from')&& Str::of(Request::header('Request-from'))->exactly('WhereFrom')) {
        $response = $event->response;

        if ($response instanceof JsonResponse) {
            $exception = $response->exception;

            if ($response->getStatusCode() == SymfonyResponse::HTTP_OK && !$exception) {
                $response->setData($this->formatData($response->getData()));
            }
        }
    }
}
```

## 如何响应错误码

不对啊，这里写死的 `success`，那么失败请求该怎么做？整个项目失败都是用异常处理就行，所以只需要在全局异常这里处理下。首先确定下我们数据格式是这样的

```json
{
  "code": 10000,
  "message": "success",
  "data": "1"
}
```

当到控制器中 Index 方法抛出一个异常

```php
public function index()
{
    throw new \Exception('test');
}
```

会输出这样的内容

```json
{
    code: 10000,
    message: "success",
    data: '<!DOCTYPE html>
    <html lang="en" class="auto">
    <!--' // 非常一大段的文本，html 输出
}
```

这里有三个问题

- Code 码没有使用异常的还是固定的
- message 信息不是异常抛出来的
- data 不需要有数据，可以不用返回

为了解决这三个问题，可以这么做，首先我们创建一个基类 `abstract class Exception`, `php artisan make:exception BaseException`, 内容如下

```php
use Symfony\Component\HttpKernel\Exception\HttpException;

abstract class BaseException extends HttpException
{
    protected $code = 0;

    public function __construct(string $message = '', int $code = 0)
    {

        parent::__construct($this->statusCode(), $message ?: $this->message, null, [], $code);
    }

    /**
     * status code
     */
    public function statusCode(): int
    {
        // 对于异常统一返回 500，需要更改可以通过子类修改对应的 code
        return 500;
    }

    /**
     * 这里需要规定好对应的输出格式
     */
    public function render(): array
    {
        return [
            'code' => $this->code,

            'message' => $this->message,
        ];
    }
}
```

基类创建好之后呢，再来创建子类，因为业务中的错误类型各种各样，所以异常子类也是很多的，但是记住都需要继承 `BaseException`，还是用上面的 artisan 创建一个失败异常，代码如下

```php
namespace App\Exceptions;

use Exception;

class FailException extends BaseException
{
    //
    protected $code = 10001;

    protected $message = 'fail';
}

```

再回到控制中

```php
public function index()
{
     throw new FailException();
}
```

刷新浏览器之后，浏览器会输出正确的错误返回了。很不错，解决了上面的三个问题

```json
{
  "code": 10001,
  "message": "fail"
}
```

## 总结

这个方式多多少少有点黑盒了。对于刚接手的人，如果不去翻代码或者有人来讲解的话，可能多多少有点懵的 😂。但是如果了解了，我认为将 response json 这样输出从业务代码中解构出来还是蛮好的。如果应用的响应数据几乎不变动，个人更喜欢这样的方式去返回，不然控制器大量的 `response()->json()` 这样的代码看着挺烦人的。如有更好的方法，欢迎讨论。
