import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoadingScreen from './components/LoadingScreen';
import ParticleBackground from './components/ParticleBackground';

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
    <div style={{ minHeight: '100vh', background: 'var(--bg)', position: 'relative' }}>
      <ParticleBackground />
      <Navbar />
      <main style={{ paddingTop: 'var(--nav-h)', position: 'relative', zIndex: 1 }}>
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
        <Toaster position="top-right" toastOptions={{
          style: {
            background: 'white', color: 'var(--text)',
            border: '1px solid var(--border)',
            fontFamily: "'Inter', sans-serif",
            fontSize: 13.5, borderRadius: 10,
            boxShadow: 'var(--sh-md)',
          },
          success: { iconTheme: { primary: '#059669', secondary: 'white' } },
          error:   { iconTheme: { primary: '#E11D48', secondary: 'white' } },
        }} />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
