# strona02 — Harris Piano Jazz Bar (odświeżenie)

Statyczna strona [harris.krakow.pl](https://harris.krakow.pl/) z oryginalnym logo, zdjęciami, kolorami i treściami klubu.
Zrobiona według zasad z `pozycjonowanie.md` i `jakosc-strony.md`.

## Uruchomienie

Strona nie wymaga budowania ani zewnętrznych bibliotek. Dowolny serwer statyczny, np.:

```bash
python -m http.server 5510
# http://127.0.0.1:5510/
```

## Struktura

| Plik | Rola |
| --- | --- |
| `index.html` | strona główna PL (`/`) |
| `en/index.html` | wersja angielska (`/en/`) |
| `polityka-prywatnosci/`, `en/privacy-policy/` | polityka prywatności PL / EN |
| `404.html` | strona błędu (`noindex`, ścieżki od katalogu głównego) |
| `robots.txt`, `sitemap.xml` | indeksowanie; sitemapa ma obie wersje językowe i zdjęcia |
| `assets/css/style.css` | wygląd, wersja mobilna, animacje (CSS + `@supports` dla animacji sterowanych przewijaniem) |
| `assets/js/main.js` | wspólny dla PL i EN (język z `<html lang>`): program koncertów, galeria, podgląd, menu, formularz, mapa po kliknięciu |
| `assets/fonts/` | czcionki lokalnie (woff2, latin + latin-ext) |
| `assets/img/` | zdjęcia WebP w dwóch rozmiarach (`galeria/`), strony kart (`menu/`), partnerzy, obrazek do udostępniania (1200×630) |
| `assets/icons/`, `favicon.ico` | ikony 48 / 192 / 180 px |

Po każdej zmianie CSS lub JS podbij wersję `?v=RRRRMMDD` w odwołaniach we wszystkich plikach HTML.

## Skąd biorą się dane

- **Koncerty** — pobierane na żywo z kalendarza obecnego WordPressa
  (`https://harris.krakow.pl/wp-json/tribe/events/v1/events`); z nich powstają też dane `MusicEvent` dla Google.
  Gdy kalendarz nie odpowiada, strona pokazuje zapisany program (`EVENTS_SNAPSHOT` w `main.js`) z komunikatem.
- **Menu / karta win** — strony z podstrony „Menu” obecnej strony (stan na 11.2026).
  Przy zmianie karty: podmień pliki w `assets/img/menu/` i liczby stron w `LB_SETS` (`main.js`).
- **FAQ** — odpowiedzi oparte na treściach obecnej strony i programie koncertów; ta sama treść jest w HTML i w danych `FAQPage`.
- **Rezerwacja** — formularz otwiera program pocztowy z gotową wiadomością do `rezerwujestolik@gmail.com`
  (stała `RESERVATION_EMAIL`). Nie ma backendu.

## Wdrożenie — wymagania serwera

- Domena docelowa w `canonical`, `hreflang`, `og:url`, JSON-LD i sitemapie: `https://harris.krakow.pl/`.
- HTTPS i przekierowania 301: `http` → `https`, `www` → bez `www`.
- Dla nieistniejących adresów serwer ma zwracać `404.html` z kodem 404.
- Przekierowania 301 ze starej strony WordPress (np. `/o-nas/` → `/#o-nas`, `/rezerwacja/` → `/#rezerwacja`,
  `/menu/` → `/#menu`, `/galeria/` → `/#galeria`, `/kontakt/` i `/znajdz-nas/` → `/#znajdz-nas`, `/pl/` → `/`).
  Kalendarz (`/kalendarz/`, `/koncert/…`) i jego API muszą dalej działać, bo korzysta z nich program koncertów.

## Do zrobienia poza kodem

- Google Search Console i Bing Webmaster Tools: weryfikacja domeny, wysłanie `sitemap.xml`.
- Wizytówka Google: kategoria, godziny, opis z frazą i miastem, link do strony; dane identyczne jak na stronie.
- Uzupełnienie polityki prywatności o pełną nazwę firmy (NIP) i potwierdzenie okresu przechowywania danych.
- Potwierdzenie z klubem adresu rezerwacji i odpowiedzi w FAQ.
- Opinie gości (tekst, podpis, zgoda autorów) — sekcja do dodania, gdy klub je przekaże.
- Formularz z prawdziwą wysyłką (backend lub usługa formularzy) i statystyki konwersji — decyzja klienta.
- Osobne podstrony usług (koncerty, menu, rezerwacja) — gdy będzie do nich unikalna treść.
- Nowsze zdjęcia w lepszej rozdzielczości (obecne mają ok. 960 px).
