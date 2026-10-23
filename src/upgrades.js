export const TIERS = [
  { label: "I", cls: "basic", unlocksAt: null },
  { label: "II", cls: "frightful", unlocksAt: "Frightful" },
  { label: "III", cls: "hhocking", unlocksAt: "Shocking" },
  { label: "IV", cls: "horrifying", unlocksAt: "Horrifying" },
];

const CATALOG = [
  [
    ["I See Dead People", 3, "This upgrade gives +10% chance of receiving a treat when wearing any scary clothing.", "I.e. Kabuki Mask, Medieval Helmet, Witch's Hat, Straitjacket & scary masks."],
    ["Here's Johnny!", 5, "This upgrade gives +10% chance of receiving a treat when ending a victim with a scary weapon.", "I.e. Axe, Chainsaw, Blood Spattered Sickle, Devil's Pitchfork, Petrified Humerus."],
    ["Doubler", 25, "This upgrade has a 20% chance of doubling the treats received after an attack.", "This 2x bonus can stack with Tripler, Quadrupler & Quintupler."],
    ["Tripler", 50, "This upgrade has a 10% chance of tripling the treats received after an attack.", "This 3x bonus can stack with Doubler, Quadrupler & Quintupler."],
    ["Quadrupler", 75, "This upgrade has a 5% chance of quadrupling the treats received after an attack.", "This 4x bonus can stack with Doubler, Tripler & Quintupler."],
    ["Quintupler", 100, "This upgrade has a 1% chance of quintupling the treats received after an attack.", "This 5x bonus can stack with Doubler, Tripler & Quadrupler."],
  ],
  [
    ["Candyman", 5, "This upgrade unlocks medium-tier candy.", "Bag of Bloody Eyeballs is added to the candy reward pool."],
    ["Sweet Release", 10, "This upgrade unlocks high-tier candy.", "Bag of Chocolate Truffles is added to the candy reward pool."],
    ["Bloody Mary", 15, "This upgrade unlocks medium-tier alcohol.", "Bottle of Wicked Witch is added to the alcohol reward pool."],
    ["Nice Chianti", 30, "This upgrade unlocks high-tier alcohol.", "Bottle of Stinky Swamp Punch is added to the alcohol reward pool."],
    ["Nightcrawler", 45, "This upgrade unlocks medium-tier energy drink.", "Can of Munster is added to the energy drink reward pool."],
    ["It's Alive", 90, "This upgrade unlocks high-tier energy drink.", "Can of Red Cow is added to the energy drink reward pool."],
  ],
  [
    ["Cat in Hell", 13, "This upgrade gives a 1 in 500,000 chance with every attack of instantly receiving 1,000 treats.", "Or the equivalent of being struck by lightning..."],
    ["Save Your Tears", 95, "When exchanging your treats you'll also receive +500 happiness for every treat exchanged.", "Up to 99,999 happiness."],
    ["Freebie", 120, "Receive an additional bonus treat for every 10 upon exchange.", "Exchange ten and get one free."],
    ["Cold Sweat", 170, "When exchanging your treats you'll also receive +1 nerve for every treat exchanged.", "Up to 32,767 nerve."],
    ["Cashback", 230, "After exchanging your treats you'll immediately receive 10% back with this upgrade.", "We want to reward your loyalty."],
    ["Dark Power", 285, "When exchanging your treats you'll also receive +5 energy for every treat exchanged.", "Up to 1,000 energy."],
  ],
  [
    ["Multipack", 180, "This upgrade gives a 3% chance of consumables being upgraded to Multipacks upon exchange.", "I.e. A rewarded bottle of beer may become a Six Pack of Alcohol."],
    ["Deal with the Devil", 320, "This upgrade gives a 3% chance of consumables being upgraded to Boosters and Special items upon exchange.", "Treats may be converted into Erotic DVDs, Feathery Hotel Coupons, Business Class Tickets and Casino Passes."],
    ["Mortal Coil", 500, "Receive 1 treat for free every hour while the Halloween Basket event is active.", "A trickle of treats for doing absolutely nothing."],
    ["Inflation", 777, "The treats in your basket increase by 0.1% per hour while the Halloween Basket event is active.", "This covers the rate of Freddo price increases and confectionary shrinkage."],
    ["Shadow of Doubt", 1000, "This upgrade immediately provides exactly 1,100 treats.", "Probably...?"],
    ["Summon Him", 9999, "Begins the end times.", "It was nice knowing you."],
  ],
];

export const UPGRADES = CATALOG.flatMap((rows, t) =>
  rows.map(([name, cost, desc, flavor], i) => ({ id: t * 6 + i + 1, name, tier: TIERS[t].label, cost, desc, flavor })),
);

export const CATALOG_COSTS = Object.fromEntries(UPGRADES.map((u) => [u.id, u.cost]));

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const byName = new Map(UPGRADES.map((u) => [norm(u.name), u]));

export function findUpgrade(ref) {
  const m = /^#?(\d+)$/.exec(ref.trim());
  if (m) return UPGRADES[Number(m[1]) - 1] ?? null;
  return byName.get(norm(ref)) ?? null;
}

export const tierOf = (label) => TIERS.find((t) => t.label === label) ?? null;
