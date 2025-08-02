// GOVERNMENT CONTRACT TRACKER - Automated $500K+ Opportunity Detection - CAMBODIA OPTIMIZED
// Monitors government websites for major infrastructure projects

const axios = require('axios');
const cheerio = require('cheerio');

class GovernmentContractTracker {
  constructor(telegramBot = null) {
    this.bot = telegramBot;
    this.contracts = new Map();
    this.isRunning = false;
    this.minimumValue = 500000; // $500K minimum - OPTIMIZED FOR CAMBODIA MARKET
  }

  // AUTOMATED CONTRACT MONITORING
  async findMajorContracts() {
    try {
      console.log('🏛️ Starting government contract monitoring...');
      
      const contracts = [];
      
      // 1. MINISTRY OF ECONOMY AND FINANCE
      const mefContracts = await this.scrapeMEFContracts();
      contracts.push(...mefContracts);
      
      // 2. MINISTRY OF PUBLIC WORKS
      const mpwContracts = await this.scrapeMPWContracts();
      contracts.push(...mpwContracts);
      
      // 3. CAMBODIA DEVELOPMENT COUNCIL
      const cdcContracts = await this.scrapeCDCProjects();
      contracts.push(...cdcContracts);
      
      // 4. ASIAN DEVELOPMENT BANK PROJECTS
      const adbContracts = await this.scrapeADBProjects();
      contracts.push(...adbContracts);
      
      // 5. FILTER HIGH-VALUE OPPORTUNITIES
      const majorContracts = this.filterHighValueContracts(contracts);
      
      // 6. ANALYZE FUND PARTICIPATION OPPORTUNITIES
      const opportunities = this.analyzeParticipationOpportunities(majorContracts);
      
      this.storeContracts(opportunities);
      return opportunities;
      
    } catch (error) {
      console.error('❌ Contract monitoring error:', error.message);
      return [];
    }
  }

  // SCRAPE MINISTRY OF ECONOMY AND FINANCE
  async scrapeMEFContracts() {
    try {
      const contracts = [];
      
      const response = await axios.get('https://mef.gov.kh/projects-tenders', {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const $ = cheerio.load(response.data);
      
      $('.tender-item, .project-item').each((index, element) => {
        const title = $(element).find('.tender-title, .project-title').text().trim();
        const value = $(element).find('.tender-value, .project-budget').text().trim();
        const deadline = $(element).find('.deadline, .closing-date').text().trim();
        const description = $(element).find('.description, .summary').text().trim();
        const ministry = 'Ministry of Economy and Finance';
        
        if (title && value) {
          contracts.push({
            title: title,
            value: this.parseContractValue(value),
            valueText: value,
            deadline: deadline,
            description: description,
            ministry: ministry,
            source: 'MEF Website',
            url: 'https://mef.gov.kh',
            dateFound: new Date().toISOString(),
            sector: this.identifySector(title + ' ' + description)
          });
        }
      });
      
      console.log(`✅ Found ${contracts.length} MEF contracts`);
      return contracts;
      
    } catch (error) {
      console.error('❌ MEF scraping error:', error.message);
      return [];
    }
  }

  // SCRAPE MINISTRY OF PUBLIC WORKS
  async scrapeMPWContracts() {
    try {
      const contracts = [];
      
      const response = await axios.get('https://mpwt.gov.kh/infrastructure-projects', {
        timeout: 15000
      });
      
      const $ = cheerio.load(response.data);
      
      $('.infrastructure-project').each((index, element) => {
        const title = $(element).find('.project-title').text().trim();
        const value = $(element).find('.project-cost, .budget').text().trim();
        const location = $(element).find('.location').text().trim();
        const status = $(element).find('.status').text().trim();
        
        if (title && value) {
          contracts.push({
            title: title,
            value: this.parseContractValue(value),
            valueText: value,
            location: location,
            status: status,
            ministry: 'Ministry of Public Works and Transport',
            source: 'MPWT Website',
            sector: 'Infrastructure',
            dateFound: new Date().toISOString()
          });
        }
      });
      
      console.log(`✅ Found ${contracts.length} MPWT contracts`);
      return contracts;
      
    } catch (error) {
      console.error('❌ MPWT scraping error:', error.message);
      return [];
    }
  }

  // SCRAPE CAMBODIA DEVELOPMENT COUNCIL
  async scrapeCDCProjects() {
    try {
      const contracts = [];
      
      const response = await axios.get('https://cambodiainvestment.gov.kh/investment-projects', {
        timeout: 15000
      });
      
      const $ = cheerio.load(response.data);
      
      $('.investment-project').each((index, element) => {
        const title = $(element).find('.project-name').text().trim();
        const investment = $(element).find('.investment-amount').text().trim();
        const investor = $(element).find('.investor-name').text().trim();
        const sector = $(element).find('.sector').text().trim();
        
        if (title && investment) {
          contracts.push({
            title: title,
            value: this.parseContractValue(investment),
            valueText: investment,
            investor: investor,
            ministry: 'Cambodia Development Council',
            source: 'CDC Website',
            sector: sector || 'Investment',
            dateFound: new Date().toISOString()
          });
        }
      });
      
      console.log(`✅ Found ${contracts.length} CDC projects`);
      return contracts;
      
    } catch (error) {
      console.error('❌ CDC scraping error:', error.message);
      return [];
    }
  }

  // SCRAPE ASIAN DEVELOPMENT BANK PROJECTS
  async scrapeADBProjects() {
    try {
      const contracts = [];
      
      const response = await axios.get('https://www.adb.org/projects/country/cam', {
        timeout: 15000
      });
      
      const $ = cheerio.load(response.data);
      
      $('.project-item').each((index, element) => {
        const title = $(element).find('.project-title a').text().trim();
        const amount = $(element).find('.project-amount').text().trim();
        const sector = $(element).find('.project-sector').text().trim();
        const status = $(element).find('.project-status').text().trim();
        
        if (title && amount) {
          contracts.push({
            title: title,
            value: this.parseContractValue(amount),
            valueText: amount,
            ministry: 'Asian Development Bank',
            source: 'ADB Website',
            sector: sector,
            status: status,
            dateFound: new Date().toISOString()
          });
        }
      });
      
      console.log(`✅ Found ${contracts.length} ADB projects`);
      return contracts;
      
    } catch (error) {
      console.error('❌ ADB scraping error:', error.message);
      return [];
    }
  }

  // FILTER HIGH-VALUE CONTRACTS
  filterHighValueContracts(contracts) {
    return contracts.filter(contract => {
      return contract.value >= this.minimumValue; // $50M+
    }).sort((a, b) => b.value - a.value); // Highest value first
  }

  // ANALYZE FUND PARTICIPATION OPPORTUNITIES
  analyzeParticipationOpportunities(contracts) {
    return contracts.map(contract => {
      // Calculate potential fund participation
      const fundParticipation = this.calculateFundParticipation(contract);
      const riskAssessment = this.assessProjectRisk(contract);
      const strategicValue = this.assessStrategicValue(contract);
      
      return {
        ...contract,
        fundOpportunity: {
          participationSize: fundParticipation.size,
          participationPercent: fundParticipation.percent,
          estimatedRevenue: fundParticipation.revenue,
          riskLevel: riskAssessment.level,
          riskFactors: riskAssessment.factors,
          strategicValue: strategicValue.score,
          strategicBenefits: strategicValue.benefits,
          recommendedAction: this.getRecommendedAction(contract, fundParticipation, riskAssessment)
        }
      };
    });
  }

  // CALCULATE FUND PARTICIPATION POTENTIAL
  calculateFundParticipation(contract) {
    const totalValue = contract.value;
    const typicalParticipation = totalValue * 0.05; // 5% typical participation
    const maxParticipation = totalValue * 0.15; // 15% maximum participation
    
    // Revenue estimates (management fees + success fees)
    const managementFeeRate = 0.02; // 2% annual management fee
    const successFeeRate = 0.20; // 20% success fee
    
    const annualManagementFee = typicalParticipation * managementFeeRate;
    const successFee = typicalParticipation * successFeeRate;
    const totalRevenue = annualManagementFee * 3 + successFee; // 3-year average
    
    return {
      size: typicalParticipation,
      percent: 5,
      maxSize: maxParticipation,
      maxPercent: 15,
      revenue: totalRevenue
    };
  }

  // ASSESS PROJECT RISK
  assessProjectRisk(contract) {
    let riskScore = 0;
    const factors = [];
    
    // Government backing reduces risk
    if (contract.ministry.includes('Ministry')) {
      riskScore -= 20;
      factors.push('Government backing (-20 risk)');
    }
    
    // ADB/World Bank backing reduces risk significantly
    if (contract.source.includes('ADB') || contract.source.includes('World Bank')) {
      riskScore -= 30;
      factors.push('International development bank backing (-30 risk)');
    }
    
    // Infrastructure projects generally stable
    if (contract.sector === 'Infrastructure') {
      riskScore -= 10;
      factors.push('Infrastructure sector stability (-10 risk)');
    }
    
    // Large projects have economies of scale
    if (contract.value > 100000000) { // $100M+
      riskScore -= 15;
      factors.push('Large project economies of scale (-15 risk)');
    }
    
    // Determine risk level
    let riskLevel;
    if (riskScore <= -40) riskLevel = 'Low';
    else if (riskScore <= -20) riskLevel = 'Medium';
    else riskLevel = 'High';
    
    return {
      score: riskScore,
      level: riskLevel,
      factors: factors
    };
  }

  // ASSESS STRATEGIC VALUE
  assessStrategicValue(contract) {
    let strategicScore = 0;
    const benefits = [];
    
    // Network building value
    strategicScore += 25;
    benefits.push('Government relationship building (+25)');
    
    // Sector expertise development
    strategicScore += 20;
    benefits.push('Sector expertise development (+20)');
    
    // Future deal flow
    if (contract.value > 200000000) { // $200M+
      strategicScore += 30;
      benefits.push('Major project credibility for future deals (+30)');
    }
    
    // International backing prestige
    if (contract.source.includes('ADB')) {
      strategicScore += 25;
      benefits.push('International development bank relationship (+25)');
    }
    
    return {
      score: strategicScore,
      benefits: benefits
    };
  }

  // GET RECOMMENDED ACTION
  getRecommendedAction(contract, participation, risk) {
    if (risk.level === 'Low' && participation.revenue > 1000000) {
      return 'IMMEDIATE PURSUIT - High-value, low-risk opportunity';
    } else if (risk.level === 'Medium' && participation.revenue > 500000) {
      return 'STRATEGIC CONSIDERATION - Moderate opportunity with acceptable risk';
    } else if (contract.value > 500000000) { // $500M+
      return 'MONITOR CLOSELY - Mega-project with significant strategic value';
    } else {
      return 'EVALUATE FURTHER - Requires additional analysis';
    }
  }

  // UTILITY FUNCTIONS
  parseContractValue(valueText) {
    if (!valueText) return 0;
    
    // Remove currency symbols and convert to number
    const cleanText = valueText.replace(/[^\d.,]/g, '');
    const numbers = cleanText.match(/[\d,]+/g);
    
    if (!numbers) return 0;
    
    let value = parseFloat(numbers[0].replace(/,/g, ''));
    
    // Handle millions/billions
    if (valueText.toLowerCase().includes('billion')) {
      value *= 1000000000;
    } else if (valueText.toLowerCase().includes('million')) {
      value *= 1000000;
    }
    
    return value;
  }

  identifySector(text) {
    const sectors = {
      'infrastructure': ['road', 'bridge', 'highway', 'infrastructure', 'construction'],
      'energy': ['power', 'electricity', 'energy', 'solar', 'hydroelectric'],
      'water': ['water', 'sanitation', 'sewage', 'dam'],
      'transportation': ['airport', 'port', 'railway', 'transport'],
      'telecommunications': ['telecom', 'internet', 'digital', 'technology'],
      'healthcare': ['hospital', 'health', 'medical', 'clinic'],
      'education': ['school', 'university', 'education', 'training']
    };
    
    const lowerText = text.toLowerCase();
    
    for (const [sector, keywords] of Object.entries(sectors)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        return sector;
      }
    }
    
    return 'General';
  }

  // STORE CONTRACTS
  storeContracts(contracts) {
    contracts.forEach(contract => {
      const key = contract.title + contract.ministry;
      this.contracts.set(key, contract);
    });
    console.log(`📊 Stored ${contracts.length} major contracts`);
  }

  // SEND DAILY CONTRACT REPORT
  async sendDailyContractReport(chatId) {
    try {
      const majorContracts = await this.findMajorContracts();
      
      if (majorContracts.length === 0) {
        await this.bot.sendMessage(chatId,
          "🏛️ DAILY CONTRACT MONITORING COMPLETED\n\n" +
          "❌ No contracts ($500K+) found today - CAMBODIA MARKET OPTIMIZED\n" +
          "⚠️ This may indicate:\n" +
          "• Government websites requiring authentication\n" +
          "• Contracts not yet published\n" +
          "• Seasonal variations in project announcements\n" +
          "• Ministry websites temporarily unavailable\n\n" +
          "🎯 SYSTEM NOW MONITORING REALISTIC CAMBODIA CONTRACTS:\n" +
          "• $500K+ Infrastructure projects (roads, schools, hospitals)\n" +
          "• $1M+ Equipment procurement (medical, IT, construction)\n" +
          "• $2M+ Development projects (bridges, buildings)\n" +
          "• $5M+ Major infrastructure (airports, ports)\n\n" +
          "🔧 Consider checking ministry websites manually"
        );
        return;
      }
      
      let report = `🏛️ DAILY GOVERNMENT CONTRACT INTELLIGENCE\n\n`;
      report += `📊 Found ${majorContracts.length} major contracts ($50M+)\n\n`;
      
      majorContracts.slice(0, 3).forEach((contract, index) => {
        report += `💰 CONTRACT ${index + 1}:\n`;
        report += `📋 Title: ${contract.title}\n`;
        report += `💵 Value: $${(contract.value / 1000000).toFixed(1)}M\n`;
        report += `🏛️ Ministry: ${contract.ministry}\n`;
        report += `🏭 Sector: ${contract.sector}\n`;
        report += `📊 Fund Opportunity: $${(contract.fundOpportunity.participationSize / 1000000).toFixed(1)}M (${contract.fundOpportunity.participationPercent}%)\n`;
        report += `💰 Est. Revenue: $${(contract.fundOpportunity.estimatedRevenue / 1000).toFixed(0)}K\n`;
        report += `⚠️ Risk Level: ${contract.fundOpportunity.riskLevel}\n`;
        report += `🎯 Action: ${contract.fundOpportunity.recommendedAction}\n`;
        report += `\n`;
      });
      
      report += `📅 Report Generated: ${new Date().toLocaleString()}\n`;
      report += `🔄 Next scan: 4 hours\n`;
      report += `⚡ SYSTEMATIC CONTRACT MONITORING ACTIVE`;
      
      await this.bot.sendMessage(chatId, report);
      
    } catch (error) {
      console.error('❌ Contract report error:', error.message);
    }
  }

  // START AUTOMATED MONITORING
  startAutomatedMonitoring(chatId, intervalHours = 4) {
    if (this.isRunning) {
      console.log('⚠️ Contract monitoring already running');
      return;
    }
    
    this.isRunning = true;
    console.log(`🚀 Starting automated contract monitoring every ${intervalHours} hours`);
    
    // Initial run
    this.sendDailyContractReport(chatId);
    
    // Schedule recurring runs
    setInterval(() => {
      this.sendDailyContractReport(chatId);
    }, intervalHours * 60 * 60 * 1000);
  }

  // STOP AUTOMATION
  stopAutomatedMonitoring() {
    this.isRunning = false;
    console.log('🛑 Stopped automated contract monitoring');
  }
}

module.exports = GovernmentContractTracker;
