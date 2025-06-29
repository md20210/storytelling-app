// frontend/src/pages/ChapterEditor.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
    Save, 
    ArrowLeft, 
    Sparkles, 
    Plus, 
    RefreshCw, 
    Eye, 
    EyeOff, 
    FileText, 
    BarChart3, 
    Clock,
    Lightbulb,
    MessageSquare,
    CheckCircle,
    AlertCircle,
    Mic,
    Square
} from 'lucide-react';
import LoadingSpinner from '../components/UI/LoadingSpinner.jsx';
import toast from 'react-hot-toast';

const ChapterEditor = () => {
    const { bookId, chapterId } = useParams();
    const navigate = useNavigate();
    const contentRef = useRef(null);
    
    // State
    const [chapter, setChapter] = useState(null);
    const [book, setBook] = useState(null);
    const [content, setContent] = useState('');
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [aiProcessing, setAiProcessing] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [wordCount, setWordCount] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    
    // AI Panel State
    const [showAiPanel, setShowAiPanel] = useState(false);
    const [aiMode, setAiMode] = useState('enhance'); // enhance, integrate, summarize, generate
    const [newThought, setNewThought] = useState('');
    const [aiSuggestions, setAiSuggestions] = useState([]);
    
    // Auto-save state
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const autoSaveTimer = useRef(null);

    useEffect(() => {
        fetchChapter();
        return () => {
            if (autoSaveTimer.current) {
                clearTimeout(autoSaveTimer.current);
            }
        };
    }, [bookId, chapterId]);

    useEffect(() => {
        // Calculate word count
        const words = content.trim().split(/\s+/).filter(word => word.length > 0).length;
        setWordCount(words);
        
        // Set unsaved changes flag
        setHasUnsavedChanges(true);
        
        // Auto-save after 3 seconds of inactivity
        if (autoSaveTimer.current) {
            clearTimeout(autoSaveTimer.current);
        }
        autoSaveTimer.current = setTimeout(() => {
            handleAutoSave();
        }, 3000);
    }, [content, title]);

    const fetchChapter = async () => {
        try {
            setLoading(true);
            // Simulate API call - replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Mock data - replace with real API call
            const mockChapter = {
                id: chapterId,
                bookId: bookId,
                chapterNumber: 1,
                title: 'The Beginning',
                content: `Once upon a time, in a land far away, there lived a young writer who dreamed of creating stories that would touch people's hearts.

The journey was not easy. Every day brought new challenges, new words to find, and new emotions to express. But with each sentence written, the dream became more real.

This is where our story begins...`,
                wordCount: 156,
                status: 'draft',
                grokEnhanced: false,
                grokSuggestions: []
            };

            const mockBook = {
                id: bookId,
                title: 'My Adventure Story',
                genre: 'adventure',
                language: 'en'
            };

            setChapter(mockChapter);
            setBook(mockBook);
            setTitle(mockChapter.title);
            setContent(mockChapter.content);
            setHasUnsavedChanges(false);
        } catch (error) {
            console.error('Failed to fetch chapter:', error);
            toast.error('Failed to load chapter');
        } finally {
            setLoading(false);
        }
    };

    const handleAutoSave = async () => {
        if (!hasUnsavedChanges) return;
        
        try {
            // Simulate auto-save API call
            console.log('Auto-saving chapter...');
            setHasUnsavedChanges(false);
        } catch (error) {
            console.error('Auto-save failed:', error);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            // Simulate save API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setHasUnsavedChanges(false);
            toast.success('Chapter saved successfully!');
        } catch (error) {
            console.error('Save failed:', error);
            toast.error('Failed to save chapter');
        } finally {
            setSaving(false);
        }
    };

    // AI Functions - Your Project's Core Features!
    const handleGrokEnhance = async () => {
        if (!content.trim()) {
            toast.error('Please add some content before enhancing');
            return;
        }

        try {
            setAiProcessing(true);
            // Simulate Grok API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Mock enhanced content
            const enhancedContent = content + `

[AI Enhanced Addition]
The morning sun cast long shadows across the cobblestone path, each ray of light seeming to whisper promises of adventure. The air was crisp with possibility, and every breath felt like inhaling pure inspiration.`;

            setContent(enhancedContent);
            toast.success('Content enhanced with Grok AI!');
            
            // Add suggestion
            setAiSuggestions(prev => [...prev, {
                type: 'enhancement',
                message: 'Added descriptive details and atmospheric elements',
                timestamp: new Date().toISOString()
            }]);
        } catch (error) {
            console.error('Enhancement failed:', error);
            toast.error('Failed to enhance content');
        } finally {
            setAiProcessing(false);
        }
    };

    const handleIntegrateThought = async () => {
        if (!newThought.trim()) {
            toast.error('Please enter a thought to integrate');
            return;
        }

        try {
            setAiProcessing(true);
            // Simulate Grok API integration
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Mock integration - add thought naturally into content
            const integratedContent = content + `

${newThought.trim()}

The new realization changed everything. It was as if a door had opened to possibilities that were always there, waiting to be discovered.`;

            setContent(integratedContent);
            setNewThought('');
            toast.success('Thought integrated successfully!');
            
            setAiSuggestions(prev => [...prev, {
                type: 'integration',
                message: `Integrated: "${newThought.trim().substring(0, 50)}..."`,
                timestamp: new Date().toISOString()
            }]);
        } catch (error) {
            console.error('Integration failed:', error);
            toast.error('Failed to integrate thought');
        } finally {
            setAiProcessing(false);
        }
    };

    const handleGenerateSummary = async () => {
        if (!content.trim()) {
            toast.error('Please add content before generating summary');
            return;
        }

        try {
            setAiProcessing(true);
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Mock summary
            const summary = "This chapter introduces the protagonist's journey and sets the stage for the adventure ahead. Key themes include determination, creativity, and the power of storytelling.";
            
            toast.success('Summary generated successfully!');
            setAiSuggestions(prev => [...prev, {
                type: 'summary',
                message: summary,
                timestamp: new Date().toISOString()
            }]);
        } catch (error) {
            console.error('Summary generation failed:', error);
            toast.error('Failed to generate summary');
        } finally {
            setAiProcessing(false);
        }
    };

    // Voice Recording Simulation (Phase 2 feature)
    const handleVoiceRecording = () => {
        if (isRecording) {
            setIsRecording(false);
            toast.success('Voice recording stopped');
            // In Phase 2: Process voice to text and integrate
        } else {
            setIsRecording(true);
            toast.success('Voice recording started');
            // In Phase 2: Start voice recognition
        }
    };

    const getReadingTime = () => {
        return Math.ceil(wordCount / 200); // 200 words per minute
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
            <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <Link
                                to={`/books/${bookId}`}
                                className="flex items-center text-gray-600 hover:text-gray-900"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to {book?.title}
                            </Link>
                            <div className="hidden sm:block text-gray-300">|</div>
                            <h1 className="text-lg font-semibold text-gray-900 truncate">
                                Chapter {chapter?.chapterNumber}: {title}
                            </h1>
                            {hasUnsavedChanges && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Unsaved
                                </span>
                            )}
                        </div>

                        <div className="flex items-center space-x-3">
                            {/* Stats */}
                            <div className="hidden sm:flex items-center space-x-4 text-sm text-gray-500">
                                <div className="flex items-center">
                                    <FileText className="h-4 w-4 mr-1" />
                                    {wordCount} words
                                </div>
                                <div className="flex items-center">
                                    <Clock className="h-4 w-4 mr-1" />
                                    {getReadingTime()} min read
                                </div>
                            </div>

                            {/* Actions */}
                            <button
                                onClick={() => setShowPreview(!showPreview)}
                                className="btn btn-ghost btn-sm"
                            >
                                {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                            
                            <button
                                onClick={() => setShowAiPanel(!showAiPanel)}
                                className="btn btn-secondary btn-sm"
                            >
                                <Sparkles className="h-4 w-4 mr-2" />
                                AI Assistant
                            </button>

                            <button
                                onClick={handleSave}
                                disabled={saving || !hasUnsavedChanges}
                                className="btn btn-primary btn-sm"
                            >
                                {saving ? <LoadingSpinner size="xs" /> : <Save className="h-4 w-4 mr-2" />}
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Main Editor */}
                    <div className={`${showAiPanel ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            {/* Chapter Title */}
                            <div className="p-6 border-b border-gray-200">
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Chapter title..."
                                    className="text-2xl font-bold text-gray-900 bg-transparent border-none outline-none w-full placeholder-gray-400"
                                />
                            </div>

                            {/* Content Editor */}
                            <div className="p-6">
                                {showPreview ? (
                                    <div className="prose max-w-none">
                                        <h2>{title}</h2>
                                        <div className="whitespace-pre-wrap">{content}</div>
                                    </div>
                                ) : (
                                    <textarea
                                        ref={contentRef}
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="Start writing your chapter here..."
                                        className="chapter-editor w-full h-96 border-none outline-none resize-none"
                                    />
                                )}
                            </div>

                            {/* Voice Recording (Phase 2 Preview) */}
                            <div className="px-6 pb-6">
                                <div className="flex items-center space-x-4">
                                    <button
                                        onClick={handleVoiceRecording}
                                        className={`btn btn-sm ${isRecording ? 'btn-danger' : 'btn-ghost'}`}
                                        title="Voice input (Phase 2 feature)"
                                    >
                                        {isRecording ? <Square className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
                                        {isRecording ? 'Stop Recording' : 'Voice Input'}
                                    </button>
                                    {isRecording && (
                                        <span className="text-sm text-red-600 animate-pulse">
                                            🔴 Recording... (Phase 2 feature)
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* AI Assistant Panel */}
                    {showAiPanel && (
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-24">
                                <div className="p-4 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                        <Sparkles className="h-5 w-5 mr-2 text-blue-600" />
                                        Grok AI Assistant
                                    </h3>
                                </div>

                                <div className="p-4">
                                    {/* AI Mode Selector */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            AI Action
                                        </label>
                                        <select
                                            value={aiMode}
                                            onChange={(e) => setAiMode(e.target.value)}
                                            className="input text-sm"
                                        >
                                            <option value="enhance">Enhance Content</option>
                                            <option value="integrate">Integrate Thought</option>
                                            <option value="summarize">Generate Summary</option>
                                            <option value="generate">Generate Content</option>
                                        </select>
                                    </div>

                                    {/* AI Actions */}
                                    <div className="space-y-3">
                                        {aiMode === 'enhance' && (
                                            <button
                                                onClick={handleGrokEnhance}
                                                disabled={aiProcessing}
                                                className="btn btn-primary btn-sm w-full"
                                            >
                                                {aiProcessing ? <LoadingSpinner size="xs" /> : <Sparkles className="h-4 w-4 mr-2" />}
                                                Enhance with Grok
                                            </button>
                                        )}

                                        {aiMode === 'integrate' && (
                                            <div className="space-y-3">
                                                <textarea
                                                    value={newThought}
                                                    onChange={(e) => setNewThought(e.target.value)}
                                                    placeholder="Enter your new thought or idea..."
                                                    className="input text-sm h-20 resize-none"
                                                />
                                                <button
                                                    onClick={handleIntegrateThought}
                                                    disabled={aiProcessing || !newThought.trim()}
                                                    className="btn btn-primary btn-sm w-full"
                                                >
                                                    {aiProcessing ? <LoadingSpinner size="xs" /> : <Plus className="h-4 w-4 mr-2" />}
                                                    Integrate Thought
                                                </button>
                                            </div>
                                        )}

                                        {aiMode === 'summarize' && (
                                            <button
                                                onClick={handleGenerateSummary}
                                                disabled={aiProcessing}
                                                className="btn btn-primary btn-sm w-full"
                                            >
                                                {aiProcessing ? <LoadingSpinner size="xs" /> : <FileText className="h-4 w-4 mr-2" />}
                                                Generate Summary
                                            </button>
                                        )}
                                    </div>

                                    {/* AI Suggestions */}
                                    {aiSuggestions.length > 0 && (
                                        <div className="mt-6">
                                            <h4 className="text-sm font-medium text-gray-700 mb-3">Recent AI Actions</h4>
                                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                                {aiSuggestions.slice(-5).reverse().map((suggestion, index) => (
                                                    <div key={index} className="p-2 bg-gray-50 rounded text-xs">
                                                        <div className="flex items-center space-x-2 mb-1">
                                                            <CheckCircle className="h-3 w-3 text-green-600" />
                                                            <span className="font-medium capitalize">{suggestion.type}</span>
                                                        </div>
                                                        <p className="text-gray-600">{suggestion.message}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* AI Status */}
                                    <div className="mt-6 p-3 bg-blue-50 rounded-lg">
                                        <div className="flex items-center space-x-2">
                                            <Lightbulb className="h-4 w-4 text-blue-600" />
                                            <span className="text-sm font-medium text-blue-900">AI Tips</span>
                                        </div>
                                        <p className="text-xs text-blue-700 mt-1">
                                            Try "Integrate Thought" to add new ideas seamlessly, or "Enhance" to improve your existing content with Grok AI.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChapterEditor;