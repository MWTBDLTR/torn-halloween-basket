// ==UserScript==
// @name         Torn Halloween Basket Route
// @namespace    church-tools
// @version      1.0.3
// @author       MrChurch [3654415]
// @description  Marks the recommended Halloween Basket upgrade route on the basket's upgrade wheel. Read-only: never clicks or requests anything.
// @match        https://www.torn.com/item.php*
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @downloadURL  https://github.com/MWTBDLTR/torn-halloween-basket/raw/main/dist/torn_halloween_basket.user.js
// @updateURL    https://github.com/MWTBDLTR/torn-halloween-basket/raw/main/dist/torn_halloween_basket.user.js
// ==/UserScript==

(() => {
  var steps = [{ id: 1, name: "I See Dead People", tier: "I", note: "" }, { id: 2, name: "Here's Johnny!", tier: "I", note: "" }, { id: 3, name: "Doubler", tier: "I", note: "" }, { id: 4, name: "Tripler", tier: "I", note: "" }, { id: 5, name: "Quadrupler", tier: "I", note: "" }, { id: 13, name: "Cat in Hell", tier: "III", note: "" }, { id: 6, name: "Quintupler", tier: "I", note: "" }, { id: 23, name: "Shadow of Doubt", tier: "IV", note: "+1,100 treats, which count toward basket progress. Getting here from step 7 takes roughly an entire event's worth of attacking" }, { id: 19, name: "Multipack", tier: "IV", note: "" }, { id: 20, name: "Deal with the Devil", tier: "IV", note: "" }, { id: 18, name: "Dark Power", tier: "III", note: "" }, { id: 15, name: "Freebie", tier: "III", note: "" }, { id: 9, name: "Bloody Mary", tier: "II", note: "" }, { id: 10, name: "Nice Chianti", tier: "II", note: "" }, { id: 11, name: "Nightcrawler", tier: "II", note: "" }, { id: 12, name: "It's Alive", tier: "II", note: "" }, { id: 17, name: "Cashback", tier: "III", note: "" }, { id: 7, name: "Candyman", tier: "II", note: "" }, { id: 8, name: "Sweet Release", tier: "II", note: "" }, { id: 16, name: "Cold Sweat", tier: "III", note: "+1 nerve per treat; assumes Crimes 2.0 is unlocked" }];
  var never = [14, 21, 22, 24];

  var styles_default = '.use-halloween-basket .basket-update.hbr-route {\n  position: relative;\n}\n\n.use-halloween-basket .hbr-badge {\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n  z-index: 3;\n  box-sizing: border-box;\n  min-width: 20px;\n  height: 20px;\n  padding: 0 5px;\n  border-radius: 10px;\n  transition: opacity 0.15s;\n  background: #1b1b1b;\n  border: 1px solid #f39c12;\n  color: #f39c12;\n  font: bold 11px/18px Arial, sans-serif;\n  text-align: center;\n  pointer-events: none;\n}\n\n.use-halloween-basket .basket-update.selected .hbr-badge,\n.use-halloween-basket .basket-update:hover .hbr-badge {\n  opacity: 0;\n}\n\n.use-halloween-basket .hbr-done .hbr-badge {\n  border-color: #555;\n  color: #777;\n}\n\n.use-halloween-basket .hbr-never .hbr-badge {\n  border-color: #c0392b;\n  color: #e74c3c;\n}\n\n.use-halloween-basket .basket-update.hbr-never {\n  opacity: 0.55;\n}\n\n.use-halloween-basket .basket-update.hbr-next {\n  border-radius: 50%;\n  box-shadow: 0 0 0 3px #f39c12, 0 0 14px 4px rgba(243, 156, 18, 0.7);\n}\n\n.use-halloween-basket .hbr-next .hbr-badge {\n  background: #f39c12;\n  color: #111;\n}\n\n.use-halloween-basket .hbr-status {\n  margin: 6px 20px 41px;\n  padding: 6px 10px;\n  border-left: 3px solid #f39c12;\n  background: rgba(0, 0, 0, 0.35);\n  color: #ddd;\n  font: 13px/1.4 Arial, sans-serif;\n}\n\n.use-halloween-basket .hbr-status[data-reason="locked"],\n.use-halloween-basket .hbr-status[data-reason="short"] {\n  border-left-color: #888;\n}\n';

  var num = (s) => Number(String(s).replace(/[^\d]/g, "")) || 0;
  var BASKET_SELECTOR = ".use-halloween-basket";
  function readBasket(root) {
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
          el
        });
      }
    }
    let pending = null;
    const confirmId = Number(root.querySelector(".confirmation-actions .upgrade[data-upgradeid]")?.dataset.upgradeid);
    const costMatch = /spend\s+([\d,]+)\s+treats?/i.exec(root.querySelector(".confirmation-box .update-cost")?.textContent ?? "");
    if (confirmId && costMatch) pending = { id: confirmId, cost: num(costMatch[1]) };
    return { treats, collected: collected ?? 0, goal: goal ?? 0, lockedTiers, upgrades, pending };
  }

  function nextStep(route, state, costs) {
    const index = route.findIndex((s) => !state.upgrades.get(s.id)?.unlocked);
    if (index === -1) return null;
    const step = route[index];
    const up = state.upgrades.get(step.id);
    let reason = "ready";
    if (!up || up.locked) reason = "locked";
    else if (costs[step.id] > state.treats) reason = "short";
    return { index, step, reason };
  }
  function progress(route, state) {
    const done = route.filter((s) => state.upgrades.get(s.id)?.unlocked).length;
    return { done, total: route.length };
  }

  var STATUS_CLASS = "hbr-status";
  var BADGE_CLASS = "hbr-badge";
  var MARK_CLASSES = ["hbr-route", "hbr-done", "hbr-next", "hbr-never"];
  var REASON_TEXT = {
    ready: "",
    short: "not enough treats yet",
    locked: "tier locked"
  };
  function addBadge(el, text) {
    const badge = document.createElement("span");
    badge.className = BADGE_CLASS;
    badge.textContent = text;
    el.append(badge);
  }
  function paint(root, { steps: route, never: never2 }, state, costs) {
    clear(root);
    for (const id of never2) {
      const up = state.upgrades.get(id);
      if (!up) continue;
      up.el.classList.add("hbr-route", "hbr-never");
      addBadge(up.el, "✕");
    }
    const status = document.createElement("div");
    status.className = STATUS_CLASS;
    root.querySelector(".treats-bar")?.after(status);
    if (!route.length) {
      status.textContent = "Route: no steps in ROUTE.md yet.";
      return;
    }
    route.forEach((step, i) => {
      const up = state.upgrades.get(step.id);
      if (!up) return;
      up.el.classList.add("hbr-route");
      if (up.unlocked) up.el.classList.add("hbr-done");
      addBadge(up.el, String(i + 1));
    });
    const next = nextStep(route, state, costs);
    const { done, total } = progress(route, state);
    if (!next) {
      status.textContent = done === total ? `Route complete (${done}/${total}).` : `Route ${done}/${total}.`;
      return;
    }
    state.upgrades.get(next.step.id)?.el.classList.add("hbr-next");
    const cost = costs[next.step.id];
    const parts = [
      `Next (${next.index + 1}/${total}): ${next.step.name}`,
      `tier ${next.step.tier}`,
      cost != null ? `${cost} treats` : null,
      REASON_TEXT[next.reason] || null,
      next.step.note || null
    ].filter(Boolean);
    status.textContent = parts.join(" · ");
    status.dataset.reason = next.reason;
  }
  function clear(root) {
    root.querySelectorAll(`.${STATUS_CLASS}, .${BADGE_CLASS}`).forEach((n) => n.remove());
    root.querySelectorAll(".hbr-route").forEach((n) => n.classList.remove(...MARK_CLASSES));
  }
  function isPainted(root) {
    return !!root.querySelector(`.${STATUS_CLASS}`);
  }

  var PREFIX = "hbr_";
  function getValue(key, fallback) {
    try {
      if (typeof GM_getValue === "function") return GM_getValue(PREFIX + key, fallback);
      const raw = localStorage.getItem(PREFIX + key);
      return raw == null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  }
  function setValue(key, value) {
    try {
      if (typeof GM_setValue === "function") GM_setValue(PREFIX + key, value);
      else localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
    }
  }
  function rememberCost(id, cost) {
    const costs = getValue("costs", {});
    if (costs[id] === cost) return;
    costs[id] = cost;
    setValue("costs", costs);
  }
  var knownCosts = () => getValue("costs", {});

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
  var lastSig = new WeakMap();
  function update() {
    for (const root of document.querySelectorAll(BASKET_SELECTOR)) {
      const state = readBasket(root);
      if (!state.upgrades.size) continue;
      if (state.pending) rememberCost(state.pending.id, state.pending.cost);
      const costs = knownCosts();
      const sig = signature(state, costs);
      if (lastSig.get(root) === sig && isPainted(root)) continue;
      lastSig.set(root, sig);
      paint(root, { steps, never }, state, costs);
    }
  }
  var queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      update();
    });
  }
  addStyle(styles_default);
  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
  schedule();
})();
