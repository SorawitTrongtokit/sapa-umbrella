# Umbrella Borrowing System

## Overview

This is a real-time umbrella borrowing and returning system designed for a school environment. The application allows students to borrow and return umbrellas from three campus locations, with real-time status tracking and an admin dashboard for management. The system tracks 21 umbrellas distributed across three fixed locations: ใต้โดม (umbrellas 1-7), ศูนย์กีฬา (umbrellas 8-14), and โรงอาหาร (umbrellas 15-21).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: TailwindCSS with CSS variables for theming
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management
- **Form Handling**: React Hook Form with Zod validation
- **Mobile-First**: Responsive design optimized for mobile devices

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Database**: Firebase Realtime Database for real-time synchronization
- **Authentication**: Firebase Authentication for admin access
- **API Design**: RESTful endpoints with Express routes
- **Development**: Development server with hot module replacement via Vite

### Real-time Data Flow
- **Database**: Firebase Realtime Database provides live updates
- **Authentication**: Firebase Auth handles admin login/logout
- **Subscriptions**: Real-time listeners for umbrella status and activity logs
- **State Sync**: Automatic UI updates when data changes in Firebase

## Key Components

### Core Pages
1. **UmbrellaStatus** (`/`) - Public dashboard showing real-time status of all 21 umbrellas
2. **BorrowForm** (`/borrow`) - Form for students to borrow umbrellas
3. **ReturnForm** (`/return`) - Form for students to return umbrellas  
4. **AdminDashboard** (`/admin`) - Protected admin interface for system management

### UI Components
- **BottomNavigation** - Mobile-friendly navigation between main pages
- **UmbrellaCard** - Visual representation of individual umbrella status
- **Shadcn/ui components** - Complete UI component library for forms, cards, dialogs, etc.

### Data Models
- **Umbrella Schema** - Tracks ID, status, location, borrower info, and history
- **Location Types** - Three fixed campus locations (ใต้โดม, ศูนย์กีฬา, โรงอาหาร)
- **Activity Logging** - Records all borrow/return transactions with timestamps

### Custom Hooks
- **useUmbrellaData** - Manages real-time umbrella state and Firebase subscriptions
- **useAdminAuth** - Handles admin authentication state
- **useToast** - Provides user feedback for actions

## Data Flow

1. **Real-time Updates**: Firebase Realtime Database pushes changes to all connected clients
2. **Form Submission**: Student forms validate data locally then update Firebase
3. **State Management**: TanStack Query caches and synchronizes server state
4. **UI Updates**: React components automatically re-render when Firebase data changes
5. **Activity Logging**: All transactions are logged with timestamps for audit trails

## External Dependencies

### Firebase Integration
- **Realtime Database**: Primary data store with live synchronization
- **Authentication**: Admin access control
- **Configuration**: Environment variables for API keys and project settings

### Third-party Libraries
- **Radix UI**: Accessible component primitives
- **TanStack Query**: Server state management
- **React Hook Form**: Form handling and validation
- **Zod**: Runtime type validation
- **Lucide React**: Icon library
- **date-fns**: Date utility functions

## Deployment Strategy

### Development
- **Vite Dev Server**: Fast development with HMR
- **Express Backend**: Serves API routes and static files in development
- **Environment Variables**: Firebase config and feature flags

### Production Build
- **Frontend**: Vite builds optimized React app to `dist/public`
- **Backend**: ESBuild bundles Express server to `dist/index.js`
- **Static Serving**: Express serves built frontend assets
- **Environment**: Production Firebase project with security rules

### Database Schema
The Firebase Realtime Database stores:
- `umbrellas/{id}`: Individual umbrella records with status, location, borrower info
- `activities/{id}`: Activity log entries for all borrow/return transactions
- Real-time listeners ensure all clients stay synchronized

### Authentication
- Admin dashboard protected by Firebase Authentication
- Email/password login for administrative access
- Public pages (status, borrow, return) require no authentication
- Session management handled automatically by Firebase SDK