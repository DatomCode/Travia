# ENHANCED PRODUCT REQUIREMENTS DOCUMENT
## Travia Marketplace Platform v1.0
### Fish & Snail Marketplace for Farmers and Buyers

**Version:** 1.0 – Initial Release  
**Status:** Ready for Frontend Development  
**Author:** Travia Product Team  

---

## 🚀 EXECUTIVE SUMMARY

Travia is a transparent agricultural marketplace connecting farmers directly with buyers.  
The platform focuses on freshness, logistics efficiency, and secure payments while giving farmers control over inventory and payouts.

The application supports two core roles:

- **Farmers** – Manage inventory, sell products, and withdraw earnings.
- **Buyers** – Discover fresh produce, compare farms, and order with delivery options.

The system uses a **Dual-Theme Design System** to visually distinguish user modes.

---

## 🎨 BRAND IDENTITY & COLOR SYSTEM

The application uses a **Nature-Premium design palette**.  
The UI dynamically switches colors depending on the user's role.

### A. Primary Color Palette

#### Farmer Mode (Primary)

| Element | Color | Hex |
|-------|------|------|
| Main Background | Forest Green | `#0D2B1E` |
| Container Background | Deep Green | `#152F20` |
| Action Buttons | Leaf Green | `#48A068` |
| Success Accents | Mint Green | `#7EC8A0` |

#### Buyer Mode (Accent)

| Element | Color | Hex |
|-------|------|------|
| Primary Action Buttons | Ember Orange | `#C8612A` |
| Hover State | Flame Orange | `#E07B45` |
| Alerts / Warnings | Gold | `#D4A843` |

### B. Typography & Components

| Component | Style |
|----------|------|
| Headings | **Playfair Display (900 Weight)** |
| Body Text | **DM Sans** |
| Button Style | **100px pill-shaped buttons with subtle shadows** |

---

## 🔐 USER AUTHENTICATION & MULTI-ROLE ONBOARDING

The system routes users into two distinct dashboard experiences based on their registration choice.

### 3-Step Registration Wizard

#### Step 1 — Identity

Users provide:

- Full Name  
- Phone Number  
- Email Address  

Users must choose their role:

- **Farmer**
- **Buyer**

---

#### Step 2 — Role Context

**For Farmers**

Required information:

- Farm Name
- Farm Type (Fish / Snail / Both)
- State
- LGA
- Monthly Output Estimate

**For Buyers**

User selects usage type:

- Personal Use
- Business

Business options include:

- Restaurant
- Hotel
- Exporter

---

#### Step 3 — Security

Users must complete:

- Password Setup (minimum **8 characters**)
- Referral Code (optional)
- Accept **Terms of Service** (mandatory)

---

## 🛒 BUYER EXPERIENCE (MARKETPLACE)

The Buyer dashboard functions as a **high-transparency agricultural marketplace**.

### Discovery Features

#### Freshness Timer

Every product listing shows a **live freshness indicator**.

Examples:

3hrs Fresh  
12hrs Fresh  
24hrs Fresh  

---

#### Smart Filters

Buyers can filter products using quick filter chips:

- **Near Me** (based on LGA)
- **Freshest**
- **Top Rated**

---

#### Farm Verification

Each product listing displays:

- Farmer rating (example **4.8⭐**)
- Farm location
- Product availability

This increases buyer confidence and transparency.

---

### Cart & Checkout System

#### Slide-Out Cart Drawer

The cart appears as a **right-side sliding panel** where users can:

- Adjust product quantities
- View price breakdown
- Select delivery method

Units supported:

- **Kilograms (kg)**
- **Pieces**

---

### Delivery Tier Logic

| Delivery Type | Cost | Description |
|---------------|------|-------------|
| Self Pickup | ₦0 | Buyer collects from farm |
| Kwik Delivery | ₦1,500 | On-demand logistics |
| Farm Cluster | ₦600 | Shared delivery batch |

---

### Financial Calculation

Frontend must calculate:

Subtotal  
+ Delivery Fee  
+ **4% Travia Service Fee**  
= **Total Payable**

---

## 🌾 FARMER EXPERIENCE

The Farmer dashboard focuses on inventory management, logistics visibility, and earnings withdrawal.

---

### Inventory Management

#### Add Listing Modal

Farmers create listings using the following fields:

- Product Type
- Quantity
- Price
- Harvest Time
- Pickup Location

---

### Stock Tracking

Inventory is displayed with **visual progress bars** to indicate stock depletion.

Example representation:

Stock Remaining  
██████████░░░░░░ 60%

---

## 💰 EARNINGS & PAYOUT SYSTEM

### Wallet Structure

| Balance Type | Description |
|--------------|-------------|
| Available Balance | Funds from completed orders ready for withdrawal |
| Escrow Balance | Funds from orders still in delivery or review |

Escrow funds remain locked for **24 hours after delivery confirmation**.

---

### Bank Verification Flow

#### Step 1 — Bank Selection

User selects their bank from a **searchable list of Nigerian banks**.

---

#### Step 2 — Account Verification

User enters a **10-digit NUBAN account number**.

The system performs:

Automatic **Name Inquiry**

The verified account name is displayed to the user before confirmation.

---

### Payout Request

Withdrawal conditions:

- **Minimum Withdrawal Amount:** ₦5,000

---

### Payout Request Tracking

| Status | Meaning |
|------|------|
| Pending | Withdrawal request submitted |
| Processing | Payment being processed |
| Success | Funds successfully transferred |

---

## 💻 FRONTEND TECHNICAL REQUIREMENTS

| Feature | Design Detail | Logic Rule |
|-------|------|------|
| Buttons | Rounded **100px pill shape** | `.btn-g` used for Farmer actions |
| Buttons | Ember Orange | `.btn-e` used for Buyer actions |
| Typography | Playfair Display | Used for headings |
| Badges | Pill shaped, semi-transparent | Color coded status |
| Badge Color | Green | Completed |
| Badge Color | Gold | In Transit |
| Badge Color | Red | Failed |
| Responsiveness | Mobile-First | Sidebar collapses into hamburger menu |

---

## 📱 RESPONSIVE DESIGN RULES

Mobile behavior requirements:

- Sidebar must collapse into a **hamburger menu**
- Cart drawer becomes **bottom sliding panel**
- Buttons scale to **full-width on mobile**
- Layout optimized for **small-screen navigation**

---

## 📊 FUTURE FEATURES (ROADMAP)

Planned improvements for future releases:

- Farm subscription system
- Buyer loyalty rewards
- AI freshness prediction
- Real-time farm logistics tracking
- Export marketplace