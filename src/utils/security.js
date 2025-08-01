// Security utilities for IMPERIUM VAULT SYSTEM
const AUTHORIZED_COMMANDERS = {
  // Commander Sum Chenda - Primary Dynasty Authority
  primary: process.env.ADMIN_CHAT_ID || "484389665", // Your Telegram ID from debug
  
  // Add additional authorized users here if needed
  // secondary: "123456789", // Example: Trusted advisor ID
};

// Security validation function
const isAuthorizedCommander = (userId) => {
  const userIdStr = userId.toString();
  return Object.values(AUTHORIZED_COMMANDERS).includes(userIdStr);
};

// Dynasty protection with logging
const dynastyProtection = (msg) => {
  if (!isAuthorizedCommander(msg.from.id)) {
    console.log(`🚫 UNAUTHORIZED ACCESS ATTEMPT: User ${msg.from.id} (@${msg.from.username || 'unknown'}) tried to access dynasty commands`);
    return false;
  }
  return true;
};

module.exports = {
  isAuthorizedCommander,
  dynastyProtection,
  AUTHORIZED_COMMANDERS
};