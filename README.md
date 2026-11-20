# SposodimSI

[![CI/CD](https://github.com/milabojarovska8/SposodimSI/actions/workflows/ci-cd.yml/badge.svg?branch=main)](https://github.com/milabojarovska8/SposodimSI/actions/workflows/ci-cd.yml)

**Nameščena aplikacija:** https://sposodimsi.onrender.com

Spletna aplikacija za upravljanje izposoje opreme v študentskih klubih, laboratorijih in društvih. Nadomešča Excelove tabele in neformalne dogovore: člani rezervirajo opremo za izbrani termin, skrbnik zahtevke odobri, opremo izda in prevzame ter zapiše njeno stanje, sistem pa preprečuje podvojene rezervacije in označuje zamude.

Uporabniške vloge: **član**, **skrbnik** in **administrator**.

## Tehnologije

| Področje | Tehnologija |
| --- | --- |
| Frontend | Vue 3, Vue Router, Vite, Bootstrap 6 (alpha) |
| Backend | Node.js, Express (REST API, JSON) |
| Podatkovna baza | PostgreSQL 18 (`pg`, brez ORM) |
| Avtentikacija | `express-session`, `bcrypt` |
| Zaščita in validacija | `express-validator` |
| QR kode | `qrcode`, `qr-scanner` |
| Razvoj in testiranje | Compose, `nodemon`, `dotenv`, `node:test` |

## Dokumentacija

- [01 – Zasnova ideje](docs/01-zasnova-ideje.md)
- [02 – Funkcionalnosti in obseg](docs/02-funkcionalnosti-in-obseg.md)
- [03 – Podatkovni model](docs/03-podatkovni-model.md)
- [04 – Arhitektura in tehnološki sklad](docs/04-arhitektura-in-tehnoloski-sklad.md)
- [05 – Uporabniške zgodbe](docs/05-uporabniske-zgodbe.md)
- [06 – Wireframes](docs/06-wireframes.md)
- [07 – Pregled projekta](docs/07-pregled-projekta.md)
- [Arhitekturne odločitve (ADR)](docs/adr/)

## Lokalni zagon

1. Baza: `docker compose up -d`
2. Backend:
   ```bash
   cd backend
   cp .env.example .env
   npm install
   npm run dev
   ```
   API teče na `http://localhost:3000`, preizkus: `http://localhost:3000/api/health`.
3. Frontend (v drugem terminalu):
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Aplikacija teče na `http://localhost:5173`, zahteve na `/api` Vite posreduje backendu.
4. Testi backenda: `cd backend && npm test` (potrebuje zagnano bazo), testi frontenda: `cd frontend && npm test`.
5. Preverjanje sloga kode: `npm run lint` v mapi `backend` ali `frontend`.

Testni uporabniki (geslo `geslo123`): `admin@sposodimsi.si`, `skrbnik@sposodimsi.si`, `clan@sposodimsi.si`, `maja@sposodimsi.si`, `blokiran@sposodimsi.si` (vrne obvestilo, da je račun blokiran - testirano).

## CI/CD

Cevovod GitHub Actions (`.github/workflows/ci-cd.yml`) se zažene ob vsakem pull requestu v `main` in ob vsakem pushu v `main`. Ima štiri faze:

| Faza | Kaj naredi |
| --- | --- |
| **lint** | ESLint preveri slog in kakovost kode backenda in frontenda (`eslint.config.js` v obeh mapah). Ob napaki job pade. |
| **build** | Zgradi frontend (`vite build`), namesti produkcijske odvisnosti backenda in oboje sestavi v paket aplikacije. Odvisnosti npm so v predpomnilniku (`actions/setup-node` s `cache: npm`). Zgrajeni frontend (`frontend-dist`) in paket aplikacije (`app-package`) se shranita kot artefakta. |
| **test** | Zažene teste backenda (`node:test`) na pravi bazi PostgreSQL v storitvi GitHub Actions in teste frontenda (Vitest). Poročilo o pokritosti kode se shrani kot artefakt `coverage-report`. Če pade en sam test, pade cel cevovod. |
| **deploy** | Samo ob pushu v `main` in samo, če so `lint`, `build` in `test` uspeli. Prenese paket iz joba `build` (aplikacije ne gradi znova), ga zapakira v Docker sliko, jo objavi v GitHub Container Registry in sproži namestitev na [Render](https://render.com). Uporablja okolje `production` s skrivnostjo `RENDER_DEPLOY_HOOK_URL`. |

V produkciji en strežnik Express streže API in zgrajeni frontend na istem naslovu (ADR 0003), zato frontend kliče API na `/api` (nastavljivo z okoljsko spremenljivko `VITE_API_URL` ob gradnji). Ob zagonu skripta `backend/src/init-db.js` v prazni bazi ustvari tabele in testne podatke.

Pull request v `main` je mogoče združiti šele, ko so preverjanja `lint`, `build` in `test` uspešna.

## Avtor
- BP