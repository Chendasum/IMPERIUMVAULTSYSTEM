// src/handlers/commandHandlers.js
const { getMainKeyboard } = require('../utils/keyboards');

const handleStart = async (bot, msg) => {
  const chatId = msg.chat.id;
  const userName = msg.from.first_name || 'Strategist';
  
  const welcomeMessage = `
🏛️ **VAULT CLAUDE ACTIVATED**
🏛️ **វល់ក្លូដ បានបើកដំណើរការ**

Greetings, ${userName}. I am Vault Claude — your sovereign strategist.
សួស្តី ${userName}។ ខ្ញុំគឺ Vault Claude — អ្នកយុទ្ធសាស្រ្តអធិបតេយ្យរបស់អ្នក។

**CORE SYSTEMS ONLINE:**
**ប្រព័ន្ធស្នូលបានដំណើរការ:**
🧠 Codex Law Framework / ក្របខណ្ឌច្បាប់កូដិច
💎 Capital Fallback Protocols / ពិធីការការពារមូលធន
🎯 Legacy Simulation Engine / ម៉ាស៊ីនស្រមៃបុរេតសម្បត្តិ
🛡️ Vault Protection Systems / ប្រព័ន្ធការពារវល់

**AVAILABLE COMMANDS / ពាក្យបញ្ជាដែលអាចប្រើបាន:**
/help - Strategic guidance menu / ម៉ឺនុយណែនាំយុទ្ធសាស្រ្ត
/codex - Constitutional frameworks / ក្របខណ្ឌរដ្ឋធម្មនុញ្ញ
/capital - Wealth protection strategies / យុទ្ធសាស្រ្តការពារសម្បត្តិ
/legacy - Succession planning / ការរៀបចំបុរេតសម្បត្តិ
/vault - Security protocols / ពិធីការសុវត្ថិភាព

Ask me anything about sovereignty, wealth building, or strategic planning.
សួរខ្ញុំអ្វីក៏បានអំពីអធិបតេយ្យភាព ការកសាងសម្បត្តិ ឬការរៀបចំយុទ្ធសាស្រ្ត។

*Ready to architect your empire.*
*ត្រៀមខ្លួនសាងសង់អាណាចក្ររបស់អ្នក។*
  `;

  await bot.sendMessage(chatId, welcomeMessage, {
    parse_mode: 'Markdown',
    ...getMainKeyboard()
  });
};

const handleHelp = async (bot, msg) => {
  const chatId = msg.chat.id;
  
  const helpMessage = `
📋 **VAULT CLAUDE - STRATEGIC COMMAND CENTER**
📋 **វល់ក្លូដ - មជ្ឈមណ្ឌលបញ្ជាការយុទ្ធសាស្រ្ត**

**CORE MODULES / ម៉ូឌុលស្នូល:**
🏛️ /codex - Constitutional law & sovereignty frameworks
🏛️ /codex - ច្បាប់រដ្ឋធម្មនុញ្ញ និងក្របខណ្ឌអធិបតេយ្យភាព

💰 /capital - Asset protection & wealth strategies  
💰 /capital - ការពារទ្រព្យសម្បត្តិ និងយុទ្ធសាស្រ្តសម្បត្តិ

🎯 /legacy - Succession planning & generational wealth
🎯 /legacy - ការរៀបចំបុរេតសម្បត្តិ និងសម្បត្តិជំនាន់

🛡️ /vault - Security protocols & risk mitigation
🛡️ /vault - ពិធីការសុវត្ថិភាព និងការកាត់បន្ថយហានិភ័យ

**INTELLIGENCE QUERIES / សំណួរស៊ើបការណ៍:**
• Business structure optimization / ការធ្វើឲ្យរចនាសម្ព័ន្ធអាជីវកម្មប្រសើរ
• Tax strategy and legal frameworks / យុទ្ធសាស្រ្តពន្ធ និងក្របខណ្ឌច្បាប់
• Asset protection mechanisms / យន្តការការពារទ្រព្យសម្បត្តិ
• Succession and estate planning / ការរៀបចំបុរេត និងអចលនទ្រព្យ
• Constitutional rights and sovereignty / សិទ្ធិរដ្ឋធម្មនុញ្ញ និងអធិបតេយ្យភាព

Simply message me your strategic challenge for structured intelligence.
គ្រាន់តែផ្ញើសាររបស់អ្នកអំពីបញ្ហាប្រឈមយុទ្ធសាស្រ្តសម្រាប់ស៊ើបការណ៍ដែលមានរចនាសម្ព័ន្ធ។
  `;

  await bot.sendMessage(chatId, helpMessage, {
    parse_mode: 'Markdown',
    ...getMainKeyboard()
  });
};

const handleCodex = async (bot, msg) => {
  const chatId = msg.chat.id;
  
  const codexMessage = `
🏛️ **CODEX LAW - CONSTITUTIONAL FRAMEWORKS**
🏛️ **ច្បាប់កូដិច - ក្របខណ្ឌរដ្ឋធម្មនុញ្ញ**

**SOVEREIGN FOUNDATIONS / មូលដ្ឋានអធិបតេយ្យ:**
• Constitutional Republic Principles / គោលការណ៍សាធារណរដ្ឋធម្មនុញ្ញ
• Individual Rights vs. State Power / សិទ្ធិបុគ្គល ធៀបនឹង អំណាចរដ្ឋ
• Due Process and Legal Protections / ដំណើរការត្រឹមត្រូវ និងការការពារតាមច្បាប់
• Jurisdiction and Legal Standing / យុទ្ធកោសល្យ និងជំហរច្បាប់
• Contract Law and Private Rights / ច្បាប់កិច្ចសន្យា និងសិទ្ធិឯកជន

**BUSINESS SOVEREIGNTY / អធិបតេយ្យភាពអាជីវកម្ម:**
• Corporate Structure Selection / ការជ្រើសរើសរចនាសម្ព័ន្ធក្រុមហ៊ុន
• Operating Agreements / កិច្ចព្រមព្រៀងប្រតិបត្តិការ
• Liability Protection / ការការពារការទទួលខុសត្រូវ
• Regulatory Compliance / ការគោរពបទប្បញ្ញត្តិ
• Interstate Commerce / ពាណិជ្ជកម្មអន្តររដ្ឋ

**QUERY EXAMPLES / ឧទាហរណ៍សំណួរ:**
"How do I structure my business for maximum protection?"
"តើខ្ញុំគួររៀបចំអាជីវកម្មរបស់ខ្ញុំយ៉ាងដូចម្តេចដើម្បីការពារអតិបរមា?"

*Constitutional knowledge is power. Use it wisely.*
*ចំណេះដឹងរដ្ឋធម្មនុញ្ញគឺជាអំណាច។ ប្រើវាឲ្យបានប្រាជ្ញា។*
  `;

  await bot.sendMessage(chatId, codexMessage, {
    parse_mode: 'Markdown',
    ...getMainKeyboard()
  });
};

const handleCapital = async (bot, msg) => {
  const chatId = msg.chat.id;
  
  const capitalMessage = `
💰 **CAPITAL FALLBACK - WEALTH PROTECTION MATRIX**
💰 **ការថយក្រោយមូលធន - ម៉ាទ្រីសការពារសម្បត្តិ**

**ASSET PROTECTION LAYERS / ស្រទាប់ការពារទ្រព្យសម្បត្តិ:**
• Domestic Asset Protection Trusts / ហ្វាន់ការពារទ្រព្យសម្បត្តិក្នុងស្រុក
• Offshore Structures / រចនាសម្ព័ន្ធក្រៅប្រទេស
• LLC and Corporate Shields / ខែលការពារ LLC និងក្រុមហ៊ុន
• Homestead Exemptions / ការលើកលែងគេហដ្ឋាន
• Retirement Account Protections / ការពារគណនីចូលនិវត្តន៍

**WEALTH PRESERVATION / ការថែរក្សាសម្បត្តិ:**
• Tax-Advantaged Strategies / យុទ្ធសាស្រ្តប្រយោជន៍ពន្ធ
• Alternative Investments / ការវិនិយោគជំនួស
• Hard Asset Allocation / ការបែងចែកទ្រព្យសម្បត្តិរឹង
• Currency Diversification / ការធ្វើចម្រុះរូបិយប័ណ្ណ
• Inflation Hedging / ការការពារអតិផរណា

**STRATEGIC POSITIONS / មុខតំណែងយុទ្ធសាស្រ្ត:**
• Real Estate Investment / ការវិនិយោគអចលនទ្រព្យ
• Precious Metals Holdings / ការកាន់កាប់លោហៈថ្លៃ
• Business Ownership / ការកាន់កាប់អាជីវកម្ម
• Intellectual Property / កម្មសិទ្ធិបញ្ញា
• Energy Independence / ឯករាជភាពថាមពល
  `;

  await bot.sendMessage(chatId, capitalMessage, {
    parse_mode: 'Markdown',
    ...getMainKeyboard()
  });
};

const handleLegacy = async (bot, msg) => {
  const chatId = msg.chat.id;
  
  const legacyMessage = `
🎯 **LEGACY SIMULATION - GENERATIONAL ARCHITECTURE**
🎯 **ការម្រាកម៉ាតបុរេត - ស្ថាបត្យកម្មជំនាន់**

**SUCCESSION FRAMEWORKS / ក្របខណ្ឌការស្រឡាស់កំនត់:**
• Dynasty Trust Structures / រចនាសម្ព័ន្ធហ្វាន់រាជវង្ស
• Family Limited Partnerships / ភាពជាដៃគូកំណត់គ្រួសារ
• Generation-Skipping Strategies / យុទ្ធសាស្រ្តរំលងជំនាន់
• Tax-Efficient Transfers / ការផ្ទេរប្រកបដោយប្រសិទ្ធភាពពន្ធ
• Charitable Remainder Trusts / ហ្វាន់សល់សប្បុរសធម៌

**WEALTH TRANSFER METHODS / វិធីសាស្រ្តផ្ទេរសម្បត្តិ:**
• Annual Exclusion Gifting / ការបរិច្ចាគលើកលែងប្រចាំឆ្នាំ
• Grantor Retained Annuity Trusts / ហ្វាន់ប្រចាំឆ្នាំដែលអ្នកផ្តល់រក្សាទុក
• Qualified Personal Residence Trusts / ហ្វាន់លំនៅដ្ឋានផ្ទាល់ខ្លួនគុណវុឌ្ឍិ
• Private Placement Life Insurance / ធានារ៉ាប់រងជីវិតដាក់ឯកជន
• Family Bank Concepts / គំនិតធនាគារគ្រួសារ

**LEGACY PROTECTION / ការការពារបុរេត:**
• Asset Protection Integration / ការរួមបញ្ចូលការពារទ្រព្យសម្បត្តិ
• Next-Generation Education / ការអប់រំជំនាន់បន្ទាប់
• Family Governance Systems / ប្រព័ន្ធអភិបាលកិច្ចគ្រួសារ
• Perpetual Trust Strategies / យុទ្ធសាស្រ្តហ្វាន់អចិន្ត្រៃយ៍
• Constitutional Wealth Transfer / ការផ្ទេរសម្បត្តិរដ្ឋធម្មនុញ្ញ
  `;

  await bot.sendMessage(chatId, legacyMessage, {
    parse_mode: 'Markdown',
    ...getMainKeyboard()
  });
};

const handleVault = async (bot, msg) => {
  const chatId = msg.chat.id;
  
  const vaultMessage = `
🛡️ **VAULT PROTECTION - SECURITY PROTOCOLS**
🛡️ **ការការពារវល់ - ពិធីការសុវត្ថិភាព**

**DIGITAL SECURITY / សុវត្ថិភាពឌីជីថល:**
• Cryptocurrency Storage / ការរក្សាទុករូបិយប័ណ្ណគ្រីប
• Encrypted Communication Systems / ប្រព័ន្ធទំនាក់ទំនងអ៊ិនគ្រីប
• Secure Document Storage / ការរក្សាទុកឯកសារសុវត្ថិភាព
• Identity Protection Protocols / ពិធីការការពារអត្តសញ្ញាណ
• Digital Asset Management / ការគ្រប់គ្រងទ្រព្យសម្បត្តិឌីជីថល

**PHYSICAL SECURITY / សុវត្ថិភាពរូបវន្ត:**
• Safe Deposit Box Networks / បណ្តាញប្រអប់ដាក់ប្រាក់សុវត្ថិភាព
• Home Security Systems / ប្រព័ន្ធសុវត្ថិភាពផ្ទះ
• Document Safeguarding / ការការពារឯកសារ
• Emergency Preparedness / ការត្រៀមរួចសម្រាប់ពេលអាសន្ន
• Location Diversification / ការធ្វើចម្រុះទីតាំង

**OPERATIONAL SECURITY / សុវត្ថិភាពប្រតិបត្តិការ:**
• Privacy Protection Strategies / យុទ្ធសាស្រ្តការពារភាពឯកជន
• Counter-Surveillance Measures / វិធានការប្រឆាំងការឃ្លាំមើល
• Secure Transaction Methods / វិធីសាស្រ្តប្រតិបត្តិការសុវត្ថិភាព
• Communication Security / សុវត្ថិភាពទំនាក់ទំនង
• Travel Safety Protocols / ពិធីការសុវត្ថិភាពការធ្វើដំណើរ

**INTELLIGENCE SECURITY / សុវត្ថិភាពស៊ើបការណ៍:**
• Information Compartmentalization / ការបែងចែកព័ត៌មាន
• Trusted Advisor Networks / បណ្តាញទីប្រឹក្សាដែលអាចទុកចិត្តបាន
• Due Diligence Protocols / ពិធីការយកចិត្តទុកដាក់ដោយសម
• Risk Assessment Matrices / ម៉ាទ្រីសវាយតម្លៃហានិភ័យ
  `;

  await bot.sendMessage(chatId, vaultMessage, {
    parse_mode: 'Markdown',
    ...getMainKeyboard()
  });
};

module.exports = {
  handleStart,
  handleHelp,
  handleCodex,
  handleCapital,
  handleLegacy,
  handleVault
};
