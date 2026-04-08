// ============================================
// Document Extractor - Popup Script
// ============================================

let extractedDocuments = [];

// ============================================
// 1. DOKUMENTUMOK LEKÉRÉSE (Fő funkció)
// ============================================
function extractDocuments() {
    console.log('=== extractDocuments START ===');
    
    const findLinks = document.getElementById('find-links').checked;
    const findText = document.getElementById('find-text').checked;
    const findImages = document.getElementById('find-images').checked;
    
    console.log('Opciók:', { findLinks, findText, findImages });
    
    if (!findLinks && !findText && !findImages) {
        showStatus('Válassz legalább egy típust!', 'error');
        return;
    }
    
    showLoading(true);
    
    // Aktív tab lekérése
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (!tabs || tabs.length === 0) {
            showLoading(false);
            showStatus('Hiba: Nincs aktív tab!', 'error');
            return;
        }
        
        const tabId = tabs[0].id;
        console.log('Tab ID:', tabId);
        
        // Dinamikus script injektálása
        chrome.scripting.executeScript(
            {
                target: { tabId: tabId },
                function: runExtraction,
                args: [findLinks, findText, findImages]
            },
            (results) => {
                console.log('Injekció eredménye:', results);
                
                if (chrome.runtime.lastError) {
                    console.error('Injekció hiba:', chrome.runtime.lastError);
                    showLoading(false);
                    showStatus('Hiba: ' + chrome.runtime.lastError.message, 'error');
                    return;
                }
                
                if (results && results[0] && results[0].result) {
                    extractedDocuments = results[0].result;
                    console.log('Dokumentumok:', extractedDocuments.length, extractedDocuments);
                    showLoading(false);
                    updateUI();
                } else {
                    console.warn('Nincs eredmény');
                    showLoading(false);
                    showStatus('Nem sikerült az adatok lekérése.', 'error');
                }
            }
        );
    });
}

// ============================================
// 2. INJEKTÁLANDÓ FÜGGVÉNY (az oldalon fut)
// ============================================
function runExtraction(findLinks, findText, findImages) {
    console.log('runExtraction futott az oldalon!');
    
    let documents = [];
    
    // Linkek keresése
    if (findLinks) {
        console.log('Linkek keresése...');
        documents = documents.concat(extractLinks());
    }
    
    // Szövegek keresése
    if (findText) {
        console.log('Szövegek keresése...');
        documents = documents.concat(extractTextDocuments());
    }
    
    // Képek keresése
    if (findImages) {
        console.log('Képek keresése...');
        documents = documents.concat(extractImages());
    }
    
    // Duplikátumok eltávolítása
    documents = removeDuplicates(documents);
    
    console.log('Végeredmény:', documents.length, 'dokumentum');
    return documents;
}

// ============================================
// 3. EXTRAKCIÓS FÜGGVÉNYEK
// ============================================

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
        
        if (!href || href.length === 0) return;
        
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
        
        const textLower = text.toLowerCase();
        
        if (isDocument || textLower.includes('download') || 
            textLower.includes('dokumentum') ||
            textLower.includes('file') ||
            textLower.includes('letölt') ||
            textLower.includes('pdf') ||
            textLower.includes('excel')) {
            
            links.push({
                name: text || getFilenameFromUrl(fullUrl) || 'Dokumentum',
                type: extension || 'Link',
                url: fullUrl,
                source: 'link'
            });
        }
    });
    
    console.log('Linkek talált:', links.length);
    return links;
}

function extractTextDocuments() {
    const documents = [];
    const documentKeywords = [
        'dokumentum', 'fájl', 'letöltés', 'report', 'invoice',
        'számlá', 'szerződés', 'naplózás', 'ügylet', 'megállapodás',
        'útmutató', 'kézikönyv', 'felhasználói', 'feltételek', 'típusú',
        'statement', 'evidence', 'certificate', 'bizonyít'
    ];
    
    document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, td, tr, li').forEach((el) => {
        const text = el.textContent.trim();
        
        if (text.length < 3 || text.length > 300) return;
        
        const textLower = text.toLowerCase();
        
        if (documentKeywords.some(keyword => textLower.includes(keyword))) {
            documents.push({
                name: text.substring(0, 100),
                type: 'Szöveg',
                url: window.location.href,
                source: 'text'
            });
        }
    });
    
    console.log('Szövegek talált:', documents.length);
    return documents;
}

function extractImages() {
    const images = [];
    
    document.querySelectorAll('img').forEach((img) => {
        const src = img.getAttribute('src');
        const alt = img.getAttribute('alt');
        
        if (!src) return;
        
        let fullUrl = src;
        if (!src.startsWith('http')) {
            try {
                fullUrl = new URL(src, window.location.href).href;
            } catch (e) {
                return;
            }
        }
        
        // Csak nagyobb képek
        if (img.width < 50 || img.height < 50) return;
        
        images.push({
            name: alt || getFilenameFromUrl(src) || 'Kép',
            type: getFileExtension(src),
            url: fullUrl,
            source: 'image'
        });
    });
    
    console.log('Képek talált:', images.length);
    return images;
}

// ============================================
// 4. SEGÉDFÜGGVÉNYEK
// ============================================

function getFileExtension(url) {
    const path = url.split('?')[0];
    const parts = path.split('.');
    return parts.length > 1 ? '.' + parts[parts.length - 1].toLowerCase() : 'Fájl';
}

function getFilenameFromUrl(url) {
    const path = url.split('?')[0];
    const parts = path.split('/');
    return parts[parts.length - 1] || null;
}

function removeDuplicates(documents) {
    const seen = new Set();
    return documents.filter(doc => {
        const key = (doc.name || '') + (doc.url || '');
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
}

// ============================================
// 5. UI FRISSÍTÉS
// ============================================

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

// ============================================
// 6. EXCEL EXPORT
// ============================================

function exportToExcel() {
    if (extractedDocuments.length === 0) {
        showStatus('Nincs mit exportálni!', 'error');
        return;
    }
    
    const filename = document.getElementById('filename').value || 'dokumentumok';
    
    // CSV fejléc
    let csv = 'Dokumentum Név,Típus,URL\n';
    
    // Adatok
    extractedDocuments.forEach(doc => {
        const name = (doc.name || '').replace(/"/g, '""').replace(/\n/g, ' ');
        const type = (doc.type || 'Ismeretlen').replace(/"/g, '""');
        const url = (doc.url || '').replace(/"/g, '""');
        
        csv += `"${name}","${type}","${url}"\n`;
    });
    
    // Letöltés
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

// ============================================
// 7. EREDMÉNYEK TÖRLÉSE
// ============================================

function clearResults() {
    extractedDocuments = [];
    document.getElementById('doc-info').textContent = 'Még nem kereseztünk dokumentumokat.';
    document.getElementById('export-btn').disabled = true;
    document.getElementById('status').style.display = 'none';
    showStatus('Eredmények törölve!', 'success');
}

// ============================================
// 8. STATUS ÜZENET
// ============================================

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

// ============================================
// 9. LOADING ANIMÁCIÓ
// ============================================

function showLoading(show) {
    const loading = document.getElementById('loading');
    if (show) {
        loading.classList.add('active');
    } else {
        loading.classList.remove('active');
    }
}

// ============================================
// 10. BEÁLLÍTÁSOK TOGGLE
// ============================================

function toggleSettings() {
    const settings = document.getElementById('settings');
    if (settings) {
        settings.classList.toggle('visible');
    }
}

// ============================================
// 11. INICIALIZÁLÁS (oldal betöltésekor)
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('=== Popup DOMContentLoaded ===');
    
    // Beállítások betöltése
    chrome.storage.local.get(['filename', 'filter'], (result) => {
        const filenameEl = document.getElementById('filename');
        const filterEl = document.getElementById('filter');
        
        if (filenameEl && result.filename) {
            filenameEl.value = result.filename;
        }
        
        if (filterEl && result.filter) {
            filterEl.value = result.filter;
        }
    });
    
    // Beállítások mentése
    const filenameEl = document.getElementById('filename');
    if (filenameEl) {
        filenameEl.addEventListener('change', (e) => {
            chrome.storage.local.set({filename: e.target.value});
        });
    }
    
    const filterEl = document.getElementById('filter');
    if (filterEl) {
        filterEl.addEventListener('change', (e) => {
            chrome.storage.local.set({filter: e.target.value});
        });
    }
    
    // Gomb event listenerek (biztos, hogy vannak)
    const extractBtn = document.querySelector('.btn-extract');
    if (extractBtn) {
        extractBtn.addEventListener('click', extractDocuments);
        console.log('Extract gomb listener hozzáadva');
    }
    
    const settingsBtn = document.querySelector('.settings-toggle');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', toggleSettings);
        console.log('Settings gomb listener hozzáadva');
    }
    
    console.log('=== Popup inicializálva ===');
});
