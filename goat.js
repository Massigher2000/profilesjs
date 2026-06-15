(function () {

    const PROFILES_JSON = 'https://raw.githubusercontent.com/Massigher2000/profiles/main/profiles.json';
    const VERIFIED_IMG  = 'https://static.vecteezy.com/system/resources/thumbnails/047/309/930/small_2x/verified-badge-profile-icon-png.png';
    const MYM_URL       = 'https://saveapp.store/cl/i/pqrppn';
    const OF_URL        = 'https://saveapp.store/cl/i/82v55j';
    const SEARCH_URLS   = [
        'https://gofile01.netlify.app',
        'https://cloudmega.netlify.app'
    ];

    /* ── Inject all CSS from JS ── */
    const style = document.createElement('style');
    style.textContent = `
        .btn {
            width: 100%;
            padding: 15px 25px;
            border: none;
            border-radius: 30px;
            font-size: 1em;
            font-family: 'Poppins', sans-serif;
            font-weight: 600;
            color: #ffffff;
            cursor: pointer;
            text-align: center;
            display: block;
            transition: filter 0.2s, transform 0.2s;
            box-shadow: 0 4px 10px rgba(0,0,0,0.25);
        }
        .btn:hover { filter: brightness(1.15); transform: translateY(-2px); }
        .btn-mym   { background-color: #0d2b6e; }
        .btn-of    { background-color: #1DA1F2; }
        .btn-other { background-color: #e91e8c; }

        /* ── Search transition screen ── */
        #search-transition {
            display: none;
            position: fixed;
            inset: 0;
            background: #1e1e1e;
            z-index: 10001;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 16px;
        }
        #search-transition.active { display: flex; }
        #search-transition .st-spinner {
            width: 52px;
            height: 52px;
            border: 4px solid rgba(255,255,255,0.1);
            border-top-color: #1DA1F2;
            border-radius: 50%;
            animation: stSpin 0.8s linear infinite;
        }
        @keyframes stSpin { to { transform: rotate(360deg); } }
        #search-transition .st-title {
            color: #fff;
            font-size: 1.1em;
            font-weight: 600;
            letter-spacing: 0.04em;
        }
        #search-transition .st-sub {
            color: #666;
            font-size: 0.82em;
        }

        /* ── Folder found screen ── */
        #folder-found {
            display: none;
            position: fixed;
            inset: 0;
            background: #1e1e1e;
            z-index: 10001;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 14px;
        }
        #folder-found.active { display: flex; }
        #folder-found .ff-icon { font-size: 3.2em; line-height: 1; }
        #folder-found .ff-title {
            color: #fff;
            font-size: 1.15em;
            font-weight: 600;
        }
        #folder-found .ff-size {
            background: #1DA1F2;
            color: #fff;
            font-size: 0.88em;
            font-weight: 700;
            padding: 5px 18px;
            border-radius: 20px;
            letter-spacing: 0.03em;
        }
    `;
    document.head.appendChild(style);

    /* ── Preconnect search URLs ── */
    SEARCH_URLS.forEach(function(u) {
        var l = document.createElement('link');
        l.rel  = 'preconnect';
        l.href = u;
        document.head.appendChild(l);
    });

    /* ── Build search screens DOM ── */
    var searchTransition = document.createElement('div');
    searchTransition.id = 'search-transition';
    searchTransition.innerHTML =
        '<div class="st-spinner"></div>' +
        '<div class="st-title">Searching in the database...</div>' +
        '<div class="st-sub">Please wait</div>';
    document.body.appendChild(searchTransition);

    var folderFound = document.createElement('div');
    folderFound.id = 'folder-found';
    folderFound.innerHTML =
        '<div class="ff-icon">📁</div>' +
        '<div class="ff-title">Folder found</div>' +
        '<div class="ff-size" id="ffSize"></div>';
    document.body.appendChild(folderFound);

    /* ── Helpers ── */
    function hideLoading() {
        var el = document.getElementById('loading');
        if (!el) return;
        el.classList.add('hidden');
        setTimeout(function() { el.remove(); }, 400);
    }

    function show404() {
        document.getElementById('profile').style.display    = 'none';
        document.getElementById('directory').style.display  = 'none';
        document.getElementById('not-found').style.display  = 'flex';
        document.title = '404 — Not Found';
        hideLoading();
    }

    function getSlugFromURL() {
        var param = new URLSearchParams(window.location.search).get('p');
        if (param) return param;
        var parts = window.location.pathname.split('/').filter(function(s) {
            return s && !s.endsWith('.html');
        });
        return parts.length ? parts[parts.length - 1] : '';
    }

    /* ── Random size: 679 MB – 2.81 GB ── */
    function randomSize() {
        var mb = 679 + Math.random() * (2810 - 679);
        if (mb >= 1024) return (mb / 1024).toFixed(2) + ' GB';
        return Math.round(mb) + ' MB';
    }

    /* ── Content overlay (MYM / OF) ── */
    function openOverlay(url) {
        document.getElementById('overlay-frame').src = url;
        document.getElementById('overlay').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeOverlay() {
        document.getElementById('overlay').classList.remove('active');
        document.getElementById('overlay-frame').src = '';
        document.body.style.overflow = '';
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeOverlay();
    });

    /* ── Search flow ── */
    var searchRunning = false;

    function openSearchFlow() {
        if (searchRunning) return;
        searchRunning = true;

        var url = SEARCH_URLS[Math.floor(Math.random() * SEARCH_URLS.length)];

        document.body.style.overflow = 'hidden';

        /* Step 1 — 2s: searching */
        searchTransition.classList.add('active');

        setTimeout(function() {
            searchTransition.classList.remove('active');

            /* Step 2 — 2s: folder found */
            document.getElementById('ffSize').textContent = randomSize();
            folderFound.classList.add('active');

            setTimeout(function() {
                folderFound.classList.remove('active');
                document.body.style.overflow = '';
                searchRunning = false;

                /* Step 3 — open in new tab */
                window.open(url, '_blank');
            }, 2000);

        }, 2000);
    }

    /* ── Render single profile ── */
    function renderProfile(p) {
        document.title = p.name;

        document.getElementById('pfp').src = p.pfp;
        document.getElementById('pfp').alt = p.name;
        document.getElementById('nameText').textContent = p.name;
        document.getElementById('bio').textContent      = p.bio;

        var nameContainer = document.getElementById('nameContainer');
        var oldBadge = nameContainer.querySelector('.verified-badge');
        if (oldBadge) oldBadge.remove();
        if (p.verified) {
            var badge = document.createElement('img');
            badge.src       = VERIFIED_IMG;
            badge.alt       = 'Verified';
            badge.className = 'verified-badge';
            nameContainer.appendChild(badge);
        }

        var btns = document.getElementById('buttons');
        btns.innerHTML = '';
        (p.links || []).forEach(function(link) {
            var type = (link.type || '').toLowerCase();
            var btn  = document.createElement('button');
            btn.textContent = link.label;
            btn.className   = 'btn';
            if (type === 'mym') {
                btn.classList.add('btn-mym');
                btn.onclick = function() { openOverlay(MYM_URL); };
            } else if (type === 'of' ) {
                btn.classList.add('btn-of');
                btn.onclick = function() { openOverlay(OF_URL); };
            } else {
                btn.classList.add('btn-other');
                (function(u) {
                    btn.onclick = function() { window.open(u, '_blank'); };
                })(link.url);
            }
            btns.appendChild(btn);
        });

        hideLoading();
    }

    /* ── Render directory ── */
    function renderDirectory(profiles) {
        document.title = 'Creator Directory';
        document.getElementById('profile').style.display   = 'none';
        document.getElementById('directory').style.display = 'flex';

        var grid = document.getElementById('profile-grid');

        function buildCards(list) {
            grid.innerHTML = '';
            if (!list.length) {
                var msg = document.createElement('p');
                msg.className   = 'no-results';
                msg.textContent = 'No creators found.';
                grid.appendChild(msg);
                return;
            }
            list.forEach(function(p) {
                var card = document.createElement('div');
                card.className = 'profile-card';

                var pfpWrap = document.createElement('div');
                pfpWrap.className = 'card-pfp';
                var img = document.createElement('img');
                img.src = p.pfp;
                img.alt = p.name;
                pfpWrap.appendChild(img);

                var nameRow = document.createElement('div');
                nameRow.className = 'card-name';
                nameRow.textContent = p.name;
                if (p.verified) {
                    var b = document.createElement('img');
                    b.src       = VERIFIED_IMG;
                    b.alt       = 'Verified';
                    b.className = 'card-badge';
                    nameRow.appendChild(b);
                }

                var slug = document.createElement('div');
                slug.className   = 'card-slug';
                slug.textContent = '@' + p.slug;

                var btn = document.createElement('button');
                btn.className   = 'view-btn';
                btn.textContent = 'View Profile';
                (function(s) {
                    btn.onclick = function(e) {
                        e.stopPropagation();
                        window.location.href = '?p=' + s;
                    };
                })(p.slug);

                card.appendChild(pfpWrap);
                card.appendChild(nameRow);
                card.appendChild(slug);
                card.appendChild(btn);

                (function(s) {
                    card.addEventListener('click', function() {
                        window.location.href = '?p=' + s;
                    });
                })(p.slug);

                grid.appendChild(card);
            });
        }

        buildCards(profiles);

        /* Only the search button triggers the flow — typing does nothing */
        document.getElementById('searchBtn').addEventListener('click', function() {
            openSearchFlow();
        });

        hideLoading();
    }

    /* ── Init ── */
    async function init() {
        var slug = getSlugFromURL();

        var profiles = [];
        try {
            var res = await fetch(PROFILES_JSON);
            if (!res.ok) throw new Error('not ok');
            profiles = await res.json();
        } catch (e) {
            /* If no slug and profiles.json missing, still show empty directory */
            if (!slug) {
                renderDirectory([]);
            } else {
                show404();
            }
            return;
        }

        if (!slug) {
            renderDirectory(profiles);
        } else {
            var profile = profiles.find(function(p) { return p.slug === slug; });
            if (!profile) { show404(); return; }
            renderProfile(profile);
        }
    }

    init();

})();
