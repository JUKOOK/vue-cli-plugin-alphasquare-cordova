// generator when 'vue add alphasqurae-cordova'
const fs = require('fs')
const hasbin = require('hasbin')
const defaults = require('./defaults')
const spawn = require('cross-spawn')
const { info } = require('@vue/cli-shared-utils')

module.exports = (api, options) => {
  // early return if cordova binary is not found
  const hasCordova = hasbin.sync('cordova')
  if (!hasCordova) {
    api.exitLog(`Unable to find cordova binary, make sure it's installed.`, 'error')
    return
  }

  // cordova options
  const cordovaPath = options.cordovaPath || defaults.cordovaPath
  const id = options.id || defaults.id
  const appName = options.appName || defaults.appName
  const platforms = options.platforms || defaults.platforms

  api.extendPackage({
    scripts: {
      'serve-android': 'cross-env PLATFORM=android vue-cli-service cordova-serve-android',
      'build-android': 'cross-env PLATFORM=android vue-cli-service cordova-build-android',
      'build-only-www-android': 'cross-env PLATFORM=android vue-cli-service cordova-build-only-www-android',
      'serve-ios': 'cross-env PLATFORM=ios vue-cli-service cordova-serve-ios',
      'build-ios': 'cross-env PLATFORM=ios vue-cli-service cordova-build-ios',
      'build-only-www-ios': 'cross-env PLATFORM=ios vue-cli-service cordova-build-only-www-ios',
      'cordova-prepare': 'vue-cli-service cordova-prepare'
    },
    vue: {
      pluginOptions: {
        cordovaPath
      }
    }
  })

  api.onCreateComplete(() => {
    // .gitignore - not included in files on postProcessFiles
    const ignorePath = '.gitignore'
    const ignoreCompletePath = api.resolve(ignorePath)
    const ignore = fs.existsSync(ignoreCompletePath)
      ? fs.readFileSync(ignoreCompletePath, 'utf-8')
      : ''
    var ignoreContent = '\n# Cordova\n'
    ignoreContent += `/${cordovaPath}\n`
    ignoreContent += '/public/cordova.js\n'

    fs.writeFileSync(ignoreCompletePath, ignore + ignoreContent)
    api.exitLog(`Updated ${ignorePath} : ${ignoreContent}`)

    // cordova create ...
    spawn.sync('cordova', [
      'create',
      cordovaPath,
      id,
      appName
    ], {
      env: process.env,
      stdio: 'inherit', // pipe to console
      encoding: 'utf-8'
    })
    api.exitLog(`Executed 'cordova create ${cordovaPath} ${id} ${appName}'`)

    const wwwIgnorePath = api.resolve(`${cordovaPath}/www/.gitignore`)
    api.exitLog(`Creating file: ${wwwIgnorePath}`)
    fs.writeFileSync(wwwIgnorePath, defaults.gitIgnoreContent)

    // cordova platforms add ...
    const srcCordovaPath = api.resolve(cordovaPath)
    platforms.forEach(platform => {
      info(`Adding platform ${platform}`)
      spawn.sync('cordova', [
        'platform',
        'add',
        platform
      ], {
        cwd: srcCordovaPath,
        env: process.env,
        stdio: 'inherit', // pipe to console
        encoding: 'utf-8'
      })
      api.exitLog(`Executed 'cordova platform add ${platform}' in folder ${srcCordovaPath}`)
    })

    // config.xml - add hook
    const configPath = `${cordovaPath}/config.xml`
    const configCompletePath = api.resolve(configPath)
    let cordovaConfig = fs.existsSync(configCompletePath)
      ? fs.readFileSync(configCompletePath, 'utf-8')
      : ''
    const lines = cordovaConfig.split(/\r?\n/g)
    const regexContent = /\s+<content/
    const contentIndex = lines.findIndex(line => line.match(regexContent))
    if (contentIndex >= 0) {
      lines.splice(contentIndex, 0,
        '    <!-- this hook will point your config.xml to the DevServer on Serve -->',
        '    <hook type="after_prepare" src="../node_modules/vue-cli-plugin-alphasquare-cordova-test/serve-config-hook.js" />'
      )
      cordovaConfig = lines.join('\n')
      fs.writeFileSync(configCompletePath, cordovaConfig)
      api.exitLog(`Updated ${configPath}`)
    }
  })
}
