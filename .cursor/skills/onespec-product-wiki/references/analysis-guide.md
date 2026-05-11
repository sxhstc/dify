---
alwaysApply: true
---

# 跨仓库分析规则

## 工具选择

| 操作 | 推荐工具 | 约束说明 |
|------|---------|---------|
| 读取仓库目录结构 | ls -R | 仅读根目录一级，不递归展开（`ls -d */`） |
| 读取 ai-readme 文档 | Read（完整文件） | 路径：`.cursor/rules/ai-readme/{generated,manual}/*.mdc` |
| 搜索 API 定义/调用 | Grep | 结果超 10 个文件时，取相关度最高 5 个；读取时使用 `Read(offset, limit)` 切片 |
| 读取依赖配置 | Read | `package.json` / `pom.xml` / `requirements.txt`，每个仓库读一次 |
| 外部领域知识查询 | WebSearch/WebFetch | 仅在技术栈无法识别时使用 |

## AI-Readme 读取规则

**路径约定**（按优先级顺序读取）：

| 优先级 | 路径 | 说明 |
|--------|------|------|
| 1 | `.cursor/rules/ai-readme/generated/*.mdc` | 自动生成文档 |
| 2 | `.cursor/rules/ai-readme/manual/*.mdc` | 手动维护文档 |

**缺失时降级**：
- IF 仓库存在 `.cursor/rules/ai-readme/` 目录但无文件 → 警告 + 直接分析代码
- IF 仓库不存在该目录 → 跳过 ai-readme 步骤，直接分析根目录结构和配置文件

## 4 类搜索关键词

### 1. API 定义搜索

| 技术栈 | 关键词 |
|--------|--------|
| Node.js / Express | `router`, `app.get`, `app.post`, `app.put`, `app.delete`, `@Controller` |
| Spring Boot | `@RestController`, `@RequestMapping`, `@GetMapping`, `@PostMapping` |
| FastAPI / Flask | `@app.route`, `@router.get`, `@router.post` |
| 通用 | `endpoint`, `route`, `handler` |

### 2. API 调用搜索

| 技术栈 | 关键词 |
|--------|--------|
| 前端 / Node.js | `fetch(`, `axios.`, `request(`, `http.get`, `http.post` |
| Java | `RestTemplate`, `WebClient`, `HttpClient`, `feign` |
| Python | `requests.get`, `requests.post`, `httpx.` |

### 3. 配置引用搜索

目标：发现跨服务依赖的 URL、端口、域名配置

关键词：`http://`, `https://`, `:8080`, `:3000`, `SERVICE_URL`, `API_URL`, `BASE_URL`, `HOST`

路径重点：`application.yml`, `application.properties`, `.env`, `config.js`, `config.ts`

### 4. 共享模型搜索

目标：识别跨仓库复用的数据结构（DTO、接口定义、类型声明）

判断标准：
- 多个仓库中出现相同的类名/接口名/类型名
- 仓库间存在公共包依赖（如 common-lib、shared-types）
- 存在独立的 schema 仓库或 proto 文件仓库
