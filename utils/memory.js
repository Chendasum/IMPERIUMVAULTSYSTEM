// utils/memory.js — Complete Memory System with PostgreSQL Integration (Hardened)
"use strict";
require("dotenv").config();

/* -------------------------------------------------------------------------- */
/* DB ADAPTER (feature-detect functions to keep compatibility)                */
/* -------------------------------------------------------------------------- */

let db = {};
try { db = require("./database"); } catch { db = {}; }

const getConversationHistoryDB = db.getConversationHistoryDB || (async () => []);
const getPersistentMemoryDB   = db.getPersistentMemoryDB   || (async () => []);
const addPersistentMemoryDB   = db.addPersistentMemoryDB   || (async () => {});
const getUserProfileDB        = db.getUserProfileDB        || (async () => null);
const saveConversationDB      = db.saveConversationDB      || (async () => {});
const connectionStats         = db.connectionStats         || {};
const pgPool                  = db.pool && typeof db.pool.query === "function" ? db.pool : null;

/* -------------------------------------------------------------------------- */
/* CONFIG                                                                     */
/* -------------------------------------------------------------------------- */

const MEMORY_CONFIG = {
  MAX_CONTEXT_LENGTH: 8000,      // chars
  MAX_CONVERSATIONS: 10,         // recent convos included
  MAX_MEMORIES: 15,              // persistent memories included
  CONTEXT_DECAY_DAYS: 30,        // recency decay
  MEMORY_WEIGHT_MULTIPLIER: 2.0, // persistent > convo
  PATTERN_DETECTION_MIN: 3,      // min occurrences for a pattern
};

console.log("🧠 Memory module loaded with PostgreSQL integration");
console.log(`   Context cap: ${MEMORY_CONFIG.MAX_CONTEXT_LENGTH} chars`);

/* -------------------------------------------------------------------------- */
/* SAFE TEXT HELPERS (avoid .toLowerCase/.substring crashes)                  */
/* -------------------------------------------------------------------------- */

function asText(m) {
  if (m == null) return "";
  const t = typeof m;
  if (t === "string") return m;
  if (t === "number" || t === "boolean") return String(m);
  if (Array.isArray(m)) return m.map(asText).join(" ");
  if (t === "object") {
    if (typeof m.content === "string") return m.content;
    if (Array.isArray(m.content)) {
      return m.content.map(c => typeof c === "string" ? c :
        typeof c?.text === "string" ? c.text :
        typeof c?.content === "string" ? c.content : "").join(" ");
    }
    if (typeof m.text === "string") return m.text;
    if (typeof m.caption === "string") return m.caption;
    if (typeof m.message === "object") return asText(m.message);
    try { return JSON.stringify(m); } catch { return ""; }
  }
  return "";
}
const lowerSafe   = (m) => asText(m).toLowerCase();
const excerptSafe = (m, n = 300) => asText(m).substring(0, n);

/* -------------------------------------------------------------------------- */
/* MATH/DATE UTILS                                                            */
/* -------------------------------------------------------------------------- */

function safeDivision(n, d, def = 0) {
  if (!isFinite(n) || !isFinite(d) || d === 0) return def;
  const r = n / d;
  return !isFinite(r) ? def : r;
}

function daysBetween(a, b) {
  const ms = 24 * 60 * 60 * 1000;
  return Math.abs((new Date(a) - new Date(b)) / ms);
}

/**
 * Relevance = decay(recency) * importance * topical_boost
 */
function calculateRelevance(timestamp, importance = "medium", currentMessage = "", memoryText = "") {
  const daysOld     = daysBetween(new Date(), new Date(timestamp));
  const decayFactor = Math.max(0.1, 1 - daysOld / MEMORY_CONFIG.CONTEXT_DECAY_DAYS);

  const weight = { high: 1.0, medium: 0.7, low: 0.4 }[importance] ?? 0.5;

  let boost = 1.0;
  const msg = lowerSafe(currentMessage);
  const mem = typeof memoryText === "string" ? memoryText.toLowerCase() : "";
  if (msg && mem) {
    const msgWords = msg.split(/\s+/);
    const memSet   = new Set(mem.split(/\s+/).filter(w => w.length > 3));
    const common   = msgWords.filter(w => w.length > 3 && memSet.has(w)).length;
    boost = 1.0 + Math.min(1.0, common * 0.2);  // cap
  }
  return decayFactor * weight * boost;
}

/* -------------------------------------------------------------------------- */
/* ANALYTICS                                                                  */
/* -------------------------------------------------------------------------- */

function inferEnhancedRiskTolerance(conversations, memories) {
  try {
    let risk = { level: "moderate", score: 50, confidence: 0.3, indicators: [], evidence: [] };
    const dict = {
      aggressive: { keywords: ["aggressive","high risk","maximum returns","speculative","volatile","leverage","options","futures","crypto","startup"], weight: 3 },
      moderate:   { keywords: ["balanced","moderate","diversified","stable","long term","index fund","etf","mixed portfolio"], weight: 2 },
      conservative:{keywords:["safe","conservative","low risk","capital preservation","bonds","savings","secure","guaranteed","pension"], weight: 1 }
    };
    let A=0,M=0,C=0,S=0;

    (conversations||[]).forEach(conv=>{
      const txt = `${lowerSafe(conv.user_message)} ${lowerSafe(conv.gpt_response)}`;
      for (const [lvl,{keywords,weight}] of Object.entries(dict)) {
        keywords.forEach(k=>{
          if (txt.includes(k)) {
            if (lvl==="aggressive") A+=weight;
            else if (lvl==="moderate") M+=weight;
            else C+=weight;
            risk.evidence.push(`${lvl}: "${k}"`);
            S++;
          }
        });
      }
    });

    (memories||[]).forEach(m=>{
      const text = lowerSafe(m.fact||"");
      const W = MEMORY_CONFIG.MEMORY_WEIGHT_MULTIPLIER;
      if (text.includes("risk tolerance") || text.includes("investment style")) {
        if (text.includes("aggressive") || text.includes("high risk")) { A += 3*W; S += 2; }
        else if (text.includes("conservative") || text.includes("low risk")) { C += 3*W; S += 2; }
        else { M += 2*W; S += 2; }
      }
      for (const [lvl,{keywords,weight}] of Object.entries(dict)) {
        keywords.forEach(k=>{
          if (text.includes(k)) {
            if (lvl==="aggressive") A+=weight*W;
            else if (lvl==="moderate") M+=weight*W;
            else C+=weight*W;
            S++;
          }
        });
      }
    });

    if (S>0) {
      const max = Math.max(A,M,C);
      if (max===A && A>0)  { risk.level="aggressive";   risk.score=Math.min(95,70+A*3); risk.confidence=Math.min(0.9,0.4+S*0.05); risk.indicators=["High risk tolerance","Prefers growth over stability"]; }
      else if (max===C&&C>0){ risk.level="conservative"; risk.score=Math.max(5,30-C*3);  risk.confidence=Math.min(0.9,0.4+S*0.05); risk.indicators=["Low risk tolerance","Prefers stability over growth"]; }
      else                  { risk.level="moderate";     risk.score=40+Math.min(20,M*2)+Math.random()*10; risk.confidence=Math.min(0.8,0.3+S*0.04); risk.indicators=["Balanced risk tolerance"]; }
    }
    risk.indicators.push(`Analyzed ${S} signals`);
    return risk;
  } catch (e) {
    console.error("Risk tolerance error:", e.message);
    return { level:"moderate", score:50, confidence:0.1, indicators:["Error"], evidence:[], error:e.message };
  }
}

function getConversationIntelligenceAnalytics(conversations, memories) {
  try {
    const analytics = {
      conversationFrequency:0, avgResponseLength:0, avgUserMessageLength:0,
      topicDiversity:0, engagementScore:0, memoryRetention:0,
      strategicFocus:"general", communicationStyle:"balanced",
      confidenceLevel:0.3, timeSpan:0, totalInteractions:0,
      recommendations:[], dataQuality:"limited"
    };

    if (conversations?.length) {
      analytics.totalInteractions = conversations.length;
      const ts = conversations.map(c=>new Date(c.timestamp)).filter(d=>!isNaN(d)).sort((a,b)=>a-b);
      if (ts.length>1) {
        const days = Math.max(1, daysBetween(ts[0], ts[ts.length-1]));
        analytics.timeSpan = days;
        analytics.conversationFrequency = safeDivision(conversations.length, days, 0);
      }
      const respLens = conversations.map(c=>asText(c.gpt_response).length);
      const userLens = conversations.map(c=>asText(c.user_message).length);
      analytics.avgResponseLength   = safeDivision(respLens.reduce((s,n)=>s+n,0), respLens.length, 0);
      analytics.avgUserMessageLength= safeDivision(userLens.reduce((s,n)=>s+n,0), userLens.length, 0);

      const topicWords = new Set();
      (conversations||[]).forEach(c=>{
        (lowerSafe(c.user_message).match(/\b\w{4,}\b/g)||[])
          .filter(w=>!["this","that","with","from","they","have","been","were","what","when","where","which","could","would","should"].includes(w))
          .forEach(w=>topicWords.add(w));
      });
      analytics.topicDiversity = Math.min(10, topicWords.size/10);

      const factors = [
        Math.min(2, analytics.avgUserMessageLength/50),
        Math.min(2, analytics.conversationFrequency*5),
        Math.min(2, analytics.topicDiversity),
        Math.min(2, conversations.length/10),
        Math.min(2, topicWords.size/20),
      ];
      analytics.engagementScore = Math.min(10, factors.reduce((s,f)=>s+f,0));
    }

    if (memories?.length) {
      const w = { high:3, medium:2, low:1 };
      const totalW = memories.reduce((s,m)=>s+(w[m.importance]||1),0);
      const avgW = safeDivision(totalW, memories.length, 0);
      analytics.memoryRetention = Math.min(10, avgW*2 + memories.length*0.3);
    }

    const sk = {
      financial:["investment","portfolio","trading","market","financial","fund","money","profit","return","yield","risk"],
      technology:["ai","tech","software","digital","automation","algorithm","programming","system","data"],
      business:["business","strategy","analysis","planning","growth","management","company","revenue","operations"],
      personal:["personal","life","productivity","goals","habits","wellness","health","family","relationships"],
      learning:["learn","education","study","knowledge","skill","training","course","tutorial","research"],
    };
    const focus = {financial:0,technology:0,business:0,personal:0,learning:0,general:0};
    [...(conversations||[]), ...(memories||[])].forEach(it=>{
      const txt = lowerSafe(it.user_message||it.gpt_response||it.fact||"");
      let hit = false;
      for (const [cat,words] of Object.entries(sk)) {
        words.forEach(k=>{ if (txt.includes(k)) { focus[cat]++; hit=true; }});
      }
      if (!hit && txt.length>20) focus.general++;
    });
    analytics.strategicFocus = Object.keys(focus).reduce((a,b)=>focus[a]>focus[b]?a:b);

    if (conversations?.length) {
      const qm = safeDivision(conversations.reduce((s,c)=>s+((asText(c.user_message).match(/\?/g)||[]).length),0), conversations.length, 0);
      const em = safeDivision(conversations.reduce((s,c)=>s+((asText(c.user_message).match(/!/g)||[]).length),0), conversations.length, 0);
      const cmd = safeDivision(conversations.filter(c=>asText(c.user_message).startsWith("/")).length, conversations.length, 0);
      analytics.communicationStyle =
        cmd>0.3 ? "command-oriented" :
        qm>1.5 ? "inquisitive" :
        em>0.5 ? "enthusiastic" :
        analytics.avgUserMessageLength>150 ? "detailed" :
        analytics.avgUserMessageLength<30 ? "concise" : "balanced";
    }

    const points = (conversations?.length||0) + (memories?.length||0);
    analytics.dataQuality = points>=20 ? "excellent" : points>=10 ? "good" : points>=5 ? "fair" : "limited";
    analytics.confidenceLevel = Math.min(0.95,
      0.1 + (conversations?.length||0)*0.03 + (memories?.length||0)*0.05 +
      analytics.topicDiversity*0.02 + (analytics.timeSpan>0 ? Math.min(0.2, analytics.timeSpan*0.01) : 0)
    );

    if (analytics.conversationFrequency < 0.2) analytics.recommendations.push("Increase interaction frequency for better personalization");
    if (analytics.memoryRetention       < 3)   analytics.recommendations.push("Share preferences/important info to enhance memory retention");
    if (analytics.topicDiversity        < 2)   analytics.recommendations.push("Explore more topics to unlock additional capabilities");

    return analytics;
  } catch (e) {
    console.error("Analytics error:", e.message);
    return { conversationFrequency:0, avgResponseLength:0, avgUserMessageLength:0, topicDiversity:0, engagementScore:0, memoryRetention:0, strategicFocus:"general", communicationStyle:"balanced", confidenceLevel:0.1, timeSpan:0, totalInteractions:0, recommendations:["Analytics error"], dataQuality:"error", error:e.message };
  }
}

function detectConversationPatterns(conversations, memories) {
  try {
    const patterns = { timePatterns:{}, topicPatterns:{}, lengthPatterns:{}, questionPatterns:[], preferencePatterns:[], behaviorPatterns:[] };
    if (!conversations?.length) return patterns;

    conversations.forEach(c=>{
      const d = new Date(c.timestamp); const h = isNaN(d)?0:d.getHours();
      const slot = h<6?"early_morning":h<12?"morning":h<18?"afternoon":h<22?"evening":"night";
      patterns.timePatterns[slot] = (patterns.timePatterns[slot]||0)+1;
    });

    const wordsMap = {};
    conversations.forEach(c=>{
      (lowerSafe(c.user_message).match(/\b\w{4,}\b/g)||[]).forEach(w=>{
        if (!["this","that","with","from","they","have","been","were"].includes(w))
          wordsMap[w]=(wordsMap[w]||0)+1;
      });
    });
    patterns.topicPatterns = Object.fromEntries(
      Object.entries(wordsMap).filter(([w,c])=>c>=MEMORY_CONFIG.PATTERN_DETECTION_MIN)
      .sort((a,b)=>b[1]-a[1]).slice(0,10)
    );

    const lens = conversations.map(c=>asText(c.user_message).length||0);
    patterns.lengthPatterns = {
      avg: safeDivision(lens.reduce((s,n)=>s+n,0), lens.length, 0),
      short: lens.filter(l=>l<50).length,
      medium: lens.filter(l=>l>=50 && l<200).length,
      long: lens.filter(l=>l>=200).length,
    };

    const qTypes = conversations.filter(c=>asText(c.user_message).includes("?")).map(c=>{
      const m = lowerSafe(c.user_message);
      if (m.startsWith("what")) return "what";
      if (m.startsWith("how"))  return "how";
      if (m.startsWith("why"))  return "why";
      if (m.startsWith("when")) return "when";
      if (m.startsWith("where"))return "where";
      return "other";
    });
    const qCount = {}; qTypes.forEach(t=>qCount[t]=(qCount[t]||0)+1);
    patterns.questionPatterns = Object.entries(qCount).filter(([,n])=>n>=2)
      .map(([type,count])=>({type,count,frequency:safeDivision(count,conversations.length,0)}));

    (memories||[]).forEach(m=>{
      const fact = lowerSafe(m.fact||"");
      if (/(prefer|like|favorite)/.test(fact)) {
        patterns.preferencePatterns.push({ preference:m.fact, importance:m.importance, timestamp:m.timestamp });
      }
    });

    if ((patterns.timePatterns.morning||0)>(patterns.timePatterns.evening||0)) patterns.behaviorPatterns.push("Morning person - more active early");
    if ((patterns.lengthPatterns.long||0)>(patterns.lengthPatterns.short||0))  patterns.behaviorPatterns.push("Detailed communicator");
    if (patterns.questionPatterns.some(p=>p.type==="how" && p.frequency>0.3)) patterns.behaviorPatterns.push("Process-oriented");

    return patterns;
  } catch (e) {
    console.error("Pattern detection error:", e.message);
    return { timePatterns:{}, topicPatterns:{}, lengthPatterns:{}, questionPatterns:[], preferencePatterns:[], behaviorPatterns:[], error:e.message };
  }
}

/* -------------------------------------------------------------------------- */
/* CONTEXT BUILDER                                                            */
/* -------------------------------------------------------------------------- */

async function buildConversationContext(chatId, currentMessage = "") {
  try {
    const currentMsgText = asText(currentMessage);

    // fetch DB data in parallel
    const [convosP, memsP, profileP] = await Promise.allSettled([
      getConversationHistoryDB(chatId, MEMORY_CONFIG.MAX_CONVERSATIONS),
      getPersistentMemoryDB(chatId),
      getUserProfileDB(chatId),
    ]);

    const conversations = convosP.status==="fulfilled" ? (convosP.value||[]) : [];
    const memories      = memsP.status ==="fulfilled" ? (memsP.value ||[]) : [];
    const profile       = profileP.status==="fulfilled" ? profileP.value    : null;

    // analytics (safe)
    const risk      = inferEnhancedRiskTolerance(conversations, memories);
    const analytics = getConversationIntelligenceAnalytics(conversations, memories);
    const patterns  = detectConversationPatterns(conversations, memories);

    const parts = [];

    // 1) profile
    if (profile) {
      const firstSeen = profile.first_seen ? new Date(profile.first_seen).toLocaleDateString() : "unknown";
      const cnt = profile.conversation_count ?? "?";
      parts.push(`USER PROFILE: Member since ${firstSeen}, ${cnt} total conversations`);
    }

    // 2) intelligence summary
    parts.push(
`STRATEGIC INTELLIGENCE SUMMARY:
• Communication Style: ${analytics.communicationStyle}
• Strategic Focus: ${analytics.strategicFocus}
• Risk Tolerance: ${risk.level} (${Number(risk.score||0).toFixed(0)}/100)
• Engagement Level: ${Number(analytics.engagementScore||0).toFixed(1)}/10
• Data Quality: ${analytics.dataQuality}
• Confidence: ${Number((analytics.confidenceLevel||0)*100).toFixed(0)}%`
    );

    // 3) persistent memories — identity pinned + relevance-mixed
    const identity = (memories||[]).filter(m =>
      /(^|\s)(user'?s name:|confirmed name:)/i.test(String(m.fact||""))
    );

    const scored = (memories||[])
      .filter(m => !identity.includes(m))
      .map(m => ({ ...m, relevance: calculateRelevance(m.timestamp, m.importance, currentMsgText, m.fact) }))
      .sort((a,b)=>b.relevance - a.relevance);

    // keep identity + top others
    const finalMemories = [...identity, ...scored].slice(0, MEMORY_CONFIG.MAX_MEMORIES);

    if (finalMemories.length) {
      parts.push("PERSISTENT MEMORIES (Important Facts):");
      finalMemories.forEach((m,i)=>{
        const tag = m.importance ? `[${String(m.importance).toUpperCase()}] ` : "";
        parts.push(`${i+1}. ${tag}${m.fact}`);
      });
    }

    // 4) recent conversation (compact)
    if (conversations.length) {
      parts.push("RECENT CONVERSATION HISTORY:");
      const recent = conversations.slice(0, MEMORY_CONFIG.MAX_CONVERSATIONS);
      recent.forEach((c,i)=>{
        const t = new Date(c.timestamp);
        const ago = isNaN(t) ? null : daysBetween(new Date(), t);
        const label = ago==null ? "Unknown" : ago===0 ? "Today" : ago===1 ? "Yesterday" : `${ago.toFixed(0)} days ago`;
        const u = asText(c.user_message||"");
        const a = asText(c.gpt_response||"");
        if (u) parts.push(`${i+1}. User (${label}): "${excerptSafe(u,150)}${u.length>150?"...":""}"`);
        if (a && i<3) parts.push(`   AI: "${excerptSafe(a,100)}${a.length>100?"...":""}"`);
      });
    }

    // 5) patterns
    if (patterns.behaviorPatterns?.length) {
      parts.push("BEHAVIORAL PATTERNS:");
      patterns.behaviorPatterns.slice(0,3).forEach((p,i)=>parts.push(`${i+1}. ${p}`));
    }

    if (patterns.preferencePatterns?.length) {
      parts.push("USER PREFERENCES:");
      patterns.preferencePatterns.slice(0,3).forEach((p,i)=>parts.push(`${i+1}. ${p.preference}`));
    }

    if (analytics.recommendations?.length) {
      parts.push("AI RECOMMENDATIONS:");
      analytics.recommendations.slice(0,2).forEach((p,i)=>parts.push(`${i+1}. ${p}`));
    }

    // join + trim
    const joined = parts.join("\n\n");
    const final  = joined.length > MEMORY_CONFIG.MAX_CONTEXT_LENGTH
      ? joined.substring(0, MEMORY_CONFIG.MAX_CONTEXT_LENGTH) + "\n\n[Context truncated]"
      : joined;

    console.log(`✅ Context built (${final.length} chars) — ${memories.length} memories, ${conversations.length} convos`);
    return final;

  } catch (e) {
    console.error("Build context error:", e.message);
    const cm = asText(currentMessage);
    return `BASIC CONTEXT (fallback): error building context (${e.message})\nCurrent message: "${excerptSafe(cm,100)}${cm.length>100?"...":""}"`;
  }
}

/* -------------------------------------------------------------------------- */
/* FACT EXTRACTION                                                            */
/* -------------------------------------------------------------------------- */

function extractFactsFromText(text, source = "unknown") {
  const facts = [];
  if (!text || typeof text !== "string") return facts;

  const lower = text.toLowerCase();

  // names
  [/my name is ([^.,\n!?]+)/i, /i'm ([^.,\n!?]+)/i, /call me ([^.,\n!?]+)/i].forEach(rx=>{
    const m = text.match(rx);
    if (m?.[1]) facts.push({ text:`User's name: ${m[1].trim()}`, importance:"high", type:"identity", source });
  });

  // preferences
  [/i prefer ([^.,\n!?]+)/i, /i like ([^.,\n!?]+)/i, /my favorite ([^.,\n!?]+)/i, /i usually ([^.,\n!?]+)/i, /i always ([^.,\n!?]+)/i, /i never ([^.,\n!?]+)/i]
  .forEach(rx=>{
    const m = text.match(rx);
    if (m?.[1]) facts.push({ text:`User preference: ${m[0]}`, importance:"medium", type:"preference", source });
  });

  // goals
  [/my goal is ([^.,\n!?]+)/i, /i want to ([^.,\n!?]+)/i, /i'm trying to ([^.,\n!?]+)/i, /i plan to ([^.,\n!?]+)/i]
  .forEach(rx=>{
    const m = text.match(rx);
    if (m?.[1]) facts.push({ text:`User goal: ${m[0]}`, importance:"medium", type:"goal", source });
  });

  // important marker
  if (lower.includes("important") || lower.includes("remember")) {
    facts.push({ text:`Important statement: ${text.substring(0,200)}`, importance:"high", type:"important", source });
  }

  // financial
  [/risk tolerance.*is ([^.,\n!?]+)/i, /investment.*style.*is ([^.,\n!?]+)/i, /portfolio.*allocation ([^.,\n!?]+)/i]
  .forEach(rx=>{
    const m = text.match(rx);
    if (m) facts.push({ text:`Financial preference: ${m[0]}`, importance:"high", type:"financial", source });
  });

  return facts;
}

async function extractAndSaveFacts(chatId, userMessage, aiResponse) {
  try {
    const facts = [
      ...extractFactsFromText(asText(userMessage), "user"),
      ...extractFactsFromText(asText(aiResponse), "ai"),
    ];
    let saved = 0;
    for (const f of facts) {
      try { await addPersistentMemoryDB(chatId, f.text, f.importance); saved++; }
      catch (e) { console.warn("Fact save skipped:", e.message); }
    }
    return { extractedFacts:saved, totalFacts:facts.length, success:saved>0 };
  } catch (e) {
    console.error("extractAndSaveFacts error:", e.message);
    return { extractedFacts:0, totalFacts:0, success:false, error:e.message };
  }
}

/* -------------------------------------------------------------------------- */
/* STATS & CLEANUP                                                            */
/* -------------------------------------------------------------------------- */

async function getMemoryStats(chatId) {
  try {
    const [cP, mP] = await Promise.allSettled([
      getConversationHistoryDB(chatId, 100),
      getPersistentMemoryDB(chatId),
    ]);
    const conv = cP.status==="fulfilled" ? (cP.value||[]) : [];
    const mem  = mP.status==="fulfilled" ? (mP.value||[]) : [];

    const timestamps = conv.map(c=>new Date(c.timestamp)).filter(d=>!isNaN(d)).sort((a,b)=>a-b);
    const totalLen   = conv.reduce((s,c)=> s + asText(c.user_message).length + asText(c.gpt_response).length, 0);

    const byImp = { high:0, medium:0, low:0 };
    mem.forEach(m=>{ byImp[m.importance||"medium"] = (byImp[m.importance||"medium"]||0)+1; });

    const memTs = mem.map(m=>new Date(m.timestamp)).filter(d=>!isNaN(d)).sort((a,b)=>a-b);

    return {
      conversations: {
        total: conv.length,
        dateRange: timestamps.length? { first:timestamps[0].toISOString(), last:timestamps[timestamps.length-1].toISOString(), span:daysBetween(timestamps[0], timestamps[timestamps.length-1]) } : null,
        avgLength: safeDivision(totalLen, conv.length, 0),
        totalWords: Math.round(totalLen/5),
      },
      memories: {
        total: mem.length,
        byImportance: byImp,
        oldestMemory: memTs[0]?.toISOString() || null,
        newestMemory: memTs[memTs.length-1]?.toISOString() || null,
      },
      analytics: getConversationIntelligenceAnalytics(conv, mem),
      databaseHealth: {
        connected: connectionStats?.connectionHealth === "connected" || !!pgPool,
        lastQuery:  connectionStats?.lastQuery || null,
        totalQueries: connectionStats?.totalQueries || 0,
      }
    };
  } catch (e) {
    console.error("getMemoryStats error:", e.message);
    return { conversations:{ total:0, error:e.message }, memories:{ total:0, error:e.message }, analytics:null, databaseHealth:{ connected:!!pgPool, error:e.message } };
  }
}

/**
 * Cleanup with PostgreSQL:
 * - Protect identity/prefs (promote to high)
 * - Drop old 'low' items past retention
 * - Cap per-user memory count with priority
 */
async function cleanupMemories(chatId, {
  lowRetentionDays = 90,
  cap = 200,
  dryRun = false
} = {}) {
  try {
    if (!pgPool) {
      console.warn("cleanupMemories: no pg pool; returning dry-run counts");
      const mems = await getPersistentMemoryDB(chatId);
      const cutoff = new Date(Date.now() - lowRetentionDays*24*60*60*1000);
      const toRemove = mems.filter(m => (m.importance||"low")==="low" && new Date(m.timestamp) < cutoff)
        .filter(m => !/(user'?s name:|confirmed name:|user preference:)/i.test(String(m.fact||"")));
      return { dryRun:true, candidates:toRemove.length, success:true };
    }

    // promote protected facts
    await pgPool.query(`
      UPDATE persistent_memories
      SET importance = 'high'
      WHERE chat_id = $1
        AND (fact ILIKE '%user''s name:%' OR fact ILIKE '%confirmed name:%' OR fact ILIKE '%user preference:%')
    `, [chatId]);

    if (!dryRun) {
      // delete ancient low-importance (except protected)
      await pgPool.query(`
        DELETE FROM persistent_memories
        WHERE chat_id = $1
          AND importance = 'low'
          AND timestamp < NOW() - INTERVAL '${lowRetentionDays} days'
          AND fact NOT ILIKE '%user''s name:%'
          AND fact NOT ILIKE '%confirmed name:%'
          AND fact NOT ILIKE '%user preference:%'
      `, [chatId]);

      // cap total rows per user by priority and recency
      await pgPool.query(`
        DELETE FROM persistent_memories
        WHERE chat_id = $1
          AND id NOT IN (
            SELECT id FROM persistent_memories
            WHERE chat_id = $1
            ORDER BY 
              CASE 
                WHEN fact ILIKE '%user''s name:%' OR fact ILIKE '%confirmed name:%' OR fact ILIKE '%user preference:%' THEN 4
                WHEN importance='high' THEN 3
                WHEN importance='medium' THEN 2
                ELSE 1
              END DESC,
              timestamp DESC
            LIMIT $2
          )
      `, [chatId, cap]);
    }

    console.log(`🧹 Memory cleanup done for ${chatId} (cap=${cap}, retention=${lowRetentionDays}d, dryRun=${dryRun})`);
    return { dryRun, success:true };
  } catch (e) {
    console.error("cleanupMemories error:", e.message);
    return { dryRun, success:false, error:e.message };
  }
}

/* -------------------------------------------------------------------------- */
/* DIAGNOSTICS                                                                */
/* -------------------------------------------------------------------------- */

async function testMemorySystem(chatId) {
  try {
    const out = { databaseConnection:false, conversationRetrieval:false, memoryRetrieval:false, contextBuilding:false, factExtraction:false, analytics:false, overallHealth:false };

    try { await getConversationHistoryDB(chatId,1); out.databaseConnection = true; out.conversationRetrieval = true; } catch {}
    try { await getPersistentMemoryDB(chatId);       out.memoryRetrieval = true; } catch {}
    try { const ctx = await buildConversationContext(chatId,"test"); out.contextBuilding = typeof ctx==="string" && ctx.length>0; } catch {}
    try { const fx  = await extractAndSaveFacts(chatId,"My name is Test User","Ok Test"); out.factExtraction = fx.success!==false; } catch {}
    try { const an  = getConversationIntelligenceAnalytics([],[]); out.analytics = !!an; } catch {}

    const ok = Object.values(out).filter(Boolean).length;
    out.overallHealth = ok >= 4;
    return { results: out, score:`${ok}/6`, percentage: Math.round(ok/6*100), status: out.overallHealth ? "HEALTHY" : "NEEDS_ATTENTION" };
  } catch (e) {
    return { results:{ overallHealth:false }, score:"0/6", percentage:0, status:"ERROR", error:e.message };
  }
}

/* -------------------------------------------------------------------------- */
/* EXPORTS                                                                    */
/* -------------------------------------------------------------------------- */

module.exports = {
  // main
  buildConversationContext,
  extractAndSaveFacts,

  // analytics
  inferEnhancedRiskTolerance,
  getConversationIntelligenceAnalytics,
  detectConversationPatterns,

  // utils
  asText, lowerSafe, excerptSafe, safeDivision, daysBetween, calculateRelevance, extractFactsFromText,

  // management
  getMemoryStats,
  cleanupMemories,
  testMemorySystem,

  // config
  MEMORY_CONFIG,

  // legacy aliases
  buildMemoryContext: buildConversationContext,
  getMemoryAnalytics: getConversationIntelligenceAnalytics,

  // GPT-5 helper
  buildEnhancedContext: async (chatId, message, options={}) => {
    const context = await buildConversationContext(chatId, asText(message));
    return { context, length: context.length, memoryAvailable: context.length>100, optimizedForGPT5:true, options };
  },

  // health
  checkMemoryHealth: async (chatId) => {
    try {
      const stats = await getMemoryStats(chatId);
      const health = {
        connected: stats.databaseHealth.connected,
        hasConversations: stats.conversations.total>0,
        hasMemories: stats.memories.total>0,
        dataQuality: stats.analytics?.dataQuality || "unknown",
        overallHealth: stats.databaseHealth.connected && (stats.conversations.total>0 || stats.memories.total>0)
      };
      return health;
    } catch (e) {
      return { connected:false, hasConversations:false, hasMemories:false, dataQuality:"error", overallHealth:false, error:e.message };
    }
  }
};
