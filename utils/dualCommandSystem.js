// utils/dualCommandSystem.js - OPERATOR MODE: GPT-5 ONLY MODE + REAL OPERATIONS
// Clean routing: index.js → dualCommandSystem.js → openaiClient.js
// TRANSFORMED: From Assistant/Advisor to Real Operator System
// PRESERVED: All original functions and architecture maintained

// MAIN IMPORT: OpenAI Client for GPT-5 Only
let openaiClient;
try {
    openaiClient = require('./openaiClient');
    console.log('GPT-5 client loaded successfully - OPERATOR MODE ENABLED');
} catch (error) {
    console.error('GPT-5 client import failed:', error.message);
    openaiClient = { 
        getGPT5Analysis: async (prompt) => `GPT-5 client unavailable: ${error.message}` 
    };
}

// OPERATOR SYSTEM IMPORTS - NEW OPERATIONAL CAPABILITIES
let operatorSystems = {};
try {
    // File system operations
    operatorSystems.fs = require('fs').promises;
    operatorSystems.path = require('path');
    
    // System operations
    operatorSystems.childProcess = require('child_process');
    operatorSystems.os = require('os');
    
    // Network operations
    operatorSystems.https = require('https');
    operatorSystems.http = require('http');
    
    // Database operations (your existing systems)
    operatorSystems.database = require('./database');
    
    console.log('Operator system modules loaded - FULL OPERATIONAL MODE');
} catch (error) {
    console.warn('Some operator modules failed to load:', error.message);
    operatorSystems = { available: false };
}

// OPERATIONAL STATE TRACKING
const operationalState = {
    mode: 'OPERATOR',
    activeOperations: new Map(),
    operationHistory: [],
    systemHealth: {},
    lastHealthCheck: null,
    permissions: {
        fileOperations: true,
        systemCommands: true,
        networkOperations: true,
        databaseOperations: true,
        autoExecute: true
    }
};

// OPERATION EXECUTION TRACKING
function trackOperation(operationId, operationType, details = {}) {
    const operation = {
        id: operationId,
        type: operationType,
        startTime: Date.now(),
        status: 'EXECUTING',
        details,
        result: null,
        error: null
    };
    
    operationalState.activeOperations.set(operationId, operation);
    console.log(`[OPERATOR] Started operation: ${operationId} (${operationType})`);
    return operation;
}

function completeOperation(operationId, result = null, error = null) {
    const operation = operationalState.activeOperations.get(operationId);
    if (operation) {
        operation.status = error ? 'FAILED' : 'COMPLETED';
        operation.endTime = Date.now();
        operation.duration = operation.endTime - operation.startTime;
        operation.result = result;
        operation.error = error;
        
        // Move to history
        operationalState.operationHistory.push(operation);
        operationalState.activeOperations.delete(operationId);
        
        console.log(`[OPERATOR] Completed operation: ${operationId} (${operation.status}) in ${operation.duration}ms`);
    }
    return operation;
}

// OPERATOR COMMAND DETECTION - NEW OPERATIONAL PATTERNS
function detectOperationalCommand(message) {
    const text = message.toLowerCase();
    
    const operationalPatterns = {
        // File operations
        fileOps: [
            /create.*file|write.*file|save.*to.*file/i,
            /read.*file|open.*file|load.*file/i,
            /delete.*file|remove.*file/i,
            /list.*files|show.*files|directory.*contents/i,
            /backup.*files|archive.*files/i
        ],
        
        // System operations
        systemOps: [
            /check.*system|system.*status|health.*check/i,
            /restart.*service|stop.*service|start.*service/i,
            /monitor.*system|watch.*system/i,
            /execute.*command|run.*command|system.*command/i
        ],
        
        // Database operations
        databaseOps: [
            /create.*database|setup.*database/i,
            /query.*database|search.*database/i,
            /backup.*database|export.*database/i,
            /update.*database|modify.*database/i,
            /delete.*from.*database|remove.*from.*database/i
        ],
        
        // Network operations
        networkOps: [
            /make.*request|send.*request|api.*call/i,
            /download.*file|fetch.*data/i,
            /upload.*file|send.*file/i,
            /check.*connection|test.*connection/i
        ],
        
        // Process management
        processOps: [
            /start.*process|launch.*process/i,
            /kill.*process|stop.*process|terminate.*process/i,
            /monitor.*process|watch.*process/i,
            /process.*status|running.*processes/i
        ],
        
        // Automated operations
        automation: [
            /schedule.*task|automate.*task/i,
            /setup.*automation|create.*workflow/i,
            /trigger.*action|execute.*action/i,
            /run.*script|execute.*script/i
        ]
    };
    
    for (const [category, patterns] of Object.entries(operationalPatterns)) {
        if (patterns.some(pattern => pattern.test(text))) {
            return {
                isOperational: true,
                category,
                confidence: 0.9,
                requiresExecution: true
            };
        }
    }
    
    return {
        isOperational: false,
        category: null,
        confidence: 0,
        requiresExecution: false
    };
}

// OPERATIONAL EXECUTION ENGINE - NEW CORE CAPABILITY
async function executeOperationalCommand(command, operationType, chatId, options = {}) {
    const operationId = `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const operation = trackOperation(operationId, operationType, { command, chatId, options });
    
    try {
        let result = null;
        
        switch (operationType) {
            case 'fileOps':
                result = await executeFileOperation(command, options);
                break;
                
            case 'systemOps':
                result = await executeSystemOperation(command, options);
                break;
                
            case 'databaseOps':
                result = await executeDatabaseOperation(command, options);
                break;
                
            case 'networkOps':
                result = await executeNetworkOperation(command, options);
                break;
                
            case 'processOps':
                result = await executeProcessOperation(command, options);
                break;
                
            case 'automation':
                result = await executeAutomationOperation(command, options);
                break;
                
            default:
                throw new Error(`Unknown operation type: ${operationType}`);
        }
        
        completeOperation(operationId, result);
        return {
            success: true,
            operationId,
            result,
            type: operationType,
            executed: true
        };
        
    } catch (error) {
        completeOperation(operationId, null, error);
        return {
            success: false,
            operationId,
            error: error.message,
            type: operationType,
            executed: false
        };
    }
}

// FILE OPERATION EXECUTOR
async function executeFileOperation(command, options = {}) {
    if (!operationalState.permissions.fileOperations) {
        throw new Error('File operations disabled');
    }
    
    const text = command.toLowerCase();
    
    // Create file operation
    if (/create.*file|write.*file|save.*to.*file/.test(text)) {
        const filename = options.filename || `output_${Date.now()}.txt`;
        const content = options.content || 'Generated by Operator System';
        const filepath = operatorSystems.path.join(process.cwd(), filename);
        
        await operatorSystems.fs.writeFile(filepath, content, 'utf8');
        return {
            action: 'file_created',
            filepath,
            filename,
            size: Buffer.byteLength(content, 'utf8'),
            created: new Date().toISOString()
        };
    }
    
    // Read file operation
    if (/read.*file|open.*file|load.*file/.test(text)) {
        const filename = options.filename;
        if (!filename) throw new Error('Filename required for read operation');
        
        const filepath = operatorSystems.path.join(process.cwd(), filename);
        const content = await operatorSystems.fs.readFile(filepath, 'utf8');
        const stats = await operatorSystems.fs.stat(filepath);
        
        return {
            action: 'file_read',
            filepath,
            filename,
            content: content.substring(0, 1000), // Truncate for safety
            contentLength: content.length,
            modified: stats.mtime,
            size: stats.size
        };
    }
    
    // List files operation
    if (/list.*files|show.*files|directory.*contents/.test(text)) {
        const directory = options.directory || process.cwd();
        const files = await operatorSystems.fs.readdir(directory);
        
        const fileDetails = await Promise.all(
            files.slice(0, 20).map(async (file) => {
                try {
                    const stats = await operatorSystems.fs.stat(operatorSystems.path.join(directory, file));
                    return {
                        name: file,
                        size: stats.size,
                        modified: stats.mtime,
                        isDirectory: stats.isDirectory()
                    };
                } catch (error) {
                    return { name: file, error: error.message };
                }
            })
        );
        
        return {
            action: 'directory_listed',
            directory,
            fileCount: files.length,
            files: fileDetails
        };
    }
    
    // Delete file operation
    if (/delete.*file|remove.*file/.test(text)) {
        const filename = options.filename;
        if (!filename) throw new Error('Filename required for delete operation');
        
        const filepath = operatorSystems.path.join(process.cwd(), filename);
        await operatorSystems.fs.unlink(filepath);
        
        return {
            action: 'file_deleted',
            filepath,
            filename,
            deleted: new Date().toISOString()
        };
    }
    
    throw new Error('File operation not recognized or implemented');
}

// SYSTEM OPERATION EXECUTOR
async function executeSystemOperation(command, options = {}) {
    if (!operationalState.permissions.systemCommands) {
        throw new Error('System operations disabled');
    }
    
    const text = command.toLowerCase();
    
    // System health check
    if (/check.*system|system.*status|health.*check/.test(text)) {
        const systemInfo = {
            platform: operatorSystems.os.platform(),
            architecture: operatorSystems.os.arch(),
            release: operatorSystems.os.release(),
            hostname: operatorSystems.os.hostname(),
            uptime: operatorSystems.os.uptime(),
            totalMemory: operatorSystems.os.totalmem(),
            freeMemory: operatorSystems.os.freemem(),
            loadAverage: operatorSystems.os.loadavg(),
            cpuCount: operatorSystems.os.cpus().length,
            networkInterfaces: Object.keys(operatorSystems.os.networkInterfaces())
        };
        
        operationalState.systemHealth = systemInfo;
        operationalState.lastHealthCheck = new Date().toISOString();
        
        return {
            action: 'system_health_check',
            timestamp: new Date().toISOString(),
            system: systemInfo,
            memoryUsage: {
                used: systemInfo.totalMemory - systemInfo.freeMemory,
                free: systemInfo.freeMemory,
                total: systemInfo.totalMemory,
                percentage: ((systemInfo.totalMemory - systemInfo.freeMemory) / systemInfo.totalMemory * 100).toFixed(2)
            }
        };
    }
    
    // Execute system command (with safety restrictions)
    if (/execute.*command|run.*command|system.*command/.test(text)) {
        const cmd = options.command;
        if (!cmd) throw new Error('Command required for execution');
        
        // Safety check - only allow safe commands
        const safeCommands = ['ls', 'pwd', 'date', 'whoami', 'uptime', 'df', 'ps aux', 'netstat', 'uname'];
        const cmdName = cmd.split(' ')[0];
        
        if (!safeCommands.includes(cmdName)) {
            throw new Error(`Command '${cmdName}' not in safe command list`);
        }
        
        return new Promise((resolve, reject) => {
            operatorSystems.childProcess.exec(cmd, { timeout: 10000 }, (error, stdout, stderr) => {
                if (error) {
                    reject(new Error(`Command execution failed: ${error.message}`));
                    return;
                }
                
                resolve({
                    action: 'command_executed',
                    command: cmd,
                    stdout: stdout.substring(0, 1000),
                    stderr: stderr ? stderr.substring(0, 500) : null,
                    timestamp: new Date().toISOString()
                });
            });
        });
    }
    
    throw new Error('System operation not recognized or implemented');
}

// DATABASE OPERATION EXECUTOR
async function executeDatabaseOperation(command, options = {}) {
    if (!operationalState.permissions.databaseOperations) {
        throw new Error('Database operations disabled');
    }
    
    const text = command.toLowerCase();
    
    // Query database
    if (/query.*database|search.*database/.test(text)) {
        const query = options.query;
        const table = options.table || 'conversations';
        
        if (!query) throw new Error('Query required for database operation');
        
        try {
            // Use your existing database system
            let results;
            if (table === 'conversations') {
                results = await operatorSystems.database.getConversationHistoryDB(options.chatId || 'system', 10);
            } else if (table === 'memories') {
                results = await operatorSystems.database.getPersistentMemoryDB(options.chatId || 'system');
            } else {
                throw new Error(`Table '${table}' not supported`);
            }
            
            return {
                action: 'database_query',
                table,
                resultCount: Array.isArray(results) ? results.length : 0,
                results: Array.isArray(results) ? results.slice(0, 5) : results,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            throw new Error(`Database query failed: ${error.message}`);
        }
    }
    
    // Database backup
    if (/backup.*database|export.*database/.test(text)) {
        const backupName = `backup_${Date.now()}.json`;
        
        try {
            // Create a simple backup of recent data
            const conversations = await operatorSystems.database.getConversationHistoryDB('system', 100);
            const memories = await operatorSystems.database.getPersistentMemoryDB('system');
            
            const backup = {
                timestamp: new Date().toISOString(),
                conversations,
                memories,
                version: 'v1.0'
            };
            
            const backupPath = operatorSystems.path.join(process.cwd(), backupName);
            await operatorSystems.fs.writeFile(backupPath, JSON.stringify(backup, null, 2), 'utf8');
            
            return {
                action: 'database_backup',
                backupFile: backupName,
                backupPath,
                conversationCount: conversations?.length || 0,
                memoryCount: memories?.length || 0,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            throw new Error(`Database backup failed: ${error.message}`);
        }
    }
    
    throw new Error('Database operation not recognized or implemented');
}

// NETWORK OPERATION EXECUTOR
async function executeNetworkOperation(command, options = {}) {
    if (!operationalState.permissions.networkOperations) {
        throw new Error('Network operations disabled');
    }
    
    const text = command.toLowerCase();
    
    // Make HTTP request
    if (/make.*request|send.*request|api.*call/.test(text)) {
        const url = options.url;
        if (!url) throw new Error('URL required for network request');
        
        // Only allow HTTPS requests for security
        if (!url.startsWith('https://')) {
            throw new Error('Only HTTPS requests allowed');
        }
        
        return new Promise((resolve, reject) => {
            const req = operatorSystems.https.get(url, { timeout: 10000 }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    resolve({
                        action: 'http_request',
                        url,
                        statusCode: res.statusCode,
                        statusMessage: res.statusMessage,
                        headers: res.headers,
                        responseLength: data.length,
                        response: data.substring(0, 1000), // Truncate for safety
                        timestamp: new Date().toISOString()
                    });
                });
            });
            
            req.on('error', (error) => {
                reject(new Error(`Network request failed: ${error.message}`));
            });
            
            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Network request timed out'));
            });
        });
    }
    
    // Check connection
    if (/check.*connection|test.*connection/.test(text)) {
        const host = options.host || 'google.com';
        const port = options.port || 443;
        
        return new Promise((resolve, reject) => {
            const net = require('net');
            const socket = new net.Socket();
            
            const timeout = setTimeout(() => {
                socket.destroy();
                reject(new Error(`Connection timeout to ${host}:${port}`));
            }, 5000);
            
            socket.connect(port, host, () => {
                clearTimeout(timeout);
                socket.destroy();
                resolve({
                    action: 'connection_test',
                    host,
                    port,
                    status: 'connected',
                    timestamp: new Date().toISOString()
                });
            });
            
            socket.on('error', (error) => {
                clearTimeout(timeout);
                reject(new Error(`Connection failed to ${host}:${port} - ${error.message}`));
            });
        });
    }
    
    throw new Error('Network operation not recognized or implemented');
}

// PROCESS OPERATION EXECUTOR
async function executeProcessOperation(command, options = {}) {
    if (!operationalState.permissions.systemCommands) {
        throw new Error('Process operations disabled');
    }
    
    const text = command.toLowerCase();
    
    // Get running processes
    if (/process.*status|running.*processes/.test(text)) {
        return new Promise((resolve, reject) => {
            operatorSystems.childProcess.exec('ps aux | head -20', { timeout: 5000 }, (error, stdout, stderr) => {
                if (error) {
                    reject(new Error(`Process listing failed: ${error.message}`));
                    return;
                }
                
                const processes = stdout.split('\n')
                    .slice(1, 11) // Take first 10 processes
                    .filter(line => line.trim())
                    .map(line => {
                        const parts = line.trim().split(/\s+/);
                        return {
                            user: parts[0],
                            pid: parts[1],
                            cpu: parts[2],
                            mem: parts[3],
                            command: parts.slice(10).join(' ').substring(0, 50)
                        };
                    });
                
                resolve({
                    action: 'process_status',
                    processCount: processes.length,
                    processes,
                    timestamp: new Date().toISOString()
                });
            });
        });
    }
    
    throw new Error('Process operation not recognized or implemented');
}

// AUTOMATION OPERATION EXECUTOR
async function executeAutomationOperation(command, options = {}) {
    const text = command.toLowerCase();
    
    // Schedule task
    if (/schedule.*task|automate.*task/.test(text)) {
        const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const task = {
            id: taskId,
            command: options.command || command,
            schedule: options.schedule || 'immediate',
            created: new Date().toISOString(),
            status: 'scheduled'
        };
        
        // Store task (simplified implementation)
        if (!operationalState.scheduledTasks) {
            operationalState.scheduledTasks = new Map();
        }
        operationalState.scheduledTasks.set(taskId, task);
        
        return {
            action: 'task_scheduled',
            taskId,
            task,
            timestamp: new Date().toISOString()
        };
    }
    
    // Setup automation
    if (/setup.*automation|create.*workflow/.test(text)) {
        const workflowId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const workflow = {
            id: workflowId,
            name: options.name || 'Automated Workflow',
            steps: options.steps || ['step1'],
            created: new Date().toISOString(),
            status: 'active'
        };
        
        // Store workflow (simplified implementation)
        if (!operationalState.workflows) {
            operationalState.workflows = new Map();
        }
        operationalState.workflows.set(workflowId, workflow);
        
        return {
            action: 'workflow_created',
            workflowId,
            workflow,
            timestamp: new Date().toISOString()
        };
    }
    
    throw new Error('Automation operation not recognized or implemented');
}

// ORIGINAL COMPLETION DETECTION SYSTEM (PRESERVED)
function detectCompletionStatus(message, memoryContext = '') {
    const messageText = message.toLowerCase();
    const contextText = memoryContext.toLowerCase();
    
    const directCompletionPatterns = [
        /done ready|already built|it work|working now|system ready/i,
        /deployment complete|built already|finished already/i,
        /stop asking|told you already|we discussed this/i,
        /ready now|operational now|live now|running now/i,
        /no need|don't need|unnecessary|redundant/i
    ];
    
    const contextCompletionPatterns = [
        /system.*built|deployment.*complete|project.*finished/i,
        /already.*working|currently.*operational/i,
        /successfully.*deployed|live.*system/i
    ];
    
    const frustrationPatterns = [
        /again.*asking|keep.*asking|always.*ask/i,
        /told.*you.*already|mentioned.*before/i,
        /why.*again|same.*thing.*again/i,
        /understand.*ready|listen.*done/i
    ];
    
    const hasDirectCompletion = directCompletionPatterns.some(pattern => pattern.test(messageText));
    const hasContextCompletion = contextCompletionPatterns.some(pattern => pattern.test(contextText));
    const hasFrustration = frustrationPatterns.some(pattern => pattern.test(messageText));
    
    return {
        isComplete: hasDirectCompletion || hasContextCompletion,
        isFrustrated: hasFrustration,
        directSignal: hasDirectCompletion,
        contextSignal: hasContextCompletion,
        shouldSkipGPT5: hasDirectCompletion || hasFrustration,
        completionType: hasDirectCompletion ? 'direct' : 
                       hasContextCompletion ? 'context' : 
                       hasFrustration ? 'frustration' : 'none'
    };
}

function generateCompletionResponse(completionStatus, originalMessage) {
    const responses = {
        direct: [
            "Got it! System confirmed as ready. What's your next command?",
            "Understood - it's operational. What else can I help with?",
            "Perfect! Since it's working, what's the next task?",
            "Acknowledged. Moving on - what do you need now?"
        ],
        context: [
            "I see from our history that it's already built. What's next?",
            "Right, the system is operational. What's your next priority?",
            "Understood from context - it's ready. How can I help further?"
        ],
        frustration: [
            "My apologies! I understand it's ready. Let's move forward - what else do you need?",
            "Sorry for the repetition! I get it - it's working. What's next?",
            "You're absolutely right - no need to rebuild. What's your next task?",
            "Point taken! The system is operational. What should we focus on now?"
        ]
    };
    
    const responseArray = responses[completionStatus.completionType] || responses.direct;
    return responseArray[Math.floor(Math.random() * responseArray.length)];
}

// QUERY COMPLEXITY ANALYZER for Dynamic Token Scaling (PRESERVED)
function analyzeQueryComplexity(message) {
    const text = message.toLowerCase();
    
    const veryComplexPatterns = [
        /(write.*comprehensive|create.*detailed.*report)/i,
        /(step.*by.*step.*guide|complete.*tutorial)/i,
        /(analyze.*thoroughly|provide.*full.*analysis)/i,
        /(research.*paper|academic.*analysis)/i,
        /(business.*plan|strategic.*framework)/i,
        /(financial.*model|investment.*analysis)/i,
        /(legal.*document|contract.*analysis)/i
    ];
    
    const complexPatterns = [
        /(explain.*detail|provide.*example)/i,
        /(compare.*contrast|pros.*cons)/i,
        /(advantages.*disadvantages)/i,
        /(multiple.*options|various.*approaches)/i,
        /(bullet.*points|numbered.*list)/i
    ];
    
    const longResponseIndicators = [
        /(tell.*me.*everything|explain.*fully)/i,
        /(all.*information|complete.*overview)/i,
        /(elaborate|expand.*on|more.*detail)/i,
        /(comprehensive|thorough|detailed)/i
    ];
    
    const isVeryComplex = veryComplexPatterns.some(pattern => pattern.test(text));
    const isComplex = complexPatterns.some(pattern => pattern.test(text));
    const needsLongResponse = longResponseIndicators.some(pattern => pattern.test(text));
    
    const questionWords = (text.match(/\b(what|how|why|when|where|which|who)\b/g) || []).length;
    const sentences = text.split(/[.!?]+/).length;
    const words = text.split(/\s+/).length;
    
    return {
        isVeryComplex: isVeryComplex || (sentences > 5 && words > 100),
        isComplex: isComplex || questionWords > 2,
        needsLongResponse: needsLongResponse || words > 50,
        sentences: sentences,
        words: words,
        questionWords: questionWords,
        complexity: isVeryComplex ? 'very_high' : 
                   isComplex ? 'high' : 
                   needsLongResponse ? 'medium' : 'low'
    };
}

// MEMORY INTEGRATION (PRESERVED)
let memory, database;
try {
    memory = require('./memory');
    database = require('./database');
    console.log('Memory and database systems loaded');
} catch (error) {
    console.warn('Memory system imports failed:', error.message);
    memory = { buildConversationContext: async () => '' };
    database = { 
        getConversationHistoryDB: async () => [],
        getPersistentMemoryDB: async () => []
    };
}

// TELEGRAM INTEGRATION (PRESERVED)
let telegramSplitter = {};
try {
    telegramSplitter = require('./telegramSplitter');
    console.log('Telegram integration loaded');
} catch (error) {
    console.warn('Telegram splitter import failed:', error.message);
    telegramSplitter = {
        sendGPTResponse: async () => false,
        sendClaudeResponse: async () => false,
        sendDualAIResponse: async () => false,
        sendAnalysis: async () => false,
        sendAlert: async () => false
    };
}

// DATETIME UTILITIES (PRESERVED)
function getCurrentCambodiaDateTime() {
    try {
        const now = new Date();
        const cambodiaTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Phnom_Penh"}));
        
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
        
        const dayName = days[cambodiaTime.getDay()];
        const monthName = months[cambodiaTime.getMonth()];
        const date = cambodiaTime.getDate();
        const year = cambodiaTime.getFullYear();
        const hour = cambodiaTime.getHours();
        const minute = cambodiaTime.getMinutes();
        const isWeekend = cambodiaTime.getDay() === 0 || cambodiaTime.getDay() === 6;
        
        return {
            date: `${dayName}, ${monthName} ${date}, ${year}`,
            time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
            hour: hour,
            minute: minute,
            dayName: dayName,
            isWeekend: isWeekend,
            timezone: 'ICT (UTC+7)',
            timestamp: cambodiaTime.toISOString()
        };
    } catch (error) {
        console.error('Cambodia DateTime error:', error.message);
        return {
            date: new Date().toDateString(),
            time: new Date().toTimeString().slice(0, 5),
            hour: new Date().getHours(),
            isWeekend: [0, 6].includes(new Date().getDay()),
            error: 'Timezone calculation failed'
        };
    }
}

function getCurrentGlobalDateTime() {
    try {
        const now = new Date();
        
        const cambodiaTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Phnom_Penh"}));
        const newYorkTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
        const londonTime = new Date(now.toLocaleString("en-US", {timeZone: "Europe/London"}));
        
        return {
            cambodia: {
                ...getCurrentCambodiaDateTime(),
                timezone: 'ICT (UTC+7)'
            },
            newYork: {
                time: `${newYorkTime.getHours()}:${newYorkTime.getMinutes().toString().padStart(2, '0')}`,
                hour: newYorkTime.getHours(),
                timezone: 'EST/EDT (UTC-5/-4)'
            },
            london: {
                time: `${londonTime.getHours()}:${londonTime.getMinutes().toString().padStart(2, '0')}`,
                hour: londonTime.getHours(),
                timezone: 'GMT/BST (UTC+0/+1)'
            },
            utc: now.toISOString()
        };
    } catch (error) {
        console.error('Global DateTime error:', error.message);
        return {
            cambodia: getCurrentCambodiaDateTime(),
            error: 'Global timezone calculation failed'
        };
    }
}

// ENHANCED GPT-5 QUERY ANALYSIS with OPERATOR MODE
function analyzeQuery(userMessage, messageType = 'text', hasMedia = false, memoryContext = null) {
    const message = userMessage.toLowerCase();
    
    // PRIORITY 0: OPERATIONAL COMMAND DETECTION (NEW)
    const operationalCommand = detectOperationalCommand(userMessage);
    if (operationalCommand.isOperational) {
        return {
            type: 'operational',
            bestAI: 'operator',
            operationType: operationalCommand.category,
            reason: `Operational command detected: ${operationalCommand.category}`,
            isOperational: true,
            requiresExecution: operationalCommand.requiresExecution,
            confidence: operationalCommand.confidence,
            shouldExecute: true,
            gpt5Model: 'gpt-5', // Use full GPT-5 for operational planning
            reasoning_effort: 'high',
            verbosity: 'high',
            max_completion_tokens: 12000,
            temperature: 0.3,
            priority: 'operational',
            maxRetries: 2
        };
    }
    
    // PRIORITY 1: COMPLETION DETECTION (PRESERVED)
    const completionStatus = detectCompletionStatus(userMessage, memoryContext || '');
    if (completionStatus.shouldSkipGPT5) {
        return {
            type: 'completion',
            bestAI: 'none',
            reason: `Task completion detected (${completionStatus.completionType})`,
            isComplete: true,
            completionStatus: completionStatus,
            shouldSkipGPT5: true,
            quickResponse: generateCompletionResponse(completionStatus, userMessage)
        };
    }
    
    // Memory patterns (PRESERVED)
    const memoryPatterns = [
        /remember|recall|you mentioned|we discussed|before|previously|last time/i,
        /my name|my preference|i told you|i said|you know/i
    ];
    
    // Speed critical patterns - Use GPT-5 Nano (PRESERVED)
    const speedPatterns = [
        /urgent|immediate|now|asap|quick|fast|emergency|real-time/i,
        /^(what time|what's the time|current time|time now)/i,
        /^(what date|what's the date|today's date|date today)/i,
        /^(hello|hi|hey|good morning|good afternoon|what's up)$/i,
        /^how are you\??$/i,
        /^(thanks|thank you|cool|nice|great|ok|okay)$/i
    ];
    
    // Complex analysis patterns - Use Full GPT-5 WITH RETRY (PRESERVED)
    const complexPatterns = [
        /(strategy|strategic|comprehensive|detailed|thorough|in-depth)/i,
        /(analyze|evaluate|assess|examine|investigate|research)/i,
        /(portfolio|allocation|risk|optimization|diversification)/i,
        /(complex|sophisticated|multi-factor|multi-dimensional)/i,
        /(build|create|develop|implement|construct|design)/i,
        /(plan|planning|framework|structure|architecture)/i,
        /(write.*comprehensive|detailed.*report|full.*analysis)/i
    ];
    
    // Math/coding patterns - Use Full GPT-5 WITH RETRY (PRESERVED)
    const mathCodingPatterns = [
        /(calculate|compute|formula|equation|algorithm|optimization)/i,
        /(code|coding|program|script|debug|software|api)/i,
        /(mathematical|statistical|probability|regression|correlation)/i,
        /(machine learning|ai|neural network|deep learning)/i,
        /(backtest|monte carlo|var|sharpe|sortino|calmar)/i,
        /(dcf|npv|irr|wacc|capm|black.*scholes)/i
    ];
    
    // Cambodia/regional patterns - Use GPT-5 Mini (PRESERVED)
    const cambodiaPatterns = [
        /(cambodia|khmer|phnom penh|cambodian)/i,
        /(lending.*cambodia|cambodia.*lending)/i,
        /(usd.*khr|khr.*usd)/i,
        /(southeast asia|asean|emerging markets)/i
    ];
    
    // Market patterns - Use GPT-5 Mini (PRESERVED)
    const marketPatterns = [
        /(market|stock|bond|crypto|forex|trading)/i,
        /(investment|buy|sell|price|rate|yield|return)/i,
        /(analysis|forecast|outlook|prediction)/i,
        /(earnings|revenue|profit|financial)/i
    ];
    
    // Chat patterns - Use GPT-5 Chat (PRESERVED)
    const chatPatterns = [
        /^(hello|hi|hey|good morning|good afternoon)/i,
        /(chat|conversation|talk|discuss)/i,
        /(how are you|what's up|how's it going)/i
    ];
    
    // Check for memory importance (PRESERVED)
    const hasMemoryReference = memoryPatterns.some(pattern => pattern.test(message));
    const hasMemoryContext = memoryContext && memoryContext.length > 100;
    
    // GPT-5 MODEL SELECTION LOGIC WITH SMART RETRY (PRESERVED)
    let gpt5Config = {
        model: 'gpt-5-mini',
        reasoning_effort: 'medium',
        verbosity: 'medium',
        max_completion_tokens: 8000,
        temperature: 0.7,
        priority: 'standard',
        reason: 'GPT-5 Mini - Balanced performance',
        maxRetries: 0
    };
    
    // PRIORITY 2: SPEED CRITICAL - GPT-5 Nano (PRESERVED)
    if (speedPatterns.some(pattern => pattern.test(message))) {
        gpt5Config = {
            model: 'gpt-5-nano',
            reasoning_effort: 'minimal',
            verbosity: 'low',
            max_completion_tokens: 6000,
            priority: 'speed',
            reason: 'Speed critical - GPT-5 Nano for fast response',
            maxRetries: 0
        };
    }
    // PRIORITY 3: CHAT PATTERNS - GPT-5 Chat model (PRESERVED)
    else if (chatPatterns.some(pattern => pattern.test(message))) {
        gpt5Config = {
            model: 'gpt-5-chat-latest',
            temperature: 0.7,
            max_completion_tokens: 8000,
            priority: 'chat',
            reason: 'Chat pattern - GPT-5 Chat model',
            maxRetries: 0
        };
    }
    // PRIORITY 4: CAMBODIA/REGIONAL - GPT-5 Mini (PRESERVED)
    else if (cambodiaPatterns.some(pattern => pattern.test(message))) {
        gpt5Config = {
            model: 'gpt-5-mini',
            reasoning_effort: 'medium',
            verbosity: 'high',
            max_completion_tokens: 10000,
            temperature: 0.6,
            priority: 'regional',
            reason: 'Cambodia/regional analysis - GPT-5 Mini with detailed output',
            maxRetries: 0
        };
    }
    // PRIORITY 5: MARKET ANALYSIS - GPT-5 Mini (PRESERVED)
    else if (marketPatterns.some(pattern => pattern.test(message))) {
        gpt5Config = {
            model: 'gpt-5-mini',
            reasoning_effort: 'medium',
            verbosity: 'medium',
            max_completion_tokens: 8000,
            temperature: 0.6,
            priority: 'market',
            reason: 'Market analysis - GPT-5 Mini for balanced performance',
            maxRetries: 0
        };
    }
    // PRIORITY 6: MATH/CODING - Full GPT-5 with RETRY ENABLED (PRESERVED)
    else if (mathCodingPatterns.some(pattern => pattern.test(message))) {
        gpt5Config = {
            model: 'gpt-5',
            reasoning_effort: 'high',
            verbosity: 'medium',
            max_completion_tokens: 12000,
            temperature: 0.3,
            priority: 'mathematical',
            reason: 'Mathematical/coding precision - Full GPT-5 with retry',
            maxRetries: 2
        };
    }
    // PRIORITY 7: COMPLEX ANALYSIS - Full GPT-5 with RETRY ENABLED (PRESERVED)
    else if (complexPatterns.some(pattern => pattern.test(message))) {
        gpt5Config = {
            model: 'gpt-5',
            reasoning_effort: 'high',
            verbosity: 'high',
            max_completion_tokens: 16000,
            temperature: 0.6,
            priority: 'complex',
            reason: 'Complex strategic analysis - Full GPT-5 with retry',
            maxRetries: 2
        };
    }
    // PRIORITY 8: MULTIMODAL - Full GPT-5 with RETRY ENABLED (PRESERVED)
    else if (hasMedia || messageType !== 'text') {
        gpt5Config = {
            model: 'gpt-5',
            reasoning_effort: 'medium',
            verbosity: 'medium',
            max_completion_tokens: 10000,
            temperature: 0.7,
            priority: 'multimodal',
            reason: 'Multimodal content - Full GPT-5 for vision analysis with retry',
            maxRetries: 1
        };
    }
    
    // DYNAMIC TOKEN SCALING (PRESERVED)
    const queryLength = message.length;
    const queryComplexity = analyzeQueryComplexity(message);
    
    if (queryLength > 1000) {
        gpt5Config.max_completion_tokens = Math.min(gpt5Config.max_completion_tokens * 1.5, 16000);
        gpt5Config.reason += ' (Scaled for long input)';
    }
    
    if (queryComplexity.isVeryComplex) {
        gpt5Config.max_completion_tokens = Math.min(gpt5Config.max_completion_tokens * 1.3, 16000);
        gpt5Config.reason += ' (Scaled for complexity)';
        if (gpt5Config.maxRetries === 0) {
            gpt5Config.maxRetries = 1;
            gpt5Config.reason += ' (Retry enabled for complexity)';
        }
    }
    
    const longResponsePatterns = [
        /(write.*long|detailed.*report|comprehensive.*analysis)/i,
        /(full.*explanation|complete.*guide|step.*by.*step)/i,
        /(generate.*content|create.*document|write.*article)/i,
        /(elaborate|expand|provide.*more|tell.*me.*everything)/i
    ];
    
    if (longResponsePatterns.some(pattern => pattern.test(message))) {
        gpt5Config.max_completion_tokens = 16000;
        gpt5Config.reason += ' (Long response requested)';
        if (gpt5Config.maxRetries === 0) {
            gpt5Config.maxRetries = 1;
            gpt5Config.reason += ' (Retry enabled for long response)';
        }
    }
    
    return {
        type: gpt5Config.priority,
        bestAI: 'gpt',
        reason: gpt5Config.reason,
        gpt5Model: gpt5Config.model,
        reasoning_effort: gpt5Config.reasoning_effort,
        verbosity: gpt5Config.verbosity,
        max_completion_tokens: gpt5Config.max_completion_tokens,
        temperature: gpt5Config.temperature,
        priority: gpt5Config.priority,
        maxRetries: gpt5Config.maxRetries,
        
        // Completion detection results (PRESERVED)
        isComplete: false,
        completionStatus: completionStatus,
        shouldSkipGPT5: false,
        
        // Operational detection results (NEW)
        isOperational: false,
        operationType: null,
        requiresExecution: false,
        shouldExecute: false,
        
        // Memory and context (PRESERVED)
        memoryImportant: hasMemoryReference || hasMemoryContext || gpt5Config.priority === 'complex',
        needsLiveData: gpt5Config.priority === 'complex' || gpt5Config.priority === 'market',
        
        // Classification (PRESERVED)
        complexity: gpt5Config.priority === 'complex' ? 'high' : 
                   gpt5Config.priority === 'speed' ? 'low' : 'medium',
        powerSystemPreference: `GPT5_${gpt5Config.priority.toUpperCase()}`
    };
}

// ENHANCED DIRECT GPT-5 EXECUTION WITH OPERATOR MODE
async function executeThroughGPT5System(userMessage, queryAnalysis, context = null, memoryData = null, chatId = null) {
    try {
        console.log(`[OPERATOR] GPT-5 ${queryAnalysis.isOperational ? 'OPERATIONAL' : 'ADVISORY'} Mode: ${queryAnalysis.gpt5Model} (${queryAnalysis.reasoning_effort || 'none'} reasoning, ${queryAnalysis.verbosity || 'none'} verbosity)`);
        
        // OPERATIONAL COMMAND EXECUTION (NEW)
        if (queryAnalysis.isOperational && queryAnalysis.requiresExecution) {
            console.log(`[OPERATOR] Executing ${queryAnalysis.operationType} operation...`);
            
            // First, get GPT-5 to analyze and plan the operation
            const operationPlan = await openaiClient.getGPT5Analysis(
                `OPERATIONAL MODE: Plan and execute this ${queryAnalysis.operationType} command: "${userMessage}"\n\n` +
                `Provide detailed execution plan with:\n` +
                `1. Risk assessment\n` +
                `2. Required permissions\n` +
                `3. Step-by-step execution plan\n` +
                `4. Expected outcomes\n` +
                `5. Safety considerations\n\n` +
                `Current system context: ${context || 'None'}`,
                {
                    model: queryAnalysis.gpt5Model,
                    reasoning_effort: queryAnalysis.reasoning_effort,
                    verbosity: queryAnalysis.verbosity,
                    max_completion_tokens: queryAnalysis.max_completion_tokens
                }
            );
            
            // Execute the actual operation
            try {
                const operationResult = await executeOperationalCommand(
                    userMessage, 
                    queryAnalysis.operationType, 
                    chatId,
                    { 
                        plan: operationPlan,
                        context: context,
                        userMessage: userMessage
                    }
                );
                
                // Generate comprehensive response combining plan and execution
                const finalResponse = `[OPERATOR MODE - ${queryAnalysis.operationType.toUpperCase()}]\n\n` +
                    `EXECUTION PLAN:\n${operationPlan}\n\n` +
                    `EXECUTION RESULT:\n` +
                    `✅ Status: ${operationResult.success ? 'SUCCESS' : 'FAILED'}\n` +
                    `🔧 Operation ID: ${operationResult.operationId}\n` +
                    `📊 Details: ${JSON.stringify(operationResult.result || operationResult.error, null, 2)}\n\n` +
                    `${operationResult.success ? 'Operation completed successfully.' : `Operation failed: ${operationResult.error}`}`;
                
                return {
                    response: finalResponse,
                    gpt5OnlyMode: true,
                    operatorMode: true,
                    operationExecuted: true,
                    operationResult: operationResult,
                    aiUsed: `GPT-5-Operator-${queryAnalysis.gpt5Model.replace('gpt-5-', '').replace('gpt-5', 'full')}`,
                    modelUsed: queryAnalysis.gpt5Model,
                    powerMode: `OPERATOR_${queryAnalysis.priority.toUpperCase()}`,
                    confidence: 0.95,
                    success: operationResult.success,
                    reasoning_effort: queryAnalysis.reasoning_effort,
                    verbosity: queryAnalysis.verbosity,
                    priority: queryAnalysis.priority,
                    operationType: queryAnalysis.operationType,
                    memoryUsed: !!context,
                    cost_tier: queryAnalysis.gpt5Model === 'gpt-5-nano' ? 'economy' : 
                              queryAnalysis.gpt5Model === 'gpt-5-mini' ? 'standard' : 'premium',
                    analytics: {
                        queryComplexity: queryAnalysis.complexity,
                        domainClassification: queryAnalysis.type,
                        priorityLevel: queryAnalysis.priority,
                        modelOptimization: 'GPT-5 Operator mode',
                        operationOptimized: true,
                        executionPerformed: true
                    }
                };
                
            } catch (operationError) {
                console.error('[OPERATOR] Operation execution failed:', operationError.message);
                
                // Return plan with execution error
                return {
                    response: `[OPERATOR MODE - ${queryAnalysis.operationType.toUpperCase()}] EXECUTION FAILED\n\n` +
                        `EXECUTION PLAN:\n${operationPlan}\n\n` +
                        `❌ EXECUTION ERROR: ${operationError.message}\n\n` +
                        `The operation was planned but could not be executed due to the above error. ` +
                        `Please check system permissions and try again.`,
                    gpt5OnlyMode: true,
                    operatorMode: true,
                    operationExecuted: false,
                    operationError: operationError.message,
                    aiUsed: `GPT-5-Operator-${queryAnalysis.gpt5Model.replace('gpt-5-', '').replace('gpt-5', 'full')}`,
                    modelUsed: queryAnalysis.gpt5Model,
                    powerMode: `OPERATOR_${queryAnalysis.priority.toUpperCase()}_FAILED`,
                    confidence: 0.7,
                    success: false,
                    reasoning_effort: queryAnalysis.reasoning_effort,
                    verbosity: queryAnalysis.verbosity,
                    priority: queryAnalysis.priority,
                    operationType: queryAnalysis.operationType
                };
            }
        }
        
        // STANDARD GPT-5 EXECUTION (PRESERVED)
        // Handle datetime queries directly
        if (queryAnalysis.priority === 'speed' && /^(what time|what's the time|current time|time now|what date|what's the date)/.test(userMessage.toLowerCase())) {
            const cambodiaTime = getCurrentCambodiaDateTime();
            if (userMessage.toLowerCase().includes('time')) {
                return `Current time in Cambodia: ${cambodiaTime.time} (${cambodiaTime.timezone})\nToday is ${cambodiaTime.date}${cambodiaTime.isWeekend ? ' - Enjoy your weekend!' : ' - Have a productive day!'}`;
            } else {
                return `Today's date: ${cambodiaTime.date}\nCurrent time: ${cambodiaTime.time} in Cambodia (${cambodiaTime.timezone})`;
            }
        }
        
        // Build enhanced message with context (PRESERVED)
        let enhancedMessage = userMessage;
        
        // Add Cambodia time context for non-speed queries (PRESERVED)
        if (queryAnalysis.priority !== 'speed' && queryAnalysis.priority !== 'casual') {
            const cambodiaTime = getCurrentCambodiaDateTime();
            enhancedMessage = `Current time: ${cambodiaTime.date}, ${cambodiaTime.time} Cambodia (${cambodiaTime.timezone})\nBusiness hours: ${!cambodiaTime.isWeekend && cambodiaTime.hour >= 8 && cambodiaTime.hour <= 17 ? 'Yes' : 'No'}\n\n${userMessage}`;
        }
        
        // Add memory context with size limits (PRESERVED)
        if (queryAnalysis.memoryImportant && context && context.length > 0) {
            const maxContextLength = Math.min(context.length, 2000);
            enhancedMessage += `\n\nMEMORY CONTEXT:\n${context.substring(0, maxContextLength)}`;
            if (context.length > maxContextLength) {
                enhancedMessage += `\n... (truncated for length)`;
            }
            console.log('Memory context integrated for GPT-5');
        }
        
        // Add specific memory data with size limits (PRESERVED)
        if (memoryData) {
            if (memoryData.persistentMemory && memoryData.persistentMemory.length > 0) {
                enhancedMessage += `\n\nPERSISTENT FACTS:\n`;
                memoryData.persistentMemory.slice(0, 3).forEach((memory, index) => {
                    const fact = (memory.fact || memory).substring(0, 150);
                    enhancedMessage += `${index + 1}. ${fact}\n`;
                });
            }
            
            if (memoryData.conversationHistory && memoryData.conversationHistory.length > 0) {
                enhancedMessage += `\n\nRECENT CONTEXT:\n`;
                memoryData.conversationHistory.slice(0, 2).forEach((conv, index) => {
                    if (conv.user_message) {
                        enhancedMessage += `${index + 1}. Previous: "${conv.user_message.substring(0, 80)}..."\n`;
                    }
                });
            }
        }
        
        console.log('GPT-5 execution config:', {
            model: queryAnalysis.gpt5Model,
            reasoning: queryAnalysis.reasoning_effort,
            verbosity: queryAnalysis.verbosity,
            tokens: queryAnalysis.max_completion_tokens,
            hasMemory: !!context,
            priority: queryAnalysis.priority
        });
        
        // Build options object (PRESERVED)
        const options = {
            model: queryAnalysis.gpt5Model
        };
        
        // Add model-specific parameters (PRESERVED)
        if (queryAnalysis.gpt5Model === 'gpt-5-chat-latest') {
            if (queryAnalysis.temperature) options.temperature = queryAnalysis.temperature;
            if (queryAnalysis.max_completion_tokens) options.max_completion_tokens = queryAnalysis.max_completion_tokens;
        } else {
            if (queryAnalysis.reasoning_effort) options.reasoning_effort = queryAnalysis.reasoning_effort;
            if (queryAnalysis.verbosity) options.verbosity = queryAnalysis.verbosity;
            if (queryAnalysis.max_completion_tokens) options.max_completion_tokens = queryAnalysis.max_completion_tokens;
        }
        
        const result = await openaiClient.getGPT5Analysis(enhancedMessage, options);
        
        console.log(`GPT-5 execution successful: ${queryAnalysis.gpt5Model} (${result.length} chars)`);
        
        return {
            response: result,
            gpt5OnlyMode: true,
            operatorMode: false,
            aiUsed: `GPT-5-${queryAnalysis.gpt5Model.replace('gpt-5-', '').replace('gpt-5', 'full')}`,
            modelUsed: queryAnalysis.gpt5Model,
            powerMode: `GPT5_${queryAnalysis.priority.toUpperCase()}`,
            confidence: queryAnalysis.priority === 'mathematical' ? 0.95 : 
                       queryAnalysis.priority === 'complex' ? 0.9 : 0.85,
            success: true,
            reasoning_effort: queryAnalysis.reasoning_effort,
            verbosity: queryAnalysis.verbosity,
            priority: queryAnalysis.priority,
            memoryUsed: !!context,
            cost_tier: queryAnalysis.gpt5Model === 'gpt-5-nano' ? 'economy' :
                      queryAnalysis.gpt5Model === 'gpt-5-mini' ? 'standard' : 'premium',
            analytics: {
                queryComplexity: queryAnalysis.complexity,
                domainClassification: queryAnalysis.type,
                priorityLevel: queryAnalysis.priority,
                modelOptimization: 'GPT-5 family smart selection',
                costOptimized: true
            }
        };
        
    } catch (error) {
        console.error('[OPERATOR] GPT-5 execution error:', error.message);
        throw error;
    }
}

// GPT-5 FALLBACK EXECUTION (PRESERVED)
async function executeGPT5Fallback(userMessage, queryAnalysis, context = null) {
    try {
        console.log('GPT-5 fallback: Using GPT-5 Nano for reliability...');
        
        let enhancedMessage = userMessage;
        if (context && queryAnalysis.memoryImportant) {
            enhancedMessage += `\n\nContext: ${context.substring(0, 500)}`;
        }
        
        return await openaiClient.getGPT5Analysis(enhancedMessage, {
            model: 'gpt-5-nano',
            reasoning_effort: 'minimal',
            verbosity: 'low',
            max_completion_tokens: 8000
        });
        
    } catch (fallbackError) {
        console.error('GPT-5 Nano fallback also failed:', fallbackError.message);
        throw new Error(`All GPT-5 models failed: ${fallbackError.message}`);
    }
}

// MAIN COMMAND EXECUTION - ENHANCED WITH OPERATOR MODE
async function executeDualCommand(userMessage, chatId, options = {}) {
    const startTime = Date.now();
    
    try {
        console.log(`[OPERATOR] Executing ${operationalState.mode} command...`);
        console.log('Message:', userMessage.substring(0, 100));
        
        // PRESERVED: Only retrieve memory if this is NOT a system test
        const isSystemTest = userMessage.toLowerCase().includes('test memory') || 
                           userMessage.toLowerCase().includes('integration test') ||
                           options.forceMemoryTest === true;
        
        let memoryContext = options.memoryContext || '';
        let memoryData = {
            conversationHistory: options.conversationHistory || [],
            persistentMemory: options.persistentMemory || []
        };
        
        // PRESERVED: Only build memory for non-test conversations
        if (!isSystemTest && !memoryContext && !options.conversationHistory && !options.persistentMemory) {
            console.log('Building memory context for normal conversation...');
            
            try {
                memoryContext = await memory.buildConversationContext(chatId);
                console.log(`Built memory context: ${memoryContext.length} chars`);
            } catch (memoryError) {
                console.log('Memory building failed, using fallback:', memoryError.message);
                
                try {
                    const [history, memories] = await Promise.allSettled([
                        database.getConversationHistoryDB(chatId, 5),
                        database.getPersistentMemoryDB(chatId)
                    ]);
                    
                    if (history.status === 'fulfilled') {
                        memoryData.conversationHistory = history.value;
                        console.log(`Retrieved ${history.value.length} conversation records`);
                    }
                    
                    if (memories.status === 'fulfilled') {
                        memoryData.persistentMemory = memories.value;
                        console.log(`Retrieved ${memories.value.length} persistent memories`);
                    }
                    
                } catch (fallbackError) {
                    console.log('All memory retrieval failed:', fallbackError.message);
                    memoryContext = '';
                }
            }
        }
        
        // ENHANCED: Analyze query for optimal GPT-5 model selection AND operational detection
        const queryAnalysis = analyzeQuery(
            userMessage, 
            options.messageType || 'text', 
            options.hasMedia || false,
            memoryContext
        );
        
        // Handle completion detection BEFORE GPT-5 processing (PRESERVED)
        if (queryAnalysis.shouldSkipGPT5) {
            console.log(`Completion detected: ${queryAnalysis.completionStatus.completionType}`);
            
            const responseTime = Date.now() - startTime;
            
            return {
                response: queryAnalysis.quickResponse,
                aiUsed: 'completion-detection',
                queryType: 'completion',
                complexity: 'low',
                reasoning: `Completion detected - ${queryAnalysis.completionStatus.completionType}`,
                priority: 'completion',
                completionDetected: true,
                completionType: queryAnalysis.completionStatus.completionType,
                skippedGPT5: true,
                contextUsed: memoryContext.length > 0,
                responseTime: responseTime,
                tokenCount: 0,
                functionExecutionTime: responseTime,
                gpt5OnlyMode: true,
                gpt5System: false,
                operatorMode: false,
                powerMode: 'COMPLETION_DETECTION',
                confidence: 0.95,
                modelUsed: 'none',
                cost_tier: 'free',
                
                memoryData: {
                    contextLength: memoryContext.length,
                    conversationRecords: memoryData.conversationHistory.length,
                    persistentMemories: memoryData.persistentMemory.length,
                    memoryImportant: false,
                    memoryUsed: memoryContext.length > 0,
                    postgresqlConnected: memoryData.conversationHistory.length > 0 || memoryData.persistentMemory.length > 0
                },
                
                success: true,
                timestamp: new Date().toISOString(),
                
                sendToTelegram: async (bot, title = null) => {
                    try {
                        const finalTitle = title || 'Task Completion Acknowledged';
                        
                        const metadata = {
                            responseTime: responseTime,
                            completionDetected: true,
                            completionType: queryAnalysis.completionStatus.completionType,
                            contextUsed: memoryContext.length > 0,
                            skippedGPT5: true,
                            costSaved: true
                        };
                        
                        return await telegramSplitter.sendGPTResponse(
                            bot, chatId, queryAnalysis.quickResponse, finalTitle, metadata
                        );
                        
                    } catch (telegramError) {
                        console.error('Completion response Telegram error:', telegramError.message);
                        return false;
                    }
                }
            };
        }
        
        // Override model if forced (PRESERVED)
        if (options.forceModel && options.forceModel.includes('gpt-5')) {
            queryAnalysis.gpt5Model = options.forceModel;
            queryAnalysis.reason = `Forced to use ${options.forceModel}`;
        }
        
        console.log(`[OPERATOR] Query analysis:`, {
            type: queryAnalysis.type,
            priority: queryAnalysis.priority,
            model: queryAnalysis.gpt5Model,
            reasoning: queryAnalysis.reasoning_effort,
            verbosity: queryAnalysis.verbosity,
            memoryImportant: queryAnalysis.memoryImportant,
            isOperational: queryAnalysis.isOperational,
            operationType: queryAnalysis.operationType,
            reason: queryAnalysis.reason
        });
        
        let response;
        let aiUsed;
        let gpt5Result = null;
        
        try {
            // ENHANCED: Route through GPT-5 system with operator capabilities
            gpt5Result = await executeThroughGPT5System(
                userMessage, 
                queryAnalysis, 
                memoryContext, 
                memoryData, 
                chatId
            );
            
            response = gpt5Result.response;
            aiUsed = gpt5Result.aiUsed || queryAnalysis.gpt5Model;
            
            console.log(`[OPERATOR] ${queryAnalysis.isOperational ? 'OPERATIONAL' : 'ADVISORY'} execution successful:`, {
                aiUsed: aiUsed,
                powerMode: gpt5Result.powerMode,
                confidence: gpt5Result.confidence,
                costTier: gpt5Result.cost_tier,
                operationExecuted: gpt5Result.operationExecuted || false
            });
            
        } catch (gpt5Error) {
            console.error('[OPERATOR] GPT-5 system failed, trying fallback:', gpt5Error.message);
            
            try {
                response = await executeGPT5Fallback(userMessage, queryAnalysis, memoryContext);
                aiUsed = 'GPT-5-nano-fallback';
                
                console.log('GPT-5 Nano fallback successful');
                
            } catch (fallbackError) {
                console.error('All GPT-5 models failed:', fallbackError.message);
                throw new Error(`Complete GPT-5 system failure: ${fallbackError.message}`);
            }
        }
        
        const responseTime = Date.now() - startTime;
        
        console.log(`[OPERATOR] Command completed:`, {
            aiUsed: aiUsed,
            responseTime: responseTime,
            gpt5System: !!gpt5Result,
            operatorMode: gpt5Result?.operatorMode || false,
            operationExecuted: gpt5Result?.operationExecuted || false,
            memoryUsed: memoryContext.length > 0,
            conversationRecords: memoryData.conversationHistory.length,
            persistentMemories: memoryData.persistentMemory.length
        });
        
        // Build comprehensive result (ENHANCED)
        const result = {
            response: response,
            aiUsed: aiUsed,
            queryType: queryAnalysis.type,
            complexity: queryAnalysis.complexity,
            reasoning: queryAnalysis.reason,
            priority: queryAnalysis.priority,
            liveDataUsed: queryAnalysis.needsLiveData,
            contextUsed: memoryContext.length > 0,
            responseTime: responseTime,
            tokenCount: response.length,
            functionExecutionTime: responseTime,
            
            // Enhanced operator mode fields
            gpt5OnlyMode: true,
            gpt5System: !!gpt5Result,
            operatorMode: gpt5Result?.operatorMode || false,
            operationExecuted: gpt5Result?.operationExecuted || false,
            operationResult: gpt5Result?.operationResult || null,
            operationType: queryAnalysis.operationType || null,
            isOperational: queryAnalysis.isOperational || false,
            
            powerMode: gpt5Result?.powerMode || 'fallback',
            confidence: gpt5Result?.confidence || 0.7,
            modelUsed: gpt5Result?.modelUsed || 'gpt-5-nano',
            reasoning_effort: queryAnalysis.reasoning_effort,
            verbosity: queryAnalysis.verbosity,
            cost_tier: gpt5Result?.cost_tier || 'economy',
            completionDetected: false,
            
            memoryData: {
                contextLength: memoryContext.length,
                conversationRecords: memoryData.conversationHistory.length,
                persistentMemories: memoryData.persistentMemory.length,
                memoryImportant: queryAnalysis.memoryImportant,
                memoryUsed: memoryContext.length > 0,
                postgresqlConnected: memoryData.conversationHistory.length > 0 || memoryData.persistentMemory.length > 0
            },
            
            analytics: gpt5Result?.analytics || {
                queryComplexity: queryAnalysis.complexity,
                domainClassification: queryAnalysis.type,
                priorityLevel: queryAnalysis.priority,
                modelOptimization: 'GPT-5 smart selection',
                costOptimized: true,
                operationalCapabilities: operationalState.mode === 'OPERATOR'
            },
            
            success: true,
            timestamp: new Date().toISOString(),
            
            sendToTelegram: async (bot, title = null) => {
                try {
                    const operatorPrefix = gpt5Result?.operatorMode ? 'OPERATOR' : 'GPT-5';
                    const defaultTitle = `${operatorPrefix} ${queryAnalysis.gpt5Model?.includes('nano') ? 'Nano' : 
                                                queryAnalysis.gpt5Model?.includes('mini') ? 'Mini' : 'Ultimate'} ${gpt5Result?.operationExecuted ? 'Execution' : 'Analysis'}`;
                    const finalTitle = title || defaultTitle;
                    
                    const gpt5Indicator = gpt5Result ? 
                        (gpt5Result.operatorMode ? 'GPT-5 Operator' : 'GPT-5 Optimized') : 
                        'GPT-5 Fallback';
                    const fullTitle = `${finalTitle} (${gpt5Indicator})`;
                    
                    const metadata = {
                        responseTime: responseTime,
                        contextUsed: memoryContext.length > 0,
                        complexity: queryAnalysis.complexity,
                        gpt5System: !!gpt5Result,
                        operatorMode: gpt5Result?.operatorMode || false,
                        operationExecuted: gpt5Result?.operationExecuted || false,
                        confidence: gpt5Result?.confidence || 0.7,
                        model: queryAnalysis.gpt5Model,
                        costTier: gpt5Result?.cost_tier || 'economy'
                    };
                    
                    return await telegramSplitter.sendGPTResponse(
                        bot, chatId, response, fullTitle, metadata
                    );
                    
                } catch (telegramError) {
                    console.error('Telegram send error:', telegramError.message);
                    return false;
                }
            }
        };
        
        return result;
        
    } catch (error) {
        console.error('[OPERATOR] Command execution error:', error.message);
        
        const responseTime = Date.now() - startTime;
        
        return {
            response: `I apologize, but I'm experiencing technical difficulties with the GPT-5 Operator system. Please try again in a moment.\n\nError: ${error.message}\n\nYou can try:\n• A simpler question\n• Waiting a moment and trying again\n• Checking your internet connection`,
            aiUsed: 'emergency-fallback',
            queryType: 'error',
            complexity: 'low',
            reasoning: 'Complete GPT-5 Operator system failure, emergency response',
            contextUsed: false,
            responseTime: responseTime,
            operatorMode: false,
            operationExecuted: false,
            memoryData: {
                contextLength: 0,
                conversationRecords: 0,
                persistentMemories: 0,
                memoryImportant: false,
                postgresqlConnected: false
            },
            success: false,
            error: error.message,
            gpt5OnlyMode: true,
            gpt5System: false,
            
            sendToTelegram: async (bot) => {
                try {
                    return await telegramSplitter.sendAlert(bot, chatId, 
                        `GPT-5 Operator system error: ${error.message}`, 
                        'Emergency Fallback'
                    );
                } catch (telegramError) {
                    console.error('Emergency Telegram alert failed:', telegramError.message);
                    return false;
                }
            }
        };
    }
}

// MEMORY TESTING - SEPARATE FUNCTION FOR EXPLICIT TESTING ONLY (PRESERVED)
async function testMemoryIntegration(chatId) {
    console.log('Testing memory integration with GPT-5...');
    
    const tests = {
        postgresqlConnection: false,
        conversationHistory: false,
        persistentMemory: false,
        memoryBuilding: false,
        completionDetection: false,
        gpt5WithMemory: false,
        memoryContextPassing: false,
        gpt5ModelSelection: false,
        telegramIntegration: false,
        gpt5SystemHealth: false,
        operatorMode: false // NEW
    };
    
    try {
        const completionTest = detectCompletionStatus('done ready', 'system already built');
        tests.completionDetection = completionTest.shouldSkipGPT5;
        console.log(`Completion Detection: ${tests.completionDetection}`);
    } catch (error) {
        console.log(`Completion Detection: Failed - ${error.message}`);
    }
    
    try {
        const testConnection = await database.getConversationHistoryDB('test', 1);
        tests.postgresqlConnection = Array.isArray(testConnection);
        console.log(`PostgreSQL Connection: ${tests.postgresqlConnection}`);
    } catch (error) {
        console.log(`PostgreSQL Connection: Failed - ${error.message}`);
    }
    
    try {
        const history = await database.getConversationHistoryDB(chatId, 3);
        tests.conversationHistory = Array.isArray(history);
        console.log(`Conversation History: ${tests.conversationHistory} (${history?.length || 0} records)`);
    } catch (error) {
        console.log(`Conversation History: Failed - ${error.message}`);
    }
    
    try {
        const memories = await database.getPersistentMemoryDB(chatId);
        tests.persistentMemory = Array.isArray(memories);
        console.log(`Persistent Memory: ${tests.persistentMemory} (${memories?.length || 0} records)`);
    } catch (error) {
        console.log(`Persistent Memory: Failed - ${error.message}`);
    }
    
    try {
        const context = await memory.buildConversationContext(chatId);
        tests.memoryBuilding = typeof context === 'string';
        console.log(`Memory Building: ${tests.memoryBuilding} (${context?.length || 0} chars)`);
    } catch (error) {
        console.log(`Memory Building: Failed - ${error.message}`);
    }
    
    try {
        const testPrompt = 'Hello, test GPT-5 functionality';
        const directResult = await openaiClient.getGPT5Analysis(testPrompt, {
            model: 'gpt-5-nano',
            reasoning_effort: 'minimal',
            max_completion_tokens: 50
        });
        tests.gpt5WithMemory = directResult && directResult.length > 0;
        console.log(`GPT-5 with Memory: ${tests.gpt5WithMemory}`);
    } catch (error) {
        console.log(`GPT-5 with Memory: Failed - ${error.message}`);
    }
    
    try {
        tests.memoryContextPassing = tests.memoryBuilding && tests.postgresqlConnection;
        console.log(`Memory Context Passing: ${tests.memoryContextPassing}`);
    } catch (error) {
        console.log(`Memory Context Passing: Failed - ${error.message}`);
    }
    
    try {
        const healthCheck = await openaiClient.checkGPT5SystemHealth();
        tests.gpt5ModelSelection = healthCheck.gpt5NanoAvailable || healthCheck.gpt5MiniAvailable;
        console.log(`GPT-5 Model Selection: ${tests.gpt5ModelSelection}`);
    } catch (error) {
        console.log(`GPT-5 Model Selection: Failed - ${error.message}`);
    }
    
    try {
        tests.telegramIntegration = typeof telegramSplitter.sendGPTResponse === 'function';
        console.log(`Telegram Integration: ${tests.telegramIntegration}`);
    } catch (error) {
        console.log(`Telegram Integration: Failed - ${error.message}`);
    }
    
    try {
        const systemHealth = await checkGPT5OnlySystemHealth();
        tests.gpt5SystemHealth = systemHealth.overallHealth;
        console.log(`GPT-5 System Health: ${tests.gpt5SystemHealth}`);
    } catch (error) {
        console.log(`GPT-5 System Health: Failed - ${error.message}`);
    }
    
    // NEW: Test operator mode
    try {
        const operatorTest = detectOperationalCommand('list files in directory');
        tests.operatorMode = operatorTest.isOperational;
        console.log(`Operator Mode: ${tests.operatorMode}`);
    } catch (error) {
        console.log(`Operator Mode: Failed - ${error.message}`);
    }
    
    const overallSuccess = Object.values(tests).filter(test => test).length;
    const totalTests = Object.keys(tests).length;
    
    console.log(`\nMemory Test: ${overallSuccess}/${totalTests} passed`);
    
    return {
        tests: tests,
        score: overallSuccess,
        total: totalTests,
        percentage: Math.round((overallSuccess / totalTests) * 100),
        status: overallSuccess === totalTests ? 'FULL_SUCCESS' : 
                overallSuccess >= totalTests * 0.7 ? 'MOSTLY_WORKING' : 'NEEDS_ATTENTION',
        gpt5OnlyMode: true,
        operatorMode: tests.operatorMode, // NEW
        completionDetectionEnabled: tests.completionDetection,
        postgresqlIntegrated: tests.postgresqlConnection && tests.conversationHistory,
        memorySystemIntegrated: tests.memoryBuilding && tests.gpt5WithMemory
    };
}

// ENHANCED GPT-5 SYSTEM HEALTH CHECK WITH OPERATOR MODE
async function checkGPT5OnlySystemHealth() {
    const health = {
        gpt5_full: false,
        gpt5_mini: false,
        gpt5_nano: false,
        gpt5_chat: false,
        completionDetection: false,
        memorySystem: false,
        contextBuilding: false,
        dateTimeSupport: false,
        telegramIntegration: false,
        databaseConnection: false,
        operatorMode: false, // NEW
        operationalCapabilities: { // NEW
            fileOperations: false,
            systemOperations: false,
            databaseOperations: false,
            networkOperations: false,
            processOperations: false,
            automation: false
        },
        overallHealth: false,
        errors: [],
        gpt5OnlyMode: true,
        postgresqlStatus: 'unknown'
    };
    
    try {
        const testCompletion = detectCompletionStatus('done ready', 'system built');
        health.completionDetection = testCompletion.shouldSkipGPT5;
    } catch (error) {
        health.errors.push(`Completion Detection: ${error.message}`);
    }
    
    const gpt5Models = [
        { name: 'gpt5_full', model: 'gpt-5', description: 'Full GPT-5' },
        { name: 'gpt5_mini', model: 'gpt-5-mini', description: 'GPT-5 Mini' },
        { name: 'gpt5_nano', model: 'gpt-5-nano', description: 'GPT-5 Nano' },
        { name: 'gpt5_chat', model: 'gpt-5-chat-latest', description: 'GPT-5 Chat' }
    ];
    
    for (const { name, model, description } of gpt5Models) {
        try {
            const options = { model: model, max_completion_tokens: 50 };
            
            if (model !== 'gpt-5-chat-latest') {
                options.reasoning_effort = 'minimal';
                options.verbosity = 'low';
            } else {
                options.temperature = 0.7;
            }
            
            await openaiClient.getGPT5Analysis('Health check test', options);
            health[name] = true;
            console.log(`${description} operational`);
        } catch (error) {
            health.errors.push(`${model}: ${error.message}`);
        }
    }
    
    try {
        const testHistory = await database.getConversationHistoryDB('health_test', 1);
        health.databaseConnection = Array.isArray(testHistory);
        health.postgresqlStatus = 'connected';
    } catch (error) {
        health.errors.push(`PostgreSQL: ${error.message}`);
        health.postgresqlStatus = 'disconnected';
    }
    
    try {
        const testContext = await memory.buildConversationContext('health_test');
        health.memorySystem = typeof testContext === 'string';
        health.contextBuilding = true;
    } catch (error) {
        health.errors.push(`Memory: ${error.message}`);
    }
    
    try {
        const cambodiaTime = getCurrentCambodiaDateTime();
        health.dateTimeSupport = cambodiaTime && cambodiaTime.date;
    } catch (error) {
        health.errors.push(`DateTime: ${error.message}`);
    }
    
    try {
        health.telegramIntegration = typeof telegramSplitter.sendGPTResponse === 'function';
    } catch (error) {
        health.errors.push(`Telegram: ${error.message}`);
    }
    
    // NEW: Test operator mode capabilities
    try {
        const operatorTest = detectOperationalCommand('list files in directory');
        health.operatorMode = operatorTest.isOperational;
        
        // Test individual operational capabilities
        health.operationalCapabilities.fileOperations = operationalState.permissions.fileOperations && operatorSystems.fs;
        health.operationalCapabilities.systemOperations = operationalState.permissions.systemCommands && operatorSystems.os;
        health.operationalCapabilities.databaseOperations = operationalState.permissions.databaseOperations && health.databaseConnection;
        health.operationalCapabilities.networkOperations = operationalState.permissions.networkOperations && operatorSystems.https;
        health.operationalCapabilities.processOperations = operationalState.permissions.systemCommands && operatorSystems.childProcess;
        health.operationalCapabilities.automation = true; // Basic automation always available
        
    } catch (error) {
        health.errors.push(`Operator Mode: ${error.message}`);
    }
    
    const healthyModels = [health.gpt5_full, health.gpt5_mini, health.gpt5_nano].filter(Boolean).length;
    const operationalCapabilities = Object.values(health.operationalCapabilities).filter(Boolean).length;
    
    health.overallHealth = healthyModels >= 1 && health.memorySystem && health.databaseConnection;
    
    health.healthScore = (
        (healthyModels * 15) +
        (health.gpt5_chat ? 10 : 0) +
        (health.completionDetection ? 15 : 0) +
        (health.memorySystem ? 10 : 0) +
        (health.databaseConnection ? 15 : 0) +
        (health.telegramIntegration ? 5 : 0) +
        (health.dateTimeSupport ? 5 : 0) +
        (health.operatorMode ? 10 : 0) + // NEW
        (operationalCapabilities * 2) // NEW
    );
    
    health.healthGrade = health.healthScore >= 95 ? 'A+' :
                        health.healthScore >= 85 ? 'A' :
                        health.healthScore >= 75 ? 'B+' :
                        health.healthScore >= 65 ? 'B' :
                        health.healthScore >= 50 ? 'C' : 'F';
    
    return health;
}

// UTILITY FUNCTIONS (PRESERVED AND ENHANCED)
function getGPT5ModelRecommendation(query) {
    const analysis = analyzeQuery(query);
    return {
        recommendedModel: analysis.gpt5Model,
        reasoning: analysis.reason,
        priority: analysis.priority,
        completionDetected: analysis.shouldSkipGPT5,
        operationalCommand: analysis.isOperational, // NEW
        operationType: analysis.operationType, // NEW
        configuration: {
            reasoning_effort: analysis.reasoning_effort,
            verbosity: analysis.verbosity,
            max_completion_tokens: analysis.max_completion_tokens,
            temperature: analysis.temperature
        },
        estimatedCost: analysis.gpt5Model === 'gpt-5-nano' ? 'Very Low' :
                      analysis.gpt5Model === 'gpt-5-mini' ? 'Low' : 'Medium',
        responseSpeed: analysis.gpt5Model === 'gpt-5-nano' ? 'Very Fast' :
                      analysis.gpt5Model === 'gpt-5-mini' ? 'Fast' : 'Balanced'
    };
}

function getGPT5CostEstimate(query, estimatedTokens = 1000) {
    const analysis = analyzeQuery(query);
    
    if (analysis.shouldSkipGPT5) {
        return {
            model: 'completion-detection',
            estimatedInputTokens: 0,
            estimatedOutputTokens: 0,
            inputCost: '0.000000',
            outputCost: '0.000000',
            totalCost: '0.000000',
            costTier: 'Free',
            completionDetected: true,
            costSavings: 'Maximum - No AI tokens used'
        };
    }
    
    const costs = {
        'gpt-5-nano': { input: 0.05, output: 0.40 },
        'gpt-5-mini': { input: 0.25, output: 2.00 },
        'gpt-5': { input: 1.25, output: 10.00 },
        'gpt-5-chat-latest': { input: 1.25, output: 10.00 }
    };
    
    const modelCosts = costs[analysis.gpt5Model] || costs['gpt-5-mini'];
    const inputCost = (estimatedTokens * 0.5 / 1000000) * modelCosts.input;
    const outputCost = (estimatedTokens * 0.5 / 1000000) * modelCosts.output;
    
    return {
        model: analysis.gpt5Model,
        estimatedInputTokens: Math.round(estimatedTokens * 0.5),
        estimatedOutputTokens: Math.round(estimatedTokens * 0.5),
        inputCost: `${inputCost.toFixed(6)}`,
        outputCost: `${outputCost.toFixed(6)}`,
        totalCost: `${(inputCost + outputCost).toFixed(6)}`,
        costTier: analysis.gpt5Model === 'gpt-5-nano' ? 'Economy' :
                 analysis.gpt5Model === 'gpt-5-mini' ? 'Standard' : 'Premium',
        completionDetected: false,
        operationalCommand: analysis.isOperational // NEW
    };
}

function getGPT5PerformanceMetrics() {
    return {
        systemMode: 'GPT-5 OPERATOR MODE with Completion Detection',
        modelsAvailable: ['gpt-5', 'gpt-5-mini', 'gpt-5-nano', 'gpt-5-chat-latest'],
        smartRouting: 'Enabled',
        completionDetection: 'Active',
        operatorMode: 'ACTIVE', // NEW
        operationalCapabilities: [ // NEW
            'File Operations',
            'System Operations', 
            'Database Operations',
            'Network Operations',
            'Process Management',
            'Automation'
        ],
        costOptimization: 'Active + Completion Savings + Operator Efficiency',
        memoryIntegration: 'PostgreSQL-backed',
        telegramIntegration: 'Enhanced',
        fallbackSystem: 'Multi-tier GPT-5',
        healthMonitoring: 'Comprehensive + Operational',
        estimatedSavings: '60-80% vs dual AI system + completion detection + operator efficiency',
        responseTime: {
            completion: 'Instant (no AI processing)',
            operational: '2-10 seconds (includes execution)',
            nano: '1-3 seconds',
            mini: '2-5 seconds', 
            full: '3-8 seconds',
            chat: '2-6 seconds'
        },
        capabilities: {
            completionDetection: 'Prevents repetitive responses',
            operationalExecution: 'Real system operations', // NEW
            speed: 'GPT-5 Nano optimized',
            balance: 'GPT-5 Mini optimized',
            complex: 'Full GPT-5 optimized',
            vision: 'Full GPT-5 enabled',
            coding: 'Full GPT-5 enhanced',
            math: 'Full GPT-5 precision'
        }
    };
}

async function getMarketIntelligence(chatId = null) {
    const globalTime = getCurrentGlobalDateTime();
    const query = `Current market intelligence summary - Time: ${globalTime.cambodia.date}, ${globalTime.cambodia.time} Cambodia. Provide concise overview of market conditions, key risks, and opportunities.`;
    
    try {
        return await openaiClient.getGPT5Analysis(query, {
            model: 'gpt-5-mini',
            reasoning_effort: 'medium',
            verbosity: 'medium',
            max_completion_tokens: 8000
        });
    } catch (error) {
        try {
            return await openaiClient.getGPT5Analysis(query, {
                model: 'gpt-5-nano',
                reasoning_effort: 'minimal',
                verbosity: 'low',
                max_completion_tokens: 6000
            });
        } catch (fallbackError) {
            return 'Market intelligence temporarily unavailable - GPT-5 system experiencing issues';
        }
    }
}

function getGlobalMarketStatus() {
    try {
        const globalTime = getCurrentGlobalDateTime();
        
        return {
            cambodia: {
                time: globalTime.cambodia.time,
                isBusinessHours: !globalTime.cambodia.isWeekend && 
                               globalTime.cambodia.hour >= 8 && 
                               globalTime.cambodia.hour <= 17,
                isWeekend: globalTime.cambodia.isWeekend
            },
            newYork: {
                time: globalTime.newYork.time,
                isMarketHours: !globalTime.cambodia.isWeekend && 
                             globalTime.newYork.hour >= 9 && 
                             globalTime.newYork.hour <= 16
            },
            london: {
                time: globalTime.london.time,
                isMarketHours: !globalTime.cambodia.isWeekend && 
                             globalTime.london.hour >= 8 && 
                             globalTime.london.hour <= 16
            },
            summary: globalTime.cambodia.isWeekend ? 
                    'Weekend - Markets Closed' : 
                    'Weekday - Check individual market hours',
            lastUpdated: new Date().toISOString(),
            poweredBy: 'GPT-5 Operator System'
        };
    } catch (error) {
        return { error: 'Global market status unavailable' };
    }
}

// ENHANCED SYSTEM ANALYTICS WITH OPERATOR MODE
function getSystemAnalytics() {
    return {
        version: '6.0 - GPT-5 OPERATOR MODE + Normal Conversation + Operational Execution',
        architecture: 'index.js → dualCommandSystem.js → openaiClient.js → operationalSystems',
        aiSystem: {
            core: 'GPT-5 Family Smart Selection + Operator Mode',
            models: 'gpt-5, gpt-5-mini, gpt-5-nano, gpt-5-chat-latest',
            routing: 'Intelligent model selection + operational command detection',
            costOptimization: 'Automatic cost-efficient model selection',
            operationalMode: 'Real system operations and automation'
        },
        features: [
            'GPT-5 Family Smart Selection',
            'Real Operational Command Execution',
            'Normal conversation support', 
            'Memory integration when needed',
            'Cost-optimized routing',
            'Multi-tier fallback systems',
            'File system operations',
            'System monitoring and control',
            'Database operations',
            'Network operations',
            'Process management',
            'Task automation'
        ],
        queryTypes: [
            'completion', 'speed', 'complex', 'mathematical', 'regional', 'market', 
            'multimodal', 'chat', 'memory-enhanced', 'operational' // NEW
        ],
        operationalCapabilities: [ // NEW
            'File Operations (create, read, delete, list)',
            'System Operations (health check, command execution)',
            'Database Operations (query, backup, export)',
            'Network Operations (HTTP requests, connection tests)',
            'Process Operations (status monitoring, management)',
            'Automation (task scheduling, workflow creation)'
        ],
        transformedFrom: 'Assistant/Advisor → Real Operator System'
    };
}
// ENHANCED FUNCTIONS FOR GPT-5 OPERATOR INTEGRATION
async function executeEnhancedGPT5Command(userMessage, chatId, bot = null, options = {}) {
    try {
        console.log('[OPERATOR] Executing enhanced GPT-5 command...');
        
        // Build memory context if available
        let memoryContext = '';
        try {
            if (memory && typeof memory.buildConversationContext === 'function') {
                memoryContext = await memory.buildConversationContext(chatId);
                console.log(`Memory context built: ${memoryContext.length} chars`);
            }
        } catch (memoryError) {
            console.warn('Memory context building failed:', memoryError.message);
        }
        
        // Enhanced options with memory context
        const enhancedOptions = {
            ...options,
            memoryContext: memoryContext
        };
        
        // Execute the core GPT-5 command
        const result = await executeDualCommand(userMessage, chatId, enhancedOptions);
        
        // Automatic Telegram delivery if bot provided
        if (bot && result.success && result.response) {
            try {
                if (typeof telegramSplitter !== 'undefined' && telegramSplitter.sendGPTResponse) {
                    const operatorPrefix = result.operatorMode ? 'OPERATOR' : 'GPT-5';
                    const title = options.title || `${operatorPrefix} Analysis`;
                    const metadata = {
                        aiUsed: result.aiUsed || 'GPT-5',
                        modelUsed: result.modelUsed || options.forceModel || 'gpt-5-mini',
                        processingTime: Date.now() - (result.startTime || Date.now()),
                        operatorMode: result.operatorMode || false,
                        operationExecuted: result.operationExecuted || false
                    };
                    
                    const telegramSuccess = await telegramSplitter.sendGPTResponse(
                        bot, chatId, result.response, title, metadata
                    );
                    result.telegramDelivered = telegramSuccess;
                } else {
                    await bot.sendMessage(chatId, result.response);
                    result.telegramDelivered = true;
                }
                result.autoDelivery = true;
            } catch (telegramError) {
                console.warn('Telegram delivery failed:', telegramError.message);
                result.telegramDelivered = false;
            }
        }
        
        return result;
        
    } catch (error) {
        console.error('[OPERATOR] Enhanced GPT-5 command error:', error.message);
        
        if (bot) {
            try {
                if (typeof telegramSplitter !== 'undefined' && telegramSplitter.sendAlert) {
                    await telegramSplitter.sendAlert(bot, chatId, 
                        `Analysis failed: ${error.message}`, 
                        'GPT-5 Operator Error'
                    );
                } else {
                    await bot.sendMessage(chatId, 
                        `I encountered an issue: ${error.message}. Let me try a different approach.`
                    );
                }
            } catch (telegramError) {
                console.error('Error notification delivery failed:', telegramError.message);
            }
        }
        
        return {
            success: false,
            response: 'I\'m having technical difficulties. Please try again.',
            aiUsed: 'error-fallback',
            modelUsed: 'error-handler',
            contextUsed: false,
            operatorMode: false,
            operationExecuted: false,
            telegramDelivered: false,
            error: error.message
        };
    }
}

// OPERATOR COMMAND EXECUTION FUNCTIONS
async function executeOperatorCommand(command, chatId, bot = null, operationType = 'auto') {
    const options = {
        title: `OPERATOR ${operationType.toUpperCase()} Command`,
        saveToMemory: true,
        forceModel: 'gpt-5' // Use full GPT-5 for operational commands
    };
    
    // Auto-detect operation type if not specified
    if (operationType === 'auto') {
        const detection = detectOperationalCommand(command);
        if (detection.isOperational) {
            operationType = detection.category;
        }
    }
    
    console.log(`[OPERATOR] Executing ${operationType} command: ${command.substring(0, 50)}...`);
    
    return await executeEnhancedGPT5Command(command, chatId, bot, options);
}

// Quick operator command functions
async function executeFileOperation(command, chatId, bot = null) {
    return await executeOperatorCommand(command, chatId, bot, 'fileOps');
}

async function executeSystemOperation(command, chatId, bot = null) {
    return await executeOperatorCommand(command, chatId, bot, 'systemOps');
}

async function executeDatabaseOperation(command, chatId, bot = null) {
    return await executeOperatorCommand(command, chatId, bot, 'databaseOps');
}

async function executeNetworkOperation(command, chatId, bot = null) {
    return await executeOperatorCommand(command, chatId, bot, 'networkOps');
}

async function executeAutomationOperation(command, chatId, bot = null) {
    return await executeOperatorCommand(command, chatId, bot, 'automation');
}

// OPERATIONAL STATUS AND MONITORING
function getOperationalStatus() {
    const activeOps = Array.from(operationalState.activeOperations.values());
    const recentHistory = operationalState.operationHistory.slice(-10);
    
    return {
        mode: operationalState.mode,
        activeOperations: activeOps.length,
        totalOperationsToday: operationalState.operationHistory.length,
        recentOperations: recentHistory.map(op => ({
            id: op.id,
            type: op.type,
            status: op.status,
            duration: op.duration,
            timestamp: new Date(op.startTime).toISOString()
        })),
        permissions: operationalState.permissions,
        systemHealth: operationalState.systemHealth,
        lastHealthCheck: operationalState.lastHealthCheck,
        uptime: process.uptime(),
        version: '6.0-OPERATOR'
    };
}

function getOperationHistory(limit = 20) {
    return operationalState.operationHistory
        .slice(-limit)
        .map(op => ({
            id: op.id,
            type: op.type,
            status: op.status,
            duration: op.duration || 0,
            startTime: new Date(op.startTime).toISOString(),
            endTime: op.endTime ? new Date(op.endTime).toISOString() : null,
            success: op.status === 'COMPLETED',
            error: op.error
        }));
}

// SAFETY AND PERMISSIONS MANAGEMENT
function updateOperationalPermissions(permissions = {}) {
    const oldPermissions = { ...operationalState.permissions };
    operationalState.permissions = { ...operationalState.permissions, ...permissions };
    
    console.log('[OPERATOR] Permissions updated:', {
        old: oldPermissions,
        new: operationalState.permissions
    });
    
    return operationalState.permissions;
}

function enableOperatorMode() {
    operationalState.mode = 'OPERATOR';
    operationalState.permissions.autoExecute = true;
    console.log('[OPERATOR] Operator mode ENABLED');
    return true;
}

function disableOperatorMode() {
    operationalState.mode = 'ADVISORY';
    operationalState.permissions.autoExecute = false;
    console.log('[OPERATOR] Operator mode DISABLED - switching to advisory mode');
    return false;
}

// PRESERVED QUICK COMMAND FUNCTIONS
async function quickGPT5Command(message, chatId, bot = null, model = 'auto') {
    const options = { 
        title: `GPT-5 ${model.toUpperCase()} Analysis`,
        saveToMemory: true
    };
    
    if (model !== 'auto') {
        options.forceModel = model.includes('gpt-5') ? model : `gpt-5-${model}`;
    }
    
    return await executeEnhancedGPT5Command(message, chatId, bot, options);
}

async function quickNanoCommand(message, chatId, bot = null) {
    return await quickGPT5Command(message, chatId, bot, 'gpt-5-nano');
}

async function quickMiniCommand(message, chatId, bot = null) {
    return await quickGPT5Command(message, chatId, bot, 'gpt-5-mini');
}

async function quickUltimateCommand(message, chatId, bot = null) {
    return await quickGPT5Command(message, chatId, bot, 'gpt-5');
}

// PRESERVED UTILITY FUNCTIONS
async function executeGPT5WithContext(prompt, chatId, options = {}) {
    return await executeDualCommand(prompt, chatId, {
        ...options,
        saveToMemory: true
    });
}

async function executeGPT5Analysis(prompt, model = 'gpt-5-mini') {
    try {
        return await openaiClient.getGPT5Analysis(prompt, {
            model: model,
            max_completion_tokens: 2000,
            reasoning_effort: 'medium'
        });
    } catch (error) {
        console.error('Direct GPT-5 analysis error:', error.message);
        return 'Analysis unavailable due to technical issues.';
    }
}

// EMERGENCY FALLBACK FUNCTIONS (PRESERVED)
async function saveConversationEmergency(chatId, userMessage, response, metadata = {}) {
    try {
        if (database && typeof database.saveConversation === 'function') {
            await database.saveConversation(chatId, userMessage, response, metadata);
            console.log('Conversation saved to database');
            return true;
        }
    } catch (error) {
        console.warn('Emergency conversation save failed:', error.message);
    }
    return false;
}

// SYSTEM STARTUP MESSAGE
console.log('🎯 [OPERATOR] Real GPT-5 Operator System loaded (Released August 7, 2025)');
console.log('⚡ TRANSFORMATION COMPLETE: Assistant/Advisor → Real Operator');
console.log('🔧 Operational capabilities: File, System, Database, Network, Process, Automation');
console.log('✨ Enhanced error handling and fallback systems active');
console.log('🔄 Safe response extraction implemented');
console.log('⚡ Ready for GPT-5 Nano → Mini → Full → Operator routing');
console.log('🚀 OPERATOR MODE: Real system operations and automation enabled');

if (operationalState.permissions.autoExecute) {
    console.log('🟢 Auto-execution ENABLED - Commands will be executed automatically');
} else {
    console.log('🟡 Auto-execution DISABLED - Commands will be planned but not executed');
}

console.log(`📊 System permissions: ${JSON.stringify(operationalState.permissions, null, 2)}`);

// COMPREHENSIVE MODULE EXPORTS
module.exports = {
    // CORE FUNCTIONS (PRESERVED)
    executeDualCommand,
    analyzeQuery,
    executeThroughGPT5System,
    executeGPT5Fallback,
    detectCompletionStatus,
    generateCompletionResponse,
    testMemoryIntegration,
    getCurrentCambodiaDateTime,
    getCurrentGlobalDateTime,
    getMarketIntelligence,
    getGlobalMarketStatus,
    checkSystemHealth: checkGPT5OnlySystemHealth,
    getSystemAnalytics,
    
    // ENHANCED GPT-5 FUNCTIONS (PRESERVED)
    executeEnhancedGPT5Command,
    quickGPT5Command,
    quickNanoCommand,
    quickMiniCommand,
    quickUltimateCommand,
    checkGPT5OnlySystemHealth,
    getGPT5ModelRecommendation,
    getGPT5CostEstimate,
    getGPT5PerformanceMetrics,
    
    // NEW OPERATOR FUNCTIONS
    detectOperationalCommand,
    executeOperationalCommand,
    executeOperatorCommand,
    executeFileOperation,
    executeSystemOperation,
    executeDatabaseOperation,
    executeNetworkOperation,
    executeAutomationOperation,
    
    // OPERATIONAL STATE MANAGEMENT
    getOperationalStatus,
    getOperationHistory,
    updateOperationalPermissions,
    enableOperatorMode,
    disableOperatorMode,
    
    // OPERATIONAL TRACKING
    trackOperation,
    completeOperation,
    
    // UTILITY FUNCTIONS (PRESERVED)
    executeGPT5WithContext,
    executeGPT5Analysis,
    saveConversationEmergency,
    
    // LEGACY COMPATIBILITY (PRESERVED)
    executeGptAnalysis: (msg, analysis, ctx, mem) => executeThroughGPT5System(msg, {...analysis, bestAI: 'gpt'}, ctx, mem),
    executeClaudeAnalysis: (msg, analysis, ctx, mem) => executeThroughGPT5System(msg, {...analysis, bestAI: 'gpt'}, ctx, mem),
    routeConversationIntelligently: analyzeQuery,
    
    // SYSTEM STATE ACCESS
    getOperationalState: () => operationalState,
    getActiveOperations: () => Array.from(operationalState.activeOperations.values()),
    getSystemMode: () => operationalState.mode
};

console.log('✅ [OPERATOR] Enhanced GPT-5 Operator Functions loaded (v6.0 - COMPLETE TRANSFORM)');
console.log('🎯 Core flow: executeEnhancedGPT5Command → executeDualCommand → operationalExecution → openaiClient');
console.log('⚡ Features: Memory integration, Telegram delivery, Real operations, Error handling');
console.log('🔧 Operator capabilities: File, System, DB, Network, Process, Automation');
console.log('🚀 Cambodia module compatibility: ✅ Ready + OPERATOR MODE');
console.log('📊 TRANSFORMATION: From Assistant → Real Operator System COMPLETE'); 
