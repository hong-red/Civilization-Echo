import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import dotenv from "dotenv";

// 初始化环境
dotenv.config();

/* ===== 基础 ===== */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// 1. 日志中间件
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// 2. CORS 中间件 - 线上环境必须严格处理
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 3. 解析 JSON（limit 调大以容纳图片 base64）
app.use(express.json({ limit: "15mb" }));

// 4. 静态文件 (仅在本地开发时由 Express 处理，Vercel 会自动处理 public 目录)
if (!process.env.VERCEL) {
  app.use(express.static(path.join(__dirname, "public")));
}

/* ===== API Key ===== */
let DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;   // 文本模型
let KIMI_API_KEY = process.env.KIMI_API_KEY;           // 视觉模型（书法/绘画识图）

/* ===== 路由 ===== */
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    env: process.env.VERCEL ? "vercel" : "local",
    nodeVersion: process.version,
    hasKey: !!DEEPSEEK_API_KEY,
    hasVisionKey: !!KIMI_API_KEY
  });
});

// 通用 AI 请求处理器
async function callDeepSeek(messages, temperature = 0.8) {
  if (!DEEPSEEK_API_KEY) throw new Error("缺少 DEEPSEEK_API_KEY");
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000); // 增加超时到 25 秒，给 AI 更多时间生成内容

  try {
    // Node 20+ 原生支持 fetch
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages,
        temperature
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API 返回错误: ${response.status} ${errorText}`);
    }
    
    return await response.json();
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error("AI 响应超时，请稍后再试");
    }
    throw err;
  }
}

app.post("/api/kids/story", async (req, res) => {
  const { beast, poemTitle, poet, poemText } = req.body;
  if (!beast || !poemTitle || !poet || !poemText) {
    return res.status(400).json({ story: "缺少参数" });
  }

  const systemPrompt = `你是一位中国传统神兽，名字是【${beast}】。听众是 6-10 岁的孩子。讲故事要求：1. 温柔、简单、有画面感 2. 用“我带你看……”讲诗 3. 讲成一个完整的小故事 4. 字数 120~180 字`;
  const userPrompt = `这首诗是《${poemTitle}》，作者是${poet}：\n\n${poemText}\n\n请作为${beast}讲故事。`;

  try {
    const data = await callDeepSeek([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ]);
    res.json({ story: data.choices?.[0]?.message?.content || "神兽今天有点害羞。" });
  } catch (err) {
    console.error("❌ kids/story 异常：", err.message);
    res.status(500).json({ story: "神兽走进云雾里了，一会儿再来吧。" });
  }
});

app.post("/api/sushi", async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ answer: "缺少问题" });

  try {
    const data = await callDeepSeek([
      { role: "system", content: "你是北宋文豪苏轼，字子瞻，号东坡居士。性格豁达、通透。请用偏文言但现代人可读的方式回答。字数 100~150 字。" },
      { role: "user", content: question }
    ]);
    res.json({ answer: data.choices?.[0]?.message?.content || "风雨太大，东坡暂未回应。" });
  } catch (err) {
    console.error("❌ sushi 异常：", err.message);
    res.status(500).json({ answer: "风雨太大，东坡暂未回应。" });
  }
});

app.post("/api/creation/continue", async (req, res) => {
  const { firstLine, mood = "自由" } = req.body;
  if (!firstLine) return res.status(400).json({ continuation: "请先写开头" });

  try {
    const data = await callDeepSeek([
      { role: "system", content: "你是古代诗人的灵魂，只需续写三句成一绝句。严格遵循格律，意境契合。只输出三句诗。" },
      { role: "user", content: `我的开头是：${firstLine}\n请续写三句。` }
    ], 0.9);
    res.json({ continuation: data.choices?.[0]?.message?.content?.trim() || "云深不知处..." });
  } catch (err) {
    console.error("❌ creation 异常：", err.message);
    res.status(500).json({ continuation: "墨汁晕开了..." });
  }
});

// Kimi 视觉模型：识别书法/绘画作品，输出特征描述
async function callKimiVision(imageBase64) {
  if (!KIMI_API_KEY) throw new Error("缺少 KIMI_API_KEY");

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 视觉模型为推理型，放宽到 60 秒

  try {
    const response = await fetch("https://api.moonshot.cn/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${KIMI_API_KEY}`
      },
      body: JSON.stringify({
        model: "kimi-k2.6",
        messages: [
          {
            role: "user",
            content: [
              { type: "image_url", image_url: { url: imageBase64 } },
              {
                type: "text",
                text: "这是一幅用户的书法或绘画作品。请用中文描述：1. 画面内容（写了什么字/画了什么物）2. 书体或画风 3. 墨色浓淡与构图 4. 整体意境与情绪。150 字以内，只输出描述文字。"
              }
            ]
          }
        ]
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Kimi 视觉返回错误: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || "";
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') throw new Error("视觉识别超时，请稍后再试");
    throw err;
  }
}

// 书法/绘画作品 → 匹配诗词（Kimi 视觉识别 + DeepSeek 诗词匹配）
app.post("/api/calligraphy/match", async (req, res) => {
  const { image } = req.body;
  if (!image) return res.status(400).json({ error: "缺少图片" });

  try {
    const description = await callKimiVision(image);

    const data = await callDeepSeek([
      {
        role: "system",
        content: "你是严谨的古典诗词鉴赏专家。根据一幅书法/绘画作品的特征描述，从真实存在、出处可考的唐宋诗词中挑选最契合的一首，并严格只输出 JSON：{\"poem\":\"诗词正文（多行用 \\n）\",\"author\":\"作者 · 《作品名》\",\"reason\":\"一句话推荐理由\"}。硬性要求：只能使用真实存在的古诗词，作者与出处必须准确可考；若不确定作者或出处，author 字段写“佚名”，绝不允许杜撰诗词或伪造作者。不要输出 JSON 以外的任何文字。"
      },
      { role: "user", content: `作品特征：${description}` }
    ], 0.9);

    const raw = data.choices?.[0]?.message?.content || "";
    const jsonStr = raw.replace(/```json|```/g, "").trim();
    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      parsed = { poem: raw, author: "", reason: "" };
    }

    res.json({
      poem: parsed.poem || raw,
      author: parsed.author || "",
      reason: parsed.reason || "",
      description
    });
  } catch (err) {
    console.error("❌ calligraphy/match 异常：", err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ===== 启动逻辑 ===== */
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`✅ 本地服务已启动：http://localhost:${PORT}`);
  });
}

export default app;