import 'dotenv/config';
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import fetch from "node-fetch";

/* ===== 基础 ===== */
console.log("🚀 Server starting...");
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// 1. 日志中间件 (放在最前面)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// 2. CORS 中间件 (直接使用 cors 库，配置最宽松策略)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// 3. 解析 JSON
app.use(express.json());

// 4. 静态文件
app.use(express.static(path.join(__dirname, "public")));

/* ===== API Key ===== */
let KIMI_API_KEY = process.env.KIMI_API_KEY;

/* ===== 路由 ===== */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// 健康检查接口，用于测试后端是否活着
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString(), hasKey: !!KIMI_API_KEY });
});

/* ===============================
   API：儿童神兽诗故事
================================ */
app.post("/api/kids/story", async (req, res) => {
  const { beast, poemTitle, poet, poemText } = req.body;
  if (!beast || !poemTitle || !poet || !poemText) {
    return res.status(400).json({ story: "缺少参数" });
  }

  const systemPrompt = `
你是一位中国传统神兽，名字是【${beast}】。
听众是 6-10 岁的孩子。
讲故事要求：
1. 温柔、简单、有画面感
2. 用“我带你看……”讲诗
3. 讲成一个完整的小故事
4. 字数 120~180 字
`;

  const userPrompt = `
这首诗是《${poemTitle}》，作者是${poet}：

${poemText}

请你作为${beast}讲一个诗里的故事。
`;

  try {
    // 检查API Key是否存在
    if (!KIMI_API_KEY) {
      throw new Error("缺少KIMI_API_KEY环境变量");
    }
    
    const response = await fetch("https://api.moonshot.cn/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${KIMI_API_KEY}`
      },
      body: JSON.stringify({
        model: "moonshot-v1-8k",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.8
      })
    });

    const data = await response.json();

    const story = 
      data.choices?.[0]?.message?.content ||
      "神兽今天有点害羞，一会再来讲。";

    res.json({ story });

  } catch (err) {
    console.error("❌ kids/story 异常：", err);
    res.status(500).json({ story: "神兽走进云雾里了，一会儿再来吧。" });
  }
});

/* ===============================
   API：苏轼时空对话
================================ */
app.post("/api/sushi", async (req, res) => {
  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ answer: "缺少问题参数" });
  }

  const systemPrompt = `
你是北宋文豪苏轼，字子瞻，号东坡居士。
性格豁达、通透、有文人风骨。
请用偏文言但现代人可读的方式回答。
字数 100~150 字。
`;

  try {
    // 检查API Key是否存在
    if (!KIMI_API_KEY) {
      throw new Error("缺少KIMI_API_KEY环境变量");
    }
    
    const response = await fetch("https://api.moonshot.cn/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${KIMI_API_KEY}`
      },
      body: JSON.stringify({
        model: "moonshot-v1-8k",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question }
        ],
        temperature: 0.8
      })
    });

    const data = await response.json();
    const answer = 
      data.choices?.[0]?.message?.content ||
      "风雨太大，东坡暂未回应。";

    res.json({ answer });

  } catch (err) {
    console.error("❌ sushi 异常：", err);
    res.status(500).json({ answer: "风雨太大，东坡暂未回应。" });
  }
});

/* ===============================
//  API：诗词混创工坊（AI协助续写）
================================ */
app.post("/api/creation/continue", async (req, res) => {
  const { firstLine, mood = "自由" } = req.body;
  
  if (!firstLine) {
    return res.status(400).json({ continuation: "请先写下你的开头哦～" });
  }

  const moodPrompts = {
    "孤独": "带着淡淡的孤寂与思念",
    "漂泊": "充满行旅的苍凉与不羁",
    "喜悦": "明快而充满生机",
    "思念": "柔软而深情的相思",
    "自由": "豁达洒脱、随心所欲"
  };

  const systemPrompt = `
你是古代诗人的灵魂，正在与现代人隔空合写一首新诗。
用户会给你开头一句，你只需续写三句（共四句成一绝句）。
要求：
- 严格遵循近体诗格律（五言或七言统一）
- 意境与用户开头契合，情绪${moodPrompts[mood] || "自然流露"}
- 语言古雅但现代人可读
- 不要解释，不要加标点说明
- 只输出三句诗，不要有其他文字
`;

  try {
    // 检查API Key是否存在
    if (!KIMI_API_KEY) {
      throw new Error("缺少KIMI_API_KEY环境变量");
    }
    
    const response = await fetch("https://api.moonshot.cn/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${KIMI_API_KEY}`
      },
      body: JSON.stringify({
        model: "moonshot-v1-8k",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `我的开头是：${firstLine}\n请续写三句。` }
        ],
        temperature: 0.9,
        max_tokens: 100
      })
    });

    const data = await response.json();
    const continuation = data.choices?.[0]?.message?.content?.trim() ||
      "云深不知处，\n松风自吹寒。\n一叶梦相关。";

    res.json({ continuation });

  } catch (err) {
    console.error("❌ creation 异常：", err);
    res.status(500).json({ 
      continuation: "墨汁晕开了，\n古人暂未落笔。\n稍候再试吧。" 
    });
  }
});

/* ===== 启动 ===== */
const PORT = process.env.PORT || 3000;

// 仅在非 Vercel 环境下启动监听
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ 文明回响已启动：http://127.0.0.1:${PORT}`);
  });
}

// 导出 app 供 Vercel 使用
export default app;