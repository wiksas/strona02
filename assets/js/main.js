/* Harris Piano Jazz Bar — interakcje i animacje przewijania.
   GSAP + ScrollTrigger + Lenis są ładowane z CDN; jeśli ich zabraknie,
   strona działa dalej bez animacji (cała treść pozostaje widoczna). */
(() => {
  "use strict";

  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const root = document.documentElement;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  const animate = hasGsap && !reduceMotion;
  const I18N = window.HARRIS_I18N;

  const EVENTS_API = "https://harris.krakow.pl/wp-json/tribe/events/v1/events";
  const RESERVATION_EMAIL = "rezerwujestolik@gmail.com";

  /* Ostatni zapisany program (05.11.2026) — używany tylko gdy API nie odpowiada. */
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

  let lang = "pl";
  let lenis = null;
  /* [plik, szerokość, wysokość] — wymiary rezerwują miejsce przed załadowaniem zdjęć */
  const GALLERY = [
    [0, 957, 640], [2, 640, 959], [11, 902, 600], [7, 957, 640], [3, 600, 900], [5, 959, 640],
    [8, 957, 640], [12, 600, 902], [4, 959, 640], [14, 640, 958], [1, 623, 417], [10, 640, 957],
    [13, 902, 600], [6, 640, 959], [15, 900, 600], [9, 901, 600]
  ].map(([n, w, h]) => ({ src: `assets/img/gallery/g${String(n).padStart(2, "0")}.jpg`, w, h }));

  let events = null;
  let eventsOffline = false;

  /* ------------------------------------------------------------------ */
  /* helpers                                                            */
  /* ------------------------------------------------------------------ */
  const decoder = document.createElement("textarea");
  const decode = (s) => { decoder.innerHTML = s; return decoder.value; };
  const stripHtml = (s) => decode(String(s).replace(/<[^>]*>/g, " ")).replace(/\\n/g, " ").replace(/\s+/g, " ").trim();
  const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const dyn = (k) => I18N.dyn[lang][k];

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function scrollToTarget(target) {
    if (lenis) lenis.scrollTo(target, { offset: target === 0 ? 0 : -60, duration: 1.4 });
    else if (target === 0) scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    else target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  }

  /* ------------------------------------------------------------------ */
  /* i18n                                                               */
  /* ------------------------------------------------------------------ */
  const i18nNodes = $$("[data-i18n]");
  i18nNodes.forEach((n) => { n.dataset.pl = n.textContent.trim(); });

  function setLang(next, initial = false) {
    lang = next === "en" ? "en" : "pl";
    root.lang = lang;
    try { localStorage.setItem("harris-lang", lang); } catch { /* prywatny tryb */ }
    i18nNodes.forEach((n) => {
      const key = n.dataset.i18n;
      n.textContent = lang === "pl" ? n.dataset.pl : (I18N.en[key] ?? n.dataset.pl);
    });
    $$(".lang button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
    $(".scroll-cue").setAttribute("aria-label", dyn("skipLabel"));
    $("#nav").setAttribute("aria-label", dyn("navLabel"));
    splitTitles();
    splitStatement();
    if (events) renderEvents();
    if (!initial && hasGsap) ScrollTrigger.refresh();
  }

  $$(".lang button").forEach((b) => b.addEventListener("click", () => setLang(b.dataset.lang)));

  /* ------------------------------------------------------------------ */
  /* tekst dzielony na litery / słowa                                   */
  /* ------------------------------------------------------------------ */
  function splitTitles() {
    $$(".title.split").forEach((t) => {
      const text = t.textContent.trim();
      t.setAttribute("aria-label", text);
      t.textContent = "";
      text.split(" ").forEach((word, wi, arr) => {
        const w = el("span", "word");
        w.setAttribute("aria-hidden", "true");
        [...word].forEach((ch) => w.append(el("span", "char", ch)));
        t.append(w);
        if (wi < arr.length - 1) t.append(" ");
      });
      t.dataset.split = "1";
    });
  }

  const HIGHLIGHT = new Set(["jedyny", "polsce", "codziennie", "only", "poland", "every", "single", "night"]);
  function splitStatement() {
    const s = $("#statement");
    const text = s.textContent.trim();
    s.textContent = "";
    text.split(" ").forEach((word, i, arr) => {
      const w = el("span", "w", word);
      if (HIGHLIGHT.has(word.toLowerCase().replace(/[^\p{L}]/gu, ""))) w.classList.add("hl");
      s.append(w);
      if (i < arr.length - 1) s.append(" ");
    });
    updateStatement(statementProgress);
  }
  let statementProgress = 0;
  function updateStatement(p) {
    statementProgress = p;
    const words = $$("#statement .w");
    const lit = Math.round(p * words.length);
    words.forEach((w, i) => w.classList.toggle("on", i < lit));
  }

  /* ------------------------------------------------------------------ */
  /* nagłówek + menu                                                    */
  /* ------------------------------------------------------------------ */
  const header = $("#siteHeader");
  const nav = $("#nav");
  const burger = $("#burger");

  function setMenu(open) {
    nav.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("menu-open", open);
    header.classList.remove("is-hidden");
    if (lenis) open ? lenis.stop() : lenis.start();
  }
  burger.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && nav.classList.contains("is-open")) setMenu(false); });

  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href");
    const target = id === "#top" ? 0 : $(id);
    if (target == null) return;
    e.preventDefault();
    setMenu(false);
    scrollToTarget(target);
    history.replaceState(null, "", id);
  });

  let lastY = scrollY;
  addEventListener("scroll", () => {
    const y = scrollY;
    header.classList.toggle("is-solid", y > 40);
    const goingDown = y > lastY + 4;
    const goingUp = y < lastY - 4;
    if (goingDown && y > innerHeight * 0.8 && !nav.classList.contains("is-open")) header.classList.add("is-hidden");
    else if (goingUp) header.classList.remove("is-hidden");
    lastY = y;
  }, { passive: true });

  const navLinks = $$(".nav a");
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      navLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === `#${en.target.id}`));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  /* „top” nie ma linku w menu — wejście w hero czyści podświetlenie */
  ["top", "koncerty", "o-nas", "legendy", "galeria", "menu", "rezerwacja", "znajdz-nas"].forEach((id) => spy.observe(document.getElementById(id)));

  /* ------------------------------------------------------------------ */
  /* reflektor w hero (podąża za kursorem / sam „szuka” na telefonie)  */
  /* ------------------------------------------------------------------ */
  const hero = $(".hero");
  const spot = { x: 0.5, y: 0.4, tx: 0.5, ty: 0.4 };
  let heroVisible = true;
  let spotRaf = 0;

  if (canHover) {
    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      spot.tx = (e.clientX - r.left) / r.width;
      spot.ty = (e.clientY - r.top) / r.height;
    });
    hero.addEventListener("pointerleave", () => { spot.tx = 0.5; spot.ty = 0.4; });
  }

  function spotLoop(t) {
    if (!canHover && !reduceMotion) {
      spot.tx = 0.5 + Math.sin(t / 2600) * 0.28;
      spot.ty = 0.38 + Math.sin(t / 1900) * 0.12;
    }
    spot.x += (spot.tx - spot.x) * 0.08;
    spot.y += (spot.ty - spot.y) * 0.08;
    hero.style.setProperty("--mx", `${(spot.x * 100).toFixed(2)}%`);
    hero.style.setProperty("--my", `${(spot.y * 100).toFixed(2)}%`);
    spotRaf = heroVisible ? requestAnimationFrame(spotLoop) : 0;
  }
  new IntersectionObserver(([en]) => {
    heroVisible = en.isIntersecting;
    if (heroVisible && !spotRaf) spotRaf = requestAnimationFrame(spotLoop);
  }).observe(hero);

  /* ------------------------------------------------------------------ */
  /* koncerty (na żywo z kalendarza harris.krakow.pl)                   */
  /* ------------------------------------------------------------------ */
  const eventsList = $("#events");
  const eventsNote = $("#eventsNote");

  function normalizeApiEvent(e) {
    /* opisy zawierają dopisek „*wstęp: …” — cena jest już pokazana osobno */
    const desc = stripHtml(e.description || "").split("*")[0].trim();
    return { title: decode(e.title), start: e.start_date, cost: e.cost || "", url: e.url, desc };
  }

  function formatCost(cost) {
    const c = cost.replace(/PLN\s?/gi, "").replace(/\s*-\s*/, "–").trim();
    return c ? `${c} ${dyn("currency")}` : "";
  }

  function parseStart(s) {
    const [d, t = "21:30"] = s.split(" ");
    const [Y, M, D] = d.split("-").map(Number);
    return { date: new Date(Y, M - 1, D), ymd: d, time: t.slice(0, 5) };
  }

  function renderEvents() {
    const today = ymd(new Date());
    const list = events.filter((e) => parseStart(e.start).ymd >= today).slice(0, 8);
    const locale = lang === "pl" ? "pl-PL" : "en-GB";
    const fMonth = new Intl.DateTimeFormat(locale, { month: "short" });
    const fWeekday = new Intl.DateTimeFormat(locale, { weekday: "long" });
    const fShort = new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric", month: "numeric" });

    eventsNote.hidden = !eventsOffline;
    eventsNote.textContent = eventsOffline ? dyn("offline") : "";
    eventsList.textContent = "";

    if (!list.length) {
      eventsList.append(el("li", "events-empty", dyn("empty")));
      $("#tonight").hidden = true;
      return;
    }

    list.forEach((e) => {
      const { date, ymd: day, time } = parseStart(e.start);
      const li = el("li", "event");
      const dateBox = el("div", "event-date");
      dateBox.append(
        el("span", "event-day", String(date.getDate())),
        el("span", "event-month", fMonth.format(date).replace(".", "")),
        el("span", "event-weekday", fWeekday.format(date))
      );
      const body = el("div", "event-body");
      const meta = el("p", "event-meta");
      if (day === today) meta.append(el("span", "today", dyn("today")));
      meta.append(el("span", null, time));
      const cost = formatCost(e.cost);
      if (cost) meta.append(el("span", null, cost));
      const h = el("h3", "event-title");
      const a = el("a", null, e.title);
      a.href = e.url; a.target = "_blank"; a.rel = "noopener";
      h.append(a);
      body.append(meta, h);
      if (e.desc) body.append(el("p", "event-desc", e.desc));
      body.append(el("span", "event-more", dyn("details")));
      li.append(dateBox, body);
      eventsList.append(li);
    });

    const first = list[0];
    const { date, ymd: firstDay, time } = parseStart(first.start);
    const isToday = firstDay === today;
    const pill = $("#tonight");
    $(".tonight-label", pill).textContent = isToday ? dyn("tonight") : dyn("next");
    $(".tonight-name", pill).textContent = first.title;
    $(".tonight-time", pill).textContent = isToday ? time : `${fShort.format(date)} · ${time}`;
    $(".live-dot", pill).style.display = isToday ? "" : "none";
    pill.hidden = false;

    if (animate) {
      gsap.from(eventsList.children, {
        y: 40, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.08,
        scrollTrigger: { trigger: eventsList, start: "top 85%", once: true }
      });
      ScrollTrigger.refresh();
    }
  }

  async function loadEvents() {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    try {
      const start = `${ymd(new Date())} 00:00:00`;
      const res = await fetch(`${EVENTS_API}?per_page=8&start_date=${encodeURIComponent(start)}`, { signal: ctrl.signal, credentials: "omit" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      events = (data.events || []).map(normalizeApiEvent);
      eventsOffline = false;
    } catch (err) {
      console.warn("Harris: kalendarz niedostępny, używam zapisanego programu.", err);
      events = EVENTS_SNAPSHOT;
      eventsOffline = true;
    } finally {
      clearTimeout(timer);
    }
    renderEvents();
  }

  /* ------------------------------------------------------------------ */
  /* galeria + lightbox                                                 */
  /* ------------------------------------------------------------------ */
  const track = $("#galleryTrack");
  GALLERY.forEach((photo, i) => {
    const b = el("button", "shot");
    b.type = "button";
    b.dataset.index = String(i);
    b.setAttribute("aria-label", `Zdjęcie ${i + 1} / ${GALLERY.length}`);
    const img = el("img");
    img.src = photo.src; img.width = photo.w; img.height = photo.h;
    img.alt = ""; img.loading = "lazy"; img.decoding = "async";
    b.append(img);
    track.append(b);
  });

  /* ten sam podgląd obsługuje galerię i karty menu (strony do przewijania) */
  const pages = (prefix, n) => Array.from({ length: n }, (_, i) => `assets/img/menu/${prefix}-${String(i + 1).padStart(2, "0")}.jpg`);
  const LB_SETS = {
    gallery: GALLERY.map((p) => p.src),
    karta: pages("karta", 11),
    wino: pages("wino", 15)
  };
  const lb = $("#lightbox");
  const lbImg = $("#lbImg");
  let lbSet = LB_SETS.gallery;
  let lbIndex = 0;
  function lbShow(i) {
    lbIndex = (i + lbSet.length) % lbSet.length;
    lbImg.src = lbSet[lbIndex];
    lbImg.alt = `Harris Piano Jazz Bar – ${lbIndex + 1}`;
    $("#lbCount").textContent = `${lbIndex + 1} / ${lbSet.length}`;
    lb.scrollTop = 0;
    new Image().src = lbSet[(lbIndex + 1) % lbSet.length];
  }
  function lbOpen(setName, i) {
    lbSet = LB_SETS[setName];
    lb.classList.toggle("lightbox--doc", setName !== "gallery");
    lbShow(i);
    lb.showModal();
    if (lenis) lenis.stop();
  }
  track.addEventListener("click", (e) => {
    const shot = e.target.closest(".shot");
    if (shot) lbOpen("gallery", Number(shot.dataset.index));
  });
  $$(".book").forEach((b) => b.addEventListener("click", () => lbOpen(b.dataset.book, 0)));
  lb.addEventListener("close", () => { if (lenis) lenis.start(); });
  lb.addEventListener("click", (e) => {
    const act = e.target.closest("[data-lb]")?.dataset.lb;
    if (act === "close" || e.target === lb) lb.close();
    else if (act === "prev") lbShow(lbIndex - 1);
    else if (act === "next") lbShow(lbIndex + 1);
  });
  lb.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") lbShow(lbIndex - 1);
    if (e.key === "ArrowRight") lbShow(lbIndex + 1);
  });
  let touchStart = null;
  lb.addEventListener("touchstart", (e) => { touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }, { passive: true });
  lb.addEventListener("touchend", (e) => {
    if (!touchStart) return;
    const dx = e.changedTouches[0].clientX - touchStart.x;
    const dy = e.changedTouches[0].clientY - touchStart.y;
    /* poziomy gest = następna strona; pionowy zostaje przewijaniem karty */
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) lbShow(lbIndex + (dx < 0 ? 1 : -1));
    touchStart = null;
  });

  /* ------------------------------------------------------------------ */
  /* formularz rezerwacji → gotowa wiadomość e-mail                     */
  /* ------------------------------------------------------------------ */
  const form = $("#reserveForm");
  const dateInput = $("#f-date");
  dateInput.min = ymd(new Date());
  dateInput.value = ymd(new Date());

  form.addEventListener("input", (e) => e.target.classList.remove("is-invalid"));
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fields = $$("input[required]", form);
    let ok = true;
    fields.forEach((f) => {
      const valid = f.checkValidity() && f.value.trim() !== "";
      f.classList.toggle("is-invalid", !valid);
      if (!valid) ok = false;
    });
    const err = $("#formError");
    if (!ok) {
      err.textContent = dyn("formInvalid");
      err.hidden = false;
      $(".is-invalid", form)?.focus();
      return;
    }
    err.hidden = true;
    const d = Object.fromEntries(new FormData(form));
    const labels = dyn("mailLines");
    const values = [d.name, d.email, d.phone, d.people, d.date, d.time, d.notes || "–"];
    const body = labels.map((l, i) => `${l}: ${values[i]}`).join("\n");
    const subject = `${dyn("mailSubject")} – ${d.date} ${d.time}, ${d.people} os.`;
    location.href = `mailto:${RESERVATION_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });

  $("#year").textContent = String(new Date().getFullYear());

  /* druga kopia taśmy marquee — potrzebna do płynnej pętli (CSS i GSAP) */
  $$(".marquee-row").forEach((row) => row.append($(".marquee-track", row).cloneNode(true)));

  /* ------------------------------------------------------------------ */
  /* animacje przewijania                                                */
  /* ------------------------------------------------------------------ */
  function initMotion() {
    gsap.registerPlugin(ScrollTrigger);
    root.classList.add("anim");

    if (window.Lenis) {
      lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.9 });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    }

    /* pasek postępu */
    gsap.to(".progress span", {
      scaleX: 1, ease: "none",
      scrollTrigger: { start: 0, end: "max", scrub: 0.3 }
    });

    /* intro hero */
    const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
    intro
      .from(".hero-img", { scale: 1.25, duration: 2.4, ease: "power2.out" }, 0)
      .from(".hero-logo", { y: 40, opacity: 0, filter: "blur(12px)", duration: 1.4 }, 0.2)
      .from(".hero-tagline", { y: 24, opacity: 0, duration: 1 }, 0.6)
      .from(".genres span", { yPercent: 120, opacity: 0, rotateX: -70, stagger: 0.09, duration: 0.9 }, 0.8)
      .from(".hero-actions .btn", { y: 20, opacity: 0, stagger: 0.1, duration: 0.8 }, 1.15)
      .from(".hours > div", { y: 20, opacity: 0, stagger: 0.1, duration: 0.8 }, 1.3)
      .from(".scroll-cue", { opacity: 0, duration: 1 }, 1.6);

    /* hero przy przewijaniu */
    gsap.to(".hero-img", {
      yPercent: 14, scale: 1.08, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
    });
    gsap.fromTo(".hero-inner", { y: 0, opacity: 1 }, {
      y: -120, opacity: 0, ease: "none", immediateRender: false,
      scrollTrigger: { trigger: ".hero", start: "20% top", end: "bottom top", scrub: true }
    });

    /* marquee: stałe tempo, przyspiesza z prędkością przewijania i zmienia kierunek */
    const rows = $$(".marquee-row").map((row) => ({ row, dir: Number(row.dataset.dir), x: Number(row.dataset.dir) > 0 ? 0 : -50 }));
    let mqBoost = 1;
    let mqSpeed = 1;
    let mqDir = 1;
    const mqTrigger = ScrollTrigger.create({
      trigger: ".marquee", start: "top bottom", end: "bottom top",
      onUpdate(self) {
        mqDir = self.direction;
        mqBoost = 1 + Math.min(Math.abs(self.getVelocity()) / 250, 6);
      }
    });
    gsap.ticker.add((_, dt) => {
      if (!mqTrigger.isActive) return;
      mqBoost += (1 - mqBoost) * 0.05;
      mqSpeed += (mqDir * mqBoost - mqSpeed) * 0.1;
      rows.forEach((r) => {
        r.x -= r.dir * mqSpeed * dt * 0.0013;
        if (r.x <= -50) r.x += 50;
        else if (r.x > 0) r.x -= 50;
        gsap.set(r.row, { xPercent: r.x });
      });
    });
    gsap.fromTo(".marquee", { rotate: -4 }, {
      rotate: 1.5, ease: "none",
      scrollTrigger: { trigger: ".marquee", start: "top bottom", end: "bottom top", scrub: true }
    });

    /* tytuły — litery wchodzą jak klawisze */
    $$(".title.split").forEach((t) => {
      gsap.from($$(".char", t), {
        yPercent: 110, opacity: 0, rotateX: -80, transformOrigin: "50% 100%",
        stagger: 0.025, duration: 0.9, ease: "back.out(1.6)",
        scrollTrigger: { trigger: t, start: "top 86%", once: true }
      });
    });

    /* ogólne pojawianie się */
    ScrollTrigger.batch(".reveal", {
      start: "top 88%", once: true,
      onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1, ease: "power3.out", stagger: 0.1, overwrite: true })
    });

    /* deklaracja „O nas” — słowa zapalają się podczas przewijania */
    ScrollTrigger.create({
      trigger: "#statement", start: "top 80%", end: "bottom 40%", scrub: true,
      onUpdate: (self) => updateStatement(self.progress)
    });

    /* winyl kręci się z przewijaniem, ramię opada na płytę */
    gsap.to(".vinyl", {
      rotation: 900, ease: "none",
      scrollTrigger: { trigger: ".about", start: "top bottom", end: "bottom top", scrub: 0.6 }
    });
    gsap.fromTo(".tonearm", { rotate: -32 }, {
      rotate: 0, ease: "power2.out",
      scrollTrigger: { trigger: ".about-vinyl", start: "top 80%", end: "top 35%", scrub: 1 }
    });
    gsap.from(".about-vinyl", {
      xPercent: -30, opacity: 0, ease: "power3.out", duration: 1.4,
      scrollTrigger: { trigger: ".about-vinyl", start: "top 85%", once: true }
    });

    /* paralaksa zdjęć */
    $$("[data-speed]").forEach((fig) => {
      const speed = Number(fig.dataset.speed);
      gsap.to(fig, {
        yPercent: speed * 100, ease: "none",
        scrollTrigger: { trigger: fig, start: "top bottom", end: "bottom top", scrub: true }
      });
      gsap.to($("img", fig), {
        scale: 1, ease: "none",
        scrollTrigger: { trigger: fig, start: "top bottom", end: "bottom top", scrub: true }
      });
    });

    /* liczniki */
    $$("[data-count]").forEach((n) => {
      const target = Number(n.dataset.count);
      const from = n.hasAttribute("data-plain") ? 1900 : 0;
      const obj = { v: from };
      n.textContent = String(from);
      gsap.to(obj, {
        v: target, duration: 2, ease: "power2.out",
        onUpdate: () => { n.textContent = String(Math.round(obj.v)); },
        scrollTrigger: { trigger: n, start: "top 90%", once: true }
      });
    });

    /* legendy — rzędy przesuwają się w przeciwnych kierunkach */
    $$(".legend-row").forEach((row) => {
      const dir = Number(row.dataset.dir);
      gsap.to(row, {
        x: () => dir * innerWidth * 0.35, ease: "none",
        scrollTrigger: { trigger: ".legends", start: "top bottom", end: "bottom top", scrub: 0.5, invalidateOnRefresh: true }
      });
    });

    /* galeria — przypięta, przewijana w poziomie (desktop) */
    const mm = gsap.matchMedia();
    mm.add("(min-width: 900px)", () => {
      root.classList.add("pin-gallery");
      const dist = () => Math.max(0, track.scrollWidth - innerWidth);
      const tween = gsap.to(track, {
        x: () => -dist(), ease: "none",
        scrollTrigger: {
          trigger: ".gallery-pin", start: "top top", end: () => `+=${dist()}`,
          pin: true, scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1
        }
      });
      $$(".shot img", track).forEach((img) => {
        gsap.fromTo(img, { xPercent: -6 }, {
          xPercent: 6, ease: "none",
          scrollTrigger: { trigger: img.parentElement, containerAnimation: tween, start: "left right", end: "right left", scrub: true }
        });
      });
      return () => root.classList.remove("pin-gallery");
    });
    mm.add("(max-width: 899px)", () => {
      gsap.from(".shot", {
        x: 80, opacity: 0, stagger: 0.06, duration: 0.9, ease: "power3.out",
        scrollTrigger: { trigger: track, start: "top 85%", once: true }
      });
    });

    /* mapa odsłania się jak kurtyna */
    gsap.fromTo("#map", { clipPath: "inset(0 0 100% 0)" }, {
      clipPath: "inset(0 0 0% 0)", duration: 1.4, ease: "power4.inOut",
      scrollTrigger: { trigger: "#map", start: "top 80%", once: true }
    });

    /* logotypy partnerów */
    gsap.from(".partners li", {
      y: 30, opacity: 0, stagger: 0.06, duration: 0.8, ease: "power3.out",
      scrollTrigger: { trigger: ".partners", start: "top 90%", once: true }
    });

    addEventListener("load", () => ScrollTrigger.refresh());
  }

  /* ------------------------------------------------------------------ */
  /* start                                                              */
  /* ------------------------------------------------------------------ */
  let saved = null;
  try { saved = localStorage.getItem("harris-lang"); } catch { /* prywatny tryb */ }
  setLang(saved || ((navigator.language || "pl").toLowerCase().startsWith("pl") ? "pl" : "en"), true);

  root.classList.add("ready");
  if (animate) initMotion();
  loadEvents();
})();
