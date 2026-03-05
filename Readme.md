# Travia.
### *The Pathway to Trade*

> **Travia** — from the Latin *trivium*, meaning "a place where three roads meet." In ancient times, the trivium was where traders, farmers, and buyers converged to exchange goods fairly. Travia is that crossroads, rebuilt for Nigeria's digital age — where fish and snail farmers meet their market directly, without the middlemen who stand between them and fair prices.

---

## What is Travia?

Travia is Nigeria's first dedicated digital marketplace connecting fish and snail farmers directly to buyers — restaurants, hotels, households, and retailers — across the country.

Today, over 70% of Nigerian aquaculture farmers sell through middlemen who buy cheap and resell at 3–5x markups. A catfish farmer in Ikorodu sells at ₦1,800/kg. That same fish reaches a Lagos restaurant at ₦5,500/kg. The middleman earns more than the farmer — without adding freshness, traceability, or care.

**Travia fixes market access.**

---

## MVP Scope

This is a **frontend-only MVP** built with plain HTML, CSS, and JavaScript — no frameworks, no backend, no database. It is a fully interactive prototype demonstrating the core user experience and flows of the Travia platform.

The MVP covers:
- Landing page with platform overview
- Farmer registration and login (UI only)
- Buyer registration and login (UI only)
- Farmer dashboard — listings, orders, cluster, earnings views
- Buyer dashboard — marketplace, cart, orders views
- Shopping cart with delivery method selection and price calculation
- Mock data powering all listings, orders, and stats

> Backend integration (Supabase, Paystack, real-time timers, SMS) is planned for v1.0 post-MVP.

---

## Core Features (MVP)

### 🕐 Freshness Timer
Every listing card shows a live countdown from a mock harvest time — colour shifts green → gold → red as time runs down. Powered by `setInterval` in vanilla JS.

### 🚛 Farm Clusters
UI showing nearby cluster batches, farmer counts, and estimated savings. Join flow is fully interactive with state managed in JS.

### 📊 Price Intelligence
Mock price table comparing Travia rates vs. middlemen prices across species and markets. Rendered from a static JS data object.

### 📅 Pre-Order System
Buyer-facing UI to browse upcoming harvests and simulate a deposit booking flow.

### 🛒 Cart & Checkout
Full cart drawer — add items, adjust quantity, select delivery method, see live totals with 4% Travia fee. Checkout triggers a success state (no real payment).

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Markup | HTML5 |
| Styling | CSS3 (custom properties, flexbox, grid) |
| Logic | Vanilla JavaScript (ES6+) |
| Fonts | Google Fonts — Playfair Display, DM Sans, DM Mono |
| Icons | Inline SVG / emoji |
| Hosting | GitHub Pages / any static host |

No npm. No build step. No dependencies. Just open the file and it works.

---

## Project Structure

```
travia/
├── index.html              # Landing page
├── pages/
|   ├── login.html              # Login (farmer + buyer share same page)
|   ├── register.html           # Register (3-step, role-aware)
|   ├── farmer-dashboard.html   # Everything farmer-side
|   └── buyer-dashboard.html    # Everything buyer-side
|
├── css/
│   ├── style.css           # Global: tokens, reset, buttons, cards
│   └── dashboard.css       # Shared dashboard styles (sidebar, topbar)
│
├── js/
│   ├── app.js              # Auth state, routing between pages, shared utils
│   └── dashboard.js        # All dashboard logic (cart, listings, timers, tabs)
│
└── assets/
    └── images/
```

---

## Getting Started

No install required.

```bash
# Clone the repo
git clone https://github.com/DatomCode/Travia.git
cd travia

# Open in browser
open index.html
```

Or just double-click `index.html`. That's it.

---

## Brand

| Token | Value |
|-------|-------|
| Primary | `#1E4A30` Forest Green |
| Accent | `#C8612A` Ember |
| Success | `#48A068` Leaf |
| Font (Display) | Playfair Display |
| Font (UI) | DM Sans |
| Font (Prices) | DM Mono |

---

## Roadmap

| Phase | Scope |
|-------|-------|
| **MVP (now)** | HTML/CSS/JS frontend prototype, mock data, full UI flows |
| **v1.0** | Next.js + Supabase backend, real listings, Paystack payments |
| **v1.5** | Farm Cluster logistics API, pre-order escrow, push notifications |
| **v2.0** | React Native mobile app, price intelligence live feed, Pan-Nigeria expansion |

---

## Team

Built with fire by **Team Inferno** — a multidisciplinary product and technology team with one conviction: Nigeria's agricultural economy deserves better infrastructure.

---

## License

Private & Confidential — Team Inferno © 2026