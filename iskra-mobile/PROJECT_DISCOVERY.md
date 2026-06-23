# Analiza projekta

> Ovaj dokument je rezultat analize postojećeg softverskog projekta radi izrade specifikacije i modela sistema za predmet „Specifikacija i modelovanje softvera". Fokus je na **ideji zamišljenog sistema** i njegovom modelovanju.
>
> **Legenda pouzdanosti:**
> - ✅ **Potvrđeno** — direktno utvrđeno pregledom koda/konfiguracije (uz naveden fajl).
> - 🟡 **Pretpostavka** — verovatan zaključak iz koda, ali ne i eksplicitno potvrđen.
> - ❓ **Nepoznato** — ne može se zaključiti iz projekta; potrebno pitanje vlasniku.

---

## 1. Osnovni podaci

| Stavka | Vrednost | Izvor |
|--------|----------|-------|
| Ime projekta | **Iskra** (slug `iskra-mobile`) | ✅ `app.json` (name: "Iskra", slug: "iskra-mobile") |
| Tip aplikacije | **Mobilna** (iOS + Android), izvorno (native) | ✅ `app.json` (iOS bundle + Android package `com.iskraclub.app`), Expo |
| Verzija | 1.0.0 | ✅ `app.json` |
| Frontend/UI framework | Expo SDK 56 + Expo Router v3 (file-based routing), React Native 0.85, React 19 | ✅ `package.json` |
| Jezik | TypeScript (strict mode) | ✅ `package.json`, `tsconfig.json` |
| Backend | Supabase (Postgres baza, Auth, Realtime, Edge Functions u Deno) | ✅ `src/lib/supabase.ts`, `supabase/migrations/`, `supabase/functions/` |
| Analitika | PostHog (host `us.i.posthog.com`, projekat 457365) | ✅ `src/lib/posthog.ts` |
| Naplata / pretplata | RevenueCat (`react-native-purchases`) — **trenutno isključen u kodu (komentarisan)** | ✅ `src/lib/revenuecat.ts` + komentarisani pozivi |
| Push notifikacije | Expo Push API preko Supabase Edge funkcija | ✅ `supabase/functions/send-notification` |
| State management | Zustand (uz AsyncStorage persistenciju) | ✅ `src/stores/onboarding.ts` |
| Stanje projekta | Funkcionalan razvojni MVP. Ekrani, baza i logika postoje; sadržaj (članci, citati) je delom „stub"; naplata privremeno isključena za testiranje | 🟡 zaključeno iz koda + komentara |

**Kratak sažetak (3–5 rečenica):**
Iskra je mobilna aplikacija na srpskom jeziku namenjena pomoći osobama koje žele da prestanu da puše. Kroz detaljan personalizovani onboarding, aplikacija prikuplja navike pušenja i lične motive korisnika, a zatim u realnom vremenu prati napredak: vreme bez cigarete, ušteđen novac i broj izbegnutih cigareta. Ključna funkcionalnost je „Imam poriv" — alat koji korisnika kroz interaktivne tehnike (disanje, voda, šetnja, igra, podsećanje na lične razloge) vodi kroz trenutak žudnje za cigaretom. Sistem prati i „posrtanja" (slip) bez osude, čuva trajan broj čistih dana i otključava milestone (prekretnice) koje korisnik može da deli. Premium sadržaj i napredne funkcije naplaćuju se kroz pretplatu (ISKRA Club).

---

## 2. Ideja aplikacije

**Šta aplikacija predstavlja:**
Digitalni „saputnik" za prestanak pušenja, prilagođen srpskom govornom području. ✅ Sav UI tekst je na srpskom, neformalno („ti"), sa rodno osetljivim oblicima (proverava `gender === 'žensko'`) — vidljivo u `supabase/functions/schedule-notifications` i kroz `Gender` tip.

**Koji problem rešava:**
Prestanak pušenja je težak zbog (a) fizičke zavisnosti od nikotina, (b) trenutnih, intenzivnih žudnji (poriva), i (c) osećaja neuspeha kada osoba „posrne". 🟡 Ovo se zaključuje iz strukture: ceo `poriv/` tok postoji da bi „premostio" žudnju, a ceo `slip/` tok je dizajniran da posrtanje ne deluje kao kraj.

**Kako trenutno izgleda postojeći način rešavanja:**
❓ Nije eksplicitno opisano u kodu. 🟡 Tipično: snaga volje bez podrške, nikotinski flasteri/žvake, generičke (engleske) aplikacije koje ne razumeju lokalni kontekst (kafana, RSD cene, srpski jezik).

**Kako aplikacija poboljšava proces:**
- ✅ Personalizacija: čuva lične razloge (`reason_text`) i potpis (`signature_data`) i koristi ih u trenutku žudnje (`poriv/razlozi.tsx`).
- ✅ Trenutna intervencija: 6 interaktivnih alata za poriv.
- ✅ Pozitivno potkrepljenje: živi brojači uštede (RSD), izbegnutih cigareta, vremena.
- ✅ Bez osude: ukupno vreme se nikad ne resetuje na posrtanje (`totalDaysClean` u `useQuitStats.ts`).
- ✅ Gejmifikacija: milestone prekretnice koje se otključavaju i dele.

**Glavna vrednost za korisnika:**
🟡 Osećaj kontrole i napretka u realnom vremenu + alat „pri ruci" tačno u trenutku najveće slabosti (žudnje), bez stida pri posrtanju.

---

## 3. Ciljna grupa

> Sve grupe su 🟡 pretpostavke izvedene iz prirode sistema i UI teksta; nisu eksplicitno definisane „persona" u kodu.

**Grupa A — Pušač koji želi da prestane (primarni korisnik):**
- Ko: srpski govornik, puši cigarete ili IQOS (✅ `product` ∈ {`cigarete`, `iqos`}).
- Problem: zavisnost, žudnje, prethodni neuspeli pokušaji.
- Zašto bi koristio: struktura, podrška u trenutku žudnje, vidljiv napredak/ušteda.
- Najvažnije funkcionalnosti: „Imam poriv", brojači (vreme/novac/cigarete), milestone.

**Grupa B — Osoba koja je tek prestala / upravo prestaje:**
- ✅ `timing` ∈ {`odmah`, `uskoro`, `vec_prestao`} — sistem eksplicitno podržava i one koji su „već prestali".
- Najvažnije: praćenje streak-a, potvrda da napredak „ne nestaje".

**Grupa C — Osoba sklona posrtanju / recidivu:**
- Problem: posrtanja izazivaju osećaj neuspeha i odustajanje.
- Najvažnije: `slip/` tok bez osude, trajni brojač čistih dana.

**Grupa D — Premium pretplatnik (ISKRA Club):**
- ✅ `is_premium` flag + zaključani članci u `saznaj.tsx`.
- Najvažnije: pristup premium edukativnom sadržaju i (🟡) naprednim funkcijama.

❓ **Otvoreno:** Da li postoji administrativni/urednički korisnik (npr. za upravljanje člancima i citatima)? U kodu **nije pronađen** admin panel ili admin uloga.

---

## 4. Akteri sistema

| Akter | Tip | Odgovornosti / pristup | Status |
|-------|-----|------------------------|--------|
| **Neregistrovani / novi korisnik** | Čovek | Pokreće onboarding; na ekranu `name.tsx` se kreira **anonimna Supabase sesija** (`signInAnonymously`) | ✅ `app/onboarding/name.tsx`, `app/index.tsx` |
| **Registrovani (onboardovani) korisnik** | Čovek | Sve glavne funkcije: check-in, poriv tok, slip tok, milestone, profil, izmena podataka | ✅ ceo `app/(tabs)`, `app/poriv`, `app/slip`, `app/settings` |
| **Premium korisnik (ISKRA Club)** | Čovek | Sve gore + premium sadržaj | ✅ `is_premium`, `useIsPremium.ts`, `saznaj.tsx` |
| **Sistem za naplatu (RevenueCat)** | Eksterni servis | Obrada kupovine pretplate, provera entitlement-a "ISKRA Club", restore | ✅ `src/lib/revenuecat.ts` (trenutno isključen) |
| **Sistem za plaćanje (App Store / Google Play)** | Eksterni servis | Stvarna naplata kroz prodavnice (preko RevenueCat) | 🟡 zaključeno (proizvodi monthly/yearly/lifetime) |
| **Sistem za notifikacije (Expo Push API + Supabase Edge)** | Eksterni/sistemski | Slanje jutarnjih/večernjih push poruka po cron rasporedu | ✅ `supabase/functions/*` |
| **Analitički sistem (PostHog)** | Eksterni servis | Prijem 13 događaja ponašanja | ✅ `src/lib/posthog.ts` |
| **Sistem za recenzije (Expo Store Review)** | Eksterni/sistemski | Zahtev za ocenu aplikacije u prodavnici | ✅ `app/onboarding/review.tsx` |
| **Scheduler (Supabase Cron)** | Sistemski | Okida `schedule-notifications` u 08:00 i 21:00 UTC | ✅ komentar u edge funkciji |
| **Administrator / urednik sadržaja** | Čovek | Upravljanje člancima/citatima | ❓ **Nije pronađen u kodu** — pitanje za vlasnika |

---

## 5. Funkcionalnosti

### 5.1 Potvrđene funkcionalnosti

---
**F1 — Onboarding i kreiranje profila**
- Akter: novi korisnik
- Opis: 21-ekranski tok koji prikuplja sve podatke o korisniku i navikama pušenja, kreira anonimnu sesiju i upisuje profil.
- Početni uslov: aplikacija pokrenuta, nema završenog onboarding-a.
- Osnovni tok: `splash → name (kreira anon sesiju) → gender → product → cigarettes → price → cost-aha → reasons → reason-text → reflection → fears → fear-reflection → triggers → timing → [date ako nije „odmah"] → preview → panic → commitment (potpis) → summary → notifications → review → paywall → completeOnboarding() → /(tabs)`
- Rezultat: red u tabeli `profiles` sa `onboarding_completed = true`.
- Fajlovi: `app/onboarding/*.tsx`, `src/stores/onboarding.ts`, `completeOnboarding()` u `paywall.tsx`.

**F2 — Autentifikaciona kapija (routing)**
- Akter: sistem
- Opis: pri pokretanju proverava sesiju i `onboarding_completed`, usmerava na onboarding ili na glavne tabove.
- Početni uslov: pokretanje aplikacije.
- Osnovni tok: `getSession()` → ako nema sesije ili onboarding nije završen → `/onboarding/splash`; inače `/(tabs)`.
- Rezultat: korisnik na ispravnom ekranu.
- Fajlovi: ✅ `app/index.tsx`.

**F3 — Dnevni check-in (čist dan)**
- Akter: korisnik
- Opis: korisnik označava da je dan bio bez cigarete; upisuje se u `checkins`.
- Početni uslov: onboardovan korisnik, otvoren home ekran.
- Osnovni tok: tap na „danas" u nedeljnom trekeru → overlay → potvrda → `checkins.upsert({user_id, date, clean:true})` → analitika `daily_checkin`.
- Rezultat: dan zabeležen, streak ažuriran.
- Fajlovi: ✅ `app/(tabs)/index.tsx`, `src/components/home/DailyCheckinOverlay.tsx`.

**F4 — Živi brojači napretka (vreme / novac / cigarete)**
- Akter: korisnik
- Opis: svake sekunde se preračunavaju vreme bez cigarete, ušteđen RSD i broj izbegnutih cigareta na osnovu `quit_date` i navika.
- Osnovni tok: `useQuitStats(profile, checkins)` → `setInterval(1s)` → ažurira `QuitStats`.
- Rezultat: brojači u realnom vremenu na home i detaljnim ekranima.
- Fajlovi: ✅ `src/hooks/useQuitStats.ts`, `app/home/{time,money,cigarettes}.tsx`.

**F5 — Poriv (craving) tok**
- Akter: korisnik
- Opis: korisnik prijavljuje žudnju (jačina 1–10 + okidač), bira jedan od 6 alata, prolazi kroz interaktivnu vežbu i završava „pobedom".
- Početni uslov: korisnik oseća žudnju, tapne „Imam poriv".
- Osnovni tok: `entry` (upis u `cravings`) → `mode` (5-min tajmer + izbor alata) → jedan od {`disem`, `voda`, `razlozi`, `setam`, `posmatram`, `igram`} → `success`.
- Alternativni tok: na bilo kom koraku „Ipak sam zapalio/la" → prelazak u `slip/` tok.
- Rezultat: red u `cravings` (🟡 ishod `survived`/`slipped`), prikaz broja izdržanih poriva.
- Fajlovi: ✅ `app/poriv/*.tsx`.

**F6 — Slip (posrtanje) tok**
- Akter: korisnik
- Opis: beleži posrtanje bez osude; ukupno vreme se ne resetuje; opcionalno se beleži okidač.
- Osnovni tok: `slip/index` (upis u `slips` + `checkins`) → opcionalno `slip/reflect` (ažurira okidač u `slips`) → `slip/recap` → home.
- Rezultat: red u `slips`, dan u `checkins` označen kao posrtanje, streak resetovan ali `totalDaysClean` očuvan.
- Fajlovi: ✅ `app/slip/*.tsx`.

**F7 — Milestone (prekretnice) i otključavanje**
- Akter: korisnik (automatski sistem)
- Opis: prati prag dana / RSD / izdržanih poriva i automatski otključava prekretnice; upisuje u `milestones`.
- Osnovni tok: `useMilestones` poredi `QuitStats` sa nizom `MILESTONES` → za novu prekretnicu `milestones.upsert(...)` + `track.milestoneUnlocked`.
- Rezultat: prekretnica trajno otključana, prikazana u `milestoni` tabu i `roadmap`.
- Fajlovi: ✅ `src/hooks/useMilestones.ts`, `app/(tabs)/milestoni.tsx`, `app/progress/roadmap.tsx`, `app/progress/category/[key].tsx`.

**F8 — Deljenje prekretnice / pobede (share card)**
- Akter: korisnik
- Opis: generiše sliku (ember kartica) i otvara sistemski share sheet.
- Osnovni tok: tap „PODELI" → `react-native-view-shot` snimi off-screen karticu → `Share.share()` → (🟡) `track.milestoneShared`.
- Fajlovi: ✅ `src/components/ShareCard.tsx`, `app/(tabs)/milestoni.tsx`, `app/home/{money,cigarettes,time}.tsx`.

**F9 — Pregled napretka (roadmap i po kategoriji)**
- Akter: korisnik
- Opis: hronološki/po-kategorijski prikaz svih prekretnica (postignuto / trenutno / predstojeće).
- Fajlovi: ✅ `app/progress/roadmap.tsx`, `app/progress/category/[key].tsx`.

**F10 — Profil i izmena podataka**
- Akter: korisnik
- Opis: prikaz profila + izmena imena/pola, datuma prestanka i navika; odjava.
- Osnovni tok: `profil` tab → `settings/{profil-edit,datum-edit,navike-edit}` → upis u `profiles`; „Odjava" → `auth.signOut()`.
- Fajlovi: ✅ `app/(tabs)/profil.tsx`, `app/settings/*.tsx`.

**F11 — Push notifikacije (zakazane)**
- Akter: sistem za notifikacije
- Opis: jutarnja (08:00) i večernja (21:00) poruka svim onboardovanim korisnicima sa push tokenom; rodno osetljiv tekst; preračunava streak.
- Fajlovi: ✅ `supabase/functions/schedule-notifications`, `supabase/functions/send-notification`, `src/lib/notifications.ts`.

**F12 — Analitika ponašanja**
- Akter: analitički sistem
- Opis: 13 događaja (onboarding, paywall, check-in, poriv, slip, milestone, članci).
- Fajlovi: ✅ `src/lib/posthog.ts`.

**F13 — Quote dana**
- Akter: korisnik
- Opis: prikaz citata sa paginacijom + „fun-fact"; deljenje.
- Fajlovi: ✅ `app/home/quote.tsx` (🟡 citati su hardkodovani, nema baze).

---

### 5.2 Delimično implementirane funkcionalnosti

- **Paywall / pretplata (RevenueCat):** ✅ kompletna biblioteka `src/lib/revenuecat.ts` postoji, ali su **svi pozivi komentarisani** (`// TODO: re-enable when building dev client`) u `_layout.tsx`, `paywall.tsx`, `name.tsx`, `saznaj.tsx`. Trenutno `handleBuy()` samo poziva `completeOnboarding(snap, false)` — niko se zaista ne naplaćuje, svi prolaze besplatno.
- **Knowledge base (Saznaj):** ✅ ekran i kategorije postoje, ali su članci **hardkodovani „stub"** podaci; **ne postoje ekrani za prikaz pojedinačnog članka**; zaključavanje premium članaka vodi na stub Alert.
- **Quote dana:** citati hardkodovani, nema izvora podataka (baze).
- **Premium gating:** `useIsPremium` postoji, ali je u `saznaj.tsx` `isPremium` privremeno postavljen na `false` (RC isključen).

### 5.3 Pretpostavljene ili planirane funkcionalnosti

- **Widgeti (iOS/Android):** postoje prazni direktorijumi `widgets/ios`, `widgets/android` — 🟡 planirano, nije implementirano (potvrđeno i statusom faza u `CLAUDE.md`).
- **Prijava postojećeg naloga / magic link:** splash ima „Već imam nalog" tekst (🟡), ali tok prijave postojećeg korisnika **nije pronađen u kodu** (nema `signInWithOtp`/email login ekrana). ❓
- **Upravljanje sadržajem (CMS/admin):** 🟡 verovatno potrebno za članke/citate, ali ne postoji.
- **Confetti / lottie proslave:** `lottie-react-native` je instaliran (🟡 planirano za proslave), realna upotreba nije verifikovana ovde.

---

## 6. Glavni korisnički tokovi

### Tok 1 — Onboarding i prvi ulazak
- Pokreće: novi korisnik.
- Preduslovi: nema sesije / onboarding nije završen.
- Glavni tok: prolazak kroz 21 ekran → na `name` se kreira anonimna sesija → na kraju (`paywall`) `completeOnboarding()` upisuje profil → `/(tabs)`.
- Alternativni tokovi:
  - Na `timing` izbor „odmah" → preskače kalendar (`quit_date` = sada).
  - „uskoro" / „vec_prestao" → ekran `date` za izbor datuma.
  - Na paywall-u „Nastavi besplatno" → isti `completeOnboarding`, bez naplate.
- Završno stanje: profil kreiran, korisnik na home ekranu.

### Tok 2 — Dnevni check-in
- Pokreće: korisnik. Preduslov: onboardovan.
- Glavni tok: home → nedeljni treker → tap „danas" → overlay → „Čist/Čista sam" → `checkins.upsert(clean:true)`.
- Alternativa: „Zapalio/la sam" → ulazak u `slip/` tok.
- Završno stanje: dan zabeležen, streak ažuriran.

### Tok 3 — Prevazilaženje žudnje (Poriv)
- Pokreće: korisnik tapom „Imam poriv".
- Preduslovi: onboardovan korisnik.
- Glavni tok: `entry` (jačina + okidač, upis u `cravings`) → `mode` (izbor alata) → alat → `success`.
- Alternativa: „Ipak sam zapalio/la" → `slip/`.
- Završno stanje: žudnja „izdržana", statistika poriva ažurirana.

### Tok 4 — Posrtanje (Slip)
- Pokreće: korisnik („Zapalio/la sam").
- Glavni tok: `slip/index` (upis `slips` + `checkins`) → (opc.) `reflect` (okidač) → `recap` → home.
- Završno stanje: posrtanje zabeleženo, ukupno vreme očuvano, streak resetovan.

### Tok 5 — Kupovina pretplate (planirano/isključeno)
- Pokreće: korisnik na paywall-u.
- Glavni tok (kad je RC uključen): izbor plana → `purchasePackage` → provera entitlement-a → `is_premium = true` → home.
- Trenutno stanje: ❗ zaobiđeno — `completeOnboarding(snap, false)`.
- Završno stanje: (planirano) premium nalog.

### Tok 6 — Zakazana notifikacija
- Pokreće: Supabase cron (08:00 / 21:00 UTC).
- Glavni tok: `schedule-notifications` čita onboardovane korisnike sa tokenom → računa streak → bira rodno osetljiv tekst → poziva `send-notification` → Expo Push API.
- Alternativa: korisnik bez tokena se preskače; neuspeh pojedinačnog slanja ne prekida ostale (`Promise.allSettled`).

---

## 7. Podaci i entiteti

> Izvor sheme: ✅ `supabase/migrations/001_initial_schema.sql` + ✅ `src/types/index.ts`.

### `profiles`
- Svrha: korisnik + sve navike i lični podaci.
- Glavni atributi: `id` (PK, FK→auth.users), `name`, `gender` {muško/žensko/drugo}, `product` {cigarete/iqos}, `cigarettes_per_day`, `cigarettes_per_pack`, `pack_price_rsd`, `quit_date`, `reasons[]`, `reason_text`, `fears[]`, `triggers[]`, `timing` {odmah/uskoro/vec_prestao}, `onboarding_completed`, `is_premium`, `committed`, `signature_data`, `push_token`, `created_at`, `updated_at`.
- Veze: 1—N ka `checkins`, `cravings`, `slips`, `milestones`.
- Stanja (🟡 izvedeno): `nov` (anon, onboarding u toku) → `aktivan/onboardovan` → `premium`; ortogonalno `committed`.

### `checkins`
- Svrha: dnevni status (čist dan ili posrtanje).
- Atributi: `id`, `user_id` (FK), `date` (date), `clean` (bool), `created_at`. UNIQUE `(user_id, date)`.
- Veze: N—1 ka `profiles`.
- ⚠️ Nedoslednost: deo koda upisuje `status:'slip'`, ali šema ima samo `clean boolean` (vidi sekciju 14).

### `cravings`
- Svrha: zabeležena žudnja i njen ishod.
- Atributi: `id`, `user_id`, `strength` (1–10), `trigger`, `tool_used` {disem/voda/razlozi/setam/posmatram/igram}, `duration_seconds`, `outcome` {survived/slipped}, `created_at`.
- Stanja: `započet` (outcome=null) → `survived` / `slipped`.

### `slips`
- Svrha: zabeleženo posrtanje + okidač.
- Atributi: `id`, `user_id`, `trigger`, `notes`, `created_at`.

### `milestones`
- Svrha: trajni zapis otključanih prekretnica.
- Atributi: `id`, `user_id`, `key`, `category`, `unlocked_at`, `shared`. UNIQUE `(user_id, key)`.
- Stanja: `zaključano` → `otključano` → `podeljeno` (`shared=true`).

**Predlog entiteta za UML dijagram stanja:** ✅ **`Profile` (korisnik)** ili **`Craving`**.
- Preporuka: **`Profile`** — ima najbogatiji životni ciklus (anoniman → onboardovan → premium, + `committed`, + slip/recidiv stanje koje menja prikaz home ekrana). Alternativno, **`Craving`** je odličan za dijagram stanja zbog jasnih tranzicija (započet → izabran alat → survived/slipped). Za nastavu je `Craving` često čistiji primer, dok je `Profile` sadržajno bogatiji.

---

## 8. Potencijalne klase (priprema za klasni dijagram)

> Sistem je pretežno funkcionalan/React (nema OOP servisnih klasa u backendu); klase ispod su **modelska apstrakcija** prikladna za UML, izvedena iz entiteta, hook-ova i lib modula.

| Klasa | Odgovornost | Glavni atributi | Moguće metode | Veze (kardinalnost) |
|-------|-------------|-----------------|---------------|---------------------|
| **User / Profile** | Identitet i navike korisnika | id, name, gender, product, cigarettesPerDay, cigarettesPerPack, packPriceRSD, quitDate, isPremium, committed, onboardingCompleted | completeOnboarding(), getAnnualCostRSD(), updateHabits(), signOut() | 1 — * Checkin, 1 — * Craving, 1 — * Slip, 1 — * Milestone |
| **Checkin** | Dnevni status | id, date, clean | — | * — 1 Profile |
| **Craving** | Epizoda žudnje | id, strength, trigger, toolUsed, durationSeconds, outcome | start(), complete(outcome) | * — 1 Profile, 1 — 0..1 CravingTool |
| **Slip** | Posrtanje | id, trigger, notes, createdAt | reflect(trigger) | * — 1 Profile |
| **Milestone** | Prekretnica | id, key, category, unlockedAt, shared | unlock(), share() | * — 1 Profile, * — 1 MilestoneDef |
| **MilestoneDef** (vrednosni objekat) | Definicija praga prekretnice | key, category, days?, rsd?, cravingsSurvived?, title, unlockText | isSatisfiedBy(stats) | 1 — * Milestone |
| **QuitStats** (izračunati VO) | Trenutna statistika | daysSmokeFreeContinuous, totalDaysClean, cigarettesAvoided, moneySavedRSD, timeDisplay | recompute() | izvedeno iz Profile + Checkin |
| **OnboardingDraft** (Zustand store) | Privremeni nacrt profila | sva onboarding polja | setX(), reset(), getAnnualCostRSD() | 1 — 1 Profile (pri završetku) |
| **NotificationService** | Slanje push poruka | — | sendNotification(userId,title,body), scheduleDaily() | koristi Profile |
| **PurchaseService (RevenueCat)** | Naplata i entitlement | apiKey, entitlementId | configure(), purchase(pkg), restore(), isEntitlementActive() | menja Profile.isPremium |
| **AnalyticsService (PostHog)** | Beleženje događaja | token | track*( ) (13 metoda) | posmatra sve aktere |

---

## 9. Eksterni sistemi i integracije

| Sistem | Svrha | Prima | Šalje | Ako nije dostupan |
|--------|-------|-------|-------|-------------------|
| **Supabase (Auth/DB/Realtime)** | Identitet, perzistencija, realtime profil | upiti/upsert-i, anon login | profil, checkins, milestones, realtime promene | ✅ greške se hvataju i prikazuju Alert („Provjeri internet vezu") u `completeOnboarding`; bez baze app ne radi |
| **Supabase Edge Functions (Deno)** | Logika notifikacija | `{user_id,title,body}` / cron | poziv ka Expo Push | 🟡 push se ne šalje; korisnik ostaje bez podsetnika |
| **Expo Push API** (`exp.host/--/api/v2/push/send`) | Dostava push poruka | token+poruka | rezultat slanja | ✅ pojedinačni neuspeh ne ruši batch (`allSettled`) |
| **RevenueCat** | Pretplata, entitlement „ISKRA Club" | izbor paketa | customerInfo/entitlement | ✅ trenutno isključen; planirano: fallback na besplatno; otkazivanje (kod 1) se tiho ignoriše |
| **App Store / Google Play (preko RC)** | Stvarna naplata | kupovina | potvrda | ❓ ponašanje pri otkazu/grešci delom definisano |
| **PostHog** | Analitika | 13 događaja | — | 🟡 gubitak analitike, app nastavlja |
| **Expo Store Review** | Ocena u prodavnici | zahtev | — | ✅ tiho preskače ako nije dostupno |

---

## 10. Tehnička organizacija

**Postojeća organizacija (✅ iz strukture):**
- **Frontend / UI:** `app/` (Expo Router rute) + `src/components/` (UI biblioteka, ikone, nav, home, poriv, charts).
- **Stanje:** `src/stores/onboarding.ts` (Zustand + AsyncStorage).
- **Poslovna logika (klijent):** `src/hooks/` (`useQuitStats`, `useMilestones`, `useUserData`, `useIsPremium`).
- **Integracioni sloj (lib):** `src/lib/` (`supabase`, `posthog`, `notifications`, `revenuecat`).
- **Backend:** Supabase Postgres (`supabase/migrations/`) + Edge funkcije (`supabase/functions/`).
- **Baza:** 5 tabela sa RLS po korisniku (`auth.uid()`).
- **API:** nema posebnog REST sloja — klijent direktno koristi Supabase SDK; serverska logika samo za notifikacije (Edge).
- **Autentifikacija:** Supabase Auth, anonimna sesija; RLS ograničava pristup na sopstvene redove.
- **Komunikacija:** klijent ↔ Supabase preko SDK (+ Realtime kanal za `profiles`); Edge ↔ Expo Push preko HTTP.

**Preporučena arhitektura za akademsku dokumentaciju (⚠️ preliminarno):**
- Najprirodnije: **klijent–server sa BaaS (Backend-as-a-Service)** uz **slojevitu organizaciju klijenta** (Prezentacija → Aplikaciona logika/hook-ovi → Integracioni sloj → Eksterni servisi).
- Alternativno se može prikazati kao **modularni monolit** (jedan mobilni klijent + Supabase backend + eksterni servisi) ili **slojevita arhitektura** ako profesor preferira klasičan 3-slojni prikaz.
- Mikroservisi i klasičan MVC **nisu** najbolji opis (nema kontrolera/servisnih klasa u tradicionalnom smislu).

---

## 11. Nefunkcionalne karakteristike (predlog oblasti)

- **Performanse:** živi 1s ticker mora biti gladak; ❓ nema definisanih ciljeva (npr. vreme učitavanja home ekrana).
- **Bezbednost:** RLS po korisniku ✅; servisni ključ samo u Edge funkcijama (`AGENTS.md` pravilo) ✅; ❓ politika oko anonimnih naloga (gubitak naloga pri brisanju aplikacije?).
- **Pouzdanost:** `allSettled` za notifikacije ✅; ❓ offline ponašanje check-in-a/poriva.
- **Dostupnost:** zavisi od Supabase/Expo; ❓ ciljani uptime.
- **Upotrebljivost:** srpski jezik, rodno osetljiv tekst, bez osude ✅; pristupačnost (a11y) ❓ (planirano u fazi 12).
- **Responsivnost:** safe-area, prilagođen mobilnim ekranima ✅.
- **Skalabilnost:** BaaS skalira automatski 🟡; ❓ očekivani broj korisnika.
- **Privatnost:** lični podaci (razlozi, potpis, navike) — ❓ politika čuvanja/brisanja, saglasnost, GDPR.
- **Kompatibilnost:** iOS + Android (Expo SDK 56) ✅; ❓ minimalne verzije OS-a.

> Konkretne brojke (ciljevi, pragovi, uptime) nisu definisani u projektu — vidi pitanja u sekciji 15 (I).

---

## 12. Potencijalni UML dijagrami

### Dijagram slučajeva upotrebe
- Akteri: Korisnik, Premium korisnik, Sistem za naplatu (RevenueCat), Sistem za notifikacije, Analitika.
- Ključni use case-ovi: *Onboarding*, *Dnevni check-in*, *Prevaziđi poriv*, *Zabeleži posrtanje*, *Otključaj prekretnicu*, *Podeli prekretnicu*, *Izmeni profil*, *Kupi pretplatu*, *Primi podsetnik*, *Čitaj članak (premium)*.
- `include`: *Prevaziđi poriv* ⟶ «include» *Zabeleži žudnju*; *Onboarding* ⟶ «include» *Kreiraj nalog*.
- `extend`: *Prevaziđi poriv* «extend» *Zabeleži posrtanje* (kada korisnik ipak zapali); *Čitaj članak* «extend» *Kupi pretplatu* (ako je premium).

### Dijagram aktivnosti
- Najpogodniji proces: **Prevazilaženje poriva** (jasne odluke i alternative).
- Glavni koraci: započni žudnju → unesi jačinu i okidač → upis u bazu → izaberi alat → izvrši vežbu → [odluka: izdržao? / zapalio?] → ako izdržao → ekran uspeha; ako zapalio → slip tok.

### Dijagram sekvenci
- Najpogodnija funkcionalnost: **Završetak onboarding-a + (planirana) kupovina**.
- Učesnici: Korisnik → Paywall (UI) → RevenueCat → Supabase (profiles) → PostHog.
- Alternativno (jednostavnije): **Zakazana notifikacija** — Cron → schedule-notifications → Supabase → send-notification → Expo Push → Uređaj.

### Klasni dijagram
- Ključne klase: Profile, Checkin, Craving, Slip, Milestone, MilestoneDef, QuitStats, OnboardingDraft, PurchaseService, NotificationService, AnalyticsService (vidi sekciju 8).
- Najvažnije veze: Profile 1—* (Checkin/Craving/Slip/Milestone); Milestone *—1 MilestoneDef; QuitStats izveden iz Profile+Checkin.

### Dijagram stanja
- Predloženi entitet: **Craving** (ili Profile).
- Stanja (Craving): `Započet` → `Alat izabran` → (`Survived` | `Slipped`).
- Događaji: `unesiJacinuIOkidac`, `izaberiAlat`, `zavrsiVezbu`, `zapali`.
- (Profile, alternativa): `Anoniman` → `Onboardovan` → `Premium`; pod-stanje `U streak-u` ↔ `Posrnuo` (event: slip / nastavi).

---

## 13. Predlog UI ekrana

- **Glavni ekran:** `app/(tabs)/index.tsx` (Home) — pozdrav + avatar, nedeljni treker, živi countdown, kartice ušteda/cigarete, napredak po kategorijama, fiksno dugme „Imam poriv". Akcija: dnevni check-in, navigacija ka detaljima i poriv toku.
- **Najvažniji funkcionalni ekran:** `app/poriv/mode.tsx` + alati (`disem/voda/...`) — srce vrednosti aplikacije (intervencija u žudnji). Akcija: izbor i izvođenje tehnike.
- **Navigacija:** donji custom `BottomNav` (Početna / Milestoni / Saznaj / Profil); stack rute za `home/`, `poriv/`, `slip/`, `progress/`, `settings/`, `onboarding/`.
- **Elementi po ekranu:** Home (treker, brojači, dugmad), Poriv mode (countdown ring, mreža alata, slip link), Milestoni (mreža otključano/zaključano + PODELI), Profil (kartica + grupe podešavanja).

---

## 14. Nejasnoće i kontradikcije

1. ⚠️ **`checkins.status` vs `checkins.clean`:** Više izvora navodi da slip tok upisuje `checkins` sa `status:'slip'`, ali SQL šema ima samo `clean boolean` (nema kolone `status`). **Verovatna nekonzistentnost** — ili treba kolona `status`, ili slip treba da upisuje `clean:false`. ❓
2. ⚠️ **Broj prekretnica:** dokumentacija (CLAUDE.md/memorija) navodi „15", a kod (`MILESTONES`) ima **16** (9 vremenskih + 4 finansijska + 3 craving). Treba uskladiti.
3. ⚠️ **Prijava postojećeg korisnika:** splash nudi „Već imam nalog", ali **tok prijave (email/magic link) nije pronađen** u kodu. Anonimni nalozi se ne mogu lako povratiti na drugom uređaju.
4. ⚠️ **RevenueCat isključen:** poslovno najavljena naplata postoji kao kod, ali je **tehnički isključena** — svi trenutno dobijaju pun pristup besplatno.
5. ⚠️ **Knowledge base bez sadržaja i bez ekrana članka:** kategorije/članci su hardkodovani stub-ovi; nema rute za prikaz pojedinačnog članka ni izvora podataka.
6. ⚠️ **`outcome` u `cravings`:** šema dozvoljava `survived/slipped`, ali nije potvrđeno gde se i kada ažurira na `survived` po završetku alata (upis je pri `entry`, ishod 🟡).
7. ⚠️ **Anonimni nalozi i privatnost:** lični potpis i razlozi se čuvaju uz anoniman nalog — politika čuvanja/brisanja nije definisana.
8. ⚠️ **Widgeti:** najavljeni (prazni direktorijumi), nisu implementirani.

---

## 15. Pitanja za vlasnika projekta

### A. Osnovna ideja i obim
1. **Koji je primarni cilj MVP-a za prvu objavu?** *(Zašto: definiše granice obima i prioritете.)*
   - a) Samo besplatne funkcije (bez naplate) — **Preporuka** (RC je već isključen)
   - b) Pun proizvod sa pretplatom od starta
   - c) Beta sa ograničenim brojem korisnika
   - Slobodan odgovor: …

2. **Da li je naplata (ISKRA Club) deo ispitnog modela sistema ili van obima?** *(Zašto: određuje da li PurchaseService ulazi u dijagrame.)*
   - a) U obimu (modelovati naplatu) — **Preporuka** (radi potpunije specifikacije)
   - b) Van obima
   - Slobodan odgovor: …

### B. Ciljna grupa
3. **Ko je primarna ciljna grupa?** *(Zašto: oblikuje use case prioritete.)*
   - a) Pušači koji prvi put pokušavaju da prestanu
   - b) Oni koji su više puta pokušavali i posrtali — **Preporuka** (slip tok je centralni)
   - c) Oboje podjednako
   - Slobodan odgovor: …

4. **Da li ciljate i IQOS korisnike ravnopravno sa cigaretama?** *(Zašto: utiče na izračune i copy.)*  (a) Da / (b) Primarno cigarete — **Preporuka** / Slobodan: …

### C. Akteri i korisničke uloge
5. **Postoji li administrator/urednik sadržaja (članci, citati)?** *(Zašto: dodaje aktera i čitav set use case-ova.)*
   - a) Da, kroz poseban admin/CMS — **Preporuka** (ako je sadržaj dinamičan)
   - b) Ne, sadržaj je statičan u aplikaciji
   - Slobodan odgovor: …

6. **Da li je korisnik uvek anoniman ili treba prava registracija (email)?** *(Zašto: određuje Auth model i oporavak naloga.)*
   - a) Samo anonimno (trenutno stanje)
   - b) Anonimno + kasnije povezivanje email naloga — **Preporuka**
   - c) Obavezna registracija
   - Slobodan odgovor: …

### D. Funkcionalnosti
7. **„Već imam nalog" — da li treba implementirati prijavu postojećeg korisnika?** *(Zašto: trenutno nedostaje.)*  (a) Da, email/magic link — **Preporuka** / (b) Ne / Slobodan: …

8. **Da li je knowledge base (Saznaj) sa pravim člancima u obimu sistema?** *(Zašto: dodaje entitet Article + ekran članka.)*  (a) Da, sa pojedinačnim člancima — **Preporuka** / (b) Samo placeholder / Slobodan: …

9. **Koje funkcije su isključivo premium?** *(Zašto: definiše gating pravila.)*
   - a) Samo premium članci — **Preporuka**
   - b) Premium članci + napredne statistike/alati
   - c) Sve osim osnovnog brojača
   - Slobodan odgovor: …

### E. Poslovna pravila
10. **Definicija „streak-a": šta tačno resetuje niz?** *(Zašto: ključno za check-in/slip logiku.)*
    - a) Svaki dan bez označenog čistog check-ina
    - b) Samo eksplicitno zabeleženo posrtanje — **Preporuka**
    - Slobodan odgovor: …
11. **Da li jedan check-in pokriva ceo dan i može li se menjati unazad?** *(Zašto: pravila konzistentnosti `checkins`.)*  Slobodan odgovor: …
12. **Kako se računa „izdržan poriv" (za prekretnice)?** *(Zašto: određuje ažuriranje `cravings.outcome`.)*  (a) Svaki započet poriv koji se ne završi paljenjem — **Preporuka** / (b) Samo oni gde je alat završen / Slobodan: …

### F. Podaci i entiteti
13. **`checkins`: treba li kolona `status` (clean/slip/…) umesto samo `clean`?** *(Zašto: rešava nekonzistentnost #1.)*  (a) Da, uvesti `status` — **Preporuka** / (b) Ostati na `clean:false` za slip / Slobodan: …
14. **Koliko prekretnica je konačno (15 ili 16) i da li je lista fiksna?** *(Zašto: usklađivanje dok. i koda.)*  Slobodan odgovor: …
15. **Da li čuvati `notes` uz slip i poriv (slobodan tekst korisnika)?** *(Zašto: privatnost + model.)*  (a) Da / (b) Ne — **Preporuka** ako nije nužno / Slobodan: …

### G. Obaveštenja i eksterni sistemi
16. **Vreme slanja podsetnika (trenutno 08:00 i 21:00 UTC) — da li prilagoditi vremenskoj zoni korisnika?** *(Zašto: relevantno za srpsku publiku, UTC≠lokalno.)*  (a) Lokalna zona korisnika — **Preporuka** / (b) Fiksno UTC / Slobodan: …
17. **Koji eksterni servisi su obavezni u modelu (RevenueCat, PostHog, Expo Push)?** *(Zašto: granice sistema.)*  Slobodan odgovor: …

### H. Bezbednost i privatnost
18. **Politika ličnih podataka (potpis, razlozi): čuvanje, brisanje, saglasnost?** *(Zašto: privatnost/GDPR.)*  Slobodan odgovor: …
19. **Šta se dešava sa nalogom pri deinstalaciji (anoniman nalog se gubi)?** *(Zašto: pouzdanost identiteta.)*  (a) Prihvatljiv gubitak / (b) Treba oporavak naloga — **Preporuka** / Slobodan: …

### I. Performanse i pouzdanost
20. **Postoje li ciljevi performansi (npr. učitavanje home < X s)?** *(Zašto: nefunkcionalni zahtevi.)*  Slobodan odgovor: …
21. **Da li aplikacija mora da radi offline (check-in/poriv bez mreže)?** *(Zašto: arhitektura sinhronizacije.)*  (a) Da, offline-first — **Preporuka** za navike / (b) Ne / Slobodan: …
22. **Očekivani obim korisnika (red veličine) za skalabilnost?** *(Zašto: kapacitet.)*  (a) <1k / (b) 1k–50k / (c) >50k / Slobodan: …

### J. Interfejs i korisnički tok
23. **Koji ekran je „glavni" za potrebe dokumentacije — Home ili Poriv mode?** *(Zašto: fokus UI poglavlja.)*  (a) Home — **Preporuka** / (b) Poriv mode / Slobodan: …
24. **Da li je tok prijave/odjave deo modela korisničkih tokova?** *(Zašto: kompletnost sekvenci.)*  Slobodan odgovor: …

### K. Arhitektura
25. **Koju arhitekturnu reprezentaciju preferira predmet?** *(Zašto: usklađivanje sa očekivanjem profesora.)*
    - a) Klijent–server (BaaS) sa slojevitim klijentom — **Preporuka**
    - b) Klasična slojevita (3-slojna)
    - c) Modularni monolit
    - Slobodan odgovor: …

### L. Granice sistema
26. **Šta je eksplicitno VAN granica sistema?** *(Zašto: jasno definisanje konteksta.)*
    - a) Naplata/prodavnice (samo interfejs ka njima)
    - b) Analitika (PostHog) kao spoljašnji posmatrač
    - c) Sadržaj članaka (eksterni CMS)
    - Slobodan odgovor: …

---

# Obrazac za odgovore

```
A. Osnovna ideja i obim
1. Primarni cilj MVP-a:
   Odgovor:
2. Naplata u obimu modela?
   Odgovor:

B. Ciljna grupa
3. Primarna ciljna grupa:
   Odgovor:
4. IQOS ravnopravno sa cigaretama?
   Odgovor:

C. Akteri i uloge
5. Postoji li admin/urednik sadržaja?
   Odgovor:
6. Anoniman vs registrovan korisnik:
   Odgovor:

D. Funkcionalnosti
7. Implementirati prijavu postojećeg naloga?
   Odgovor:
8. Knowledge base sa pravim člancima u obimu?
   Odgovor:
9. Koje funkcije su premium?
   Odgovor:

E. Poslovna pravila
10. Šta resetuje streak?
    Odgovor:
11. Check-in: ceo dan / izmena unazad?
    Odgovor:
12. Kako se računa „izdržan poriv"?
    Odgovor:

F. Podaci i entiteti
13. checkins: uvesti `status` umesto `clean`?
    Odgovor:
14. Konačan broj prekretnica (15/16), fiksna lista?
    Odgovor:
15. Čuvati slobodan tekst (notes) uz slip/poriv?
    Odgovor:

G. Obaveštenja i eksterni sistemi
16. Vreme podsetnika: lokalna zona ili UTC?
    Odgovor:
17. Koji eksterni servisi su obavezni u modelu?
    Odgovor:

H. Bezbednost i privatnost
18. Politika ličnih podataka (potpis/razlozi)?
    Odgovor:
19. Sudbina naloga pri deinstalaciji?
    Odgovor:

I. Performanse i pouzdanost
20. Ciljevi performansi?
    Odgovor:
21. Offline rad obavezan?
    Odgovor:
22. Očekivani obim korisnika?
    Odgovor:

J. Interfejs i korisnički tok
23. Glavni ekran za dokumentaciju (Home/Poriv)?
    Odgovor:
24. Prijava/odjava deo modela tokova?
    Odgovor:

K. Arhitektura
25. Preferirana arhitekturna reprezentacija?
    Odgovor:

L. Granice sistema
26. Šta je VAN granica sistema?
    Odgovor:
```
