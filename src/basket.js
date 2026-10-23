const num = (s) => Number(String(s).replace(/[^\d]/g, "")) || 0;

export const BASKET_SELECTOR = ".use-halloween-basket";

export function readBasket(root) {
  const treats = num(root.querySelector(".available-treats .halloween-text")?.textContent);
  const collectedText = root.querySelector(".collected-treats-text")?.textContent ?? "";
  const [collected, goal] = (collectedText.match(/\d[\d,]*/g) ?? []).map(num);

  const lockedTiers = new Set();
  const upgrades = new Map();
  for (const slide of root.querySelectorAll(".updates-grid-slide")) {
    const tier = slide.dataset.label;
    const tierLocked = slide.classList.contains("disabled");
    if (tierLocked) lockedTiers.add(tier);
    for (const el of slide.querySelectorAll("button.basket-update[data-upgradeid]")) {
      const id = Number(el.dataset.upgradeid);
      upgrades.set(id, {
        id,
        name: el.querySelector(".update-name")?.textContent.trim() ?? "",
        tier,
        unlocked: el.classList.contains("unlocked"),
        selected: el.classList.contains("selected"),
        locked: tierLocked || el.disabled,
        el,
      });
    }
  }

  let pending = null;
  const confirmId = Number(root.querySelector(".confirmation-actions .upgrade[data-upgradeid]")?.dataset.upgradeid);
  const costMatch = /spend\s+([\d,]+)\s+treats?/i.exec(root.querySelector(".confirmation-box .update-cost")?.textContent ?? "");
  if (confirmId && costMatch) pending = { id: confirmId, cost: num(costMatch[1]) };

  return { treats, collected: collected ?? 0, goal: goal ?? 0, lockedTiers, upgrades, pending };
}
