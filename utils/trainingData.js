// utils/trainingData.js - Document training system for personal GPT

const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');
const pdf = require('pdf-parse');

// Store training documents in memory with search capabilities
let trainingDocuments = new Map(); // chatId -> array of documents

/**
 * Process and store uploaded document for training
 */
async function processTrainingDocument(chatId, filePath, fileName, documentType = 'general') {
    try {
        const chatKey = String(chatId);
        let content = '';
        
        // Extract text based on file type
        if (fileName.toLowerCase().endsWith('.pdf')) {
            const dataBuffer = fs.readFileSync(filePath);
            const pdfData = await pdf(dataBuffer);
            content = pdfData.text;
        } else if (fileName.toLowerCase().endsWith('.docx')) {
            const result = await mammoth.extractRawText({path: filePath});
            content = result.value;
        } else if (fileName.toLowerCase().endsWith('.txt')) {
            content = fs.readFileSync(filePath, 'utf-8');
        } else {
            throw new Error('Unsupported file type. Use PDF, DOCX, or TXT files.');
        }
        
        // Store document
        if (!trainingDocuments.has(chatKey)) {
            trainingDocuments.set(chatKey, []);
        }
        
        const document = {
            fileName,
            content,
            documentType,
            uploadDate: new Date().toISOString(),
            wordCount: content.split(/\s+/).length,
            summary: content.substring(0, 500) + (content.length > 500 ? '...' : '')
        };
        
        trainingDocuments.get(chatKey).push(document);
        
        // Keep only last 20 documents per user to prevent memory bloat
        const userDocs = trainingDocuments.get(chatKey);
        if (userDocs.length > 20) {
            trainingDocuments.set(chatKey, userDocs.slice(-20));
        }
        
        // Clean up temporary file
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        
        return {
            success: true,
            wordCount: document.wordCount,
            summary: document.summary
        };
        
    } catch (error) {
        console.error('Process training document error:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Search training documents for relevant content
 */
function searchTrainingDocuments(chatId, searchQuery) {
    try {
        const chatKey = String(chatId);
        const userDocs = trainingDocuments.get(chatKey) || [];
        
        if (userDocs.length === 0) {
            return '';
        }
        
        const relevantContent = [];
        const queryLower = searchQuery.toLowerCase();
        
        userDocs.forEach(doc => {
            // Simple keyword matching - could be enhanced with vector search
            if (doc.content.toLowerCase().includes(queryLower) || 
                doc.fileName.toLowerCase().includes(queryLower) ||
                doc.documentType.toLowerCase().includes(queryLower)) {
                
                // Extract relevant snippets around the keyword
                const sentences = doc.content.split(/[.!?]+/);
                const relevantSentences = sentences.filter(sentence => 
                    sentence.toLowerCase().includes(queryLower)
                ).slice(0, 3); // Max 3 sentences per document
                
                if (relevantSentences.length > 0) {
                    relevantContent.push({
                        fileName: doc.fileName,
                        snippets: relevantSentences.map(s => s.trim()).filter(s => s.length > 20)
                    });
                }
            }
        });
        
        if (relevantContent.length === 0) {
            return '';
        }
        
        let contextString = '\n\nRelevant information from your uploaded documents:\n';
        relevantContent.forEach(doc => {
            contextString += `\nFrom "${doc.fileName}":\n`;
            doc.snippets.forEach(snippet => {
                contextString += `- ${snippet}\n`;
            });
        });
        
        return contextString;
        
    } catch (error) {
        console.error('Search training documents error:', error.message);
        return '';
    }
}

/**
 * Get all training documents summary
 */
function getTrainingDocumentsSummary(chatId) {
    try {
        const chatKey = String(chatId);
        const userDocs = trainingDocuments.get(chatKey) || [];
        
        if (userDocs.length === 0) {
            return 'No training documents uploaded yet.';
        }
        
        let summary = `📚 **Your Training Documents (${userDocs.length}):**\n\n`;
        
        userDocs.forEach((doc, index) => {
            summary += `${index + 1}. **${doc.fileName}**\n`;
            summary += `   Type: ${doc.documentType}\n`;
            summary += `   Words: ${doc.wordCount.toLocaleString()}\n`;
            summary += `   Uploaded: ${new Date(doc.uploadDate).toLocaleDateString()}\n`;
            summary += `   Preview: ${doc.summary.substring(0, 100)}...\n\n`;
        });
        
        return summary;
        
    } catch (error) {
        console.error('Get training summary error:', error.message);
        return 'Error retrieving training documents.';
    }
}

/**
 * Build training context for GPT responses
 */
function buildTrainingContext(chatId, userMessage) {
    try {
        // Search for relevant content based on user's message
        const relevantContent = searchTrainingDocuments(chatId, userMessage);
        
        if (relevantContent) {
            return relevantContent + '\n\nUse this information from the user\'s documents to provide more personalized and informed responses.';
        }
        
        return '';
        
    } catch (error) {
        console.error('Build training context error:', error.message);
        return '';
    }
}

/**
 * Clear all training documents for a user
 */
function clearTrainingDocuments(chatId) {
    try {
        const chatKey = String(chatId);
        trainingDocuments.delete(chatKey);
        return true;
    } catch (error) {
        console.error('Clear training documents error:', error.message);
        return false;
    }
}

module.exports = {
    processTrainingDocument,
    searchTrainingDocuments,
    getTrainingDocumentsSummary,
    buildTrainingContext,
    clearTrainingDocuments
};
