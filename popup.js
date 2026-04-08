// ============================================
// Document Extractor - Popup Script v4
// SIMPLE & DEBUG VERSION
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
        
        // Egyszerű test: számokat jár az oldal?
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            function: simpleTest
        }, (results) => {
            console.log('Test results:', results);
            
            if (chrome.runtime.lastError) {
                console.error('Runtime error:', chrome.runtime.lastError);
                showLoading(false);
                showStatus('Script injection hiba: ' + chrome.runtime.lastError.message, 'error');
                return;
            }
            
            if (results && results[0]) {
                console.log('Test OK, result:', results[0].result);
                // Most az igazi extrakció
                actualExtraction(tabId, findLinks, findText, findImages);
            }
        });
    });
}

// ============================================
// TEST: Valóban fut-e a script az oldalon?
// ============================================
function simpleTest() {
    console.log('TEST: Script futott az oldalon!');
    console.log('Document title:', document.title);
    console.log('Links count:', document.querySelectorAll('a[href]').length);
    console.log('Paragraphs count:', document.querySelectorAll('p').length);
    console.log('Images count:', document.querySelectorAll('img').length);
    
    return {
        title: document.title,
        linksCount: document.querySelectorAll('a[href]').length,
        paragraphsCount: document.querySelectorAll('p').length,
        imagesCount: document.querySelectorAll('img').length
    };
}

// ============================================
// IGAZI EXTRAKCIÓ (2. lépésben)
// ============================================
function actualExtraction(tabId, findLinks, findText, findImages) {
    console.log('=== Starting actual extraction ===');
    
    chrome.scripting.executeScript({
        target: { tabId: tabId },
        function: extractOnPage,
        args: [findLinks, findText, findImages]
    }, (results) => {
        console.log('Extraction results:', results);
        showLoading(false);
        
        if (chrome.runtime.lastError) {
            console.error('Extraction error:', chrome.runtime.lastError);
            showStatus('Extrakció hiba: ' + chrome.runtime.lastError.message, 'error');
            return;
        }
        
        if (results && results[0] && results[0].result) {
            const docs = results[0].result;
            console.log('Documents received:', docs.length);
            console.log('Documents:', docs);
            
            extractedDocuments = docs;
            updateUI();
        } else {
            console.warn('No result from extraction');
            showStatus('Nincs eredmény az extrakciótól!', 'error');
        }
    });
}

// ============================================
// WAIT FOR PAGE LOAD
// ============================================
function waitForPageLoad(maxWait = 3000) {
    return new Promise((resolve) => {
        console.log('Waiting for page to load...');
        
        const startTime = Date.now();
        const checkInterval = setInterval(() => {
            const loaded = document.readyState === 'complete';
            const hasContent = document.body.innerText.length > 500;
            const elapsed = Date.now() - startTime;
            
            console.log(`  Status: readyState=${document.readyState}, hasContent=${hasContent}, elapsed=${elapsed}ms`);
            
            if ((loaded && hasContent) || elapsed > maxWait) {
                clearInterval(checkInterval);
                console.log('Page ready, proceeding with extraction');
                resolve();
            }
        }, 200);
    });
}

// ============================================
// EXTRACT FUNCTION (az oldalon futó kód)
// ============================================
async function extractOnPage(findLinks, findText, findImages) {
    console.log('=== extractOnPage running ===');
    console.log('Parameters:', { findLinks, findText, findImages });
    
    // Várunk az oldal betöltésére
    await waitForPageLoad(3000);
    
    let documents = [];
    
    try {
        // LINKEK
        if (findLinks) {
            console.log('→ Extracting links...');
            const links = [];
            
            document.querySelectorAll('a[href]').forEach((link) => {
                try {
                    const href = link.getAttribute('href');
                    const text = link.textContent.trim();
                    
                    if (!href) return;
                    
                    let fullUrl = href;
                    if (!href.startsWith('http')) {
                        fullUrl = new URL(href, window.location.href).href;
                    }
                    
                    links.push({
                        name: text || 'Link',
                        type: 'Link',
                        url: fullUrl,
                        source: 'link'
                    });
                } catch (e) {
                    console.error('Link error:', e);
                }
            });
            
            console.log('  Found links:', links.length);
            documents = documents.concat(links);
        }
        
        // SZÖVEGEK + ÁRAK
        if (findText) {
            console.log('→ Extracting text and prices...');
            const texts = [];
            
            // Árak keresése
            const priceRegex = /\d+\s*[FfFt]{2}|\d+\s*€|\d+\s*Ft|\d+\s*ft/g;
            const pageText = document.body.innerText;
            const prices = pageText.match(priceRegex) || [];
            
            console.log('  Found prices:', prices.length);
            prices.slice(0, 50).forEach((price) => {
                texts.push({
                    name: price.trim(),
                    type: 'Ár',
                    url: window.location.href,
                    source: 'price'
                });
            });
            
            // Termékok/szövegek keresése
            const keywords = ['kandallo', 'termék', 'ár', 'price', 'product', 'file', 'pdf', 'sparhelt', 'kemence', 'grill'];
            
            document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div').forEach((el) => {
                try {
                    const text = el.textContent.trim();
                    if (text.length < 5 || text.length > 200) return;
                    
                    // Szűrés: csak egy szó egy div-ből, redundancia elkerülésé
                    const wordCount = text.split(/\s+/).length;
                    if (wordCount > 50) return; // Túl hosszú
                    
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
            
            console.log('  Found texts:', texts.length);
            documents = documents.concat(texts);
        }
        
        // KÉPEK
        if (findImages) {
            console.log('→ Extracting images...');
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
                    
                    images.push({
                        name: alt || 'Image',
                        type: '.jpg',
                        url: fullUrl,
                        source: 'image'
                    });
                } catch (e) {
                    console.error('Image error:', e);
                }
            });
            
            console.log('  Found images:', images.length);
            documents = documents.concat(images);
        }
        
        // DEDUPE
        documents = removeDuplicates(documents);
        
        console.log('Final result:', documents.length, 'documents');
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
        const key = (doc.name || '') + (doc.url || '');
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
        info.textContent = 'Még nem kereseztünk dokumentumokat.';
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
