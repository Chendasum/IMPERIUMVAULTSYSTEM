// utils/openaiClient.js — Strategic Commander GPT-5 Upgrade
require("dotenv").config();
const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 120000,
  maxRetries: 3
});

// --- Model Helpers ---
function normalizeModel(model) {
  return model || process.env.OPENAI_MODEL || "gpt-5";
}
function isGpt5(model) {
  return String(model).toLowerCase().startsWith("gpt-5");
}
function applyMaxTokens(params, model, n) {
  const m = normalizeModel(model || params.model);
  const out = { ...params, model: m };
  if (n != null) {
    if (isGpt5(m)) {
      delete out.max_tokens;
      out.max_completion_tokens = n;
    } else {
      delete out.max_completion_tokens;
      out.max_tokens = n;
    }
  }
  return out;
}
async function chatCompat(client, params, maxTokens = null) {
  let p = applyMaxTokens(params, params.model, maxTokens);
  try {
    return await client.chat.completions.create(p);
  } catch (err) {
    if (/unsupported parameter/i.test(err.message)) {
      return await client.chat.completions.create(applyMaxTokens(p, p.model, maxTokens));
    }
    throw err;
  }
}

// --- System Prompts ---
const SYSTEM_STRATEGIC = `You are the Strategic Commander of IMPERIUM VAULT SYSTEM - Sum Chenda's institutional command center.

CRITICAL IDENTITY:
You are a senior institutional strategist with deep expertise in global markets, portfolio management, and Cambodia private lending. You think and communicate like a portfolio manager at Bridgewater Associates or BlackRock.

COMMUNICATION AUTHORITY:
- Speak with institutional conviction and expertise
- Provide comprehensive, detailed strategic analysis
- Use specific numbers, data, and actionable recommendations
- Write naturally but with commanding professional authority
- Never use weak language like "consider" or "might want to"

EXPERTISE AREAS:
- Global macro economic analysis and regime identification
- Risk parity and All Weather portfolio construction
- Cambodia private lending market intelligence
- Live trading strategy and risk management
- Market correlation analysis and strategic positioning

RESPONSE REQUIREMENTS:
- Use full available token budget
- Include numbers, timelines, deep institutional insight
- Never cut responses short
- Use professional formatting for clarity

STRATEGIC LANGUAGE:
- "Execute deployment of $X to sector Y given current conditions"
- "Strategic analysis indicates optimal positioning in Z"
- "Deploy All Weather allocation across these instruments"
- "Current macro regime demands defensive positioning"`;

const SYSTEM_GENERAL = `You are OpenAI's most advanced model. Provide comprehensive, helpful, and accurate responses in all domains.`;

// --- Core Reply ---
async function getGptReply(prompt, options = {}) {
  const strategic = options.strategic !== false;
  const model = normalizeModel(options.model);
  const temperature = options.temperature ?? 0.7;
  const maxTokens = options.maxTokens ?? 16384;
  const messages = [
    { role: "system", content: strategic ? SYSTEM_STRATEGIC : SYSTEM_GENERAL },
    { role: "user", content: String(prompt) }
  ];
  const completion = await chatCompat(openai, { model, messages, temperature }, maxTokens);
  return completion.choices?.[0]?.message?.content?.trim() || "";
}

// --- Specialized Calls ---
async function getStrategicAnalysis(query, marketData = null, options = {}) {
  let enhanced = query;
  if (marketData) {
    enhanced = `Current Market Context:
- Fed Rate: ${marketData.fedRate || 'N/A'}%
- VIX: ${marketData.vix || 'N/A'}
- 10Y Yield: ${marketData.yield10Y || 'N/A'}%
- S&P 500: ${marketData.sp500 || 'N/A'}

Strategic Query: ${query}`;
  }
  return await getGptReply(enhanced, { strategic: true, ...options });
}

async function getCambodiaFundAnalysis(dealQuery, dealData = null, options = {}) {
  const details = dealData ? `Deal Parameters:
- Amount: $${Number(dealData.amount || 0).toLocaleString()}
- Type: ${dealData.type || 'Commercial'}
- Location: ${dealData.location || 'Phnom Penh'}
- Rate: ${dealData.rate || 'TBD'}%
- Term: ${dealData.term || 'TBD'} months
` : "";
  const enhanced = `Cambodia Private Lending Fund Analysis:\n\n${details}\nAnalysis Request: ${dealQuery}\n\nProvide institutional-grade analysis including risk assessment, market conditions, strategic positioning, and specific execution recommendations.`;
  return await getGptReply(enhanced, { strategic: true, temperature: 0.6, ...options });
}

async function getGeneralReply(prompt, options = {}) {
  return await getGptReply(prompt, { strategic: false, ...options });
}

module.exports = {
  getGptReply,
  getStrategicAnalysis,
  getCambodiaFundAnalysis,
  getGeneralReply,
  normalizeModel,
  isGpt5,
  applyMaxTokens,
  chatCompat,
  openai
};
