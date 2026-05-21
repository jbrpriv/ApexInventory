import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
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
      {/*
        No inline paddingTop here — mobile.css controls it via the `main` selector:
          ≥768px (desktop): padding-top is set by the .top-nav being fixed at var(--nav-h)
                            We add it back via the style tag below only on desktop.
          <768px (mobile):  mobile.css sets padding-top: 0 and padding-bottom for bottom tab bar.
        We use a <style> tag to set desktop padding without an inline style that would
        override the mobile.css media query rule.
      */}
      <style>{`
        @media (min-width: 768px) {
          #main-content { padding-top: var(--nav-h); }
        }
      `}</style>
      <main id="main-content" style={{ position: 'relative' }}>
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
    <Suspense fallback={<LoadingScreen />}>
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
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" toastOptions={{
            style: {
              background: 'var(--surface)', color: 'var(--text)',
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
    </ThemeProvider>
  );
}