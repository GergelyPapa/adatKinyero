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
    
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {
            action: 'extractDocuments',
            findLinks,
            findText,
            findImages
        }, (response) => {
            showLoading(false);
            
            if (chrome.runtime.lastError) {
                showStatus('Hiba: ' + chrome.runtime.lastError.message, 'error');
                return;
            }
            
            extractedDocuments = response.documents || [];
            updateUI();
        });
    });
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
