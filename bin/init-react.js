const exec = require('./exec'),
   fs = require('fs-extra-promise'),
   path = require('path');

/**
 * Initializes a fresh widgets project.
 * @param {object} opt Options object
 * @returns {Promise}
 */
const init = function(opt) {
   if (!opt.argv[1]) {
      return Promise.reject(new Error('Missing <project_name> argument'));
   }

   const projectName = opt.argv[1];

   if (fs.existsSync(projectName) && !opt.options.force) {
      return Promise.reject(new Error(`Directory ${projectName} exists. You can use --force to force creating it.`));
   }

   // map of what needs to be copied where
   const files = {
      'app.scss': 'src/scss',
      'index.html': 'src/',
      'index.js': 'src/',
      'en_GB.json': 'src/i18n/',
      'sv_SE.json': 'src/i18n/',
      'EventWidget.jsx': 'src/js/Components/',
      'BetOffers.jsx': 'src/js/Components/',
      'Participants.jsx': 'src/js/Components/',
      'mockSetupData.json': 'src/',
      'package.json': '',
      'README.md': ''
   };

   // variables to replace across all files
   const vars = {
      projectName: projectName,
      projectVersion: opt.options.version || '1.0.0',
      projectDescription: opt.options.description || `Description of ${projectName}`
   };

   const fileKeys = Object.keys(files);

   // create outer directory
   return fs.mkdirpAsync(projectName)

      // read all templates
      .then(() => Promise.all(fileKeys.map(name => fs.readFileAsync(path.join(__dirname, '../react_template', name), 'utf8'))))

      // inject variables
      .then(fileContents => fileContents.map((fileContent) => {
         return Object.keys(vars)
            .reduce(
               (fileContent, varName) => fileContent.replace(new RegExp(`\\$\\{${varName}\\}`, 'g'), vars[varName]),
               fileContent
            );
      }))

      // create inner directories and write files
      .then((fileContents) => {
         return Promise.all(
            fileContents.map((fileContent, i) => {
               const fileName = fileKeys[i],
                  filePath = files[fileName];

               return fs.mkdirpAsync(path.join(projectName, filePath))
                  .then(() => fs.writeFileAsync(path.join(projectName, filePath, fileName), fileContent));
            })
         );
      })

      // set the build-tools and core-library versions to the newest versions in package.json
      .then(() => {
         const p1 = exec('npm', [ 'show', 'kambi-widget-build-tools', 'version' ]);
         const p2 = exec('npm', [ 'show', 'kambi-widget-core-library', 'version' ]);
         const p3 = exec('npm', [ 'show', 'kambi-widget-components', 'version' ]);
         const p4 = fs.readFileAsync(path.join(projectName, 'package.json'));
         return Promise.all([p1, p2, p3, p4]).then((data) => {
            // removing \n at the end of the versions
            const buildToolsVersion = data[0].replace('\n', '');
            const coreLibraryVersion = data[1].replace('\n', '');
            const componentsVersion = data[2].replace('\n', '');
            const packageJson = JSON.parse(data[3]);
            packageJson.devDependencies['kambi-widget-build-tools'] = '^' + buildToolsVersion;
            packageJson.dependencies['kambi-widget-core-library'] = '^' + coreLibraryVersion;
            packageJson.dependencies['kambi-widget-components'] = '^' + componentsVersion;
            return fs.writeFileAsync(path.join(projectName, 'package.json'), JSON.stringify(packageJson, null, 3));
         })
      })

      // run npm install
      .then(() => {
         if (opt.options['without-npm-install']) {
            return Promise.resolve();
         }

         return exec('npm', [ 'install' ], { cwd: path.join(process.cwd(), projectName) });
      });
};

init.config = {
   name: 'init-react',
   usage: 'init-react <project_name>',
   description: 'Creates new widget project',
   options: [
      ['d', 'description=ARG', 'Project description'],
      ['f', 'force', 'Force project creation'],
      ['i', 'without-npm-install', 'Does not run npm install'],
      ['v', 'version=ARG', 'Project version']
   ]
};

module.exports = [
   init
];
