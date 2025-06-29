// frontend/src/components/Layout/Layout.jsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { 
    BookOpen, 
    Home, 
    PlusCircle, 
    Settings, 
    LogOut, 
    Menu, 
    X,
    User,
    Sparkles,
    BarChart3
} from 'lucide-react';

const Layout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout, getUserDisplayName } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: Home },
        { name: 'My Books', href: '/books', icon: BookOpen },
        { name: 'New Book', href: '/books/new', icon: PlusCircle },
        { name: 'AI Assistant', href: '/ai', icon: Sparkles },
        { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActivePath = (path) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
                </div>
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
                        <Link to="/dashboard" className="flex items-center space-x-2">
                            <BookOpen className="h-8 w-8 text-blue-600" />
                            <span className="text-xl font-bold text-gray-900">Storytelling</span>
                        </Link>
                        <button
                            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-2">
                        {navigation.map((item) => {
                            const IconComponent = item.icon;
                            const isActive = isActivePath(item.href);
                            
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                                        isActive
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                    }`}
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <IconComponent className={`mr-3 h-5 w-5 ${
                                        isActive ? 'text-blue-700' : 'text-gray-400'
                                    }`} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Profile */}
                    <div className="border-t border-gray-200 p-4">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                                    <User className="h-6 w-6 text-white" />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {getUserDisplayName()}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    {user?.email}
                                </p>
                            </div>
                        </div>
                        
                        <div className="space-y-1">
                            <Link
                                to="/profile"
                                className="flex items-center px-3 py-2 text-sm text-gray-600 rounded-md hover:text-gray-900 hover:bg-gray-100 transition-colors duration-150"
                                onClick={() => setSidebarOpen(false)}
                            >
                                <Settings className="mr-3 h-4 w-4" />
                                Settings
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="flex items-center w-full px-3 py-2 text-sm text-gray-600 rounded-md hover:text-gray-900 hover:bg-gray-100 transition-colors duration-150"
                            >
                                <LogOut className="mr-3 h-4 w-4" />
                                Sign out
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="lg:pl-64">
                {/* Top bar */}
                <div className="sticky top-0 z-10 flex h-16 bg-white shadow-sm border-b border-gray-200 lg:hidden">
                    <button
                        className="px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    <div className="flex-1 flex items-center justify-between px-4">
                        <Link to="/dashboard" className="flex items-center space-x-2">
                            <BookOpen className="h-6 w-6 text-blue-600" />
                            <span className="text-lg font-semibold text-gray-900">Storytelling</span>
                        </Link>
                    </div>
                </div>

                {/* Page content */}
                <main className="flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;