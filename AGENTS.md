# AGENTS.md

## 项目概述

Dify 是开源 LLM 应用开发平台，提供工作流编排、RAG 流水线、Agent 能力、模型管理与可观测性。本仓库为全栈 monorepo，包含：

- **后端 API**（`api/`）：Python 3.12 + Flask 3，DDD + Clean Architecture
- **前端 Web**（`web/`）：Next.js 16 + React 19 + TypeScript（默认 Vinext 开发服务器）
- **Docker 部署**（`docker/`）：Compose 主/中间件双形态 + Nginx + Sandbox + SSRF Proxy + Plugin Daemon
- **共享 packages**（`packages/`）：`@dify/contracts`、`@langgenius/dify-ui`、`@dify/iconify-collections`、`@langgenius/dev-proxy`、`@dify/tsconfig`
- **端到端测试**（`e2e/`）：Cucumber + Playwright
- **客户端 SDK**（`sdks/`）：`nodejs-client`、`php-client`

## 开发命令

源码模式（推荐二开）：

- 安装/初始化：`./dev/setup`（复制 `.env`，运行 `uv sync --group dev` + `pnpm install`）
- 启动中间件：`./dev/start-docker-compose`
- 启动后端 API：`./dev/start-api`（自动 `flask db upgrade` + `flask run --port 5001 --debug`）
- 启动前端 Web：`./dev/start-web`（默认 vinext；`NEXT_USE_NEXT_DEV=true` 切回 `next dev --webpack`）
- 启动 Celery Worker：`./dev/start-worker`（按 `EDITION` 自动选默认队列）
- 启动 Celery Beat（可选）：`./dev/start-beat`
- 一键部署：`cd docker && ./dify-compose up -d`
- 后端 CLI：`uv run --project api <command>`

## 测试说明

- 后端单元测试：`uv run --project api pytest tests/unit_tests/`
- 后端容器集成测试：CI-only，本地不要求跑通
- 后端代码质量：`make lint` / `make type-check` / `make format`
- 前端单测：`pnpm -C web test`（实际通过 `vp test` 执行）
- 前端类型检查：`pnpm -C web type-check`
- 前端 Lint 修复：`pnpm lint:fix`（推荐）
- 前端 Storybook：`pnpm -C web storybook`
- E2E：`pnpm -C e2e e2e`（默认排除 `@fresh`）；`pnpm -C e2e e2e:full` 含 `@fresh`

## 技术栈简介

- 语言/运行时：Python `~=3.12.0` + Node.js `^22.22.1`
- 后端：Flask 3 / SQLAlchemy / Pydantic v2 / Celery / FastOpenAPI / OpenTelemetry / Gunicorn
- 前端：Next.js 16 + React 19 + Vinext + TanStack Query + Zustand + Jotai + nuqs + Lexical + ReactFlow + Tailwind v4
- 测试：pytest（后端）+ Vitest + RTL（前端）+ Cucumber + Playwright（E2E）+ Storybook（UI）
- 包管理：`pnpm@11.0.8`（workspace + catalog） + `uv`（workspace + dependency-groups）
- 部署：Docker Compose + Nginx + Sandbox + SSRF Proxy + Plugin Daemon

## 关键目录

- `api/controllers/{console,service_api,web,files,inner_api,mcp,trigger}/` - HTTP 入口分组
- `api/services/` - 应用服务（用例编排，事务边界）
- `api/core/{app,workflow,rag,agent,tools,plugin,...}/` - 领域核心（业务规则）
- `api/models/` - SQLAlchemy 模型（约 110+ 表家族）
- `api/tasks/` + `api/schedule/` - Celery worker / beat
- `api/providers/{vdb,trace}/*` - 30 个向量库 + 8 个链路追踪适配
- `web/app/` - Next.js App Router 页面（按业务域组件化）
- `web/contract/` + `packages/contracts/` - oRPC + Zod contract（与后端 API 1:1）
- `packages/dify-ui/` - 通用 overlay/portal/UI 原语
- `docker/` - Docker Compose、Nginx、SSRF Proxy 等部署配置
- `dev/` - 本地开发统一入口脚本

## 边界约束

- 后端遵循 DDD：controller → service → core → repository → model；不得跨层直连
- 多租户：`tenant_id` 必须贯穿到所有共享资源访问
- 后端禁止直读 `os.environ`，统一走 `configs.dify_config`
- 后端避免 `Any`，优先 `TypedDict` / `NotRequired`，类成员显式声明类型
- 后端 CLI 必须通过 `uv run --project api <command>`；Agent 不得启动长进程
- 前端所有面向用户字符串必须走 `web/i18n/en-US/`，禁止硬编码
- 前端新代码 overlay 只能用 `@langgenius/dify-ui/*`，不得新增旧 overlay 引用
- 前端 Query/Mutation 优先 `consoleQuery` / `marketplaceQuery` 的 `queryOptions` / `mutationOptions`，不要写 use-* 透传 hook
- 前端避免 `any`，依赖严格 ESLint + tsslint
- 测试遵循 TDD：red → green → refactor
- 编辑代码前必读相关 docstring / 注释，发现冲突以代码为准并同步更新文档
- 仅在用户明确要求时新建文档；优先编辑既有文件

## 子工作区指引

- 后端工作区指引：见 `api/AGENTS.md`
- 前端工作区指引：见 `web/AGENTS.md`
- E2E 工作区指引：见 `e2e/AGENTS.md`
- UI 包工作区指引：见 `packages/dify-ui/AGENTS.md`

## AI 上下文

详细的项目上下文（架构、核心流程、API 定义、状态管理、测试规范等）请参阅 `.cursor/rules/ai-readme/RULE.mdc`。
