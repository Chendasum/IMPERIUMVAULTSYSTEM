// 🔧 COMPLETE REWRITE: utils/multimodal.js - Fixed for GPT-5 + Claude Opus 4.1
// Replace your entire utils/multimodal.js file with this working version

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const { OpenAI } = require('openai');

// Initialize OpenAI with proper configuration
const openai = new OpenAI({ 
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 60000,
    maxRetries: 3
});

/**
 * 🎤 FIXED: Process voice messages with Whisper API
 */
async function processVoiceMessage(bot, fileId, chatId) {
    try {
        console.log('🎤 Processing voice message with enhanced AI...');
        
        // Get file from Telegram
        const fileLink = await bot.getFileLink(fileId);
        const response = await fetch(fileLink);
        
        if (!response.ok) {
            throw new Error(`Failed to download voice file: HTTP ${response.status}`);
        }
        
        const buffer = await response.buffer();
        
        // Create a File object for OpenAI Whisper API
        const audioFile = new File([buffer], "voice.ogg", { type: "audio/ogg" });
        
        // Use OpenAI Whisper for transcription
        const transcription = await openai.audio.transcriptions.create({
            file: audioFile,
            model: "whisper-1",
            language: "en",
            temperature: 0.2
        });
        
        const transcribedText = transcription.text;
        console.log(`✅ Voice transcription successful: ${transcribedText.length} characters`);
        
        return transcribedText;
        
    } catch (error) {
        console.error("❌ Voice transcription error:", error.message);
        throw new Error(`Voice transcription failed: ${error.message}`);
    }
}

/**
 * 🖼️ FIXED: Process images with GPT-5 vision
 */
async function processImageMessage(bot, fileId, chatId, caption = null) {
    try {
        console.log('🖼️ Processing image with GPT-5 enhanced AI vision...');
        
        // Get image file from Telegram
        const fileLink = await bot.getFileLink(fileId);
        const response = await fetch(fileLink);
        
        if (!response.ok) {
            throw new Error(`Failed to download image: HTTP ${response.status}`);
        }
        
        const buffer = await response.buffer();
        const base64Image = buffer.toString('base64');
        
        // Enhanced prompt based on whether caption is provided
        const analysisPrompt = caption ? 
            `Analyze this image in detail as the Strategic Commander of IMPERIUM VAULT SYSTEM. The user provided this caption: "${caption}". 
             
             Please provide a comprehensive analysis including:
             1. Overall description of what you see in the image
             2. Key objects, people, text, or elements present
             3. Colors, composition, and visual style analysis
             4. Any financial charts, data, or business content visible
             5. Text, numbers, or information that can be extracted
             6. Context or setting of the image
             7. How the image relates to the user's caption
             8. Strategic insights or actionable intelligence if applicable
             
             Be thorough, detailed, and provide institutional-quality analysis.` :
            
            `Analyze this image in comprehensive detail as the Strategic Commander of IMPERIUM VAULT SYSTEM. Please provide:
             
             1. Overall description of the scene, objects, or subject matter
             2. Key elements: people, objects, text, numbers, charts, or data
             3. Colors, lighting, composition, and visual quality analysis
             4. Any text, signs, financial data, or business information visible
             5. Setting, location, or contextual clues
             6. Style and type of image (photo, chart, document, artwork, etc.)
             7. Interesting details, patterns, or notable features
             8. Strategic intelligence or business relevance if applicable
             9. Potential purpose or context of the image
             
             Provide thorough institutional-grade analysis with strategic insights.`;
        
        // Use GPT-5 vision for analysis with proper error handling
        let analysis;
        try {
            const visionResponse = await openai.chat.completions.create({
                model: "gpt-5",  // Your GPT-5 model
                messages: [
                    {
                        role: "system",
                        content: "You are the Strategic Commander of IMPERIUM VAULT SYSTEM providing institutional-quality image analysis. Focus on extracting maximum intelligence and actionable insights from visual content."
                    },
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: analysisPrompt
                            },
                            {
                                type: "image_url",
                                image_url: {
                                    url: `data:image/jpeg;base64,${base64Image}`,
                                    detail: "high"
                                }
                            }
                        ]
                    }
                ],
                max_completion_tokens: 1500,  // 🔧 FIXED: Correct parameter name
                temperature: 0.7
            });
            
            analysis = visionResponse.choices[0]?.message?.content;
            
        } catch (gpt5Error) {
            console.log("⚠️ GPT-5 vision failed, trying GPT-4 fallback:", gpt5Error.message);
            
            // Fallback to GPT-4 vision if GPT-5 fails
            const fallbackResponse = await openai.chat.completions.create({
                model: "gpt-4o",  // Stable fallback model
                messages: [
                    {
                        role: "system",
                        content: "You are the Strategic Commander providing institutional-quality image analysis."
                    },
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: analysisPrompt
                            },
                            {
                                type: "image_url",
                                image_url: {
                                    url: `data:image/jpeg;base64,${base64Image}`,
                                    detail: "high"
                                }
                            }
                        ]
                    }
                ],
                max_completion_tokens: 1500,
                temperature: 0.7
            });
            
            analysis = `**GPT-4 Analysis** (GPT-5 unavailable)\n\n${fallbackResponse.choices[0]?.message?.content}`;
        }
        
        if (!analysis || analysis.length === 0) {
            throw new Error("Image analysis returned empty result");
        }
        
        console.log(`✅ Image analysis successful: ${analysis.length} characters`);
        return analysis;
        
    } catch (error) {
        console.error("❌ Image processing error:", error.message);
        throw new Error(`Image analysis failed: ${error.message}`);
    }
}

/**
 * 📄 COMPLETELY FIXED: Process documents with full file support
 */
async function processDocumentMessage(bot, fileId, chatId, fileName) {
    try {
        console.log(`📄 Processing document: ${fileName}`);
        
        // Get file from Telegram
        const fileLink = await bot.getFileLink(fileId);
        const response = await fetch(fileLink);
        
        if (!response.ok) {
            throw new Error(`Failed to download document: HTTP ${response.status}`);
        }
        
        const buffer = await response.buffer();
        const fileExtension = fileName.toLowerCase().split('.').pop();
        
        let content = '';
        let extractionMethod = 'unknown';
        
        // Enhanced file type handling with proper extraction
        try {
            if (['txt', 'md', 'json', 'csv'].includes(fileExtension)) {
                content = buffer.toString('utf8');
                extractionMethod = 'direct_text';
                
            } else if (fileExtension === 'pdf') {
                content = await extractTextFromPDFBuffer(buffer);
                extractionMethod = 'pdf_extraction';
                
            } else if (['doc', 'docx'].includes(fileExtension)) {
                content = await extractTextFromWordBuffer(buffer);
                extractionMethod = 'word_extraction';
                
            } else if (['xls', 'xlsx'].includes(fileExtension)) {
                content = await extractTextFromExcelBuffer(buffer);
                extractionMethod = 'excel_extraction';
                
            } else if (['rtf'].includes(fileExtension)) {
                // Basic RTF text extraction
                content = buffer.toString('utf8').replace(/\\[a-z]+\d*\s?/g, '').replace(/[{}]/g, '');
                extractionMethod = 'rtf_basic';
                
            } else {
                // Try to read as text for other formats
                content = buffer.toString('utf8');
                extractionMethod = 'fallback_text';
                console.log(`⚠️ Attempting to read ${fileExtension} file as text`);
            }
        } catch (extractionError) {
            throw new Error(`File extraction failed for ${fileExtension}: ${extractionError.message}`);
        }
        
        if (content.length === 0) {
            throw new Error("Document appears to be empty or unreadable");
        }
        
        // Clean up content for analysis
        content = content.trim();
        const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
        
        console.log(`📊 Document extracted: ${wordCount} words, ${content.length} characters using ${extractionMethod}`);
        
        // 🔧 ENHANCED: Intelligent analysis routing based on document size
        let analysis;
        
        if (content.length > 15000) {
            // For very large documents, use Claude for better handling
            analysis = await analyzeLargeDocumentWithClaude(content, fileName, fileExtension);
            
        } else if (content.length > 8000) {
            // For medium documents, use GPT-5
            analysis = await analyzeMediumDocumentWithGPT5(content, fileName, fileExtension);
            
        } else {
            // For smaller documents, use dual AI analysis
            analysis = await analyzeSmallDocumentDualAI(content, fileName, fileExtension);
        }
        
        if (!analysis || analysis.length === 0) {
            throw new Error("Document analysis returned empty result");
        }
        
        console.log(`✅ Document analysis successful: ${analysis.length} characters`);
        
        return {
            success: true,
            analysis: analysis,
            extractionMethod: extractionMethod,
            contentLength: content.length,
            wordCount: wordCount
        };
        
    } catch (error) {
        console.error("❌ Document processing error:", error.message);
        return {
            success: false,
            error: error.message,
            analysis: `❌ Document processing failed: ${error.message}`
        };
    }
}

/**
 * 🎥 ENHANCED: Process video messages 
 */
async function processVideoMessage(bot, fileId, chatId, caption = '') {
    try {
        console.log('🎥 Processing video with Strategic Commander...');
        
        // Get file info from Telegram
        const file = await bot.getFile(fileId);
        const fileSizeKB = Math.round(file.file_size / 1024);
        
        // Strategic Commander video analysis prompt
        const strategicPrompt = caption ? 
            `As Strategic Commander of IMPERIUM VAULT SYSTEM, acknowledge receipt of video content (${fileSizeKB} KB) with caption: "${caption}".

Strategic Video Analysis Protocol:
- If the caption indicates financial content (charts, presentations, market data), provide strategic assessment guidance
- If related to Cambodia business or investment opportunities, offer strategic market intelligence  
- If concerning portfolio management or trading, provide institutional-level strategic context
- Focus on actionable strategic insights based on the described content

Execute strategic response with institutional authority.` :
            
            `As Strategic Commander of IMPERIUM VAULT SYSTEM, acknowledge receipt of video content (${fileSizeKB} KB).

Strategic Protocol:
Video content received for strategic analysis. To provide comprehensive institutional-grade assessment, please describe the video content focus:

- Financial charts or market analysis presentations?
- Cambodia business or investment opportunity documentation?
- Trading strategy or portfolio management content?
- Economic analysis or strategic planning materials?

Provide context for optimal strategic intelligence extraction.`;
            
        // Import GPT analysis function
        const { getGptAnalysis } = require('./openaiClient');
        
        const analysis = await getGptAnalysis(strategicPrompt, {
            max_completion_tokens: 1000,
            temperature: 0.7,
            model: "gpt-5"
        });
        
        console.log('✅ Video processed by Strategic Commander');
        return analysis;
        
    } catch (error) {
        console.error('Strategic Commander video processing error:', error.message);
        return `❌ **Video Processing Error:** ${error.message}`;
    }
}

// 🔧 NEW: PDF Text Extraction Function
async function extractTextFromPDFBuffer(buffer) {
    try {
        const pdf = require('pdf-parse');
        const data = await pdf(buffer);
        
        if (!data.text || data.text.length === 0) {
            throw new Error("PDF contains no readable text");
        }
        
        console.log(`📄 PDF extracted: ${data.numpages} pages, ${data.text.length} characters`);
        return data.text;
        
    } catch (error) {
        console.error("PDF extraction error:", error.message);
        
        if (error.message.includes('pdf-parse')) {
            throw new Error("PDF parsing library not installed. Run: npm install pdf-parse");
        }
        
        throw new Error(`PDF text extraction failed: ${error.message}`);
    }
}

// 🔧 NEW: Word Document Text Extraction Function  
async function extractTextFromWordBuffer(buffer) {
    try {
        const mammoth = require('mammoth');
        const result = await mammoth.extractRawText({ buffer: buffer });
        
        if (!result.value || result.value.length === 0) {
            throw new Error("Word document contains no readable text");
        }
        
        console.log(`📄 Word document extracted: ${result.value.length} characters`);
        
        // Log any warnings from mammoth
        if (result.messages && result.messages.length > 0) {
            console.log("⚠️ Word extraction warnings:", result.messages.map(m => m.message).join(', '));
        }
        
        return result.value;
        
    } catch (error) {
        console.error("Word extraction error:", error.message);
        
        if (error.message.includes('mammoth')) {
            throw new Error("Mammoth library not installed. Run: npm install mammoth");
        }
        
        throw new Error(`Word document extraction failed: ${error.message}`);
    }
}

// 🔧 NEW: Excel Text Extraction Function
async function extractTextFromExcelBuffer(buffer) {
    try {
        const XLSX = require('xlsx');
        const workbook = XLSX.read(buffer, { 
            type: 'buffer',
            cellText: true,
            cellDates: true
        });
        
        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
            throw new Error("Excel file contains no readable sheets");
        }
        
        let text = '';
        let totalCells = 0;
        
        workbook.SheetNames.forEach((sheetName, index) => {
            const sheet = workbook.Sheets[sheetName];
            
            // Convert sheet to CSV format for better text representation
            const csv = XLSX.utils.sheet_to_csv(sheet, {
                header: 1,
                skipHidden: false,
                blankrows: false
            });
            
            if (csv && csv.trim().length > 0) {
                text += `=== SHEET ${index + 1}: ${sheetName} ===\n`;
                text += csv;
                text += '\n\n';
                
                // Count cells for logging
                if (sheet['!ref']) {
                    const range = XLSX.utils.decode_range(sheet['!ref']);
                    totalCells += (range.e.r - range.s.r + 1) * (range.e.c - range.s.c + 1);
                }
            }
        });
        
        if (text.length === 0) {
            throw new Error("Excel file contains no readable data");
        }
        
        console.log(`📊 Excel extracted: ${workbook.SheetNames.length} sheets, ${totalCells} cells, ${text.length} characters`);
        return text;
        
    } catch (error) {
        console.error("Excel extraction error:", error.message);
        
        if (error.message.includes('xlsx') || error.message.includes('XLSX')) {
            throw new Error("XLSX library not installed. Run: npm install xlsx");
        }
        
        throw new Error(`Excel extraction failed: ${error.message}`);
    }
}

// 🔧 NEW: Large Document Analysis with Claude
async function analyzeLargeDocumentWithClaude(content, fileName, fileExtension) {
    try {
        // Import Claude analysis function
        const { getClaudeAnalysis } = require('./claudeClient');
        
        // Use first 8000 characters for analysis
        const contentSample = content.substring(0, 8000);
        const prompt = `Analyze this ${fileExtension.toUpperCase()} document "${fileName}" (showing first part due to size - total ${content.length} characters):

${contentSample}

[Document continues...]

Provide comprehensive analysis covering:
1. Document type, purpose, and scope
2. Key topics and main themes
3. Important insights and findings
4. Structure and organization
5. Data, statistics, or evidence presented
6. Conclusions and recommendations
7. Overall significance and implications
8. Summary of key takeaways

Focus on the most important aspects given this is a large document.`;
        
        const analysis = await getClaudeAnalysis(prompt, { maxTokens: 1500 });
        return `**Claude Opus 4.1 Analysis** (Large Document - ${content.length} chars)\n\n${analysis}`;
        
    } catch (error) {
        console.error("Claude analysis error:", error.message);
        throw new Error(`Large document analysis failed: ${error.message}`);
    }
}

// 🔧 NEW: Medium Document Analysis with GPT-5
async function analyzeMediumDocumentWithGPT5(content, fileName, fileExtension) {
    try {
        // Import GPT analysis function  
        const { getGptAnalysis } = require('./openaiClient');
        
        const prompt = `Analyze this ${fileExtension.toUpperCase()} document "${fileName}":

${content}

Provide detailed analysis covering:
1. Document summary and purpose
2. Key points and main themes
3. Important insights and findings
4. Structure and organization
5. Data, statistics, or evidence
6. Conclusions and recommendations
7. Strategic implications
8. Actionable takeaways`;
        
        const analysis = await getGptAnalysis(prompt, { 
            max_completion_tokens: 1200,
            temperature: 0.7,
            model: "gpt-5"
        });
        
        return `**GPT-5 Analysis** (Medium Document)\n\n${analysis}`;
        
    } catch (error) {
        console.error("GPT-5 analysis error:", error.message);
        throw new Error(`Medium document analysis failed: ${error.message}`);
    }
}

// 🔧 NEW: Small Document Dual AI Analysis
async function analyzeSmallDocumentDualAI(content, fileName, fileExtension) {
    try {
        // Import both AI functions
        const { getGptAnalysis } = require('./openaiClient');
        const { getClaudeAnalysis } = require('./claudeClient');
        
        const prompt = `Analyze this ${fileExtension.toUpperCase()} document "${fileName}":

${content}

Provide analysis covering:
1. Document summary and purpose
2. Key insights and findings
3. Important data or information
4. Structure and organization
5. Conclusions and recommendations
6. Overall assessment`;
        
        // Get both analyses in parallel
        const [gptResult, claudeResult] = await Promise.allSettled([
            getGptAnalysis(prompt, { 
                max_completion_tokens: 800,
                temperature: 0.7,
                model: "gpt-5"
            }),
            getClaudeAnalysis(prompt, { maxTokens: 800 })
        ]);
        
        // Combine successful analyses
        let combinedAnalysis = `**Dual AI Analysis: GPT-5 + Claude Opus 4.1**\n\n`;
        
        if (gptResult.status === 'fulfilled') {
            combinedAnalysis += `**GPT-5 Analysis:**\n${gptResult.value}\n\n`;
        }
        
        if (claudeResult.status === 'fulfilled') {
            combinedAnalysis += `**Claude Opus 4.1 Analysis:**\n${claudeResult.value}`;
        }
        
        // If both succeeded, add a brief synthesis
        if (gptResult.status === 'fulfilled' && claudeResult.status === 'fulfilled') {
            combinedAnalysis += `\n\n**Analysis Summary:**\nBoth AI models successfully analyzed "${fileName}". The document has been thoroughly examined from multiple perspectives providing comprehensive insights.`;
        }
        
        return combinedAnalysis;
        
    } catch (error) {
        console.error("Dual AI analysis error:", error.message);
        throw new Error(`Dual AI document analysis failed: ${error.message}`);
    }
}

/**
 * 🔍 Test Document Processing Capabilities
 */
async function testDocumentProcessing() {
    console.log("🔍 Testing document processing capabilities...");
    
    const testResults = {
        "pdf-parse": false,
        "mammoth": false,
        "xlsx": false,
        "node-fetch": false
    };
    
    // Test PDF parsing
    try {
        require('pdf-parse');
        testResults["pdf-parse"] = true;
        console.log("✅ PDF parsing available (pdf-parse)");
    } catch (e) {
        console.log("❌ PDF parsing not available - run: npm install pdf-parse");
    }
    
    // Test DOCX parsing
    try {
        require('mammoth');
        testResults["mammoth"] = true;
        console.log("✅ DOCX parsing available (mammoth)");
    } catch (e) {
        console.log("❌ DOCX parsing not available - run: npm install mammoth");
    }
    
    // Test Excel parsing
    try {
        require('xlsx');
        testResults["xlsx"] = true;
        console.log("✅ Excel parsing available (xlsx)");
    } catch (e) {
        console.log("❌ Excel parsing not available - run: npm install xlsx");
    }
    
    // Test fetch
    try {
        require('node-fetch');
        testResults["node-fetch"] = true;
        console.log("✅ File downloading available (node-fetch)");
    } catch (e) {
        console.log("❌ File downloading not available - run: npm install node-fetch");
    }
    
    const availableCount = Object.values(testResults).filter(Boolean).length;
    console.log(`📊 Document processing status: ${availableCount}/4 libraries available`);
    
    return testResults;
}

// Export all functions
module.exports = {
    processVoiceMessage,
    processImageMessage,
    processDocumentMessage,
    processVideoMessage,
    extractTextFromPDFBuffer,
    extractTextFromWordBuffer,
    extractTextFromExcelBuffer,
    analyzeLargeDocumentWithClaude,
    analyzeMediumDocumentWithGPT5,
    analyzeSmallDocumentDualAI,
    testDocumentProcessing
};
