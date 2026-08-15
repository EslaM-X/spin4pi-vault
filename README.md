# Spin4Pi · Vault

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE) [![CI](https://github.com/EslaM-X/spin4pi-vault/actions/workflows/ci.yml/badge.svg)](https://github.com/EslaM-X/spin4pi-vault/actions)

Gamified Pi Network gaming companion: spin-to-win gameplay, leaderboards,
achievements, VIP tiers, and a marketplace — built around the Pi Network
ecosystem.

> Designed and developed by [EslaM-X](https://github.com/EslaM-X).

---

## What it does

- **Spin gameplay** — the core spin-to-win experience.
- **Leaderboard** — competitive ranking of players.
- **Achievements** — unlockable in-app achievements.
- **VIP benefits** — tiered benefits system.
- **Marketplace** — in-app items and offers.
- **Withdrawals** — withdrawal history view.

## Stack

| Layer | Tech |
| --- | --- |
| UI | React · TypeScript · Vite |
| Components | shadcn/ui · Radix UI |
| Styling | Tailwind CSS |
| Backend | Supabase integrations |

## Quick start

```bash
npm install
npm run dev
```

## Project layout

```
src/
  pages/          Index, Leaderboard, Marketplace, Achievements, Profile,
                  VIPBenefits, WithdrawalHistory, Admin, Legal
  components/     shared UI + feature components
  contexts/       app state
  integrations/   Supabase
  layouts/        page layouts
  sounds/         game audio assets
  ui/             design-system primitives
```

## License

MIT. See `LICENSE`.
