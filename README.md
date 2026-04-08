# 📄 Document Extractor - Chrome Extension

**Weboldal dokumentumait Excel-be egy kattintással!** 🚀

[![Chrome Version](https://img.shields.io/badge/Chrome-v1.0-green)](https://chrome.google.com)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Active-brightgreen)](https://github.com/GergelyPapa/adatKinyero)

---

## 🎯 Mit csinál?

A bővítmény automatikusan összegyűjt minden dokumentumot egy weboldalról és **egy kattintásra exportálja az Excel-be (CSV)**!

### Képességek:
- 📎 **Linkek keresése** - PDF, DOC, DOCX, XLS, PPT stb.
- 📝 **Szöveges dokumentumok** - Szerződések, számlák, szövegek
- 🖼️ **Képek gyűjtése** - Összes képfájl az oldalról
- 💾 **Excel Export** - CSV formátumban (Excel-kompatibilis)
- ⚙️ **Testreszabható** - Fájlnév, szűrés, oszlopok
- 🔒 **Privát** - Helyi feldolgozás, nincs szerver

---

## ⚡ Gyors Start

### 1. Telepítés (3 perc)

```bash
# 1. Chrome megnyitása
chrome://extensions/

# 2. Jobb felső sarok: "Developer mode" bekapcsolása
☑ Developer mode

# 3. "Load unpacked" kattintás
Load unpacked → ~/chrome-extension/ kiválasztása

# KÉSZ! ✅
```

### 2. Használat (30 másodperc)

1. 🌐 Weboldalra megy (pl. https://www.mbkandallo.hu)
2. 🧩 Chrome jobb felső sarok → Extension ikon → "Document Extractor"
3. 🔍 `[Dokumentumok Lekérése]` kattintás (1-3 mp várakozás)
4. 📥 `[Excel Export]` kattintás
5. 📊 CSV fájl letöltésre kerül
6. ✅ Dupla klikk a CSV-re → **Excel megnyílik!**

---

## 📁 Fájl Szerkezet

```
chrome-extension/
├── manifest.json       - Bővítmény konfiguráció (Chrome manifest v3)
├── popup.html         - Felhasználói felület (szép lila-fehér téma)
├── popup.js           - UI logika (gomb kezelés, export)
├── content.js         - Oldal DOM olvasása (linkek, szövegek, képek)
├── background.js      - Service Worker (háttér logika)
├── README.md          - Gyors útmutató
├── TELEPÍTÉS.md       - Részletes telepítési útmutató
└── images/            - Ikon fájlok (opcionális)
```

---

## 🎨 UI Design

A bővítmény egy modern, intuitív interfészt tartalmaz:

```
┌─────────────────────────────────┐
│  📄 Document Extractor          │
│  Weboldal dokumentumait Excel   │
│                                 │
│  🎯 Dokumentum Keresés          │
│  ☑ Linkek                       │
│  ☑ Szöveg                       │
│  ☑ Képek                        │
│                                 │
│  [🔍 Dokumentumok Lekérése]     │
│                                 │
│  ⚙️ Beállítások                 │
│  + Haladó beállítások           │
│                                 │
│  📊 Eredmény                    │
│  ✅ Talált dokumentumok: 42     │
│                                 │
│  [📥 Excel Export]  [🗑️ Törlés] │
└─────────────────────────────────┘
```

### Szín Séma:
- 💜 Lila (#667eea) - Elsődleges szín
- 🟣 Sötét Lila (#764ba2) - Gradient
- ⚪ Fehér (#ffffff) - Háttér
- 🔴 Piros (#f44336) - Törlés gomb
- 🟢 Zöld (#4caf50) - Export gomb

---

## ⚙️ Beállítások

### Alapértelmezett:
- **Fájl Neve**: "dokumentumok"
- **Szűrés**: Nincs (összes dokumentum)
- **Oszlopok**: Név, Típus, URL

### Haladó Beállítások:
```json
{
  "filename": "dokumentumok",
  "filter": ".pdf",                    // opcionális
  "colName": true,
  "colType": true,
  "colUrl": true
}
```

---

## 📊 Export Formátum

### CSV (Excel-ben megnyílik):
```
Dokumentum Név      │ Típus  │ URL
────────────────────┼────────┼──────────────
szerződés           │ .pdf   │ https://...
felhasználói.docx   │ .docx  │ https://...
invoice_2024        │ .xlsx  │ https://...
kép1                │ .png   │ https://...
```

---

## 🔍 Mit Talál?

### Linkek (Dokumentum fájlok):
- `.pdf` - PDF dokumentumok
- `.doc`, `.docx` - Word fájlok
- `.xls`, `.xlsx` - Excel táblázatok
- `.ppt`, `.pptx` - PowerPoint prezentációk
- `.txt`, `.csv`, `.json` - Szöveges fájlok
- `.zip`, `.rar`, `.7z` - Tömörített fájlok

### Szöveges Dokumentumok:
- Szerződések
- Számlák
- Naplók
- Útmutatók
- Feltételek

### Képek:
- `.jpg`, `.jpeg` - JPEG képek
- `.png` - PNG képek
- `.gif` - Animált GIF-ek
- `.webp` - Modern webképek
- `.svg` - Vektorgrafika

---

## 🐛 Hibaelhárítás

| Probléma | Megoldás |
|----------|----------|
| Nincs "Load unpacked" gomb | Developer mode nincs bekapcsolva |
| Hiba üzenet a popup-ban | F5 (oldal frissítés), majd próbálj újra |
| Nincs dokumentum talált | Az oldal dinamikus, vár 2-3 mp-et |
| CSV nem nyílik Excel-ben | Jobb klikk → "Open with" → Excel |
| Extension nem működik | Bővítmény újratelepítése |

---

## 🔒 Adatvédelem & Biztonság

✅ **Teljesen Privát:**
- Helyi feldolgozás (offline működik)
- Nem küld adatokat szerverre
- Nem tárizza az adatokat
- Nincs tracking/analytics

---

## 🚀 Telepítési Módok

### Mód 1: Developer Mode (Fejlesztők)
```bash
chrome://extensions/ → Developer mode ON → Load unpacked
```

### Mód 2: GitHub (Forking & Klónozás)
```bash
git clone https://github.com/GergelyPapa/adatKinyero.git
cd adatKinyero
# Chrome → Extensions → Load unpacked → ./adatKinyero
```

### Mód 3: Chrome Web Store (Tervezett)
> Hamarosan elérhető a Chrome Web Store-ban!

---

## 📈 Verzió 2.0 Tervek

- [ ] XLSX support (valódi Excel, nem csak CSV)
- [ ] JSON export
- [ ] Előnézet az UI-ban (táblázat)
- [ ] Egyedi oszlopok
- [ ] Weboldal tartalom mentése (HTML)
- [ ] Duplikátum automatikus eltávolítása ✅
- [ ] Batch feldolgozás (több oldal egyszerre)
- [ ] Cloud szinkronizáció (Google Drive)
- [ ] Dark mode
- [ ] Chrome Web Store publikálás

---

## 💡 Fejlesztés

### Szerkezet:
```
manifest.json  ← Chrome manifest v3
popup.html     ← UI layout
popup.js       ← Event handling, export
content.js     ← DOM parsing
background.js  ← Service Worker
```

### Módosítások:
```bash
# 1. Szerkesztés
vim popup.js

# 2. Refresh a bővítményt
chrome://extensions/ → Document Extractor → Refresh

# 3. Teszt
# Weboldalra megy és tesztel
```

### Debug:
```bash
# Console nyitása
F12 vagy Ctrl+Shift+I

# Service Worker console
chrome://extensions/ → Document Extractor → "service worker"
```

---

## 📝 Licenc

MIT License - [LICENSE](LICENSE) - Ingyenes és nyílt forráskódú!

```
MIT License

Copyright (c) 2024 Gergely Papa

Permission is hereby granted, free of charge...
```

---

## 👤 Szerző

**Gergely Papa** (@GergelyPapa)
- Email: vgeri07@gmail.com
- GitHub: https://github.com/GergelyPapa
- Website: (hamarosan)

---

## 🙏 Hozzájárulás

Szívesen fogadunk:
- Bug reportokat
- Feature requesteket
- Pull requesteket

[Nyiss egy GitHub Issue-t!](https://github.com/GergelyPapa/adatKinyero/issues)

---

## 📞 Támogatás

Problémád van? 

1. Nézd meg a [TELEPÍTÉS.md](TELEPÍTÉS.md) fájlt
2. Nyiss egy [GitHub Issue-t](https://github.com/GergelyPapa/adatKinyero/issues)
3. Vagy küldj egy email-t: vgeri07@gmail.com

---

## 🎯 Használati Eset

### Lehetséges felhasználások:
- 📊 Weboldal tartalom katalogizálása
- 📥 Dokumentumok automatikus keresése
- 🔍 Konkurencia monitoring (dokumentumok)
- 📈 Adatgyűjtés kutatáshoz
- 🗂️ Weboldal audit (mely fájlok vannak)

---

## 📦 Telepítéses Számok

- ⭐ **Csillagok**: 0 (Te vagy az első!)
- 📥 **Letöltések**: 0 (Még nem publikált)
- 🔧 **Verzió**: 1.0
- 📅 **Létrehozás**: 2024

---

## 🎉 Köszönöm!

Ha tetszik a bővítmény, kövesd, csillagozd vagy ajánld továbbá! ⭐

---

**Document Extractor v1.0**  
Made with ❤️ for you  
© 2024 Gergely Papa
