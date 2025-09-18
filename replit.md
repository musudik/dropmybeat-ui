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
- 2025-09-18: Complete production-ready setup in Replit environment
  - Fixed UI component import paths to use correct capitalization across all components
  - Configured Vite for both development and production with proper host/port settings
  - Resolved all static asset handling issues by creating proper public directory structure
  - Updated all asset references from /src/assets paths to public root paths
  - Fixed PWA manifest with correct branding and icon paths
  - Added production preview configuration for deployment readiness
  - Cleaned up duplicate assets and unnecessary directories
  - Set up Frontend Server workflow running successfully on port 5000

## User Preferences
- Uses React with functional components and hooks
- Prefers shadcn/ui components for UI consistency
- Uses TailwindCSS for styling with custom neon theme
- Implements role-based access control (Admin, Manager, Member, Guest)

## Current Setup
- Development server running on 0.0.0.0:5000 for Replit compatibility
- Production preview configured on same port for deployment
- Configured to proxy API requests to backend during development
- Hot module replacement working correctly
- All import and asset issues resolved
- PWA-ready with proper manifest and favicon configuration
- Clean public directory structure with all assets properly organized

## Key Features
- Event management with CRUD operations
- Real-time song requests and voting
- Role-based dashboards (Admin, Manager, Member, Guest)
- Public event feedback system
- QR code generation for easy event joining
- Image upload for event banners and logos