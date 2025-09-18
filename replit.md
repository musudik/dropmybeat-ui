# DropMyBeats Frontend - Replit Setup

## Overview
DropMyBeats is an interactive DJ event management platform built with React. The application allows DJs, managers, and participants to interact during live events with real-time song requests and event management features.

## Project Architecture
- **Frontend**: React 18+ with Vite
- **UI Library**: Custom components with TailwindCSS + shadcn/ui
- **Routing**: React Router v6
- **State Management**: React Query for server state
- **Authentication**: Context-based auth with JWT tokens
- **Real-time**: WebSocket integration for live updates
- **API**: Connects to backend at https://dropmybeat-api.replit.app/

## Recent Changes
- 2025-09-18: Set up project in Replit environment
  - Fixed UI component import paths to use correct capitalization
  - Configured Vite to run on 0.0.0.0:5000 for Replit compatibility
  - Set up Frontend Server workflow

## User Preferences
- Uses React with functional components and hooks
- Prefers shadcn/ui components for UI consistency
- Uses TailwindCSS for styling with custom neon theme
- Implements role-based access control (Admin, Manager, Member, Guest)

## Current Setup
- Development server running on port 5000
- Configured to proxy API requests to backend
- Hot module replacement working correctly
- All import issues resolved

## Key Features
- Event management with CRUD operations
- Real-time song requests and voting
- Role-based dashboards (Admin, Manager, Member, Guest)
- Public event feedback system
- QR code generation for easy event joining
- Image upload for event banners and logos