const reporter = require('multiple-cucumber-html-reporter');
const path = require('path');

reporter.generate({
  jsonDir: path.join(__dirname, '..', 'reports'),
  reportPath: path.join(__dirname, '..', 'reports', 'html_report'),
  metadata: {
    browser: {
      name: process.env.BROWSER || 'chromium',
      version: ''
    },
    device: 'Local test machine',
    platform: {
      name: process.platform,
    }
  }
});
