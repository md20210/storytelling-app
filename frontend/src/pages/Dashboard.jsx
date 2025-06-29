// frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { 
    BookOpen, 
    Plus, 
    TrendingUp, 
    Clock, 
    Edit3, 
    Eye, 
    BarChart3,
    Sparkles,
    Calendar,
    Target
} from 'lucide-react';
import LoadingSpinner from '../components/UI/LoadingSpinner.jsx';

const Dashboard = () => {
    const { user, getUserDisplayName } = useAuth();
    const [stats, setStats] = useState({
        totalBooks: 0,
        totalChapters: 0,
        totalWords: 0,
        recentActivity: []
    });
    const [recentBooks, setRecentBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            // Simulate API calls - replace with actual API calls
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Mock data - replace with real API calls
            setStats({
                totalBooks: 5,
                totalChapters: 23,
                totalWords: 15420,
                recentActivity: [
                    { type: 'chapter', title: 'Chapter 3: The Journey Begins', time: '2 hours ago' },
                    { type: 'book', title: 'My Adventure Story', time: '1 day ago' },
                    { type: 'ai', title: 'Used Grok to enhance Chapter 2', time: '2 days ago' }
                ]
            });

            setRecentBooks([
                {
                    id: '1',
                    title: 'My Adventure Story',
                    description: 'A thrilling tale of discovery and growth',
                    chapters: 8,
                    words: 6420,
                    status: 'in_progress',
                    updatedAt: '2024-01-15'
                },
                {
                    id: '2',
                    title: 'Digital Dreams',
                    description: 'Science fiction meets reality',
                    chapters: 5,
                    words: 4200,
                    status: 'draft',
                    updatedAt: '2024-01-14'
                },
                {
                    id: '3',
                    title: 'Memories of Tomorrow',
                    description: 'A philosophical journey through time',
                    chapters: 10,
                    words: 4800,
                    status: 'completed',
                    updatedAt: '2024-01-13'
                }
            ]);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'in_progress': return 'bg-blue-100 text-blue-800';
            case 'draft': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'completed': return 'Completed';
            case 'in_progress': return 'In Progress';
            case 'draft': return 'Draft';
            default: return 'Unknown';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Welcome back, {getUserDisplayName()}!
                                </h1>
                                <p className="mt-1 text-sm text-gray-600">
                                    Ready to continue your storytelling journey?
                                </p>
                            </div>
                            <div className="flex space-x-3">
                                <Link
                                    to="/books"
                                    className="btn btn-secondary"
                                >
                                    <Eye className="h-4 w-4 mr-2" />
                                    View All Books
                                </Link>
                                <Link
                                    to="/books/new"
                                    className="btn btn-primary"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    New Book
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="card">
                        <div className="card-body">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <BookOpen className="h-8 w-8 text-blue-600" />
                                </div>
                                <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-500">Total Books</div>
                                    <div className="text-2xl font-bold text-gray-900">{stats.totalBooks}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-body">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <Edit3 className="h-8 w-8 text-green-600" />
                                </div>
                                <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-500">Total Chapters</div>
                                    <div className="text-2xl font-bold text-gray-900">{stats.totalChapters}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-body">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <BarChart3 className="h-8 w-8 text-purple-600" />
                                </div>
                                <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-500">Total Words</div>
                                    <div className="text-2xl font-bold text-gray-900">{stats.totalWords.toLocaleString()}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-body">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <Sparkles className="h-8 w-8 text-yellow-600" />
                                </div>
                                <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-500">AI Enhanced</div>
                                    <div className="text-2xl font-bold text-gray-900">12</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Books */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className="card">
                            <div className="card-header">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-medium text-gray-900">Recent Books</h3>
                                    <Link 
                                        to="/books" 
                                        className="text-sm text-blue-600 hover:text-blue-500"
                                    >
                                        View all
                                    </Link>
                                </div>
                            </div>
                            <div className="card-body p-0">
                                <div className="divide-y divide-gray-200">
                                    {recentBooks.map((book) => (
                                        <div key={book.id} className="p-6 hover:bg-gray-50 transition-colors duration-150">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3">
                                                        <h4 className="text-sm font-medium text-gray-900">
                                                            <Link 
                                                                to={`/books/${book.id}`}
                                                                className="hover:text-blue-600"
                                                            >
                                                                {book.title}
                                                            </Link>
                                                        </h4>
                                                        <span className={`badge ${getStatusColor(book.status)}`}>
                                                            {getStatusText(book.status)}
                                                        </span>
                                                    </div>
                                                    <p className="mt-1 text-sm text-gray-600">{book.description}</p>
                                                    <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                                                        <span>{book.chapters} chapters</span>
                                                        <span>{book.words.toLocaleString()} words</span>
                                                        <span>Updated {new Date(book.updatedAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Link
                                                        to={`/books/${book.id}`}
                                                        className="btn btn-ghost btn-sm"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                    <Link
                                                        to={`/books/${book.id}/chapters/1`}
                                                        className="btn btn-ghost btn-sm"
                                                    >
                                                        <Edit3 className="h-4 w-4" />
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Quick Actions */}
                        <div className="card">
                            <div className="card-header">
                                <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
                            </div>
                            <div className="card-body space-y-3">
                                <Link
                                    to="/books/new"
                                    className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-150"
                                >
                                    <Plus className="h-5 w-5 text-blue-600 mr-3" />
                                    <span className="text-sm font-medium">Create New Book</span>
                                </Link>
                                <Link
                                    to="/books"
                                    className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-150"
                                >
                                    <BookOpen className="h-5 w-5 text-green-600 mr-3" />
                                    <span className="text-sm font-medium">Browse Books</span>
                                </Link>
                                <button className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-150 w-full text-left">
                                    <Sparkles className="h-5 w-5 text-yellow-600 mr-3" />
                                    <span className="text-sm font-medium">AI Writing Assistant</span>
                                </button>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="card">
                            <div className="card-header">
                                <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                            </div>
                            <div className="card-body p-0">
                                <div className="divide-y divide-gray-200">
                                    {stats.recentActivity.map((activity, index) => (
                                        <div key={index} className="p-4">
                                            <div className="flex items-start space-x-3">
                                                <div className="flex-shrink-0">
                                                    {activity.type === 'chapter' && <Edit3 className="h-4 w-4 text-blue-600" />}
                                                    {activity.type === 'book' && <BookOpen className="h-4 w-4 text-green-600" />}
                                                    {activity.type === 'ai' && <Sparkles className="h-4 w-4 text-yellow-600" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-gray-900">{activity.title}</p>
                                                    <p className="text-xs text-gray-500">{activity.time}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI Suggestions Banner */}
                <div className="mt-8">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <Sparkles className="h-8 w-8" />
                                <div>
                                    <h3 className="text-lg font-semibold">AI Writing Assistant</h3>
                                    <p className="text-blue-100">Get help with your stories using Grok AI</p>
                                </div>
                            </div>
                            <button className="bg-white text-blue-600 px-4 py-2 rounded-md font-medium hover:bg-blue-50 transition-colors duration-150">
                                Try AI Features
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;