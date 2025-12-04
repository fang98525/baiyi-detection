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
     - **地图选点功能优化**：
       - 点击“📍 定位”按钮时，调用 `wx.chooseLocation` 打开微信原生地图页面，支持滑动地图选择位置。
       - 自动回填详细地址、经纬度信息到表单。
       - 智能解析地址中的省/市/区信息，自动填充到区域选择器中（支持普通省市区和直辖市格式）。
       - 如果表单中已有经纬度，打开地图时会以该位置为中心点，方便修改地址时查看原位置。
       - 地址输入框支持手动输入和自动回填两种方式。

3. **权限配置优化**
   - 在 `app.json` 中添加了 `requiredPrivateInfos` 配置，包含 `getLocation` 和 `chooseLocation`，符合新版微信小程序隐私保护要求。

### 修改文件清单
- `backend/app/routes/project.py`
- `miniprogram/app.json`
- `miniprogram/pages/projects/projects.js`
- `miniprogram/pages/project-add/project-add.js`
- `miniprogram/pages/project-add/project-add.wxml`
