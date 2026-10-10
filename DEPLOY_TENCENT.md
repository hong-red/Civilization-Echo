# 腾讯云部署指南（前后端同源）

目标：整站（前端 `public/` + 后端 `/api`）都跑在腾讯云 `81.70.191.44`，浏览器访问
`http://81.70.191.44:7777` 即可使用，无需 Vercel / GitHub Pages。

前端已改为同源调用（`API_BASE_URL = ""`，即 `/api/...`），后端 `node server.js` 会
同时托管静态页面和 API 接口，因此不存在跨域和混合内容问题。

## 一、把最新代码推到 GitHub（推荐）

服务器上用 `git clone` 最方便。先在本地提交并推送本次改动：

```bash
cd F:\Civilization-Echo
git add public/*.html
git commit -m "前端改为同源 /api 调用，适配腾讯云部署"
git push origin main
```

> 若仓库是私有，服务器 clone 前需先配置好 GitHub 凭据；也可改用 scp 直接上传（见文末）。

## 二、服务器环境准备（Ubuntu 示例）

SSH 登录服务器后：

```bash
# 1. 安装 Node.js 20（NodeSource 源）
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git

# 2. 安装 pm2（进程守护，宕机自动拉起）
sudo npm install -g pm2

# 3. 验证 Node 版本 ≥ 20
node -v
```

## 三、拉代码并安装依赖

```bash
cd /opt
sudo git clone https://github.com/hong-red/Civilization-Echo.git
cd Civilization-Echo
npm install
```

## 四、配置环境变量

```bash
# 创建 .env，写入 DeepSeek 文本 Key 和 Kimi 视觉 Key（此文件已被 .gitignore 忽略，不会提交）
cat > .env <<'EOF'
DEEPSEEK_API_KEY=你的DeepSeek_API_Key
KIMI_API_KEY=你的Kimi_API_Key
PORT=7777
EOF
```

> 把本地 `F:\Civilization-Echo\.env` 里的两个 key 值原样填进去即可。

## 五、启动并守护进程

```bash
pm2 start server.js --name civilization-echo
pm2 save
pm2 startup        # 按提示复制执行它输出的那一行命令，实现开机自启
pm2 status
```

## 六、开放防火墙 / 安全组端口

腾讯云控制台 → 该实例 → 防火墙（或安全组）→ 放行 TCP `7777`（若走 80 则放行 80）。

## 七、验证

```bash
# 服务器本机自测
curl http://127.0.0.1:7777/api/health
# 预期返回 {"status":"ok","env":"local","hasKey":true,...}
```

浏览器打开 `http://81.70.191.44:7777/dialogue.html`，试一下「与苏轼对话」是否正常出内容。

## （可选）用 80 端口访问，省掉 :7777

二选一：

1. **Node 直接监听 80**：`.env` 里 `PORT=80`，用 root 运行（80 是特权端口，需 `sudo pm2 start ...`）。
2. **nginx 反向代理 80 → 7777**（更规范）：

```bash
sudo apt-get install -y nginx
sudo tee /etc/nginx/sites-available/civilization-echo >/dev/null <<'EOF'
server {
    listen 80;
    server_name _;
    location / {
        proxy_pass http://127.0.0.1:7777;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOF
sudo ln -s /etc/nginx/sites-available/civilization-echo /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

之后访问 `http://81.70.191.44/` 即可（整站，含 `/dialogue.html`）。

## 附：不用 git 的话，直接 scp 上传

本地 Windows 终端（PowerShell / CMD）：

```bat
scp -r F:\Civilization-Echo root@81.70.191.44:/opt/Civilization-Echo
```

> 上传前先删掉本地 `node_modules`，到服务器后再 `npm install`，避免传一大堆依赖。

## 说明

- `vercel.json`、`api/index.js`、`.github/workflows/` 是之前的 Vercel / GitHub Pages
  部署产物，本次同源部署不再需要，保留不影响运行，可自行清理。
- 当前是 HTTP 裸 IP 访问，浏览器会提示「不安全」，属正常；若要 HTTPS，需再配域名 + SSL 证书。
