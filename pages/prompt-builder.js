const emptyText = "请先填写上方内容，生成的提示词会显示在这里。";

document.querySelectorAll(".prompt-builder").forEach((builder) => {
  const output = builder.querySelector(".prompt-builder__output");
  const button = builder.querySelector(".copy-button");
  const fields = builder.querySelectorAll("[data-key]");
  const trigger = builder.querySelector(".prompt-builder__trigger");
  const title = builder.querySelector(".prompt-builder__title");
  const desc = builder.querySelector(".prompt-builder__desc");

  if (trigger && title && desc) {
    const summary = document.createElement("span");
    summary.className = "prompt-builder__summary";
    summary.textContent = desc.textContent;
    title.appendChild(summary);
  }

  function buildPrompt() {
    let prompt = builder.dataset.template;
    fields.forEach((field) => {
      const value = field.value.trim();
      const label = field.closest("label").firstChild.textContent.trim();
      prompt = prompt.replaceAll(`{${field.dataset.key}}`, value || `（${label}）`);
    });
    output.textContent = prompt;
    return prompt;
  }

  fields.forEach((field) => {
    field.addEventListener("input", buildPrompt);
  });

  button.addEventListener("click", async () => {
    const prompt = buildPrompt();
    try {
      await navigator.clipboard.writeText(prompt);
      button.textContent = "已复制";
    } catch (error) {
      const range = document.createRange();
      range.selectNodeContents(output);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      button.textContent = "已选中";
    }
    setTimeout(() => {
      button.textContent = "一键复制";
    }, 1500);
  });

  output.textContent = emptyText;
  buildPrompt();
});

document.querySelectorAll(".prompt-builder__trigger").forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const builder = trigger.closest(".prompt-builder");
    const isOpen = builder.classList.contains("is-open");

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
