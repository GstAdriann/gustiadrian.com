document.addEventListener("DOMContentLoaded", () => {
    const introScreen = document.getElementById("intro-screen");
    const hasSeenIntro = sessionStorage.getItem("introPlayed");

    if (!hasSeenIntro && introScreen) {
        setTimeout(() => {
            introScreen.classList.add("hidden");
            setTimeout(() => { document.body.classList.add("page-loaded"); }, 400); 
        }, 2200);
        sessionStorage.setItem("introPlayed", "true");
    } else {
        if (introScreen) introScreen.style.display = "none";
        setTimeout(() => { document.body.classList.add("page-loaded"); }, 50);
    }

    const internalLinks = document.querySelectorAll('a[href$=".html"], a[href^="index.html"], a[href^="inquiry.html"]');
    
    internalLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            const targetUrl = link.getAttribute("href");
            
            if (targetUrl.includes("#") && targetUrl.split("#")[0] === "" || targetUrl.split("#")[0] === window.location.pathname.split("/").pop()) {
                return; 
            }
            
            e.preventDefault(); 
            
            document.body.classList.remove("page-loaded");
            document.body.classList.add("page-exit");
            
            setTimeout(() => {
                window.location.href = targetUrl;
            }, 400);
        });
    });

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

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth'
            });
            
            history.pushState(null, "", window.location.pathname);
        }
    });
});

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

document.addEventListener("DOMContentLoaded", () => {
    const statsContainer = document.querySelector('.about-stats');
    const statNumbers = document.querySelectorAll('.stat-number');
    let hasAnimated = false;

    const animateCounters = () => {
        statNumbers.forEach(num => {
            const target = +num.getAttribute('data-target');
            const duration = 1800;
            const frameDuration = 1000 / 60;
            const totalFrames = Math.round(duration / frameDuration);
            let frame = 0;

            const counter = setInterval(() => {
                frame++;
                const progress = frame / totalFrames;
                const currentCount = Math.round(target * (1 - Math.pow(1 - progress, 2)));

                num.textContent = currentCount;

                if (frame === totalFrames) {
                    num.textContent = target;
                    clearInterval(counter);
                }
            }, frameDuration);
        });
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasAnimated) {
                animateCounters();
                hasAnimated = true;
            }
        });
    }, { threshold: 0.4 });

    if (statsContainer) {
        observer.observe(statsContainer);
    }
});

// === 6. TESTIMONIAL IMAGE GALLERY MODAL ===
document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("imageModal");
    if (modal) {
        const modalImg = document.getElementById("modalImg");
        const closeBtn = document.querySelector(".close-modal");
        const prevBtn = document.getElementById("prevImg");
        const nextBtn = document.getElementById("nextImg");
        const caption = document.getElementById("modalCaption");
        
        let currentImages = [];
        let currentIndex = 0;

        // Membaca attribute data-images ketika dipencet
        document.querySelectorAll('.testi-preview').forEach(preview => {
            preview.addEventListener('click', function() {
                const imgsRaw = this.getAttribute('data-images');
                if (imgsRaw) {
                    currentImages = imgsRaw.split(',').map(img => img.trim());
                    currentIndex = 0;
                    updateModalImage();
                    modal.classList.add("active");
                    
                    // Stop scrolling di layar belakang
                    document.body.style.overflow = 'hidden';
                }
            });
        });

        // Ganti gambar dan angka urutan di dalam modal
        function updateModalImage() {
            if (currentImages.length > 0) {
                modalImg.src = currentImages[currentIndex];
                caption.textContent = `${currentIndex + 1} / ${currentImages.length}`;
                
                // --- TAMBAHKAN 2 BARIS INI UNTUK ANIMASI HALUS ---
                modalImg.style.animation = 'none';
                setTimeout(() => modalImg.style.animation = 'imgFadeIn 0.3s ease-out', 10);
                // -------------------------------------------------

                // Hilangkan tombol kiri-kanan jika gambar hanya 1
                const showNav = currentImages.length > 1 ? "flex" : "none";
                prevBtn.style.display = showNav;
                nextBtn.style.display = showNav;
            }
        }

        function closeModal() {
            modal.classList.remove("active");
            document.body.style.overflow = '';
            // Reset gambar setelah animasi menutup selesai
            setTimeout(() => modalImg.src = '', 300);
        }

        // Close dengan tombol X atau klik di luar gambar
        closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => { 
            if (e.target === modal || e.target.classList.contains('modal-content-wrapper')) {
                closeModal(); 
            }
        });

        // Navigasi Kiri & Kanan
        prevBtn.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
            updateModalImage();
        });
        
        nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % currentImages.length;
            updateModalImage();
        });
    }
});