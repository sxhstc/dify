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
> `./dev/start-web` 会用 `next dev --inspect`，默认调试端口是 `9229`。如果你看到 `9229 already in use`，不影响站点访问；只是调试端口冲突。

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

## 启动后你应该看到什么

- `./dev/start-api` 终端有 Flask 启动日志，监听 `0.0.0.0:5001`
- `./dev/start-web` 终端有 Next.js/vinext dev server 日志，监听 `localhost:3000`
- `./dev/start-worker` 终端有 Celery worker 启动日志
- 浏览器打开 `http://localhost:3000` 可以进入控制台并完成初始化/登录

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

### 4）数据库/Redis 连接失败

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

