# vue-cli-plugin-alphasquare-cordova-test

[Vue CLI 3.x](https://github.com/vuejs/vue-cli) plugin for Apache Cordova, AlphaSquare Private.
Based on [vue-cli-plugin-cordova](https://github.com/m0dch3n/vue-cli-plugin-cordova)

Integrate Cordova into Vue Cli App

## How To

Create Vue App

```sh
$ npm install -g @vue/cli
$ npm install -g cordova # If cordova is not already installed
```

**Add the plugin to your vue app.**

```sh
$ vue add alphasquare-cordova-test # Do not need 'yarn add vue-cli-plugin-alphasquare-cordova-test'
```

## Usage

Prepare

```sh
$ yarn cordova-prepare # prepare for build (you can run this command, when you checkouted your project from GIT, it's like npm install)
```

Android

```sh
$ yarn serve-android # Development Android
$ yarn build-android # Build Android
$ yarn build-only-www-android # Build only files to src-cordova
```

IOS

```sh
$ yarn serve-ios # Development IOS
$ yarn build-ios # Build IOS
$ yarn build-only-www-ios # Build only files to src-cordova
```

Web

```sh
$ yarn serve-web # Development Web
$ yarn build-web # Build Web
```

## IMPORTANT

- Path rewriting etc does not work under Cordova, that's why it's important to use router 'hash' mode, if you run or build for Cordova. **history mode does not** work! The plugin already tries to fix this automatically...

- Assets and Scripts in vue's public folder need to have a dynamic path, because depending on dev or production build, you have different bases. In dev it's normally **'/'** and in production it's **'file:///android_asset/www/'**. In other words, if you have i.e. an image under **'public/images/me.jpg'**, the relative url would be **img='images/me.jpg'**

- You need some experience with Cordova, to solve many issues, like having the right Java JDK, Android SDK, XTools, Signing an App, Publishing an App etc. If you encounter issues related to Cordova etc, please don't post them this issue tracker.

- If you are upgrading from an older release, please add `<hook type="after_prepare" src="../node_modules/vue-cli-plugin-alphasquare-cordova-test/serve-config-hook.js" />` to your config.xml

- The devserver will run under https from now on, so make sure your rest & api endpoints are available under https, and have a correct CORS setup

## What is the plugin doing ?

### During installation

During installation, the plugin is setting some important variables, modifying the router mode and executing some cordova commands.

- Setting **baseUrl** in vue.config.js to '' because in cordova production, files are served from **file://android_asset/www/**
- Setting cordovaPath in **vue.config.js**
- Checking if **router** is available and modify router mode to **'hash'** if process.env.PLATFORM is set
- Adding ignore paths for cordova in **.gitignore**
- Executing '**cordova create cordovaPath id appName**' (cordovaPath, id and appName will be **prompted**)
- Adding cordova before_prepare hook in **config.xml**
- Executing '**cordova platform add platform**' (platform will be prompted)

### In development mode

In development mode (`yarn serve-*`), the plugin is starting the dev server, and creating an app with a webview, showing your dev server page.

It is doing this by:

- Adding **cordova.js** to your **index.html**
- Defining **process.env.PLATFORM** to **android**, **ios**, **web**
- Starting the Dev Server
- Executing '**cordova clean**'
- Executing '**cordova run platform**'
- Pointing the cordova **config.xml** to Dev Server in hook

### In Production mode

In production mode (`yarn build-*`), the plugin is building the app, with all it's assets and files etc locally in the package. The webview is showing file:///android_asset/www/index.html

It is doing this by:

- Adding **cordova.js** to your **index.html**
- Defining **process.env.PLATFORM** to **android**, **ios**, **web**
- Building the app, output to **/src-cordova/www**
- Executing '**cordova clean**'
- Executing '**cordova build platform --release**'

## Please note

- For a production build, you need to **manually sign** the app, in order to be able to install it on your device, or publish it in the app store.
- You need to handle cordova's **"deviceready"** etc in your app
- **Cordova Plugins** can be added under /src-cordova by executing '**cordova plugin add PLUGIN**'
- If you want to **debug** your build app, using **chrome devtools**, build your app with '**cordova build platform --debug**' and make sure /src-cordova/www has your **latest build** by running **build-only-www-platform**

## License

MIT

## Credits

Credits go to

- @dekimasoon https://github.com/dekimasoon/vue-cli-plugin-cordova
- @quasarframework https://github.com/quasarframework/quasar-cli

Because my approach for this plugin, was inspired by theirs!
