// web_bridge.js - 网页版 AI 会话自动化桥接器（兼容 ChatGPT 新版 /uc/ 与经典版 + DeepSeek）

(() => {
  window.__AI_BOOKMARK_BRIDGE_VERSION__ = "1.0.0";
  console.log(`[AI Bookmark Bridge v${window.__AI_BOOKMARK_BRIDGE_VERSION__}] 桥接器已注入`);

  // 工具 1：向输入框注入内容（兼容 React 受控 textarea 与 contenteditable）
  function setInputValue(el, text) {
    if (!el) throw new Error("未找到输入框元素");
    el.focus();

    if (el.tagName === "TEXTAREA" || el.tagName === "INPUT") {
      if (el._valueTracker) {
        el._valueTracker.setValue("");
      }
      const setter =
        Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set ||
        Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
      if (setter) {
        setter.call(el, text);
      } else {
        el.value = text;
      }
      el.dispatchEvent(new InputEvent("beforeinput", { bubbles: true, cancelable: true, inputType: "insertText", data: text }));
      el.dispatchEvent(new InputEvent("input", { bubbles: true, cancelable: true, inputType: "insertText", data: text }));
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
      return;
    }

    // contenteditable (ChatGPT 经典桌面版)
    let execSuccess = false;
    try {
      const sel = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(el);
      sel.removeAllRanges();
      sel.addRange(range);
      execSuccess = document.execCommand("insertText", false, text);
    } catch (_) {
      execSuccess = false;
    }

    if (!execSuccess || !el.textContent.includes(text.slice(0, 20))) {
      el.textContent = text;
    }
    el.dispatchEvent(new InputEvent("beforeinput", { bubbles: true, cancelable: true, inputType: "insertText", data: text }));
    el.dispatchEvent(new InputEvent("input", { bubbles: true, cancelable: true, inputType: "insertText", data: text }));
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function isInputEmpty(el) {
    if (!el) return true;
    const val = el.tagName === "TEXTAREA" || el.tagName === "INPUT" ? el.value : el.innerText || el.textContent;
    return !String(val || "").trim();
  }

  function robustClick(el) {
    if (!el) return;
    el.focus();
    const opts = { bubbles: true, cancelable: true, view: window };
    el.dispatchEvent(new PointerEvent("pointerdown", opts));
    el.dispatchEvent(new MouseEvent("mousedown", opts));
    el.dispatchEvent(new PointerEvent("pointerup", opts));
    el.dispatchEvent(new MouseEvent("mouseup", opts));
    el.dispatchEvent(new MouseEvent("click", opts));
    if (typeof el.click === "function") el.click();
  }

  function simulateEnter(el) {
    if (!el) return;
    el.focus();
    const keyOpts = {
      key: "Enter",
      code: "Enter",
      keyCode: 13,
      which: 13,
      bubbles: true,
      cancelable: true,
      composed: true,
      shiftKey: false,
    };
    el.dispatchEvent(new KeyboardEvent("keydown", keyOpts));
    el.dispatchEvent(new KeyboardEvent("keypress", keyOpts));
    el.dispatchEvent(new KeyboardEvent("keyup", keyOpts));
  }

  function extractTextFromAssistantEl(el) {
    if (!el) return "";
    // 1. 优先提取内部代码块
    const codes = Array.from(el.querySelectorAll("pre, code"));
    for (let i = codes.length - 1; i >= 0; i--) {
      const t = (codes[i].innerText || codes[i].textContent || "").trim();
      if (t.includes("{") || t.includes("[")) return t;
    }
    // 2. ChatGPT 新版 /uc/ UI 将正文放在 <section> 内，跳过末尾的“登录/免费注册”提示 section
    const sections = Array.from(el.querySelectorAll("section"));
    for (const sec of sections) {
      const t = (sec.innerText || sec.textContent || "").trim();
      if (t.includes("{") || t.includes("[")) return t;
    }
    return (el.innerText || el.textContent || "").trim();
  }

  function getElementId(el) {
    if (!el) return "";
    return el.id || el.getAttribute("data-message-id") || "";
  }

  // 适配器集合
  const ADAPTERS = {
    deepseek: {
      match: () => window.location.hostname.includes("deepseek.com"),
      getInput: () =>
        document.querySelector("textarea#chat-input") ||
        document.querySelector("textarea[placeholder*='DeepSeek']") ||
        document.querySelector("textarea"),
      getSendButton: () => {
        const byAria =
          document.querySelector("div[aria-label='发送']") ||
          document.querySelector("button[aria-label='发送']") ||
          document.querySelector("div[title='发送']") ||
          document.querySelector("button[title='发送']") ||
          document.querySelector("div[aria-label='Send']") ||
          document.querySelector("button[aria-label='Send']");
        if (byAria) return byAria;

        const input = document.querySelector("textarea#chat-input") || document.querySelector("textarea");
        if (input) {
          let parent = input.parentElement;
          for (let i = 0; i < 6 && parent; i++) {
            const btns = Array.from(parent.querySelectorAll("div[role='button'], button, .ds-icon-button"));
            const candidate = btns.reverse().find((b) => b.getAttribute("aria-disabled") !== "true" && !b.disabled);
            if (candidate) return candidate;
            parent = parent.parentElement;
          }
        }
        return (
          document.querySelector("div[role='button'][aria-disabled='false']") ||
          document.querySelector("button[type='submit']")
        );
      },
      isGenerating: () =>
        Boolean(
          document.querySelector("div[aria-label='停止']") ||
            document.querySelector("button[aria-label='停止']") ||
            document.querySelector(".ds-icon-button--stop") ||
            document.querySelector("[data-testid='stop-button']")
        ),
      getAssistantElements: () =>
        Array.from(document.querySelectorAll(".ds-markdown, .ds-message-content")).filter(
          (el) => !el.parentElement?.closest(".ds-markdown, .ds-message-content")
        ),
      isElementComplete: () => false,
      getLatestResponse() {
        const els = this.getAssistantElements();
        if (els.length === 0) return "";
        return extractTextFromAssistantEl(els[els.length - 1]);
      },
      getAllResponses() {
        return this.getAssistantElements()
          .map((el) => ({ id: getElementId(el), text: extractTextFromAssistantEl(el) }))
          .filter((item) => item.text.length > 10);
      },
    },
    chatgpt: {
      match: () => window.location.hostname.includes("chatgpt.com") || window.location.hostname.includes("openai.com"),
      getInput: () =>
        document.querySelector("#mobile-composer-prompt") ||
        document.querySelector("#prompt-textarea") ||
        document.querySelector("div[contenteditable='true']") ||
        document.querySelector("textarea"),
      getSendButton: () =>
        document.querySelector("button[data-testid='send-button']") ||
        document.querySelector("button[data-testid='fruitjuice-send-button']") ||
        document.querySelector("button[aria-label='发送消息']") ||
        document.querySelector("button[aria-label='发送提示']") ||
        document.querySelector("button[aria-label='Send message']") ||
        document.querySelector("button[aria-label='Send prompt']") ||
        document.querySelector("button[aria-label='Send']") ||
        document.querySelector("button[aria-label*='发送']") ||
        document.querySelector("form button[type='submit']"),
      getAssistantElements: () =>
        Array.from(document.querySelectorAll('[data-message-role="assistant"], [data-message-author-role="assistant"]')),
      isElementComplete: (el) => Boolean(el && el.hasAttribute("data-message-complete")),
      isGenerating() {
        const stopBtn =
          document.querySelector("button[data-testid='stop-button']") ||
          document.querySelector("button[data-testid='fruitjuice-stop-button']") ||
          document.querySelector("button[aria-label*='Stop']") ||
          document.querySelector("button[aria-label*='停止']");
        if (stopBtn || document.querySelector(".result-streaming")) return true;
        // ChatGPT /uc/ 新版：存在 data-assistant-content-started 但尚未打上 data-message-complete
        const els = this.getAssistantElements();
        const last = els[els.length - 1];
        if (last && last.hasAttribute("data-assistant-content-started") && !last.hasAttribute("data-message-complete")) {
          return true;
        }
        return false;
      },
      getLatestResponse() {
        const els = this.getAssistantElements();
        if (els.length > 0) {
          return extractTextFromAssistantEl(els[els.length - 1]);
        }
        const pres = Array.from(document.querySelectorAll("pre, code"));
        for (let i = pres.length - 1; i >= 0; i--) {
          const t = (pres[i].innerText || pres[i].textContent || "").trim();
          if (t.includes('"operations"') || (t.includes('"id"') && t.includes('"action"'))) return t;
        }
        return "";
      },
      getAllResponses() {
        return this.getAssistantElements()
          .map((el) => ({
            id: getElementId(el),
            complete: this.isElementComplete(el),
            text: extractTextFromAssistantEl(el),
          }))
          .filter((item) => item.text.length > 10);
      },
    },
  };

  function getActiveAdapter() {
    if (ADAPTERS.deepseek.match()) return ADAPTERS.deepseek;
    if (ADAPTERS.chatgpt.match()) return ADAPTERS.chatgpt;
    return null;
  }

  function hasCompleteJson(text) {
    if (!text || text.length < 20) return false;
    const t = text.trim();
    const endsWithBracket = t.endsWith("}") || t.endsWith("]") || t.endsWith("```");
    if (!endsWithBracket) return false;
    return t.includes('"operations"') || (t.includes('"id"') && t.includes('"action"'));
  }

  // 执行单轮自动化交互（注入 -> 发送 -> 监听 -> 抓取）
  async function executeTurn(promptText, timeoutMs = 120000) {
    const adapter = getActiveAdapter();
    if (!adapter) {
      throw new Error(`当前页面 [${window.location.hostname}] 不是支持的 AI 网页版 (DeepSeek / ChatGPT)`);
    }

    const inputEl = adapter.getInput();
    if (!inputEl) {
      throw new Error("未能定位到网页版输入框，请确保会话界面已加载完成");
    }

    // 取消任何残留的前序轮询
    if (typeof window.__AI_BOOKMARK_CANCEL_TURN__ === "function") {
      window.__AI_BOOKMARK_CANCEL_TURN__();
    }

    // 记录发送前的精确基线（助手消息数量 + 末条消息 ID + 文本）
    const initialEls = adapter.getAssistantElements();
    const initialCount = initialEls.length;
    const initialLastId = getElementId(initialEls[initialCount - 1]);
    const initialLastText = adapter.getLatestResponse();

    console.log(
      "[AI Bookmark Bridge] 发送前基线: 助手消息数=",
      initialCount,
      "末条ID=",
      initialLastId,
      "文本长度=",
      initialLastText.length
    );

    // 1. 注入提示词
    setInputValue(inputEl, promptText);
    await new Promise((r) => setTimeout(r, 150));

    // 2. 尝试发送（最多 3.5 秒，一旦输入框清空或出现新回复立即退出防重复提交）
    const sendStart = Date.now();
    let clickedOnce = false;

    while (Date.now() - sendStart < 3500) {
      const curEls = adapter.getAssistantElements();
      if (adapter.isGenerating() || curEls.length > initialCount || isInputEmpty(inputEl)) {
        break;
      }

      const sendBtn = adapter.getSendButton();
      const isBtnEnabled = sendBtn && sendBtn.getAttribute("aria-disabled") !== "true" && !sendBtn.disabled;

      if (isBtnEnabled) {
        robustClick(sendBtn);
        clickedOnce = true;
      } else if (clickedOnce) {
        simulateEnter(inputEl);
      }

      await new Promise((r) => setTimeout(r, 250));

      if (adapter.isGenerating() || adapter.getAssistantElements().length > initialCount || isInputEmpty(inputEl)) {
        break;
      }

      if (!isBtnEnabled) {
        simulateEnter(inputEl);
      }
    }

    // 3. 高频轮询等待新助手回复生成完毕（250ms 周期）
    const startTime = Date.now();
    let hasStarted = false;
    let stableReply = "";
    let stableCount = 0;

    return new Promise((resolve, reject) => {
      let finished = false;
      const cleanup = () => {
        finished = true;
        clearInterval(interval);
        window.__AI_BOOKMARK_CANCEL_TURN__ = null;
      };

      window.__AI_BOOKMARK_CANCEL_TURN__ = () => {
        if (finished) return;
        cleanup();
        const err = new Error("用户手动中止了网页会话等待");
        err.name = "AbortError";
        reject(err);
      };

      const interval = setInterval(() => {
        if (finished) return;
        const elapsed = Date.now() - startTime;

        const curEls = adapter.getAssistantElements();
        const curCount = curEls.length;
        const lastEl = curEls[curCount - 1] || null;
        const curLastId = getElementId(lastEl);
        const currentText = adapter.getLatestResponse();
        const isGen = adapter.isGenerating();
        const isNewAssistant = curCount > initialCount || (curLastId && curLastId !== initialLastId);

        if (elapsed > timeoutMs) {
          cleanup();
          if (isNewAssistant && currentText && currentText.length > 20) {
            resolve({ ok: true, reply: currentText, elapsed, hostname: window.location.hostname });
            return;
          }
          reject(
            new Error(
              `网页响应超时（已等待 ${Math.round(timeoutMs / 1000)} 秒）。请检查右侧网页状态，若已生成可点击【⚡ 立即读取网页当前结果并解析】`
            )
          );
          return;
        }

        if (isGen || isNewAssistant || (currentText && currentText !== initialLastText && currentText.length > 20)) {
          hasStarted = true;
        }

        if (!hasStarted) return;

        // 信号 1（最精确）：ChatGPT 新版直接带有 data-message-complete 属性
        if (isNewAssistant && adapter.isElementComplete(lastEl) && currentText.length > 20) {
          cleanup();
          console.log("[AI Bookmark Bridge] 命中 data-message-complete，极速返回！字数:", currentText.length, "耗时:", elapsed);
          resolve({ ok: true, reply: currentText, elapsed, hostname: window.location.hostname });
          return;
        }

        // 信号 2：不在生成态且已包含闭合 JSON
        const isNewText = isNewAssistant || currentText !== initialLastText;
        const isClosedJson = hasCompleteJson(currentText);
        if (!isGen && isNewText && isClosedJson) {
          cleanup();
          console.log("[AI Bookmark Bridge] JSON 闭合且停止生成，极速返回！字数:", currentText.length, "耗时:", elapsed);
          resolve({ ok: true, reply: currentText, elapsed, hostname: window.location.hostname });
          return;
        }

        // 信号 3：文本稳定期兜底（连续 3 次 = 750ms 无变化且非生成态）
        if (isNewText && currentText && currentText.length > 20) {
          if (currentText === stableReply) {
            stableCount++;
          } else {
            stableReply = currentText;
            stableCount = 1;
          }
          if (stableCount >= 3 && (!isGen || isClosedJson)) {
            cleanup();
            console.log("[AI Bookmark Bridge] 文本稳定捕获完成！字数:", currentText.length, "耗时:", elapsed);
            resolve({ ok: true, reply: currentText, elapsed, hostname: window.location.hostname });
          }
        }
      }, 250);
    });
  }

  // 挂载全局入口
  window.__AI_BOOKMARK_EXECUTE_TURN__ = executeTurn;
  window.__AI_BOOKMARK_GET_LATEST__ = () => {
    const adapter = getActiveAdapter();
    return adapter ? adapter.getLatestResponse() : "";
  };
  window.__AI_BOOKMARK_GET_ALL__ = () => {
    const adapter = getActiveAdapter();
    return adapter ? adapter.getAllResponses() : [];
  };

  // 支持热更新覆盖的消息处理器
  window.__AI_BOOKMARK_MESSAGE_HANDLER__ = (request, sender, sendResponse) => {
    if (request.type === "PING_BRIDGE") {
      const adapter = getActiveAdapter();
      sendResponse({
        ok: true,
        version: window.__AI_BOOKMARK_BRIDGE_VERSION__,
        site: adapter ? (adapter === ADAPTERS.deepseek ? "deepseek" : "chatgpt") : "unknown",
        hostname: window.location.hostname,
        hasInput: Boolean(adapter?.getInput()),
        assistantCount: adapter ? adapter.getAssistantElements().length : 0,
      });
      return true;
    }

    if (request.type === "EXECUTE_WEB_TURN") {
      const runner = window.__AI_BOOKMARK_EXECUTE_TURN__ || executeTurn;
      runner(request.prompt, request.timeoutMs)
        .then((res) => sendResponse(res))
        .catch((err) => sendResponse({ ok: false, error: err.message, aborted: err.name === "AbortError" }));
      return true;
    }

    if (request.type === "CANCEL_WEB_TURN") {
      if (typeof window.__AI_BOOKMARK_CANCEL_TURN__ === "function") {
        window.__AI_BOOKMARK_CANCEL_TURN__();
      }
      sendResponse({ ok: true });
      return true;
    }

    if (request.type === "GRAB_LATEST_RESPONSE") {
      const text = window.__AI_BOOKMARK_GET_LATEST__();
      sendResponse({ ok: Boolean(text && text.length > 10), reply: text });
      return true;
    }

    if (request.type === "GRAB_ALL_RESPONSES") {
      const list = window.__AI_BOOKMARK_GET_ALL__();
      sendResponse({ ok: list.length > 0, replies: list });
      return true;
    }
  };

  if (!window.__AI_BOOKMARK_LISTENER_REGISTERED__) {
    window.__AI_BOOKMARK_LISTENER_REGISTERED__ = true;
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (typeof window.__AI_BOOKMARK_MESSAGE_HANDLER__ === "function") {
        return window.__AI_BOOKMARK_MESSAGE_HANDLER__(request, sender, sendResponse);
      }
    });
  }
})();
