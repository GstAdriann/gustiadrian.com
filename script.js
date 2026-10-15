document.addEventListener("DOMContentLoaded", () => {

    // === 1. INTRO ANIMATION & PAGE TRANSITION ===
    const introScreen = document.getElementById("intro-screen");
    const hasSeenIntro = sessionStorage.getItem("introPlayed");

    if (!hasSeenIntro && introScreen) {
        // Jika pertama kali buka, mainkan animasi logo
        setTimeout(() => {
            introScreen.classList.add("hidden"); // Layar meluncur ke atas
            
            // Tampilkan isi website setelah layar penutup mulai naik
            setTimeout(() => { document.body.classList.add("page-loaded"); }, 400); 
        }, 2200); // Durasi logo tampil sebelum tirai naik
        
        sessionStorage.setItem("introPlayed", "true"); // Tandai bahwa intro sudah diputar
    } else {
        // Jika user pindah halaman/reload, lewati intro agar tidak mengganggu
        if (introScreen) introScreen.style.display = "none";
        setTimeout(() => { document.body.classList.add("page-loaded"); }, 50);
    }

    // === 2. SEAMLESS PAGE TRANSITION (KLIK LINK) ===
    const internalLinks = document.querySelectorAll('a[href$=".html"], a[href^="index.html"], a[href^="inquiry.html"]');
    
    internalLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            const targetUrl = link.getAttribute("href");
            
            // Abaikan jika hanya klik link scroll (seperti #about)
            if (targetUrl.includes("#") && targetUrl.split("#")[0] === "" || targetUrl.split("#")[0] === window.location.pathname.split("/").pop()) {
                return; 
            }
            
            e.preventDefault(); 
            
            document.body.classList.remove("page-loaded");
            document.body.classList.add("page-exit");
            
            // Tunggu layar gelap sempurna baru pindah HTML
            setTimeout(() => {
                window.location.href = targetUrl;
            }, 400);
        });
    });

    // === 3. DARK / LIGHT MODE LOGIC ===
    const themeToggleBtn = document.getElementById("theme-toggle");
    const themeIcon = document.getElementById("theme-icon");
    const htmlEl = document.documentElement;
    
    const savedTheme = localStorage.getItem("theme") || "dark";
    htmlEl.setAttribute("data-theme", savedTheme);
    updateIcon(savedTheme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", () => {
            const currentTheme = htmlEl.getAttribute("data-theme");
            const newTheme = currentTheme === "dark" ? "light" : "dark";
            
            htmlEl.setAttribute("data-theme", newTheme);
            localStorage.setItem("theme", newTheme);
            updateIcon(newTheme);
        });
    }

    function updateIcon(theme) {
        if (!themeIcon) return;
        if (theme === "light") {
            themeIcon.className = "fa-solid fa-sun";
        } else {
            themeIcon.className = "fa-solid fa-moon";
        }
    }

    // === 4. CUSTOM CURSOR & MAGNETIC BUTTON ===
    const cursor = document.getElementById("cursor");
    const interactables = document.querySelectorAll(".interactive, a, button");
    
    let mouseX = window.innerWidth / 2; let mouseY = window.innerHeight / 2;
    let cursorX = mouseX; let cursorY = mouseY;
    
    window.addEventListener("mousemove", (e) => { mouseX = e.clientX; mouseY = e.clientY; });

    function renderCursor() {
        cursorX += (mouseX - cursorX) * 0.15;
        cursorY += (mouseY - cursorY) * 0.15;
        if (cursor) cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
        requestAnimationFrame(renderCursor);
    }
    renderCursor();

    interactables.forEach((el) => {
        el.addEventListener("mouseenter", () => {
            if(cursor) {
                const cursorText = el.getAttribute("data-cursor");
                if (cursorText) { cursor.classList.add("view-mode"); cursor.setAttribute("data-text", cursorText); } 
                else { cursor.classList.add("hovered"); }
            }
        });
        el.addEventListener("mouseleave", () => {
            if(cursor) { cursor.classList.remove("hovered", "view-mode"); cursor.removeAttribute("data-text"); }
        });
    });

    // === 5. SCROLL REVEAL ANIMATION ===
    const revealElements = document.querySelectorAll(".reveal");
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });
    
    revealElements.forEach(el => revealObserver.observe(el));
});

// Menghilangkan hash (#work, #about) dari Address Bar setelah di-scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth'
            });
            
            // Bersihkan URL tanpa melakukan reload halaman
            history.pushState(null, "", window.location.pathname);
        }
    });
});

// === HANDLE NAVBAR SCROLL & CLEAN URL HASH ===
document.querySelectorAll('.nav-links a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href.includes('#')) {
            const [page, hash] = href.split('#');
            const currentPage = window.location.pathname.split('/').pop() || 'index.html';
            if (currentPage === 'index.html' || currentPage === '' || page === 'index.html') {
                const targetElement = document.getElementById(hash);
                if (targetElement) {
                    e.preventDefault();
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                    history.pushState(null, "", window.location.pathname);
                }
            }
        }
    });
});