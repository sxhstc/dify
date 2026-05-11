---
name: onespec-product-wiki
description: 基于工作区多仓库代码分析，生成跨服务架构 Wiki 规则文件（整体架构、服务关联、数据流、认证权限），输出至 .cursor/rules/product-wiki/ 供全局上下文消费。当用户提到"onespec-product-wiki"、"多仓库wiki"、"系统架构wiki" 或 "服务关系文档"触发此技能。
---

# OneSpec 产品架构 Wiki

分析工作区所有仓库，生成跨服务架构 Wiki 至 `.cursor/rules/product-wiki/*.mdc`。以 ai-readme 为输入源，聚焦**跨服务**架构关系（视角与 ai-readme 互补，非替代）。

## 参数

- `scope`：(可选) 分析范围，默认工作区所有仓库

**scope 决策树**：

```
IF 用户提供 scope → 仅分析指定仓库
ELSE → 探测工作区所有 git 仓库
  IF 仅 1 个仓库
    → 警告"跨服务分析价值有限，建议使用 ai-readme"
    → 询问「继续生成 wiki / 切换为 ai-readme」，等待回复后执行
  ELSE → 继续多仓库分析流程
```

## 执行步骤

### 步骤 1：快速概览

1. 按 scope 决策树确认仓库列表
2. 读取各仓库根目录结构（一级，不递归）
3. 读取 `package.json` / `pom.xml` / `requirements.txt` 了解技术栈

> ⛔ 禁止以链接形式引用 ai-readme，必须直接提取文本内容使用

### 步骤 2：关联分析 + 深入分析

→ **读取 `references/analysis-guide.md`**，按其工具选择表和关键词表执行：

1. 读取各仓库 ai-readme 文档
2. 搜索 API 定义、API 调用、配置引用、共享模型
3. 分析各仓库目录结构，识别核心模块职责
4. 梳理认证方式、权限管理逻辑、异步事件处理（定时任务/MQ）

> ⛔ 禁止在分析未完成前跳过确认直接写文件

**强制检查点**：完成以上分析后，必须按以下格式输出并等待用户回复「生成」后再进入步骤 3：

```
📋 分析完成 — 确认生成 Wiki
- 覆盖仓库：N 个（[仓库1, 仓库2, ...]）
- ai-readme 来源：[已读取 / 未找到（直接分析代码）]
- 识别的核心服务：[服务1（职责概述）, 服务2（职责概述）]
- 主要关联关系：[仓库A → 仓库B（REST / MQ）, ...]
- 认证方式：[OPPO 云 / 4A / 未识别]
确认请回复「生成」，或提供修正意见。
```

### 步骤 3：生成 Wiki 规则文件

→ **读取 `references/wiki-structure.md`**，在**本命令所在仓库**的 `.cursor/rules/product-wiki/` 下生成：
`index.mdc`（概述导航）、`architecture.mdc`（架构图）、`relations.mdc`（服务关联）、`data-flow.mdc`（数据流）

> ⛔ 禁止 wiki 内容以引用形式指向 ai-readme，所有内容必须直接写入  
> ⛔ 禁止 `alwaysApply: true`，每个文件必须设置 `alwaysApply: false`

### 步骤 4：结果反馈

```
✅ 产品架构 Wiki 已生成
- 覆盖仓库：N 个（[仓库名列表]）
- 生成文件：
  - `.cursor/rules/product-wiki/index.mdc`（[一句话说明覆盖内容]）
  - `.cursor/rules/product-wiki/architecture.mdc`（[一句话说明覆盖内容]）
  - `.cursor/rules/product-wiki/relations.mdc`（[一句话说明覆盖内容]）
  - `.cursor/rules/product-wiki/data-flow.mdc`（[一句话说明覆盖内容]）
下一步：可向 Cursor 提问跨服务架构问题，相关 wiki 将按需自动注入上下文。
```

## 错误处理

| 情况 | 处理方式 |
|------|---------|
| ai-readme 缺失 | 警告"仓库 [名称] 缺少 ai-readme，将直接分析代码"，继续执行 |
| 技术栈无法识别 | 标注"未识别技术栈"，继续分析目录结构 |
| 单仓库场景 | 已在 scope 决策树中处理 |
