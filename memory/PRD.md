# PAUSE — PRD / stato lavori

App di micro-learning a storie (Expo + FastAPI + MongoDB). Lingua utente: **italiano** (rispondere sempre in italiano).
Utente molto attento all'estetica premium. Mai colori fluo/chiassosi. Non ricreare lo stile icone senza necessità.

---
## ✅ FATTO (recente)
- **Colori categoria differenziati** (ULTIMA richiesta utente — FATTO, da far confermare).
  - Problema: colori troppo simili; Animali più sul marrone; Storia ed Economia troppo simili.
  - Soluzione applicata in DUE sorgenti (devono restare allineate):
    1. `frontend/src/theme.ts` → `categoryTilePalette.accents` (glow/bordo tessere Esplora + home-controls + category-grid).
    2. `backend/seed_data.py` → `CATEGORIES[].color` (accenti/glow/tag/label/fallback line-icon; NON l'icona 3D baked).
  - Palette nuova (identica nei due file):
    corpo-umano #FF4D6D, animali #B5753A (marrone), storia #E2A12B (ambra), economia #F7CE12 (oro),
    natura #35C85A, geografia #0FB893, cultura #0DAEC6, scienza #2BA6F2, tecnologia #4F7DFF,
    spazio #9B6BFF, arte #D45CF0, psicologia #FF5CA0, all #EAF7FF (curiosita #9B6BFF).
  - Nota: l'icona 3D (reference-3d-v6) è "baked", il colore cambia solo glow/accenti/tag → coerente con "mantieni colore con l'icona".
  - Su restart backend i colori si propagano a categorie e storie (server.py ~368). Verificato via GET /api/categories. Smoke screenshot Esplora OK. **Da far confermare esteticamente all'utente.**
- Fix titolo troncato schermata finale "Continua con" (`frontend/src/components/reader-ending.tsx`): rimosso numberOfLines. Screenshot-only.
- Ordine categorie in scala cromatica (GET /api/categories): corpo-umano, animali, storia, economia, natura, geografia, cultura, scienza, tecnologia, spazio, arte, psicologia. Agent-tested.
- Rinomina sezione impostazioni: i18n `appearance` IT "Colore app" / EN "App colour". ("Colore app" già implementato).
- Capitoli snelliti: `fit_chapters.py` — 0 capitoli IT/EN sopra 500 caratteri. NON rilanciare salvo cambio soglia.
- Mockup 3 stili icone 3D generati (`gen_icon_styles.py` → `backend/category_art/style-tests/*.jpg`: vetro, obsidiana, ologramma). Utente ha scelto **ologramma** (stile-3).

---
## ⏳ IN ATTESA DELL'UTENTE / BLOCCHI
- **BUDGET chiave Universal esaurito** (RateLimitError). Blocca: generazione icone ologramma + riduzione volti copertine. NON tentare batch LLM finché l'utente non conferma ricarica. Dopo ricarica: generare UNA sola categoria pilota, verificare budget, poi batch controllati.
- Conferma estetica dei nuovi colori categoria.

---
## 📋 TASK RIMANENTI (ordine di priorità concordato con l'utente)

### ✅ 1. Collezione V1 (FATTO — giugno 2026)
- GET /api/user/{id}/collection; schermata `app/collection.tsx`; voce Profilo 'Collezione'; carta 'Aggiunta alla tua Collezione' a fine prima lettura (reader-ending). Componente `src/components/collection-card.tsx`. Testato (iteration_2).
#### (specifica originale)
Obiettivo: Collezione di storie con senso di appagamento. NON copia Pokédex, **niente rarità/valuta/livelli/punti**.
- Accesso da **Profilo** (voce "Collezione"), NON una nuova tab.
- Aggregazione per argomento + colori di categoria.
- Carta sbloccata quando `story.id ∈ UserState.completed_story_ids` (NO nuovo schema Mongo).
- Carte bloccate = superfici atmosferiche scure, bordo categoria attenuato, indicatore simbolico di scoperta (stile PAUSE premium, originale).
- Momento premiante a fine storia (prima completazione autentica): "Aggiunta alla tua Collezione" + preview carta + CTA per aprire la Collezione.
Dati/endpoint già disponibili:
- `backend/server.py`: `UserState.completed_story_ids`; `POST /api/user/complete` (~1218); `/api/user/{id}/stats` (già conta lette/totali per categoria); `/api/user/{id}/history`; stories + preview.
- `StoryPreview`: id, category_id, category_name, category_icon, category_color, title, cover, reading time.
Frontend da toccare:
- `frontend/app/deep-dive/[id].tsx`: `api.complete(userId,id,...)` (~419), completion ref (~94), render finale (~577).
- `frontend/src/components/reader-ending.tsx` (`ReaderEndingBackdrop`, `ReaderEnding`).
- `frontend/app/(tabs)/profile.tsx`: aggiungere voce Collezione.
- Nuova schermata Collezione (es. `frontend/app/collection.tsx` o dentro profile): conteggio lette/totali, sezioni per categoria col colore, carte sbloccate (cover+titolo), carte bloccate.
- Sistema traguardi esistente (`use-reading-milestones` AsyncStorage) riutilizzabile per evitare premio duplicato.
VERIFICA: leggere test_result.md → smoke screenshot → testing_agent sul flusso completamento→premio→Profilo→Collezione.

### ✅ 2. Invito guest (FATTO — giugno 2026)
- `src/guest-invite.ts`: card non bloccante a fine lettura per ospiti con ≥2 storie lette; 'Non ora' = pausa 7 giorni; 'Accedi' → /onboarding. Nessun codice auth toccato.
#### (specifica originale)
- Invito gentile NON bloccante dopo uso guest di valore (i progressi guest non resistono al refresh).
- NON è richiesta persistenza guest, solo l'invito post-valore.
- ⚠️ Se tocca sessione/auth → chiamare PRIMA `integration_expert` (auth è sempre integrazione).

### ✅ 3. Temi icone (FATTO)
- Aggiunta sezione "Temi" in `app/(tabs)/profile.tsx` (tra "Colore app" e "Impostazioni"):
  tile "3D Realistico" attivo (anteprima CategoryArtMark spazio + spunta + "In uso") e
  "Ologramma" marcato "In arrivo" (gradiente olografico + sparkles, non premibile).
- i18n: themes_section/themes_row/themes_hint/theme_3d/theme_holo/theme_current/theme_coming (IT+EN).
- Vecchie famiglie archiviate NON mostrate. Lint OK, screenshot verificato. Da far confermare.

### ✅ 4. Punto 11 — Tipografia (FATTO)
- Aggiunto `lineHeight` agli stili hint/metadati che ne erano privi, per più respiro:
  `home-story-card.tsx` panelHint; `reader-intro.tsx` introEyebrow+hintText;
  `reader-meta.tsx` tagText+metaText+inlineText; `app/(tabs)/bookmarks.tsx` subtitle+metaText.
- Lint OK. Screenshot-only (ritocchi minori). Da far confermare.

### ✅ 5. Accessibilità lettore (FATTO — giugno 2026)
- `src/reader-prefs.ts` (s/m/l/xl = 0.9/1/1.12/1.25), Profilo → Impostazioni 'Testo di lettura' con anteprima; applicato in reader-section.tsx.
#### (specifica originale)
- Impostazione dimensione font nel lettore + preview tema dedicata. Letto `frontend/src/components/reader-section.tsx`. Verificare convenzioni tema/preferenze/persistenza prima.

### ⬜ 6. Icone 3D Ologramma (DECISO, bloccato solo da budget LLM)
Regola: ogni categoria conserva il PROPRIO colore identitario; tema PAUSE guida solo atmosfera UI. Mai fluo. Vecchie famiglie MAI cancellate (archiviate in Object Storage + manifest).
Script pronti e resumable:
- `backend/gen_category_holograms.py` (13 icone, fondo nero+vignette come reference-3d-v6, upload pause/category/holo-v1/, import-report.json, salta già fatte).
- `backend/publish_holograms.py` (archivia vecchio manifest, riscrive category_art_manifest.json→holo-v1, aggiorna DB. Idempotente).
Passi dopo ricarica budget:
  1. `cd backend && python gen_category_holograms.py` (rilanciabile)
  2. `cd backend && python publish_holograms.py`
  3. `frontend/src/components/category-artwork.tsx`: `ART_VERSION = "holo-v1"` (ora "reference-3d-v6")
  4. `src/api.ts`: delivery reference-3d-v7 → holo-v1 (cache-bust)
  5. aggiungere "reference-3d-v6/" ai previous_prefixes di `backend/category_artwork.py`
  6. smoke test + testing_agent su rendering icone.
Frontend NON toccato: reference-3d-v6 resta attivo finché holo-v1 non esiste.

### ⬜ 7. Copertine con meno volti/persone AI (IN PAUSA ESPLICITA — "Ci pensiamo più in là")
- NON riprendere senza nuova richiesta. Script `backend/reduce_faces.py` (solo sintassi verificata).
- Audit su 493 cover: persone none260/prominent170/minor63; volti none335/clear108/partial50; ~177 segnalate. Bozza piano 64 replace scartata (editor troppo aggressivo, prompt reso prudente).
- Dopo ricarica: `python reduce_faces.py plan` poi `apply`. Backup in covers_backup_pre_nofaces/, restore <id> disponibile.

---
## 🗂️ BACKLOG (dalla critica a 28 punti)
- P1: Ricerca globale in Home/Esplora (ora solo in Salvati/Cronologia). Quiz/interazione fine storia (superato da Collezione). TTS/narrazione (`backend/optional_services.py`, TTS_ENABLED=false — non attivare senza richiesta). Offline per i salvati. Paywall Premium REALE: `frontend/app/premium.tsx` `activate()` è solo flag locale, "Ripristina acquisti" no-op, nessun checkout Stripe. ⚠️ NON iniziare Stripe/RevenueCat senza scelta utente + `integration_expert`.
- P2: "Non mi interessa/mostra meno" nel recommender. 2-3 alternative in "Continua con". Cartelle/tag segnalibri + stati vuoti. Accessibilità logo "PΛUSE" (accessibilityLabel="Pause"). Home "Le tue categorie" può apparire vuota con pochi interessi.
- Pulizia: `nextWrap.flexGrow` inutilizzato in `reader-ending.tsx` (non toccare senza richiesta).

---
## 🚫 DEAD-ENDS / DO-NOT-RETRY
1. Batch cover/icone con budget LLM esaurito → RateLimitError. Prima pilota singolo.
2. Scansione Object Storage alta concorrenza → 429. Usare batch piccoli + backoff.
3. Capitoli >500 char: già 0, non riverificare.
4. Push in Expo Go/preview: non validabile, serve deploy+build nativa. (Push SOSPESE su richiesta utente — non implementare ora).
5. Switch a famiglie icone archiviate: escluso dall'utente.
6. Nuova tab Collezione: escluso, usare Profilo.
7. Comandi shell con path `(tabs)` non quotati → syntax error. Quotare sempre.

---
## 🔑 VINCOLI
- NON modificare: metro.config.js; frontend/.env (EXPO_PACKAGER_PROXY_URL, EXPO_PACKAGER_HOSTNAME); URL/porte .env; backend/.env MONGO_URL.
- Backend su 0.0.0.0:8001, route con prefisso /api. Frontend: Expo Router, solo React Native, StyleSheet.create, colori da theme.ts.
- Immagini/asset: Emergent Object Storage (non Base64 in Mongo).
- `memory/test_credentials.md`: solo template, nessuna credenziale.
- Auth = sempre integrazione → `integration_expert` prima di scrivere codice auth.
- Prima di fermarsi per input utente: `sudo supervisorctl restart expo`.
- Produzione: pulsante Publish Emergent (non EAS CLI).

## Iterazione — Badge Home in dissolvenza incrociata
- `src/components/deck-badges.tsx`: al cambio card i 3 dati (Tipo · Categoria · Durata) fanno un crossfade vero (vecchio svanisce mentre il nuovo compare sopra, 180ms, lieve scorrimento verticale), senza vuoto tra i due; interrompibile a metà scorrendo veloce.
- Prefetch delle icone categoria delle card vicine (`neighbors`) così non compaiono in ritardo.
- `category-artwork.tsx` esporta `CATEGORY_ART_VERSION`.
