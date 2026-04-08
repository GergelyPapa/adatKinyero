// ============================================
// Document Extractor - Popup Script v5
// FIXED: Async handling in executeScript
// ============================================

let extractedDocuments = [];

// ============================================
// MAIN: DOKUMENTUMOK LEKÉRÉSE
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
            console.error('No active tab found!');
            return;
        }
        
        const tabId = tabs[0].id;
        const tabUrl = tabs[0].url;
        console.log('Tab ID:', tabId, 'URL:', tabUrl);
        
        // Közvetlen extraction - nem kell teszt
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            function: extractOnPage,
            args: [findLinks, findText, findImages]
        }, (results) => {
            console.log('Extraction results:', results);
            showLoading(false);
            
            if (chrome.runtime.lastError) {
                console.error('Runtime error:', chrome.runtime.lastError);
                showStatus('Script injection hiba: ' + chrome.runtime.lastError.message, 'error');
                return;
            }
            
            if (results && results[0] && results[0].result) {
                const docs = results[0].result;
                console.log('Documents received:', docs.length);
                console.log('Sample documents:', docs.slice(0, 3));
                
                extractedDocuments = docs;
                updateUI();
            } else {
                console.warn('No result from extraction');
                showStatus('Nincs eredmény az extrakciótól!', 'error');
            }
        });
    });
}

// ============================================
// EXTRACT FUNCTION - SZINKRON VERZIÓ
// (ez fut az oldalon)
// ============================================
function extractOnPage(findLinks, findText, findImages) {
    console.log('=== extractOnPage START ===');
    console.log('Parameters:', { findLinks, findText, findImages });
    
    let documents = [];
    
    try {
        // Várakozás az oldal betöltésére
        console.log('Waiting for page to be ready...');
        
        // Egyszerű várakozás: 2 másodperc
        const startTime = new Date();
        while (new Date() - startTime < 2000) {
            // Várakozás
        }
        
        console.log('Proceeding with extraction...');
        
        // LINKEK KINYERÉSE
        if (findLinks) {
            console.log('→ Extracting links...');
            const links = [];
            
            try {
                document.querySelectorAll('a[href]').forEach((link) => {
                    const href = link.getAttribute('href');
                    const text = link.textContent.trim();
                    
                    if (!href || href.length === 0) return;
                    if (text.length === 0) return;
                    
                    let fullUrl = href;
                    try {
                        if (!href.startsWith('http')) {
                            fullUrl = new URL(href, window.location.href).href;
                        }
                    } catch (e) {
                        fullUrl = href;
                    }
                    
                    if (fullUrl.length > 5) {
                        links.push({
                            name: text.substring(0, 100) || 'Link',
                            type: 'Link',
                            url: fullUrl,
                            source: 'link'
                        });
                    }
                });
            } catch (e) {
                console.error('Link extraction error:', e);
            }
            
            console.log('  Found links:', links.length);
            documents = documents.concat(links);
        }
        
        // SZÖVEGEK + ÁRAK KINYERÉSE
        if (findText) {
            console.log('→ Extracting text and prices...');
            const texts = [];
            
            try {
                // ÁRAK - regex keresés
                const priceRegex = /\d+\s*[Ff][Tt]|\d+\s*[Ff]{2}|\d+\s*€/g;
                const pageText = document.body.innerText;
                
                if (pageText && pageText.length > 0) {
                    const prices = pageText.match(priceRegex) || [];
                    
                    console.log('  Found prices:', prices.length);
                    
                    // Max 100 ár
                    const uniquePrices = new Set();
                    prices.slice(0, 200).forEach((price) => {
                        const cleanPrice = price.trim();
                        if (cleanPrice.length > 0 && !uniquePrices.has(cleanPrice)) {
                            uniquePrices.add(cleanPrice);
                            texts.push({
                                name: cleanPrice,
                                type: 'Ár',
                                url: window.location.href,
                                source: 'price'
                            });
                            
                            if (uniquePrices.size >= 100) return;
                        }
                    });
                    
                    console.log('  Added prices:', texts.length);
                }
            } catch (e) {
                console.error('Price extraction error:', e);
            }
            
            // TERMÉKES SZÖVEGEK
            try {
                const keywords = ['kandallo', 'termék', 'ár', 'product', 'price', 'sparhelt', 'kemence', 'grill', 'füst', 'kályha'];
                
                document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span').forEach((el) => {
                    try {
                        const text = el.textContent.trim();
                        if (text.length < 5 || text.length > 200) return;
                        
                        const wordCount = text.split(/\s+/).length;
                        if (wordCount > 50) return;
                        
                        if (keywords.some(kw => text.toLowerCase().includes(kw))) {
                            texts.push({
                                name: text.substring(0, 150),
                                type: 'Termék',
                                url: window.location.href,
                                source: 'text'
                            });
                        }
                    } catch (e) {
                        // Silent
                    }
                });
            } catch (e) {
                console.error('Text extraction error:', e);
            }
            
            console.log('  Total texts:', texts.length);
            documents = documents.concat(texts);
        }
        
        // KÉPEK KINYERÉSE
        if (findImages) {
            console.log('→ Extracting images...');
            const images = [];
            
            try {
                document.querySelectorAll('img').forEach((img) => {
                    const src = img.getAttribute('src');
                    const alt = img.getAttribute('alt');
                    
                    if (!src || src.length === 0) return;
                    
                    let fullUrl = src;
                    try {
                        if (!src.startsWith('http')) {
                            fullUrl = new URL(src, window.location.href).href;
                        }
                    } catch (e) {
                        fullUrl = src;
                    }
                    
                    if (fullUrl.length > 5) {
                        images.push({
                            name: alt || 'Image',
                            type: 'Kép',
                            url: fullUrl,
                            source: 'image'
                        });
                    }
                });
            } catch (e) {
                console.error('Image extraction error:', e);
            }
            
            console.log('  Found images:', images.length);
            documents = documents.concat(images);
        }
        
        // DEDUPE
        documents = removeDuplicates(documents);
        
        console.log('=== Final result:', documents.length, 'documents ===');
        return documents;
        
    } catch (error) {
        console.error('Fatal error in extractOnPage:', error);
        return [];
    }
}

// ============================================
// DEDUPLICATE
// ============================================
function removeDuplicates(documents) {
    const seen = new Set();
    return documents.filter(doc => {
        const key = (doc.name || '') + '|' + (doc.url || '');
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
}

// ============================================
// UI UPDATE
// ============================================
function updateUI() {
    const count = extractedDocuments.length;
    const info = document.getElementById('doc-info');
    const exportBtn = document.getElementById('export-btn');
    
    if (!info || !exportBtn) {
        console.warn('UI elements not found');
        return;
    }
    
    if (count === 0) {
        info.textContent = '❌ Nem találtunk dokumentumokat.';
        exportBtn.disabled = true;
    } else {
        info.innerHTML = `✅ Talált dokumentumok: <strong>${count}</strong>`;
        exportBtn.disabled = false;
        showStatus(`${count} dokumentum lekérve!`, 'success');
    }
}

// ============================================
// EXCEL EXPORT (Chrome downloads API)
// ============================================
function exportToExcel() {
    console.log('=== EXPORT START ===');
    console.log('Documents:', extractedDocuments.length);
    
    if (!extractedDocuments || extractedDocuments.length === 0) {
        showStatus('Nincs dokumentum az exportáláshoz!', 'error');
        console.warn('No documents to export');
        return;
    }
    
    try {
        const filename = document.getElementById('filename')?.value || 'dokumentumok';
        
        console.log('Creating CSV...');
        let csv = 'Dokumentum Név,Típus,URL,Forrás\n';
        
        extractedDocuments.forEach((doc, idx) => {
            const name = (doc.name || 'N/A').replace(/"/g, '""').replace(/\n/g, ' ').substring(0, 200);
            const type = (doc.type || 'N/A').replace(/"/g, '""');
            const url = (doc.url || 'N/A').replace(/"/g, '""');
            const source = (doc.source || 'unknown').replace(/"/g, '""');
            
            csv += `"${name}","${type}","${url}","${source}"\n`;
            
            if (idx < 3) {
                console.log(`Row ${idx}: ${name.substring(0, 50)}`);
            }
        });
        
        console.log('CSV created, size:', csv.length, 'bytes');
        
        // UTF-8 BOM
        const BOM = '\uFEFF';
        const csvWithBom = BOM + csv;
        
        console.log('Converting to blob...');
        const blob = new Blob([csvWithBom], { type: 'text/csv;charset=utf-8;' });
        console.log('Blob size:', blob.size, 'bytes');
        
        // Blob URL-t készítünk
        const blobUrl = URL.createObjectURL(blob);
        console.log('Blob URL:', blobUrl);
        
        // Chrome downloads API használata
        console.log('Using chrome.downloads.download...');
        chrome.downloads.download({
            url: blobUrl,
            filename: `${filename}.csv`,
            saveAs: false
        }, (downloadId) => {
            if (chrome.runtime.lastError) {
                console.error('Download error:', chrome.runtime.lastError);
                showStatus('Letöltés hiba: ' + chrome.runtime.lastError.message, 'error');
                URL.revokeObjectURL(blobUrl);
                return;
            }
            
            console.log('Download started, ID:', downloadId);
            showStatus(`${filename}.csv letöltve! (ID: ${downloadId})`, 'success');
            console.log('=== EXPORT SUCCESS ===');
            
            // Cleanup után egy pár másodperccel
            setTimeout(() => {
                URL.revokeObjectURL(blobUrl);
                console.log('Blob URL revoked');
            }, 2000);
        });
        
    } catch (error) {
        console.error('Export error:', error);
        showStatus('Export hiba: ' + error.message, 'error');
    }
}

// ============================================
// CLEAR RESULTS
// ============================================
function clearResults() {
    extractedDocuments = [];
    const info = document.getElementById('doc-info');
    const exportBtn = document.getElementById('export-btn');
    
    if (info) {
        info.textContent = 'Még nem kerestünk dokumentumokat.';
    }
    if (exportBtn) {
        exportBtn.disabled = true;
    }
    
    showStatus('Eredmények törölve!', 'success');
}

// ============================================
// STATUS MESSAGE
// ============================================
function showStatus(message, type = 'info') {
    const statusEl = document.getElementById('status');
    if (!statusEl) {
        console.warn('Status element not found');
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
// LOADING ANIMATION
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
// TOGGLE SETTINGS
// ============================================
function toggleSettings() {
    const settings = document.getElementById('settings');
    if (settings) {
        settings.classList.toggle('visible');
    }
}

// ============================================
// EVENT LISTENERS (DOMContentLoaded)
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('=== Popup DOMContentLoaded ===');
    
    // Extract button
    const extractBtn = document.getElementById('extract-btn');
    if (extractBtn) {
        extractBtn.addEventListener('click', extractDocuments);
        console.log('✓ Extract button listener added');
    } else {
        console.error('❌ Extract button NOT found!');
    }
    
    // Settings toggle
    const settingsBtn = document.getElementById('settings-toggle-btn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', toggleSettings);
        console.log('✓ Settings toggle listener added');
    }
    
    // Export button
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportToExcel);
        console.log('✓ Export button listener added');
    }
    
    // Clear button
    const clearBtn = document.getElementById('clear-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearResults);
        console.log('✓ Clear button listener added');
    }
    
    console.log('=== Popup Ready ===');
});
