# Dify 本地启动指南（macOS / 开发与体验）

这份文档面向“在本机把 Dify 跑起来”的场景，覆盖两种方式：

- **方式 A：Docker Compose 一键启动（推荐先跑起来）**
- **方式 B：源码开发模式（推荐做二次开发）**：使用仓库内置 `./dev/*` 脚本启动 middleware + API + Web + Worker

> 端口默认占用：Web `3000`、API `5001`、PostgreSQL `5432`、Redis `6379`、Weaviate `8080`（不同启动方式端口略有差异）。

---

## 前置条件

### 必需软件

- **Docker**（推荐 Docker Desktop for Mac）
- **Node.js（必须 v22） + pnpm**（前端/工作区依赖；仓库根目录 `.nvmrc` 指定为 `22`）
- **uv**（后端 Python 包管理；本仓库 backend 已从 poetry 迁移到 uv）

### macOS（推荐）安装命令

如果你使用 Homebrew，推荐按下面安装/启用：

```bash
# 1) Docker Desktop（装完后需要手动打开一次 Docker.app）
brew install --cask docker

# 2) uv
brew install uv

# 3) Node 22（注意：node@22 是 keg-only，需要把它放到 PATH 最前）
brew install node@22
echo 'export PATH="/opt/homebrew/opt/node@22/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# 4) pnpm（用 corepack 管理）
corepack enable
```

### 快速自检（可选）

在仓库根目录执行：

```bash
docker --version
node -v
pnpm -v
uv --version
```

说明：

- **Docker daemon 必须在跑**：`docker run --rm hello-world` 能成功才算 OK
- 如果你看到 `docker: unknown command: docker compose`：没关系，本仓库 `docker/dify-compose` 脚本会自动使用 `docker-compose`（若系统提供）。

---

## 方式 A：Docker Compose 一键启动（最省事）

适合：你只想先把 Dify 控制台打开、能登录、能创建应用并体验功能。

### 启动

在仓库根目录执行：

```bash
cd docker
./dify-compose up -d
```

说明：

- `./dify-compose` 会自动创建 `docker/.env`（用于本地覆盖项）并为本次部署生成 `SECRET_KEY`。
- 默认配置来自 `docker/.env.default`，高级配置参考 `docker/.env.example`。

### 访问与初始化

启动完成后打开：

- **安装初始化页面**：`http://localhost/install`

按页面向导完成管理员初始化后即可进入控制台。

### 停止 / 重启 / 查看日志

```bash
cd docker
./dify-compose ps
./dify-compose logs -f --tail=200
./dify-compose restart
./dify-compose down
```

### 常见问题（Docker 一键）

- **端口被占用**：改 `docker/.env` 里的 `EXPOSE_NGINX_PORT`（或相关 expose 端口），再执行 `./dify-compose up -d`
- **需要换向量库/数据库**：修改 `docker/.env` 的 `VECTOR_STORE` / `DB_TYPE`，并确保 `COMPOSE_PROFILES` 与之匹配（默认已设置为 `${VECTOR_STORE},${DB_TYPE}`）
- **镜像拉取慢**：可在 Docker Desktop 配置镜像加速，或使用公司/本地镜像仓库

---

## 方式 B：源码开发模式（推荐做二开）

适合：你要改代码、调试接口、跑前端热更新。

该模式使用仓库内置脚本（推荐）：`api/README.md` 已给出标准流程。

### 1）初始化（复制 env + 安装依赖）

在仓库根目录执行：

```bash
./dev/setup
```

> **重要（Node 版本）**：如果你遇到 `pnpm` 报错 `node:sqlite` 或提示“pnpm requires Node.js v22”，基本都是因为当前 shell 还在用 Node 20。  
> 解决：确保 `node -v` 显示 `v22.*`（本仓库 `.nvmrc` 为 `22`），再重新执行 `./dev/setup`。

脚本会做：

- `api/.env.example` → `api/.env`
- `web/.env.example` → `web/.env.local`
- `docker/middleware.env.example` → `docker/middleware.env`
- 后端依赖：`cd api && uv sync --group dev`
- 前端依赖：`pnpm install`（在仓库根目录 workspace 安装）

### 2）启动 middleware（数据库/缓存/向量库）

```bash
./dev/start-docker-compose
```

它等价于在 `docker/` 目录下跑：

```bash
docker compose --env-file middleware.env -f docker-compose.middleware.yaml -p dify up -d
```

> 如果你想用本机已安装的 Postgres/Redis/Weaviate，也可以不启 middleware compose，但需自行确保 `api/.env` 里 DB/Redis/Vector 的 host/port 正确。

### 3）启动后端 API（含迁移）

```bash
./dev/start-api
```

脚本会先执行迁移：

- `uv run flask db upgrade`

然后启动 API：

- `uv run flask run --host 0.0.0.0 --port=5001 --debug`

API 默认地址：

- `http://localhost:5001`

### 4）启动前端 Web

```bash
./dev/start-web
```

Web 默认地址：

- `http://localhost:3000`

> 前端依赖安装在仓库根 workspace；无需额外 `cd web && pnpm install`。
>
> 当前仓库里，`./dev/start-web` 默认会启动 **vinext 开发服务器**（更适合这份源码分支的本地开发）。
>
> 若你想强制切回旧的 `next dev` 路线，可手动执行：
>
> ```bash
> NEXT_USE_NEXT_DEV=true ./dev/start-web
> ```
>
> 源码模式下更推荐访问 `http://localhost:3000`，不要优先测 `127.0.0.1:3000`，因为本地开发服务器可能只监听 `localhost` / `::1`。

### 5）启动 Worker（建议启动）

打开新终端执行：

```bash
./dev/start-worker
```

Worker 负责异步任务（知识库索引、工作流后台任务、计划任务等）。不启 worker 时，部分功能会“看起来能点但不执行/卡住”。

### （可选）启动 Beat

```bash
./dev/start-beat
```

---

## 本地开发（源码）日常怎么启动、访问哪里

源码模式 **不是** 只起一个命令就完事：中间件在 Docker 里，**API 和 Web 是宿主机上的两个独立进程**，关掉对应终端后端口会释放，浏览器就打不开。

### 每天要开哪些进程（建议 4 个终端，都在仓库根目录）

| 顺序 | 命令 | 作用 | 保持运行 |
| --- | --- | --- | --- |
| 1 | `./dev/start-docker-compose` | Postgres / Redis / Weaviate / Sandbox 等中间件 | 是（容器后台跑即可） |
| 2 | `./dev/start-api` | 后端 API + 自动迁移 | 是（终端不关） |
| 3 | `./dev/start-web` | 前端 Web 开发服（默认 vinext） | 是（终端不关） |
| 4 | `./dev/start-worker` | Celery 异步任务 | 强烈建议（不关） |

> 启动 Web 前请确认 `node -v` 为 **v22.x**（见上文「Node 版本」）。

### 浏览器访问地址（源码模式）

- **控制台（日常就打开这个）**：`http://localhost:3000`
- **API 根地址**（一般不在浏览器单独打开）：`http://localhost:5001`  
  前端通过 `web/.env.local` 里的 `NEXT_PUBLIC_API_PREFIX` / `NEXT_PUBLIC_PUBLIC_API_PREFIX` 请求该地址。

### 自检：服务是否真的在跑

若 `http://localhost:3000` 无法连接，先在本机执行：

```bash
lsof -nP -iTCP:3000 -sTCP:LISTEN
lsof -nP -iTCP:5001 -sTCP:LISTEN
```

- **两行都没有输出**：说明 **Web / API 没起来**（常见是只执行了 `./dev/start-docker-compose`，或关掉了跑 `start-api` / `start-web` 的终端）。请重新执行上表步骤 2、3。
- **有监听**：再试浏览器；若仍异常，看对应终端里的报错日志。

### 与 Docker 一键模式的区别（避免混用地址）

| 模式 | 控制台入口 |
| --- | --- |
| 源码开发 | `http://localhost:3000` |
| Docker 一键（`./dify-compose`） | `http://localhost/install`（经 Nginx，一般为 80 端口） |

---

## 启动后你应该看到什么

- `./dev/start-api` 终端有 Flask 启动日志，监听 `0.0.0.0:5001`
- `./dev/start-web` 终端有 vinext dev server 日志，监听 `localhost:3000`
- `./dev/start-worker` 终端有 Celery worker 启动日志
- 浏览器打开 `http://localhost:3000` 可以进入控制台并完成初始化/登录

---

## 源码开发模式下常见“黑框报错”说明

如果你用的是 **方式 B：源码开发模式**，偶尔会看到浏览器里弹出黑色错误浮层（dev overlay）。这类现象不一定代表“初始化数据坏了”或“后端挂了”，很多是 **前端开发模式** 本身把问题放大显示出来。

### 现象 1：`/apps` 页面出现 `Hydration failed`

常见表现：

- 浏览器打开 `http://localhost:3000/apps`
- 页面能加载，但会弹出 `Hydration failed because the server rendered text didn't match the client`

这类问题在本地源码开发模式下，**很常见是浏览器扩展注入脚本导致**，而不是 Dify 业务数据本身有问题。  
如果扩展在 React hydrate 之前改了页面 DOM，开发服务器就会把它当作 hydration mismatch 直接弹出来。

建议处理：

- 优先使用 **无痕窗口** 打开，并确认无痕里没有允许扩展运行
- 或临时禁用浏览器扩展后再访问
- 如果 Docker Compose 一键模式没有这个问题、源码模式有，通常就是因为源码模式是开发服务器，更容易把这种前端不一致直接暴露出来

### 现象 2：`/app/.../configuration` 页面出现 `ResizeObserver loop completed with undelivered notifications`

常见表现：

- 点击某个应用（如 AI 聊天）进入配置页
- 页面大体可用，但偶尔弹出 `ResizeObserver loop completed with undelivered notifications`

这类问题更像是 **前端开发态布局观察器 / 编辑器 / 调试浮层** 的兼容问题，被本地 dev overlay 放大显示。  
尤其是聊天预览、Prompt 编辑器、可伸缩面板等组件，在开发模式下更容易触发。

建议理解为：

- 如果页面功能基本正常、聊天/配置也能继续操作，通常不是初始化数据损坏
- 它更接近“当前源码分支的本地开发体验问题”，而不是 Docker 一键模式下用户一定会遇到的正式线上故障
- 刷新页面、减少浏览器扩展干扰后，很多时候会缓解或消失

### 为什么 Docker 一键模式不一定会碰到，源码模式却会碰到？

因为两种方式运行环境不同：

- **Docker Compose 一键启动** 更接近打包后的运行环境
- **源码开发模式** 跑的是开发服务器，带有 HMR、dev overlay、调试脚本、实时编译

所以一些“本来只是警告、短暂布局抖动、浏览器注入干扰”的问题，在源码开发模式下会被直接弹成黑框错误；而 Docker 一键模式下不一定会暴露得这么明显。

---

## 常见报错排查

### 1）Docker 未安装 / `docker: command not found`

安装 Docker Desktop for Mac，安装完成后确保：

- `docker --version` 正常输出
- `docker run --rm hello-world` 能成功（证明 daemon 正常）

如果报 `failed to connect to the docker API at unix:///var/run/docker.sock`，说明 Docker Desktop 还没启动或未完成初始化。

### 2）`pnpm: command not found`

建议启用 Corepack（Node 自带）：

```bash
corepack enable
```

然后再装依赖：

```bash
pnpm install
```

### 3）`uv: command not found`

推荐用 Homebrew：

```bash
brew install uv
```

然后重新跑：

```bash
./dev/setup
```

### 4）`pnpm` 报错 `No such built-in module: node:sqlite` / 提示需要 Node v22

这是 **Node 版本不符合** 导致（pnpm v11 需要 Node >= 22.13，本仓库 `.nvmrc` 也是 `22`）。

修复方式（Homebrew）：

```bash
brew install node@22
echo 'export PATH="/opt/homebrew/opt/node@22/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
node -v
```

确认 `node -v` 为 `v22.*` 后，再执行：

```bash
corepack enable
./dev/setup
```

### 5）数据库/Redis 连接失败

优先确认：

- middleware 是否启动：`docker ps`
- `api/.env` 里的 `DB_HOST/DB_PORT`、`REDIS_HOST/REDIS_PORT` 是否与实际一致

源码开发模式下，若你使用 `./dev/start-docker-compose`，通常 DB host 会是 compose 服务名（例如 `db_postgres`、`redis`），而不是 `localhost`。

---

## 清理与重置（谨慎）

Docker 一键启动模式下，如果你想“完全重来”，通常需要：

```bash
cd docker
./dify-compose down
```

然后根据你的数据卷挂载配置删除 volumes（会丢数据，谨慎操作）。

