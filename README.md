# Umbrella Borrowing System

A real-time umbrella borrowing and returning system built for school environments. This mobile-first application allows students to borrow and return umbrellas from three campus locations with real-time status tracking and admin management capabilities.

## 🎯 Features

### Student Features
- **Real-time Status Dashboard** - View live availability of all 21 umbrellas across three locations
- **Easy Borrow Process** - Simple form to borrow umbrellas with validation
- **Quick Return System** - Return umbrellas to any location
- **Mobile-First Design** - Optimized for smartphone usage with touch-friendly interface

### Admin Features
- **Secure Admin Login** - Firebase Authentication for admin access
- **Comprehensive Dashboard** - Monitor all umbrellas, activities, and statistics
- **Force Return** - Override system to manually return umbrellas
- **Activity Logs** - Complete history of all borrow/return transactions
- **Analytics** - View daily borrowing statistics and trends

## 🏗️ System Architecture

### Frontend
- **React 18** with TypeScript for type safety
- **Vite** for fast development and optimized production builds
- **Wouter** for lightweight client-side routing
- **TailwindCSS** for responsive, mobile-first styling
- **Shadcn/ui** components built on Radix UI primitives
- **TanStack Query** for server state management
- **React Hook Form** with Zod validation

### Backend & Database
- **Firebase Realtime Database** for live data synchronization
- **Firebase Authentication** for secure admin access
- **Express.js** server for development and API routes
- **Real-time listeners** for instant UI updates

## 📱 User Interface

### Public Pages
1. **Umbrella Status** (`/`) - Real-time dashboard showing all 21 umbrellas
2. **Borrow Form** (`/borrow`) - Student form to borrow umbrellas
3. **Return Form** (`/return`) - Student form to return umbrellas

### Admin Interface
4. **Admin Dashboard** (`/admin`) - Protected management interface

## 🌟 Umbrella Distribution

The system tracks 21 umbrellas distributed across three fixed campus locations:

- **ใต้โดม** (Under the Dome): Umbrellas 1-7
- **ศูนย์กีฬา** (Sports Center): Umbrellas 8-14  
- **โรงอาหาร** (Cafeteria): Umbrellas 15-21

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+ 
- Firebase project with Realtime Database enabled
- Firebase Authentication enabled

### 1. Clone the Repository
```bash
git clone <repository-url>
cd umbrella-borrowing-system
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Firebase Setup

#### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing "umbrella-system-e0ae7"
3. Enable Realtime Database in "asia-southeast1" region
4. Enable Authentication with Email/Password provider

#### Configure Environment Variables
Create a `.env` file in the root directory:
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_APP_ID=your_app_id_here  
VITE_FIREBASE_PROJECT_ID=your_project_id_here
```

#### Set Up Firebase Database Rules
```json
{
  "rules": {
    "umbrellas": {
      ".read": true,
      ".write": true
    },
    "activities": {
      ".read": true,
      ".write": true
    }
  }
}
```

#### Create Admin User
In Firebase Authentication, manually create an admin user with email/password.

### 4. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## 📊 Database Schema

### Umbrellas Collection
```javascript
umbrellas: {
  "1": {
    id: 1,
    status: "available" | "borrowed",
    currentLocation: "ใต้โดม" | "ศูนย์กีฬา" | "โรงอาหาร",
    borrower: {
      nickname: "John",
      phone: "0123456789", 
      timestamp: 1723457200
    } | null,
    history: [
      { 
        type: "borrow" | "return", 
        timestamp: 1723457200, 
        location: "ใต้โดม",
        nickname: "John" 
      }
    ]
  }
}
```

### Activities Collection
```javascript
activities: {
  "activity_id": {
    type: "borrow" | "return",
    umbrellaId: 1,
    nickname: "John",
    location: "ใต้โดม", 
    timestamp: 1723457200,
    note: "Optional admin note"
  }
}
```

## 🔧 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run type checking
npm run type-check
```

## 🚀 Deployment

### Firebase Hosting (Recommended)

1. **Install Firebase CLI**
```bash
npm install -g firebase-tools
```

2. **Login and Initialize**
```bash
firebase login
firebase init hosting
```

3. **Build and Deploy**
```bash
npm run build
firebase deploy
```

### Vercel Deployment

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Deploy**
```bash
npm run build
vercel --prod
```

### Environment Variables for Production
Ensure these environment variables are set in your deployment platform:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_PROJECT_ID`

## 🔒 Security Considerations

- API keys are safe for client-side use as they're designed for web applications
- Firebase Authentication handles secure admin login
- Database rules should be configured for production use
- Phone numbers are stored but never displayed publicly
- Admin routes are protected by authentication

## 🎨 Design System

### Colors
- **Primary**: Blue (#2563eb) for main actions
- **Success**: Green (#16a34a) for available umbrellas
- **Warning**: Orange (#ea580c) for borrowed umbrellas
- **Error**: Red (#dc2626) for errors and alerts

### Typography
- **Font**: Inter for clean, readable text
- **Sizes**: Responsive typography with mobile-first approach

### Components
- Mobile-optimized touch targets (minimum 44px)
- Clear visual hierarchy with consistent spacing
- Accessible color contrast ratios
- Loading states for all async operations

## 📱 Mobile Optimization

- Bottom navigation for easy thumb access
- Large touch targets for form inputs
- Responsive grid layouts
- Optimized for portrait orientation
- Fast loading with minimal JavaScript bundle

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🏫 Credits

**Developed by:** Sorawit Trongtokit  
**School:** PCSHSPL (Princess Chulabhorn Science High School Phitsanulok)

Built for school umbrella management systems. Designed with mobile-first approach for easy student access and comprehensive admin controls.

### 🎯 Project Background
This umbrella borrowing system was developed to solve the real-world problem of managing shared umbrellas across multiple campus locations. The system helps students easily borrow and return umbrellas while providing administrators with comprehensive management tools and analytics.

### 🏆 Technical Achievements
- **Real-time Data Synchronization** using Firebase Realtime Database
- **Progressive Web App (PWA)** capabilities for offline usage
- **Mobile-First Design** optimized for student smartphone usage
- **Comprehensive Admin Dashboard** with analytics and management tools
- **Scalable Architecture** suitable for educational institutions

---

**Note**: This system requires active Firebase project configuration and proper environment variable setup to function correctly.