(function () {
    const navItems = [
        { key: 'overview', label: 'Overview', icon: 'dashboard', href: 'farmers-dashboard.html' },
        { key: 'listings', label: 'My Listings', icon: 'inventory_2', href: 'my_listing.html' },
        { key: 'cluster', label: 'Farm Cluster', icon: 'group_work', href: 'price_cluster.html' },
        { key: 'price', label: 'Price Intelligence', icon: 'insights', href: 'price_intelligence.html' },
        { key: 'preorders', label: 'Pre-Orders', icon: 'pending_actions', href: 'pre-order.html' },
        { key: 'orders', label: 'Orders', icon: 'shopping_cart', href: 'farmer-order.html' },
        { key: 'wallet', label: 'Wallet', icon: 'account_balance_wallet', href: 'wallet.html' },
        { key: 'payout', label: 'Payout', icon: 'payments', href: 'payout.html' },
        { key: 'profile', label: 'Profile', icon: 'person', href: 'farmer_profile.html' }
    ];

    const pageToKey = {
        'farmers-dashboard.html': 'overview',
        'my_listing.html': 'listings',
        'price_cluster.html': 'cluster',
        'price_intelligence.html': 'price',
        'pre-order.html': 'preorders',
        'farmer-order.html': 'orders',
        'wallet.html': 'wallet',
        'payout.html': 'payout',
        'farmer_profile.html': 'profile'
    };

    function currentFileName() {
        const path = window.location.pathname || '';
        const file = path.split('/').pop();
        return (file || '').toLowerCase();
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function navLinkHtml(item, active) {
        const baseClass = active
            ? 'flex items-center gap-3 px-4 py-3 text-emerald-900 dark:text-emerald-400 font-bold border-l-4 border-emerald-900 dark:border-emerald-400 bg-emerald-50 dark:bg-emerald-900/40 transition-all'
            : 'flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-emerald-200/60 font-medium hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors';

        return '' +
            '<a class="' + baseClass + '" href="' + item.href + '">' +
                '<span class="material-symbols-outlined" data-icon="' + item.icon + '">' + item.icon + '</span>' +
                '<span class="text-sm">' + item.label + '</span>' +
            '</a>';
    }

    function signOutHtml() {
        return '' +
            '<div data-farmer-signout class="mt-auto pt-4 border-t border-outline-variant/20">' +
                '<a class="flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-emerald-200/60 font-medium hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors" href="#">' +
                    '<span class="material-symbols-outlined" data-icon="logout">logout</span>' +
                    '<span class="text-sm">Sign Out</span>' +
                '</a>' +
            '</div>';
    }

    function sidebarShellHtml() {
        return '' +
            '<div class="px-6 mb-8 flex items-center justify-between">' +
                '<span class="text-xl font-black text-emerald-900 dark:text-emerald-50 tracking-tight">TRAVIA</span>' +
                '<button class="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-full bg-surface-container-high text-slate-600 dark:text-emerald-100 hover:bg-surface-container transition-colors" type="button" aria-label="Close sidebar" data-farmer-sidebar-close onclick="if (typeof window.toggleDrawer === \'function\') { window.toggleDrawer(); }">' +
                    '<span class="material-symbols-outlined text-[20px]" data-icon="close">close</span>' +
                '</button>' +
            '</div>' +
            '<div class="px-4 mb-8">' +
                '<div class="flex items-center gap-3 p-2 bg-surface-container-low rounded-xl">' +
                    '<img alt="Farmer Avatar" class="w-10 h-10 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHngtRBaxikAxlK5m6AjATnl3lkBVX-kSOtih6APmdjkIn0UXG5vagtuR_PcRuloPAJmYL3NJO6i41blvMKA-jsSzuSPVLtdKD6M64NV_FAvhSzsXGHJJbK-q3CTOhhLAufW_V53lIKKuZ_jYhyAKU0pLbaFFACrHwgMsZzAoH3Ogoib8fIPntpsf3VA4cj6dnny2k1BF-eC28HjNY0F3TjWZ40fmTUFKtYwho-57gsvJDnkuEiyQedbeDsJAV2GgT272KxzSYOE4"/>' +
                    '<div>' +
                        '<p class="text-sm font-bold text-emerald-900">Abeeb Akanni</p>' +
                        '<div class="flex items-center gap-1">' +
                            '<span class="text-[10px] font-medium text-slate-500">Farmer</span>' +
                            '<span class="material-symbols-outlined text-[12px] text-primary" style="font-variation-settings: \'FILL\' 1;">verified</span>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<nav data-farmer-shell-nav class="flex-1 space-y-1 overflow-y-auto px-2"></nav>';
    }

    function topbarShellHtml(config) {
        const title = escapeHtml(config.title);
        const ctaLabelText = String(config.ctaLabel || '').replace(/^\s*\+\s*/, '');
        const ctaLabel = escapeHtml(ctaLabelText);
        const ctaHref = escapeHtml(config.ctaHref);
        const isCompact = config.size === 'compact';
        const titleClass = isCompact ? 'text-base md:text-[17px]' : 'text-lg';
        const iconClass = isCompact ? 'text-[20px]' : '';
        const menuButtonClass = isCompact
            ? 'lg:hidden p-1.5 hover:bg-emerald-100/50 dark:hover:bg-emerald-800/50 rounded-full transition-all'
            : 'lg:hidden p-2 hover:bg-emerald-100/50 dark:hover:bg-emerald-800/50 rounded-full transition-all';
        const notifyButtonClass = isCompact
            ? 'p-1.5 hover:bg-emerald-100/50 dark:hover:bg-emerald-800/50 rounded-full transition-all relative'
            : 'p-2 hover:bg-emerald-100/50 dark:hover:bg-emerald-800/50 rounded-full transition-all relative';
        const ctaClass = isCompact
            ? 'bg-primary text-on-primary px-4 md:px-5 py-2 rounded-full font-bold text-xs md:text-sm hover:opacity-90 transition-all flex items-center gap-1.5 shadow-lg shadow-primary/20'
            : 'bg-primary text-on-primary px-6 py-2.5 rounded-full font-bold text-sm hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20';
        const shellGapClass = isCompact ? 'flex items-center gap-3' : 'flex items-center gap-4';
        const menuButton = config.showMenu
            ? '' +
              '<button class="' + menuButtonClass + '" onclick="if (typeof window.toggleDrawer === \'function\') { window.toggleDrawer(); }">' +
                  '<span class="material-symbols-outlined ' + iconClass + '" data-icon="menu">menu</span>' +
              '</button>'
            : '';

        const notificationButton = config.showNotifications
            ? '' +
              '<button class="' + notifyButtonClass + '" type="button" aria-label="Open notifications" aria-expanded="false" data-farmer-notifications-toggle>' +
                  '<span class="material-symbols-outlined ' + iconClass + '" data-icon="notifications">notifications</span>' +
                  '<span class="absolute top-2 right-2 w-2 h-2 bg-error rounded-full" data-farmer-notification-badge></span>' +
              '</button>'
            : '';

        const ctaButton = ctaLabel
            ? '' +
              '<a class="' + ctaClass + '" href="' + ctaHref + '">' +
                  '<span class="material-symbols-outlined ' + (isCompact ? 'text-[15px]' : 'text-sm') + '" data-icon="add">add</span>' +
                  '<span>' + ctaLabel + '</span>' +
              '</a>'
            : '';

        return '' +
            '<div class="' + shellGapClass + '">' +
                menuButton +
                '<h1 class="' + titleClass + ' font-bold font-headline">' + title + '</h1>' +
            '</div>' +
            '<div class="' + shellGapClass + '">' +
                notificationButton +
                ctaButton +
            '</div>';
    }

    function resolveSidebarNav(sidebar) {
        let nav = sidebar.querySelector('[data-farmer-shell-nav]') || sidebar.querySelector('nav');

        if (!nav && sidebar.hasAttribute('data-farmer-sidebar')) {
            sidebar.innerHTML = sidebarShellHtml();
            nav = sidebar.querySelector('[data-farmer-shell-nav]');
        }

        return nav;
    }

    function applySharedSidebar() {
        const sidebar = document.querySelector('[data-farmer-sidebar]') || document.querySelector('aside');
        if (!sidebar) return;

        const nav = resolveSidebarNav(sidebar);
        if (!nav) return;

        const activeKey = pageToKey[currentFileName()] || 'overview';

        sidebar.classList.add('flex', 'flex-col');

        const navParent = nav.parentElement || sidebar;
        navParent.classList.add('flex', 'flex-col');

        if (!Array.from(navParent.classList).includes('h-full')) {
            navParent.classList.add('h-full');
        }

        nav.classList.add('flex-1', 'space-y-1');
        nav.innerHTML = navItems.map(function (item) {
            return navLinkHtml(item, item.key === activeKey);
        }).join('');

        const existingSignOut = navParent.querySelector('[data-farmer-signout]');
        if (existingSignOut) existingSignOut.remove();
        nav.insertAdjacentHTML('afterend', signOutHtml());
    }

    function applySharedTopbar() {
        const topbars = document.querySelectorAll('[data-farmer-topbar]');
        if (!topbars.length) return;

        topbars.forEach(function (topbar) {
            const config = {
                title: topbar.getAttribute('data-title') || 'Dashboard',
                ctaLabel: topbar.getAttribute('data-cta-label') || 'Add Listing',
                ctaHref: topbar.getAttribute('data-cta-href') || '#',
                showNotifications: topbar.getAttribute('data-show-notifications') !== 'false',
                showMenu: topbar.getAttribute('data-show-menu') === 'true',
                size: topbar.getAttribute('data-topbar-size') || 'compact'
            };

            topbar.innerHTML = topbarShellHtml(config);
        });
    }

    function notificationPanelHtml() {
        return '' +
            '<div class="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest shadow-[0_20px_50px_-12px_rgba(15,61,46,0.24)] overflow-hidden">' +
                '<div class="p-4 border-b border-outline-variant/20 flex items-start justify-between gap-3">' +
                    '<div>' +
                        '<h3 class="text-sm font-black text-primary">Notifications</h3>' +
                        '<p class="text-xs text-on-surface-variant mt-1">Live updates from your farmer dashboard</p>' +
                    '</div>' +
                    '<button type="button" data-mark-notifications-read class="text-xs font-bold text-primary hover:underline whitespace-nowrap">Mark all read</button>' +
                '</div>' +
                '<div class="max-h-[60vh] overflow-y-auto divide-y divide-surface-container farmer-shell-no-scrollbar">' +
                    '<a href="farmer-order.html" data-notification-link class="flex gap-3 p-4 hover:bg-surface-container-low transition-colors">' +
                        '<span class="w-10 h-10 rounded-xl bg-primary-fixed/60 text-primary flex items-center justify-center flex-shrink-0">' +
                            '<span class="material-symbols-outlined text-[18px]">shopping_cart</span>' +
                        '</span>' +
                        '<div class="flex-1 min-w-0">' +
                            '<p class="text-sm font-bold text-on-surface">New customer order received</p>' +
                            '<p class="text-xs text-on-surface-variant mt-1">Order #TRV-9842 for Point-and-Kill Catfish was placed.</p>' +
                            '<p class="text-[11px] text-slate-400 mt-2">2 mins ago</p>' +
                        '</div>' +
                        '<span class="mt-2 w-2 h-2 rounded-full bg-error flex-shrink-0" data-notification-unread></span>' +
                    '</a>' +
                    '<a href="payout.html" data-notification-link class="flex gap-3 p-4 hover:bg-surface-container-low transition-colors">' +
                        '<span class="w-10 h-10 rounded-xl bg-tertiary-fixed/40 text-on-tertiary-fixed-variant flex items-center justify-center flex-shrink-0">' +
                            '<span class="material-symbols-outlined text-[18px]">payments</span>' +
                        '</span>' +
                        '<div class="flex-1 min-w-0">' +
                            '<p class="text-sm font-bold text-on-surface">Withdrawal completed</p>' +
                            '<p class="text-xs text-on-surface-variant mt-1">Your payout of ₦49,197.50 has been sent to GTBank.</p>' +
                            '<p class="text-[11px] text-slate-400 mt-2">35 mins ago</p>' +
                        '</div>' +
                        '<span class="mt-2 w-2 h-2 rounded-full bg-error flex-shrink-0" data-notification-unread></span>' +
                    '</a>' +
                    '<a href="pre-order.html" data-notification-link class="flex gap-3 p-4 hover:bg-surface-container-low transition-colors">' +
                        '<span class="w-10 h-10 rounded-xl bg-secondary-fixed/40 text-on-secondary-fixed-variant flex items-center justify-center flex-shrink-0">' +
                            '<span class="material-symbols-outlined text-[18px]">pending_actions</span>' +
                        '</span>' +
                        '<div class="flex-1 min-w-0">' +
                            '<p class="text-sm font-bold text-on-surface">New pre-order request</p>' +
                            '<p class="text-xs text-on-surface-variant mt-1">A buyer requested 120kg from your next harvest window.</p>' +
                            '<p class="text-[11px] text-slate-400 mt-2">1 hour ago</p>' +
                        '</div>' +
                        '<span class="mt-2 w-2 h-2 rounded-full bg-error flex-shrink-0" data-notification-unread></span>' +
                    '</a>' +
                    '<a href="my_listing.html" data-notification-link class="flex gap-3 p-4 hover:bg-surface-container-low transition-colors">' +
                        '<span class="w-10 h-10 rounded-xl bg-surface-container-high text-primary flex items-center justify-center flex-shrink-0">' +
                            '<span class="material-symbols-outlined text-[18px]">inventory_2</span>' +
                        '</span>' +
                        '<div class="flex-1 min-w-0">' +
                            '<p class="text-sm font-bold text-on-surface">Listing status updated</p>' +
                            '<p class="text-xs text-on-surface-variant mt-1">Fresh Tilapia listing is now approved and live.</p>' +
                            '<p class="text-[11px] text-slate-400 mt-2">3 hours ago</p>' +
                        '</div>' +
                    '</a>' +
                    '<a href="price_intelligence.html" data-notification-link class="flex gap-3 p-4 hover:bg-surface-container-low transition-colors">' +
                        '<span class="w-10 h-10 rounded-xl bg-primary-fixed text-on-primary-fixed-variant flex items-center justify-center flex-shrink-0">' +
                            '<span class="material-symbols-outlined text-[18px]">insights</span>' +
                        '</span>' +
                        '<div class="flex-1 min-w-0">' +
                            '<p class="text-sm font-bold text-on-surface">Price alert</p>' +
                            '<p class="text-xs text-on-surface-variant mt-1">Demand for smoked fish increased by 7% in your region.</p>' +
                            '<p class="text-[11px] text-slate-400 mt-2">Today, 8:15 AM</p>' +
                        '</div>' +
                    '</a>' +
                '</div>' +
                '<div class="p-3 border-t border-outline-variant/20 bg-surface-container-low">' +
                    '<a href="farmer-order.html" data-notification-link class="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline">Open Orders Center <span class="material-symbols-outlined text-[15px]">arrow_forward</span></a>' +
                '</div>' +
            '</div>';
    }

    function ensureNotificationsCenter() {
        const toggleButtons = Array.from(document.querySelectorAll('[data-farmer-notifications-toggle]'));
        if (!toggleButtons.length) return;
        const styleId = 'farmer-shell-notification-style';

        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = '' +
                '.farmer-shell-no-scrollbar {-ms-overflow-style: none; scrollbar-width: none;}' +
                '.farmer-shell-no-scrollbar::-webkit-scrollbar {display: none; width: 0; height: 0;}';
            document.head.appendChild(style);
        }

        let clickShield = document.querySelector('[data-farmer-notification-shield]');
        if (!clickShield) {
            clickShield = document.createElement('div');
            clickShield.setAttribute('data-farmer-notification-shield', 'true');
            clickShield.className = 'hidden fixed inset-0 z-[84]';
            document.body.appendChild(clickShield);
        }

        let panel = document.querySelector('[data-farmer-notification-panel]');
        if (!panel) {
            panel = document.createElement('div');
            panel.setAttribute('data-farmer-notification-panel', 'true');
            panel.className = 'hidden fixed top-24 right-4 md:right-8 lg:right-10 z-[85] w-[min(92vw,380px)]';
            panel.innerHTML = notificationPanelHtml();
            document.body.appendChild(panel);
        }

        const notificationBadges = Array.from(document.querySelectorAll('[data-farmer-notification-badge]'));
        const unreadDots = function () { return panel.querySelectorAll('[data-notification-unread]'); };
        const markReadButton = panel.querySelector('[data-mark-notifications-read]');

        function setOpen(isOpen) {
            panel.classList.toggle('hidden', !isOpen);
            clickShield.classList.toggle('hidden', !isOpen);
            toggleButtons.forEach(function (button) {
                button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            });
        }

        function markAllRead() {
            unreadDots().forEach(function (dot) { dot.remove(); });
            notificationBadges.forEach(function (badge) { badge.classList.add('hidden'); });
        }

        toggleButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                const isOpen = !panel.classList.contains('hidden');
                setOpen(!isOpen);
            });
        });

        clickShield.addEventListener('click', function () {
            setOpen(false);
        });

        if (markReadButton) {
            markReadButton.addEventListener('click', function () {
                markAllRead();
                setOpen(false);
            });
        }

        panel.addEventListener('click', function (event) {
            const link = event.target.closest('[data-notification-link]');
            if (!link) return;
            markAllRead();
            setOpen(false);
        });

        window.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') {
                setOpen(false);
            }
        });
    }

    function ensureDrawerControls() {
        const drawer = document.getElementById('mobile-drawer') || document.querySelector('[data-farmer-sidebar]');
        if (!drawer) return;

        if (!drawer.id) {
            drawer.id = 'mobile-drawer';
        }

        let overlay = document.getElementById('mobile-drawer-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'mobile-drawer-overlay';
            overlay.className = 'fixed inset-0 bg-black/50 z-[60] lg:hidden hidden';
            document.body.insertBefore(overlay, document.body.firstChild);
        }

        drawer.classList.add('transition-transform', 'duration-300', 'ease-in-out', '-translate-x-full', 'lg:translate-x-0');
        overlay.classList.add('lg:hidden');

        function setDrawerState(isOpen) {
            const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
            const shouldOpen = Boolean(isOpen);
            const showOverlay = shouldOpen && !isDesktop;

            drawer.classList.toggle('-translate-x-full', !shouldOpen);
            drawer.classList.toggle('active', shouldOpen);

            overlay.classList.toggle('hidden', !showOverlay);
            overlay.classList.toggle('active', showOverlay);

            document.body.style.overflow = showOverlay ? 'hidden' : 'auto';
        }

        window.toggleDrawer = function (forceOpen) {
            const currentlyOpen = !drawer.classList.contains('-translate-x-full') || drawer.classList.contains('active');
            const nextOpen = typeof forceOpen === 'boolean' ? forceOpen : !currentlyOpen;
            setDrawerState(nextOpen);
        };

        overlay.addEventListener('click', function () {
            window.toggleDrawer(false);
        });

        drawer.addEventListener('click', function (event) {
            if (window.innerWidth >= 1024) return;
            const clickedLink = event.target.closest('a[href]');
            if (clickedLink) {
                window.toggleDrawer(false);
            }
        });

        window.addEventListener('resize', function () {
            setDrawerState(false);
        });

        setDrawerState(false);
    }

    function initFarmerShell() {
        ensureDrawerControls();
        applySharedSidebar();
        applySharedTopbar();
        ensureNotificationsCenter();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFarmerShell);
    } else {
        initFarmerShell();
    }
})();
