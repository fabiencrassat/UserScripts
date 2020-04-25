/* eslint strict: ["error", "never"] */

const getJsonFiles = require('./lib/getJsonFiles');
const { execSync } = require('child_process');

// eslint-disable-next-line max-statements
const execJsonLint = function execJsonLint(jsonFiles) {
  let throwError = false;
  for (const file of jsonFiles) {
    try {
      console.info(`Lint the file ${file}`);
      // eslint-disable-next-line max-len
      execSync(`.\\node_modules\\.bin\\jsonlint ${file} --in-place`);
    } catch (error) {
      throwError = true;
    }
  }
  if (throwError) {
    const exitWithError = 1;
    // eslint-disable-next-line no-process-exit
    process.exit(exitWithError);
  }
};

execJsonLint(getJsonFiles());
