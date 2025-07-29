# Bisia Composer 2025 - Project Context

## Project Branding

### Brand Identity
- **Application Name:** Bisiacaria.com
- **Domain:** bisiacaria.com (production)
- **Tagline:** "Il social network dei bisiachi"
- **Target:** Community platform for "bisiachi" (locals/community members)

### Application Features

**Authentication Flow:**
- Registration: Nickname + Phone number
- OTP confirmation via Firebase (passwordless)
- Login via phone + OTP (no passwords)

**User Profile System:**
- **Avatar:** User profile picture
- **Status Indicator:** Traffic light system (🔴 Impegnato, 🟡 Indeciso, 🟢 Libero)
- **Location:** City of origin/residence
- **Personal Info:** Birth date, age, birthday display
- **Q&A Section:** Personal questions and answers
- **Preferences:** 5 things you love / 5 things you hate

**Social Features:**
- **User Discovery:** View other online users
- **Connection System:** 
  - "Conosci" (Know) → Follower relationship
  - Mutual "Conosci" → Friend relationship (higher connection level)
- **Profile Visiting:** Browse other users' profiles

**Application Layout (Authenticated):**
- **Left Drawer:** Main navigation menu
  - Home
  - My Profile  
  - Events Calendar
  - Bis-Poker
  - Settings
  - Logout
- **Right Drawer:** Online users list + Search
  - **Basic Search:** Nickname search form
  - **Advanced Search (Accordion):** Age range, location, gender (M/F), relationship status

**Community Services:**

**Event Calendar:**
- Community-driven event system
- Users can create and share local events
- Calendar view for community activities

**Bis-Poker Game:**
- Weekly video-poker tournament (Monday to Sunday)
- **Daily Credits:** 1000 credits per player per day
- **Gameplay:** Spend daily credits playing video-poker
- **Scoring:** Points accumulated from daily play contribute to weekly leaderboard
- **Competition:** Weekly winner determined by highest score at Sunday 23:59
- **Reset:** Leaderboard resets every Monday for new week
- **Engagement:** Gamification element to increase daily user retention

**Core User Journey:**
1. Register with nickname + phone
2. Confirm via OTP
3. Complete profile setup
4. Discover and connect with community members
5. Build social connections through mutual recognition
6. Participate in community events and games

## Project Stack & Architecture

### Backend Services
- **Runtime:** Bun (JavaScript runtime)
- **Framework:** Hono (lightweight web framework)
- **Database:** PocketBase (2 separate instances)
- **Authentication:** JWT tokens, Google OAuth, Firebase Phone Auth, Email/Password
- **Containerization:** Docker + Docker Compose

### Frontend Stack
- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite
- **Routing:** TanStack Router (file-based routing)
- **State Management:** Zustand + TanStack Query
- **Forms:** TanStack Form + Zod validation
- **UI Components:** Radix UI + Shadcn/ui
- **Styling:** Tailwind CSS + Tailwind Animate
- **Icons:** Lucide React
- **Package Manager:** PNPM

### Architecture
- **Microservices:** auth-api, bisia-api, bisia-frontend
- **Ports:** auth-base (8090), bisia-base (8091), frontend (5173/3000)
- **Environment:** Separate dev/prod configurations with Docker Compose

### Development Guidelines
- Use existing patterns and components from the codebase
- Follow TanStack Router file-based routing conventions
- Implement proper TypeScript typing
- Use Zustand for global state, TanStack Query for server state
- Follow Shadcn/ui component patterns
- Maintain responsive design with Tailwind CSS

### URL Routing Strategy

**Profile URL Pattern:**
- **Public Profile URLs:** `https://bisiacaria.com/<slug-nickname>`
- **Internal Route Mapping:** 
  - `/$nickname` → User profile page (catch-all route)
  - `/home` → Dashboard/home page (authenticated users)
  - `/settings` → User settings
  - `/events` → Events calendar
  - `/bis-poker` → Poker game
  
**Implementation Strategy:**
1. **Route Priority Order:** 
   - Static routes first (`/home`, `/settings`, `/events`, `/bis-poker`)
   - Dynamic profile route last (`/$nickname`) as catch-all
2. **Nickname Validation:** Server-side validation to distinguish between valid nicknames and 404s
3. **SEO-Friendly:** Each profile has unique URL for social sharing and discovery
4. **Reserved Nicknames Prevention:** Comprehensive list of forbidden nicknames

**Reserved Nicknames List:**
```javascript
const RESERVED_NICKNAMES = [
  // Application routes
  'home', 'settings', 'events', 'bis-poker', 'profile',
  // Authentication routes  
  'login', 'register', 'signup', 'logout', 'auth',
  // System routes
  'api', 'admin', 'dashboard', 'app', 'www',
  // Common reserved words
  'help', 'support', 'contact', 'about', 'terms', 'privacy',
  'search', 'explore', 'discover', 'notifications',
  // Technical routes
  'assets', 'static', 'public', 'uploads', 'images',
  'js', 'css', 'fonts', 'favicon', 'robots', 'sitemap',
  // Social/Community features
  'feed', 'timeline', 'messages', 'chat', 'groups'
];
```

**Validation Implementation:**
- **Frontend:** Real-time validation during registration
- **Backend:** Server-side validation before user creation
- **Database:** Unique constraint on nickname field
- **User Feedback:** Clear error message with alternative suggestions

## Design System

### Color Palette
**Light Theme:**
- **Background:** `yellow-400` (Tailwind)
- **Accent:** `black`
- **Supporting:** `white`, `stone-*` variations

**Dark Theme:**
- **Background:** `black`
- **Accent:** `yellow-400` (Tailwind)
- **Supporting:** `white`, `stone-*` variations (dark grays)

### Typography
- **Primary Font:** Montserrat (Google Fonts)
- Use across all text elements for consistency

### Theme Implementation
- Support both light and dark modes
- Use Tailwind's built-in color system
- Implement theme switching capability
- Maintain accessibility contrast ratios
- Use `stone-*` palette for neutral elements (borders, muted text, etc.)

### Design Principles
- High contrast design (yellow/black combination)
- Clean, modern aesthetic
- Consistent spacing using Tailwind's spacing scale
- Responsive-first approach