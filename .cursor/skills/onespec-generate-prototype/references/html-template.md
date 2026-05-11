---
alwaysApply: true
---

# HTML 原型模板与技术约束

生成前须完成 **技术栈探测**（读取根目录 `package.json`，必要时读 lock 文件），得到 **`VUE_VERSION`**、**`ELEMENT_UI_VERSION`**（或 Vue3 时的 **`ELEMENT_PLUS_VERSION`**）后再写 HTML。**下述 URL 中的版本号必须为探测结果**，示例中的 `2.x.x` 仅作占位。

---

## 第一节：Vue 2 + Element UI 2（el-admin 式）

### 基础 HTML 模板

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[功能名称] - 原型预览</title>
  <link rel="stylesheet" href="https://unpkg.com/element-ui@ELEMENT_UI_VERSION/lib/theme-chalk/index.css">
  <script src="https://unpkg.com/vue@VUE_VERSION/dist/vue.js"></script>
  <script src="https://unpkg.com/element-ui@ELEMENT_UI_VERSION/lib/index.js"></script>
  <!-- 中文：版本与上一行 element-ui 一致；若 CDN 404 以当前包内实际路径为准 -->
  <script src="https://unpkg.com/element-ui@ELEMENT_UI_VERSION/lib/umd/locale/zh-cn.js"></script>
  <style>
    [v-cloak] { display: none; }
    body { margin: 0; font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif; background: #f0f2f5; }
    .app-container { padding: 20px; background: #fff; }
  </style>
</head>
<body>
  <div id="app" v-cloak>
    <!-- 或使用 type="text/x-template" id="tpl" + template: '#tpl' -->
  </div>
  <script>
    if (typeof ELEMENT !== 'undefined' && ELEMENT.lang && ELEMENT.lang.zhCn) {
      ELEMENT.locale(ELEMENT.lang.zhCn);
    }
    Vue.use(ELEMENT);

    new Vue({
      el: '#app',
      data: function () {
        return { loading: false };
      },
      methods: {
        toastOk: function () {
          this.$message.success('操作成功（Mock）');
        }
      }
    });
  </script>
</body>
</html>
```

> **说明**：`ELEMENT` / `locale` 以当前 Element UI UMD 包实际导出为准；若 CDN 路径变更，以 [Element UI 官方文档](https://element.eleme.io) 为准微调 `script` 顺序与 `locale` 写法。

### 写法约束（Vue 2）

| 要求 | 说明 |
|------|------|
| API | **Options API**：`data` / `methods` / `computed`，禁止 `setup` + Composition API（除非仓库为 Vue3） |
| 表格插槽 | 使用 **`slot-scope`**（与仓库 Vue 2.5 习惯一致） |
| 消息与确认 | **`this.$message`**、**`this.$confirm`**（非 `ElMessage`） |
| 弹窗 | `el-dialog` 使用 **`:visible.sync="dialogVisible"`**（Vue 2 + Element UI 2） |
| 禁止 | `import`、`createApp`、`ElementPlus`、`el-config-provider`、TypeScript |

### 与现网一致的形态（结合 `style_ref`）

- 列表页：`el-form` **`inline`**、`label-width="99px"`（以参考文件为准）、控件 **`size="small"`**；查询 **`type="warning"`**、重置 **`type="success"`**（与 `head.vue` 常见写法一致）；表格 **`size="small"` `border`**。
- 主内容区类名：外层 **`app-container`**，与 `src/views/**/index.vue` 一致。
- **不默认**绘制整站左侧菜单；避免侵占横向空间。

### Mock 数据

- 3–5 条高拟真；禁止 `Test1`、占位式人名。
- 声明：虚构数据勿写入正式 Spec / Proposal。

### 交互完整性

| 要求 | Vue 2 + Element UI 写法示例 |
|------|------------------------------|
| Toast | `this.$message.success` / `error` |
| 二次确认 | `this.$confirm(...).then(...).catch(...)` |
| 表单校验 | `this.$refs.form.validate((valid) => { ... })` |
| Loading | `v-loading` 或按钮 `:loading="true"` |

### 图标

- **内联 SVG**，或 `el-button` 的 **`icon="el-icon-xxx"`**（Element UI 自带图标字体）。

### 禁止事项（Vue2 原型）

| 禁止 | 正确做法 |
|------|----------|
| `import` / ES modules | 全局 `Vue`、`Vue.use(ELEMENT)` |
| Vue3 + Element Plus API | 按本节使用 Vue2 + Element UI |
| Unocss Runtime | 本仓库不用；用少量 `<style>` 与 Element 主题 |
| 无响应的按钮 | Happy Path 必须可点通 |

---

## 第二节：Vue 3 + Element Plus（其他仓库备选）

仅当技术栈探测为 **Vue 3 + `element-plus`** 时使用；**`VUE_VERSION`**、**`ELEMENT_PLUS_VERSION`** 须替换为 `package.json`/lock 中的实际版本（勿使用本节以外的固定号）。

```html
<script src="https://unpkg.com/vue@VUE_VERSION/dist/vue.global.js"></script>
<link rel="stylesheet" href="https://unpkg.com/element-plus@ELEMENT_PLUS_VERSION/dist/index.css" />
<script src="https://unpkg.com/element-plus@ELEMENT_PLUS_VERSION/dist/index.full.js"></script>
```

> 若 `index.full.js` 与贵司 lock 中解析路径不一致，以 **node_modules 中实际 UMD 文件名** 或官方文档为准调整 `script` `src`。

```javascript
const { createApp, ref } = Vue;
const { ElMessage, ElMessageBox } = ElementPlus;
const app = createApp({ /* setup */ });
app.use(ElementPlus);
app.mount('#app');
```

---

## 输出路径规范

**优先**（与 PRD 同目录，便于评审）：

```
onespec/prd/<feature-name>/<id>-<feature-name>-preview.html
```

无 `id` 时：

```
onespec/prd/<feature-name>/<feature-name>-preview.html
```

**备选**：

```
onespec/prototype/<id>-<name>-preview.html
```

---

## 生成规范（通用）

| 区域 | 说明 |
|------|------|
| 搜索区 | 筛选 + 查询 / 重置 |
| 操作区 | 新增、导出等 |
| 数据区 | `el-table` / 卡片 |
| 分页区 | `el-pagination` |
| 弹窗 | `el-dialog` |

核心主流程必须可点击跑通；单文件、CDN、浏览器直接打开。
