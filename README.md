# FIFA World Cup Bracket

Interactieve WK-posters met schema, standen, live-wedstrijden en ondersteuning voor de huidige editie plus eerdere edities waar data beschikbaar is. Beschikbaar in 45 talen.

Live: [jeffreymooiweer.github.io/FIFAWorldCup](https://jeffreymooiweer.github.io/FIFAWorldCup/)

## Functies

- **Poster & lijst** — bracket-weergave met zoom, of mobiele wedstrijdlijst
- **Standen** — klik op een groep om de standen te openen
- **Live scores** — data van [openfootball/worldcup.json](https://github.com/openfootball/worldcup.json), met cache en offline fallback
- **Deep links** — `?year=`, `?lang=`, `?groep=`, `?wedstrijd=`, `?view=`, `?theme=`
- **Toolbar** — editie, taal, donker/licht/systeem, delen, print
- **PWA** — installeerbaar en offline bruikbaar na eerste bezoek
- **Oranje-highlight** — wedstrijden met Nederland worden gemarkeerd

## Lokaal draaien

```bash
pnpm install
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173).

## GitHub Pages

De app is geconfigureerd voor publicatie op `https://jeffreymooiweer.github.io/FIFAWorldCup/`.

1. Push de repo naar [github.com/jeffreymooiweer/FIFAWorldCup](https://github.com/jeffreymooiweer/FIFAWorldCup)
2. Ga naar **Settings → Pages → Build and deployment**
3. Kies **GitHub Actions** als bron
4. Push naar `main` — de workflow `.github/workflows/deploy.yml` bouwt en publiceert automatisch

Lokaal testen met dezelfde base-path als productie:

```bash
pnpm run preview:pages
```

Open [http://localhost:4173/FIFAWorldCup/](http://localhost:4173/FIFAWorldCup/).

## Scripts

| Script | Beschrijving |
|--------|--------------|
| `pnpm dev` | Ontwikkelserver |
| `pnpm build` | Productiebuild (base `/`) |
| `pnpm build:pages` | Build voor GitHub Pages (base `/FIFAWorldCup/`) |
| `pnpm preview` | Preview lokale build |
| `pnpm preview:pages` | Build + preview met `/FIFAWorldCup/` base |
| `pnpm locales` | Genereer vertaalbestanden |
| `pnpm test:e2e` | Playwright end-to-end tests |

## Omgevingsvariabelen

Maak een `.env` bestand (optioneel):

```env
VITE_TOURNAMENT_YEAR=2026
# VITE_TOURNAMENT_DATA_URL=https://...  # optionele custom data-URL
```

## Data

Wedstrijddata wordt opgehaald van de openfootball API. Bij netwerkproblemen valt de app terug op localStorage-cache en daarna op `public/data/worldcup-2026.json`.

## Licentie

Data: [openfootball/worldcup.json](https://github.com/openfootball/worldcup.json). Code: zie repository.
