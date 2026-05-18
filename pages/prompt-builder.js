const emptyText = "👆 请在上方填写需求，生成的指令会显示在这里。";

document.querySelectorAll(".prompt-builder").forEach((builder) => {
  const output = builder.querySelector(".prompt-builder__output");
  const button = builder.querySelector(".copy-button");
  const fields = builder.querySelectorAll("[data-key]");
  const trigger = builder.querySelector(".prompt-builder__trigger");
  const title = builder.querySelector(".prompt-builder__title");
  const desc = builder.querySelector(".prompt-builder__desc");

  // 在标题下显示描述摘要（仅手风琴模式）
  if (trigger && title && desc) {
    const summary = document.createElement("span");
    summary.className = "prompt-builder__summary";
    summary.textContent = desc.textContent;
    title.appendChild(summary);
  }

  function buildPrompt() {
    let prompt = builder.dataset.template;
    let anyFilled = false;

    fields.forEach((field) => {
      if (field.type === "checkbox") return; // 思维链开关单独处理
      const value = field.value.trim();
      const key = field.dataset.key;
      if (value) {
        prompt = prompt.replaceAll(`{${key}}`, value);
        anyFilled = true;
      } else {
        // 移除模板中该占位符，并清理可能的多余标点
        prompt = prompt.replaceAll(`{${key}}`, "");
      }
    });

    // 清理可能残留的双空格、逗号、句号等
    prompt = prompt.replace(/\s+/g, " ").replace(/\s?,\s?,/g, ",").trim();

    if (!anyFilled) {
      output.textContent = emptyText;
      return "";
    }

    // 检查思维链复选框
    const chainCheck = builder.querySelector('[data-key="chain"]');
    if (chainCheck && chainCheck.checked) {
      prompt = "请一步步思考，先给出分析过程再输出最终答案。\n" + prompt;
    }

    output.textContent = prompt;
    return prompt;
  }

  // 绑定输入事件
  fields.forEach((field) => {
    if (field.type !== "checkbox") {
      field.addEventListener("input", buildPrompt);
    } else {
      field.addEventListener("change", buildPrompt);
    }
  });

  // 复制按钮
  button.addEventListener("click", async () => {
    const prompt = buildPrompt();
    if (!prompt) {
      button.textContent = "无内容";
      setTimeout(() => { button.textContent = "一键复制"; }, 1500);
      return;
    }
    try {
      await navigator.clipboard.writeText(prompt);
      button.textContent = "已复制 ✓";
    } catch (err) {
      // 回退方案
      const textarea = document.createElement("textarea");
      textarea.value = prompt;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      button.textContent = "已复制 ✓";
    }
    setTimeout(() => { button.textContent = "一键复制"; }, 1500);
  });

  // 初始化显示
  output.textContent = emptyText;
  buildPrompt();
});

// 手风琴交互
document.querySelectorAll(".prompt-builder__trigger").forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const builder = trigger.closest(".prompt-builder");
    const isOpen = builder.classList.contains("is-open");

    // 关闭其他所有展开项
    document.querySelectorAll(".prompt-builder--accordion.is-open").forEach((openBuilder) => {
      openBuilder.classList.remove("is-open");
      openBuilder.querySelector(".prompt-builder__trigger").setAttribute("aria-expanded", "false");
      openBuilder.querySelector(".prompt-builder__arrow").textContent = "展开";
    });

    if (!isOpen) {
      builder.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true");
      builder.querySelector(".prompt-builder__arrow").textContent = "收起";
    }
  });
});
