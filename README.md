# strona02 — Harris Piano Jazz Bar (odświeżenie)

Statyczna, jednostronicowa wersja strony [harris.krakow.pl](https://harris.krakow.pl/) z oryginalnym logo, zdjęciami, kolorami i treściami klubu.

## Uruchomienie

Strona nie wymaga budowania. Dowolny serwer statyczny, np.:

```bash
python -m http.server 5510
# http://127.0.0.1:5510/
```

## Struktura

| Plik | Rola |
| --- | --- |
| `index.html` | cała strona (hero, koncerty, o nas, legendy, galeria, menu, rezerwacja, dojazd, partnerzy) |
| `assets/css/style.css` | wygląd, wersja mobilna, efekty |
| `assets/js/main.js` | animacje przewijania (GSAP + ScrollTrigger + Lenis z CDN), program koncertów, galeria, menu, formularz |
| `assets/js/i18n.js` | tłumaczenia EN (PL jest w HTML) |
| `assets/img/` | logo, tła, zdjęcia z galerii, strony karty menu i karty win (`img/menu/`) oraz logotypy partnerów – pobrane z obecnej strony |

## Skąd biorą się dane

- **Koncerty** — pobierane na żywo z kalendarza obecnego WordPressa:
  `https://harris.krakow.pl/wp-json/tribe/events/v1/events`. Kalendarz trzeba dalej prowadzić w starym panelu WP.
  Gdy API nie odpowiada, strona pokazuje zapisany program (`EVENTS_SNAPSHOT` w `main.js`) z komunikatem.
- **Menu / karta win** — skany stron z obecnej podstrony „Menu” (stan na 11.2026), zmniejszone do 1400 px.
  Przy zmianie karty: podmień pliki w `assets/img/menu/` i liczby stron w `LB_SETS` (`main.js`).
- **Rezerwacja** — formularz otwiera program pocztowy z gotową wiadomością do `rezerwujestolik@gmail.com`
  (stała `RESERVATION_EMAIL`). Nie ma backendu.

## Dostępność

- `prefers-reduced-motion`: bez animacji i płynnego przewijania, cała treść widoczna.
- Bez JS / gdy CDN nie działa: treść widoczna, bez animacji.
