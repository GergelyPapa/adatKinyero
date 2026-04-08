// ============================================
// Document Extractor - Popup Script v3
// FIX: chrome.scripting API (Manifest v3)
// ============================================

let extractedDocuments = [];

// ============================================
// DOKUMENTUMOK LEKÉRÉSE
// ============================================
function extractDocuments() {
    console.log('=== EXTRACTION START ===');
    
    const findLinks = document.getElementById('find-links').checked;
    const findText = document.getElementById('find-text').checked;
    const findImages = document.getElementById('find-images').checked;
    
    console.log('Options:', { findLinks, findText, findImages });
    
    if (!findLinks && !findText && !findImages) {
        showStatus('Válassz legalább egy típust!', 'error');
        return;
    }
    
    showLoading(true);
    
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (!tabs || tabs.length === 0) {
            showLoading(false);
            showStatus('Hiba: Nincs aktív tab!', 'error');
            return;
        }
        
        const tabId = tabs[0].id;
        console.log('Tab ID:', tabId);
        
        // Közvetlen injekció és végrehajtás
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            function: extractOnPage,
            args: [findLinks, findText, findImages]
        }, (results) => {
            console.log('Injection results:', results);
            
            if (chrome.runtime.lastError) {
                console.error('Injection error:', chrome.runtime.lastError);
                showLoading(false);
                showStatus('Injekció hiba: ' + chrome.runtime.lastError.message, 'error');
                return;
            }
            
            if (results && results.length > 0 && results[0].result) {
                const docs = results[0].result;
                console.log('Documents received:', docs.length, docs);
                
                extractedDocuments = docs;
                showLoading(false);
                updateUI();
            } else {
                console.warn('No results from injection');
                showLoading(false);
                showStatus('Nincs eredmény az injekciótól', 'error');
            }
        });
    });
}

// ============================================
// INJEKTÁLANDÓ FUNKCIÓ
// ============================================
function extractOnPage(findLinks, findText, findImages) {
    console.log('=== extractOnPage futott ===');
    console.log('Parameters:', { findLinks, findText, findImages });
    
    let documents = [];
    
    try {
        if (findLinks) {
            console.log('→ Linkek keresése...');
            const links = extractLinks();
            console.log('  Talált:', links.length);
            documents = documents.concat(links);
        }
        
        if (findText) {
            console.log('→ Szövegek keresése...');
            const texts = extractTextDocuments();
            console.log('  Talált:', texts.length);
            documents = documents.concat(texts);
        }
        
        if (findImages) {
            console.log('→ Képek keresése...');
            const images = extractImages();
            console.log('  Talált:', images.length);
            documents = documents.concat(images);
        }
        
        documents = removeDuplicates(documents);
        
        console.log('✅ Végeredmény:', documents.length, 'dokumentum');
        return documents;
        
    } catch (error) {
        console.error('❌ Extrakció hiba:', error);
        return [];
    }
}

// ============================================
// LINKEK KERESÉSE
// ============================================
function extractLinks() {
    const links = [];
    const documentExtensions = [
        '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
        '.txt', '.csv', '.xml', '.json', '.zip', '.rar', '.7z',
        '.jpg', '.png', '.gif', '.bmp', '.svg', '.webp'
    ];
    
    document.querySelectorAll('a[href]').forEach((link) => {
        try {
            const href = link.getAttribute('href');
            const text = link.textContent.trim();
            
            if (!href || href.length === 0) return;
            
            let fullUrl = href;
            if (!href.startsWith('http')) {
                fullUrl = new URL(href, window.location.href).href;
            }
            
            const extension = getFileExtension(fullUrl);
            const isDocument = documentExtensions.some(ext => 
                fullUrl.toLowerCase().includes(ext)
            );
            
            const textLower = text.toLowerCase();
            
            if (isDocument || textLower.includes('download') || 
                textLower.includes('dokumentum') ||
                textLower.includes('file') ||
                textLower.includes('letölt')) {
                
                links.push({
                    name: text || getFilenameFromUrl(fullUrl) || 'Link',
                    type: extension || 'Link',
                    url: fullUrl,
                    source: 'link'
                });
            }
        } catch (e) {
            console.error('Link parse error:', e);
        }
    });
    
    return links;
}

// ============================================
// SZÖVEGEK KERESÉSE
// ============================================
function extractTextDocuments() {
    const documents = [];
    const keywords = [
        'dokumentum', 'fájl', 'letöltés', 'report', 'invoice',
        'számlá', 'szerződés', 'termék', 'ár', 'price', 'product'
    ];
    
    document.querySelectorAll('p, div, h1, h2, h3, h4, h5, h6, td, li, button, a').forEach((el) => {
        try {
            const text = el.textContent.trim();
            
            if (text.length < 3 || text.length > 200) return;
            
            const textLower = text.toLowerCase();
            
            if (keywords.some(kw => textLower.includes(kw))) {
                documents.push({
                    name: text.substring(0, 150),
                    type: 'Szöveg',
                    url: window.location.href,
                    source: 'text'
                });
            }
        } catch (e) {
            console.error('Text parse error:', e);
        }
    });
    
    return documents;
}

// ============================================
// KÉPEK KERESÉSE
// ============================================
function extractImages() {
    const images = [];
    
    document.querySelectorAll('img').forEach((img) => {
        try {
            const src = img.getAttribute('src');
            const alt = img.getAttribute('alt');
            
            if (!src) return;
            
            let fullUrl = src;
            if (!src.startsWith('http')) {
                fullUrl = new URL(src, window.location.href).href;
            }
            
            // Csak nagyobb képek
            if (img.width < 50 || img.height < 50) return;
            
            images.push({
                name: alt || getFilenameFromUrl(src) || 'Kép',
                type: getFileExtension(src),
                url: fullUrl,
                source: 'image'
            });
        } catch (e) {
            console.error('Image parse error:', e);
        }
    });
    
    return images;
}

// ============================================
// SEGÉDFÜGGVÉNYEK
// ============================================

function getFileExtension(url) {
    const path = url.split('?')[0];
    const parts = path.split('.');
    return parts.length > 1 ? '.' + parts[parts.length - 1].toLowerCase() : '';
}

function getFilenameFromUrl(url) {
    const path = url.split('?')[0];
    const parts = path.split('/');
    return parts[parts.length - 1] || '';
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
// UI FRISSÍTÉS
// ============================================

function updateUI() {
    const count = extractedDocuments.length;
    const info = document.getElementById('doc-info');
    const exportBtn = document.getElementById('export-btn');
    
    if (!info || !exportBtn) {
        console.warn('UI elemek nem találva');
        return;
    }
    
    if (count === 0) {
        info.textContent = '❌ Nem találtunk dokumentumokat.';
        exportBtn.disabled = true;
    } else {
        info.innerHTML = `✅ Talált dokumentumok: <strong>${count}</strong>`;
        exportBtn.disabled = false;
        showStatus(`${count} dokumentum sikeresen lekérve!`, 'success');
    }
}

// ============================================
// EXCEL EXPORT
// ============================================

function exportToExcel() {
    if (extractedDocuments.length === 0) {
        showStatus('Nincs mit exportálni!', 'error');
        return;
    }
    
    const filenameEl = document.getElementById('filename');
    const filename = (filenameEl && filenameEl.value) || 'dokumentumok';
    
    let csv = 'Dokumentum Név,Típus,URL,Forrás\n';
    
    extractedDocuments.forEach(doc => {
        const name = (doc.name || '').replace(/"/g, '""').replace(/\n/g, ' ');
        const type = (doc.type || '').replace(/"/g, '""');
        const url = (doc.url || '').replace(/"/g, '""');
        const source = (doc.source || '').replace(/"/g, '""');
        
        csv += `"${name}","${type}","${url}","${source}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const urlObj = URL.createObjectURL(blob);
    
    link.setAttribute('href', urlObj);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(urlObj);
    showStatus('Excel letöltve!', 'success');
}

// ============================================
// EREDMÉNYEK TÖRLÉSE
// ============================================

function clearResults() {
    extractedDocuments = [];
    const info = document.getElementById('doc-info');
    const exportBtn = document.getElementById('export-btn');
    
    if (info) {
        info.textContent = 'Még nem kereseztünk dokumentumokat.';
    }
    if (exportBtn) {
        exportBtn.disabled = true;
    }
    
    showStatus('Eredmények törölve!', 'success');
}

// ============================================
// STATUS ÜZENET
// ============================================

function showStatus(message, type = 'info') {
    const statusEl = document.getElementById('status');
    if (!statusEl) {
        console.warn('Status element nem található');
        return;
    }
    
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
// LOADING ANIMÁCIÓ
// ============================================

function showLoading(show) {
    const loading = document.getElementById('loading');
    if (loading) {
        if (show) {
            loading.classList.add('active');
        } else {
            loading.classList.remove('active');
        }
    }
}

// ============================================
// HALADÓ BEÁLLÍTÁSOK TOGGLE
// ============================================

function toggleSettings() {
    const settings = document.getElementById('settings');
    if (settings) {
        settings.classList.toggle('visible');
    }
}

// ============================================
// INICIALIZÁLÁS
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('=== Popup Loading ===');
    
    // Event listenerek
    const extractBtn = document.querySelector('.btn-extract');
    const settingsBtn = document.querySelector('.settings-toggle');
    const exportBtn = document.getElementById('export-btn');
    const clearBtn = document.querySelector('.btn-clear');
    
    if (extractBtn) {
        extractBtn.addEventListener('click', () => {
            console.log('Extract button clicked');
            extractDocuments();
        });
    } else {
        console.error('Extract button not found!');
    }
    
    if (settingsBtn) {
        settingsBtn.addEventListener('click', toggleSettings);
    }
    
    if (exportBtn) {
        exportBtn.addEventListener('click', exportToExcel);
    }
    
    if (clearBtn) {
        clearBtn.addEventListener('click', clearResults);
    }
    
    console.log('=== Popup Ready ===');
});
