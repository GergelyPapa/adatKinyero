// Dokumentumok tárolása
let extractedDocuments = [];

// Dokumentumok lekérése
function extractDocuments() {
    const findLinks = document.getElementById('find-links').checked;
    const findText = document.getElementById('find-text').checked;
    const findImages = document.getElementById('find-images').checked;
    
    if (!findLinks && !findText && !findImages) {
        showStatus('Válassz legalább egy típust!', 'error');
        return;
    }
    
    showLoading(true);
    
    // Aktív tab lekérése
    chrome.tabs.query({active: true, currentWindow: true}, async (tabs) => {
        const tabId = tabs[0].id;
        
        try {
            // Content script injektálása (dinamikus)
            await chrome.scripting.executeScript({
                target: { tabId: tabId },
                function: injectExtractor,
                args: [findLinks, findText, findImages]
            });
            
            console.log('Content script injektálva');
        } catch (error) {
            console.error('Injekció hiba:', error);
            showLoading(false);
            showStatus('Hiba: ' + error.message, 'error');
            return;
        }
        
        // Üzenet küldése az injektált scripthez
        chrome.tabs.sendMessage(tabId, {
            action: 'extractDocuments',
            findLinks,
            findText,
            findImages
        }, (response) => {
            showLoading(false);
            
            if (chrome.runtime.lastError) {
                showStatus('Hiba: ' + chrome.runtime.lastError.message, 'error');
                console.error('Runtime hiba:', chrome.runtime.lastError);
                return;
            }
            
            if (response && response.documents) {
                extractedDocuments = response.documents || [];
                updateUI();
                console.log('Dokumentumok lekérve:', extractedDocuments.length);
            } else {
                showStatus('Nem sikerült az adatok lekérése.', 'error');
            }
        });
    });
}

// Injektálandó függvény (content script helyett)
function injectExtractor(findLinks, findText, findImages) {
    // Ez a függvény a web oldalon fut le!
    
    function getFileExtension(url) {
        const path = url.split('?')[0];
        const parts = path.split('.');
        return parts.length > 1 ? '.' + parts[parts.length - 1].toLowerCase() : 'Fájl';
    }
    
    function extractFilename(url) {
        const path = url.split('?')[0];
        const parts = path.split('/');
        return parts[parts.length - 1] || null;
    }
    
    function extractLinks() {
        const links = [];
        const documentExtensions = [
            '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
            '.txt', '.csv', '.xml', '.json', '.zip', '.rar', '.7z',
            '.jpg', '.png', '.gif', '.bmp', '.svg', '.webp'
        ];
        
        document.querySelectorAll('a[href]').forEach((link) => {
            const href = link.getAttribute('href');
            const text = link.textContent.trim();
            
            if (href) {
                let fullUrl = href;
                if (!href.startsWith('http')) {
                    try {
                        fullUrl = new URL(href, window.location.href).href;
                    } catch (e) {
                        return;
                    }
                }
                
                const extension = getFileExtension(fullUrl);
                const isDocument = documentExtensions.some(ext => 
                    fullUrl.toLowerCase().includes(ext)
                );
                
                if (isDocument || text.toLowerCase().includes('download') || 
                    text.toLowerCase().includes('dokumentum') ||
                    text.toLowerCase().includes('file')) {
                    
                    links.push({
                        name: text || extractFilename(fullUrl) || 'Dokumentum',
                        type: extension || 'Link',
                        url: fullUrl,
                        source: 'link'
                    });
                }
            }
        });
        
        return links;
    }
    
    function extractTextDocuments() {
        const documents = [];
        const documentKeywords = [
            'dokumentum', 'fájl', 'letöltés', 'report', 'invoice',
            'számlá', 'szerződés', 'naplózás', 'ügylet', 'megállapodás',
            'útmutató', 'kézikönyv', 'felhasználói', 'feltételek', 'típusú'
        ];
        
        document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, td, tr').forEach((el) => {
            const text = el.textContent.trim();
            
            if (text.length < 3 || text.length > 300) return;
            
            if (documentKeywords.some(keyword => 
                text.toLowerCase().includes(keyword))) {
                
                documents.push({
                    name: text.substring(0, 100),
                    type: 'Szöveg',
                    url: window.location.href,
                    source: 'text'
                });
            }
        });
        
        return documents;
    }
    
    function extractImages() {
        const images = [];
        
        document.querySelectorAll('img').forEach((img) => {
            const src = img.getAttribute('src');
            const alt = img.getAttribute('alt');
            
            if (src) {
                let fullUrl = src;
                if (!src.startsWith('http')) {
                    try {
                        fullUrl = new URL(src, window.location.href).href;
                    } catch (e) {
                        return;
                    }
                }
                
                images.push({
                    name: alt || extractFilename(src) || 'Kép',
                    type: getFileExtension(src),
                    url: fullUrl,
                    source: 'image'
                });
            }
        });
        
        return images;
    }
    
    function removeDuplicates(documents) {
        const seen = new Set();
        return documents.filter(doc => {
            const key = doc.name + doc.url;
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }
    
    // EXTRAKCIÓ FUTTATÁSA
    let documents = [];
    
    if (findLinks) {
        documents = documents.concat(extractLinks());
    }
    
    if (findText) {
        documents = documents.concat(extractTextDocuments());
    }
    
    if (findImages) {
        documents = documents.concat(extractImages());
    }
    
    documents = removeDuplicates(documents);
    
    console.log('Injektált extrakció - Talált:', documents.length, documents);
}

// UI frissítés
function updateUI() {
    const count = extractedDocuments.length;
    const info = document.getElementById('doc-info');
    const exportBtn = document.getElementById('export-btn');
    
    if (count === 0) {
        info.textContent = '❌ Nem találtunk dokumentumokat.';
        exportBtn.disabled = true;
    } else {
        info.innerHTML = `✅ Talált dokumentumok: <span class="document-count">${count}</span>`;
        exportBtn.disabled = false;
        showStatus(`${count} dokumentum sikeresen lekérve!`, 'success');
    }
}

// Excel exportálás
function exportToExcel() {
    if (extractedDocuments.length === 0) {
        showStatus('Nincs mit exportálni!', 'error');
        return;
    }
    
    const filename = document.getElementById('filename').value || 'dokumentumok';
    
    // CSV formátumba konvertálás
    let csv = 'Dokumentum Név,Típus,URL\n';
    
    extractedDocuments.forEach(doc => {
        const name = (doc.name || '').replace(/"/g, '""');
        const type = doc.type || 'Ismeretlen';
        const url = (doc.url || '').replace(/"/g, '""');
        
        csv += `"${name}","${type}","${url}"\n`;
    });
    
    // Excel XLSX szimulálása (valójában CSV, amit az Excel megnyit)
    // Ha valódi XLSX kell, használd a SheetJS vagy xlsx bibliotékát
    
    // Blob létrehozása
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url_link = URL.createObjectURL(blob);
    
    link.setAttribute('href', url_link);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showStatus('Excel sikeresen letöltve!', 'success');
}

// Eredmények törlése
function clearResults() {
    extractedDocuments = [];
    document.getElementById('doc-info').textContent = 'Még nem kereseztünk dokumentumokat.';
    document.getElementById('export-btn').disabled = true;
    document.getElementById('status').style.display = 'none';
}

// Status üzenet megjelenítése
function showStatus(message, type = 'info') {
    const statusEl = document.getElementById('status');
    statusEl.textContent = message;
    statusEl.className = 'status ' + type;
    statusEl.style.display = 'block';
    
    if (type === 'success') {
        setTimeout(() => {
            statusEl.style.display = 'none';
        }, 3000);
    }
}

// Loading animáció
function showLoading(show) {
    document.getElementById('loading').classList.toggle('active', show);
}

// Beállítások Toggle
function toggleSettings() {
    document.getElementById('settings').classList.toggle('visible');
}

// Oldal betöltésekor
document.addEventListener('DOMContentLoaded', () => {
    // Beállítások betöltése
    chrome.storage.local.get(['filename', 'filter'], (result) => {
        if (result.filename) {
            document.getElementById('filename').value = result.filename;
        }
        if (result.filter) {
            document.getElementById('filter').value = result.filter;
        }
    });
    
    // Beállítások mentése
    document.getElementById('filename').addEventListener('change', (e) => {
        chrome.storage.local.set({filename: e.target.value});
    });
    
    document.getElementById('filter').addEventListener('change', (e) => {
        chrome.storage.local.set({filter: e.target.value});
    });
});
