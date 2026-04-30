# MiniMax AI Desktop - 设计文档

## 1. 项目概述

**项目名称**：MiniMax AI Desktop
**项目类型**：Windows 桌面应用程序
**核心功能**：MiniMax AI 全模态交互客户端，支持文本聊天、图片生成与理解、视频生成、语音合成、音乐创作、代码编写与执行。
**目标用户**：需要通过桌面客户端使用 MiniMax 全模态能力的用户。

## 2. 技术架构

### 2.1 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                    Electron 主进程                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  系统托盘管理  │  │  窗口管理     │  │  IPC 主控     │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
│  ┌──────────────────────────────────────────────────┐  │
│  │           Python 子进程（Mini-Agent）              │  │
│  │  • WebSocket Server（Node.js 桥接）               │  │
│  │  • MMX-CLI 调用封装                               │  │
│  │  • 各仓库 Python 接口调用                          │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↕ IPC
┌─────────────────────────────────────────────────────────┐
│                  Electron 渲染进程（React）               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  Chat UI  │  │ Gallery  │  │  Player  │              │
│  └─────┬─────┘  └────┬─────┘  └────┬─────┘              │
│  ┌─────┴─────────────┴─────────────┴─────┐              │
│  │         Zustand 状态管理               │              │
│  │         IndexedDB 持久化               │              │
│  └────────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────┘
```

### 2.2 技术栈

| 层级 | 技术选型 | 版本 |
|------|----------|------|
| 桌面框架 | Electron | 33.x |
| 前端框架 | React + TypeScript | React 18, TS 5.x |
| 构建工具 | Vite | 6.x |
| UI 样式 | Tailwind CSS | 3.x |
| 动画 | Framer Motion | 11.x |
| 状态管理 | Zustand | 5.x |
| 通信 | ws (WebSocket) | Node.js 原生 |
| 数据库 | idb (IndexedDB) | - |
| 代码高亮 | Shiki | - |
| 媒体播放 | Video.js + Howler.js | - |
| Python 进程 | child_process stdio | Node.js 原生 |

### 2.3 本地仓库对接

| 仓库 | 用途 | 调用方式 |
|------|------|----------|
| `MiniMax-AI/cli` | 全模态 CLI 入口 | `mmx <resource> <command>` |
| `Mini-Agent` | 智能体核心 | Python 进程 HTTP/WebSocket |
| `Video-01` | 视频生成 | `python video-01/generate.py --prompt "..."` |
| `Image-01` | 图像生成 | `python image-01/generate.py --prompt "..."` |
| `Speech` | 语音合成 | `python speech/synthesize.py --text "..." --voice "..."` |
| `Music` | 音乐创作 | `python music/compose.py --prompt "..."` |
| `t2i` | 文生图 | `python t2i/generate.py --prompt "..."` |
| `c2s` | 代码生成 | `python c2s/generate.py --prompt "..."` |

## 3. UI/UX 设计

### 3.1 设计语言

- **风格**：极简苹果风 — 大面积留白、流畅动画、圆角（12px）、毛玻璃效果（`backdrop-filter: blur(20px)`）
- **主题**：双主题（浅色默认/深色切换），用户可随时切换
- **字体**：系统默认中文字体 + SF Mono / JetBrains Mono（代码区域）
- **阴影**：柔和投射阴影，避免厚重立体感
- **滚动条**：极简定制（细窄、半透明）

### 3.2 布局结构

```
┌────────┬────────────────────────────────────────────────┐
│  侧边栏  │              主对话区域                        │
│ (60px) │  ┌────────────────────────────────────────┐   │
│ (收起) │  │           顶栏（标题 + 快捷操作）           │   │
│        │  ├────────────────────────────────────────┤   │
│ Logo   │  │                                        │   │
│ 新对话  │  │            消息气泡区域                 │   │
│ 历史   │  │         （滚动，自适应高度）              │   │
│ 设置   │  │                                        │   │
│        │  ├────────────────────────────────────────┤   │
│        │  │           多模态输入区                   │   │
│        │  └────────────────────────────────────────┘   │
└────────┴────────────────────────────────────────────────┘
```

- **侧边栏**：可收放（60px 图标态 ↔ 240px 展开态），smooth 过渡动画
- **快捷操作**：5 个通道（视频/图片/语音/音乐/编程）常驻顶栏中央，点击展开专用面板
- **消息气泡**：用户消息靠右（淡蓝底），AI 消息靠左（浅灰底），支持 Markdown 渲染
- **媒体卡片**：尺寸适中缩略图，点击放大/播放
- **代码块**：暗色终端风格，Shiki 语法高亮，带复制和运行按钮

### 3.3 动画细节

| 动画场景 | 效果 |
|----------|------|
| 消息出现 | `opacity: 0→1` + `translateY: 10px→0`，300ms |
| 流式输出 | 逐字显示，光标闪烁 |
| 侧边栏收放 | 平滑宽度过渡，200ms |
| 按钮 hover | scale: 1.02，shadow 变化 |
| 主题切换 | 全局 CSS 变量过渡，200ms |

## 4. 组件结构

```
src/
├── main/                      # Electron 主进程
│   ├── index.ts              # 入口，创建窗口/托盘
│   ├── ipc-handlers.ts       # IPC 事件处理
│   └── python-bridge.ts      # Python 子进程管理 + WebSocket 桥接
│
├── renderer/                  # 渲染进程（React）
│   ├── App.tsx
│   ├── components/
│   │   ├── Sidebar/
│   │   │   ├── Sidebar.tsx         # 可收放侧边栏
│   │   │   └── ChatHistory.tsx      # 对话历史列表
│   │   ├── TopBar/
│   │   │   ├── TopBar.tsx           # 标题栏
│   │   │   └── ShortcutPanel.tsx    # 快捷操作面板
│   │   ├── Chat/
│   │   │   ├── ChatArea.tsx         # 消息流容器
│   │   │   ├── MessageBubble.tsx     # 消息气泡
│   │   │   ├── MediaCard.tsx        # 媒体卡片
│   │   │   └── CodeBlock.tsx        # 代码块
│   │   ├── Input/
│   │   │   └── MultimodalInput.tsx  # 多模态输入区
│   │   └── Settings/
│   │       └── SettingsPanel.tsx     # 设置面板
│   ├── hooks/
│   │   ├── useWebSocket.ts            # WebSocket 连接管理
│   │   └── useMedia.ts               # 媒体文件处理
│   ├── store/
│   │   ├── chatStore.ts              # 对话状态（Zustand）
│   │   └── settingsStore.ts          # 设置状态（持久化）
│   └── lib/
│       ├── indexedDB.ts              # IndexedDB 操作
│       └── ipc.ts                    # IPC 调用封装
```

## 5. 通信协议

### 5.1 WebSocket 消息格式（JSON-RPC 2.0 风格）

**前端 → 后端**：

```typescript
{ "type": "chat", "id": "msg_001", "content": "生成一张赛博朋克城市图" }
{ "type": "image_generate", "id": "img_001", "prompt": "赛博朋克城市，霓虹灯" }
{ "type": "stream_start", "id": "msg_002" }
```

**后端 → 前端**：

```typescript
{ "type": "text_chunk", "id": "msg_001", "content": "好的，" }
{ "type": "text_chunk", "id": "msg_001", "content": "正在生成图片..." }
{ "type": "media_ready", "id": "img_001", "path": "C:\\Users\\Dell\\AppData\\Roaming\\MiniMax-Desktop\\media\\img_001.png", "mediaType": "image" }
{ "type": "error", "code": "AUTH_FAILED", "message": "API Key 无效或已过期" }
{ "type": "progress", "id": "img_001", "percent": 45 }
```

### 5.2 错误分类处理

| 错误码 | 含义 | 用户反馈 |
|--------|------|----------|
| `AUTH_FAILED` | Token Key 无效/过期 | 弹窗引导重新配置 API Key |
| `INVALID_PARAMS` | 参数错误 | 显示具体错误信息 |
| `TIMEOUT` | 任务超时 | 自动重试，最多 3 次 |
| `NETWORK_ERROR` | 网络异常 | 提示检查网络连接 |
| `MEDIA_NOT_FOUND` | 媒体文件丢失 | 显示占位符，允许重新生成 |

## 6. 数据存储

### 6.1 IndexedDB（前端正本）

- 聊天记录（消息内容、时间、媒体引用路径）
- 用户偏好（主题、语言）
- 草稿未发送消息

### 6.2 本地文件

- 媒体文件：`%APPDATA%/MiniMax-Desktop/media/{date}/{uuid}.{ext}`
- 备份导出：`%APPDATA%/MiniMax-Desktop/exports/`

### 6.3 Token 配置

- 存储位置：Windows Credential Manager
- 环境变量回退：`process.env.MINIMAX_API_KEY`

## 7. 实现阶段

### Phase 1 - 骨架
- [ ] Electron + React + Vite 项目搭建
- [ ] 窗口管理（最小化/最大化/关闭）
- [ ] 系统托盘（后台运行、托盘菜单）
- [ ] 双主题基础（CSS 变量切换）

### Phase 2 - 核心对话
- [ ] Python Mini-Agent 子进程管理
- [ ] WebSocket 通信链路
- [ ] 文本对话（发送/接收/流式输出）
- [ ] IndexedDB 存储对话历史
- [ ] 可收放侧边栏 + 对话历史列表

### Phase 3 - 全模态
- [ ] 图片生成 + Gallery
- [ ] 图片理解
- [ ] 视频生成
- [ ] 语音合成 + 播放
- [ ] 音乐创作
- [ ] 代码生成 + 高亮 + 运行
- [ ] 快捷操作面板（5 通道）
- [ ] 多模态输入（图片粘贴/拖拽/录音）

## 8. 环境要求

- Node.js 18+
- Python 3.8+ + `uv` 包管理器
- MiniMax Token Plan API Key
- Windows 10+
