# Nestly 🏡 — Real Estate Listing Portal

A full-stack real estate web app I built where buyers can browse property listings, chat live with agents, calculate mortgage payments, and search properties on an interactive map. Agents get their own dashboard to manage listings under a subscription plan (Basic/Pro/Premium).

Built with **React + Vite** on the frontend and **Express + MongoDB + Socket.io** on the backend.

## Live Demo

-----

## Why I built this

I wanted a project that wasn't just another CRUD app — something with a real-time feature (chat), some actual math (mortgage amortization instead of a rough estimate), and a bit of geospatial stuff (map clustering + draw-to-search), while still being something I could realistically finish and explain properly in a viva.

## Features

- **Buyer/Agent login** — pick a role when you sign in, no password (kept it simple, see note below)
- **Property listings** — search by location, price range, beds, property type, sort by price/newest, with pagination
- **Favorites** — heart icon to save properties you like
- **Interactive map** — Leaflet + OpenStreetMap, with marker clustering, a polygon draw-to-search tool, and a price heatmap
- **Mortgage calculator** — real amortization formula (monthly payment, year-by-year breakdown chart, and a rate comparison table)
- **Live chat** — Socket.io powered, per-listing chat rooms, messages saved to MongoDB
- **Agent dashboard** — see your plan, listings used vs limit, view analytics (Pro/Premium only), and upgrade/downgrade your plan
- **Sample school ratings** — shown on each listing (see honesty note below, this isn't real data)

## Tech Stack

**Frontend:** React, Vite, Axios, Socket.io-client, Leaflet, Recharts
**Backend:** Node.js, Express, MongoDB (Mongoose), Socket.io

## A Couple of Honest Notes

I'd rather be upfront about these than have someone assume it's using a paid service it isn't:

- The map doesn't use Google Maps — it uses **Leaflet + OpenStreetMap** instead, since Google Maps needs a billing-enabled API key. Leaflet does everything I needed (clustering, drawing, heatmaps) for free.
- School ratings are **not real data** from GreatSchools (that API needs a paid key too). They're generated with a hashing function so the same listing always gets the same rating — it's clearly marked as sample data in the UI, not passed off as real.
- Plan upgrades don't go through an actual payment gateway. Clicking "Switch to Pro" just updates the plan field in the database — that's what actually controls the listing limit and analytics access, there's just no Stripe/payment step in front of it.

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
```
(The seed script only runs the first time, when the database is empty.)

**3. Frontend** (in a new terminal)
```bash
cd frontend
npm install
npm run dev
```
Open the link Vite prints — usually `http://localhost:5173`.

## Trying It Out

1. Log in as a **buyer** first — browse listings, favorite a couple, open one's details, try the mortgage calculator, send a chat message.
2. Log out and log back in as an **agent** — you'll get an Agent Dashboard link in the nav. Add a listing, try switching plans and see the listing limit change.
3. Open the same listing in two browser tabs (one as buyer, one as agent) and chat between them — that's the real-time Socket.io part actually working, not a mockup.

## Project Structure

```
backend/
  config/         DB connection + plan limits config
  models/         User, Listing, Message, Calculation schemas
  routes/         auth, listings, chat, calculations, agents
  services/       mortgage math + school ratings logic
  socket/         Socket.io chat handler
  seed/           sample data seeder
  server.js

frontend/
  src/api/        all backend calls in one place
  src/components/ every UI section (listings, map, chat, calculator, dashboard, etc.)
  src/App.jsx     ties everything together based on login state
```

## What I'd Add If I Had More Time

- Real password-based auth (bcrypt + JWT)
- Actual image upload instead of pasting an image URL
- Stripe integration for the agent plan upgrades

## Author

Built by Anendra Singh Rajawat — [rajawatanendra2306@gmail.com / [LinkedIn](https://www.linkedin.com/in/anendra-singh-rajawat-a6aaab212/) / [Github](https://github.com/anendraXpython)]
