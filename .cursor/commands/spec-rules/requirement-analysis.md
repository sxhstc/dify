---
name: requirement-analysis
description: 需求分析规则库，被 onespec-generate-prd 调用
---

# OneSpec Requirement Analysis Rules

本文件定义了需求分析的核心逻辑与标准，由 `onespec-generate-prd` 命令调用。

<background_information>
- **定位**: 纯粹的分析规则库，不处理用户交互或参数解析。
- **输入**: 
  - `user-story`: 原始需求描述
  - `feature-name`: 功能标识符
  - `project-context`: 现有代码与文档上下文
- **输出**: 
  - 澄清问题清单 (Questions) OR 分析通过确认 (Pass)
</background_information>

<instructions>
<!-- START -->
## 分析执行步骤

### 1. 上下文与代码探索 (Context Exploration)
**目标**: 建立需求与现有系统的映射关系。

1.  **文档阅读**: 
    - 扫描当前所有工作区，查找路径匹配 `.cursor/rules/ai-readme/RULE.mdc` 的文件并读取。
    - 根据工作区根目录是否包含 `pom.xml` 判断为后端，包含 `package.json` 判断为前端。
    - 将读取到的内容作为代码探索的上下文基础。
2.  **代码映射**: 
    - 根据 `user-story` 中的关键词，在识别出的后端代码目录中搜索。
    - **重点关注**: 
        - 现有的 BO (Business Object) 定义：避免重复造轮子或字段冲突。
        - 数据校验规则 (Validation)：复用现有的校验逻辑。
        - 现有接口 (Controller/API)：确认是新增接口还是修改现有接口。
    - **前端关联**: 
        - 如果涉及 UI，在识别出的前端代码目录中查看组件库或类似页面。

### 2. 逻辑漏洞检测 (Gap Detection)
**目标**: 找出需求中的模糊、冲突或缺失点。

请检查以下维度：
- **角色与权限**: 谁可以执行此操作？是否需要特殊权限？
- **数据流转**: 数据的输入来源是什么？存储在哪里？输出给谁？
- **异常流程**: 如果网络失败、数据校验不通过、关联数据不存在，系统应如何反应？
- **状态机**: 业务对象的状态流转是否闭环？(例如：创建 -> 审核 -> 发布 -> 归档)

### 3. 输出判定 (Decision Making)

根据上述分析，选择以下一种路径输出：

#### 路径 A: 发现模糊点 (Ambiguity Found)
如果在分析中发现以下情况：
- 缺少关键字段定义
- 业务流程中断
- 与现有代码逻辑直接冲突且未说明原因

**执行动作**:
1. 在 `onespec/prd/<feature-name>/` 目录下生成 `questions.md`。
2. 格式如下：
   ```markdown
   # 需求澄清问题 - <feature-name>
   > 基于 User Story: "..."

   ## [Question 1]
   {问题描述}
   - **上下文**: 发现现有代码 `UserBO.java` 中存在类似字段...
   - **风险**: 如果不明确，可能导致...

   ### [Answer]
   {等待填写}
   ```

#### 路径 B: 需求清晰 (Analysis Passed)
如果需求逻辑自洽，且与现有系统兼容。

**执行动作**:
1. 输出简短的分析摘要：
   - **核心功能**: [列表]
   - **涉及模块**: [文件路径]
   - **关键约束**: [描述]
2. 明确输出指令：“需求清晰，分析通过”。

</instructions>
