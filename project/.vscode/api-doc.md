这是一个基于node.js的后端项目，我的数据库的连接方式是：mongodb://root:DE38ScI9784EVO58@ifams-mongodb.ns-g3sz2zop.svc:27017

本文档详细的描述了该个人金融资产管理软件所需的后端接口，包括接口名称，请求方法，请求参数，响应数据等信息

## 基础 API 地址

所有文档中的相对接口地址均以以下基础地址为前缀：

- 基础地址: https://vylgfktdldeo.sealoshzh.site

示例：完整登录地址为 `https://vylgfktdldeo.sealoshzh.site/api/auth/login`

## Gemini / Google Generative Language 示例

如果你使用 Google Generative Language（Gemini）REST 接口，可以按如下方式调用（示例使用 `generateContent`）：

```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent" \
  -H "x-goog-api-key: AIzaSyD61_iWB0iCtNabkLE_F6b13aw6Msh4t00" \
  -H 'Content-Type: application/json' \
  -X POST \
  -d '{
    "contents": [
      {
        "parts": [
          {
            "text": "Explain how AI works in a few words"
          }
        ]
      }
    ]
  }'
```

在本项目中，你可以通过环境变量来配置调用方式：
- `GEMINI_API_URL`：自定义完整 endpoint（可选）
- `GEMINI_GOOGLE_API_KEY`：Google 风格的 API key，用于发送 `x-goog-api-key`（优先使用）
- `GEMINI_API_KEY`：通用 API key（在 `GEMINI_API_URL` 自定义端点时会作为 Bearer 使用，或作为旧版 `key` 查询参数回退）

示例：把 `GEMINI_GOOGLE_API_KEY` 填入 `.env`，服务器端会使用 `generateContent` 的请求体格式并带上 `x-goog-api-key`。

# 接口文档

## 获取用户个人信息

### 接口核心功能描述
此接口用于获取当前登录用户的核心个人信息，包括用户名、头像URL、总净资产、财务健康得分以及增长指标。

### 接口地址
/api/users/profile

### 方法
GET

### 需要登录
是

### 请求参数
无

### 响应类型
JSON

### 返回值
```json
{
  "code": 200,
  "msg": "Success",
  "data": {
    "username": "string",
    "userAvatar": "string (url)",
    "totalNetWorth": "number",
    "financialScore": "number",
    "growthMetrics": {
      "amount": "number",
      "percent": "number",
      "isPositive": "boolean"
    }
  }
}
```

---

## 更新用户头像

### 接口核心功能描述
此接口通过从 picsum.photos 获取一张新的随机图片来更新用户的头像。这是一个客户端直接调用的外部接口。

### 接口地址
https://picsum.photos/seed/{seed}/200/200

### 方法
GET

### 需要登录
否

### 请求参数
- **路径参数**:
  - `seed`: 动态生成的字符串（例如，当前时间戳），以确保获取新的图片。

### 响应类型
blob (image)

### 返回值
图片文件。

---

## 用户登录

### 接口核心功能描述
此接口用于验证用户的凭据（电子邮箱和密码）并进行身份验证。成功后，返回一个用于后续请求的认证令牌和用户信息。

### 接口地址
/api/auth/login

### 方法
POST

### 需要登录
否

### 请求参数
```json
{
  "email": "string",
  "password": "string"
}
```

### 响应类型
JSON

### 返回值
```json
{
  "code": 200,
  "msg": "Success",
  "data": {
    "token": "string",
    "user": {
      "name": "string"
    }
  }
}
```

---

## 用户登出

### 接口核心功能描述
此接口用于使当前登录用户登出，撤销/使客户端丢弃当前的认证令牌（服务器端可选择使令牌失效或删除会话）。

### 接口地址
/api/auth/logout

### 方法
POST

### 需要登录
是

### 请求参数
无（推荐通过 `Authorization: Bearer <token>` 请求头携带当前令牌）

### 响应类型
JSON

### 返回值
```json
{
  "code": 200,
  "msg": "Success",
  "data": null
}
```

---

## 用户注册

### 接口核心功能描述
此接口用于创建一个新用户账户。它需要用户的姓名、电子邮箱和密码。成功后，返回一个认证令牌和新创建的用户信息。

### 接口地址
/api/auth/register

### 方法
POST

### 需要登录
否

### 请求参数
```json
{
  "name": "string",
  "email": "string",
  "password": "string"
}
```

### 响应类型
JSON

### 返回值
```json
{
  "code": 200,
  "msg": "Success",
  "data": {
    "token": "string",
    "user": {
      "name": "string"
    }
  }
}
```
---

## 获取所有资产项

### 接口核心功能描述
此接口用于获取当前用户的所有资产项。返回一个包含用户全部资产的详细列表，用于计算各类资产的总和和总净资产。

### 接口地址
/api/assets

### 方法
GET

### 需要登录
是

### 请求参数
无

### 响应类型
JSON

### 返回值
```json
{
  "code": 200,
  "msg": "Success",
  "data": [
    {
      "id": "number",
      "assetKey": "string", // e.g., 'cash', 'equities'
      "name": "string",
      "institution": "string",
      "amount": "number",
      "currency": "string",
      "date": "string (YYYY-MM-DD)",
      "remarks": "string",
      "attributes": {
        // Dynamic key-value pairs
      }
    }
  ]
}
```

---

## 新增资产项

### 接口核心功能描述
此接口用于向用户的投资组合中添加一个新的资产项。

### 接口地址
/api/assets

### 方法
POST

### 需要登录
是

### 请求参数
```json
{
  "assetKey": "string",
  "name": "string",
  "institution": "string",
  "amount": "number",
  "currency": "string",
  "date": "string (YYYY-MM-DD)",
  "remarks": "string",
  "attributes": {}
}
```

### 响应类型
JSON

### 返回值
```json
{
  "code": 200,
  "msg": "Success",
  "data": {
    "id": "number",
    // ... a copy of the created asset item
  }
}
```
---

## 获取最近活动

### 接口核心功能描述
此接口用于获取用户的最近交易或活动列表，例如支出记录。

### 接口地址
/api/activities

### 方法
GET

### 需要登录
是

### 请求参数
无

### 响应类型
JSON

### 返回值
```json
{
  "code": 200,
  "msg": "Success",
  "data": [
    {
      "id": "number",
      "title": "string",
      "category": "string",
      "time": "string",
      "amount": "string",
      "icon": "string"
    }
  ]
}
```
---

## 新增活动（支出）

### 接口核心功能描述
此接口用于记录一笔新的支出活动。

### 接口地址
/api/activities

### 方法
POST

### 需要登录
是

### 请求参数
```json
{
  "title": "string",
  "category": "string",
  "amount": "string",
  "sourceAssetId": "number" // Optional: for double-entry bookkeeping
}
```

### 响应类型
JSON

### 返回值
```json
{
  "code": 200,
  "msg": "Success",
  "data": {
    "id": "number",
    // ... a copy of the created activity
  }
}
```

---

## AI金融助手聊天

### 接口核心功能描述
此接口将用户的消息发送给由Gemini驱动的AI金融助手，并接收其生成的回复。

### 接口地址
/api/ai/chat

### 方法
POST

### 需要登录
是

### 请求参数
```json
{
  "message": "string"
}
```

### 响应类型
JSON

### 返回值
```json
{
  "code": 200,
  "msg": "Success",
  "data": {
    "text": "string"
  }
}
```
---

## 查询实时股票价格 (Alpha Vantage)

### 接口核心功能描述
从Alpha Vantage API获取指定股票代码的最新市场价格。这是一个在添加股票资产时由前端直接调用的外部接口。

### 接口地址
https://www.alphavantage.co/query

### 方法
GET

### 需要登录
是 (需要API密钥)

### 请求参数
- **Query Parameters**:
  - `function`: `GLOBAL_QUOTE` (string)
  - `symbol`: 股票代码, e.g., "NVDA" (string)
  - `apikey`: 您的Alpha Vantage API密钥 (string)

### 响应类型
JSON

### 返回值
成功时，API会返回一个包含股票报价的对象。我们的应用主要使用 `05. price` 字段。
```json
{
    "Global Quote": {
        "01. symbol": "NVDA",
        "02. open": "120.9700",
        "03. high": "122.6800",
        "04. low": "118.0400",
        "05. price": "121.7900",
        "06. volume": "41997380",
        "07. latest trading day": "2024-07-26",
        "08. previous close": "121.0900",
        "09. change": "0.7000",
        "10. change percent": "0.5781%"
    }
}
```
如果API达到调用限制，可能会返回如下格式的`Note`:
```json
{
    "Note": "Thank you for using Alpha Vantage! Our standard API call frequency is 25 requests per day. Please subscribe to a premium plan to instantly increase your daily API request volume."
}
```