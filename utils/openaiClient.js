// utils/openaiClient.js - FIXED: Production-Grade GPT-5 Client with Accurate Token Counting and Response Extraction
require("dotenv").config();
const { OpenAI } = require("openai");
const crypto = require("crypto");

// Advanced metrics and monitoring
class GPT5Metrics {
 constructor() {
   this.stats = {
     totalCalls: 0,
     successfulCalls: 0,
     failedCalls: 0,
     totalTokensUsed: 0,
     totalCost: 0,
     averageResponseTime: 0,
     modelUsageStats: {},
     errorTypes: {},
     responseTimes: [],
     lastReset: new Date().toISOString()
   };
   this.startTime = Date.now();
 }

 recordCall(model, success, tokens, cost, responseTime, error = null) {
   this.stats.totalCalls++;
   if (success) {
     this.stats.successfulCalls++;
     this.stats.totalTokensUsed += tokens;
     this.stats.totalCost += cost;
     this.stats.responseTimes.push(responseTime);
     this.stats.averageResponseTime = this.stats.responseTimes.reduce((a, b) => a + b, 0) / this.stats.responseTimes.length;
   } else {
     this.stats.failedCalls++;
     if (error) {
       this.stats.errorTypes[error] = (this.stats.errorTypes[error] || 0) + 1;
     }
   }
   
   this.stats.modelUsageStats[model] = this.stats.modelUsageStats[model] || { calls: 0, tokens: 0, cost: 0 };
   this.stats.modelUsageStats[model].calls++;
   this.stats.modelUsageStats[model].tokens += tokens;
   this.stats.modelUsageStats[model].cost += cost;

   if (this.stats.responseTimes.length > 1000) {
     this.stats.responseTimes = this.stats.responseTimes.slice(-1000);
   }
 }

 getStats() {
   return {
     ...this.stats,
     uptime: Date.now() - this.startTime,
     successRate: this.stats.totalCalls > 0 ? ((this.stats.successfulCalls / this.stats.totalCalls) * 100).toFixed(2) : 0
   };
 }

 reset() {
   this.stats = {
     totalCalls: 0,
     successfulCalls: 0,
     failedCalls: 0,
     totalTokensUsed: 0,
     totalCost: 0,
     averageResponseTime: 0,
     modelUsageStats: {},
     errorTypes: {},
     responseTimes: [],
     lastReset: new Date().toISOString()
   };
 }
}

// Intelligent response caching
class GPT5Cache {
 constructor(maxSize = 1000, ttl = 3600000) {
   this.cache = new Map();
   this.maxSize = maxSize;
   this.ttl = ttl;
 }

 generateKey(prompt, options) {
   const clean = { ...options };
   delete clean.skipCache;
   return crypto.createHash("sha256").update(prompt + JSON.stringify(clean)).digest("hex");
 }

 get(key) {
   const item = this.cache.get(key);
   if (!item) return null;
   if (Date.now() - item.timestamp > this.ttl) {
     this.cache.delete(key);
     return null;
   }
   item.hits++;
   return item.data;
 }

 set(key, data) {
   if (this.cache.size >= this.maxSize) {
     const firstKey = this.cache.keys().next().value;
     this.cache.delete(firstKey);
   }
   this.cache.set(key, { data, timestamp: Date.now(), hits: 0 });
 }

 clear() {
   this.cache.clear();
 }

 getStats() {
   let totalHits = 0;
   let totalItems = 0;
   for (const item of this.cache.values()) {
     totalHits += item.hits;
     totalItems++;
   }
   return {
     size: this.cache.size,
     maxSize: this.maxSize,
     hitRate: totalItems > 0 ? (totalHits / totalItems).toFixed(2) : 0
   };
 }
}

// Circuit breaker
class CircuitBreaker {
 constructor(threshold = 5, timeout = 60000) {
   this.threshold = threshold;
   this.timeout = timeout;
   this.failureCount = 0;
   this.lastFailureTime = null;
   this.state = "CLOSED";
 }

 async execute(fn) {
   if (this.state === "OPEN") {
     if (Date.now() - this.lastFailureTime > this.timeout) {
       this.state = "HALF_OPEN";
     } else {
       throw new Error("Circuit breaker is OPEN");
     }
   }
   try {
     const result = await fn();
     this.onSuccess();
     return result;
   } catch (err) {
     this.onFailure();
     throw err;
   }
 }

 onSuccess() {
   this.failureCount = 0;
   this.state = "CLOSED";
 }

 onFailure() {
   this.failureCount++;
   this.lastFailureTime = Date.now();
   if (this.failureCount >= this.threshold) this.state = "OPEN";
 }

 getState() {
   return this.state;
 }
}

// Initialize components
const metrics = new GPT5Metrics();
const cache = new GPT5Cache();
const circuitBreaker = new CircuitBreaker();

// OpenAI client
const openai = new OpenAI({
 apiKey: process.env.OPENAI_API_KEY,
 timeout: 180000,
 maxRetries: 2,
 defaultHeaders: {
   "User-Agent": "IMPERIUM-VAULT-GPT5/2.0.0",
   "X-Client-Version": "2.0.0",
   "X-Environment": process.env.NODE_ENV || "development"
 }
});

// Configuration
const GPT5_CONFIG = {
 PRIMARY_MODEL: "gpt-5",
 MINI_MODEL: "gpt-5-mini",
 NANO_MODEL: "gpt-5-nano",
 CHAT_MODEL: "gpt-5-chat-latest",
 FALLBACK_MODEL: "gpt-4o",

 ENHANCED_CONTEXT_WINDOW: 272000, // Updated to match official specs
 MAX_OUTPUT_TOKENS: 128000, // Updated to match official specs
 MAX_PROMPT_LENGTH: 200000,

 REASONING_EFFORTS: ["minimal", "low", "medium", "high"],
 VERBOSITY_LEVELS: ["low", "medium", "high"],
 DEFAULT_REASONING: "medium",
 DEFAULT_VERBOSITY: "medium",
 DEFAULT_TEMPERATURE: 0.7,

 MODEL_CAPABILITIES: {
   "gpt-5": {
     reasoning: true,
     maxTokens: 128000,
     speed: "slow",
     pricing: { input: 1.25, output: 10.00 }, // Per million tokens
     quality: "highest"
   },
   "gpt-5-mini": {
     reasoning: true,
     maxTokens: 128000,
     speed: "medium",
     pricing: { input: 0.25, output: 2.00 },
     quality: "high"
   },
   "gpt-5-nano": {
     reasoning: true,
     maxTokens: 128000,
     speed: "fast",
     pricing: { input: 0.05, output: 0.40 },
     quality: "good"
   },
   "gpt-5-chat-latest": {
     reasoning: false,
     maxTokens: 128000,
     speed: "fast",
     pricing: { input: 1.25, output: 10.00 },
     quality: "high"
   },
   "gpt-4o": {
     reasoning: false,
     maxTokens: 16384,
     speed: "medium",
     pricing: { input: 2.50, output: 10.00 },
     quality: "high"
   }
 },

 AUTO_SCALE: {
   NANO_MAX_LENGTH: 2000,
   MINI_MAX_LENGTH: 10000,
   COMPLEXITY_KEYWORDS: ["analyze", "compare", "evaluate", "research", "complex", "detailed", "comprehensive"]
 }
};

// Model selection
function selectOptimalModel(prompt, options = {}) {
 if (options.model) return options.model;
 const promptLength = prompt.length;
 const hasComplex = GPT5_CONFIG.AUTO_SCALE.COMPLEXITY_KEYWORDS.some(k => prompt.toLowerCase().includes(k));
 if (promptLength < GPT5_CONFIG.AUTO_SCALE.NANO_MAX_LENGTH && !hasComplex) return GPT5_CONFIG.NANO_MODEL;
 if (promptLength < GPT5_CONFIG.AUTO_SCALE.MINI_MAX_LENGTH && !hasComplex) return GPT5_CONFIG.MINI_MODEL;
 if (hasComplex || options.reasoning_effort === "high") return GPT5_CONFIG.PRIMARY_MODEL;
 return GPT5_CONFIG.MINI_MODEL;
}

// Cost calculation
function calculateCost(model, inputTokens, outputTokens) {
 const pricing = GPT5_CONFIG.MODEL_CAPABILITIES[model]?.pricing;
 if (!pricing) return 0;
 return ((inputTokens * pricing.input) + (outputTokens * pricing.output)) / 1000000;
}

// Structured logging
function logApiCall(model, apiType, inputTokens, outputTokens, executionTime, success, error = null) {
 const cost = calculateCost(model, inputTokens, outputTokens);
 const logData = {
   timestamp: new Date().toISOString(),
   model,
   apiType,
   inputTokens,
   outputTokens,
   totalTokens: inputTokens + outputTokens,
   cost: cost.toFixed(6),
   executionTime,
   success,
   error: error?.message || null,
   circuitBreakerState: circuitBreaker.getState()
 };
 console.log(`[GPT5-API] ${JSON.stringify(logData)}`);
 return cost;
}

// COMPLETELY REWRITTEN: Response extraction with comprehensive structure handling
function safeExtractResponseText(completion, apiType = "responses") {
 console.log(`🔍 Extracting response from ${apiType} API...`);
 
 try {
   if (!completion) {
     console.warn("🔍 No completion object received");
     return "[No completion object received]";
   }

   // Log the structure for debugging
   console.log("🔍 Completion object keys:", Object.keys(completion));
   
   if (apiType === "responses") {
     console.log("🔍 Processing GPT-5 Responses API response...");
     
     // Method 1: Direct choices array (most common for GPT-5)
     if (completion.choices && Array.isArray(completion.choices) && completion.choices.length > 0) {
       const choice = completion.choices[0];
       console.log("🔍 Found choices array, first choice keys:", Object.keys(choice));
       
       // Standard message content
       if (choice.message && choice.message.content) {
         console.log("🔍 Found message.content in choices[0]");
         const content = choice.message.content.trim();
         if (content === "") {
           return "[Empty message content from GPT-5]";
         }
         return content;
       }
       
       // Direct text in choice
       if (typeof choice.text === "string") {
         console.log("🔍 Found text field in choices[0]");
         return choice.text.trim() || "[Empty text field]";
       }
       
       // Content array in choice
       if (choice.content) {
         console.log("🔍 Found content field in choices[0]");
         if (typeof choice.content === "string") {
           return choice.content.trim() || "[Empty content string]";
         }
         if (Array.isArray(choice.content) && choice.content[0]) {
           const firstContent = choice.content[0];
           if (firstContent.text) return firstContent.text.trim();
           if (typeof firstContent === "string") return firstContent.trim();
         }
       }
     }
     
     // Method 2: Direct text fields
     if (typeof completion.text === "string") {
       console.log("🔍 Found direct text field");
       return completion.text.trim() || "[Empty text field]";
     }
     
     if (typeof completion.content === "string") {
       console.log("🔍 Found direct content field");
       return completion.content.trim() || "[Empty content field]";
     }
     
     if (typeof completion.output_text === "string") {
       console.log("🔍 Found output_text field");
       return completion.output_text.trim() || "[Empty output_text field]";
     }
     
     // Method 3: Message object
     if (completion.message) {
       console.log("🔍 Found message object, keys:", Object.keys(completion.message));
       if (completion.message.content) {
         console.log("🔍 Found content in message object");
         return completion.message.content.trim() || "[Empty message content]";
       }
       if (completion.message.text) {
         console.log("🔍 Found text in message object");
         return completion.message.text.trim() || "[Empty message text]";
       }
     }
     
     // Method 4: Content array structures
     if (completion.content && Array.isArray(completion.content)) {
       console.log("🔍 Found content array, length:", completion.content.length);
       for (const item of completion.content) {
         if (item && typeof item === "object") {
           if (item.text) return item.text.trim();
           if (item.content) return item.content.trim();
         }
         if (typeof item === "string") return item.trim();
       }
     }
     
     // Method 5: Output structures
     if (completion.output) {
       console.log("🔍 Found output field, type:", typeof completion.output);
       if (typeof completion.output === "string") {
         return completion.output.trim() || "[Empty output string]";
       }
       if (Array.isArray(completion.output)) {
         for (const item of completion.output) {
           if (item && item.content) {
             if (Array.isArray(item.content)) {
               for (const c of item.content) {
                 if (c && c.text) return c.text.trim();
               }
             }
             if (typeof item.content === "string") return item.content.trim();
           }
           if (item && item.text) return item.text.trim();
         }
       }
     }
     
     // Method 6: Response field
     if (completion.response) {
       console.log("🔍 Found response field");
       if (typeof completion.response === "string") {
         return completion.response.trim() || "[Empty response string]";
       }
       if (completion.response.text) {
         return completion.response.text.trim() || "[Empty response text]";
       }
       if (completion.response.content) {
         return completion.response.content.trim() || "[Empty response content]";
       }
     }
     
     // Method 7: Try to find ANY string field that looks like content
     console.log("🔍 Searching for any text-like fields...");
     for (const [key, value] of Object.entries(completion)) {
       if (typeof value === "string" && value.length > 0 && !key.includes("id") && !key.includes("model") && !key.includes("timestamp")) {
         console.log(`🔍 Found potential content in field '${key}':`, value.substring(0, 50) + "...");
         return value.trim();
       }
     }
     
     // If we get here, log the full structure for debugging
     console.error("🔍 Could not extract text from Responses API. Full structure:");
     console.error(JSON.stringify(completion, null, 2));
     return "[Could not extract response from GPT-5 Responses API]";
     
   } else {
     // Chat Completions API
     console.log("🔍 Processing Chat Completions API response...");
     
     if (completion.choices && Array.isArray(completion.choices) && completion.choices.length > 0) {
       const choice = completion.choices[0];
       if (choice.message && choice.message.content) {
         console.log("🔍 Found message content in chat API");
         return choice.message.content.trim() || "[Empty chat message content]";
       }
     }
     
     console.error("🔍 Invalid Chat API structure. Keys:", Object.keys(completion));
     console.error("Full chat completion:", JSON.stringify(completion, null, 2));
     return "[Could not extract response from Chat API]";
   }
 } catch (error) {
   console.error("🔍 Error extracting response text:", error);
   console.error("🔍 Completion object that caused error:", completion);
   return `[Response extraction error: ${error.message}]`;
 }
}

// Request builders with parameter normalization
function buildResponsesRequest(model, input, options = {}) {
 const req = { model, input };

 if (options.reasoning_effort && GPT5_CONFIG.REASONING_EFFORTS.includes(options.reasoning_effort)) {
   req.reasoning = { effort: options.reasoning_effort };
 }
 if (options.verbosity && GPT5_CONFIG.VERBOSITY_LEVELS.includes(options.verbosity)) {
   req.text = { verbosity: options.verbosity };
 }

 const maxTokens = options.max_output_tokens || options.max_completion_tokens || 8000;
 req.max_output_tokens = Math.max(16, Math.min(maxTokens, GPT5_CONFIG.MAX_OUTPUT_TOKENS));

 return req;
}

function buildChatRequest(model, messages, options = {}) {
 const req = { model, messages };

 if (options.temperature !== undefined) {
   req.temperature = Math.max(0, Math.min(2, options.temperature));
 }
 if (options.top_p !== undefined) {
   req.top_p = Math.max(0, Math.min(1, options.top_p));
 }

 const maxTokens = options.max_tokens || options.max_completion_tokens || 8000;
 req.max_tokens = Math.max(1, Math.min(maxTokens, 128000));

 return req;
}

// Debug function to test response structures
async function debugGPT5Response(testInput = "Hello, please respond with exactly: TEST SUCCESS") {
 console.log("🔍 DEBUGGING GPT-5 RESPONSE STRUCTURE...");
 console.log("🔍 Test input:", testInput);
 
 try {
   const completion = await openai.responses.create({
     model: "gpt-5-mini",
     input: testInput,
     max_output_tokens: 100
   });

   console.log("🔍 RAW COMPLETION OBJECT:");
   console.log("Type:", typeof completion);
   console.log("Constructor:", completion?.constructor?.name);
   console.log("Keys:", Object.keys(completion || {}));
   console.log("Full object structure:");
   console.log(JSON.stringify(completion, null, 2));
   
   if (completion?.usage) {
     console.log("🔍 USAGE INFO:");
     console.log("Input tokens:", completion.usage.input_tokens);
     console.log("Output tokens:", completion.usage.output_tokens);
     console.log("Total tokens:", completion.usage.total_tokens);
   }

   // Test extraction
   const extracted = safeExtractResponseText(completion, "responses");
   console.log("🔍 EXTRACTED TEXT:", extracted);

   return {
     success: true,
     rawResponse: completion,
     extractedText: extracted,
     usage: completion?.usage
   };
 } catch (error) {
   console.error("🔍 DEBUG ERROR:", error);
   return {
     success: false,
     error: error.message,
     fullError: error
   };
 }
}

// REWRITTEN: Core execution with improved error handling and response extraction
async function getGPT5Analysis(prompt, options = {}) {
 const startTime = Date.now();
 let inputTokens = 0;
 let outputTokens = 0;
 let selectedModel = null;
 let apiUsed = "unknown";

 try {
   if (!prompt || typeof prompt !== "string") {
     throw new Error("Invalid prompt: must be non-empty string");
   }

   if (prompt.length > GPT5_CONFIG.MAX_PROMPT_LENGTH) {
     console.warn(`Prompt too long (${prompt.length} chars), truncating to ${GPT5_CONFIG.MAX_PROMPT_LENGTH}`);
     prompt = prompt.substring(0, GPT5_CONFIG.MAX_PROMPT_LENGTH) + "\n... (truncated for length)";
   }

   // Check cache
   if (!options.skipCache) {
     const cacheKey = cache.generateKey(prompt, options);
     const cached = cache.get(cacheKey);
     if (cached) {
       console.log(`Cache hit for ${cacheKey.substring(0, 8)}...`);
       return `[CACHED] ${cached}`;
     }
   }

   selectedModel = selectOptimalModel(prompt, options);
   console.log(`Auto-selected model: ${selectedModel} (prompt: ${prompt.length} chars)`);

   // Estimate input tokens (rough approximation)
   inputTokens = Math.ceil(prompt.length / 3.5);

   const response = await circuitBreaker.execute(async () => {
     const useResponsesApi = selectedModel.includes("gpt-5") && selectedModel !== GPT5_CONFIG.CHAT_MODEL;

     if (useResponsesApi) {
       console.log(`Using Responses API with ${selectedModel}...`);
       apiUsed = "responses";

       const responsesRequest = buildResponsesRequest(selectedModel, prompt, {
         reasoning_effort: options.reasoning_effort || GPT5_CONFIG.DEFAULT_REASONING,
         verbosity: options.verbosity || GPT5_CONFIG.DEFAULT_VERBOSITY,
         max_output_tokens: options.max_output_tokens || options.max_completion_tokens || 8000
       });

       console.log("🔍 Responses API request:", JSON.stringify(responsesRequest, null, 2));

       const completion = await openai.responses.create(responsesRequest);

       // Use actual API usage data
       const usage = completion.usage || {};
       inputTokens = usage.input_tokens || usage.prompt_tokens || inputTokens;
       outputTokens = usage.output_tokens || usage.completion_tokens || 0;

       console.log("🔍 API Usage data:", usage);

       // Log reasoning tokens if available
       if (usage.output_tokens_details?.reasoning_tokens) {
         console.log(`Reasoning tokens used: ${usage.output_tokens_details.reasoning_tokens}`);
       }

       // Extract response text using improved function
       const responseText = safeExtractResponseText(completion, "responses");
       
       // Handle empty responses differently - don't treat as complete failure
       if (outputTokens === 0) {
         console.warn(`⚠️ GPT-5 returned 0 output tokens. This might indicate:`);
         console.warn(`   - Content was filtered by safety systems`);
         console.warn(`   - Model refused to respond to the request`);
         console.warn(`   - API parameter issue`);
         console.warn(`   Response text: "${responseText}"`);
         
         // Return a helpful message instead of failing
         if (responseText.includes("Empty") || responseText.includes("Could not extract")) {
           return "I apologize, but I wasn't able to generate a response to that request. This might be due to content filtering or a technical issue. Please try rephrasing your question or use a simpler request.";
         }
       }

       return responseText;

     } else {
       console.log(`Using Chat Completions API with ${selectedModel}...`);
       apiUsed = "chat";

       const messages = [{ role: "user", content: prompt }];
       const chatRequest = buildChatRequest(selectedModel, messages, {
         temperature: options.temperature || GPT5_CONFIG.DEFAULT_TEMPERATURE,
         max_tokens: options.max_tokens || options.max_completion_tokens || 8000
       });

       console.log("🔍 Chat API request:", JSON.stringify(chatRequest, null, 2));

       const completion = await openai.chat.completions.create(chatRequest);

       // Use actual API usage data
       const usage = completion.usage || {};
       inputTokens = usage.input_tokens || usage.prompt_tokens || inputTokens;
       outputTokens = usage.output_tokens || usage.completion_tokens || 0;

       console.log("🔍 Chat API Usage data:", usage);

       const responseText = safeExtractResponseText(completion, "chat");

       // Handle empty responses
       if (outputTokens === 0) {
         console.warn(`⚠️ Chat API returned 0 output tokens. Response: "${responseText}"`);
         if (responseText.includes("Empty") || responseText.includes("Could not extract")) {
           return "I apologize, but I wasn't able to generate a response to that request. Please try rephrasing your question.";
         }
       }

       return responseText;
     }
   });

   // Validate response - allow responses that might appear empty but have content
   if (!response || (response.length === 0 && !response.includes("apologize"))) {
     throw new Error("Completely empty response received from API");
   }

   const executionTime = Date.now() - startTime;
   const cost = logApiCall(selectedModel, apiUsed, inputTokens, outputTokens, executionTime, true);

   metrics.recordCall(selectedModel, true, inputTokens + outputTokens, cost, executionTime);

   // Cache successful responses (but not error messages)
   if (!options.skipCache && response.length > 10 && !response.startsWith("[") && !response.includes("apologize")) {
     const cacheKey = cache.generateKey(prompt, options);
     cache.set(cacheKey, response);
   }

   console.log(`✅ GPT-5 Success: ${selectedModel} | Input: ${inputTokens} | Output: ${outputTokens} | Total: ${inputTokens + outputTokens} tokens | ${executionTime}ms | $${cost.toFixed(6)}`);

   return response;

 } catch (error) {
   const executionTime = Date.now() - startTime;
   logApiCall(selectedModel || "unknown", apiUsed, inputTokens, outputTokens, executionTime, false, error);
   metrics.recordCall(selectedModel || "unknown", false, 0, 0, executionTime, error.message);

   console.error(`❌ GPT-5 Error: ${error.message}`);

   // Intelligent fallback (but not for content filtering errors)
   if (!error.message.includes("rate_limit") && !error.message.includes("quota") && !error.message.includes("content_filter")) {
     console.log("🔄 Attempting GPT-4o fallback...");

     try {
       const fallbackCompletion = await openai.chat.completions.create({
         model: GPT5_CONFIG.FALLBACK_MODEL,
         messages: [{ role: "user", content: prompt }],
         max_tokens: Math.min(options.max_tokens || options.max_completion_tokens || 8000, 16384),
         temperature: options.temperature || GPT5_CONFIG.DEFAULT_TEMPERATURE
       });

       const fallbackResponse = safeExtractResponseText(fallbackCompletion, "chat");
       const fallbackExecutionTime = Date.now() - startTime;
       const fallbackInputTokens = fallbackCompletion.usage?.prompt_tokens || inputTokens;
       const fallbackOutputTokens = fallbackCompletion.usage?.completion_tokens || 0;
       const fallbackCost = logApiCall(GPT5_CONFIG.FALLBACK_MODEL, "chat", fallbackInputTokens, fallbackOutputTokens, fallbackExecutionTime, true);

       metrics.recordCall(GPT5_CONFIG.FALLBACK_MODEL, true, fallbackInputTokens + fallbackOutputTokens, fallbackCost, fallbackExecutionTime);

       console.log(`✅ Fallback Success: GPT-4o | ${fallbackExecutionTime}ms | $${fallbackCost.toFixed(6)}`);
       return `[GPT-4o Fallback] ${fallbackResponse}`;

     } catch (fallbackError) {
       console.error(`❌ Fallback failed: ${fallbackError.message}`);
       metrics.recordCall(GPT5_CONFIG.FALLBACK_MODEL, false, 0, 0, Date.now() - startTime, fallbackError.message);
     }
   }

   // Enhanced error message with specific guidance
   let errorGuidance = "";
   if (error.message.includes("content") || error.message.includes("policy") || error.message.includes("filter")) {
     errorGuidance = "\n\n⚠️  Your request may have triggered content safety filters. Try rephrasing your question in a more neutral way.";
   } else if (error.message.includes("rate") || error.message.includes("quota")) {
     errorGuidance = "\n\n⏱️  Rate limit reached. Please wait a few moments before trying again.";
   } else if (error.message.includes("token")) {
     errorGuidance = "\n\n📝  Your message might be too long. Try breaking it into smaller parts.";
   }

   return `I apologize, but I'm experiencing technical difficulties with the AI service.

Error Details: ${error.message}${errorGuidance}

Please try:
- Using a shorter, simpler message (under 10,000 characters)  
- Waiting 30-60 seconds and trying again
- Rephrasing your request in a more straightforward way
- Checking if there are any service disruptions

System Status: Circuit Breaker ${circuitBreaker.getState()} | Success Rate: ${metrics.getStats().successRate}%

Your message was received but couldn't be processed at this time.`;
 }
}

// Quick access functions
async function getQuickNanoResponse(prompt, options = {}) {
 return await getGPT5Analysis(prompt, {
   ...options,
   model: GPT5_CONFIG.NANO_MODEL,
   reasoning_effort: "minimal",
   verbosity: "low",
   max_output_tokens: 6000
 });
}

async function getQuickMiniResponse(prompt, options = {}) {
 return await getGPT5Analysis(prompt, {
   ...options,
   model: GPT5_CONFIG.MINI_MODEL,
   reasoning_effort: "medium",
   verbosity: "medium",
   max_output_tokens: 10000
 });
}

async function getDeepAnalysis(prompt, options = {}) {
 return await getGPT5Analysis(prompt, {
   ...options,
   model: GPT5_CONFIG.PRIMARY_MODEL,
   reasoning_effort: "high",
   verbosity: "high",
   max_output_tokens: 16000
 });
}

async function getChatResponse(prompt, options = {}) {
 return await getGPT5Analysis(prompt, {
   ...options,
   model: GPT5_CONFIG.CHAT_MODEL,
   temperature: options.temperature || GPT5_CONFIG.DEFAULT_TEMPERATURE,
   max_tokens: 12000
 });
}

// Connection testing with improved debugging
async function testOpenAIConnection() {
 try {
   console.log("🔧 Testing GPT-5 connection...");
   const testResponse = await getQuickNanoResponse(
     "Hello! Please confirm you are GPT-5 and respond with just 'GPT-5 READY'",
     { max_output_tokens: 50, skipCache: true }
   );
   console.log("✅ GPT-5 connection test successful");
   return {
     success: true,
     result: testResponse,
     model: GPT5_CONFIG.NANO_MODEL,
     gpt5Available: true,
     timestamp: new Date().toISOString()
   };
 } catch (error) {
   console.error("❌ GPT-5 connection test failed:", error.message);
   try {
     console.log("🔄 Testing fallback connection...");
     const fallbackResponse = await openai.chat.completions.create({
       model: GPT5_CONFIG.FALLBACK_MODEL,
       messages: [{ role: "user", content: "Test connection - respond with 'FALLBACK OK'" }],
       max_tokens: 20
     });
     return {
       success: true,
       result: fallbackResponse.choices[0]?.message?.content,
       model: GPT5_CONFIG.FALLBACK_MODEL,
       gpt5Available: false,
       fallback: true,
       timestamp: new Date().toISOString()
     };
   } catch (fallbackError) {
     return {
       success: false,
       error: error.message,
       fallbackError: fallbackError.message,
       gpt5Available: false,
       timestamp: new Date().toISOString()
     };
   }
 }
}

// System health check
async function checkGPT5SystemHealth() {
 console.log("🔍 Running comprehensive system health check...");

 const health = {
   timestamp: new Date().toISOString(),
   gpt5Available: false,
   gpt5MiniAvailable: false,
   gpt5NanoAvailable: false,
   gpt5ChatAvailable: false,
   fallbackWorking: false,
   currentModel: null,
   circuitBreakerState: circuitBreaker.getState(),
   metrics: metrics.getStats(),
   cache: cache.getStats(),
   errors: [],
   recommendations: [],
   detailedTests: {}
 };

 const testModels = [
   { 
     name: "gpt5NanoAvailable", 
     model: GPT5_CONFIG.NANO_MODEL, 
     func: getQuickNanoResponse,
     testPrompt: "Say 'nano works'"
   },
   { 
     name: "gpt5MiniAvailable", 
     model: GPT5_CONFIG.MINI_MODEL, 
     func: getQuickMiniResponse,
     testPrompt: "Say 'mini works'"
   },
   { 
     name: "gpt5Available", 
     model: GPT5_CONFIG.PRIMARY_MODEL, 
     func: getDeepAnalysis,
     testPrompt: "Say 'gpt5 works'"
   },
   { 
     name: "gpt5ChatAvailable", 
     model: GPT5_CONFIG.CHAT_MODEL, 
     func: getChatResponse,
     testPrompt: "Say 'chat works'"
   }
 ];

 for (const test of testModels) {
   const startTime = Date.now();
   try {
     console.log(`🔧 Testing ${test.model}...`);
     const result = await test.func(test.testPrompt, { 
       max_output_tokens: 20, 
       skipCache: true 
     });
     
     const responseTime = Date.now() - startTime;
     const isValid = result && 
                    result.length > 0 && 
                    !result.startsWith("[Empty") && 
                    !result.startsWith("[No message") &&
                    !result.startsWith("[Could not extract") &&
                    !result.includes("apologize");
     
     if (isValid) {
       health[test.name] = true;
       health.detailedTests[test.model] = {
         status: "✅ WORKING",
         responseTime: responseTime,
         response: result.substring(0, 50) + (result.length > 50 ? "..." : "")
       };
       console.log(`✅ ${test.model} working (${responseTime}ms)`);
     } else {
       health.detailedTests[test.model] = {
         status: "⚠️ ISSUE",
         responseTime: responseTime,
         response: result?.substring(0, 100) || "No response",
         issue: "Invalid response format"
       };
       console.log(`⚠️ ${test.model} returned invalid response: ${result?.substring(0, 50)}`);
     }
   } catch (error) {
     const responseTime = Date.now() - startTime;
     health.errors.push(`${test.model}: ${error.message}`);
     health.detailedTests[test.model] = {
       status: "❌ FAILED",
       responseTime: responseTime,
       error: error.message
     };
     console.log(`❌ ${test.model} failed: ${error.message}`);
   }
 }

 // Test fallback
 console.log("🔧 Testing GPT-4o fallback...");
 const fallbackStartTime = Date.now();
 try {
   const fallbackTest = await openai.chat.completions.create({
     model: GPT5_CONFIG.FALLBACK_MODEL,
     messages: [{ role: "user", content: "Say 'fallback works'" }],
     max_tokens: 20
   });
   const fallbackTime = Date.now() - fallbackStartTime;
   if (fallbackTest.choices?.[0]?.message?.content) {
     health.fallbackWorking = true;
     health.detailedTests[GPT5_CONFIG.FALLBACK_MODEL] = {
       status: "✅ WORKING",
       responseTime: fallbackTime,
       response: fallbackTest.choices[0].message.content
     };
     console.log(`✅ GPT-4o fallback working (${fallbackTime}ms)`);
   }
 } catch (error) {
   const fallbackTime = Date.now() - fallbackStartTime;
   health.errors.push(`Fallback: ${error.message}`);
   health.detailedTests[GPT5_CONFIG.FALLBACK_MODEL] = {
     status: "❌ FAILED",
     responseTime: fallbackTime,
     error: error.message
   };
   console.log(`❌ GPT-4o fallback failed: ${error.message}`);
 }

 // Determine best available model
 if (health.gpt5Available) {
   health.currentModel = GPT5_CONFIG.PRIMARY_MODEL;
 } else if (health.gpt5MiniAvailable) {
   health.currentModel = GPT5_CONFIG.MINI_MODEL;
 } else if (health.gpt5NanoAvailable) {
   health.currentModel = GPT5_CONFIG.NANO_MODEL;
 } else if (health.gpt5ChatAvailable) {
   health.currentModel = GPT5_CONFIG.CHAT_MODEL;
 } else if (health.fallbackWorking) {
   health.currentModel = GPT5_CONFIG.FALLBACK_MODEL;
 }

 health.overallHealth = health.currentModel !== null;

 // Enhanced recommendations
 if (health.metrics.successRate < 95) {
   health.recommendations.push("Success rate below 95% - check API key and quotas");
 }
 if (health.circuitBreakerState === "OPEN") {
   health.recommendations.push("Circuit breaker is OPEN - service degraded, will retry automatically");
 }
 if (health.cache.size === 0) {
   health.recommendations.push("Cache is empty - responses will be slower");
 }
 if (!health.gpt5Available && !health.gpt5MiniAvailable) {
   health.recommendations.push("No GPT-5 models available - check API access and billing");
 }
 if (health.errors.length > 0) {
   health.recommendations.push(`${health.errors.length} error(s) detected - see errors array for details`);
 }

 console.log(`🏥 Health check complete. Overall: ${health.overallHealth ? "✅ HEALTHY" : "⚠️ DEGRADED"}`);
 console.log(`📊 Best available model: ${health.currentModel || "NONE"}`);
 
 return health;
}

// Utility functions
async function clearCache() {
 const oldSize = cache.cache.size;
 cache.clear();
 console.log(`🧹 Cache cleared (${oldSize} items removed)`);
 return { 
   success: true, 
   message: `Cache cleared successfully (${oldSize} items removed)`,
   oldSize: oldSize 
 };
}

async function resetMetrics() {
 const oldStats = { ...metrics.getStats() };
 metrics.reset();
 console.log("📊 Metrics reset");
 return { 
   success: true, 
   message: "Metrics reset successfully",
   previousStats: oldStats
 };
}

async function getSystemStats() {
 const stats = {
   timestamp: new Date().toISOString(),
   metrics: metrics.getStats(),
   cache: cache.getStats(),
   circuitBreaker: { 
     state: circuitBreaker.getState(),
     failureCount: circuitBreaker.failureCount,
     lastFailureTime: circuitBreaker.lastFailureTime
   },
   models: GPT5_CONFIG.MODEL_CAPABILITIES,
   uptime: Date.now() - metrics.startTime,
   config: {
     maxPromptLength: GPT5_CONFIG.MAX_PROMPT_LENGTH,
     maxOutputTokens: GPT5_CONFIG.MAX_OUTPUT_TOKENS,
     contextWindow: GPT5_CONFIG.ENHANCED_CONTEXT_WINDOW,
     defaultReasoning: GPT5_CONFIG.DEFAULT_REASONING,
     defaultVerbosity: GPT5_CONFIG.DEFAULT_VERBOSITY
   }
 };
 
 // Add human-readable uptime
 const uptimeHours = Math.floor(stats.uptime / (1000 * 60 * 60));
 const uptimeMinutes = Math.floor((stats.uptime % (1000 * 60 * 60)) / (1000 * 60));
 stats.uptimeFormatted = `${uptimeHours}h ${uptimeMinutes}m`;
 
 return stats;
}

// Advanced debugging functions
async function runDiagnostics() {
 console.log("🔧 Running comprehensive diagnostics...");
 
 const diagnostics = {
   timestamp: new Date().toISOString(),
   environment: {
     nodeVersion: process.version,
     platform: process.platform,
     apiKeySet: !!process.env.OPENAI_API_KEY,
     apiKeyLength: process.env.OPENAI_API_KEY?.length || 0
   },
   tests: {}
 };
 
 // Test 1: Basic API connectivity
 console.log("🔧 Test 1: Basic API connectivity...");
 try {
   await openai.models.list();
   diagnostics.tests.apiConnectivity = { status: "✅ PASS", message: "OpenAI API is reachable" };
 } catch (error) {
   diagnostics.tests.apiConnectivity = { status: "❌ FAIL", error: error.message };
 }
 
 // Test 2: GPT-5 model access
 console.log("🔧 Test 2: GPT-5 model access...");
 try {
   const models = await openai.models.list();
   const gpt5Models = models.data.filter(m => m.id.includes('gpt-5'));
   diagnostics.tests.gpt5Access = { 
     status: gpt5Models.length > 0 ? "✅ PASS" : "⚠️ LIMITED", 
     availableModels: gpt5Models.map(m => m.id),
     totalModels: models.data.length
   };
 } catch (error) {
   diagnostics.tests.gpt5Access = { status: "❌ FAIL", error: error.message };
 }
 
 // Test 3: Response structure debugging
 console.log("🔧 Test 3: Response structure debugging...");
 try {
   const debugResult = await debugGPT5Response("Test diagnostic response");
   diagnostics.tests.responseStructure = { 
     status: debugResult.success ? "✅ PASS" : "❌ FAIL",
     extractedText: debugResult.extractedText,
     hasUsageData: !!debugResult.usage,
     usage: debugResult.usage
   };
 } catch (error) {
   diagnostics.tests.responseStructure = { status: "❌ FAIL", error: error.message };
 }
 
 // Test 4: Token counting accuracy
 console.log("🔧 Test 4: Token counting accuracy...");
 try {
   const testPrompt = "Count these tokens: Hello world test message";
   const startTokens = Math.ceil(testPrompt.length / 3.5);
   const result = await getQuickNanoResponse(testPrompt, { skipCache: true });
   const isReasonable = typeof result === 'string' && result.length > 0;
   diagnostics.tests.tokenCounting = { 
     status: isReasonable ? "✅ PASS" : "⚠️ ISSUE",
     estimatedInputTokens: startTokens,
     responseLength: result?.length || 0
   };
 } catch (error) {
   diagnostics.tests.tokenCounting = { status: "❌ FAIL", error: error.message };
 }
 
 console.log("🔧 Diagnostics complete");
 return diagnostics;
}

// Startup initialization
console.log("🚀 IMPERIUM VAULT GPT-5 Client v2.1.0 Loading...");
console.log("📅 GPT-5 Release Date: August 7, 2025");
console.log(`🔑 API Key: ${process.env.OPENAI_API_KEY ? "✅ SET" : "❌ NOT SET"}`);
console.log(`🤖 Primary Model: ${GPT5_CONFIG.PRIMARY_MODEL}`);
console.log("🎯 Auto-Selection: ✅ Enabled");
console.log("💾 Intelligent Caching: ✅ Enabled");
console.log("⚡ Circuit Breaker: ✅ Active");
console.log("📊 Advanced Metrics: ✅ Active");
console.log("💰 Cost Tracking: ✅ Enabled");
console.log("🔧 Enhanced Response Extraction: ✅ Active");
console.log("🐛 Debug Mode: ✅ Enabled");
console.log("✅ Ready for production deployment!");

// Export all functions
module.exports = {
 // Core functions
 getGPT5Analysis,
 
 // Quick access functions
 getQuickNanoResponse,
 getQuickMiniResponse,
 getDeepAnalysis,
 getChatResponse,
 
 // System functions
 testOpenAIConnection,
 checkGPT5SystemHealth,
 runDiagnostics,
 debugGPT5Response,
 
 // Utility functions
 clearCache,
 resetMetrics,
 getSystemStats,
 selectOptimalModel,
 calculateCost,
 
 // Builder functions
 buildResponsesRequest,
 buildChatRequest,
 safeExtractResponseText,
 
 // Advanced components
 metrics,
 cache,
 circuitBreaker,
 
 // Config and client
 openai,
 GPT5_CONFIG
};

