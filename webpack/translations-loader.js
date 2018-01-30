// custom webpack loader to set the tranlation files into the global object (window) on /src/index.js

const fs = require('fs')
const path = require('path')
let kambiI18n = {}
const i18nFolderPath = path.resolve(process.cwd(), 'src', 'i18n')

module.exports = function(source) {
  this.cacheable(true)

  const translationFiles = fs.readdirSync(i18nFolderPath)
  translationFiles.forEach(fullFileName => {
    const [fileName, fileExtension] = fullFileName.split('.')
    if (fileExtension === 'json') {
      try {
        const fileContent = fs.readFileSync(
          path.resolve(i18nFolderPath, fullFileName),
          {
            encoding: 'utf8',
          }
        )
        kambiI18n[fileName] = JSON.parse(fileContent)
      } catch (e) {
        throw new Error(`Problems reading i18n file:${fileName}
        Error:
        ${e.message}`)
      }
    } else {
      console.warn(
        `Invalid extension for i18n file ${fileName}, needs to be JSON`
      )
    }
  })
  return source + 'window.kambiI18n=' + JSON.stringify(kambiI18n)
}
