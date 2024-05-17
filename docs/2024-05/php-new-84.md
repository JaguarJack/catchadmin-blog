# 前瞻 PHP8.4 的新特性

PHP 8.4 将于 2024 年 11 月 21 日发布。它将包括属性钩子、JIT 改进，以及在不需要额外括号的情况下链式调用方法。这是一个大变化！

## 属性钩子 RFC

现代 PHP 历史上最大的变化之一：定义属性钩子的能力。

```php
class BookViewModel
{
    public function __construct(
        private array $authors,
    ) {}

    public string $credits {
        get {
            return implode(', ', array_map(
                fn (Author $author) => $author->name,
                $this->authors,
            ));
        }
    }

    public Author $mainAuthor {
        set (Author $mainAuthor) {
            $this->authors[] = $mainAuthor;
            $this->mainAuthor = $mainAuthor;
        }

        get => $this->mainAuthor;
    }
}
```

属性钩子的目标是通过允许每个属性定义自己的 get 和 set 钩子，去除大量的 getter 和 setter。钩子是可选的，不必在特定属性上同时添加两个钩子。例如，只有 get 钩子的属性是虚拟属性。这应该是目前 PHP 8.4 最大的更新了，非常期待，又少写了好多代码 😂

```php
interface HasAuthors
{
    public string $credits { get; }
    public Author $mainAuthor { get; set; }
}
```

## 无需括号的新实例链式调用 RFC

如果属性钩子还不够，PHP 8.4 还有一个功能可以节省大量代码, 那就是不再需要将新实例调用包裹在括号内才能链式调用方法。这个修改个人觉得蛮好的，想到每次都需要这样

```php
$name = (new ReflectionClass($objectOrClass))->getShortName();
```

现在(php8.4)只需要这样做

```php
$name = new ReflectionClass($objectOrClass)->getShortName();
```

## JIT 改变 RFC

PHP 8.4 改变了启用 `JIT` 的方式。在 PHP 8.4 之前，必须将 `opcache.jit_buffer_size` 设置为 `0` 才能禁用 JIT，但现在可以这样禁用它：

```ini
opcache.jit=disable
opcache.jit_buffer_size=64m
```

用户受到此更改影响的唯一方式是如果他们指定了 `opcache.jit_buffer_size` 但没有 `opcache.jit`。在这种情况下，就必须添加 `opcache.jit=tracing` 来重新启用 `JIT`。

最后，还对 `JIT` 进行了改进，使其在某些情况下运行更快，并使用更少的内存。

## 隐式可空类型弃用

PHP 有一个奇怪的行为，带有默认 null 值的类型化变量会自动变为可空类型：

```php
function save(Book $book = null) {}
```

这种行为现在已被弃用，并将在 `PHP9` 中删除。解决方案是将 `Book` 显式设为可空类型：

```php
function save(?Book $book = null) {}
```

## 新 DOM HTML5 支持 RFC

PHP 8.4 添加了一个 `\Dom\HTMLDocument` 类，能够正确解析 HTML5 代码。旧的 `\DOMDocument` 类仍然可用以保持向后兼容。

```php
$doc = \Dom\HTMLDocument::createFromString($contents);
```

[文章转载](https://stitcher.io/blog/new-in-php-84)
