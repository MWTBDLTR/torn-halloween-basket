export function nextStep(route, state, costs) {
  const index = route.findIndex((s) => !state.upgrades.get(s.id)?.unlocked);
  if (index === -1) return null;
  const step = route[index];
  const up = state.upgrades.get(step.id);
  let reason = "ready";
  if (!up || up.locked) reason = "locked";
  else if (costs[step.id] > state.treats) reason = "short";
  return { index, step, reason };
}

export function progress(route, state) {
  const done = route.filter((s) => state.upgrades.get(s.id)?.unlocked).length;
  return { done, total: route.length };
}
