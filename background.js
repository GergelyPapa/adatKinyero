// Service Worker (Background script) - Manifest V3
// Chrome bővítmény háttérben futó logikája

// Bővítmény telepítéskor
chrome.runtime.onInstalled.addListener(async () => {
    console.log('Document Extractor - Bővítmény telepítve!');
    
    // Default beállítások
    try {
        const result = await chrome.storage.local.get(['filename', 'filter']);
        if (!result.filename) {
            await chrome.storage.local.set({
                filename: 'dokumentumok',
                filter: '',
                colName: true,
                colType: true,
                colUrl: true
            });
        }
    } catch (error) {
        console.error('Storage inicializálási hiba:', error);
    }
    
    // Context menu létrehozása
    try {
        await chrome.contextMenus.create({
            id: 'extract-docs',
            title: 'Dokumentumok keresése',
            contexts: ['page', 'link', 'image']
        });
    } catch (error) {
        console.log('Context menu már létezik vagy hiba:', error);
    }
});

// Context menu kattintás
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === 'extract-docs') {
        try {
            await chrome.action.openPopup();
        } catch (error) {
            console.error('Popup megnyitási hiba:', error);
        }
    }
});

// Üzenet kezelés más scriptekből
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getSettings') {
        chrome.storage.local.get(null, (items) => {
            sendResponse(items);
        });
        return true; // Async válasz
    }
});
