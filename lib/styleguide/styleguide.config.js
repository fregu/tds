const path = require('path')
const fs = require('fs')
const root = process.cwd()

module.exports = {
  styleguideDir: path.join(root, 'dist', 'styleguide'),
  logger: {
    warn: console.warn,
    info: console.log,
    debug: console.log
  },
  serverHost: '127.0.0.1',
  skipComponentsWithoutExample: true,
  styles: {
    Playground: {
      preview: {
        paddingLeft: 0,
        paddingRight: 0,
        borderWidth: [[0, 0, 1, 0]],
        borderRadius: 0
      }
    },
    Markdown: {
      pre: {
        border: 0,
        background: 'none',
        fontSize: 14
      },
      code: {
        fontSize: 14
      }
    }
  },
  sections: [
    // {
    //   name: "docs",
    //   slug: "docs",
    //   components: root + "/docs/**/*.md"
    // },
    {
      name: 'base',
      slug: 'patterns',
      description: 'Mönster och regler för ramverket',
      components: root + '/src/base/*.css'
    },
    {
      name: 'components',
      slug: 'components',
      components: root + '/src/components/**/index.js',
      usageMode: 'expand'
    },
    {
      name: 'containers',
      slug: 'containers',
      components: root + '/src/containers/**/index.js',
      usageMode: 'expand'
    },
    {
      name: 'helpers',
      slug: 'helpers',
      components: root + '/src/helpers/*.js',
      usageMode: 'expand'
    }
  ],
  webpackConfig: require('../webpack/styleguide_dev.js'),
  styleguideComponents: {
    Wrapper: path.join(__dirname, 'Wrapper')
  },
  require: [path.resolve(__dirname, 'setup.js')],
  updateExample(props, exampleFilePath) {
    // props.settings are passed by any fenced code block, in this case
    const { settings, lang } = props
    // "../mySourceCode.js"
    if (typeof settings.file === 'string') {
      // "absolute path to mySourceCode.js"
      const filepath = path.resolve(exampleFilePath, settings.file)
      // displays the block as static code
      settings.static = true
      // no longer needed
      delete settings.file
      return {
        content: fs.readFileSync(filepath, 'utf8'),
        settings,
        lang
      }
    }
    if (typeof settings.cssvar === 'string') {
      // "absolute path to mySourceCode.js"
      const filepath = path.resolve(exampleFilePath, settings.cssvar)
      // displays the block as static code
      settings.static = true
      // no longer needed
      delete settings.file
      const customProperties = fs
        .readFileSync(filepath, 'utf8')
        .match(/(--\S*: .*;)\n*/g)

      return {
        content: customProperties.join(''),
        settings,
        lang
      }
    }
    if (typeof settings.cssimport === 'string') {
      // "absolute path to mySourceCode.js"
      const filepath = path.resolve(exampleFilePath, settings.cssimport)
      // displays the block as static code
      settings.static = true
      // no longer needed
      delete settings.file
      const imports = fs
        .readFileSync(filepath, 'utf8')
        .match(/(@import.*;)\n*/g)

      return {
        content: imports.join(''),
        settings,
        lang
      }
    }
    return props
  }
}
