// ==UserScript==
// @name         Torn Halloween Basket Route
// @namespace    church-tools
// @version      1.1.0
// @author       MrChurch [3654415]
// @description  Marks the recommended Halloween Basket upgrade route on the basket's upgrade wheel.
// @license      CC-BY-NC-SA-4.0
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

  var styles_default = '.use-halloween-basket .basket-update.hbr-route {\n  position: relative;\n}\n\n.use-halloween-basket .updates-grid-slide {\n  left: var(--hbr-wheel-shift, 0px);\n}\n\n.use-halloween-basket .hbr-badge {\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n  z-index: 3;\n  box-sizing: border-box;\n  min-width: 20px;\n  height: 20px;\n  padding: 0 5px;\n  border-radius: 10px;\n  transition: opacity 0.15s;\n  background: #1b1b1b;\n  border: 1px solid #f39c12;\n  color: #f39c12;\n  font: bold 11px/18px Arial, sans-serif;\n  text-align: center;\n  pointer-events: none;\n}\n\n.use-halloween-basket .basket-update.selected .hbr-badge,\n.use-halloween-basket .basket-update:hover .hbr-badge {\n  opacity: 0;\n}\n\n.use-halloween-basket .hbr-done .hbr-badge {\n  border-color: #555;\n  color: #777;\n}\n\n.use-halloween-basket .hbr-never .hbr-badge {\n  border-color: #c0392b;\n  color: #e74c3c;\n}\n\n.use-halloween-basket .basket-update.hbr-never {\n  opacity: 0.55;\n}\n\n.use-halloween-basket .basket-update.hbr-next {\n  border-radius: 50%;\n  box-shadow: 0 0 0 3px #f39c12, 0 0 14px 4px rgba(243, 156, 18, 0.7);\n}\n\n.use-halloween-basket .hbr-next .hbr-badge {\n  background: #f39c12;\n  color: #111;\n}\n\n.use-halloween-basket .hbr-status {\n  margin: 6px 20px 41px;\n  padding: 6px 10px;\n  border-left: 3px solid #f39c12;\n  background: rgba(0, 0, 0, 0.35);\n  color: #ddd;\n  font: 13px/1.4 Arial, sans-serif;\n}\n\n.use-halloween-basket .hbr-status[data-reason="locked"],\n.use-halloween-basket .hbr-status[data-reason="short"] {\n  border-left-color: #888;\n}\n\n.use-halloween-basket .hbr-guide {\n  color: #f39c12;\n  text-decoration: underline;\n}\n\n.use-halloween-basket .hbr-hit {\n  position: absolute;\n  z-index: 4;\n  border-radius: 50%;\n  cursor: help;\n  pointer-events: auto;\n}\n\n.use-halloween-basket .hbr-card {\n  position: absolute;\n  z-index: 10;\n  box-sizing: border-box;\n  width: 260px;\n  max-width: 100%;\n  padding: 8px 10px;\n  border: 1px solid #f39c12;\n  border-radius: 4px;\n  background: #1b1b1b;\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);\n  color: #ddd;\n  font: 12px/1.4 Arial, sans-serif;\n  text-align: left;\n  pointer-events: none;\n}\n\n.use-halloween-basket .hbr-card[hidden] {\n  display: none;\n}\n\n.use-halloween-basket .hbr-card-title {\n  color: #f39c12;\n  font-weight: bold;\n}\n\n.use-halloween-basket .hbr-card-desc {\n  margin-top: 4px;\n}\n\n.use-halloween-basket .hbr-card-flavor {\n  margin-top: 2px;\n  color: #999;\n  font-style: italic;\n}\n\n.use-halloween-basket .hbr-card-foot {\n  margin-top: 6px;\n  color: #bbb;\n}\n\n.use-halloween-basket.hbr-exchange-locked .exchange-btn {\n  opacity: 0.4;\n  pointer-events: none;\n}\n\n.use-halloween-basket .exchange-action {\n  position: relative;\n}\n\n.use-halloween-basket .hbr-lock {\n  position: absolute;\n  right: 0;\n  bottom: 0;\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  height: 15px;\n  color: #ddd;\n  font: 11px/15px Arial, sans-serif;\n  cursor: pointer;\n  user-select: none;\n}\n\n.use-halloween-basket .hbr-lock input {\n  width: 11px;\n  height: 11px;\n  margin: 0;\n}\n';

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

  var TIERS = [
    { label: "I", cls: "basic", unlocksAt: null },
    { label: "II", cls: "frightful", unlocksAt: "Frightful" },
    { label: "III", cls: "hhocking", unlocksAt: "Shocking" },
    { label: "IV", cls: "horrifying", unlocksAt: "Horrifying" }
  ];
  var CATALOG = [
    [
      ["I See Dead People", 3, "This upgrade gives +10% chance of receiving a treat when wearing any scary clothing.", "I.e. Kabuki Mask, Medieval Helmet, Witch's Hat, Straitjacket & scary masks."],
      ["Here's Johnny!", 5, "This upgrade gives +10% chance of receiving a treat when ending a victim with a scary weapon.", "I.e. Axe, Chainsaw, Blood Spattered Sickle, Devil's Pitchfork, Petrified Humerus."],
      ["Doubler", 25, "This upgrade has a 20% chance of doubling the treats received after an attack.", "This 2x bonus can stack with Tripler, Quadrupler & Quintupler."],
      ["Tripler", 50, "This upgrade has a 10% chance of tripling the treats received after an attack.", "This 3x bonus can stack with Doubler, Quadrupler & Quintupler."],
      ["Quadrupler", 75, "This upgrade has a 5% chance of quadrupling the treats received after an attack.", "This 4x bonus can stack with Doubler, Tripler & Quintupler."],
      ["Quintupler", 100, "This upgrade has a 1% chance of quintupling the treats received after an attack.", "This 5x bonus can stack with Doubler, Tripler & Quadrupler."]
    ],
    [
      ["Candyman", 5, "This upgrade unlocks medium-tier candy.", "Bag of Bloody Eyeballs is added to the candy reward pool."],
      ["Sweet Release", 10, "This upgrade unlocks high-tier candy.", "Bag of Chocolate Truffles is added to the candy reward pool."],
      ["Bloody Mary", 15, "This upgrade unlocks medium-tier alcohol.", "Bottle of Wicked Witch is added to the alcohol reward pool."],
      ["Nice Chianti", 30, "This upgrade unlocks high-tier alcohol.", "Bottle of Stinky Swamp Punch is added to the alcohol reward pool."],
      ["Nightcrawler", 45, "This upgrade unlocks medium-tier energy drink.", "Can of Munster is added to the energy drink reward pool."],
      ["It's Alive", 90, "This upgrade unlocks high-tier energy drink.", "Can of Red Cow is added to the energy drink reward pool."]
    ],
    [
      ["Cat in Hell", 13, "This upgrade gives a 1 in 500,000 chance with every attack of instantly receiving 1,000 treats.", "Or the equivalent of being struck by lightning..."],
      ["Save Your Tears", 95, "When exchanging your treats you'll also receive +500 happiness for every treat exchanged.", "Up to 99,999 happiness."],
      ["Freebie", 120, "Receive an additional bonus treat for every 10 upon exchange.", "Exchange ten and get one free."],
      ["Cold Sweat", 170, "When exchanging your treats you'll also receive +1 nerve for every treat exchanged.", "Up to 32,767 nerve."],
      ["Cashback", 230, "After exchanging your treats you'll immediately receive 10% back with this upgrade.", "We want to reward your loyalty."],
      ["Dark Power", 285, "When exchanging your treats you'll also receive +5 energy for every treat exchanged.", "Up to 1,000 energy."]
    ],
    [
      ["Multipack", 180, "This upgrade gives a 3% chance of consumables being upgraded to Multipacks upon exchange.", "I.e. A rewarded bottle of beer may become a Six Pack of Alcohol."],
      ["Deal with the Devil", 320, "This upgrade gives a 3% chance of consumables being upgraded to Boosters and Special items upon exchange.", "Treats may be converted into Erotic DVDs, Feathery Hotel Coupons, Business Class Tickets and Casino Passes."],
      ["Mortal Coil", 500, "Receive 1 treat for free every hour while the Halloween Basket event is active.", "A trickle of treats for doing absolutely nothing."],
      ["Inflation", 777, "The treats in your basket increase by 0.1% per hour while the Halloween Basket event is active.", "This covers the rate of Freddo price increases and confectionary shrinkage."],
      ["Shadow of Doubt", 1e3, "This upgrade immediately provides exactly 1,100 treats.", "Probably...?"],
      ["Summon Him", 9999, "Begins the end times.", "It was nice knowing you."]
    ]
  ];
  var UPGRADES = CATALOG.flatMap(
    (rows, t) => rows.map(([name, cost, desc, flavor], i) => ({ id: t * 6 + i + 1, name, tier: TIERS[t].label, cost, desc, flavor }))
  );
  var CATALOG_COSTS = Object.fromEntries(UPGRADES.map((u) => [u.id, u.cost]));
  var norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  var byName = new Map(UPGRADES.map((u) => [norm(u.name), u]));
  function findUpgrade(ref) {
    const m = /^#?(\d+)$/.exec(ref.trim());
    if (m) return UPGRADES[Number(m[1]) - 1] ?? null;
    return byName.get(norm(ref)) ?? null;
  }
  var tierOf = (label) => TIERS.find((t) => t.label === label) ?? null;

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
  var exchangeLocked = () => getValue("exchange_locked", true);
  var setExchangeLocked = (locked) => setValue("exchange_locked", locked);

  var STATUS_CLASS = "hbr-status";
  var LOCK_CLASS = "hbr-lock";
  var LOCKED_CLASS = "hbr-exchange-locked";
  var BADGE_CLASS = "hbr-badge";
  var HIT_CLASS = "hbr-hit";
  var CARD_CLASS = "hbr-card";
  var MARK_CLASSES = ["hbr-route", "hbr-done", "hbr-next", "hbr-never"];
  var SHIFT_VAR = "--hbr-wheel-shift";
  var GUIDE_URL = "https://www.torn.com/forums.php#/p=threads&f=61&t=16192843&b=0&a=0";
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
  function setStatus(status, text) {
    const guide = document.createElement("a");
    guide.className = "hbr-guide";
    guide.href = GUIDE_URL;
    guide.target = "_blank";
    guide.rel = "noopener";
    guide.textContent = "Halloween guide";
    status.replaceChildren(`${text} · `, guide);
  }
  var fmt = (n) => n.toLocaleString("en-US");
  function line(cls, text) {
    const el = document.createElement("div");
    el.className = cls;
    el.textContent = text;
    return el;
  }
  function fillCard(card, up, { route, never: never2, state, costs }) {
    const info = findUpgrade(`#${up.id}`);
    const cost = costs[up.id];
    const step = route.findIndex((s) => s.id === up.id);
    const unlocksAt = tierOf(up.tier)?.unlocksAt;
    const plan = never2.includes(up.id) ? "Never buy" : step >= 0 ? `Route step ${step + 1}` : null;
    const wallet = cost == null ? null : cost > state.treats ? `${fmt(cost - state.treats)} treats short` : "affordable";
    card.replaceChildren(
      line("hbr-card-title", [up.name, `tier ${up.tier}`, cost != null ? `${fmt(cost)} treats` : null].filter(Boolean).join(" · ")),
      ...info ? [line("hbr-card-desc", info.desc), line("hbr-card-flavor", info.flavor)] : [],
      line("hbr-card-foot", [unlocksAt ? `Unlocks at a ${unlocksAt} basket` : null, plan, wallet].filter(Boolean).join(" · "))
    );
  }
  function showCard(root, card, hit) {
    card.hidden = false;
    const box = root.getBoundingClientRect();
    const spot = hit.getBoundingClientRect();
    const left = spot.left + spot.width / 2 - box.left - card.offsetWidth / 2;
    card.style.left = `${Math.max(0, Math.min(left, root.clientWidth - card.offsetWidth))}px`;
    card.style.top = `${spot.bottom - box.top + 6}px`;
  }
  function addInfoCards(root, ctx) {
    const card = document.createElement("div");
    card.className = CARD_CLASS;
    card.hidden = true;
    root.append(card);
    for (const up of ctx.state.upgrades.values()) {
      if (!up.locked) continue;
      const at = getComputedStyle(up.el);
      const hit = document.createElement("span");
      hit.className = HIT_CLASS;
      Object.assign(hit.style, { top: at.top, left: at.left, width: at.width, height: at.height });
      hit.addEventListener("mouseenter", () => {
        fillCard(card, up, ctx);
        showCard(root, card, hit);
      });
      hit.addEventListener("mouseleave", () => card.hidden = true);
      hit.addEventListener("click", (e) => {
        e.stopPropagation();
        fillCard(card, up, ctx);
        showCard(root, card, hit);
      });
      up.el.parentElement.append(hit);
    }
  }
  function addExchangeLock(root) {
    const button = root.querySelector(".exchange-btn");
    if (!button) return;
    root.classList.toggle(LOCKED_CLASS, exchangeLocked());
    const label = document.createElement("label");
    label.className = LOCK_CLASS;
    label.title = "Blocks the Exchange all treats button so it can't be pressed by accident";
    const box = document.createElement("input");
    box.type = "checkbox";
    box.checked = exchangeLocked();
    box.addEventListener("change", () => {
      setExchangeLocked(box.checked);
      root.classList.toggle(LOCKED_CLASS, box.checked);
    });
    label.addEventListener("click", (e) => e.stopPropagation());
    label.append(box, "Lock exchange");
    button.after(label);
  }
  function blockExchange(e) {
    const button = e.target.closest?.(".exchange-btn");
    if (!button?.closest(`.${LOCKED_CLASS}`)) return;
    e.preventDefault();
    e.stopImmediatePropagation();
  }
  function hideCards() {
    document.querySelectorAll(`.${CARD_CLASS}`).forEach((c) => c.hidden = true);
  }
  function centreWheel(root) {
    const viewport = root.querySelector(".flex-viewport");
    const slide = root.querySelector(".updates-grid-slide-wrapper");
    if (!viewport?.clientWidth || !slide?.offsetWidth) return root.style.removeProperty(SHIFT_VAR);
    root.style.setProperty(SHIFT_VAR, `${(viewport.clientWidth - slide.offsetWidth) / 2}px`);
  }
  function paint(root, { steps: route, never: never2 }, state, costs) {
    clear(root);
    centreWheel(root);
    for (const id of never2) {
      const up = state.upgrades.get(id);
      if (!up) continue;
      up.el.classList.add("hbr-route", "hbr-never");
      addBadge(up.el, "✕");
    }
    const status = document.createElement("div");
    status.className = STATUS_CLASS;
    root.querySelector(".treats-bar")?.after(status);
    addInfoCards(root, { route, never: never2, state, costs });
    addExchangeLock(root);
    if (!route.length) {
      setStatus(status, "Route: no steps in ROUTE.md yet.");
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
      setStatus(status, done === total ? `Route complete (${done}/${total}).` : `Route ${done}/${total}.`);
      return;
    }
    state.upgrades.get(next.step.id)?.el.classList.add("hbr-next");
    const cost = costs[next.step.id];
    const parts = [
      `Next (${next.index + 1}/${total}): ${next.step.name}`,
      `tier ${next.step.tier}`,
      cost != null ? `${fmt(cost)} treats` : null,
      REASON_TEXT[next.reason] || null,
      next.step.note || null
    ].filter(Boolean);
    setStatus(status, parts.join(" · "));
    status.dataset.reason = next.reason;
  }
  function clear(root) {
    root.querySelectorAll(`.${STATUS_CLASS}, .${BADGE_CLASS}, .${HIT_CLASS}, .${CARD_CLASS}, .${LOCK_CLASS}`).forEach((n) => n.remove());
    root.querySelectorAll(".hbr-route").forEach((n) => n.classList.remove(...MARK_CLASSES));
    root.classList.remove(LOCKED_CLASS);
    root.style.removeProperty(SHIFT_VAR);
  }
  function isPainted(root) {
    if (!root.querySelector(`.${STATUS_CLASS}`)) return false;
    return !root.querySelector(".exchange-btn") || !!root.querySelector(`.${LOCK_CLASS}`);
  }

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
  var resized = new ResizeObserver(() => document.querySelectorAll(BASKET_SELECTOR).forEach(centreWheel));
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
  document.addEventListener("click", blockExchange, true);
  document.addEventListener("click", hideCards);
  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
  schedule();
})();
