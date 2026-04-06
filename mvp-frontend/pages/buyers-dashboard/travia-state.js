(function () {
    const CART_KEY = 'travia_cart_v1';
    const MOBILE_BREAKPOINT = 768;
    const currencyFormatter = new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        maximumFractionDigits: 0
    });

    let stateToastTimer = null;

    function formatNaira(value) {
        return currencyFormatter.format(Number(value) || 0);
    }

    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function parsePrice(value) {
        const normalized = String(value || '').replace(/[^0-9.]/g, '');
        return Number(normalized) || 0;
    }

    function parseUnit(value) {
        const raw = String(value || '');
        const slashMatch = raw.match(/\/\s*([a-zA-Z]+)/);
        if (slashMatch && slashMatch[1]) return slashMatch[1].toLowerCase();
        const perMatch = raw.match(/per\s+([a-zA-Z]+)/i);
        if (perMatch && perMatch[1]) return perMatch[1].toLowerCase();
        return 'unit';
    }

    function appToast(message) {
        let toast = document.getElementById('toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast';
            toast.className = 'fixed bottom-4 left-1/2 -translate-x-1/2 bg-[#0f3d2e] text-[#beedd7] px-6 py-3 rounded-full opacity-0 pointer-events-none transition-all duration-300 z-[9999] shadow-2xl font-manrope font-semibold transform translate-y-4';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.style.opacity = '1';
        toast.style.transform = 'translate(-50%, 0)';
        clearTimeout(stateToastTimer);
        stateToastTimer = setTimeout(function () {
            toast.style.opacity = '0';
            toast.style.transform = 'translate(-50%, 16px)';
        }, 2800);
    }

    function normalizeCartItem(item) {
        if (!item || typeof item !== 'object') return null;
        const name = String(item.name || '').trim() || 'Premium Listing';
        const farm = String(item.farm || '').trim() || 'Travia Verified Farm';
        const unit = String(item.unit || '').trim() || '1 unit';
        const price = Math.max(0, Number(item.price) || 0);
        const image = String(item.image || '').trim();
        return { name: name, farm: farm, unit: unit, price: price, image: image };
    }

    function getCart() {
        if (!window.localStorage) return [];
        try {
            const raw = window.localStorage.getItem(CART_KEY);
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) return [];
            return parsed.map(normalizeCartItem).filter(Boolean);
        } catch (error) {
            return [];
        }
    }

    function saveCart(cart) {
        if (!window.localStorage) return;
        try {
            const normalized = (Array.isArray(cart) ? cart : [])
                .map(normalizeCartItem)
                .filter(Boolean);
            window.localStorage.setItem(CART_KEY, JSON.stringify(normalized));
            updateCartBadges();
        } catch (error) {
            return;
        }
    }

    function updateCartSummary(subtotal) {
        const summaryCard = document.querySelector('.bg-surface-container.sticky');
        if (summaryCard) {
            summaryCard.querySelectorAll('.font-semibold.text-primary, .font-extrabold.text-primary').forEach(function (el) {
                const text = (el.textContent || '').trim();
                const looksLikeAmount = /\d/.test(text);
                if (looksLikeAmount) {
                    el.textContent = formatNaira(subtotal);
                }
            });
        }
    }

    function updateCartBadges() {
        const cart = getCart();
        const count = cart.length;

        document.querySelectorAll('a[href="cart.html"]').forEach(function (link) {
            let badge = link.querySelector('.cart-badge-dynamic');
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'cart-badge-dynamic ml-auto bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full';
                link.appendChild(badge);
            }
            badge.textContent = String(count);
            badge.style.display = count === 0 ? 'none' : 'inline-block';
        });

        const fabButton = document.querySelector('.fixed.bottom-8.right-8');
        if (fabButton) {
            let badge = fabButton.querySelector('.fab-badge-dynamic');
            if (!badge) {
                badge = document.createElement('div');
                badge.className = 'fab-badge-dynamic absolute -top-2 -right-2 bg-error text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ring-2 ring-white';
                fabButton.appendChild(badge);
            }
            badge.textContent = String(count);
            badge.style.display = count === 0 ? 'none' : 'flex';
        }
    }

    function renderCartPage() {
        const container = document.getElementById('cartItemsContainer');
        if (!container) return;

        const cart = getCart();
        if (cart.length === 0) {
            container.innerHTML = '<div class="text-center py-12"><span class="material-symbols-outlined text-6xl text-slate-300 mb-4" style="font-variation-settings: \'FILL\' 1" data-icon="shopping_basket">shopping_basket</span><h3 class="text-xl font-bold text-primary mb-2">Your Cart is Empty</h3><p class="text-slate-500 mb-6">Looks like you haven\'t added any fresh produce to your cart yet.</p><a href="buyers-dashboard.html" class="px-6 py-3 bg-primary text-white font-bold rounded-full inline-block cursor-pointer">Continue Shopping</a></div>';
            updateCartSummary(0);
            return;
        }

        container.innerHTML = '';
        let subtotal = 0;

        cart.forEach(function (item, index) {
            subtotal += item.price;
            const row = document.createElement('div');
            row.className = 'flex items-center justify-between pb-6 border-b border-surface-variant flex-wrap gap-4 pt-6 first:pt-0 last:border-0 last:pb-0';
            row.innerHTML = '' +
                '<div class="flex items-center gap-4">' +
                    '<div class="w-20 h-20 rounded-xl bg-primary-fixed-dim/20 overflow-hidden hide-empty">' +
                        '<img src="' + escapeHtml(item.image) + '" class="w-full h-full object-cover" onerror="this.style.display=\'none\'">' +
                    '</div>' +
                    '<div>' +
                        '<h4 class="font-bold text-lg text-primary">' + escapeHtml(item.name) + '</h4>' +
                        '<p class="text-xs text-slate-500">' + escapeHtml(item.farm) + '</p>' +
                        '<p class="text-sm font-semibold mt-1">' + escapeHtml(item.unit) + '</p>' +
                    '</div>' +
                '</div>' +
                '<div class="text-right flex flex-col items-end gap-2">' +
                    '<p class="text-xl font-extrabold text-primary">' + formatNaira(item.price) + '</p>' +
                    '<button data-remove-cart="' + index + '" class="text-xs text-error font-semibold flex items-center gap-1 px-3 py-1 rounded-full hover:bg-error-container/50 transition-colors cursor-pointer">' +
                        '<span class="material-symbols-outlined text-[16px]">delete</span> Remove' +
                    '</button>' +
                '</div>';
            container.appendChild(row);
        });

        updateCartSummary(subtotal);

        container.querySelectorAll('[data-remove-cart]').forEach(function (button) {
            button.addEventListener('click', function () {
                const index = Number(button.getAttribute('data-remove-cart'));
                const cartState = getCart();
                cartState.splice(index, 1);
                saveCart(cartState);
                appToast('Item removed from cart');
                renderCartPage();
            });
        });
    }

    function initSidebar() {
        const sidebar = document.querySelector('[data-sidebar], #sidebar, aside');
        const directToggle = document.querySelector('[data-menu-toggle]');
        const iconToggle = document.querySelector('[data-icon="menu"]');
        const toggle = directToggle || (iconToggle ? iconToggle.closest('button') : null);

        if (!sidebar || !toggle) return;

        if (!sidebar.id) sidebar.id = 'sidebar';
        toggle.setAttribute('aria-controls', sidebar.id);
        toggle.setAttribute('aria-expanded', 'false');

        let overlay = document.getElementById('mobile-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'mobile-overlay';
            overlay.className = 'fixed bg-[#00261a]/60 inset-0 z-[998] md:hidden cursor-pointer';
            overlay.style.display = 'none';
            document.body.appendChild(overlay);
        }

        function isMobile() {
            return window.innerWidth <= MOBILE_BREAKPOINT;
        }

        function openSidebar() {
            sidebar.classList.remove('hidden');
            sidebar.classList.add('flex');
            sidebar.style.zIndex = '999';
            overlay.style.display = 'block';
            document.body.style.overflow = 'hidden';
            toggle.setAttribute('aria-expanded', 'true');
        }

        function closeSidebar() {
            sidebar.classList.add('hidden');
            sidebar.classList.remove('flex');
            overlay.style.display = 'none';
            document.body.style.overflow = '';
            toggle.setAttribute('aria-expanded', 'false');
        }

        function isSidebarOpen() {
            return overlay.style.display === 'block';
        }

        toggle.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            if (!isMobile()) return;
            if (isSidebarOpen()) closeSidebar();
            else openSidebar();
        });

        overlay.addEventListener('click', closeSidebar);

        document.addEventListener('click', function (event) {
            if (!isMobile() || !isSidebarOpen()) return;
            if (sidebar.contains(event.target) || toggle.contains(event.target)) return;
            closeSidebar();
        });

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && isSidebarOpen()) {
                closeSidebar();
            }
        });

        sidebar.querySelectorAll('a[href]').forEach(function (link) {
            link.addEventListener('click', function () {
                if (isMobile()) closeSidebar();
            });
        });

        window.addEventListener('resize', function () {
            if (!isMobile()) {
                overlay.style.display = 'none';
                document.body.style.overflow = '';
                toggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    function listingFromMarketplaceCard(button) {
        const card = button.closest('.group.bg-surface-container-lowest, .bg-surface-container-lowest, .rounded-3xl');
        if (!card) return null;

        const titleEl = card.querySelector('h3, h2, h1');
        const priceEl = card.querySelector('.text-xl.font-extrabold, .text-3xl.font-extrabold, .font-extrabold');
        const locationEl = card.querySelector('.text-xs.flex.items-center span:last-child, p.text-slate-500, .text-xs.text-slate-500');
        const unitEl = card.querySelector('.text-xs.font-normal, .text-sm.font-medium');
        const imgEl = card.querySelector('img');

        const name = titleEl ? titleEl.textContent.trim() : '';
        const priceText = priceEl ? priceEl.textContent : '';
        const unitText = unitEl ? unitEl.textContent : priceText;
        const price = parsePrice(priceText);

        if (!name || !price) return null;

        return normalizeCartItem({
            name: name,
            farm: locationEl ? locationEl.textContent.trim() : 'Travia Verified Farm',
            unit: parseUnit(unitText),
            price: price,
            image: imgEl ? imgEl.src : ''
        });
    }

    function listingFromDetailPage() {
        const titleEl = document.querySelector('h1.font-extrabold, h1.text-4xl, main h1');
        const priceEl = document.querySelector('.text-3xl.font-extrabold.text-primary, .text-xl.font-extrabold.text-primary, .text-2xl.font-extrabold.text-primary');
        const unitEl = document.querySelector('.text-sm.font-medium.text-outline');
        const imgEl = document.querySelector('.lg\\:col-span-7 img, main img');

        const name = titleEl ? titleEl.textContent.trim() : '';
        const priceText = priceEl ? priceEl.textContent : '';
        const unitText = unitEl ? unitEl.textContent : priceText;
        const price = parsePrice(priceText);

        if (!name || !price) return null;

        return normalizeCartItem({
            name: name,
            farm: 'Travia Verified Farm',
            unit: parseUnit(unitText),
            price: price,
            image: imgEl ? imgEl.src : ''
        });
    }

    function isAddToCartButton(button) {
        if (!button || button.hasAttribute('data-menu-toggle')) return false;

        const byDataIcon = button.querySelector('[data-icon="shopping_cart"], [data-icon="add_shopping_cart"]');
        const byIconText = Array.from(button.querySelectorAll('.material-symbols-outlined')).some(function (icon) {
            const iconName = String(icon.getAttribute('data-icon') || icon.textContent || '').trim();
            return iconName === 'shopping_cart' || iconName === 'add_shopping_cart';
        });
        const byText = /\badd to cart\b/i.test(button.textContent || '');

        return Boolean(byDataIcon || byIconText || byText);
    }

    function initAddToCartButtons() {
        document.querySelectorAll('button').forEach(function (button) {
            if (!isAddToCartButton(button)) return;
            if (button.dataset.cartBound === 'true') return;

            button.dataset.cartBound = 'true';
            button.dataset.actionBound = 'true';
            button.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();

                let listing = null;
                if (/\badd to cart\b/i.test(button.textContent || '')) {
                    listing = listingFromDetailPage();
                }
                if (!listing) {
                    listing = listingFromMarketplaceCard(button);
                }
                if (!listing) {
                    listing = listingFromDetailPage();
                }
                if (!listing || !listing.price) {
                    appToast('Unable to add this item right now');
                    return;
                }

                const cart = getCart();
                cart.push(listing);
                saveCart(cart);
                appToast(listing.name + ' added to cart!');

                button.classList.add('bg-primary-container');
                setTimeout(function () {
                    button.classList.remove('bg-primary-container');
                }, 500);
            });
        });
    }

    function inferMarketplaceType(name) {
        const lowered = String(name || '').toLowerCase();
        if (lowered.includes('snail')) return 'snails';
        if (/(fish|catfish|mackerel|tilapia|croaker|mudfish|bass)/.test(lowered)) return 'fish';
        return 'other';
    }

    function isNearLocation(location) {
        const lowered = String(location || '').toLowerCase();
        return /(lagos|ogun|ibadan|ikorodu|epe|lekki|ajah|ikeja|yaba)/.test(lowered);
    }

    function readCardRating(card) {
        const ratingEl = card.querySelector('.absolute.top-4.right-4 .text-xs.font-bold, .text-xs.font-bold.text-on-surface');
        const ratingText = ratingEl ? ratingEl.textContent : '';
        return Number(String(ratingText || '').replace(/[^0-9.]/g, '')) || 0;
    }

    function initMarketplaceFilters() {
        const grid = document.querySelector('[data-market-grid]');
        const searchInput = document.querySelector('[data-market-search]');
        const chipsContainer = document.querySelector('[data-market-filters]');
        if (!grid || !searchInput || !chipsContainer) return;

        const cards = Array.from(grid.querySelectorAll('[data-market-card]'));
        const chipButtons = Array.from(chipsContainer.querySelectorAll('[data-filter]'));
        if (!cards.length || !chipButtons.length) return;

        let noResults = document.getElementById('marketNoResults');
        if (!noResults) {
            noResults = document.createElement('div');
            noResults.id = 'marketNoResults';
            noResults.className = 'hidden mt-4 rounded-2xl border border-dashed border-outline-variant/50 bg-surface-container-low px-6 py-8 text-center text-sm font-semibold text-slate-500';
            noResults.textContent = 'No listings matched your search or filter.';
            grid.insertAdjacentElement('afterend', noResults);
        }

        const cardMeta = cards.map(function (card, index) {
            const nameEl = card.querySelector('h3, h2, h1');
            const locationEl = card.querySelector('.text-xs.flex.items-center span:last-child, p.text-slate-500, .text-xs.text-slate-500');
            const name = nameEl ? nameEl.textContent.trim() : '';
            const location = locationEl ? locationEl.textContent.trim() : '';
            const type = inferMarketplaceType(name);
            const rating = readCardRating(card);

            return {
                card: card,
                index: index,
                type: type,
                rating: rating,
                near: isNearLocation(location),
                searchableText: (name + ' ' + location + ' ' + type).toLowerCase()
            };
        });

        let activeFilter = 'all';

        function setActiveChip() {
            chipButtons.forEach(function (button) {
                const isActive = (button.dataset.filter || 'all') === activeFilter;
                button.classList.toggle('bg-primary', isActive);
                button.classList.toggle('text-white', isActive);
                button.classList.toggle('bg-surface-container-high', !isActive);
                button.classList.toggle('text-on-surface-variant', !isActive);
            });
        }

        function reorderCards() {
            const sorted = cardMeta.slice();
            if (activeFilter === 'freshest') {
                sorted.sort(function (a, b) {
                    if (b.rating !== a.rating) return b.rating - a.rating;
                    return a.index - b.index;
                });
            } else {
                sorted.sort(function (a, b) {
                    return a.index - b.index;
                });
            }
            sorted.forEach(function (meta) {
                grid.appendChild(meta.card);
            });
        }

        function applyMarketplaceFilters() {
            const query = String(searchInput.value || '').trim().toLowerCase();
            let visibleCount = 0;

            reorderCards();

            cardMeta.forEach(function (meta) {
                let filterMatch = true;
                if (activeFilter === 'fish') filterMatch = meta.type === 'fish';
                if (activeFilter === 'snails') filterMatch = meta.type === 'snails';
                if (activeFilter === 'near') filterMatch = meta.near;
                if (activeFilter === 'top') filterMatch = meta.rating >= 4.8;

                const searchMatch = !query || meta.searchableText.includes(query);
                const visible = filterMatch && searchMatch;
                meta.card.style.display = visible ? '' : 'none';
                if (visible) visibleCount += 1;
            });

            noResults.classList.toggle('hidden', visibleCount > 0);
        }

        chipButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                activeFilter = button.dataset.filter || 'all';
                setActiveChip();
                applyMarketplaceFilters();
            });
        });

        searchInput.addEventListener('input', applyMarketplaceFilters);

        setActiveChip();
        applyMarketplaceFilters();
    }

    function initMarketplaceCardNavigation() {
        const cards = Array.from(document.querySelectorAll('[data-market-card]'));
        if (!cards.length) return;

        cards.forEach(function (card) {
            if (card.dataset.productNavBound === 'true') return;
            card.dataset.productNavBound = 'true';
            card.style.cursor = 'pointer';
            card.setAttribute('role', 'link');
            if (!card.hasAttribute('tabindex')) {
                card.setAttribute('tabindex', '0');
            }

            function navigateToProductDetail() {
                const productUrl = card.dataset.productUrl || 'product_detail.html';
                window.location.href = productUrl;
            }

            card.addEventListener('click', function (event) {
                if (event.target.closest('button')) return;
                navigateToProductDetail();
            });

            card.addEventListener('keydown', function (event) {
                if (event.key !== 'Enter' && event.key !== ' ') return;
                event.preventDefault();
                navigateToProductDetail();
            });
        });
    }

    function initFloatingCartButton() {
        const fab = document.querySelector('.fixed.bottom-8.right-8');
        if (!fab) return;
        if (fab.dataset.fabBound === 'true') return;
        fab.dataset.fabBound = 'true';

        if (!fab.hasAttribute('onclick') && !fab.hasAttribute('href')) {
            fab.addEventListener('click', function () {
                window.location.href = 'cart.html';
            });
            fab.style.cursor = 'pointer';
        }
    }

    let actionModalState = null;

    function getCurrentPageName() {
        const pathname = String(window.location.pathname || '').toLowerCase();
        const parts = pathname.split('/');
        return parts[parts.length - 1] || '';
    }

    function normalizeText(value) {
        return String(value || '').replace(/\s+/g, ' ').trim();
    }

    function getButtonLabel(button) {
        const text = normalizeText(button && button.textContent);
        if (text) return text;
        const icon = button ? button.querySelector('.material-symbols-outlined') : null;
        if (icon) return normalizeText(icon.getAttribute('data-icon') || icon.textContent || 'Action');
        return 'Action';
    }

    function ensureBuyerUiStyles() {
        const styleId = 'travia-buyer-action-styles';
        if (document.getElementById(styleId)) return;
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = '' +
            '.travia-no-scrollbar{scrollbar-width:none;-ms-overflow-style:none;}' +
            '.travia-no-scrollbar::-webkit-scrollbar{width:0;height:0;display:none;}';
        document.head.appendChild(style);
    }

    function closeActionModal() {
        if (!actionModalState) return;
        const overlay = actionModalState.overlay;
        const onKeyDown = actionModalState.onKeyDown;
        const previousOverflow = actionModalState.previousOverflow;
        if (onKeyDown) {
            document.removeEventListener('keydown', onKeyDown);
        }
        if (overlay && overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
        }
        document.body.style.overflow = previousOverflow || '';
        actionModalState = null;
    }

    function openActionModal(options) {
        closeActionModal();
        ensureBuyerUiStyles();

        const title = normalizeText(options && options.title) || 'Notification';
        const subtitle = normalizeText(options && options.subtitle);
        const content = options && options.content ? String(options.content) : '';

        const overlay = document.createElement('div');
        overlay.className = 'fixed inset-0 z-[1200] bg-[#00261a]/60 backdrop-blur-sm p-4 sm:p-6 flex items-start sm:items-center justify-center';

        const panel = document.createElement('div');
        panel.className = 'w-full max-w-2xl bg-white dark:bg-[#00261a] border border-surface-container rounded-2xl shadow-2xl overflow-hidden';
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-modal', 'true');
        panel.innerHTML = '' +
            '<div class="flex items-start justify-between gap-4 px-5 py-4 border-b border-surface-container">' +
                '<div class="min-w-0">' +
                    '<h3 class="font-manrope font-extrabold text-lg text-[#0f3d2e] dark:text-[#beedd7]">' + escapeHtml(title) + '</h3>' +
                    (subtitle ? '<p class="text-sm text-slate-500 mt-1">' + escapeHtml(subtitle) + '</p>' : '') +
                '</div>' +
                '<button type="button" data-modal-close class="w-10 h-10 rounded-full border border-surface-container text-slate-500 hover:text-[#0f3d2e] hover:bg-slate-100 dark:hover:bg-[#0f3d2e] flex items-center justify-center">' +
                    '<span class="material-symbols-outlined text-[20px]">close</span>' +
                '</button>' +
            '</div>' +
            '<div class="px-5 py-4 max-h-[70vh] overflow-y-auto travia-no-scrollbar">' + content + '</div>';

        overlay.appendChild(panel);
        document.body.appendChild(overlay);

        const closeBtn = panel.querySelector('[data-modal-close]');
        if (closeBtn) {
            closeBtn.dataset.actionBound = 'true';
            closeBtn.addEventListener('click', closeActionModal);
        }

        overlay.addEventListener('click', function (event) {
            if (event.target === overlay) {
                closeActionModal();
            }
        });

        const onKeyDown = function (event) {
            if (event.key === 'Escape') {
                closeActionModal();
            }
        };
        document.addEventListener('keydown', onKeyDown);

        actionModalState = {
            overlay: overlay,
            onKeyDown: onKeyDown,
            previousOverflow: document.body.style.overflow
        };
        document.body.style.overflow = 'hidden';
        return panel;
    }

    function openBuyerNotificationCenter() {
        const messages = [
            {
                type: 'Order Update',
                message: 'Order #TRV-88224 has been shipped and is on the way.',
                time: '8 mins ago',
                href: 'my-orders.html'
            },
            {
                type: 'Pre-Order',
                message: 'Your pre-order slot for weekend fish delivery is confirmed.',
                time: '22 mins ago',
                href: 'pre-orders.html'
            },
            {
                type: 'Price Alert',
                message: 'Catfish prices dropped by 6% in your preferred market.',
                time: '1 hr ago',
                href: 'buyers-dashboard.html'
            },
            {
                type: 'Payment',
                message: 'Your last checkout was processed successfully.',
                time: 'Yesterday',
                href: 'cart.html'
            }
        ];

        const messageHtml = messages.map(function (item) {
            return '' +
                '<button type="button" data-notification-link="' + escapeHtml(item.href) + '" class="w-full text-left rounded-xl border border-surface-container bg-slate-50/70 dark:bg-[#0f3d2e]/30 px-4 py-3 hover:bg-slate-100 dark:hover:bg-[#0f3d2e] transition-colors">' +
                    '<p class="text-xs font-bold uppercase tracking-wide text-[#0f3d2e] dark:text-[#beedd7]">' + escapeHtml(item.type) + '</p>' +
                    '<p class="text-sm text-slate-700 dark:text-slate-200 mt-1 leading-relaxed">' + escapeHtml(item.message) + '</p>' +
                    '<p class="text-xs text-slate-500 mt-2">' + escapeHtml(item.time) + '</p>' +
                '</button>';
        }).join('');

        const panel = openActionModal({
            title: 'Notifications',
            subtitle: 'Real-time updates from your marketplace activity.',
            content: '' +
                '<div class="space-y-3 travia-no-scrollbar">' + messageHtml + '</div>' +
                '<div class="pt-4 mt-4 border-t border-surface-container flex items-center justify-between gap-3">' +
                    '<button type="button" data-mark-all-read class="px-4 py-2 rounded-full bg-primary text-white text-sm font-bold hover:opacity-90 transition-opacity">Mark all as read</button>' +
                    '<button type="button" data-open-orders class="px-4 py-2 rounded-full border border-primary text-primary text-sm font-bold hover:bg-primary/10 transition-colors">Open Orders</button>' +
                '</div>'
        });

        if (!panel) return;

        panel.querySelectorAll('[data-notification-link]').forEach(function (button) {
            button.dataset.actionBound = 'true';
            button.addEventListener('click', function () {
                const href = button.getAttribute('data-notification-link') || 'my-orders.html';
                closeActionModal();
                window.location.href = href;
            });
        });

        const markAllReadBtn = panel.querySelector('[data-mark-all-read]');
        if (markAllReadBtn) {
            markAllReadBtn.dataset.actionBound = 'true';
            markAllReadBtn.addEventListener('click', function () {
                appToast('All notifications marked as read');
            });
        }

        const openOrdersBtn = panel.querySelector('[data-open-orders]');
        if (openOrdersBtn) {
            openOrdersBtn.dataset.actionBound = 'true';
            openOrdersBtn.addEventListener('click', function () {
                closeActionModal();
                window.location.href = 'my-orders.html';
            });
        }
    }

    function initNotificationButtons() {
        document.querySelectorAll('button').forEach(function (button) {
            const icon = button.querySelector('[data-icon="notifications"]');
            if (!icon) return;
            if (button.dataset.actionBound === 'true') return;

            button.dataset.actionBound = 'true';
            button.addEventListener('click', function (event) {
                event.preventDefault();
                openBuyerNotificationCenter();
            });
        });
    }

    function initPreOrderButtons() {
        const page = getCurrentPageName();
        document.querySelectorAll('button').forEach(function (button) {
            const label = normalizeText(button.textContent).toLowerCase();
            if (label !== 'pre-order') return;
            if (button.dataset.actionBound === 'true') return;

            button.dataset.actionBound = 'true';
            button.addEventListener('click', function (event) {
                event.preventDefault();
                if (page === 'pre-orders.html') {
                    appToast('You are already on the pre-orders page');
                    return;
                }
                window.location.href = 'pre-orders.html';
            });
        });
    }

    function initDashboardButtons() {
        if (getCurrentPageName() !== 'buyers-dashboard.html') return;

        document.querySelectorAll('button').forEach(function (button) {
            const label = normalizeText(button.textContent).toLowerCase();
            if (label === 'explore collections' && button.dataset.actionBound !== 'true') {
                button.dataset.actionBound = 'true';
                button.addEventListener('click', function (event) {
                    event.preventDefault();
                    const searchBar = document.querySelector('[data-market-search]');
                    if (searchBar) {
                        searchBar.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        searchBar.focus({ preventScroll: true });
                    }
                    appToast('Marketplace ready. Start searching products.');
                });
            }

            if (label === 'read impact report' && button.dataset.actionBound !== 'true') {
                button.dataset.actionBound = 'true';
                button.addEventListener('click', function (event) {
                    event.preventDefault();
                    const panel = openActionModal({
                        title: 'Sustainable Farming Impact',
                        subtitle: 'How your purchases support verified local farms.',
                        content: '' +
                            '<div class="space-y-4 text-sm text-slate-700 dark:text-slate-200">' +
                                '<p>Travia buyers have funded cold-chain logistics for 200+ farms and reduced produce wastage by an estimated 31% this quarter.</p>' +
                                '<ul class="list-disc pl-5 space-y-1">' +
                                    '<li>Direct sourcing from verified farms</li>' +
                                    '<li>Faster delivery windows for fresh produce</li>' +
                                    '<li>Better payout transparency for producers</li>' +
                                '</ul>' +
                                '<div class="pt-2">' +
                                    '<button type="button" data-impact-route class="px-4 py-2 rounded-full bg-primary text-white font-bold text-sm hover:opacity-90 transition-opacity">View Partner Farms</button>' +
                                '</div>' +
                            '</div>'
                    });
                    if (!panel) return;
                    const cta = panel.querySelector('[data-impact-route]');
                    if (cta) {
                        cta.dataset.actionBound = 'true';
                        cta.addEventListener('click', function () {
                            closeActionModal();
                            window.location.href = 'favourite-farms.html';
                        });
                    }
                });
            }
        });
    }

    function initProductDetailButtons() {
        if (getCurrentPageName() !== 'product_detail.html') return;

        const weightLabel = Array.from(document.querySelectorAll('label')).find(function (label) {
            return /select weight/i.test(label.textContent || '');
        });
        if (weightLabel) {
            const weightButtons = Array.from(weightLabel.parentElement.querySelectorAll('button'));
            weightButtons.forEach(function (button) {
                if (button.dataset.actionBound === 'true') return;
                button.dataset.actionBound = 'true';
                button.addEventListener('click', function (event) {
                    event.preventDefault();
                    weightButtons.forEach(function (btn) {
                        btn.classList.remove('bg-surface-container-lowest', 'border-primary-fixed', 'text-primary');
                        btn.classList.add('bg-transparent', 'border-outline-variant', 'text-outline');
                    });
                    button.classList.remove('bg-transparent', 'border-outline-variant', 'text-outline');
                    button.classList.add('bg-surface-container-lowest', 'border-primary-fixed', 'text-primary');
                    document.body.dataset.selectedWeight = normalizeText(button.textContent);
                    appToast('Weight selected: ' + normalizeText(button.textContent));
                });
            });
        }

        const topFavoriteButton = document.querySelector('button.w-14.h-14');
        if (topFavoriteButton && topFavoriteButton.dataset.actionBound !== 'true') {
            topFavoriteButton.dataset.actionBound = 'true';
            topFavoriteButton.addEventListener('click', function (event) {
                event.preventDefault();
                const icon = topFavoriteButton.querySelector('.material-symbols-outlined');
                const active = topFavoriteButton.dataset.favoriteActive === 'true';
                if (active) {
                    topFavoriteButton.dataset.favoriteActive = 'false';
                    topFavoriteButton.classList.remove('bg-primary-fixed');
                    if (icon) icon.style.fontVariationSettings = '\'FILL\' 0';
                    appToast('Removed from favourites');
                } else {
                    topFavoriteButton.dataset.favoriteActive = 'true';
                    topFavoriteButton.classList.add('bg-primary-fixed');
                    if (icon) icon.style.fontVariationSettings = '\'FILL\' 1';
                    appToast('Added to favourites');
                }
            });
        }

        document.querySelectorAll('button').forEach(function (button) {
            const label = normalizeText(button.textContent).toLowerCase();
            if (label === 'write a review' && button.dataset.actionBound !== 'true') {
                button.dataset.actionBound = 'true';
                button.addEventListener('click', function (event) {
                    event.preventDefault();
                    const panel = openActionModal({
                        title: 'Write a Review',
                        subtitle: 'Share your purchase experience.',
                        content: '' +
                            '<div class="space-y-4">' +
                                '<textarea data-review-text class="w-full min-h-28 rounded-xl border border-surface-container px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="How was the freshness, delivery speed, and quality?"></textarea>' +
                                '<div class="flex justify-end">' +
                                    '<button type="button" data-submit-review class="px-4 py-2 rounded-full bg-primary text-white text-sm font-bold hover:opacity-90 transition-opacity">Submit Review</button>' +
                                '</div>' +
                            '</div>'
                    });
                    if (!panel) return;
                    const submit = panel.querySelector('[data-submit-review]');
                    if (!submit) return;
                    submit.dataset.actionBound = 'true';
                    submit.addEventListener('click', function () {
                        const input = panel.querySelector('[data-review-text]');
                        const hasText = normalizeText(input && input.value).length > 0;
                        if (!hasText) {
                            appToast('Please add a short review before submitting');
                            return;
                        }
                        closeActionModal();
                        appToast('Review submitted successfully');
                    });
                });
            }

            if (label === 'visit farm store' && button.dataset.actionBound !== 'true') {
                button.dataset.actionBound = 'true';
                button.addEventListener('click', function (event) {
                    event.preventDefault();
                    window.location.href = 'favourite-farms.html';
                });
            }

            if (label === 'view all' && button.dataset.actionBound !== 'true') {
                button.dataset.actionBound = 'true';
                button.addEventListener('click', function (event) {
                    event.preventDefault();
                    window.location.href = 'buyers-dashboard.html';
                });
            }
        });

        document.querySelectorAll('button.absolute.top-4.right-4').forEach(function (button) {
            if (button.dataset.actionBound === 'true') return;
            if (!button.querySelector('.material-symbols-outlined')) return;
            button.dataset.actionBound = 'true';
            button.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                const icon = button.querySelector('.material-symbols-outlined');
                const filled = button.dataset.favoriteActive === 'true';
                if (filled) {
                    button.dataset.favoriteActive = 'false';
                    if (icon) icon.style.fontVariationSettings = '\'FILL\' 0';
                    appToast('Removed item from favourites');
                } else {
                    button.dataset.favoriteActive = 'true';
                    if (icon) icon.style.fontVariationSettings = '\'FILL\' 1';
                    appToast('Added item to favourites');
                }
            });
        });
    }

    function initProfileButtons() {
        if (getCurrentPageName() !== 'my-profile.html') return;

        document.querySelectorAll('button').forEach(function (button) {
            const label = normalizeText(button.textContent).toLowerCase();
            const icon = button.querySelector('[data-icon="edit"]');

            if (icon && button.dataset.actionBound !== 'true') {
                button.dataset.actionBound = 'true';
                button.addEventListener('click', function (event) {
                    event.preventDefault();
                    appToast('Profile photo editor coming soon');
                });
            }

            if (label === 'save changes' && button.dataset.actionBound !== 'true') {
                button.dataset.actionBound = 'true';
                button.addEventListener('click', function (event) {
                    event.preventDefault();
                    appToast('Profile changes saved successfully');
                });
            }

            if (label === 'change password' && button.dataset.actionBound !== 'true') {
                button.dataset.actionBound = 'true';
                button.addEventListener('click', function (event) {
                    event.preventDefault();
                    openActionModal({
                        title: 'Change Password',
                        subtitle: 'Security update',
                        content: '<p class="text-sm text-slate-600 dark:text-slate-200">Password update flow is enabled. You can connect this button to your API endpoint anytime.</p>'
                    });
                });
            }

            if (label === 'two-factor auth' && button.dataset.actionBound !== 'true') {
                button.dataset.actionBound = 'true';
                button.addEventListener('click', function (event) {
                    event.preventDefault();
                    const badge = button.querySelector('.text-xs');
                    if (!badge) {
                        appToast('Two-factor settings opened');
                        return;
                    }
                    const enabled = /enabled/i.test(badge.textContent || '');
                    badge.textContent = enabled ? 'Disabled' : 'Enabled';
                    badge.classList.toggle('bg-primary-fixed', !enabled);
                    badge.classList.toggle('text-on-primary-fixed-variant', !enabled);
                    badge.classList.toggle('bg-slate-300', enabled);
                    badge.classList.toggle('text-slate-700', enabled);
                    appToast('Two-factor authentication ' + (enabled ? 'disabled' : 'enabled'));
                });
            }

            if (label === 'complete verification' && button.dataset.actionBound !== 'true') {
                button.dataset.actionBound = 'true';
                button.addEventListener('click', function (event) {
                    event.preventDefault();
                    openActionModal({
                        title: 'Verification Checklist',
                        subtitle: 'Final steps for premium status',
                        content: '' +
                            '<ul class="list-disc pl-5 text-sm text-slate-700 dark:text-slate-200 space-y-2">' +
                                '<li>Upload tax identification document</li>' +
                                '<li>Upload trade license</li>' +
                                '<li>Confirm business phone number</li>' +
                            '</ul>' +
                            '<p class="text-sm text-slate-500 mt-4">Verification request has been started for your profile.</p>'
                    });
                });
            }
        });
    }

    function initMyOrdersInteractions() {
        if (getCurrentPageName() !== 'my-orders.html') return;

        const searchInput = document.querySelector('input[placeholder*="Order ID"]');
        const statusButtons = Array.from(document.querySelectorAll('button')).filter(function (button) {
            const label = normalizeText(button.textContent).toLowerCase();
            return label === 'all' || label === 'pending' || label === 'shipped' || label === 'delivered';
        });

        const tableRows = Array.from(document.querySelectorAll('tbody tr'));
        const mobileCards = Array.from(document.querySelectorAll('.lg\\:hidden.p-4.space-y-4 > div.p-4'));
        const pagerBar = document.querySelector('.px-8.py-4.bg-surface-container-low');
        const pagerText = pagerBar ? pagerBar.querySelector('p') : null;
        const pagerButtons = pagerBar ? Array.from(pagerBar.querySelectorAll('button')) : [];
        const prevButton = pagerButtons.find(function (button) {
            return Boolean(button.querySelector('[data-icon="chevron_left"]'));
        });
        const nextButton = pagerButtons.find(function (button) {
            return Boolean(button.querySelector('[data-icon="chevron_right"]'));
        });
        const pageButtons = pagerButtons.filter(function (button) {
            return /^\d+$/.test(normalizeText(button.textContent));
        });

        const ordersSection = document.querySelector('section.bg-surface-container-lowest.rounded-2xl');
        let noResults = document.getElementById('ordersNoResults');
        if (!noResults && ordersSection && pagerBar && pagerBar.parentNode) {
            noResults = document.createElement('div');
            noResults.id = 'ordersNoResults';
            noResults.className = 'hidden px-6 py-10 text-center text-sm font-semibold text-slate-500';
            noResults.textContent = 'No orders found for this filter.';
            pagerBar.parentNode.insertBefore(noResults, pagerBar);
        }

        function extractStatus(element) {
            const text = normalizeText(element && element.textContent).toLowerCase();
            if (text.indexOf('deliver') >= 0) return 'delivered';
            if (text.indexOf('ship') >= 0) return 'shipped';
            if (text.indexOf('pend') >= 0) return 'pending';
            return 'all';
        }

        const desktopMeta = tableRows.map(function (row) {
            const statusEl = row.querySelector('td:nth-child(4) span');
            return {
                element: row,
                status: extractStatus(statusEl || row),
                searchable: normalizeText(row.textContent).toLowerCase()
            };
        });
        const mobileMeta = mobileCards.map(function (card) {
            const statusEl = card.querySelector('span.inline-flex');
            return {
                element: card,
                status: extractStatus(statusEl || card),
                searchable: normalizeText(card.textContent).toLowerCase()
            };
        });

        let activeStatus = 'all';
        let activePage = 1;
        const pageSize = 2;

        function filterMeta(meta) {
            const query = normalizeText(searchInput && searchInput.value).toLowerCase();
            return meta.filter(function (item) {
                const statusMatch = activeStatus === 'all' || item.status === activeStatus;
                const queryMatch = !query || item.searchable.indexOf(query) >= 0;
                return statusMatch && queryMatch;
            });
        }

        function renderMeta(meta, filtered) {
            const start = (activePage - 1) * pageSize;
            const end = start + pageSize;
            meta.forEach(function (item) {
                item.element.style.display = 'none';
            });
            filtered.slice(start, end).forEach(function (item) {
                item.element.style.display = '';
            });
        }

        function updateStatusButtonStyles() {
            statusButtons.forEach(function (button) {
                const label = normalizeText(button.textContent).toLowerCase();
                const active = label === activeStatus;
                button.classList.toggle('bg-primary', active);
                button.classList.toggle('text-white', active);
                button.classList.toggle('bg-surface-container-low', !active);
                button.classList.toggle('text-slate-600', !active);
                button.classList.toggle('hover:bg-surface-container-high', !active);
            });
        }

        function updatePaginationButtonStyles(totalPages, totalItems) {
            pageButtons.forEach(function (button) {
                const page = Number(normalizeText(button.textContent));
                const isVisible = page <= totalPages;
                const isActive = page === activePage;
                button.style.display = isVisible ? 'flex' : 'none';
                button.disabled = !isVisible;
                button.classList.toggle('bg-primary', isActive);
                button.classList.toggle('text-white', isActive);
                button.classList.toggle('hover:bg-surface-container', !isActive);
            });
            if (prevButton) {
                prevButton.disabled = totalItems === 0 || activePage <= 1;
            }
            if (nextButton) {
                nextButton.disabled = totalItems === 0 || activePage >= totalPages;
            }
        }

        function applyOrderState() {
            const filteredDesktop = filterMeta(desktopMeta);
            const filteredMobile = filterMeta(mobileMeta);
            const totalItems = Math.max(filteredDesktop.length, filteredMobile.length);
            const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

            if (activePage > totalPages) {
                activePage = totalPages;
            }

            renderMeta(desktopMeta, filteredDesktop);
            renderMeta(mobileMeta, filteredMobile);

            if (pagerText) {
                if (totalItems === 0) {
                    pagerText.textContent = 'No matching orders';
                } else {
                    const start = (activePage - 1) * pageSize + 1;
                    const end = Math.min(activePage * pageSize, totalItems);
                    pagerText.textContent = 'Showing ' + start + '-' + end + ' of ' + totalItems + ' orders';
                }
            }

            if (noResults) {
                noResults.classList.toggle('hidden', totalItems > 0);
            }

            updateStatusButtonStyles();
            updatePaginationButtonStyles(totalPages, totalItems);
        }

        statusButtons.forEach(function (button) {
            if (button.dataset.actionBound === 'true') return;
            button.dataset.actionBound = 'true';
            button.addEventListener('click', function (event) {
                event.preventDefault();
                activeStatus = normalizeText(button.textContent).toLowerCase();
                activePage = 1;
                applyOrderState();
            });
        });

        if (searchInput) {
            searchInput.addEventListener('input', function () {
                activePage = 1;
                applyOrderState();
            });
        }

        pageButtons.forEach(function (button) {
            if (button.dataset.actionBound === 'true') return;
            button.dataset.actionBound = 'true';
            button.addEventListener('click', function (event) {
                event.preventDefault();
                const page = Number(normalizeText(button.textContent)) || 1;
                activePage = page;
                applyOrderState();
            });
        });

        if (prevButton && prevButton.dataset.actionBound !== 'true') {
            prevButton.dataset.actionBound = 'true';
            prevButton.addEventListener('click', function (event) {
                event.preventDefault();
                if (activePage <= 1) return;
                activePage -= 1;
                applyOrderState();
            });
        }

        if (nextButton && nextButton.dataset.actionBound !== 'true') {
            nextButton.dataset.actionBound = 'true';
            nextButton.addEventListener('click', function (event) {
                event.preventDefault();
                activePage += 1;
                applyOrderState();
            });
        }

        document.querySelectorAll('button').forEach(function (button) {
            const label = normalizeText(button.textContent).toLowerCase();
            if (label === 'view details' || label === 'details') {
                if (button.dataset.actionBound === 'true') return;
                button.dataset.actionBound = 'true';
                button.addEventListener('click', function (event) {
                    event.preventDefault();
                    window.location.href = 'product_detail.html';
                });
                return;
            }
            if (label === 'track order' || label === 'track') {
                if (button.dataset.actionBound === 'true') return;
                button.dataset.actionBound = 'true';
                button.addEventListener('click', function (event) {
                    event.preventDefault();
                    appToast('Live tracking opened for this order');
                    openBuyerNotificationCenter();
                });
                return;
            }
            if (label === 'modify') {
                if (button.dataset.actionBound === 'true') return;
                button.dataset.actionBound = 'true';
                button.addEventListener('click', function (event) {
                    event.preventDefault();
                    appToast('Modification request started for this order');
                });
            }
        });

        applyOrderState();
    }

    function initCartCheckoutAction() {
        if (getCurrentPageName() !== 'cart.html') return;
        const checkoutBtn = Array.from(document.querySelectorAll('button')).find(function (button) {
            return /proceed to checkout/i.test(button.textContent || '');
        });
        if (!checkoutBtn || checkoutBtn.dataset.actionBound === 'true') return;

        checkoutBtn.dataset.actionBound = 'true';
        checkoutBtn.addEventListener('click', function (event) {
            event.preventDefault();
            const cart = getCart();
            if (!cart.length) {
                appToast('Your cart is empty');
                return;
            }
            const total = cart.reduce(function (sum, item) {
                return sum + (Number(item.price) || 0);
            }, 0);
            const panel = openActionModal({
                title: 'Checkout Confirmation',
                subtitle: 'Review before placing your order.',
                content: '' +
                    '<div class="space-y-4">' +
                        '<p class="text-sm text-slate-600 dark:text-slate-200">You are about to place ' + cart.length + ' item(s) totaling <strong>' + escapeHtml(formatNaira(total)) + '</strong>.</p>' +
                        '<div class="flex justify-end gap-3">' +
                            '<button type="button" data-cancel-checkout class="px-4 py-2 rounded-full border border-surface-container text-slate-600 text-sm font-bold">Cancel</button>' +
                            '<button type="button" data-confirm-checkout class="px-4 py-2 rounded-full bg-primary text-white text-sm font-bold hover:opacity-90 transition-opacity">Place Order</button>' +
                        '</div>' +
                    '</div>'
            });
            if (!panel) return;
            const cancelBtn = panel.querySelector('[data-cancel-checkout]');
            if (cancelBtn) {
                cancelBtn.dataset.actionBound = 'true';
                cancelBtn.addEventListener('click', closeActionModal);
            }
            const confirmBtn = panel.querySelector('[data-confirm-checkout]');
            if (!confirmBtn) return;
            confirmBtn.dataset.actionBound = 'true';
            confirmBtn.addEventListener('click', function () {
                saveCart([]);
                renderCartPage();
                closeActionModal();
                appToast('Order placed successfully');
                setTimeout(function () {
                    window.location.href = 'my-orders.html';
                }, 450);
            });
        });
    }

    function isFallbackExempt(button) {
        if (!button) return true;
        if (button.dataset.actionBound === 'true') return true;
        if (button.hasAttribute('data-menu-toggle')) return true;
        if (button.hasAttribute('data-filter')) return true;
        if (button.hasAttribute('data-remove-cart')) return true;
        if (button.closest('#mobile-overlay')) return true;
        if (isAddToCartButton(button)) return true;

        const label = normalizeText(button.textContent).toLowerCase();
        if (label === 'all' || label === 'pending' || label === 'shipped' || label === 'delivered') return true;
        if (/^\d+$/.test(label)) return true;

        const hasDeleteIcon = button.querySelector('[data-icon="delete"]');
        if (hasDeleteIcon) return true;
        return false;
    }

    function initFallbackButtonActions() {
        document.querySelectorAll('button').forEach(function (button) {
            if (isFallbackExempt(button)) return;
            button.dataset.actionBound = 'true';
            button.addEventListener('click', function (event) {
                if (button.type === 'submit') {
                    event.preventDefault();
                }
                appToast(getButtonLabel(button) + ' is now active');
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        ensureBuyerUiStyles();
        initSidebar();
        initNotificationButtons();
        initPreOrderButtons();
        initMarketplaceFilters();
        initMarketplaceCardNavigation();
        initAddToCartButtons();
        initFloatingCartButton();
        updateCartBadges();
        renderCartPage();
        initDashboardButtons();
        initProductDetailButtons();
        initProfileButtons();
        initMyOrdersInteractions();
        initCartCheckoutAction();
        initFallbackButtonActions();
    });
})();
