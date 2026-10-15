// =========================================
// AUTOMATIC FAVICON INJECTOR FOR ALL PAGES
// =========================================
(function injectFavicon() {
    // ⚙️ Atur path ke gambar favicon Anda di sini
    const FAVICON_PATH = '/favicon/favicon.ico'; // Atau ubah ke '/favicon.ico' / '/images/logo.png'
    
    // Cek apakah di <head> sudah ada tag favicon
    let faviconLink = document.querySelector("link[rel*='icon']");
    
    // Jika belum ada, buat elemen <link> baru
    if (!faviconLink) {
        faviconLink = document.createElement('link');
        faviconLink.rel = 'shortcut icon';
        document.head.appendChild(faviconLink);
    }
    
    // Pasang URL gambar dan tipe nilainya
    faviconLink.href = FAVICON_PATH;
    
    // Menyesuaikan tipe format gambar secara otomatis
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