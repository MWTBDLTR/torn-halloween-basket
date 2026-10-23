# Halloween Basket upgrade route

The build reads this file and bakes it into the script:

- The **numbered list** is the route, in order. Each item names one upgrade by its name as
  Torn shows it (case and punctuation are ignored) or by id as `#7`. Anything after ` - ` is
  a note shown with the step.
- **Bulleted items under a heading containing "Never"** are upgrades not to buy; the script
  marks them on the wheel.

An unknown or repeated upgrade fails the build. Upgrade ids: I = 1-6, II = 7-12, III = 13-18,
IV = 19-24 (see `src/upgrades.js`).

Source: the Oct 2023 route image, `route-2023.webp`, by
[Andyman [471591]](https://www.torn.com/profiles.php?XID=471591), who worked out the order and
wrote its notes. Its numbers sit on wheel positions;
Torn's layer order (`layer-0`..`layer-5`) is upper-left, lower-left, bottom, lower-right,
upper-right, top, which is what maps them to ids. Step 8 landing on Shadow of Doubt, as the
image itself labels it, confirms the mapping.

## Route

1. I See Dead People
2. Here's Johnny!
3. Doubler
4. Tripler
5. Quadrupler
6. Cat in Hell
7. Quintupler
8. Shadow of Doubt - +1,100 treats, which count toward basket progress. Getting here from step 7 takes roughly an entire event's worth of attacking
9. Multipack
10. Deal with the Devil
11. Dark Power
12. Freebie
13. Bloody Mary
14. Nice Chianti
15. Nightcrawler
16. It's Alive
17. Cashback
18. Candyman
19. Sweet Release
20. Cold Sweat - +1 nerve per treat; assumes Crimes 2.0 is unlocked

## Never

- Save Your Tears
- Mortal Coil
- Inflation
- Summon Him
