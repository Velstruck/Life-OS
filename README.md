# Life OS - Personal Management PWA

A production-grade Progressive Web App built with the MERN stack for managing habits and expenses with a modern, mobile-first design.

## 🚀 Features

### Group Streaks (Habit Tracker)
- **GitHub-style contribution grid** with dynamic opacity based on completion rate
- **Optimistic UI updates** for instant feedback
- **Invite system** for sharing habits with friends
- **Real-time collaboration** to track habits together

### Khata (Smart Expense Splitter)
- **Simplified debt settlement** using net balance algorithm
- **Visual balance indicators** showing who owes whom
- **Equal split calculator** for group expenses
- **Activity feed** for expense tracking

## 🛠 Tech Stack

**Frontend:**
- React 18 with TypeScript
- Vite for blazing fast builds
- TanStack Query for server state management
- Zustand for client state
- Tailwind CSS with custom design system
- Lucide React for icons
- Sonner for toast notifications

**Backend:**
- Node.js with Express
- MongoDB with Mongoose
- JWT authentication with HTTP-only cookies
- TypeScript throughout

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- MongoDB instance (local or cloud)

### Setup

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd project
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Server (`.env` in `/server` folder):
```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

Client (`.env` in `/client` folder):
```env
VITE_API_URL=http://localhost:3000/api
```

4. **Run the application**

Development mode (both client and server):
```bash
npm run dev
```

Or run separately:
```bash
# Server
cd server
npm run dev

# Client (in another terminal)
cd client
npm run dev
```

5. **Access the app**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## 🎨 Design Philosophy

### Mobile-First
- Bottom navigation bar optimized for thumb zones
- Touch targets are minimum 44px
- Responsive design that scales beautifully

### Modern SaaS Styling
- Inter font family for clean typography
- Soft shadows and smooth transitions
- Skeleton loaders instead of spinners
- Toast notifications for all actions
- Gradient backgrounds and cards

### User Experience
- Optimistic UI updates for instant feedback
- Smooth animations (pop, slide, scale)
- Clear visual hierarchy
- Intuitive navigation

## 📱 PWA Features

- Installable on mobile and desktop
- Offline-capable (with service worker)
- Native app-like experience
- App shortcuts for quick access

## 🏗 Project Structure

```
project/
├── client/                 # React frontend
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── api/           # API client functions
│   │   ├── components/    # Reusable components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── layouts/       # Layout components
│   │   ├── pages/         # Page components
│   │   ├── stores/        # Zustand stores
│   │   └── types/         # TypeScript types
│   └── ...
├── server/                # Express backend
│   ├── src/
│   │   ├── middleware/    # Express middleware
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # API routes
│   │   └── utils/         # Utility functions
│   └── ...
└── README.md
```

## 🔐 Authentication

- JWT tokens stored in HTTP-only cookies
- Session validation on app load
- Protected routes with redirect
- Secure password hashing with bcrypt

## 📊 Key Algorithms

### Expense Settlement (Simplified Debts)
1. Calculate total spend per user
2. Calculate fair share per member
3. Compute net balance (paid - owed)
4. Match debtors with creditors
5. Minimize number of transactions

### Habit Tracking
- Date-based completion logs
- Multi-user participation tracking
- Visual opacity based on completion rate
- Optimistic updates with rollback on error

## 🚢 Deployment

### Frontend (Vercel/Netlify)
```bash
cd client
npm run build
# Deploy the 'dist' folder
```

### Backend (Railway/Render/Heroku)
```bash
cd server
npm run build
npm start
```

Don't forget to set environment variables in your deployment platform!

## 📝 API Endpoints

### Auth
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Sign in
- `POST /api/auth/logout` - Sign out
- `GET /api/auth/me` - Get current user

### Habits
- `POST /api/habits` - Create habit
- `GET /api/habits` - Get all habits
- `GET /api/habits/:id` - Get habit details
- `POST /api/habits/:id/log` - Add completion log
- `POST /api/habits/join/:code` - Join habit

### Groups (Expenses)
- `POST /api/groups` - Create group
- `GET /api/groups` - Get all groups
- `GET /api/groups/:id` - Get group details
- `POST /api/groups/:id/expenses` - Add expense
- `GET /api/groups/:id/settlements` - Get settlements
- `POST /api/groups/join/:code` - Join group
- `DELETE /api/groups/:id/expenses/:expenseId` - Delete expense

## 🎯 Future Enhancements

- [ ] Push notifications for habit reminders
- [ ] Custom split percentages for expenses
- [ ] Export expense reports
- [ ] Dark mode
- [ ] Multi-language support
- [ ] Social features (comments, reactions)

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---

Built with ❤️ using the MERN stack
