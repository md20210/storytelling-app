// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';

// Context
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import BookDetail from './pages/BookDetail';
import ChapterEditor from './pages/ChapterEditor';

// Components
import Layout from './components/Layout/Layout';
import LoadingSpinner from './components/UI/LoadingSpinner';

// Styles
import './styles/globals.css';

// Create a query client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <Layout>{children}</Layout>;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <Router>
                    <div className="App">
                        <Routes>
                            {/* Public Routes */}
                            <Route
                                path="/login"
                                element={
                                    <PublicRoute>
                                        <Login />
                                    </PublicRoute>
                                }
                            />
                            <Route
                                path="/register"
                                element={
                                    <PublicRoute>
                                        <Register />
                                    </PublicRoute>
                                }
                            />

                            {/* Protected Routes */}
                            <Route
                                path="/dashboard"
                                element={
                                    <ProtectedRoute>
                                        <Dashboard />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/books"
                                element={
                                    <ProtectedRoute>
                                        <Books />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/books/:bookId"
                                element={
                                    <ProtectedRoute>
                                        <BookDetail />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/books/:bookId/chapters/:chapterId"
                                element={
                                    <ProtectedRoute>
                                        <ChapterEditor />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Redirect root to dashboard */}
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />

                            {/* 404 Route */}
                            <Route
                                path="*"
                                element={
                                    <div className="min-h-screen flex items-center justify-center">
                                        <div className="text-center">
                                            <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                                            <p className="text-gray-600 mb-8">Page not found</p>
                                            <a
                                                href="/dashboard"
                                                className="text-blue-600 hover:text-blue-800 underline"
                                            >
                                                Go to Dashboard
                                            </a>
                                        </div>
                                    </div>
                                }
                            />
                        </Routes>

                        {/* Global Toast Notifications */}
                        <Toaster
                            position="top-right"
                            toastOptions={{
                                duration: 4000,
                                style: {
                                    background: '#363636',
                                    color: '#fff',
                                },
                                success: {
                                    duration: 3000,
                                    style: {
                                        background: '#10B981',
                                    },
                                },
                                error: {
                                    duration: 5000,
                                    style: {
                                        background: '#EF4444',
                                    },
                                },
                            }}
                        />
                    </div>
                </Router>
            </AuthProvider>
        </QueryClientProvider>
    );
}

export default App;