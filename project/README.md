# Personal Finance API

Minimal Express + Mongoose backend implementing endpoints described in the provided API doc.

Quick start:

1. copy `.env.example` to `.env` and tweak values
2. install dependencies:

```bash
npm install
```

3. run in dev:

```bash
npm run dev
```

Base API URL

所有示例请求均可使用你的基础地址： https://vylgfktdldeo.sealoshzh.site

示例请求：

```bash
# 注册
curl -X POST https://vylgfktdldeo.sealoshzh.site/api/auth/register \
	-H "Content-Type: application/json" \
	-d '{"name":"Demo User","email":"demo@example.com","password":"demopass123"}'

# 登录
curl -X POST https://vylgfktdldeo.sealoshzh.site/api/auth/login \
	-H "Content-Type: application/json" \
	-d '{"email":"demo@example.com","password":"demopass123"}'

# 获取行情（需 Authorization header，示例使用占位 token）
curl "https://vylgfktdldeo.sealoshzh.site/api/market/quote?symbol=NVDA" \
	-H "Authorization: Bearer <token>"
```

Available endpoints (summary):
- `POST /api/auth/register` - register
- `POST /api/auth/login` - login
- `POST /api/auth/logout` - logout (requires auth)
- `GET /api/users/profile` - get profile (requires auth)
- `GET /api/assets` - list assets (requires auth)
- `POST /api/assets` - create asset (requires auth)
- `GET /api/activities` - list activities (requires auth)
- `POST /api/activities` - create activity (requires auth)
- `POST /api/ai/chat` - AI chat proxy (requires auth)
# Node.js Example Project

This is a simple Node.js server application example that demonstrates basic HTTP server functionality.

## Project Description

This project creates a basic HTTP server that listens on 0.0.0.0:corresponding port and returns a "Hello World!" message. The project supports both development and production environment modes.

## Environment

This project runs on a Debian 12 system with Node.js, which is pre-configured in the Devbox environment. You don't need to worry about setting up Node.js or system dependencies yourself. The development environment includes all necessary tools for building and running Node.js applications. If you need to make adjustments to match your specific requirements, you can modify the configuration files accordingly.

## Project Execution
**Development mode:** For normal development environment, simply enter Devbox and run `bash entrypoint.sh` in the terminal.
**Production mode:** After release, the project will be automatically packaged into a Docker image and deployed according to the `entrypoint.sh` script and command parameters.

Within Devbox, you only need to focus on development - you can trust that everything is application-ready XD


DevBox: Code. Build. Deploy. We've Got the Rest.

With DevBox, you can focus entirely on writing great code while we handle the infrastructure, scaling, and deployment. Seamless development from start to production. 