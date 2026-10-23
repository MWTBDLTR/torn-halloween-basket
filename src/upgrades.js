export const TIERS = [
  { label: "I", cls: "basic" },
  { label: "II", cls: "frightful" },
  { label: "III", cls: "hhocking" },
  { label: "IV", cls: "horrifying" },
];

const NAMES_BY_TIER = [
  ["I See Dead People", "Here's Johnny!", "Doubler", "Tripler", "Quadrupler", "Quintupler"],
  ["Candyman", "Sweet Release", "Bloody Mary", "Nice Chianti", "Nightcrawler", "It's Alive"],
  ["Cat in Hell", "Save Your Tears", "Freebie", "Cold Sweat", "Cashback", "Dark Power"],
  ["Multipack", "Deal with the Devil", "Mortal Coil", "Inflation", "Shadow of Doubt", "Summon Him"],
];

export const UPGRADES = NAMES_BY_TIER.flatMap((names, t) =>
  names.map((name, i) => ({ id: t * 6 + i + 1, name, tier: TIERS[t].label })),
);

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const byName = new Map(UPGRADES.map((u) => [norm(u.name), u]));

export function findUpgrade(ref) {
  const m = /^#?(\d+)$/.exec(ref.trim());
  if (m) return UPGRADES[Number(m[1]) - 1] ?? null;
  return byName.get(norm(ref)) ?? null;
}
