(function () {
    /* ---------------- SETTINGS ----------------
        OPTION A (automatic, recommended): connect the Instagram account to a feed service such as
        behold.so, then paste its public JSON feed URL below. New posts appear on the site automatically.
        OPTION B (manual): leave feedUrl empty and paste post/reel links into `posts`, newest first.
    --------------------------------------------- */
    const IG = {
        profile: 'https://www.instagram.com/fitnessisluxury/',
        feedUrl: '',
        pageSize: 6,
        posts: [
            'https://www.instagram.com/reel/DYxHNLljbZX/',
            'https://www.instagram.com/p/DTiDZbxjTPw/',
            'https://www.instagram.com/p/DLKz2gmz3ob/',
            // 'https://www.instagram.com/reel/DVnKUNVjKeR/',
            // 'https://www.instagram.com/p/DbTG0ZCDbk8/',
            // 'https://www.instagram.com/reel/DTzVu7MjSeA/'
        ]
    };

    const grid = document.getElementById('ig-grid');
    const btn = document.getElementById('ig-load-more');
    const end = document.getElementById('ig-end');
    const sentinel = document.getElementById('ig-sentinel');
    let items = [], shown = 0, mode = 'embed', busy = false;

    const esc = s => String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

    function embedCard(url) {
        const clean = url.split('?')[0];
        return `<div class="rounded-2xl bg-brand-card border border-blue-100 hover:border-brand-gold/40 transition-all p-3 overflow-hidden">
            <blockquote class="instagram-media" data-instgrm-permalink="${esc(clean)}?utm_source=ig_embed" data-instgrm-version="14"
                style="background:#FFF; border:0; border-radius:12px; margin:0; max-width:100%; min-width:260px; width:100%;">
                <a href="${esc(clean)}" target="_blank" rel="noopener" class="block p-6 text-center text-sm font-semibold text-black">View this post on Instagram &rarr;</a>
            </blockquote></div>`;
    }

    function feedCard(p) {
        const caption = (p.caption || '').trim();
        const lines = caption.split('\n').filter(Boolean);
        const title = lines[0] ? (lines[0].length > 80 ? lines[0].slice(0, 77) + '…' : lines[0]) : 'From the journal';
        const excerpt = lines.slice(1).join(' ');
        const img = p.img;
        const date = p.date ? new Date(p.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
        return `<a href="${esc(p.url)}" target="_blank" rel="noopener" class="group rounded-2xl bg-brand-card border border-blue-100 hover:border-brand-gold/40 transition-all transform hover:-translate-y-1 overflow-hidden flex flex-col">
            <div class="relative aspect-square bg-blue-50 overflow-hidden">
                ${img ? `<img src="${esc(img)}" alt="${esc(title)}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">` : ''}
                ${p.video ? `<span class="absolute top-3 right-3 px-2.5 py-1 rounded bg-brand-dark/80 text-blue-600 text-[10px] font-bold uppercase tracking-wider font-mono">Reel</span>` : ''}
            </div>
            <div class="p-5 flex flex-col flex-grow">
                ${date ? `<span class="text-[10px] uppercase tracking-widest text-blue-600 font-bold font-mono">${esc(date)}</span>` : ''}
                <h3 class="font-bold text-gray-900 text-base mt-1 leading-snug">${esc(title)}</h3>
                ${excerpt ? `<p class="text-sm text-gray-500 font-medium leading-relaxed mt-2 line-clamp-3">${esc(excerpt)}</p>` : ''}
                <span class="mt-4 pt-3 border-t border-gray-200 text-blue-600 font-semibold text-sm flex items-center justify-between">Read on Instagram <span class="transition-transform group-hover:translate-x-1">&rarr;</span></span>
            </div></a>`;
    }

    function renderNext() {
        if (busy || shown >= items.length) return;
        busy = true;
        const batch = items.slice(shown, shown + IG.pageSize);
        grid.insertAdjacentHTML('beforeend', batch.map(mode === 'feed' ? feedCard : embedCard).join(''));
        shown += batch.length;
        if (mode === 'embed' && window.instgrm) window.instgrm.Embeds.process();
        const more = shown < items.length;
        btn.classList.toggle('hidden', !more);
        end.classList.toggle('hidden', more);
        setTimeout(() => { busy = false; }, 800);
    }

    function normalizeFeed(data) {
        const list = Array.isArray(data) ? data : (data.posts || data.data || []);
        return list.map(p => ({
            url: p.permalink,
            img: p.sizes?.medium?.mediaUrl || p.thumbnailUrl || p.mediaUrl || p.media_url || p.thumbnail_url,
            video: (p.mediaType || p.media_type) === 'VIDEO',
            caption: p.prunedCaption || p.caption,
            date: p.timestamp
        })).filter(p => p.url);
    }

    async function init() {
        if (IG.feedUrl) {
            try {
                const res = await fetch(IG.feedUrl);
                if (!res.ok) throw new Error(res.status);
                const feed = normalizeFeed(await res.json());
                if (feed.length) { items = feed; mode = 'feed'; }
            } catch (e) { console.warn('Instagram feed unavailable, using manual list.', e); }
        }
        if (mode === 'embed') items = IG.posts.slice();
        renderNext();

        btn.addEventListener('click', renderNext);
        if ('IntersectionObserver' in window) {
            new IntersectionObserver(entries => {
                if (entries[0].isIntersecting && shown > 0) renderNext();
            }, { rootMargin: '300px' }).observe(sentinel);
        }
    }

    // Wait for embed.js so embeds render on first paint
    if (document.readyState === 'complete') init(); else window.addEventListener('load', init);
})();

(function () {
    if (typeof Swiper === 'undefined' || !document.querySelector('.testimonial-swiper')) return;
    const reduceMotion = window.matchMedia('(prefers-blueuced-motion: reduce)').matches;

    const testimonialSwiper = new Swiper('.testimonial-swiper', {
        slidesPerView: 1,
        spaceBetween: 24,
        speed: reduceMotion ? 400 : 5000,
        grabCursor: true,
        loop: true,
        autoplay: reduceMotion ? false : {
            delay: 0,
            disableOnInteraction: false,
            pauseOnMouseEnter: true
        },
        freeMode: {
            enabled: !reduceMotion,
            momentum: false
        },
        pagination: { el: '.testimonial-pagination', clickable: true },
        navigation: { nextEl: '.testimonial-next', prevEl: '.testimonial-prev' },
        breakpoints: {
            768:  { slidesPerView: 2 },
            1024: { slidesPerView: 3 }
        },
        observer: true,
        observeSlideChildren: true
    });

    if (reduceMotion) return;
    const root = document.querySelector('.testimonial-swiper');

    // Clicking into a video/Instagram iframe steals focus: pause so it doesn't slide away mid-play
    window.addEventListener('blur', function () {
        const el = document.activeElement;
        if (el && el.tagName === 'IFRAME' && root.contains(el)) testimonialSwiper.autoplay.stop();
    });
    // ...and resume once the pointer leaves the slider
    root.addEventListener('mouseleave', function () {
        if (!testimonialSwiper.autoplay.running) testimonialSwiper.autoplay.start();
    });
})();

/* ---------- Scroll progress bar, header shadow, active nav link ---------- */
// (function () {
//     const bar = document.getElementById('scroll-progress');
//     const header = document.getElementById('site-header');
//     const links = Array.from(document.querySelectorAll('#site-header nav a[href^="#"]'));
//     let ticking = false;

//     function update() {
//         const max = document.documentElement.scrollHeight - window.innerHeight;
//         const y = window.scrollY;
//         if (bar) bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
//         if (header) header.classList.toggle('is-scrolled', y > 10);
//         ticking = false;
//     }
//     window.addEventListener('scroll', function () {
//         if (!ticking) { ticking = true; requestAnimationFrame(update); }
//     }, { passive: true });
//     update();

//     if ('IntersectionObserver' in window && links.length) {
//         const map = new Map();
//         links.forEach(a => { const sec = document.querySelector(a.getAttribute('href')); if (sec) map.set(sec, a); });
//         const io = new IntersectionObserver(entries => {
//             entries.forEach(e => {
//                 if (e.isIntersecting) {
//                     links.forEach(l => l.classList.remove('is-active'));
//                     map.get(e.target).classList.add('is-active');
//                 }
//             });
//         }, { rootMargin: '-45% 0px -50% 0px' });
//         map.forEach((_, sec) => io.observe(sec));
//     }
// })();