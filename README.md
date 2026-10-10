# 文明回响 (Civilization Echo)

传统文化互动平台，融合 AI 技术，让传统文化焕发新生。

## 项目结构

```
Civilization-Echo/
├── public/               # 前端静态文件
│   ├── index.html        # 主页
│   ├── kid.html          # 儿童版
│   ├── m-kid.html        # 儿童版移动端
│   ├── kids_story.html   # 神兽诗故事
│   ├── m-kids_story.html # 神兽诗故事移动端
│   ├── youth-home.html   # 青少年版
│   ├── creation.html     # 创作工坊
│   ├── m-creation.html   # 创作工坊移动端
│   ├── elder-home.html   # 老年版
│   ├── dialogue.html     # 时空对话
│   ├── m-dialogue.html   # 时空对话移动端
│   ├── poem-letter.html  # 诗词信笺
│   ├── calligraphy.html  # 书法展示
│   ├── script.js         # 前端脚本
│   └── style.css         # 样式文件
├── server.js             # Express 后端
├── package.json          # 项目配置
├── .env                  # 环境变量（不入库）
├── .gitignore            # Git 忽略文件
├── DEPLOY_TENCENT.md     # 腾讯云部署指南
└── api/
    └── index.js          # Vercel 部署入口（历史遗留，可选）
```

## 功能模块

### 儿童板块

- 神兽诗故事：AI 生成传统神兽与诗词结合的儿童故事
  - 支持四大神兽主题（青龙、白虎、朱雀、玄武）
  - 自动适配移动端
  - 语音播放功能

### 青少年板块

- 诗词混创工坊：AI 协助续写诗词
  - 支持多种情绪类型（孤独、漂泊、喜悦、思念、自由）
  - 移动端适配
- 诗词信笺：创意诗词展示
- 诗画共创：上传书法/绘画作品，AI 识别画面并匹配最契合的诗词

### 老年板块

- 时空对话：与古代文人（苏轼）进行 AI 对话
  - 移动端适配

## 技术栈

- 前端：HTML5 + CSS3 + JavaScript (ES6+)
- 后端：Node.js + Express
- AI 服务：DeepSeek API（文本）+ Kimi 视觉模型（书法/绘画识图）

## 部署说明

本项目采用前后端同源部署：后端 `server.js` 同时托管 `public/` 静态页面和 `/api` 接口，
前端以相对路径调用接口，无跨域、无混合内容问题。

线上部署到腾讯云服务器的完整步骤见 [DEPLOY_TENCENT.md](DEPLOY_TENCENT.md)。

### 本地开发

```bash
# 安装依赖
npm install

# 启动服务
npm start
```

访问 `http://localhost:7777`。

## API 端点

### POST /api/kids/story

生成儿童神兽诗故事。

请求体：

```json
{
  "beast": "神兽名称",
  "poemTitle": "诗词标题",
  "poet": "诗人",
  "poemText": "诗词内容"
}
```

### POST /api/sushi

与苏轼进行时空对话。

请求体：

```json
{
  "question": "你的问题"
}
```

### POST /api/creation/continue

AI 协助续写诗词。

请求体：

```json
{
  "firstLine": "诗词开头",
  "mood": "情绪类型（孤独/漂泊/喜悦/思念/自由）"
}
```

### POST /api/calligraphy/match

上传书法/绘画作品，识别画面并匹配诗词。

请求体：

```json
{
  "image": "图片的 base64 data URL"
}
```

## 环境变量

在项目根目录创建 `.env` 文件：

```
# DeepSeek API Key（文本模型）
DEEPSEEK_API_KEY=your_api_key_here

# Kimi 视觉模型 API Key（书法/绘画识图）
KIMI_API_KEY=your_api_key_here

# 服务端口（可选，默认 7777）
PORT=7777
```

## 开发指南

1. 前端开发：修改 `public/` 目录下的文件。
2. 后端开发：修改 `server.js`。
3. 接口调用：前端统一通过 `/api/...` 相对路径访问，无需修改后端地址。
4. 部署：参照 [DEPLOY_TENCENT.md](DEPLOY_TENCENT.md) 部署到服务器。

## 许可证

ISC
