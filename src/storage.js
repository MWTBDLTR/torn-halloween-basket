const PREFIX = "hbr_";

export function getValue(key, fallback) {
  try {
    if (typeof GM_getValue === "function") return GM_getValue(PREFIX + key, fallback);
    const raw = localStorage.getItem(PREFIX + key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function setValue(key, value) {
  try {
    if (typeof GM_setValue === "function") GM_setValue(PREFIX + key, value);
    else localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {}
}

export function rememberCost(id, cost) {
  const costs = getValue("costs", {});
  if (costs[id] === cost) return;
  costs[id] = cost;
  setValue("costs", costs);
}

export const knownCosts = () => getValue("costs", {});
