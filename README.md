# 🎶 DropMyBeats - Interactive DJ Event Management Frontend

DropMyBeats is a modern, **mobile-responsive React SPA** designed for DJs, managers, and participants to interact during live events.  
It allows **real-time song requests, event management, and role-based access** for admins, managers, and participants.

---

## 🚀 Tech Stack

### Frontend
- [React 18+](https://react.dev/) + [Vite](https://vitejs.dev/)
- [TailwindCSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- [React Router v6](https://reactrouter.com/)
- [React Query](https://tanstack.com/query/latest)
- [Framer Motion](https://www.framer.com/motion/)
- [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- [Axios](https://axios-http.com/)

### Dev Tools
- ESLint + Prettier
- Jest + React Testing Library
- Deployed on Vercel/Netlify

---

## 📦 Installation & Setup

### Prerequisites
- Node.js >= 18.x
- npm or yarn

### Steps
```bash
# 1. Clone the repo
git clone https://github.com/your-username/dropmybeats-frontend.git
cd dropmybeats-frontend

# 2. Install dependencies
npm install

# 3. Start dev server
npm run dev


API Integration

This frontend connects to the backend API:
Base URL: https://dropmybeat-api.replit.app/

Module	Endpoint
Events	/api/events
Participants	/api/events/:eventId/participants
Song Requests	/api/events/:eventId/song-requests
Auth	/api/auth/*
Person Management	/api/persons

Update the API base URL in .env:
VITE_API_BASE_URL=https://dropmybeat-api.replit.app/


Features
Real-time Song Requests with live queue updates
Role-based Interfaces for Admin, Manager, and Participant
Interactive Queue with voting/liking
Event Management (CRUD)
Dark Theme with neon accents
Mobile-first responsive design
Accessibility friendly