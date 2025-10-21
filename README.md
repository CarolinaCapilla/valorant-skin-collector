## Valorant Skin Collector (Frontend)

Valorant Skin Collector is a web app that lets players track and showcase their owned weapon skins and build a wishlist for future purchases. It uses the community/unofficial Valorant API to fetch skin metadata and provides a clean, modern UI to manage your personal collection.

> Note: This project is not affiliated with Riot Games. It uses community/unofficial API sources. Availability and stability of data may vary.

### Key features

- Browse Valorant weapon skins and collections
- Create your personal “Owned” collection for every weapon
- Build a “Wishlist” of skins you’d like to buy later
- Filter/search by weapon, collection, and more
- Responsive UI with a Valorant-inspired theme

### Tech stack

- Nuxt 4 + Vue 3
- Nuxt UI v4 (semantic theming)
- Tailwind CSS v4 (design tokens)
- Pinia (state management)

### Getting started

Install dependencies:

```bash
npm install
```

Start the dev server at http://localhost:3000:

```bash
npm run dev
```

### Build & preview

```bash
# Production build
npm run build

# Preview the production build locally
npm run preview
```

### Configuration

- The UI theme colors are defined via CSS design tokens in `app/assets/css/main.css`, anchored at the `-50` shade and derived across the full scale.
- Nuxt UI semantic colors are mapped in `app/app.config.ts` (e.g., `primary: 'red'`).
- Tailwind config lives in `tailwind.config.ts`.

### API notes

- The app expects skin data from an unofficial/community Valorant API. If you change providers or add a proxy, document the base URL and auth flow as needed.
- Consider caching responses or adding retries for rate limits/instability.

### Disclaimer

Valorant is a trademark of Riot Games. This project is for educational/personal use and is not endorsed by or affiliated with Riot Games.

© 2025 Carolina Moreno Capilla
Licensed under the Non-Commercial Software License (NCSL).
Commercial use is prohibited without prior written permission.
