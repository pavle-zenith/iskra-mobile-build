# Iskra

Iskra je mobilna aplikacija na srpskom jeziku koja korisnicima pomaže da prestanu da puše tako što prati njihov napredak u realnom vremenu i pruža im konkretne alate za savladavanje trenutaka žudnje za cigaretom.

> **Napomena o izvorima i prioritetu informacija.** Ovaj dokument je nastao kombinovanjem (1) eksplicitnih odluka vlasnika projekta datih kroz pitanja, (2) ponašanja potvrđenog u kodu, (3) postojeće dokumentacije (`CLAUDE.md`, `PROJECT_DISCOVERY.md`) i (4) opravdanih pretpostavki. Tamo gde se odluka vlasnika razlikuje od trenutne implementacije, kao zvanična specifikacija uzeta je odluka vlasnika, a razlika je posebno označena oznakom **[Razlika u odnosu na kod]**. Pretpostavke su označene sa **[Pretpostavka]**.
>
> **Ključne odluke vlasnika ugrađene u ovaj dokument:**
> 1. Naplata (pretplata „ISKRA Club") je **van granica modelovanog sistema** — tretira se kao eksterni sistem ka kome aplikacija ima interfejs.
> 2. Korisnički nalog podrazumeva **obaveznu registraciju** korisnika.
> 3. Baza znanja („Saznaj") je deo sistema i podrazumeva **administratora/urednika sadržaja** koji upravlja člancima.
> 4. Niz uzastopnih čistih dana („streak") resetuje **isključivo eksplicitno zabeleženo posrtanje**.
> 5. Sistem radi **online** (ne zahteva se offline rad).
> 6. Zvanična arhitektura je **klijent–server zasnovan na BaaS platformi sa slojevitim klijentom**.
> 7. Glavni ekran za potrebe dokumentacije je **početni ekran (Home)**.
>
> **Dodatne razrešene odluke (ranije otvorena pitanja):**
> 8. **Status check-in-a** modeluje se posebnim poljem `status` sa vrednostima `cist` / `posrtanje` (dan bez evidencije jednostavno nema zapis).
> 9. **Metod registracije** je e-pošta + lozinka (uz magic link kao alternativu); lozinka se čuva heširano na strani servisa za autentifikaciju.
> 10. **Anonimni nalog se migrira** ka registrovanom pri prvoj registraciji (podaci se čuvaju, nalog se „uvezuje" na e-poštu).
> 11. **Vremenska zona obaveštenja** je lokalna zona korisnika (08:00 i 21:00 po lokalnom vremenu).
> 12. **Lični podaci** se obrađuju uz GDPR usklađenost: eksplicitna saglasnost pri registraciji, pravo na izvoz i brisanje, čuvanje dok nalog postoji.
> 13. **Administrator** ima dozvole isključivo nad sadržajem (članci), bez pristupa ličnim podacima ili statistici pojedinačnih korisnika.
> 14. **Broj prekretnica** je fiksno **16** (9 vremenskih, 4 finansijske, 3 za savladane porive).

---

# 1. Sažetak projekta

Iskra je mobilna aplikacija namenjena osobama sa srpskog govornog područja koje žele da prestanu da puše. Sistem je zamišljen kao digitalni saputnik koji korisnika prati od trenutka donošenja odluke o prestanku, kroz svakodnevno održavanje navike, sve do trajnog oslobađanja od zavisnosti. Aplikacija je dostupna na iOS i Android uređajima.

Problem koji aplikacija rešava jeste visok stepen neuspeha pri pokušajima prestanka pušenja. Prestanak je težak iz tri glavna razloga: fizičke zavisnosti od nikotina, naglih i intenzivnih napada žudnje (poriva), i osećaja neuspeha koji se javlja kada osoba „posrne" i ponovo zapali cigaretu. Postojeća rešenja — snaga volje, nikotinske zamene ili generičke aplikacije na stranim jezicima — ne uzimaju u obzir lokalni kontekst, ne pružaju pomoć tačno u trenutku najjače žudnje i često tretiraju svako posrtanje kao potpuni neuspeh, čime obeshrabruju korisnika.

Iskra problem rešava na nekoliko načina. Tokom detaljnog uvodnog procesa (onboarding) prikuplja podatke o navikama pušenja i ličnim motivima korisnika, uključujući lične razloge za prestanak i svojeručni potpis posvećenosti. Na osnovu datuma prestanka i navika, aplikacija u realnom vremenu prikazuje vreme provedeno bez cigarete, ušteđeni novac i broj izbegnutih cigareta. Centralna funkcionalnost je „Imam poriv" — alat koji korisnika u trenutku žudnje vodi kroz interaktivne tehnike (kontrolisano disanje, vizuelizacija vode, šetnja, igra, podsećanje na lične razloge i posmatranje žudnje). Posebnu vrednost predstavlja tretman posrtanja: ukupno vreme bez cigarete se nikada ne poništava, a posrtanje se beleži bez osude i uz analizu okidača, čime se korisnik ohrabruje da nastavi.

Najvažnije funkcionalnosti sistema su: personalizovani onboarding sa kreiranjem profila, svakodnevna evidencija („check-in"), brojači napretka u realnom vremenu, tok za savladavanje žudnje, tok za evidenciju i prevazilaženje posrtanja, sistem prekretnica (milestone) koje se otključavaju i dele, pregled napretka po kategorijama, baza edukativnih članaka kojom upravlja administrator, kao i zakazana push obaveštenja.

Iskra se od postojećih rešenja razlikuje po tome što je u potpunosti prilagođena srpskom jeziku i kulturi (neformalno obraćanje, rodno osetljivi oblici, cene u dinarima, lokalni okidači poput društvenih situacija), po tome što pruža intervenciju tačno u trenutku žudnje, i po tome što posrtanje tretira kao deo procesa, a ne kao neuspeh.

---

# 2. Pozadina problema

**Postojeći problem.** Pušenje je hronična zavisnost koju je izuzetno teško prekinuti. Veliki procenat osoba koje pokušaju da prestanu vrati se pušenju u prvim nedeljama. Razlozi su fiziološki (nikotinska apstinencija), psihološki (žudnja vezana za navike i okidače) i emotivni (osećaj krivice i neuspeha nakon prvog posrtanja).

**Ko se susreće sa problemom.** Sa problemom se susreću pušači svih uzrasta koji žele da prestanu, posebno oni koji su već nekoliko puta bezuspešno pokušavali. Specifično za ovaj sistem, reč je o korisnicima sa srpskog govornog područja koji puše cigarete ili koriste IQOS uređaje.

**Kako se trenutno rešava.** Trenutni pristupi uključuju: oslanjanje na ličnu snagu volje bez ikakve podrške; korišćenje nikotinskih zamena (flasteri, žvake); savetovanje kod lekara; ili korišćenje generičkih aplikacija za prestanak pušenja koje su uglavnom na engleskom jeziku. **[Pretpostavka]**

**Slabosti postojećeg procesa.** Snaga volje bez strukture lako popušta u trenutku jake žudnje. Nikotinske zamene ne rešavaju psihološku i bihevioralnu komponentu. Generičke aplikacije ne razumeju lokalni kontekst (jezik, valutu, društvene navike) i obično ne nude pomoć u realnom trenutku žudnje. Većina rešenja tretira posrtanje kao poništavanje celokupnog napretka, što demotiviše korisnika i često vodi potpunom odustajanju.

**Posledice problema.** Neuspeli pokušaji prestanka imaju ozbiljne zdravstvene posledice (nastavak izloženosti štetnim materijama), finansijske posledice (kontinuirani trošak) i psihološke posledice (gubitak samopouzdanja i osećaj da prestanak nije moguć).

**Zašto je potreban softverski sistem.** Softverski sistem može da bude prisutan u svakom trenutku, da prati napredak automatski i precizno, da pruži intervenciju tačno kada je žudnja najjača i da kroz vizualizaciju napretka i pozitivno potkrepljenje održi motivaciju. Mobilna aplikacija je idealan medij jer je telefon uvek pri ruci, upravo u trenucima kada se javlja žudnja.

---

# 3. Predloženo rešenje

**Osnovni koncept.** Iskra je mobilna aplikacija koja kombinuje praćenje napretka u realnom vremenu sa interaktivnim alatima za savladavanje žudnje i sa nekažnjavajućim tretmanom posrtanja. Korisnik kroz uvodni proces opisuje svoje navike i motive, a aplikacija mu zatim pruža personalizovanu podršku tokom celog procesa prestanka.

**Vrednost za korisnika.** Korisnik dobija jasan, vizuelan dokaz svog napretka (vreme, novac, izbegnute cigarete), konkretan alat za trenutke krize i osećaj da posrtanje ne poništava trud, čime se održava motivacija i povećava verovatnoća trajnog prestanka.

**Granice sistema.** Sistem obuhvata: uvodni proces i kreiranje profila, svakodnevnu evidenciju, brojače napretka, tok za savladavanje žudnje, tok za posrtanje, sistem prekretnica, pregled napretka, bazu edukativnih članaka sa administracijom sadržaja, i obaveštenja. Sistem ima interfejs ka eksternim servisima (prodavnica aplikacija za naplatu, servis za slanje obaveštenja, analitika), ali sami ti servisi nisu deo internog modela.

**Šta sistem radi.** Sistem prikuplja korisničke podatke, čuva ih bezbedno, računa statistiku napretka, vodi korisnika kroz interaktivne tehnike, beleži događaje (check-in, žudnja, posrtanje), automatski otključava prekretnice, prikazuje edukativni sadržaj i šalje podsetnike.

**Šta sistem ne radi.** Sistem ne obrađuje samu finansijsku transakciju naplate (to rade prodavnice aplikacija; naplata je **van granica modelovanog sistema** prema odluci vlasnika). Sistem ne pruža medicinske savete niti zamenjuje lekara. Sistem ne radi offline — zahteva mrežnu vezu za rad.

**Glavne pretpostavke.**
- Korisnik poseduje pametni telefon sa pristupom internetu.
- Korisnik je voljan da iskreno unese podatke o navikama i da svakodnevno koristi aplikaciju.
- Edukativnim sadržajem upravlja administrator/urednik. **(Odluka vlasnika)**
- Korisnik kreira nalog registracijom. **(Odluka vlasnika)** **[Razlika u odnosu na kod: trenutna implementacija koristi anonimnu sesiju koja se kreira automatski na ekranu za unos imena.]**

---

# 4. Ciljevi sistema

**Glavni cilj.** Povećati verovatnoću da korisnik trajno prestane da puši, pružajući mu kontinuiranu, personalizovanu i pravovremenu podršku.

**Poslovni ciljevi.**
- Zadržati korisnike aktivnim kroz svakodnevnu upotrebu (check-in, podsetnici).
- Izgraditi bazu lojalnih korisnika koja može da podrži model pretplate (pretplata se obrađuje eksterno).
- Prikupljati anonimnu analitiku ponašanja radi unapređenja proizvoda.

**Korisnički ciljevi.**
- Videti jasan i motivišući napredak.
- Imati pouzdan alat za trenutke žudnje.
- Prebroditi posrtanje bez gubitka motivacije.
- Učiti o procesu prestanka kroz edukativni sadržaj.

**Tehnički ciljevi.**
- Pouzdano i bezbedno čuvanje korisničkih podataka uz izolaciju podataka po korisniku.
- Tačno računanje statistike u realnom vremenu.
- Stabilna isporuka zakazanih obaveštenja.

**Kriterijumi uspeha.**
- Udeo korisnika koji ostaju aktivni nakon 7 i 30 dana (retencija).
- Udeo korisnika koji uspešno savladaju žudnju kroz alat (odnos „izdržanih" prema započetim porivima).
- Prosečna dužina niza čistih dana.
- Broj otključanih i podeljenih prekretnica.

---

# 5. Ciljna grupa korisnika

### Grupa A — Pušač koji želi da prestane (primarni korisnik)
- **Opis:** Odrasla osoba sa srpskog govornog područja koja puši cigarete ili koristi IQOS i donela je odluku da prestane.
- **Potrebe:** Struktura, podrška u trenutku žudnje, vidljiv napredak.
- **Problemi:** Zavisnost, intenzivne žudnje, prethodni neuspesi.
- **Tehničko znanje:** Osnovno do srednje; svakodnevni korisnik pametnog telefona. **[Pretpostavka]**
- **Motivacija:** Zdravlje, ušteda novca, oslobađanje od zavisnosti.
- **Najvažnije funkcionalnosti:** „Imam poriv", brojači napretka, dnevni check-in, prekretnice.

### Grupa B — Osoba koja je nedavno prestala ili upravo prestaje
- **Opis:** Korisnik koji je prestao u skorije vreme i želi da održi i prati svoj napredak.
- **Potrebe:** Potvrda da napredak „ne nestaje", praćenje niza čistih dana.
- **Problemi:** Strah od recidiva, potreba za održavanjem motivacije.
- **Tehničko znanje:** Osnovno do srednje. **[Pretpostavka]**
- **Motivacija:** Učvršćivanje već postignutog napretka.
- **Najvažnije funkcionalnosti:** Brojači, prekretnice, pregled napretka.

### Grupa C — Osoba sklona posrtanju i recidivu
- **Opis:** Korisnik koji je više puta pokušavao i posrtao.
- **Potrebe:** Tretman bez osude, očuvanje ukupnog napretka.
- **Problemi:** Osećaj krivice koji vodi odustajanju.
- **Tehničko znanje:** Osnovno do srednje. **[Pretpostavka]**
- **Motivacija:** Verovanje da je prestanak ipak moguć.
- **Najvažnije funkcionalnosti:** Tok za posrtanje, trajni brojač čistih dana, analiza okidača.

### Grupa D — Administrator / urednik sadržaja **(Odluka vlasnika)**
- **Opis:** Interna uloga zadužena za kreiranje i održavanje edukativnih članaka u bazi znanja.
- **Potrebe:** Mogućnost dodavanja, izmene i objavljivanja članaka i njihovog označavanja kao premium.
- **Problemi:** Sadržaj mora biti ažuran i kvalitetan.
- **Tehničko znanje:** Srednje do napredno.
- **Motivacija:** Održavanje kvaliteta i relevantnosti edukativnog dela aplikacije.
- **Najvažnije funkcionalnosti:** Upravljanje člancima (administratorski interfejs).

> **[Razlika u odnosu na kod]** Administratorska uloga i interfejs za upravljanje sadržajem trenutno **ne postoje** u implementaciji (članci su statički definisani u kodu). Prema odluci vlasnika, oni su deo zamišljenog sistema i tako se i modeluju.

---

# 6. Akteri sistema

## Ljudski akteri

### Neregistrovani korisnik (Posetilac)
- **Opis:** Osoba koja je pokrenula aplikaciju, ali još nema nalog.
- **Odgovornosti:** Započinjanje registracije i uvodnog procesa.
- **Dozvole:** Pristup samo uvodnim ekranima i registraciji.
- **Ograničenja:** Nema pristup glavnim funkcijama dok ne kreira nalog i ne završi onboarding.
- **Funkcionalnosti:** Registracija, prijava, započinjanje onboarding-a.
- **Odnos sa drugima:** Postaje Registrovani korisnik nakon registracije.

### Registrovani korisnik
- **Opis:** Korisnik sa kreiranim nalogom koji je završio onboarding.
- **Odgovornosti:** Svakodnevno korišćenje aplikacije, evidencija check-in-a, korišćenje alata za žudnju, evidencija posrtanja.
- **Dozvole:** Pristup svim osnovnim funkcijama; pristup i izmena isključivo sopstvenih podataka.
- **Ograničenja:** Ne može pristupiti tuđim podacima; ne može pristupiti premium sadržaju bez aktivne pretplate; ne može upravljati edukativnim sadržajem.
- **Funkcionalnosti:** Check-in, brojači, poriv tok, slip tok, prekretnice, pregled napretka, izmena profila, čitanje besplatnih članaka.
- **Odnos sa drugima:** Specijalizuje se u Premium korisnika; komunicira sa eksternim sistemima (obaveštenja, analitika).

### Premium korisnik (ISKRA Club)
- **Opis:** Registrovani korisnik sa aktivnom pretplatom.
- **Odgovornosti:** Iste kao registrovani korisnik.
- **Dozvole:** Sve dozvole registrovanog korisnika + pristup premium edukativnom sadržaju.
- **Ograničenja:** Status zavisi od aktivne pretplate koja se obrađuje eksterno.
- **Funkcionalnosti:** Sve funkcije registrovanog korisnika + premium članci.
- **Odnos sa drugima:** Generalizacija: Premium korisnik je vrsta Registrovanog korisnika.

### Administrator / urednik sadržaja **(Odluka vlasnika)**
- **Opis:** Interni korisnik zadužen za edukativni sadržaj.
- **Odgovornosti:** Kreiranje, izmena, objavljivanje i povlačenje članaka; označavanje članaka kao premium.
- **Dozvole:** Pun pristup upravljanju sadržajem; bez pristupa ličnim podacima i statistici krajnjih korisnika (PR-18). *(Odluka vlasnika.)*
- **Ograničenja:** Ne menja korisničke profile niti njihovu statistiku.
- **Funkcionalnosti:** Administratorski interfejs za upravljanje člancima.
- **Odnos sa drugima:** Snabdeva sadržajem koji konzumiraju Registrovani i Premium korisnici.

## Eksterni sistemi (akteri-sistemi)

### Sistem za naplatu (prodavnica aplikacija + posrednik za pretplate)
- **Opis:** Eksterni servis koji obrađuje kupovinu i obnavljanje pretplate i potvrđuje status pretplate.
- **Odgovornost u odnosu na sistem:** Pruža informaciju o tome da li korisnik ima aktivnu pretplatu.
- **Granica:** Van granica modelovanog sistema (odluka vlasnika); sistem ima samo interfejs ka njemu.

### Sistem za obaveštenja (servis za slanje push poruka)
- **Opis:** Eksterni servis koji isporučuje push obaveštenja na uređaje korisnika.
- **Odgovornost:** Prima poruku i token uređaja, isporučuje obaveštenje.

### Analitički sistem
- **Opis:** Eksterni servis za beleženje događaja ponašanja korisnika.
- **Odgovornost:** Prima i čuva analitičke događaje.

### Vremenski okidač (scheduler)
- **Opis:** Sistemski mehanizam koji periodično pokreće slanje zakazanih obaveštenja.
- **Odgovornost:** Pokreće proces slanja jutarnjih i večernjih podsetnika.

---

# 7. Glavne funkcionalnosti

### F1 — Registracija i uvodni proces (Onboarding)
- **Svrha:** Kreiranje naloga i personalizovanog profila korisnika.
- **Akter:** Neregistrovani korisnik.
- **Preduslovi:** Aplikacija pokrenuta; korisnik nema završen onboarding.
- **Pokretač:** Korisnik bira „Počni".
- **Osnovni tok:** Korisnik kreira nalog, zatim prolazi kroz niz ekrana na kojima unosi ime, pol, vrstu proizvoda, broj cigareta dnevno i po paklici, cenu, lične razloge i strahove, okidače, vreme prestanka i datum, daje potpis posvećenosti i odobrava obaveštenja. Na kraju se profil trajno čuva i korisnik ulazi u glavni deo aplikacije.
- **Alternativni tokovi:** Ako korisnik bira „Prestajem odmah", preskače se izbor datuma (datum = trenutni momenat); ako bira „Uskoro" ili „Već sam prestao", bira datum u kalendaru.
- **Izuzeci:** Greška pri čuvanju profila (npr. prekid mreže) prikazuje poruku o grešci i ne dovršava proces.
- **Završni rezultat:** Kreiran profil sa oznakom da je onboarding završen.
- **Podaci:** Kreira/menja entitet Profil.
- **Povezanost:** Preduslov za sve ostale funkcionalnosti.

### F2 — Dnevni check-in
- **Svrha:** Evidentiranje da je dan protekao bez cigarete.
- **Akter:** Registrovani korisnik.
- **Preduslovi:** Završen onboarding.
- **Pokretač:** Korisnik dodiruje današnji dan u nedeljnom trekeru.
- **Osnovni tok:** Otvara se prozor za potvrdu; korisnik potvrđuje da je čist; sistem beleži check-in i ažurira niz čistih dana.
- **Alternativni tokovi:** Korisnik bira „Zapalio/la sam" → prelazak u tok za posrtanje (F6).
- **Izuzeci:** Greška upisa zbog mreže.
- **Završni rezultat:** Zabeležen čist dan; ažuriran niz.
- **Podaci:** Kreira/menja entitet Check-in.
- **Povezanost:** Utiče na brojače (F4) i prekretnice (F7).

### F3 — Pregled napretka u realnom vremenu
- **Svrha:** Prikaz vremena bez cigarete, ušteđenog novca i broja izbegnutih cigareta.
- **Akter:** Registrovani korisnik.
- **Preduslovi:** Postavljen datum prestanka.
- **Pokretač:** Otvaranje početnog ekrana ili detaljnih ekrana.
- **Osnovni tok:** Sistem na osnovu datuma prestanka i navika računa statistiku i osvežava je svake sekunde.
- **Alternativni tokovi:** Korisnik otvara detaljan ekran (vreme/novac/cigarete).
- **Izuzeci:** Nema datuma prestanka → statistika je nula.
- **Završni rezultat:** Prikazana ažurna statistika.
- **Podaci:** Čita Profil i Check-in; računa izvedeni objekat Statistika.
- **Povezanost:** Osnova za prekretnice (F7).

### F4 — Savladavanje žudnje (Poriv tok)
- **Svrha:** Pomoći korisniku da prebrodi trenutak žudnje bez paljenja cigarete.
- **Akter:** Registrovani korisnik.
- **Preduslovi:** Završen onboarding.
- **Pokretač:** Korisnik dodiruje „Imam poriv".
- **Osnovni tok:** Korisnik unosi jačinu žudnje (1–10) i okidač; žudnja se beleži; korisnik bira jedan od šest alata; prolazi kroz interaktivnu tehniku; po završetku se prikazuje ekran uspeha sa statistikom.
- **Alternativni tokovi:** Na bilo kom koraku korisnik može izabrati „Ipak sam zapalio/la" → tok za posrtanje (F6).
- **Izuzeci:** Greška upisa žudnje.
- **Završni rezultat:** Žudnja zabeležena sa ishodom (izdržano ili posrtanje).
- **Podaci:** Kreira/menja entitet Žudnja (Craving).
- **Povezanost:** Povezan sa F6 (posrtanje) i F7 (prekretnice za savladane porive).

### F5 — Evidencija i prevazilaženje posrtanja (Slip tok)
- **Svrha:** Zabeležiti posrtanje bez osude i pomoći korisniku da nastavi.
- **Akter:** Registrovani korisnik.
- **Preduslovi:** Završen onboarding.
- **Pokretač:** Korisnik bira „Zapalio/la sam" (sa početnog ekrana, check-in-a ili poriv toka).
- **Osnovni tok:** Posrtanje se beleži; prikazuje se da ukupno vreme ostaje očuvano; opciono korisnik bira okidač; prikazuje se podsećanje na lične razloge; korisnik nastavlja.
- **Alternativni tokovi:** Korisnik preskače analizu okidača i odmah nastavlja.
- **Izuzeci:** Greška upisa.
- **Završni rezultat:** Zabeleženo posrtanje; niz čistih dana resetovan; ukupno vreme očuvano.
- **Podaci:** Kreira entitet Posrtanje (Slip); menja Check-in.
- **Povezanost:** Resetuje niz (PR), utiče na F2 i F3.

### F6 — Sistem prekretnica (Milestone)
- **Svrha:** Nagraditi napredak otključavanjem prekretnica.
- **Akter:** Sistem (automatski), na osnovu akcija Registrovanog korisnika.
- **Preduslovi:** Postoji statistika napretka.
- **Pokretač:** Promena statistike (vreme, ušteda, broj savladanih poriva).
- **Osnovni tok:** Sistem upoređuje trenutnu statistiku sa definisanim pragovima; za svaku ispunjenu, dotad nezaključanu prekretnicu beleži otključavanje i šalje analitički događaj.
- **Alternativni tokovi:** Nema novih prekretnica → ništa se ne menja.
- **Izuzeci:** Greška upisa otključavanja.
- **Završni rezultat:** Prekretnica trajno otključana.
- **Podaci:** Kreira entitet Prekretnica (Milestone).
- **Povezanost:** Prikazuje se u F8 i F9; deli se u F10.

### F7 — Pregled napretka po kategorijama (Roadmap)
- **Svrha:** Prikaz svih prekretnica hronološki i po kategorijama.
- **Akter:** Registrovani korisnik.
- **Preduslovi:** Završen onboarding.
- **Pokretač:** Otvaranje pregleda napretka.
- **Osnovni tok:** Sistem prikazuje postignute, trenutnu i predstojeće prekretnice sa indikatorom napretka.
- **Završni rezultat:** Korisnik vidi celu mapu napretka.
- **Podaci:** Čita Prekretnice i Statistiku.
- **Povezanost:** Nadovezuje se na F6.

### F8 — Deljenje prekretnice / pobede
- **Svrha:** Omogućiti korisniku da podeli postignuće.
- **Akter:** Registrovani korisnik.
- **Preduslovi:** Otključana prekretnica ili dostupna statistika.
- **Pokretač:** Korisnik bira „Podeli".
- **Osnovni tok:** Sistem generiše sliku postignuća i otvara sistemski meni za deljenje.
- **Završni rezultat:** Postignuće podeljeno; prekretnica označena kao podeljena.
- **Podaci:** Menja Prekretnicu (oznaka podeljeno).
- **Povezanost:** Nadovezuje se na F6 i F3.

### F9 — Upravljanje profilom
- **Svrha:** Pregled i izmena ličnih podataka i navika.
- **Akter:** Registrovani korisnik.
- **Preduslovi:** Završen onboarding.
- **Pokretač:** Otvaranje profila.
- **Osnovni tok:** Korisnik menja ime/pol, datum prestanka ili navike; izmene se čuvaju; može se odjaviti.
- **Izuzeci:** Greška upisa.
- **Završni rezultat:** Ažuriran profil.
- **Podaci:** Menja Profil.
- **Povezanost:** Utiče na F3 i F6.

### F10 — Baza znanja (Saznaj) i čitanje članaka
- **Svrha:** Edukacija korisnika o procesu prestanka.
- **Akter:** Registrovani korisnik (čitanje), Premium korisnik (premium članci).
- **Preduslovi:** Postoje objavljeni članci.
- **Pokretač:** Otvaranje baze znanja.
- **Osnovni tok:** Korisnik pregleda kategorije i članke; otvara besplatan članak i čita ga.
- **Alternativni tokovi:** Korisnik pokušava da otvori premium članak bez pretplate → poziva se na pretplatu (eksterni tok).
- **Izuzeci:** Nema dostupnih članaka → prazno stanje.
- **Završni rezultat:** Korisnik pročitao članak.
- **Podaci:** Čita entitet Članak.
- **Povezanost:** Vezan za F11 (administracija) i status pretplate.

### F11 — Upravljanje edukativnim sadržajem **(Odluka vlasnika)**
- **Svrha:** Održavanje baze članaka.
- **Akter:** Administrator / urednik sadržaja.
- **Preduslovi:** Administrator je autentifikovan.
- **Pokretač:** Administrator otvara administratorski interfejs.
- **Osnovni tok:** Administrator kreira, menja, objavljuje ili povlači članak i postavlja oznaku premium.
- **Izuzeci:** Greška upisa; nedovoljne dozvole.
- **Završni rezultat:** Sadržaj baze znanja ažuriran.
- **Podaci:** Kreira/menja/briše entitet Članak.
- **Povezanost:** Snabdeva F10.

### F12 — Zakazana obaveštenja
- **Svrha:** Podsećanje i ohrabrivanje korisnika.
- **Akter:** Vremenski okidač + Sistem za obaveštenja.
- **Preduslovi:** Korisnik je odobrio obaveštenja i ima registrovan token.
- **Pokretač:** Vremenski okidač (jutro i veče).
- **Osnovni tok:** Sistem bira korisnike sa tokenom, računa njihov niz čistih dana, generiše personalizovanu (rodno osetljivu) poruku i šalje je putem eksternog servisa.
- **Alternativni tokovi:** Korisnik bez tokena se preskače.
- **Izuzeci:** Neuspeh pojedinačnog slanja ne prekida ostala slanja.
- **Završni rezultat:** Korisnici primili obaveštenje.
- **Podaci:** Čita Profil i Check-in.
- **Povezanost:** Podstiče F2.

---

# 8. Funkcionalni zahtevi

**FZ-01:** Kao neregistrovani korisnik, želim da kreiram nalog i unesem podatke o svojim navikama, kako bih dobio personalizovan profil i pristup aplikaciji.
- Prioritet: visok
- Kriterijum prihvatanja: nakon uspešne registracije i prolaska kroz uvodni proces, profil je trajno sačuvan i obeležen kao završen, a korisnik je preusmeren na početni ekran.
- Povezana funkcionalnost: F1
- Akter: Neregistrovani korisnik

**FZ-02:** Kao registrovani korisnik, želim da svakodnevno potvrdim da sam bio bez cigarete, kako bih održao svoj niz čistih dana.
- Prioritet: visok
- Kriterijum prihvatanja: potvrdom check-in-a kreira se zapis za tekući datum, niz se uvećava, a izmena je vidljiva na trekeru.
- Povezana funkcionalnost: F2
- Akter: Registrovani korisnik

**FZ-03:** Kao registrovani korisnik, želim da vidim koliko vremena, novca i cigareta sam uštedeo, kako bih ostao motivisan.
- Prioritet: visok
- Kriterijum prihvatanja: na početnom i detaljnim ekranima prikazuju se vreme, ušteđeni dinari i broj izbegnutih cigareta, izračunati iz datuma prestanka i navika, sa osvežavanjem u realnom vremenu.
- Povezana funkcionalnost: F3
- Akter: Registrovani korisnik

**FZ-04:** Kao registrovani korisnik, želim da pokrenem alat za savladavanje žudnje, kako bih prebrodio trenutak poriva bez paljenja cigarete.
- Prioritet: visok
- Kriterijum prihvatanja: nakon unosa jačine i okidača i izbora alata, korisnik prolazi kroz tehniku i dolazi do ekrana uspeha; žudnja je zabeležena.
- Povezana funkcionalnost: F4
- Akter: Registrovani korisnik

**FZ-05:** Kao registrovani korisnik, želim da zabeležim posrtanje bez gubitka ukupnog napretka, kako bih nastavio bez osećaja potpunog neuspeha.
- Prioritet: visok
- Kriterijum prihvatanja: zapisom posrtanja niz čistih dana se resetuje, ali ukupan broj čistih dana ostaje očuvan i jasno prikazan.
- Povezana funkcionalnost: F5
- Akter: Registrovani korisnik

**FZ-06:** Kao registrovani korisnik, želim da automatski otključavam prekretnice kada dostignem određene pragove, kako bih video opipljive nagrade za napredak.
- Prioritet: srednji
- Kriterijum prihvatanja: kada statistika pređe definisani prag, odgovarajuća prekretnica se beleži kao otključana i prikazuje korisniku.
- Povezana funkcionalnost: F6
- Akter: Registrovani korisnik (automatski sistem)

**FZ-07:** Kao registrovani korisnik, želim da podelim svoju prekretnicu, kako bih proslavio napredak i motivisao druge.
- Prioritet: nizak
- Kriterijum prihvatanja: izborom „Podeli" generiše se slika postignuća i otvara sistemski meni za deljenje; prekretnica se obeležava kao podeljena.
- Povezana funkcionalnost: F8
- Akter: Registrovani korisnik

**FZ-08:** Kao registrovani korisnik, želim da pregledam mapu svih prekretnica, kako bih razumeo šta sam postigao i šta sledi.
- Prioritet: srednji
- Kriterijum prihvatanja: prikazane su postignute, trenutna i predstojeće prekretnice sa indikatorom napretka.
- Povezana funkcionalnost: F7
- Akter: Registrovani korisnik

**FZ-09:** Kao registrovani korisnik, želim da izmenim svoje podatke (ime, pol, datum prestanka, navike), kako bi statistika bila tačna.
- Prioritet: srednji
- Kriterijum prihvatanja: izmene se čuvaju i odmah se odražavaju na prikaz statistike.
- Povezana funkcionalnost: F9
- Akter: Registrovani korisnik

**FZ-10:** Kao registrovani korisnik, želim da čitam edukativne članke, kako bih bolje razumeo proces prestanka.
- Prioritet: srednji
- Kriterijum prihvatanja: korisnik može da otvori i pročita besplatan članak; premium članak zahteva aktivnu pretplatu.
- Povezana funkcionalnost: F10
- Akter: Registrovani korisnik / Premium korisnik

**FZ-11:** Kao administrator, želim da kreiram i objavim edukativni članak, kako bi korisnici imali ažuran sadržaj.
- Prioritet: srednji
- Kriterijum prihvatanja: nakon kreiranja i objavljivanja, članak postaje vidljiv korisnicima u bazi znanja.
- Povezana funkcionalnost: F11
- Akter: Administrator
- **[Razlika u odnosu na kod: administratorski interfejs trenutno nije implementiran.]**

**FZ-12:** Kao registrovani korisnik, želim da primam dnevne podsetnike, kako bih bio podstaknut da nastavim i da uradim check-in.
- Prioritet: nizak
- Kriterijum prihvatanja: korisnik sa odobrenim obaveštenjima prima jutarnju i večernju poruku prilagođenu njegovom nizu čistih dana.
- Povezana funkcionalnost: F12
- Akter: Registrovani korisnik / Sistem za obaveštenja

**FZ-13:** Kao registrovani korisnik, želim da se prijavim na postojeći nalog, kako bih pristupio svojim podacima.
- Prioritet: visok
- Kriterijum prihvatanja: korisnik sa nalogom može da se prijavi i pristupi svom profilu i statistici.
- Povezana funkcionalnost: F1 (proširenje)
- Akter: Registrovani korisnik
- **[Razlika u odnosu na kod: tok prijave postojećeg naloga trenutno nije implementiran; postoji samo automatska anonimna sesija.]**

---

# 9. Nefunkcionalni zahtevi

**NFZ-01 — Performanse.** Početni ekran sa brojačima treba da se učita i prikaže ažurnu statistiku u roku od najviše 2 sekunde pri normalnoj mrežnoj vezi (4G ili Wi-Fi). *Razlog:* brz prikaz napretka održava motivaciju i osećaj responsivnosti. *Merljivo:* vreme od otvaranja do prikaza ≤ 2 s u 95% slučajeva.

**NFZ-02 — Performanse (realno vreme).** Brojači napretka treba da se osvežavaju jednom u sekundi bez vidljivog zastoja interfejsa. *Razlog:* utisak „živog" napretka. *Merljivo:* interval osvežavanja = 1 s; bez ispuštanja kadrova pri normalnom radu.

**NFZ-03 — Bezbednost / izolacija podataka.** Svaki korisnik sme da pristupi i menja isključivo sopstvene podatke. *Razlog:* zaštita privatnosti. *Merljivo:* svaki pokušaj pristupa tuđim podacima mora biti odbijen na nivou baze (pravila pristupa po korisniku).

**NFZ-04 — Privatnost ličnih podataka.** Lični podaci (razlozi, potpis, navike) moraju se čuvati bezbedno i ne smeju biti dostupni drugim korisnicima ni administratoru sadržaja. *Razlog:* osetljivost podataka. *Merljivo:* administrator nema pristup tabelama ličnih podataka krajnjih korisnika.

**NFZ-05 — Pouzdanost isporuke obaveštenja.** Neuspeh slanja obaveštenja jednom korisniku ne sme prekinuti slanje ostalima. *Razlog:* masovno slanje mora biti otporno na pojedinačne greške. *Merljivo:* proces slanja koristi nezavisnu obradu po korisniku i nastavlja i nakon pojedinačnog neuspeha.

**NFZ-06 — Dostupnost.** Sistem treba da bude dostupan najmanje 99,5% vremena na mesečnom nivou. *Razlog:* korisnici se oslanjaju na alat u kriznim trenucima, posebno u toku žudnje. *Merljivo:* mesečni uptime ≥ 99,5%.

**NFZ-07 — Upotrebljivost (lokalizacija).** Sav korisnički tekst mora biti na srpskom jeziku, neformalnog tona, sa rodno osetljivim oblicima zavisno od pola korisnika. *Razlog:* prilagođenost ciljnoj grupi. *Merljivo:* nijedan korisnički vidljiv tekst nije na stranom jeziku; rodni oblici se biraju prema polju pol.

**NFZ-08 — Responsivnost / kompatibilnost.** Aplikacija mora ispravno raditi na iOS i Android uređajima i prilagođavati se različitim veličinama ekrana uz poštovanje bezbednih zona. *Razlog:* dvostruka platforma i raznolikost uređaja. *Merljivo:* ispravan prikaz na referentnim uređajima obe platforme.

**NFZ-09 — Skalabilnost.** Sistem treba da podrži rast do najmanje 50.000 aktivnih korisnika bez izmene arhitekture. *Razlog:* očekivani rast korisničke baze. *Merljivo:* backend (BaaS) skalira automatski; sistem zadržava performanse (NFZ-01) pri 50.000 korisnika; nema fiksnih ograničenja u kodu.

**NFZ-10 — Konzistentnost stanja.** Za jedan dan može postojati najviše jedan zapis check-in-a po korisniku. *Razlog:* sprečavanje dvostrukog brojanja. *Merljivo:* jedinstvenost para (korisnik, datum).

**NFZ-11 — Održavanje.** Sadržaj baze znanja mora biti izmenjiv bez izmene koda aplikacije. *Razlog:* lako ažuriranje članaka. *Merljivo:* dodavanje/izmena članka kroz administratorski interfejs, bez novog izdanja aplikacije. **(Posledica odluke vlasnika o CMS-u.)**

**NFZ-12 — Privatnost (GDPR usklađenost).** Korisnik mora pri registraciji dati eksplicitnu saglasnost za obradu podataka i mora imati mogućnost da zatraži izvoz i trajno brisanje svojih podataka. *Razlog:* zakonska obaveza i poverenje korisnika. *Merljivo:* postoji ekran saglasnosti pri registraciji; zahtev za brisanje uklanja sve lične podatke korisnika u roku od najviše 30 dana.

**NFZ-13 — Bezbednost autentifikacije.** Lozinke se nikada ne čuvaju niti prenose u čistom obliku; čuvaju se isključivo heširane na strani servisa za autentifikaciju, a sva komunikacija ide preko šifrovane veze (HTTPS/TLS). *Razlog:* zaštita naloga i podataka. *Merljivo:* nijedna lozinka nije vidljiva u bazi ili logovima u čitljivom obliku; svi pozivi koriste TLS.

---

# 10. Poslovna pravila

**PR-01.** Pristup glavnim funkcijama aplikacije ima samo registrovani korisnik koji je završio onboarding. *(Odluka vlasnika: obavezna registracija.)*

**PR-02.** Korisnik može da pristupa i menja isključivo sopstvene podatke (profil, check-in, žudnje, posrtanja, prekretnice).

**PR-03.** Niz uzastopnih čistih dana („streak") resetuje se **isključivo** kada korisnik eksplicitno zabeleži posrtanje (slip). Propušten dan bez check-in-a sam po sebi ne resetuje niz. *(Odluka vlasnika.)*

**PR-04.** Ukupan broj čistih dana („totalDaysClean") nikada se ne resetuje, čak ni pri posrtanju.

**PR-05.** Za jedan kalendarski dan može postojati najviše jedan check-in po korisniku (jedinstven par korisnik–datum).

**PR-06.** Jačina žudnje pri unosu mora biti ceo broj u opsegu od 1 do 10.

**PR-07.** Prekretnica se otključava automatski kada statistika korisnika dostigne definisani prag (broj dana, ušteđeni iznos ili broj savladanih poriva) i svaka prekretnica se može otključati najviše jednom po korisniku (jedinstven par korisnik–ključ prekretnice).

**PR-08.** Pol korisnika mora imati jednu od dozvoljenih vrednosti: muško, žensko ili drugo; pol određuje rodno osetljive tekstove.

**PR-09.** Vrsta proizvoda mora biti jedna od: cigarete ili IQOS.

**PR-10.** Vreme prestanka mora biti jedna od vrednosti: odmah, uskoro ili već prestao. Ako je vrednost „odmah", datum prestanka se postavlja na trenutni momenat; inače korisnik bira datum (u prošlosti ili budućnosti, zavisno od izbora).

**PR-11.** Premium edukativni sadržaj dostupan je samo korisniku sa aktivnom pretplatom; status pretplate potvrđuje eksterni sistem za naplatu.

**PR-12.** Edukativnim člancima može upravljati (kreirati, menjati, objavljivati, povlačiti) isključivo administrator/urednik sadržaja. *(Odluka vlasnika.)*

**PR-13.** Zakazano obaveštenje se šalje samo korisnicima koji su završili onboarding i imaju registrovan token uređaja.

**PR-14.** Ishod žudnje može biti „izdržano" ili „posrtanje"; ako korisnik tokom poriv toka izabere da je ipak zapalio, žudnja se povezuje sa tokom posrtanja.

**PR-15.** Godišnji trošak pušenja računa se po formuli: (broj cigareta dnevno ÷ broj cigareta po paklici) × cena paklice × 365.

**PR-16.** Check-in za dan ima status `cist` ili `posrtanje`; dan bez ikakve evidencije nema zapis i ne računa se ni kao čist ni kao posrtanje.

**PR-17.** Pri registraciji se postojeći anonimni nalog (ako postoji) uvezuje na unetu e-poštu, čime se svi prethodno uneti podaci zadržavaju.

**PR-18.** Administrator ima pristup isključivo upravljanju člancima i nema pristup ličnim podacima niti statistici pojedinačnih korisnika.

**PR-19.** Zakazana obaveštenja šalju se u 08:00 i 21:00 po lokalnoj vremenskoj zoni korisnika.

**PR-20.** Pri registraciji korisnik mora dati eksplicitnu saglasnost za obradu ličnih podataka; korisnik u svakom trenutku može zatražiti izvoz ili brisanje svojih podataka.

**PR-21.** Skup prekretnica je fiksan i sadrži 16 prekretnica (9 vremenskih, 4 finansijske i 3 za savladane porive).

---

# 11. Glavni korisnički scenariji

### UC-1: Registracija i uvodni proces
- **Primarni akter:** Neregistrovani korisnik
- **Sekundarni akteri:** —
- **Cilj:** Kreirati nalog i personalizovan profil.
- **Preduslovi:** Aplikacija pokrenuta; nema završenog onboarding-a.
- **Okidač:** Izbor „Počni".
- **Osnovni tok:**
  1. Korisnik kreira nalog (registracija).
  2. Unosi ime.
  3. Bira pol.
  4. Bira vrstu proizvoda.
  5. Unosi broj cigareta dnevno i po paklici.
  6. Unosi cenu paklice.
  7. Pregleda izračunati godišnji trošak.
  8. Bira lične razloge i upisuje slobodan tekst.
  9. Bira strahove i okidače.
  10. Bira vreme prestanka.
  11. (Ako nije „odmah") bira datum u kalendaru.
  12. Daje potpis posvećenosti.
  13. Odobrava obaveštenja.
  14. Sistem trajno čuva profil i otvara početni ekran.
- **Alternativni tokovi:**
  - 10a. Izbor „odmah": preskače se korak 11; datum = trenutni momenat.
- **Izuzeci:**
  - 14a. Greška mreže pri čuvanju → poruka o grešci, proces se ne dovršava.
- **Postuslovi:** Profil sačuvan, onboarding označen kao završen.

### UC-2: Dnevni check-in
- **Primarni akter:** Registrovani korisnik
- **Cilj:** Zabeležiti čist dan.
- **Preduslovi:** Završen onboarding.
- **Okidač:** Dodir današnjeg dana u trekeru.
- **Osnovni tok:**
  1. Sistem prikazuje prozor za potvrdu.
  2. Korisnik potvrđuje da je čist.
  3. Sistem beleži check-in za tekući datum.
  4. Sistem ažurira niz čistih dana.
- **Alternativni tokovi:**
  - 2a. Korisnik bira „Zapalio/la sam" → prelazak u UC-4 (posrtanje).
- **Izuzeci:** 3a. Greška upisa → poruka o grešci.
- **Postuslovi:** Zabeležen čist dan.

### UC-3: Savladavanje žudnje
- **Primarni akter:** Registrovani korisnik
- **Cilj:** Prebroditi žudnju bez paljenja.
- **Preduslovi:** Završen onboarding.
- **Okidač:** Izbor „Imam poriv".
- **Osnovni tok:**
  1. Korisnik unosi jačinu žudnje (1–10).
  2. Korisnik bira okidač.
  3. Sistem beleži žudnju.
  4. Korisnik bira jedan od šest alata.
  5. Korisnik prolazi kroz interaktivnu tehniku.
  6. Sistem prikazuje ekran uspeha i statistiku.
- **Alternativni tokovi:**
  - 4a/5a. Korisnik bira „Ipak sam zapalio/la" → UC-4 (posrtanje), ishod žudnje = posrtanje.
- **Izuzeci:** 3a. Greška upisa žudnje.
- **Postuslovi:** Žudnja zabeležena sa ishodom.

### UC-4: Evidencija posrtanja
- **Primarni akter:** Registrovani korisnik
- **Cilj:** Zabeležiti posrtanje i nastaviti bez gubitka napretka.
- **Preduslovi:** Završen onboarding.
- **Okidač:** Izbor „Zapalio/la sam".
- **Osnovni tok:**
  1. Sistem beleži posrtanje i označava dan.
  2. Sistem prikazuje da je ukupno vreme očuvano.
  3. (Opc.) Korisnik bira okidač posrtanja.
  4. Sistem prikazuje podsećanje na lične razloge i potpis.
  5. Korisnik nastavlja.
- **Alternativni tokovi:** 3a. Korisnik preskače analizu okidača.
- **Izuzeci:** 1a. Greška upisa.
- **Postuslovi:** Posrtanje zabeleženo; niz resetovan; ukupno vreme očuvano.

### UC-5: Pregled prekretnica i deljenje
- **Primarni akter:** Registrovani korisnik
- **Cilj:** Videti i podeliti postignuća.
- **Preduslovi:** Postoje otključane prekretnice.
- **Okidač:** Otvaranje tab-a prekretnica.
- **Osnovni tok:**
  1. Sistem prikazuje otključane i zaključane prekretnice.
  2. Korisnik bira „Podeli" na otključanoj prekretnici.
  3. Sistem generiše sliku i otvara meni za deljenje.
  4. Prekretnica se obeležava kao podeljena.
- **Alternativni tokovi:** —
- **Izuzeci:** 3a. Deljenje otkazano od strane korisnika.
- **Postuslovi:** Postignuće podeljeno.

### UC-6: Upravljanje sadržajem (administrator)
- **Primarni akter:** Administrator
- **Sekundarni akteri:** Registrovani/Premium korisnik (konzument)
- **Cilj:** Održati bazu članaka.
- **Preduslovi:** Administrator autentifikovan.
- **Okidač:** Otvaranje administratorskog interfejsa.
- **Osnovni tok:**
  1. Administrator kreira novi članak.
  2. Unosi sadržaj, kategoriju i oznaku premium.
  3. Objavljuje članak.
  4. Sistem čini članak vidljivim korisnicima.
- **Alternativni tokovi:** 1a. Izmena ili povlačenje postojećeg članka.
- **Izuzeci:** 3a. Nedovoljne dozvole; greška upisa.
- **Postuslovi:** Baza znanja ažurirana.
- **[Razlika u odnosu na kod: trenutno nije implementirano.]**

### UC-7: Zakazana obaveštenja
- **Primarni akter:** Vremenski okidač
- **Sekundarni akteri:** Sistem za obaveštenja, Registrovani korisnik
- **Cilj:** Poslati podsetnike.
- **Preduslovi:** Korisnici imaju registrovane tokene.
- **Okidač:** Jutarnji/večernji termin.
- **Osnovni tok:**
  1. Sistem bira korisnike sa tokenom i završenim onboarding-om.
  2. Računa niz čistih dana za svakog.
  3. Generiše personalizovanu poruku.
  4. Šalje poruku putem eksternog servisa.
- **Alternativni tokovi:** 1a. Korisnik bez tokena se preskače.
- **Izuzeci:** 4a. Neuspeh slanja jednom korisniku ne prekida ostala.
- **Postuslovi:** Obaveštenja isporučena.

---

# 12. Model podataka i ključni entiteti

### Profil (Profile)
- **Opis:** Centralni entitet — korisnik sa svim navikama i ličnim podacima.
- **Atributi:** identifikator (UUID, obavezno, jedinstveno); ime (tekst, opciono); pol (muško/žensko/drugo, opciono); proizvod (cigarete/iqos, podrazumevano cigarete); broj cigareta dnevno (ceo broj, podrazumevano 20); broj cigareta po paklici (ceo broj, podrazumevano 20); cena paklice u dinarima (ceo broj, podrazumevano 0); datum prestanka (datum/vreme, opciono); razlozi (lista teksta); slobodan tekst razloga (tekst, opciono); strahovi (lista teksta); okidači (lista teksta); vreme prestanka (odmah/uskoro/vec_prestao, opciono); onboarding završen (logički, podrazumevano netačno); premium status (logički, podrazumevano netačno); posvećenost (logički, podrazumevano netačno); potpis (tekst/base64, opciono); token uređaja (tekst, opciono); vreme kreiranja; vreme izmene.
- **Obavezno:** identifikator. **Opciono:** većina ostalih polja (popunjavaju se kroz onboarding).
- **Jedinstveno:** identifikator.
- **Veze:** 1—N ka Check-in, Žudnja, Posrtanje, Prekretnica.
- **Stanja:** nov (onboarding u toku) → aktivan (onboarding završen) → premium; ortogonalno: u nizu / posrnuo.
- **Ko upravlja:** kreira sistem pri registraciji; menja sam korisnik; briše korisnik (odjava/brisanje naloga).

### Check-in
- **Opis:** Dnevni status (čist dan ili posrtanje za taj dan).
- **Atributi:** identifikator (UUID, obavezno, jedinstveno); korisnik (referenca, obavezno); datum (datum, obavezno); status (`cist` / `posrtanje`, obavezno); vreme kreiranja.
- **Jedinstveno:** par (korisnik, datum).
- **Veze:** N—1 ka Profil.
- **Stanja:** `cist` / `posrtanje`.
- **Ko upravlja:** kreira korisnik kroz check-in (status `cist`) ili slip tok (status `posrtanje`).

> **Odluka:** Status check-in-a modeluje se eksplicitnim poljem `status` sa vrednostima `cist` / `posrtanje`, čime se otklanja ranija nedoslednost (u kodu se ponegde koristilo logičko polje „čist", a ponegde tekstualni status „slip"). Dan bez evidencije jednostavno nema zapis (PR-16). **[Razlika u odnosu na kod: trenutna shema koristi logičko polje `clean`; specifikacija propisuje polje `status`.]**

### Žudnja (Craving)
- **Opis:** Zabeležena epizoda žudnje i njen ishod.
- **Atributi:** identifikator (UUID, obavezno, jedinstveno); korisnik (referenca, obavezno); jačina (ceo broj 1–10, obavezno); okidač (tekst, opciono); upotrebljeni alat (jedan od šest, opciono); trajanje u sekundama (ceo broj, opciono); ishod (izdržano/posrtanje, opciono); vreme kreiranja.
- **Veze:** N—1 ka Profil.
- **Stanja:** započeta (bez ishoda) → izdržano / posrtanje.
- **Ko upravlja:** kreira korisnik na početku poriv toka; ishod ažurira sistem na kraju.

### Posrtanje (Slip)
- **Opis:** Zabeleženo posrtanje sa opcionim okidačem.
- **Atributi:** identifikator (UUID, obavezno, jedinstveno); korisnik (referenca, obavezno); okidač (tekst, opciono); beleška (tekst, opciono); vreme kreiranja.
- **Veze:** N—1 ka Profil.
- **Ko upravlja:** kreira korisnik kroz slip tok; okidač se može naknadno dopuniti.

### Prekretnica (Milestone)
- **Opis:** Trajni zapis otključanog postignuća korisnika.
- **Atributi:** identifikator (UUID, obavezno, jedinstveno); korisnik (referenca, obavezno); ključ (tekst, obavezno); kategorija (tekst, obavezno); vreme otključavanja; podeljeno (logički, podrazumevano netačno).
- **Jedinstveno:** par (korisnik, ključ).
- **Veze:** N—1 ka Profil; konceptualno N—1 ka Definiciji prekretnice.
- **Stanja:** zaključana → otključana → podeljena.
- **Ko upravlja:** kreira sistem automatski; oznaku „podeljeno" postavlja korisnik.

### Definicija prekretnice (MilestoneDef) — referentni (statički) entitet
- **Opis:** Definicija praga i teksta prekretnice (npr. „7 dana", „10.000 RSD", „10 savladanih poriva").
- **Atributi:** ključ; kategorija; prag (dani ili dinari ili broj savladanih poriva); naslov; tekst otključavanja.
- **Veze:** 1—N ka Prekretnica.
- **Ko upravlja:** definisano u sistemu (nije korisnički podatak).

### Članak (Article) **(Odluka vlasnika — uvodi se u model)**
- **Opis:** Edukativni članak u bazi znanja.
- **Atributi:** identifikator; naslov; kategorija; sadržaj; oznaka premium (logički); status (nacrt/objavljen); vreme kreiranja/izmene.
- **Veze:** N—1 ka Administrator (autor/urednik).
- **Stanja:** nacrt → objavljen → povučen.
- **Ko upravlja:** administrator (kreira/menja/briše); korisnici samo čitaju.
- **[Razlika u odnosu na kod: entitet trenutno ne postoji u bazi; članci su statički u kodu.]**

---

# 13. Predlog klasnog modela

> Klasni model uvodi i ponašanje (metode), a ne samo podatke. Servisne klase apstrahuju logiku koja u implementaciji živi u hook-ovima i lib modulima.

### Klasa `Korisnik` (Profile)
- **Odgovornost:** Predstavlja korisnika i njegove navike; pruža izvedene proračune.
- **Privatni atributi:** id, ime, pol, proizvod, brojCigaretaDnevno, brojCigaretaPoPaklici, cenaPaklice, datumPrestanka, razlozi, strahovi, okidaci, vremePrestanka, onboardingZavrsen, premium, posvecenost, potpis, tokenUredjaja.
- **Javne metode:** `zavrsiOnboarding()`, `izmeniNavike(...)`, `izracunajGodisnjiTrosak()`, `postaviDatumPrestanka(...)`, `odjaviSe()`.
- **Veze:** 1—* `CheckIn`, 1—* `Zudnja`, 1—* `Posrtanje`, 1—* `Prekretnica` (kompozicija: brisanjem korisnika brišu se i njegovi zapisi).
- **Nasleđivanje:** baz­na klasa za `PremiumKorisnik` (generalizacija).

### Klasa `PremiumKorisnik` (nasleđuje `Korisnik`)
- **Odgovornost:** Korisnik sa aktivnom pretplatom i pristupom premium sadržaju.
- **Javne metode:** `imaPristupPremiumu(): bool`.
- **Veze:** specijalizacija klase `Korisnik`.

### Klasa `CheckIn`
- **Odgovornost:** Beleži dnevni status.
- **Privatni atributi:** id, datum, cist.
- **Javne metode:** `oznaciCist()`, `oznaciPosrtanje()`.
- **Veze:** *—1 `Korisnik`.

### Klasa `Zudnja` (Craving)
- **Odgovornost:** Predstavlja epizodu žudnje i upravlja njenim ishodom.
- **Privatni atributi:** id, jacina, okidac, upotrebljeniAlat, trajanje, ishod.
- **Javne metode:** `zapocni()`, `izaberiAlat(alat)`, `zavrsi(ishod)`.
- **Veze:** *—1 `Korisnik`; 0..1 `AlatZaZudnju`.

### Klasa `AlatZaZudnju` (apstraktna)
- **Odgovornost:** Zajednički interfejs interaktivnih tehnika.
- **Javne metode:** `pokreni()`, `zavrsi()`.
- **Nasleđivanje:** specijalizacije `Disanje`, `Voda`, `Razlozi`, `Setnja`, `Posmatranje`, `Igra`.

### Klasa `Posrtanje` (Slip)
- **Odgovornost:** Beleži posrtanje i okidač.
- **Privatni atributi:** id, okidac, beleska.
- **Javne metode:** `zabeleziOkidac(okidac)`.
- **Veze:** *—1 `Korisnik`.

### Klasa `Prekretnica` (Milestone)
- **Odgovornost:** Predstavlja otključano postignuće.
- **Privatni atributi:** id, kljuc, kategorija, vremeOtkljucavanja, podeljeno.
- **Javne metode:** `otkljucaj()`, `podeli()`.
- **Veze:** *—1 `Korisnik`; *—1 `DefinicijaPrekretnice`.

### Klasa `DefinicijaPrekretnice` (MilestoneDef)
- **Odgovornost:** Čuva prag i opis prekretnice; proverava ispunjenost.
- **Privatni atributi:** kljuc, kategorija, pragDana, pragDinara, pragPoriva, naslov, tekst.
- **Javne metode:** `ispunjenaSa(statistika): bool`.
- **Veze:** 1—* `Prekretnica` (agregacija).

### Klasa `Statistika` (QuitStats — izvedeni objekat)
- **Odgovornost:** Računa i drži trenutnu statistiku napretka.
- **Privatni atributi:** nizCistihDana, ukupnoCistihDana, ukupnoSekundi, izbegnuteCigarete, ustedjenoDinara.
- **Javne metode:** `preracunaj(korisnik, checkInovi)`.
- **Veze:** izvedeno iz `Korisnik` + `CheckIn` (zavisnost, ne skladišti se).

### Klasa `Clanak` (Article)
- **Odgovornost:** Edukativni sadržaj.
- **Privatni atributi:** id, naslov, kategorija, sadrzaj, premium, status.
- **Javne metode:** `objavi()`, `povuci()`, `oznaciPremium()`.
- **Veze:** *—1 `Administrator`.

### Klasa `Administrator`
- **Odgovornost:** Upravlja sadržajem baze znanja.
- **Javne metode:** `kreirajClanak(...)`, `izmeniClanak(...)`, `objaviClanak(...)`, `obrisiClanak(...)`.
- **Veze:** 1—* `Clanak`.

### Servisne klase
- **`ServisNaplate`** (eksterni): `konfigurisi()`, `kupi(paket)`, `obnovi()`, `proveriPretplatu(): bool` — menja `Korisnik.premium`.
- **`ServisObavestenja`**: `posaljiObavestenje(korisnik, naslov, telo)`, `zakaziDnevna()` — koristi `Korisnik`.
- **`ServisAnalitike`**: `zabelezi(dogadjaj, parametri)` — posmatra sve aktere.

---

# 14. Životni ciklus ključnog entiteta

**Izabrani entitet: Žudnja (Craving).** Izabran je zbog jasnih, zatvorenih tranzicija sa odlukom, što ga čini idealnim za dijagram stanja. (Alternativa je `Korisnik`, čiji je životni ciklus opisan na kraju sekcije.)

- **Početno stanje:** *Započeta* (kreirana unosom jačine i okidača).
- **Sva stanja:** Započeta, Alat izabran, Izdržano (završno), Posrtanje (završno).
- **Događaji i tranzicije:**

```
[*]                 --[korisnik unese jačinu i okidač]-->            Započeta
Započeta            --[izabran alat]-->                              Alat izabran
Alat izabran        --[tehnika uspešno završena]-->                  Izdržano
Alat izabran        --[korisnik bira „Ipak sam zapalio/la"]-->       Posrtanje
Započeta            --[korisnik bira „Ipak sam zapalio/la"]-->       Posrtanje
Izdržano            --[*]-->                                         (završno)
Posrtanje           --[*]-->                                         (završno)
```

- **Uslovi tranzicija:** prelazak u „Izdržano" zahteva završetak tehnike; prelazak u „Posrtanje" zahteva eksplicitnu korisnikovu akciju.
- **Akcije pri tranzicijama:** pri ulasku u „Započeta" upisuje se zapis žudnje; pri ulasku u „Izdržano"/„Posrtanje" ažurira se ishod; „Posrtanje" pokreće slip tok.
- **Završna stanja:** Izdržano, Posrtanje.
- **Nedozvoljene tranzicije:** iz završnog stanja se ne može vratiti u „Započeta" ili „Alat izabran"; ne može se direktno iz „Izdržano" u „Posrtanje".

**Alternativa — životni ciklus entiteta Korisnik:**
```
[*]        --[registracija]-->                       Nov (onboarding u toku)
Nov        --[onboarding završen]-->                 Aktivan
Aktivan    --[pretplata potvrđena]-->                Premium
Premium    --[pretplata istekla]-->                  Aktivan
Aktivan    --[zabeleženo posrtanje]-->               Aktivan (niz resetovan, ukupno očuvano)
```

---

# 15. Priprema za dijagram slučajeva upotrebe

**Granica sistema:** „Iskra" obuhvata sve funkcije aplikacije i njenog backend-a; van granice su: sistem za naplatu, sistem za obaveštenja, analitika i vremenski okidač.

**Akteri:**
- Ljudski: Neregistrovani korisnik, Registrovani korisnik, Premium korisnik (specijalizacija Registrovanog), Administrator.
- Sistemi: Sistem za naplatu, Sistem za obaveštenja, Analitički sistem, Vremenski okidač.

**Slučajevi upotrebe i veze sa akterima:**
- Neregistrovani korisnik: *Registracija/Onboarding (UC-1)*, *Prijava (UC-1 proširenje)*.
- Registrovani korisnik: *Dnevni check-in (UC-2)*, *Savladaj žudnju (UC-3)*, *Zabeleži posrtanje (UC-4)*, *Pregledaj/Podeli prekretnice (UC-5)*, *Pregledaj napredak*, *Upravljaj profilom*, *Čitaj članak*.
- Premium korisnik: *Čitaj premium članak* (nasleđuje sve od Registrovanog).
- Administrator: *Upravljaj sadržajem (UC-6)*.
- Vremenski okidač + Sistem za obaveštenja: *Zakazana obaveštenja (UC-7)*.
- Sistem za naplatu: učestvuje u *Provera pretplate*.
- Analitički sistem: prima događaje iz većine slučajeva upotrebe.

**Include odnosi:**
- *Onboarding* «include» *Kreiraj nalog*.
- *Savladaj žudnju* «include» *Zabeleži žudnju*.
- *Zakazana obaveštenja* «include» *Izračunaj niz čistih dana*.

**Extend odnosi:**
- *Savladaj žudnju* «extend» *Zabeleži posrtanje* (kada korisnik ipak zapali).
- *Dnevni check-in* «extend» *Zabeleži posrtanje*.
- *Čitaj članak* «extend» *Provera pretplate* (za premium članke).

**Generalizacije aktera:** Premium korisnik je specijalizacija Registrovanog korisnika.

**Pokrivenost zahteva:** Svi funkcionalni zahtevi FZ-01…FZ-13 imaju odgovarajući slučaj upotrebe (vidi matricu u sekciji 25).

---

# 16. Priprema za dijagram aktivnosti

**Izabrani proces: Savladavanje žudnje (Poriv tok)** — najvažniji poslovni proces sistema sa jasnim odlukama i granањem.

- **Početni čvor:** korisnik oseća žudnju i bira „Imam poriv".
- **Aktivnosti:** unos jačine → unos okidača → zapis žudnje → izbor alata → izvođenje tehnike.
- **Odluke:**
  - „Da li su uneti i jačina i okidač?" — ako ne, dugme za nastavak je onemogućeno (povratni tok na unos).
  - „Ishod tehnike?" — grananje na „izdržano" ili „posrtanje".
- **Paralelne aktivnosti:** tokom izvođenja tehnike, paralelno teku tajmer i animacija/vođenje korisnika.
- **Povratni tokovi:** ako jačina/okidač nisu uneti, vraća se na unos; nakon „izdržano", moguć povratak na početni ekran.
- **Greške:** neuspeh zapisa žudnje → prikaz greške, mogućnost ponovnog pokušaja.
- **Završni čvor:** ekran uspeha (izdržano) ili ulazak u tok posrtanja (posrtanje).
- **Swimlane učesnici:** Korisnik (UI) | Aplikaciona logika | Baza podataka.

---

# 17. Priprema za dijagram sekvenci

**Izabrana funkcionalnost: Dnevni check-in (UC-2)** — kratka, ali reprezentativna interakcija kroz sve slojeve, sa alternativnim i neuspešnim tokom.

**Učesnici:** Korisnik → Korisnički interfejs (ekran Home / prozor potvrde) → Aplikaciona logika (hook za podatke i statistiku) → Integracioni sloj (Supabase klijent) → Baza podataka → Analitički sistem.

**Hronološki redosled poruka (osnovni tok):**
1. Korisnik → UI: dodir današnjeg dana u trekeru.
2. UI → UI: prikaz prozora za potvrdu.
3. Korisnik → UI: potvrda „Čist sam".
4. UI → Aplikaciona logika: zahtev za upis check-in-a (korisnik, datum, čist=tačno).
5. Aplikaciona logika → Integracioni sloj: upsert check-in-a.
6. Integracioni sloj → Baza: INSERT/UPDATE (uz proveru jedinstvenosti korisnik–datum i pravila pristupa).
7. Baza → Integracioni sloj: potvrda.
8. Aplikaciona logika → Analitički sistem: zabeleži događaj „daily_checkin".
9. Aplikaciona logika → UI: ažuriran niz i treker.
10. UI → Korisnik: vizuelna potvrda.

**Alternativni tok:** u koraku 3 korisnik bira „Zapalio/la sam" → poziva se sekvenca posrtanja (UC-4).

**Neuspešni tok:** u koraku 6 baza vrati grešku (npr. prekid mreže) → Integracioni sloj → Aplikaciona logika → UI prikazuje poruku o grešci; check-in nije zabeležen.

---

# 18. Korisnički interfejs i navigacija

**Informaciona arhitektura.** Aplikacija ima četiri glavna odeljka dostupna preko donje navigacije: Početna, Milestoni (prekretnice), Saznaj (baza znanja) i Profil. Iz ovih odeljaka se otvaraju detaljni ekrani (vreme/novac/cigarete), tok žudnje, tok posrtanja, pregled napretka i izmena podataka.

**Glavna navigacija.** Donja traka sa četiri stavke, prisutna na svim glavnim ekranima. Iznad nje, na početnom ekranu, fiksno je dugme „Imam poriv" koje je uvek dostupno.

**Glavni ekran (Početna/Home).** Sadrži pozdrav i avatar, oznaku niza dana, nedeljni treker za check-in, brojač vremena u realnom vremenu, kartice za ušteđeni novac i izbegnute cigarete, sažetak napretka po kategorijama, kartice za citat dana i edukaciju, i dugme „Imam poriv".

**Najvažniji funkcionalni ekran.** Ekran za izbor alata u toku žudnje (sa tajmerom i mrežom šest alata), kao srce vrednosti aplikacije.

**Forme.** Forme se pojavljuju u onboarding-u (ime, brojevi, cena, izbor opcija), pri izmeni profila (ime/pol, datum, navike) i pri unosu žudnje (klizač jačine, izbor okidača).

**Liste.** Liste prekretnica, članaka, okidača i razloga.

**Detaljni prikazi.** Detaljni ekrani za vreme, novac i cigarete; pojedinačni članak (planiran).

**Potvrde.** Prozor za potvrdu check-in-a; potvrda pri deljenju.

**Poruke o greškama.** Pri neuspehu mrežnih operacija prikazuje se jasna poruka sa pozivom na proveru veze.

**Prazna stanja.** Nov korisnik bez podataka; baza znanja bez članaka.

**Administratorski interfejs.** Poseban interfejs (van mobilnog korisničkog dela) za upravljanje člancima — kreiranje, izmena, objavljivanje. **[Planirano — odluka vlasnika; trenutno ne postoji.]**

**Put od početnog ekrana do ključne funkcionalnosti.** Sa početnog ekrana korisnik jednim dodirom dugmeta „Imam poriv" ulazi u tok žudnje, unosi jačinu i okidač, bira alat i prolazi kroz tehniku — dakle, ključna funkcionalnost je udaljena svega nekoliko dodira od glavnog ekrana.

---

# 19. Predlog wireframe-a

### Ekran 1 — Početna (Home) — glavni ekran
- **Svrha:** Prikaz napretka i brz pristup ključnim akcijama.
- **Elementi (od vrha ka dnu):** pozdrav + avatar; oznaka niza dana; nedeljni treker; brojač vremena (dani/sati/minuti/sekunde); kartice „ušteđeno" i „izbegnute cigarete"; sažetak napretka po kategorijama; kartica citata; kartica edukacije; dugme „Imam poriv"; donja navigacija.
- **Primarna akcija:** „Imam poriv". **Sekundarne akcije:** dnevni check-in, otvaranje detalja, navigacija.
- **Podaci:** ime, niz dana, statistika u realnom vremenu, napredak po kategorijama.
- **Validacije:** —
- **Stanja ekrana:** učitavanje; normalno; stanje posrtanja (vizuelno drugačije); prazno/novo (statistika nula).
- **Ponašanje na mobilnom uređaju:** poštovanje bezbednih zona; treker i kartice se prilagođavaju širini ekrana.

```
+--------------------------------------------------+
|  Zdravo, Marija            [avatar]   🔥 12 dana  |
+--------------------------------------------------+
|  Pon Uto Sre Čet Pet Sub Ned                     |
|   ✓   ✓   ✓   ✓   ?   ·   ·                       |
+--------------------------------------------------+
|        12 : 04 : 33 : 09                          |
|       DANA  SATI  MIN  SEK                        |
+--------------------------------------------------+
|  [ 3.480 RSD ušteđeno ]   [ 240 cigareta ]       |
+--------------------------------------------------+
|  Moj napredak  ▸  (6 kategorija, trake)           |
+--------------------------------------------------+
|  „Citat dana"        |   Saznaj nešto novo        |
+--------------------------------------------------+
|              [  IMAM PORIV  ]                     |
+--------------------------------------------------+
|  Početna   Milestoni   Saznaj   Profil           |
+--------------------------------------------------+
```

### Ekran 2 — Izbor alata u toku žudnje — funkcionalni ekran
- **Svrha:** Voditi korisnika kroz savladavanje žudnje.
- **Elementi (od vrha ka dnu):** dugme za zatvaranje; oznaka „PORIV"; nivo/jačina; kružni tajmer; mreža šest alata; traka napretka; link „Ipak sam zapalio/la".
- **Primarna akcija:** izbor alata. **Sekundarna akcija:** prijava posrtanja.
- **Podaci:** jačina žudnje, preostalo vreme.
- **Validacije:** dugmad alata aktivna; link za posrtanje uvek dostupan.
- **Stanja ekrana:** aktivno odbrojavanje; nakon izbora alata prelazak na ekran tehnike.
- **Ponašanje na mobilnom uređaju:** velike dodirne mete; centriran tajmer.

```
+--------------------------------------------------+
|  ✕                 PORIV — Nivo 7                 |
+--------------------------------------------------+
|                 (  04:58  )                       |
|              kružni tajmer 5 min                  |
+--------------------------------------------------+
|  IZABERI ALAT                                     |
|  [ Dišem ]   [ Igram se ]   [ Razlozi ]          |
|  [ Voda  ]   [ Šetam    ]   [ Posmatram ]        |
+--------------------------------------------------+
|  ─────────────── napredak ──────────────         |
|         Ipak sam zapalio/la                       |
+--------------------------------------------------+
```

---

# 20. Arhitektura sistema

**Izabrana arhitektura: klijent–server zasnovan na BaaS platformi (Backend-as-a-Service), sa slojevito organizovanim mobilnim klijentom.**

**Zašto je izabrana.** Ova arhitektura najvernije odgovara stvarnoj prirodi sistema (mobilni klijent koji direktno komunicira sa upravljanim backend-om), a istovremeno je dovoljno jednostavna da se na nju jasno mapiraju svi zahtevi, akteri i tokovi. Izbegava nepotrebnu složenost (npr. mikroservise) koja nije opravdana obimom sistema.

**Slojevi / moduli i odgovornosti:**
- **Prezentacioni sloj (mobilni klijent — UI):** ekrani i komponente; prikaz podataka i prikupljanje korisničkog unosa.
- **Aplikaciona logika (klijent):** proračuni statistike, logika prekretnica, vođenje tokova (žudnja, posrtanje), upravljanje privremenim stanjem onboarding-a.
- **Integracioni sloj (klijent):** komunikacija sa backend-om i eksternim servisima (baza, obaveštenja, analitika, naplata).
- **Backend (BaaS):** baza podataka sa pravilima pristupa po korisniku, autentifikacija, real-time osvežavanje, serverske funkcije za obaveštenja.
- **Eksterni servisi:** naplata, slanje obaveštenja, analitika, vremenski okidač.

**Način komunikacije.** Klijent komunicira sa backend-om preko SDK poziva (čitanje/upis) i real-time kanala za promene profila. Serverske funkcije komuniciraju sa eksternim servisom za obaveštenja preko HTTP poziva.

**Tok podataka.** Korisnički unos → aplikaciona logika → integracioni sloj → baza; promene u bazi → real-time kanal → osvežen prikaz. Statistika se izvodi na klijentu iz profila i check-in-ova.

**Pristup bazi.** Isključivo kroz integracioni sloj; pravila pristupa na nivou baze obezbeđuju da korisnik vidi samo svoje podatke.

**Autentifikacija.** Kroz servis za autentifikaciju BaaS platforme; sesija se čuva lokalno i automatski osvežava.

**Autorizacija.** Pravila na nivou reda u bazi (red pripada korisniku); administrator ima zaseban skup dozvola za sadržaj.

**Eksterne integracije.** Naplata (eksterno), obaveštenja (serverske funkcije + push servis), analitika.

**Obrada grešaka.** Mrežne i serverske greške se hvataju u integracionom/aplikacionom sloju i prikazuju korisniku jasnim porukama; masovna slanja su otporna na pojedinačne neuspehe.

**Prednosti.** Brz razvoj, automatsko skaliranje backend-a, ugrađena bezbednost po korisniku, real-time osvežavanje.

**Ograničenja.** Zavisnost od eksternog BaaS provajdera; poslovna logika pretežno na klijentu; zahteva mrežnu vezu (nema offline rada).

**Tekstualni blok-dijagram:**
```
┌───────────────────────────── MOBILNI KLIJENT ─────────────────────────────┐
│  Prezentacioni sloj (ekrani, komponente)                                  │
│        │                                                                  │
│  Aplikaciona logika (statistika, prekretnice, tokovi, onboarding stanje)  │
│        │                                                                  │
│  Integracioni sloj (SDK pozivi, real-time, eksterni servisi)              │
└────────┬───────────────────────────────┬───────────────────┬────────────┘
         │                               │                   │
         ▼                               ▼                   ▼
┌──────────────────┐        ┌────────────────────┐   ┌──────────────────┐
│  BaaS BACKEND     │        │ Servis obaveštenja │   │ Servis naplate   │
│  - Baza (RLS)     │        │ (push + scheduler) │   │ (pretplata)      │
│  - Autentifikacija│        └────────────────────┘   └──────────────────┘
│  - Real-time      │                 ▲
│  - Serverske fn.  │─────────────────┘
└──────────────────┘
         │
         ▼
┌──────────────────┐
│ Analitički sistem │
└──────────────────┘
```

---

# 21. Eksterni sistemi

### Sistem za naplatu (pretplata)
- **Svrha:** Obrada kupovine/obnavljanja pretplate i potvrda statusa.
- **Ulazni podaci:** izbor paketa pretplate.
- **Izlazni podaci:** informacija o aktivnom pravu (entitlement) korisnika.
- **Komunikacija:** preko biblioteke posrednika i prodavnica aplikacija.
- **Autentifikacija:** ključ aplikacije + nalog prodavnice.
- **Greške:** otkazana kupovina, greška u transakciji.
- **Ako nije dostupan:** korisnik ostaje na besplatnom nivou; pristup aplikaciji nije uskraćen. *(Naplata je van granica modelovanog sistema.)*

### Sistem za obaveštenja (push servis)
- **Svrha:** Isporuka push obaveštenja na uređaje.
- **Ulazni podaci:** token uređaja, naslov, telo poruke.
- **Izlazni podaci:** status isporuke.
- **Komunikacija:** HTTP poziv iz serverske funkcije.
- **Autentifikacija:** preko tokena uređaja.
- **Greške:** nevažeći token, nedostupnost servisa.
- **Ako nije dostupan:** podsetnik se ne isporučuje; ostatak sistema radi normalno.

### Analitički sistem
- **Svrha:** Beleženje događaja ponašanja.
- **Ulazni podaci:** naziv događaja i parametri.
- **Izlazni podaci:** —
- **Komunikacija:** SDK/HTTP.
- **Autentifikacija:** projektni token.
- **Greške:** gubitak događaja.
- **Ako nije dostupan:** aplikacija nastavlja rad; analitika se gubi.

### Vremenski okidač (scheduler)
- **Svrha:** Periodično pokretanje slanja obaveštenja.
- **Ulazni podaci:** termin (jutro/veče).
- **Izlazni podaci:** pokretanje procesa slanja.
- **Komunikacija:** interno (cron).
- **Ako nije dostupan:** zakazana obaveštenja se ne pokreću.

---

# 22. Bezbednost i privatnost

**Autentifikacija.** Korisnici se autentifikuju kroz servis BaaS platforme (registracija i prijava — odluka vlasnika). Sesija se čuva lokalno i automatski osvežava. **[Razlika u odnosu na kod: trenutno se koristi anonimna sesija bez registracije.]**

**Autorizacija.** Pristup podacima je ograničen pravilima na nivou reda u bazi: korisnik može da čita i menja samo redove koji mu pripadaju. Administrator ima poseban skup dozvola ograničen na sadržaj.

**Korisničke uloge.** Neregistrovani korisnik, Registrovani korisnik, Premium korisnik, Administrator.

**Zaštita lozinki.** Registracija se obavlja e-poštom i lozinkom (uz magic link kao alternativu). Lozinke se čuvaju i obrađuju isključivo na strani servisa za autentifikaciju, u heširanom obliku; aplikacija ih nikada ne čuva niti prenosi u čistom obliku (NFZ-13).

**Validacija unosa.** Vrednosti sa ograničenim skupom (pol, proizvod, vreme prestanka, alat, ishod) proveravaju se i na nivou baze; jačina žudnje mora biti 1–10; jedinstvenost check-in-a po danu.

**Zaštita komunikacije.** Sva komunikacija sa backend-om i eksternim servisima odvija se preko šifrovane veze (HTTPS/TLS).

**Zaštita ličnih podataka.** Osetljivi podaci (lični razlozi, potpis, navike) vezani su za nalog korisnika i nedostupni drugim korisnicima i administratoru sadržaja. Korisnik pri registraciji daje eksplicitnu saglasnost i može zatražiti izvoz ili trajno brisanje svojih podataka (GDPR usklađenost, NFZ-12, PR-20).

**Logovanje aktivnosti.** Analitički događaji beleže ponašanje (npr. završen check-in, savladan poriv) bez osetljivog ličnog sadržaja (bez razloga, potpisa i beleški).

**Upravljanje sesijama.** Sesija se čuva lokalno, automatski osvežava i poništava pri odjavi.

**Osnovni rizici i mere.** Rizik neovlašćenog pristupa tuđim podacima — ublažen pravilima pristupa po korisniku; rizik gubitka naloga — ublažen registracijom i mogućnošću prijave; rizik curenja osetljivih podataka — ublažen izolacijom i šifrovanom komunikacijom.

---

# 23. Pretpostavke, ograničenja i rizici

**Poslovne pretpostavke.**
- Korisnici su motivisani da svakodnevno koriste aplikaciju.
- Edukativni sadržaj se redovno održava (administrator).
- Naplata se obavlja eksterno i nije deo internog modela.

**Tehničke pretpostavke.**
- Korisnik ima uređaj sa internetom (sistem radi online).
- BaaS platforma obezbeđuje autentifikaciju, bazu, real-time i serverske funkcije.

**Ograničenja projekta.**
- Sistem ne radi offline.
- Administratorski interfejs i tok prijave postojećeg naloga su definisani kao deo zamišljenog sistema, ali još nisu implementirani.
- Naplata je van granica modelovanog sistema.

**Zavisnosti.**
- Eksterni servisi: naplata, obaveštenja, analitika.
- Vremenski okidač za zakazana obaveštenja.

**Rizici.**
- Zavisnost od eksternog BaaS provajdera (rizik nedostupnosti).
- Anonimni nalozi (u trenutnoj implementaciji) mogu dovesti do gubitka podataka pri promeni uređaja.
- Nepostojanje administratorskog interfejsa otežava ažuriranje sadržaja.

**Mere ublažavanja.**
- Uvođenje registracije/prijave radi oporavka naloga (u skladu sa odlukom vlasnika).
- Otpornost masovnih slanja na pojedinačne greške.
- Jasne poruke o greškama i ponovni pokušaji pri mrežnim problemima.

---

# 24. Planirani razvoj sistema

**Inkrement 1 — Osnovni tok i napredak.**
- Cilj: omogućiti registraciju, onboarding i praćenje napretka.
- Funkcionalnosti: F1, F2, F3, F9.
- Zavisnosti: backend (baza, autentifikacija).
- Rezultat: korisnik može da kreira nalog i prati napredak.
- Validacija: kreiran profil; brojači tačni; check-in radi.

**Inkrement 2 — Intervencija u žudnji i posrtanje.**
- Cilj: pružiti alate za krizne trenutke i nekažnjavajući tretman posrtanja.
- Funkcionalnosti: F4, F5.
- Zavisnosti: Inkrement 1.
- Rezultat: korisnik može da savlada žudnju i zabeleži posrtanje.
- Validacija: žudnja sa ishodom; niz se resetuje samo pri posrtanju; ukupno vreme očuvano.

**Inkrement 3 — Prekretnice i pregled napretka.**
- Cilj: gejmifikacija i motivacija.
- Funkcionalnosti: F6, F7, F8.
- Zavisnosti: Inkrement 1.
- Rezultat: automatsko otključavanje i deljenje prekretnica.
- Validacija: prekretnica se otključava na prag; deljenje generiše sliku.

**Inkrement 4 — Baza znanja i administracija sadržaja.**
- Cilj: edukacija korisnika i upravljanje sadržajem.
- Funkcionalnosti: F10, F11.
- Zavisnosti: entitet Članak; administratorski interfejs.
- Rezultat: korisnici čitaju članke; administrator upravlja sadržajem.
- Validacija: objavljen članak vidljiv korisnicima; premium gating radi.

**Inkrement 5 — Obaveštenja i analitika.**
- Cilj: zadržavanje korisnika i merenje ponašanja.
- Funkcionalnosti: F12, analitika.
- Zavisnosti: tokeni uređaja; serverske funkcije; scheduler.
- Rezultat: zakazani podsetnici i praćenje događaja.
- Validacija: obaveštenja isporučena; događaji zabeleženi.

---

# 25. Povezanost zahteva i modela (matrica sledljivosti)

| Zahtev | Akter | Slučaj upotrebe | Aktivnost | Sekvenca | Klase | Stanje | UI ekran |
|--------|-------|-----------------|-----------|----------|-------|--------|----------|
| FZ-01 | Neregistrovani korisnik | UC-1 | Onboarding | Onboarding (završetak) | Korisnik | Korisnik: Nov→Aktivan | Onboarding ekrani |
| FZ-02 | Registrovani korisnik | UC-2 | (check-in deo) | Check-in (sek.17) | CheckIn, Korisnik | CheckIn: čist | Home / prozor potvrde |
| FZ-03 | Registrovani korisnik | (Pregled napretka) | — | — | Statistika, Korisnik | — | Home / detalji |
| FZ-04 | Registrovani korisnik | UC-3 | Poriv tok (sek.16) | — | Zudnja, AlatZaZudnju | Zudnja: Započeta→Izdržano | Poriv ekrani |
| FZ-05 | Registrovani korisnik | UC-4 | — | — | Posrtanje, CheckIn | Zudnja→Posrtanje | Slip ekrani |
| FZ-06 | Sistem/Registrovani | UC-5 | — | — | Prekretnica, DefinicijaPrekretnice | Prekretnica: zaključana→otključana | Milestoni |
| FZ-07 | Registrovani korisnik | UC-5 | — | — | Prekretnica | Prekretnica: otključana→podeljena | Milestoni / detalji |
| FZ-08 | Registrovani korisnik | (Pregled napretka) | — | — | Prekretnica, Statistika | — | Roadmap |
| FZ-09 | Registrovani korisnik | (Upravljanje profilom) | — | — | Korisnik | — | Profil / Podešavanja |
| FZ-10 | Registrovani/Premium | UC (Čitaj članak) | — | — | Clanak, PremiumKorisnik | Clanak: objavljen | Saznaj |
| FZ-11 | Administrator | UC-6 | — | — | Administrator, Clanak | Clanak: nacrt→objavljen | Admin interfejs |
| FZ-12 | Registrovani / Sistem obaveštenja | UC-7 | Slanje obaveštenja | — | ServisObavestenja, Korisnik | — | (sistemsko) |
| FZ-13 | Registrovani korisnik | UC-1 (proširenje) | — | — | Korisnik | Korisnik: Nov→Aktivan | Prijava |

---

# 26. Otvorena pitanja

Sva ranije otvorena pitanja su razrešena i ugrađena u specifikaciju (vidi uvodnu napomenu, tačke 8–14, i poslovna pravila PR-16 do PR-21). Donesene odluke:

| # | Pitanje | Donesena odluka | Gde je ugrađeno |
|---|---------|-----------------|------------------|
| 1 | Model statusa check-in-a | Posebno polje `status` (`cist` / `posrtanje`); dan bez evidencije nema zapis | Sek. 12 (Check-in), PR-16 |
| 2 | Metod registracije/prijave | E-pošta + lozinka (uz magic link kao alternativu); lozinka heširana na strani servisa | Sek. 22, NFZ-13 |
| 3 | Sudbina anonimnih naloga | Migracija (uvezivanje) anonimnog naloga na e-poštu pri registraciji, uz čuvanje podataka | PR-17 |
| 4 | Ciljne vrednosti NFZ-a | Učitavanje ≤ 2 s (95%), uptime ≥ 99,5%, do 50.000 korisnika, osvežavanje 1 s | NFZ-01, 02, 06, 09 |
| 5 | Vremenska zona obaveštenja | Lokalna zona korisnika (08:00 i 21:00 lokalno) | PR-19 |
| 6 | Politika ličnih podataka | GDPR usklađenost: saglasnost pri registraciji, izvoz i brisanje na zahtev | NFZ-12, PR-20 |
| 7 | Opseg dozvola administratora | Samo sadržaj (članci); bez pristupa ličnim podacima i statistici korisnika | PR-18, NFZ-04 |
| 8 | Broj i lista prekretnica | Fiksno 16 (9 vremenskih, 4 finansijske, 3 za savladane porive) | PR-21 |

Trenutno nema preostalih nerešenih pitanja koja blokiraju izradu modela i dijagrama. Eventualna buduća pitanja (npr. precizan vizuelni dizajn administratorskog interfejsa ili konkretan tekst svih članaka) spadaju u fazu detaljnog projektovanja, a ne u ovu specifikaciju.

---

# 27. Konačan sažetak sistema

1. Iskra je mobilna aplikacija na srpskom jeziku za pomoć pri prestanku pušenja, dostupna na iOS i Android uređajima.
2. Namenjena je pušačima koji žele da prestanu, posebno onima koji su ranije pokušavali i posrtali.
3. Sistem rešava tri ključna problema: zavisnost, nagle žudnje i osećaj neuspeha pri posrtanju.
4. Korisnik kroz registraciju i detaljan onboarding kreira personalizovan profil sa navikama i ličnim motivima.
5. Aplikacija u realnom vremenu prikazuje vreme bez cigarete, ušteđeni novac i broj izbegnutih cigareta.
6. Centralna funkcionalnost „Imam poriv" vodi korisnika kroz jedan od šest interaktivnih alata za savladavanje žudnje.
7. Posrtanje se beleži bez osude; niz čistih dana resetuje samo eksplicitno posrtanje, dok ukupno vreme ostaje trajno očuvano.
8. Sistem prekretnica automatski nagrađuje napredak i omogućava deljenje postignuća.
9. Baza znanja sadrži edukativne članke kojima upravlja administrator/urednik sadržaja.
10. Zakazana, personalizovana i rodno osetljiva obaveštenja podstiču korisnika na svakodnevnu upotrebu.
11. Glavni akteri su Neregistrovani korisnik, Registrovani korisnik, Premium korisnik i Administrator, uz eksterne sisteme (naplata, obaveštenja, analitika, vremenski okidač).
12. Ključni entiteti su Profil, Check-in, Žudnja, Posrtanje, Prekretnica i Članak.
13. Naplata pretplate je van granica modelovanog sistema i tretira se kao eksterni servis.
14. Zvanična arhitektura je klijent–server zasnovan na BaaS platformi sa slojevito organizovanim klijentom; sistem radi online.
15. Bezbednost se zasniva na autentifikaciji, autorizaciji po korisniku (pravila na nivou reda) i izolaciji ličnih podataka.

---

## Napomena o usklađenosti dokumenta sa stvarnom implementacijom

Tri odluke vlasnika svesno odstupaju od trenutnog stanja koda i u dokumentu su dosledno označene oznakom **[Razlika u odnosu na kod]**:
1. **Obavezna registracija** umesto trenutne automatske anonimne sesije.
2. **Administrator i baza članaka kao entitet** umesto trenutnih statičkih članaka u kodu.
3. **Naplata van granica sistema**, dok je u kodu integracija sa servisom naplate prisutna (iako trenutno privremeno isključena).

Ova odstupanja su namerno zadržana jer specifikacija opisuje *zamišljeni sistem* prema odlukama vlasnika, a ne nužno trenutno stanje implementacije.
