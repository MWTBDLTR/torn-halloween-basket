import { nextStep, progress } from "./route.js";
import { findUpgrade, tierOf } from "./upgrades.js";
import { exchangeLocked, setExchangeLocked } from "./storage.js";

const STATUS_CLASS = "hbr-status";
const LOCK_CLASS = "hbr-lock";
const LOCKED_CLASS = "hbr-exchange-locked";
const BADGE_CLASS = "hbr-badge";
const HIT_CLASS = "hbr-hit";
const CARD_CLASS = "hbr-card";
const MARK_CLASSES = ["hbr-route", "hbr-done", "hbr-next", "hbr-never"];
const SHIFT_VAR = "--hbr-wheel-shift";
const GUIDE_URL = "https://www.torn.com/forums.php#/p=threads&f=61&t=16192843&b=0&a=0";

const REASON_TEXT = {
  ready: "",
  short: "not enough treats yet",
  locked: "tier locked",
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

const fmt = (n) => n.toLocaleString("en-US");

function line(cls, text) {
  const el = document.createElement("div");
  el.className = cls;
  el.textContent = text;
  return el;
}

function fillCard(card, up, { route, never, state, costs }) {
  const info = findUpgrade(`#${up.id}`);
  const cost = costs[up.id];
  const step = route.findIndex((s) => s.id === up.id);
  const unlocksAt = tierOf(up.tier)?.unlocksAt;
  const plan = never.includes(up.id) ? "Never buy" : step >= 0 ? `Route step ${step + 1}` : null;
  const wallet = cost == null ? null : cost > state.treats ? `${fmt(cost - state.treats)} treats short` : "affordable";
  card.replaceChildren(
    line("hbr-card-title", [up.name, `tier ${up.tier}`, cost != null ? `${fmt(cost)} treats` : null].filter(Boolean).join(" · ")),
    ...(info ? [line("hbr-card-desc", info.desc), line("hbr-card-flavor", info.flavor)] : []),
    line("hbr-card-foot", [unlocksAt ? `Unlocks at a ${unlocksAt} basket` : null, plan, wallet].filter(Boolean).join(" · ")),
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
    hit.addEventListener("mouseleave", () => (card.hidden = true));
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

export function blockExchange(e) {
  const button = e.target.closest?.(".exchange-btn");
  if (!button?.closest(`.${LOCKED_CLASS}`)) return;
  e.preventDefault();
  e.stopImmediatePropagation();
}

export function hideCards() {
  document.querySelectorAll(`.${CARD_CLASS}`).forEach((c) => (c.hidden = true));
}

export function centreWheel(root) {
  const viewport = root.querySelector(".flex-viewport");
  const slide = root.querySelector(".updates-grid-slide-wrapper");
  if (!viewport?.clientWidth || !slide?.offsetWidth) return root.style.removeProperty(SHIFT_VAR);
  root.style.setProperty(SHIFT_VAR, `${(viewport.clientWidth - slide.offsetWidth) / 2}px`);
}

export function paint(root, { steps: route, never }, state, costs) {
  clear(root);
  centreWheel(root);

  for (const id of never) {
    const up = state.upgrades.get(id);
    if (!up) continue;
    up.el.classList.add("hbr-route", "hbr-never");
    addBadge(up.el, "✕");
  }

  const status = document.createElement("div");
  status.className = STATUS_CLASS;
  const bar = root.querySelector(".treats-bar");
  if (bar) bar.after(status);
  else root.prepend(status);
  addInfoCards(root, { route, never, state, costs });
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
    next.step.note || null,
  ].filter(Boolean);
  setStatus(status, parts.join(" · "));
  status.dataset.reason = next.reason;
}

export function clear(root) {
  root.querySelectorAll(`.${STATUS_CLASS}, .${BADGE_CLASS}, .${HIT_CLASS}, .${CARD_CLASS}, .${LOCK_CLASS}`).forEach((n) => n.remove());
  root.querySelectorAll(".hbr-route").forEach((n) => n.classList.remove(...MARK_CLASSES));
  root.classList.remove(LOCKED_CLASS);
  root.style.removeProperty(SHIFT_VAR);
}

export function isPainted(root) {
  if (!root.querySelector(`.${STATUS_CLASS}`)) return false;
  return !root.querySelector(".exchange-btn") || !!root.querySelector(`.${LOCK_CLASS}`);
}
