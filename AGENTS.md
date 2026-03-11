# AGENTS.md - Developer Guidelines for EduSpace

## Project Overview

EduSpace is a full-stack MERN learning platform deployed on Vercel using:
- **Frontend**: React 18 + Vite + Tailwind CSS + React Router
- **Backend**: Express/Vercel Serverless Functions + MongoDB (Mongoose)
- **Authentication**: JWT + Gmail OTP

---

## Build, Lint, and Test Commands

### Root Commands
```bash
npm install           # Install root dependencies
npm run dev          # Run development server (nodemon)
npm run build        # Build client
```

### Client Commands
```bash
cd client
npm run dev          # Start Vite dev server (http://localhost:5173)
npm run build        # Production build to client/dist
npm run preview      # Preview production build
```

### Single Test Command
**No test framework configured.** To add tests:
```bash
npm install -D vitest && npx vitest run --test-name-pattern="test name"
```

---

## Code Style Guidelines

### General Principles
- Write clean, readable code without unnecessary comments
- Keep functions small and focused
- Handle errors gracefully with try/catch

### Import Order
**Backend:**
```javascript
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect, admin } from '../middleware/auth.js';
import connectDB from '../lib/db.js';
```
**Frontend:**
```javascript
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `Login.jsx` |
| Functions/Variables | camelCase | `handleSubmit` |
| Files (non-components) | camelCase | `auth.js` |
| Constants | UPPER_SNAKE_CASE | `JWT_SECRET` |
| React Hooks | `use` prefix | `useAuth` |

### Error Handling
**Backend:**
```javascript
export default async function handler(req, res) {
  try {
    await connectDB();
    return res.status(200).json({ data: 'success' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ message: error.message });
  }
}
```
**Frontend:**
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);
  const result = await login(email, password);
  setLoading(false);
  if (result.success) {
    navigate('/dashboard');
  } else {
    setError(result.message);
  }
};
```

### Database
- Always connect to DB at start: `await connectDB()`
- Validate input before database operations
- Sanitize user input: `input.trim().substring(0, 500)`
- Never expose passwords in API responses

### Authentication
- Protected routes use `protect` middleware
- Admin routes use both `protect` and `admin`
- JWT tokens expire in 30 days

### React Components
```javascript
import { useState, useEffect } from 'react';

const ComponentName = () => {
  const [state, setState] = useState(initialValue);
  useEffect(() => {}, [dependencies]);
  const handler = () => {};
  return <div>{/* JSX */}</div>;
};

export default ComponentName;
```

### Tailwind CSS
- Support dark mode: `className="bg-white dark:bg-gray-800"`
- Use responsive prefixes: `text-sm sm:text-base`

---

## Project Structure
```
/home/alamin/OC1/
├── api/                    # Vercel Serverless Functions
│   ├── auth/index.js       # Auth endpoints
│   ├── courses.js          # Course CRUD
│   ├── models/             # Mongoose models
│   ├── middleware/         # Auth middleware
│   └── lib/                # DB connection
├── client/                 # React frontend
│   ├── src/components/     # Reusable components
│   ├── src/pages/          # Route pages
│   ├── src/context/        # Auth, Theme context
│   └── src/App.jsx
└── package.json
```

---

## Environment Variables
```
MONGODB_URI=mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=gmail_email
EMAIL_PASS=gmail_app_password
CLOUDINARY_CLOUD_NAME=cloud_name
CLOUDINARY_API_KEY=api_key
CLOUDINARY_API_SECRET=api_secret
```

---

## Common Tasks

### New API Endpoint
1. Create/edit file in `api/`
2. Use try/catch pattern
3. Use `protect`/`admin` middleware as needed

### New Page
1. Create component in `client/src/pages/`
2. Add route in `client/src/App.jsx`
3. Use lazy loading: `const Page = lazy(() => import('./pages/Page'))`

---

## Testing Recommendations
Add for maintainability: Vitest, React Testing Library, ESLint + Prettier
