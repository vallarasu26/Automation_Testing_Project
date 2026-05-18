module.exports = {
  default: `--require ./features/support/**/*.js --require ./features/step_definitions/**/*.js --format json:./reports/cucumber_report.json --publish-quiet`
};

