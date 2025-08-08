// utils/trainingData.js - STRATEGIC COMMANDER ENHANCED TRAINING SYSTEM
// IMPERIUM VAULT STRATEGIC COMMAND SYSTEM - Institutional-grade document training and knowledge management

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Enhanced document processing libraries
const mammoth = require('mammoth');
let pdfParse = null;
try {
    pdfParse = require('pdf-parse');
} catch (error) {
    console.log('⚠️ PDF parsing not available - install pdf-parse for PDF support');
}

// Database integration for persistent storage
const { saveTrainingDocumentDB, getTrainingDocumentsDB } = require('./database');

// Enhanced in-memory storage with strategic categorization
let trainingDocuments = new Map(); // chatId -> array of documents
let documentSearchIndex = new Map(); // chatId -> search index
let strategicKnowledgeBase = new Map(); // chatId -> strategic insights

// 🎯 STRATEGIC DOCUMENT CATEGORIES
const STRATEGIC_DOCUMENT_TYPES = {
    FINANCIAL_REPORTS: 'financial_reports',
    MARKET_ANALYSIS: 'market_analysis',
    TRADING_STRATEGIES: 'trading_strategies',
    RISK_MANAGEMENT: 'risk_management',
    CAMBODIA_INTELLIGENCE: 'cambodia_intelligence',
    ECONOMIC_DATA: 'economic_data',
    PORTFOLIO_REPORTS: 'portfolio_reports',
    COMPLIANCE_DOCS: 'compliance_docs',
    RESEARCH_NOTES: 'research_notes',
    DEAL_DOCUMENTATION: 'deal_documentation',
    LP_COMMUNICATIONS: 'lp_communications',
    GENERAL: 'general'
};

// 🔍 STRATEGIC DOCUMENT PROCESSING PATTERNS
const STRATEGIC_PATTERNS = {
    financial: {
        keywords: ['revenue', 'profit', 'ebitda', 'cash flow', 'balance sheet', 'income statement', 'financial performance'],
        importance: 'high',
        category: STRATEGIC_DOCUMENT_TYPES.FINANCIAL_REPORTS
    },
    trading: {
        keywords: ['position', 'trade', 'stop loss', 'take profit', 'risk', 'portfolio', 'allocation', 'strategy'],
        importance: 'high',
        category: STRATEGIC_DOCUMENT_TYPES.TRADING_STRATEGIES
    },
    cambodia: {
        keywords: ['cambodia', 'phnom penh', 'siem reap', 'lending', 'real estate', 'development', 'usd rate'],
        importance: 'critical',
        category: STRATEGIC_DOCUMENT_TYPES.CAMBODIA_INTELLIGENCE
    },
    risk: {
        keywords: ['risk assessment', 'var', 'stress test', 'correlation', 'volatility', 'exposure', 'hedge'],
        importance: 'critical',
        category: STRATEGIC_DOCUMENT_TYPES.RISK_MANAGEMENT
    },
    market: {
        keywords: ['market analysis', 'economic outlook', 'fed policy', 'interest rates', 'inflation', 'gdp'],
        importance: 'high',
        category: STRATEGIC_DOCUMENT_TYPES.MARKET_ANALYSIS
    },
    deals: {
        keywords: ['deal analysis', 'investment opportunity', 'due diligence', 'valuation', 'irr', 'npv'],
        importance: 'high',
        category: STRATEGIC_DOCUMENT_TYPES.DEAL_DOCUMENTATION
    }
};

/**
 * 🎯 STRATEGIC DOCUMENT PROCESSING ENGINE
 * Enhanced processing with institutional-grade categorization and analysis
 */
async function processStrategicTrainingDocument(chatId, filePath, fileName, documentType = 'general') {
    try {
        console.log(`🎯 Strategic Commander processing document: ${fileName}`);
        
        const chatKey = String(chatId);
        let content = '';
        let metadata = {
            processingTime: Date.now(),
            fileSize: 0,
            extractionMethod: 'unknown'
        };
        
        // Get file stats
        const stats = fs.statSync(filePath);
        metadata.fileSize = stats.size;
        
        // Enhanced text extraction based on file type
        const fileExtension = path.extname(fileName).toLowerCase();
        
        try {
            if (fileExtension === '.pdf') {
                content = await extractPDFContent(filePath);
                metadata.extractionMethod = 'pdf-parse';
            } else if (fileExtension === '.docx') {
                content = await extractDOCXContent(filePath);
                metadata.extractionMethod = 'mammoth';
            } else if (['.txt', '.md', '.csv'].includes(fileExtension)) {
                content = fs.readFileSync(filePath, 'utf-8');
                metadata.extractionMethod = 'utf8';
            } else if (fileExtension === '.json') {
                const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                content = JSON.stringify(jsonData, null, 2);
                metadata.extractionMethod = 'json';
            } else {
                // Try as plain text for unknown formats
                content = fs.readFileSync(filePath, 'utf-8');
                metadata.extractionMethod = 'fallback-utf8';
            }
        } catch (extractionError) {
            console.error(`⚠️ Content extraction failed for ${fileName}:`, extractionError.message);
            content = `Document content could not be extracted from ${fileName}. File type: ${fileExtension}`;
            metadata.extractionMethod = 'failed';
        }
        
        // Strategic content analysis and categorization
        const strategicAnalysis = await analyzeStrategicContent(content, fileName);
        
        // Calculate strategic importance and categorization
        const strategicCategory = determineStrategicCategory(content, fileName, documentType);
        const strategicImportance = calculateStrategicImportance(content, strategicAnalysis);
        
        // Generate document summary with strategic insights
        const strategicSummary = generateStrategicSummary(content, strategicAnalysis);
        
        // Create enhanced document object
        const strategicDocument = {
            fileName,
            content,
            originalType: documentType,
            strategicCategory,
            strategicImportance,
            uploadDate: new Date().toISOString(),
            wordCount: content.split(/\s+/).filter(word => word.length > 0).length,
            summary: strategicSummary,
            strategicAnalysis,
            metadata,
            searchTerms: extractStrategicSearchTerms(content, fileName),
            keyInsights: strategicAnalysis.keyInsights || [],
            financialMetrics: strategicAnalysis.financialMetrics || {},
            riskFactors: strategicAnalysis.riskFactors || [],
            actionItems: strategicAnalysis.actionItems || [],
            documentHash: generateDocumentHash(content)
        };
        
        // Save to database with enhanced strategic data
        try {
            const dbSaved = await saveTrainingDocumentDB(
                chatId, 
                fileName, 
                content, 
                strategicCategory, 
                strategicDocument.wordCount, 
                strategicSummary
            );
            
            if (dbSaved) {
                console.log(`✅ Strategic document saved to database: ${fileName}`);
            }
        } catch (dbError) {
            console.error('Database save failed, using in-memory storage:', dbError.message);
        }
        
        // Store in enhanced in-memory system
        if (!trainingDocuments.has(chatKey)) {
            trainingDocuments.set(chatKey, []);
        }
        
        const userDocs = trainingDocuments.get(chatKey);
        userDocs.push(strategicDocument);
        
        // Maintain strategic document limits with priority preservation
        if (userDocs.length > 50) {
            // Sort by strategic importance and recency
            const sortedDocs = userDocs.sort((a, b) => {
                const importanceScore = {
                    'critical': 4,
                    'high': 3,
                    'medium': 2,
                    'low': 1
                };
                
                const scoreA = importanceScore[a.strategicImportance] * 10 + new Date(a.uploadDate).getTime() / 1000000000;
                const scoreB = importanceScore[b.strategicImportance] * 10 + new Date(b.uploadDate).getTime() / 1000000000;
                
                return scoreB - scoreA;
            });
            
            trainingDocuments.set(chatKey, sortedDocs.slice(0, 40));
            console.log(`📊 Strategic document optimization: Kept top 40 of ${userDocs.length} documents`);
        }
        
        // Update strategic search index
        updateStrategicSearchIndex(chatKey, strategicDocument);
        
        // Extract strategic knowledge for knowledge base
        updateStrategicKnowledgeBase(chatKey, strategicDocument);
        
        // Clean up temporary file
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        
        metadata.processingTime = Date.now() - metadata.processingTime;
        
        console.log(`✅ Strategic document processing complete: ${fileName} (${strategicDocument.wordCount} words, ${strategicCategory})`);
        
        return {
            success: true,
            wordCount: strategicDocument.wordCount,
            summary: strategicSummary,
            strategicCategory,
            strategicImportance,
            keyInsights: strategicDocument.keyInsights.slice(0, 3),
            processingTime: metadata.processingTime,
            extractionMethod: metadata.extractionMethod
        };
        
    } catch (error) {
        console.error('Strategic document processing error:', error.message);
        
        // Clean up temporary file on error
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (cleanupError) {
            // Ignore cleanup errors
        }
        
        return {
            success: false,
            error: error.message,
            fileName: fileName
        };
    }
}

/**
 * 📄 ENHANCED PDF CONTENT EXTRACTION
 */
async function extractPDFContent(filePath) {
    if (!pdfParse) {
        throw new Error('PDF parsing not available - install pdf-parse package');
    }
    
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer, {
        // Enhanced PDF parsing options
        normalizeWhitespace: true,
        disableCombineTextItems: false
    });
    
    return pdfData.text;
}

/**
 * 📝 ENHANCED DOCX CONTENT EXTRACTION
 */
async function extractDOCXContent(filePath) {
    const result = await mammoth.extractRawText({ 
        path: filePath,
        // Enhanced DOCX options
        convertImage: mammoth.images.ignore,
        includeEmbeddedStyleMap: true
    });
    
    if (result.messages && result.messages.length > 0) {
        console.log('DOCX extraction warnings:', result.messages.map(m => m.message).join(', '));
    }
    
    return result.value;
}

/**
 * 🔍 STRATEGIC CONTENT ANALYSIS ENGINE
 */
async function analyzeStrategicContent(content, fileName) {
    const analysis = {
        contentType: 'general',
        strategicRelevance: 'medium',
        keyInsights: [],
        financialMetrics: {},
        riskFactors: [],
        actionItems: [],
        marketIntelligence: [],
        cambodiaContent: false
    };
    
    const contentLower = content.toLowerCase();
    const fileNameLower = fileName.toLowerCase();
    
    // Analyze content patterns
    for (const [patternType, pattern] of Object.entries(STRATEGIC_PATTERNS)) {
        const matchCount = pattern.keywords.reduce((count, keyword) => {
            return count + (contentLower.match(new RegExp(keyword, 'gi')) || []).length;
        }, 0);
        
        if (matchCount > 0) {
            analysis.contentType = patternType;
            analysis.strategicRelevance = pattern.importance;
            break;
        }
    }
    
    // Extract financial metrics
    analysis.financialMetrics = extractFinancialMetrics(content);
    
    // Extract risk factors
    analysis.riskFactors = extractRiskFactors(content);
    
    // Extract action items
    analysis.actionItems = extractActionItems(content);
    
    // Extract key insights
    analysis.keyInsights = extractKeyInsights(content);
    
    // Check for Cambodia-specific content
    analysis.cambodiaContent = /cambodia|phnom penh|siem reap|khmer|riel|usd.*cambodia/i.test(contentLower);
    
    // Extract market intelligence
    analysis.marketIntelligence = extractMarketIntelligence(content);
    
    return analysis;
}

/**
 * 💰 EXTRACT FINANCIAL METRICS
 */
function extractFinancialMetrics(content) {
    const metrics = {};
    
    // Revenue patterns
    const revenueMatch = content.match(/revenue[:\s]*\$?([\d,]+(?:\.\d+)?)[mb]?/i);
    if (revenueMatch) {
        metrics.revenue = revenueMatch[1];
    }
    
    // Profit patterns
    const profitMatch = content.match(/(?:net\s+)?profit[:\s]*\$?([\d,]+(?:\.\d+)?)[mb]?/i);
    if (profitMatch) {
        metrics.profit = profitMatch[1];
    }
    
    // IRR patterns
    const irrMatch = content.match(/irr[:\s]*([\d.]+)%/i);
    if (irrMatch) {
        metrics.irr = irrMatch[1];
    }
    
    // Interest rate patterns
    const rateMatch = content.match /([\d.]+)%.*(?:interest|rate|yield)/i);
    if (rateMatch) {
        metrics.interestRate = rateMatch[1];
    }
    
    return metrics;
}

/**
 * ⚠️ EXTRACT RISK FACTORS
 */
function extractRiskFactors(content) {
    const risks = [];
    const riskKeywords = [
        'market risk', 'credit risk', 'liquidity risk', 'operational risk',
        'currency risk', 'political risk', 'regulatory risk', 'concentration risk'
    ];
    
    riskKeywords.forEach(keyword => {
        if (content.toLowerCase().includes(keyword)) {
            // Extract sentence containing risk factor
            const sentences = content.split(/[.!?]+/);
            const riskSentence = sentences.find(sentence => 
                sentence.toLowerCase().includes(keyword)
            );
            
            if (riskSentence && riskSentence.trim().length > 20) {
                risks.push(riskSentence.trim());
            }
        }
    });
    
    return risks.slice(0, 5); // Top 5 risk factors
}

/**
 * 📋 EXTRACT ACTION ITEMS
 */
function extractActionItems(content) {
    const actions = [];
    const actionPatterns = [
        /(?:action|todo|follow.?up|next step)[:\s]*([^.!?\n]+)/gi,
        /(?:recommend|suggest)[:\s]*([^.!?\n]+)/gi,
        /(?:must|should|need to)[:\s]*([^.!?\n]+)/gi
    ];
    
    actionPatterns.forEach(pattern => {
        const matches = [...content.matchAll(pattern)];
        matches.forEach(match => {
            if (match[1] && match[1].trim().length > 10) {
                actions.push(match[1].trim());
            }
        });
    });
    
    return actions.slice(0, 5); // Top 5 action items
}

/**
 * 💡 EXTRACT KEY INSIGHTS
 */
function extractKeyInsights(content) {
    const insights = [];
    
    // Look for insight-indicating phrases
    const insightPatterns = [
        /(?:key insight|important|critical|significant)[:\s]*([^.!?\n]+)/gi,
        /(?:conclusion|finding|result)[:\s]*([^.!?\n]+)/gi,
        /(?:analysis shows|data indicates|research suggests)[:\s]*([^.!?\n]+)/gi
    ];
    
    insightPatterns.forEach(pattern => {
        const matches = [...content.matchAll(pattern)];
        matches.forEach(match => {
            if (match[1] && match[1].trim().length > 15) {
                insights.push(match[1].trim());
            }
        });
    });
    
    // Extract bullet points as potential insights
    const bulletPoints = content.match(/^[\s]*[•\-\*]\s*([^\n]+)/gm);
    if (bulletPoints) {
        bulletPoints.slice(0, 3).forEach(bullet => {
            const cleanBullet = bullet.replace(/^[\s]*[•\-\*]\s*/, '').trim();
            if (cleanBullet.length > 20) {
                insights.push(cleanBullet);
            }
        });
    }
    
    return insights.slice(0, 5); // Top 5 insights
}

/**
 * 📈 EXTRACT MARKET INTELLIGENCE
 */
function extractMarketIntelligence(content) {
    const intelligence = [];
    const marketKeywords = [
        'market outlook', 'economic forecast', 'fed policy', 'interest rate',
        'inflation', 'gdp growth', 'unemployment', 'market trend'
    ];
    
    marketKeywords.forEach(keyword => {
        if (content.toLowerCase().includes(keyword)) {
            const sentences = content.split(/[.!?]+/);
            const marketSentence = sentences.find(sentence => 
                sentence.toLowerCase().includes(keyword)
            );
            
            if (marketSentence && marketSentence.trim().length > 25) {
                intelligence.push(marketSentence.trim());
            }
        }
    });
    
    return intelligence.slice(0, 3); // Top 3 market intelligence items
}

/**
 * 🎯 DETERMINE STRATEGIC CATEGORY
 */
function determineStrategicCategory(content, fileName, originalType) {
    const contentLower = content.toLowerCase();
    const fileNameLower = fileName.toLowerCase();
    
    // Check filename patterns first
    if (fileNameLower.includes('cambodia') || fileNameLower.includes('lending')) {
        return STRATEGIC_DOCUMENT_TYPES.CAMBODIA_INTELLIGENCE;
    }
    
    if (fileNameLower.includes('risk') || fileNameLower.includes('var')) {
        return STRATEGIC_DOCUMENT_TYPES.RISK_MANAGEMENT;
    }
    
    if (fileNameLower.includes('trade') || fileNameLower.includes('strategy')) {
        return STRATEGIC_DOCUMENT_TYPES.TRADING_STRATEGIES;
    }
    
    // Content-based categorization
    for (const [patternType, pattern] of Object.entries(STRATEGIC_PATTERNS)) {
        const matchCount = pattern.keywords.reduce((count, keyword) => {
            return count + (contentLower.match(new RegExp(keyword, 'gi')) || []).length;
        }, 0);
        
        if (matchCount >= 3) { // Threshold for category assignment
            return pattern.category;
        }
    }
    
    return STRATEGIC_DOCUMENT_TYPES.GENERAL;
}

/**
 * ⭐ CALCULATE STRATEGIC IMPORTANCE
 */
function calculateStrategicImportance(content, analysis) {
    let score = 0;
    
    // Base scoring
    if (analysis.contentType === 'financial' || analysis.contentType === 'risk') score += 30;
    if (analysis.contentType === 'cambodia' || analysis.contentType === 'trading') score += 25;
    if (analysis.contentType === 'market') score += 20;
    
    // Financial metrics bonus
    if (Object.keys(analysis.financialMetrics).length > 2) score += 20;
    
    // Risk factors bonus
    if (analysis.riskFactors.length > 0) score += 15;
    
    // Cambodia content bonus
    if (analysis.cambodiaContent) score += 25;
    
    // Action items bonus
    if (analysis.actionItems.length > 0) score += 10;
    
    // Document length factor
    const wordCount = content.split(/\s+/).length;
    if (wordCount > 5000) score += 15;
    else if (wordCount > 1000) score += 10;
    
    // Convert to importance level
    if (score >= 70) return 'critical';
    if (score >= 50) return 'high';
    if (score >= 30) return 'medium';
    return 'low';
}

/**
 * 📝 GENERATE STRATEGIC SUMMARY
 */
function generateStrategicSummary(content, analysis) {
    let summary = '';
    
    // Add document type context
    summary += `Strategic ${analysis.contentType} document. `;
    
    // Add key metrics if available
    if (Object.keys(analysis.financialMetrics).length > 0) {
        const metrics = Object.entries(analysis.financialMetrics)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
        summary += `Key metrics: ${metrics}. `;
    }
    
    // Add top insight
    if (analysis.keyInsights.length > 0) {
        summary += `Key insight: ${analysis.keyInsights[0]}. `;
    }
    
    // Add Cambodia flag
    if (analysis.cambodiaContent) {
        summary += 'Contains Cambodia market intelligence. ';
    }
    
    // Add content preview
    const contentPreview = content.substring(0, 200).replace(/\s+/g, ' ').trim();
    summary += `Content preview: ${contentPreview}...`;
    
    return summary;
}

/**
 * 🔍 EXTRACT STRATEGIC SEARCH TERMS
 */
function extractStrategicSearchTerms(content, fileName) {
    const terms = new Set();
    
    // Add filename terms
    fileName.split(/[.\-_\s]+/).forEach(term => {
        if (term.length > 2) {
            terms.add(term.toLowerCase());
        }
    });
    
    // Extract important terms from content
    const importantPatterns = [
        /\b[A-Z][A-Z]+\b/g, // Acronyms
        /\$[\d,]+(?:\.\d+)?[kmb]?/gi, // Money amounts
        /\b\d+\.?\d*%/g, // Percentages
        /\b(?:cambodia|phnom penh|siem reap)\b/gi, // Cambodia locations
        /\b(?:usd|khmer|riel)\b/gi, // Currencies
        /\b(?:irr|npv|var|sharpe)\b/gi // Financial terms
    ];
    
    importantPatterns.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) {
            matches.forEach(match => {
                terms.add(match.toLowerCase());
            });
        }
    });
    
    return Array.from(terms).slice(0, 20); // Top 20 search terms
}

/**
 * 🗂️ UPDATE STRATEGIC SEARCH INDEX
 */
function updateStrategicSearchIndex(chatKey, document) {
    if (!documentSearchIndex.has(chatKey)) {
        documentSearchIndex.set(chatKey, new Map());
    }
    
    const searchIndex = documentSearchIndex.get(chatKey);
    
    // Index by filename
    searchIndex.set(document.fileName.toLowerCase(), document);
    
    // Index by search terms
    document.searchTerms.forEach(term => {
        if (!searchIndex.has(term)) {
            searchIndex.set(term, []);
        }
        searchIndex.get(term).push(document);
    });
    
    // Index by category
    if (!searchIndex.has(document.strategicCategory)) {
        searchIndex.set(document.strategicCategory, []);
    }
    searchIndex.get(document.strategicCategory).push(document);
}

/**
 * 🧠 UPDATE STRATEGIC KNOWLEDGE BASE
 */
function updateStrategicKnowledgeBase(chatKey, document) {
    if (!strategicKnowledgeBase.has(chatKey)) {
        strategicKnowledgeBase.set(chatKey, {
            financialMetrics: {},
            riskFactors: [],
            marketIntelligence: [],
            cambodiaInsights: [],
            tradingStrategies: [],
            lastUpdated: new Date().toISOString()
        });
    }
    
    const knowledgeBase = strategicKnowledgeBase.get(chatKey);
    
    // Merge financial metrics
    Object.assign(knowledgeBase.financialMetrics, document.financialMetrics);
    
    // Add risk factors
    knowledgeBase.riskFactors.push(...document.riskFactors);
    
    // Add market intelligence
    knowledgeBase.marketIntelligence.push(...document.marketIntelligence);
    
    // Add Cambodia insights
    if (document.cambodiaContent) {
        knowledgeBase.cambodiaInsights.push(...document.keyInsights);
    }
    
    // Add trading strategies
    if (document.strategicCategory === STRATEGIC_DOCUMENT_TYPES.TRADING_STRATEGIES) {
        knowledgeBase.tradingStrategies.push(...document.actionItems);
    }
    
    knowledgeBase.lastUpdated = new Date().toISOString();
    
    // Limit knowledge base size
    Object.keys(knowledgeBase).forEach(key => {
        if (Array.isArray(knowledgeBase[key]) && knowledgeBase[key].length > 50) {
            knowledgeBase[key] = knowledgeBase[key].slice(-30); // Keep latest 30 items
        }
    });
}

/**
 * 🔒 GENERATE DOCUMENT HASH
 */
function generateDocumentHash(content) {
    return crypto.createHash('sha256').update(content).digest('hex').substring(0, 16);
}

/**
 * 🔍 ENHANCED STRATEGIC SEARCH
 */
function searchStrategicTrainingDocuments(chatId, searchQuery) {
    try {
        const chatKey = String(chatId);
        const userDocs = trainingDocuments.get(chatKey) || [];
        
        if (userDocs.length === 0) {
            return '';
        }
        
        const queryLower = searchQuery.toLowerCase();
        const searchResults = [];
        
        // Enhanced search algorithm
        userDocs.forEach(doc => {
            let relevanceScore = 0;
            const matchedContent = [];
            
            // Filename match (high priority)
            if (doc.fileName.toLowerCase().includes(queryLower)) {
                relevanceScore += 50;
                matchedContent.push(`Filename: ${doc.fileName}`);
            }
            
            // Search terms match
            if (doc.searchTerms.some(term => term.includes(queryLower))) {
                relevanceScore += 30;
            }
            
            // Category match
            if (doc.strategicCategory.includes(queryLower)) {
                relevanceScore += 25;
            }
            
            // Content match
            if (doc.content.toLowerCase().includes(queryLower)) {
                relevanceScore += 20;
                
                // Extract relevant snippets
                const sentences = doc.content.split(/[.!?]+/);
                const relevantSentences = sentences.filter(sentence => 
                    sentence.toLowerCase().includes(queryLower)
                ).slice(0, 3);
                
                matchedContent.push(...relevantSentences.map(s => s.trim()));
            }
            
            // Key insights match
            const matchingInsights = doc.keyInsights.filter(insight => 
                insight.toLowerCase().includes(queryLower)
            );
            if (matchingInsights.length > 0) {
                relevanceScore += 15;
                matchedContent.push(...matchingInsights);
            }
            
            // Strategic importance bonus
            const importanceBonus = {
                'critical': 20,
                'high': 15,
                'medium': 10,
                'low': 5
            };
            relevanceScore += importanceBonus[doc.strategicImportance] || 5;
            
            if (relevanceScore > 20) {
                searchResults.push({
                    document: doc,
                    relevanceScore,
                    matchedContent: matchedContent.slice(0, 5)
                });
            }
        });
        
        // Sort by relevance
        searchResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
        
        if (searchResults.length === 0) {
            return '';
        }
        
        // Format results
        let contextString = `\n\n🎯 STRATEGIC DOCUMENT INTELLIGENCE (${searchResults.length} matches):\n`;
        
        searchResults.slice(0, 3).forEach((result, index) => {
            const doc = result.document;
            contextString += `\n📄 **${doc.fileName}** (${doc.strategicCategory}, ${doc.strategicImportance} priority)\n`;
            contextString += `   📊 Strategic Analysis: ${doc.strategicAnalysis.contentType}\n`;
            
            if (Object.keys(doc.financialMetrics).length > 0) {
                contextString += `   💰 Financial Metrics: ${JSON.stringify(doc.financialMetrics)}\n`;
            }
            
            contextString += `   📝 Relevant Content:\n`;
            result.matchedContent.slice(0, 3).forEach(content => {
                if (content.length > 20) {
                    contextString += `      • ${content.substring(0, 150)}...\n`;
                }
            });
            
            if (doc.keyInsights.length > 0) {
                contextString += `   💡 Key Insights: ${doc.keyInsights.slice(0, 2).join('; ')}\n`;
            }
        });
        
        contextString += `\n🎯 Strategic Directive: Use this institutional intelligence to provide expert-level analysis and recommendations.`;
        
        return contextString;
        
    } catch (error) {
        console.error('Strategic search error:', error.message);
        return '';
    }
}

/**
 * 📚 GET STRATEGIC TRAINING DOCUMENTS SUMMARY
 */
function getStrategicTrainingDocumentsSummary(chatId) {
    try {
        const chatKey = String(chatId);
        const userDocs = trainingDocuments.get(chatKey) || [];
        
        if (userDocs.length === 0) {
            return '📚 **No Strategic Training Documents**\n\nUpload financial reports, market analysis, or strategic documents to enhance AI capabilities.';
        }
        
        // Categorize documents
        const categoryStats = {};
        const importanceStats = {};
        let totalWords = 0;
        
        userDocs.forEach(doc => {
            // Category stats
            if (!categoryStats[doc.strategicCategory]) {
                categoryStats[doc.strategicCategory] = 0;
            }
            categoryStats[doc.strategicCategory]++;
            
            // Importance stats
            if (!importanceStats[doc.strategicImportance]) {
                importanceStats[doc.strategicImportance] = 0;
            }
            importanceStats[doc.strategicImportance]++;
            
            totalWords += doc.wordCount;
        });
        
        let summary = `📚 **STRATEGIC TRAINING INTELLIGENCE (${userDocs.length} documents)**\n\n`;
        
        // Overall stats
        summary += `📊 **Strategic Overview:**\n`;
        summary += `• Total Documents: ${userDocs.length}\n`;
        summary += `• Total Words: ${totalWords.toLocaleString()}\n`;
        summary += `• Average per Document: ${Math.round(totalWords / userDocs.length).toLocaleString()}\n\n`;
        
        // Category breakdown
        summary += `🎯 **Strategic Categories:**\n`;
        Object.entries(categoryStats)
            .sort(([,a], [,b]) => b - a)
            .forEach(([category, count]) => {
                const categoryName = category.replace(/_/g, ' ').toUpperCase();
                summary += `• ${categoryName}: ${count} documents\n`;
            });
        
        summary += `\n⭐ **Strategic Importance:**\n`;
        Object.entries(importanceStats)
            .sort(([,a], [,b]) => b - a)
            .forEach(([importance, count]) => {
                const emoji = importance === 'critical' ? '🔴' : 
                             importance === 'high' ? '🟡' : 
                             importance === 'medium' ? '🟢' : '⚪';
                summary += `• ${emoji} ${importance.toUpperCase()}: ${count} documents\n`;
            });
        
        // Recent documents
        const recentDocs = userDocs
            .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))
            .slice(0, 5);
        
        summary += `\n📄 **Recent Strategic Documents:**\n`;
        recentDocs.forEach((doc, index) => {
            const date = new Date(doc.uploadDate).toLocaleDateString();
            const importanceEmoji = doc.strategicImportance === 'critical' ? '🔴' : 
                                   doc.strategicImportance === 'high' ? '🟡' : '🟢';
            summary += `${index + 1}. ${importanceEmoji} **${doc.fileName}**\n`;
            summary += `   Category: ${doc.strategicCategory.replace(/_/g, ' ')}\n`;
            summary += `   Words: ${doc.wordCount.toLocaleString()} | Added: ${date}\n`;
            
            if (doc.keyInsights.length > 0) {
                summary += `   Insight: ${doc.keyInsights[0].substring(0, 80)}...\n`;
            }
            summary += `\n`;
        });
        
        // Strategic capabilities
        const knowledgeBase = strategicKnowledgeBase.get(chatKey);
        if (knowledgeBase) {
            summary += `🧠 **Strategic Intelligence Capabilities:**\n`;
            
            if (Object.keys(knowledgeBase.financialMetrics).length > 0) {
                summary += `• Financial Metrics: ${Object.keys(knowledgeBase.financialMetrics).length} tracked\n`;
            }
            
            if (knowledgeBase.riskFactors.length > 0) {
                summary += `• Risk Intelligence: ${knowledgeBase.riskFactors.length} factors identified\n`;
            }
            
            if (knowledgeBase.cambodiaInsights.length > 0) {
                summary += `• Cambodia Intelligence: ${knowledgeBase.cambodiaInsights.length} strategic insights\n`;
            }
            
            if (knowledgeBase.marketIntelligence.length > 0) {
                summary += `• Market Intelligence: ${knowledgeBase.marketIntelligence.length} data points\n`;
            }
        }
        
        summary += `\n🎯 **Strategic AI Enhancement:** Your documents enable institutional-grade analysis and strategic decision-making.`;
        
        return summary;
        
    } catch (error) {
        console.error('Get strategic training summary error:', error.message);
        return 'Error retrieving strategic training documents.';
    }
}

/**
 * 🎯 BUILD STRATEGIC TRAINING CONTEXT
 */
function buildStrategicTrainingContext(chatId, userMessage) {
    try {
        // Enhanced context building with strategic intelligence
        const relevantContent = searchStrategicTrainingDocuments(chatId, userMessage);
        
        if (relevantContent) {
            // Add strategic knowledge base context
            const chatKey = String(chatId);
            const knowledgeBase = strategicKnowledgeBase.get(chatKey);
            
            let enhancedContext = relevantContent;
            
            if (knowledgeBase) {
                // Add relevant financial metrics
                if (Object.keys(knowledgeBase.financialMetrics).length > 0) {
                    enhancedContext += `\n\n📊 STRATEGIC FINANCIAL INTELLIGENCE:\n`;
                    Object.entries(knowledgeBase.financialMetrics).slice(0, 5).forEach(([metric, value]) => {
                        enhancedContext += `• ${metric}: ${value}\n`;
                    });
                }
                
                // Add relevant risk factors for risk-related queries
                if (userMessage.toLowerCase().includes('risk') && knowledgeBase.riskFactors.length > 0) {
                    enhancedContext += `\n\n⚠️ STRATEGIC RISK INTELLIGENCE:\n`;
                    knowledgeBase.riskFactors.slice(0, 3).forEach(risk => {
                        enhancedContext += `• ${risk.substring(0, 100)}...\n`;
                    });
                }
                
                // Add Cambodia insights for Cambodia-related queries
                if (/cambodia|phnom penh|lending|fund/i.test(userMessage) && knowledgeBase.cambodiaInsights.length > 0) {
                    enhancedContext += `\n\n🇰🇭 STRATEGIC CAMBODIA INTELLIGENCE:\n`;
                    knowledgeBase.cambodiaInsights.slice(0, 3).forEach(insight => {
                        enhancedContext += `• ${insight.substring(0, 100)}...\n`;
                    });
                }
            }
            
            enhancedContext += `\n\n🎯 STRATEGIC DIRECTIVE: Leverage this institutional intelligence to provide expert-level analysis with specific references to documented insights and metrics.`;
            
            return enhancedContext;
        }
        
        return '';
        
    } catch (error) {
        console.error('Build strategic training context error:', error.message);
        return '';
    }
}

/**
 * 🗑️ CLEAR STRATEGIC TRAINING DOCUMENTS
 */
function clearStrategicTrainingDocuments(chatId) {
    try {
        const chatKey = String(chatId);
        
        // Clear in-memory storage
        trainingDocuments.delete(chatKey);
        documentSearchIndex.delete(chatKey);
        strategicKnowledgeBase.delete(chatKey);
        
        console.log(`🗑️ Strategic training documents cleared for user ${chatId}`);
        return true;
    } catch (error) {
        console.error('Clear strategic training documents error:', error.message);
        return false;
    }
}

/**
 * 📊 GET STRATEGIC DOCUMENT ANALYTICS
 */
function getStrategicDocumentAnalytics(chatId) {
    try {
        const chatKey = String(chatId);
        const userDocs = trainingDocuments.get(chatKey) || [];
        const knowledgeBase = strategicKnowledgeBase.get(chatKey);
        
        const analytics = {
            totalDocuments: userDocs.length,
            totalWords: userDocs.reduce((sum, doc) => sum + doc.wordCount, 0),
            
            categoryBreakdown: {},
            importanceBreakdown: {},
            
            averageWordsPerDoc: 0,
            strategicCapabilities: {},
            
            recentUploadTrend: calculateUploadTrend(userDocs),
            topCategories: [],
            strategicReadiness: 'LOW'
        };
        
        if (userDocs.length > 0) {
            analytics.averageWordsPerDoc = Math.round(analytics.totalWords / userDocs.length);
            
            // Category analysis
            userDocs.forEach(doc => {
                analytics.categoryBreakdown[doc.strategicCategory] = 
                    (analytics.categoryBreakdown[doc.strategicCategory] || 0) + 1;
                    
                analytics.importanceBreakdown[doc.strategicImportance] = 
                    (analytics.importanceBreakdown[doc.strategicImportance] || 0) + 1;
            });
            
            // Top categories
            analytics.topCategories = Object.entries(analytics.categoryBreakdown)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 3)
                .map(([category, count]) => ({ category, count }));
        }
        
        // Strategic capabilities assessment
        if (knowledgeBase) {
            analytics.strategicCapabilities = {
                financialAnalysis: Object.keys(knowledgeBase.financialMetrics).length > 0,
                riskAssessment: knowledgeBase.riskFactors.length > 0,
                cambodiaExpertise: knowledgeBase.cambodiaInsights.length > 0,
                marketIntelligence: knowledgeBase.marketIntelligence.length > 0,
                tradingStrategies: knowledgeBase.tradingStrategies.length > 0
            };
        }
        
        // Strategic readiness assessment
        if (analytics.totalDocuments >= 10 && analytics.totalWords >= 50000) {
            analytics.strategicReadiness = 'HIGH';
        } else if (analytics.totalDocuments >= 5 && analytics.totalWords >= 20000) {
            analytics.strategicReadiness = 'MEDIUM';
        } else if (analytics.totalDocuments >= 1) {
            analytics.strategicReadiness = 'LOW';
        }
        
        return analytics;
        
    } catch (error) {
        console.error('Get strategic document analytics error:', error.message);
        return null;
    }
}

/**
 * 📈 CALCULATE UPLOAD TREND
 */
function calculateUploadTrend(userDocs) {
    if (userDocs.length < 2) return 'INSUFFICIENT_DATA';
    
    const now = new Date();
    const last7Days = userDocs.filter(doc => 
        (now - new Date(doc.uploadDate)) <= 7 * 24 * 60 * 60 * 1000
    ).length;
    
    const last30Days = userDocs.filter(doc => 
        (now - new Date(doc.uploadDate)) <= 30 * 24 * 60 * 60 * 1000
    ).length;
    
    if (last7Days >= 3) return 'VERY_ACTIVE';
    if (last7Days >= 1) return 'ACTIVE';
    if (last30Days >= 5) return 'MODERATE';
    return 'LOW';
}

/**
 * 🔍 SEARCH STRATEGIC DOCUMENTS BY CATEGORY
 */
function searchDocumentsByCategory(chatId, category) {
    try {
        const chatKey = String(chatId);
        const userDocs = trainingDocuments.get(chatKey) || [];
        
        return userDocs.filter(doc => 
            doc.strategicCategory === category ||
            doc.strategicCategory.includes(category.toLowerCase())
        );
    } catch (error) {
        console.error('Search by category error:', error.message);
        return [];
    }
}

/**
 * 💡 GET STRATEGIC RECOMMENDATIONS
 */
function getStrategicDocumentRecommendations(chatId) {
    try {
        const analytics = getStrategicDocumentAnalytics(chatId);
        const recommendations = [];
        
        if (!analytics || analytics.totalDocuments === 0) {
            return [
                "Upload financial reports to enable institutional-grade analysis",
                "Add trading strategies for enhanced portfolio recommendations", 
                "Include risk assessments for comprehensive risk management",
                "Upload Cambodia market documents for local expertise"
            ];
        }
        
        // Based on current document mix
        const categories = analytics.categoryBreakdown;
        
        if (!categories[STRATEGIC_DOCUMENT_TYPES.FINANCIAL_REPORTS]) {
            recommendations.push("Add financial reports for enhanced investment analysis");
        }
        
        if (!categories[STRATEGIC_DOCUMENT_TYPES.RISK_MANAGEMENT]) {
            recommendations.push("Upload risk management documents for better portfolio protection");
        }
        
        if (!categories[STRATEGIC_DOCUMENT_TYPES.CAMBODIA_INTELLIGENCE]) {
            recommendations.push("Include Cambodia market documents for local lending expertise");
        }
        
        if (!categories[STRATEGIC_DOCUMENT_TYPES.TRADING_STRATEGIES]) {
            recommendations.push("Add trading strategy documents for tactical positioning guidance");
        }
        
        if (analytics.totalWords < 20000) {
            recommendations.push("Upload more comprehensive documents for deeper AI training");
        }
        
        return recommendations.slice(0, 5);
        
    } catch (error) {
        console.error('Get strategic recommendations error:', error.message);
        return [];
    }
}

// ===== LEGACY COMPATIBILITY FUNCTIONS =====

/**
 * 🔄 LEGACY FUNCTION ALIASES
 */
function processTrainingDocument(chatId, filePath, fileName, documentType = 'general') {
    return processStrategicTrainingDocument(chatId, filePath, fileName, documentType);
}

function searchTrainingDocuments(chatId, searchQuery) {
    return searchStrategicTrainingDocuments(chatId, searchQuery);
}

function getTrainingDocumentsSummary(chatId) {
    return getStrategicTrainingDocumentsSummary(chatId);
}

function buildTrainingContext(chatId, userMessage) {
    return buildStrategicTrainingContext(chatId, userMessage);
}

function clearTrainingDocuments(chatId) {
    return clearStrategicTrainingDocuments(chatId);
}

// ===== MODULE EXPORTS =====

module.exports = {
    // 🎯 STRATEGIC ENHANCED FUNCTIONS
    processStrategicTrainingDocument,
    searchStrategicTrainingDocuments,
    getStrategicTrainingDocumentsSummary,
    buildStrategicTrainingContext,
    clearStrategicTrainingDocuments,
    
    // 📊 ANALYTICS & INTELLIGENCE
    getStrategicDocumentAnalytics,
    searchDocumentsByCategory,
    getStrategicDocumentRecommendations,
    
    // 🎯 STRATEGIC UTILITIES
    analyzeStrategicContent,
    determineStrategicCategory,
    calculateStrategicImportance,
    extractFinancialMetrics,
    extractRiskFactors,
    extractActionItems,
    extractKeyInsights,
    
    // 📚 CONSTANTS
    STRATEGIC_DOCUMENT_TYPES,
    STRATEGIC_PATTERNS,
    
    // 🔄 LEGACY COMPATIBILITY
    processTrainingDocument,
    searchTrainingDocuments,
    getTrainingDocumentsSummary,
    buildTrainingContext,
    clearTrainingDocuments
};
