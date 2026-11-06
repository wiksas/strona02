/* Harris Piano Jazz Bar — interakcje.
   Bez bibliotek: animacje są w CSS, a tu tylko IntersectionObserver i obsługa elementów.
   Wspólny dla wersji PL (/) i EN (/en/) — język bierze z <html lang>. */
(() => {
  "use strict";

  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const root = document.documentElement;
  const lang = root.lang === "en" ? "en" : "pl";
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  /* katalog główny strony — działa z / i z /en/ */
  const SITE = new URL("../../", document.currentScript.src);
  const asset = (path) => new URL(path, SITE).href;

  const EVENTS_API = "https://harris.krakow.pl/wp-json/tribe/events/v1/events";
  const RESERVATION_EMAIL = "rezerwujestolik@gmail.com";
  const PHONE = "12 421 57 41";
  const VENUE = {
    "@type": "BarOrPub",
    "name": "Harris Piano Jazz Bar",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Rynek Główny 28",
      "postalCode": "31-010",
      "addressLocality": "Kraków",
      "addressRegion": "małopolskie",
      "addressCountry": "PL"
    }
  };

  const T = {
    pl: {
      today: "Dziś wieczorem",
      tonight: "Dziś wieczorem gramy",
      next: "Wkrótce na scenie",
      details: "Szczegóły",
      currency: "zł",
      offline: "Nie udało się pobrać aktualnego programu – pokazujemy ostatnio zapisany. Pełny program jest w kalendarzu.",
      empty: "Program na najbliższe dni pojawi się wkrótce – zajrzyj do pełnego kalendarza.",
      menuOpen: "Otwórz menu",
      menuClose: "Zamknij menu",
      page: "Strona",
      scrollHint: "przewiń w dół",
      prevPage: "Poprzednia strona",
      nextPage: "Następna strona",
      errors: {
        name: "Podaj imię i nazwisko.",
        email: "Podaj poprawny adres e-mail, np. jan@example.com.",
        phone: "Podaj numer telefonu (co najmniej 9 cyfr).",
        people: "Podaj liczbę osób od 1 do 40.",
        date: "Wybierz datę – dziś lub późniejszą.",
        time: "Wybierz godzinę.",
        consent: "Zaznacz zgodę, abyśmy mogli obsłużyć rezerwację."
      },
      formInvalid: "Popraw zaznaczone pola – opis błędu jest pod każdym z nich.",
      sending: "Otwieram pocztę…",
      sent: `Otworzyliśmy Twój program pocztowy z gotową wiadomością – wystarczy ją wysłać. Jeśli nic się nie otworzyło, zadzwoń: <a href="tel:+48124215741">${PHONE}</a> lub napisz na <a href="mailto:${RESERVATION_EMAIL}">${RESERVATION_EMAIL}</a>.`,
      mailSubject: "Rezerwacja stolika",
      people: "os.",
      mailLines: ["Imię i nazwisko", "E-mail", "Telefon", "Liczba osób", "Data", "Godzina", "Dodatkowe informacje"]
    },
    en: {
      today: "Tonight",
      tonight: "Tonight we play",
      next: "Coming up on stage",
      details: "Details",
      currency: "PLN",
      offline: "Could not load the live programme – showing the last saved one. See the full calendar for details.",
      empty: "The programme for the coming days will appear soon – check the full calendar.",
      menuOpen: "Open menu",
      menuClose: "Close menu",
      page: "Page",
      scrollHint: "scroll down",
      prevPage: "Previous page",
      nextPage: "Next page",
      errors: {
        name: "Please enter your full name.",
        email: "Please enter a valid e-mail address, e.g. jan@example.com.",
        phone: "Please enter a phone number (at least 9 digits).",
        people: "Please enter between 1 and 40 guests.",
        date: "Please choose today or a later date.",
        time: "Please choose a time.",
        consent: "Please tick the consent box so we can handle your booking."
      },
      formInvalid: "Please correct the marked fields – each one says what is missing.",
      sending: "Opening your e-mail…",
      sent: `Your e-mail app has opened with a ready-made message – just send it. If nothing opened, call <a href="tel:+48124215741">+48 ${PHONE}</a> or write to <a href="mailto:${RESERVATION_EMAIL}">${RESERVATION_EMAIL}</a>.`,
      mailSubject: "Table reservation",
      people: "guests",
      mailLines: ["Name", "E-mail", "Phone", "Guests", "Date", "Time", "Additional information"]
    }
  }[lang];

  /* Ostatni zapisany program (05.11.2026) — używany tylko gdy kalendarz nie odpowiada. */
  const EVENTS_SNAPSHOT = [
    { title: "AMP TRIO", start: "2026-11-05 21:30:00", cost: "PLN25 - PLN30", url: "https://harris.krakow.pl/koncert/amp-trio-2/", desc: "Krakowski skład, który łączy nowoczesny jazz z klasycznym brzmieniem tria organowego." },
    { title: "MACIEJ KŁECZEK & FRIENDS", start: "2026-11-06 21:30:00", cost: "PLN30 - PLN35", url: "https://harris.krakow.pl/koncert/maciej-kleczek-friends-5/", desc: "Maciej Kłeczek – gitara, śpiew · Jacek Chruściński – gitara basowa · Bart Kuraś – perkusja" },
    { title: "PAWEŁ IGNATOWICZ QUARTET", start: "2026-11-07 21:30:00", cost: "PLN40 - PLN45", url: "https://harris.krakow.pl/koncert/pawel-ignatowicz-quartet/", desc: "Paweł Ignatowicz – gitary · Mateusz Gawęda – pianino · Alan Wykpisz – bas · Maks Olszewski – perkusja" },
    { title: "PAULINA ŚWIĄTEK & SZYMON WOJNAROWICZ TRIO", start: "2026-11-08 21:30:00", cost: "PLN35 - PLN40", url: "https://harris.krakow.pl/koncert/paulina-swiatek-szymon-wojnarowicz-trio/", desc: "Paulina Świątek – wokal · Szymon Wojnarowicz – piano · Krzysztof Mysona – gitara basowa · Piotr Szałajko – perkusja" },
    { title: "COOL JAZZ JAM SESSION", start: "2026-11-09 21:30:00", cost: "PLN10", url: "https://harris.krakow.pl/koncert/cool-jazz-jam-session-21/", desc: "Kuba Gerlach – puzon · Alexander Stefani – organy · Tomasz Przytycki – kontrabas · Andrii Vedomyr Volynko – perkusja" },
    { title: "PLAYING FAMILY", start: "2026-11-10 21:30:00", cost: "PLN30 - PLN35", url: "https://harris.krakow.pl/koncert/playing-family-74/", desc: "Leszek Nowotarski – sax · Robert Szczerba – puzon · Mateusz Wachtarczyk – trąbka · Szymon Wojnarowicz – piano" },
    { title: "70’s SOUL JAM SESSION", start: "2026-11-11 21:30:00", cost: "PLN10", url: "https://harris.krakow.pl/koncert/70s-soul-jam-session-23/", desc: "" },
    { title: "GROBORZ TRIO", start: "2026-11-12 21:30:00", cost: "PLN25 - PLN30", url: "https://harris.krakow.pl/koncert/groborz-trio-7/", desc: "" }
  ];

  /* ------------------------------------------------------------------ */
  /* pomocnicze                                                          */
  /* ------------------------------------------------------------------ */
  const decoder = document.createElement("textarea");
  const decode = (s) => { decoder.innerHTML = s; return decoder.value; };
  const stripHtml = (s) => decode(String(s).replace(/<[^>]*>/g, " ")).replace(/\\n/g, " ").replace(/\s+/g, " ").trim();
  const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  /* jeden obserwator „wejścia na ekran” dla wszystkich jednorazowych efektów */
  const onEnter = (() => {
    const handlers = new WeakMap();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        handlers.get(en.target)?.(en.target);
      });
    }, { rootMargin: "0px 0px -12% 0px" });
    return (node, fn) => { handlers.set(node, fn); io.observe(node); };
  })();

  /* „wstecz” na telefonie zamyka menu i podgląd: każdy z nich dokłada wpis do historii */
  const overlays = [];
  let skipPop = 0;
  function pushOverlay(close) {
    overlays.push(close);
    history.pushState({ overlay: overlays.length }, "");
  }
  /* zamknięcie przyciskiem/Esc: cofamy dodany wpis, a wywołane tym popstate pomijamy */
  function popOverlay() {
    if (!overlays.length) return;
    overlays.pop();
    skipPop++;
    history.back();
  }
  addEventListener("popstate", () => {
    if (skipPop) { skipPop--; return; }
    const close = overlays.pop();
    if (close) close(true);
  });

  /* ------------------------------------------------------------------ */
  /* nagłówek i menu                                                     */
  /* ------------------------------------------------------------------ */
  const header = $("#siteHeader");
  const nav = $("#nav");
  const burger = $("#burger");

  const topSentinel = el("div");
  topSentinel.style.cssText = "position:absolute;top:0;left:0;width:1px;height:40px;pointer-events:none";
  topSentinel.setAttribute("aria-hidden", "true");
  document.body.prepend(topSentinel);
  new IntersectionObserver(([en]) => header.classList.toggle("is-solid", !en.isIntersecting)).observe(topSentinel);

  function setMenu(open, fromHistory = false) {
    if (open === nav.classList.contains("is-open")) return;
    nav.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    $(".sr", burger).textContent = open ? T.menuClose : T.menuOpen;
    root.classList.toggle("menu-open", open);
    root.classList.toggle("no-scroll", open);
    if (open) { pushOverlay((h) => setMenu(false, h)); $("a", nav).focus(); }
    else if (!fromHistory) popOverlay();
  }
  burger.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
  /* link w menu: wpis „menu otwarte” zamieniamy na adres sekcji, żeby „wstecz” nie walczyło z przewijaniem */
  nav.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || !nav.classList.contains("is-open")) return;
    e.preventDefault();
    const id = a.getAttribute("href");
    overlays.pop();
    history.replaceState(null, "", id);
    setMenu(false, true);
    $(id)?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  });
  addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("is-open")) { setMenu(false); burger.focus(); }
  });
  /* menu otwarte na tablecie, a potem okno szersze (obrót, zmiana rozmiaru): przycisk menu znika,
     więc zamykamy menu sami — inaczej blokada przewijania zostałaby na stałe */
  matchMedia("(max-width: 1100px)").addEventListener("change", (e) => {
    if (!e.matches && nav.classList.contains("is-open")) setMenu(false);
  });

  const navLinks = $$(".nav a");
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      navLinks.forEach((a) => {
        const on = a.getAttribute("href") === `#${en.target.id}`;
        a.classList.toggle("is-active", on);
        if (on) a.setAttribute("aria-current", "location"); else a.removeAttribute("aria-current");
      });
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  $$("main > section[id]").forEach((s) => spy.observe(s));

  /* ------------------------------------------------------------------ */
  /* pojawianie się treści, zdanie „O nas”, liczniki                     */
  /* ------------------------------------------------------------------ */
  if (!reduceMotion) {
    root.classList.add("reveal-on");
    $$(".reveal").forEach((n) => onEnter(n, (t) => t.classList.add("is-in")));

    const st = $("#statement");
    if (st) {
      const words = st.textContent.trim().split(/\s+/);
      const hl = new Set($$(".hl", st).map((n) => n.textContent.trim()));
      st.textContent = "";
      words.forEach((w, i) => {
        const s = el("span", hl.has(w.replace(/[.,]/g, "")) ? "w hl" : "w", w);
        s.style.setProperty("--i", i);
        st.append(s, i < words.length - 1 ? " " : "");
      });
      st.classList.add("is-split");
      onEnter(st, (t) => t.classList.add("is-in"));
    }

    $$("[data-count]").forEach((n) => {
      const target = Number(n.dataset.count);
      const from = n.hasAttribute("data-plain") ? 1900 : 0;
      onEnter(n, () => {
        const t0 = performance.now();
        const step = (t) => {
          const p = Math.min((t - t0) / 1400, 1);
          n.textContent = String(Math.round(from + (target - from) * (1 - Math.pow(1 - p, 3))));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* koncerty — na żywo z kalendarza harris.krakow.pl                    */
  /* ------------------------------------------------------------------ */
  const eventsList = $("#events");
  const eventsNote = $("#eventsNote");

  function normalizeApiEvent(e) {
    /* opisy zawierają dopisek „*wstęp: …” — cena jest pokazana osobno */
    const desc = stripHtml(e.description || "").split("*")[0].trim();
    return { title: decode(e.title), start: e.start_date, cost: e.cost || "", url: e.url, desc };
  }
  function parseStart(s) {
    const [d, t = "21:30"] = s.split(" ");
    const [Y, M, D] = d.split("-").map(Number);
    return { date: new Date(Y, M - 1, D), ymd: d, time: t.slice(0, 5) };
  }
  const costRange = (cost) => (cost.match(/\d+(?:[.,]\d+)?/g) || []).map((n) => Number(n.replace(",", ".")));
  function formatCost(cost) {
    const n = costRange(cost);
    if (!n.length) return "";
    return `${n.length > 1 ? `${n[0]}–${n[n.length - 1]}` : n[0]} ${T.currency}`;
  }

  /* dane Event dla wyszukiwarki — dokładnie te koncerty, które widać na stronie */
  function eventsJsonLd(list) {
    $("#eventsJsonLd")?.remove();
    const graph = list.map((e) => {
      const { ymd: day, time } = parseStart(e.start);
      const prices = costRange(e.cost);
      const node = {
        "@type": "MusicEvent",
        "name": e.title,
        "startDate": `${day}T${time}:00${tzOffset(day)}`,
        "eventStatus": "https://schema.org/EventScheduled",
        "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
        "location": VENUE,
        "organizer": { "@type": "Organization", "name": "Harris Piano Jazz Bar", "url": "https://harris.krakow.pl/" },
        "image": [asset("assets/img/harris-piano-jazz-bar-koncert-krakow-og.jpg")],
        "url": e.url
      };
      if (e.desc) node.description = e.desc;
      if (prices.length) {
        node.offers = prices.length > 1
          ? { "@type": "AggregateOffer", "lowPrice": prices[0], "highPrice": prices[prices.length - 1], "priceCurrency": "PLN", "url": e.url, "availability": "https://schema.org/InStock" }
          : { "@type": "Offer", "price": prices[0], "priceCurrency": "PLN", "url": e.url, "availability": "https://schema.org/InStock" };
      }
      return node;
    });
    const s = el("script");
    s.type = "application/ld+json";
    s.id = "eventsJsonLd";
    s.textContent = JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
    document.head.append(s);
  }
  /* strefa czasowa Krakowa dla danego dnia (czas letni / zimowy) */
  function tzOffset(day) {
    const [Y, M, D] = day.split("-").map(Number);
    const probe = new Date(Date.UTC(Y, M - 1, D, 12));
    const local = new Date(probe.toLocaleString("en-US", { timeZone: "Europe/Warsaw" }));
    const utc = new Date(probe.toLocaleString("en-US", { timeZone: "UTC" }));
    const h = Math.round((local - utc) / 3600000);
    return `${h >= 0 ? "+" : "-"}${String(Math.abs(h)).padStart(2, "0")}:00`;
  }

  function renderEvents(events, offline) {
    const today = ymd(new Date());
    const list = events.filter((e) => parseStart(e.start).ymd >= today).slice(0, 8);
    const locale = lang === "pl" ? "pl-PL" : "en-GB";
    const fMonth = new Intl.DateTimeFormat(locale, { month: "short" });
    const fWeekday = new Intl.DateTimeFormat(locale, { weekday: "long" });
    const fDay = new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long" });

    eventsNote.hidden = !offline;
    eventsNote.textContent = offline ? T.offline : "";
    eventsList.textContent = "";
    eventsList.removeAttribute("aria-busy");

    if (!list.length) {
      eventsList.append(el("li", "events-empty", T.empty));
      $("#tonight").classList.add("is-empty");
      return;
    }

    list.forEach((e) => {
      const { date, ymd: day, time } = parseStart(e.start);
      const li = el("li", day === today ? "event event--today" : "event");
      if (day === today) li.append(el("span", "event-stamp", T.today));
      const dateBox = el("div", "event-date");
      const timeEl = el("time");
      timeEl.dateTime = `${day}T${time}`;
      timeEl.append(
        el("span", "event-day", String(date.getDate())),
        el("span", "event-month", fMonth.format(date).replace(".", "")),
        el("span", "event-weekday", fWeekday.format(date))
      );
      timeEl.style.display = "contents";
      dateBox.append(timeEl);
      const body = el("div", "event-body");
      const meta = el("p", "event-meta");
      meta.append(el("span", null, time));
      const cost = formatCost(e.cost);
      if (cost) meta.append(el("span", null, cost));
      const h = el("h3", "event-title");
      const a = el("a", null, e.title);
      a.href = e.url; a.target = "_blank"; a.rel = "noopener";
      h.append(a);
      body.append(meta, h);
      if (e.desc) body.append(el("p", "event-desc", e.desc));
      body.append(el("span", "event-more", T.details));
      li.append(dateBox, body);
      eventsList.append(li);
    });

    const first = list[0];
    const { date, ymd: firstDay, time } = parseStart(first.start);
    const isToday = firstDay === today;
    const bill = $("#tonight");
    $(".tonight-label", bill).textContent = isToday ? T.tonight : T.next;
    $(".tonight-name", bill).textContent = first.title;
    $(".tonight-time", bill).textContent = `${(isToday ? fWeekday : fDay).format(date)} · ${time}`;
    bill.classList.remove("is-pending");
    bill.removeAttribute("aria-hidden");
    bill.removeAttribute("tabindex");

    eventsJsonLd(list);
  }

  async function loadEvents() {
    if (!eventsList) return;
    eventsList.setAttribute("aria-busy", "true");
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    try {
      const start = `${ymd(new Date())} 00:00:00`;
      const res = await fetch(`${EVENTS_API}?per_page=8&start_date=${encodeURIComponent(start)}`, { signal: ctrl.signal, credentials: "omit" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      renderEvents((data.events || []).map(normalizeApiEvent), false);
    } catch (err) {
      console.warn("Harris: kalendarz niedostępny, używam zapisanego programu.", err);
      renderEvents(EVENTS_SNAPSHOT, true);
    } finally {
      clearTimeout(timer);
    }
  }

  /* ------------------------------------------------------------------ */
  /* galeria: strzałki + licznik (przesuwanie palcem robi przeglądarka)  */
  /* ------------------------------------------------------------------ */
  const track = $("#galleryTrack");
  const shots = $$(".shot", track);
  if (track) {
    const prev = $('.gal-btn[data-dir="-1"]');
    const next = $('.gal-btn[data-dir="1"]');
    const pos = $("#galPos");
    const visible = new Set();
    const items = $$("li", track);
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        const i = items.indexOf(en.target);
        if (en.intersectionRatio >= 0.6) visible.add(i); else visible.delete(i);
      });
      if (!visible.size) return;
      const first = Math.min(...visible);
      const last = Math.max(...visible);
      pos.textContent = String(first + 1);
      prev.disabled = first === 0;
      next.disabled = last === items.length - 1;
    }, { root: track, threshold: [0, 0.6, 1] });
    items.forEach((li) => io.observe(li));
    [prev, next].forEach((b) => b.addEventListener("click", () => {
      track.scrollBy({ left: Number(b.dataset.dir) * track.clientWidth * 0.8, behavior: reduceMotion ? "auto" : "smooth" });
    }));
  }

  /* ------------------------------------------------------------------ */
  /* podgląd pełnoekranowy: galeria i karty menu                         */
  /* ------------------------------------------------------------------ */
  /* karty menu: wszystkie strony jedna pod drugą — czyta się je przewijając w dół jak dokument */
  const MENU_PAGE = { w: 1400, karta: 1979, wino: 2470 };
  const pages = (prefix, n, h) => Array.from({ length: n }, (_, i) => ({
    src: asset(`assets/img/menu/${prefix}-harris-krakow-${String(i + 1).padStart(2, "0")}.webp`),
    alt: `${T.page} ${i + 1}`,
    w: MENU_PAGE.w,
    h
  }));
  const LB_SETS = {
    gallery: shots.map((b) => ({ src: b.dataset.full, alt: $("img", b).alt })),
    karta: pages("karta-menu", 11, MENU_PAGE.karta),
    wino: pages("karta-win", 15, MENU_PAGE.wino)
  };
  const lb = $("#lightbox");
  const lbImg = $("#lbImg");
  const lbPages = $("#lbPages");
  const lbCount = $("#lbCount");
  const lbPrev = $(".lb-prev", lb);
  const lbNext = $(".lb-next", lb);
  const navLabels = { prev: lbPrev.getAttribute("aria-label"), next: lbNext.getAttribute("aria-label") };
  let lbSet = LB_SETS.gallery;
  let lbIndex = 0;
  let docMode = false;
  let opener = null;
  let lbActive = false;

  function setCount() {
    const n = `${lbIndex + 1} / ${lbSet.length}`;
    lbCount.textContent = docMode ? `${T.page} ${n}${lbIndex === 0 ? ` · ${T.scrollHint} ↓` : ""}` : n;
    if (docMode) {
      lbPrev.disabled = lbIndex === 0;
      lbNext.disabled = lbIndex === lbSet.length - 1;
    }
  }
  function pageTop(i) {
    return lbPages.children[i].getBoundingClientRect().top - lb.getBoundingClientRect().top + lb.scrollTop - 16;
  }
  function lbShow(i) {
    if (docMode) {
      /* strzałki w karcie: przejście do poprzedniej / następnej strony (bez zawijania) */
      const target = Math.max(0, Math.min(lbSet.length - 1, i));
      lb.scrollTo({ top: target === 0 ? 0 : pageTop(target), behavior: reduceMotion ? "auto" : "smooth" });
      return;
    }
    lbIndex = (i + lbSet.length) % lbSet.length;
    lbImg.src = lbSet[lbIndex].src;
    lbImg.alt = lbSet[lbIndex].alt;
    setCount();
    new Image().src = lbSet[(lbIndex + 1) % lbSet.length].src;
  }
  /* licznik stron nadąża za przewijaniem karty */
  let countRaf = 0;
  lb.addEventListener("scroll", () => {
    if (!docMode || countRaf) return;
    countRaf = requestAnimationFrame(() => {
      countRaf = 0;
      const line = lb.getBoundingClientRect().top + lb.clientHeight * 0.4;
      let i = 0;
      [...lbPages.children].forEach((img, k) => { if (img.getBoundingClientRect().top <= line) i = k; });
      if (i !== lbIndex) { lbIndex = i; setCount(); }
    });
  }, { passive: true });

  function lbOpen(setName, i, from) {
    opener = from;
    lbSet = LB_SETS[setName];
    docMode = setName !== "gallery";
    lb.classList.toggle("lightbox--doc", docMode);
    lbPrev.textContent = docMode ? "↑" : "‹";
    lbNext.textContent = docMode ? "↓" : "›";
    lbPrev.setAttribute("aria-label", docMode ? T.prevPage : navLabels.prev);
    lbNext.setAttribute("aria-label", docMode ? T.nextPage : navLabels.next);
    lbPrev.disabled = false;
    lbNext.disabled = false;
    lbPages.textContent = "";
    if (docMode) {
      lbImg.removeAttribute("src");
      lbSet.forEach((p, k) => {
        const img = el("img");
        img.src = p.src; img.alt = p.alt; img.width = p.w; img.height = p.h;
        img.decoding = "async";
        img.loading = k < 2 ? "eager" : "lazy";
        lbPages.append(img);
      });
      lbIndex = 0;
      setCount();
    } else {
      lbShow(i);
    }
    lb.showModal();
    lb.scrollTop = 0;
    lbActive = true;
    root.classList.add("no-scroll");
    pushOverlay((h) => lbClose(h));
  }
  /* jedno miejsce sprzątania — wołane też, gdy podgląd zamknie sama przeglądarka (np. gest „wstecz” na Androidzie) */
  function lbClose(fromHistory = false) {
    if (!lbActive) return;
    lbActive = false;
    if (lb.open) lb.close();
    root.classList.remove("no-scroll");
    if (!fromHistory) popOverlay();
    opener?.focus({ preventScroll: true });
  }
  shots.forEach((b, i) => b.addEventListener("click", () => lbOpen("gallery", i, b)));
  $$(".book").forEach((b) => b.addEventListener("click", () => lbOpen(b.dataset.book, 0, b)));
  lb.addEventListener("cancel", (e) => { e.preventDefault(); lbClose(); });
  lb.addEventListener("close", () => lbClose());
  lb.addEventListener("click", (e) => {
    const act = e.target.closest("[data-lb]")?.dataset.lb;
    if (act === "close" || e.target === lb) lbClose();
    else if (act === "prev") lbShow(lbIndex - 1);
    else if (act === "next") lbShow(lbIndex + 1);
  });
  lb.addEventListener("keydown", (e) => {
    /* w karcie strzałki góra/dół i PageUp/PageDown przewijają natywnie; lewo/prawo skacze o stronę */
    if (e.key === "ArrowLeft") lbShow(lbIndex - 1);
    if (e.key === "ArrowRight") lbShow(lbIndex + 1);
  });
  let touchStart = null;
  lb.addEventListener("touchstart", (e) => { touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }, { passive: true });
  lb.addEventListener("touchend", (e) => {
    if (!touchStart) return;
    const dx = e.changedTouches[0].clientX - touchStart.x;
    const dy = e.changedTouches[0].clientY - touchStart.y;
    /* poziomy gest = następne zdjęcie / strona; pionowy zostaje zwykłym przewijaniem karty */
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) lbShow(lbIndex + (dx < 0 ? 1 : -1));
    touchStart = null;
  });

  /* ------------------------------------------------------------------ */
  /* formularz rezerwacji → gotowa wiadomość e-mail                      */
  /* ------------------------------------------------------------------ */
  const form = $("#reserveForm");
  if (form) {
    const today = ymd(new Date());
    const dateInput = $("#f-date");
    dateInput.min = today;
    if (!dateInput.value) dateInput.value = today;
    const status = $("#formStatus");
    const submit = $('button[type="submit"]', form);

    const checks = {
      name: (v) => v.trim().length >= 2,
      email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
      phone: (v) => v.replace(/\D/g, "").length >= 9,
      people: (v) => Number(v) >= 1 && Number(v) <= 40,
      date: (v) => !!v && v >= today,
      time: (v) => !!v,
      consent: (_, input) => input.checked
    };
    function validate(input) {
      const ok = checks[input.name](input.value, input);
      const err = $(`#${input.id}-err`);
      input.setAttribute("aria-invalid", String(!ok));
      err.hidden = ok;
      err.textContent = ok ? "" : T.errors[input.name];
      return ok;
    }
    const inputs = Object.keys(checks).map((n) => form.elements[n]);
    inputs.forEach((i) => {
      i.addEventListener("blur", () => { if (i.value || i.type === "checkbox") validate(i); });
      i.addEventListener("input", () => { if (i.getAttribute("aria-invalid") === "true") validate(i); });
      i.addEventListener("change", () => { if (i.getAttribute("aria-invalid") === "true") validate(i); });
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      /* pole-pułapka: wypełniają je tylko boty */
      if (form.elements.website.value) return;
      const bad = inputs.filter((i) => !validate(i));
      if (bad.length) {
        status.className = "form-status form-status--error";
        status.textContent = T.formInvalid;
        status.hidden = false;
        bad[0].focus();
        return;
      }
      const d = Object.fromEntries(new FormData(form));
      const values = [d.name, d.email, d.phone, d.people, d.date, d.time, d.notes || "–"];
      const body = T.mailLines.map((l, i) => `${l}: ${values[i]}`).join("\n");
      const subject = `${T.mailSubject} – ${d.date} ${d.time}, ${d.people} ${T.people}`;
      submit.disabled = true;
      const label = submit.textContent;
      submit.textContent = T.sending;
      location.href = `mailto:${RESERVATION_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      setTimeout(() => {
        submit.disabled = false;
        submit.textContent = label;
        status.className = "form-status";
        status.innerHTML = T.sent;
        status.hidden = false;
      }, 900);
    });
  }

  /* ------------------------------------------------------------------ */
  /* mapa Google dopiero po kliknięciu                                   */
  /* ------------------------------------------------------------------ */
  const map = $("#map");
  $("#mapLoad")?.addEventListener("click", () => {
    const f = el("iframe");
    f.title = map.dataset.title;
    f.src = map.dataset.src;
    f.referrerPolicy = "no-referrer-when-downgrade";
    f.allowFullscreen = true;
    $(".map-facade", map).remove();
    map.append(f);
    map.classList.add("is-loaded");
    f.focus();
  });

  /* ------------------------------------------------------------------ */
  /* stały pasek „Zadzwoń / Rezerwuj” — chowa się przy hero i kontakcie  */
  /* ------------------------------------------------------------------ */
  const callbar = $("#callbar");
  if (callbar) {
    const hideOver = $$("[data-hide-callbar]");
    const seen = new Set();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => (en.isIntersecting ? seen.add(en.target) : seen.delete(en.target)));
      callbar.classList.toggle("is-hidden", seen.size > 0);
    }, { threshold: 0.15 });
    hideOver.forEach((n) => io.observe(n));
  }

  $$("[data-year]").forEach((n) => { n.textContent = String(new Date().getFullYear()); });

  loadEvents();
})();
