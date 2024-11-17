# Korean Studio

<div align="center">
  <em>"Korean Studio: Your Ultimate Korean Learning Companion"</em>
  <br><br>
  <img src="https://img.shields.io/github/last-commit/summerscar/korean-studio?style=flat-square&logo=git&logoColor=white&color=0080ff" alt="last-commit">
  <img src="https://img.shields.io/github/languages/top/summerscar/korean-studio?style=flat-square&color=0080ff" alt="repo-top-language">
</div>

## 📍 Overview

Korean Studio 是一个现代化的韩语学习平台，基于 Next.js 和 Keystone CMS 构建。它提供了丰富的学习资源、交互式练习和 TOPIK 备考材料，帮助学习者更好地掌握韩语。

## ⭐️ 核心特性

| 特性 | 描述 |
|------|------|
| 📚 **系统化学习** | • 从基础到高级的完整韩语课程<br>• 科学的学习进度追踪<br>• 个性化的学习路径规划 |
| 🎯 **TOPIK 备考** | • 真题练习与解析<br>• 模拟测试系统<br>• 考点重点讲解 |
| ⌨️ **智能输入** | • 韩语键盘练习系统<br>• 智能输入联想<br>• 发音规则指导 |
| 🌐 **多语言支持** | • 中文/英文/日文界面<br>• 术语多语言对照<br>• 智能翻译辅助 |
| 🎮 **互动学习** | • 情境对话练习<br>• 词汇记忆游戏<br>• 发音评测系统 |

## 🔧 技术栈

- **前端框架**: Next.js 15
- **后端 CMS**: Keystone 6
- **数据库**: PostgreSQL
- **UI 框架**: TailwindCSS
- **国际化**: next-intl
- **内容格式**: MDX

## 🚀 快速开始

1. 克隆项目
```bash
git clone https://github.com/summerscar/korean-studio
cd korean-studio
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
```bash
cp .env.example .env.local
```

4. 启动开发服务器
```bash
npm run dev
```

现在你可以访问 http://localhost:3000 开始使用了！

## 📁 项目结构

```
korean-studio/
├── app/                # Next.js 应用主目录
│   ├── (home)/        # 主页面路由
│   ├── components/    # 共享组件
│   └── utils/         # 工具函数
├── keystone/          # Keystone CMS 配置
├── mdx/              # 学习内容 MDX 文件
├── public/           # 静态资源
└── messages/         # 国际化文案
```

主要目录说明：
- `app/`: 包含所有的页面组件、布局和路由逻辑
- `keystone/`: 包含 CMS 配置和模型定义
- `mdx/`: 存放所有的学习内容，按主题和难度分类
- `messages/`: 多语言翻译文件
