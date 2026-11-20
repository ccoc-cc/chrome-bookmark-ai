// ai_client.js - 通用 OpenAI 兼容接口客户端（修复 JSON 顶级数组提取与 AbortError 穿透）

function resolveChatEndpoint(baseUrl) {
  let url = String(baseUrl || "").trim().replace(/\/+$/, "");
  if (!url) return "https://api.openai.com/v1/chat/completions";
  if (url.endsWith("/chat/completions")) return url;
  if (url.endsWith("/v1")) return `${url}/chat/completions`;
  return `${url}/v1/chat/completions`;
}

function extractJsonFromText(rawText) {
  if (!rawText || typeof rawText !== "string") {
    throw new Error("返回内容为空或非字符串");
  }
  let text = rawText.trim();

  // 1. 尝试匹配 ```json ... ``` 或 ``` ... ``` 块
  const jsonBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (jsonBlockMatch && jsonBlockMatch[1]) {
    try {
      return JSON.parse(jsonBlockMatch[1].trim());
    } catch (e) {
      text = jsonBlockMatch[1].trim();
    }
  }

  // 2. 探测最外层平衡括号（优先判断最外层是对象 {...} 还是数组 [...]）
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  const firstBracket = text.indexOf("[");
  const lastBracket = text.lastIndexOf("]");

  let candidate = null;

  // 如果数组 '[' 出现在 '{' 之前，优先作为顶级数组提取
  const hasValidArray = firstBracket !== -1 && lastBracket > firstBracket;
  const hasValidObject = firstBrace !== -1 && lastBrace > firstBrace;

  if (hasValidArray && (!hasValidObject || firstBracket < firstBrace)) {
    candidate = text.slice(firstBracket, lastBracket + 1);
  } else if (hasValidObject) {
    candidate = text.slice(firstBrace, lastBrace + 1);
  }

  if (candidate) {
    try {
      return JSON.parse(candidate);
    } catch (err) {
      // 容错：修复常见截断尾逗号 (e.g. [1, 2, ])
      const sanitized = candidate.replace(/,\s*([}\]])/g, "$1");
      return JSON.parse(sanitized);
    }
  }

  // 3. 原样解析
  return JSON.parse(text);
}

async function testConnection({ baseUrl, apiKey, model }) {
  const endpoint = resolveChatEndpoint(baseUrl);
  const start = performance.now();
  const headers = { "Content-Type": "application/json" };
  if (apiKey) headers["Authorization"] = `Bearer ${apiKey.trim()}`;

  const body = {
    model: model || "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a test probe." },
      { role: "user", content: "Respond with the single word 'PONG'." },
    ],
    max_tokens: 10,
    temperature: 0.1,
  };

  try {
    const resp = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    const elapsed = Math.round(performance.now() - start);

    if (!resp.ok) {
      let errText = "";
      try {
        const errJson = await resp.json();
        errText = errJson.error?.message || JSON.stringify(errJson);
      } catch (_) {
        errText = await resp.text();
      }
      return {
        ok: false,
        status: resp.status,
        error: `HTTP ${resp.status}: ${errText.slice(0, 300)}`,
        elapsed,
      };
    }

    const data = await resp.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || "";
    return {
      ok: true,
      status: 200,
      reply,
      model: data.model || model,
      elapsed,
    };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      error: `网络或跨域异常: ${err.message}`,
      elapsed: Math.round(performance.now() - start),
    };
  }
}

async function callChatCompletion({
  baseUrl,
  apiKey,
  model,
  temperature = 0.2,
  systemPrompt,
  userPrompt,
  jsonMode = true,
  signal,
}) {
  const endpoint = resolveChatEndpoint(baseUrl);
  const headers = { "Content-Type": "application/json" };
  if (apiKey) headers["Authorization"] = `Bearer ${apiKey.trim()}`;

  const messages = [];
  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }
  messages.push({ role: "user", content: userPrompt });

  const payload = {
    model: model || "gpt-4o-mini",
    messages,
    temperature: typeof temperature === "number" ? temperature : 0.2,
  };

  if (jsonMode) {
    payload.response_format = { type: "json_object" };
  }

  let resp;
  try {
    resp = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal,
    });
  } catch (err) {
    // 关键修复：保持 AbortError 原生属性穿透，确保中止判定不失效
    if (err.name === "AbortError") throw err;
    throw new Error(`请求接口失败 (${endpoint}): ${err.message}`);
  }

  // 针对不支持 response_format 的模型（返回 400）自动降级重试
  if (!resp.ok && jsonMode && resp.status === 400) {
    delete payload.response_format;
    try {
      resp = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
        signal,
      });
    } catch (retryErr) {
      if (retryErr.name === "AbortError") throw retryErr;
      throw new Error(`重试接口失败 (${endpoint}): ${retryErr.message}`);
    }
  }

  if (!resp.ok) {
    let errDetail = "";
    try {
      const errJson = await resp.json();
      errDetail = errJson.error?.message || JSON.stringify(errJson);
    } catch (_) {
      errDetail = await resp.text();
    }
    throw new Error(`接口响应错误 [HTTP ${resp.status}]: ${errDetail.slice(0, 400)}`);
  }

  const result = await resp.json();
  const rawContent = result.choices?.[0]?.message?.content || "";
  const usage = result.usage || null;

  return {
    rawContent,
    usage,
    model: result.model || model,
  };
}

window.AiClient = {
  resolveChatEndpoint,
  extractJsonFromText,
  testConnection,
  callChatCompletion,
};
