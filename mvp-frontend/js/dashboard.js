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

  const SHARED_MARKETPLACE_KEY = 'travia_shared_marketplace_listings_v1';
  const FARMER_DISPLAY_NAME = "Emeka's Fish & Snail Farm";

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function inferListingType(name, unit, declaredType) {
    const explicitType = (declaredType || '').toLowerCase();
    if (explicitType === 'fish' || explicitType === 'snails') {
      return explicitType;
    }

    const loweredName = (name || '').toLowerCase();
    if (loweredName.includes('snail') || unit === 'pieces') {
      return 'snails';
    }
    return 'fish';
  }

  function defaultListingPhoto(name) {
    const loweredName = (name || '').toLowerCase();
    if (loweredName.includes('snail')) {
      return 'https://images.pexels.com/photos/33744462/pexels-photo-33744462.jpeg?auto=compress&cs=tinysrgb&w=1200';
    }
    if (loweredName.includes('tilapia')) {
      return 'https://images.pexels.com/photos/31636077/pexels-photo-31636077.jpeg?auto=compress&cs=tinysrgb&w=1200';
    }
    if (loweredName.includes('mackerel')) {
      return 'https://images.pexels.com/photos/35443147/pexels-photo-35443147.jpeg?auto=compress&cs=tinysrgb&w=1200';
    }
    return 'https://images.pexels.com/photos/10112470/pexels-photo-10112470.jpeg?auto=compress&cs=tinysrgb&w=1200';
  }

  function normalizeMarketplaceListing(item) {
    if (!item || typeof item !== 'object') return null;

    const name = String(item.name || '').trim();
    if (!name) return null;

    const quantity = Math.max(1, Number(item.quantity) || 1);
    const unit = item.unit === 'pieces' ? 'pieces' : 'kg';
    const pricePerUnit = Math.max(1, Number(item.pricePerUnit) || 1);
    const harvestedAt = Number(item.harvestedAt) || Date.now();
    const location = String(item.location || 'Lagos').trim() || 'Lagos';
    const description = String(item.description || '').trim();
    const farm = String(item.farm || FARMER_DISPLAY_NAME).trim() || FARMER_DISPLAY_NAME;
    const type = inferListingType(name, unit, item.type);
    const normalizedPhoto = String(item.photoUrl || '').trim() || defaultListingPhoto(name);
    const rating = Math.max(3.5, Math.min(5, Number(item.rating) || 4.8));
    const loweredLocation = location.toLowerCase();
    const near = typeof item.near === 'boolean'
      ? item.near
      : loweredLocation.includes('lagos') || loweredLocation.includes('ikorodu') || loweredLocation.includes('epe');

    return {
      id: Number(item.id) || (Date.now() + Math.floor(Math.random() * 1000)),
      photoUrl: normalizedPhoto,
      type: type,
      name: name,
      quantity: quantity,
      unit: unit,
      pricePerUnit: pricePerUnit,
      farm: farm,
      location: location,
      rating: rating,
      harvestedAt: harvestedAt,
      near: near,
      clusterEligible: item.clusterEligible !== false,
      description: description
    };
  }

  function loadSharedMarketplaceListings() {
    if (typeof window === 'undefined' || !window.localStorage) return [];

    try {
      const raw = window.localStorage.getItem(SHARED_MARKETPLACE_KEY);
      if (!raw) return [];

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];

      return parsed.map(normalizeMarketplaceListing).filter(Boolean);
    } catch (error) {
      return [];
    }
  }

  function saveSharedMarketplaceListings(listings) {
    if (typeof window === 'undefined' || !window.localStorage) return;

    try {
      const safeListings = (Array.isArray(listings) ? listings : [])
        .map(normalizeMarketplaceListing)
        .filter(Boolean)
        .slice(0, 12);

      window.localStorage.setItem(SHARED_MARKETPLACE_KEY, JSON.stringify(safeListings));
    } catch (error) {
      return;
    }
  }

  function readImageAsDataUrl(file) {
    return new Promise(function (resolve, reject) {
      if (!file) {
        reject(new Error('No file selected'));
        return;
      }

      const reader = new FileReader();
      reader.onload = function () {
        resolve(String(reader.result || ''));
      };
      reader.onerror = function () {
        reject(new Error('Unable to read file'));
      };
      reader.readAsDataURL(file);
    });
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
    const uiIcons = {
      location: 'https://api.iconify.design/lucide:map-pin.svg?color=%23a7c2b4',
      star: 'https://api.iconify.design/lucide:star.svg?color=%23efcb7d',
      fresh: 'https://api.iconify.design/lucide:timer-reset.svg?color=%23d7ece2'
    };

    const listings = [
      {
        id: 1,
        photoUrl: 'https://images.pexels.com/photos/10112470/pexels-photo-10112470.jpeg?auto=compress&cs=tinysrgb&w=1200',
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
        photoUrl: 'https://images.pexels.com/photos/33744463/pexels-photo-33744463.jpeg?auto=compress&cs=tinysrgb&w=1200',
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
        photoUrl: 'https://images.pexels.com/photos/31636077/pexels-photo-31636077.jpeg?auto=compress&cs=tinysrgb&w=1200',
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
        photoUrl: 'https://images.pexels.com/photos/35443147/pexels-photo-35443147.jpeg?auto=compress&cs=tinysrgb&w=1200',
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
        photoUrl: 'https://images.pexels.com/photos/33744461/pexels-photo-33744461.jpeg?auto=compress&cs=tinysrgb&w=1200',
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
        photoUrl: 'https://images.pexels.com/photos/5673667/pexels-photo-5673667.jpeg?auto=compress&cs=tinysrgb&w=1200',
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
      },
      {
        id: 7,
        photoUrl: 'https://images.pexels.com/photos/30681053/pexels-photo-30681053.jpeg?auto=compress&cs=tinysrgb&w=1200',
        type: 'fish',
        name: 'Smoked Catfish',
        quantity: 12,
        unit: 'kg',
        pricePerUnit: 5600,
        farm: 'Ajah Smokehouse',
        location: 'Ajah, Lagos',
        rating: 4.7,
        harvestedAt: hoursAgo(5),
        near: true,
        clusterEligible: false
      },
      {
        id: 8,
        photoUrl: 'https://images.pexels.com/photos/33744462/pexels-photo-33744462.jpeg?auto=compress&cs=tinysrgb&w=1200',
        type: 'snails',
        name: 'Jumbo Snails',
        quantity: 120,
        unit: 'pieces',
        pricePerUnit: 920,
        farm: 'Remo Snail Ranch',
        location: 'Shagamu, Ogun',
        rating: 4.9,
        harvestedAt: hoursAgo(3),
        near: false,
        clusterEligible: true
      },
      {
        id: 9,
        photoUrl: 'https://images.pexels.com/photos/1974189/pexels-photo-1974189.jpeg?auto=compress&cs=tinysrgb&w=1200',
        type: 'fish',
        name: 'Croaker Fish',
        quantity: 18,
        unit: 'kg',
        pricePerUnit: 4700,
        farm: 'Eko Fisheries',
        location: 'Victoria Island, Lagos',
        rating: 4.8,
        harvestedAt: hoursAgo(6),
        near: true,
        clusterEligible: false
      },
      {
        id: 10,
        photoUrl: 'https://images.pexels.com/photos/28354860/pexels-photo-28354860.jpeg?auto=compress&cs=tinysrgb&w=1200',
        type: 'fish',
        name: 'Frozen Tilapia',
        quantity: 40,
        unit: 'kg',
        pricePerUnit: 3500,
        farm: 'Delta Aqua',
        location: 'Warri, Delta',
        rating: 4.4,
        harvestedAt: hoursAgo(12),
        near: false,
        clusterEligible: true
      },
      {
        id: 11,
        photoUrl: 'https://images.pexels.com/photos/33744464/pexels-photo-33744464.jpeg?auto=compress&cs=tinysrgb&w=1200',
        type: 'snails',
        name: 'White Snails',
        quantity: 70,
        unit: 'pieces',
        pricePerUnit: 780,
        farm: 'Abeokuta Snails',
        location: 'Abeokuta, Ogun',
        rating: 4.6,
        harvestedAt: hoursAgo(7),
        near: false,
        clusterEligible: true
      },
      {
        id: 12,
        photoUrl: 'https://images.pexels.com/photos/3296278/pexels-photo-3296278.jpeg?auto=compress&cs=tinysrgb&w=1200',
        type: 'fish',
        name: 'Mudfish',
        quantity: 22,
        unit: 'kg',
        pricePerUnit: 4000,
        farm: 'Ojo Fishpoint',
        location: 'Ojo, Lagos',
        rating: 4.5,
        harvestedAt: hoursAgo(9),
        near: true,
        clusterEligible: true
      },
      {
        id: 13,
        photoUrl: 'https://images.pexels.com/photos/33744465/pexels-photo-33744465.jpeg?auto=compress&cs=tinysrgb&w=1200',
        type: 'snails',
        name: 'Snail Meat Pack',
        quantity: 45,
        unit: 'pieces',
        pricePerUnit: 700,
        farm: 'Green Shell Farm',
        location: 'Sango Ota, Ogun',
        rating: 4.7,
        harvestedAt: hoursAgo(4),
        near: false,
        clusterEligible: true
      },
      {
        id: 14,
        photoUrl: 'https://images.pexels.com/photos/28354861/pexels-photo-28354861.jpeg?auto=compress&cs=tinysrgb&w=1200',
        type: 'fish',
        name: 'Sea Bass',
        quantity: 16,
        unit: 'kg',
        pricePerUnit: 5300,
        farm: 'Mainland Seafood',
        location: 'Yaba, Lagos',
        rating: 4.8,
        harvestedAt: hoursAgo(2),
        near: true,
        clusterEligible: false
      },
      {
        id: 15,
        photoUrl: 'https://images.pexels.com/photos/11286899/pexels-photo-11286899.jpeg?auto=compress&cs=tinysrgb&w=1200',
        type: 'fish',
        name: 'Live Catfish Premium',
        quantity: 25,
        unit: 'kg',
        pricePerUnit: 4500,
        farm: 'Ikeja Aqua',
        location: 'Ikeja, Lagos',
        rating: 4.9,
        harvestedAt: hoursAgo(1),
        near: true,
        clusterEligible: true
      }
    ];

    const sharedListings = loadSharedMarketplaceListings();
    if (sharedListings.length) {
      sharedListings.slice().reverse().forEach(function (item) {
        listings.unshift(item);
      });
    }

    const deliveryFees = {
      pickup: 0,
      kwik: 1500,
      cluster: 600
    };

    const state = {
      filter: 'all',
      search: '',
      page: 1,
      cart: [],
      activeProductId: null,
      detailBackTab: 'market',
      checkout: {
        delivery: 'pickup',
        payment: 'paystack',
        location: ''
      },
      orders: [
        {
          id: 'ORD-2401',
          listingId: 1,
          itemName: 'Catfish',
          quantityLabel: '10kg',
          farm: "Emeka's Farm",
          photoUrl: 'https://images.pexels.com/photos/10112470/pexels-photo-10112470.jpeg?auto=compress&cs=tinysrgb&w=1200',
          amount: 42000,
          deliveryMethod: 'Kwik Delivery',
          eta: '24hrs minimum',
          dateLabel: 'Today',
          status: 'In Transit'
        },
        {
          id: 'ORD-2400',
          listingId: 2,
          itemName: 'Giant Snails',
          quantityLabel: '30pcs',
          farm: 'Ade Snail Farm',
          photoUrl: 'https://images.pexels.com/photos/33744463/pexels-photo-33744463.jpeg?auto=compress&cs=tinysrgb&w=1200',
          amount: 25500,
          deliveryMethod: 'Self Pickup',
          eta: '24hrs minimum',
          dateLabel: 'Yesterday',
          status: 'Delivered'
        }
      ]
    };
    const listingsPerPage = 8;

    const listingGrid = document.getElementById('listingGrid');
    const listingPagination = document.getElementById('listingPagination');
    const searchInput = document.getElementById('marketSearch');
    const filterButtons = Array.from(document.querySelectorAll('#marketFilters .chip'));
    const buyerOrderRows = document.getElementById('buyerOrderRows');
    const profileShortcut = document.querySelector('.profile-shortcut');
    const profileEditBtn = document.querySelector('[data-profile-edit]');
    const buyerFullNameInput = document.getElementById('buyerFullName');

    const detailPhoto = document.getElementById('detailPhoto');
    const detailName = document.getElementById('detailName');
    const detailMeta = document.getElementById('detailMeta');
    const detailDescription = document.getElementById('detailDescription');
    const detailPrice = document.getElementById('detailPrice');
    const detailRating = document.getElementById('detailRating');
    const detailReviews = document.getElementById('detailReviews');
    const detailBackBtn = document.getElementById('detailBackBtn');
    const detailAddToCartBtn = document.getElementById('detailAddToCartBtn');

    const cartOverlay = document.getElementById('cartOverlay');
    const cartDrawer = document.getElementById('cartDrawer');
    const cartItems = document.getElementById('cartItems');
    const cartEmpty = document.getElementById('cartEmpty');
    const cartFoot = document.getElementById('cartFoot');
    const cartCountBadge = document.getElementById('cartCountBadge');
    const cartTopCount = document.getElementById('cartTopCount');
    const cartNavCount = document.getElementById('cartNavCount');

    const cartSubtotal = document.getElementById('cartSubtotal');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const clearCartBtn = document.getElementById('clearCartBtn');

    const orderModal = document.getElementById('orderModal');
    const orderDeliveryMethod = document.getElementById('orderDeliveryMethod');
    const orderPaymentMethod = document.getElementById('orderPaymentMethod');
    const orderDeliveryLocation = document.getElementById('orderDeliveryLocation');
    const orderSubtotal = document.getElementById('orderSubtotal');
    const orderDeliveryFee = document.getElementById('orderDeliveryFee');
    const orderTotal = document.getElementById('orderTotal');
    const confirmOrderBtn = document.getElementById('confirmOrderBtn');

    const descriptionLibrary = {
      fish: 'Freshly harvested and quality-checked for restaurant-grade supply.',
      snails: 'Healthy, sorted snails ready for immediate prep and commercial use.'
    };

    function defaultDescriptionFor(listing) {
      if (listing.description) return listing.description;
      return listing.type === 'snails' ? descriptionLibrary.snails : descriptionLibrary.fish;
    }

    function defaultReviewsFor(listing) {
      const name = listing.name || 'Product';
      return [
        { author: 'Chef Adebayo', rating: 5, comment: name + ' arrived very fresh and clean.' },
        { author: 'Mimi Kitchen', rating: 4.8, comment: 'Reliable quality and accurate weights.' },
        { author: 'Hotel Supply Team', rating: 4.7, comment: 'Packaging and handover were professional.' }
      ];
    }

    listings.forEach(function (listing) {
      if (!listing.description) {
        listing.description = defaultDescriptionFor(listing);
      }
      if (!Array.isArray(listing.reviews)) {
        listing.reviews = defaultReviewsFor(listing);
      }
    });

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

    function cartSubtotalValue() {
      return state.cart.reduce(function (sum, item) {
        return sum + item.price;
      }, 0);
    }

    function deliveryLabel(method) {
      if (method === 'kwik') return 'Kwik Delivery';
      if (method === 'cluster') return 'Farm Cluster';
      return 'Self Pickup';
    }

    function statusBadge(status) {
      if (status === 'Delivered') return '<span class="badge badge-done">Delivered</span>';
      if (status === 'In Transit') return '<span class="badge badge-transit">In Transit</span>';
      if (status === 'Pending') return '<span class="badge badge-transit">Pending</span>';
      return '<span class="badge badge-done">' + escapeHtml(status) + '</span>';
    }

    function getListingById(id) {
      return listings.find(function (item) { return item.id === id; }) || null;
    }

    function listingReviews(listing) {
      return Array.isArray(listing.reviews) && listing.reviews.length
        ? listing.reviews
        : defaultReviewsFor(listing);
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
          const haystack = [item.name, item.farm, item.location, item.type, item.description || ''].join(' ').toLowerCase();
          return haystack.includes(searchValue);
        });
      }

      return output;
    }

    function inCart(id) {
      return state.cart.some(function (item) { return item.id === id; });
    }

    function renderProductDetail(productId) {
      const listing = getListingById(productId);
      if (!listing) return;

      state.activeProductId = listing.id;

      if (detailPhoto) {
        detailPhoto.src = listing.photoUrl;
        detailPhoto.alt = listing.name;
      }
      if (detailName) {
        detailName.textContent = listing.name + ' - ' + listing.quantity + (listing.unit === 'pieces' ? 'pcs' : 'kg');
      }
      if (detailMeta) {
        detailMeta.textContent = listing.farm + ' | ' + listing.location;
      }
      if (detailDescription) {
        detailDescription.textContent = listing.description || defaultDescriptionFor(listing);
      }
      if (detailPrice) {
        detailPrice.textContent = formatNaira(listTotalPrice(listing)) + ' total (' + formatNaira(listing.pricePerUnit) + '/' + (listing.unit === 'pieces' ? 'pc' : 'kg') + ')';
      }
      if (detailRating) {
        detailRating.textContent = 'Rating: ' + listing.rating.toFixed(1) + '/5';
      }
      if (detailReviews) {
        detailReviews.innerHTML = listingReviews(listing).map(function (review) {
          return '' +
            '<article class="review-item">' +
              '<div class="review-head"><strong>' + escapeHtml(review.author) + '</strong><span>' + Number(review.rating).toFixed(1) + '/5</span></div>' +
              '<p class="review-body">' + escapeHtml(review.comment) + '</p>' +
            '</article>';
        }).join('');
      }
      if (detailAddToCartBtn) {
        detailAddToCartBtn.textContent = inCart(listing.id) ? 'Added to Cart' : 'Add to Cart';
        detailAddToCartBtn.classList.toggle('btn-ghost', inCart(listing.id));
        detailAddToCartBtn.classList.toggle('btn-e', !inCart(listing.id));
      }
    }

    function openProductDetail(productId, backTab) {
      if (!productId || !setTab) return;
      state.detailBackTab = backTab || 'market';
      renderProductDetail(productId);
      setTab('product-detail');

      const topbarTitle = document.getElementById('topbarTitle');
      if (topbarTitle) {
        topbarTitle.textContent = 'Product Detail';
      }
    }

    function renderOrderHistory() {
      if (!buyerOrderRows) return;

      buyerOrderRows.innerHTML = state.orders.map(function (order) {
        return '' +
          '<tr>' +
            '<td>' +
              '<button class="order-product-link" type="button" data-order-product="' + order.listingId + '">' +
                '<img class="order-thumb" src="' + escapeHtml(order.photoUrl) + '" alt="' + escapeHtml(order.itemName) + '">' +
                '<span>' + escapeHtml(order.itemName) + ' (' + escapeHtml(order.quantityLabel) + ')</span>' +
              '</button>' +
            '</td>' +
            '<td>' + escapeHtml(order.dateLabel) + ' | ' + escapeHtml(order.farm) + '</td>' +
            '<td>' + escapeHtml(order.deliveryMethod) + ' | ETA ' + escapeHtml(order.eta) + '</td>' +
            '<td class="money">' + formatNaira(order.amount) + '</td>' +
            '<td>' + statusBadge(order.status) + '</td>' +
          '</tr>';
      }).join('');

      buyerOrderRows.querySelectorAll('[data-order-product]').forEach(function (button) {
        button.addEventListener('click', function () {
          openProductDetail(Number(button.dataset.orderProduct), 'orders');
        });
      });
    }

    function renderPagination(totalPages) {
      if (!listingPagination) return;

      if (totalPages <= 1) {
        listingPagination.innerHTML = '';
        return;
      }

      let pageButtons = '';
      for (let page = 1; page <= totalPages; page += 1) {
        pageButtons += '<button class="page-btn ' + (page === state.page ? 'active' : '') + '" type="button" data-page="' + page + '">' + page + '</button>';
      }

      listingPagination.innerHTML = '' +
        '<button class="page-btn" type="button" data-page="' + (state.page - 1) + '"' + (state.page === 1 ? ' disabled' : '') + '>Prev</button>' +
        pageButtons +
        '<button class="page-btn" type="button" data-page="' + (state.page + 1) + '"' + (state.page === totalPages ? ' disabled' : '') + '>Next</button>';

      listingPagination.querySelectorAll('[data-page]').forEach(function (button) {
        button.addEventListener('click', function () {
          const nextPage = Number(button.dataset.page);
          if (!nextPage || nextPage === state.page) return;

          state.page = Math.max(1, Math.min(totalPages, nextPage));
          renderListings();
          listingGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      });
    }

    function renderListings() {
      if (!listingGrid) return;

      const cards = filteredListings();
      if (!cards.length) {
        listingGrid.innerHTML = '<div class="card"><p class="helper-text">No listings matched your filter.</p></div>';
        if (listingPagination) listingPagination.innerHTML = '';
        return;
      }

      const totalPages = Math.max(1, Math.ceil(cards.length / listingsPerPage));
      state.page = Math.min(state.page, totalPages);
      const startIndex = (state.page - 1) * listingsPerPage;
      const pageCards = cards.slice(startIndex, startIndex + listingsPerPage);

      listingGrid.innerHTML = pageCards.map(function (item) {
        const freshHours = getFreshHours(item);
        const freshLabel = freshHours + 'hr' + (freshHours > 1 ? 's' : '') + ' fresh';
        const total = listTotalPrice(item);
        const unitLabel = item.unit === 'pieces' ? 'pc' : 'kg';
        const typeLabel = item.type === 'fish' ? 'Fish' : 'Snails';
        const safeName = escapeHtml(item.name);
        const safeLocation = escapeHtml(item.location);
        const safeFarm = escapeHtml(item.farm);
        const safePhotoUrl = escapeHtml(item.photoUrl);
        const safeDescription = escapeHtml(item.description || '');
        const descriptionHtml = safeDescription ? '<div class="listing-description">' + safeDescription + '</div>' : '';

        return '' +
          '<article class="listing-card">' +
            '<button class="listing-link" type="button" data-open-product="' + item.id + '">' +
              '<div class="listing-media">' +
                '<img class="listing-photo" src="' + safePhotoUrl + '" alt="' + safeName + '" loading="lazy">' +
                '<span class="listing-type-chip">' + typeLabel + '</span>' +
                '<span class="freshness ' + freshnessClass(freshHours) + '"><img class="freshness-icon" src="' + uiIcons.fresh + '" alt="">' + freshLabel + '</span>' +
              '</div>' +
            '</button>' +
            '<div class="listing-content">' +
              '<button class="listing-link listing-name-link" type="button" data-open-product="' + item.id + '">' +
                '<span class="listing-name">' + safeName + ' - ' + item.quantity + (item.unit === 'pieces' ? 'pcs' : 'kg') + '</span>' +
              '</button>' +
              '<div class="listing-meta"><img class="inline-icon" src="' + uiIcons.location + '" alt=""> ' + safeLocation + ' &middot; ' + safeFarm + '<br><img class="inline-icon" src="' + uiIcons.star + '" alt=""> ' + item.rating.toFixed(1) + ' verified</div>' +
              descriptionHtml +
              '<div class="listing-bottom">' +
                '<div class="listing-price">' + formatNaira(total) + '<br><small>' + formatNaira(item.pricePerUnit) + '/' + unitLabel + '</small></div>' +
                '<button class="btn-sm ' + (inCart(item.id) ? 'in-cart' : '') + '" data-add-cart="' + item.id + '" type="button">' +
                  (inCart(item.id) ? 'In Cart' : 'Add to Cart') +
                '</button>' +
              '</div>' +
            '</div>' +
          '</article>';
      }).join('');

      listingGrid.querySelectorAll('[data-add-cart]').forEach(function (button) {
        button.addEventListener('click', function () {
          const id = Number(button.dataset.addCart);
          addToCart(id);
        });
      });

      listingGrid.querySelectorAll('[data-open-product]').forEach(function (button) {
        button.addEventListener('click', function () {
          openProductDetail(Number(button.dataset.openProduct), 'market');
        });
      });

      renderPagination(totalPages);
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
      const listing = getListingById(id);
      if (!listing) return;

      if (inCart(id)) {
        showToast(listing.name + ' is already in cart');
        openCart();
        return;
      }

      state.cart.push({
        id: listing.id,
        name: listing.name,
        detail: listing.quantity + (listing.unit === 'pieces' ? 'pcs' : 'kg'),
        farm: listing.farm,
        photoUrl: listing.photoUrl,
        price: listTotalPrice(listing)
      });

      updateCart();
      renderListings();
      renderProductDetail(state.activeProductId);
      openCart();
      showToast(listing.name + ' added to cart');
    }

    function removeFromCart(id) {
      state.cart = state.cart.filter(function (item) { return item.id !== id; });
      updateCart();
      renderListings();
      renderProductDetail(state.activeProductId);
    }

    function updateCart() {
      const totalItems = state.cart.length;
      if (cartTopCount) cartTopCount.textContent = String(totalItems);
      if (cartNavCount) cartNavCount.textContent = String(totalItems);
      if (cartCountBadge) cartCountBadge.textContent = totalItems + ' item' + (totalItems === 1 ? '' : 's');

      const isEmpty = state.cart.length === 0;
      if (cartEmpty) cartEmpty.style.display = isEmpty ? 'block' : 'none';
      if (cartFoot) cartFoot.style.display = isEmpty ? 'none' : 'block';

      if (cartItems) {
        cartItems.innerHTML = state.cart.map(function (item) {
          return '' +
            '<div class="cart-item">' +
              '<div>' +
                '<div class="list-name cart-list-name"><img class="cart-item-thumb" src="' + escapeHtml(item.photoUrl) + '" alt=""><span>' + escapeHtml(item.name) + ' - ' + escapeHtml(item.detail) + '</span></div>' +
                '<div class="list-meta">' + escapeHtml(item.farm) + '</div>' +
              '</div>' +
              '<div class="value-col">' +
                '<div class="value-main">' + formatNaira(item.price) + '</div>' +
                '<button class="link-btn" data-cart-view="' + item.id + '" type="button">View</button>' +
                '<button class="link-btn" data-remove="' + item.id + '" type="button">Remove</button>' +
              '</div>' +
            '</div>';
        }).join('');

        cartItems.querySelectorAll('[data-remove]').forEach(function (button) {
          button.addEventListener('click', function () {
            removeFromCart(Number(button.dataset.remove));
          });
        });

        cartItems.querySelectorAll('[data-cart-view]').forEach(function (button) {
          button.addEventListener('click', function () {
            closeCart();
            openProductDetail(Number(button.dataset.cartView), 'market');
          });
        });
      }

      if (cartSubtotal) cartSubtotal.textContent = formatNaira(cartSubtotalValue());
      renderOrderSummary();
    }

    function openOrderModal() {
      if (!state.cart.length) {
        showToast('Your cart is empty');
        return;
      }

      closeCart();
      if (orderDeliveryMethod) orderDeliveryMethod.value = state.checkout.delivery;
      if (orderPaymentMethod) orderPaymentMethod.value = state.checkout.payment;
      if (orderDeliveryLocation) orderDeliveryLocation.value = state.checkout.location;
      renderOrderSummary();
      if (orderModal) orderModal.classList.add('open');
    }

    function closeOrderModal() {
      if (orderModal) orderModal.classList.remove('open');
    }

    function renderOrderSummary() {
      const subtotal = cartSubtotalValue();
      const deliveryFee = deliveryFees[state.checkout.delivery] || 0;
      const total = subtotal + deliveryFee;

      if (orderSubtotal) orderSubtotal.textContent = formatNaira(subtotal);
      if (orderDeliveryFee) orderDeliveryFee.textContent = deliveryFee === 0 ? 'Free' : formatNaira(deliveryFee);
      if (orderTotal) orderTotal.textContent = formatNaira(total);
      if (cartSubtotal) cartSubtotal.textContent = formatNaira(subtotal);
    }

    function placeOrder() {
      if (!state.cart.length) {
        showToast('Your cart is empty');
        return;
      }

      if (orderDeliveryMethod) state.checkout.delivery = orderDeliveryMethod.value || 'pickup';
      if (orderPaymentMethod) state.checkout.payment = orderPaymentMethod.value || 'paystack';
      if (orderDeliveryLocation) state.checkout.location = (orderDeliveryLocation.value || '').trim();

      if (state.checkout.delivery !== 'pickup' && !state.checkout.location) {
        showToast('Enter delivery location to continue');
        return;
      }

      const today = new Date().toISOString().slice(0, 10);
      const currentDelivery = deliveryLabel(state.checkout.delivery);

      state.cart.slice().reverse().forEach(function (item, index) {
        state.orders.unshift({
          id: 'ORD-' + String(Date.now() + index).slice(-6),
          listingId: item.id,
          itemName: item.name,
          quantityLabel: item.detail,
          farm: item.farm,
          photoUrl: item.photoUrl,
          amount: item.price,
          deliveryMethod: currentDelivery,
          eta: '24hrs minimum',
          dateLabel: today,
          status: 'Pending'
        });
      });

      state.cart = [];
      updateCart();
      renderListings();
      renderOrderHistory();
      closeOrderModal();
      showToast('Order placed successfully');
    }

    filterButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        state.filter = button.dataset.filter || 'all';
        state.page = 1;
        filterButtons.forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        renderListings();
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', function () {
        state.search = searchInput.value || '';
        state.page = 1;
        renderListings();
      });
    }

    document.querySelectorAll('[data-open-cart]').forEach(function (button) {
      button.addEventListener('click', openCart);
    });

    document.querySelectorAll('[data-close-cart]').forEach(function (button) {
      button.addEventListener('click', closeCart);
    });

    document.querySelectorAll('[data-close-order]').forEach(function (button) {
      button.addEventListener('click', closeOrderModal);
    });

    if (orderModal) {
      orderModal.addEventListener('click', function (event) {
        if (event.target === orderModal) {
          closeOrderModal();
        }
      });
    }

    if (detailBackBtn) {
      detailBackBtn.addEventListener('click', function () {
        if (setTab) {
          setTab(state.detailBackTab || 'market');
        }
      });
    }

    if (detailAddToCartBtn) {
      detailAddToCartBtn.addEventListener('click', function () {
        if (!state.activeProductId) return;
        addToCart(state.activeProductId);
      });
    }

    if (profileShortcut) {
      profileShortcut.addEventListener('click', function () {
        if (setTab) setTab('profile');
      });
    }

    if (profileEditBtn) {
      profileEditBtn.addEventListener('click', function () {
        const profileEditor = document.getElementById('buyerProfileEditor');
        if (profileEditor) {
          profileEditor.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        if (buyerFullNameInput) {
          buyerFullNameInput.focus();
        }
      });
    }

    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', openOrderModal);
    }

    if (clearCartBtn) {
      clearCartBtn.addEventListener('click', function () {
        state.cart = [];
        updateCart();
        renderListings();
        showToast('Cart cleared');
      });
    }

    if (orderDeliveryMethod) {
      orderDeliveryMethod.addEventListener('change', function () {
        state.checkout.delivery = orderDeliveryMethod.value || 'pickup';
        renderOrderSummary();
      });
    }

    if (orderPaymentMethod) {
      orderPaymentMethod.addEventListener('change', function () {
        state.checkout.payment = orderPaymentMethod.value || 'paystack';
      });
    }

    if (orderDeliveryLocation) {
      orderDeliveryLocation.addEventListener('input', function () {
        state.checkout.location = orderDeliveryLocation.value || '';
      });
    }

    if (confirmOrderBtn) {
      confirmOrderBtn.addEventListener('click', placeOrder);
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
    renderOrderHistory();
    updateCart();
    setInterval(renderListings, 60000);
  }

  function initFarmerDashboard() {
    const sharedListingIds = new Set();
    const storedListings = loadSharedMarketplaceListings().map(function (item) {
      sharedListingIds.add(item.id);
      return {
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        pricePerUnit: item.pricePerUnit,
        harvestedAt: item.harvestedAt,
        location: item.location,
        remainingPercent: 100,
        photoUrl: item.photoUrl,
        description: item.description || '',
        type: item.type
      };
    });

    const state = {
      listings: storedListings.concat([
        {
          id: 101,
          name: 'Catfish',
          quantity: 20,
          unit: 'kg',
          pricePerUnit: 4200,
          harvestedAt: hoursAgo(3),
          location: 'Lagos Island',
          remainingPercent: 90,
          photoUrl: defaultListingPhoto('Catfish'),
          description: 'Live catfish, medium-to-large size. Harvested this morning.',
          type: 'fish'
        },
        {
          id: 102,
          name: 'Giant Snails',
          quantity: 80,
          unit: 'pieces',
          pricePerUnit: 850,
          harvestedAt: hoursAgo(2),
          location: 'Ikorodu',
          remainingPercent: 95,
          photoUrl: defaultListingPhoto('Giant Snails'),
          description: 'Healthy giant snails, sorted and ready for immediate pickup.',
          type: 'snails'
        },
        {
          id: 103,
          name: 'Tilapia',
          quantity: 15,
          unit: 'kg',
          pricePerUnit: 3800,
          harvestedAt: hoursAgo(11),
          location: 'Epe',
          remainingPercent: 45,
          photoUrl: defaultListingPhoto('Tilapia'),
          description: 'Fresh tilapia batch, cleaned and packed in iced crates.',
          type: 'fish'
        }
      ]),
      wallet: {
        available: 182000,
        escrow: 30000,
        month: 182000,
        total: 540000
      },
      walletHistory: [
        { date: '2026-03-26', reference: 'SALE-92841', type: 'Sale Income', amount: 42000, status: 'Settled' },
        { date: '2026-03-25', reference: 'WD-11908', type: 'Withdrawal', amount: -30000, status: 'Success' },
        { date: '2026-03-24', reference: 'SALE-92733', type: 'Sale Income', amount: 30400, status: 'Settled' },
        { date: '2026-03-23', reference: 'WD-11702', type: 'Withdrawal', amount: -15000, status: 'Success' }
      ],
      orders: [
        { date: 'Today 9:30am', product: '10kg Catfish', buyer: 'Mama Chidi Restaurant', fulfilment: 'Farm Cluster', amount: 42000, status: 'Done' },
        { date: 'Yesterday', product: '8kg Tilapia', buyer: 'Hotel Eko', fulfilment: 'Kwik Delivery', amount: 30400, status: 'In Transit' },
        { date: '2026-03-25', product: '100pcs Snails', buyer: 'Mama Cass', fulfilment: 'Self Pickup', amount: 85000, status: 'Done' },
        { date: '2026-03-24', product: '15kg Catfish', buyer: 'Urban Bowl', fulfilment: 'Farm Cluster', amount: 63000, status: 'Done' }
      ],
      payoutHistory: [
        { date: '2026-03-12', amount: 45000, status: 'Success' },
        { date: '2026-03-11', amount: 12000, status: 'Processing' },
        { date: '2026-03-10', amount: 9000, status: 'Pending' }
      ],
      notifications: [
        { id: 1, title: 'New order received', message: 'Mama Chidi Restaurant placed an order for 10kg catfish.', time: '8m ago', read: false },
        { id: 2, title: 'Payout update', message: 'Your withdrawal of ' + formatNaira(45000) + ' was completed.', time: '2h ago', read: false },
        { id: 3, title: 'Listing reminder', message: 'Tilapia listing is nearing freshness threshold.', time: 'Yesterday', read: true }
      ],
      verifiedAccount: null,
      notificationsOpen: false
    };

    const listingRows = document.getElementById('farmerListingRows');
    const overviewPreview = document.getElementById('overviewListingPreview');
    const recentOrdersRows = document.getElementById('recentOrdersRows');
    const orderHistoryRows = document.getElementById('orderHistoryRows');
    const walletHistoryRows = document.getElementById('walletHistoryRows');

    const notificationBtn = document.getElementById('notificationBtn');
    const notificationDot = document.getElementById('notificationDot');
    const notificationPopover = document.getElementById('notificationPopover');
    const notificationList = document.getElementById('notificationList');
    const notificationMarkReadBtn = document.getElementById('notificationMarkReadBtn');

    const listingModal = document.getElementById('listingModal');
    const listingForm = document.getElementById('listingForm');
    const listingProduct = document.getElementById('listingProduct');
    const listingQuantity = document.getElementById('listingQuantity');
    const listingUnit = document.getElementById('listingUnit');
    const listingPrice = document.getElementById('listingPrice');
    const listingHarvest = document.getElementById('listingHarvest');
    const listingLocation = document.getElementById('listingLocation');
    const listingDescription = document.getElementById('listingDescription');
    const listingImage = document.getElementById('listingImage');

    const accountHolderInput = document.getElementById('accountHolderInput');
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
      if (status === 'Success' || status === 'Settled' || status === 'Done') return '<span class="badge badge-done">' + escapeHtml(status) + '</span>';
      if (status === 'Processing' || status === 'In Transit') return '<span class="badge badge-transit">' + escapeHtml(status) + '</span>';
      return '<span class="badge badge-transit">' + escapeHtml(status) + '</span>';
    }

    function walletTypeBadge(type) {
      if (type === 'Withdrawal') return '<span class="tx-type tx-out">Withdrawal</span>';
      return '<span class="tx-type tx-in">Sale Income</span>';
    }

    function listingStatus(item) {
      const hoursFresh = Math.max(1, Math.floor((Date.now() - item.harvestedAt) / (60 * 60 * 1000)));
      return hoursFresh > 10 ? '<span class="badge badge-transit">Expiring</span>' : '<span class="badge badge-done">Active</span>';
    }

    function fulfilmentBadge(fulfilment) {
      if (fulfilment === 'Farm Cluster') return '<span class="badge badge-done">Farm Cluster</span>';
      if (fulfilment === 'Kwik Delivery') return '<span class="badge badge-transit">Kwik Delivery</span>';
      return '<span class="badge badge-transit">Self Pickup</span>';
    }

    function persistSharedListings() {
      const sharedOnly = state.listings
        .filter(function (item) { return sharedListingIds.has(item.id); })
        .map(function (item) {
          return normalizeMarketplaceListing({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            pricePerUnit: item.pricePerUnit,
            harvestedAt: item.harvestedAt,
            location: item.location,
            farm: FARMER_DISPLAY_NAME,
            photoUrl: item.photoUrl,
            type: item.type,
            description: item.description,
            rating: 4.8,
            clusterEligible: true
          });
        })
        .filter(Boolean);

      saveSharedMarketplaceListings(sharedOnly);
    }

    function listingRowTemplate(item) {
      const harvestedHours = Math.max(1, Math.floor((Date.now() - item.harvestedAt) / (60 * 60 * 1000)));
      const safeName = escapeHtml(item.name);
      const safeLocation = escapeHtml(item.location);
      const safeDescription = escapeHtml(item.description || 'No description provided.');
      const safePhoto = escapeHtml(item.photoUrl || defaultListingPhoto(item.name));

      return '' +
        '<div class="list-row">' +
          '<div>' +
            '<div class="list-name listing-row-title"><img class="listing-thumb" src="' + safePhoto + '" alt="' + safeName + '"><span>' + safeName + ' - ' + item.quantity + (item.unit === 'pieces' ? 'pcs' : 'kg') + '</span></div>' +
            '<div class="list-meta">Harvested ' + harvestedHours + 'hrs ago &middot; ' + safeLocation + '</div>' +
            '<div class="list-meta listing-description-row">' + safeDescription + '</div>' +
            '<div class="progress-track"><div class="progress-fill" style="width:' + item.remainingPercent + '%"></div></div>' +
          '</div>' +
          '<div class="value-col">' +
            '<div class="value-main">' + formatNaira(item.pricePerUnit) + '/' + (item.unit === 'pieces' ? 'pc' : 'kg') + '</div>' +
            '<div class="value-sub">Stock ' + item.remainingPercent + '%</div>' +
            listingStatus(item) +
          '</div>' +
        '</div>';
    }

    function renderListings() {
      const count = state.listings.length;
      const totalMonth = state.listings.reduce(function (sum, item) {
        return sum + (item.pricePerUnit * item.quantity);
      }, 0);

      const rowsHtml = state.listings.map(listingRowTemplate).join('');
      const previewRows = state.listings.slice(0, 3).map(listingRowTemplate).join('');

      if (listingRows) listingRows.innerHTML = rowsHtml;
      if (overviewPreview) overviewPreview.innerHTML = previewRows;

      const statActiveListings = document.getElementById('statActiveListings');
      const activeListingsBadge = document.getElementById('activeListingsBadge');
      if (statActiveListings) statActiveListings.textContent = String(count);
      if (activeListingsBadge) activeListingsBadge.textContent = String(count);

      const statMonthRevenue = document.getElementById('statMonthRevenue');
      if (statMonthRevenue) statMonthRevenue.textContent = formatNaira(totalMonth);
    }

    function renderRecentOrders() {
      if (!recentOrdersRows) return;

      const statOrderCount = document.getElementById('statOrderCount');
      if (statOrderCount) statOrderCount.textContent = String(state.orders.length);

      recentOrdersRows.innerHTML = state.orders.slice(0, 2).map(function (order) {
        return '' +
          '<div class="list-row">' +
            '<div>' +
              '<div class="list-name">' + escapeHtml(order.product) + ' &middot; ' + escapeHtml(order.buyer) + '</div>' +
              '<div class="list-meta">' + escapeHtml(order.date) + ' &middot; ' + escapeHtml(order.fulfilment) + '</div>' +
            '</div>' +
            '<div class="value-col">' +
              '<div class="value-main">+' + formatNaira(order.amount) + '</div>' +
              statusBadge(order.status) +
            '</div>' +
          '</div>';
      }).join('');
    }

    function renderOrderHistory() {
      if (!orderHistoryRows) return;

      orderHistoryRows.innerHTML = state.orders.map(function (order) {
        return '' +
          '<tr>' +
            '<td>' + escapeHtml(order.date) + '</td>' +
            '<td>' + escapeHtml(order.product) + ' &middot; ' + escapeHtml(order.buyer) + '</td>' +
            '<td>' + fulfilmentBadge(order.fulfilment) + '</td>' +
            '<td class="money">+' + formatNaira(order.amount) + '</td>' +
            '<td>' + statusBadge(order.status) + '</td>' +
          '</tr>';
      }).join('');
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
            '<td>' + escapeHtml(entry.date) + '</td>' +
            '<td class="money">' + formatNaira(entry.amount) + '</td>' +
            '<td>' + statusBadge(entry.status) + '</td>' +
          '</tr>';
      }).join('');
    }

    function renderWalletHistory() {
      if (!walletHistoryRows) return;

      walletHistoryRows.innerHTML = state.walletHistory.map(function (entry) {
        const amountLabel = entry.amount < 0 ? '-' + formatNaira(Math.abs(entry.amount)) : '+' + formatNaira(entry.amount);
        const amountClass = entry.amount < 0 ? 'money tx-amount-out' : 'money tx-amount-in';

        return '' +
          '<tr>' +
            '<td>' + escapeHtml(entry.date) + '</td>' +
            '<td>' + escapeHtml(entry.reference) + '</td>' +
            '<td>' + walletTypeBadge(entry.type) + '</td>' +
            '<td class="' + amountClass + '">' + amountLabel + '</td>' +
            '<td>' + statusBadge(entry.status) + '</td>' +
          '</tr>';
      }).join('');
    }

    function setNotificationsOpen(isOpen) {
      state.notificationsOpen = Boolean(isOpen);
      if (notificationPopover) {
        notificationPopover.classList.toggle('open', state.notificationsOpen);
      }
      if (notificationBtn) {
        notificationBtn.setAttribute('aria-expanded', state.notificationsOpen ? 'true' : 'false');
      }
    }

    function renderNotifications() {
      if (!notificationList) return;

      if (!state.notifications.length) {
        notificationList.innerHTML = '<p class="helper-text">No notifications yet.</p>';
      } else {
        notificationList.innerHTML = state.notifications.map(function (item) {
          return '' +
            '<article class="notice-item ' + (item.read ? '' : 'unread') + '">' +
              '<div class="notice-title">' + escapeHtml(item.title) + '</div>' +
              '<div class="notice-body">' + escapeHtml(item.message) + '</div>' +
              '<div class="notice-time">' + escapeHtml(item.time) + '</div>' +
            '</article>';
        }).join('');
      }

      const hasUnread = state.notifications.some(function (item) { return !item.read; });
      if (notificationDot) {
        notificationDot.style.display = hasUnread ? 'block' : 'none';
      }
    }

    function markNotificationsRead() {
      state.notifications = state.notifications.map(function (item) {
        return Object.assign({}, item, { read: true });
      });
      renderNotifications();
    }

    function openListingModal() {
      if (listingModal) listingModal.classList.add('open');
    }

    function closeListingModal() {
      if (listingModal) listingModal.classList.remove('open');
    }

    function verifyAccount() {
      if (!bankSearch || !nubanInput || !accountNameResult) return;

      const accountHolderName = accountHolderInput ? accountHolderInput.value.trim() : '';
      const selectedBank = banks.find(function (bank) {
        return bank.toLowerCase() === bankSearch.value.trim().toLowerCase();
      });

      const nuban = (nubanInput.value || '').replace(/\D/g, '').slice(0, 10);
      nubanInput.value = nuban;

      if (!accountHolderName || accountHolderName.length < 3) {
        state.verifiedAccount = null;
        accountNameResult.className = 'verify-status pending';
        accountNameResult.textContent = 'Enter the bank account holder name first.';
        return;
      }

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
        accountName: name,
        accountHolderName: accountHolderName
      };

      accountNameResult.className = 'verify-status success';
      accountNameResult.textContent = 'Verified: ' + name + ' (' + selectedBank + ') | Holder: ' + accountHolderName;
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
      const today = new Date().toISOString().slice(0, 10);
      const payoutRef = 'WD-' + String(Date.now()).slice(-6);

      state.payoutHistory.unshift({
        date: today,
        amount: amount,
        status: 'Pending'
      });

      state.walletHistory.unshift({
        date: today,
        reference: payoutRef,
        type: 'Withdrawal',
        amount: -amount,
        status: 'Pending'
      });

      if (payoutAmount) payoutAmount.value = '';
      renderWallet();
      renderWalletHistory();
      renderPayoutHistory();
      showToast('Payout request submitted');
    }

    if (bankList) {
      bankList.innerHTML = banks.map(function (bank) {
        return '<option value="' + bank + '"></option>';
      }).join('');
    }

    if (notificationBtn) {
      notificationBtn.addEventListener('click', function (event) {
        event.stopPropagation();
        setNotificationsOpen(!state.notificationsOpen);
      });
    }

    if (notificationMarkReadBtn) {
      notificationMarkReadBtn.addEventListener('click', function () {
        markNotificationsRead();
      });
    }

    document.addEventListener('click', function (event) {
      if (!state.notificationsOpen || !notificationPopover || !notificationBtn) return;
      if (notificationPopover.contains(event.target) || notificationBtn.contains(event.target)) return;
      setNotificationsOpen(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        setNotificationsOpen(false);
      }
    });

    if (accountHolderInput) {
      accountHolderInput.addEventListener('input', verifyAccount);
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
      listingForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const product = listingProduct ? listingProduct.value : '';
        const quantity = Number(listingQuantity ? listingQuantity.value : 0);
        const unit = listingUnit ? listingUnit.value : 'kg';
        const price = Number(listingPrice ? listingPrice.value : 0);
        const harvest = listingHarvest ? listingHarvest.value : '';
        const location = listingLocation ? listingLocation.value.trim() : '';
        const description = listingDescription ? listingDescription.value.trim() : '';
        const imageFile = listingImage && listingImage.files ? listingImage.files[0] : null;

        if (!description) {
          showToast('Add a short product description');
          return;
        }

        if (!imageFile) {
          showToast('Upload a product image');
          return;
        }

        if (!imageFile.type || imageFile.type.indexOf('image/') !== 0) {
          showToast('Only image files are allowed');
          return;
        }

        if (imageFile.size > (2 * 1024 * 1024)) {
          showToast('Image should be 2MB or less');
          return;
        }

        let imageDataUrl = '';
        try {
          imageDataUrl = await readImageAsDataUrl(imageFile);
        } catch (error) {
          showToast('Image upload failed. Please try again.');
          return;
        }

        const normalized = normalizeMarketplaceListing({
          id: Date.now(),
          name: product,
          quantity: quantity,
          unit: unit,
          pricePerUnit: price,
          harvestedAt: harvest ? new Date(harvest).getTime() : Date.now(),
          location: location,
          farm: FARMER_DISPLAY_NAME,
          photoUrl: imageDataUrl,
          description: description,
          rating: 4.8,
          clusterEligible: true
        });

        if (!normalized) {
          showToast('Listing could not be created');
          return;
        }

        const farmerListing = {
          id: normalized.id,
          name: normalized.name,
          quantity: normalized.quantity,
          unit: normalized.unit,
          pricePerUnit: normalized.pricePerUnit,
          harvestedAt: normalized.harvestedAt,
          location: normalized.location,
          remainingPercent: 100,
          photoUrl: normalized.photoUrl,
          description: normalized.description,
          type: normalized.type
        };

        state.listings.unshift(farmerListing);
        sharedListingIds.add(farmerListing.id);
        persistSharedListings();

        state.notifications.unshift({
          id: Date.now(),
          title: 'Listing published',
          message: farmerListing.name + ' is now live in buyer marketplace.',
          time: 'Just now',
          read: false
        });

        listingForm.reset();
        closeListingModal();
        renderListings();
        renderNotifications();
        showToast('Listing published and now visible to buyers');
      });
    }

    renderListings();
    renderRecentOrders();
    renderOrderHistory();
    renderWallet();
    renderWalletHistory();
    renderPayoutHistory();
    renderNotifications();
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
