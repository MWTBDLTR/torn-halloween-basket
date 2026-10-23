# Torn Halloween Basket Route

A Tampermonkey userscript for [Torn](https://www.torn.com) that marks the recommended Halloween
Basket upgrade route on the basket's upgrade wheel.

When you open the basket on the Items page, it:

- numbers each upgrade with its place in the route,
- rings the next upgrade to buy,
- marks the upgrades not worth buying with a red ✕,
- shows a line under the treats bar naming the next step, its tier, its cost once seen, and
  whether its tier is still locked or you are short on treats.

Upgrades bought out of order count as done, and the route picks up from the next one.

It only reads the page you are viewing and adds its own marks. It never clicks anything and
makes no requests, in line with Torn's rules on scripts.

## Install

With Tampermonkey installed, open
[torn_halloween_basket.user.js](https://github.com/MWTBDLTR/torn-halloween-basket/raw/main/dist/torn_halloween_basket.user.js)
and click Install. Updates are offered automatically when the version changes.

## The route

The route is in [ROUTE.md](ROUTE.md), taken from the Oct 2023 route image
([route-2023.webp](route-2023.webp)).

## Building

```bash
npm install
npm run build
```

`npm run watch` rebuilds on change. The route is read from `ROUTE.md` at build time, and a
misspelled or repeated upgrade name fails the build. Source files carry no comments; the notes
on how each part works are in [NOTES.md](NOTES.md). Commit the rebuilt `dist/` file with every
change, and bump `version` in `package.json`, which becomes `@version`.

## License

[CC BY-NC-SA 4.0](LICENSE)
