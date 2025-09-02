#!/usr/bin/env node

/**
 * OpenAI Commander CLI - GPT-5 Edition
 * Complete command-line interface for OpenAI GPT-5 API
 * Usage: node openai-cli.js [command] [options]
 */

const { Command } = require('commander');
const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');
const { createReadStream, createWriteStream } = require('fs');

// OpenAI Client class (embedded for standalone usage)
class OpenAIClient {
  constructor(apiKey, options = {}) {
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }
    
    this.apiKey = apiKey;
    this.baseURL = options.baseURL || 'https://api.openai.com/v1';
    this.organization = options.organization;
    this.project = options.project;
    this.timeout = options.timeout || 60000;
    this.maxRetries = options.maxRetries || 3;
    this.defaultHeaders = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': 'OpenAI-Commander-CLI/1.0',
      ...(this.organization && { 'OpenAI-Organization': this.organization }),
      ...(this.project && { 'OpenAI-Project': this.project }),
      ...options.defaultHeaders
    };
  }

  async _request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      method: options.method || 'POST',
      headers: { ...this.defaultHeaders, ...options.headers },
      ...options
    };

    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    let lastError;
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        
        const response = await fetch(url, {
          ...config,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new OpenAIError(
            errorData.error?.message || `HTTP ${response.status}`,
            response.status,
            errorData.error?.type,
            errorData.error?.code
          );
        }

        if (options.stream) {
          return response.body;
        }

        return await response.json();
      } catch (error) {
        lastError = error;
        
        if (attempt === this.maxRetries || !this._shouldRetry(error)) {
          break;
        }
        
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }

  _shouldRetry(error) {
    return error.status >= 500 || error.name === 'AbortError' || !error.status;
  }

  async createChatCompletion(params) {
    const endpoint = '/chat/completions';
    
    if (params.stream) {
      return this._handleStream(endpoint, params);
    }
    
    return await this._request(endpoint, {
      body: params
    });
  }

  async *_handleStream(endpoint, params) {
    const response = await this._request(endpoint, {
      body: { ...params, stream: true },
      stream: true
    });

    const reader = response.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const data = trimmed.slice(6);
            if (data === '[DONE]') return;
            
            try {
              const parsed = JSON.parse(data);
              yield parsed;
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  async createEmbedding(params) {
    return await this._request('/embeddings', { body: params });
  }

  async createImage(params) {
    return await this._request('/images/generations', { body: params });
  }

  async createSpeech(params) {
    const response = await fetch(`${this.baseURL}/audio/speech`, {
      method: 'POST',
      headers: this.defaultHeaders,
      body: JSON.stringify(params)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response;
  }

  async createTranscription(params) {
    const formData = new FormData();
    formData.append('file', params.file);
    formData.append('model', params.model);
    
    if (params.language) formData.append('language', params.language);
    if (params.prompt) formData.append('prompt', params.prompt);
    if (params.response_format) formData.append('response_format', params.response_format);

    return await this._request('/audio/transcriptions', {
      body: formData,
      headers: { 'Authorization': `Bearer ${this.apiKey}` }
    });
  }

  async listModels() {
    return await this._request('/models', { method: 'GET' });
  }

  async uploadFile(params) {
    const formData = new FormData();
    formData.append('file', params.file);
    formData.append('purpose', params.purpose);

    return await this._request('/files', {
      body: formData,
      headers: { 'Authorization': `Bearer ${this.apiKey}` }
    });
  }

  async createFineTuningJob(params) {
    return await this._request('/fine_tuning/jobs', { body: params });
  }

  async createModeration(params) {
    return await this._request('/moderations', { body: params });
  }
}

class OpenAIError extends Error {
  constructor(message, status, type, code) {
    super(message);
    this.name = 'OpenAIError';
    this.status = status;
    this.type = type;
    this.code = code;
  }
}

// CLI Configuration and Utilities
class CLIConfig {
  constructor() {
    this.configPath = path.join(process.env.HOME || process.env.USERPROFILE || '.', '.openai-cli.json');
  }

  async load() {
    try {
      const data = await fs.readFile(this.configPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return {};
    }
  }

  async save(config) {
    await fs.writeFile(this.configPath, JSON.stringify(config, null, 2));
  }

  async getApiKey() {
    const config = await this.load();
    return process.env.OPENAI_API_KEY || config.apiKey;
  }

  async setApiKey(apiKey) {
    const config = await this.load();
    config.apiKey = apiKey;
    await this.save(config);
  }
}

// Utility functions
function formatResponse(response, format = 'json') {
  switch (format) {
    case 'text':
      if (response.choices && response.choices[0] && response.choices[0].message) {
        return response.choices[0].message.content;
      }
      return JSON.stringify(response, null, 2);
    case 'json':
      return JSON.stringify(response, null, 2);
    case 'compact':
      return JSON.stringify(response);
    default:
      return JSON.stringify(response, null, 2);
  }
}

function parseMessages(input) {
  try {
    return JSON.parse(input);
  } catch {
    // If not JSON, treat as simple user message
    return [{ role: 'user', content: input }];
  }
}

async function readFromStdin() {
  let input = '';
  process.stdin.setEncoding('utf8');
  
  for await (const chunk of process.stdin) {
    input += chunk;
  }
  
  return input.trim();
}

function createSpinner(text) {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let i = 0;
  
  const interval = setInterval(() => {
    process.stdout.write(`\r${frames[i]} ${text}`);
    i = (i + 1) % frames.length;
  }, 80);
  
  return {
    stop: () => {
      clearInterval(interval);
      process.stdout.write('\r');
    }
  };
}

// Main CLI Application
const program = new Command();
const config = new CLIConfig();

program
  .name('openai-cli')
  .description('OpenAI GPT-5 Command Line Interface')
  .version('1.0.0');

// Configuration commands
program
  .command('config')
  .description('Configure CLI settings')
  .option('--set-key <key>', 'Set OpenAI API key')
  .option('--show', 'Show current configuration')
  .action(async (options) => {
    try {
      if (options.setKey) {
        await config.setApiKey(options.setKey);
        console.log('✅ API key saved successfully');
      } else if (options.show) {
        const cfg = await config.load();
        console.log('Current configuration:');
        console.log(JSON.stringify({ ...cfg, apiKey: cfg.apiKey ? '***' : undefined }, null, 2));
      } else {
        console.log('Use --set-key to set API key or --show to display config');
      }
    } catch (error) {
      console.error('❌ Configuration error:', error.message);
      process.exit(1);
    }
  });

// Chat completion command
program
  .command('chat')
  .description('Create chat completions with GPT-5')
  .option('-m, --model <model>', 'Model to use', 'gpt-5')
  .option('-t, --temperature <temp>', 'Temperature (0-2)', parseFloat, 0.7)
  .option('--max-tokens <tokens>', 'Maximum tokens', parseInt, 2000)
  .option('-s, --stream', 'Stream response')
  .option('--system <message>', 'System message')
  .option('--reasoning <effort>', 'Reasoning effort (minimal, low, medium, high)', 'medium')
  .option('--verbosity <level>', 'Response verbosity (low, medium, high)', 'medium')
  .option('-f, --format <format>', 'Output format (json, text, compact)', 'text')
  .option('--save <file>', 'Save response to file')
  .argument('[message]', 'Message to send (or pipe from stdin)')
  .action(async (message, options) => {
    try {
      const apiKey = await config.getApiKey();
      if (!apiKey) {
        console.error('❌ No API key found. Use "openai-cli config --set-key YOUR_KEY" or set OPENAI_API_KEY environment variable');
        process.exit(1);
      }

      const client = new OpenAIClient(apiKey);
      
      // Get message from argument, stdin, or interactive prompt
      let userMessage = message;
      if (!userMessage && process.stdin.isTTY) {
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });
        userMessage = await new Promise(resolve => {
          rl.question('Enter your message: ', resolve);
        });
        rl.close();
      } else if (!userMessage) {
        userMessage = await readFromStdin();
      }

      if (!userMessage) {
        console.error('❌ No message provided');
        process.exit(1);
      }

      // Build messages array
      const messages = [];
      if (options.system) {
        messages.push({ role: 'system', content: options.system });
      }
      messages.push({ role: 'user', content: userMessage });

      const params = {
        model: options.model,
        messages,
        temperature: options.temperature,
        max_tokens: options.maxTokens,
        reasoning_effort: options.reasoning,
        verbosity: options.verbosity,
        stream: options.stream
      };

      if (options.stream) {
        console.log('🤖 GPT-5 is thinking...\n');
        let fullResponse = '';
        
        const stream = await client.createChatCompletion(params);
        for await (const chunk of stream) {
          const content = chunk.choices?.[0]?.delta?.content;
          if (content) {
            process.stdout.write(content);
            fullResponse += content;
          }
        }
        console.log('\n');
        
        if (options.save) {
          await fs.writeFile(options.save, fullResponse);
          console.log(`💾 Response saved to ${options.save}`);
        }
      } else {
        const spinner = createSpinner('GPT-5 is thinking...');
        
        try {
          const response = await client.createChatCompletion(params);
          spinner.stop();
          
          const output = formatResponse(response, options.format);
          console.log(output);
          
          if (options.save) {
            await fs.writeFile(options.save, output);
            console.log(`💾 Response saved to ${options.save}`);
          }
        } finally {
          spinner.stop();
        }
      }
    } catch (error) {
      console.error('❌ Error:', error.message);
      if (error.status) {
        console.error(`Status: ${error.status}`);
      }
      process.exit(1);
    }
  });

// Interactive chat mode
program
  .command('interactive')
  .alias('i')
  .description('Start interactive chat session with GPT-5')
  .option('-m, --model <model>', 'Model to use', 'gpt-5')
  .option('-t, --temperature <temp>', 'Temperature (0-2)', parseFloat, 0.7)
  .option('--system <message>', 'System message')
  .option('--reasoning <effort>', 'Reasoning effort (minimal, low, medium, high)', 'medium')
  .action(async (options) => {
    try {
      const apiKey = await config.getApiKey();
      if (!apiKey) {
        console.error('❌ No API key found. Configure with: openai-cli config --set-key YOUR_KEY');
        process.exit(1);
      }

      const client = new OpenAIClient(apiKey);
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const messages = [];
      if (options.system) {
        messages.push({ role: 'system', content: options.system });
      }

      console.log('🤖 GPT-5 Interactive Chat (type "exit" to quit, "clear" to reset conversation)');
      console.log('Model:', options.model);
      console.log('Temperature:', options.temperature);
      console.log('Reasoning Effort:', options.reasoning);
      console.log('─'.repeat(50));

      const chat = async () => {
        rl.question('\n👤 You: ', async (input) => {
          if (input.toLowerCase() === 'exit') {
            rl.close();
            return;
          }
          
          if (input.toLowerCase() === 'clear') {
            messages.splice(options.system ? 1 : 0);
            console.log('🧹 Conversation cleared');
            chat();
            return;
          }

          messages.push({ role: 'user', content: input });

          try {
            const response = await client.createChatCompletion({
              model: options.model,
              messages,
              temperature: options.temperature,
              reasoning_effort: options.reasoning,
              stream: true
            });

            process.stdout.write('\n🤖 GPT-5: ');
            let assistantMessage = '';
            
            for await (const chunk of response) {
              const content = chunk.choices?.[0]?.delta?.content;
              if (content) {
                process.stdout.write(content);
                assistantMessage += content;
              }
            }
            
            messages.push({ role: 'assistant', content: assistantMessage });
            chat();
          } catch (error) {
            console.error('\n❌ Error:', error.message);
            chat();
          }
        });
      };

      chat();
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  });

// Image generation
program
  .command('image')
  .description('Generate images with DALL-E')
  .argument('<prompt>', 'Image description prompt')
  .option('-m, --model <model>', 'Model to use', 'dall-e-3')
  .option('-n, --number <n>', 'Number of images', parseInt, 1)
  .option('-s, --size <size>', 'Image size', '1024x1024')
  .option('-q, --quality <quality>', 'Image quality (standard, hd)', 'standard')
  .option('--save <directory>', 'Save images to directory')
  .action(async (prompt, options) => {
    try {
      const apiKey = await config.getApiKey();
      if (!apiKey) {
        console.error('❌ No API key found');
        process.exit(1);
      }

      const client = new OpenAIClient(apiKey);
      const spinner = createSpinner('Generating image...');

      try {
        const response = await client.createImage({
          model: options.model,
          prompt,
          n: options.number,
          size: options.size,
          quality: options.quality
        });

        spinner.stop();
        
        console.log(`✅ Generated ${response.data.length} image(s)`);
        
        for (let i = 0; i < response.data.length; i++) {
          const image = response.data[i];
          console.log(`Image ${i + 1}: ${image.url}`);
          
          if (options.save) {
            // Download and save image
            const imageResponse = await fetch(image.url);
            const buffer = await imageResponse.arrayBuffer();
            const filename = `image_${Date.now()}_${i + 1}.png`;
            const filepath = path.join(options.save, filename);
            
            await fs.mkdir(options.save, { recursive: true });
            await fs.writeFile(filepath, Buffer.from(buffer));
            console.log(`💾 Saved to: ${filepath}`);
          }
        }
      } finally {
        spinner.stop();
      }
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  });

// Text-to-speech
program
  .command('speak')
  .description('Convert text to speech')
  .argument('<text>', 'Text to convert to speech')
  .option('-m, --model <model>', 'TTS model', 'tts-1')
  .option('-v, --voice <voice>', 'Voice to use', 'alloy')
  .option('-f, --format <format>', 'Audio format', 'mp3')
  .option('-o, --output <file>', 'Output file', 'speech.mp3')
  .action(async (text, options) => {
    try {
      const apiKey = await config.getApiKey();
      if (!apiKey) {
        console.error('❌ No API key found');
        process.exit(1);
      }

      const client = new OpenAIClient(apiKey);
      const spinner = createSpinner('Generating speech...');

      try {
        const response = await client.createSpeech({
          model: options.model,
          input: text,
          voice: options.voice,
          response_format: options.format
        });

        const buffer = Buffer.from(await response.arrayBuffer());
        await fs.writeFile(options.output, buffer);
        
        spinner.stop();
        console.log(`✅ Speech generated and saved to: ${options.output}`);
      } finally {
        spinner.stop();
      }
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  });

// List models
program
  .command('models')
  .description('List available models')
  .option('-f, --format <format>', 'Output format (json, table)', 'table')
  .action(async (options) => {
    try {
      const apiKey = await config.getApiKey();
      if (!apiKey) {
        console.error('❌ No API key found');
        process.exit(1);
      }

      const client = new OpenAIClient(apiKey);
      const response = await client.listModels();
      
      if (options.format === 'json') {
        console.log(JSON.stringify(response, null, 2));
      } else {
        console.log('\n📋 Available Models:\n');
        response.data
          .sort((a, b) => a.id.localeCompare(b.id))
          .forEach(model => {
            console.log(`• ${model.id} (${model.owned_by})`);
          });
      }
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  });

// Embeddings
program
  .command('embed')
  .description('Create text embeddings')
  .argument('<text>', 'Text to embed')
  .option('-m, --model <model>', 'Embedding model', 'text-embedding-3-large')
  .option('-d, --dimensions <dims>', 'Number of dimensions', parseInt)
  .option('-f, --format <format>', 'Output format (json, csv)', 'json')
  .option('-o, --output <file>', 'Output file')
  .action(async (text, options) => {
    try {
      const apiKey = await config.getApiKey();
      if (!apiKey) {
        console.error('❌ No API key found');
        process.exit(1);
      }

      const client = new OpenAIClient(apiKey);
      const params = {
        model: options.model,
        input: text
      };
      
      if (options.dimensions) {
        params.dimensions = options.dimensions;
      }

      const response = await client.createEmbedding(params);
      const embedding = response.data[0].embedding;
      
      let output;
      if (options.format === 'csv') {
        output = embedding.join(',');
      } else {
        output = JSON.stringify(response, null, 2);
      }

      if (options.output) {
        await fs.writeFile(options.output, output);
        console.log(`✅ Embeddings saved to: ${options.output}`);
      } else {
        console.log(output);
      }
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  });

// Moderation
program
  .command('moderate')
  .description('Check content for policy violations')
  .argument('<text>', 'Text to moderate')
  .option('-m, --model <model>', 'Moderation model', 'text-moderation-latest')
  .action(async (text, options) => {
    try {
      const apiKey = await config.getApiKey();
      if (!apiKey) {
        console.error('❌ No API key found');
        process.exit(1);
      }

      const client = new OpenAIClient(apiKey);
      const response = await client.createModeration({
        input: text,
        model: options.model
      });

      const result = response.results[0];
      console.log('🛡️ Moderation Results:');
      console.log(`Flagged: ${result.flagged ? '❌ Yes' : '✅ No'}`);
      
      if (result.flagged) {
        console.log('\nCategories:');
        Object.entries(result.categories).forEach(([category, flagged]) => {
          if (flagged) {
            const score = result.category_scores[category];
            console.log(`• ${category}: ${(score * 100).toFixed(2)}%`);
          }
        });
      }
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  });

// Batch processing
program
  .command('batch')
  .description('Process messages from file in batch')
  .argument('<file>', 'Input file (JSON array of messages)')
  .option('-m, --model <model>', 'Model to use', 'gpt-5')
  .option('-o, --output <file>', 'Output file', 'batch_results.json')
  .option('--concurrent <n>', 'Number of concurrent requests', parseInt, 5)
  .action(async (file, options) => {
    try {
      const apiKey = await config.getApiKey();
      if (!apiKey) {
        console.error('❌ No API key found');
        process.exit(1);
      }

      const client = new OpenAIClient(apiKey);
      const data = JSON.parse(await fs.readFile(file, 'utf8'));
      
      if (!Array.isArray(data)) {
        console.error('❌ Input file must contain a JSON array');
        process.exit(1);
      }

      console.log(`📦 Processing ${data.length} messages...`);
      
      const results = [];
      const semaphore = new Array(options.concurrent).fill(null);
      
      const processMessage = async (message, index) => {
        try {
          const response = await client.createChatCompletion({
            model: options.model,
            messages: Array.isArray(message) ? message : [{ role: 'user', content: message }]
          });
          
          results[index] = {
            input: message,
            output: response.choices[0].message.content,
            success: true
          };
        } catch (error) {
          results[index] = {
            input: message,
            error: error.message,
            success: false
          };
        }
        
        process.stdout.write(`\rProcessed: ${results.filter(r => r).length}/${data.length}`);
      };

      // Process with concurrency limit
      await Promise.all(
        data.map((message, index) => 
          new Promise(async resolve => {
            await processMessage(message, index);
            resolve();
          })
        )
      );
      
      await fs.writeFile(options.output, JSON.stringify(results, null, 2));
      console.log(`\n✅ Batch processing complete. Results saved to: ${options.output}`);
      
      const successful = results.filter(r => r.success).length;
      console.log(`Success rate: ${successful}/${data.length} (${(successful/data.length*100).toFixed(1)}%)`);
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  });

// Error handling
program.configureOutput({
  writeErr: (str) => process.stdout.write(`❌ ${str}`)
});

// Handle unhandled errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error.message);
  process.exit(1);
});

// Parse command line arguments
program.parse();

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.help();
}
