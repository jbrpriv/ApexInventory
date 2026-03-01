import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoadingScreen from './components/LoadingScreen';

// Lazy load pages for better perf
const LoginPage    = lazy(() => import('./pages/LoginPage'));
const HomePage     = lazy(() => import('./pages/HomePage'));
const AccountsPage = lazy(() => import('./pages/AccountsPage'));
const StatsPage    = lazy(() => import('./pages/StatsPage'));
const ExportPage   = lazy(() => import('./pages/ExportPage'));
const AboutPage    = lazy(() => import('./pages/AboutPage'));
const ProfilePage  = lazy(() => import('./pages/ProfilePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function ProtectedLayout() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <main style={{ paddingTop: 'var(--nav-h)' }}>
        <Outlet />
      </main>
    </div>
  );
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/" replace /> : children;
}

function AppRoutes() {
  return (
    <Suspense fallback={<div style={{ paddingTop: 'var(--nav-h)' }}><LoadingScreen /></div>}>
      <Routes>
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route element={<ProtectedLayout />}>
          <Route path="/"         element={<HomePage />} />
          <Route path="/accounts" element={<AccountsPage />} />
          <Route path="/stats"    element={<StatsPage />} />
          <Route path="/export"   element={<ExportPage />} />
          <Route path="/about"    element={<AboutPage />} />
          <Route path="/profile"  element={<ProfilePage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#12122e',
              color: '#f1f5f9',
              border: '1px solid rgba(139,92,246,0.3)',
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 14,
              borderRadius: 10,
            },
            success: { iconTheme: { primary: '#34d399', secondary: '#07071a' } },
            error:   { iconTheme: { primary: '#f43f5e', secondary: '#07071a' } },
          }}
        />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
