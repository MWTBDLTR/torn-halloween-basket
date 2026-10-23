import { steps, never } from "virtual:route";
import css from "./styles.css";
import { BASKET_SELECTOR, readBasket } from "./basket.js";
import { paint, isPainted, centreWheel, hideCards } from "./overlay.js";
import { rememberCost, knownCosts } from "./storage.js";
import { CATALOG_COSTS } from "./upgrades.js";

function addStyle(text) {
  if (typeof GM_addStyle === "function") return GM_addStyle(text);
  const style = document.createElement("style");
  style.textContent = text;
  document.head.append(style);
}

function signature(state, costs) {
  const ups = [...state.upgrades.values()].map((u) => `${u.id}${u.unlocked ? "u" : ""}${u.locked ? "l" : ""}`);
  return [state.treats, [...state.lockedTiers].join(), ups.join(), JSON.stringify(costs)].join("|");
}

const lastSig = new WeakMap();

const resized = new ResizeObserver(() => document.querySelectorAll(BASKET_SELECTOR).forEach(centreWheel));

function watchSize(root) {
  for (const el of root.querySelectorAll(".flex-viewport, .updates-grid-slide-wrapper")) resized.observe(el);
}

function update() {
  for (const root of document.querySelectorAll(BASKET_SELECTOR)) {
    const state = readBasket(root);
    if (!state.upgrades.size) continue;
    if (state.pending) rememberCost(state.pending.id, state.pending.cost);
    const costs = { ...CATALOG_COSTS, ...knownCosts() };
    const sig = signature(state, costs);
    if (lastSig.get(root) === sig && isPainted(root)) continue;
    lastSig.set(root, sig);
    paint(root, { steps, never }, state, costs);
    watchSize(root);
  }
}

let queued = false;
function schedule() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(() => {
    queued = false;
    update();
  });
}

addStyle(css);
document.addEventListener("click", hideCards);
new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
schedule();
