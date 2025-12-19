# Real-Time Multiplayer Spin Wheel Game (MERN)

## Overview
This project is a real-time multiplayer spin wheel game built using the MERN stack.
Users join a spin wheel by paying coins, get eliminated at fixed intervals, and the
last remaining user wins the prize pool. The system supports real-time updates,
fair elimination, and admin control.

---

## Tech Stack
- Frontend: React (Vite), Tailwind CSS
- Backend: Node.js, Express.js
- Database: MongoDB
- Real-Time Communication: Socket.IO

---

## Core Features
- Admin-only spin wheel creation
- Only one active spin wheel at a time
- Coin-based entry fee
- Minimum 3 participants required
- Automatic elimination every 7 seconds
- Fair random elimination sequence
- Real-time updates for all players
- Coin distribution to winner and admin
- Transaction logging
- Admin dashboard and analytics

---

## How to Run the Project

### Backend
```bash
cd backend
npm install
node server.js
```

## FRONTEND
```bash
cd backend
npm install
node server.js
```

## Important API Endpoints


### Spin Wheel APIs
---


POST /spin/create → Create spin wheel (Admin only)

GET /spin/active → Get active spin wheel

POST /spin/join/:wheelId → Join spin wheel

POST /spin/start/:wheelId → Start spin wheel

### Admin & Analytics
---

GET /admin/dashboard → Admin monitoring dashboard

GET /analytics/summary → Historical analytics