/* eslint-disable max-lines-per-function */
/* eslint strict: ["error", "never"] */

const fs = require('fs');

module.exports = () => {
  const pagesFolder = '.';
  const foldersToExclude = [
    './.git',
    './.github',
    './node_modules'
  ];

  const walkSync = dir => {
    let results = [];
    // eslint-disable-next-line no-sync
    const list = fs.readdirSync(dir);
    list.forEach(item => {
      const file = `${dir}/${item}`;
      if (foldersToExclude.includes(file)) {
        return;
      }
      // eslint-disable-next-line no-sync
      const stat = fs.statSync(file);
      if (stat && stat.isDirectory()) {
        /* Recurse into a subdirectory */
        results = results.concat(walkSync(file));
      } else {
        /* Is a file */
        const fileType = file.split('.').pop();
        if (fileType === 'json') {
          results.push(file);
        }
      }
    });
    return results;
  };

  // Start recursion to fill `pagePaths`
  return walkSync(pagesFolder);
};
