// Content script - az oldal DOM-ját olvassa
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'extractDocuments') {
        const documents = extractDocuments(
            request.findLinks,
            request.findText,
            request.findImages
        );
        sendResponse({ documents });
    }
});

function extractDocuments(findLinks, findText, findImages) {
    let documents = [];
    
    // 1. Linkek keresése
    if (findLinks) {
        documents = documents.concat(extractLinks());
    }
    
    // 2. Dokumentum jellegű szövegek
    if (findText) {
        documents = documents.concat(extractTextDocuments());
    }
    
    // 3. Képek
    if (findImages) {
        documents = documents.concat(extractImages());
    }
    
    // Duplikátumok eltávolítása
    documents = removeDuplicates(documents);
    
    return documents;
}

// Linkek keresése
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
            // Teljes URL összeállítása
            let fullUrl = href;
            if (!href.startsWith('http')) {
                fullUrl = new URL(href, window.location.href).href;
            }
            
            // Dokumentum kiterjesztés ellenőrzése
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

// Szöveges dokumentumok keresése
function extractTextDocuments() {
    const documents = [];
    const documentKeywords = [
        'dokumentum', 'fájl', 'letöltés', 'report', 'invoice',
        'számlá', 'szerződés', 'naplózás', 'ügylet', 'megállapodás',
        'útmutató', 'kézikönyv', 'felhasználói', 'feltételek'
    ];
    
    // Összes szöveges element
    document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6').forEach((el) => {
        const text = el.textContent.trim();
        
        // Rövid szövegek elkerülése
        if (text.length < 5 || text.length > 200) return;
        
        // Keyword keresés
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

// Képek keresése
function extractImages() {
    const images = [];
    
    document.querySelectorAll('img').forEach((img) => {
        const src = img.getAttribute('src');
        const alt = img.getAttribute('alt');
        
        if (src) {
            // Teljes URL
            let fullUrl = src;
            if (!src.startsWith('http')) {
                fullUrl = new URL(src, window.location.href).href;
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

// Segédfüggvények
function getFileExtension(url) {
    const path = url.split('?')[0]; // Query string eltávolítása
    const parts = path.split('.');
    return parts.length > 1 ? '.' + parts[parts.length - 1].toLowerCase() : 'Fájl';
}

function extractFilename(url) {
    const path = url.split('?')[0]; // Query string eltávolítása
    const parts = path.split('/');
    return parts[parts.length - 1] || null;
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

console.log('Document Extractor - Content script loaded');
