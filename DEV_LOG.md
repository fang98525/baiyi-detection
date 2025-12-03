# 开发功能迭代记录

## 2025-12-03 项目新增功能优化

### 功能变更
1. **新增堤防类型支持**
   - 后端接口 (`backend/app/routes/project.py`)：
     - 修改 `create_project` 接口，支持接收 `projectType` 参数，不再硬编码为默认值 `'reservoir'`。
     - 完善了参数校验和保存逻辑。
   - 小程序端 (`miniprogram`)：
     - `project-add` 页面新增 `embankmentTypes` (堤防等级：1级-5级等)。
     - 新增页面支持根据传入的 `type` 参数（reservoir/embankment）动态切换 UI 展示。

2. **交互体验优化**
   - **列表页 (`projects`)**：点击新增按钮时，自动携带当前选中的 Tab 类型（水库列表 -> 新增水库，堤防列表 -> 新增堤防）。
   - **新增页 (`project-add`)**：
     - 动态文案调整：当类型为“堤防”时，表单标签自动切换为“堤防结构”、“堤顶长度”、“堤脚长度”等专业术语，避免使用“坝型”等水库术语。
     - 类型选择器根据项目类型动态展示对应选项（水库类型 vs 堤防等级）。

### 修改文件清单
- `backend/app/routes/project.py`
- `miniprogram/pages/projects/projects.js`
- `miniprogram/pages/project-add/project-add.js`
- `miniprogram/pages/project-add/project-add.wxml`

