// frontend/src/pages/Books.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    Plus, 
    Search, 
    Filter, 
    BookOpen, 
    Edit3, 
    Trash2, 
    Eye,
    MoreVertical,
    Calendar,
    FileText,
    BarChart3
} from 'lucide-react';
import LoadingSpinner from '../components/UI/LoadingSpinner.jsx';

const Books = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [sortBy, setSortBy] = useState('updated');

    useEffect(() => {
        fetchBooks();
    }, [selectedStatus, sortBy]);

    const fetchBooks = async () => {
        try {
            setLoading(true);
            // Simulate API call - replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Mock data - replace with real API call
            const mockBooks = [
                {
                    id: '1',
                    title: 'My Adventure Story',
                    description: 'A thrilling tale of discovery and personal growth through unexpected challenges.',
                    genre: 'adventure',
                    language: 'en',
                    status: 'in_progress',
                    totalChapters: 8,
                    totalWords: 6420,
                    isPublic: false,
                    grokEnhanced: true,
                    createdAt: '2024-01-10T10:00:00Z',
                    updatedAt: '2024-01-15T14:30:00Z'
                },
                {
                    id: '2',
                    title: 'Digital Dreams',
                    description: 'A science fiction story where technology meets human emotion.',
                    genre: 'science-fiction',
                    language: 'en',
                    status: 'draft',
                    totalChapters: 5,
                    totalWords: 4200,
                    isPublic: false,
                    grokEnhanced: false,
                    createdAt: '2024-01-08T09:00:00Z',
                    updatedAt: '2024-01-14T16:45:00Z'
                },
                {
                    id: '3',
                    title: 'Memories of Tomorrow',
                    description: 'A philosophical journey through time and consciousness.',
                    genre: 'fiction',
                    language: 'en',
                    status: 'completed',
                    totalChapters: 12,
                    totalWords: 8900,
                    isPublic: true,
                    grokEnhanced: true,
                    createdAt: '2024-01-05T11:00:00Z',
                    updatedAt: '2024-01-13T12:20:00Z'
                },
                {
                    id: '4',
                    title: 'The Coding Chronicles',
                    description: 'A programmer\'s journey through the world of artificial intelligence.',
                    genre: 'non-fiction',
                    language: 'en',
                    status: 'in_progress',
                    totalChapters: 6,
                    totalWords: 5600,
                    isPublic: false,
                    grokEnhanced: true,
                    createdAt: '2024-01-12T08:00:00Z',
                    updatedAt: '2024-01-16T10:15:00Z'
                }
            ];
            
            setBooks(mockBooks);
        } catch (error) {
            console.error('Failed to fetch books:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'in_progress': return 'bg-blue-100 text-blue-800';
            case 'draft': return 'bg-gray-100 text-gray-800';
            case 'published': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'completed': return 'Completed';
            case 'in_progress': return 'In Progress';
            case 'draft': return 'Draft';
            case 'published': return 'Published';
            default: return 'Unknown';
        }
    };

    const filteredBooks = books.filter(book => {
        const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            book.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = selectedStatus === 'all' || book.status === selectedStatus;
        return matchesSearch && matchesStatus;
    });

    const sortedBooks = [...filteredBooks].sort((a, b) => {
        switch (sortBy) {
            case 'title':
                return a.title.localeCompare(b.title);
            case 'created':
                return new Date(b.createdAt) - new Date(a.createdAt);
            case 'updated':
                return new Date(b.updatedAt) - new Date(a.updatedAt);
            case 'words':
                return b.totalWords - a.totalWords;
            default:
                return new Date(b.updatedAt) - new Date(a.updatedAt);
        }
    });

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
                                <h1 className="text-2xl font-bold text-gray-900">My Books</h1>
                                <p className="mt-1 text-sm text-gray-600">
                                    Manage your stories and continue your writing journey
                                </p>
                            </div>
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

            {/* Filters and Search */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <input
                                    type="text"
                                    placeholder="Search books..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 input"
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div className="sm:w-48">
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="input"
                            >
                                <option value="all">All Status</option>
                                <option value="draft">Draft</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="published">Published</option>
                            </select>
                        </div>

                        {/* Sort */}
                        <div className="sm:w-48">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="input"
                            >
                                <option value="updated">Last Updated</option>
                                <option value="created">Date Created</option>
                                <option value="title">Title</option>
                                <option value="words">Word Count</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Books Grid */}
                {sortedBooks.length === 0 ? (
                    <div className="text-center py-12">
                        <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No books found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {searchTerm || selectedStatus !== 'all' 
                                ? 'Try adjusting your search or filters.'
                                : 'Get started by creating your first book.'
                            }
                        </p>
                        {!searchTerm && selectedStatus === 'all' && (
                            <div className="mt-6">
                                <Link
                                    to="/books/new"
                                    className="btn btn-primary"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create your first book
                                </Link>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sortedBooks.map((book) => (
                            <div key={book.id} className="book-card">
                                <div className="card-body">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                                <Link 
                                                    to={`/books/${book.id}`}
                                                    className="hover:text-blue-600 transition-colors duration-150"
                                                >
                                                    {book.title}
                                                </Link>
                                            </h3>
                                            <div className="flex items-center space-x-2">
                                                <span className={`badge ${getStatusColor(book.status)}`}>
                                                    {getStatusText(book.status)}
                                                </span>
                                                {book.grokEnhanced && (
                                                    <span className="badge bg-yellow-100 text-yellow-800">
                                                        AI Enhanced
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <button className="p-1 rounded-full hover:bg-gray-100">
                                                <MoreVertical className="h-4 w-4 text-gray-400" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                        {book.description}
                                    </p>

                                    {/* Stats */}
                                    <div className="grid grid-cols-2 gap-4 mb-4 text-xs text-gray-500">
                                        <div className="flex items-center">
                                            <FileText className="h-3 w-3 mr-1" />
                                            {book.totalChapters} chapters
                                        </div>
                                        <div className="flex items-center">
                                            <BarChart3 className="h-3 w-3 mr-1" />
                                            {book.totalWords.toLocaleString()} words
                                        </div>
                                        <div className="flex items-center col-span-2">
                                            <Calendar className="h-3 w-3 mr-1" />
                                            Updated {new Date(book.updatedAt).toLocaleDateString()}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                        <div className="flex space-x-2">
                                            <Link
                                                to={`/books/${book.id}`}
                                                className="btn btn-ghost btn-sm"
                                                title="View book"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                            <Link
                                                to={`/books/${book.id}/edit`}
                                                className="btn btn-ghost btn-sm"
                                                title="Edit book"
                                            >
                                                <Edit3 className="h-4 w-4" />
                                            </Link>
                                            <button
                                                className="btn btn-ghost btn-sm text-red-600 hover:text-red-700"
                                                title="Delete book"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <span className="text-xs text-gray-400 capitalize">
                                            {book.genre?.replace('-', ' ')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Books;