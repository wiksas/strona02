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
  /* dane kontaktowe z formularza (pochodzą z treści w panelu CMS) */
  const formData = document.getElementById("reserveForm")?.dataset ?? {};
  const RESERVATION_EMAIL = formData.email || "rezerwujestolik@gmail.com";
  const PHONE = formData.phone || "12 421 57 41";
  const TEL = `tel:+48${PHONE.replace(/\D/g, "").slice(-9)}`;

  const T = {
    pl: {
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
      sent: `Otworzyliśmy Twój program pocztowy z gotową wiadomością – wystarczy ją wysłać. Jeśli nic się nie otworzyło, zadzwoń: <a href="${TEL}">${PHONE}</a> lub napisz na <a href="mailto:${RESERVATION_EMAIL}">${RESERVATION_EMAIL}</a>.`,
      mailSubject: "Rezerwacja stolika",
      people: "os.",
      mailLines: ["Imię i nazwisko", "E-mail", "Telefon", "Liczba osób", "Data", "Godzina", "Dodatkowe informacje"]
    },
    en: {
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
      sent: `Your e-mail app has opened with a ready-made message – just send it. If nothing opened, call <a href="${TEL}">${PHONE}</a> or write to <a href="mailto:${RESERVATION_EMAIL}">${RESERVATION_EMAIL}</a>.`,
      mailSubject: "Table reservation",
      people: "guests",
      mailLines: ["Name", "E-mail", "Phone", "Guests", "Date", "Time", "Additional information"]
    }
  }[lang];

  /* ------------------------------------------------------------------ */
  /* pomocnicze                                                          */
  /* ------------------------------------------------------------------ */
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
  /* karty menu: wszystkie strony jedna pod drugą — czyta się je przewijając w dół jak dokument;
     lista stron (z wymiarami) jest w atrybucie data-pages przycisku karty */
  const LB_SETS = { gallery: shots.map((b) => ({ src: b.dataset.full, alt: $("img", b).alt })) };
  $$(".book").forEach((b) => {
    LB_SETS[b.dataset.book] = JSON.parse(b.dataset.pages || "[]").map((p, i) => ({ src: p.src, w: p.w, h: p.h, alt: `${T.page} ${i + 1}` }));
  });
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
})();
