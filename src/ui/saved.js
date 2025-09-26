import { escapeHtml } from "../utils/strings.js";

export function renderSaved(savedListEl, t, items, onOpen, onDelete) {
  savedListEl.innerHTML = "";
  if (!items.length) {
    savedListEl.innerHTML = `<li class="saved__item" style="justify-content:center;color:var(--muted)">${t.noSaved}</li>`;
    return;
  }
  for (const c of items) {
    const label = c.label || "";
    const li = document.createElement("li");
    li.className = "saved__item";
    li.innerHTML = `
      <button class="open-btn" title="${t.open}">${escapeHtml(label)}</button>
      <button class="del-btn" title="${t.delete}">✕</button>
    `;
    li.querySelector(".open-btn").addEventListener("click", () =>
      onOpen(label)
    );
    li.querySelector(".del-btn").addEventListener("click", () =>
      onDelete(c.id ?? label)
    );
    savedListEl.appendChild(li);
  }
}
