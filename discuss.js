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
            } else if (href.endsWith('.html')) {
                e.preventDefault();
                document.body.classList.remove("page-loaded");
                document.body.classList.add("page-exit");
                setTimeout(() => { window.location.href = href; }, 400);
            }
        });
    });

    const themeToggleBtn = document.getElementById("theme-toggle");
    const themeIcon = document.getElementById("theme-icon");
    const htmlEl = document.documentElement;
    const savedTheme = localStorage.getItem("theme") || "dark";
    htmlEl.setAttribute("data-theme", savedTheme);
    if (themeIcon) themeIcon.className = savedTheme === "light" ? "fa-solid fa-sun" : "fa-solid fa-moon";

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", () => {
            const newTheme = htmlEl.getAttribute("data-theme") === "dark" ? "light" : "dark";
            htmlEl.setAttribute("data-theme", newTheme);
            localStorage.setItem("theme", newTheme);
            if (themeIcon) themeIcon.className = newTheme === "light" ? "fa-solid fa-sun" : "fa-solid fa-moon";
        });
    }

    const packageSelect = document.getElementById('packageSelect');
    const quantityInput = document.getElementById('orderQuantity');
    const paypalTotalEl = document.getElementById('paypal-total-price');
    const dokuTotalEl = document.getElementById('doku-total-price');
    
    let currentPriceUSD = 0;
    let currentPriceIDR = 0;
    let currentClientData = {};

    const packageData = {
        'icon': { usd: 10, idr: 160000, label: "Icon Design" },
        'thumbnail': { usd: 15, idr: 240000, label: "Thumbnail Design" },
        'custom': { usd: 7, idr: 112000, label: "Custom Design" }
    };

    function calculateTotal() {
        if(!packageSelect.value) return;
        const pkg = packageData[packageSelect.value];
        const qty = parseInt(quantityInput.value) || 1;
        
        currentPriceUSD = pkg.usd * qty;
        currentPriceIDR = pkg.idr * qty;
        
        if(paypalTotalEl) paypalTotalEl.innerText = currentPriceUSD.toFixed(2);
        if(dokuTotalEl) dokuTotalEl.innerText = currentPriceIDR.toLocaleString('id-ID');
    }

    if(packageSelect) packageSelect.addEventListener('change', calculateTotal);
    if(quantityInput) quantityInput.addEventListener('input', calculateTotal);

    const orderForm = document.getElementById('orderForm');
    const paymentModal = document.getElementById('paymentModal');
    const closeModalBtn = document.getElementById('closeModalBtn');

    if(orderForm) {
        orderForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(orderForm);
            currentClientData = Object.fromEntries(formData.entries());
            currentClientData.quantity = parseInt(quantityInput.value) || 1;
            paymentModal.classList.add('active');
            document.body.style.overflow = 'hidden'; 
        });
    }

    const closeModal = () => {
        paymentModal.classList.remove('active');
        document.body.style.overflow = '';
    };
    if(closeModalBtn) closeModalBtn.addEventListener('click', closeModal);

    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanels.forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`tab-${btn.getAttribute('data-tab')}`).classList.add('active');
        });
    });

    const FORMSUBMIT_TARGET = "16d2d3dbf409e9875d1e55c697a1fccf";

    if (typeof paypal !== "undefined") {
        paypal.Buttons({
            createOrder: function(data, actions) {
                return actions.order.create({ purchase_units: [{ amount: { value: currentPriceUSD.toString() } }] });
            },
            onApprove: function(data, actions) {
                return actions.order.capture().then(function(details) {
                    processSuccessfulPayment(currentClientData, "PayPal - PAID", currentPriceUSD, "USD");
                    alert(`Payment successful! Thank you ${details.payer.name.given_name}.`);
                });
            }
        }).render('#paypal-button-container');
    }

    const dokuBtn = document.getElementById("doku-btn");
    const dokuConfirmBtn = document.getElementById("doku-confirm-btn");
    const qrisContainer = document.getElementById("qris-container");
    const qrisImage = document.getElementById("qris-image");

    if (dokuBtn) {
        dokuBtn.addEventListener("click", async () => {
            dokuBtn.innerHTML = "Generating... <i class='fa-solid fa-circle-notch fa-spin'></i>";
            dokuBtn.disabled = true;
            try {
                const response = await fetch("doku-backend/api/generate-qris.js", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ amount: currentPriceIDR, order_id: "ORD-" + Date.now() })
                });
                const result = await response.json();
                if (result.qris_url) {
                    qrisImage.src = result.qris_url;
                    qrisContainer.style.display = "block";
                    dokuBtn.style.display = "none";
                    dokuConfirmBtn.style.display = "flex";
                }
            } catch (error) {
                setTimeout(() => {
                    qrisContainer.style.display = "block";
                    qrisImage.src = "qris-placeholder.png"; 
                    dokuBtn.style.display = "none";
                    dokuConfirmBtn.style.display = "flex";
                }, 1500);
            }
        });
    }

    if (dokuConfirmBtn) {
        dokuConfirmBtn.addEventListener("click", () => {
            processSuccessfulPayment(currentClientData, "DOKU QRIS", currentPriceIDR, "IDR");
            alert("Order Submitted! We will verify your QRIS payment shortly.");
        });
    }

    function processSuccessfulPayment(data, paymentMethod, totalPaid, currency) {
        const pkg = packageData[data.packageSelect];
        const packageLabelStr = pkg ? `${pkg.label} (Qty: ${data.quantity})` : "N/A";
        fetch(`https://formsubmit.co/ajax/${FORMSUBMIT_TARGET}`, {
            method: "POST",
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({
                Name: data.clientName,
                Email: data.clientEmail,
                Package: packageLabelStr,
                Total_Paid: `${currency} ${totalPaid}`,
                Contact: data.comm_method,
                Discord: data.discordUsername || "N/A",
                Payment_Status: paymentMethod,
                _subject: `💰 PAID ORDER: ${packageLabelStr} from ${data.clientName}`,
                _template: "table"
            })
        }).then(() => {
            closeModal();
            if(orderForm) orderForm.reset();
            qrisContainer.style.display = "none";
            if(dokuBtn) dokuBtn.style.display = "block";
            if(dokuConfirmBtn) dokuConfirmBtn.style.display = "none";
            paypalTotalEl.innerText = "0.00";
            dokuTotalEl.innerText = "0";
        });
    }
});