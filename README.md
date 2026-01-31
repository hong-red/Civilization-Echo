# 文明回响 (Civilization Echo)

传统文化互动平台 - 融合AI技术，让传统文化焕发新生。

## 项目结构

```
Civilization-Echo/
├── public/              # 前端静态文件
│   ├── index.html      # 主页
│   ├── kid.html        # 儿童版
│   ├── m-kid.html      # 儿童版移动端
│   ├── kids_story.html # 神兽诗故事
│   ├── m-kids_story.html # 神兽诗故事移动端
│   ├── youth-home.html # 青少年版
│   ├── m-creation.html # 创作工坊移动端
│   ├── creation.html   # 创作工坊
│   ├── elder-home.html # 老年版
│   ├── m-dialogue.html # 时空对话移动端
│   ├── dialogue.html   # 时空对话
│   ├── poem-letter.html # 诗词信笺
│   ├── calligraphy.html # 书法展示
│   ├── script.js       # 前端脚本
│   ├── style.css       # 样式文件
│   └── .nojekyll       # GitHub Pages配置
├── server.js           # Express后端
├── package.json        # 项目配置
├── .env                # 环境变量
├── .gitignore          # Git忽略文件
├── vercel.json         # Vercel配置文件
└── .github/
    └── workflows/
        └── deploy.yml  # CI/CD部署配置
```

## 功能模块

### 🧒 儿童板块
- **神兽诗故事**：AI生成传统神兽与诗词结合的儿童故事
  - 支持四大神兽主题（青龙、白虎、朱雀、玄武）
  - 自动适配移动端
  - 语音播放功能

### 🧑 青少年板块
- **诗词混创工坊**：AI协助续写诗词
  - 支持多种情绪类型（孤独/漂泊/喜悦/思念/自由）
  - 移动端适配
- **诗词信笺**：创意诗词展示
- **书法展示**：传统书法作品浏览

### 👴 老年板块
- **时空对话**：与古代文人（苏轼）进行AI对话
  - 移动端适配

## 技术栈

- **前端**：HTML5 + CSS3 + JavaScript (ES6+)
- **后端**：Node.js + Express
- **AI服务**：Moonshot AI API
- **部署方案**：GitHub Pages + Vercel

## 部署说明

### 1. 前端部署 - GitHub Pages

前端静态文件直接部署到GitHub Pages，通过GitHub Actions自动部署。

访问地址：`https://hong-red.github.io/Civilization-Echo`

### 2. 后端部署 - Vercel

1. 在Vercel上创建新项目
2. 关联GitHub仓库 `hong-red/Civilization-Echo`
3. 配置部署设置：
   - **Framework Preset**：选择 `Other`
   - **Build Command**：`npm install`
   - **Output Directory**：留空
4. 点击 **Deploy** 开始部署
5. 部署完成后，在项目设置中添加环境变量：
   - `KIMI_API_KEY`：Moonshot AI API密钥
6. Vercel会自动重新部署并生成域名

当前后端地址：`https://civilization-echo.vercel.app`

### 3. 本地开发

```bash
# 安装依赖
npm install

# 启动服务
npm start
```

访问：`http://localhost:3000`

## API端点

### POST /api/kids/story
生成儿童神兽诗故事

**请求体**：
```json
{
  "beast": "神兽名称",
  "poemTitle": "诗词标题",
  "poet": "诗人",
  "poemText": "诗词内容"
}
```

### POST /api/sushi
与苏轼进行时空对话

**请求体**：
```json
{
  "question": "你的问题"
}
```

### POST /api/creation/continue
AI协助续写诗词

**请求体**：
```json
{
  "firstLine": "诗词开头",
  "mood": "情绪类型（孤独/漂泊/喜悦/思念/自由）"
}
```

## 环境变量

创建 `.env` 文件：

```
# Moonshot AI API Key
KIMI_API_KEY=your_api_key_here

# 服务端口（可选）
PORT=3000
```

## 开发指南

1. 前端开发：修改 `public/` 目录下的文件
2. 后端开发：修改 `server.js`
3. 推送代码到 `main` 分支，GitHub Actions自动部署前端到GitHub Pages
4. Vercel自动部署后端服务

## 贡献

欢迎提交Issue和Pull Request！

## 许可证

ISC
