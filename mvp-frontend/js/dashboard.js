(function () {
  const currencyFormatter = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0
  });

  function formatNaira(value) {
    return currencyFormatter.format(Number(value) || 0);
  }

  function hoursAgo(hours) {
    return Date.now() - (hours * 60 * 60 * 1000);
  }

  let toastTimer = null;

  function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add('show');

    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('show');
    }, 2800);
  }

  function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggle = document.querySelector('[data-menu-toggle]');

    if (!sidebar || !toggle) return;

    toggle.addEventListener('click', function () {
      sidebar.classList.toggle('open');
    });

    document.addEventListener('click', function (event) {
      if (window.innerWidth > 960) return;
      if (!sidebar.classList.contains('open')) return;
      if (sidebar.contains(event.target) || toggle.contains(event.target)) return;
      sidebar.classList.remove('open');
    });

    document.querySelectorAll('.nav-item[data-tab]').forEach(function (button) {
      button.addEventListener('click', function () {
        if (window.innerWidth <= 960) {
          sidebar.classList.remove('open');
        }
      });
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 960) {
        sidebar.classList.remove('open');
      }
    });
  }

  function initTabs() {
    const navButtons = Array.from(document.querySelectorAll('.nav-item[data-tab]'));
    const panels = Array.from(document.querySelectorAll('.tab-panel'));
    const topbarTitle = document.getElementById('topbarTitle');

    if (!navButtons.length || !panels.length) {
      return function () {};
    }

    function setTab(tabId) {
      navButtons.forEach(function (button) {
        button.classList.toggle('active', button.dataset.tab === tabId);
      });

      panels.forEach(function (panel) {
        panel.classList.toggle('active', panel.id === 'tab-' + tabId);
      });

      const activeButton = navButtons.find(function (button) {
        return button.dataset.tab === tabId;
      });

      if (topbarTitle && activeButton && activeButton.dataset.title) {
        topbarTitle.textContent = activeButton.dataset.title;
      }
    }

    navButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        setTab(button.dataset.tab);
      });
    });

    document.querySelectorAll('[data-tab-trigger]').forEach(function (button) {
      button.addEventListener('click', function () {
        setTab(button.dataset.tabTrigger);
      });
    });

    const defaultTab = (navButtons.find(function (button) {
      return button.classList.contains('active');
    }) || navButtons[0]).dataset.tab;

    setTab(defaultTab);
    return setTab;
  }

  function initStaticToasts() {
    document.querySelectorAll('[data-toast]').forEach(function (button) {
      button.addEventListener('click', function () {
        showToast(button.dataset.toast);
      });
    });
  }

  function initBuyerDashboard(setTab) {
    const listings = [
      {
        id: 1,
        emoji: '&#128031;',
        type: 'fish',
        name: 'Catfish',
        quantity: 20,
        unit: 'kg',
        pricePerUnit: 4200,
        farm: "Emeka's Farm",
        location: 'Ikorodu, Lagos',
        rating: 4.8,
        harvestedAt: hoursAgo(3),
        near: true,
        clusterEligible: true
      },
      {
        id: 2,
        emoji: '&#128012;',
        type: 'snails',
        name: 'Giant Snails',
        quantity: 80,
        unit: 'pieces',
        pricePerUnit: 850,
        farm: 'Ade Snail Farm',
        location: 'Ikorodu, Lagos',
        rating: 4.9,
        harvestedAt: hoursAgo(2),
        near: true,
        clusterEligible: true
      },
      {
        id: 3,
        emoji: '&#128031;',
        type: 'fish',
        name: 'Tilapia',
        quantity: 30,
        unit: 'kg',
        pricePerUnit: 3800,
        farm: 'Fresh Waters Co.',
        location: 'Epe, Lagos',
        rating: 4.7,
        harvestedAt: hoursAgo(6),
        near: true,
        clusterEligible: false
      },
      {
        id: 4,
        emoji: '&#128031;',
        type: 'fish',
        name: 'Mackerel',
        quantity: 15,
        unit: 'kg',
        pricePerUnit: 5100,
        farm: 'Lekki Fish Hub',
        location: 'Lekki, Lagos',
        rating: 4.6,
        harvestedAt: hoursAgo(11),
        near: true,
        clusterEligible: false
      },
      {
        id: 5,
        emoji: '&#128012;',
        type: 'snails',
        name: 'Medium Snails',
        quantity: 50,
        unit: 'pieces',
        pricePerUnit: 600,
        farm: 'Ogun Farms',
        location: 'Sagamu, Ogun',
        rating: 4.5,
        harvestedAt: hoursAgo(8),
        near: false,
        clusterEligible: true
      },
      {
        id: 6,
        emoji: '&#128031;',
        type: 'fish',
        name: 'Catfish Bulk',
        quantity: 50,
        unit: 'kg',
        pricePerUnit: 3900,
        farm: 'Badagry Fish Co.',
        location: 'Badagry, Lagos',
        rating: 4.8,
        harvestedAt: hoursAgo(4),
        near: true,
        clusterEligible: true
      }
    ];

    const deliveryFees = {
      pickup: 0,
      kwik: 1500,
      cluster: 600
    };

    const state = {
      filter: 'all',
      search: '',
      delivery: 'pickup',
      cart: []
    };

    const listingGrid = document.getElementById('listingGrid');
    const searchInput = document.getElementById('marketSearch');
    const filterButtons = Array.from(document.querySelectorAll('#marketFilters .chip'));

    const cartOverlay = document.getElementById('cartOverlay');
    const cartDrawer = document.getElementById('cartDrawer');
    const cartItems = document.getElementById('cartItems');
    const cartEmpty = document.getElementById('cartEmpty');
    const cartFoot = document.getElementById('cartFoot');
    const deliveryBlock = document.getElementById('deliveryBlock');
    const cartCountBadge = document.getElementById('cartCountBadge');
    const cartTopCount = document.getElementById('cartTopCount');
    const cartNavCount = document.getElementById('cartNavCount');

    const cartSubtotal = document.getElementById('cartSubtotal');
    const cartDelivery = document.getElementById('cartDelivery');
    const cartService = document.getElementById('cartService');
    const cartTotal = document.getElementById('cartTotal');

    const checkoutBtn = document.getElementById('checkoutBtn');
    const clearCartBtn = document.getElementById('clearCartBtn');

    function getFreshHours(listing) {
      return Math.max(1, Math.floor((Date.now() - listing.harvestedAt) / (60 * 60 * 1000)));
    }

    function freshnessClass(hours) {
      if (hours <= 4) return 'fresh-good';
      if (hours <= 10) return 'fresh-mid';
      return 'fresh-old';
    }

    function listTotalPrice(listing) {
      return listing.quantity * listing.pricePerUnit;
    }

    function filteredListings() {
      const searchValue = state.search.trim().toLowerCase();
      let output = listings.slice();

      if (state.filter === 'fish') {
        output = output.filter(function (item) { return item.type === 'fish'; });
      } else if (state.filter === 'snails') {
        output = output.filter(function (item) { return item.type === 'snails'; });
      } else if (state.filter === 'near') {
        output = output.filter(function (item) { return item.near; });
      } else if (state.filter === 'top') {
        output = output.filter(function (item) { return item.rating >= 4.8; });
      }

      if (state.filter === 'freshest') {
        output.sort(function (a, b) {
          return getFreshHours(a) - getFreshHours(b);
        });
      }

      if (searchValue) {
        output = output.filter(function (item) {
          const haystack = [item.name, item.farm, item.location, item.type].join(' ').toLowerCase();
          return haystack.includes(searchValue);
        });
      }

      return output;
    }

    function inCart(id) {
      return state.cart.some(function (item) { return item.id === id; });
    }

    function renderListings() {
      if (!listingGrid) return;

      const cards = filteredListings();
      if (!cards.length) {
        listingGrid.innerHTML = '<div class="card"><p class="helper-text">No listings matched your filter.</p></div>';
        return;
      }

      listingGrid.innerHTML = cards.map(function (item) {
        const freshHours = getFreshHours(item);
        const freshLabel = freshHours + 'hr' + (freshHours > 1 ? 's' : '') + ' fresh';
        const total = listTotalPrice(item);
        const unitLabel = item.unit === 'pieces' ? 'pc' : 'kg';

        return '' +
          '<article class="listing-card">' +
            '<div class="listing-top">' +
              '<div class="emoji">' + item.emoji + '</div>' +
              '<span class="freshness ' + freshnessClass(freshHours) + '">&#9201; ' + freshLabel + '</span>' +
            '</div>' +
            '<div class="listing-name">' + item.name + ' - ' + item.quantity + (item.unit === 'pieces' ? 'pcs' : 'kg') + '</div>' +
            '<div class="listing-meta">&#128205; ' + item.location + ' &middot; ' + item.farm + '<br>&#11088; ' + item.rating.toFixed(1) + ' verified</div>' +
            '<div class="listing-bottom">' +
              '<div class="listing-price">' + formatNaira(total) + '<br><small>' + formatNaira(item.pricePerUnit) + '/' + unitLabel + '</small></div>' +
              '<button class="btn-sm ' + (inCart(item.id) ? 'in-cart' : '') + '" data-add-cart="' + item.id + '" type="button">' +
                (inCart(item.id) ? 'In Cart' : 'Add to Cart') +
              '</button>' +
            '</div>' +
          '</article>';
      }).join('');

      listingGrid.querySelectorAll('[data-add-cart]').forEach(function (button) {
        button.addEventListener('click', function () {
          const id = Number(button.dataset.addCart);
          addToCart(id);
        });
      });
    }

    function openCart() {
      if (!cartOverlay || !cartDrawer) return;
      cartOverlay.classList.add('open');
      cartDrawer.classList.add('open');
    }

    function closeCart() {
      if (!cartOverlay || !cartDrawer) return;
      cartOverlay.classList.remove('open');
      cartDrawer.classList.remove('open');
    }

    function addToCart(id) {
      const listing = listings.find(function (item) { return item.id === id; });
      if (!listing) return;

      const existing = state.cart.find(function (item) { return item.id === id; });
      if (existing) {
        existing.qty += 1;
      } else {
        state.cart.push({
          id: listing.id,
          name: listing.name,
          detail: listing.quantity + (listing.unit === 'pieces' ? 'pcs' : 'kg'),
          farm: listing.farm,
          emoji: listing.emoji,
          price: listTotalPrice(listing),
          clusterEligible: listing.clusterEligible,
          qty: 1
        });
      }

      updateCart();
      renderListings();
      openCart();
      showToast(listing.name + ' added to cart');
    }

    function changeQty(id, delta) {
      const item = state.cart.find(function (entry) { return entry.id === id; });
      if (!item) return;

      item.qty += delta;
      if (item.qty <= 0) {
        state.cart = state.cart.filter(function (entry) { return entry.id !== id; });
      }

      updateCart();
      renderListings();
    }

    function setDelivery(method) {
      state.delivery = method;
      document.querySelectorAll('.delivery-btn').forEach(function (button) {
        button.classList.toggle('active', button.dataset.delivery === method);
      });
      updateCart();
    }

    function updateCart() {
      const totalItems = state.cart.reduce(function (sum, item) {
        return sum + item.qty;
      }, 0);

      if (cartTopCount) cartTopCount.textContent = String(totalItems);
      if (cartNavCount) cartNavCount.textContent = String(totalItems);
      if (cartCountBadge) cartCountBadge.textContent = totalItems + ' item' + (totalItems === 1 ? '' : 's');

      const isEmpty = state.cart.length === 0;
      if (cartEmpty) cartEmpty.style.display = isEmpty ? 'block' : 'none';
      if (cartFoot) cartFoot.style.display = isEmpty ? 'none' : 'block';
      if (deliveryBlock) deliveryBlock.style.display = isEmpty ? 'none' : 'block';

      if (cartItems) {
        cartItems.innerHTML = state.cart.map(function (item) {
          return '' +
            '<div class="cart-item">' +
              '<div>' +
                '<div class="list-name">' + item.emoji + ' ' + item.name + ' - ' + item.detail + '</div>' +
                '<div class="list-meta">' + item.farm + '</div>' +
                '<div class="qty-row">' +
                  '<button class="qty-btn" data-qty="-1" data-id="' + item.id + '" type="button">-</button>' +
                  '<span class="money">' + item.qty + '</span>' +
                  '<button class="qty-btn" data-qty="1" data-id="' + item.id + '" type="button">+</button>' +
                '</div>' +
              '</div>' +
              '<div class="value-col">' +
                '<div class="value-main">' + formatNaira(item.price * item.qty) + '</div>' +
                '<button class="link-btn" data-remove="' + item.id + '" type="button">Remove</button>' +
              '</div>' +
            '</div>';
        }).join('');

        cartItems.querySelectorAll('[data-qty]').forEach(function (button) {
          button.addEventListener('click', function () {
            const id = Number(button.dataset.id);
            const delta = Number(button.dataset.qty);
            changeQty(id, delta);
          });
        });

        cartItems.querySelectorAll('[data-remove]').forEach(function (button) {
          button.addEventListener('click', function () {
            changeQty(Number(button.dataset.remove), -999);
          });
        });
      }

      const subtotal = state.cart.reduce(function (sum, item) {
        return sum + (item.price * item.qty);
      }, 0);

      const deliveryFee = deliveryFees[state.delivery] || 0;
      const serviceFee = Math.round(subtotal * 0.04);
      const total = subtotal + deliveryFee + serviceFee;

      if (cartSubtotal) cartSubtotal.textContent = formatNaira(subtotal);
      if (cartDelivery) cartDelivery.textContent = deliveryFee === 0 ? 'Free' : formatNaira(deliveryFee);
      if (cartService) cartService.textContent = formatNaira(serviceFee);
      if (cartTotal) cartTotal.textContent = formatNaira(total);
    }

    filterButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        state.filter = button.dataset.filter || 'all';
        filterButtons.forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        renderListings();
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', function () {
        state.search = searchInput.value || '';
        renderListings();
      });
    }

    document.querySelectorAll('[data-open-cart]').forEach(function (button) {
      button.addEventListener('click', openCart);
    });

    document.querySelectorAll('[data-close-cart]').forEach(function (button) {
      button.addEventListener('click', closeCart);
    });

    document.querySelectorAll('.delivery-btn').forEach(function (button) {
      button.addEventListener('click', function () {
        setDelivery(button.dataset.delivery || 'pickup');
      });
    });

    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', function () {
        if (!state.cart.length) {
          showToast('Your cart is empty');
          return;
        }

        const subtotal = state.cart.reduce(function (sum, item) {
          return sum + (item.price * item.qty);
        }, 0);
        const fee = deliveryFees[state.delivery] || 0;
        const service = Math.round(subtotal * 0.04);
        const total = subtotal + fee + service;

        state.cart = [];
        updateCart();
        renderListings();
        closeCart();
        showToast('Order placed successfully: ' + formatNaira(total));
      });
    }

    if (clearCartBtn) {
      clearCartBtn.addEventListener('click', function () {
        state.cart = [];
        updateCart();
        renderListings();
        showToast('Cart cleared');
      });
    }

    if (setTab) {
      const preorderTrigger = document.querySelector('[data-tab-trigger="preorders"]');
      if (preorderTrigger) {
        preorderTrigger.addEventListener('click', function () {
          setTab('preorders');
        });
      }
    }

    renderListings();
    updateCart();
    setInterval(renderListings, 60000);
  }

  function initFarmerDashboard() {
    const state = {
      listings: [
        {
          id: 101,
          name: 'Catfish',
          quantity: 20,
          unit: 'kg',
          pricePerUnit: 4200,
          harvestedAt: hoursAgo(3),
          location: 'Lagos Island',
          remainingPercent: 90
        },
        {
          id: 102,
          name: 'Giant Snails',
          quantity: 80,
          unit: 'pieces',
          pricePerUnit: 850,
          harvestedAt: hoursAgo(2),
          location: 'Ikorodu',
          remainingPercent: 95
        },
        {
          id: 103,
          name: 'Tilapia',
          quantity: 15,
          unit: 'kg',
          pricePerUnit: 3800,
          harvestedAt: hoursAgo(11),
          location: 'Epe',
          remainingPercent: 45
        }
      ],
      wallet: {
        available: 182000,
        escrow: 30000,
        month: 182000,
        total: 540000
      },
      payoutHistory: [
        { date: '2026-03-12', amount: 45000, status: 'Success' },
        { date: '2026-03-11', amount: 12000, status: 'Processing' },
        { date: '2026-03-10', amount: 9000, status: 'Pending' }
      ],
      verifiedAccount: null
    };

    const listingRows = document.getElementById('farmerListingRows');
    const overviewPreview = document.getElementById('overviewListingPreview');

    const listingModal = document.getElementById('listingModal');
    const listingForm = document.getElementById('listingForm');

    const bankSearch = document.getElementById('bankSearch');
    const bankList = document.getElementById('bankList');
    const nubanInput = document.getElementById('nubanInput');
    const accountNameResult = document.getElementById('accountNameResult');
    const payoutAmount = document.getElementById('payoutAmount');
    const requestPayoutBtn = document.getElementById('requestPayoutBtn');
    const payoutHistoryRows = document.getElementById('payoutHistoryRows');

    const banks = [
      'Access Bank',
      'First Bank of Nigeria',
      'GTBank',
      'United Bank for Africa',
      'Zenith Bank',
      'Fidelity Bank',
      'Sterling Bank',
      'Union Bank',
      'Wema Bank',
      'Moniepoint MFB'
    ];

    function statusBadge(status) {
      if (status === 'Success') return '<span class="badge badge-done">Success</span>';
      if (status === 'Processing') return '<span class="badge badge-transit">Processing</span>';
      return '<span class="badge badge-transit">Pending</span>';
    }

    function listingStatus(item) {
      const hoursFresh = Math.max(1, Math.floor((Date.now() - item.harvestedAt) / (60 * 60 * 1000)));
      return hoursFresh > 10 ? '<span class="badge badge-transit">Expiring</span>' : '<span class="badge badge-done">Active</span>';
    }

    function renderListings() {
      const count = state.listings.length;
      const totalMonth = state.listings.reduce(function (sum, item) {
        return sum + (item.pricePerUnit * item.quantity);
      }, 0);

      const rowsHtml = state.listings.map(function (item) {
        return '' +
          '<div class="list-row">' +
            '<div>' +
              '<div class="list-name">' + item.name + ' - ' + item.quantity + (item.unit === 'pieces' ? 'pcs' : 'kg') + '</div>' +
              '<div class="list-meta">Harvested ' + Math.max(1, Math.floor((Date.now() - item.harvestedAt) / (60 * 60 * 1000))) + 'hrs ago &middot; ' + item.location + '</div>' +
              '<div class="progress-track"><div class="progress-fill" style="width:' + item.remainingPercent + '%"></div></div>' +
            '</div>' +
            '<div class="value-col">' +
              '<div class="value-main">' + formatNaira(item.pricePerUnit) + '/' + (item.unit === 'pieces' ? 'pc' : 'kg') + '</div>' +
              '<div class="value-sub">Stock ' + item.remainingPercent + '%</div>' +
              listingStatus(item) +
            '</div>' +
          '</div>';
      }).join('');

      if (listingRows) listingRows.innerHTML = rowsHtml;
      if (overviewPreview) overviewPreview.innerHTML = rowsHtml;

      const statActiveListings = document.getElementById('statActiveListings');
      const activeListingsBadge = document.getElementById('activeListingsBadge');
      if (statActiveListings) statActiveListings.textContent = String(count);
      if (activeListingsBadge) activeListingsBadge.textContent = String(count);

      const statMonthRevenue = document.getElementById('statMonthRevenue');
      if (statMonthRevenue) statMonthRevenue.textContent = formatNaira(totalMonth);
    }

    function renderWallet() {
      const available = state.wallet.available;
      const escrow = state.wallet.escrow;

      const availableBalance = document.getElementById('availableBalance');
      const escrowBalance = document.getElementById('escrowBalance');
      const earnAvailable = document.getElementById('earnAvailable');
      const earnEscrow = document.getElementById('earnEscrow');
      const earnMonth = document.getElementById('earnMonth');
      const earnTotal = document.getElementById('earnTotal');

      if (availableBalance) availableBalance.textContent = formatNaira(available);
      if (escrowBalance) escrowBalance.textContent = formatNaira(escrow);
      if (earnAvailable) earnAvailable.textContent = formatNaira(available);
      if (earnEscrow) earnEscrow.textContent = formatNaira(escrow);
      if (earnMonth) earnMonth.textContent = formatNaira(state.wallet.month);
      if (earnTotal) earnTotal.textContent = formatNaira(state.wallet.total);
    }

    function renderPayoutHistory() {
      if (!payoutHistoryRows) return;

      payoutHistoryRows.innerHTML = state.payoutHistory.map(function (entry) {
        return '' +
          '<tr>' +
            '<td>' + entry.date + '</td>' +
            '<td class="money">' + formatNaira(entry.amount) + '</td>' +
            '<td>' + statusBadge(entry.status) + '</td>' +
          '</tr>';
      }).join('');
    }

    function openListingModal() {
      if (listingModal) listingModal.classList.add('open');
    }

    function closeListingModal() {
      if (listingModal) listingModal.classList.remove('open');
    }

    function verifyAccount() {
      if (!bankSearch || !nubanInput || !accountNameResult) return;

      const selectedBank = banks.find(function (bank) {
        return bank.toLowerCase() === bankSearch.value.trim().toLowerCase();
      });

      const nuban = (nubanInput.value || '').replace(/\D/g, '').slice(0, 10);
      nubanInput.value = nuban;

      if (!selectedBank) {
        state.verifiedAccount = null;
        accountNameResult.className = 'verify-status pending';
        accountNameResult.textContent = 'Select a licensed Nigerian bank from the list.';
        return;
      }

      if (nuban.length < 10) {
        state.verifiedAccount = null;
        accountNameResult.className = 'verify-status pending';
        accountNameResult.textContent = 'Enter a 10-digit NUBAN for name inquiry.';
        return;
      }

      if (/^(\d)\1{9}$/.test(nuban)) {
        state.verifiedAccount = null;
        accountNameResult.className = 'verify-status failed';
        accountNameResult.textContent = 'Account inquiry failed. Please check the NUBAN.';
        return;
      }

      const mockNames = {
        '6789': 'Emeka Okafor',
        '7890': 'Emeka Okafor',
        '1234': 'Emeka O. Farms Ltd'
      };

      const name = mockNames[nuban.slice(-4)] || 'Emeka Okafor';
      state.verifiedAccount = {
        bank: selectedBank,
        nuban: nuban,
        name: name
      };

      accountNameResult.className = 'verify-status success';
      accountNameResult.textContent = 'Verified: ' + name + ' (' + selectedBank + ')';
    }

    function requestPayout() {
      const amount = Number(payoutAmount ? payoutAmount.value : 0);

      if (!state.verifiedAccount) {
        showToast('Verify bank account before requesting payout');
        return;
      }

      if (!amount || amount < 5000) {
        showToast('Minimum withdrawal is ' + formatNaira(5000));
        return;
      }

      if (amount > state.wallet.available) {
        showToast('Insufficient available balance');
        return;
      }

      state.wallet.available -= amount;
      state.payoutHistory.unshift({
        date: new Date().toISOString().slice(0, 10),
        amount: amount,
        status: 'Pending'
      });

      if (payoutAmount) payoutAmount.value = '';
      renderWallet();
      renderPayoutHistory();
      showToast('Payout request submitted');
    }

    if (bankList) {
      bankList.innerHTML = banks.map(function (bank) {
        return '<option value="' + bank + '"></option>';
      }).join('');
    }

    if (bankSearch) {
      bankSearch.addEventListener('input', verifyAccount);
    }

    if (nubanInput) {
      nubanInput.addEventListener('input', verifyAccount);
    }

    if (requestPayoutBtn) {
      requestPayoutBtn.addEventListener('click', requestPayout);
    }

    document.querySelectorAll('[data-open-listing]').forEach(function (button) {
      button.addEventListener('click', openListingModal);
    });

    document.querySelectorAll('[data-close-listing]').forEach(function (button) {
      button.addEventListener('click', closeListingModal);
    });

    if (listingModal) {
      listingModal.addEventListener('click', function (event) {
        if (event.target === listingModal) {
          closeListingModal();
        }
      });
    }

    if (listingForm) {
      listingForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const product = document.getElementById('listingProduct').value;
        const quantity = Number(document.getElementById('listingQuantity').value);
        const unit = document.getElementById('listingUnit').value;
        const price = Number(document.getElementById('listingPrice').value);
        const harvest = document.getElementById('listingHarvest').value;
        const location = document.getElementById('listingLocation').value;

        state.listings.unshift({
          id: Date.now(),
          name: product,
          quantity: quantity,
          unit: unit,
          pricePerUnit: price,
          harvestedAt: harvest ? new Date(harvest).getTime() : Date.now(),
          location: location,
          remainingPercent: 100
        });

        listingForm.reset();
        closeListingModal();
        renderListings();
        showToast('Listing published and freshness tracking started');
      });
    }

    renderListings();
    renderWallet();
    renderPayoutHistory();
    verifyAccount();
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!document.body.classList.contains('dashboard-body')) return;

    initSidebar();
    const setTab = initTabs();
    initStaticToasts();

    const role = document.body.dataset.role;
    if (role === 'buyer') {
      initBuyerDashboard(setTab);
    } else if (role === 'farmer') {
      initFarmerDashboard();
    }
  });
})();
