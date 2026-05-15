# 🌌 DotaPulse: Neural Link Protocol

[![Deploy Status](https://img.shields.io/badge/Deployment-Cloudflare_Pages-orange?style=flat-square)](https://opendota-cf-worker.pages.dev/)
[![React Version](https://img.shields.io/badge/React-19.0-blue?style=flat-square)](https://react.dev/)
[![Router](https://img.shields.io/badge/Router-TanStack_Router-black?style=flat-square)](https://tanstack.com/router)
[![Styling](https://img.shields.io/badge/Styling-Tailwind_CSS_4.0-38b2ac?style=flat-square)](https://tailwindcss.com/)

**DotaPulse** 是一个基于边缘计算架构的高性能、全栈 AI 交互与数据分析平台。它融合了现代 Web 技术栈与 Cloudflare 的边缘能力，提供极致流畅的 AI 角色对话体验与实时 Dota 2 数据探测。

---

## 🚀 技术栈 (Tech Stack)

### Frontend
- **React 19**: 核心框架，利用最新的 React 特性（如 Actions, Use 钩子）构建。
- **TanStack Router**: 全自动类型安全的文件系统路由系统。
- **Tailwind CSS 4.0**: 下一代 CSS 引擎，极致的开发体验与视觉表现。
- **Shadcn/UI & Radix UI**: 基于无头组件库构建的精美 UI 系统。
- **Motion (Framer Motion)**: 提供丝滑的页面转场与微交互动画。
- **Lucide React**: 现代化的矢量图标库。
- **Geist Font**: 使用 Vercel 的 Geist 字体，提供卓越的阅读体验。

### Backend & Storage
- **Cloudflare Workers (Hono)**: 基于边缘运行的高性能 Web 框架。
- **D1 Database**: Cloudflare 原生分布式 SQL 数据库，存储留言与配置。
- **Workers KV**: 边缘键值存储，用于缓存与状态管理。
- **TypeScript**: 全栈类型安全支持。

### AI Capabilities
- **Vercel AI SDK**: 统一的 AI 交互流式处理框架。
- **Cloudflare AI**: 集成边缘模型（Llama, Mistral 等）。
- **Google Generative AI**: 集成 Gemini Pro 系列大模型。

### Infrastructure & Tools
- **Vite**: 极速的构建工具与开发环境。
- **Wrangler**: Cloudflare Workers 开发与部署工具。
- **pnpm**: 高效的包管理器。

---

## 📂 文件目录结构 (Directory Structure)

```text
src/
├── routes/                # 📂 约定式路由 (File-based Routing)
│   ├── __root.tsx         # 根布局 (Global Layout & Transitions)
│   ├── index.tsx          # 首页 (AI 角色列表)
│   ├── chat.$characterId.tsx # 动态对话页 (AI 交互核心)
│   ├── guestbook.tsx      # 留言板 (D1 数据库应用)
│   ├── dota.tsx           # Dota 数据看板
│   └── -components/       # 路由私有组件 (局部封装)
├── components/            # 📂 全局通用组件
│   ├── ui/                # 基础 UI 组件
│   └── layout/            # 布局外壳 (AppLayout)
├── context/               # 📂 全局状态管理 (Theme, Auth, Data)
├── lib/                   # 📂 工具函数 (Tailwind Merge, etc.)
├── App.tsx                # 应用入口 (Router 挂载)
└── worker.ts              # 📂 后端核心 (Cloudflare Worker Logic)
```

---

## 🛣️ 路由系统 (Routing)

项目采用 **TanStack Router** 的约定式路由模式，所有页面路径均由文件系统自动生成，确保护航级的类型安全：

| 路径 (Path) | 功能 (Feature) | 文件位置 (File) |
| :--- | :--- | :--- |
| `/` | AI 角色大厅 | `routes/index.tsx` |
| `/chat/:id` | 神经网络对话链路 | `routes/chat.$characterId.tsx` |
| `/guestbook` | 边缘存储留言板 | `routes/guestbook.tsx` |
| `/dota` | 实时玩家数据探测 | `routes/dota.tsx` |

---

## 🛠️ 本地开发 (Local Development)

1. **安装依赖**:
   ```bash
   pnpm install
   ```

2. **配置环境变量**:
   在根目录创建 `.env`，并设置 `GEMINI_API_KEY`（或在 `wrangler.jsonc` 中配置 API 密钥）。

3. **数据库迁移**:
   ```bash
   pnpm db:migrate:local
   ```

4. **启动开发环境**:
   - 启动 API Worker: `pnpm worker:dev`
   - 启动前端: `pnpm dev`

---

## 🌐 部署 (Deployment)

项目完美适配 Cloudflare 生态：
- **Frontend**: 部署于 **Cloudflare Pages**。
- **API/DB**: 运行于 **Cloudflare Workers** + **D1**。
- **CI/CD**: 通过 GitHub Action 或 Pages 自带的集成实现自动化部署。
