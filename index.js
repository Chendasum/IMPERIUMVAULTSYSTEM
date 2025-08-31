#!/usr/bin/env node
"use strict";

/**
 * IMPERIUM VAULT — Clean Server (Express + Telegram Webhook)
 * Server only. All AI/multimodal logic lives in utils/dualCommandSystem.js
 * API client lives in utils/openaiClient.js
 */

require("dotenv").config();

const express = require("express");
const TelegramBot = require("node-telegram-bot-api");

// ─────────────────────────────────────────────────────────────────────────────
// ENV & BASIC GUARDS
// ─────────────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 8080;
const WEBHOOK_URL =
  process.env.WEBHOOK_URL ||
  "https://imperiumvaultsystem-production.up.railway.app";
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error("❌ TELEGRAM_BOT_TOKEN not found");
  process.exit(1);
}

console.log("IMPERIUM VAULT — Clean Server Starting…");
console.log("Flow: index.js (server) → dualCommandSystem.js (routing) → openaiClient.js (api)");
console.log("Mode: Railway Webhook Production");
console.log(`Server Config: Port ${PORT}, Webhook Base: ${WEBHOOK_URL}`);

// ─────────────────────────────────────────────────────────────────────────────
// DATABASE (safe import; graceful if unavailable)
// ─────────────────────────────────────────────────────────────────────────────
let Database;
try {
  Database = require("./utils/database");
  console.log("✅ database.js loaded (pool + schema + health)");
} catch (e) {
  console.warn("⚠️  database.js not available:", e.message);
  // Minimal stub so server still boots
  Database = {
    initialize: async () => {},
    healthCheck: async () => ({ ok: false, error: "database module missing" }),
    close: async () => {},
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// DUAL COMMAND SYSTEM (ALL routing lives here)
// ─────────────────────────────────────────────────────────────────────────────
let DualCommandSystem;
try {
  DualCommandSystem = require("./utils/dualCommandSystem");
  console.log("✅ dualCommandSystem.js loaded — ALL routing handled here");
} catch (err) {
  console.error("❌ CRITICAL: dualCommandSystem.js failed to load:", err.message);
  process.exit(1);
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPRESS + TELEGRAM (Webhook mode)
// ─────────────────────────────────────────────────────────────────────────────
const app = express();
const bot = new TelegramBot(BOT_TOKEN);

app.use(express.json({ limit: "50mb" }));

// Lightweight logging for webhook traffic
app.use((req, _res, next) => {
  if (req.url.includes("webhook")) {
    console.log(`📨 Webhook: ${req.method} ${req.url}`);
  }
  next();
});

// ─────────────────────────────────────────────────────────────────────────────
// HEALTH ENDPOINTS (server + DB only; AI health handled inside dualCommandSystem)
// ─────────────────────────────────────────────────────────────────────────────
app.get("/", async (_req, res) => {
  const db = await Database.healthCheck().catch(() => ({ ok: false, error: "health check failed" }));
  res.json({
    status: "IMPERIUM VAULT GPT-5 System Online",
    architecture: "Clean Separation Architecture",
    server: "index.js (Express + Telegram Webhook)",
    routing: "dualCommandSystem.js (All AI Logic + Multimodal)",
    api: "openaiClient.js (GPT-5 API)",
    formatting: "telegramSplitter.js (Smart Unicode)",
    mode: "Railway Production Webhook",
    timestamp: new Date().toISOString(),
    port: PORT,
    database: db.ok ? "connected" : `degraded (${db.error || "unknown"})`,
  });
});

app.get("/health", async (_req, res) => {
  const db = await Database.healthCheck().catch((e) => ({ ok: false, error: e.message || "health check failed" }));
  res.status(200).json({
    status: "healthy",
    service: "IMPERIUM VAULT Server",
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + "MB",
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + "MB",
    },
    routing_system: DualCommandSystem ? "loaded" : "failed",
    multimodal_support: DualCommandSystem && DualCommandSystem.handleTelegramMessage ? "ready" : "missing",
    database: {
      ok: !!db.ok,
      detail: db.ok ? "Postgres reachable" : (db.error || "unavailable"),
    },
    timestamp: new Date().toISOString(),
  });
});

app.get("/status", (_req, res) => {
  res.json({
    server: "online",
    routing: DualCommandSystem ? "ready" : "failed",
    handlers: {
      telegram: !!DualCommandSystem.handleTelegramMessage,
      callback: !!DualCommandSystem.handleCallbackQuery,
      inline: !!DualCommandSystem.handleInlineQuery,
    },
    timestamp: new Date().toISOString(),
  });
});

// Dedicated DB probe (useful for Railway pings)
app.get("/db-health", async (_req, res) => {
  try {
    const db = await Database.healthCheck();
    if (db.ok) return res.status(200).json({ ok: true, detail: "Postgres OK" });
    return res.status(503).json({ ok: false, error: db.error || "unknown" });
  } catch (e) {
    return res.status(503).json({ ok: false, error: e.message || "health check failed" });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DEDUPLICATION (avoid reprocessing Telegram retries)
// ─────────────────────────────────────────────────────────────────────────────
const processedMessages = new Set();
setInterval(() => {
  processedMessages.clear();
  console.log("🧹 Message cache cleared");
}, 300000); // every 5 minutes

// ─────────────────────────────────────────────────────────────────────────────
// MAIN WEBHOOK ENDPOINT → clean routing to DualCommandSystem
// ─────────────────────────────────────────────────────────────────────────────
app.post(`/webhook/${BOT_TOKEN}`, async (req, res) => {
  try {
    const update = req.body;

    // Deduplicate messages
    if (update && update.message) {
      const msgId = update.message.message_id;
      const chatId = update.message.chat.id;
      const key = `${chatId}_${msgId}`;
      if (processedMessages.has(key)) {
        console.log(`🔄 Duplicate message ${key} — Skipping`);
        return res.status(200).json({ ok: true });
      }
      processedMessages.add(key);
    }

    // Route to dualCommandSystem
    if (update && update.message) {
      console.log("📨 Routing message → dualCommandSystem.handleTelegramMessage");
      await DualCommandSystem.handleTelegramMessage(update.message, bot);
    } else if (update && update.callback_query) {
      console.log("📨 Routing callback → dualCommandSystem.handleCallbackQuery");
      await DualCommandSystem.handleCallbackQuery(update.callback_query, bot);
    } else if (update && update.inline_query) {
      console.log("📨 Routing inline → dualCommandSystem.handleInlineQuery");
      await DualCommandSystem.handleInlineQuery(update.inline_query, bot);
    } else {
      console.log("📨 Unknown update type received");
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("❌ Webhook error:", err.message);
    // Always 200 so Telegram doesn’t retry aggressively
    res.status(200).json({ ok: true });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// STARTUP (initialize DB, set webhook, init dualCommandSystem)
// ─────────────────────────────────────────────────────────────────────────────
async function initializeServer() {
  try {
    console.log("\n🔧 Initializing clean server…");

    // Ensure dualCommandSystem has the essentials
    if (!DualCommandSystem || !DualCommandSystem.handleTelegramMessage) {
      throw new Error("dualCommandSystem.js missing required handlers");
    }

    // Initialize database (non-fatal if it throws; we’ll log and continue)
    try {
      await Database.initialize();
      const db = await Database.healthCheck();
      if (db.ok) console.log("🗄️  Database: READY");
      else console.warn("🗄️  Database: DEGRADED →", db.error || "unknown");
    } catch (e) {
      console.warn("🗄️  Database init failed (server will still run):", e.message);
    }

    // Configure webhook
    const webhookUrl = `${WEBHOOK_URL}/webhook/${BOT_TOKEN}`;
    console.log(`🌐 Setting webhook → ${webhookUrl}`);
    await bot.setWebHook(webhookUrl, {
      max_connections: 100,
      allowed_updates: ["message", "callback_query", "inline_query"],
    });
    console.log("✅ Webhook configured");

    // Optional: initialize the dualCommandSystem
    if (typeof DualCommandSystem.initialize === "function") {
      console.log("🚀 Initializing dualCommandSystem…");
      await DualCommandSystem.initialize();
      console.log("✅ dualCommandSystem initialized");
    }

    console.log("\n🎉 CLEAN SERVER READY!");
    console.log("📡 All message routing handled by dualCommandSystem.js");
    console.log("🚀 No routing conflicts — clean architecture");
    console.log(`🌐 Listening on port ${PORT}…\n`);
  } catch (e) {
    console.error("❌ Server initialization failed:", e.message);
    console.log("🔧 Check dualCommandSystem.js and try again");
    process.exit(1);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// BOOT
// ─────────────────────────────────────────────────────────────────────────────
app.listen(PORT, async () => {
  console.log(`🌐 Express server started on port ${PORT}`);
  await initializeServer();
});

// ─────────────────────────────────────────────────────────────────────────────
// GRACEFUL SHUTDOWN
// ─────────────────────────────────────────────────────────────────────────────
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutdown initiated…");
  try {
    await bot.deleteWebHook();
    console.log("✅ Webhook deleted");

    if (typeof DualCommandSystem.shutdown === "function") {
      console.log("🔄 Shutting down dualCommandSystem…");
      await DualCommandSystem.shutdown();
      console.log("✅ dualCommandSystem shutdown complete");
    }

    if (Database && typeof Database.close === "function") {
      console.log("🗄️  Closing database pool…");
      await Database.close();
      console.log("✅ Database pool closed");
    }
  } catch (e) {
    console.log("⚠️  Shutdown error:", e.message);
  }
  console.log("👋 Clean shutdown complete");
  process.exit(0);
});

// ─────────────────────────────────────────────────────────────────────────────
// ERROR HANDLERS
// ─────────────────────────────────────────────────────────────────────────────
process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Rejection:", reason);
  // Do not exit — dualCommandSystem handles recovery for AI flows
});
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  console.log("🚨 Server continuing — dualCommandSystem handles recovery");
});

console.log("🎯 Clean Server Architecture Active — Zero Routing Conflicts!");

