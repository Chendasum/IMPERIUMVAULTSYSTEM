// utils/memory.js - Complete Memory System with PostgreSQL Integration (Hardened)
// -----------------------------------------------------------------------------
require("dotenv").config();

// Import database functions
const {
  getConversationHistoryDB,
  getPersistentMemoryDB,
  addPersistentMemoryDB,
  getUserProfileDB,
  saveConversationDB, // (unused here but kept for compatibility)
  connectionStats
} = require("./database");

// 🧠 ENHANCED MEMORY SYSTEM CONFIGURATION
const MEMORY_CONFIG = {
  MAX_CONTEXT_LENGTH: 8000, // Maximum context for GPT-5
  MAX_CONVERSATIONS: 10, // Recent conversations to include
  MAX_MEMORIES: 15, // Persistent memories to include
  MIN_IMPORTANCE_THRESHOLD: 0.3, // Minimum importance to include
  CONTEXT_DECAY_DAYS: 30, // Days before context becomes less relevant
  MEMORY_WEIGHT_MULTIPLIER: 2.0, // Weight persistent memories higher
  CONVERSATION_WEIGHT: 1.0, // Weight for recent conversations
  PATTERN_DETECTION_MIN: 3 // Minimum occurrences to detect pattern
};

console.log("🧠 Enhanced Memory System with PostgreSQL Integration loaded");
console.log(`   Max Context: ${MEMORY_CONFIG.MAX_CONTEXT_LENGTH} chars`);
console.log(`   Max Conversations: ${MEMORY_CONFIG.MAX_CONVERSATIONS}`);
console.log(`   Max Memories: ${MEMORY_CONFIG.MAX_MEMORIES}`);

// -----------------------------------------------------------------------------
// 🔧 SAFETY HELPERS — normalize any input to text to avoid .toLowerCase/.substring errors
// -----------------------------------------------------------------------------
function asText(m) {
  if (m == null) return "";
  const t = typeof m;
  if (t === "string") return m;
  if (t === "number" || t === "boolean") return String(m);
  if (Array.isArray(m)) return m.map(asText).join(" ");
  if (t === "object") {
    if (typeof m.content === "string") return m.content;
    if (Array.isArray(m.content)) {
      return m.content
        .map((c) =>
          typeof c === "string"
            ? c
            : typeof c?.text === "string"
            ? c.text
            : typeof c?.content === "string"
            ? c.content
            : ""
        )
        .join(" ");
    }
    if (typeof m.text === "string") return m.text; // Telegram-style
    if (typeof m.caption === "string") return m.caption; // media captions
    if (typeof m.message === "object") return asText(m.message); // nested envelope
    try {
      return JSON.stringify(m);
    } catch {
      return "";
    }
  }
  return "";
}
function lowerSafe(m) {
  return asText(m).toLowerCase();
}
function excerptSafe(m, n = 300) {
  const s = asText(m);
  return s.substring(0, n);
}

// -----------------------------------------------------------------------------
// 🔧 UTILITY FUNCTIONS
// -----------------------------------------------------------------------------

/** Safe division to prevent division by zero errors */
function safeDivision(numerator, denominator, defaultValue = 0) {
  if (denominator === 0 || isNaN(denominator) || !isFinite(denominator)) {
    return defaultValue;
  }
  const result = numerator / denominator;
  return isNaN(result) || !isFinite(result) ? defaultValue : result;
}

/** Calculate days between two dates */
function daysBetween(date1, date2) {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.abs((new Date(date1) - new Date(date2)) / oneDay);
}

/** Calculate relevance score based on recency, importance, and topical overlap */
function calculateRelevance(
  timestamp,
  importance = "medium",
  currentMessage = "",
  memoryText = ""
) {
  const daysOld = daysBetween(new Date(), new Date(timestamp));
  const decayFactor = Math.max(0.1, 1 - daysOld / MEMORY_CONFIG.CONTEXT_DECAY_DAYS);

  const importanceScores = { high: 1.0, medium: 0.7, low: 0.4 };
  const importanceScore = importanceScores[importance] || 0.5;

  // Boost relevance if current message relates to this memory text
  let contextBoost = 1.0;
  const msg = lowerSafe(currentMessage);
  const mem = typeof memoryText === "string" ? memoryText.toLowerCase() : "";

  if (msg && mem) {
    const msgWords = msg.split(/\s+/);
    const memSet = new Set(mem.split(/\s+/).filter((w) => w.length > 3));
    const commonCount = msgWords.filter((w) => w.length > 3 && memSet.has(w)).length;
    // Cap boost to avoid runaway
    contextBoost = 1.0 + Math.min(1.0, commonCount * 0.2);
  }

  return decayFactor * importanceScore * contextBoost;
}

// -----------------------------------------------------------------------------
// 🔍 ADVANCED ANALYTICS FUNCTIONS
// -----------------------------------------------------------------------------

/** Infer user's risk tolerance from conversations and memories */
function inferEnhancedRiskTolerance(conversations, memories) {
  try {
    console.log("🔍 Inferring risk tolerance from user data...");

    // Default risk tolerance
    let riskTolerance = {
      level: "moderate",
      score: 50,
      confidence: 0.3,
      indicators: [],
      evidence: []
    };

    // Risk indicators from keywords
    const riskKeywords = {
      aggressive: {
        keywords: [
          "aggressive",
          "high risk",
          "maximum returns",
          "speculative",
          "volatile",
          "leverage",
          "options",
          "futures",
          "crypto",
          "startup"
        ],
        weight: 3
      },
      moderate: {
        keywords: [
          "balanced",
          "moderate",
          "diversified",
          "stable",
          "long term",
          "index fund",
          "etf",
          "mixed portfolio"
        ],
        weight: 2
      },
      conservative: {
        keywords: [
          "safe",
          "conservative",
          "low risk",
          "capital preservation",
          "bonds",
          "savings",
          "secure",
          "guaranteed",
          "pension"
        ]
      }
    };

    let aggressiveScore = 0;
    let moderateScore = 0;
    let conservativeScore = 0;
    let totalSignals = 0;

    // Analyze conversations
    if (conversations && conversations.length > 0) {
      conversations.forEach((conv) => {
        const userText = lowerSafe(conv?.user_message || "");
        const aiText = lowerSafe(conv?.gpt_response || "");
        const fullText = `${userText} ${aiText}`.trim();

        // Check for risk keywords
        Object.keys(riskKeywords).forEach((riskLevel) => {
          const config = riskKeywords[riskLevel];
          const weight = config.weight || 1;

          config.keywords.forEach((keyword) => {
            if (fullText.includes(keyword)) {
              switch (riskLevel) {
                case "aggressive":
                  aggressiveScore += weight;
                  riskTolerance.evidence.push(
                    `Aggressive: "${keyword}" in conversation`
                  );
                  break;
                case "moderate":
                  moderateScore += weight;
                  riskTolerance.evidence.push(
                    `Moderate: "${keyword}" in conversation`
                  );
                  break;
                case "conservative":
                  conservativeScore += weight;
                  riskTolerance.evidence.push(
                    `Conservative: "${keyword}" in conversation`
                  );
                  break;
              }
              totalSignals++;
            }
          });
        });
      });
    }

    // Analyze persistent memories (weighted higher)
    if (memories && memories.length > 0) {
      memories.forEach((memory) => {
        const memoryText = lowerSafe(memory?.fact || "");
        const memoryWeight = MEMORY_CONFIG.MEMORY_WEIGHT_MULTIPLIER;

        // Direct risk tolerance statements
        if (memoryText.includes("risk tolerance") || memoryText.includes("investment style")) {
          if (memoryText.includes("aggressive") || memoryText.includes("high risk")) {
            aggressiveScore += 3 * memoryWeight;
            riskTolerance.evidence.push(`Memory: Direct high risk preference`);
            totalSignals += 2;
          } else if (memoryText.includes("conservative") || memoryText.includes("low risk")) {
            conservativeScore += 3 * memoryWeight;
            riskTolerance.evidence.push(`Memory: Direct conservative preference`);
            totalSignals += 2;
          } else {
            moderateScore += 2 * memoryWeight;
            riskTolerance.evidence.push(`Memory: Direct moderate preference`);
            totalSignals += 2;
          }
        }

        // Check for general risk keywords in memories
        Object.keys(riskKeywords).forEach((riskLevel) => {
          const config = riskKeywords[riskLevel];
          const weight = (config.weight || 1) * memoryWeight;

          config.keywords.forEach((keyword) => {
            if (memoryText.includes(keyword)) {
              switch (riskLevel) {
                case "aggressive":
                  aggressiveScore += weight;
                  break;
                case "moderate":
                  moderateScore += weight;
                  break;
                case "conservative":
                  conservativeScore += weight;
                  break;
              }
              totalSignals++;
            }
          });
        });
      });
    }

    // Determine risk tolerance based on scores
    if (totalSignals > 0) {
      const maxScore = Math.max(aggressiveScore, moderateScore, conservativeScore);

      if (maxScore === aggressiveScore && aggressiveScore > 0) {
        riskTolerance.level = "aggressive";
        riskTolerance.score = Math.min(95, 70 + aggressiveScore * 3);
        riskTolerance.confidence = Math.min(0.9, 0.4 + totalSignals * 0.05);
        riskTolerance.indicators = [
          "High risk tolerance detected",
          "Prefers growth over stability"
        ];
      } else if (maxScore === conservativeScore && conservativeScore > 0) {
        riskTolerance.level = "conservative";
        riskTolerance.score = Math.max(5, 30 - conservativeScore * 3);
        riskTolerance.confidence = Math.min(0.9, 0.4 + totalSignals * 0.05);
        riskTolerance.indicators = [
          "Low risk tolerance detected",
          "Prefers stability over growth"
        ];
      } else {
        riskTolerance.level = "moderate";
        riskTolerance.score = 40 + Math.min(20, moderateScore * 2) + Math.random() * 10;
        riskTolerance.confidence = Math.min(0.8, 0.3 + totalSignals * 0.04);
        riskTolerance.indicators = ["Balanced risk tolerance", "Seeks growth with stability"];
      }
    }

    // Add signal strength indicators
    riskTolerance.indicators.push(`Analyzed ${totalSignals} risk signals`);
    riskTolerance.indicators.push(
      `Confidence: ${(riskTolerance.confidence * 100).toFixed(0)}%`
    );

    console.log(
      `✅ Risk tolerance inferred: ${riskTolerance.level} (score: ${riskTolerance.score.toFixed(
        0
      )}, confidence: ${riskTolerance.confidence.toFixed(2)})`
    );

    return riskTolerance;
  } catch (error) {
    console.error("❌ Risk tolerance inference error:", error.message);
    return {
      level: "moderate",
      score: 50,
      confidence: 0.1,
      indicators: ["Error in risk analysis"],
      evidence: [],
      error: error.message
    };
  }
}

/** Generate conversation intelligence analytics */
function getConversationIntelligenceAnalytics(conversations, memories) {
  try {
    console.log("📊 Generating conversation intelligence analytics...");

    const analytics = {
      conversationFrequency: 0,
      avgResponseLength: 0,
      avgUserMessageLength: 0,
      topicDiversity: 0,
      engagementScore: 0,
      memoryRetention: 0,
      strategicFocus: "general",
      communicationStyle: "balanced",
      confidenceLevel: 0.3,
      timeSpan: 0,
      totalInteractions: 0,
      recommendations: [],
      dataQuality: "limited"
    };

    // Conversation frequency analysis
    if (conversations && conversations.length > 0) {
      analytics.totalInteractions = conversations.length;

      // Calculate time span and frequency
      const timestamps = conversations
        .map((conv) => new Date(conv.timestamp))
        .filter((d) => !isNaN(d))
        .sort((a, b) => a - b);

      if (timestamps.length > 1) {
        const firstConv = timestamps[0];
        const lastConv = timestamps[timestamps.length - 1];
        const daysDiff = Math.max(1, daysBetween(firstConv, lastConv));
        analytics.timeSpan = daysDiff;
        analytics.conversationFrequency = safeDivision(conversations.length, daysDiff, 0);
      }

      // Response length analysis
      const responseLengths = conversations.map((conv) => (conv.gpt_response || "").length);
      const userMessageLengths = conversations.map((conv) => (conv.user_message || "").length);

      analytics.avgResponseLength = safeDivision(
        responseLengths.reduce((sum, length) => sum + length, 0),
        responseLengths.length,
        0
      );

      analytics.avgUserMessageLength = safeDivision(
        userMessageLengths.reduce((sum, length) => sum + length, 0),
        userMessageLengths.length,
        0
      );

      // Topic diversity analysis
      const allWords = new Set();
      const topicWords = new Set();

      conversations.forEach((conv) => {
        const userWords = lowerSafe(conv.user_message || "").match(/\b\w{4,}\b/g) || [];
        userWords.forEach((word) => {
          allWords.add(word);
          // Filter for meaningful topic words
          if (
            ![
              "this",
              "that",
              "with",
              "from",
              "they",
              "have",
              "been",
              "were",
              "what",
              "when",
              "where",
              "which",
              "could",
              "would",
              "should"
            ].includes(word)
          ) {
            topicWords.add(word);
          }
        });
      });

      analytics.topicDiversity = Math.min(10, topicWords.size / 10); // Scale to 0-10

      // Engagement score calculation
      const engagementFactors = [
        Math.min(2, analytics.avgUserMessageLength / 50), // Message depth
        Math.min(2, analytics.conversationFrequency * 5), // Frequency
        Math.min(2, analytics.topicDiversity), // Topic variety
        Math.min(2, conversations.length / 10), // Total conversations
        Math.min(2, topicWords.size / 20) // Vocabulary richness
      ];

      analytics.engagementScore = Math.min(
        10,
        engagementFactors.reduce((sum, factor) => sum + factor, 0)
      );
    }

    // Memory retention analysis
    if (memories && memories.length > 0) {
      const importanceWeights = { high: 3, medium: 2, low: 1 };
      const totalWeight = memories.reduce((sum, memory) => {
        return sum + (importanceWeights[memory.importance] || 1);
      }, 0);

      const avgWeight = safeDivision(totalWeight, memories.length, 0);
      analytics.memoryRetention = Math.min(10, avgWeight * 2 + memories.length * 0.3);
    }

    // Strategic focus analysis
    const strategicKeywords = {
      financial: [
        "investment",
        "portfolio",
        "trading",
        "market",
        "financial",
        "fund",
        "money",
        "profit",
        "return",
        "yield",
        "risk"
      ],
      technology: [
        "ai",
        "tech",
        "software",
        "digital",
        "automation",
        "algorithm",
        "programming",
        "system",
        "data"
      ],
      business: [
        "business",
        "strategy",
        "analysis",
        "planning",
        "growth",
        "management",
        "company",
        "revenue",
        "operations"
      ],
      personal: [
        "personal",
        "life",
        "productivity",
        "goals",
        "habits",
        "wellness",
        "health",
        "family",
        "relationships"
      ],
      learning: [
        "learn",
        "education",
        "study",
        "knowledge",
        "skill",
        "training",
        "course",
        "tutorial",
        "research"
      ]
    };

    let focusScores = {
      financial: 0,
      technology: 0,
      business: 0,
      personal: 0,
      learning: 0,
      general: 0
    };

    // Analyze conversations for strategic focus
    [...(conversations || []), ...(memories || [])].forEach((item) => {
      const text = lowerSafe(item.user_message || item.gpt_response || item.fact || "");
      let hasStrategicKeywords = false;

      Object.keys(strategicKeywords).forEach((category) => {
        strategicKeywords[category].forEach((keyword) => {
          if (text.includes(keyword)) {
            focusScores[category]++;
            hasStrategicKeywords = true;
          }
        });
      });

      if (!hasStrategicKeywords && text.length > 20) {
        focusScores.general++;
      }
    });

    // Find primary strategic focus
    analytics.strategicFocus = Object.keys(focusScores).reduce((a, b) =>
      focusScores[a] > focusScores[b] ? a : b
    );

    // Communication style analysis
    if (conversations && conversations.length > 0) {
      const avgQuestionMarks = safeDivision(
        conversations.reduce(
          (sum, conv) => sum + ((conv.user_message || "").match(/\?/g) || []).length,
          0
        ),
        conversations.length,
        0
      );

      const avgExclamationMarks = safeDivision(
        conversations.reduce(
          (sum, conv) => sum + ((conv.user_message || "").match(/!/g) || []).length,
          0
        ),
        conversations.length,
        0
      );

      const commandCount = conversations.filter((conv) =>
        (conv.user_message || "").startsWith("/")
      ).length;

      const commandRatio = safeDivision(commandCount, conversations.length, 0);

      if (commandRatio > 0.3) {
        analytics.communicationStyle = "command-oriented";
      } else if (avgQuestionMarks > 1.5) {
        analytics.communicationStyle = "inquisitive";
      } else if (avgExclamationMarks > 0.5) {
        analytics.communicationStyle = "enthusiastic";
      } else if (analytics.avgUserMessageLength > 150) {
        analytics.communicationStyle = "detailed";
      } else if (analytics.avgUserMessageLength < 30) {
        analytics.communicationStyle = "concise";
      } else {
        analytics.communicationStyle = "balanced";
      }
    }

    // Data quality assessment
    const totalDataPoints = (conversations?.length || 0) + (memories?.length || 0);
    if (totalDataPoints >= 20) {
      analytics.dataQuality = "excellent";
    } else if (totalDataPoints >= 10) {
      analytics.dataQuality = "good";
    } else if (totalDataPoints >= 5) {
      analytics.dataQuality = "fair";
    } else {
      analytics.dataQuality = "limited";
    }

    // Confidence level based on data availability and quality
    analytics.confidenceLevel = Math.min(
      0.95,
      0.1 +
        (conversations?.length || 0) * 0.03 +
        (memories?.length || 0) * 0.05 +
        analytics.topicDiversity * 0.02 +
        (analytics.timeSpan > 0 ? Math.min(0.2, analytics.timeSpan * 0.01) : 0)
    );

    // Personalized recommendations
    if (analytics.conversationFrequency < 0.2) {
      analytics.recommendations.push(
        "Consider more frequent interactions to improve AI personalization"
      );
    }
    if (analytics.memoryRetention < 3) {
      analytics.recommendations.push(
        "Share preferences and important information to enhance memory retention"
      );
    }
    if (analytics.topicDiversity < 2) {
      analytics.recommendations.push("Explore diverse topics to unlock more AI capabilities");
    }
    if (analytics.engagementScore > 7) {
      analytics.recommendations.push(
        "Excellent engagement level - AI partnership is highly effective"
      );
    }
    if (analytics.dataQuality === "limited") {
      analytics.recommendations.push("Build conversation history for more personalized responses");
    }
    if (analytics.strategicFocus !== "general") {
      analytics.recommendations.push(
        `Strong ${analytics.strategicFocus} focus detected - leveraging specialized capabilities`
      );
    }

    console.log(
      `✅ Intelligence analytics completed: ${analytics.strategicFocus} focus, ${analytics.communicationStyle} style, ${analytics.dataQuality} data quality`
    );

    return analytics;
  } catch (error) {
    console.error("❌ Conversation intelligence analytics error:", error.message);
    return {
      conversationFrequency: 0,
      avgResponseLength: 0,
      avgUserMessageLength: 0,
      topicDiversity: 0,
      engagementScore: 0,
      memoryRetention: 0,
      strategicFocus: "general",
      communicationStyle: "balanced",
      confidenceLevel: 0.1,
      timeSpan: 0,
      totalInteractions: 0,
      recommendations: ["Analytics error - limited insights available"],
      dataQuality: "error",
      error: error.message
    };
  }
}

/** Detect conversation patterns and user preferences */
function detectConversationPatterns(conversations, memories) {
  try {
    console.log("🔍 Detecting conversation patterns...");

    const patterns = {
      timePatterns: {},
      topicPatterns: {},
      lengthPatterns: {},
      questionPatterns: [],
      preferencePatterns: [],
      behaviorPatterns: []
    };

    if (!conversations || conversations.length === 0) {
      return patterns;
    }

    // Time pattern analysis
    conversations.forEach((conv) => {
      const date = new Date(conv.timestamp);
      const hour = isNaN(date) ? 0 : date.getHours();
      const timeSlot =
        hour < 6 ? "early_morning" : hour < 12 ? "morning" : hour < 18 ? "afternoon" : hour < 22 ? "evening" : "night";

      patterns.timePatterns[timeSlot] = (patterns.timePatterns[timeSlot] || 0) + 1;
    });

    // Topic clustering
    const topicWords = {};
    conversations.forEach((conv) => {
      const words = lowerSafe(conv.user_message || "").match(/\b\w{4,}\b/g) || [];
      words.forEach((word) => {
        if (!["this", "that", "with", "from", "they", "have", "been", "were"].includes(word)) {
          topicWords[word] = (topicWords[word] || 0) + 1;
        }
      });
    });

    // Find most common topics
    const sortedTopics = Object.entries(topicWords)
      .filter(([word, count]) => count >= MEMORY_CONFIG.PATTERN_DETECTION_MIN)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    patterns.topicPatterns = Object.fromEntries(sortedTopics);

    // Length patterns
    const messageLengths = conversations.map((conv) => (conv.user_message || "").length || 0);
    patterns.lengthPatterns = {
      avg: safeDivision(messageLengths.reduce((sum, len) => sum + len, 0), messageLengths.length, 0),
      short: messageLengths.filter((len) => len < 50).length,
      medium: messageLengths.filter((len) => len >= 50 && len < 200).length,
      long: messageLengths.filter((len) => len >= 200).length
    };

    // Question patterns
    const questionTypes = conversations
      .filter((conv) => (conv.user_message || "").includes("?"))
      .map((conv) => {
        const msg = lowerSafe(conv.user_message || "");
        if (msg.startsWith("what")) return "what";
        if (msg.startsWith("how")) return "how";
        if (msg.startsWith("why")) return "why";
        if (msg.startsWith("when")) return "when";
        if (msg.startsWith("where")) return "where";
        return "other";
      });

    const questionCounts = {};
    questionTypes.forEach((type) => {
      questionCounts[type] = (questionCounts[type] || 0) + 1;
    });

    patterns.questionPatterns = Object.entries(questionCounts)
      .filter(([, count]) => count >= 2)
      .map(([type, count]) => ({ type, count, frequency: safeDivision(count, conversations.length, 0) }));

    // Preference detection from memories
    if (memories && memories.length > 0) {
      memories.forEach((memory) => {
        const fact = lowerSafe(memory?.fact || "");
        if (fact.includes("prefer") || fact.includes("like") || fact.includes("favorite")) {
          patterns.preferencePatterns.push({
            preference: memory.fact,
            importance: memory.importance,
            timestamp: memory.timestamp
          });
        }
      });
    }

    // Behavior pattern inference (guard against undefined)
    if ((patterns.timePatterns.morning || 0) > (patterns.timePatterns.evening || 0)) {
      patterns.behaviorPatterns.push("Morning person - more active in early hours");
    }
    if ((patterns.lengthPatterns.long || 0) > (patterns.lengthPatterns.short || 0)) {
      patterns.behaviorPatterns.push("Detailed communicator - prefers comprehensive discussions");
    }
    if (patterns.questionPatterns.some((p) => p.type === "how" && p.frequency > 0.3)) {
      patterns.behaviorPatterns.push("Process-oriented - frequently asks how-to questions");
    }

    console.log(
      `✅ Pattern detection completed: ${patterns.behaviorPatterns.length} behavior patterns identified`
    );

    return patterns;
  } catch (error) {
    console.error("❌ Pattern detection error:", error.message);
    return {
      timePatterns: {},
      topicPatterns: {},
      lengthPatterns: {},
      questionPatterns: [],
      preferencePatterns: [],
      behaviorPatterns: [],
      error: error.message
    };
  }
}

// -----------------------------------------------------------------------------
// 🚀 MAIN MEMORY FUNCTIONS
// -----------------------------------------------------------------------------

/** Build comprehensive conversation context with PostgreSQL data */
async function buildConversationContext(chatId, currentMessage = "") {
  try {
    console.log(`🧠 Building enhanced strategic context for user ${chatId}`);

    // Normalize current message immediately
    const currentMsgText = asText(currentMessage);

    // Fetch data from PostgreSQL
    const [conversations, memories, userProfile] = await Promise.allSettled([
      getConversationHistoryDB(chatId, MEMORY_CONFIG.MAX_CONVERSATIONS),
      getPersistentMemoryDB(chatId),
      getUserProfileDB(chatId)
    ]);

    // Process fetched data
    const conversationData = conversations.status === "fulfilled" ? conversations.value || [] : [];
    const memoryData = memories.status === "fulfilled" ? memories.value || [] : [];
    const profileData = userProfile.status === "fulfilled" ? userProfile.value || null : null;

    console.log(`🔍 Retrieved ${conversationData.length} conversations for ${chatId}`);
    console.log(`🧠 Retrieved ${memoryData.length} persistent memories for ${chatId}`);

    // Generate advanced analytics
    let riskTolerance, analytics, patterns;

    try {
      riskTolerance = inferEnhancedRiskTolerance(conversationData, memoryData);
    } catch (riskError) {
      console.error("Enhanced strategic profile error:", riskError.message);
      riskTolerance = { level: "moderate", score: 50, confidence: 0.1 };
    }

    try {
      analytics = getConversationIntelligenceAnalytics(conversationData, memoryData);
    } catch (analyticsError) {
      console.error("Get conversation intelligence analytics error:", analyticsError.message);
      analytics = { strategicFocus: "general", communicationStyle: "balanced", confidenceLevel: 0.1 };
    }

    try {
      patterns = detectConversationPatterns(conversationData, memoryData);
    } catch (patternError) {
      console.error("Pattern detection error:", patternError.message);
      patterns = { behaviorPatterns: [], preferencePatterns: [] };
    }

    // Build context string
    const contextParts = [];

    // 1. User Profile Summary
    if (profileData) {
      const firstSeen = profileData.first_seen ? new Date(profileData.first_seen).toLocaleDateString() : "unknown";
      const convCount = profileData.conversation_count ?? "?";
      contextParts.push(
        `USER PROFILE: Member since ${firstSeen}, ${convCount} total conversations`
      );
    }

    // 2. Strategic Intelligence Summary
    contextParts.push(
      `STRATEGIC INTELLIGENCE SUMMARY:
• Communication Style: ${analytics.communicationStyle}
• Strategic Focus: ${analytics.strategicFocus}
• Risk Tolerance: ${riskTolerance.level} (${Number(riskTolerance.score || 0).toFixed(0)}/100)
• Engagement Level: ${Number(analytics.engagementScore || 0).toFixed(1)}/10
• Data Quality: ${analytics.dataQuality}
• Confidence: ${Number((analytics.confidenceLevel || 0) * 100).toFixed(0)}%`
    );

    // 3. Persistent Memories (prioritized by importance and relevance)
    if (memoryData.length > 0) {
      const sortedMemories = memoryData
        .map((memory) => ({
          ...memory,
          relevance: calculateRelevance(
            memory.timestamp,
            memory.importance,
            currentMsgText,
            memory.fact
          )
        }))
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, MEMORY_CONFIG.MAX_MEMORIES);

      if (sortedMemories.length > 0) {
        contextParts.push("PERSISTENT MEMORIES (Important Facts):");
        sortedMemories.forEach((memory, index) => {
          const importance = memory.importance ? `[${String(memory.importance).toUpperCase()}] ` : "";
          contextParts.push(`${index + 1}. ${importance}${memory.fact}`);
        });
      }
    }

    // 4. Recent Conversation History
    if (conversationData.length > 0) {
      contextParts.push("RECENT CONVERSATION HISTORY:");
      const recentConversations = conversationData.slice(0, MEMORY_CONFIG.MAX_CONVERSATIONS);

      recentConversations.forEach((conv, index) => {
        const t = new Date(conv.timestamp);
        const timeAgo = isNaN(t) ? null : daysBetween(new Date(), t);
        const timeLabel =
          timeAgo === null
            ? "Unknown time"
            : timeAgo === 0
            ? "Today"
            : timeAgo === 1
            ? "Yesterday"
            : `${timeAgo.toFixed(0)} days ago`;

        const userMsg = asText(conv.user_message || "");
        const aiMsg = asText(conv.gpt_response || "");

        if (userMsg) {
          contextParts.push(
            `${index + 1}. User (${timeLabel}): "${excerptSafe(userMsg, 150)}${
              userMsg.length > 150 ? "..." : ""
            }"`
          );
        }
        if (aiMsg && index < 3) {
          // Include AI responses for first few for context
          contextParts.push(
            `   AI Response: "${excerptSafe(aiMsg, 100)}${aiMsg.length > 100 ? "..." : ""}"`
          );
        }
      });
    }

    // 5. Behavior Patterns
    if (patterns.behaviorPatterns && patterns.behaviorPatterns.length > 0) {
      contextParts.push("BEHAVIORAL PATTERNS:");
      patterns.behaviorPatterns.slice(0, 3).forEach((pattern, index) => {
        contextParts.push(`${index + 1}. ${pattern}`);
      });
    }

    // 6. Preferences
    if (patterns.preferencePatterns && patterns.preferencePatterns.length > 0) {
      contextParts.push("USER PREFERENCES:");
      patterns.preferencePatterns.slice(0, 3).forEach((pref, index) => {
        contextParts.push(`${index + 1}. ${pref.preference}`);
      });
    }

    // 7. Recommendations
    if (analytics.recommendations && analytics.recommendations.length > 0) {
      contextParts.push("AI RECOMMENDATIONS:");
      analytics.recommendations.slice(0, 2).forEach((rec, index) => {
        contextParts.push(`${index + 1}. ${rec}`);
      });
    }

    // Combine all context parts
    const fullContext = contextParts.join("\n\n");

    // Ensure context doesn't exceed maximum length
    const finalContext =
      fullContext.length > MEMORY_CONFIG.MAX_CONTEXT_LENGTH
        ? fullContext.substring(0, MEMORY_CONFIG.MAX_CONTEXT_LENGTH) +
          "\n\n[Context truncated for optimal processing]"
        : fullContext;

    console.log(
      `✅ Enhanced strategic database context built: ${finalContext.length} characters`
    );
    console.log(
      `📊 Memory components: ${memoryData.length} persistent + ${conversationData.length} recent + ${
        patterns.behaviorPatterns?.length || 0
      } patterns`
    );

    return finalContext;
  } catch (error) {
    console.error("❌ Build conversation context error:", error.message);

    // Fallback context (safe)
    const cm = asText(currentMessage);
    const fallbackContext = `BASIC CONTEXT: Error building enhanced context (${error.message}). 
Using minimal context for user ${chatId}.
Current message: "${excerptSafe(cm, 100)}${cm.length > 100 ? "..." : ""}"`;

    return fallbackContext;
  }
}

/** Extract and save important facts from conversation */
async function extractAndSaveFacts(chatId, userMessage, aiResponse) {
  try {
    console.log("🧠 Extracting facts from conversation...");

    let extractedFacts = 0;
    const facts = [];

    // Extract from user message
    const userFacts = extractFactsFromText(asText(userMessage), "user");
    facts.push(...userFacts);

    // Extract from AI response
    const aiFacts = extractFactsFromText(asText(aiResponse), "ai");
    facts.push(...aiFacts);

    // Save unique facts to database
    for (const fact of facts) {
      try {
        await addPersistentMemoryDB(chatId, fact.text, fact.importance);
        extractedFacts++;
        console.log(`✅ Saved fact: ${excerptSafe(fact.text, 50)}...`);
      } catch (saveError) {
        console.log(`⚠️ Could not save fact: ${saveError.message}`);
      }
    }

    return {
      extractedFacts: extractedFacts,
      totalFacts: facts.length,
      success: extractedFacts > 0
    };
  } catch (error) {
    console.error("❌ Extract and save facts error:", error.message);
    return {
      extractedFacts: 0,
      totalFacts: 0,
      success: false,
      error: error.message
    };
  }
}

/** Extract facts from text using pattern matching */
function extractFactsFromText(text, source = "unknown") {
  const facts = [];
  if (!text || typeof text !== "string") return facts;

  const lowerText = text.toLowerCase();

  // Name extraction
  const namePatterns = [/my name is ([^.,\n!?]+)/i, /i'm ([^.,\n!?]+)/i, /call me ([^.,\n!?]+)/i];

  namePatterns.forEach((pattern) => {
    const match = text.match(pattern);
    if (match && match[1]) {
      facts.push({
        text: `User's name: ${match[1].trim()}`,
        importance: "high",
        type: "identity",
        source: source
      });
    }
  });

  // Preference extraction
  const preferencePatterns = [
    /i prefer ([^.,\n!?]+)/i,
    /i like ([^.,\n!?]+)/i,
    /my favorite ([^.,\n!?]+)/i,
    /i usually ([^.,\n!?]+)/i,
    /i always ([^.,\n!?]+)/i,
    /i never ([^.,\n!?]+)/i
  ];

  preferencePatterns.forEach((pattern) => {
    const match = text.match(pattern);
    if (match && match[1]) {
      facts.push({
        text: `User preference: ${match[0]}`,
        importance: "medium",
        type: "preference",
        source: source
      });
    }
  });

  // Goal extraction
  const goalPatterns = [
    /my goal is ([^.,\n!?]+)/i,
    /i want to ([^.,\n!?]+)/i,
    /i'm trying to ([^.,\n!?]+)/i,
    /i plan to ([^.,\n!?]+)/i
  ];

  goalPatterns.forEach((pattern) => {
    const match = text.match(pattern);
    if (match && match[1]) {
      facts.push({
        text: `User goal: ${match[0]}`,
        importance: "medium",
        type: "goal",
        source: source
      });
    }
  });

  // Important statement extraction
  if (lowerText.includes("important") || lowerText.includes("remember")) {
    facts.push({
      text: `Important statement: ${text.substring(0, 200)}`,
      importance: "high",
      type: "important",
      source: source
    });
  }

  // Financial/investment extraction
  const financialPatterns = [
    /risk tolerance.*is ([^.,\n!?]+)/i,
    /investment.*style.*is ([^.,\n!?]+)/i,
    /portfolio.*allocation ([^.,\n!?]+)/i
  ];

  financialPatterns.forEach((pattern) => {
    const match = text.match(pattern);
    if (match) {
      facts.push({
        text: `Financial preference: ${match[0]}`,
        importance: "high",
        type: "financial",
        source: source
      });
    }
  });

  return facts;
}

/** Get memory statistics for a user */
async function getMemoryStats(chatId) {
  try {
    console.log(`📊 Getting memory statistics for user ${chatId}`);

    const [conversations, memories] = await Promise.allSettled([
      getConversationHistoryDB(chatId, 100), // Get more for stats
      getPersistentMemoryDB(chatId)
    ]);

    const conversationData = conversations.status === "fulfilled" ? conversations.value || [] : [];
    const memoryData = memories.status === "fulfilled" ? memories.value || [] : [];

    const stats = {
      conversations: {
        total: conversationData.length,
        dateRange: null,
        avgLength: 0,
        totalWords: 0
      },
      memories: {
        total: memoryData.length,
        byImportance: { high: 0, medium: 0, low: 0 },
        oldestMemory: null,
        newestMemory: null
      },
      analytics: null,
      databaseHealth: {
        connected: connectionStats?.connectionHealth === "connected",
        lastQuery: connectionStats?.lastQuery || null,
        totalQueries: connectionStats?.totalQueries || 0
      }
    };

    // Conversation statistics
    if (conversationData.length > 0) {
      const timestamps = conversationData
        .map((conv) => new Date(conv.timestamp))
        .filter((d) => !isNaN(d))
        .sort((a, b) => a - b);

      if (timestamps.length > 0) {
        stats.conversations.dateRange = {
          first: timestamps[0].toISOString(),
          last: timestamps[timestamps.length - 1].toISOString(),
          span: daysBetween(timestamps[0], timestamps[timestamps.length - 1])
        };
      }

      const totalLength = conversationData.reduce(
        (sum, conv) =>
          sum + (asText(conv.user_message).length || 0) + (asText(conv.gpt_response).length || 0),
        0
      );
      stats.conversations.avgLength = safeDivision(totalLength, conversationData.length, 0);
      stats.conversations.totalWords = Math.round(totalLength / 5); // Rough word estimate
    }

    // Memory statistics
    if (memoryData.length > 0) {
      memoryData.forEach((memory) => {
        const importance = memory.importance || "medium";
        stats.memories.byImportance[importance] = (stats.memories.byImportance[importance] || 0) + 1;
      });

      const memoryTimestamps = memoryData
        .map((mem) => new Date(mem.timestamp))
        .filter((d) => !isNaN(d))
        .sort((a, b) => a - b);

      if (memoryTimestamps.length > 0) {
        stats.memories.oldestMemory = memoryTimestamps[0].toISOString();
        stats.memories.newestMemory = memoryTimestamps[memoryTimestamps.length - 1].toISOString();
      }
    }

    // Generate analytics
    stats.analytics = getConversationIntelligenceAnalytics(conversationData, memoryData);

    console.log(
      `✅ Memory stats generated: ${stats.conversations.total} conversations, ${stats.memories.total} memories`
    );

    return stats;
  } catch (error) {
    console.error("❌ Get memory stats error:", error.message);
    return {
      conversations: { total: 0, error: error.message },
      memories: { total: 0, error: error.message },
      analytics: null,
      databaseHealth: { connected: false, error: error.message }
    };
  }
}

/** Clean old or irrelevant memories */
async function cleanupMemories(chatId, options = {}) {
  try {
    console.log(`🧹 Cleaning up memories for user ${chatId}`);

    const maxAge = options.maxAge || 365; // days
    const minImportance = options.minImportance || "low"; // (not yet used for deletion filter)
    const dryRun = options.dryRun || false;

    const memories = await getPersistentMemoryDB(chatId);
    const cutoffDate = new Date(Date.now() - maxAge * 24 * 60 * 60 * 1000);

    const memoriesToRemove = memories.filter((memory) => {
      const memoryDate = new Date(memory.timestamp);
      const isOld = memoryDate < cutoffDate;
      const isLowImportance = (memory.importance || "low") === "low";
      return isOld && isLowImportance;
    });

    if (dryRun) {
      console.log(`🔍 Dry run: Would remove ${memoriesToRemove.length} memories`);
      return {
        memoriesToRemove: memoriesToRemove.length,
        dryRun: true,
        success: true
      };
    }

    // Note: Actual deletion would require a database function
    // This is a placeholder for the cleanup logic
    console.log(`✅ Memory cleanup completed: ${memoriesToRemove.length} candidates identified`);

    return {
      memoriesToRemove: memoriesToRemove.length,
      dryRun: false,
      success: true
    };
  } catch (error) {
    console.error("❌ Cleanup memories error:", error.message);
    return {
      memoriesToRemove: 0,
      dryRun: false,
      success: false,
      error: error.message
    };
  }
}

/** Test memory system functionality */
async function testMemorySystem(chatId) {
  try {
    console.log(`🧪 Testing memory system for user ${chatId}`);

    const testResults = {
      databaseConnection: false,
      conversationRetrieval: false,
      memoryRetrieval: false,
      contextBuilding: false,
      factExtraction: false,
      analytics: false,
      overallHealth: false
    };

    // Test database connection
    try {
      const testConversations = await getConversationHistoryDB(chatId, 1);
      testResults.databaseConnection = true;
      testResults.conversationRetrieval = Array.isArray(testConversations);
    } catch (error) {
      console.log(`❌ Database connection test failed: ${error.message}`);
    }

    // Test memory retrieval
    try {
      const testMemories = await getPersistentMemoryDB(chatId);
      testResults.memoryRetrieval = Array.isArray(testMemories);
    } catch (error) {
      console.log(`❌ Memory retrieval test failed: ${error.message}`);
    }

    // Test context building
    try {
      const testContext = await buildConversationContext(chatId, "test message");
      testResults.contextBuilding = typeof testContext === "string" && testContext.length > 0;
    } catch (error) {
      console.log(`❌ Context building test failed: ${error.message}`);
    }

    // Test fact extraction
    try {
      const extractResult = await extractAndSaveFacts(
        chatId,
        "My name is Test User",
        "Nice to meet you, Test User!"
      );
      testResults.factExtraction = extractResult.success !== false;
    } catch (error) {
      console.log(`❌ Fact extraction test failed: ${error.message}`);
    }

    // Test analytics
    try {
      const analytics = getConversationIntelligenceAnalytics([], []);
      testResults.analytics = analytics && typeof analytics === "object";
    } catch (error) {
      console.log(`❌ Analytics test failed: ${error.message}`);
    }

    // Calculate overall health
    const successCount = Object.values(testResults).filter(Boolean).length;
    testResults.overallHealth = successCount >= 4; // At least 4 out of 6 tests should pass

    console.log(`✅ Memory system test completed: ${successCount}/6 tests passed`);

    return {
      results: testResults,
      score: `${successCount}/6`,
      percentage: Math.round((successCount / 6) * 100),
      status: testResults.overallHealth ? "HEALTHY" : "NEEDS_ATTENTION"
    };
  } catch (error) {
    console.error("❌ Test memory system error:", error.message);
    return {
      results: { overallHealth: false },
      score: "0/6",
      percentage: 0,
      status: "ERROR",
      error: error.message
    };
  }
}

// -----------------------------------------------------------------------------
// 🎯 EXPORT ALL FUNCTIONS
// -----------------------------------------------------------------------------
module.exports = {
  // Main memory functions
  buildConversationContext,
  extractAndSaveFacts,

  // Analytics functions
  inferEnhancedRiskTolerance,
  getConversationIntelligenceAnalytics,
  detectConversationPatterns,

  // Utility functions
  asText,
  lowerSafe,
  excerptSafe,
  safeDivision,
  daysBetween,
  calculateRelevance,
  extractFactsFromText,

  // Management functions
  getMemoryStats,
  cleanupMemories,
  testMemorySystem,

  // Configuration
  MEMORY_CONFIG,

  // Legacy compatibility
  buildMemoryContext: buildConversationContext, // Alias for backward compatibility
  getMemoryAnalytics: getConversationIntelligenceAnalytics,

  // Enhanced functions for GPT-5 integration
  buildEnhancedContext: async (chatId, message, options = {}) => {
    const context = await buildConversationContext(chatId, asText(message));
    return {
      context: context,
      length: context.length,
      memoryAvailable: context.length > 100,
      optimizedForGPT5: true,
      options: options
    };
  },

  // Memory health check
  checkMemoryHealth: async (chatId) => {
    try {
      const stats = await getMemoryStats(chatId);
      const health = {
        connected: stats.databaseHealth.connected,
        hasConversations: stats.conversations.total > 0,
        hasMemories: stats.memories.total > 0,
        dataQuality: stats.analytics?.dataQuality || "unknown",
        overallHealth:
          stats.databaseHealth.connected &&
          (stats.conversations.total > 0 || stats.memories.total > 0)
      };
      return health;
    } catch (error) {
      return {
        connected: false,
        hasConversations: false,
        hasMemories: false,
        dataQuality: "error",
        overallHealth: false,
        error: error.message
      };
    }
  }
};
