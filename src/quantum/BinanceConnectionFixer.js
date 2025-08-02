// ===== BINANCE CONNECTION FIXER =====
// Professional-grade connection methods like 3Commas uses

const axios = require('axios');
const crypto = require('crypto');

class BinanceConnectionFixer {
  constructor(apiKey, apiSecret) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
  }

  async testAllConnectionMethods() {
    console.log('🔧 BINANCE CONNECTION FIXER - Testing all professional connection methods');
    
    const methods = [
      {
        name: '3Commas Style Connection',
        method: () => this.connect3CommasStyle()
      },
      {
        name: 'Professional Trading Bot',
        method: () => this.connectProfessionalStyle()
      },
      {
        name: 'Direct API Connection',
        method: () => this.connectDirectStyle()
      },
      {
        name: 'Secure Connection Method',
        method: () => this.connectSecureStyle()
      }
    ];

    for (const method of methods) {
      try {
        console.log(`🔄 Testing: ${method.name}...`);
        const result = await method.method();
        
        if (result.success) {
          console.log(`✅ SUCCESS: ${method.name} worked!`);
          return {
            success: true,
            method: method.name,
            data: result.data,
            connectionDetails: result.connectionDetails
          };
        } else {
          console.log(`❌ FAILED: ${method.name} - ${result.error}`);
        }
        
      } catch (error) {
        console.log(`❌ ERROR: ${method.name} - ${error.message}`);
      }
    }

    return {
      success: false,
      error: 'All connection methods failed',
      suggestion: 'Check API key permissions and regional restrictions'
    };
  }

  async connect3CommasStyle() {
    try {
      const timestamp = Date.now();
      const queryString = `timestamp=${timestamp}`;
      const signature = crypto.createHmac('sha256', this.apiSecret).update(queryString).digest('hex');
      
      const response = await axios.get('https://api.binance.com/api/v3/account', {
        params: {
          timestamp: timestamp,
          signature: signature
        },
        headers: {
          'X-MBX-APIKEY': this.apiKey,
          'User-Agent': '3Commas-Bot/1.0',
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        },
        timeout: 10000
      });

      return {
        success: true,
        data: response.data,
        connectionDetails: {
          method: '3Commas Style',
          endpoint: 'api.binance.com',
          status: response.status
        }
      };
      
    } catch (error) {
      return {
        success: false,
        error: `${error.response?.status || error.code} - ${error.message}`
      };
    }
  }

  async connectProfessionalStyle() {
    try {
      const timestamp = Date.now();
      const queryString = `timestamp=${timestamp}`;
      const signature = crypto.createHmac('sha256', this.apiSecret).update(queryString).digest('hex');
      
      const response = await axios({
        method: 'GET',
        url: 'https://api.binance.com/api/v3/account',
        params: {
          timestamp: timestamp,
          signature: signature
        },
        headers: {
          'X-MBX-APIKEY': this.apiKey,
          'User-Agent': 'Professional-Trading-System/2.0',
          'Accept': 'application/json',
          'Connection': 'keep-alive'
        },
        timeout: 15000,
        validateStatus: (status) => status < 500 // Accept 4xx as valid responses to analyze
      });

      if (response.status === 200) {
        return {
          success: true,
          data: response.data,
          connectionDetails: {
            method: 'Professional Style',
            endpoint: 'api.binance.com',
            status: response.status
          }
        };
      } else {
        return {
          success: false,
          error: `HTTP ${response.status} - ${response.statusText}`
        };
      }
      
    } catch (error) {
      return {
        success: false,
        error: `${error.response?.status || error.code} - ${error.message}`
      };
    }
  }

  async connectDirectStyle() {
    try {
      const timestamp = Date.now();
      const params = new URLSearchParams();
      params.append('timestamp', timestamp.toString());
      
      const signature = crypto.createHmac('sha256', this.apiSecret).update(params.toString()).digest('hex');
      params.append('signature', signature);
      
      const response = await axios.get(`https://api.binance.com/api/v3/account?${params.toString()}`, {
        headers: {
          'X-MBX-APIKEY': this.apiKey,
          'User-Agent': 'Direct-API-Client/1.0'
        },
        timeout: 10000
      });

      return {
        success: true,
        data: response.data,
        connectionDetails: {
          method: 'Direct Style',
          endpoint: 'api.binance.com',
          status: response.status
        }
      };
      
    } catch (error) {
      return {
        success: false,
        error: `${error.response?.status || error.code} - ${error.message}`
      };
    }
  }

  async connectSecureStyle() {
    try {
      const timestamp = Date.now();
      const queryString = `timestamp=${timestamp}`;
      const signature = crypto.createHmac('sha256', this.apiSecret).update(queryString).digest('hex');
      
      // Use axios with specific SSL/TLS settings
      const httpsAgent = new (require('https').Agent)({
        rejectUnauthorized: true,
        secureProtocol: 'TLSv1_2_method'
      });
      
      const response = await axios.get('https://api.binance.com/api/v3/account', {
        params: {
          timestamp: timestamp,
          signature: signature
        },
        headers: {
          'X-MBX-APIKEY': this.apiKey,
          'User-Agent': 'Secure-Trading-Client/1.0',
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate'
        },
        httpsAgent: httpsAgent,
        timeout: 12000
      });

      return {
        success: true,
        data: response.data,
        connectionDetails: {
          method: 'Secure Style',
          endpoint: 'api.binance.com',
          status: response.status,
          security: 'TLS 1.2'
        }
      };
      
    } catch (error) {
      return {
        success: false,
        error: `${error.response?.status || error.code} - ${error.message}`
      };
    }
  }

  // Test just the ping endpoint with different methods
  async testPingMethods() {
    console.log('🔍 Testing basic Binance connectivity with different methods...');
    
    const pingMethods = [
      {
        name: 'Standard Ping',
        headers: { 'User-Agent': 'Binance-Ping/1.0' }
      },
      {
        name: '3Commas Ping',
        headers: { 'User-Agent': '3Commas-Bot/1.0' }
      },
      {
        name: 'Professional Ping',
        headers: { 'User-Agent': 'Professional-Trading-System/2.0' }
      },
      {
        name: 'Curl Style Ping',
        headers: { 'User-Agent': 'curl/7.68.0' }
      }
    ];

    for (const method of pingMethods) {
      try {
        const response = await axios.get('https://api.binance.com/api/v3/ping', {
          headers: method.headers,
          timeout: 5000
        });
        
        if (response.status === 200) {
          console.log(`✅ ${method.name}: SUCCESS`);
          return { success: true, workingMethod: method.name };
        }
        
      } catch (error) {
        console.log(`❌ ${method.name}: ${error.response?.status || error.message}`);
      }
    }
    
    return { success: false, error: 'All ping methods failed' };
  }
}

module.exports = BinanceConnectionFixer;