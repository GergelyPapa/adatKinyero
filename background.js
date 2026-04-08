// Service Worker (Background script)
// Chrome bővítmény háttérben futó logikája

chrome.runtime.onInstalled.addListener(() => {
    console.log('Document Extractor - Bővítmény telepítve!');
    
    // Default beállítások
    chrome.storage.local.get(['filename', 'filter'], (result) => {
        if (!result.filename) {
            chrome.storage.local.set({
                filename: 'dokumentumok',
                filter: '',
                colName: true,
                colType: true,
                colUrl: true
            });
        }
    });
});

// Context menu - jobb klikk menü
chrome.contextMenus.create({
    id: 'extract-docs',
    title: 'Dokumentumok keresése',
    contexts: ['page', 'link', 'image']
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'extract-docs') {
        // Popup megnyitása
        chrome.action.openPopup();
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
