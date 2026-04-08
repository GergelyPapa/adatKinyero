# 📄 Document Extractor Chrome Extension

**Weboldal dokumentumait Excel-be egy kattintással!** 🚀

## ⚡ Gyors Start

### 1. Fájlok megvannak
```
✅ manifest.json
✅ popup.html
✅ popup.js
✅ content.js
✅ background.js
```

### 2. Chrome Developer Mode
```
chrome://extensions/ → Developer mode ON
```

### 3. Load Unpacked
```
chrome://extensions/ → Load unpacked → ~/chrome-extension/
```

### 4. Használat
```
1. Weboldalra menni
2. Bővítmény ikon kattintása
3. "🔍 Dokumentumok Lekérése"
4. "📥 Excel Export"
5. CSV letöltésre kerül
```

## 📊 Mit talál?

- 📎 **Linkek** - PDF, DOC, DOCX, XLS, PPT stb.
- 📝 **Szövegek** - Dokumentum jellegű szövegek
- 🖼️ **Képek** - Összes kép az oldalról

## ⚙️ Beállítások

- **Fájl neve** - CSV fájl neve
- **Szűrés** - Csak bizonyos típusok (.pdf, .docx stb.)
- **Oszlopok** - Név, Típus, URL

## 🎨 UI

- 💜 Lila-fehér téma
- 📱 Responsive design
- ✨ Loading animáció
- 📊 Status üzenetek

## 🔒 Adatvédelem

- ✅ Helyi feldolgozás
- ✅ Szerver nélkül működik
- ✅ Nincs adatküldés

## 📝 Fájl szerkezet

```
chrome-extension/
├── manifest.json      - Bővítmény konfiguráció
├── popup.html         - UI layout
├── popup.js           - UI logika
├── content.js         - Oldal DOM olvasása
├── background.js      - Service Worker
├── TELEPÍTÉS.md       - Részletes telepítési útmutató
└── README.md          - Ez a fájl
```

## 🚀 Továbbfejlesztés

### Verzió 2.0
- [ ] XLSX (valódi Excel)
- [ ] JSON export
- [ ] Előnézet UI-ban
- [ ] Batch feldolgozás

## 💡 Tippek

### Debug
```
F12 → Console
chrome://extensions/ → Document Extractor → "service worker"
```

### Módosítás
```
1. Szerkeszd a content.js / popup.js-t
2. chrome://extensions/ → Refresh
3. Teszt
```

---

**Verzió:** 1.0  
**Szerző:** Document Extractor Team  
**Licenc:** MIT (ingyenes)

