// backend/src/services/grokService.js - Complete Version
const axios = require('axios');

class GrokService {
    constructor() {
        this.apiKey = process.env.GROK_API_KEY;
        this.apiUrl = process.env.GROK_API_URL || 'https://api.x.ai/v1/chat/completions';
        this.model = process.env.GROK_MODEL || 'grok-2-1212';
        this.maxTokens = parseInt(process.env.GROK_MAX_TOKENS) || 1000;
        this.temperature = parseFloat(process.env.GROK_TEMPERATURE) || 0.7;
        
        console.log('🤖 Grok Service initialized:', {
            hasApiKey: !!this.apiKey,
            model: this.model,
            maxTokens: this.maxTokens
        });
    }

    // Check if Grok API is available
    isAvailable() {
        return !!this.apiKey;
    }

    // Enhanced content generation for storytelling
    async enhanceChapterContent(title, currentContent, context = {}) {
        if (!this.isAvailable()) {
            throw new Error('Grok API not available - API key missing');
        }

        try {
            const { bookTitle, genre, language = 'en', previousChapter } = context;
            
            const prompt = this._createEnhancementPrompt(title, currentContent, {
                bookTitle,
                genre,
                language,
                previousChapter
            });

            const response = await this._callGrokAPI([
                { role: 'system', content: this._getSystemPrompt('enhance', language) },
                { role: 'user', content: prompt }
            ]);

            console.log('✅ Grok enhanced chapter content successfully');
            
            return {
                success: true,
                enhancedContent: response,
                suggestions: this._extractSuggestions(response),
                wordCount: this._countWords(response)
            };

        } catch (error) {
            console.error('❌ Grok enhancement error:', error);
            throw error;
        }
    }

    // Add new thoughts/ideas to existing content
    async integrateNewThought(currentContent, newThought, context = {}) {
        if (!this.isAvailable()) {
            throw new Error('Grok API not available - API key missing');
        }

        try {
            const { language = 'en', tone = 'narrative' } = context;
            
            const prompt = this._createIntegrationPrompt(currentContent, newThought, tone);

            const response = await this._callGrokAPI([
                { role: 'system', content: this._getSystemPrompt('integrate', language) },
                { role: 'user', content: prompt }
            ]);

            console.log('✅ Grok integrated new thought successfully');
            
            return {
                success: true,
                integratedContent: response,
                originalLength: this._countWords(currentContent),
                newLength: this._countWords(response)
            };

        } catch (error) {
            console.error('❌ Grok integration error:', error);
            throw error;
        }
    }

    // Generate chapter summary
    async generateChapterSummary(content, context = {}) {
        if (!this.isAvailable()) {
            throw new Error('Grok API not available - API key missing');
        }

        try {
            const { language = 'en', length = 'medium' } = context;
            
            const prompt = this._createSummaryPrompt(content, length);

            const response = await this._callGrokAPI([
                { role: 'system', content: this._getSystemPrompt('summarize', language) },
                { role: 'user', content: prompt }
            ]);

            console.log('✅ Grok generated summary successfully');
            
            return {
                success: true,
                summary: response,
                originalWordCount: this._countWords(content),
                summaryWordCount: this._countWords(response)
            };

        } catch (error) {
            console.error('❌ Grok summary error:', error);
            throw error;
        }
    }

    // Generate new chapter based on outline
    async generateChapter(title, outline, context = {}) {
        if (!this.isAvailable()) {
            throw new Error('Grok API not available - API key missing');
        }

        try {
            const { bookTitle, genre, language = 'en', style = 'narrative' } = context;
            
            const prompt = this._createGenerationPrompt(title, outline, {
                bookTitle,
                genre,
                style
            });

            const response = await this._callGrokAPI([
                { role: 'system', content: this._getSystemPrompt('generate', language) },
                { role: 'user', content: prompt }
            ]);

            console.log('✅ Grok generated chapter successfully');
            
            return {
                success: true,
                content: response,
                wordCount: this._countWords(response),
                estimatedReadingTime: Math.ceil(this._countWords(response) / 200)
            };

        } catch (error) {
            console.error('❌ Grok generation error:', error);
            throw error;
        }
    }

    // Generate book summary for email
    async generateBookSummary(chapters, bookInfo) {
        if (!this.isAvailable()) {
            throw new Error('Grok API not available - API key missing');
        }

        try {
            const { title, genre, language = 'en' } = bookInfo;
            
            const chaptersText = chapters.map(ch => 
                `Chapter ${ch.chapterNumber}: ${ch.title}\n${ch.content || 'No content yet'}`
            ).join('\n\n');

            const prompt = `Create a comprehensive summary of this book for email sharing:

Book Title: ${title}
Genre: ${genre || 'Fiction'}
Total Chapters: ${chapters.length}

Chapters:
${chaptersText}

Please provide:
1. A compelling book summary (2-3 paragraphs)
2. Key themes and highlights
3. Progress overview
4. Next steps or recommendations`;

            const response = await this._callGrokAPI([
                { role: 'system', content: this._getSystemPrompt('email_summary', language) },
                { role: 'user', content: prompt }
            ]);

            console.log('✅ Grok generated book summary for email');
            
            return {
                success: true,
                emailSummary: response,
                bookTitle: title,
                chapterCount: chapters.length,
                totalWords: chapters.reduce((sum, ch) => sum + (ch.wordCount || 0), 0)
            };

        } catch (error) {
            console.error('❌ Grok email summary error:', error);
            throw error;
        }
    }

    // Analyze and provide writing suggestions
    async analyzeWriting(content, context = {}) {
        if (!this.isAvailable()) {
            throw new Error('Grok API not available - API key missing');
        }

        try {
            const { language = 'en', focus = 'general' } = context;
            
            const prompt = `Please analyze this writing and provide constructive feedback:

Content to analyze:
${content}

Focus areas: ${focus}

Please provide:
1. Overall assessment
2. Strengths
3. Areas for improvement
4. Specific suggestions
5. Style recommendations`;

            const response = await this._callGrokAPI([
                { role: 'system', content: this._getSystemPrompt('analyze', language) },
                { role: 'user', content: prompt }
            ]);

            console.log('✅ Grok analyzed writing successfully');
            
            return {
                success: true,
                analysis: response,
                wordCount: this._countWords(content),
                readabilityScore: this._calculateReadabilityScore(content)
            };

        } catch (error) {
            console.error('❌ Grok analysis error:', error);
            throw error;
        }
    }

    // Private helper methods
    async _callGrokAPI(messages) {
        if (!this.apiKey) {
            throw new Error('Grok API key not configured');
        }

        try {
            console.log(`🚀 Calling Grok API with ${messages.length} messages`);
            
            const response = await axios.post(this.apiUrl, {
                messages,
                model: this.model,
                temperature: this.temperature,
                max_tokens: this.maxTokens
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000 // 30 seconds timeout
            });

            if (!response.data?.choices?.[0]?.message?.content) {
                throw new Error('Invalid response from Grok API');
            }

            const content = response.data.choices[0].message.content.trim();
            console.log(`✅ Grok API response received (${content.length} characters)`);
            
            return content;

        } catch (error) {
            if (error.response?.status === 401) {
                throw new Error('Grok API authentication failed - check API key');
            } else if (error.response?.status === 429) {
                throw new Error('Grok API rate limit exceeded - please try again later');
            } else if (error.response?.status === 402) {
                throw new Error('Grok API quota exceeded - check billing');
            } else if (error.code === 'ECONNABORTED') {
                throw new Error('Grok API request timeout');
            } else if (error.response?.data?.error) {
                throw new Error(`Grok API error: ${error.response.data.error}`);
            }
            
            throw new Error(`Grok API error: ${error.message}`);
        }
    }

    _getSystemPrompt(type, language) {
        const prompts = {
            en: {
                enhance: "You are a professional storytelling assistant. Enhance the provided chapter content while maintaining the original tone and style. Make it more engaging, descriptive, and well-structured. Keep the core story intact.",
                integrate: "You are a storytelling assistant. Seamlessly integrate the new thought or idea into the existing content. Make it flow naturally as if it was always part of the story.",
                summarize: "You are a professional summarizer. Create clear, engaging summaries that capture the essence and key points of the content.",
                generate: "You are a creative writing assistant. Generate engaging, well-structured chapter content based on the provided outline and context.",
                email_summary: "You are a professional book summarizer. Create compelling email summaries that would interest readers and provide clear progress updates.",
                analyze: "You are a professional writing coach. Provide constructive, specific feedback to help improve the writing quality and storytelling."
            },
            de: {
                enhance: "Du bist ein professioneller Geschichtenerzähler-Assistent. Verbessere den bereitgestellten Kapitelinhalt, während du den ursprünglichen Ton und Stil beibehältst. Mache ihn ansprechender, beschreibender und gut strukturiert.",
                integrate: "Du bist ein Geschichtenerzähler-Assistent. Integriere den neuen Gedanken oder die Idee nahtlos in den bestehenden Inhalt. Lass es natürlich fließen, als wäre es schon immer Teil der Geschichte gewesen.",
                summarize: "Du bist ein professioneller Zusammenfasser. Erstelle klare, ansprechende Zusammenfassungen, die das Wesentliche und die Kernpunkte des Inhalts erfassen.",
                generate: "Du bist ein kreativer Schreibassistent. Erstelle ansprechende, gut strukturierte Kapitelinhalte basierend auf der bereitgestellten Gliederung und dem Kontext.",
                email_summary: "Du bist ein professioneller Buchzusammenfasser. Erstelle überzeugende E-Mail-Zusammenfassungen, die Leser interessieren und klare Fortschrittsupdates bieten.",
                analyze: "Du bist ein professioneller Schreibcoach. Gib konstruktives, spezifisches Feedback, um die Schreibqualität und das Geschichtenerzählen zu verbessern."
            },
            es: {
                enhance: "Eres un asistente profesional de narración. Mejora el contenido del capítulo proporcionado manteniendo el tono y estilo original. Hazlo más atractivo, descriptivo y bien estructurado.",
                integrate: "Eres un asistente de narración. Integra perfectamente el nuevo pensamiento o idea en el contenido existente. Haz que fluya naturalmente como si siempre hubiera sido parte de la historia.",
                summarize: "Eres un resumidor profesional. Crea resúmenes claros y atractivos que capturen la esencia y puntos clave del contenido.",
                generate: "Eres un asistente de escritura creativa. Genera contenido de capítulo atractivo y bien estructurado basado en el esquema y contexto proporcionados.",
                email_summary: "Eres un resumidor profesional de libros. Crea resúmenes de email convincentes que interesen a los lectores y proporcionen actualizaciones claras del progreso.",
                analyze: "Eres un coach profesional de escritura. Proporciona retroalimentación constructiva y específica para ayudar a mejorar la calidad de escritura y narrativa."
            }
        };

        return prompts[language]?.[type] || prompts.en[type];
    }

    _createEnhancementPrompt(title, content, context) {
        return `Please enhance this chapter content:

Chapter Title: ${title}
${context.bookTitle ? `Book: ${context.bookTitle}` : ''}
${context.genre ? `Genre: ${context.genre}` : ''}

Current Content:
${content || 'No content yet - please create engaging content based on the title.'}

${context.previousChapter ? `Previous Chapter Context: ${context.previousChapter.substring(0, 200)}...` : ''}

Requirements:
- Keep the original story and characters intact
- Enhance descriptions and dialogue
- Improve pacing and flow
- Add sensory details where appropriate
- Maintain consistent tone
- Target 800-1200 words`;
    }

    _createIntegrationPrompt(currentContent, newThought, tone) {
        return `Please integrate this new thought into the existing content:

Existing Content:
${currentContent}

New Thought to Integrate:
"${newThought}"

Requirements:
- Seamlessly blend the new thought into the story
- Maintain narrative flow
- Keep the ${tone} tone
- Ensure logical placement
- Expand naturally around the new idea`;
    }

    _createSummaryPrompt(content, length) {
        const lengthGuide = {
            short: '1-2 sentences',
            medium: '1 paragraph (3-4 sentences)',
            long: '2-3 paragraphs'
        };

        return `Please create a ${length} summary of this content:

${content}

Summary length: ${lengthGuide[length] || lengthGuide.medium}
Focus on key plot points, character development, and important themes.`;
    }

    _createGenerationPrompt(title, outline, context) {
        return `Please write a complete chapter based on this outline:

Chapter Title: ${title}
${context.bookTitle ? `Book: ${context.bookTitle}` : ''}
${context.genre ? `Genre: ${context.genre}` : ''}
Writing Style: ${context.style}

Chapter Outline:
${outline}

Requirements:
- Write a complete, engaging chapter (800-1200 words)
- Include dialogue and character development
- Create vivid descriptions and scenes
- Maintain consistent pacing
- End with a compelling transition or hook`;
    }

    _countWords(text) {
        if (!text) return 0;
        return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    }

    _extractSuggestions(content) {
        // Simple suggestion extraction - could be enhanced with NLP
        const suggestions = [];
        
        // Look for potential improvements in the generated content
        if (content.includes('consider')) {
            suggestions.push('Content includes suggestions for further development');
        }
        
        if (content.length < 500) {
            suggestions.push('Chapter could be expanded for better depth');
        }
        
        if (!content.includes('"') && content.length > 200) {
            suggestions.push('Consider adding dialogue to make the chapter more dynamic');
        }
        
        return suggestions;
    }

    _calculateReadabilityScore(text) {
        // Simple readability calculation (Flesch Reading Ease approximation)
        if (!text) return 0;
        
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
        const words = this._countWords(text);
        const syllables = this._countSyllables(text);
        
        if (sentences === 0 || words === 0) return 0;
        
        const avgSentenceLength = words / sentences;
        const avgSyllablesPerWord = syllables / words;
        
        // Simplified Flesch Reading Ease formula
        const score = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
        
        return Math.max(0, Math.min(100, Math.round(score)));
    }

    _countSyllables(text) {
        // Simple syllable counting
        if (!text) return 0;
        
        return text.toLowerCase()
            .replace(/[^a-z]/g, '')
            .replace(/[aeiouy]+/g, 'a')
            .replace(/a$/, '')
            .length || 1;
    }

    // Test connection to Grok API
    async testConnection() {
        if (!this.isAvailable()) {
            return {
                success: false,
                error: 'API key not configured'
            };
        }

        try {
            const response = await this._callGrokAPI([
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: 'Hello, please respond with "Grok API is working!" to test the connection.' }
            ]);

            return {
                success: true,
                message: response,
                model: this.model,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            return {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
}

// Export singleton instance
module.exports = new GrokService();