---
title: 记一次网站迁移
---

# 记一次官网迁移

最近在群里做了官网升级投票，大家一致认为需要给官网换换皮肤，遂趁着 Laravel11 发布前夕，将官网全部使用 Laravel11 重构了。这里必须夸夸 Laravel11，真的是 too simple，骨架非常简单。项目也可以无缝升级。期待发布。
主要分为以下步骤
[[toc]]

## 迁移代码

因为最近腾讯云服务器快到期了，所以正好有新买了服务器，所以需要做代码迁移。迁移过程就很简单，使用 `scp` 将代码拉到了新的服务器。使用 `scp` 真的非常方便。

```shell
#前面是远程服务器的目录
#后面是下载的当前目录
scp -r username@host:/path ./path
```

目前 `CatchAdmin` 官网是使用 Docker 部署的。目录分布是这样的

```js
|-- docker-compose.yaml // docker compose
|-- nginx // nginx 目录
|-- mysql // mysql 目录
|-- php // php 目录
|-- project // 项目目录
|-- redis // reids
|-- gitea // gitea 服务
```

除了 `project` 目录，其他的都是一个一个拉过去的，因为` project` 目录的项目之后都是 `github action` 自动部署了，所以就不拉取了。

## 部署新环境

项目代码迁移的过程没有什么好说的，非常顺利。然后就是环境。环境其实也没啥问题，`docker-compose` 已经打包了环境，可以直接使用，只不过其中有的 docker 镜像无法使用，因为是本地的镜像，没有提交到 docker hub，所以无法使用。本来打算将这些镜像推送到 Docker hub，无奈国内的网络环境实在是太恶劣，根本没有办法推送，所以只能将镜像打包传输了。

### 打包镜像

使用下面两个命令迁移镜像

```sh
# 把镜像打包成 tar
docker save image:latest > image.tar

```

打包成 tar 之后呢，再使用 `scp` 拉取这个镜像包，然后在新服务器导入

```sh
#导入
docker load image.tar
```

ok，所以一次准备就绪之后，下载 Docker，因为我的系统使用的 `Centos`，所以要先查看 Docker 文档安装 Docker，如下:

```sh
yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# 这一步直接安装 docker
yum install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

直接启动吧 🚀，等等，不是使用 `Docker compose` 吗? 为什么没有安装呢？因为 `Docker compose` 已经安装过了啊，因为现在它已经升级了, 就是这个

```sh
yun install docker-compose-plugin
```

在上面的命令已经安装过了 👌。直接

```sh
docker compose up -d
```

输出一个报错，说网络不存在。好吧，docker compose 的确，没有创建 network。我是用的网络叫做 `lnmp`，所以直接使用

```sh
docker network create lnmp
```

创建网络即可，再次 `up`。成功启动。

但是在使用 `docker ps` 发现 nginx 没有启动，通过 `docker logs nginx` 日志查看发现，SSL 证书没有了 😭，需要重新搞证书了。

### 创建证书

之前使用 acmesh，这次也使用它吧，为了保证下次迁移，还是使用 acme 的镜像吧。如下是 docker compose 的配置

```
acme:
    image: neilpang/acme.sh
    container_name: acme
    volumes:
      - ./nginx/acme:/acme.sh
    command: "daemon"
    environment:
      TZ: Asia/Shanghai
      DP_Id: ******
      DP_Key: ******************************
```

因为我的服务器是腾讯云的，所以使用 DNSPOD 做解析，DP_Id（DNSPod 密钥 ID）、DP_Key（DNSPod 密钥 token） 通过 [DNSPod 控制台](https://console.dnspod.cn/account/token/token)获取
为了方便，做一个 alias 使用
::: code-group

```sh[/etc/profile]
alias acme='docker exec -i acme acme.sh'

source /etc/profile
```

:::

来申请证书

```sh
# 注册下邮箱
acme --register-account -m xxx@email.com

# 申请
acme --issue --dns dns_dp -d catchadmin.com -d *.catchadmin.com
```

这个步骤是自动的，申请完成之后，证书就回下载到 `volumes` 设置的目录，可根据实际配置证书

::: warning
申请证书期间会请求 github，还是由于国内恶劣的网络环境，会导致申请不了，需要配置下 host，亲测可以解决。
:::

::: code-group

```sh[/etc/hosts]
20.27.177.113 github.com
185.199.110.133 raw.githubusercontent.com
```

:::
千万不要复制上面的 host 配置，你需要先查询，有可能会变化，所以，你先使用[站长工具](https://ping.chinaz.com/github.com)查询，ping 检测哪个 IP 地址是通的，就用哪个。相同的 raw.githubusercontent.com 这个也是一样。

## CI/CD 自动化

好了，环境，环境相关代码数据都已经迁移好了，就差项目代码了。现在 `CatchAdmin` 项目都是很原始的需要人工去手动拉取代码。这里是说项目代码，之前的官网因为是静态文档，所以使用的 github action 部署。但是 PHP 相关的项目却没有，这次深入了解了 github action 之后，终于实现自动部署。

这里展示下官网的部署 yml 配置，有需要的小伙伴可以根据这个配置修改部署自己的项目。前提有一点哈，没法自动创建 `.env` 文件 😂，`.env `环境文件还需要自己手动去创建，因为里面涉及到一些配置。

```yml
name: 官网构建
on:
  push:
    branches:
      - master
jobs:
  deploy:
    runs-on: ubuntu-latest
    env:
      Exclude: '/node_modules/,/.git/,/.github,/docs,/.env'
      VENDOR: ${{ secrets.SERVER_WORKDIR }}/vendor
      ENVFILE: ${{ secrets.SERVER_WORKDIR }}/.env

    steps:
      # checkout master 分支
      - name: Checkout
        uses: actions/checkout@master

      # 设置 PHP
      - name: Setup PHP with PECL extension
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.2'
          tools: composer:v2

      # 检查 vendor
      - name: webfactory/ssh-agent
        uses: webfactory/ssh-agent@v0.8.0
        with:
          ssh-private-key: ${{ secrets.SERVER_SECRET }}
      - name: Cache Composer dependencies
        uses: actions/cache@v3
        with:
          path: vendor
          key: ${{ runner.os }}-official-composer-${{ hashFiles('**/composer.json') }}
          restore-keys: |
            ${{ runner.os }}-official-composer-

      # 安装 composer 依赖
      - name: composer install
        run: |
          composer install
          composer dump-autoload

      ## 判断是否有 .env 文件
      - name: Check .env
        id: check_env
        run: |
          ssh -o StrictHostKeyChecking=no ${{secrets.SERVER_USERNAME}}@${{secrets.SERVER_HOST}} 'if [ -d "$ENVFILE" ]; then exit 1; else exit 0; fi'
        continue-on-error: true

      ## 如果 .env 不存在，就生成
      - name: generate .env
        if: steps.check_env.outcome == 'failure'
        run: |
          cp .env.example .env
          php artisan key:generate

      # 部署前端
      - name: Install and Build assets
        run: |
          yarn install
          yarn build

      - name: 部署官网
        uses: easingthemes/ssh-deploy@v5.0.0
        with:
          REMOTE_HOST: ${{ secrets.SERVER_HOST }}
          REMOTE_USER: ${{ secrets.SERVER_USERNAME }}
          SSH_PRIVATE_KEY: ${{ secrets.SERVER_SECRET }}
          ARGS: -rlgoDzc -i --delete
          SOURCE: '.'
          REMOTE_PORT: ${{ secrets.SERVER_PORT }}
          TARGET: ${{ secrets.SERVER_WORKDIR }}
          EXCLUDE: ${{ env.Exclude }}

      ## Laravel Optimize
      - name: optimize
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USERNAME }}
          key: ${{ secrets.SERVER_SECRET }}
          port: ${{ secrets.SERVER_PORT }}
          script: |
            cd ${{ secrets.SERVER_WORKDIR }}
            composer dump-autoload
            php artisan optimize:clear
            php artisan optimize
        continue-on-error: true
```

下次可以详细说说 Github Action，🤪 可以多多点赞(骗赞)

## 部署新文档

文档还是一如既往的使用静态文档，这次我还是选择了 vue 社区的 `vitepress`，因为足够简单。可能我也比较熟悉 Vue。`docusaurus` 也蛮好的，只不过在一些扩展方面的确不如这个方便，我也是相互对比一下。还有一点考虑到的时候，`docusaurus` 是满屏的布局，文档焦点没法聚集。`vitepress` 布局适合看文档，内容聚集在中间一块 Block。我个人体验比 `docusaurus` 要好。

好了，废话不多说，文档我是和官网放在一块的，也就是官网的根目录，并没有在官网的 public 目录下。看下 Github Action Workflow 的配置

```yml
name: Build and Deploy
on:
  push:
    branches:
      - master
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@master

      - name: Install and Build
        run: |
          yarn install
          yarn docs:build
      - name: Deploy
        uses: easingthemes/ssh-deploy@v5.0.0
        with:
          REMOTE_HOST: ${{ secrets.SERVER_HOST }}
          REMOTE_USER: ${{ secrets.SERVER_USERNAME }}
          SSH_PRIVATE_KEY: ${{ secrets.SERVER_SECRET }}
          ARGS: -avzr --delete
          SOURCE: 'docs/.vitepress/dist/'
          REMOTE_PORT: ${{ secrets.SERVER_PORT }}
          TARGET: ${{ secrets.SERVER_WORKDIR }}
          EXCLUDE: '/docs/.vitepress/, /node_modules/, /.github,/.git'
```

前端项目部署相对比较简单，就是上传静态文件就行了。我是将文档上传到 Docs 目录下。好的，你会发现它是和官网同域名，挂载在一个目录下。这种是可以通过 nginx 来实现，来看下, 这里不展示全部了，只展示相关的 location 配置
::: code-group

```conf[official.conf]
server
{
    // 这里是全匹配 301
    location = /docs/3.0/catchadmin/project_intro {
            return 301 /docs/3.0/start/project_intro;
    }

    // 这里是全匹配 301
    location = /docs/3.0/catchadmin/install {
         return 301 /docs/3.0/start/install;
    }

    // 文档的前缀都是 /docs
    // 所以需要匹配 /docs
    // 然后修改 root 目录
    location ^~ /docs {
        root /var/www/html/official/docs;

        // 因为发现百度有一些链接以 / 结尾，导致不可用，这里去除斜杠
        rewrite ^/(.*)/$ /$1 permanent;

        // 因为 vitepress 都是以 .html 结尾的文件，链接并没有，所以要去除 .html
        try_files $uri $uri.html $uri/ /docs/3.0/intro;
    }
}
```

:::
好了，以上就是 `CatchAdmin` 这次迁移的全过程，虽然写起来非常短，但其实过程还是很漫长的。所以现在可以去新官网看下咯
[CatchAdmin 官网](https://catchadmin.com)
