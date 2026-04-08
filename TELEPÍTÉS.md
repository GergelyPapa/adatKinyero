# 📄 Document Extractor - Chrome Bővítmény Telepítés

## 🎯 Mit csinál?
Ez a Chrome bővítmény egy **weboldalról összegyűjti az összes dokumentumot** (linkek, szövegek, képek) és **Excel-be exportálja**!

---

## 🚀 TELEPÍTÉS (5 perc)

### **1. Fájlok előkészítése**

Az alábbi fájlok már léteznek a mappában:
```
chrome-extension/
├── manifest.json      ✅
├── popup.html         ✅
├── popup.js           ✅
├── content.js         ✅
├── background.js      ✅
└── images/           (ikon fájlok - opcionális)
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

Ha nincs `images` mappa, hozd létre:
```bash
mkdir -p ~/chrome-extension/images
```

### **2. Chrome Developer Mode bekapcsolása**

1. Nyiss meg a Chrome böngészőt
2. Menj ide: **chrome://extensions/**
3. Jobb felső sarok → **"Developer mode"** bekapcsolása (toggle)

### **3. Bővítmény betöltése**

1. Kattints a **"Load unpacked"** gombra
2. Tallózd meg a mappát: `~/chrome-extension/`
3. Válassz ki az egész mappát → **"Válassza"**

### **4. Kész! ✅**

A bővítmény most már látható a Chrome-ban a jobb felső sarokban!

---

## 📖 HASZNÁLAT

### **Dokumentumok keresése:**

1. Navigálj egy weboldalra
2. Kattints a **bővítmény ikonra** (jobb felső sarok)
3. Válaszd ki, milyen típusú dokumentumokat keresünk:
   - ☑️ **Linkek** (PDF, DOC, stb.)
   - ☑️ **Szöveg** (dokumentum jellegű szövegek)
   - ☑️ **Képek** (összes kép az oldalról)
4. Kattints a **"🔍 Dokumentumok Lekérése"** gombra
5. Vár a keresésre (1-3 mp)
6. Ha talált dokumentumokat, kattints **"📥 Excel Export"** gombra
7. CSV fájl letöltésre kerül (amit Excel megnyit)

---

## ⚙️ BEÁLLÍTÁSOK

Kattints a **"+ Haladó beállítások"** gombra:

### **Fájl neve:**
```
Pl.: "dokumentumok" → dokumentumok.csv
Pl.: "my-docs" → my-docs.csv
```

### **Szűrés (opcionális):**
```
Pl.: ".pdf" → csak PDF fájlok
Pl.: ".docx" → csak Word dokumentumok
```

### **Oszlopok:**
```
☑️ Név - Dokumentum neve
☑️ Típus - Fájl típusa (.pdf, .doc, stb.)
☑️ URL - Teljes link az oldalon
```

---

## 📊 EXCEL/CSV EXPORT

### **Mit exportál?**

A CSV fájl 3 oszlopot tartalmaz:
```
Dokumentum Név     | Típus   | URL
─────────────────────────────────────────────
szerződés.pdf      | .pdf    | https://...
felhasználói.docx  | .docx   | https://...
kép1.png           | .png    | https://...
```

### **CSV megnyitása Excel-ben:**

1. Letöltött CSV fájlra jobb klikk
2. **"Megnyitás ezzel"** → **Excel**
3. Import varázsló → **Finish**

### **Valódi XLSX formátum (Optional):**

Ha XLSX kell (nem csak CSV):

```javascript
// popup.js-ben add hozzá ezt:
// SheetJS library: <script src="https://cdn.jsdelivr.net/npm/xlsx/dist/xlsx.full.min.js"></script>
// Majd az exportToExcel() függvényt átírjuk
```

---

## 🎨 IKONOK HOZZÁADÁSA (Opcionális)

Ha szép ikonok szükségesek, hozz létre PNG képeket:

```
images/
├── icon16.png   (16x16 px)
├── icon48.png   (48x48 px)
└── icon128.png  (128x128 px)
```

Gyors PNG generator: https://www.favicon-generator.org/

Vagy használj szöveg-alapú ikonokat:
```bash
# Terminal parancs ikonok létrehozásához
# (ezzel most nem foglalkozunk, nem szükséges)
```

---

## 🐛 HIBAELHÁRÍTÁS

### **"Hiba: Nem lehet üzenetet küldeni content script-hez"**
```
❌ Probléma: Manifest verzió inkompatibilis
✅ Megoldás: Töröld és újra telepítsd a bővítményt
```

### **"Excel nem nyílik meg automatikusan"**
```
❌ Probléma: CSV nem alapérték az Excel
✅ Megoldás: Dupla klikk a CSV-re, majd válaszd Excel-t
```

### **"Nincs dokumentum talált"**
```
❌ Probléma: Az oldal dinamikus tartalmú (JavaScript)
✅ Megoldás: Vár 2-3 másodpercet az oldal betöltésére
```

### **"Engedély hiba - nem lehet hozzáférni az oldalhoz"**
```
❌ Probléma: Chrome biztonsági korlát (Chrome shop, Gmail, stb.)
✅ Megoldás: Ezeken az oldalakon nem működik (Chrome tiltja)
```

---

## 🔐 BIZTONSÁG & ADATVÉDELEM

✅ **A bővítmény:**
- ❌ Nem küld adatokat szerverre
- ❌ Nem követi a webes tevékenységeket
- ✅ Lokálisan dolgozik
- ✅ Teljes pribáció

---

## 📝 FEJLESZTÉSI TIPPEK

### **Új funkció hozzáadása:**

1. Módosítsd a `content.js`-t a kereső logikához
2. Módosítsd a `popup.js`-t a UI-hoz
3. Módosítsd a `popup.html`-t az új gombokhoz
4. Chrome → F12 → "Bővítmények" → Refresh

### **Debug módban:**

```javascript
// Chrome DevTools megnyitása
F12 vagy Ctrl+Shift+I

// Bővítmény console-ja:
chrome://extensions → Document Extractor → "service worker"

// Content script console:
F12 az aktív tabon (a weboldal Dev Tools)
```

---

## 🚀 TOVÁBBFEJLESZTÉSI LEHETŐSÉGEK

### **Verzió 2.0 tervek:**

- [ ] XLSX támogatás (valódi Excel)
- [ ] JSON export
- [ ] Szűrési beállítások
- [ ] Előnézet (táblázat az UI-ban)
- [ ] Egyedi oszlop megadása
- [ ] Weboldal tartalom mentése (HTML)
- [ ] Duplikátum automatikus eltávolítása
- [ ] Batch feldolgozás (több oldal)
- [ ] Cloud szinkronizáció

---

## 💬 TÁMOGATÁS

Ha van hiba vagy kérdés:

1. Nyiss egy GitHub issue-t
2. Vagy küldjél email-t
3. Vagy ellenőrizd a Chrome Web Store dokumentációt

---

## 📜 LICENC

Ez a bővítmény **ingyenes és nyílt forráskódú!**

---

## 🎉 KÉSZ!

Most már működik a Document Extractor bővítményed!

**Tesztelni:**
1. Nyiss meg bármilyen weboldalt
2. Kattints a bővítmény ikonra
3. Kattints "🔍 Dokumentumok Lekérése" gombra
4. Kattints "📥 Excel Export" gombra
5. CSV megnyílik az Excel-ben!

---

**Szóval, megvan? Szólj, ha van gond!** 🚀

v1.0 | Document Extractor
