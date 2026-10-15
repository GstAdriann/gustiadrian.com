(function injectFavicon() {
    const FAVICON_PATH = '/favicon/favicon.ico';
    let faviconLink = document.querySelector("link[rel*='icon']");
    
    if (!faviconLink) {
        faviconLink = document.createElement('link');
        faviconLink.rel = 'shortcut icon';
        document.head.appendChild(faviconLink);
    }
    
    faviconLink.href = FAVICON_PATH;
    
    if (FAVICON_PATH.endsWith('.png')) {
        faviconLink.type = 'image/png';
    } else if (FAVICON_PATH.endsWith('.webp')) {
        faviconLink.type = 'image/webp';
    } else if (FAVICON_PATH.endsWith('.svg')) {
        faviconLink.type = 'image/svg+xml';
    } else {
        faviconLink.type = 'image/x-icon';
    }
})();