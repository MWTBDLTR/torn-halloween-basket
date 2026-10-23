import { nextStep, progress } from "./route.js";

const STATUS_CLASS = "hbr-status";
const BADGE_CLASS = "hbr-badge";
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
  root.querySelector(".treats-bar")?.after(status);

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
    cost != null ? `${cost} treats` : null,
    REASON_TEXT[next.reason] || null,
    next.step.note || null,
  ].filter(Boolean);
  setStatus(status, parts.join(" · "));
  status.dataset.reason = next.reason;
}

export function clear(root) {
  root.querySelectorAll(`.${STATUS_CLASS}, .${BADGE_CLASS}`).forEach((n) => n.remove());
  root.querySelectorAll(".hbr-route").forEach((n) => n.classList.remove(...MARK_CLASSES));
  root.style.removeProperty(SHIFT_VAR);
}

export function isPainted(root) {
  return !!root.querySelector(`.${STATUS_CLASS}`);
}
