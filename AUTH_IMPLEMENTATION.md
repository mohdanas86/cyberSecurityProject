# Implementing Login, Signup, and Logout in Next.js Frontend

## Overview

This guide provides a step-by-step implementation of authentication (login, signup, logout) in a Next.js frontend that integrates with the provided Node.js/Express backend. The backend uses JWT tokens with cookies for authentication.

## Backend API Endpoints

Based on the backend analysis:

- **Register**: `POST /api/v1/users/register` - Form data with username, email, password, fullName, avatar (file), coverImage (optional)
- **Login**: `POST /api/v1/users/login` - JSON with username/email and password
- **Logout**: `POST /api/v1/users/logout` - Requires authentication

## Step 1: Set Up Next.js Project Structure

First, ensure you have a Next.js project set up in the `frontend/` directory.

```bash
cd frontend
npx create-next-app@latest . --yes --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

### Directory Structure

Create the following directory structure in `frontend/src/`:

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── api/
│   │   └── auth/
│   │       ├── login/route.ts
│   │       ├── signup/route.ts
│   │       └── logout/route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── AuthGuard.tsx
│   ├── LoginForm.tsx
│   ├── SignupForm.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       └── Form.tsx
├── contexts/
│   └── AuthContext.tsx
├── hooks/
│   └── useAuth.ts
├── lib/
│   ├── api.ts
│   └── utils.ts
└── types/
    └── auth.ts
```

## Step 2: Install Required Dependencies

```bash
npm install axios js-cookie @types/js-cookie
```

## Step 3: Create Type Definitions

Create `src/types/auth.ts`:

```typescript
export interface User {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  avatar: string;
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginData {
  username?: string;
  email?: string;
  password: string;
}

export interface SignupData {
  username: string;
  email: string;
  password: string;
  fullName: string;
  avatar: File;
  coverImage?: File;
}
```

## Step 4: Create API Utility Functions

Create `src/lib/api.ts`:

```typescript
import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for cookies
});

// Request interceptor to add access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, try to refresh
      try {
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/users/refresh-token`,
          {},
          { withCredentials: true },
        );
        const { accessToken } = refreshResponse.data.data;
        localStorage.setItem("accessToken", accessToken);
        error.config.headers.Authorization = `Bearer ${accessToken}`;
        return api.request(error.config);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export const authAPI = {
  login: async (data: {
    username?: string;
    email?: string;
    password: string;
  }) => {
    const response = await api.post("/users/login", data);
    return response.data;
  },

  signup: async (formData: FormData) => {
    const response = await api.post("/users/register", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  logout: async () => {
    const response = await api.post("/users/logout");
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get("/users/me");
    return response.data;
  },
};
```

## Step 5: Create Authentication Context

Create `src/contexts/AuthContext.tsx`:

```typescript
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types/auth';
import { authAPI } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  login: (data: { username?: string; email?: string; password: string }) => Promise<void>;
  signup: (formData: FormData) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      setUser(response.data);
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (data: { username?: string; email?: string; password: string }) => {
    const response = await authAPI.login(data);
    const { user, accessToken } = response.data;
    setUser(user);
    localStorage.setItem('accessToken', accessToken);
  };

  const signup = async (formData: FormData) => {
    const response = await authAPI.signup(formData);
    const { user, accessToken } = response.data;
    setUser(user);
    localStorage.setItem('accessToken', accessToken);
  };

  const logout = async () => {
    await authAPI.logout();
    setUser(null);
    localStorage.removeItem('accessToken');
  };

  const value = {
    user,
    login,
    signup,
    logout,
    isLoading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
```

## Step 6: Create Auth Guard Component

Create `src/components/AuthGuard.tsx`:

```typescript
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAuth = true,
  redirectTo = '/login',
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        router.push(redirectTo);
      } else if (!requireAuth && isAuthenticated) {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, requireAuth, redirectTo, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (requireAuth && !isAuthenticated) {
    return null;
  }

  if (!requireAuth && isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};
```

## Step 7: Create UI Components

Create `src/components/ui/Input.tsx`:

```typescript
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, ...props }) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        {...props}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};
```

Create `src/components/ui/Button.tsx`:

```typescript
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  isLoading,
  ...props
}) => {
  const baseClasses = 'px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
  };

  return (
    <button
      {...props}
      className={`${baseClasses} ${variantClasses[variant]} ${
        isLoading ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      disabled={isLoading || props.disabled}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
};
```

## Step 8: Create Login Form Component

Create `src/components/LoginForm.tsx`:

```typescript
'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.username && !formData.email) {
      newErrors.username = 'Username or email is required';
      newErrors.email = 'Username or email is required';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await login({
        username: formData.username || undefined,
        email: formData.email || undefined,
        password: formData.password,
      });
      router.push('/dashboard');
    } catch (error: any) {
      setErrors({ general: error.response?.data?.message || 'Login failed' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6">Login</h2>

      <Input
        label="Username or Email"
        name="username"
        value={formData.username}
        onChange={handleChange}
        error={errors.username}
        placeholder="Enter username or email"
      />

      <Input
        label="Password"
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        placeholder="Enter password"
      />

      {errors.general && (
        <p className="text-red-500 text-sm mb-4">{errors.general}</p>
      )}

      <Button type="submit" isLoading={isLoading} className="w-full">
        Login
      </Button>

      <p className="mt-4 text-center">
        Don't have an account? <a href="/signup" className="text-blue-600">Sign up</a>
      </p>
    </form>
  );
};
```

## Step 9: Create Signup Form Component

Create `src/components/SignupForm.tsx`:

```typescript
'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export const SignupForm: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    avatar: null as File | null,
    coverImage: null as File | null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.username) newErrors.username = 'Username is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.fullName) newErrors.fullName = 'Full name is required';
    if (!formData.avatar) newErrors.avatar = 'Avatar is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('username', formData.username);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('fullName', formData.fullName);
      if (formData.avatar) formDataToSend.append('avatar', formData.avatar);
      if (formData.coverImage) formDataToSend.append('coverImage', formData.coverImage);

      await signup(formDataToSend);
      router.push('/dashboard');
    } catch (error: any) {
      setErrors({ general: error.response?.data?.message || 'Signup failed' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6">Sign Up</h2>

      <Input
        label="Username"
        name="username"
        value={formData.username}
        onChange={handleChange}
        error={errors.username}
        placeholder="Enter username"
      />

      <Input
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        placeholder="Enter email"
      />

      <Input
        label="Full Name"
        name="fullName"
        value={formData.fullName}
        onChange={handleChange}
        error={errors.fullName}
        placeholder="Enter full name"
      />

      <Input
        label="Password"
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        placeholder="Enter password"
      />

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Avatar *
        </label>
        <input
          type="file"
          name="avatar"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full"
        />
        {errors.avatar && <p className="text-red-500 text-sm mt-1">{errors.avatar}</p>}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Cover Image (Optional)
        </label>
        <input
          type="file"
          name="coverImage"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full"
        />
      </div>

      {errors.general && (
        <p className="text-red-500 text-sm mb-4">{errors.general}</p>
      )}

      <Button type="submit" isLoading={isLoading} className="w-full">
        Sign Up
      </Button>

      <p className="mt-4 text-center">
        Already have an account? <a href="/login" className="text-blue-600">Login</a>
      </p>
    </form>
  );
};
```

## Step 10: Create Page Components

Create `src/app/(auth)/layout.tsx`:

```typescript
import { AuthGuard } from '@/components/AuthGuard';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          {children}
        </div>
      </div>
    </AuthGuard>
  );
}
```

Create `src/app/(auth)/login/page.tsx`:

```typescript
import { LoginForm } from '@/components/LoginForm';

export default function LoginPage() {
  return <LoginForm />;
}
```

Create `src/app/(auth)/signup/page.tsx`:

```typescript
import { SignupForm } from '@/components/SignupForm';

export default function SignupPage() {
  return <SignupForm />;
}
```

Create `src/app/dashboard/page.tsx`:

```typescript
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        {user && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold">Welcome, {user.fullName}!</h2>
            <p className="text-gray-600">Username: {user.username}</p>
            <p className="text-gray-600">Email: {user.email}</p>
            <img
              src={user.avatar}
              alt="Avatar"
              className="w-20 h-20 rounded-full mt-4"
            />
          </div>
        )}
        <Button onClick={handleLogout} variant="secondary">
          Logout
        </Button>
      </div>
    </div>
  );
}
```

## Step 11: Update Root Layout

Update `src/app/layout.tsx`:

```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Auth App',
  description: 'Authentication with Next.js and Express',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

## Step 12: Update Home Page

Update `src/app/page.tsx`:

```typescript
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-4xl font-bold mb-8">Welcome to Auth App</h1>
        <div className="space-x-4">
          <Link href="/login">
            <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
              Login
            </button>
          </Link>
          <Link href="/signup">
            <button className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700">
              Sign Up
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
```

## Step 13: Add Environment Variables

Create `.env.local` in the frontend directory:

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## Step 14: Run and Test

1. Start the backend server:

```bash
cd backend
npm start
```

2. Start the frontend development server:

```bash
cd frontend
npm run dev
```

3. Test the authentication flow:
   - Visit `http://localhost:3000`
   - Click "Sign Up" and create a new account
   - Upload an avatar image (required)
   - After signup, you should be redirected to the dashboard
   - Click "Logout" to test logout functionality
   - Try logging in with the created account

## Step 15: Verification

1. **Signup Verification**:
   - Check that user data is saved in the backend database
   - Verify that avatar images are uploaded to Cloudinary
   - Ensure JWT tokens are generated and stored

2. **Login Verification**:
   - Check browser cookies for `accessToken` and `refreshToken`
   - Verify that `localStorage` contains the access token
   - Confirm user data is displayed correctly on the dashboard

3. **Logout Verification**:
   - Check that cookies are cleared
   - Verify that `localStorage` access token is removed
   - Confirm that refresh token is nullified in the database
   - Test that protected routes redirect to login

4. **API Testing**:
   - Use tools like Postman to test the backend endpoints directly
   - Verify CORS settings allow frontend requests
   - Check rate limiting is working

5. **Error Handling**:
   - Test invalid login credentials
   - Try signup with existing email/username
   - Verify file upload validation

## Additional Notes

- Ensure the backend is running on `http://localhost:8000`
- Update the API URL in `.env.local` if your backend runs on a different port
- The frontend uses Tailwind CSS for styling - customize as needed
- Add proper error boundaries and loading states for production
- Implement password strength validation and email verification for enhanced security</content>
  <parameter name="filePath">c:\Users\anasa\hackthon\AUTH_IMPLEMENTATION.md
