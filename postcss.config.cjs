const postcssPresetEnv = require("postcss-preset-env")
const postcssGlobalData = require("@csstools/postcss-global-data")
const postcssCustomMedia = require("postcss-custom-media")
const postcssJitProps = require("postcss-jit-props")
const path = require("path")

const config = () => ({
  plugins: [
    postcssPresetEnv({
      stage: 0
    }),
    postcssGlobalData({
      files: [path.resolve(__dirname, "node_modules/open-props/media.min.css")]
    }),
    postcssCustomMedia(),
    postcssJitProps({
      files: [
        path.resolve(__dirname, "node_modules/open-props/open-props.min.css")
      ]
    })
  ]
})

module.exports = config
