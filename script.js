// Inisialisasi Smooth Scroll (Lenis)
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

// Integrasi Lenis dengan navigasi
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        lenis.scrollTo(this.getAttribute('href'));
    });
});

document.addEventListener("DOMContentLoaded", () => {

    // Inisialisasi AOS //
    AOS.init({
        duration: 1000,
        once: false, // Animasi ulang setiap scroll ke atas/bawah
        mirror: true,
        easing: 'ease-out-back'
    });
    
    // 1. ADVANCED BOOT SEQUENCE
    const loader = document.getElementById("loader");
    const bootLog = document.getElementById("boot-log");
    const statusText = document.getElementById("boot-status-text");
    const segments = document.querySelectorAll(".bar-segment");
    const bootInteraction = document.querySelector(".boot-interaction"); // Selector diperbaiki

    // 🔊 BOOT SOUNDS
    const bootBeep = document.getElementById("boot-beep");
    const bootConfirm = document.getElementById("boot-confirm");

    if (bootBeep) bootBeep.volume = 0.25;
    if (bootConfirm) bootConfirm.volume = 0.4;

    const bootLines = [
        "Initializing Akira Core...",
        "Checking System Memory...",
        "Loading Visual Modules...",
        "Syncing VTuber Assets...",
        "Establishing Secure Channel...",
        "Compiling UI Shaders...",
        "Finalizing Boot Sequence..."
    ];

    let currentLine = 0;

    function addBootLine(text) {
        const line = document.createElement("div");
        line.className = "boot-line";
        line.textContent = "> " + text;
        bootLog.appendChild(line);
        bootLog.scrollTop = bootLog.scrollHeight;

        if (bootBeep) {
            bootBeep.playbackRate = 0.9 + Math.random() * 0.3;
            bootBeep.currentTime = 0;
            bootBeep.play().catch(() => {});
        }
    }

    // 🔓 AUDIO UNLOCK
    let audioUnlocked = false;
    let bootStarted = false;

    function unlockAudio() {
        if (audioUnlocked) return;
        [bootBeep, bootConfirm].forEach(audio => {
            if (!audio) return;
            audio.volume = 0;
            audio.play().then(() => {
                audio.pause();
                audio.currentTime = 0;
                audio.volume = audio === bootBeep ? 0.25 : 0.4;
            }).catch(() => {});
        });
        audioUnlocked = true;
    }

    // Handle Boot Click
    if (bootInteraction) {
        bootInteraction.addEventListener("click", () => {
            if (bootStarted) return;
            bootStarted = true;

            unlockAudio();
            bootInteraction.classList.add("boot-hide"); // Efek menghilang

            // Delay sedikit biar cinematic
            setTimeout(() => {
                runBoot();
            }, 500);
        });
    }

    function runBoot() {
        if (currentLine < bootLines.length) {
            addBootLine(bootLines[currentLine]);
            statusText.textContent = bootLines[currentLine].toUpperCase();

            if (segments[currentLine]) {
                segments[currentLine].classList.add("active");
            }

            currentLine++;
            setTimeout(runBoot, 300 + Math.random() * 300);
        } else {
            statusText.textContent = "SYSTEM ONLINE";
            if (bootConfirm) {
                bootConfirm.currentTime = 0;
                bootConfirm.play().catch(() => {});
            }
            finishBoot();
        }
    }

    function finishBoot() {
        setTimeout(() => {
            loader.style.opacity = "0";
            setTimeout(() => {
                loader.style.display = "none";
                animateEntrance(); 
            }, 800);
        }, 600);
    }


    // 2. Navigation (SPA Feel)
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('.page');

    function switchPage(pageId) {
        const currentSection = document.querySelector('.page.active-page');
        const targetSection = document.getElementById(pageId);

        if (!targetSection || currentSection.id === pageId) return;

        // 1. Animasi Keluar
        gsap.to(currentSection, {
            opacity: 0,
            y: -20,
            duration: 0.3,
            onComplete: () => {
                // Hilangkan class active dari halaman sebelumnya
                currentSection.classList.remove('active-page');
                
                // Tambahkan class active ke halaman baru
                targetSection.classList.add('active-page');
                
                // 2. Animasi Masuk
                gsap.fromTo(targetSection, 
                    { opacity: 0, y: 20 },
                    { 
                        opacity: 1, 
                        y: 0, 
                        duration: 0.5, 
                        onComplete: () => {
                            // REFRESH SEMUA PLUGIN SETELAH PAGE MUNCUL
                            AOS.refresh();
                            ScrollTrigger.refresh();
                            lenis.scrollTo(0, { immediate: true });

                            if (pageId === 'about') {
                                gsap.to('.fill-about', {
                                    width: (index, el) => el.getAttribute('data-width'),
                                    duration: 1.5,
                                    ease: "expo.out",
                                    stagger: 0.2
                                });

                                // ANIMATION TYPING
                                const bioText = document.querySelector(".typing-effect");
                                gsap.from(bioText, {
                                    opacity: 0,
                                    y: 10,
                                    duration: 1,
                                    delay: 0.5
                                });
                            }

                            if(pageId === 'protocol') {
                                initProtocolAnimation();
                            }
                            AOS.refresh(); 
                            ScrollTrigger.refresh();
                            
                            // Cek jika masuk ke protocol, paksa jalankan observer jika sudah di view
                            if(pageId === 'protocol') {
                                const steps = targetSection.querySelectorAll('.protocol-step');
                                steps.forEach(step => {
                                    // Jika elemen ada di layar, langsung beri class visible
                                    const rect = step.getBoundingClientRect();
                                    if(rect.top < window.innerHeight) {
                                        step.classList.add('visible');
                                    }
                                });
                            }
                        }
                        
                    }
                );
            }
        });

        // Update Nav Links
        navLinks.forEach(link => {
            link.classList.remove('active');
            if(link.getAttribute('data-page') === pageId) link.classList.add('active');
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetPage = link.getAttribute('data-page');
            switchPage(targetPage);
        });
    });

    window.navigateTo = (pageId) => {
        switchPage(pageId);
    };

    // 3. Load Commission Data
    const grid = document.getElementById('portfolio-grid');
    let commissionsData = [
        {
            id: 1, 
            title: "VTuber Highlight", 
            category: "Video", 
            price: "Rp 100.000 - Rp 250.000",
            queueCurrent: "1",
            queueMax: "5",
            thumbnail: "https://files.catbox.moe/wlc1ga.png",
            description: "Funny compilations with memes.",
            fullDescription: "Editing stream VODs menjadi video highlight yang lucu dan cepat. Paket ini fokus pada retensi penonton YouTube dengan penambahan meme, SFX, dan zoom in/out yang dinamis.",
            deliveryTime: "3-5 Days",
            revisions: "2x Major",
            commercial: "Included",
            sourceFile: "No",
            includes: ["1080p 60fps Render", "Dynamic Subtitles", "Meme & SFX", "Thumbnail (Simple)"],
            previewLink: "https://files.catbox.moe/wlc1ga.png" 
        },
        {
            id: 2, 
            title: "Stinger Transition", 
            category: "Transition", 
            price: "Rp 350.000",
            queueCurrent: "0",
            queueMax: "5",
            thumbnail: "https://files.catbox.moe/wlc1ga.png",
            description: "Custom animated stinger.",
            fullDescription: "Transisi animasi mulus untuk pindah scene di OBS. Disesuaikan dengan warna dan tema model VTuber kamu. File transparan (.mov) siap pakai.",
            deliveryTime: "2 Days",
            revisions: "Unlimited Minor",
            commercial: "Included",
            sourceFile: "Yes (.mov)",
            includes: ["Transparent .MOV file", "Sound Effect (SFX)", "OBS Setup Guide"],
            previewLink: "https://files.catbox.moe/wlc1ga.png"
        },
        {
            id: 3, title: "CSS Overlay", 
            category: "Transition", 
            price: "Rp 300.000",
            queueCurrent: "0",
            queueMax: "5",
            thumbnail: "https://files.catbox.moe/wlc1ga.png",
            description: "Chat box widget styling.",
            fullDescription: "Koding CSS khusus untuk mempercantik chat box Streamlabs/Streamelements agar sesuai tema overlay kamu.",
            deliveryTime: "1 Day",
            revisions: "3x",
            commercial: "Included",
            sourceFile: "CSS Code",
            includes: ["Custom CSS Code", "Installation Guide", "Font Styling"],
            previewLink: "https://files.catbox.moe/wlc1ga.png"
        },
        {
            id: 4, title: "VTuber MV Production", 
            category: "MV", 
            price: "Rp 1.500.000+",
            queueCurrent: "1",
            queueMax: "5",
            thumbnail: "https://files.catbox.moe/wlc1ga.png",
            description: "High quality Music Video.",
            fullDescription: "Video Musik (MV) full production untuk cover song atau lagu original. Menggunakan After Effects untuk tipografi kinetik dan efek visual tingkat lanjut.",
            deliveryTime: "7-14 Days",
            revisions: "2x Major",
            commercial: "Included",
            sourceFile: "No",
            includes: ["4K Render", "Kinetic Typography", "VFX & Particles", "Storyboard Review"],
            previewLink: "https://files.catbox.moe/wlc1ga.png"
        },
        {
            id: 5, title: "Custom Stream BGM", 
            category: "Audio", 
            price: "Rp 250.000 - Rp 550.000",
            queueCurrent: "2",
            queueMax: "5",
            thumbnail: "https://files.catbox.moe/wlc1ga.png",
            description: "Custom composed BGM.",
            fullDescription: "Musik latar original yang dibuat khusus untuk stream kamu (Starting, Talking, Ending). Bebas copyright strike.",
            deliveryTime: "5-7 Days",
            revisions: "2x",
            commercial: "Included",
            sourceFile: "WAV/MP3",
            includes: ["Loopable Track", "High Quality Mix", "Stems (Optional)"],
            previewLink: "https://files.catbox.moe/wlc1ga.png"
        },
        {
            id: 6, title: "Vertical Shorts / TikTok", 
            category: "Shorts", 
            price: "Rp 20.000",
            queueCurrent: "3",
            queueMax: "7",
            thumbnail: "https://files.catbox.moe/wlc1ga.png",
            description: "Engaging portrait videos.",
            fullDescription: "Video vertikal yang dioptimalkan untuk algoritma TikTok/Reels. Hook di awal, potongan cepat, dan subtitle besar yang menarik perhatian.",
            deliveryTime: "1-2 Days",
            revisions: "1x Major",
            commercial: "Included",
            sourceFile: "No",
            includes: ["9:16 Vertical Format", "Hardcoded Subs", "Copyright Free Music"],
            previewLink: "https://files.catbox.moe/wlc1ga.png" 
        },
        {
            id: 7, title: "EDM POP",
            category: "Audio",
            price: "Rp 200.000 - Rp 300.000",
            queueCurrent: "1",
            queueMax: "5",
            thumbnail: "https://files.catbox.moe/45xnxh.png",
            description: "Music For BGM",
            fullDescription: "Musik dengan genre EDM yang mungkin cocok dengan karakter atau lore kamu",
            deliveryTime: "3 - 4 Days",
            revisions: "2x",
            commercial: "Included (jika ingin file .flp nya maka akan ada biaya tambahan)",
            sourceFile: "WAV/MP3",
            includes: [ "Loopable track", "High Quality Mix"],
            previewLink: "https://files.catbox.moe/isgmgx.mp4"
        }
    ];
    
    renderCommissions(commissionsData);

    function renderCommissions(items) {
        grid.innerHTML = '';
        items.forEach(item => {
            const card = document.createElement('div');
            // Ganti class jadi 'tech-card' biar styling baru masuk
            card.classList.add('tech-card'); 
            
            // Logika warna status antrian
            const queue = getQueueStatus(item.queueCurrent, item.queueMax);
            let statusColorClass = 'status-available';
            if(queue.label === 'FULL') statusColorClass = 'status-full';
            else if(queue.label === 'LIMITED') statusColorClass = 'status-limited';

            card.innerHTML = `
                <!-- Dekorasi Sudut Tech -->
                <span class="tech-corner tl"></span>
                <span class="tech-corner tr"></span>
                <span class="tech-corner bl"></span>
                <span class="tech-corner br"></span>

                <div class="card-visual">
                    <div class="img-wrapper">
                        <img src="${item.thumbnail}" alt="${item.title}">
                        <div class="scan-overlay"></div>
                    </div>
                    
                    <!-- Badge Status Antrian Baru -->
                    <div class="tech-badge ${statusColorClass}">
                        <span class="status-dot"></span>
                        <span class="status-text">SLOTS: ${item.queueCurrent}/${item.queueMax}</span>
                    </div>
                </div>

                <div class="card-content">
                    <div class="content-header">
                        <h3 class="tech-title">${item.title}</h3>
                        <div class="tech-price">${item.price}</div>
                    </div>
                    
                    <p class="tech-desc">${item.description}</p>

                    <button 
                        class="btn-cyber ${queue.label === "FULL" ? "disabled" : ""}"
                        onclick="openModal(${item.id})">
                        <span class="btn-text">${queue.label === "FULL" ? "LOCKED" : "ACCESS_DATA"}</span>
                        <span class="btn-glitch"></span>
                    </button>
                </div>
            `;

            grid.appendChild(card);
        });
    }

    // 4. Filtering
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const category = btn.getAttribute('data-filter');
            if (category === 'all') {
                renderCommissions(commissionsData);
            } else {
                const filtered = commissionsData.filter(item => item.category === category);
                renderCommissions(filtered);
            }
        });
    });

    // 5. Modal Logic
    const modal = document.getElementById('commission-modal');
    const closeModalBtn = document.querySelector('.close-modal');

    function getSmartEmbedUrl(url) {
        let videoId = "";
        if (url.includes("youtu.be/")) {
            videoId = url.split("youtu.be/")[1].split("?")[0];
        } else if (url.includes("watch?v=")) {
            videoId = url.split("watch?v=")[1].split("&")[0];
        } else if (url.includes("shorts/")) {
            videoId = url.split("shorts/")[1].split("?")[0];
        } else if (url.includes("embed/")) {
            videoId = url.split("embed/")[1].split("?")[0];
        } else {
            return url; 
        }
        return `https://www.youtube.com/embed/${videoId}`;
    }

    const faqByCategory = {
        "Transition": [
            { quick: "✔️ Kompatibel OBS", detail: "CSS Overlay diuji di OBS dan Streamlabs." },
            { quick: "✔️ Revisi gratis 2x", detail: "Revisi mayor mencakup layout dan animasi utama." }
        ],
        "MV": [
            { quick: "✔️ Editing cinematic", detail: "Menggunakan After Effects dengan kinetic typography." },
            { quick: "✔️ Output hingga 4K", detail: "Default 1080p, bisa request 4K." }
        ],
        "Video": [
            { quick: "✔️ Retention-focused", detail: "Hook 5 detik pertama dan pacing cepat." }
        ]
    };

    let bundleItems = [];

    window.openModal = (id) => {
        const item = commissionsData.find(i => i.id === id);
        if(!item) return;

        const message = encodeURIComponent(`Hi Akira, I want to order: ${item.title}`);
        const orderBtn = document.getElementById("order-discord");
        orderBtn.href = `https://discord.com/users/931517941659344946?message=${message}`;

        const queueStatus = getQueueStatus(item.queueCurrent, item.queueMax);
        document.getElementById("modal-queue").innerText = `${item.queueCurrent}/${item.queueMax} • ${queueStatus.label}`;

        document.getElementById('modal-title').innerText = item.title;
        document.getElementById('modal-price').innerText = item.price;
        document.getElementById('modal-desc').innerText = item.fullDescription || item.description;
        document.getElementById('modal-cat-badge').innerText = item.category || "Service";
        document.getElementById('modal-time-badge').innerText = item.deliveryTime || "TBD";
        document.getElementById('modal-revisions').innerText = item.revisions || "Standard";
        document.getElementById('modal-commercial').innerText = item.commercial || "Ask Me";
        document.getElementById('modal-source').innerText = item.sourceFile || "No";

        // FAQ Logic
        const faqContainer = document.getElementById("modal-faq");
        faqContainer.innerHTML = "";
        const faqs = faqByCategory[item.category] || [];
        faqs.forEach(faq => {
            const faqItem = document.createElement("div");
            faqItem.className = "faq-mini";
            faqItem.innerHTML = `
                <div class="faq-quick">
                    <span>${faq.quick}</span>
                    <button class="faq-toggle">Lihat detail</button>
                </div>
                <div class="faq-detail">${faq.detail}</div>
            `;
            faqItem.querySelector(".faq-toggle").onclick = () => faqItem.classList.toggle("open");
            faqContainer.appendChild(faqItem);
        });
        if (!faqs.length) faqContainer.innerHTML = "<p class='text-muted'>No specific FAQ for this service.</p>";

        // Progress Bar
        const current = Number(item.queueCurrent);
        const max = Number(item.queueMax);
        const percent = Math.min((current / max) * 100, 100);
        const queueFill = document.getElementById("queue-fill");
        document.getElementById("queue-text").innerText = `${current} / ${max}`;
        queueFill.style.width = percent + "%";
        queueFill.classList.remove("warning", "full");
        
        if (current >= max) {
            queueFill.classList.add("full");
            orderBtn.classList.add("disabled");
            orderBtn.innerText = "Queue Full";
            orderBtn.style.pointerEvents = "none";
        } else if (current >= max * 0.7) {
            queueFill.classList.add("warning");
            orderBtn.classList.remove("disabled");
            orderBtn.innerText = "Order via Discord";
            orderBtn.style.pointerEvents = "auto";
        } else {
            orderBtn.classList.remove("disabled");
            orderBtn.innerText = "Order via Discord";
            orderBtn.style.pointerEvents = "auto";
        }

        // Features List
        const listContainer = document.getElementById('modal-includes');
        listContainer.innerHTML = '';
        if(item.includes && item.includes.length > 0) {
            item.includes.forEach(feat => {
                const li = document.createElement('li');
                li.innerText = feat;
                listContainer.appendChild(li);
            });
        }

        // Media Embed
        const mediaContainer = document.getElementById('modal-media-container');
        mediaContainer.innerHTML = "";
        const link = item.previewLink;
        if (link.includes("youtube.com") || link.includes("youtu.be")) {
            mediaContainer.innerHTML = `<iframe src="${getSmartEmbedUrl(link)}?rel=0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
        } else if (link.match(/\.(mp4|webm)$/)) {
            mediaContainer.innerHTML = `<video controls muted playsinline><source src="${link}" type="video/mp4"></video>`;
        } else {
            mediaContainer.innerHTML = `<img src="${item.thumbnail}" alt="Preview">`;
        }

        // Recommendations Logic (BUG FIX: commissions -> commissionsData)
        const recommendList = document.getElementById("recommend-list");
        recommendList.innerHTML = "";
        const recommendMap = { Video: ["Shorts", "Audio"], MV: ["Audio"], Code: ["Transition"], Audio: ["Video"] };
        const targetCategories = recommendMap[item.category] || [];
        
        const recommendations = commissionsData.filter(c => targetCategories.includes(c.category) && c.id !== item.id).slice(0, 3);

        recommendations.forEach(rec => {
            const card = document.createElement("div");
            card.className = "recommend-card";
            card.innerHTML = `<img src="${rec.thumbnail}"><h5>${rec.title}</h5><span>${rec.price}</span>`;
            card.onclick = () => openModal(rec.id);
            recommendList.appendChild(card);
        });
        document.querySelector(".recommend-wrapper").style.display = recommendations.length ? "block" : "none";

        // Bundle Reset
        const addBtn = document.getElementById("add-bundle");
        addBtn.onclick = () => {
            if (bundleItems.find(b => b.id === item.id)) return;
            bundleItems.push(item);
            renderBundle();
        };

        lenis.stop();
        modal.classList.add('open');
        lenis.stop(); // Hentikan scroll utama

        // GSAP Modal Entrance
        const modalContent = modal.querySelector('.modal-content');
        const modalItems = modal.querySelectorAll('.info-section, .modal-header, .order-actions');

        gsap.fromTo(modalContent, 
            { scale: 0.8, opacity: 0, y: 50 },
            { scale: 1, opacity: 1, y: 0, duration: 0.6, ease: "expo.out" }
        );

        gsap.from(modalItems, {
            opacity: 0,
            x: 20,
            stagger: 0.1,
            duration: 0.5,
            delay: 0.2,
            ease: "power2.out"
        });
    };

    // 1. Fungsi untuk menghapus item dari array bundle
    window.removeFromBundle = (id) => {
        // Mencari semua item kecuali yang ID-nya diklik
        bundleItems = bundleItems.filter(item => item.id !== id);
        
        // Jika bundle kosong setelah dihapus, sembunyikan kotaknya
        if (bundleItems.length === 0) {
            document.getElementById("bundle-box").style.display = "none";
        }
        
        // Update tampilan
        renderBundle();
    };

    // 2. Fungsi untuk menampilkan isi bundle
    function renderBundle() {
        const bundleBox = document.getElementById("bundle-box");
        const bundleList = document.getElementById("bundle-list");
        const bundleTotal = document.getElementById("bundle-total");
        const bundleOrder = document.getElementById("bundle-order");

        // Munculkan kotak bundle jika ada isinya
        if (bundleItems.length > 0) {
            bundleBox.style.display = "block";
        }

        bundleList.innerHTML = "";
        let total = 0;
        
        bundleItems.forEach(b => {
            const li = document.createElement("li");
            li.style.display = "flex";
            li.style.justifyContent = "space-between";
            li.style.alignItems = "center";
            li.style.marginBottom = "8px";
            li.style.padding = "5px 10px";
            li.style.background = "rgba(255,255,255,0.05)";
            li.style.borderRadius = "5px";

            // Template baris item dengan tombol hapus
            li.innerHTML = `
                <span style="font-size: 0.85rem;">• ${b.title}</span>
                <button onclick="removeFromBundle(${b.id})" 
                        style="background:none; border:none; color:#ff4d4d; cursor:pointer; padding:5px;">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            bundleList.appendChild(li);

            // Hitung total harga
            const rawString = b.price.split("-")[0]; 
            const num = parseInt(rawString.replace(/\D/g, ""));
            if (!isNaN(num)) total += num;
        });

        const formattedTotal = total.toLocaleString('id-ID');
        bundleTotal.innerText = `Total: Est. Rp ${formattedTotal}`;
        
        const message = encodeURIComponent(`Hi Akira, Bundle Order:\n\n` + bundleItems.map(b => `• ${b.title}`).join("\n") + `\n\nTotal: Est. Rp ${formattedTotal}`);
        bundleOrder.href = `https://discord.com/users/931517941659344946?message=${message}`;
    }
    

    window.closeModal = () => {
        modal.classList.remove('open');
        document.getElementById('modal-media-container').innerHTML = ''; 
        lenis.start();
    };

    closeModalBtn.addEventListener('click', window.closeModal);
    modal.addEventListener('click', (e) => {
        if(e.target === modal) window.closeModal();
    });

    // 6. GSAP Animations (PERBAIKAN)
    function animateEntrance() {
        if(typeof gsap !== 'undefined') {
            const tl = gsap.timeline();
            
            // Pastikan halaman home terlihat dulu
            gsap.set(".active-page", { opacity: 1 });

            tl.from(".navbar", { y: -100, opacity: 0, duration: 1, ease: "expo.out" })
            .from(".glitch-hero", { 
                x: -100, 
                opacity: 0, 
                duration: 1.2, 
                skewX: 10, 
                ease: "power4.out" 
            }, "-=0.5")
            .from(".hero-role-wrapper", { 
                width: 0, 
                opacity: 0, 
                duration: 1, 
                ease: "expo.inOut" 
            }, "-=0.8")
            .from(".hero-desc", { 
                y: 20, 
                opacity: 0, 
                duration: 0.8 
            }, "-=0.5")
            .from(".hero-actions .btn", { 
                scale: 0, 
                opacity: 0, 
                stagger: 0.2, 
                ease: "back.out(1.7)" 
            }, "-=0.5")
            .from(".holo-deck", { 
                scale: 0.5, 
                rotateY: -45, 
                opacity: 0, 
                duration: 1.5, 
                ease: "expo.out" 
            }, "-=1");

            // Refresh AOS agar mendeteksi posisi scroll setelah animasi masuk
            AOS.refresh();
        }
    }

    // TAMBAHAN: LOGIKA SLIDESHOW VIDEO
    function initSlideshow() {
        const videos = document.querySelectorAll('.slide-video');
        if(videos.length < 2) return;
        
        let currentIndex = 0;
        
        setInterval(() => {
            // Hapus class active dari video sekarang
            videos[currentIndex].classList.remove('active');
            
            // Pindah ke index selanjutnya (looping)
            currentIndex = (currentIndex + 1) % videos.length;
            
            // Tambah class active ke video selanjutnya
            videos[currentIndex].classList.add('active');
            
            // Pastikan video diputar
            videos[currentIndex].play();
        }, 5000); // Ganti setiap 5 detik
    }

    // Panggil fungsi slideshow
    initSlideshow();

    // --- FAQ SYSTEM UPGRADED ---
    const faqItems = document.querySelectorAll(".faq-item");

    faqItems.forEach(item => {
        const questionBtn = item.querySelector(".faq-question");
        const answer = item.querySelector(".faq-answer");

        questionBtn.addEventListener("click", () => {
            const isOpen = item.classList.contains("active");

            // 1. Tutup semua item lain (Accordion Style)
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove("active");
                    otherItem.querySelector(".faq-answer").style.maxHeight = null;
                }
            });

            // 2. Toggle item yang diklik
            if (isOpen) {
                item.classList.remove("active");
                answer.style.maxHeight = null;
            } else {
                item.classList.add("active");
                // Set max-height sesuai tinggi konten asli (scrollHeight)
                answer.style.maxHeight = answer.scrollHeight + "px";
                
                // Tambahan: Mainkan sound effect kecil jika ada
                const hoverSound = document.getElementById("sfx-hover");
                if(hoverSound) {
                    hoverSound.currentTime = 0;
                    hoverSound.volume = 0.1;
                    hoverSound.play().catch(()=>{});
                }
            }
        });
    });

    // Contact Form
    const contactForm = document.getElementById("contact-form");
    if (contactForm) {
        contactForm.addEventListener("submit", e => {
            e.preventDefault();
            contactForm.classList.add("sending");
            setTimeout(() => {
                contactForm.classList.remove("sending");
                contactForm.querySelector(".form-success").style.display = "block";
                contactForm.reset();
            }, 1800);
        });
    }

    // Utility
    function getQueueStatus(current, max) {
        current = Number(current); max = Number(max);
        if (current >= max) return { label: "FULL", class: "queue-full" };
        if (current >= max - 1) return { label: "LIMITED", class: "queue-limited" };
        return { label: "AVAILABLE", class: "queue-open" };
    }

    /* --- SYSTEM AUDIO CONTROLLER (HOVER & CLICK) --- */
    function initSystemSounds() {
        const hoverSound = document.getElementById("sfx-hover");
        const clickSound = document.getElementById("sfx-click");

        // Atur volume agar tidak terlalu berisik
        if (hoverSound) hoverSound.volume = 0.1; 
        if (clickSound) clickSound.volume = 0.2;

        // Fungsi Helper untuk memutar suara (bisa overlap/spam)
        const playSfx = (audio) => {
            if (!audio) return;
            // Clone node memungkinkan suara diputar tumpang tindih (rapid fire)
            // atau cukup reset currentTime jika ingin hemat memori
            audio.currentTime = 0;
            audio.play().catch(() => {
                // Error handling jika browser memblokir audio (belum interaksi)
            });
        };

        // EVENT DELEGATION: Mendeteksi event di seluruh dokumen
        document.body.addEventListener("mouseover", (e) => {
            // Cek apakah elemen yang di-hover adalah target interaktif
            const target = e.target.closest("a, button, .card, .nav-link, .filter-btn, .social-icon, .close-modal");
            
            // Hindari memutar suara jika hover ke elemen yang sama berulang kali (opsional)
            if (target && !target.dataset.hoverSoundPlayed) {
                playSfx(hoverSound);
                
                // Trik kecil agar tidak spamming event pada elemen yang sama
                target.dataset.hoverSoundPlayed = "true";
                target.addEventListener("mouseleave", () => {
                    delete target.dataset.hoverSoundPlayed;
                }, { once: true });
            }
        });

        document.body.addEventListener("mousedown", (e) => {
            const target = e.target.closest("a, button, .card, .nav-link, .filter-btn, .social-icon, .close-modal");
            if (target) {
                playSfx(clickSound);
            }
        });
    }

    // Panggil fungsi ini
    initSystemSounds();

    // --- 7. Hexagon Mastery Animation ---
    const hexItems = document.querySelectorAll('.hex-wrapper');

    const hexObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Beri delay sedikit tiap item biar munculnya berurutan (Cascade Effect)
                setTimeout(() => {
                    entry.target.classList.add('active');
                }, index * 150); // Delay 150ms per item
                
                // Unobserve biar gak animasi ulang
                hexObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    hexItems.forEach(hex => hexObserver.observe(hex));

    // REC TIMER DI HOME
    const recTimeElement = document.getElementById("rec-time");
    if(recTimeElement) {
        let seconds = 0;
        setInterval(() => {
            seconds++;
            const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
            const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
            const s = (seconds % 60).toString().padStart(2, '0');
            recTimeElement.innerText = `${h}:${m}:${s}`;
        }, 1000);
    }

    // --- MOBILE MENU TOGGLE ---
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinksContainer = document.querySelector('.nav-links');

    if (mobileBtn && navLinksContainer) {
        mobileBtn.addEventListener('click', () => {
            navLinksContainer.classList.toggle('active');
            
            // Ganti icon dari bars ke times (X)
            const icon = mobileBtn.querySelector('i');
            if (navLinksContainer.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });

        // Tutup menu saat link diklik
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navLinksContainer.classList.remove('active');
                const icon = mobileBtn.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            });
        });
    } 
    initProtocolAnimation();

    // --- 1. LOAD REVIEWS FROM JSON ---
    const reviewGrid = document.getElementById('testimonial-grid');

    async function loadReviews() {
        if (!reviewGrid) return;

        try {
            // Mengambil data dari file JSON
            const response = await fetch('./reviews.json'); // Pastikan path sesuai
            const reviews = await response.json();

            reviewGrid.innerHTML = ''; // Bersihkan loading

            reviews.forEach(review => {
                const card = document.createElement('div');
                card.className = 'testimonial-card';
                
                // Generate Bintang (★) sesuai rating
                const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);

                card.innerHTML = `
                    <div class="card-visual-header">
                        <img src="${review.avatar}" alt="Client" onerror="this.src='https://ui-avatars.com/api/?name=${review.name}&background=0D8ABC&color=fff'">
                    </div>
                    <div class="stars-display">${stars}</div>
                    <p class="testimonial-text">“${review.text}”</p>
                    <div class="testimonial-meta">
                        <span class="testimonial-name">${review.name}</span>
                        <span class="testimonial-date">${review.date}</span>
                    </div>
                `;
                reviewGrid.appendChild(card);
            });

        } catch (error) {
            console.error('Gagal memuat review:', error);
            reviewGrid.innerHTML = '<p class="text-muted">Error loading database connection...</p>';
        }
    }

    // Panggil fungsi load saat web dibuka
    loadReviews();


    // --- 2. HANDLE FORM SUBMIT (SEND TO DISCORD) ---
    const reviewForm = document.getElementById('review-form');
    
    // GANTI URL INI DENGAN WEBHOOK DISCORD KAMU SENDIRI
    const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1452679632355856628/p-ZW8H0YBt-Wv1d6kk7WksH-eQk7vYNNZRqkk8c5UY5ianw5ePNnH8WBsL-WGGhN8Ao1";

    if (reviewForm) {
        reviewForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const name = document.getElementById('review-name').value;
            const text = document.getElementById('review-text').value;
            // Ambil nilai radio button yang terpilih
            const ratingSelector = document.querySelector('input[name="rating"]:checked');
            const rating = ratingSelector ? ratingSelector.value : "5";

            // Tombol Loading State
            const btn = reviewForm.querySelector('button');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> UPLOADING...';
            btn.disabled = true;

            // Format Pesan untuk Discord
            const payload = {
                content: "New Website Review Received!",
                embeds: [{
                    title: "Client Feedback Data",
                    color: 5763719, // Warna Hijau/Cyan
                    fields: [
                        { name: "Codename", value: name, inline: true },
                        { name: "Rating", value: "⭐ " + rating + "/5", inline: true },
                        { name: "Feedback", value: text }
                    ],
                    footer: { text: "Akira System V2.0" },
                    timestamp: new Date()
                }]
            };

            // Kirim ke Discord
            fetch(DISCORD_WEBHOOK_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })
            .then(response => {
                if (response.ok) {
                    // SweetAlert Sukses (Jika terinstall) atau Alert Biasa
                    if(typeof Swal !== 'undefined') {
                        Swal.fire({
                            title: 'UPLOAD COMPLETE',
                            text: 'Review sent for verification. It will appear after approval.',
                            icon: 'success',
                            background: '#13131f',
                            color: '#fff'
                        });
                    } else {
                        alert("Review Sent Successfully!");
                    }
                    reviewForm.reset();
                } else {
                    alert("Transmission Error. Check console.");
                }
            })
            .catch(err => {
                console.error(err);
                alert("System Offline. Cannot send data.");
            })
            .finally(() => {
                btn.innerHTML = originalText;
                btn.disabled = false;
            });
        });
    }
});

/* --- PARTICLE SYSTEM & VISUAL EFFECTS (Luar DOMLoaded) --- */
const canvas = document.getElementById("particle-bg");
const ctx = canvas.getContext("2d");
let particles = [];
const PARTICLE_COUNT = 80;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.radius = Math.random() * 1.5 + 0.5;
    }
    move() {
        this.x += this.vx; this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 243, 255, 0.7)";
        ctx.fill();
    }
}

function initParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());
}

function connectParticles() {
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
                ctx.strokeStyle = `rgba(189, 0, 255, ${1 - dist / 120})`;
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.move(); p.draw(); });
    connectParticles();
    requestAnimationFrame(animateParticles);
}

initParticles();
animateParticles();

// 3D Tilt Effect
document.querySelectorAll(".card").forEach(card => {
    const inner = card.querySelector(".card-inner");
    card.addEventListener("mousemove", e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const rotateY = ((x / rect.width) - 0.5) * 15;
        const rotateX = ((y / rect.height) - 0.5) * -15;
        inner.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    card.addEventListener("mouseleave", () => {
        inner.style.transform = "rotateX(0) rotateY(0)";
    });
});

// Cursor
const cursorDot = document.querySelector('[data-cursor-dot]');
const cursorOutline = document.querySelector('[data-cursor-outline]');
if(cursorDot && cursorOutline) {
    window.addEventListener("mousemove", function(e) {
        const posX = e.clientX;
        const posY = e.clientY;
        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;
        cursorOutline.animate({ left: `${posX}px`, top: `${posY}px` }, { duration: 500, fill: "forwards" });
    });
}

// Hacker Text
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
const hackerText = document.querySelector(".hero-title .neon-text");
if (hackerText) {
    hackerText.onmouseover = event => {
        let iteration = 0;
        clearInterval(event.target.interval);
        event.target.interval = setInterval(() => {
            event.target.innerText = event.target.innerText
                .split("").map((letter, index) => {
                    if(index < iteration) return event.target.dataset.value[index];
                    return letters[Math.floor(Math.random() * letters.length)]
                }).join("");
            if(iteration >= event.target.dataset.value.length) clearInterval(event.target.interval);
            iteration += 1 / 3; 
        }, 30);
    }
}

// Time
function updateTime() {
    const timeDisplay = document.getElementById('live-time');
    if(timeDisplay) {
        const now = new Date();
        timeDisplay.innerText = now.toLocaleTimeString('en-US', {hour12: false});
    }
}
setInterval(updateTime, 1000);
updateTime();

const magneticButtons = document.querySelectorAll('.btn, .nav-link, .filter-btn');

magneticButtons.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        gsap.to(btn, {
            x: x * 0.3, // Tombol mengikuti kursor 30%
            y: y * 0.3,
            duration: 0.3,
            ease: "power2.out"
        });
    });

    btn.addEventListener('mouseleave', () => {
        gsap.to(btn, {
            x: 0,
            y: 0,
            duration: 0.5,
            ease: "elastic.out(1, 0.3)" // Efek membal saat kursor pergi
        });
    });
});

gsap.registerPlugin(ScrollTrigger);

// Membuat garis sirkuit menyala saat scroll
gsap.to(".circuit-fill", {
    height: "100%", // Mengisi tinggi garis dari 0 ke 100%
    ease: "none",
    scrollTrigger: {
        trigger: ".protocol-container", // Animasi dimulai saat container ini terlihat
        start: "top 60%", // Mulai saat bagian atas container mencapai 60% layar
        end: "bottom 80%", // Berakhir saat bagian bawah container mencapai 80% layar
        scrub: 1, // Garis mengikuti gerakan scroll (halus)
    }
});
// Membuat setiap step protocol muncul secara dramatis saat dilewati scroll
document.querySelectorAll('.protocol-step').forEach((step, i) => {
    gsap.from(step, {
        scrollTrigger: {
            trigger: step,
            start: "top 80%",
        },
        x: i % 2 === 0 ? -100 : 100, // Dari kiri jika genap, kanan jika ganjil
        opacity: 0,
        duration: 1,
        ease: "expo.out"
    });
});

// --- PERBAIKAN PROTOCOL OBSERVER ---

// 1. Buat fungsinya dulu
function initProtocolAnimation() {
    const protocolSteps = document.querySelectorAll('.protocol-step');
    
    const protocolObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // Jika elemen masuk ke area pandang (viewport)
            if (entry.isIntersecting) {
                entry.target.classList.add('visible'); // Tambah class visible (agar muncul)
                
                // Opsional: Suara beep saat muncul
                const sfxHover = document.getElementById("sfx-hover");
                if(sfxHover) {
                    sfxHover.currentTime = 0;
                    sfxHover.volume = 0.1;
                    sfxHover.play().catch(() => {});
                }
                
                // Berhenti mengamati elemen ini jika sudah muncul sekali
                protocolObserver.unobserve(entry.target);
            }
        });
    }, { 
        threshold: 0.1, // Muncul saat 10% elemen terlihat
        rootMargin: "0px 0px -50px 0px" 
    });

    // Mulai mengamati setiap kotak step
    protocolSteps.forEach(step => {
        protocolObserver.observe(step);
    });
}
