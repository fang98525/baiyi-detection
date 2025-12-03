<!--
 * @Author: zqfang5 zqfang5@iflytek.com
 * @Date: 2025-12-02 19:57:52
 * @Description: Git版本管理操作指南
 * @FilePath: \detcetion_v2\git_版本管理.md
-->

### 一、 首次上传项目到 GitHub

#### 1. 初始化本地仓库
打开终端（Terminal），确保当前目录在项目根目录下（`detcetion_v2`），执行：
```bash
git init
```

#### 2. 创建并配置 `.gitignore`
防止上传不必要的文件（如虚拟环境、依赖包、IDE配置等）。
确保项目根目录下有 `.gitignore` 文件，建议包含以下内容：
```gitignore
# Python
__pycache__/
*.py[cod]
venv/
.env

# Node / Miniprogram
node_modules/
miniprogram/node_modules/
unpackage/
dist/

# IDE
.vscode/
.idea/
*.swp
```

#### 3. 添加文件到暂存区
```bash
git add .
```

#### 4. 提交到本地仓库
```bash
git commit -m "Initial commit: 项目初始化，包含小程序前端和Python后端"
```

#### 5. 在 GitHub 上创建新仓库
1. 登录 GitHub。
2. 点击右上角 "+" -> "New repository"。
3. 输入仓库名称（例如 `baiyi-detection-v2`）。
4. 不要勾选 "Initialize this repository with..." 下的选项（因为本地已经有代码了）。
5. 点击 "Create repository"。

#### 6. 关联远程仓库并推送
复制 GitHub 仓库页面提供的 URL（例如 `https://github.com/username/baiyi-detection-v2.git`），然后执行：

```bash
# 将 main 分支重命名为 master (可选，GitHub 默认现在叫 main，Git 默认叫 master)
git branch -M main

# 关联远程仓库
git remote add origin https://github.com/fang98525/baiyi-detection.git

# 推送代码
git push -u origin main
```

---

### 二、 日常版本管理

#### 1. 查看文件状态
查看哪些文件被修改了：
```bash
git status
```

#### 2. 提交修改
```bash
# 添加所有修改
git add .

# 提交并写明备注
git commit -m "Update: 完善登录页面样式，增加数据库初始化脚本"
```

#### 3. 推送到远程仓库
```bash
git push
```

#### 4. 拉取远程更新（多人协作时）
```bash
git pull
```

---

### 三、 分支管理（推荐开发流程）

#### 1. 创建并切换到新分支（开发新功能时）
```bash
# 例如开发“项目添加”功能
git checkout -b feature/project-add
```

#### 2. 在分支上开发、提交
```bash
git add .
git commit -m "Feat: 完成项目添加页面的表单验证"
```

#### 3. 合并回主分支
开发完成后：
```bash
# 1. 切回主分支
git checkout main

# 2. 拉取最新代码（防止冲突）
git pull

# 3. 合并分支
git merge feature/project-add

# 4. 推送
git push

# 5. 删除功能分支（可选）
git branch -d feature/project-add
```
```