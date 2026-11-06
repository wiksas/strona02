/* Program koncertów jest w HTML (budowany z panelu CMS). Strona przebudowuje się codziennie w nocy,
   a ten skrypt dodatkowo — w przeglądarce — ukrywa koncerty, które już minęły, przenosi pieczątkę
   „Dziś wieczorem” na właściwy dzień i aktualizuje zapowiedź na górze strony. */
(() => {
  "use strict";
  const list = document.getElementById("events");
  if (!list) return;

  const lang = document.documentElement.lang === "en" ? "en" : "pl";
  const T = {
    pl: { locale: "pl-PL", today: "Dziś wieczorem", tonight: "Dziś wieczorem gramy", next: "Wkrótce na scenie" },
    en: { locale: "en-GB", today: "Tonight", tonight: "Tonight we play", next: "Coming up on stage" }
  }[lang];
  const d = new Date();
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const limit = Number(list.dataset.limit) || Infinity;

  const cards = [...list.querySelectorAll("li.event[data-date]")];
  let shown = 0;
  cards.forEach((li) => {
    const visible = li.dataset.date >= today && shown < limit;
    li.hidden = !visible;
    if (visible) shown++;
    const isToday = li.dataset.date === today;
    li.classList.toggle("event--today", isToday);
    const stamp = li.querySelector(".event-stamp");
    if (isToday && !stamp) {
      const s = document.createElement("span");
      s.className = "event-stamp";
      s.textContent = T.today;
      li.prepend(s);
    } else if (!isToday && stamp) {
      stamp.remove();
    }
  });
  const empty = list.querySelector(".events-empty");
  if (empty) empty.hidden = shown > 0;

  const bill = document.getElementById("tonight");
  if (!bill) return;
  const first = cards.find((li) => !li.hidden);
  if (!first) { bill.classList.add("is-empty"); return; }
  const [Y, M, D] = first.dataset.date.split("-").map(Number);
  const date = new Date(Y, M - 1, D);
  const isToday = first.dataset.date === today;
  const time = first.querySelector(".event-meta span")?.textContent ?? "";
  const fmt = new Intl.DateTimeFormat(T.locale, isToday ? { weekday: "long" } : { weekday: "long", day: "numeric", month: "long" });
  bill.querySelector(".tonight-label").textContent = isToday ? T.tonight : T.next;
  bill.querySelector(".tonight-name").textContent = first.querySelector(".event-title a")?.textContent ?? "";
  bill.querySelector(".tonight-time").textContent = `${fmt.format(date)} · ${time}`;
  bill.classList.remove("is-empty");
})();
