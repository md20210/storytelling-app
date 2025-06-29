// backend/src/controllers/grokController.js
const grokService = require('../services/grokService');

// Test Grok API connection
const testConnection = async (req, res) => {
    try {
        const result = await grokService.testConnection();

        if (result.success) {
            console.log('✅ Grok API connection test successful');
            res.json({
                success: true,
                message: 'Grok API connection successful',
                data: {
                    response: result.message,
                    model: result.model,
                    timestamp: result.timestamp,
                    available: true
                }
            });
        } else {
            console.log('❌ Grok API connection test failed');
            res.status(503).json({
                success: false,
                message: 'Grok API connection failed',
                error: result.error,
                data: {
                    available: false,
                    timestamp: result.timestamp
                }
            });
        }

    } catch (error) {
        console.error('❌ Grok connection test error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to test Grok API connection',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            data: {
                available: false
            }
        });
    }
};

// Generate creative content
const generateContent = async (req, res) => {
    try {
        const { prompt, type = 'general', language = 'en', maxTokens, temperature } = req.body;

        if (!prompt || prompt.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Prompt is required'
            });
        }

        if (!grokService.isAvailable()) {
            return res.status(503).json({
                success: false,
                message: 'Grok AI service is not available'
            });
        }

        // Set up context based on type
        const context = {
            language,
            type,
            ...(maxTokens && { maxTokens }),
            ...(temperature && { temperature })
        };

        let result;

        switch (type) {
            case 'chapter':
                // Generate chapter content
                const { title, outline } = req.body;
                if (!title) {
                    return res.status(400).json({
                        success: false,
                        message: 'Chapter title is required for chapter generation'
                    });
                }
                result = await grokService.generateChapter(title, outline || prompt, context);
                break;

            case 'summary':
                // Generate summary
                result = await grokService.generateChapterSummary(prompt, context);
                break;

            case 'enhancement':
                // Enhance existing content
                const { title: enhanceTitle } = req.body;
                result = await grokService.enhanceChapterContent(
                    enhanceTitle || 'Content Enhancement', 
                    prompt, 
                    context
                );
                break;

            case 'integration':
                // Integrate new thought
                const { currentContent, newThought } = req.body;
                if (!currentContent || !newThought) {
                    return res.status(400).json({
                        success: false,
                        message: 'Current content and new thought are required for integration'
                    });
                }
                result = await grokService.integrateNewThought(currentContent, newThought, context);
                break;

            case 'analysis':
                // Analyze writing
                result = await grokService.analyzeWriting(prompt, context);
                break;

            default:
                // General content generation
                result = await grokService.generateChapter('Generated Content', prompt, context);
                break;
        }

        console.log(`✅ Generated ${type} content using Grok AI`);

        res.json({
            success: true,
            message: `${type} content generated successfully`,
            data: {
                content: result,
                metadata: {
                    type,
                    language,
                    promptLength: prompt.length,
                    timestamp: new Date().toISOString()
                }
            }
        });

    } catch (error) {
        console.error('❌ Generate content error:', error);

        if (error.message.includes('Grok API')) {
            return res.status(503).json({
                success: false,
                message: 'AI service error',
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to generate content',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Chat with Grok (general purpose)
const chat = async (req, res) => {
    try {
        const { message, language = 'en', context } = req.body;

        if (!message || message.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Message is required'
            });
        }

        if (!grokService.isAvailable()) {
            return res.status(503).json({
                success: false,
                message: 'Grok AI service is not available'
            });
        }

        // Use the general chat functionality
        const systemPrompt = language === 'de' ? 
            'Du bist Grok, ein hilfreicher KI-Assistent für kreatives Schreiben und Geschichtenerzählen. Antworte auf Deutsch.' :
            language === 'es' ?
            'Eres Grok, un asistente de IA útil para escritura creativa y narración. Responde en español.' :
            'You are Grok, a helpful AI assistant for creative writing and storytelling. Respond in English.';

        const messages = [
            { role: 'system', content: systemPrompt }
        ];

        // Add context if provided
        if (context) {
            messages.push({ role: 'assistant', content: `Context: ${context}` });
        }

        messages.push({ role: 'user', content: message });

        const response = await grokService._callGrokAPI(messages);

        console.log('✅ Grok chat response generated');

        res.json({
            success: true,
            message: 'Chat response generated successfully',
            data: {
                response,
                metadata: {
                    language,
                    messageLength: message.length,
                    responseLength: response.length,
                    timestamp: new Date().toISOString()
                }
            }
        });

    } catch (error) {
        console.error('❌ Grok chat error:', error);

        if (error.message.includes('Grok API')) {
            return res.status(503).json({
                success: false,
                message: 'AI service error',
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to generate chat response',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get Grok service status
const getStatus = async (req, res) => {
    try {
        const status = {
            available: grokService.isAvailable(),
            model: process.env.GROK_MODEL || 'grok-2-1212',
            maxTokens: parseInt(process.env.GROK_MAX_TOKENS) || 1000,
            temperature: parseFloat(process.env.GROK_TEMPERATURE) || 0.7,
            features: {
                enhanceContent: true,
                integrateThoughts: true,
                generateSummaries: true,
                generateChapters: true,
                analyzeWriting: true,
                chat: true
            },
            timestamp: new Date().toISOString()
        };

        if (!status.available) {
            return res.status(503).json({
                success: false,
                message: 'Grok AI service is not available',
                data: { status }
            });
        }

        res.json({
            success: true,
            message: 'Grok AI service is available',
            data: { status }
        });

    } catch (error) {
        console.error('❌ Get Grok status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get service status',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Batch process multiple requests
const batchProcess = async (req, res) => {
    try {
        const { requests } = req.body;

        if (!Array.isArray(requests) || requests.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Requests array is required and must not be empty'
            });
        }

        if (requests.length > 10) {
            return res.status(400).json({
                success: false,
                message: 'Maximum 10 requests allowed per batch'
            });
        }

        if (!grokService.isAvailable()) {
            return res.status(503).json({
                success: false,
                message: 'Grok AI service is not available'
            });
        }

        const results = [];
        const errors = [];

        for (let i = 0; i < requests.length; i++) {
            const request = requests[i];
            try {
                let result;

                switch (request.type) {
                    case 'enhance':
                        result = await grokService.enhanceChapterContent(
                            request.title || `Content ${i + 1}`,
                            request.content,
                            request.context || {}
                        );
                        break;
                    case 'summarize':
                        result = await grokService.generateChapterSummary(
                            request.content,
                            request.context || {}
                        );
                        break;
                    case 'integrate':
                        result = await grokService.integrateNewThought(
                            request.currentContent,
                            request.newThought,
                            request.context || {}
                        );
                        break;
                    default:
                        throw new Error(`Unsupported request type: ${request.type}`);
                }

                results.push({
                    index: i,
                    success: true,
                    data: result
                });

            } catch (error) {
                errors.push({
                    index: i,
                    error: error.message
                });
                results.push({
                    index: i,
                    success: false,
                    error: error.message
                });
            }
        }

        console.log(`✅ Processed batch of ${requests.length} requests (${errors.length} errors)`);

        res.json({
            success: true,
            message: `Batch processing completed`,
            data: {
                results,
                summary: {
                    total: requests.length,
                    successful: results.filter(r => r.success).length,
                    failed: errors.length
                }
            }
        });

    } catch (error) {
        console.error('❌ Batch process error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process batch requests',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    testConnection,
    generateContent,
    chat,
    getStatus,
    batchProcess
};