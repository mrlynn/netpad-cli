const fs = require('fs');
const path = require('path');
const os = require('os');

const CONFIG_FILE = path.join(os.homedir(), '.netpadrc');

class Config {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      if (fs.existsSync(CONFIG_FILE)) {
        const content = fs.readFileSync(CONFIG_FILE, 'utf8');
        return JSON.parse(content);
      }
    } catch (error) {
      console.warn('Warning: Could not load config file:', error.message);
    }
    return {};
  }

  save() {
    try {
      const content = JSON.stringify(this.data, null, 2);
      fs.writeFileSync(CONFIG_FILE, content, { mode: 0o600 }); // Secure permissions
      return true;
    } catch (error) {
      console.error('Error saving config:', error.message);
      return false;
    }
  }

  get(key) {
    return this.data[key];
  }

  set(key, value) {
    this.data[key] = value;
    return this.save();
  }

  getApiKey() {
    return this.data.apiKey;
  }

  setApiKey(apiKey) {
    return this.set('apiKey', apiKey);
  }

  getBaseUrl() {
    return this.data.baseUrl || 'https://netpad.io';
  }

  setBaseUrl(baseUrl) {
    return this.set('baseUrl', baseUrl);
  }

  clear() {
    this.data = {};
    return this.save();
  }

  isAuthenticated() {
    return !!this.getApiKey();
  }
}

module.exports = new Config(); 