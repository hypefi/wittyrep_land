#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CronSetup {
  constructor() {
    this.scriptPath = path.resolve(__dirname, 'daily-automation.js');
    this.logPath = path.resolve(__dirname, '../logs/cron.log');
  }

  setupDailyCron() {
    try {
      console.log('🔄 Setting up daily cron job for blog automation...');
      
      // Create the cron command
      const cronCommand = `0 9 * * * cd "${path.dirname(this.scriptPath)}" && node daily-automation.js runScheduledTask >> "${this.logPath}" 2>&1`;
      
      // Check if cron job already exists
      const existingCron = this.checkExistingCron();
      if (existingCron) {
        console.log('⚠️ Cron job already exists. Removing old one...');
        this.removeExistingCron();
      }
      
      // Add new cron job
      this.addCronJob(cronCommand);
      
      console.log('✅ Daily cron job set up successfully!');
      console.log('📅 Blog posts will be generated daily at 9:00 AM');
      console.log(`📝 Logs will be written to: ${this.logPath}`);
      
      // Create log directory
      this.createLogDirectory();
      
      // Test the setup
      this.testCronSetup();
      
    } catch (error) {
      console.error('❌ Error setting up cron job:', error.message);
      this.showManualInstructions();
    }
  }

  checkExistingCron() {
    try {
      const output = execSync('crontab -l', { encoding: 'utf8' });
      return output.includes('daily-automation.js');
    } catch (error) {
      return false;
    }
  }

  removeExistingCron() {
    try {
      const output = execSync('crontab -l', { encoding: 'utf8' });
      const lines = output.split('\n').filter(line => 
        !line.includes('daily-automation.js') && line.trim() !== ''
      );
      
      if (lines.length > 0) {
        execSync(`echo "${lines.join('\n')}" | crontab -`);
      } else {
        execSync('crontab -r');
      }
    } catch (error) {
      console.log('No existing cron jobs found');
    }
  }

  addCronJob(cronCommand) {
    try {
      // Get current crontab
      let currentCron = '';
      try {
        currentCron = execSync('crontab -l', { encoding: 'utf8' });
      } catch (error) {
        // No existing crontab
      }
      
      // Add new command
      const newCron = currentCron + '\n' + cronCommand + '\n';
      
      // Install new crontab
      execSync(`echo "${newCron}" | crontab -`);
      
    } catch (error) {
      throw new Error(`Failed to add cron job: ${error.message}`);
    }
  }

  createLogDirectory() {
    try {
      const logDir = path.dirname(this.logPath);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      
      // Create initial log entry
      const initialLog = `[${new Date().toISOString()}] [INFO] Cron job setup completed\n`;
      fs.writeFileSync(this.logPath, initialLog);
      
    } catch (error) {
      console.warn('⚠️ Could not create log directory:', error.message);
    }
  }

  testCronSetup() {
    try {
      console.log('\n🧪 Testing cron setup...');
      
      // Verify cron job is installed
      const output = execSync('crontab -l', { encoding: 'utf8' });
      if (output.includes('daily-automation.js')) {
        console.log('✅ Cron job verified in crontab');
      } else {
        throw new Error('Cron job not found in crontab');
      }
      
      // Test script execution
      console.log('🔍 Testing script execution...');
      execSync(`node "${this.scriptPath}" --help`, { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      console.log('✅ Script execution test passed');
      
    } catch (error) {
      console.warn('⚠️ Cron setup test failed:', error.message);
    }
  }

  showManualInstructions() {
    console.log('\n📋 Manual Setup Instructions:');
    console.log('=============================');
    console.log('1. Open your crontab:');
    console.log('   crontab -e');
    console.log('');
    console.log('2. Add this line to run daily at 9:00 AM:');
    console.log(`   0 9 * * * cd "${path.dirname(this.scriptPath)}" && node daily-automation.js runScheduledTask >> "${this.logPath}" 2>&1`);
    console.log('');
    console.log('3. Save and exit (Ctrl+X in nano, :wq in vim)');
    console.log('');
    console.log('4. Verify the cron job:');
    console.log('   crontab -l');
    console.log('');
    console.log('5. Test the script manually:');
    console.log(`   node "${this.scriptPath}" generate 1`);
  }

  removeCron() {
    try {
      console.log('🗑️ Removing daily cron job...');
      this.removeExistingCron();
      console.log('✅ Cron job removed successfully');
    } catch (error) {
      console.error('❌ Error removing cron job:', error.message);
    }
  }

  showStatus() {
    try {
      console.log('📊 Cron Job Status:');
      console.log('===================');
      
      const output = execSync('crontab -l', { encoding: 'utf8' });
      const hasJob = output.includes('daily-automation.js');
      
      if (hasJob) {
        console.log('✅ Daily cron job is active');
        console.log('📅 Schedule: Daily at 9:00 AM');
        console.log(`📝 Log file: ${this.logPath}`);
        
        // Show recent logs
        if (fs.existsSync(this.logPath)) {
          const stats = fs.statSync(this.logPath);
          console.log(`📅 Last log update: ${stats.mtime.toLocaleString()}`);
        }
      } else {
        console.log('❌ No daily cron job found');
        console.log('💡 Run "node setup-cron.js" to set up automation');
      }
      
    } catch (error) {
      console.log('❌ No crontab found');
    }
  }

  // CLI interface
  runCLI() {
    const args = process.argv.slice(2);
    const command = args[0];
    
    switch (command) {
      case 'setup':
        this.setupDailyCron();
        break;
        
      case 'remove':
        this.removeCron();
        break;
        
      case 'status':
        this.showStatus();
        break;
        
      default:
        console.log(`
🔄 WittyReply Cron Setup

Usage:
  node setup-cron.js setup    - Set up daily cron job (9:00 AM)
  node setup-cron.js remove   - Remove daily cron job
  node setup-cron.js status   - Show cron job status

The cron job will automatically generate blog posts daily at 9:00 AM.

Examples:
  node setup-cron.js setup    - Set up automation
  node setup-cron.js status   - Check if automation is active
        `);
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const cronSetup = new CronSetup();
  cronSetup.runCLI();
}

export default CronSetup;
