const exec = require('./exec'),
  fs = require('fs-extra-promise'),
  opn = require('opn'),
  path = require('path')

/**
 * Extracts repository URL from package.json.
 * @returns {Promise.<string>}
 */
const repositoryURL = () => {
  return fs
    .readJsonAsync(path.join(process.cwd(), 'package.json'))
    .then(packageJson => {
      if (!packageJson.hasOwnProperty('repository')) {
        throw new Error("Missing 'repository' field in package.json")
      }

      if (packageJson.repository.isPrototypeOf(String)) {
        return packageJson.repository
      }

      if (!packageJson.repository.hasOwnProperty('url')) {
        throw new Error("Missing 'repository.url' field in package.json")
      }

      return packageJson.repository.url
    })
}

/**
 * NPM's preversion hook
 * @returns {Promise}
 */
const preversion = () => {
  return exec('git', ['reset', 'HEAD'])
}

preversion.config = {
  name: 'preversion',
  description: "Runs NPM's preversion hook",
}

/**
 * NPM's postversion hook
 * @param {object} opt Options object
 * @returns {Promise}
 */
const postversion = opt => {
  return Promise.all([
    exec('git', ['push', '--follow-tags']),
    fs.readJsonAsync(path.join(process.cwd(), 'package.json')),
    repositoryURL(),
  ]).then(results => {
    if (opt.options['without-changelog']) {
      return
    }

    const changelogURL = results[2]
      .replace(
        /^(git\+https?|git\+ssh):\/\/(.*@)?(.+?)(\.git\/?)?$/,
        'https://$3'
      )
      .concat(`/releases/tag/v${results[1].version}`)

    // GitHub needs some time to publish our commit
    console.log('Waiting for GitHub...')

    return new Promise(resolve => {
      setTimeout(() => {
        opn(changelogURL)
        resolve()
      }, 2000)
    })
  })
}

postversion.config = {
  name: 'postversion',
  description: "Runs NPM's postversion hook",
  usage: 'postversion',
  options: [['', 'without-changelog', "Doesn't open browser with changelog"]],
}

module.exports = [preversion, postversion]
