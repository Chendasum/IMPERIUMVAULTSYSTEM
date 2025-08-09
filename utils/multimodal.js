// utils/multimodal.js - Strategic Commander Multimodal Capabilities (COMPLETE FIXED VERSION)
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { OpenAI } = require('openai');

const openai = new OpenAI({ 
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 300000 // Extended timeout for comprehensive processing
});

/**
 * 🎤 Process voice messages with Strategic Commander intelligence
 */
async function processVoiceMessage(bot, fileId, chatId) {
    try {
        console.log('🎤 Processing voice message with Strategic Commander...');
        
        // Get file info from Telegram
        const file = await bot.getFile(fileId);
        const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;
        
        // Download voice file
        const response = await axios.get(fileUrl, { responseType: 'stream' });
        const tempFilePath = path.join(__dirname, '../temp', `voice_${Date.now()}.ogg`);
        
        // Ensure temp directory exists
        if (!fs.existsSync(path.dirname(tempFilePath))) {
            fs.mkdirSync(path.dirname(tempFilePath), { recursive: true });
        }
        
        // Save voice file
        const writer = fs.createWriteStream(tempFilePath);
        response.data.pipe(writer);
        
        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
        
        // Transcribe with Whisper
        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(tempFilePath),
            model: "whisper-1",
            language: "en", // Optimize for English
            temperature: 0.0 // More accurate transcription
        });
        
        // Clean up temp file
        fs.unlinkSync(tempFilePath);
        
        console.log('✅ Voice transcribed for Strategic Commander:', transcription.text);
        return transcription.text;
        
    } catch (error) {
        console.error('Strategic Commander voice processing error:', error.message);
        return `❌ **Voice Processing Error:** ${error.message}`;
    }
}

/**
 * 🖼️ Process images with Strategic Commander financial analysis
 */
async function processImageMessage(bot, fileId, chatId, caption = '') {
    try {
        console.log('🖼️ Processing image with Strategic Commander analysis...');
        
        // Get file info from Telegram
        const file = await bot.getFile(fileId);
        const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;
        
        console.log('📎 Image file URL:', fileUrl);
        console.log('📊 Image file size:', file.file_size, 'bytes');
        
        // Download image
        const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
        const base64Image = Buffer.from(response.data).toString('base64');
        
        console.log('🔧 Image converted to base64, length:', base64Image.length);
        
        // Strategic Commander image analysis prompt
        const strategicPrompt = caption ? 
            `As Strategic Commander of IMPERIUM VAULT SYSTEM, analyze this image with institutional expertise. User caption: "${caption}". 

Provide strategic analysis focusing on:
- Financial charts, market data, or economic indicators if present
- Strategic documents, reports, or deal structures
- Investment opportunities or market intelligence
- Risk factors or strategic considerations
- Any actionable strategic insights for portfolio management

Execute comprehensive institutional-grade analysis.` :
            
            `As Strategic Commander of IMPERIUM VAULT SYSTEM, analyze this image with institutional expertise.

Focus on identifying:
- Financial data, charts, or market information
- Strategic documents or investment materials
- Economic indicators or market signals
- Investment opportunities or risks
- Any strategic intelligence relevant to portfolio management

Provide detailed strategic assessment with actionable insights.`;
            
        const visionResponse = await openai.chat.completions.create({
            model: "gpt-4o", // ✅ CORRECT MODEL
            messages: [
                {
                    role: "system",
                    content: "You are the Strategic Commander providing institutional-quality analysis. Focus on financial, strategic, and investment insights from visual content."
                },
                {
                    role: "user",
                    content: [
                        { type: "text", text: strategicPrompt },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/jpeg;base64,${base64Image}`,
                                detail: "high" // ✅ HIGH DETAIL for better analysis
                            }
                        }
                    ],
                },
            ],
            max_tokens: 4096, // ✅ CORRECT PARAMETER
            temperature: 0.7 // ✅ OPTIMIZED TEMPERATURE
        });
        
        const analysis = visionResponse.choices[0].message.content;
        console.log('✅ Image analyzed by Strategic Commander');
        console.log('📊 Analysis length:', analysis.length, 'characters');
        
        return analysis;
        
    } catch (error) {
        console.error('Strategic Commander image processing error:', error.message);
        
        // ✅ ENHANCED ERROR HANDLING
        if (error.message.includes('model')) {
            return `❌ **Image Analysis Error:** Model issue - ${error.message}. Verify GPT-4o access.`;
        } else if (error.message.includes('API key')) {
            return `❌ **Image Analysis Error:** API key issue. Check OPENAI_API_KEY environment variable.`;
        } else if (error.message.includes('timeout')) {
            return `❌ **Image Analysis Error:** Request timeout. Please try with a smaller image.`;
        } else {
            return `❌ **Image Analysis Error:** ${error.message}`;
        }
    }
}

/**
 * 📄 Process documents with Strategic Commander analysis (ENHANCED VERSION)
 */
async function processDocumentMessage(bot, fileId, chatId, fileName) {
    try {
        console.log('📄 Processing document with Strategic Commander:', fileName);
        
        // Get file info from Telegram
        const file = await bot.getFile(fileId);
        const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;
        
        console.log('📎 Document URL:', fileUrl);
        console.log('📊 Document size:', file.file_size, 'bytes');
        
        // Download document
        const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
        const tempFilePath = path.join(__dirname, '../temp', `doc_${Date.now()}_${fileName}`);
        
        // Ensure temp directory exists
        if (!fs.existsSync(path.dirname(tempFilePath))) {
            fs.mkdirSync(path.dirname(tempFilePath), { recursive: true });
            console.log('📁 Created temp directory');
        }
        
        fs.writeFileSync(tempFilePath, response.data);
        console.log('💾 Document saved to:', tempFilePath);
        
        let extractedText = '';
        const ext = path.extname(fileName).toLowerCase();
        console.log('🔍 Processing file type:', ext);
        
        // ✅ ENHANCED DOCUMENT PROCESSING
        if (ext === '.txt' || ext === '.md') {
            console.log('📝 Processing text file...');
            extractedText = fs.readFileSync(tempFilePath, 'utf8');
            console.log('✅ Text file processed, length:', extractedText.length);
            
        } else if (ext === '.pdf') {
            console.log('📕 Processing PDF file...');
            try {
                const pdfParse = require('pdf-parse');
                const pdfBuffer = fs.readFileSync(tempFilePath);
                const pdfData = await pdfParse(pdfBuffer);
                extractedText = pdfData.text;
                console.log('✅ PDF parsed successfully');
                console.log('📊 PDF info - Pages:', pdfData.numpages, 'Text length:', extractedText.length);
            } catch (pdfError) {
                console.error('❌ PDF parsing failed:', pdfError.message);
                extractedText = `❌ **PDF Processing Error:** ${pdfError.message}\n\n**Possible solutions:**\n- Ensure PDF is not password-protected\n- Try a different PDF file\n- Install pdf-parse: npm install pdf-parse`;
            }
            
        } else if (ext === '.docx' || ext === '.doc') {
            console.log('📘 Processing Word document...');
            try {
                const mammoth = require('mammoth');
                const result = await mammoth.extractRawText({ path: tempFilePath });
                extractedText = result.value;
                console.log('✅ DOCX parsed successfully, length:', extractedText.length);
                
                if (result.messages.length > 0) {
                    console.log('⚠️ DOCX parsing warnings:', result.messages);
                }
            } catch (docxError) {
                console.error('❌ DOCX parsing failed:', docxError.message);
                extractedText = `❌ **DOCX Processing Error:** ${docxError.message}\n\n**Possible solutions:**\n- Ensure Word document is not corrupted\n- Try saving as .txt or .pdf format\n- Install mammoth: npm install mammoth`;
            }
            
        } else if (ext === '.xlsx' || ext === '.xls') {
            console.log('📊 Processing Excel file...');
            try {
                const XLSX = require('xlsx');
                const workbook = XLSX.readFile(tempFilePath);
                
                let allSheetsText = `📊 **EXCEL WORKBOOK ANALYSIS**\n\n`;
                allSheetsText += `**Sheets Found:** ${workbook.SheetNames.length}\n\n`;
                
                workbook.SheetNames.forEach((sheetName, index) => {
                    const sheet = workbook.Sheets[sheetName];
                    const sheetData = XLSX.utils.sheet_to_csv(sheet);
                    
                    allSheetsText += `**=== SHEET ${index + 1}: ${sheetName} ===**\n`;
                    allSheetsText += sheetData + '\n\n';
                });
                
                extractedText = allSheetsText;
                console.log('✅ Excel parsed successfully');
                console.log('📊 Excel info - Sheets:', workbook.SheetNames.length, 'Total length:', extractedText.length);
            } catch (xlsxError) {
                console.error('❌ Excel parsing failed:', xlsxError.message);
                extractedText = `❌ **Excel Processing Error:** ${xlsxError.message}\n\n**Possible solutions:**\n- Ensure Excel file is not corrupted\n- Try saving as .csv format\n- Install xlsx: npm install xlsx`;
            }
            
        } else if (ext === '.csv') {
            console.log('📈 Processing CSV file...');
            try {
                extractedText = fs.readFileSync(tempFilePath, 'utf8');
                
                // Add CSV formatting for better analysis
                const lines = extractedText.split('\n');
                const formattedCsv = `📈 **CSV DATA ANALYSIS**\n\n**Rows:** ${lines.length}\n**Columns:** ${lines[0] ? lines[0].split(',').length : 0}\n\n**Data:**\n${extractedText}`;
                extractedText = formattedCsv;
                
                console.log('✅ CSV processed successfully, rows:', lines.length);
            } catch (csvError) {
                console.error('❌ CSV reading failed:', csvError.message);
                extractedText = `❌ **CSV Processing Error:** ${csvError.message}`;
            }
            
        } else if (ext === '.pptx' || ext === '.ppt') {
            console.log('📊 Processing PowerPoint file...');
            try {
                // For PowerPoint, try office-parser if available
                const officeParser = require('office-parser');
                extractedText = await new Promise((resolve, reject) => {
                    officeParser.parseOffice(tempFilePath, (data, err) => {
                        if (err) reject(err);
                        else resolve(data);
                    });
                });
                console.log('✅ PowerPoint parsed successfully, length:', extractedText.length);
            } catch (pptError) {
                console.error('❌ PowerPoint parsing failed:', pptError.message);
                extractedText = `❌ **PowerPoint Processing Error:** ${pptError.message}\n\n**Possible solutions:**\n- Save PowerPoint as PDF and re-upload\n- Install office-parser: npm install office-parser\n- PowerPoint processing requires additional dependencies`;
            }
            
        } else if (ext === '.json') {
            console.log('📋 Processing JSON file...');
            try {
                const rawText = fs.readFileSync(tempFilePath, 'utf8');
                const jsonData = JSON.parse(rawText);
                extractedText = `📋 **JSON DATA ANALYSIS**\n\n**Structure:**\n${JSON.stringify(jsonData, null, 2)}`;
                console.log('✅ JSON parsed successfully');
            } catch (jsonError) {
                console.error('❌ JSON parsing failed:', jsonError.message);
                extractedText = `❌ **JSON Processing Error:** ${jsonError.message}`;
            }
            
        } else {
            // Try reading as text for other formats
            console.log('❓ Unknown file type, attempting text read...');
            try {
                extractedText = fs.readFileSync(tempFilePath, 'utf8');
                console.log('✅ Read as text successfully, length:', extractedText.length);
            } catch (textError) {
                console.error('❌ Text reading failed:', textError.message);
                extractedText = `❌ **Unsupported File Type:** ${ext.toUpperCase()}\n\n**Supported formats:**\n- Text: .txt, .md\n- Documents: .pdf, .docx, .doc\n- Spreadsheets: .xlsx, .xls, .csv\n- Presentations: .pptx, .ppt\n- Data: .json\n\n**Error:** ${textError.message}`;
            }
        }
        
        // Clean up temp file
        try {
            fs.unlinkSync(tempFilePath);
            console.log('🗑️ Temp file cleaned up');
        } catch (cleanupError) {
            console.error('⚠️ Cleanup warning:', cleanupError.message);
        }
        
        // Validate extracted content
        if (!extractedText || extractedText.trim().length === 0) {
            extractedText = `❌ **No Content Extracted**\n\nFile: ${fileName}\nType: ${ext.toUpperCase()}\n\nThe file might be:\n- Empty or corrupted\n- Password-protected\n- In an unsupported format\n- Requiring additional parsing libraries`;
        }
        
        console.log('📊 Final extracted text length:', extractedText.length);
        
        // ✅ ENHANCED STRATEGIC COMMANDER DOCUMENT ANALYSIS
        const analysisPrompt = `🏛️ **STRATEGIC COMMANDER DOCUMENT ANALYSIS**

**Document Intelligence:**
- File: ${fileName}
- Type: ${ext.toUpperCase()}
- Content Length: ${extractedText.length} characters
- Processing Status: ${extractedText.includes('❌') ? 'ERROR' : 'SUCCESS'}

**Strategic Analysis Request:**
Execute comprehensive institutional-grade analysis of this document content. Focus on extracting strategic intelligence and actionable insights.

**Document Content:**
${extractedText.substring(0, 50000)}${extractedText.length > 50000 ? '\n\n[Content truncated for analysis - full document was processed]' : ''}

**Analysis Requirements:**
1. **Document Summary:** What type of document is this and what is its primary purpose?
2. **Key Strategic Findings:** Extract the most important information, data points, or insights
3. **Financial Intelligence:** Identify any financial data, metrics, projections, or market information
4. **Investment Implications:** How does this information impact investment decisions or strategic positioning?
5. **Risk Factors:** Identify any potential risks, concerns, or red flags mentioned
6. **Actionable Recommendations:** Provide specific strategic recommendations based on the content
7. **Data Extraction:** If spreadsheet/financial data, summarize key numbers and trends

Execute institutional-quality analysis with commanding strategic authority.`;

        const analysis = await openai.chat.completions.create({
            model: "gpt-4o", // ✅ CORRECT MODEL
            messages: [
                {
                    role: "system",
                    content: `You are the Strategic Commander of IMPERIUM VAULT SYSTEM providing institutional-quality document analysis.

DOCUMENT ANALYSIS EXPERTISE:
- Financial reports and investment documentation
- Market research and economic analysis
- Deal structures and investment opportunities
- Risk assessments and due diligence materials
- Strategic planning and portfolio management documents
- Excel financial models and data analysis
- PowerPoint presentations and strategic plans
- Legal documents and contracts
- Market data and research reports

ANALYSIS REQUIREMENTS:
- Provide comprehensive strategic insights
- Identify key financial metrics and strategic data
- Assess investment opportunities or risks
- Extract actionable strategic intelligence
- Offer specific strategic recommendations when appropriate
- Summarize key data points and trends from spreadsheets
- Analyze strategic frameworks from presentations
- Process financial models and projections

COMMUNICATION STYLE:
- Write with institutional authority and expertise
- Use specific numbers, data, and actionable recommendations
- Provide comprehensive analysis using full available tokens
- Structure analysis clearly with strategic headers
- Never use wishy-washy language - command with authority

Execute institutional-grade document analysis with strategic authority.`
                },
                {
                    role: "user",
                    content: analysisPrompt
                }
            ],
            max_tokens: 4096, // ✅ CORRECT PARAMETER
            temperature: 0.6 // ✅ SLIGHTLY LOWER for document analysis accuracy
        });
        
        const analysisResult = analysis.choices[0].message.content;
        console.log('✅ Document analyzed by Strategic Commander');
        console.log('📊 Analysis result length:', analysisResult.length);
        
        return {
            analysis: analysisResult,
            extractedText: extractedText.substring(0, 2000) + (extractedText.length > 2000 ? '...' : ''),
            wordCount: extractedText.split(/\s+/).filter(word => word.length > 0).length,
            fileType: ext.toUpperCase(),
            fileName: fileName,
            success: !extractedText.includes('❌'),
            originalLength: extractedText.length
        };
        
    } catch (error) {
        console.error('❌ Strategic Commander document processing error:', error.message);
        console.error('📍 Error stack:', error.stack);
        
        // Clean up temp file if it exists
        try {
            const tempFilePath = path.join(__dirname, '../temp', `doc_${Date.now()}_${fileName}`);
            if (fs.existsSync(tempFilePath)) {
                fs.unlinkSync(tempFilePath);
            }
        } catch (cleanupError) {
            // Ignore cleanup errors
        }
        
        // ✅ ENHANCED ERROR REPORTING
        let errorMessage = `❌ **STRATEGIC COMMANDER DOCUMENT ERROR**\n\n`;
        errorMessage += `**File:** ${fileName}\n`;
        errorMessage += `**Error:** ${error.message}\n\n`;
        
        if (error.message.includes('ENOENT') || error.message.includes('Cannot find module')) {
            errorMessage += `**Issue:** Required parsing library not installed.\n\n**Solution:**\n`;
            errorMessage += `• For PDF: npm install pdf-parse\n`;
            errorMessage += `• For DOCX: npm install mammoth\n`;
            errorMessage += `• For Excel: npm install xlsx\n`;
            errorMessage += `• For PowerPoint: npm install office-parser\n`;
        } else if (error.message.includes('timeout')) {
            errorMessage += `**Issue:** Document processing timeout.\n**Solution:** Try a smaller file or simpler format.`;
        } else if (error.message.includes('permission')) {
            errorMessage += `**Issue:** File access permission denied.\n**Solution:** Check file permissions and try again.`;
        } else {
            errorMessage += `**Troubleshooting:**\n`;
            errorMessage += `• Ensure file is not corrupted\n`;
            errorMessage += `• Try converting to PDF or TXT format\n`;
            errorMessage += `• Check file size (max 20MB recommended)\n`;
        }
        
        return {
            analysis: errorMessage,
            extractedText: null,
            wordCount: 0,
            fileType: path.extname(fileName).toUpperCase(),
            fileName: fileName,
            success: false,
            error: error.message
        };
    }
}

/**
 * 🎥 Process video messages with Strategic Commander analysis
 */
async function processVideoMessage(bot, fileId, chatId, caption = '') {
    try {
        console.log('🎥 Processing video with Strategic Commander...');
        
        // Get file info from Telegram
        const file = await bot.getFile(fileId);
        const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;
        
        console.log('📎 Video URL:', fileUrl);
        console.log('📊 Video size:', file.file_size, 'bytes');
        
        // Download video (for metadata only)
        const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
        const tempFilePath = path.join(__dirname, '../temp', `video_${Date.now()}.mp4`);
        
        // Ensure temp directory exists
        if (!fs.existsSync(path.dirname(tempFilePath))) {
            fs.mkdirSync(path.dirname(tempFilePath), { recursive: true });
        }
        
        fs.writeFileSync(tempFilePath, response.data);
        
        // Get video info
        const stats = fs.statSync(tempFilePath);
        const videoInfo = {
            size: Math.round(stats.size / 1024) + ' KB',
            caption: caption || 'No caption provided'
        };
        
        // Clean up temp file
        fs.unlinkSync(tempFilePath);
        
        // Strategic Commander video analysis prompt
        const strategicPrompt = caption ? 
            `As Strategic Commander of IMPERIUM VAULT SYSTEM, acknowledge receipt of video content (${videoInfo.size}) with caption: "${caption}".

Strategic Analysis Protocol:
- If the caption indicates financial content (charts, presentations, market data), provide strategic assessment guidance
- If related to Cambodia business or investment opportunities, offer strategic market intelligence
- If concerning portfolio management or trading, provide institutional-level strategic context
- Focus on actionable strategic insights based on the described content

Execute strategic response with institutional authority.` :
            
            `As Strategic Commander of IMPERIUM VAULT SYSTEM, acknowledge receipt of video content (${videoInfo.size}).

Strategic Protocol:
Video content received for strategic analysis. To provide comprehensive institutional-grade assessment, please describe the video content focus:

- Financial charts or market analysis presentations?
- Cambodia business or investment opportunity documentation?
- Trading strategy or portfolio management content?
- Economic analysis or strategic planning materials?

Provide context for optimal strategic intelligence extraction.`;
            
        const analysis = await openai.chat.completions.create({
            model: "gpt-4o", // ✅ CORRECT MODEL
            messages: [
                {
                    role: "system",
                    content: "You are the Strategic Commander providing institutional-quality analysis. Focus on strategic intelligence and actionable insights."
                },
                {
                    role: "user",
                    content: strategicPrompt
                }
            ],
            max_tokens: 2048, // ✅ CORRECT PARAMETER
            temperature: 0.7 // ✅ OPTIMIZED TEMPERATURE
        });
        
        console.log('✅ Video processed by Strategic Commander');
        return analysis.choices[0].message.content;
        
    } catch (error) {
        console.error('Strategic Commander video processing error:', error.message);
        return `❌ **Video Processing Error:** ${error.message}`;
    }
}

/**
 * 📊 Process financial charts and market data images
 */
async function processFinancialChart(bot, fileId, chatId, chartType = 'market_data') {
    try {
        console.log('📊 Processing financial chart with Strategic Commander...');
        
        // Get file info from Telegram
        const file = await bot.getFile(fileId);
        const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;
        
        // Download image
        const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
        const base64Image = Buffer.from(response.data).toString('base64');
        
        // Specialized financial chart analysis
        const chartAnalysisPrompt = `As Strategic Commander of IMPERIUM VAULT SYSTEM, execute comprehensive analysis of this financial chart/market data.

STRATEGIC CHART ANALYSIS PROTOCOL:
- Identify chart type (price action, technical indicators, economic data, portfolio performance)
- Extract key price levels, support/resistance, trends, and patterns
- Assess strategic implications for portfolio positioning
- Identify entry/exit opportunities or risk factors
- Provide specific strategic trading or investment recommendations
- Calculate risk/reward ratios where applicable
- Suggest position sizing and timing considerations

Execute institutional-grade technical and strategic analysis with specific actionable directives.`;
            
        const chartResponse = await openai.chat.completions.create({
            model: "gpt-4o", // ✅ CORRECT MODEL
            messages: [
                {
                    role: "system",
                    content: "You are the Strategic Commander specializing in financial chart analysis and market intelligence. Provide precise technical analysis with strategic positioning recommendations."
                },
                {
                    role: "user",
                    content: [
                        { type: "text", text: chartAnalysisPrompt },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/jpeg;base64,${base64Image}`,
                                detail: "high" // ✅ HIGH DETAIL for better analysis
                            }
                        }
                    ],
                },
            ],
            max_tokens: 4096, // ✅ CORRECT PARAMETER
            temperature: 0.7 // ✅ OPTIMIZED TEMPERATURE
        });
        
        console.log('✅ Financial chart analyzed by Strategic Commander');
        return chartResponse.choices[0].message.content;
        
    } catch (error) {
        console.error('Strategic Commander chart analysis error:', error.message);
        return `❌ **Chart Analysis Error:** ${error.message}`;
    }
}

/**
 * 🔍 Test Document Processing Capabilities
 */
async function testDocumentProcessing() {
    console.log("🔍 Testing Strategic Commander document processing capabilities...");
    
    const testResults = {
        "pdf-parse": false,
        "mammoth": false,
        "xlsx": false,
        "office-parser": false
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
    
    // Test Office parsing
    try {
        require('office-parser');
        testResults["office-parser"] = true;
        console.log("✅ Office parsing available (office-parser)");
    } catch (e) {
        console.log("❌ Office parsing not available - run: npm install office-parser");
    }
    
    const availableCount = Object.values(testResults).filter(Boolean).length;
    console.log(`📊 Document processing status: ${availableCount}/4 parsers available`);
    
    return testResults;
}

module.exports = {
    processVoiceMessage,
    processImageMessage,
    processDocumentMessage,
    processVideoMessage,
    processFinancialChart,
    testDocumentProcessing // ✅ ADDED: Test function
};
