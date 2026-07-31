# Nestly 🏡 — Real Estate Listing Portal

A full-stack real estate web app I built where buyers can browse property listings, chat live with agents, calculate mortgage payments, search properties on an interactive map, save searches for email alerts, and compare homes with price history and comparable listings. Agents get their own dashboard to manage listings under a subscription plan (Basic/Pro/Premium), now with real Stripe checkout.

Built with **React + Vite** on the frontend and **Express + MongoDB + Socket.io** on the backend.

## Live Demo

-----

## Why I built this

I wanted a project that wasn't just another CRUD app — something with a real-time feature (chat), some actual math (mortgage amortization instead of a rough estimate), a bit of geospatial stuff (map clustering + draw-to-search), and eventually some of the "real product" features that make a listing portal actually useful — saved-search alerts, price history, comparables, virtual tours, and real payments — while still being something I could realistically finish and explain properly in a viva.

## Features

- **Buyer/Agent login** — pick a role when you sign in, no password (kept it simple, see note below)
- **Property listings** — search by location, price range, beds, property type, sort by price/newest, with pagination
- **Favorites** — heart icon to save properties you like
- **Saved searches + email alerts** — save your current filters and Nestly emails you when a new listing matches; a scheduler re-checks every 10 minutes, plus a manual "check now" button
- **Interactive map** — Leaflet + OpenStreetMap, with marker clustering, a polygon draw-to-search tool, and a price heatmap
- **Mortgage calculator** — real amortization formula (monthly payment, year-by-year breakdown chart, and a rate comparison table)
- **Price history** — every price change on a listing is logged automatically and charted, so you can see if a property's had drops over time
- **Comparable listings** — each listing page shows similar homes nearby (same type/location, within ±25% price) pulled from the real database, not sample data
- **Virtual tours** — agents can attach a Matterport/Kuula link when creating a listing, and it renders as an embedded 3D tour
- **Live chat** — Socket.io powered, per-listing chat rooms, messages saved to MongoDB
- **Agent dashboard** — see your plan, listings used vs limit, view analytics (Pro/Premium only), and upgrade your plan through real Stripe Checkout (test mode)
- **Sample school ratings & Walk Score** — shown on each listing (see honesty note below, this isn't real data)

## Tech Stack

**Frontend:** React, Vite, Axios, Socket.io-client, Leaflet, Recharts
**Backend:** Node.js, Express, MongoDB (Mongoose), Socket.io, Stripe, Nodemailer, node-cron

## A Couple of Honest Notes

I'd rather be upfront about these than have someone assume it's using a paid service it isn't:

- The map doesn't use Google Maps — it uses **Leaflet + OpenStreetMap** instead, since Google Maps needs a billing-enabled API key. Leaflet does everything I needed (clustering, drawing, heatmaps) for free.
- School ratings and Walk Score are **not real data** from GreatSchools / Walk Score (both APIs need an approved/paid key). They're generated with a hashing function so the same listing always gets the same rating — clearly marked as sample data in the UI, not passed off as real.
- Comparable listings, on the other hand, **is** real — it's just a MongoDB query against my own listings collection, so no external API was needed to make that one genuine.
- Plan upgrades now go through **real Stripe Checkout** (test mode) — a plan only changes after Stripe confirms the payment via webhook. If you run the project without adding your own Stripe test keys, clicking "Upgrade" tells you that clearly and offers a free demo-mode switch instead, so the listing-limit/analytics logic is still fully testable without one.
- Saved-search alert emails go out over real SMTP if you configure it. Without SMTP credentials, the email is printed in full to the backend console instead of silently failing, so the feature is still demonstrable end to end.

## Getting It Running Locally

You'll need Node.js (v18+) and MongoDB installed and running locally.

**1. Clone the repo**
```bash
git clone https://github.com/your-username/nestly.git
cd nestly
```

**2. Backend**
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```
You should see something like:
```
MongoDB connected: 127.0.0.1
Seeded 9 sample listings under demo_agent.
Nestly server running at http://localhost:4000
Saved-search email alert scheduler started (runs every 10 minutes).
```
(The seed script only runs the first time, when the database is empty.)

Optional — fill these into `.env` to turn on real payments and real emails:
```
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
```

**3. Frontend** (in a new terminal)
```bash
cd frontend
npm install
npm run dev
```
Open the link Vite prints — usually `http://localhost:5173`.

## Trying It Out

1. Log in as a **buyer** first — browse listings, favorite a couple, open one's details to see price history/comparables/school ratings/Walk Score, try the mortgage calculator, save a search, and send a chat message.
2. Go to **Saved Searches** and click "Check for new matches now" to see the email-alert pipeline run instantly instead of waiting for the 10-minute scheduler.
3. Log out and log back in as an **agent** — you'll get an Agent Dashboard link in the nav. Add a listing (optionally with a virtual tour URL), edit its price a couple of times and check the buyer view's price history chart update, and try upgrading a plan through Stripe Checkout.
4. Open the same listing in two browser tabs (one as buyer, one as agent) and chat between them — that's the real-time Socket.io part actually working, not a mockup.

## Project Structure

```
backend/
  config/         DB connection + plan limits config
  models/         User, Listing (with price history + virtual tour), Message, Calculation, SavedSearch schemas
  routes/         auth, listings, chat, calculations, agents, saved-searches, payments
  services/       mortgage math, school ratings, Walk Score, comparable sales, email, alert scheduler
  socket/         Socket.io chat handler
  seed/           sample data seeder
  server.js

frontend/
  src/api/        all backend calls in one place
  src/components/ every UI section (listings, map, chat, calculator, dashboard, saved searches,
                   price history chart, comparable sales, walk score badge, virtual tour, etc.)
  src/App.jsx     ties everything together based on login state
```

## What I'd Add If I Had More Time

- Real password-based auth (bcrypt + JWT)
- Actual image upload instead of pasting an image URL
- Move plan enforcement fully server-side of the Stripe webhook (currently trusts the webhook payload) and add retry/idempotency handling for it
- A real GreatSchools / Walk Score API key once I can get one approved

## Author

Built by  — Anendra Singh Rajawat [/ [[LinkedIn](https://www.linkedin.com/in/anendra-singh-rajawat-a6aaab212/)] / [[Github](https://github.com/anendraXpython)]]
