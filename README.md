# CGOS Plánovací kokpit 2027

Interný nástroj Cromwell a.s. na analýzu výkonu klientov skupiny CGOS a AZ Prima
a na prípravu cien pre rok 2027.

**Beží na:** https://cromwell-dashboard.github.io/CGOS-kokpit/
**Prístup:** len pre pozvané kontá (Supabase Auth). Neprihlásený návštevník nevidí žiadne dáta.

---

## Ako to je poskladané

| Vrstva | Kde | Poznámka |
|---|---|---|
| Stránka | GitHub Pages, tento repozitár | `index.html` je jeden súbor vrátane knižníc |
| Prihlásenie | Supabase Auth, projekt `drescher-cost-cockpit` | e-mail + heslo, len na pozvánku |
| Dáta | Postgres, schéma `cgos` | dataset, spoločný stav, história verzií |

**V repozitári nie sú a nikdy nesmú byť žiadne klientske dáta.** `index.html` je len program;
cenníky, objemy a marže sú v databáze za pravidlami RLS. Preto je `_data/` a `*.xlsx`
v `.gitignore` — pred commitom vždy skontroluj `git status`.

`config.js` obsahuje URL projektu a `anon` kľúč. Obe hodnoty sú verejné zámerne, sú to
identifikátory, nie tajomstvá. Kľúč `service_role` sem nikdy nepatrí.

---

## Prvé spustenie (raz)

1. **SQL** — v SQL editore projektu `drescher-cost-cockpit` spusti v poradí:
   - `sql/01_audit_public_rls.sql` — audit a utiahnutie pravidiel Dreschera.
     **Blokujúci krok:** kým politiky `public` povoľujú čítanie „každému prihlásenému",
     videl by ich aj nový CGOS užívateľ.
   - `sql/02_cgos_schema.sql` — schéma `cgos`, tabuľky, práva, RLS, publikovacie funkcie.
   - `sql/03_access_a_heartbeat.sql` — prístupy pre Petra a Michala + tabuľka `heartbeat`.
2. **Exposed schemas** — Project Settings → API → pridaj `cgos`.
   Bez toho appka dostane hlášku *schema must be one of…*.
3. **Užívatelia** — Authentication → Users → Invite user pre `michal.svec@cromwell.sk`
   (Peter je už užívateľom z Dreschera). Potom spusti časť A skriptu 03.
4. **config.js** — doplň `url` a `anonKey` z Project Settings → API.
5. **Pages** — Settings → Pages → Deploy from branch `main`, folder `/ (root)`.
6. **Prvé prihlásenie** — appka zistí, že databáza je prázdna, a ponúkne nahratie
   súboru `cgos_dataset.json` (je v priečinku `Analýza plánu 2027\_data` na OneDrive).

---

## Bežná práca

**Kto čo smie**

| | editor | viewer |
|---|---|---|
| Čítať, prepínať scenáre, exportovať | áno | áno |
| Meniť si vlastné nastavenia (draft v prehliadači) | áno | áno |
| Publikovať stav pre všetkých | áno | nie |
| Nahradiť dataset | áno | nie |

Rozpracované zmeny sú **súkromné** pre daný prehliadač, kým sa nestlačí **⇪ Publikovať**.
V hlavičke je vždy vidieť, kto a kedy publikoval naposledy, a či máš neuložené zmeny.
**↻ Spoločný stav** načíta poslednú publikovanú verziu a zahodí vlastný draft.

**Mesačná aktualizácia (nové mesiace z BP 2026 CRW)**

1. Otvor BP 2026 CRW v Exceli a ulož (aby zošit obsahoval prepočítané hodnoty vzorcov).
2. V kokpite: záložka **Import / Export → Vybrať BP 2026 CRW.xlsx**.
3. Skontroluj hlášku o počte klientov a zistených mesiacoch.
4. **⇪ Publikovať** — tým to uvidia ostatní.

**Nový dataset** (nové položky, noví klienti, opravené nákladové karty) sa nahráva
v záložke Import / Export → *Nahradiť dataset*. Predchádzajúca verzia zostáva v histórii.

---

## Správa ľudí

```sql
-- pridať (najprv Authentication → Users → Invite user)
insert into cgos.access (user_id, email, name, role)
select id, email, 'Meno Priezvisko', 'viewer' from auth.users where email = '...'
on conflict (user_id) do update set role = excluded.role;

-- zmeniť rolu
update cgos.access set role = 'editor' where email = '...';

-- odobrať prístup
delete from cgos.access where email = '...';
```

Samoregistrácia musí zostať vypnutá: Authentication → Sign In / Providers →
*Allow new users to sign up* = **off**.

---

## História a návrat späť

```sql
-- verzie spoločného stavu (drží sa posledných 20)
select id, updated_by, updated_at, is_current from cgos.app_state order by updated_at desc;

-- návrat na konkrétnu verziu
update cgos.app_state set is_current = false where is_current;
update cgos.app_state set is_current = true  where id = <ID>;

-- to isté pre dataset (drží sa posledných 10)
select id, source_file, note, updated_by, updated_at, is_current from cgos.dataset
order by updated_at desc;
```

---

## Údržba

- **`keepalive.yml`** — denne o 06:12 UTC prečíta `public.heartbeat`, aby sa free projekt
  Supabase nepozastavil po týždni nečinnosti. Ak workflow spadne, projekt je pravdepodobne
  pozastavený — obnoví sa jedným klikom v Supabase dashboarde.
- **Zálohy** — free plán ich nemá. Raz mesačne ulož stav cez **⬇ Uložiť stav (JSON)**
  do priečinka `Analýza plánu 2027` na OneDrive.
- **Lokálna verzia** — `CGOS Plánovací kokpit 2027.html` v tom istom priečinku funguje
  offline s vpečeným datasetom. Obe verzie sa stavajú z tej istej šablóny.

---

## Keď niečo nefunguje

| Príznak | Príčina |
|---|---|
| *Nástroj nie je nakonfigurovaný* | `config.js` nemá vyplnené `url` / `anonKey` |
| *schema must be one of…* | v Project Settings → API chýba `cgos` medzi Exposed schemas |
| *Toto konto nemá prístup* | chýba riadok v `cgos.access` |
| *Dataset ešte nie je nahraný* | databáza je prázdna, editor musí nahrať `cgos_dataset.json` |
| Stránka sa tvári staro po pushnutí | cache GitHub Pages, počkaj minútu a daj Ctrl+F5 |
| Nič sa nenačíta, chyby siete | projekt Supabase je pozastavený → Resume project v dashboarde |

Metodika, terminológia a zdroje výpočtov sú popísané v projektovom dokumente
`claude/cgos-analyza-planu-2027.md`.
